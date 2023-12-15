const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ReceiveSalaryDay = new Schema({
    _id: {
        type: Number,
        required: true
    },
    com_id: {
        type: Number,
        required: true
    },
    ep_id: {
        type: Number,
        required: true
    },
    apply_month: {
        type: String,
        default: null,
    },
    start_date: {
        type: Date,
        default: null,
    },
    end_date: {
        type: Date,
        default: null,
    },
    update_time: {
        //thời điểm tạo 
        type: Date,
        default: Date.now()
    },
})

module.exports = mongoose.model('QLC_ReceiveSalaryDay', ReceiveSalaryDay)