const express = require("express");

;
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff, checkAuth } = require("../middlewares/auth/authenticate.js");
const { getListPost, getListType, getFormAddPost, getFormAddType, addPost, addType, getFormEditPost, getFormEditType, editPost, editType, deletePost, deleteType, showPost, listPostType } = require("../controllers/post.controllers.js");

const postRouter = express.Router();
//read
postRouter.get("/listPost", authenticateStaff, authorize('readPost'), getListPost)
postRouter.get("/listType", authenticateStaff, authorize('readPost'), getListType)
//create
postRouter.get("/addPost", authenticateStaff, authorize('addPost'), getFormAddPost)
postRouter.get("/addType", authenticateStaff, authorize('addPost'), getFormAddType)
postRouter.post("/addPost", authenticateStaff, authorize('addPost'), addPost)
postRouter.post("/addType", authenticateStaff, authorize('addPost'), addType)
//eidt
postRouter.get("/editPost/:idPost", authenticateStaff, authorize('editPost'), getFormEditPost)
postRouter.get("/editType/:idPost_type", authenticateStaff, authorize('editPost'), getFormEditType)
postRouter.post("/editPost", authenticateStaff, authorize('editPost'), editPost)
postRouter.post("/editType", authenticateStaff, authorize('editPost'), editType)
//delete
postRouter.delete("/deletePost/:idPost", authenticateStaff, authorize('deletePost'), deletePost)
postRouter.delete("/deleteType/:idPost_type", authenticateStaff, authorize('deletePost'), deleteType)
//Dành cho khách hàng
postRouter.get("/post/:idPost", checkAuth, showPost)
postRouter.get("/type/:idPost_type", checkAuth, listPostType)
module.exports = {
    postRouter,
}