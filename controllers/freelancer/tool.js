const functions = require('../../services/functions');
const flcService = require('../../services/freelancer/functions');
const Admin = require('../../models/freelancer/Admin');
const AdminModule = require('../../models/freelancer/AdminModules');
const AdminUser = require('../../models/freelancer/AdminUser');
const Blog = require('../../models/freelancer/Blog');
const Category = require('../../models/freelancer/Category');
const City = require('../../models/freelancer/City');
const City2 = require('../../models/freelancer/City2');
const Jobs = require('../../models/freelancer/Jobs');
const ListThongBao = require('../../models/freelancer/ListThongBao');
const Otp = require('../../models/freelancer/Otp');
const Point = require('../../models/freelancer/Point');
const PointLog = require('../../models/freelancer/PointLog');
const PostCity = require('../../models/freelancer/PostCity');
const PostCityCategory = require('../../models/freelancer/PostCityCategory');
const PriceSetting = require('../../models/freelancer/PriceSetting');
const Proficiency = require('../../models/freelancer/Proficiency');
const RefreshToken = require('../../models/freelancer/RefreshToken');
const RoleModule = require('../../models/freelancer/RoleModule');
const SaveFlc = require('../../models/freelancer/SaveFlc');
const SaveJob = require('../../models/freelancer/SaveJob');
const Skills = require('../../models/freelancer/Skills');
const TableExp = require('../../models/freelancer/TableExp');
const ThongBao = require('../../models/freelancer/ThongBao');
const UserView = require('../../models/freelancer/UserView');
const Vote = require('../../models/freelancer/Vote');
const WorkType = require('../../models/freelancer/WorkType');

