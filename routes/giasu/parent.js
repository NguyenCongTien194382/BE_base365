var express = require('express');
var router = express.Router();
const controller = require('../../controllers/giasu/Parent');
const formData = require('express-form-data');
const functions = require('../../services/functions');

//dang tin
router.post('/postFindTeacher', functions.checkToken, formData.parse(), controller.post);
//sua dang tin
router.post('/edit', functions.checkToken, formData.parse(), controller.editPost);
//cho phep tim kiem
router.post('/allowSearchTeacher', functions.checkToken, formData.parse(), controller.allowSearchTeacher);
//lam moi gia su
router.post('/refreshTeacher', functions.checkToken, formData.parse(), controller.refreshTeacher);
//lam moi lop hoc
router.post('/refreshClass', functions.checkToken, formData.parse(), controller.refreshClass);
//xoa thong bao
router.post('/deleteNoti', functions.checkToken, formData.parse(), controller.deleteNoti);
//xoa lời mời dạy
router.post('/deleteInvite', functions.checkToken, formData.parse(), controller.deleteInvite);
//PH mời GS
router.post('/ParentInvite', functions.checkToken, formData.parse(), controller.ParentInvite);
//kiem tra tieu de
router.post('/checkTittle', functions.checkToken, formData.parse(), controller.checkTittle);
//cap nhat trang thai lop hoc
router.post('/updateStatus', functions.checkToken, formData.parse(), controller.updateStatus);
//Cập nhật trạng thái gia sư
router.post('/updateStatusTeach', functions.checkToken, formData.parse(), controller.updateStatusTeach);
//huy luu Gia Su
router.post('/unsaveTeacher', functions.checkToken, formData.parse(), controller.unsave_teacher);
// luu Gia Su
router.post('/saveTeacher', functions.checkToken, formData.parse(), controller.saveTeacher);
// đồng ý đề nghị dạy
router.post('/confirmInvite', functions.checkToken, formData.parse(), controller.confirmInvite);
// từ chối đề nghị dạy
router.post('/refuseOffer', functions.checkToken, formData.parse(), controller.refuseOffer);
//danh sach thanh pho
router.post('/listCity', formData.parse(), controller.listCity);
//danh sach quan huyen
router.post('/listDistrict', formData.parse(), controller.listDistrict);
//danh sach lop hoc
router.post('/listClassTeach', formData.parse(), controller.listClassTeach);
//danh sach mon hoc
router.post('/listAllSubject', formData.parse(), controller.listAllSubject);

//
router.post('/listLeverClass', formData.parse(), controller.listLeverClass);
//chi tiet
router.post('/detail', functions.checkToken, formData.parse(), controller.detail);
//danh sách lớp học
router.post('/listClass', functions.checkToken, formData.parse(), controller.listClass);
//danh sách gia su da moi
router.post('/listInviteTeach', functions.checkToken, formData.parse(), controller.listInviteTeach);
//danh sách gia su tu diem loc
router.post('/listPoint', functions.checkToken, formData.parse(), controller.listPoint);
//danh sách gia sư đã lưu
router.post('/listSaved', functions.checkToken, formData.parse(), controller.listSaved);
//danh sách trang chủ QLC PH
router.post('/QLCParent', functions.checkToken, formData.parse(), controller.QLCParent);
//thêm bình luận và đánh giá
router.post('/addComment', functions.checkToken, formData.parse(), controller.addComment);
//Điểm phụ huynh
router.post('/PointParent', functions.checkToken, formData.parse(), controller.PointParent);
//cap nhat diểm phụ huynh
router.post('/UpdatePointParent', functions.checkToken, formData.parse(), controller.UpdatePointParent);
//danh sách dành cho phu huynh
router.post('/homePagefilterTeach', formData.parse(), controller.homePagefilterTeach);
//danh sách dành cho gia su
router.post('/homePagefilterPost', formData.parse(), controller.homePagefilterPost);
//danh sách trang chủ filter gia sư
router.post('/homePage', formData.parse(), controller.homePage);

module.exports = router;