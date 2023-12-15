const functions = require('../../services/functions');
const flcService = require('../../services/freelancer/functions');
const Category = require('../../models/freelancer/Category');
const Skills = require('../../models/freelancer/Skills');
const WorkType = require('../../models/freelancer/WorkType');
const TableExp = require('../../models/freelancer/TableExp');
const Jobs = require('../../models/freelancer/Jobs');
const PriceSetting = require('../../models/freelancer/PriceSetting');
const UserView = require('../../models/freelancer/UserView');
const SaveFlc = require('../../models/freelancer/SaveFlc');
const PointLog = require('../../models/freelancer/PointLog');
const Vote = require('../../models/freelancer/Vote');
const SaveJob = require('../../models/freelancer/SaveJob');
const City = require('../../models/freelancer/City');
const City2 = require('../../models/freelancer/City2');
const Users = require('../../models/Users');
const tmp = require('../../models/freelancer/tmp')

exports.getListCategory = async (req, res, next) => {
    try {
        let listCategory = await Category.find({}).sort({ id_category: 1 });
        return functions.success(res, "get list category success: ", { data: listCategory });
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.getListSkill = async (req, res, next) => {
    try {
        let id_category = req.body.id_category;
        if (id_category) {
            id_category = Number(id_category);
            let listSkill = await Skills.find({ category_id: id_category }).sort({ id_skill: 1 }).lean();
            return functions.success(res, "get list category success: ", { data: listSkill });
        } else {
            let listSkill = await Skills.find({}, { id_skill: 1, skill_name: 1 }).sort({ id_skill: 1 }).limit(10).lean();
            return functions.success(res, "get list category success: ", { data: listSkill });
        }
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.getWorkType = async (req, res, next) => {
    try {
        let listWorkType = await WorkType.find({}).sort({ id: 1 });
        return functions.success(res, "get list category success: ", { data: listWorkType });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.listCity = async (req, res, next) => {
    try {
        let cit_parent = req.body.cit_parent;
        let condition = { cit_parent: 0 };
        if (cit_parent) condition.cit_parent = Number(cit_parent);
        let listCity = await City2.find(condition, { cit_name: 1, cit_id: 1 }).sort({ cit_id: 1 }).lean();
        return functions.success(res, "get list city and district success: ", { data: listCity });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.getExperience = async (req, res, next) => {
    try {
        let listExp = await TableExp.find({}).sort({ id: 1 });
        return functions.success(res, "get list category success: ", { data: listExp });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.getListJob = async (req, res, next) => {
    try {
        let { job_type, keyword, page, pageSize, city, category, skill } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 6;
        page = Number(page);
        pageSize = Number(pageSize);

        const skip = (page - 1) * pageSize;
        let condition = {};
        //2 => du an, 1=> ban tg
        if (job_type == 1) condition.job_type = 1;
        if (job_type == 2) condition.job_type = 0;
        if (city) city = city.map(item => Number(item));
        if (category) category = category.map(item => Number(item));
        const arrSkill = [];
        if (skill) {
            for (let i = 0; i < skill.length; i++) {
                arrSkill.push(new RegExp(skill[i]))
            }
        }
        if (keyword) condition.title_job = new RegExp(keyword, 'i');
        if (city) condition.work_city = { $in: city };
        if (category) condition.category_id = { $in: category };
        if (skill) condition.skill_id = { $in: arrSkill };
        let listJob_promise = Jobs.aggregate([
            { $match: condition },
            { $sort: { updated_at: -1 } },
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
                    "salary_permanent_number": "$salary_permanent_number",
                    "salary_estimate_number_1": "$salary_estimate_number_1",
                    "salary_salary_estimate_number_2": "$salary_salary_estimate_number_2",
                    "salary_permanent_date": "$salary_permanent_date",
                    "updated_at": "$updated_at",
                    "userName": "$NTD.userName",
                    "avatarUser": "$NTD.avatarUser",
                    "createdAt": "$NTD.createdAt",
                    "cit_name": "$City.cit_name",
                    "skill_name": "$Skills.skill_name",
                }
            }
        ]);
        let total_promise = functions.findCount(Jobs, condition);
        let listSkill_promise = Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();


        const [listJob, total, listSkill] = await Promise.all([
            listJob_promise,
            total_promise,
            listSkill_promise
        ])
        for (let i = 0; i < listJob.length; i++) {
            let total_datgia = await functions.findCount(PriceSetting, { job_id: listJob[i].id });
            listJob[i].total_datgia = total_datgia;

            listJob[i].linkLogo = flcService.getLinkLogoCompany(listJob[i].company_logo);
            listJob[i].linkAvatar = flcService.getLinkAvatar(listJob[i].createdAt, listJob[i].avatarUser);

            //danh sach ky nang
            let arr_skill = listJob[i].skill_id;
            if (arr_skill) {
                arr_skill = arr_skill.split(",")[0];
                let skill = listSkill.find((e) => e.id_skill == listJob[i].skill_id);
                if (skill) listJob[i].arr_skillname = skill.skill_name;
            }
        }
        // let arr_cty = [1, 45, 27, 26];
        // let total_job_city = [];
        // for (let i = 0; i < arr_cty.length; i++) {
        //     let total = await functions.findCount(Jobs, { work_city: arr_cty[i] });
        //     total_job_city.push(total);
        // }
        return functions.success(res, "get list job working success", { total, total_job_city: 0, data: listJob });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}


exports.detailJob = async (req, res, next) => {
    try {
        let id = req.body.id;
        console.log("🚀 ~ file: home.js:192 ~ exports.detailJob= ~ id:", id)
        if (id) {
            id = Number(id);
            let detailJob = await Jobs.aggregate([
                { $match: { id: id } },
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
                        from: "FLC_City",
                        localField: "work_city",
                        foreignField: "cit_id",
                        as: "City"
                    }
                },
                { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "FLC_City",
                        localField: "NTD.city",
                        foreignField: "cit_id",
                        as: "NTDCity"
                    }
                },
                { $unwind: { path: "$NTDCity", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        "id": "$id",
                        "user_id": "$user_id",
                        "title_job": "$title_job",
                        "alias": "$alias",
                        "category_id": "$category_id",
                        "skill_id": "$skill_id",
                        "work_type": "$work_type",
                        "work_city": "$work_city",
                        "work_exp": "$work_exp",
                        "work_des": "$work_des",
                        "work_file_des": "$work_file_des",
                        "salary_type": "$salary_type",
                        "salary_permanent_number": "$salary_permanent_number",
                        "salary_estimate_number_1": "$salary_estimate_number_1",
                        "salary_salary_estimate_number_2": "$salary_salary_estimate_number_2",
                        "salary_permanent_date": "$salary_permanent_date",
                        "salary_estimates_date": "$salary_estimates_date",
                        "date_bid_start": "$date_bid_start",
                        "date_bid_end": "$date_bid_end",
                        "date_work_start": "$date_work_start",
                        "working_term": "$working_term",
                        "job_type": "$job_type",
                        "company_logo": "$company_logo",
                        "created_at": "$created_at",
                        "updated_at": "$updated_at",
                        "seo_index": "$seo_index",
                        "duyet_tin": "$duyet_tin",
                        "userName": "$NTD.userName",
                        "city": "$NTD.city",
                        "city_name": "$NTDCity.cit_name",
                        "phone": "$NTD.phone",
                        "email": "$NTD.email",
                        "avatarUser": "$NTD.avatarUser",
                        "createdAt": "$NTD.createdAt",
                        "cit_name": "$City.cit_name",
                        "category_name": "$Category.category_name",
                        "skill_name": "$Skills.skill_name",
                        "address": "$NTD.address",
                    }
                }
            ]);
            if (detailJob.length == 1) {
                detailJob = detailJob[0];
                ntd_id = detailJob.user_id;
                //tra ve link day du
                detailJob.linkAvatar = flcService.getLinkAvatar(detailJob.createdAt, detailJob.avatarUser);
                detailJob.linkLogo = flcService.getLink(detailJob.company_logo);
                detailJob.linkFileDes = flcService.getLink(detailJob.work_file_des);

                //danh sach ky nang
                let arr_skill = detailJob.skill_id;
                if (arr_skill) {
                    let listSkill = await Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();
                    arr_skill = arr_skill.split(",");
                    let arr_skillname = [];
                    for (let j = 0; j < arr_skill.length; j++) {
                        let skill = listSkill.filter((e) => e.id_skill == arr_skill[j]);
                        arr_skillname.push(skill[0]);
                    }
                    detailJob.arr_skillname = arr_skillname;
                }

                let total_ntd_job = await functions.findCount(Jobs, { user_id: ntd_id });
                detailJob.total_ntd_job = total_ntd_job;

                //lay ra danh sach ung vien dat gia
                let listFlcPriceSet = await PriceSetting.aggregate([
                    { $match: { job_id: detailJob.id, accept_price_setting: 0 } },
                    {
                        $lookup: {
                            from: "Users",
                            localField: "flc_id",
                            foreignField: "idTimViec365",
                            pipeline: [
                                { $match: { idTimViec365: { $nin: [0, null] } } },
                            ],
                            as: "Freelancer"
                        }
                    },
                    { $unwind: { path: "$Freelancer", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "FLC_Vote",
                            localField: "flc_id",
                            foreignField: "flc_id",
                            pipeline: [
                                { $match: { type_vote: 1 } },
                            ],
                            as: "Vote"
                        }
                    },
                    {
                        $project: {
                            "id": "$id",
                            "flc_id": "$flc_id",
                            "salary": "$salary",
                            "accept_price_setting": "$accept_price_setting",
                            "status_work": "$status_work",
                            "avatar": "$Freelancer.avatarUser",
                            "userName": "$Freelancer.userName",
                            "user_des": "$Freelancer.inforFreelancer.user_des",
                            "category_id": "$Freelancer.inforFreelancer.category_id",
                            "Vote": "$Vote.star",
                            'createdAt': "$Freelancer.createdAt",
                        }
                    }
                ]);
                let listCategory = await Category.find({}, { id_category: 1, category_name: 1 }).lean();
                for (let i = 0; i < listFlcPriceSet.length; i++) {
                    //lay ra trung binh so sao
                    listFlcPriceSet[i].averageStar = 0.3;
                    if (listFlcPriceSet[i] && listFlcPriceSet[i].Vote && listFlcPriceSet[i].Vote.length > 0) {

                        const sum = listFlcPriceSet[i].Vote.reduce((total, currentValue) => total + currentValue, 0);
                        let average = sum / listFlcPriceSet[i].Vote.length;
                        listFlcPriceSet[i].averageStar = average;
                    }

                    //lay ra ten cua nganh
                    let arr_cate = listFlcPriceSet[i].category_id || '1, 2';
                    if (arr_cate) {
                        arr_cate = arr_cate.split(", ");
                        let arr_category = [];
                        for (let j = 0; j < arr_cate.length; j++) {
                            let category = listCategory.filter((e) => e.id_category == arr_cate[j]);
                            arr_category.push(category[0].category_name);
                        }
                        listFlcPriceSet[i].arr_category = arr_category.join(', ');
                    }

                    //lay ra link avatar
                    listFlcPriceSet[i].linkAvatar = flcService.getLinkAvatar(listFlcPriceSet[i].createdAt, listFlcPriceSet[i].avatar);
                }
                detailJob.listFlcPriceSet = listFlcPriceSet;
                return functions.success(res, "get detail job success: ", { data: detailJob });
            }
            return functions.setError(res, "Job not found!", 404);
        }
        return functions.setError(res, "Missing input value id", 400);
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.getListFreelancer = async (req, res, next) => {
    try {
        let { page, pageSize, keyword, city, category, skill, id } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        let ntd_id = (req.user && req.user.data && req.user.data.idTimViec365) ? req.user.data.idTimViec365 : null;

        let condition = { idTimViec365: { $gt: 0 }, type: 0, "inforFreelancer.hide_uv": { $ne: 1 } };
        // let condition = { idTimViec365: { $gt: 0 }, type: 0 };

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
        if (id) condition.idTimViec365 = Number(id);
        let listFreelancer_promise = Users.aggregate([
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
                    "email": "$email",
                    "address": "$address",
                    "avatarUser": "$avatarUser",
                    "createdAt": "$createdAt",
                    "updatedAt": "$updatedAt",
                    "birthday": "$inForPerson.account.birthday",
                    "gender": "$inForPerson.account.gender",
                    "user_des": "$inforFreelancer.user_des",
                    "category_id": "$inforFreelancer.category_id",
                    "skill_detail": "$inforFreelancer.skill_detail",
                    "cit_name": "$City.cit_name",
                    "dis_name": "$District.cit_name",
                }
            },
        ]);
        let listCategory_promise = Category.find({}, { id_category: 1, category_name: 1 }).lean();
        let listSkill_promise = Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();

        const [
            listFreelancer,
            listCategory,
            listSkill,

        ] = await Promise.all([
            listFreelancer_promise,
            listCategory_promise,
            listSkill_promise,
        ])
        // console.log(listSkill)
        for (let i = 0; i < listFreelancer.length; i++) {
            //linh vuc: IT, DESIGN
            let arr_cate = listFreelancer[i].category_id;
            if (arr_cate) {
                arr_cate = arr_cate.split(", ");
                let arr_category = [];
                for (let j = 0; j < arr_cate.length; j++) {
                    let category = listCategory.find((e) => e.id_category == arr_cate[j]);
                    arr_category.push(category);
                }
                listFreelancer[i].arr_category = arr_category;
            }

            //ky nang
            let arr_skill = listFreelancer[i].skill_detail || '1768, 1769';
            if (arr_skill) {

                arr_skill = arr_skill.split(", ");
                let arr_skillname = [];
                for (let j = 0; j < arr_skill.length; j++) {
                    let skill = listSkill.find((e) => e.id_skill == arr_skill[j]);
                    if (skill) arr_skillname.push(skill);
                }
                listFreelancer[i].arr_skillname = arr_skillname;
            }
            let flc_id = listFreelancer[i].idTimViec365;
            //lay ra tong lan dat gia
            let total_datgia_promise = functions.findCount(PriceSetting, { flc_id: listFreelancer[i].idTimViec365 });
            let user_view_promise = UserView.findOne({ employer_id: ntd_id, flc_id: flc_id }, { allow_view: 1 });
            let saveFlc_promise = functions.findCount(SaveFlc, { employer_id: ntd_id, flc_id: flc_id });

            const [
                total_datgia,
                user_view,
                saveFlc,
            ] = await Promise.all([
                total_datgia_promise,
                user_view_promise,
                saveFlc_promise,
            ]);

            listFreelancer[i].total_datgia = total_datgia;

            //lay ra trang thai

            let status_view = "";
            if (user_view) {
                if (user_view.allow_view == 1) status_view = "Đã xem";
                else if (user_view.allow_view == 2) status_view = "Đã mở";
            }
            listFreelancer[i].status_view = status_view;

            //check da luu ung vien chua

            let status_save = false;
            if (saveFlc > 0) status_save = true;
            listFreelancer[i].status_save = status_save;

            //lay ra link
            listFreelancer[i].linkAvatar = flcService.getLinkAvatar(listFreelancer[i].createdAt, listFreelancer[i].avatarUser);
        }
        //chi tiet freelancer
        if (id && listFreelancer.length > 0) {
            //danh dau da xem ung vien
            if (ntd_id) {
                let user_view = await UserView.findOne({ flc_id: id, employer_id: ntd_id });
                if (!user_view) {
                    let newId = await functions.getMaxIdByField(UserView, 'id');
                    let time = functions.convertTimestamp(Date.now());
                    let new_user_view = new UserView({
                        id: newId, flc_id: id, employer_id: ntd_id, allow_view: 1, created_at: time
                    });
                    await new_user_view.save();
                }
            }

            let freelancer = listFreelancer[0];
            let flc_id = freelancer.idTimViec365;
            let checkLienHe = await functions.findCount(PointLog, { employer_id: ntd_id, flc_id: freelancer.idTimViec365 });
            let status_lienhe = false;
            if (checkLienHe > 0) {
                status_lienhe = true;
            } else {
                delete freelancer.phone;
                delete freelancer.email;
            }
            freelancer.status_lienhe = status_lienhe;

            //lay ra so sao danh gia
            let vote = await Vote.find({ flc_id: flc_id, type_vote: 1 }, { star: 1 }).lean();
            let average = 0;
            if (vote && vote.length > 0) {
                const sum = vote.reduce((total, currentValue) => total + currentValue.star, 0);
                average = Math.round(sum / vote.length);
            }
            freelancer.averageStar = average;

            //thong tin cong viec hoan thanh
            let tong_cv = await functions.findCount(PriceSetting, { flc_id: flc_id, accept_price_setting: 1 });
            let cv_ht = await functions.findCount(PriceSetting, { flc_id: flc_id, status_work: 2 });

            let tb_cv = 0;
            if (tong_cv > 0) {
                tb_cv = Math.round((cv_ht / tong_cv) * 100);
            }
            freelancer.tong_cv = tong_cv;
            freelancer.cv_ht = cv_ht;
            freelancer.tb_cv = tb_cv;
            return functions.success(res, "Get list freelancer success: ", { data: freelancer });
        }

        return functions.success(res, "Get list freelancer success: ", { total: 994372, data: listFreelancer });
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.getJobByCity = async (req, res, next) => {
    try {
        let arr_cty = [1, 45, 27, 26];
        let data = [];
        for (let i = 0; i < arr_cty.length; i++) {
            let total = await functions.findCount(Jobs, { work_city: arr_cty[i] });
            data.push(total);
        }
        return functions.success(res, "get total job by city success:", { data });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.detailCompany = async (req, res, next) => {
    try {
        let ntd_id = req.body.id;
        let flc_id = (req.user && req.user.data && req.user.data.idTimViec365) ? req.user.data.idTimViec365 : null;
        if (ntd_id) {
            ntd_id = Number(ntd_id);
            let ntd = await Users.aggregate([
                { $match: { idTimViec365: ntd_id, type: 1 } },
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
                        "email": "$email",
                        "avatarUser": "$avatarUser",
                        "createdAt": "$createdAt",
                        "updatedAt": "$updatedAt",
                        "cit_name": "$City.cit_name",
                        "dis_name": "$District.cit_name",
                    }
                },
            ]);
            if (ntd && ntd.length > 0) {
                ntd = ntd[0];
                ntd.linkAvatar = flcService.getLinkAvatarCompany(ntd.createdAt, ntd.avatarUser);
                let listJob = await Jobs.aggregate([
                    { $match: { user_id: ntd_id } },
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
                            "id": "$id",
                            "user_id": "$user_id",
                            "title_job": "$title_job",
                            "alias": "$alias",
                            "category_id": "$category_id",
                            "skill_id": "$skill_id",
                            "work_type": "$work_type",
                            "work_city": "$work_city",
                            "work_exp": "$work_exp",
                            "salary_type": "$salary_type",
                            "job_type": "$job_type",
                            "salary_permanent_number": "$salary_permanent_number",
                            "salary_estimate_number_1": "$salary_estimate_number_1",
                            "salary_salary_estimate_number_2": "$salary_salary_estimate_number_2",
                            "salary_permanent_date": "$salary_permanent_date",
                            "salary_estimates_date": "$salary_estimates_date",
                            "date_bid_start": "$date_bid_start",
                            "date_bid_end": "$date_bid_end",
                            "company_logo": "$company_logo",
                            "cit_name": "$City.cit_name",
                            "category_name": "$Category.category_name",
                        }
                    },
                ]);
                let listSkill = await Skills.find({}, { id_skill: 1, skill_name: 1, category_id: 1 }).lean();

                for (let i = 0; i < listJob.length; i++) {
                    //danh sach ky nang
                    let arr_skill = listJob[i].skill_id;
                    if (arr_skill) {
                        arr_skill = arr_skill.split(",");
                        let arr_skillname = [];
                        for (let j = 0; j < arr_skill.length; j++) {
                            let skill = listSkill.filter((e) => e.id_skill == arr_skill[j]);
                            arr_skillname.push(skill[0].skill_name);
                        }
                        listJob[i].arr_skillname = arr_skillname;
                    }

                    let job_id = listJob[i].id;
                    //lay ra tong lan dat gia
                    let total_datgia = await functions.findCount(PriceSetting, { job_id: job_id });
                    listJob[i].total_datgia = total_datgia;

                    //check da luu ung vien chua
                    let saveFlc = await functions.findCount(SaveJob, { flc_id: flc_id, job_id: job_id });
                    let status_save = false;
                    if (saveFlc > 0) status_save = true;
                    listJob[i].status_save = status_save;

                    //link logo
                    listJob[i].linkLogo = flcService.getLinkLogoCompany(listJob[i].company_logo);
                }
                const total_job = listJob.length;
                return functions.success(res, "get info ntd success:", { info: ntd, listJob: listJob, total_job });
            }
            return functions.setError(res, "Ntd not found!", 400);
        }
        return functions.setError(res, "Missing input ntd_id!", 400);
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

// api đăng kí
exports.Register = async (req, res) => {
    try {
        const { Email, password, repassword, name, phone, birthday, salary_type, gender, city, district, salary, nganhNghe, chiTietNganhNghe, type, salary_to, salary_from } = req.body;
        if (Email && password && repassword && name && phone && birthday && gender && city && district && type) {
            let checkType = 'user';
            if (type == 1) checkType = 'ntd';
            const checkEmail_promise = Users.findOne({ email: Email, type }, { _id: 1 }).lean();
            const checkPhone_promise = Users.findOne({ phoneTK: phone, type }, { _id: 1 }).lean();
            const [checkEmail, checkPhone, idmax] = await Promise.all([
                checkEmail_promise,
                checkPhone_promise,
            ])
            if (checkEmail) return functions.setError(res, 'Email đã tồn tại', 409)
            if (checkPhone) return functions.setError(res, 'Số điện thoại đã tồn tại', 409)
            const id = new Date().getTime();
            await tmp.create({
                id,
                userName: name,
                phoneTK: await functions.checkPhoneNumber(phone) ? phone : null,
                phone: await functions.checkPhoneNumber(phone) ? phone : null,
                emailContact: await functions.checkEmail(Email) ? Email : null,
                email: await functions.checkEmail(Email) ? Email : null,
                password: functions.createMd5(password),
                city,
                district,
                "birthday": birthday ? Date.parse(birthday) / 1000 : 0,
                "gender": gender || 0,
                "category_id": nganhNghe,
                "skill_detail": chiTietNganhNghe,
                "salary_type": salary_type,
                "salary_permanent_number": salary,
                "salary_estimate_number_1": salary_to,
                "salary_salary_estimate_number_2": salary_from,
                type_register: type == 0 ? "uv" : "ntd"
            });
            return functions.success(res, 'Đăng kí bước 1 thành công', { id });
        }
        return functions.setError(res, 'missing data', 400);
    } catch (error) {
        console.log("🚀 ~ file: home.js:797 ~ exports.Register= ~ error:", error)
        return functions.setError(res, error.message)
    }
}