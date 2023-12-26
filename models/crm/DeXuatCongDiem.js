const mongoose = require('mongoose')
const DeXuatCongDiem = new mongoose.Schema({
    creator: {
        type: Number,
        require: true
    },
    company: {
        type: Number,
        require: true
    },
    point: {
        type: Number,
        require: true
    },
    // 0 : Chua được duyệt, 1: Đã được duyệt
    status: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Number,
        default: new Date().getTime() / 1000
    },
    updatedAt: {
        type: Number,
        default: new Date().getTime() / 1000
    }
});

module.exports = mongoose.model('DeXuatCongDiem', DeXuatCongDiem);