const router = require('express').Router();
const controller = require('../../../controllers/DGNL/DeKTraNL/DanhSachCauHoi');

var formData = require('express-form-data');
const functions = require('../../../services/functions')
const Storage = require('../../../controllers/DGNL/Storage')


// lay cac cau hoi
router.post('/showQues', functions.checkToken, formData.parse(), controller.listQues)
//lay ten cac cau hoi
router.get('/searchQues', functions.checkToken, controller.searchCH)


router.post('/addQues', functions.checkToken, formData.parse(), controller.addQues)

// lay chi tiet cau hoi
router.get('/detailQues/:id', functions.checkToken, controller.detailQues)
router.patch('/updateQues', functions.checkToken, formData.parse(), controller.changeQues)
router.patch('/deleteQues', functions.checkToken, formData.parse(), controller.deleteQues)
router.post('/uploadMultiple', Storage.any('files'), formData.parse(), controller.uploadMutiple)
router.get('/tenLoaiCauHoi', functions.checkToken, controller.tenLoaiCauHoi)

// danh sach cau hoi trac nghiem
router.get('/dsTracnghiem', functions.checkToken, controller.DsTracnghiem)
// router.post('/dsTracnghiemRender',functions.checkToken,controller.DsTracnghiemRender)
// danh sach cau hoi tu luan
router.get('/dsTuluan', functions.checkToken, controller.DsTuluan)
module.exports = router