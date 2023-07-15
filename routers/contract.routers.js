const express = require("express");

const {} = require("../controllers/contract.controllers");

const contractRouter = express.Router();

contractRouter.get("/listContract")
contractRouter.get("/detail/:idContract")
contractRouter.delete("/deleteContract/:idContract")
contractRouter.edit("/editContract/:idContract")

module.exports = {
    contractRouter,
}