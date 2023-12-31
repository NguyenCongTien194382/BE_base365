const router = require('express').Router();
const controller = require('../../../controllers/DGNL/DeKTraNL/DeKiemTra');

var formData = require('express-form-data');
const functions = require('../../../services/functions')


router.get('/searchDeKT', functions.checkToken, controller.searchDeKT)
router.get('/showDeKT', functions.checkToken, controller.listDeKT)
router.get('/desDeKT/:id', controller.desDeKT)
router.get('/sinhDeTuDong', controller.sinhDeTuDong)
router.post('/addDeKT', functions.checkToken, formData.parse(), controller.addDeKT)
router.put('/updateDeKT', formData.parse(), controller.repairDeKT)
router.put('/xoaDeKT', formData.parse(), controller.xoaDeKT)
router.get('/getUserName', functions.checkToken, controller.getNameUser)
router.post('/autoRender', functions.checkToken, formData.parse(), controller.autoRender)
module.exports = router