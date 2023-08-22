const express = require("express");

const { getListContract, getListPayment, getListBenefit, getFormAddContract, addContract, getListSubInsurance, getDetailAndSub, fake, getFormAddPayment, getFormAddBenefit, addPayment, addBenefit, getFormEditPayment, getFormEditBenefit, editPayment, editBenefit, getFormAddDetailContract, getFormEditDetailContract, getFromEditContract, addDetail_contract, editContract, editStatusContract, editStatusDetail_contract, editStatusPayment, deleteContract, deleteDetail_contract, deletePayment, deleteBenefit, getListDetail, getFromEditDetail, editDetail } = require("../controllers/contract.controllers");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js")

const contractRouter = express.Router();
//Đọc
contractRouter.get("/listContract", authenticateStaff, authorize('readContract'), getListContract)
contractRouter.get("/listPayment", authenticateStaff, authorize('readPayment'), getListPayment)
contractRouter.get("/listBenefit", authenticateStaff, authorize('readBenefit'), getListBenefit)
contractRouter.get("/listDetail", authenticateStaff, authorize('readContract'), getListDetail)
contractRouter.get("/detailAndSub/:idInsurance", getDetailAndSub)
//Thêm
contractRouter.get("/addContract", authenticateStaff, authorize('addContract'), getFormAddContract)
contractRouter.get("/addDetail_contract/:idContract", authenticateStaff, authorize('addContract'), getFormAddDetailContract)
contractRouter.get("/addPayment/:idDetail_contract", authenticateStaff, authorize('addPayment'), getFormAddPayment)
contractRouter.get("/addBenefit/:idDetail_contract", authenticateStaff, authorize('addBenefit'), getFormAddBenefit)
contractRouter.post("/addContract", authenticateStaff, authorize('addContract'), addContract)
contractRouter.post("/addDetail_contract/:idContract", authenticateStaff, authorize('addContract'), addDetail_contract)
contractRouter.post("/addPayment/:idDetail_contract", authenticateStaff, authorize('addPayment'), addPayment)
contractRouter.post("/addBenefit/:idDetail_contract", authenticateStaff, authorize('addBenefit'), addBenefit)
//Sửa
contractRouter.get("/editDetail/:idDetail_contract", authenticateStaff, authorize('editContract'), getFromEditDetail)
contractRouter.get("/editContract/:idContract", authenticateStaff, authorize('editContract'), getFromEditContract)
contractRouter.get("/editPayment", authenticateStaff, authorize('editPayment'), getFormEditPayment)
contractRouter.get("/editBenefit/:idBenefit_history", authenticateStaff, authorize('editBenefit'), getFormEditBenefit)
contractRouter.post("/editContract/:idContract", authenticateStaff, authorize('editContract'), editContract)
contractRouter.post("/editDetail/:idDetail_contract", authenticateStaff, authorize('editContract'), editDetail)
contractRouter.post("/editPayment", authenticateStaff, authorize('editPayment'), editPayment)
contractRouter.post("/editBenefit/:idBenefit_history", authenticateStaff, authorize('editBenefit'), editBenefit)
contractRouter.put("/editContract/:idContract", authenticateStaff, authorize('editContract'), editStatusContract)
contractRouter.put("/editDetail_contract/:idDetail_contract", authenticateStaff, authorize('editContract'), editStatusDetail_contract)
contractRouter.put("/editPayment/:idPayment_schedule", authenticateStaff, authorize('editPayment'), editStatusPayment)
//Xoá
contractRouter.delete("/deleteContract/:idContract", authenticateStaff, authorize('deleteContract'), deleteContract)
contractRouter.delete("/deleteDetail_contract/:idDetail_contract", authenticateStaff, authorize('deleteContract'), deleteDetail_contract)
contractRouter.delete("/deletePayment/:idPayment_schedule", authenticateStaff, authorize('deletePayment'), deletePayment)
contractRouter.delete("/deleteBenefit/:idBenefit_history", authenticateStaff, authorize('deleteBenefit'), deleteBenefit)

//Dành cho khách hàng
contractRouter.get("/fake", fake)
module.exports = {
    contractRouter,
}