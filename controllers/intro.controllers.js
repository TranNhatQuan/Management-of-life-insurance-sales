const { Staff, Account, Permission, Screen, Staff_permission, Contract, Detail_contract, Payment_schedule, User } = require("../models");
const { QueryTypes, Op, where, STRING, NUMBER } = require("sequelize");
const db = require("../models/index");
const bcrypt = require("bcryptjs");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");
const nodemailer = require("nodemailer");
const { getData } = require("../middlewares/getDataIntro/getData");
const getIntroHome = async (req, res) => {
    try {
        const error = req.flash('error')[0];
        const {listType, listPostType, listCatalog} = await getData()
        if(req.user){
            const user = req.user
            const name = user.name
            return res.render('intro/home',{error: error, name: name, listType, listPostType, listCatalog});
        }
        else{
            return res.render('intro/home',{error: error,  listType, listPostType, listCatalog});
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi vào trang chủ');
        return res.redirect('/account/login');
    }
};
const getIntroHomeAuth = async (req, res) => {
    try {



        return res.render('intro/home',);

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi vào trang chủ');
        return res.redirect('/account/admin/login');
    }
};
module.exports = {
    getIntroHome
};