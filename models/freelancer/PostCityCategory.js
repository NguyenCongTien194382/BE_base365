const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostCityCategorySchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
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
    content_suggest: {
        type: String,
        default: null,
    },
    seo_index: {
        type: Number,
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
    cit_id: {
        type: Number,
        default: null,
    },
    category_id: {
        type: Number,
        default: null,
    },
    skill_id: {
        type: Number,
        default: null,
    },
    slug_url: {
        type: String,
        default: null,
    },
    title_suggest: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_PostCityCategory',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_PostCityCategory",PostCityCategorySchema);
