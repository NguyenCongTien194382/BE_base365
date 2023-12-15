const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
    _id: {
        type: Number,
    },
    category: {
        type: Number,
        default: 0,
    },
    title: {
        type: String,
        default: null,
    },
    content: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    img: {
        type: Array,
        default: null
    },
    relatedContent: {
        type: String,
    },
    relatedTitle: {
        type: Array,
    },
    date_create: {
        type: Date,
        default: null,
    },
    date_modified: {
        type: Date,
        default: null,
    },
    id_author: {
        type: Number,
        default: 0,
    },
    keyWord: {
        type: String,
    },
    alias: {
        type: String
    },

    title_seo: {
        type: String
    },
    des: {
        type: String
    }
}, {
    collection: 'QLC_Blog',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("Blogs", blogSchema);