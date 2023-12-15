const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const City2Schema = new Schema({
    cit_id: {
        type: Number,
        required: true,
    },
    cit_name: {
        type: String,
        default: null,
    },
    cit_order: {
        type: Number,
        default: null,
    },
    cit_type: {
        type: Number,
        default: null,
    },
    cit_count: {
        type: Number,
        default: 0,
    },
    cit_parent: {
        type: Number,
        default: 0,
    },
},{
    collection: 'FLC_City2',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_City2",City2Schema);
