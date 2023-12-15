const mongoose = require('mongoose');
const { isNullOrUndefined } = require('util');
const Schema = mongoose.Schema;

const ChotDonTuSchema = new Schema({
    id: { // id bảng
        type: Number,
        require: true
    },
    comId: { // id công ty
        type: Number,
        require: true
    },

    thang_ap_dung: { // tháng áp dụng chốt đơn
        type: Number,
        require: true
    },
    nam_ap_dung: { // năm áp dụng chốt đơn
        type: Number,
        require: true
    },
    is_auto: { // kiểm tra chốt tự tự động
        type: Boolean,
        require: true,
        default: 0
    },
    date_chot: { // ngày chốt
        type: Date,
        require: true
    },
    date_auto_chot: { // ngày chốt tự động = ngày chốt + ngày kết thúc kỳ công | chỉ dùng nếu is_auto = 1
        type: Date,
        default: null
    },

    created_time: {
        type: Number,
        default: 0
    },
    update_time: {
        type: Number,
        default: 0
    },
}, {
    collection: 'QLC_ChotDonTu',
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('QLC_ChotDonTu', ChotDonTuSchema)