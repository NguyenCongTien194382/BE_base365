var express = require('express');
var router = express.Router();
var tool = require('../../controllers/freelancer/tool');

router.post('/admin', tool.admin);
router.post('/admin_modules', tool.admin_modules);
router.post('/admin_user', tool.admin_user);
router.post('/blog', tool.blog);
router.post('/category', tool.category);
router.post('/flc_price_setting', tool.flc_price_setting);
router.post('/flc_save_job', tool.flc_save_job);
router.post('/jobs', tool.jobs);
router.post('/otp', tool.otp);
router.post('/point', tool.point);
router.post('/point_log', tool.point_log);
router.post('/post_city', tool.post_city);

router.post('/post_city_category', tool.post_city_category);
router.post('/proficiency', tool.proficiency);
router.post('/refresh_token', tool.refresh_token);
router.post('/role_module', tool.role_module);
router.post('/save_flc', tool.save_flc);
router.post('/skills', tool.skills);
router.post('/table_exp', tool.table_exp);
router.post('/tb_list_thong_bao', tool.tb_list_thong_bao);
router.post('/thong_bao', tool.thong_bao);
router.post('/user_views', tool.user_views);
router.post('/vote', tool.vote);
router.post('/work_type', tool.work_type);
router.post('/city', tool.city);
router.post('/city2', tool.city2);

module.exports = router;