const express = require("express");

const {  } = require("../controllers/insurance.controllers");
const { } = require("../middlewares/validates/checkExist");
const { authorize } = require("../middlewares/auth/authorize.js")
const { authenticate } = require("../middlewares/auth/authenticate.js")
const insuranceRouter = express.Router();

module.exports = {
    insuranceRouter,
}