const router = require('express').Router();
const controller = require('../../../controllers/DGNL/Dulieuxoaganday/index');
const functions = require('../../../services/functions')
var formData = require('express-form-data');

router.get('/test',functions.checkToken, formData.parse(),controller.test)



module.exports = router