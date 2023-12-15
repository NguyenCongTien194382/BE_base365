const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/SoDoKPI');

//Sơ đồ KPI đơn mục tiêu
router.post('/listSoDoKPI', functions.checkToken, formData.parse(), controllers.listSoDoKPI);

module.exports = router
