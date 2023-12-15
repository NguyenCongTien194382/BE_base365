var express = require('express');
var router = express.Router();

var account = require('./giasu/updateInfo');
var teach = require('./giasu/tutor');
var parent = require('./giasu/parent');
// var tool =  require('./giasu/tools');
var AdminGS =  require('./giasu/AdminGS');


router.use('/account', account);
router.use('/tutor', teach);
router.use('/parent', parent);
// router.use('/tool', tool);
router.use('/admin', AdminGS);

module.exports = router;