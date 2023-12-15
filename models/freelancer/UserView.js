const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserViewSchema = new Schema({
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
    allow_view: {
        type: Number,
        default: null,
    },
    created_at: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_UserView',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_UserView",UserViewSchema);
