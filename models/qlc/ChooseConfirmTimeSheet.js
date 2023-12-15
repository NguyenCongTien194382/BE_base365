const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChooseConfirmTimeSheetchema = new Schema({

    // id công ty
    comId: {
        type: Number,
        require: true
    },
    // 1:Không phê duyệt chấm công, 2:phê duyệt chấm công
    choose: {
        type: Number,
        require: true,
        default: 1
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
    collection: 'QLC_ChooseConfirmTimeSheet',
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('QLC_ChooseConfirmTimeSheet', ChooseConfirmTimeSheetchema)