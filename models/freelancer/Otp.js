const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtpSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        default: null,
    },
    code: {
        type: Number,
        default: null,
    },
    created_at: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_Otp',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Otp",OtpSchema);
