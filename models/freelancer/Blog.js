const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        default: null,
    },
    content: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_Blog',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Blog",BlogSchema);
