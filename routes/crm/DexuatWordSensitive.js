const router = require('express').Router();
const formData = require("express-form-data");
const controllers = require("../../controllers/crm/DexuatSensitive");
const funtions = require('../../services/functions')

router.post('/DexuatWordSensitive', formData.parse(), controllers.DexuatWordSensitive);
router.post('/DuyetDexuatWordSensitive', formData.parse(), controllers.DuyetDexuatWordSensitive);
router.post('/TuchoiDexuatWordSensitive', formData.parse(), controllers.TuchoiDexuatWordSensitive);
router.post('/GetListWordSensitive', formData.parse(), controllers.GetListWordSensitive);
module.exports = router;