var express = require('express');
var router = express.Router();
var tool = require('../routes/freelancer/tool');
var home = require('../routes/freelancer/home');
var company = require('../routes/freelancer/company');
var freelancer = require('../routes/freelancer/freelancer');
var admin = require('../routes/freelancer/admin');

router.use('/tool', tool);
router.use('/home', home);
router.use('/company', company);
router.use('/flc', freelancer);
router.use('/admin', admin);

module.exports = router;