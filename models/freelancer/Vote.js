const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    flc_id: {
        type: Number,
        default: null,
    },
    employer_id: {
        type: Number,
        default: null,
    },
    job_id: {
        type: Number,
        default: null,
    },
    star: {
        type: Number,
        default: null,
    },
    status: {
        type: Number,
        default: null,
    },
    created_at: {
        type: Number,
        default: null,
    },
    type_vote: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_Vote',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Vote",VoteSchema);
