const { Staff, Account, Permission, Screen, Staff_permission, Contract, Detail_contract, Payment_schedule, User } = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");
const nodemailer = require("nodemailer");
const createStaffWithTransaction = async (name, email, phone, address, permission, username, password) => {
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
        const newCustomer = await Staff.create({
            idAccount: newAccount.idAccount,
            name,
            mail: email,
            phone,
            address,
            isActive: 1

        }, { transaction: t });
        if (permission != null) {

            const isEdit = await splitPermission(permission, newCustomer.idStaff, 1)
        }


        await t.commit(); // Lưu thay đổi và kết thúc transaction
        isSuccess = true

    } catch (error) {
        isSuccess = false
        await t.rollback(); // Hoàn tác các thay đổi và hủy bỏ transaction

    }

    return isSuccess
}
const getListStaff = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let employees = await Staff.findAll({

            raw: true,

        })
        const error = req.flash('error')[0];
        return res.render('staff/listStaff', { error: error, employees: employees, selectedMenuItem: 'Quản lý nhân viên', name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.redirect('/account/admin/login');
    }
};
const getFormAddStaff = async (req, res) => {
    try {

        //console.log(staff)


        return res.render('staff/addStaff');

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const getDetailStaff = async (req, res) => {
    try {


        const { idStaff } = req.params


        let staffs = await Staff.findAll({
            where: { idStaff },
            raw: true,
            include: [
                {
                    model: Staff_permission,
                    include: [
                        {
                            model: Permission
                        },
                        {
                            model: Screen
                        }
                    ],

                }
            ]
        })
        // staff.dataValues.addContract = false

        let staff = staffs[0];

        staffs.forEach((emp) => {



            const concatenatedName = emp['Staff_permissions.Permission.name'] + emp['Staff_permissions.Screen.name'];

            staff[concatenatedName] = true;

        });
        //console.log(staff)


        return res.render('staff/detailStaff', { staff: staff });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const getInfoHome = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const staff = req.staff
        const name = staff.name
        console.log('test')
        let contracts = await Contract.findAll({
            where: {
                idStaff: staff.idStaff,
                status: 1
            },
            include: [
                {
                    model: Detail_contract,

                    required: true,
                    include: [
                        {
                            model: Payment_schedule,
                            where: {
                                status: 0
                            },
                            required: true
                        }
                    ]

                },
                {
                    model: User,
                    required: true,
                }
            ],
            raw: true,
        })
        console.log('trss')
        console.log(contracts)
        contracts = contracts.map(item => {

            return {
                idPayment_schedule: item['Detail_contracts.Payment_schedules.idPayment_schedule'],
                idContract: item['idContract'],
                idDetail_contract: item['Detail_contracts.idDetail_contract'],
                endDate: item['Detail_contracts.Payment_schedules.endDate'],
                total: item['Detail_contracts.Payment_schedules.total'],
                idUser: item['User.idUser'],
                name: item['User.name'],
                address: item['User.address'],
                phone: item['User.phone'],
                mail: item['User.mail'],

            }
        });


        return res.render('staff/home', { staff: staff, error: error, contracts: contracts, selectedMenuItem: 'Trang chủ', name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi vào trang chủ');
        return res.redirect('/account/admin/login');
    }
};
const splitPermission = async (permission, idStaff, type) => {
    let arr
    if (Array.isArray(permission)) {
        arr = permission
    } else {
        arr = [permission]
    }


    function splitElements(arr) {
        const result = [];

        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            const matches = element.split(/(?=[A-Z])/);
            result.push(matches);
        }

        return result;
    }



    const splittedArray = splitElements(arr);
    let edit
    if (type == 1) {
        edit = await editPermission(splittedArray, idStaff)
    }
    else {

        edit = await checkPermission(splittedArray, idStaff)
    }
    return edit
}
const checkPermission = async (arr, idStaff) => {
    let check = true;


    // Tạo một mảng promises cho mỗi phần tử
    const promises = arr.map(async (element) => {
        const part1 = element[0];
        const permission = await Permission.findOne({
            where: {
                name: part1
            }
        });

        const part2 = element[1];
        const screen = await Screen.findOne({
            where: {
                name: part2,
            }
        });

        let role = await Staff_permission.findOne({
            where: {
                idStaff,
                idScreen: screen.idScreen,
                idPermission: permission.idPermission
            }
        });

        if (!role) {

            check = false;
        }
    });

    // Chờ tất cả các promises được giải quyết
    await Promise.all(promises);

    return check;

}
const editPermission = async (arr, idStaff) => {
    arr.forEach(async element => {
        const part1 = element[0];
        //onsole.log(part1)
        const permission = await Permission.findOne({
            where: {
                name: part1
            }
        })
        const part2 = element[1];
        const screen = await Screen.findOne({
            where: {
                name: part2,
            }
        })
        //console.log(screen)
        let [currentCart, created] = await Staff_permission.findOrCreate({
            where: {
                idStaff,
                idScreen: screen.idScreen,
                idPermission: permission.idPermission
            }
        });

    });
    return true
}
const addStaff = async (req, res) => {
    try {



        const { name, email, phone, address, permission, username, password } = req.body
        if (phone === '' || password === '' || name === '' || address === '' || email === '' || username === '') {
            req.flash('error', 'Thông tin không được để trống!');
            return res.redirect('/staff/listStaff');
        }
        if (phone === undefined || password === undefined || name === undefined || address === undefined || email === undefined || username === undefined) {
            req.flash('error', 'Có lỗi xảy ra!');
            return res.redirect('/staff/listStaff');
        }
        //console.log(permission)

        const isAdd = await createStaffWithTransaction(name, email, phone, address, permission, username, password)
        if (!isAdd) {
            req.flash('error', 'Tài khoản không được trùng với các tài khoản đã có!');
            return res.redirect('/staff/listStaff');
        }

        req.flash('error', 'Thêm mới nhân viên thành công!');
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
        return res.redirect(req.query.url);

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mớinhân viên');
        return res.redirect('/staff/listStaff');
    }
};
const editStaff = async (req, res) => {
    try {


        const { idStaff } = req.params
        const { name, email, phone, address, permission } = req.body
        //console.log(permission)
        let staff = await Staff.findOne({
            where: {
                idStaff
            },
            //raw: true,

        })
        staff.name = name
        staff.mail = email
        staff.phone = phone
        staff.address = address
        await staff.save()
        let staff_permission = await Staff_permission.destroy({
            where: {
                idStaff
            }
        })

        if (permission != null) {

            const isEdit = await splitPermission(permission, idStaff, 1)
        }
        req.flash('error', 'Đổi thông tin nhân viên thành công!');

        return res.redirect(req.query.url);

        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi đổi thông tin nhân viên');
        return res.redirect('/account/admin/login');
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
const activeStaff = async (req, res) => {
    try {

        const { idStaff } = req.params

        let staff = await Staff.findOne({
            where: { idStaff },
            //raw: true,

        })

        staff.isActive = 1

        await staff.save()


        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const inActiveStaff = async (req, res) => {
    try {

        const { idStaff } = req.params

        let staff = await Staff.findOne({
            where: { idStaff },
            // raw: true,

        })

        staff.isActive = 0

        await staff.save()

        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteStaff = async (req, res) => {
    try {
        const { idStaff } = req.params

        let staff = await Staff.findOne({
            where: { idStaff },
            // raw: true,

        })
        let account = await Account.findOne({
            where: { idAccount: staff.idAccount }
        })


        await staff.destroy()
        await account.destroy()
        //req.flash('error', 'Đổi trạng thái tài khoản thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
module.exports = {

    getListStaff, getDetailStaff, editStaff, deleteStaff, activeStaff, inActiveStaff, getInfoHome,
    changePassword, selfEdit, splitPermission, addStaff, getFormAddStaff
};