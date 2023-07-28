const express = require("express");

const { getListContract, getListPayment, getListBenefit, getFormAddContract, addContract, getListSubInsurance, getDetailAndSub, fake } = require("../controllers/contract.controllers");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js")

const contractRouter = express.Router();
contractRouter.get("/listContract", authenticateStaff, authorize('readContract'), getListContract)
contractRouter.get("/listPayment", authenticateStaff, authorize('readContract'), getListPayment)
contractRouter.get("/listBenefit", authenticateStaff, authorize('readContract'), getListBenefit)
contractRouter.get("/detailAndSub/:idInsurance",  getDetailAndSub)
contractRouter.get("/addContract", authenticateStaff, authorize('addContract'), getFormAddContract)
contractRouter.post("/addContract", authenticateStaff, authorize('addContract'), addContract)
contractRouter.post("/fake",  fake)
module.exports = {
    contractRouter,
}