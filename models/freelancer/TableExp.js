const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TableExpSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    exp_name: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_TableExp',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_TableExp",TableExpSchema);
