const express = require("express");
const { userRouter } = require("./user.routers");
const { accountRouter } = require("./account.routers");
const {insuranceRouter} = require("./insurance.routers")
const {contractRouter} = require("./contract.routers")
const {postRouter} = require("./post.routers")
const {staffRouter} = require("./staff.routers")

const rootRouter = express.Router();

rootRouter.use("/user", userRouter);
rootRouter.use("/account", accountRouter);
rootRouter.use("/insurance", insuranceRouter);
rootRouter.use("/post", postRouter);
rootRouter.use("/contract", contractRouter);
rootRouter.use("/staff", staffRouter);
module.exports = {
    rootRouter,
}
