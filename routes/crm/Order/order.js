const router = require("express").Router()
const formData = require("express-form-data")
const functions = require('../../../services/functions')
const crmServices = require("../../../services/CRM/CRMservice")
const controllers = require("../../../controllers/crm/Order/order")

router.post('/add-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.addOrder);
router.post('/edit-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.editOrder);
router.post('/delete-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteOrder);
router.post('/list-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listOrder);
router.post('/detail-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.detailOrder);
router.post('/add-product-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.addProductOrder);
router.post('/list-product-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listProductOrder);
router.post('/del-product-order',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteProductOrder);


module.exports = router