const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostCitySchema = new Schema({
    id: {
        type: Number,
        required: true,
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
    content_suggest: {
        type: String,
        default: null,
    },
    seo_index: {
        type: Number,
        default: null,
    },
    url_slug: {
        type: String,
        default: null,
    },
    created_at: {
        type: Number,
        default: null,
    },
    cit_id: {
        type: Number,
        default: null,
    },
    updated_at: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_PostCity',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_PostCity",PostCitySchema);
