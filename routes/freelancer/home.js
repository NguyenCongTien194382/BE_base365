var express = require('express');
var router = express.Router();
var home = require('../../controllers/freelancer/home');
var formData = require('express-form-data');
var functions = require('../../services/functions');
var flcService = require('../../services/freelancer/functions');

//danh sach nganh nghe
router.post('/getListCategory', formData.parse(), home.getListCategory);
//danh sach ky nang
router.post('/getListSkill', formData.parse(), home.getListSkill);
//loai hinh lam viec
router.post('/getWorkType', formData.parse(), home.getWorkType);
//kinh nghiem lam viec
router.post('/getExperience', formData.parse(), home.getExperience);
//tinh thanh va quan huyen
router.post('/listCity', formData.parse(), home.listCity);

router.post('/getListJob', formData.parse(), home.getListJob);
router.post('/jobCity', formData.parse(), home.jobCity);
router.post('/detailJob', formData.parse(), home.detailJob);

router.post('/getListFreelancer', formData.parse(), home.getListFreelancer);
router.post('/coutFreelancer', formData.parse(), home.coutFreelancer);
router.post('/getJobByCity', formData.parse(), home.getJobByCity);

//freelancer sau dang nhap
router.post('/listFreelancerAfterLogin', functions.checkToken, flcService.checkCompany, formData.parse(), home.getListFreelancer);
router.post('/detailFreelancerAfterLogin', functions.checkToken, flcService.checkCompany, formData.parse(), home.getListFreelancer);

//job sau dang nhap
router.post('/listJobAfterLogin', functions.checkToken, flcService.checkFreelancer, formData.parse(), home.getListJob);
router.post('/detailJobAfterLogin', functions.checkToken, flcService.checkFreelancer, formData.parse(), home.detailJob);

//thong tin nha tuyen dung
router.post('/detailCompany', formData.parse(), home.detailCompany);
router.post('/detailCompanyAfterLogin', functions.checkToken, flcService.checkFreelancer, formData.parse(), home.detailCompany);

// api đăng kí
router.post('/register', formData.parse(), home.Register)
router.post('/getNotifi', functions.checkToken, formData.parse(), home.getNotifi);
router.post('/deleteNotifi', functions.checkToken, formData.parse(), home.deleteNotifi);

router.post('/createToken', formData.parse(), home.createToken)
module.exports = router;