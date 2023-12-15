const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingConfirmTimeSheetchema = new Schema({

    // id bảng
    id: {
        type: Number,
        require: true
    },
    // id công ty
    comId: {
        type: Number,
        require: true
    },
    // idQLC nhân viên
    ep_id: {
        type: Number,
        require: true
    },
    users_duyet: [{
        type: Number,
        default: 0
    }],
    created_time: {
        type: Number,
        default: 0
    },
    update_time: {
        type: Number,
        default: 0
    },

}, {
    collection: 'QLC_SettingConfirmTimeSheet',
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('QLC_SettingConfirmTimeSheet', SettingConfirmTimeSheetchema)