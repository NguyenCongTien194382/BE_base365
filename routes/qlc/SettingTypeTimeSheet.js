const router = require('express').Router();
const controller = require('../../controllers/qlc/SettingTypeTimeSheet')
const formData = require('express-form-data')
const functions = require("../../services/functions")

router.post("/get_type_timesheet", formData.parse(), functions.checkToken, controller.get_type_timesheet)
router.post("/update_type_timesheet", formData.parse(), functions.checkToken, controller.update_type_timesheet)


module.exports = router