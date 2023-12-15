const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: Number,
        default: null,
    },
    update_time: {
        type: Number,
        default: null,
    },
    refresh_token: {
        type: String,
        default: null,
    },
    type: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_RefreshToken',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_RefreshToken",RefreshTokenSchema);
