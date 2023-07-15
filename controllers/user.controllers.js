const { Staff, Account, Permission, Screen, Staff_permission, Contract, Payment_schedule, User, Benefit_history } = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");

const getListUser = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let users = await User.findAll({

            raw: true,

        })
        const error = req.flash('error')[0];
        return res.render('user/listUser', { error: error, employees: employees, selectedMenuItem: 'Quản lý nhân viên', name: name });

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


        return res.render('staff/detailUser', { user: user });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy chi tiết thông tin khách hàng!');
        return res.status(500).json({ isSuccess: false })
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
        if (req.query.url == 'home') {
            return res.redirect('/staff/home');
        }
        return res.redirect('/staff/listUser');

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
module.exports = {

    getListUser, getDetailUser, editUser, deleteUser, activeUser, inActiveUser,
    changePassword, selfEdit, getFullDetailUser
};