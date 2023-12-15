const router = require('express').Router();
const functions = require("../../services/functions")
const controller = require("../../controllers/qlc/ConfirmTimeSheet")
var formData = require('express-form-data')

// danh sách chấm công trong ngày
router.post("/listTrackingEmp", formData.parse(), functions.checkToken, controller.listTrackingEmp)

// kiểm tra
router.post("/findChooseConfirm", formData.parse(), functions.checkToken, controller.findChooseConfirm)

// cài đặt duyệt : số cấp, hình thức, người duyệt
router.post("/setting", formData.parse(), functions.checkToken, controller.setting)

// chọn phê duyệt chấm công hoặc không (choose : 1-không, 2 có)
router.post("/settingChooseConfirm", formData.parse(), functions.checkToken, controller.settingChooseConfirm)

module.exports = router
