var express = require('express');
var router = express.Router();
const controller = require('../../controllers/giasu/updateInfo');
const formData = require('express-form-data');
const functions = require('../../services/functions');

//cập nhật thông tin phụ huynh
router.post('/updateInfoParent', functions.checkToken, formData.parse(), controller.updateInfoParent);
//lấy thông tin chi tiết phụ huynh
router.post('/detailParent', functions.checkToken, formData.parse(), controller.detailParent);
//cập nhật thông tin gia sư
router.post('/updateInfoTeacher', functions.checkToken, formData.parse(), controller.updateInfoTeacher);
//lấy thông tin chi tiết gia sư
router.post('/detailTeach', functions.checkToken, formData.parse(), controller.detailTeach);
//đăng kí tài khoản
router.post('/register', formData.parse(), controller.register);
//tool
router.post('/toolCrawDataSubject', formData.parse(), controller.toolCrawDataSubject);
router.post('/toolCrawDataTeachType', formData.parse(), controller.toolCrawDataTeachType);
router.post('/toolCrawDataGSLevelClass', formData.parse(), controller.toolCrawDataGSLevelClass);
router.post('/toolCrawDataClassTeach', formData.parse(), controller.toolCrawDataClassTeach);
router.post('/login', formData.parse(), controller.login);

module.exports = router;