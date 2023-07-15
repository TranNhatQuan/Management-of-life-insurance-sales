const express = require("express");

const {  } = require("../controllers/insurance.controllers");
const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate } = require("../middlewares/auth/authenticate.js")
const insuranceRouter = express.Router();

insuranceRouter.get("/listInsurance")
insuranceRouter.get("/listInsuranceType")
insuranceRouter.get("/detail/:idInsurance")
insuranceRouter.delete("/deleteInsurance/:idInsurance")
insuranceRouter.delete("/deleteInsuranceType/:idInsurance")
insuranceRouter.edit("/editInsurance/:idInsurance")
insuranceRouter.edit("/editInsuranceType/:idInsurance")
module.exports = {
    insuranceRouter,
}