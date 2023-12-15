const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storage_auto_call = new Schema({
    idSchedule: { //id của lịch hẹn
        type: String,
        default: '',
    },
    cus_id: { //id của khách hàng
        type: Number,
        default: 0
    },
    emp_id: {  //id của chuyên viên
        type: Number,
        default: 0
    },
    timeStart: { //thời gian bắt đầu cuộc gọi
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
    state: { //trạng thái nghe máy, không nghe máy
        type: String,
        default: ''
    },
    link: { //link file ghi âm cuộc gọi
        type: String,
        default: ''
    },
    text: { //text của ghi âm
        type: String,
        default: ''
    }
}, {
    collection: 'CRM_storage_auto_cal',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("storage_auto_call", storage_auto_call);
