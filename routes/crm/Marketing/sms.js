const router = require("express").Router();
const formData = require("express-form-data");
const controllers = require("../../../controllers/crm/Marketing/Sms");
const functions = require('../../../services/functions');
const crmServices = require("../../../services/CRM/CRMservice");

//them moi email toi khach hang
// router.post("/createSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.createEmail);

//them moi mau email
router.post("/createSampleSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.createSampleSms);

router.post("/listSampleSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.listSampleSms);

router.post("/updateSampleSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.updateSampleSms);

router.post("/deleteSoftSampleSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.deleteMany);

router.post("/createSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.createSms);

router.post("/listSms", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.listSms);

module.exports = router;