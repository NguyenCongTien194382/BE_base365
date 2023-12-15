const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const DexuatAddSensitiveSchema = new Schema({
    creator: {
        type: Number,
        require: true
    },
    receiver: {
        type: Number,
        require: true
    },
    word: {
        type: String,
        default: ""
    },
    // 0 : chưa được duyệt 
    // 1 : đã được duyệt
    type: {
        type: Number,
        default: 0
    },
    link: {
        type: String,
        default: ""
    },
    createAt: {
        type: Number,
        default: new Date().getTime() / 1000
    }
}, {
    collection: 'DexuatAddSensitive',
    versionKey: false,
    timestamp: true
})

module.exports = connection.model("DexuatAddSensitive", DexuatAddSensitiveSchema);