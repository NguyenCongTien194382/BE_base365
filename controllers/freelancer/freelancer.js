const functions = require('../../services/functions');
const flcService = require('../../services/freelancer/functions');
const Users = require('../../models/Users');
const Job = require('../../models/freelancer/Jobs');
const Category = require('../../models/freelancer/Category');
const Skills = require('../../models/freelancer/Skills');
const PriceSetting = require('../../models/freelancer/PriceSetting');
const SaveJob = require('../../models/freelancer/SaveJob');
const Vote = require('../../models/freelancer/Vote');
const tmp = require('../../models/freelancer/tmp');

exports.datGia = async (req, res, next) => {
  try {
    let { muc_luong, email_dat_gia, id_vl } = req.body;
    if (muc_luong && email_dat_gia && id_vl) {
      let checkEmail = await functions.checkEmail(email_dat_gia);
      if (checkEmail) {
        id_vl = Number(id_vl);
        let id_flc = req.user.data.idTimViec365;
        let job = await Job.findOne({ id: id_vl });
        if (job) {
          let checkDatGia = await PriceSetting.findOne({ flc_id: id_flc, job_id: id_vl });
          if (checkDatGia) {
            if (checkDatGia.accept_price_setting == 2) {
              let update_priceSet = await PriceSetting.findOneAndUpdate({ flc_id: id_flc, job_id: id_vl }, {
                salary: muc_luong,
                flc_email: email_dat_gia,
                accept_price_setting: 0
              }, { new: true });
              return functions.success(res, 'NTD đã từ chối đặt giá của bạn.Bạn đã đặt lại giá thành công!');
            } else {
              return functions.setError(res, "Bạn đã đặt giá cho công việc này!");
            }
          }
          let maxId = await functions.getMaxIdByField(PriceSetting, 'id');
          let datGia = new PriceSetting({
            id: maxId,
            salary: muc_luong,
            flc_email: email_dat_gia,
            job_id: job.id,
            employee_id: job.user_id,
            flc_id: id_flc,
          });
          datGia = await datGia.save();
          if (datGia) {
            return functions.success(res, "Dat gia thanh cong!");
          }
          return functions.setError(res, "Dat gia that bai!");
        }
        return functions.setError(res, "Job not found!", 404);
      }
      return functions.setError(res, "Email không hợp lệ!", 405);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.getInfo = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let flc = await Users.aggregate([
      { $match: { idTimViec365: flc_id, type: 0 } },
      {
        $lookup: {
          from: "FLC_City2",
          localField: "city",
          foreignField: "cit_id",
          as: "City"
        }
      },
      { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_City2",
          localField: "district",
          foreignField: "cit_id",
          as: "District"
        }
      },
      { $unwind: { path: "$District", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_TableExp",
          localField: "inforFreelancer.skill_year",
          foreignField: "id",
          as: "Exp"
        }
      },
      { $unwind: { path: "$Exp", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_WorkType",
          localField: "inforFreelancer.form_of_work",
          foreignField: "id",
          as: "WorkType"
        }
      },
      { $unwind: { path: "$WorkType", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_Category",
          localField: "inforFreelancer.work_desire",
          foreignField: "id_category",
          as: "Category"
        }
      },
      { $unwind: { path: "$Category", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "FLC_City2",
          localField: "inforFreelancer.work_place",
          foreignField: "cit_id",
          as: "WorkPlace"
        }
      },
      { $unwind: { path: "$WorkPlace", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          "userName": "$userName",
          "email": "$email",
          "phone": "$phone",
          "avatarUser": "$avatarUser",
          "city": "$city",
          "district": "$district",
          "address": "$address",
          "birthday": "$inForPerson.account.birthday",
          "gender": "$inForPerson.account.gender",
          "cit_name": "$City.cit_name",
          "dis_name": "$District.cit_name",
          "skill_year": "$inforFreelancer.skill_year",
          "exp_title": "$Exp.exp_name",
          "user_des": "$inforFreelancer.user_des",
          "user_job": "$inforFreelancer.user_job",
          "form_of_work": "$inforFreelancer.form_of_work",
          "work_desire": "$inforFreelancer.work_desire",
          "work_place": "$inforFreelancer.work_place",
          "salary_type": "$inforFreelancer.salary_type",
          "salary_permanent_number": "$inforFreelancer.salary_permanent_number",
          "salary_estimate_number_1": "$inforFreelancer.salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$inforFreelancer.salary_salary_estimate_number_2",
          "salary_permanent_date": "$inforFreelancer.salary_permanent_date",
          "hide_uv": "$inforFreelancer.hide_uv",
          "category_id": "$inforFreelancer.category_id",
          "skill_detail": "$inforFreelancer.skill_detail",
          "WorkType": "$WorkType.work_name",
          "Category": "$Category.category_name",
          "WorkPlace": "$WorkPlace.cit_name",
          "tenFile": "$inforFreelancer.ten_file",
          "file": "$inforFreelancer.file",
          "createdAt": 1,
          "userName": 1
        }
      }
    ]);
    flc = flc[0];
    flc.linkAvatar = flcService.getLinkAvatar(flc.createdAt, flc.avatarUser);
    const nganhnghe = [
      { "value": 0, "label": "Chọn ngành nghề" },
      { "value": 1, "label": "IT & Lập trình" },
      { "value": 2, "label": "Thiết kế" },
      { "value": 3, "label": "Video" },
      { "value": 4, "label": "Xây dựng" },
      { "value": 5, "label": "Viết lách" },
      { "value": 6, "label": "Dịch thuật" },
      { "value": 7, "label": "Kinh doanh" },
      { "value": 8, "label": "Nhập liệu" },
      { "value": 9, "label": "Kế toán" },
      { "value": 10, "label": "Luật" },
      { "value": 11, "label": "Kiến trúc" },
      { "value": 12, "label": "Lĩnh vực khác" }
    ];
    if (flc.category_id && flc.category_id != "") {
      const result = nganhnghe.find(item => item.value == flc.category_id);
      if (result) flc.category_name = result.label;
    }

    if (flc.skill_detail && flc.skill_detail != "") {
      const arrSkill = flc.skill_detail.split(', ');
      const response = await Skills.find({ id_skill: { $in: arrSkill } }, { skill_name: 1 }).lean();
      if (response.length > 0) {
        const arr = [];
        response.map(item => arr.push(item.skill_name))
        flc.skill_detail_name = arr
      }
    }
    return functions.success(res, "get info freelancer success: ", { data: flc });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.getFlcSkill = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let freelancer = await Users.findOne({ idTimViec365: flc_id, type: 0 }, {
      "category_id": "$inforFreelancer.category_id",
      "skill_detail": "$inforFreelancer.skill_detail",
    }).lean();
    let arr_cate = freelancer.category_id;
    if (arr_cate) {
      let listCategory = await Category.find({}, { id_category: 1, category_name: 1 }).lean();
      arr_cate = arr_cate.split(", ");
      let arr_category = [];
      for (let j = 0; j < arr_cate.length; j++) {
        let category = listCategory.filter((e) => e.id_category == arr_cate[j]);
        arr_category.push(category[0]);
      }
      freelancer.arr_category = arr_category;
    }

    // ky nang
    let arr_skill = freelancer.skill_detail;
    if (arr_skill) {
      let listSkill = await Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();
      arr_skill = arr_skill.split(", ");
      let arr_skillname = [];
      for (let j = 0; j < arr_skill.length; j++) {
        let skill = listSkill.filter((e) => e.id_skill == arr_skill[j]);
        arr_skillname.push(skill[0]);
      }
      freelancer.arr_skillname = arr_skillname;
    }
    return functions.success(res, "get info skill freelancer success: ", { data: freelancer });
  } catch (error) {

  }
}

