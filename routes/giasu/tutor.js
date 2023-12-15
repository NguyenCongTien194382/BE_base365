var express = require('express');
var router = express.Router();
const controller =  require('../../controllers/giasu/tutor');
const formData = require("express-form-data")
const functions = require('../../services/functions');


router.post('/updateTutor',functions.checkToken,formData.parse(),controller.updateTutor)

// quản lý chung gia sư
router.post('/QLC_GiaSu',functions.checkToken,formData.parse(),controller.QLC_GiaSu)

//danh sách phụ huynh mời dạy
router.post('/DS_PH_MoiDay',functions.checkToken,formData.parse(),controller.DS_PH_MoiDay)

//danh sách phụ huynh đề nghị dạy
router.post('/DS_PH_DeNghiDay',functions.checkToken,formData.parse(),controller.DS_PH_DeNghiDay)

// xác nhận lời mời dạy
router.post('/confirmInvite',functions.checkToken,formData.parse(),controller.confirmInvite)

// từ chối lời mời dạy
router.post('/refuseInvite',functions.checkToken,formData.parse(),controller.refuseInvite)

//danh sách phụ huynh đã lưu 
router.post('/DS_PH_DaLuu',functions.checkToken,formData.parse(),controller.DS_PH_DaLuu)

//xóa lưu phụ huynh
router.post('/deleteSaveParent',functions.checkToken,formData.parse(),controller.deleteSaveParent)

// danh sách lớp nhận dạy
router.post('/DS_Lop_Da_Nhan_Day',functions.checkToken,formData.parse(),controller.DS_Lop_Da_Nhan_Day)

// xóa lời mời dạy
router.post('/deleteInvite',functions.checkToken,formData.parse(),controller.deleteInvite)

// danh sách lớp đã lưu 
router.post('/DS_Lop_DaLuu',functions.checkToken,formData.parse(),controller.DS_Lop_DaLuu)

//xóa lưu lớp 
router.post('/deleteSaveClass',functions.checkToken,formData.parse(),controller.deleteSaveClass)

//đề nghị dạy
router.post('/offerTeach',functions.checkToken,formData.parse(),controller.offerTeach)

//lưu lớp học
router.post('/SaveCourse',functions.checkToken,formData.parse(),controller.SaveCourse)

//lưu Phụ huynh
router.post('/SaveParent',functions.checkToken,formData.parse(),controller.SaveParent)

//Danh sách Loại dạy
router.post('/typeteach',functions.checkToken,formData.parse(),controller.typeteach)

//danh sách lịch dạy
router.post('/teaching_schedule',functions.checkToken,formData.parse(),controller.teaching_schedule)

//danh sách thông tin dạy học của gia sư
router.post('/UserTeachInformation',functions.checkToken,formData.parse(),controller.UserTeachInformation)














module.exports = router;