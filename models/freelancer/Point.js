const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PointSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    employer_id: {
        type: Number,
        default: null,
    },
    point_free: {
        type: Number,
        default: 0,
    },
    point: {
        type: Number,
        default: 0,
    },
    reset_date: {
        type: Number,
        default: 0,
    },
},{
    collection: 'FLC_Point',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Point",PointSchema);
