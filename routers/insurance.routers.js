const express = require("express");

const { getListInsurance, getFormAddInsurance, addInsurance, getListInsuranceType, getCatalog, getFormAddType, addType, addCatalog, getFormAddCatalog, getFormeditCatalog, editCatalog, getFormeditType, editType, getFormeditInsurance, editInsurance, deleteType, deleteCatalog, deleteInsurance, editIsDelType, editIsDelInsurance, addInsuranceIntoCatalog, getFormAddInsuranceIntoCatalog, getFormAddSub, getFormAddMain, addSub, addMain, listInsuranceForUser, catalogForUser, detailForUser, addSubInsurance, getFormAddSubInsurance } = require("../controllers/insurance.controllers");
const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate, authenticateStaff, checkAuth } = require("../middlewares/auth/authenticate.js")
const insuranceRouter = express.Router();

//read
insuranceRouter.get("/listInsurance", authenticateStaff, authorize('readInsurance'), getListInsurance)
insuranceRouter.get("/listType", authenticateStaff, authorize('readInsurance'), getListInsuranceType)
insuranceRouter.get("/catalog", authenticateStaff, authorize('readInsurance'), getCatalog)

//add
insuranceRouter.get("/add", authenticateStaff, authorize('addInsurance'), getFormAddInsurance)
insuranceRouter.post("/addInsurance", authenticateStaff, authorize('addInsurance'), addInsurance)
insuranceRouter.get("/addSub/:idInsurance", authenticateStaff, authorize('addInsurance'), getFormAddSubInsurance)
insuranceRouter.post("/addSubInsurance/:idInsurance", authenticateStaff, authorize('addInsurance'), addSubInsurance)
insuranceRouter.get("/addType", authenticateStaff, authorize('addInsurance'), getFormAddType)
insuranceRouter.post("/addType", authenticateStaff, authorize('addInsurance'), addType)
insuranceRouter.get("/addCatalog", authenticateStaff, authorize('addInsurance'), getFormAddCatalog)
insuranceRouter.post("/addCatalog", authenticateStaff, authorize('addInsurance'), addCatalog)
//edit
insuranceRouter.get("/editCatalog/:idCatalog", authenticateStaff, authorize('editInsurance'), getFormeditCatalog)
insuranceRouter.post("/editCatalog/:idCatalog", authenticateStaff, authorize('editInsurance'), editCatalog)
insuranceRouter.get("/editType/:idInsurance_type", authenticateStaff, authorize('editInsurance'), getFormeditType)
insuranceRouter.post("/editType/:idInsurance_type", authenticateStaff, authorize('editInsurance'), editType)
insuranceRouter.get("/editInsurance/:idInsurance", authenticateStaff, authorize('editInsurance'), getFormeditInsurance)
insuranceRouter.post("/editInsurance/:idInsurance", authenticateStaff, authorize('editInsurance'), editInsurance)
//xoá
insuranceRouter.delete("/deleteType/:idInsurance_type", authenticateStaff, authorize('editInsurance'), deleteType)
insuranceRouter.delete("/deleteCatalog/:idCatalog", authenticateStaff, authorize('editInsurance'), deleteCatalog)
insuranceRouter.delete("/deleteInsurance/:idInsurance", authenticateStaff, authorize('editInsurance'), deleteInsurance)
//xoá mềm
insuranceRouter.put("/deleteType/:idInsurance_type", authenticateStaff, authorize('editInsurance'), editIsDelType)
insuranceRouter.put("/deleteInsurance/:idInsurance", authenticateStaff, authorize('editInsurance'), editIsDelInsurance)

//Thêm sản phẩm vào catalog
insuranceRouter.get("/addInsuranceIntoCatalog/:idInsurance", authenticateStaff, authorize('editInsurance'), getFormAddInsuranceIntoCatalog)
insuranceRouter.post("/addInsuranceIntoCatalog/:idInsurance", authenticateStaff, authorize('editInsurance'), addInsuranceIntoCatalog)


//Thêm sản phẩm chính
insuranceRouter.get("/addMain/:idInsurance", authenticateStaff, authorize('editInsurance'), getFormAddMain)
insuranceRouter.post("/addMain/:idInsurance", authenticateStaff, authorize('editInsurance'), addMain)
//Dành cho khách hàng
insuranceRouter.get("/typeInsurance/:idInsurance_type", checkAuth, listInsuranceForUser)
insuranceRouter.get("/detail/:idInsurance", checkAuth, detailForUser)
insuranceRouter.get("/catalogUser/:idCatalog", checkAuth, catalogForUser)
module.exports = {
    insuranceRouter,
}