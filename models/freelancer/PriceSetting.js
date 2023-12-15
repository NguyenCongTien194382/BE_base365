const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PriceSettingSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    flc_id: {
        type: Number,
        default: 0,
    },
    job_id: {
        type: Number,
        default: 0,
    },
    salary: {
        type: Number,
        default: 0,
    },
    flc_email: {
        type: String,
        default: null,
    },
    employee_id: {
        type: Number,
        default: 0,
    },
    accept_price_setting: {
        type: Number,
        default: 0,
    },
    status_work: {
        type: Number,
        default: 0,
    },
    vote: {
        type: Number,
        default: 0,
    }
}, {
    collection: 'FLC_PriceSetting',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_PriceSetting", PriceSettingSchema);
