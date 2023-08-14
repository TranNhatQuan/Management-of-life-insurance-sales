const express = require("express");

;
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js");
const { reportInsurance, fake } = require("../controllers/report.controllers.js");


const reportRouter = express.Router();

reportRouter.get("/insurance", authenticateStaff, authorize('readReport'), reportInsurance)
reportRouter.post("/fake", fake)
module.exports = {
    reportRouter,
}