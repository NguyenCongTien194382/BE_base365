const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schedule_auto_call = new Schema({
    emp_id: [{  /// list id kinh doanh
        type: Number
    }],
    comId: {  //id công ty
        type: Number,
        default: 0
    },
    list_group_id: {
        type: Array,
        default: []
    },
    time_start_update: { //thời gian bắt đầu tương ứng updateAt bảng customer
        type: Number,
        default: 0
    },
    time_end_update: { //thời gian kết thúc tương ứng updateAt bảng customer
        type: Number,
        default: 0
    },
    time_start: { //thời gian bắt đầu chạy gọi điện
        type: Number,
        default: Date.now()
    },
    list_cus_id: {
        type: Array,
        default: []
    },
    status_doing: { //trạng thái đang chạyj
        type: String,
        default: ''
    },
    status_run: { //trạng thái đã chạy chưa 0: chưa, 1 rồi
        type: Number,
        default: 0
    },
    status: { //0: chờ duyệt, 1: đã duyệt, 2: Từ chối
        type: Number,
        default: 0
    },
    time_create: { //Thời gian tạo lịch cuộc gọi
        type: Number,
        default: Date.now()
    }
}, {
    collection: 'Schedule_auto_call',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("schedule_auto_call", schedule_auto_call);
