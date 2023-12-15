const express = require('express');
const router = express.Router();
const formData = require("express-form-data")
const upload = require('../../services/giaoviec365/upload')
const ProjectController = require('../../controllers/giaoviec365/ProjectController')
const functions = require('../../services/functions')
const gv = require('../../services/giaoviec365/gvService')

router.post('/quan-ly-du-an-theo-danh-sach-cong-viec/them-du-an', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themDuAn)
router.post('/quan-ly-du-an-theo-danh-sach-cong-viec/them-du-an-theo-mau', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themDuAnTheoMau)
router.post('/quan-ly-du-an-theo-danh-sach-cong-viec/them-cong-viec', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themCongViec)
router.post('/quan-ly-du-an-theo-danh-sach-cong-viec/thiet-lap-cong-viec-lap-lai', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.thietLapCongViecLapLai)
router.post('/quan-ly-du-an-theo-danh-sach-cong-viec/:page', functions.checkToken, gv.showListRole, ProjectController.quanLyDuAnTheoDanhSachCongViec)
router.post('/quan-ly-du-an-theo-danh-sach-cong-viec', functions.checkToken, gv.showListRole, ProjectController.quanLyDuAnTheoDanhSachCongViec)

router.post('/quan-ly-du-an-theo-quy-trinh/them-quy-trinh', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themQuyTrinh)
router.post('/quan-ly-du-an-theo-quy-trinh/them-quy-trinh-theo-mau', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themQuyTrinhTheoMau)
router.post('/quan-ly-du-an-theo-quy-trinh/:page', functions.checkToken, gv.showListRole, ProjectController.quanLyDuAnTheoQuyTrinh)
router.post('/quan-ly-du-an-theo-quy-trinh', functions.checkToken, gv.showListRole, ProjectController.quanLyDuAnTheoQuyTrinh)

router.post('/danh-sach-lap-lai/:id/delete', functions.checkToken, gv.showListRole, ProjectController.xoaCongViecLapLai)
router.post('/danh-sach-lap-lai/:id/edit', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.chinhSuaCongViecLapLai)
router.post('/danh-sach-lap-lai/:page', functions.checkToken, gv.showListRole, ProjectController.danhSachLapLai)
router.post('/danh-sach-lap-lai', functions.checkToken, gv.showListRole, ProjectController.danhSachLapLai)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/thiet-lap-cong-viec-lap-lai', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.thietLapCongViecLapLaiChiTiet)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/edit-follow', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.chinhSuaTheoDoiDuAn)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/role', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaQuyenDuAn)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/switch', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.switchDuAn)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/delete-du-an', functions.checkToken, gv.showListRole, ProjectController.xoaDuAn)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/edit-du-an', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaDuAn)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/delete-nhom-cong-viec/:groupId', functions.checkToken, gv.showListRole, ProjectController.xoaNhomCongViec)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/edit-nhom-cong-viec/:groupId', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaNhomCongViec)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/add-nhom-cong-viec', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themNhomCongViec)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id/add-cong-viec', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themCongViecChiTiet)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:groupId/danhGiaNhomCongViec', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.danhGiaNhomCongViec)
router.post('/chi-tiet-du-an-theo-danh-sach-cong-viec/:id', functions.checkToken, gv.showListRole, ProjectController.chiTietDuAnTheoDanhSachCongViec)

router.post('/chi-tiet-du-an-theo-quy-trinh/:id/edit-follow', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.chinhSuaTheoDoi)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/switch', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.switchQuyTrinh)
router.post('/chi-tiet-du-an-theo-quy-trinh/role', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaQuyenQuyTrinh)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/edit', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaQuyTrinh)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/delete', functions.checkToken, gv.showListRole, ProjectController.xoaQuyTrinh)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/add-mission', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themNhiemVu)
router.post('/chi-tiet-du-an-theo-quy-trinh/edit-mission/:id', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaNhiemVu)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/delete-mission', functions.checkToken, gv.showListRole, ProjectController.xoaNhiemVu)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/add-stage', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themGiaiDoan)
router.post('/chi-tiet-du-an-theo-quy-trinh/edit-stage/:id', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaGiaiDoan)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/delete-stage', functions.checkToken, gv.showListRole, ProjectController.xoaGiaiDoan)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/option', functions.checkToken, gv.showListRole, ProjectController.dsOption)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id/add-option', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themOption)
router.post('/chi-tiet-du-an-theo-quy-trinh/edit-option/:id', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaOption)
router.post('/chi-tiet-du-an-theo-quy-trinh/delete-option/:id', functions.checkToken, gv.showListRole, ProjectController.xoaOption)
router.post('/chi-tiet-du-an-theo-quy-trinh/:id', functions.checkToken, gv.showListRole, ProjectController.chiTietDuAnTheoQuyTrinh)

