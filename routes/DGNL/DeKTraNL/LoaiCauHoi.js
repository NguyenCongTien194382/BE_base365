const router = require('express').Router();
const controller = require('../../../controllers/DGNL/DeKTraNL/LoaiCauHoi');

var formData = require('express-form-data');
const functions = require('../../../services/functions')

// lấy danh sách loại câu hỏi.
router.post('/listTypeQues', functions.checkToken, formData.parse(), controller.listTypeQues)
router.post('/searchTypeQues', controller.searchLoai)
router.get('/getNameList', functions.checkToken, controller.getNameList)
router.patch('/deleteQues', controller.deleteItem)
router.post('/addItem', functions.checkToken, formData.parse(), controller.addItem)
router.patch('/changeItem', formData.parse(), controller.changeItem)
module.exports = router