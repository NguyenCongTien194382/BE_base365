const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/ThietLapKPI');

// Cập nhật tổ chức
router.post('/capNhatTC', functions.checkToken, formData.parse(), controllers.capNhatTC);

//Lấy danh sách tổ chức
router.post('/getListManager', functions.checkToken, formData.parse(), controllers.getListManager);

//Thêm nhóm KPI mới
router.post('/addNewGroupKPI', functions.checkToken, formData.parse(), controllers.addNewGroupKPI);

//Lấy danh sách nhóm KPI mới
router.post('/getListManagerNewGroup', functions.checkToken, formData.parse(), controllers.getListManagerNewGroup);

//Cập nhật nhóm KPI mới
router.post('/capNhatNewGroupKPI', functions.checkToken, formData.parse(), controllers.capNhatNewGroupKPI);

//Xóa nhóm KPI mới
router.post('/deleteNewGroupKPI', functions.checkToken, formData.parse(), controllers.deleteNewGroupKPI);

//Lấy danh sách viễn cảnh
router.post('/getListUnit', functions.checkToken, formData.parse(), controllers.getListUnit);

//Thêm mới chỉ tiêu
router.post('/addUnit', functions.checkToken, formData.parse(), controllers.addUnit);

//Cập nhật chỉ tiêu
router.post('/updateUnit', functions.checkToken, formData.parse(), controllers.updateUnit);

module.exports = router