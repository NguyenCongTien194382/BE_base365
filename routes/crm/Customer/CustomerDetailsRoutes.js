const express = require('express');
const router = express.Router();
var formData = require('express-form-data');
const CustomerDetailsRoutes = require('../../../controllers/crm/Customer/CustomerDetails')
const functions = require("../../../services/functions");

//Api hiển thị chi tiết khách hàng 
router.post("/detail", functions.checkToken, formData.parse(), CustomerDetailsRoutes.detail)

//Api sửa khách hàng + thêm lịch sử trợ lý khách hàng
router.post('/editCustomer', functions.checkToken, formData.parse(), CustomerDetailsRoutes.editCustomer);

//Api sửa khách hàng + thêm lịch sử trợ lý khách hàng không cần token để server khác call
router.post('/editCustomer_v2', formData.parse(), CustomerDetailsRoutes.editCustomer);

//Api cập nhật nội dung cuộc gọi từ server 185
router.post('/updateContentCall', formData.parse(), CustomerDetailsRoutes.updateContentCall);


//Api hiển thị lịch sử cuộc chăm sóc khách hàng
router.post('/showHisCus', functions.checkToken, formData.parse(), CustomerDetailsRoutes.showHisCus)


//Api bàn giao khách hàng
router.post('/bangiao', functions.checkToken, formData.parse(), CustomerDetailsRoutes.banGiao)


//Api chia sẻ khách hàng 
router.post('/shareCustomer', functions.checkToken, formData.parse(), CustomerDetailsRoutes.ShareCustomer)


//Api hiển thị danh sách - chi tiết của những  khách hàng đã chọn 
router.post('/ChosseCustomer', functions.checkToken, formData.parse(), CustomerDetailsRoutes.ChosseCustomer)


//Api gộp trùng khách hàng
router.post('/combineCustome', functions.checkToken, formData.parse(), CustomerDetailsRoutes.CombineCustome)

//APi kiem tra trung KH
router.post('/search-customer-same', functions.checkToken, formData.parse(), CustomerDetailsRoutes.CheckCompareMerging)

//Api lấy ds khách hàng chưa gọi điện, không nghe máy
router.post('/getListCustomerAnswer', formData.parse(), CustomerDetailsRoutes.GetListCustomerAnswer)

//Api lấy chi tiết ntd từ mxh
router.post('/GetDetailCustomerSocial', functions.checkToken, formData.parse(), CustomerDetailsRoutes.GetDetailCustomerSocial)

// API them chien dich cho KH
router.post('/add-campaign-customer',functions.checkToken,formData.parse(),CustomerDetailsRoutes.addCampaignForCustomer)

module.exports = router;