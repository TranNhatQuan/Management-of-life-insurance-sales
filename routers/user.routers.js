const express = require("express");
const { authenticate, authenticateStaff, authenticateUser, checkAuth } = require("../middlewares/auth/authenticate.js")
const { getListUser, getDetailUser, getFullDetailUser, editUser, activeUser, inActiveUser, deleteUser, getFormAddUser, addUser, getUserHome, getAllContract, payWithoutUser, payWithUser, detail, logout, confirmPay, prePay, selectBank }
    = require("../controllers/user.controllers");
const { authorize } = require("../middlewares/auth/authorize.js");


const userRouter = express.Router();


//user
userRouter.get("/home", authenticateUser, getUserHome)
userRouter.get("/allContract", authenticateUser, getAllContract)

userRouter.get("/pay",checkAuth, payWithoutUser)
userRouter.get("/selectBank",selectBank)
userRouter.get("/payWithUser", authenticateUser, payWithUser)
userRouter.get("/detail", authenticateUser, detail)
userRouter.post("/confirmPay", confirmPay)
userRouter.get("/prePay", checkAuth, prePay)

//staff
userRouter.get("/listUser", authenticateStaff, authorize('readUser'), getListUser)
userRouter.get("/detail/:idUser", authenticateStaff, authorize('readUser'), getDetailUser)
userRouter.get("/fullDetail/:idUser", authenticateStaff, authorize('readUser'), getFullDetailUser)
userRouter.post("/edit/:idUser", authenticateStaff, authorize('editUser'), editUser)
userRouter.put("/active/:idUser", authenticateStaff, authorize('editUser'), activeUser)
userRouter.put("/inActive/:idUser", authenticateStaff, authorize('editUser'), inActiveUser)
userRouter.delete("/delete/:idUser", authenticateStaff, authorize('deleteUser'), deleteUser)
userRouter.get("/add", authenticateStaff, authorize('addUser'), getFormAddUser)
userRouter.post("/add", authenticateStaff, authorize('addUser'), addUser)
// userRouter.get("/info/:date",authenticate, getInfo)
module.exports = {
    userRouter,
}