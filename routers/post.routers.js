const express = require("express");

const { } = require("../controllers/post.controllers");
const {} = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate } = require("../middlewares/auth/authenticate.js");
const { searchRecipe } = require("../controllers/insurance.controllers");

const postRouter = express.Router();
postRouter.get("/listPost")
postRouter.get("/listPostType")
postRouter.get("/detail/:idPost")
postRouter.delete("/deletePost/:idPost")
postRouter.delete("/deletePostType/:idPost")
postRouter.edit("/editPost/:idPost")
postRouter.edit("/editPostType/:idPost")
module.exports = {
    postRouter
}