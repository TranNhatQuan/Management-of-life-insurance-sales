const { raw, text } = require("body-parser");
const db = require("../models/index");
const { Contract, Payment_schedule, Benefit_history, User, Staff, Detail_contract } = require("../models");
const { QueryTypes, Op, where, STRING } = require("sequelize");
const { getIngredientByIdRecipe, changeQuantityIngredientShopWithTransaction } = require("./post.controllers")
const moment = require('moment-timezone'); // require
const getListContract = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let contracts = await Contract.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('contract/listContract', { error: error, contracts: contracts, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách hợp đồng');
        return res.redirect('/staff/home');
    }
};
const getListPayment = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let payments = await Payment_schedule.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('contract/listPayment', { error: error, payments: payments, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách phiếu thu phí');
        return res.redirect('/staff/home');
    }
};
const getListBenefit = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let benefits = await Benefit_history.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('contract/listBenefit', { error: error, benefits: benefits, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách thông tin chi trả');
        return res.redirect('/staff/home');
    }
};
module.exports = {
    getListBenefit, getListContract, getListPayment

};