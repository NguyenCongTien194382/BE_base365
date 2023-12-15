const router = require("express").Router()
const formData = require("express-form-data")
const functions = require('../../../services/functions')
const crmServices = require("../../../services/CRM/CRMservice")
const controllers = require("../../../controllers/crm/Chance/chance")

router.post('/add-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.create_Chance);
router.post('/edit-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.update_chance);
router.post('/delete-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteChange);
router.post('/list-history-stages-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listHistoryStagesChance);
router.post('/list-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listChance);
router.post('/detail-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.detailChance);
router.post('/add-product-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.addProductChance);
router.post('/list-product-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listProductChance);
router.post('/delete-product-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteProductChance);

// Attachment
router.post('/create-attachment-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.createChanceAttachment);
router.post('/list-attachment-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listAttachment);
router.post('/delete-attachment-chance',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteAttachment);



module.exports = router