router.post('/chi-tiet-du-an/:id/chinh-sua-nhan-vien', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.chinhSuaNhanVienDuAn)
router.post('/chi-tiet-du-an/:id/cap-nhap-danh-gia', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.CapNhapDanhGiaDuAn)
router.post('/chi-tiet-du-an/:id/chinh-sua-ket-qua', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.thayDoiKetQuaDuAn)
router.post('/chi-tiet-du-an/:id/delete-cong-viec', functions.checkToken, gv.showListRole, ProjectController.xoaCongViec)
router.post('/chi-tiet-du-an/:id/edit-cong-viec-chi-tiet', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaCongViecChiTiet)
router.post('/chi-tiet-du-an/:id/edit-cong-viec', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaCongViec)
router.post('/chi-tiet-du-an/:id/add-comment', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themBinhLuanCongViec)
router.post('/chi-tiet-du-an/:id/delete-comment/:commentId', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.xoaBinhLuanCongViec)
router.post('/chi-tiet-du-an/:id/add-file', gv.pathFolderProject, upload.any('my-file'), functions.checkToken, gv.showListRole, ProjectController.themFileCongViec)
router.post('/chi-tiet-du-an/:id/delete-file/:fileId', functions.checkToken, gv.showListRole, ProjectController.xoaFileCongViec)
router.get('/chi-tiet-du-an/:id/download-file/:fileId', ProjectController.taiFileCongViec)
router.post('/chi-tiet-du-an/:id/add-job-of-job', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.themJobOfJob)
router.post('/chi-tiet-du-an/:id/switch-job-of-job/:jojId', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.switchJobOfJob)
router.post('/chi-tiet-du-an/:id/edit-job-of-job/:jojId', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.suaJobOfJob)
router.post('/chi-tiet-du-an/:id/delete-job-of-job/:jojId', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.xoaJobOfJob)
router.post('/chi-tiet-du-an/:id/sua-mo-ta-cho-cong-viec', formData.parse(), functions.checkToken, gv.showListRole, ProjectController.ChinhSuaMoTaCongViec)
router.post('/chi-tiet-du-an/:id', functions.checkToken, gv.showListRole, ProjectController.chiTietDuAn)

router.post('/chi-tiet-nhiem-vu/:id/add-file', gv.pathFolderProcess, upload.any('my-file'), functions.checkToken, gv.showListRole, ProjectController.themFileNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id/delete-file/:fileId', functions.checkToken, gv.showListRole, ProjectController.xoaFileNhiemVu)
router.get('/chi-tiet-nhiem-vu/:id/download-file/:fileId', ProjectController.taiFileNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id/chinh-sua-nhan-vien', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.chinhSuaNhanVienQuyTrinh)
router.post('/chi-tiet-nhiem-vu/:id/xoa-comment/:commentId', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.xoaBinhLuanNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id/sua-comment/:commentId', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.suaBinhLuanNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id/them-comment', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.themBinhLuanNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id/cap-nhap-danh-gia', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.CapNhapDanhGia)
router.post('/chi-tiet-nhiem-vu/:id/switch-mission-job/:missionJobId', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.switchMissionJob)
router.post('/chi-tiet-nhiem-vu/:id/delete-mission-job/:missionJobId', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.xoaMissionJob)
router.post('/chi-tiet-nhiem-vu/:id/edit-mission-job/:missionJobId', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.suaMissionJob)
router.post('/chi-tiet-nhiem-vu/:id/add-mission-job', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.themMissionJob)
router.post('/chi-tiet-nhiem-vu/:id/chinh-sua-ket-qua', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.thayDoiKetQuaNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id/chinh-sua-thoi-han', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.chinhSuaThoiHan)
router.post('/chi-tiet-nhiem-vu/:id/cap-nhap-ly-do-that-bai', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.capNhatLyDoThatBai)
router.post('/chi-tiet-nhiem-vu/:id/cap-nhap-giai-doan-cho-nhiem-vu', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.chuyenTiepGiaiDoan)
router.post('/chi-tiet-nhiem-vu/:id/sua-mo-ta-cho-nhiem-vu', functions.checkToken, gv.showListRole, formData.parse(), ProjectController.ChinhSuaMoTaNhiemVu)
router.post('/chi-tiet-nhiem-vu/:id', functions.checkToken, gv.showListRole, ProjectController.chiTietNhiemVu)





module.exports = router