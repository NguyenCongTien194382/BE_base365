const functions = require('../../services/functions');
const flcService = require('../../services/freelancer/functions');
const Users = require('../../models/Users');
const Job = require('../../models/freelancer/Jobs');
const Category = require('../../models/freelancer/Category');
const Skills = require('../../models/freelancer/Skills');
const PriceSetting = require('../../models/freelancer/PriceSetting');
const ListThongBao = require('../../models/freelancer/ListThongBao');
const Vote = require('../../models/freelancer/Vote');
const SaveFlc = require('../../models/freelancer/SaveFlc');
const Point = require('../../models/freelancer/Point');
const PointLog = require('../../models/freelancer/PointLog');
const UserView = require('../../models/freelancer/UserView');
const City = require('../../models/freelancer/City2');
// const UserView = require('../../models/freelancer/UserView');
const dotenv = require("dotenv");
dotenv.config();
const md5 = require('md5');

//quan ly chung
exports.generalManagement = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 20;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let ntd_id = req.user.data.idTimViec365;
    let time = functions.convertTimestamp(Date.now());
    //cong diem
    let nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    let time_nextday = functions.convertTimestamp(nextDay);
    let total_point = 0;
    let condition = { user_id: ntd_id };
    let point_promise = Point.findOne({ employer_id: ntd_id }).lean();
    let totalFlcSetPrice_promise = functions.findCount(PriceSetting, { employee_id: ntd_id, accept_price_setting: 0 });
    let totalFlcSave_promise = functions.findCount(SaveFlc, { employer_id: ntd_id });
    let totalFlcWorking_promise = functions.findCount(PriceSetting, { employee_id: ntd_id, accept_price_setting: 1, status_work: 1 });
    let totalWorkDone_promise = functions.findCount(PriceSetting, { employee_id: ntd_id, accept_price_setting: 1, status_work: 2 });
    let avatar_promise = Users.findOne({ idTimViec365: ntd_id }, { avatarUser: 1, createdAt: 1 }).lean();
    let logo_promise = Job.findOne({ user_id: ntd_id }, { company_logo: 1 }).lean();
    let listJob_promise = Job.aggregate([
      { $match: condition },
      { $sort: { id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          "id": "$id",
          "title_job": "$title_job",
          "job_type": "$job_type",
          "date_bid_end": "$date_bid_end",
          "alias": "$alias",
          "salary_permanent_number": "$salary_permanent_number",
          "salary_estimate_number_1": "$salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$salary_salary_estimate_number_2",
          "salary_type": "$salary_type",
        }
      }
    ]);
    let listFreelancerSetPrice_promise = PriceSetting.aggregate([
      { $match: { accept_price_setting: 0, employee_id: ntd_id } },
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
        $lookup: {
          from: "Users",
          localField: "flc_id",
          foreignField: "idTimViec365",
          pipeline: [
            { $match: { idTimViec365: { $nin: [0, null] }, type: 0 } },
          ],
          as: "Freelancer"
        }
      },
      { $unwind: { path: "$Freelancer", preserveNullAndEmptyArrays: true } },
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
          "alias": "$Job.alias",
          "salary_permanent_number": "$Job.salary_permanent_number",
          "salary_type": "$Job.salary_type",
          "salary_estimate_number_1": "$Job.salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$Job.salary_salary_estimate_number_2",
          "date_bid_end": "$Job.date_bid_end",
          "working_term": "$Job.working_term",
          "date_work_start": "$Job.date_work_start",
          "flc_name": "$Freelancer.userName",
        }
      }
    ]);

    let [
      point,
      totalFlcSetPrice,
      totalFlcSave,
      totalFlcWorking,
      totalWorkDone,
      listJob,
      listFreelancerSetPrice,
      avatar,
      logo
    ] = await Promise.all([
      point_promise,
      totalFlcSetPrice_promise,
      totalFlcSave_promise,
      totalFlcWorking_promise,
      totalWorkDone_promise,
      listJob_promise,
      listFreelancerSetPrice_promise,
      avatar_promise,
      logo_promise
    ])

    if (!point) {
      let maxIdPoint = await functions.getMaxIdByField(Point, 'id');
      let new_point = new Point({
        id: maxIdPoint,
        employer_id: ntd_id,
        reset_date: time_nextday,
        point_free: 5,
      });
      point = await new_point.save();
    } else if (time > point.reset_date) {
      point = await Point.findOneAndUpdate({ employer_id: ntd_id }, { point_free: 5, reset_date: time_nextday }, { new: true });
    }
    if (point) {
      total_point = point.point + point.point_free;
    }
    //import moment from 'moment';
    for (let i = 0; i < listJob.length; i++) {
      let total_flc_setPrice = await functions.findCount(PriceSetting, { job_id: listJob[i].id, accept_price_setting: 0 });
      listJob[i].total_flc_setPrice = total_flc_setPrice;
      listJob[i].date_bid_end = new Date(listJob[i].date_bid_end * 1000).toISOString().slice(0, 10).split('-').reverse().join('/');
    }
    let avatar_com = flcService.getLinkAvatarCompany(avatar.createdAt, avatar.avatarUser);
    if (avatar.avatarUser == '' || !avatar.avatarUser) avatar_com = null;
    let logo_com = logo ? flcService.getLinkLogoCompany(logo.company_logo) : null;
    return functions.success(res, "thong tin chung: ", { data: { total_point, totalFlcSetPrice, totalFlcSave, totalFlcWorking, totalWorkDone, listJob, listFreelancerSetPrice, avatar_com, logo_com } });
  } catch (error) {
    console.log("🚀 ~ file: company.js:154 ~ exports.generalManagement= ~ error:", error)
    return functions.setError(res, error.message);
  }
}

