const ChotDonTus = require('../models/qlc/ChotDonTu');
const functions = require("../services/functions");
const dayjs = require('dayjs');
const De_Xuat = require('../models/Vanthu/de_xuat');
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
dayjs.extend(isSameOrAfter)

// mẫu, không dùng
exports.check = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id
        const { _id } = req.body
        if (comId && _id) {
            // Lấy đề xuất về, dùng thời gian tạo đề xuất (tháng và năm) để tìm chốt đơn từ (nếu có)
            const deXuat = await De_Xuat.findOne({ _id: _id, com_id: comId });

            // Tùy theo loại đề xuất mà thời gian áp dụng là khác nhau 
            // Lưu ý: NUmber là Epoch timestamp, Date là kiểu Date của js, String là dạng YYYY MM DD
            // [loại dx] = [thời gian] | [type_dx] | [kiểu dữ liệu]
            // tam_ung = time_create - 1 tháng | 3 | Number
            // xac_nhan_cong = time_xnc | 17 | Date
            // thuong_phat = time_tp | 19 | Date
            // hoa_hong = item_mdt_date | 20 | String
            let dateApDung;
            if (deXuat) {
                const type_dx = deXuat.type_dx
                if ([3, 17, 19, 20].includes(type_dx)) {
                    switch (type_dx) {
                        case 3:
                            dateApDung = dayjs.unix(deXuat.time_create).subtract(1, 'month');
                            break;

                        case 17:
                            dateApDung = dayjs(deXuat.noi_dung.xac_nhan_cong.time_xnc);
                            break;

                        case 19:
                            dateApDung = dayjs(deXuat.noi_dung.thuong_phat.time_tp);
                            break;

                        case 20:
                            dateApDung = dayjs(deXuat.noi_dung.hoa_hong.item_mdt_date);
                            break;

                        default:
                            break;
                    }

                    const thang_ap_dung = dayjs(dateApDung).format('MM'),
                        nam_ap_dung = dayjs(dateApDung).format('YYYY'),
                        thoi_gian_check = dayjs.unix(Math.floor(Date.now() / 1000)); // Lấy thời điểm hiện tại để check
                    // Tìm chốt đơn từ
                    const conditions = {
                        comId: comId,
                        thang_ap_dung: thang_ap_dung,
                        nam_ap_dung: nam_ap_dung
                    }
                    const foundChotDon = await ChotDonTus.findOne(conditions, 'date_chot is_auto date_auto_chot');

                    // Check xem thời điểm hiện tại (thoi_gian_check) có trước ngày chốt đơn không
                    if (foundChotDon) {
                        if (Boolean(foundChotDon.is_auto)) { // Nếu là chốt đơn từ tự động
                            if (dayjs(thoi_gian_check).isBefore(dayjs(foundChotDon.date_auto_chot))) {

                            } else {
                                return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDon.date_auto_chot).format('DD-MM-YYYY')}`);
                            }
                        } else { // Nếu là chốt đơn từ thủ công
                            if (dayjs(thoi_gian_check).isBefore(dayjs(foundChotDon.date_chot))) {

                            } else {
                                return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDon.date_chot).format('DD-MM-YYYY')}`);
                            }
                        }
                    }

                }
                next();
            } else {
                return functions.setError(res, 'Không tìm thấy đề xuất', 400);
            }
        } else {
            return functions.setError(res, "Thiếu thông tin");
        }
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

// Mọi đề xuất khi tạo đều phải check thời điểm tạo với thời điểm chốt đơn
exports.checkCreateAll = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id
        const thoi_gian_check = dayjs(),
            thang_ap_dung = dayjs().format('MM'),
            nam_ap_dung = dayjs().format('YYYY');
        console.log("thoi_gian_check", thoi_gian_check)
        console.log("thang_ap_dung", thang_ap_dung)
        console.log("nam_ap_dung", nam_ap_dung)

        // Tìm chốt đơn từ
        const conditions = {
            comId: comId,
            thang_ap_dung: thang_ap_dung,
            nam_ap_dung: nam_ap_dung
        }
        const foundChotDon = await ChotDonTus.findOne(conditions, 'date_chot is_auto date_auto_chot');

        // Check xem thời điểm hiện tại (thoi_gian_check) có trước ngày chốt đơn không
        if (foundChotDon) {
            if (Boolean(foundChotDon.is_auto)) { // Nếu là chốt đơn từ tự động
                if (dayjs(thoi_gian_check).isBefore(dayjs(foundChotDon.date_auto_chot))) {

                } else {
                    return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDon.date_auto_chot).format('DD-MM-YYYY')}`);
                }
            } else { // Nếu là chốt đơn từ thủ công
                if (dayjs(thoi_gian_check).isBefore(dayjs(foundChotDon.date_chot))) {

                } else {
                    return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDon.date_chot).format('DD-MM-YYYY')}`);
                }
            }
        }
        console.log("tới đây =================")
        next();
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

