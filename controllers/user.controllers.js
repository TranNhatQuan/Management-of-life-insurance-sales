const { Staff, Account, Permission, Screen, Staff_permission, Contract, Detail_contract, Payment_schedule, User, Benefit_history } = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");
const nodemailer = require("nodemailer");
const { getData } = require("../middlewares/getDataIntro/getData");
const { sendMail } = require("./contract.controllers");
const createUserWithTransaction = async (name, email, phone, address, idCard, username, password) => {

    const t = await db.sequelize.transaction(); // Bắt đầu transaction

    let isSuccess
    try {

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        const newAccount = await Account.create({
            username,

            password: hashPassword,

        }, { transaction: t });

        const newCustomer = await User.create({
            idAccount: newAccount.idAccount,
            name,
            mail: email,
            phone,
            address,
            idCard,
            isActive: 1

        }, { transaction: t });



        await t.commit(); // Lưu thay đổi và kết thúc transaction
        isSuccess = true

    } catch (error) {
        isSuccess = false
        await t.rollback(); // Hoàn tác các thay đổi và hủy bỏ transaction

    }

    return isSuccess
}
const getListUser = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let users = await User.findAll({

            raw: true,

        })
        const error = req.flash('error')[0];
        return res.render('user/listUser', { error: error, users: users, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách khách hàng!');
        return res.redirect('/account/admin/login');
    }
};
const getUserHome = async (req, res) => {
    try {


        const user = req.user
        const name = user.name

        const contracts = await Contract.findAll({
            where: {
                idUser: user.idUser,
                status: {
                    [db.Sequelize.Op.or]: [1, 2],
                }
            },
            order: [
                ['startDate', 'DESC'],
            ],
            include: [
                {
                    model: Payment_schedule,
                },
                {
                    model: Detail_contract,
                    include: [

                        {
                            model: Benefit_history,
                        },

                    ]
                }
            ]
        })

        contracts.forEach((contract) => {
            if (contract.status == 1) {
                contract.dataValues.status = 'Đang thu phí'
            }
            else {
                contract.dataValues.status = 'Ngừng thu phí'
            }
            let currentIndex = 0
            contract.dataValues.paymentStatus = 'Chưa tới hạn đóng phí'
            contract.Payment_schedules.forEach((payment) => {
                if (payment.status == 1) {
                    currentIndex += 1
                }


                if (payment.status == 3) {
                    contract.dataValues.paymentStatus = 'Đến hạn đóng phí'
                }
                if (payment.status >= 4) {
                    contract.dataValues.paymentStatus = 'Quá hạn'
                }
            })
            contract.dataValues.index = currentIndex


            contract.dataValues.maxIndex = Math.floor(contract.premiumPaymentTerm / contract.frequency) + 1
            contract.Detail_contracts.forEach((detail) => {

                if (detail.status == 1) {
                    detail.dataValues.status = 'Đang thu phí'
                }
                if (detail.status == 2) {
                    detail.dataValues.status = 'Ngừng thu phí'
                }
                if (detail.status == 3) {
                    detail.dataValues.status = 'Hết hợp đồng'
                }
                if (detail.status == 0) {
                    detail.dataValues.status = 'Đã huỷ'
                }
                if (detail.isMain == 1) {
                    detail.dataValues.isMain = 'sản phẩm chính'
                }
                else {
                    detail.dataValues.isMain = 'sản phẩm phụ'
                }

                let total = 0
                detail.Benefit_histories.forEach((benefit) => {
                    total += Number(benefit.total) * 1000
                })
                total = total.toLocaleString()
                detail.dataValues.premium = (detail.dataValues.premium * 1000).toLocaleString()
                detail.dataValues.total = total


            })


        })

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()

        return res.render('user/home', { error: error, name: name, contracts: contracts, listType, listPostType, listCatalog });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang hợp đồng hiện tại!');
        return res.redirect('/account/login');
    }
};
const selectBank = async (req, res) => {
    try {

        const idPayment_schedule = req.query.idPayment_schedule
        console.log(idPayment_schedule)
        const error = req.flash('error')[0];
        const payment = await Payment_schedule.findOne({
            where: {
                idPayment_schedule: idPayment_schedule,
                status: {
                    [db.Sequelize.Op.not]: [1, 0, 7],
                }
            }
        })
        console.log(1)
        if (!payment) {
            //const error = 'Không tìm thấy thông tin khách hàng!'
            req.flash('error', 'Không tìm thấY thông tin trả phí!');
            return res.status(500).json({ isSuccess: false })

        }
        else {


            console.log(2)
            payment.dataValues.total = (Number(payment.total) * 1000).toLocaleString()



            console.log(3)
            return res.render('payment/selectBank', { error: error, payment, url: req.query.url });

        }



    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        return res.status(500).json({ isSuccess: false })
    }
};
const payWithoutUser = async (req, res) => {
    try {

        const ID = req.query.CCCD
        const error = req.flash('error')[0];
        const user = await User.findOne({
            where: {
                idCard: ID
            }
        })

        if (!user) {
            //const error = 'Không tìm thấy thông tin khách hàng!'
            req.flash('error', 'Không tìm thấy thông tin khách hàng!');

            return res.redirect(req.query.url)
        }

        else {

            const payments = await Payment_schedule.findAll({
                where: {
                    idUser: user.idUser,

                },
                include: [
                    {
                        model: Contract,

                    }
                ]
            })

            payments.forEach((payment) => {
                payment.dataValues.total = (Number(payment.total) * 1000).toLocaleString()
                if (payment.Contract.status == 0) {
                    if (payment.status >= 2 && payment.status <= 6) {
                        payment.dataValues.status = 0
                    }

                }
            })

            const { listType, listPostType, listCatalog } = await getData()
            url = '/user/pay?CCCD=' + ID
            if (req.user) {
                const user = req.user
                const name = user.name
                return res.render('payment/infoPayment', { error: error, url, user, name, payments, listType, listPostType, listCatalog });
            }
            else {
                return res.render('payment/infoPayment', { error: error, url, user, payments, listType, listPostType, listCatalog });
            }
        }



    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');

        return res.redirect(req.query.url)
    }
};
const detail = async (req, res) => {
    try {


        const user = req.user
        const name = user.name




        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        return res.render('user/confirmPay', { error: error, name: name, user: user, listType, listPostType, listCatalog });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang thanh toán phí hợp đồng!');
        return res.redirect('/intro/home');
    }
};
const confirmPay = async (req, res) => {
    try {

        const { idPayment_schedule, bank, id } = req.body

        let payment = await Payment_schedule.findOne({
            where: {
                idPayment_schedule: idPayment_schedule
            }
        })
        let user = await User.findOne({
            include: [
                {
                    model: Payment_schedule,
                    where: {
                        idPayment_schedule: idPayment_schedule
                    },
                    required: true,
                }
            ]
        })
        let isSend = false
        if (!payment) {
            //const error = 'Không tìm thấy thông tin khách hàng!'

            return res.status(404).json({ error: 'Không tìm thấy thông tin trả phí!' });

        }
        else {
            const info = "Bank: " + bank + ". Số tài khoản: " + id + ""
            payment.status = 1;
            payment.info = info
            payment.date = new Date()
            isSend = true
            await payment.save();


            if (isSend == true) {
                const title = 'LIFE gửi hoá đơn điện tử số 3131231c cho ' + user.name + ''
                const content = 'Kính gửi quý khách,<br>Chúng tôi tin gửi hoá đơn đóng phí bảo hiểm tháng này cho bạn, bạn có thể xem chi tiết hoá đơn trong file đính kèm hoặc liên hệ chăm sóc khách hàng để biết thêm chi tiết.<br>Mọi thắc mắc xin vui lòng liên hệ với chúng tôi theo thông tin dưới đây:<br>Email:trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn.<br>Trân trọng,<br> LIFE'
                filePath = `public/uploads/payment.pdf`;

                const sendMailToUser = await sendMail(user.mail, content, title, filePath)
                const error = req.flash('error')[0];

                req.flash('error', 'Thanh toán thành công!');
                return res.redirect(req.query.url)
            }
            else {
                req.flash('error', 'Thanh toán thành công!');
                return res.redirect(req.query.url)
            }

        }







    } catch (error) {
        return res.status(500).json({ error: 'Có lỗi xảy ra khi thanh toán phí hợp đồng!' });
    }
};
const prePay = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        if (req.user) {
            const user = req.user
            const name = user.name
            return res.render('payment/prePay', { error: error, name: name, listType, listPostType, listCatalog });
        }
        else {
            return res.render('payment/prePay', { error: error, listType, listPostType, listCatalog });
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang thanh toán hợp đồng!');
        return res.redirect('/intro/home');
    }
};
const payWithUser = async (req, res) => {
    try {


        const user = req.user

        const name = user.name

        const payments = await Payment_schedule.findAll({
            where: {
                idUser: user.idUser,

            },
        })

        payments.forEach((payment) => {
            payment.dataValues.total = (Number(payment.total) * 1000).toLocaleString()
        })

        const error = req.flash('error')[0];
        url = '/user/payWithUser'

        const { listType, listPostType, listCatalog } = await getData()
        return res.render('payment/infoPayment', { error: error, user, url, name: name, payments, listType, listPostType, listCatalog });



    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        return res.redirect(req.query.url)
    }
};
const getAllContract = async (req, res) => {
    try {


        const user = req.user
        const name = user.name

        const contracts = await Contract.findAll({
            where: {
                idUser: user.idUser,

            },
            order: [
                ['startDate', 'DESC'],
            ],
            include: [
                {
                    model: Payment_schedule,

                },
                {
                    model: Detail_contract,
                    include: [

                        {
                            model: Benefit_history,
                        },

                    ]
                }
            ]
        })

        contracts.forEach((contract) => {

            if (contract.status == 1) {
                contract.dataValues.status = 'Đang thu phí'
            }
            if (contract.status == 0) {
                contract.dataValues.status = 'Đã huỷ'
            }

            if (contract.status == 2) {
                contract.dataValues.status = 'Còn hợp đồng, ngừng thu phí'
            }
            if (contract.status == 3) {
                contract.dataValues.status = 'Hết hợp đồng'
            }

            let currentIndex = 0
            contract.dataValues.paymentStatus = 'Chưa tới hạn đóng phí'
            contract.Payment_schedules.forEach((payment) => {
                if (payment.status == 1) {
                    currentIndex += 1
                }


                if (payment.status == 3) {
                    contract.dataValues.paymentStatus = 'Đến hạn đóng phí'
                }
                if (payment.status >= 4) {
                    contract.dataValues.paymentStatus = 'Quá hạn'
                }
            })
            contract.dataValues.index = currentIndex


            contract.dataValues.maxIndex = Math.floor(contract.premiumPaymentTerm / contract.frequency) + 1



            contract.Detail_contracts.forEach((detail) => {

                if (detail.status == 1) {
                    detail.dataValues.status = 'Đang thu phí'
                }
                if (detail.status == 2) {
                    detail.dataValues.status = 'Ngừng thu phí'
                }
                if (detail.status == 3) {
                    detail.dataValues.status = 'Hết hợp đồng'
                }
                if (detail.status == 0) {
                    detail.dataValues.status = 'Đã huỷ'
                }
                if (detail.isMain == 1) {
                    detail.dataValues.isMain = 'sản phẩm chính'
                }
                else {
                    detail.dataValues.isMain = 'sản phẩm phụ'
                }

                let total = 0
                detail.Benefit_histories.forEach((benefit) => {
                    total += benefit.total
                })
                detail.dataValues.total = total

            })


        })

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        return res.render('user/allContract', { error: error, name: name, contracts: contracts, listType, listPostType, listCatalog });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang danh sách hợp đồng!');
        return res.redirect('/intro/home');
    }
};
const getDetailUser = async (req, res) => {
    try {


        const { idUser } = req.params


        let user = await User.findOne({
            where: { idUser },


        })


        return res.render('user/detailUser', { user: user });

    } catch (error) {

        return res.status(500).json({ error: 'Có lỗi xảy ra khi lấy chi tiết thông tin khách hàng!' })
    }
};
const getFullDetailUser = async (req, res) => {
    try {
        const { idUser } = req.params


        let user = await User.findOne({
            where: { idUser },


        })
        let contracts = await Contract.findAll({
            where: {
                idUser: idUser,
                //status: 1
            },
            include: [
                {
                    model: Payment_schedule,

                    required: true,

                },
                {
                    model: Benefit_history,
                    required: true,
                }
            ],
            raw: true,
        })
        return res.render('staff/detailUser', { user: user });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy chi tiết thông tin khách hàng!');
        return res.status(500).json({ isSuccess: false })
    }
}


