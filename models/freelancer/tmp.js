const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FLC_TempSchema = new Schema({
    id: { type: Number, default: 0 },
    userName: { type: String, default: null },
    phoneTK: { type: String, default: null },
    phone: { type: String, default: null },
    emailContact: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    city: { type: Number, default: 0 },
    district: { type: Number, default: 0 },
    birthday: { type: Number, default: 0 },
    gender: { type: Number, default: 0 },
    category_id: { type: Number, default: 0 },
    skill_detail: { type: String, default: null },
    salary_type: { type: Number, default: null },
    salary_permanent_number: { type: String, default: null },
    salary_estimate_number_1: { type: String, default: null },
    salary_salary_estimate_number_2: { type: String, default: null },
    type_register: String
}, {
    collection: 'FLC_Temp',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Temp", FLC_TempSchema);
