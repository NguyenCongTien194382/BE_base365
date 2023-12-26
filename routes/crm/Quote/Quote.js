const express = require('express');
const router = express.Router();
var formData = require('express-form-data');
const functions = require("../../../services/functions");
const crmServices = require("../../../services/CRM/CRMservice")
const controllers = require('../../../controllers/crm/Quote/Quote')
const history = require('../../../controllers/crm/Quote/QuoteHistory')
const files = require('../../../controllers/crm/Quote/QuoteFile')

router.post('/create', functions.checkToken, formData.parse(), controllers.create)
router.post('/list', functions.checkToken, formData.parse(), controllers.list)
router.post('/getDetail', functions.checkToken, formData.parse(), controllers.getDetail)
router.post('/update', functions.checkToken, formData.parse(), controllers.update)
router.post('/updateStatus', functions.checkToken, formData.parse(), controllers.updateStatus)
router.post('/delete', functions.checkToken, formData.parse(), controllers.delete)

router.post('/getQuoteHistory', functions.checkToken, formData.parse(), history.getQuoteHistory)

router.post('/create-attachment', functions.checkToken, formData.parse(), crmServices.checkTypeRole(), files.createQuoteFile)
router.post('/list-attachment', functions.checkToken, formData.parse(), crmServices.checkTypeRole(), files.listQuoteFile)
router.post('/delete-attachment', functions.checkToken, formData.parse(), crmServices.checkTypeRole(), files.deleteQuoteFile)

module.exports = router;