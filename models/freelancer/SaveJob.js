const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SaveJobSchema = new Schema({
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
    created_at: {
        type: Number,
        default: 0,
    },
},{
    collection: 'FLC_SaveJob',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_SaveJob",SaveJobSchema);
