const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/PhanQuyen');

// Phân quyền cho nhân viên
router.post('/createDecentralization', functions.checkToken, formData.parse(), controllers.createDecentralization);
router.post('/getInfoRoleEmployee', functions.checkToken, formData.parse(), controllers.getInfoRoleEmployee);


module.exports = router