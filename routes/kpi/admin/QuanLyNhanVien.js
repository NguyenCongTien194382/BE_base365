const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/QuanLyNhanVien');

//Lấy danh sách nhân viên
router.post('/getListNV', functions.checkToken, formData.parse(), controllers.getListNV);
router.post('/addListNV', functions.checkToken, formData.parse(), controllers.addListNV);
router.post('/addNewNV', functions.checkToken, formData.parse(), controllers.addNewNV);

module.exports = router
