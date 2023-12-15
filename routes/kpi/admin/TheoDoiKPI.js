const router = require('express').Router();
const formData = require('express-form-data');
const functions = require('../../../services/functions');
const controllers = require('../../../controllers/kpi/admin/TheoDoiKPI');

//Thêm KPI
// router.post('/addSingleKPI', functions.checkToken, formData.parse(), controllers.addSingleKPI);

//Thêm KPI đơn mục tiêu cá nhân
router.post('/addSingleKPIPersonal', functions.checkToken, formData.parse(), controllers.addSingleKPIPersonal);

//Chỉnh sửa KPI đơn mục tiêu cá nhân
router.post('/editSingleKPIPersonal', functions.checkToken, formData.parse(), controllers.editSingleKPIPersonal);

//Chi tiết KPI đơn mục tiêu cá nhân
router.post('/detailSingleKPIPersonal', functions.checkToken, formData.parse(), controllers.detailSingleKPIPersonal);

//Thêm KPI đơn mục tiêu công ty
router.post('/addSingleKPICompany', functions.checkToken, formData.parse(), controllers.addSingleKPICompany);

//Chỉnh sửa KPI đơn mục tiêu công ty
router.post('/editSingleKPICompany', functions.checkToken, formData.parse(), controllers.editSingleKPICompany);

//Chi tiết KPI đơn mục tiêu công ty
router.post('/detailSingleKPICompany', functions.checkToken, formData.parse(), controllers.detailSingleKPICompany);

//Thêm KPI đơn mục tiêu nhóm mới
router.post('/addSingleKPINewGroup', functions.checkToken, formData.parse(), controllers.addSingleKPINewGroup);

//Chỉnh sửa KPI đơn mục tiêu nhóm mới
router.post('/editSingleKPINewGroup', functions.checkToken, formData.parse(), controllers.editSingleKPINewGroup);

//Thêm KPI đơn mục tiêu tổ chức
router.post('/addSingleKPIOrganization', functions.checkToken, formData.parse(), controllers.addSingleKPIOrganization);

//Chỉnh sửa KPI đơn mục tiêu tổ chức
router.post(
    '/editSingleKPIOrganization',
    functions.checkToken,
    formData.parse(),
    controllers.editSingleKPIOrganization
);

//Sao chép KPI đơn mục tiêu
router.post('/copySingleKPI', functions.checkToken, formData.parse(), controllers.copySingleKPI);

//Danh sách KPI đơn mục tiêu
router.post('/listSingleKPI', functions.checkToken, formData.parse(), controllers.listSingleKPI);

//Thêm kết quả cho KPI đơn mục tiêu
router.post('/addResultSingleKPI', functions.checkToken, formData.parse(), controllers.addResultSingleKPI);

//Giao KPI đơn mục tiêu cá nhân
router.post('/assignSingleKPI', functions.checkToken, formData.parse(), controllers.assignSingleKPI);

//Chi tiết kết quả KPI đơn mục tiêu
router.post('/listResultSingleKPI', functions.checkToken, formData.parse(), controllers.listResultSingleKPI);

//Danh sách KPI đa mục tiêu
router.post('/listKPIMultiTarget', functions.checkToken, formData.parse(), controllers.listKPIMultiTarget);

//Thêm KPI đa mục tiêu
router.post('/addKPIMultiTarget', functions.checkToken, formData.parse(), controllers.addKPIMultiTarget);

//Chỉnh sửa KPI đa mục tiêu
router.post('/editKPIMultiTarget', functions.checkToken, formData.parse(), controllers.editKPIMultiTarget);

//Copy KPI đa mục tiêu
router.post('/copyMultiKPI', functions.checkToken, formData.parse(), controllers.copyMultiKPI);

//Giao KPI đa mục tiêu cha
router.post('/assignKPIMultiParent', functions.checkToken, formData.parse(), controllers.assignKPIMultiParent);

//Chỉnh sửa giao KPI đa mục tiêu cha
router.post('/editAssignKPIMultiParent', functions.checkToken, formData.parse(), controllers.editAssignKPIMultiParent);

//Giao KPI đa mục tiêu con
router.post('/assignKPIMultiChild', functions.checkToken, formData.parse(), controllers.assignKPIMultiChild);

//Chỉnh sửa giao KPI đa mục tiêu con
router.post('/editAssignKPIMultiChild', functions.checkToken, formData.parse(), controllers.editAssignKPIMultiChild);

//Thêm kết quả KPI đa mục tiêu
router.post('/addResultMultiKPI', functions.checkToken, formData.parse(), controllers.addResultMultiKPI);

//Xác thực kết quả KPI
router.post('/accuracyResult', functions.checkToken, formData.parse(), controllers.accuracyResult);

//Thêm kết quả OKR
router.post('/addOkrResult', functions.checkToken, formData.parse(), controllers.addOkrResult);

//Chỉnh sửa kết quả
router.post('/editResult', functions.checkToken, formData.parse(), controllers.editResult);

//Chỉnh sửa kết quả Okr
router.post('/editOkrResult', functions.checkToken, formData.parse(), controllers.editOkrResult);

//Tiến độ KPI đa mục tiêu
router.post('/processKpiMultiTarget', functions.checkToken, formData.parse(), controllers.processKpiMultiTarget);

//Danh sách mục tiêu kết nối
router.post('/listConnTargetSingleKPI', functions.checkToken, formData.parse(), controllers.listConnTargetSingleKPI);

module.exports = router;