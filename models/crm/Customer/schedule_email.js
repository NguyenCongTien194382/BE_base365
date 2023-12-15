const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schedule_email = new Schema({
    emp_id: { //id kinh doanh
        type: Number,
        default: 0
    },
    comId: {  //id công ty
        type: Number,
        default: 0
    },
    list_group_id: {
        type: Array,
        default: []
    },
    time_start_update: { //th?i gian b?t d?u tuong ?ng updateAt b?ng customer
        type: Number,
        default: 0
    },
    time_end_update: { //th?i gian k?t thúc tuong ?ng updateAt b?ng customer
        type: Number,
        default: 0
    },
    time_start: { //th?i gian b?t d?u ch?y g?i di?n
        type: Number,
        default: Date.now()
    },
    list_cus_id: {
        type: Array,
        default: []
    },
    status_doing: { //tr?ng thái dang ch?yj
        type: String,
        default: ''
    },
    status: { //0: ch? duy?t, 1: duy?t, 2: T? ch?i
        type: Number,
        default: 0
    },
    time_create: { //Th?i gian t?o l?ch cu?c g?i
        type: Number,
        default: Date.now()
    }
}, {
    collection: 'CRM_Schedule_email',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("schedule_email", schedule_email);
