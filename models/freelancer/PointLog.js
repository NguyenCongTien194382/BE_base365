const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PointLogSchema = new Schema({
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
    type: {
        type: Number,
        default: null,
    },
    viewed_date: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_PointLog',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_PointLog",PointLogSchema);
