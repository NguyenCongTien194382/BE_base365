const router = require("express").Router();
const formData = require("express-form-data");
const controllers = require("../../../controllers/crm/Marketing/Email");
const functions = require('../../../services/functions');
const crmServices = require("../../../services/CRM/CRMservice");

//them moi email toi khach hang
router.post("/createEmail", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.createEmail);

//them moi mau email
router.post("/createSampleEmail", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.createSampleEmail);

router.post("/listSampleEmail", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.listSampleEmail);

router.post("/updateSampleEmail", functions.checkToken, formData.parse(), crmServices.checkTypeRole(),  controllers.updateSampleEmail);


module.exports = router;