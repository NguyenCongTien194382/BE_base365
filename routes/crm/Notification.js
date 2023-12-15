const router = require("express").Router();
const formData = require("express-form-data");
const functions = require("../../services/functions");
const controllers = require("../../controllers/crm/Notication/Notication");
const crmServices = require("../../services/CRM/CRMservice");
router.post(
  "/create_notification",
  functions.checkToken,
  formData.parse(),
  crmServices.checkTypeRole(),
  controllers.createNotification
);
router.post(
  "/list_notification",
  functions.checkToken,
  formData.parse(),
  crmServices.checkTypeRole(),
  controllers.listNotification
);
router.post(
  "/read_one_notification",
  functions.checkToken,
  formData.parse(),
  crmServices.checkTypeRole(),
  controllers.readOneNotification
);
router.post(
  "/read_all_notification",
  functions.checkToken,
  formData.parse(),
  crmServices.checkTypeRole(),
  controllers.readAllNotification
);
router.post(
  "/delete_notification",
  functions.checkToken,
  formData.parse(),
  crmServices.checkTypeRole(),
  controllers.deleteNotification
);
module.exports = router;
