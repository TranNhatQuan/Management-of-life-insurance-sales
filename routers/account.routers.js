const express = require("express");

const {login, loginAdmin, 
        getLogin, getLoginAdmin, logoutAdmin, logoutUser, formForgotUser, formForgotStaff, forgotUser, forgotStaff, confirmOTPStaff, confirmOTPUser, changePassAfterOTPUser, changePassAfterOTPStaff} = require("../controllers/account.controllers");
const { checkExistAccount, checkNotExistAcount } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { checkCreateAccount } = require("../middlewares/validates/checkCreate");
const {authenticate} = require("../middlewares/auth/authenticate.js")
const accountRouter = express.Router();

accountRouter.post("/login", login);
accountRouter.post("/admin/login", loginAdmin);
accountRouter.get("/login", getLogin);
//Quên mật khẩu
accountRouter.get("/formForgotUser", formForgotUser);
accountRouter.get("/formForgotStaff", formForgotStaff);
accountRouter.post("/forgotStaff", forgotStaff);
accountRouter.post("/forgotUser", forgotUser);
accountRouter.post("/confirmOtpStaff/:idAccount", confirmOTPStaff);
accountRouter.post("/confirmOtpUser/:idAccount", confirmOTPUser);
accountRouter.post("/changeAfterUser", changePassAfterOTPUser);
accountRouter.post("/changeAfterStaff", changePassAfterOTPStaff);
accountRouter.get("/admin/login", getLoginAdmin);
accountRouter.get("/logout", logoutAdmin);
accountRouter.get("/logoutUser", logoutUser);
//accountRouter.post("/create", checkNotExistAcount(), createAccountForCustomer);


module.exports = {
    accountRouter,
}