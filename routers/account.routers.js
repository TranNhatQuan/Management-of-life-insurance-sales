const express = require("express");

const {login, loginAdmin, 
        getLogin, getLoginAdmin, logoutAdmin} = require("../controllers/account.controllers");
const { checkExistAccount, checkNotExistAcount } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { checkCreateAccount } = require("../middlewares/validates/checkCreate");
const {authenticate} = require("../middlewares/auth/authenticate.js")
const accountRouter = express.Router();

accountRouter.post("/login", checkExistAccount(), login);
accountRouter.post("/admin/login", checkExistAccount(), loginAdmin);
accountRouter.get("/login", getLogin);
accountRouter.get("/admin/login", getLoginAdmin);
accountRouter.get("/logout", logoutAdmin);
//accountRouter.post("/create", checkNotExistAcount(), createAccountForCustomer);


module.exports = {
    accountRouter,
}