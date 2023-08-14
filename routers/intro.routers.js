const express = require("express");


const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff, checkAuth } = require("../middlewares/auth/authenticate.js");
const { getIntroHome } = require("../controllers/intro.controllers");
const introRouter = express.Router();

introRouter.get("/home", checkAuth, getIntroHome)

module.exports = {
    introRouter,
}