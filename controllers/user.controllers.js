const { Staff, Account, Permission, Screen, Staff_permission, Contract, Payment_schedule, User, Benefit_history } = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");
const nodemailer = require("nodemailer");
const createUserWithTransaction = async (name, email, phone, address, idCard, username, password) => {
    //console.log('test1')
    const t = await db.sequelize.transaction(); // Bắt đầu transaction

    let isSuccess
    try {
        //console.log('test2')
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        //console.log('test3')
        const newAccount = await Account.create({
            username,

            password: hashPassword,

        }, { transaction: t });
        //console.log('test4')
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
        user.idCard = idCard
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
        //console.log(error)
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
        //console.log(permission)
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

        //console.log(staff)


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
        if (phone === undefined || password === undefined || name === undefined || address === undefined || email === undefined || username === undefined || isNaN(idCard)) {
            req.flash('error', 'Có lỗi xảy ra!');
            return res.redirect('/user/listUser');
        }
        //console.log(permission)

        const isAdd = await createUserWithTransaction(name, email, phone, address, idCard, username, password)
        if (!isAdd) {
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
            html: `Bạn đã được nhân viên đăng ký tài khoản thành công. Đây là tài khoản và mật khẩu của bạn: <br>Tài khoản: ${username}`+`<br>Mật khẩu: ${password}`, // html body
        });
        req.flash('error', 'Thêm mới khách hàng thành công, tài khoản và mật khẩu đã được gửi tới email người dùng!');

        return res.redirect(req.query.url);

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới nhân viên');
        return res.redirect('/user/listUser');
    }
};
module.exports = {

    getListUser, getDetailUser, editUser, deleteUser, activeUser, inActiveUser,
    changePassword, selfEdit, getFullDetailUser, addUser, getFormAddUser
};