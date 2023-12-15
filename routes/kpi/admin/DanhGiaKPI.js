const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/DanhGiaKPI');

//Danh sách đánh giá KPI đơn mục tiêu
router.post('/listAssessSingleKPI', functions.checkToken, formData.parse(), controllers.listAssessSingleKPI);

//Chi tiết thưởng KPI đơn mục tiêu
router.post('/detailBonusSingleKPI', functions.checkToken, formData.parse(), controllers.detailBonusSingleKPI);

//Thiết lập thưởng KPI đơn mục tiêu
router.post('/settingBonusSingleKPI', functions.checkToken, formData.parse(), controllers.settingBonusSingleKPI);

//Xóa + Khôi phục thưởng KPI đơn mục tiêu
router.post('/deleteBonusSingleKPI', functions.checkToken, formData.parse(), controllers.deleteBonusSingleKPI);

//Sửa thưởng KPI đơn mục tiêu
router.post('/editBonusSingleKPI', functions.checkToken, formData.parse(), controllers.editBonusSingleKPI);

//Danh sách đánh giá KPI đa mục tiêu
router.post('/listAssessMultiKPI', functions.checkToken, formData.parse(), controllers.listAssessMultiKPI);

//Chi tiết thưởng KPI đa mục tiêu
router.post('/detailBonusMultiKPI', functions.checkToken, formData.parse(), controllers.detailBonusMultiKPI);

//Thiết lập thưởng KPI đa mục tiêu
router.post('/settingBonusMultiKPI', functions.checkToken, formData.parse(), controllers.settingBonusMultiKPI);

//Xóa + Khôi phục thưởng KPI đa mục tiêu
router.post('/deleteBonusMultiKPI', functions.checkToken, formData.parse(), controllers.deleteBonusMultiKPI);

//Sửa thưởng KPI đa mục tiêu
router.post('/editBonusMultiKPI', functions.checkToken, formData.parse(), controllers.editBonusMultiKPI);

//Thêm mới cấu hình đánh giá
router.post('/addConfigAssess', functions.checkToken, formData.parse(), controllers.addConfigAssess);

//Danh sách cấu hình đánh giá
router.post('/listConfigAssess', functions.checkToken, formData.parse(), controllers.listConfigAssess);

//Xóa cấu hình đánh giá
router.post('/deleteConfigAssess', functions.checkToken, formData.parse(), controllers.deleteConfigAssess);

//Chỉnh sửa cấu hình đánh giá
router.post('/editConfigAssess', functions.checkToken, formData.parse(), controllers.editConfigAssess);

//Chi tiết cấu hình đánh giá
router.post('/detailConfigAssess', functions.checkToken, formData.parse(), controllers.detailConfigAssess);

module.exports = router
