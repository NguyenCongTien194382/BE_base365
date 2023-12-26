const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingConfirmTimeSheetchema = new Schema({
    // id công ty
    com_id: {
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
        default: new Date()
    },
    update_time: {
        type: Number,
        default: new Date()
    },

}, {
    collection: 'QLC_SettingConfirmTimeSheet',
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('QLC_SettingConfirmTimeSheet', SettingConfirmTimeSheetchema)