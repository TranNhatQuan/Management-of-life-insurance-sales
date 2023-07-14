const express = require("express");

const { getListStaff, getDetailStaff, activeStaff, inActiveStaff, deleteStaff, editStaff }
    = require("../controllers/staff.controllers");
const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const {authenticateStaff } = require("../middlewares/auth/authenticate.js")
const staffRouter = express.Router();


staffRouter.get("/listStaff", authenticateStaff, getListStaff)
staffRouter.get("/detail/:idStaff", authenticateStaff, getDetailStaff)
staffRouter.post("/edit/:idStaff", authenticateStaff, editStaff)
staffRouter.put("/active/:idStaff", authenticateStaff, activeStaff)
staffRouter.put("/inActive/:idStaff", authenticateStaff, inActiveStaff)
staffRouter.delete("/delete/:idStaff", authenticateStaff, deleteStaff)

module.exports = {
    staffRouter,
}