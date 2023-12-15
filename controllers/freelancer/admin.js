const Admin = require('../../models/freelancer/Admin');
const AdminUser = require('../../models/freelancer/AdminUser');
const RoleModule = require('../../models/freelancer/RoleModule');
const AdminModules = require('../../models/freelancer/AdminModules');
const Jobs = require('../../models/freelancer/Jobs');
const Category = require('../../models/freelancer/Category');
const Skills = require('../../models/freelancer/Skills');
const PostCityCategory = require('../../models/freelancer/PostCityCategory');
const Users = require('../../models/Users');
const City = require('../../models/freelancer/City');
const City2 = require('../../models/freelancer/City2');
const Point = require('../../models/freelancer/Point');
const functions = require('../../services/functions');
const flcService = require('../../services/freelancer/functions');
const md5 = require('md5');
const folder_img_uv = "user_uv";
const folder_img_ntd = "user_ntd";

exports.loginAdmin = async (req, res, next) => {
  try {
    let { adm_email, adm_pass } = req.body;
    if (adm_email && adm_pass) {
      let admin = await Admin.findOne({ adm_email: adm_email });
      if (admin) {
        let checkPassword = await functions.verifyPassword(adm_pass, admin.adm_pass);
        if (checkPassword) {
          const token = await functions.createToken(admin, "1d");
          return functions.success(res, 'Đăng nhập thành công', { token: token })
        }
        return functions.setError(res, "Wrong password", 407);
      }
      return functions.setError(res, "Not admin or not active!", 406);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.changePasswordAdmin = async (req, res, next) => {
  try {
    let { id_admin, password } = req.body;
    if (id_admin && password) {
      let findUser = await AdminUser.findOneAndUpdate({ adm_id: id_admin }, { adm_password: md5(password) }, { new: true });
      if (findUser) {
        return functions.success(res, "Update password success!");
      }
      return functions.setError(res, "Admin not found", 404);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.listTag = async (req, res, next) => {
  try {
    let id = req.body.id;
    let condition = {};
    if (id) condition.id_skill = Number(id);
    listTag = await Skills.aggregate([
      { $match: condition },
      {
        $lookup: {
          from: "FLC_Category",
          localField: "category_id",
          foreignField: "id_category",
          as: "Category"
        }
      },
      { $unwind: { path: "$Category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "id_skill": "$id_skill",
          "skill_name": "$skill_name",
          "category_id": "$category_id",
          "category_name": "$Category.category_name",
        }
      },
      { $sort: { id_skill: 1 } }
    ])
    let total = await functions.findCount(Skills, condition);
    return functions.success(res, "get list tag success: ", { total, data: listTag });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.createTag = async (req, res, next) => {
  try {
    let { category_id, skill_name } = req.body;
    if (category_id && skill_name) {
      let maxId = await functions.getMaxIdByField(Skills, 'id_skill');
      let newSkill = new Skills({
        id_skill: maxId,
        skill_name: skill_name,
        category_id: category_id
      });
      await newSkill.save();
      return functions.success(res, "Create skill success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateTag = async (req, res, next) => {
  try {
    let { id, category_id, skill_name } = req.body;
    if (id && category_id && skill_name) {
      id = Number(id);
      let skill = await Skills.findOneAndUpdate({ id_skill: id }, { category_id: category_id, skill_name: skill_name }, { new: true });
      if (skill) {
        return functions.success(res, "Update skill success!");
      }
      return functions.setError(res, "skill not found!", 404);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.baiVietTinhThanh = async (req, res, next) => {
  try {
    let { page, pageSize, id } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let condition = {};
    if (id) condition.cit_id = Number(id);
    let field = { cit_id: 1, cit_name: 1, content: 1, title_suggest: 1, content_suggest: 1 };
    let listCity = await functions.pageFindWithFields(City, condition, field, { cit_id: 1 }, skip, pageSize);
    let total = await functions.findCount(City, condition);
    return functions.success(res, "lay ra ds bai viet tinh thanh thanh cong:", { total, data: listCity });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateBaiVietTinhThanh = async (req, res, next) => {
  try {
    let { cit_id, content, title_suggest, content_suggest } = req.body;
    if (cit_id && content && title_suggest && content_suggest) {
      cit_id = Number(cit_id);
      let update_city = await City.findOneAndUpdate({ cit_id: cit_id }, {
        content: content,
        title_suggest: title_suggest,
        content_suggest: content_suggest,
      }, { new: true });
      if (update_city) {
        return functions.success(res, "update bai viet tinh thanh thanh cong:");
      }
      return functions.setError(res, "Update bai viet that bai, city not found!");
    }
    return functions.setError(res, "Missing input value!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.baiVietLinhVuc = async (req, res, next) => {
  try {
    let { page, pageSize, id } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let condition = {};
    if (id) condition.id_category = Number(id);
    let field = { id_category: 1, category_name: 1, content: 1, title_suggest1: 1, content_suggest: 1 };
    let listCategory = await functions.pageFindWithFields(Category, condition, field, { id_category: 1 }, skip, pageSize);
    let total = await functions.findCount(Category, condition);
    return functions.success(res, "lay ra ds bai viet tinh thanh thanh cong:", { total, data: listCategory });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateBaiVietLinhVuc = async (req, res, next) => {
  try {
    let { id_category, content, title_suggest1, content_suggest } = req.body;
    if (id_category && content && title_suggest1 && content_suggest) {
      id_category = Number(id_category);
      let update_category = await Category.findOneAndUpdate({ id_category: id_category }, {
        content: content,
        title_suggest1: title_suggest1,
        content_suggest: content_suggest,
      }, { new: true });
      if (update_category) {
        return functions.success(res, "update bai viet linh vuc thanh cong:");
      }
      return functions.setError(res, "Update bai viet that bai, category not found!");
    }
    return functions.setError(res, "Missing input value!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.baiVietTag = async (req, res, next) => {
  try {
    let { page, pageSize, id } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let condition = {};
    if (id) condition.id_skill = Number(id);
    let field = { id_skill: 1, skill_name: 1, content: 1, title_suggest: 1, content_suggest: 1 };
    let listSkill = await functions.pageFindWithFields(Skills, condition, field, { id_skill: 1 }, skip, pageSize);
    let total = await functions.findCount(Skills, condition);
    return functions.success(res, "lay ra ds bai viet tinh thanh thanh cong:", { total, data: listSkill });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateBaiVietTag = async (req, res, next) => {
  try {
    let { id_skill, content, title_suggest, content_suggest } = req.body;
    if (id_skill && content && title_suggest && content_suggest) {
      id_skill = Number(id_skill);
      let update_skill = await Skills.findOneAndUpdate({ id_skill: id_skill }, {
        content: content,
        title_suggest: title_suggest,
        content_suggest: content_suggest,
      }, { new: true });
      if (update_skill) {
        return functions.success(res, "update bai viet tag thanh cong:");
      }
      return functions.setError(res, "Update bai viet that bai, skill not found!");
    }
    return functions.setError(res, "Missing input value!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.baiVietCityCate = async (req, res, next) => {
  try {
    let { page, pageSize, id, type } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let condition = {};
    if (id) condition.id = Number(id);
    if (type == 1) {
      condition.skill_id = null;
    } else {
      condition.category_id = null;
    }
    let listCityTag = await PostCityCategory.aggregate([
      { $match: condition },
      { $sort: { id: 1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "FLC_Skills",
          localField: "skill_id",
          foreignField: "id_skill",
          as: "Skill"
        }
      },
      { $unwind: { path: "$Skill", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_Category",
          localField: "category_id",
          foreignField: "id_category",
          as: "Category"
        }
      },
      { $unwind: { path: "$Category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_City",
          localField: "cit_id",
          foreignField: "cit_id",
          as: "City"
        }
      },
      { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "id": "$id",
          "skill_id": "$skill_id",
          "category_id": "$category_id",
          "cit_id": "$cit_id",
          "content": "$content",
          "title_suggest": "$title_suggest",
          "content_suggest": "$content_suggest",
          "skill_name": "$Skill.skill_name",
          "category_name": "$Category.category_name",
          "cit_name": "$City.cit_name",
        }
      },
    ])

    let total = await functions.findCount(PostCityCategory, condition);
    return functions.success(res, "lay ra ds bai viet tinh thanh thanh cong:", { total, data: listCityTag });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateBaiVietCityCate = async (req, res, next) => {
  try {
    let { id, content, title_suggest, content_suggest } = req.body;
    if (id && content && title_suggest && content_suggest) {
      id = Number(id);
      let update_cityCate = await PostCityCategory.findOneAndUpdate({ id: id }, {
        content: content,
        title_suggest: title_suggest,
        content_suggest: content_suggest,
      }, { new: true });
      if (update_cityCate) {
        return functions.success(res, "update bai viet city tag thanh cong:");
      }
      return functions.setError(res, "Update bai viet that bai, city tag not found!");
    }
    return functions.setError(res, "Missing input value!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.getListJob = async (req, res, next) => {
  try {
    let { type, page, pageSize, keyword, city, category, skill, id } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let condition = {};
    //2 => du an, 1=> ban tg
    if (type == 1) condition.job_type = 1;
    if (type == 2) condition.job_type = 0;

    if (keyword) condition.title_job = new RegExp(keyword, 'i');
    if (city) condition.work_city = Number(city);
    if (category) condition.category_id = Number(category);
    if (skill) condition.skill_id = Number(skill);
    if (id) condition.id = Number(id);

    let listJob = await Jobs.aggregate([
      { $match: condition },
      { $sort: { id: 1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "user_id",
          foreignField: "idTimViec365",
          pipeline: [
            { $match: { idTimViec365: { $nin: [0, null] } } },
          ],
          as: "NTD"
        }
      },
      { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_Category",
          localField: "category_id",
          foreignField: "id_category",
          as: "Category"
        }
      },
      { $unwind: { path: "$Category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_Skills",
          localField: "skill_id",
          foreignField: "id_skill",
          as: "Skills"
        }
      },
      { $unwind: { path: "$Skills", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_City",
          localField: "work_city",
          foreignField: "cit_id",
          as: "City"
        }
      },
      { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "id": "$id",
          "user_id": "$user_id",
          "title_job": "$title_job",
          "alias": "$alias",
          "company_logo": "$company_logo",
          "skill_id": "$skill_id",
          "work_city": "$work_city",
          "category_id": "$category_id",
          "work_des": "$work_des",
          "date_bid_end": "$date_bid_end",
          "job_type": "$job_type",
          "work_type": "$work_type",
          "salary_type": "$salary_type",
          "work_exp": "$work_exp",
          "salary_permanent_number": "$salary_permanent_number",
          "salary_estimate_number_1": "$salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$salary_salary_estimate_number_2",
          "salary_permanent_date": "$salary_permanent_date",
          "date_bid_start": "$date_bid_start",
          "date_bid_end": "$date_bid_end",
          "date_work_start": "$date_work_start",
          "working_term": "$working_term",
          "updated_at": "$updated_at",
          "duyet_tin": "$duyet_tin",
          "userName": "$NTD.userName",
          "avatarUser": "$NTD.avatarUser",
          "cit_name": "$City.cit_name",
          "skill_name": "$Skills.skill_name",
          "category_name": "$Category.category_name",

        }
      }
    ]);
    let total = await functions.findCount(Jobs, condition);
    for (let i = 0; i < listJob.length; i++) {

      listJob[i].linkLogo = flcService.getLink(listJob[i].company_logo);
      listJob[i].linkAvatar = flcService.getLink(listJob[i].avatarUser);
    }
    return functions.success(res, "get list job working success", { total, data: listJob });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.duyetTin = async (req, res, next) => {
  try {
    let id = req.body.id;
    if (id) {
      let job = await Jobs.findOneAndUpdate({ id: id }, { duyet_tin: 1 }, { new: true });
      if (job) {
        return functions.success(res, "Duyet tin thanh cong!");
      }
      return functions.setError(res, "Job not found!", 404);
    }
    return functions.setError(res, "Missing input id", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateJob = async (req, res, next) => {
  try {
    let { tieu_de, linh_vuc, nn_ct, ht_work, thanh_pho, kinh_nghiem, mo_ta, ht_luong,
      luong, luong_1, luong_2, ht_luong_time, begin_date, finish_date, begin_work, thoi_han, id }
      = req.body;
    let time = functions.convertTimestamp(Date.now());
    if (id && tieu_de && linh_vuc && nn_ct && ht_work && thanh_pho && kinh_nghiem && mo_ta && ht_luong && ht_luong_time && begin_date && finish_date && begin_work && thoi_han) {
      id = Number(id);
      let job = await Jobs.findOne({ id: id });
      if (job) {
        let alias = functions.renderAlias(tieu_de);
        let checkTieuDe = await Jobs.findOne({ alias: alias, user_id: job.user_id });
        let checkTitle = flcService.checkTitle(tieu_de);
        if (!checkTitle) {
          return functions.setError(res, "Tieu de khong duoc chua ky tu dac biet!", 400);
        }
        if (alias == job.alias || !checkTieuDe) {
          let checkSeo = await Jobs.findOne({ category_id: linh_vuc, skill_id: nn_ct, work_city: thanh_pho, id: { $ne: id } });
          if (!checkSeo) {
            let checkDate1 = functions.checkDate(begin_date);
            let checkDate2 = functions.checkDate(finish_date);
            let checkDate3 = functions.checkDate(begin_work);
            if (checkDate1 && checkDate2 && checkDate3) {
              begin_date = functions.convertTimestamp(begin_date);
              finish_date = functions.convertTimestamp(finish_date);
              begin_work = functions.convertTimestamp(begin_work);
              if (begin_date < finish_date) {
                if (begin_date < begin_work) {
                  if (begin_date >= time) {
                    if (!luong) luong = 0;
                    if (!luong_1) luong_1 = 0;
                    if (!luong_2) luong_2 = 0;
                    if (luong_1 && luong_2) {
                      if (luong_1 > luong_2) return functions.setError(res, "luong_1 must < luong_2", 405);
                    }
                    let job = await Jobs.findOneAndUpdate({ id: id }, {
                      title_job: tieu_de,
                      category_id: linh_vuc,
                      skill_id: nn_ct,
                      work_type: ht_work,
                      work_city: thanh_pho,
                      work_exp: kinh_nghiem,
                      work_des: mo_ta,
                      salary_type: ht_luong,
                      salary_permanent_number: luong,
                      salary_estimate_number_1: luong_1,
                      salary_salary_estimate_number_2: luong_2,
                      salary_permanent_date: ht_luong_time,
                      date_bid_start: begin_date,
                      date_bid_end: finish_date,
                      date_work_start: begin_work,
                      working_term: thoi_han,
                      updated_at: time,
                      alias: alias
                    });
                    if (job) {
                      return functions.success(res, "Update job success!");
                    }
                    return functions.setError(res, "Update job fail!");
                  }
                  return functions.setError(res, "Ngày bắt đầu đặt giá sau ngày đăng tin", 405);
                }
                return functions.setError(res, "Ngày bắt đầu làm việc phải sau ngày bắt đầu đặt giá", 405);
              }
              return functions.setError(res, "Ngày đặt giá kết thúc phải sau ngày bắt đầu đặt giá", 405);
            }
            return functions.setError(res, "Invalid date!", 405);
          }
          return functions.setError(res, "Linh vuc, ky nang, thanh pho da ton tai o 1 job khac!", 405);
        }
        return functions.setError(res, "Tieu de bi trung", 405);
      }
      return functions.setError(res, "Job not found!", 404);
    };
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    let { ntd_id, tieu_de, linh_vuc, nn_ct, ht_work, thanh_pho, kinh_nghiem, mo_ta, ht_luong,
      luong, luong_1, luong_2, ht_luong_time, begin_date, finish_date, begin_work, thoi_han, insert_type }
      = req.body;
    let time = functions.convertTimestamp(Date.now());
    if (ntd_id && tieu_de && linh_vuc && nn_ct && ht_work && thanh_pho && kinh_nghiem && mo_ta && ht_luong && ht_luong_time && begin_date && finish_date && begin_work && thoi_han) {
      let alias = functions.renderAlias(tieu_de);
      let checkTieuDe = await Jobs.findOne({ alias: alias, user_id: ntd_id });
      let checkTitle = flcService.checkTitle(tieu_de);
      if (checkTitle) {
        if (!checkTieuDe) {
          let checkSeo = await Jobs.findOne({ category_id: linh_vuc, skill_id: nn_ct, work_city: thanh_pho });
          if (!checkSeo) {
            let checkDate1 = functions.checkDate(begin_date);
            let checkDate2 = functions.checkDate(finish_date);
            let checkDate3 = functions.checkDate(begin_work);
            if (checkDate1 && checkDate2 && checkDate3) {
              begin_date = functions.convertTimestamp(begin_date);
              finish_date = functions.convertTimestamp(finish_date);
              begin_work = functions.convertTimestamp(begin_work);
              if (begin_date < finish_date) {
                if (begin_date < begin_work) {
                  if (begin_date >= time) {
                    if (!luong) luong = 0;
                    if (!luong_1) luong_1 = 0;
                    if (!luong_2) luong_2 = 0;
                    if (luong_1 && luong_2) {
                      if (luong_1 > luong_2) return functions.setError(res, "luong_1 must < luong_2", 405);
                    }
                    //neu insert_type = 1 => viec lam ban thoi gian 
                    //neu insert_type = 0 => viec lam du an 
                    //mac dinh se them cho du an
                    let job_type = 0;
                    if (insert_type == 1) {
                      job_type = 1;
                    }
                    let maxId = await functions.getMaxIdByField(Jobs, 'id');
                    let job = new Jobs({
                      id: maxId,
                      title_job: tieu_de,
                      category_id: linh_vuc,
                      skill_id: nn_ct,
                      work_type: ht_work,
                      work_city: thanh_pho,
                      work_exp: kinh_nghiem,
                      work_des: mo_ta,
                      salary_type: ht_luong,
                      salary_permanent_number: luong,
                      salary_estimate_number_1: luong_1,
                      salary_salary_estimate_number_2: luong_2,
                      salary_permanent_date: ht_luong_time,
                      date_bid_start: begin_date,
                      date_bid_end: finish_date,
                      date_work_start: begin_work,
                      working_term: thoi_han,
                      user_id: ntd_id,
                      job_type: job_type,
                      updated_at: time,
                      alias: alias
                    });
                    job = await job.save();
                    if (job) {
                      return functions.success(res, "Create job success!");
                    }
                    return functions.setError(res, "Create job fail!");
                  }
                  return functions.setError(res, "Ngày bắt đầu đặt giá sau ngày đăng tin", 405);
                }
                return functions.setError(res, "Ngày bắt đầu làm việc phải sau ngày bắt đầu đặt giá", 405);
              }
              return functions.setError(res, "Ngày đặt giá kết thúc phải sau ngày bắt đầu đặt giá", 405);
            }
            return functions.setError(res, "Invalid date!", 405);
          }
          return functions.setError(res, "Linh vuc, ky nang, thanh pho da ton tai o 1 job khac!", 405);
        }
        return functions.setError(res, "Tieu de bi trung", 405);
      }
      return functions.setError(res, "Tieu de khong duoc chua ky tu dac biet!", 400);
    };
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.napDiem = async (req, res, next) => {
  try {
    let { id_ntd, diem } = req.body;
    if (id_ntd && diem) {
      id_ntd = Number(id_ntd);
      diem = Number(diem);
      if (diem > 0) {
        let point = await Point.findOne({ employer_id: id_ntd });
        if (point) {
          let old_point = point.point ? point.point : 0;
          await Point.findOneAndUpdate({ employer_id: id_ntd }, { point: old_point + diem }, { new: true });
          return functions.success(res, "Cong diem cho ntd thanh cong!");
        }
        return functions.setError(res, "Point of ntd not found!", 400);
      }
      return functions.setError(res, "Diem must >0", 400);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}