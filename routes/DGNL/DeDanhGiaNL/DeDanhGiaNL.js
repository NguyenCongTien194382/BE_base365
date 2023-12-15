const router = require('express').Router();
const controller = require('../../../controllers/DGNL/DeDanhGiaNL/DeDanhGiaNL');

var formData = require('express-form-data');
const functions = require('../../../services/functions')

router.post('/addDe', functions.checkToken, formData.parse(), controller.addDe)
router.post('/listDeDG', functions.checkToken, formData.parse(), controller.listDeDG)
router.get('/nameDeDG', functions.checkToken, formData.parse(), controller.listNameDe)
router.patch('/changeDeDG', functions.checkToken, formData.parse(), controller.changeDeDG)
router.get('/desDeDG/:id', functions.checkToken, controller.desDeDG)
router.patch('/xoaDeDG', functions.checkToken, formData.parse(), controller.XoaDe)
router.post('/laythangdiem', functions.checkToken, formData.parse(), controller.ThangDiem)
module.exports = router