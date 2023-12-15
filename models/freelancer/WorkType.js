const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkTypeSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    work_name: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_WorkType',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_WorkType",WorkTypeSchema);
