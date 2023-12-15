const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    adm_email: {
        type: String,
        required: true,
    },
    adm_pass: {
        type: String,
        required: true,
    },
    adm_type: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_Admin',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Admin",AdminSchema);
