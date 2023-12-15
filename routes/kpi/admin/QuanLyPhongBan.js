const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/QuanLyPhongBan');

// Lây danh sách phòng ban
router.post('/getListPB', functions.checkToken, formData.parse(), controllers.getListPB);
// Lây danh sách tổ
router.post('/getListTo', functions.checkToken, formData.parse(), controllers.getListTo);
// Lây danh sách nhóm
router.post('/getListNhom', functions.checkToken, formData.parse(), controllers.getListNhom);
//Lấy danh sách nhân viên
router.post('/getListNV', functions.checkToken, formData.parse(), controllers.getListNV);


module.exports = router