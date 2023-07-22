const express = require("express");

;
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js");
const { getListPost, getListType } = require("../controllers/post.controllers.js");

const postRouter = express.Router();
postRouter.get("/listPost", authenticateStaff, authorize('readPost'), getListPost)
postRouter.get("/listType", authenticateStaff, authorize('readPost'), getListType)


module.exports = {
    postRouter,
}