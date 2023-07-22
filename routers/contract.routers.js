const express = require("express");

const { getListContract, getListPayment, getListBenefit } = require("../controllers/contract.controllers");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js")

const contractRouter = express.Router();
contractRouter.get("/listContract", authenticateStaff, authorize('readContract'), getListContract)
contractRouter.get("/listPayment", authenticateStaff, authorize('readContract'), getListPayment)
contractRouter.get("/listBenefit", authenticateStaff, authorize('readContract'), getListBenefit)

module.exports = {
    contractRouter,
}