const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_CommentFilePath = new Schema({
    id: {
        type: Number,
        required: true
    },
    cmd_id: {
        type: Number,
    },
    name: {
        type: String,
    },
    path: {
        type: String,
    },
},
{
    collection: "KPI365_CommentFilePath",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_CommentFilePath', KPI365_CommentFilePath);