exports.admin = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/admin.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await Admin.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        adm_email: data[i].adm_email,
                        adm_pass: data[i].adm_pass,
                        adm_type: data[i].adm_type,
                        created_at: functions.convertTimestamp(data[i].created_at),
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_modules = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/admin_modules.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await AdminModule.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        title: data[i].title,
                        child_title: data[i].child_title,
                        route: data[i].route,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_user = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/admin_user.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await AdminUser.findOneAndUpdate({ adm_id: Number(data[i].adm_id) }, {
                        adm_id: data[i].adm_id,
                        adm_loginname: data[i].adm_loginname,
                        adm_password: data[i].adm_password,
                        adm_name: data[i].adm_name,
                        adm_email: data[i].adm_email,
                        adm_address: data[i].adm_address,
                        adm_phone: data[i].adm_phone,
                        adm_mobile: data[i].adm_mobile,
                        adm_access_module: data[i].adm_access_module,
                        adm_access_category: data[i].adm_access_category,
                        adm_date: data[i].adm_date,
                        adm_isadmin: data[i].adm_isadmin,
                        adm_active: data[i].adm_active,
                        lang_id: data[i].lang_id,
                        adm_delete: data[i].adm_delete,
                        adm_all_category: data[i].adm_all_category,
                        adm_edit_all: data[i].adm_edit_all,
                        admin_id: data[i].admin_id,
                        adm_bophan: data[i].adm_bophan,
                        meta_tit: data[i].meta_tit,
                        meta_des: data[i].meta_des,
                        meta_key: data[i].meta_key,
                        adm_chamngon: data[i].adm_chamngon,
                        adm_sapo: data[i].adm_sapo,
                        adm_city: data[i].adm_city,
                        adm_description: data[i].adm_description,
                        adm_picture: data[i].adm_picture,
                        adm_role: data[i].adm_role,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.blog = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/blog.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await Blog.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        title: data[i].title,
                        content: data[i].content,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.category = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/category.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let created_at = data[i].created_at;
                    if (!functions.checkDate(created_at)) {
                        created_at: 0
                    } else {
                        created_at = functions.convertTimestamp(created_at);
                    }
                    let updated_at = data[i].updated_at;
                    if (!functions.checkDate(updated_at)) {
                        updated_at: 0
                    } else {
                        updated_at = functions.convertTimestamp(updated_at);
                    }
                    await Category.findOneAndUpdate({ id_category: Number(data[i].id_category) }, {
                        id_category: data[i].id_category,
                        category_name: data[i].category_name,
                        created_at: created_at,
                        // updated_at: updated_at,
                        meta_title: data[i].meta_title,
                        meta_description: data[i].meta_description,
                        meta_key: data[i].meta_key,
                        content: data[i].content,
                        title_suggest: data[i].title_suggest,
                        title_suggest1: data[i].title_suggest1,
                        content_suggest: data[i].content_suggest,
                        seo_index: data[i].seo_index,
                        url_slug: data[i].url_slug,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.flc_price_setting = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/flc_price_setting.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await PriceSetting.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        flc_id: data[i].flc_id,
                        job_id: data[i].job_id,
                        salary: data[i].salary,
                        flc_email: data[i].flc_email,
                        employee_id: data[i].employee_id,
                        accept_price_setting: data[i].accept_price_setting,
                        status_work: data[i].status_work,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.flc_save_job = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/flc_save_job.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let created_at = data[i].created_at;
                    if (!functions.checkDate(created_at)) {
                        created_at: 0
                    } else {
                        created_at = functions.convertTimestamp(created_at);
                    }
                    await SaveJob.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        flc_id: data[i].flc_id,
                        job_id: data[i].job_id,
                        created_at: created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.jobs = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/jobs.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let date_bid_start = data[i].date_bid_start;
                    let date_bid_end = data[i].date_bid_end;
                    let date_work_start = data[i].date_work_start;
                    if (functions.checkDate(date_bid_start)) {
                        date_bid_start = functions.convertTimestamp(date_bid_start);
                    } else {
                        date_bid_start = 0;
                    }
                    if (functions.checkDate(date_bid_end)) {
                        date_bid_end = functions.convertTimestamp(date_bid_end);
                    } else {
                        date_bid_end = 0;
                    }
                    if (functions.checkDate(date_work_start)) {
                        date_work_start = functions.convertTimestamp(date_work_start);
                    } else {
                        date_work_start = 0;
                    }

                    await Jobs.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        user_id: data[i].user_id,
                        title_job: data[i].title_job,
                        alias: data[i].alias,
                        category_id: data[i].category_id,
                        skill_id: data[i].skill_id,
                        work_type: data[i].work_type,
                        work_city: data[i].work_city,
                        work_exp: data[i].work_exp,
                        work_des: data[i].work_des,
                        work_file_des: data[i].work_file_des,
                        salary_type: data[i].salary_type,
                        salary_permanent_number: data[i].salary_permanent_number,
                        salary_estimate_number_1: data[i].salary_estimate_number_1,
                        salary_salary_estimate_number_2: data[i].salary_salary_estimate_number_2,
                        salary_permanent_date: data[i].salary_permanent_date,
                        salary_estimates_date: data[i].salary_estimates_date,
                        date_bid_start: date_bid_start,
                        date_bid_end: date_bid_end,
                        date_work_start: date_work_start,
                        working_term: data[i].working_term,
                        job_type: data[i].job_type,
                        company_logo: data[i].company_logo,
                        created_at: data[i].created_at,
                        updated_at: data[i].updated_at,
                        seo_index: data[i].seo_index,
                        duyet_tin: data[i].duyet_tin,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.otp = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/otp.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await Otp.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        email: data[i].email,
                        code: data[i].code,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.point = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/point.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await Point.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        employer_id: data[i].employer_id,
                        point_free: data[i].point_free,
                        point: data[i].point,
                        reset_date: data[i].reset_date,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.point_log = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/point_log.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await PointLog.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        employer_id: data[i].employer_id,
                        flc_id: data[i].flc_id,
                        type: data[i].type,
                        viewed_date: data[i].viewed_date,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.post_city = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/post_city.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await PostCity.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        meta_title: data[i].meta_title,
                        meta_description: data[i].meta_description,
                        meta_key: data[i].meta_key,
                        content: data[i].content,
                        title_suggest: data[i].title_suggest,
                        content_suggest: data[i].content_suggest,
                        seo_index: data[i].seo_index,
                        url_slug: data[i].url_slug,
                        created_at: data[i].created_at,
                        cit_id: data[i].cit_id,
                        updated_at: data[i].updated_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.post_city_category = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/post_city_category.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let created_at = data[i].created_at;
                    let updated_at = data[i].updated_at;
                    if (functions.checkDate(created_at)) {
                        created_at = functions.convertTimestamp(created_at);
                    } else {
                        created_at = 0;
                    }
                    if (functions.checkDate(updated_at)) {
                        updated_at = functions.convertTimestamp(updated_at);
                    } else {
                        updated_at = 0;
                    }
                    await PostCityCategory.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        title: data[i].title,
                        meta_description: data[i].meta_description,
                        meta_key: data[i].meta_key,
                        content: data[i].content,
                        content_suggest: data[i].content_suggest,
                        seo_index: data[i].seo_index,
                        created_at: created_at,
                        updated_at: updated_at,
                        cit_id: data[i].cit_id,
                        category_id: data[i].category_id,
                        skill_id: data[i].skill_id,
                        slug_url: data[i].slug_url,
                        title_suggest: data[i].title_suggest,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.proficiency = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/proficiency.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let updated_at = data[i].updated_at;
                    if (functions.checkDate(updated_at)) {
                        updated_at = functions.convertTimestamp(updated_at);
                    } else {
                        updated_at = 0;
                    }
                    await Proficiency.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        name: data[i].name,
                        img: data[i].img,
                        id_user: data[i].id_user,
                        type_proficiency: data[i].type_proficiency,
                        updated_at: updated_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.refresh_token = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/refresh_token.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await RefreshToken.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        user_id: data[i].user_id,
                        update_time: data[i].update_time,
                        refresh_token: data[i].refresh_token,
                        type: data[i].type,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.role_module = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/role_module.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await RoleModule.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        adm_id: data[i].adm_id,
                        module_id: data[i].module_id,
                        create: data[i].create,
                        update: data[i].update,
                        delete: data[i].delete,
                        show: data[i].show,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.save_flc = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/save_flc.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await SaveFlc.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        employer_id: data[i].employer_id,
                        flc_id: data[i].flc_id,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.skills = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/skills.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await Skills.findOneAndUpdate({ id_skill: Number(data[i].id_skill) }, {
                        id_skill: data[i].id_skill,
                        skill_name: data[i].skill_name,
                        category_id: data[i].category_id,
                        meta_title: data[i].meta_title,
                        meta_description: data[i].meta_description,
                        meta_key: data[i].meta_key,
                        content: data[i].content,
                        title_suggest: data[i].title_suggest,
                        content_suggest: data[i].content_suggest,
                        created_at: data[i].created_at,
                        updated_at: data[i].updated_at,
                        seo_index: data[i].seo_index,
                        url_slug: data[i].url_slug,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.table_exp = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/table_exp.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await TableExp.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        exp_name: data[i].exp_name,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.tb_list_thong_bao = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/tb_list_thong_bao.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let time_tb = data[i].time_tb;
                    if (functions.checkDate(time_tb)) {
                        time_tb = functions.convertTimestamp(time_tb);
                    } else {
                        time_tb = 0;
                    }
                    await ListThongBao.findOneAndUpdate({ id_list: Number(data[i].id_list) }, {
                        id_list: data[i].id_list,
                        id_nguoi_gui: data[i].id_nguoi_gui,
                        id_nguoi_nhan: data[i].id_nguoi_nhan,
                        td_loai_tb: data[i].td_loai_tb,
                        id_tin: data[i].id_tin,
                        time_tb: time_tb,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.thong_bao = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/thong_bao.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await ThongBao.findOneAndUpdate({ tb_id: Number(data[i].tb_id) }, {
                        tb_id: data[i].tb_id,
                        ten_tb: data[i].ten_tb,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.user_views = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/user_views.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await UserView.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        flc_id: data[i].flc_id,
                        employer_id: data[i].employer_id,
                        allow_view: data[i].allow_view,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.vote = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/vote.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let created_at = data[i].created_at;
                    if (functions.checkDate(created_at)) {
                        created_at = functions.convertTimestamp(created_at);
                    } else {
                        created_at = 0;
                    }
                    await Vote.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        flc_id: data[i].flc_id,
                        employer_id: data[i].employer_id,
                        job_id: data[i].job_id,
                        star: data[i].star,
                        status: data[i].status,
                        created_at: created_at,
                        type_vote: data[i].type_vote,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.work_type = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/work_type.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await WorkType.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id: data[i].id,
                        work_name: data[i].work_name,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.city = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/city.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let created_at = data[i].created_at;
                    let updated_at = data[i].updated_at;
                    if (functions.checkDate(created_at)) {
                        created_at = functions.convertTimestamp(created_at);
                    } else {
                        created_at = 0;
                    }
                    if (functions.checkDate(updated_at)) {
                        updated_at = functions.convertTimestamp(updated_at);
                    } else {
                        updated_at = 0;
                    }
                    await City.findOneAndUpdate({ cit_id: Number(data[i].cit_id) }, {
                        cit_id: data[i].cit_id,
                        cit_name: data[i].cit_name,
                        cit_order: data[i].cit_order,
                        cit_type: data[i].cit_type,
                        cit_count: data[i].cit_count,
                        cit_tw: data[i].cit_tw,
                        meta_title: data[i].meta_title,
                        meta_description: data[i].meta_description,
                        meta_key: data[i].meta_key,
                        content: data[i].content,
                        title_suggest: data[i].title_suggest,
                        content_suggest: data[i].content_suggest,
                        seo_index: data[i].seo_index,
                        url_slug: data[i].url_slug,
                        created_at: created_at,
                        updated_at: updated_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.city2 = async (req, res, next) => {
    try {
        let page = 1
        let result = true;
        do {
            let response = await flcService.getDataAxios('https://freelancer.timviec365.vn/api_node/city2.php?page=' + page);
            let data = response.data.item;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await City2.findOneAndUpdate({ cit_id: Number(data[i].cit_id) }, {
                        cit_id: data[i].cit_id,
                        cit_name: data[i].cit_name,
                        cit_order: data[i].cit_order,
                        cit_type: data[i].cit_type,
                        cit_count: data[i].cit_count,
                        cit_parent: data[i].cit_parent,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

// exports.toolUser = async (req, res) => {
//     try {
//         const {
//             id_user,
//             email,
//             phone,
//             name,
//             password,
//             city_id,
//             district_id,
//             sex,
//             birthday,
//             avatar,
//             salary_type,
//             salary_permanent_number,
//             salary_estimate_number_1,
//             salary_salary_estimate_number_2,
//             salary_permanent_date,
//             user_type,
//             hide_uv,
//             category_id,
//             skill_detail,
//             user_active,
//             created_at,
//             updated_at,
//             time_login,
//             user_des,
//             skill_year,
//             form_of_work,
//             work_desire,
//             user_job,
//             work_place,
//             ten_file,
//             file,
//             index,
//             token,
//             otp,
//             time_otp,
//             type
//         } = req.body;

//         await 

//     } catch (error) {
//         return functions.setError(res, error.message);
//     }
// }