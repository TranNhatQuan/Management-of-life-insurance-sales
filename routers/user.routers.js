const express = require("express");
const { authenticate } = require("../middlewares/auth/authenticate.js")
const {}
    = require("../controllers/user.controllers");

const userRouter = express.Router();




// userRouter.get("/info/:date",authenticate, getInfo)
module.exports = {
    userRouter,
}