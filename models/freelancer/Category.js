const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    id_category: {
        type: Number,
        required: true,
    },
    category_name: {
        type: String,
        default: null,
    },
    created_at: {
        type: Number,
        default: null,
    },
    updated_at: {
        type: Number,
        default: null,
    },
    meta_title: {
        type: String,
        default: null,
    },
    meta_description: {
        type: String,
        default: null,
    },
    meta_key: {
        type: String,
        default: null,
    },
    content: {
        type: String,
        default: null,
    },
    title_suggest: {
        type: String,
        default: null,
    },
    title_suggest1: {
        type: String,
        default: null,
    },
    content_suggest: {
        type: String,
        default: null,
    },
    seo_index: {
        type: Number,
        default: 0,
    },
    url_slug: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_Category',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Category",CategorySchema);
