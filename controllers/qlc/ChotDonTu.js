const functions = require("../../services/functions")
const ChotDonTus = require("../../models/qlc/ChotDonTu")

// Tạo ngày chốt
exports.create = async (req, res, next) => {
    try {
        const { thang_ap_dung, nam_ap_dung, is_auto, date_chot, date_auto_chot } = req.body
        const comId = req.body.comId || req.user.data.com_id
        const type = req.user.data.type

        if (Number(type) === 1) {
            if (comId && thang_ap_dung && nam_ap_dung && is_auto && date_chot) {

                // check tồn tại
                const found_chot = await ChotDonTus.findOne({ comId: comId, thang_ap_dung: thang_ap_dung, nam_ap_dung: nam_ap_dung })
                if (found_chot) {
                    return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ`)
                }

                // Check auto và date_auto
                if (Boolean(is_auto) === true && !date_auto_chot) {
                    return functions.setError(res, `Chốt đơn từ tự động cần có ngày kết thúc`)
                }

                const maxId = await ChotDonTus.findOne({ comId: comId }, { id: 1 }, { sort: { id: -1 } }).lean() || 0
                const id = Number(maxId.id) + 1 || 1
                const newData = new ChotDonTus({
                    id: id,
                    comId: comId,
                    thang_ap_dung: thang_ap_dung,
                    nam_ap_dung: nam_ap_dung,
                    is_auto: is_auto,
                    date_chot: date_chot,
                    date_auto_chot: Boolean(is_auto) ? date_auto_chot : null,
                    created_time: functions.getTimeNow(),
                    update_time: functions.getTimeNow()
                })
                newData.save();

                return functions.success(res, "Tạo thành công", { data: newData })
            }
            return functions.setError(res, "Thiếu thông tin");
        }
        return functions.setError(res, "Tài khoản không phải Công ty");

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

// Lấy danh sách chốt đơn từ trong công ty
exports.list = async (req, res, next) => {
    try {
        const comId = req.body.comId || req.user.data.com_id
        const { id, thang_ap_dung, nam_ap_dung } = req.body
        let conditions = {
            comId: comId
        }
        if (id) conditions.id = id
        if (thang_ap_dung) conditions.thang_ap_dung = thang_ap_dung
        if (nam_ap_dung) conditions.nam_ap_dung = nam_ap_dung
        if (comId) {
            const data = await ChotDonTus.find(conditions, {}).sort({ nam_ap_dung: -1, thang_ap_dung: -1 })
            return functions.success(res, 'Danh sách chốt đơn từ', { data })
        }
        return functions.setError(res, "Thiếu thông tin");

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

// Lấy theo tháng áp dụng, năm áp dụng, comId
exports.getOne = async (req, res, next) => {
    try {
        const { thang_ap_dung, nam_ap_dung } = req.body
        const comId = req.body.comId || req.user.data.com_id
        if (comId && thang_ap_dung && nam_ap_dung) {
            const found_chot = await ChotDonTus.findOne({ comId: comId, thang_ap_dung: thang_ap_dung, nam_ap_dung: nam_ap_dung })
            if (found_chot) {
                return functions.success(res, 'Chốt đơn từ', { data: found_chot })
            } else {
                return functions.setError(res, 'Chốt đơn từ không tồn tại')
            }
        }
        return functions.setError(res, 'Thiếu thông tin')

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

// Chỉnh sửa ngày chốt
exports.update = async (req, res, next) => {
    try {
        const { id, thang_ap_dung, nam_ap_dung, is_auto, date_chot, date_auto_chot } = req.body
        const comId = req.body.comId || req.user.data.com_id
        const type = req.user.data.type

        if (Number(type) === 1) {
            // check tồn tại
            const found_chot = await ChotDonTus.findOne({ id: id })
            if (!found_chot) {
                return functions.setError(res, `Chốt đơn từ không tồn tại`)
            }
            if (id && comId) {
                // Check trùng
                if (thang_ap_dung && nam_ap_dung) {
                    const found_chot = await ChotDonTus.findOne({ comId: comId, thang_ap_dung: thang_ap_dung, nam_ap_dung: nam_ap_dung })
                    if (found_chot && found_chot.id != id) {
                        return functions.setError(res, `Tháng ${thang_ap_dung}, năm ${nam_ap_dung} đã chốt đơn từ`)
                    }
                }

                let update = {}
                if (thang_ap_dung) update.thang_ap_dung = thang_ap_dung
                if (nam_ap_dung) update.nam_ap_dung = nam_ap_dung
                if (date_chot) update.date_chot = date_chot
                if (is_auto) {
                    if (Boolean(is_auto) == true && !date_auto_chot) {
                        return functions.setError(res, 'Chốt đơn từ tự động cần có ngày kết thúc')
                    } else if (Boolean(is_auto) == true) {
                        update.is_auto = is_auto
                        update.date_auto_chot = date_auto_chot
                    } else {
                        update.is_auto = is_auto
                        update.date_auto_chot = null
                    }
                }
                update.update_time = functions.getTimeNow();

                await ChotDonTus.updateOne({ id: id, comId: comId }, { $set: update })
                return functions.success(res, 'Sửa thành công')
            }
            return functions.setError(res, 'Thiếu thông tin')
        }
        return functions.setError(res, "Tài khoản không phải Công ty");

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

// Xóa ngày chốt 
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.body
        const comId = req.body.comId || req.user.data.com_id
        const type = req.user.data.type

        if (Number(type) === 1) {
            if (id && comId) {
                const found_chot = await ChotDonTus.findOne({ id: id, comId: comId })
                if (!found_chot) return functions.setError(res, `Chốt đơn từ không tồn tại`)
                await ChotDonTus.deleteOne({ id: id, comId: comId })
                return functions.success(res, 'Xóa thánh công')
            }
            return functions.setError(res, 'Thiếu thông tin')
        }
        return functions.setError(res, "Tài khoản không phải Công ty");
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}