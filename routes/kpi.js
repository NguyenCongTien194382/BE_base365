var express = require('express')
var router = express.Router();

//Admin
var AdminTrangChuRouter = require('./kpi/admin/TrangChu');
var AdminPhongBanRouter = require('./kpi/admin/QuanLyPhongBan');
var AdminNhanVienRouter = require('./kpi/admin/QuanLyNhanVien');
var AdminPhanQuyenRouter = require('./kpi/admin/PhanQuyen');
var AdminThietLapKPIRouter = require('./kpi/admin/ThietLapKPI');
var AdminTheoDoiKPIRouter = require('./kpi/admin/TheoDoiKPI');
var AdminDanhGiaKPIRouter = require('./kpi/admin/DanhGiaKPI');
var AdminToChucRouter = require('./kpi/admin/QuanLyToChuc');
var AdminCaiDatRouter = require('./kpi/admin/CaiDat');
var AdminDuLieuXoaRouter = require('./kpi/admin/DuLieuXoa');
var AdminSoDoKPIRouter = require('./kpi/admin/SoDoKPI');
//Nhân viên

//Admin
router.use('/admin/trangChu', AdminTrangChuRouter);
router.use('/admin/phongBan', AdminPhongBanRouter);
router.use('/admin/phanQuyen', AdminPhanQuyenRouter);
router.use('/admin/thietLapKPI', AdminThietLapKPIRouter);
router.use('/admin/theoDoiKPI', AdminTheoDoiKPIRouter);
router.use('/admin/danhGiaKPI', AdminDanhGiaKPIRouter);
router.use('/admin/toChuc', AdminToChucRouter);
router.use('/admin/nhanVien', AdminNhanVienRouter);
router.use('/admin/caiDat', AdminCaiDatRouter);
router.use('/admin/duLieuXoa', AdminDuLieuXoaRouter);
router.use('/admin/soDoKPI', AdminSoDoKPIRouter);

//Nhân viên


module.exports = router;
