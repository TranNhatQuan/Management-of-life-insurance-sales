const express = require("express");

const { getListInsurance, getFormAddInsurance, addInsurance, getListInsuranceType, getCatalog } = require("../controllers/insurance.controllers");
const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js")
const insuranceRouter = express.Router();

insuranceRouter.get("/listInsurance",authenticateStaff, authorize('readInsurance'), getListInsurance)
insuranceRouter.get("/listInsuranceType",authenticateStaff, authorize('readInsurance'), getListInsuranceType)
insuranceRouter.get("/catalog",authenticateStaff, authorize('readInsurance'), getCatalog)
insuranceRouter.get("/add", authenticateStaff,authorize('addInsurance'), getFormAddInsurance)
insuranceRouter.post("/addInsurance", authenticateStaff,authorize('addInsurance'), addInsurance)
// insuranceRouter.get("/listInsuranceType",authenticateStaff, authorize('readInsurance'),)
// insuranceRouter.get("/detail/:idInsurance",authenticateStaff, authorize('readInsurance'),)
// insuranceRouter.delete("/deleteInsurance/:idInsurance",authenticateStaff, authorize('readInsurance'),)
// insuranceRouter.delete("/deleteInsuranceType/:idInsurance",authenticateStaff, authorize('readInsurance'),)
// insuranceRouter.edit("/editInsurance/:idInsurance",authenticateStaff, authorize('readInsurance'),)
// insuranceRouter.edit("/editInsuranceType/:idInsurance",authenticateStaff, authorize('readInsurance'),)
module.exports = {
    insuranceRouter,
}