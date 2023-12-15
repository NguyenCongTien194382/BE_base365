var express = require('express');
var router = express.Router();
var admin = require('../../controllers/timviec/admin/admin');
var formData = require('express-form-data');
const functions = require('../../services/functions');
const { uploadFileUv } = require('../../services/timviec365/admin.js');
const { uploadFileUvInsert } = require('../../services/timviec365/admin.js');
var employer = require('../../controllers/timviec/admin/company');

// api đăng nhập
router.post('/check/login', formData.parse(), admin.login);

// api lấy dữ liệu modules
router.post('/getModules', formData.parse(), admin.getModules);

// api check quyền truy cập 
router.post('/check/accessmodule', formData.parse(), admin.accessmodule);
// api lấy dữ liệu admin qua adm_bophan
router.post('/getInfoAdminUser', formData.parse(), admin.getInfoAdminUser);

router.post('/translate', admin.translate);

// api lấy dữ liệu admin
router.post('/infor', formData.parse(), admin.infor);

router.post('/inforBophan', formData.parse(), admin.inforBophan);


router.post('/bophan/list', formData.parse(), admin.bophan_list);

// Công ty
router.post('/company/listing', formData.parse(), admin.listingCompany);


// api đăng ký admin
// router.post('/postNewAdmin', formData.parse(), admin.postAdmin);

// // api cập nhập admin
// router.post('/updateAdmin', functions.checkToken, formData.parse(), admin.updateAdmin);

// // api lấy thông tin chi tiết admin
// router.post('/getAdminDetail', functions.checkToken, formData.parse(), admin.getAdminDetail);

// // api lấy danh sách admin
// router.post('/getListAdmin', functions.checkToken, formData.parse(), admin.getListAdmin);

// // api xóa admin  
// router.post('/deleteAdmin', functions.checkToken, formData.parse(), admin.deleteAdmin);

// // api cập nhập active    
// router.post('/updateActive', functions.checkToken, formData.parse(), admin.updateActive);

// // api cập nhập password    
// router.post('/updatePassword', functions.checkToken, formData.parse(), admin.updatePassword);

// // luồng ứng viên
// const candidate = require('../../controllers/timviec/admin/candidate');
// // Danh sách ứng viên đăng ký mới
// router.post('/uv/list/register', formData.parse(), candidate.candi_register);
// // Danh sách ứng viên sửa, cập nhật hồ sơ
// router.post('/uv/list/update', formData.parse(), candidate.candi_update);
// // Ứng viên tải cv từ máy tính cá nhân
// router.post('/uv/list/checkProfile', formData.parse(), candidate.checkProfile);
// // duyệt hồ sơ ứng viên
// router.post('/uv/profile/active', formData.parse(), candidate.activeProfile);
// // xóa ứng viên
// router.post('/uv/delete', formData.parse(), candidate.delete);
// // ứng viên có điểm hồ sơ < 45
// router.post('/uv/list/percents', formData.parse(), candidate.percents);
// // ứng viên ứng tuyển ntd
// router.post('/uv/list/apply', formData.parse(), candidate.listApply);

router.post('/topupCredits', formData.parse(), functions.checkToken, admin.topupCredits);

// admin sửa hồ sơ ứng viên
router.post('/uv/updateCandiDate', uploadFileUv.fields([
    { name: "avatarUser" },
    { name: "cv" }
]), admin.updateCandiDate);

//Thông tin chi tiết ứng viên
router.post('/uv/infoCandidate', formData.parse(), admin.infoCandidate);

router.post('/uv/insertCandiDate', uploadFileUvInsert.fields([
    { name: "avatarUser" },
    { name: "cv" }
]), admin.insertCandiDate);


//admin làm mới hồ sơ ứng viên
router.post('/uv/RefreshProfile', formData.parse(), admin.RefreshProfile);

//Nhà tuyển dụng
//API lấy danh sách NTD đăng kí mới
router.post('/getListNewRegistrationNTD', formData.parse(), employer.getListNewRegistrationNTD);

module.exports = router;