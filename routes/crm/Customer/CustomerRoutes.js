const express = require('express');
const router = express.Router();
var formData = require('express-form-data');
const CustomerRoutes = require('../../../controllers/crm/Customer/Customer');
const functions = require("../../../services/functions");


//Api hiển thị và tìm kiếm 

router.post('/list', functions.checkToken, formData.parse(), CustomerRoutes.showKH)


// Api tìm kiếm trùng

router.post('/searchSame', functions.checkToken, formData.parse(), CustomerRoutes.searchSame)

//Api thêm mới khách hàng
router.post('/addCustomer', functions.checkToken, formData.parse(), CustomerRoutes.addCustomer);

//Api xoa khach hang

router.post('/deleteKH', functions.checkToken, formData.parse(), CustomerRoutes.DeleteKH)

//Api thêm mới kết nối Api
router.post("/addApiKH", functions.checkToken, formData.parse(), CustomerRoutes.addConnectCs)

//Api sửa kết nối Api
router.post('/editApi', functions.checkToken, formData.parse(), CustomerRoutes.editConnectCs)

//Api hiển thị Api
router.post('/showApi', functions.checkToken, formData.parse(), CustomerRoutes.ShowConnectCs)

// api kết nối từ các site về crm
router.post("/website/add", formData.parse(), CustomerRoutes.addFromWebsite);
router.post("/website/edit", formData.parse(), CustomerRoutes.editFromWebsite);
router.post("/update_time_called", formData.parse(), CustomerRoutes.update_time_called);

//Api thêm mới ntd từ mạng xã hội
router.post('/addCustomerSocial', formData.parse(), CustomerRoutes.addCustomerSocial);

//Api thêm mới khách hàng chuyển đổi số từ mạng xã hội
router.post('/addCustomerDigXSocial', formData.parse(), CustomerRoutes.addCustomerDigXSocial);

//Api thêm mới ntd từ các site khác
router.post('/addCustomerMXH', formData.parse(), CustomerRoutes.addCustomerMXH);

//Api thêm mới ntd từ chợ tốt
router.post('/addCustomerChoTot', formData.parse(), CustomerRoutes.addCustomerChoTot);

//thêmm mới NTD từ site vệ tinh
router.post("/addCustomerVT", functions.checkToken, formData.parse(), CustomerRoutes.addCustomerVT)

//thêmm liên hệ  khách hàng
router.post("/editCustomerVT", functions.checkToken, formData.parse(), CustomerRoutes.editCustomerVT)

//thêmm liên hệ  khách hàng
router.post("/deleteCustomerVT", formData.parse(), CustomerRoutes.deleteCustomerVT)

// Api thống kê ntd đăng ký mới từ mxh
router.post('/StatisticalRegisterSocial', functions.checkToken, formData.parse(), CustomerRoutes.StatisticalRegisterSocial); 4

// Api thống kê ntd đăng ký mới từ mxh
router.post('/StatisticalPostNewSocial', functions.checkToken, formData.parse(), CustomerRoutes.StatisticalPostNewSocial);
module.exports = router;