const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotifyTimekeepingSchema = new Schema({
    //Id của công ty
    com_id: {
        type: Number
    },
    // số phút
    minute: {
        type: Number,
    },
    // Nội dung thông báo
    content: {
        type: String,
        default: null
    },

    // mặc định là bật thông báo (1:bật, -1:tắt)
    status: {
        type: Number,
        default: 1
    },
    created_time: {
        type: Number,
        default: new Date().getTime()
    },
    update_time: {
        type: Number,
        default: new Date().getTime()
    }
}, {
    collection: 'QLC_NotifyTimekeeping',
    versionKey: false
})

module.exports = mongoose.model("QLC_NotifyTimekeeping", NotifyTimekeepingSchema);