const { Post, Post_type, Staff } = require("../models");
const db = require("../models/index");
const { QueryTypes, Op, where, sequelize } = require("sequelize");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");


const getListPost = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let posts = await Post.findAll({
            include:[
                {
                    model: Post_type,
                    attributes: ['name']
                }
            ]

        })
        await posts.forEach((emp) => {
           
            emp.dataValues.type = emp.Post_type.dataValues.name
            delete emp.dataValues.Post_type

        });
        const error = req.flash('error')[0];
        return res.render('post/listPost', { error: error, posts: posts, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách bài đăng');
        return res.redirect('/staff/home');
    }
};
const getListType = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let types = await Post_type.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('post/listType', { error: error, types: types, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách loại bài đăng');
        return res.redirect('/post/listPost');
    }
};

module.exports = {
    getListPost, getListType

};