const editUser = async (req, res) => {
    try {


        const { idUser } = req.params
        const { name, email, phone, address, idCard } = req.body
        //console.log(permission)
        let user = await User.findOne({
            where: {
                idUser
            },
            //raw: true,

        })

        user.name = name
        user.mail = email
        user.phone = phone
        user.address = address
        if (user.idCard != idCard) {
            const existingUserByCard = await User.findOne({ where: { idCard: idCard } });
            if (existingUserByCard) {
                req.flash('error', 'CCCD/CMND không được trùng với các CCCD/CMND đã có!');
                return res.redirect('/user/listUser');
            }
            user.idCard = idCard
        }

        await user.save()

        req.flash('error', 'Đổi thông tin khách hàng thành công!');

        return res.redirect(req.query.url);

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi đổi thông tin khách hàng');
        return res.redirect('/user/listUser');
    }
};
const selfEdit = async (req, res) => {
    try {
        let staff = req.staff


        const { name, email, phone, address } = req.body
        //console.log(permission)

        staff.name = name
        staff.mail = email
        staff.phone = phone
        staff.address = address
        await staff.save()

        req.flash('error', 'Đổi thông tin cá nhân thành công!');

        return res.redirect('/staff/home');

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.redirect('/account/admin/login');
    }
};
const changePassword = async (req, res) => {
    try {


        let staff = req.staff
        const { oldPassword, newPassword } = req.body
        if (oldPassword.trim() == '' || newPassword == '') {
            req.flash('error', 'Mật khẩu không được để trống!');
            return res.redirect('/staff/home');
        }

        let account = await Account.findOne({
            where: {
                idAccount: staff.idAccount
            }
        })
        const isAuth = bcrypt.compareSync(oldPassword, account.password);
        if (isAuth) {

            const salt = bcrypt.genSaltSync(10);
            //mã hoá salt + password

            const hashPassword = bcrypt.hashSync(newPassword, salt);

            account.password = hashPassword;
            await account.save()
        }
        else {
            req.flash('error', 'Đổi mật khẩu thất bại, mật khẩu cũ sai!');
            return res.redirect('/staff/home');

        }
        req.flash('error', 'Đổi mật khẩu thành công!');
        return res.redirect('/staff/home');

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi đổi mật khẩu!');
        return res.redirect('/account/admin/login');
    }
};
const activeUser = async (req, res) => {
    try {

        const { idUser } = req.params

        let user = await User.findOne({
            where: { idUser },
            //raw: true,

        })

        user.isActive = 1

        await user.save()


        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi đổi trạng thái khách hàng');
        return res.status(500).json({ isSuccess: false })
    }
};
const inActiveUser = async (req, res) => {
    try {

        const { idUser } = req.params

        let user = await User.findOne({
            where: { idUser },
            // raw: true,

        })

        user.isActive = 0

        await user.save()

        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteUser = async (req, res) => {
    try {
        const { idUser } = req.params

        let user = await User.findOne({
            where: { idUser },
            // raw: true,

        })
        let account = await Account.findOne({
            where: { idAccount: user.idAccount }
        })


        await user.destroy()
        await account.destroy()
        req.flash('error', 'Xoá khách hàng thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi xoá khách hàng!');
        return res.status(500).json({ isSuccess: false })
    }
};
const getFormAddUser = async (req, res) => {
    try {




        return res.render('user/addUser');

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const addUser = async (req, res) => {
    try {



        const { name, email, phone, address, idCard, username, password } = req.body
        if (phone === '' || password === '' || name === '' || address === '' || email === '' || username === '' || idCard === '') {
            req.flash('error', 'Thông tin không được để trống!');
            return res.redirect('/user/listUser');
        }
        if (phone === undefined || password === undefined || name === undefined || address === undefined || email === undefined || username === undefined || idCard === undefined) {
            req.flash('error', 'Có lỗi xảy ra!');
            return res.redirect('/user/listUser');
        }


        const existingUserByCard = await User.findOne({ where: { idCard: idCard } });
        if (existingUserByCard) {
            req.flash('error', 'CCCD/CMND không được trùng với các CCCD/CMND đã có!');
            return res.redirect('/user/listUser');
        }
        const isAdd = await createUserWithTransaction(name, email, phone, address, idCard, username, password)
        if (isAdd == false) {
            req.flash('error', 'Tài khoản không được trùng với các tài khoản đã có!');
            return res.redirect('/user/listUser');
        }
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "trannhatquan.2001@gmail.com", // generated ethereal user
                pass: "bseuvtvsghpnrltz", // generated ethereal password
            },
        });
        // send mail with defined transport object
        await transporter.sendMail({
            from: "trannhatquan.2001@gmail.com", // sender address
            to: `${email}`, // list of receivers
            subject: "Đăng ký tài khoản thành công", // Subject line
            text: "Đăng ký tài khoản thành công", // plain text body
            html: `Bạn đã được nhân viên đăng ký tài khoản thành công. Đây là tài khoản và mật khẩu của bạn: <br>Tài khoản: ${username}` + `<br>Mật khẩu: ${password}`, // html body
        });
        req.flash('error', 'Thêm mới khách hàng thành công, tài khoản và mật khẩu đã được gửi tới email người dùng!');

        return res.redirect(req.query.url);

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới khách hàng');
        return res.redirect('/user/listUser');
    }
};
const logout = async (req, res, next) => {
    delete req.session.token;

    return res.redirect('/account/login'); // Chuyển hướng về trang đăng nhập
};
module.exports = {

    getListUser, getDetailUser, editUser, deleteUser, activeUser, inActiveUser,
    changePassword, selfEdit, getFullDetailUser, addUser, getFormAddUser,
    getUserHome, getAllContract, payWithUser, payWithoutUser, detail, logout,
    prePay, confirmPay, selectBank
};