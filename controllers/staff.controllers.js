const {Staff, Account, Permission, Screen, Staff_permission} = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { getDetailCart } = require("./contract.controllers");
const { raw } = require("body-parser");

const getListStaff = async (req, res) => {
    try {
        const staff = req.staff
        const name = staff.name

        let employees = await Staff.findAll({
            
            raw: true,

        })
        return res.render('staff/listStaff', { employees: employees,selectedMenuItem:'Quản lý nhân viên', name: name });
        
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.redirect('/account/admin/login');
    }
};
const getDetailStaff = async (req, res) => {
    try {
        const { idStaff } = req.params
        let staffs = await Staff.findAll({
            where:{idStaff},
            raw: true,
            include:[
                {
                    model:Staff_permission,
                    include:[
                        {
                            model:Permission
                        },
                        {
                            model:Screen
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
      
        
        return res.render('staff/detailStaff', { staff: staff});
        
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const editStaff = async (req, res) => {
    try {
        const { idStaff } = req.params
        const {name, email, phone, address} = req.body
        console.log(name, email, phone, address)
        let employees = await Staff.findAll({
            
            raw: true,

        })
        return res.redirect('/staff/listStaff');
        
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        return res.redirect('/account/admin/login');
    }
};
const activeStaff = async (req, res) => {
    try {
        const { idStaff } = req.params
  
        let staff = await Staff.findOne({
            where:{idStaff},
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
            where:{idStaff},
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
            where:{idStaff},
           // raw: true,

        })
        let account = await Account.findOne({
            where:{idAccount:staff.idAccount}
        })
     
      
        await staff.destroy()
        await account.destroy()
        return res.status(200).json({ isSuccess: true });
        
    } catch (error) {
       //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
       return res.status(500).json({ isSuccess: false })
    }
};
module.exports = {

    getListStaff, getDetailStaff, editStaff, deleteStaff, activeStaff, inActiveStaff
};