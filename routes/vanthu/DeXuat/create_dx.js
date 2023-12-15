const express = require('express')
const router = express.Router()
const formData = require('express-form-data')
const Controller = require('../../../controllers/vanthu/DeXuat/create_dx')
const functions = require('../../../services/functions')
const checkChotDonTu = require('../../../middleware/checkChotDonTu')

//Api tạo đề xuất

router.post('/De_Xuat_Xin_Nghi', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_xin_nghi)
router.post('/De_Xuat_Xin_Bo_Nhiem', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_xin_bo_nhiem)
router.post('/De_Xuat_Cap_Phat_Tai_San', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_xin_cap_phat_tai_san)
router.post('/De_Xuat_Xin_Doi_Ca', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_doi_ca)
router.post('/De_Xuat_Luan_Chuyen_Cong_Tac', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_luan_chuyen_cong_tac)
router.post('/De_Xuat_Xin_Tang_Luong', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_tang_luong)
router.post('/De_Xuat_Tham_Gia_Du_An', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_tham_gia_du_an)
router.post('/De_Xuat_Xin_Tam_Ung', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, checkChotDonTu.checkCreateTamUng, Controller.de_xuat_xin_tam_ung)
router.post('/De_Xuat_Xin_thoi_Viec', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.de_xuat_xin_thoi_Viec)
router.post('/De_Xuat_Lich_Lam_Viec', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.lich_lam_viec)

router.post('/addDXC', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, checkChotDonTu.checkCreateXacNhanCong, Controller.dxCong)
router.post('/addDXVC', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxCoSoVatChat)
router.post('/addDXXe', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxDangKiSuDungXe)
router.post('/addDXHH', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, checkChotDonTu.checkCreateHoaHong, Controller.dxHoaHong)
router.post('/addDXKN', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxKhieuNai)
router.post('/addDxPh', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxPhongHop)
router.post('/addDxTc', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxTangCa)
router.post('/addDxTs', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxThaiSan)
router.post('/addDXTT', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxThanhToan)
router.post('/addDXTP', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, checkChotDonTu.checkCreateThuongPhat, Controller.dxThuongPhat)

router.post('/addDXDMVS', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxDiMuonVeSom)
router.post('/addDXXNRN', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxXinNghiRaNgoai)
router.post('/addDXNNNL', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxNhapNgayNhanLuong)
router.post('/addDXXTTL', functions.checkToken, formData.parse(), checkChotDonTu.checkCreateAll, Controller.dxXinTaiTaiLieu)

//Api đổ dữ liệu danh sách người duyệt và người theo dõi
router.post('/showadd', functions.checkToken, formData.parse(), Controller.showadd)
router.post('/showMucDoanhThu', functions.checkToken, formData.parse(), Controller.showMucDoanhThu)
router.post('/meetingRooms', functions.checkToken, formData.parse(), Controller.meetingRooms)
router.post('/InitNewPostions', functions.checkToken, formData.parse(), Controller.InitNewPostions)
router.post('/positions', functions.checkToken, formData.parse(), Controller.positions)
router.post('/settingConfirm', functions.checkToken, formData.parse(), Controller.settingConfirm)
router.post('/getUserWithOrganize', functions.checkToken, formData.parse(), Controller.getUserWithOrganize)
router.post('/empShiftInDay', functions.checkToken, formData.parse(), Controller.emp_shift_in_day)
router.post('/topMangersInOrganize', functions.checkToken, formData.parse(), Controller.topMangersInOrganize)
router.post('/listTaiSan', functions.checkToken, formData.parse(), Controller.listTaiSan)
router.post('/listProjects', functions.checkToken, formData.parse(), Controller.listProjects)

router.post('/settingPropose', functions.checkToken, formData.parse(), Controller.settingPropose)
router.post('/listTSdaCPchoNV', functions.checkToken, formData.parse(), Controller.listTSdaCPchoNV)

module.exports = router