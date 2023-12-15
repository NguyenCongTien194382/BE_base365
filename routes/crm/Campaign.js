const router = require("express").Router();
const formData = require('express-form-data')
const functions = require('../../services/functions')
const controllers = require("../../controllers/crm/Campaign");
const crmServices = require("../../services/CRM/CRMservice")

router.post("/listCampaign", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.listCampaign);

router.post("/createCampaign", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.createCampaign);

router.post("/edit-campaign", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.editCampaign);

router.post("/delete-campaign", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.deleteCampaign);

router.post("/detail-campaign-cus", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.showDetailCustomer);

router.post("/update-status-campaign-cus", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.updateStatusCustomerCampaign);

router.post("/update-assignment-campaign-cus", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.assignmentCampaign);

// API xoa khach hang trong Chien dich
router.post("/delete-campaign-cus", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.delteCustomerCampaign);

// API hien thi chi tiet chien dich
router.post("/detail-campaign", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.showDetailCampaign);

// API thong ke thong so
router.post("/info-campaign", functions.checkToken, formData.parse(),crmServices.checkTypeRole(), controllers.getInfoAccordingChanceAndOrder);

//api danh sach chi se
router.post("/createShareCampaign", functions.checkToken, formData.parse(), controllers.createShareCampaign)
router.post("/listShareCampaign", functions.checkToken, formData.parse(), controllers.listShareCampaign)
router.post("/deleteShareCampaign", functions.checkToken, formData.parse(), controllers.deleteShareCampaign)


module.exports = router
