const express = require("express");
const { authenticate, authenticateStaff } = require("../middlewares/auth/authenticate.js")
const { getListUser, getDetailUser, getFullDetailUser, editUser, activeUser, inActiveUser, deleteUser, getFormAddUser, addUser }
    = require("../controllers/user.controllers");
const { authorize } = require("../middlewares/auth/authorize.js");


const userRouter = express.Router();


userRouter.get("/listUser", authenticateStaff,authorize('readUser'), getListUser)
userRouter.get("/detail/:idUser", authenticateStaff,authorize('readUser'), getDetailUser)
userRouter.get("/fullDetail/:idUser", authenticateStaff,authorize('readUser'), getFullDetailUser)
userRouter.post("/edit/:idUser", authenticateStaff,authorize('editUser'), editUser)
userRouter.put("/active/:idUser", authenticateStaff,authorize('editUser'), activeUser)
userRouter.put("/inActive/:idUser", authenticateStaff,authorize('editUser'), inActiveUser)
userRouter.delete("/delete/:idUser", authenticateStaff,authorize('deleteUser'), deleteUser)
userRouter.get("/add", authenticateStaff,authorize('addUser'), getFormAddUser)
userRouter.post("/add", authenticateStaff,authorize('addUser'), addUser)
// userRouter.get("/info/:date",authenticate, getInfo)
module.exports = {
    userRouter,
}