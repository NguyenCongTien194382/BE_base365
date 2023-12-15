const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SaveFlcSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    employer_id: {
        type: Number,
        default: null,
    },
    flc_id: {
        type: Number,
        default: null,
    },
    created_at: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_SaveFlc',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_SaveFlc",SaveFlcSchema);
