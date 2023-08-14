const { Post, Post_type, Staff } = require("../models");
const db = require("../models/index");
const { QueryTypes, Op, where, sequelize } = require("sequelize");
const moment = require('moment-timezone'); // require
const { raw } = require("body-parser");

const { updateData, getData } = require("../middlewares/getDataIntro/getData");
const getListPost = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let posts = await Post.findAll({
            include: [
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
const getFormAddPost = async (req, res) => {
    try {

        const type = await Post_type.findAll({
            where: {
                isDel: false
            }
        })
        return res.render('post/addPost', { type: type });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập thông tin bài đăng!');
        return res.status(500).json({ isSuccess: false })
    }
};
const addType = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        let { name, info } = req.body
        const post = await Post_type.create({
            name,
            info,
            isDel: false,

        })
        req.flash('error', 'Thêm loại bài đăng thành công!');
        return res.redirect(req.query.url);


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm loại bài đăng!');
        return res.redirect(req.query.url);
    }
};
const editType = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        let { name, info, idPost_type } = req.body
        const type = await Post_type.findOne({
            where: {
                idPost_type
            }
        })
        if (type) {
            const now = new Date()
            type.name = name
            type.info = info
            await type.save()
            req.flash('error', 'Sửa bài đăng thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Không tìm thấy loại bài đăng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi sửa bài đăng!');
        return res.redirect(req.query.url);
    }
};
const deleteType = async (req, res) => {
    try {

        const { idPost_type } = req.params

        let post = await Post_type.findOne({
            where: {
                idPost_type
            }
        })
        if (!post) {
            req.flash('error', 'Không tìm thấy loại bài đăng bạn chọn!');
            return res.redirect(req.query.url);
        }
        else {
            await post.destroy()
            req.flash('error', 'Xoá loại bài đăng thành công!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi xoá loại bài đăng!');
        return res.redirect(req.query.url);
    }
};
const deletePost = async (req, res) => {
    try {

        const { idPost } = req.params

        let post = await Post.findOne({
            where: {
                idPost
            }
        })
        if (!post) {
            req.flash('error', 'Không tìm thấy bài đăng bạn chọn!');
            return res.redirect(req.query.url);
        }
        else {
            await post.destroy()
            req.flash('error', 'Xoá bài đăng thành công!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi xoá bài đăng!');
        return res.redirect(req.query.url);
    }
};
const editPost = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        let { idPost, title, content, idPost_type } = req.body
        const type = await Post_type.findOne({
            where: {
                idPost_type
            }
        })
        let post = await Post.findOne({
            where: {
                idPost
            }
        })
        if (!post) {
            req.flash('error', 'Không tìm thấy bài đăng bạn chọn!');
            return res.redirect(req.query.url);
        }
        if (type) {
            const now = new Date()
            post.title = title
            post.content = content
            post.idPost_type = idPost_type
            post.updatedAt = now
            await post.save()
            req.flash('error', 'Sửa bài đăng thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Không tìm thấy loại bài đăng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi sửa bài đăng!');
        return res.redirect(req.query.url);
    }
};
const addPost = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        let { title, content, idPost_type } = req.body
        const type = await Post_type.findOne({
            where: {
                idPost_type
            }
        })
        if (type) {
            const now = new Date()
            const post = await Post.create({
                title,
                content,
                idPost_type,
                isDel: false,
                idStaff,
                createdAt: now,
                updatedAt: now,
            })
            req.flash('error', 'Thêm bài đăng thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Không tìm thấy loại bài đăng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm bài đăng!');
        return res.redirect(req.query.url);
    }
};
const getFormAddType = async (req, res) => {
    try {


        return res.render('post/addType');

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập thông tin loại bài đăng!');
        return res.status(500).json({ isSuccess: false })
    }
};
const showPost = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        const { idPost } = req.params
        let post = await Post.findOne({
            where: {
                idPost
            },
        })
      
        if (req.user) {
            const user = req.user
            const name = user.name
            return res.render('intro/post', { error: error, name: name, listType, listPostType, listCatalog, post });
        }
        else {
            return res.render('intro/post', { error: error, listType, listPostType, listCatalog, post });
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang danh sách sản phẩm!');
        return res.redirect('/intro/home');
    }
};
const listPostType = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        const { idPost_type } = req.params
        let posts = await Post.findAll({
            where: {
                idPost_type
            },
        })
        let type = await Post_type.findOne({
            where: {
                idPost_type
            }
        })
        if (req.user) {
            const user = req.user
            const name = user.name
            return res.render('intro/post_type', { error: error, name: name, listType, listPostType, listCatalog, posts, type });
        }
        else {
            return res.render('intro/post_type', { error: error, listType, listPostType, listCatalog, posts, type });
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang danh sách sản phẩm!');
        return res.redirect('/intro/home');
    }
};
const getFormEditPost = async (req, res) => {
    try {
        const { idPost } = req.params
        const type = await Post.findOne({
            where: {
                idPost
            }
        })
        if (type) {
            return res.render('post/editPost');
        }
        else {
            req.flash('error', 'Bài đăng bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập thông tin bài đăng!');
        return res.status(500).json({ isSuccess: false })
    }
};
const getFormEditType = async (req, res) => {
    try {
        const { idPost_type } = req.params
        const type = await Post_type.findOne({
            where: {
                idPost_type
            }
        })
        if (type) {
            return res.render('post/editType');
        }
        else {
            req.flash('error', 'Loại bài đăng bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập thông tin loại bài đăng!');
        return res.status(500).json({ isSuccess: false })
    }
};
module.exports = {
    getListPost, getListType, getFormAddPost, getFormAddType, addPost, addType,
    getFormEditPost, getFormEditType, editPost, editType, deletePost, deleteType,
    showPost, listPostType

};