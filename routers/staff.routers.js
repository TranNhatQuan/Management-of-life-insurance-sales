const express = require("express");

const { getListStaff, getDetailStaff, activeStaff, inActiveStaff, deleteStaff, editStaff, getInfoHome, changePassword, selfEdit, addStaff, getFormAddStaff, getInfo, checkPay }
    = require("../controllers/staff.controllers");
const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticateStaff } = require("../middlewares/auth/authenticate.js")
const staffRouter = express.Router();


staffRouter.get("/listStaff", authenticateStaff, authorize('readStaff'), getListStaff)
staffRouter.get("/home", authenticateStaff, getInfoHome)
staffRouter.get("/info", authenticateStaff, getInfo)
staffRouter.get("/detail/:idStaff", authenticateStaff, authorize('readStaff'), getDetailStaff)
staffRouter.post("/edit/:idStaff", authenticateStaff, authorize('editStaff'), editStaff)
staffRouter.put("/check", authenticateStaff, authorize('editPayment'), checkPay)
staffRouter.get("/add", authenticateStaff, authorize('addStaff'), getFormAddStaff)
staffRouter.post("/add", authenticateStaff, authorize('addStaff'), addStaff)
staffRouter.post("/selfEdit", authenticateStaff, selfEdit)
staffRouter.post("/changePassword/:idStaff", authenticateStaff, changePassword)
staffRouter.put("/active/:idStaff", authenticateStaff, authorize('editStaff'), activeStaff)
staffRouter.put("/inActive/:idStaff", authenticateStaff, authorize('editStaff'), inActiveStaff)
staffRouter.delete("/delete/:idStaff", authenticateStaff, authorize('deleteStaff'), deleteStaff)

module.exports = {
    staffRouter,
}