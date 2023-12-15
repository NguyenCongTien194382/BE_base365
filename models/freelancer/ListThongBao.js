const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListThongBaoSchema = new Schema({
    id_list: {
        type: Number,
        required: true,
    },
    id_nguoi_gui: {
        type: Number,
        default: null,
    },
    id_nguoi_nhan: {
        type: Number,
        default: null,
    },
    td_loai_tb: {
        type: Number,
        default: null,
    },
    id_tin: {
        type: Number,
        default: null,
    },
    time_tb: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_ListThongBao',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_ListThongBao",ListThongBaoSchema);
