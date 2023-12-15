const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/CaiDat');

//Danh sách nhật ký hoạt động
router.post('/listActivityDiary', functions.checkToken, formData.parse(), controllers.listActivityDiary);

//Xóa nhật ký hoạt động
router.post('/deleteActivityDiary', functions.checkToken, formData.parse(), controllers.deleteActivityDiary);

module.exports = router
