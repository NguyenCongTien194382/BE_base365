//Model này dùng để 
const mongoose = require('mongoose')


const HistoryPointCrm = new mongoose.Schema({
    consumer: {
        type: [Number],
        default: []
    },
    emp_id: {
        type: Number,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    created_at: {
        type: Number,
        default: new Date().getTime() / 1000
    },
    updated_at: {
        type: Number,
        default: new Date().getTime() / 1000
    },

});

module.exports = mongoose.model('HistoryPointCrm', HistoryPointCrm);