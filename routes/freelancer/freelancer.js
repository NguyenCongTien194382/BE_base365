var express = require('express');
var router = express.Router();
var formData = require('express-form-data');
var functions = require('../../services/functions');
var flcService = require('../../services/freelancer/functions');
var freelancer = require('../../controllers/freelancer/freelancer');

//quan ly chung
router.post('/getInfo', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.getInfo);
router.post('/updateInfo', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.updateInfo);
router.post('/updateAvatarFreelancer', formData.parse(), freelancer.updateAvatarFreelancer);
router.post('/updateIntro', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.updateIntro);
router.post('/updateCVMM', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.updateCVMM);
router.post('/getFlcSkill', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.getFlcSkill);
router.post('/updateSkill', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.updateSkill);

//du an dang thuc hien
router.post('/listJobWorking', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.listJobWorking);
router.post('/danhgiacongviec', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.danhgiacongviec);

//cong viec da luu
router.post('/listFlcSaveJob', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.listFlcSaveJob);
router.post('/flcSaveJob', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.flcSaveJob);
router.post('/flcDeleteSaveJob', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.flcDeleteSaveJob);

//thay doi mat khau
router.post('/changePassword', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.changePassword);

//dat gia
router.post('/datGia', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.datGia);
router.post('/hideSearch', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.hideSearch);
router.post('/updateAvatarAfterLogin', functions.checkToken, flcService.checkFreelancer, formData.parse(), freelancer.updateAvatarAfterLogin);

module.exports = router;