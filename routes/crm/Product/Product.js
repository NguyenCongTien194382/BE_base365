const router = require("express").Router()
const productController = require("../../../controllers/crm/Product/product")
const groupController = require("../../../controllers/crm/Product/product_group")
const unittController = require("../../../controllers/crm/Product/product_unit")
const formData = require("express-form-data")
const functions = require('../../../services/functions')
const crmServices = require("../../../services/CRM/CRMservice")

// Hang hoa
router.post('/add-product',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), productController.add);

router.post('/edit-product',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), productController.edit);

router.post('/del-product',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), productController.delete);

router.post('/show-product',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), productController.list);

router.post('/detail-product',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), productController.detail);

// Nhom hang hoa
router.post('/add-product-group',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), groupController.add);

router.post('/edit-product-group',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), groupController.edit);

router.post('/del-product-group',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), groupController.delete);

router.post('/show-product-group',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), groupController.listGr);

// don vi hang hoa
router.post('/add-product-unit',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), unittController.add);

router.post('/edit-product-unit',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), unittController.edit);

router.post('/del-product-unit',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), unittController.delete);

router.post('/show-product-unit',functions.checkToken,formData.parse(), crmServices.checkTypeRole([1]), unittController.listUnit);


module.exports = router