const { Staff, Account, Permission, Screen, Staff_permission, Contract, Payment_schedule, User } = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");

const getListStaff = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let employees = await Staff.findAll({

            raw: true,

        })
        const error = req.flash('error')[0];
        return res.render('staff/listStaff', { error:error,employees: employees, selectedMenuItem: 'Quản lý nhân viên', name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.redirect('/account/admin/login');
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
        let contracts = await Contract.findAll({
            where: {
                idStaff: staff.idStaff,
                status: 1
            },
            include: [
                {
                    model: Payment_schedule,
                    where: {
                        status: 0
                    },
                    required: true,

                },
                {
                    model: User,
                    required: true,
                }
            ],
            raw: true,
        })
        
        contracts = contracts.map(item => {

            return {
                idPayment_schedule: item['Payment_schedules.idPayment_schedule'],
                idContract: item['idContract'],
                endDate: item['Payment_schedules.endDate'],
                total: item['Payment_schedules.total'],
                idUser: item['User.idUser'],
                name: item['User.name'],
                address: item['User.address'],
                phone: item['User.phone'],
                mail: item['User.mail'],

            }
        });
  

        return res.render('staff/home', { staff: staff,error:error, contracts: contracts, selectedMenuItem: 'Trang chủ', name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi vào trang chủ');
        return res.redirect('/account/admin/login');
    }
};
const splitPermission = async (permission, idStaff) => {
    let arr
    if (Array.isArray(permission)) {
        arr = permission
    } else {
        arr = [permission]
    }

    console.log(arr)
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
    const edit = await editPermission(splittedArray, idStaff)
    return edit
}
const editPermission = async (arr, idStaff) => {
    arr.forEach(async element => {
        const part1 = element[0];
        console.log(part1)
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
        console.log(screen)
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

            const isEdit = await splitPermission(permission, idStaff)
        }
        req.flash('error', 'Đổi thông tin nhân viên thành công!');
        if(req.query.url=='home'){
            return res.redirect('/staff/home');
        }
            return res.redirect('/staff/listStaff');
        
        //return res.status(200).json({ isSuccess: true })
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi đổi thông tin nhân viên');
        return res.redirect('/account/admin/login');
    }
};
const selfEdit = async (req, res) => {
    try {
        let staff = req.staff

   
        const { name, email, phone, address} = req.body
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
        const { oldPassword, newPassword} = req.body
        if(oldPassword.trim()==''||newPassword==''){
            req.flash('error', 'Mật khẩu không được để trống!');
            return res.redirect('/staff/home');
        }
        //console.log(permission)
        let account = await Account.findOne({
            where:{
                idAccount:staff.idAccount
            }
        })
        const isAuth = bcrypt.compareSync(oldPassword, account.password);
        if(isAuth){
            
            const salt = bcrypt.genSaltSync(10);
            //mã hoá salt + password
            
            const hashPassword = bcrypt.hashSync(newPassword, salt);
            
            account.password = hashPassword;
            await account.save()
        }
        else{
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
    changePassword, selfEdit
};