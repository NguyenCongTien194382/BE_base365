const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingTrackingQR = new Schema({
    id: {
        type: Number,
        unique: true
    },
    com_id: {
        type: Number
    },
    name: {
        type: String
    },
    // danh sách tổ chức
    list_org: [
        { type: Number }
    ],
    list_pos: [
        { type: Number }
    ],
    list_shifts: [
        {
            id: Number, // id ca
            type_shift: Number, // loai ca : 1-vao ; 2-ra,
            _id: false
        }
    ],
    listUsers: [{
        type: Number
    }],
    // danh sách IP cho phép
    list_ip: [
        { type: Number }
    ],
    // 1 : hạn định 1 số wifi
    // 2 : Tất cả wifi đã được lưu trong db
    // 3 :Tất cả wifi đều dùng được
    type_ip: {
        type: Number
    },
    list_loc: [
        { type: Number }
    ],
    // 1 : Hạn định 1 số vị trí
    // 2 : Tất cả vị trí đã được lưu trong db
    // 3 : Tất cả vị trí đều được
    type_loc: {
        type: Number
    },
    QRCode_id: {
        type: Number
    },
    start_time: {
        type: Date,
        default: null
    },
    end_time: {
        type: Date,
        default: null
    },
    created_time: {
        type: Date,
        default: Date.now
    },
    update_time: {
        type: Date,
        default: Date.now
    }


}, {
    collection: 'QLC_SettingTrackingQR',
    versionKey: false
})

module.exports = mongoose.model("QLC_SettingTrackingQR", SettingTrackingQR);