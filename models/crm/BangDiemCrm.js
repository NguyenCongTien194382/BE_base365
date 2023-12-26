const mongoose = require('mongoose')
const BangDiemCrm = new mongoose.Schema({
    idKinhDoanh: {
        type: Number,
        require: true
    },
    point: {
        type: Number,
        require: true
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

module.exports = mongoose.model('BangDiemCrm', BangDiemCrm);