//refresh job
exports.refreshJob = async (req, res, next) => {
  try {
    let id_job = req.body.id_job;
    if (id_job) {
      id_job = Number(id_job);
      let time = functions.convertTimestamp(Date.now());
      let job = await Job.findOneAndUpdate({ id: id_job }, { updated_at: time }, { new: true });
      if (job) {
        return functions.success(res, "Refresh job success!");
      }
      return functions.setError(res, "Job not found!", 404);
    }
    return functions.setError(res, "Missing input id_job", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.seeContactInfo = async (req, res, next) => {
  try {
    let flc_id = req.body.flc_id;
    let ntd_id = req.user.data.idTimViec365;
    let time = functions.convertTimestamp(Date.now());
    if (flc_id) {
      flc_id = Number(flc_id);
      let freelancer = await Users.findOne({ idTimViec365: flc_id, type: 0 }, { userName: 1, email: 1 });
      if (freelancer) {
        let pointLog = await PointLog.findOne({ employer_id: ntd_id, flc_id: flc_id });
        if (!pointLog) {
          let point = await Point.findOne({ employer_id: ntd_id });
          if (point) {
            let p = point.point;
            let p_free = point.point_free;
            let tru = 1;
            if ((p + p_free) > 0) {
              if (p_free > 0) p_free -= tru;
              else p -= tru;
              //tru diem cua ntd
              await Point.findOneAndUpdate({ employer_id: ntd_id }, { point: p, point_free: p_free }, { new: true });

              //them vao model point_log
              let maxIdPointLog = await functions.getMaxIdByField(PointLog, 'id');
              let pointLog = new PointLog({
                id: maxIdPointLog,
                employer_id: ntd_id,
                flc_id: flc_id,
                type: 1,
                viewed_date: time
              });
              await pointLog.save();

              //them vao model thong bao
              let maxIdTb = await functions.getMaxIdByField(ListThongBao, 'id_list');
              let listThongBao = new ListThongBao({
                id_list: maxIdTb,
                id_nguoi_gui: ntd_id,
                id_nguoi_nhan: flc_id,
                td_loai_tb: 1
              });
              await listThongBao.save();
              //update model user_view
              let userView = await UserView.findOneAndUpdate({ flc_id: flc_id, employer_id: ntd_id }, { allow_view: 2 }, { new: true });

              //gui mail
              let ntd = await Users.findOne({ idTimViec365: ntd_id, type: 1 }, { userName: 1, email: 1 });
              await flcService.sendEmailUv(ntd, freelancer);
              return functions.success(res, "Xem thong tin freelancer thanh cong!");
            }
            return functions.setError(res, "Ban khong co du diem", 400);
          }
          return functions.setError(res, "Ban chua co diem", 400);
        }
        return functions.setError(res, "Ban da co thong tin lien he cua freelancer", 400);
      }
      return functions.setError(res, "Freelancer not found", 400);
    }
    return functions.setError(res, "Missing input flc_id", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.createJob = async (req, res, next) => {
  try {
    let { tieu_de, linh_vuc, nn_ct, ht_work, thanh_pho, kinh_nghiem, mo_ta, ht_luong,
      luong, luong_1, luong_2, ht_luong_time, begin_date, finish_date, begin_work, thoi_han, insert_type }
      = req.body;
    let ntd_id = req.user.data.idTimViec365;
    let time = functions.convertTimestamp(Date.now());
    let time10p = time - 600;
    if (tieu_de && linh_vuc && nn_ct && ht_work && thanh_pho && kinh_nghiem && mo_ta && ht_luong && ht_luong_time && begin_date && finish_date && begin_work && thoi_han) {
      let alias = functions.renderAlias(tieu_de);
      let checkTieuDe = await Job.findOne({ alias: alias, user_id: ntd_id });
      let checkTitle = flcService.checkTitle(tieu_de);
      if (checkTitle) {
        if (!checkTieuDe) {
          let checkSeo = await Job.findOne({ category_id: linh_vuc, skill_id: nn_ct, work_city: thanh_pho });
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
                    let viecLam1 = await Job.find({ user_id: ntd_id, created_at: { $gte: time10p } });
                    let viecLam2 = await Job.find({ user_id: ntd_id, created_at: { $gte: time } });
                    if (viecLam1.length <= 0 && viecLam2.length <= 24) {
                      //
                      let company_logo = null;
                      let file_name = null;
                      if (req.files) {
                        let image = req.files.image;
                        let file = req.files.file;
                        //logo cong ty
                        if (image) {
                          let checkImage = await flcService.checkImage(image.path);
                          if (checkImage) {
                            company_logo = await flcService.uploadImage(time, image);
                          } else {
                            return functions.setError(res, "Anh khong dung dinh dang or qua kich thuoc cho phep!", 400);
                          }
                        }
                        //tep dinh kem
                        if (file) {
                          file_name = await flcService.uploadFile(time, file);
                        }
                      }
                      let maxId = await functions.getMaxIdByField(Job, 'id');
                      let job = new Job({
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
                        company_logo: company_logo,
                        created_at: time,
                        updated_at: time,
                        work_file_des: file_name,
                        alias: alias
                      });
                      job = await job.save();
                      if (job) {
                        return functions.success(res, "Create job success!");
                      }
                      return functions.setError(res, "Create job fail!");
                    };
                    return functions.setError(res, "Mỗi tin của bạn cần đăng cách nhau 10 phút tối đa 24 tin/ngày!", 405);
                  }
                  return functions.setError(res, "Ngày bắt đầu đặt giá sau ngày đăng tin", 405);
                }
                return functions.setError(res, "Ngày bắt đầu làm việc phải sau ngày bắt đầu đặt giá", 405);
              }
              return functions.setError(res, "Ngày đặt giá kết thúc phải sau ngày bắt đầu đặt giá", 405);
            }
            return functions.setError(res, "Ngày nhập vào không hợp lệ!", 405);
          }
          return functions.setError(res, "Lĩnh vực, Kỹ năng, thành phố đã tồn tại ở 1 job khác!", 405);
        }
        return functions.setError(res, "Tiêu đề đã được sử dụng", 405);
      }
      return functions.setError(res, "Tiêu đề không được chứa kí tự đặc biệt!", 400);
    };
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    console.log("🚀 ~ file: company.js:359 ~ exports.createJob= ~ error:", error)
    return functions.setError(res, error.message);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    let { tieu_de, linh_vuc, nn_ct, ht_work, thanh_pho, kinh_nghiem, mo_ta, ht_luong,
      luong, luong_1, luong_2, ht_luong_time, begin_date, finish_date, begin_work, thoi_han, id }
      = req.body;
    let ntd_id = req.user.data.idTimViec365;
    let time = functions.convertTimestamp(Date.now());
    if (id && tieu_de && linh_vuc && nn_ct && ht_work && thanh_pho && kinh_nghiem && mo_ta && ht_luong && ht_luong_time && begin_date && finish_date && begin_work && thoi_han) {
      id = Number(id);
      let job = await Job.findOne({ id: id });
      if (job) {
        let alias = functions.renderAlias(tieu_de);
        let checkTieuDe = await Job.findOne({ alias: alias, user_id: ntd_id });
        let checkTitle = flcService.checkTitle(tieu_de);
        if (!checkTitle) {
          return functions.setError(res, "Tieu de khong duoc chua ky tu dac biet!", 400);
        }
        if (alias == job.alias || !checkTieuDe) {
          let checkSeo = await Job.findOne({ category_id: linh_vuc, skill_id: nn_ct, work_city: thanh_pho, id: { $ne: id } });
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
                    //
                    let company_logo = null;
                    let file_name = null;
                    if (req.files) {
                      let image = req.files.image;
                      let file = req.files.file;
                      //logo cong ty
                      if (image) {
                        let checkImage = await flcService.checkImage(image.path);
                        if (checkImage) {
                          company_logo = await flcService.uploadImage(time, image);
                        } else {
                          return functions.setError(res, "Anh khong dung dinh dang or qua kich thuoc cho phep!", 400);
                        }
                      }
                      //tep dinh kem
                      if (file) {
                        file_name = await flcService.uploadFile(time, file);
                      }
                    }
                    let job = await Job.findOneAndUpdate({ id: id }, {
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
                      company_logo: company_logo,
                      updated_at: time,
                      work_file_des: file_name,
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

exports.getListJob = async (req, res, next) => {
  try {
    let { page, pageSize, id } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 50;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let ntd_id = req.user.data.idTimViec365;
    let condition = { user_id: ntd_id };
    if (id) condition.id = Number(id);
    let field = { title_job: 1, job_type: 1, date_bid_end: 1, id: 1, alias: 1, id: 1, created_at: 1 };
    let listJob = await functions.pageFind(Job, condition, { created_at: -1 }, skip, pageSize);
    let total = await functions.findCount(Job, condition);
    return functions.success(res, "Get list job success: ", { total, data: listJob });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.getListFreelancer = async (req, res, next) => {
  try {
    let { page, pageSize, keyword, city, category, skill } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 8;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    // let ntd_id = req.user.data.idTimViec365;
    let condition = { idTimViec365: { $nin: [0, null] }, type: 0 };
    if (keyword) {
      condition.userName = new RegExp(keyword, 'i');
    }
    if (city) {
      condition.city = Number(city);
    }
    if (category) {
      condition["inforFreelancer.category_id"] = new RegExp(`\\b${category}\\b`);
    }
    if (skill) {
      condition["inforFreelancer.skill_detail"] = new RegExp(`\\b${skill}\\b`);
    }
    let listFreelancer = await Users.aggregate([
      { $match: condition },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "FLC_City",
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
        $project: {
          "_id": "$_id",
          "idTimViec365": "$idTimViec365",
          "district": "$district",
          "city": "$city",
          "userName": "$userName",
          "phone": "$phone",
          "type": "$type",
          "phoneTK": "$phoneTK",
          "address": "$address",
          "avatarUser": "$avatarUser",
          "createdAt": "$createdAt",
          "updatedAt": "$updatedAt",
          "user_des": "$inforFreelancer.user_des",
          "category_id": "$inforFreelancer.category_id",
          "skill_detail": "$inforFreelancer.skill_detail",
          "cit_name": "$City.cit_name",
          "dis_name": "$District.cit_name",
        }
      },
    ]);
    let total = await functions.findCount(Users, condition);
    return functions.success(res, "Get list freelancer success: ", { total, data: listFreelancer });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//quan ly tai khoan
exports.getInfoCompany = async (req, res, next) => {
  try {
    let id_ntd = req.user.data.idTimViec365;
    console.log("🚀 ~ file: company.js:569 ~ exports.getInfoCompany= ~ id_ntd:", id_ntd)
    let ntd = await Users.findOne({ idTimViec365: id_ntd, type: 1 }, {
      "userName": "$userName",
      "email": "$email",
      "phone": "$phone",
      "avatarUser": "$avatarUser",
      "city": "$city",
      "district": "$district",
      "address": "$address",
      "birthday": "$inForPerson.account.birthday",
      "gender": "$inForPerson.account.gender",
      createdAt: 1
    }).lean();

    ntd.linkLogo = flcService.getLinkAvatarCompany(ntd.gender, ntd.avatarUser);



    if (ntd) {
      const city = await City.findOne({ cit_id: ntd.city }, { cit_name: 1 }).lean();

      const district = await City.findOne({ cit_id: ntd.district }, { cit_name: 1 }).lean();
      ntd.city_name = city.cit_name;
      ntd.district_name = district.cit_name;
      return functions.success(res, "get info company success: ", { data: ntd });
    }
    return functions.setError(res, "company not found!");
  } catch (error) {
    console.log("🚀 ~ file: company.js:596 ~ exports.getInfoCompany= ~ error:", error)
    return functions.setError(res, error.message);
  }
}

exports.updateAvatarCompany = async (req, res, next) => {
  try {
    if (req.files && req.files.avatar) {
      let avatar = req.files.avatar;
      let checkImage = await flcService.checkImage(avatar.path);
      if (checkImage) {
        let id_ntd = req.user.data.idTimViec365;
        let time = await Users.findOne({ idTimViec365: id_ntd }, { createdAt: 1 }).lean()
        let logo = await flcService.uploadImage(time.createdAt, avatar);
        let ntd = await Users.findOneAndUpdate({ idTimViec365: id_ntd, type: 1 }, { avatarUser: logo, updatedAt: time }, { new: true });
        if (ntd) {
          return functions.success(res, "Update avatar success!");
        }
        return functions.setError(res, "Update avatar fail!");
      }
      return functions.setError(res, "Anh khong dung dinh dang hoac qua kich thuoc!", 400);
    }
    return functions.setError(res, "Missing input avatar image!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.updateLogoCompany = async (req, res, next) => {
  try {

    if (req.files && req.files.file) {
      let avatar = req.files.file;
      let id_ntd = req.user.data.idTimViec365;
      let logo = await flcService.uploadLogo(avatar);
      let ntd = await Job.updateMany({ user_id: id_ntd }, { company_logo: logo, updated_at: new Date().getTime() / 1000 }, { new: true });
      if (ntd) {
        return functions.success(res, "Update avatar success!");
      }
      return functions.setError(res, "Update avatar fail!");
    }
    return functions.setError(res, "Missing input avatar image!", 400);
  } catch (error) {
    console.log("🚀 ~ file: company.js:638 ~ exports.updateLogoCompany= ~ error:", error)
    return functions.setError(res, error.message);
  }
}

















exports.updateInfoCompany = async (req, res, next) => {
  try {
    let { userName, gender, birthday, phone, city, district } = req.body;
    let id_ntd = req.user.data.idTimViec365;
    let time = functions.convertTimestamp(Date.now());
    if (userName && gender && birthday && phone && city && district) {
      let checkPhone = functions.checkPhoneNumber(phone);
      let checkDate = functions.checkDate(birthday);
      if (checkPhone && checkDate) {
        birthday = functions.convertTimestamp(birthday);
        let ntd = await Users.findOneAndUpdate({ idTimViec365: id_ntd, type: 1 }, {
          userName: userName,
          phone: phone,
          city: city,
          district: district,
          "inForPerson.account.birthday": birthday,
          "inForPerson.account.gender": gender,
          updatedAt: time
        }, { new: true });
        if (ntd) {
          return functions.success(res, "Update info company success!");
        }
        return functions.setError(res, "Update info company fail!");
      }
      return functions.setError(res, "Invalid phone or invalid date!", 400);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    let { oldPass, newPass } = req.body;
    let id_ntd = req.user.data.idTimViec365;
    let ntd = await Users.findOne({ idTimViec365: id_ntd, type: 1 });
    if (oldPass && newPass) {
      let checkPassword = await functions.verifyPassword(oldPass, ntd.password);
      if (checkPassword) {
        let updatePassword = await Users.findOneAndUpdate({ idTimViec365: id_ntd, type: 1 }, {
          password: md5(newPass),
        }, { new: true });
        if (updatePassword) {
          return functions.success(res, "Update password success!");
        }
        return functions.setError(res, "Update password fail!", 407);
      }
      return functions.setError(res, "Password cũ nhập vào không chính xác!", 406);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

//freelancer dat gia
exports.listFreelancerSetPrice = async (req, res, next) => {
  try {
    let { page, pageSize, accept_price_setting } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 50;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let ntd_id = req.user.data.idTimViec365;
    let condition = { employee_id: ntd_id, accept_price_setting: 0 };
    if (accept_price_setting == 1) condition.accept_price_setting = 1;
    let listFreelancerSetPrice = await PriceSetting.aggregate([
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
        $lookup: {
          from: "Users",
          localField: "flc_id",
          foreignField: "idTimViec365",
          pipeline: [
            { $match: { idTimViec365: { $nin: [0, null] }, type: 0 } },
          ],
          as: "Freelancer"
        }
      },
      { $unwind: { path: "$Freelancer", preserveNullAndEmptyArrays: true } },
      // {
      //   $lookup: {
      //       from: "FLC_Vote",
      //       localField: "flc_id",
      //       foreignField: "idTimViec365",
      //       as: "Vote"
      //   }
      // },
      // {$unwind: { path: "$Vote", preserveNullAndEmptyArrays: true }},
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
          "alias": "$Job.alias",
          "salary_permanent_number": "$Job.salary_permanent_number",
          "salary_type": "$Job.salary_type",
          "salary_estimate_number_1": "$Job.salary_estimate_number_1",
          "salary_salary_estimate_number_2": "$Job.salary_salary_estimate_number_2",
          "date_bid_end": "$Job.date_bid_end",
          "working_term": "$Job.working_term",
          "date_work_start": "$Job.date_work_start",
          "flc_name": "$Freelancer.userName",
        }
      }
    ]);
    let total = await functions.findCount(PriceSetting, condition);

    for (let i = 0; i < listFreelancerSetPrice.length; i++) {
      let priceSetting = listFreelancerSetPrice[i];
      let vote = await Vote.findOne({ job_id: priceSetting.job_id, flc_id: priceSetting.flc_id, employer_id: ntd_id, type_vote: 1 });
      if (vote) {
        listFreelancerSetPrice[i].vote = vote.star;
      } else {
        listFreelancerSetPrice[i].vote = 0;
      }
    }
    return functions.success(res, "get ung vien dat gia thanh cong: ", { total, data: listFreelancerSetPrice });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.acceptOrCancelFreelancer = async (req, res, next) => {
  try {
    let { auth, id } = req.body;
    if (auth && id) {
      let id_ntd = req.user.data.idTimViec365;
      id = Number(id);
      let field = {};
      //mac dinh se la chap nhan
      if (auth == 'accept') {
        field = { accept_price_setting: 1, status_work: 1 };
      }
      else if (auth == 'cancel') {
        field = { accept_price_setting: 2 };
      }
      let priceSetting = await PriceSetting.findOneAndUpdate({ id: id }, field, { new: true });
      if (priceSetting) {
        let maxId = await functions.getMaxIdByField(ListThongBao, 'id_list');
        let thongBao = new ListThongBao({ id_list: maxId, id_nguoi_gui: id_ntd, id_nguoi_nhan: priceSetting.flc_id, td_loai_tb: 2, id_tin: priceSetting.job_id });
        thongBao = await thongBao.save();
        if (thongBao) {
          return functions.success(res, "Tu choi or nhan viec ung vien thanh cong!");
        }
        return functions.setError(res, "Insert model list thong bao fail!");
      }
      return functions.setError(res, "Ban ghi not found!", 404);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.changeStatusFreelancer = async (req, res, next) => {
  try {
    let { id_status, id } = req.body;
    //id_status = 1 => dang thuc hien, 2=> hoan thanh, 3=> k hoan thanh
    if (id_status && id) {
      id = Number(id);
      let updateStatus = await PriceSetting.findOneAndUpdate({ id: id }, { status_work: id_status }, { new: true });
      if (updateStatus) {
        return functions.success(res, "Update status work success!");
      }
      return functions.setError(res, "Price setting not found!", 404);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.evaluateFreelancer = async (req, res, next) => {
  try {
    let { id_flc, id_tin, star } = req.body;
    if (id_flc && id_tin && star) {
      let id_ntd = req.user.data.idTimViec365;
      let time = functions.convertTimestamp(Date.now());
      id_flc = Number(id_flc);
      id_tin = Number(id_tin);
      let checkWorkDone = await PriceSetting.findOne({ flc_id: id_flc, job_id: id_tin, status_work: 2 });
      if (checkWorkDone) {
        let field = { employer_id: id_ntd, flc_id: id_flc, id_job: id_tin, type_vote: 1 };
        let vote = await Vote.findOne(field);
        if (!vote) {
          let maxId = await functions.getMaxIdByField(Vote, 'id');
          field.id = maxId;
        }
        field.star = star;
        field.created_at = time;
        vote = await Vote.findOneAndUpdate({ employer_id: id_ntd, flc_id: id_flc, job_id: id_tin, type_vote: 1 }, field, { new: true, upsert: true });
        if (vote) {
          return functions.success(res, "danh gia freelancer thanh cong!");
        }
        return functions.setError(res, "danh gia freelancer thanh bai!");
      }
      return functions.setError(res, "Freelancer chua hoan thanh cong viec!", 400);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

//ung vien da luu
exports.listFreelancerSave = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 50;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let ntd_id = req.user.data.idTimViec365;
    let condition = { employer_id: ntd_id };
    let listFreelancerSave_promise = SaveFlc.aggregate([
      { $match: condition },
      { $sort: { id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "flc_id",
          foreignField: "idTimViec365",
          pipeline: [
            { $match: { idTimViec365: { $nin: [0, null] }, type: 0 } },
          ],
          as: "Freelancer"
        }
      },
      { $unwind: { path: "$Freelancer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_City2",
          localField: "Freelancer.city",
          foreignField: "cit_id",
          as: "City"
        }
      },
      { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "FLC_City2",
          localField: "Freelancer.district",
          foreignField: "cit_id",
          as: "District"
        }
      },
      { $unwind: { path: "$District", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "id": "$id",
          "employer_id": "$employer_id",
          "flc_id": "$flc_id",
          "created_at": "$created_at",
          "flc_name": "$Freelancer.userName",
          "cit_name": "$City.cit_name",
          "dis_name": "$District.cit_name",
        }
      }
    ]);
    let listCategory_promise = Category.find({}, { id_category: 1, category_name: 1 }).lean();
    let listSkill_promise = Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();
    let total_promise = functions.findCount(SaveFlc, condition);

    const [
      listFreelancerSave,
      listCategory,
      listSkill,
      total] = await Promise.all([
        listFreelancerSave_promise,
        listCategory_promise,
        listSkill_promise,
        total_promise
      ])
    for (let i = 0; i < listFreelancerSave.length; i++) {
      let freelancer = await Users.findOne({ idTimViec365: listFreelancerSave[i].flc_id, type: 0 });
      if (freelancer) {
        //linh vuc: IT, DESIGN
        let arr_cate = freelancer.inforFreelancer.category_id || '8, 3';
        if (arr_cate) {
          arr_cate = arr_cate.split(", ");
          let arr_category = [];
          for (let j = 0; j < arr_cate.length; j++) {
            let category = listCategory.filter((e) => e.id_category == arr_cate[j]);
            arr_category.push(category[0].category_name);
          }
          listFreelancerSave[i].arr_category = arr_category.join(', ');
        }

        //ky nang
        let arr_skill = freelancer.inforFreelancer.skill_detail || '14304, 14303';
        if (arr_skill) {
          arr_skill = arr_skill.split(", ");
          let arr_skillname = [];
          for (let j = 0; j < arr_skill.length; j++) {
            let skill = listSkill.filter((e) => e.id_skill == arr_skill[j]);
            arr_skillname.push(skill[0].skill_name);
          }
          listFreelancerSave[i].arr_skillname = arr_skillname.join(', ');
        }

        //lay ra so sao danh gia
        let vote = await Vote.find({ flc_id: listFreelancerSave[i].flc_id, type_vote: 1 }, { star: 1 }).lean();
        let average = 0;
        if (vote && vote.length > 0) {
          const sum = vote.reduce((total, currentValue) => total + currentValue.star, 0);
          average = Math.round(sum / vote.length);
        }
        listFreelancerSave[i].averageStar = average;
      }
    }
    return functions.success(res, "get list freelancer save success", { total, data: listFreelancerSave });
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

//luu ung vien
exports.saveFreelancer = async (req, res, next) => {
  try {
    let id_ntd = req.user.data.idTimViec365;
    let id_flc = req.body.id_flc;
    let time = functions.convertTimestamp(Date.now());
    if (id_flc) {
      id_flc = Number(id_flc);
      let checkSaveFlc = await SaveFlc.findOne({ employer_id: id_ntd, flc_id: id_flc });
      if (!checkSaveFlc) {
        let maxId = await functions.getMaxIdByField(SaveFlc, 'id');
        let saveFlc = new SaveFlc({
          id: maxId,
          employer_id: id_ntd,
          flc_id: id_flc,
          created_at: time
        });
        saveFlc = await saveFlc.save();
        if (saveFlc) {
          let idThongBao = await functions.getMaxIdByField(ListThongBao, 'id_list');
          let listThongBao = new ListThongBao({
            id_list: idThongBao,
            id_nguoi_gui: id_ntd,
            id_nguoi_nhan: id_flc,
            td_loai_tb: 3,
            time_tb: time,
          });
          listThongBao = await listThongBao.save();
          if (listThongBao) {
            return functions.success(res, "Save freelancer success!");
          }
          return functions.setError(res, "Tao thong bao fail!");
        }
        return functions.setError(res, "Save freelancer fail!");
      }
      return functions.setError(res, "Freelancer da duoc luu!", 400);
    }
    return functions.setError(res, "Missing input id_flc", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}

exports.deleteSaveFreelancer = async (req, res, next) => {
  try {
    let flc_id = req.body.flc_id;
    let ntd_id = req.user.data.idTimViec365;
    if (flc_id) {
      flc_id = Number(flc_id);
      let saveFlc = await SaveFlc.findOneAndDelete({ flc_id: flc_id, employer_id: ntd_id });
      if (saveFlc) {
        return functions.success(res, "Xoa ung vien da luu thanh cong!");
      }
      return functions.setError(res, "Ban ghi not found!", 404);
    }
    return functions.setError(res, "Missing input id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
}