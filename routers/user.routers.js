const express = require("express");
const { authenticate } = require("../middlewares/auth/authenticate.js")
const { getListUser, getDetailUser, getFullDetailUser, editUser, activeUser, inActiveUser, deleteUser }
    = require("../controllers/user.controllers");


const userRouter = express.Router();


userRouter.get("/listUser", authenticate, getListUser)
userRouter.get("/detail/:idUser", authenticate, getDetailUser)
userRouter.get("/fullDetail/:idUser", authenticate, getFullDetailUser)
userRouter.post("/edit/:idUser", authenticate, editUser)
userRouter.put("/active/:idUser", authenticate, activeUser)
userRouter.put("/inActive/:idUser", authenticate, inActiveUser)
userRouter.delete("/delete/:idUser", authenticate, deleteUser)

// userRouter.get("/info/:date",authenticate, getInfo)
module.exports = {
    userRouter,
}