var express = require('express');
var router = express.Router();
var admin = require('../../controllers/freelancer/admin');
var formData = require('express-form-data');
const functions = require('../../services/functions');
const flcService = require('../../services/freelancer/functions');

//dang nhap
router.post('/loginAdmin', formData.parse(), admin.loginAdmin);
router.post('/changePasswordAdmin', formData.parse(), admin.changePasswordAdmin);

//quan ly tag
router.post('/listTag', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.listTag);
router.post('/createTag', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.createTag);
router.post('/updateTag', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.updateTag);

//bai viet
router.post('/baiVietTinhThanh', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.baiVietTinhThanh);
router.post('/updateBaiVietTinhThanh', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.updateBaiVietTinhThanh);

router.post('/baiVietLinhVuc', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.baiVietLinhVuc);
router.post('/updateBaiVietLinhVuc', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.updateBaiVietLinhVuc);

router.post('/baiVietTag', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.baiVietTag);
router.post('/updateBaiVietTag', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.updateBaiVietTag);

router.post('/baiVietCityTag', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.baiVietCityCate);
router.post('/baiVietCityCate', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.baiVietCityCate);
router.post('/updateBaiVietCityCate', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.updateBaiVietCityCate);

// tin dang
router.post('/getListJob', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.getListJob);
router.post('/duyetTin', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.duyetTin);
router.post('/updateJob', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.updateJob);
router.post('/createJob', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.createJob);

//nap diem
router.post('/napDiem', functions.checkToken, flcService.checkAdmin, formData.parse(), admin.napDiem);


module.exports = router;