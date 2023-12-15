var express = require('express');
var router = express.Router();
var formData = require('express-form-data');
var functions = require('../../services/functions');
var flcService = require('../../services/freelancer/functions');
var company = require('../../controllers/freelancer/company');

//quan ly chung
router.post('/generalManagement', functions.checkToken, flcService.checkCompany, formData.parse(), company.generalManagement);
router.post('/refreshJob', functions.checkToken, flcService.checkCompany, formData.parse(), company.refreshJob);

//xem thong tin lien he
router.post('/seeContactInfo', functions.checkToken, flcService.checkCompany, formData.parse(), company.seeContactInfo);

//dang tin tuyen dung
router.post('/createJob', functions.checkToken, flcService.checkCompany, formData.parse(), company.createJob);

//tin da dang
router.post('/getListJob', functions.checkToken, flcService.checkCompany, formData.parse(), company.getListJob);
router.post('/updateJob', functions.checkToken, flcService.checkCompany, formData.parse(), company.updateJob);

//tim freelancer
router.post('/getListFreelancer', functions.checkToken, flcService.checkCompany, formData.parse(), company.getListFreelancer);

//quan ly ho so
router.post('/listFreelancerSetPrice', functions.checkToken, flcService.checkCompany, formData.parse(), company.listFreelancerSetPrice);
router.post('/acceptOrCancelFreelancer', functions.checkToken, flcService.checkCompany, formData.parse(), company.acceptOrCancelFreelancer);

router.post('/changeStatusFreelancer', functions.checkToken, flcService.checkCompany, formData.parse(), company.changeStatusFreelancer);
router.post('/evaluateFreelancer', functions.checkToken, flcService.checkCompany, formData.parse(), company.evaluateFreelancer);

router.post('/listFreelancerSave', functions.checkToken, flcService.checkCompany, formData.parse(), company.listFreelancerSave);
router.post('/saveFreelancer', functions.checkToken, flcService.checkCompany, formData.parse(), company.saveFreelancer);
router.post('/deleteSaveFreelancer', functions.checkToken, flcService.checkCompany, formData.parse(), company.deleteSaveFreelancer);

//quan ly tai khoan
router.post('/getInfoCompany', functions.checkToken, flcService.checkCompany, formData.parse(), company.getInfoCompany);
router.post('/updateAvatarCompany', functions.checkToken, flcService.checkCompany, formData.parse(), company.updateAvatarCompany);
router.post('/updateInfoCompany', functions.checkToken, flcService.checkCompany, formData.parse(), company.updateInfoCompany);
router.post('/changePassword', functions.checkToken, flcService.checkCompany, formData.parse(), company.changePassword);
router.post('/updateLogoCompany', functions.checkToken, flcService.checkCompany, formData.parse(), company.updateLogoCompany);
module.exports = router;