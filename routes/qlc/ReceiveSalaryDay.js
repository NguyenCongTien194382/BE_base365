const router = require('express').Router();
const controller = require('../../controllers/qlc/ReceiveSalaryDay')
const formData = require('express-form-data')
const functions = require("../../services/functions")

router.post("/getReceiveSalaryDay", functions.checkToken, formData.parse(), controller.getReceiveSalaryDay);

module.exports = router