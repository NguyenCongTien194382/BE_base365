const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    id_admin: {
        type: Number,
        required: true,
    },
    time_start: {
        type: Number,
        default: 0,
    },
    time_end: {
        type: Number,
        default: 0,
    },
    type_shift: {
        type: Number,
        default: 1,
    },
    resoure: {
        type: Number,
        default: 1,
    }
}, {
    collection: 'Tv365CronLockAdmin',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("Tv365CronLockAdmin", schema);