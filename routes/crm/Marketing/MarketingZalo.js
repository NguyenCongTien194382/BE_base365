const router = require("express").Router();
const formData = require("express-form-data");
const Controllers = require("../../../controllers/crm/Marketing/MarketingZalo");
const functions = require("../../../services/functions")

//Lấy lịch sử gửi tin nhắn zalo
router.get('/getListHistory', functions.checkToken, formData.parse(), Controllers.getListHistory);

//Lấy chi tiết danh sách template zalo
router.get('/getListDetailTemplate', functions.checkToken, formData.parse(), Controllers.getListDetailTemplate);

//Lấy ds template zalo để gửi tin nhắn
router.get('/getListTemplate', functions.checkToken, formData.parse(), Controllers.getListTemplate);

//Gửi tin nhắn zalo
router.get('/sendMessageZalo', functions.checkToken, formData.parse(), Controllers.sendMessageZalo);

//Lấy số lượng tin nhắn đc gửi trong ngày, số lượng còn lại
router.get('/getQuota', functions.checkToken, formData.parse(), Controllers.getQuota);

//Thiết lập kết nối đến zalo
router.post('/managerZalo', functions.checkToken, formData.parse(), Controllers.managerZalo);

//Thiết lập kết nối đến zalo
router.get('/getInforZalo', functions.checkToken, formData.parse(), Controllers.getInforZalo);

//Api google map
// router.post('/takeLatLong',functions.checkToken, formData.parse(),Controllers.takeLatLong);
router.post('/takeLatLong', formData.parse(), Controllers.takeLatLong);

// router.post('/takeAddress', functions.checkToken, formData.parse(), Controllers.takeAddress);
router.post('/takeAddress', formData.parse(), Controllers.takeAddress);
module.exports = router;