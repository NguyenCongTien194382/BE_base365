const router = require('express').Router();
const controller = require('../../controllers/qlc/NotifyTimekeeping')
const formData = require('express-form-data')
const functions = require("../../services/functions")


router.post("/update", formData.parse(), functions.checkToken, controller.update)
router.post("/getData", formData.parse(), functions.checkToken, controller.getData)


module.exports = router