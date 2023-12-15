const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CitySchema = new Schema({
    cit_id: {
        type: Number,
        required: true,
    },
    cit_name: {
        type: String,
        default: null,
    },
    cit_order: {
        type: Number,
        default: null,
    },
    cit_type: {
        type: Number,
        default: null,
    },
    cit_count: {
        type: Number,
        default: 0,
    },
    cit_tw: {
        type: Number,
        default: 0,
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
        default: 0,
    },
    url_slug: {
        type: String,
        default: null,
    },
    created_at: {
        type: Number,
        default: 0,
    },
    updated_at: {
        type: Number,
        default: 0,
    },
},{
    collection: 'FLC_City',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_City",CitySchema);
