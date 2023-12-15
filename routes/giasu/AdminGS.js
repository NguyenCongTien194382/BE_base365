var express = require('express');
var router = express.Router();
const controller =  require('../../controllers/giasu/AdminGS');
const formData = require("express-form-data")
const functions = require('../../services/functions');


//them tai khoan admin
router.post('/add_user_admin',functions.checkToken, formData.parse(), controller.add_user_admin);
// sửa tài khoản admin
router.post('/edit_user_admin',functions.checkToken, formData.parse(), controller.edit_user_admin);
//danh sách tên quyền
router.post('/list_Modules', formData.parse(), controller.list_Modules);
//thêm quyền
router.post('/add_Modules', formData.parse(), controller.add_Modules);
//danh sách admin
router.post('/list_user_admin',functions.checkToken, formData.parse(), controller.list_user_admin);

//danh sách phụ huynh
router.post('/ListParent',functions.checkToken, formData.parse(), controller.ListParent);

//danh sách gia sư
router.post('/ListTeach',functions.checkToken, formData.parse(), controller.ListTeach);

//danh sách PH chưa hoàn thành hồ sơ
router.post('/ListParentNotComplete',functions.checkToken, formData.parse(), controller.ListParentNotComplete);

//danh sách GS chưa hoàn thành hồ sơ
router.post('/ListTeachNotComplete',functions.checkToken, formData.parse(), controller.ListTeachNotComplete);

//danh sách GS cập nhật gần đây
router.post('/ListTeachRecentUpdate',functions.checkToken, formData.parse(), controller.ListTeachRecentUpdate);

//danh sách Ph chưa đăng tin
router.post('/ListParentHaveNoPost',functions.checkToken, formData.parse(), controller.ListParentHaveNoPost);

//danh sach lop hoc
router.post('/ListClass',functions.checkToken, formData.parse(), controller.ListClass);

//thêm môn học
router.post('/add_subject',functions.checkToken, formData.parse(), controller.add_subject);

//chỉnh sửa môn học
router.post('/edit_subject',functions.checkToken, formData.parse(), controller.edit_subject);

// danh sách môn học
router.post('/list_subject',functions.checkToken, formData.parse(), controller.list_subject);

//thêm tag
router.post('/list_add_tags',functions.checkToken, formData.parse(), controller.list_add_tags);

//thêm bài viết quận huyện
router.post('/list_add_post_gsDistrict',functions.checkToken, formData.parse(), controller.list_add_post_gsDistrict);

//Sửa bài viết quận huyện
router.post('/edit_post_gsDistrict',functions.checkToken, formData.parse(), controller.edit_post_gsDistrict);

//danh sách bài viết quận huyện
router.post('/list_post_gsDistrict',functions.checkToken, formData.parse(), controller.list_post_gsDistrict);

//thêm bài viết tỉnh thành
router.post('/list_add_post_gsCity',functions.checkToken, formData.parse(), controller.list_add_post_gsCity);

//Sửa bài viết tỉnh thành
router.post('/edit_post_gsCity',functions.checkToken, formData.parse(), controller.edit_post_gsCity);

//danh sách bài viết tỉnh thành
router.post('/list_post_gsCity',functions.checkToken, formData.parse(), controller.list_post_gsCity);

//thêm bài viết tag
router.post('/add_post_tag',functions.checkToken, formData.parse(), controller.add_post_tag);

//Sửa bài viết tag
router.post('/edit_post_tag',functions.checkToken, formData.parse(), controller.edit_post_tag);

//danh sách bài viết tag
router.post('/list_post_tag',functions.checkToken, formData.parse(), controller.list_post_tag);

//thêm bài viết theo cấp
router.post('/add_post_level_class',functions.checkToken, formData.parse(), controller.add_post_level_class);

//Sửa bài viết theo cấp
router.post('/edit_post_level_class',functions.checkToken, formData.parse(), controller.edit_post_level_class);

//danh sách bài viết theo cấp
router.post('/list_post_level_class',functions.checkToken, formData.parse(), controller.list_post_level_class);

//thêm bài viết theo môn
router.post('/add_post_subject',functions.checkToken, formData.parse(), controller.add_post_subject);

//Sửa bài viết theo môn
router.post('/edit_post_subject',functions.checkToken, formData.parse(), controller.edit_post_subject);

//danh sách bài viết theo môn
router.post('/list_post_subject',functions.checkToken, formData.parse(), controller.list_post_subject);

//thêm hoặc sửa bài viết trang chủ
router.post('/add_new_home',functions.checkToken, formData.parse(), controller.add_new_home);

//xem bài viết trang chủ
router.post('/list_new_home',functions.checkToken, formData.parse(), controller.list_new_home);

//thêm hoặc sửa bài viết phụ huynh
router.post('/add_post_parent',functions.checkToken, formData.parse(), controller.add_post_parent);

//xem bài viết phụ huynh
router.post('/list_post_parent',functions.checkToken, formData.parse(), controller.list_post_parent);




module.exports = router;