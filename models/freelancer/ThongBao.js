const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThongBaoSchema = new Schema({
    tb_id: {
        type: Number,
        required: true,
    },
    ten_tb: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_ThongBao',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_ThongBao",ThongBaoSchema);
