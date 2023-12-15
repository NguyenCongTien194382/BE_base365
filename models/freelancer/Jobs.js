const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobsSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: Number,
        default: null,
    },
    title_job: {
        type: String,
        default: null,
    },
    alias: {
        type: String,
        default: null,
    },
    category_id: {
        type: Number,
        default: null,
    },
    skill_id: {
        type: String,
        default: null,
    },
    work_type: {
        type: Number,
        default: null,
    },
    work_city: {
        type: Number,
        default: null,
    },
    work_exp: {
        type: Number,
        default: null,
    },
    work_des: {
        type: String,
        default: null,
    },
    work_file_des: {
        type: String,
        default: null,
    },
    salary_type: {
        type: Number,
        default: null,
    },
    salary_permanent_number: {
        type: Number,
        default: null,
    },
    salary_estimate_number_1: {
        type: Number,
        default: null,
    },
    salary_salary_estimate_number_2: {
        type: Number,
        default: null,
    },
    salary_permanent_date: {
        type: Number,
        default: null,
    },
    salary_estimates_date: {
        type: Number,
        default: null,
    },
    date_bid_start: {
        type: Number,
        default: null,
    },
    date_bid_end: {
        type: Number,
        default: null,
    },
    date_work_start: {
        type: Number,
        default: null,
    },
    working_term: {
        type: Number,
        default: null,
    },
    job_type: {
        type: Number,
        default: null,
    },
    company_logo: {
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
    duyet_tin: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_Jobs',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Jobs",JobsSchema);
