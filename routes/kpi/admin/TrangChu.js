const router = require('express').Router();
const formData = require('express-form-data')
const functions = require("../../../services/functions")
const controllers = require('../../../controllers/kpi/admin/TrangChu');

// Tổng số KPI
router.post('/tongSoKpi', controllers.getTongSoKPI);


module.exports = router