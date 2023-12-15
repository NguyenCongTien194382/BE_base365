const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SkillsSchema = new Schema({
    id_skill: {
        type: Number,
        required: true,
    },
    skill_name: {
        type: String,
        default: null,
    },
    category_id: {
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
    content_suggest: {
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
    seo_index: {
        type: Number,
        default: null,
    },
    url_slug: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_Skills',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Skills",SkillsSchema);