exports.updateInfo = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let { userName, phone, gender, birthday, city, district } = req.body;
    if (userName && phone && gender && birthday && city && district) {
      let checkPhone = await functions.checkPhoneNumber(phone);
      let checkDate = await functions.checkDate(birthday);
      if (checkPhone && checkDate) {
        birthday = functions.convertTimestamp(birthday);
        let time = functions.convertTimestamp(Date.now());
        let flc = await Users.findOneAndUpdate({ idTimViec365: flc_id, type: 0 }, {
          userName: userName,
          phone: phone,
          city: city,
          district: district,
          inForPerson: {
            account: {
              gender: gender,
              birthday: birthday,
            }
          },
          updatedAt: time
        }, { new: true });
        return functions.success(res, "Update info freelancer success");
      }
      return functions.setError(res, "Thông tin nhập vào không hợp lệ!", 401);
    }
    return functions.setError(res, "Nhập vào thiếu thông tin cần thiết!", 401);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateAvatarFreelancer = async (req, res, next) => {
  try {

    if (req.files && req.files.avatar && req.body.type == "register") {
      let avatar = req.files.avatar;
      let id = Number(req.body.id);
      let checkImage = await flcService.checkImage(avatar.path);
      if (checkImage) {
        const data = await tmp.findOne({ id: id }).lean();
        if (data) {
          const idmax_promise = await functions.getMaxUserID('user')
          const _id = idmax_promise._id;
          let time = functions.convertTimestamp(Date.now());
          let path = new Date().toISOString().slice(0, 10).split('-').join('/');

          if (data.type_register == 'uv') path = `uv/${path}`
          let logo = await flcService.uploadImageUV(time, avatar, path);
          await Users.create({
            _id: idmax_promise._id,
            userName: data.userName,
            phoneTK: data.phoneTK,
            phone: data.phone,
            emailContact: data.emailContact,
            email: data.email,
            password: data.password,
            city: data.city,
            district: data.district,
            createdAt: new Date().getTime() / 1000,
            updatedAt: new Date().getTime() / 1000,
            type: data.type_register == 'uv' ? 0 : 1,
            chat365_secret: Buffer.from(_id.toString()).toString('base64'),
            fromWeb: "Freelancer",
            idQLC: idmax_promise._idQLC,
            idTimViec365: idmax_promise._idTV365,
            idRaoNhanh365: idmax_promise._idRN365,
            idGiaSu: idmax_promise._idGiaSu,
            avatarUser: logo,
            "inForPerson.account.birthday": data.birthday,
            "inForPerson.account.gender": data.gender,
            "inforFreelancer.category_id": data.category_id,
            "inforFreelancer.skill_detail": data.skill_detail,
            "inforFreelancer.salary_type": data.salary_type,
            "inforFreelancer.salary_permanent_number": data.salary_permanent_number,
            "inforFreelancer.salary_estimate_number_1": data.salary_estimate_number_1,
            "inforFreelancer.salary_salary_estimate_number_2": data.salary_salary_estimate_number_2,
          })
          await tmp.deleteOne({ id: id });
          const Token = await functions.createToken({
            _id: idmax_promise._id,
            userName: data.name,
            phoneTK: data.phoneTK,
            phone: data.phone,
            emailContact: data.emailContact,
            email: data.email,
            password: data.password,
            city: data.city,
            district: data.district,
            createdAt: new Date().getTime() / 1000,
            updatedAt: new Date().getTime() / 1000,
            type: data.type_register == 'uv' ? 0 : 1,
            chat365_secret: Buffer.from(_id.toString()).toString('base64'),
            fromWeb: "Freelancer",
            idQLC: idmax_promise._idQLC,
            idTimViec365: idmax_promise._idTV365,
            idRaoNhanh365: idmax_promise._idRN365,
            idGiaSu: idmax_promise._idGiaSu,
            avatarUser: logo,
            "inForPerson.account.birthday": data.birthday,
            "inForPerson.account.gender": data.gender,
            "inforFreelancer.category_id": data.category_id,
            "inforFreelancer.skill_detail": data.skill_detail,
            "inforFreelancer.salary_type": data.salary_type,
            "inforFreelancer.salary_permanent_number": data.salary_permanent_number,
            "inforFreelancer.salary_estimate_number_1": data.salary_estimate_number_1,
            "inforFreelancer.salary_salary_estimate_number_2": data.salary_salary_estimate_number_2,
          }, '1h')
          return functions.success(res, "Tạo tài khoản thành công!", {
            token: Token
          });
        }
        return functions.setError(res, "Có lỗi xảy ra!", 400);
      }
      return functions.setError(res, "Ảnh không đúng định dạng hoặc quá kích thước!", 400);
    }
    return functions.setError(res, "Missing input avatar image!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateIntro = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let { skill_year, user_des } = req.body;
    if (!skill_year) skill_year = 0;
    if (!user_des) user_des = "";
    let time = functions.convertTimestamp(Date.now());
    let flc = await Users.findOneAndUpdate({ idTimViec365: flc_id, type: 0 }, {
      "inforFreelancer.skill_year": skill_year,
      "inforFreelancer.user_des": user_des,
      updatedAt: time,
    }, { new: true });
    return functions.success(res, "Update intro freelancer success");
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateCVMM = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let { user_job, form_of_work, work_desire, work_place, salary_type, salary_permanent_number, salary_estimate_number_1, salary_salary_estimate_number_2, salary_permanent_date } = req.body;
    if (!user_job) user_job = "";
    if (form_of_work && work_desire && work_place && salary_type && salary_permanent_date) {
      if (salary_type == 1) {
        if (!salary_permanent_number || salary_permanent_number <= 0) {
          return functions.setError(res, "Lương nhập vào không hợp lệ", 400);
        }
      } else if (salary_type == 2) {
        if (!salary_estimate_number_1 || !salary_salary_estimate_number_2 || salary_estimate_number_1 <= 0 || salary_salary_estimate_number_2 <= 0) {
          return functions.setError(res, "Lương nhập vào không hợp lệ", 400);
        }
      } else {
        return functions.setError(res, "salary_type must = 1,2", 400);
      }
      if (!salary_permanent_number) salary_permanent_number = 0;
      if (!salary_estimate_number_1) salary_estimate_number_1 = 0;
      if (!salary_salary_estimate_number_2) salary_salary_estimate_number_2 = 0;
      let time = functions.convertTimestamp(Date.now());
      let flc = await Users.findOneAndUpdate({ idTimViec365: flc_id, type: 0 }, {
        "inforFreelancer.user_job": user_job,
        "inforFreelancer.form_of_work": form_of_work,
        "inforFreelancer.work_desire": work_desire,
        "inforFreelancer.work_place": work_place,
        "inforFreelancer.salary_type": salary_type,
        "inforFreelancer.salary_permanent_number": salary_permanent_number,
        "inforFreelancer.salary_estimate_number_1": salary_estimate_number_1,
        "inforFreelancer.salary_salary_estimate_number_2": salary_salary_estimate_number_2,
        "inforFreelancer.salary_permanent_date": salary_permanent_date,
        updatedAt: time,
      }, { new: true });
      return functions.success(res, "Thành công");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateSkill = async (req, res, next) => {
  try {
    let { category_id, arr_skill } = req.body;
    if (category_id && arr_skill && arr_skill.length > 0) {
      let flc_id = req.user.data.idTimViec365;
      let skill_detail = arr_skill.join(", ");
      let time = functions.convertTimestamp(Date.now());
      let ten_file = "";
      if (req.files && req.files.file) {
        let file = req.files.file;
        ten_file = await flcService.uploadFile(time, file);
      }
      let flc = await Users.findOneAndUpdate({ idTimViec365: flc_id, type: 0 }, {
        "inforFreelancer.category_id": category_id,
        "inforFreelancer.skill_detail": skill_detail,
        "inforFreelancer.ten_file": ten_file,
        updatedAt: time,
      }, { new: true });
      return functions.success(res, "Update skill freelancer success");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.hideSearch = async (req, res, next) => {
  try {
    let id_flc = req.user.data.idTimViec365;
    let status = req.body.status;
    if (!status) status = 0;
    let time = functions.convertTimestamp(Date.now());
    let updateFlc = await Users.findOneAndUpdate({ idTimViec365: id_flc, type: 0 }, {
      "inforFreelancer.hide_uv": status,
      updatedAt: time
    }, { new: true });
    return functions.success(res, "Update status hide freelancer success");
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.listJobWorking = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 50;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let flc_id = req.user.data.idTimViec365;
    let condition = { flc_id: flc_id, accept_price_setting: 1 };
    let listJobWorking = await PriceSetting.aggregate([
      { $match: condition },
      { $sort: { id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "FLC_Jobs",
          localField: "job_id",
          foreignField: "id",
          as: "Job"
        }
      },
      { $unwind: { path: "$Job", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "id": "$id",
          "flc_id": "$flc_id",
          "job_id": "$job_id",
          "salary": "$salary",
          "flc_email": "$flc_email",
          "employee_id": "$employee_id",
          "accept_price_setting": "$accept_price_setting",
          "status_work": "$status_work",
          "title_job": "$Job.title_job",
          "vote": 1,
          "alias": "$Job.alias",
          "salary_permanent_number": "$Job.salary_permanent_number",
          "salary_type": "$Job.salary_type",
          "salary_estimate_number_1": "$Job.salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$Job.salary_salary_estimate_number_2",
          "date_bid_end": "$Job.date_bid_end",
          "working_term": "$Job.working_term",
          "date_work_start": "$Job.date_work_start",
        }
      }
    ]);
    for (let i = 0; i < listJobWorking.length; i++) {
      let vote = await Vote.findOne({ flc_id: listJobWorking[i].flc_id, job_id: listJobWorking[i].job_id });
      let star = 0;
      if (vote) star = vote.star;
      listJobWorking[i].star = star;
    }
    let total = await functions.findCount(PriceSetting, condition);
    return functions.success(res, "get list job working success", { total, data: listJobWorking });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.danhgiacongviec = async (req, res, next) => {
  try {
    const { star, id } = req.body;
    const userID = req.user.data.idTimViec365;
    if (star && id) {
      const check = await PriceSetting.findOneAndUpdate({ id: Number(id), flc_id: userID }, {
        vote: star
      });
      if (check) return functions.success(res, 'success')
      return functions.setError(res, 'not found', 404)
    }
    return functions.setError(res, 'missing data', 400);
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.listFlcSaveJob = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 8;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let flc_id = req.user.data.idTimViec365;
    let condition = { flc_id: flc_id };
    let listFlcSaveJob = await SaveJob.aggregate([
      { $match: condition },
      { $sort: { id: -1 } },
      // {$skip: skip},
      // {$limit: pageSize},
      {
        $lookup: {
          from: "FLC_Jobs",
          localField: "job_id",
          foreignField: "id",
          as: "Job"
        }
      },
      { $unwind: { path: "$Job", preserveNullAndEmptyArrays: true } },
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
        $project: {
          "id": "$id",
          "flc_id": "$flc_id",
          "job_id": "$job_id",
          "created_at": "$created_at",
          "title_job": "$Job.title_job",
          "alias": "$Job.alias",
          "salary_type": "$Job.salary_type",
          "salary_permanent_number": "$Job.salary_permanent_number",
          "salary_estimate_number_1": "$Job.salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$Job.salary_salary_estimate_number_2",
          "date_bid_end": "$Job.date_bid_end",
          "working_term": "$Job.working_term",
          "date_work_start": "$Job.date_work_start",
          "skill_id": "$Job.skill_id",
          "skill_name": "$Skills.skill_name",
        }
      }
    ]);
    let listSkill = await Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();

    for (let i = 0; i < listFlcSaveJob.length; i++) {
      let arr_skill = listFlcSaveJob[i].skill_id;
      if (arr_skill) {
        arr_skill = arr_skill.split(", ");
        let arr_skillname = [];
        for (let j = 0; j < arr_skill.length; j++) {
          let skill = listSkill.filter((e) => e.id_skill == arr_skill[j]);
          arr_skillname.push(skill[0].skill_name);
        }
        listFlcSaveJob[i].arr_skillname = arr_skillname.join(', ');
      }
    }
    let total = await functions.findCount(SaveJob, condition);
    return functions.success(res, "get list job working success", { total, data: listFlcSaveJob });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.flcSaveJob = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let job_id = req.body.job_id;
    if (job_id) {
      let maxId = await functions.getMaxIdByField(SaveJob, 'id');
      let time = functions.convertTimestamp(Date.now());
      let saveJob = new SaveJob({
        id: maxId,
        flc_id: flc_id,
        job_id: job_id,
        created_at: time
      });
      saveJob = await saveJob.save();
      if (saveJob) {
        return functions.success(res, "Save job success!");
      }
      return functions.setError(res, "Save job fail!");
    }
    return functions.setError(res, "Missing input job_id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.flcDeleteSaveJob = async (req, res, next) => {
  try {
    let flc_id = req.user.data.idTimViec365;
    let id = req.body.id;
    if (id) {
      let saveJob = await SaveJob.findOneAndDelete({ job_id: Number(id), flc_id: flc_id });
      if (saveJob) {
        return functions.success(res, "delete savejob success!");
      }
      return functions.setError(res, "savejob not found!");
    }
    return functions.setError(res, "Missing input id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    let { oldPass, newPass } = req.body;
    let id_flc = req.user.data.idTimViec365;
    let flc = await Users.findOne({ idTimViec365: id_flc, type: 0 });
    if (oldPass && newPass) {
      let checkPassword = await functions.verifyPassword(oldPass, flc.password);
      if (checkPassword) {
        let updatePassword = await Users.findOneAndUpdate({ idTimViec365: id_flc, type: 0 }, {
          password: functions.createMd5(newPass),
        }, { new: true });
        if (updatePassword) {
          return functions.success(res, "Update password success!");
        }
        return functions.setError(res, "Update password fail!", 407);
      }
      return functions.setError(res, "Nhập sai mật khẩu, vui lòng nhập lại!", 406);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateAvatarAfterLogin = async (req, res) => {
  try {
    if (req.files && req.files.avatar) {
      let avatar = req.files.avatar;

      let checkImage = await flcService.checkImage(avatar.path);

      if (checkImage) {
        let id_flc = req.user.data.idTimViec365;
        let path = `uv/${new Date().toISOString().slice(0, 10).split('-').join('/')}`;
        let logo = await flcService.uploadImageUV(new Date().getTime() / 1000, avatar, path);
        await Users.findOneAndUpdate({ idTimViec365: id_flc }, { avatarUser: logo });
        return functions.success(res, 'thành công')
      }
      return functions.setError(res, "Ảnh không đúng định dạng hoặc quá kích thước!", 400);
    }
    return functions.setError(res, 'Missing data', 400);
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.refreshInfo = async (req, res) => {
  try {
    const id_flc = req.user.data.idTimViec365;
    await Users.findOneAndUpdate({ idTimViec365: id_flc }, { updatedAt: Math.round(new Date().getTime() / 1000) });
    return functions.success(res, 'thành công')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.hosonangluc = async (req, res) => {
  try {
    const id_flc = req.user.data.idTimViec365;
    const name = req.body.name;
    if (!req.files && !name || !name) {
      return functions.setError(res, 'missing data', 400)
    }
    if (req.files && req.files.file) {
      let file = req.files.file;
      ten_file = await flcService.uploadFile(new Date().getTime() / 1000, file, id_flc);
      const check = await Users.findOneAndUpdate({ idTimViec365: id_flc }, {
        "inforFreelancer.ten_file": name,
        "inforFreelancer.file": ten_file,
      }, { new: true })
      return functions.success(res, 'thành công')
    }
    await Users.findOneAndUpdate({ idTimViec365: id_flc }, {
      ten_file: name,
    }, { new: true })
    return functions.success(res, 'thành công')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}