const router = require("express").Router()
const formData = require("express-form-data")
const functions = require('../../../services/functions')
const crmServices = require("../../../services/CRM/CRMservice")
const controllers = require("../../../controllers/crm/Bill/bill")

router.post('/add-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.addBill);
router.post('/edit-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.editBill);
router.post('/delete-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteBill);
router.post('/list-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listBill);
router.post('/detail-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.detailBill);
// router.post('/add-product-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.addProductBill);
// router.post('/list-product-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.listProductBill);
router.post('/del-product-bill',functions.checkToken,formData.parse(), crmServices.checkTypeRole(), controllers.deleteProductBill);


module.exports = router