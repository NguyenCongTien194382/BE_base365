const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/QuanLyToChuc');

// Lây danh sách tổ chức
router.post('/getListTC', functions.checkToken, formData.parse(), controllers.getListTC);

//Thêm mới tổ chức
router.post('/create', functions.checkToken, formData.parse(), controllers.create);


module.exports = router