// Tìm chốt đơn từ gần nhất trước thời điểm này
const findClosestChotDonTuBefore = async (comId, inputMonth, inputYear) => {
    const result = await ChotDonTus.findOne({
        $and: [{
            $or: [
                { nam_ap_dung: { $lt: inputYear } },
                { nam_ap_dung: inputYear, thang_ap_dung: { $lt: inputMonth } }
            ]
        },
        { comId: comId }
        ]
    })
        .sort({ nam_ap_dung: -1, thang_ap_dung: -1 })

    return result;
}

const checkChotDonTuBeforeAndAfter = async (comId, dateApDung) => {
    const thang_ap_dung = dayjs(dateApDung).format('MM'),
        nam_ap_dung = dayjs(dateApDung).format('YYYY'),
        thoi_gian_check = dayjs(dateApDung); // Lấy thời điểm hiện tại để check
    // Tìm chốt đơn từ
    const conditions = {
        comId: comId,
        thang_ap_dung: thang_ap_dung,
        nam_ap_dung: nam_ap_dung
    }
    const foundChotDon = await ChotDonTus.findOne(conditions, 'date_chot is_auto date_auto_chot');
    const foundChotDonBefore = await findClosestChotDonTuBefore(comId, thang_ap_dung, nam_ap_dung);
    // console.log(foundChotDonBefore)
    // console.log(foundChotDon)

    // Check xem thời điểm áp dụng (thoi_gian_check) có trước 
    // ngày chốt đơn này và sau ngày chốt đơn trước (nếu có) không 
    // (nằm ở giữa mới hợp lệ)

    if (foundChotDonBefore) {
        if (Boolean(foundChotDonBefore.is_auto)) { // Nếu là chốt đơn từ tự động
            if (dayjs(thoi_gian_check).isBefore(dayjs(foundChotDonBefore.date_auto_chot))) {
                // return functions.setError(res, `Tháng ${foundChotDonBefore.thang_ap_dung}, năm ${foundChotDonBefore.nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDonBefore.date_auto_chot).format('DD-MM-YYYY')}`);
                return false;
            }
        } else { // Nếu là chốt đơn từ thủ công
            if (dayjs(thoi_gian_check).isBefore(dayjs(foundChotDonBefore.date_chot))) {
                // return functions.setError(res, `Tháng ${foundChotDonBefore.thang_ap_dung}, năm ${foundChotDonBefore.nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDonBefore.date_chot).format('DD-MM-YYYY')}`);
                return false;
            }
        }
    }

    if (foundChotDon) {
        if (Boolean(foundChotDon.is_auto)) { // Nếu là chốt đơn từ tự động
            if (dayjs(thoi_gian_check).isSameOrAfter(dayjs(foundChotDon.date_auto_chot))) {
                // return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDon.date_auto_chot).format('DD-MM-YYYY')}`);
                return false;
            }
        } else { // Nếu là chốt đơn từ thủ công
            if (dayjs(thoi_gian_check).isSameOrAfter(dayjs(foundChotDon.date_chot))) {
                // return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ ngày ${dayjs(foundChotDon.date_chot).format('DD-MM-YYYY')}`);
                return false;
            }
        }
    }
    // console.log('true')
    return true;
}

exports.checkCreateTamUng = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id
        let dateApDung = dayjs().subtract(1, 'month');

        const checkBeforeAfter = await checkChotDonTuBeforeAndAfter(comId, dateApDung)
        if (!checkBeforeAfter) {
            return functions.setError(res, 'Đề xuất không được tạo vì đã chốt đơn từ')
        }
        next();

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

exports.checkCreateXacNhanCong = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id
        let { time_xnc } = req.body
        if (time_xnc) {
            let dateApDung = dayjs(time_xnc)

            const checkBeforeAfter = await checkChotDonTuBeforeAndAfter(comId, dateApDung)
            if (!checkBeforeAfter) {
                return functions.setError(res, 'Đề xuất không được tạo vì đã chốt đơn từ')
            }
        } else {
            return functions.setError(res, "Thiếu thông tin");
        }
        next();

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

exports.checkCreateThuongPhat = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id
        let { time_tp } = req.body
        if (time_tp) {
            let dateApDung = dayjs(time_tp)

            const checkBeforeAfter = await checkChotDonTuBeforeAndAfter(comId, dateApDung)
            if (!checkBeforeAfter) {
                return functions.setError(res, 'Đề xuất không được tạo vì đã chốt đơn từ')
            }
        } else {
            return functions.setError(res, "Thiếu thông tin");
        }
        next();
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

exports.checkCreateHoaHong = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id

        let { item_mdt_date } = req.body
        // console.log("item_mdt_date", item_mdt_date)

        if (item_mdt_date) {
            let dateApDung = dayjs(item_mdt_date)
            console.log("dateApDung", new Date(dateApDung))
            const checkBeforeAfter = await checkChotDonTuBeforeAndAfter(comId, dateApDung)
            if (!checkBeforeAfter) {
                return functions.setError(res, 'Đề xuất không được tạo vì đã chốt đơn từ')
            }
        } else {
            return functions.setError(res, "Thiếu thông tin");
        }
        next();
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}