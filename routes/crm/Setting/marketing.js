const router = require("express").Router();
const controller = require("../../../controllers/crm/Setting/marketing");
const formData = require("express-form-data");
const functions = require('../../../services/functions');

//cai dat email
router.post("/settingEmail", functions.checkToken, formData.parse(), controller.settingEmail);
router.post("/settingSms", functions.checkToken, formData.parse(), controller.settingSms);

module.exports = router;