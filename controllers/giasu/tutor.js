
const fnc = require("../../services/GiaSu/functions")
const functions = require("../../services/functions")
const Users = require("../../models/Users")
const City = require("../../models/City")
const District = require("../../models/District")
const PostFindTutor = require("../../models/GiaSu/PostFindTutor")
const AllSubject = require("../../models/GiaSu/AllSubject")
const TeachingSchedule = require("../../models/GiaSu/TeachingSchedule")
const ClassTeach = require("../../models/GiaSu/ClassTeach")
const Notification = require("../../models/GiaSu/Notification")
const InviteTeach = require("../../models/GiaSu/InviteTeach")
const SaveTeach = require("../../models/GiaSu/SaveTeach")
const SaveParent = require("../../models/GiaSu/SaveParent")
const SaveCourse = require("../../models/GiaSu/SaveCourse")
const SeeUser = require("../../models/GiaSu/SeeUser")
const GSCommentRate = require("../../models/GiaSu/GSCommentRate")
const UserTeachInformation = require("../../models/GiaSu/UserTeachInformation")
const TeachType = require("../../models/GiaSu/TeachType")

exports.updateTutor = async (req, res) => {
    try {
        let { userName, gender, birthday, marital_status, ugs_tutor_style, ugs_class_teach,
            ugs_school, ugs_graduation_year, ugs_specialized, city, district, address,
            ugs_workplace, ugs_about_us, ugs_achievements, ugs_experience_year,
            ugs_title, ugs_year_start, ugs_year_end, ugs_job_description

        } = req.body
        let idGiaSu = ""
        // Kiểm tra chuỗi userName không chứa ký tự đặc biệt
        let pattern = /^[A-Za-z0-9 ]+$/; // Mẫu chỉ chứa ký tự chữ cái, số và khoảng trắng
        if (!pattern.test(userName)) {
            return functions.setError(res, 'userName không được chứa ký tự đặc biệt', 400);
        }
        if (!gender || !birthday || !marital_status || !ugs_tutor_style || !ugs_class_teach ||
            !city || !district || !address || !ugs_about_us || !ugs_experience_year) {
            return functions.setError(res, 'userName không được chứa ký tự đặc biệt', 400);
        }
        if (req.user.data.type == 2 || req.user.data.type == 0) {
            idGiaSu = req.user.data.idGiaSu
            let editGiaSu = await User.findOneAndUpdate({

            })
        } else {
            return functions.setError(res, 'không có quyền truy cập', 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}
exports.QLC_GiaSu = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        if (idGiaSu) {
            let listConditions = {};
            listConditions.st_pr_id = idGiaSu
            let [countViews, countClassTeaching, countSuggestions, countClassSave, countClassInvite, result1, result2] = await Promise.all([
                //Lượt xem
                Users.findOne({ idGiaSu: idGiaSu, "inforGiaSu.ugs_ft": 1 }).select("inforGiaSu.ugs_view -_id").lean(),
                // lop dang day
                InviteTeach.countDocuments({ ugs_teach: idGiaSu, type_invite_suggest: 0, it_status: 2 }),
                // lop da de nghi day
                InviteTeach.countDocuments({ ugs_teach: idGiaSu, type_invite_suggest: 1 }),
                // lop da luu
                SaveCourse.countDocuments({ ugs_teach: idGiaSu, sc_status: 1 }),
                // lop moi day
                InviteTeach.countDocuments({ ugs_teach: idGiaSu, type_invite_suggest: 0, it_status: 1 }),
                //PH mời dạy
                InviteTeach.aggregate([
                    {
                        $match: {
                            ugs_teach: idGiaSu,
                            type_invite_suggest: 0,
                            hidden: 1,
                            it_status: 1
                        }
                    },
                    { $sort: { it_id: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "Users",
                            localField: "ugs_parent",
                            foreignField: "idGiaSu",
                            as: "infoUsers"
                        }
                    },
                    { $unwind: { path: "$infoUsers", preserveNullAndEmptyArrays: true } },

                    {
                        $lookup: {
                            from: "GS_post_find_tutor",
                            localField: "it_class_code",
                            foreignField: "pft_id",
                            as: "post"
                        }
                    },
                    { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            "IdParent": "$infoUsers.idGiaSu",
                            "userNameParent": "$infoUsers.userName",
                            "TenLop": "$post.pft_summary",//ten lop
                            ugs_teach: 1,
                            it_class_code: 1,
                            alias: "$post.alias",
                            "ugs_address": "$infoUsers.address",
                            pft_form: "$post.pft_form",//trang thai gap mat hay online
                            pft_address: "$post.pft_address",
                            day_invitation_teach: 1,
                            it_id: 1,
                            it_status: 1,
                            "as_id": "$infoUsers.as_id",
                        }
                    },
                    {
                        $facet: {
                            paginatedResults: [{ $skip: skip }, { $limit: limit }],
                            totalCount: [
                                {
                                    $count: 'count'
                                }
                            ]
                        }
                    }
                ]),
                //PH mời dạy
                InviteTeach.aggregate([
                    {
                        $match: {
                            ugs_teach: idGiaSu,
                            type_invite_suggest: 1,
                            hidden: 1,
                            it_status: 1
                        }
                    },
                    { $sort: { day_invitation_teach: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "Users",
                            localField: "ugs_parent",
                            foreignField: "idGiaSu",
                            as: "infoUsers"
                        }
                    },
                    { $unwind: { path: "$infoUsers", preserveNullAndEmptyArrays: true } },

                    {
                        $lookup: {
                            from: "GS_post_find_tutor",
                            localField: "it_class_code",
                            foreignField: "pft_id",
                            as: "post"
                        }
                    },
                    { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },

                    {
                        $lookup: {
                            from: "GS_all_subject",
                            localField: "as_id",
                            foreignField: "as_id",
                            as: "Subject"
                        }
                    },
                    { $unwind: { path: "$Subject", preserveNullAndEmptyArrays: true } },

                    {
                        $project: {
                            "IdParent": "$infoUsers.idGiaSu",
                            "userNameParent": "$infoUsers.userName",
                            "TenLop": "$post.pft_summary",//ten lop
                            ugs_teach: 1,
                            it_class_code: 1,
                            alias: "$post.alias",
                            "ugs_address": "$infoUsers.address",
                            pft_form: "$post.pft_form",//trang thai gap mat hay online
                            pft_address: "$post.pft_address",
                            day_invitation_teach: 1,
                            it_status: 1,
                            it_id: 1,
                            "as_id": "$infoUsers.as_id",
                            "as_name": "$Subject.as_name",
                        }
                    },
                    {
                        $facet: {
                            paginatedResults: [{ $skip: skip }, { $limit: limit }],
                            totalCount: [
                                {
                                    $count: 'count'
                                }
                            ]
                        }
                    }
                ]),
            ])
            if (countViews) countViews = countViews.inforGiaSu.ugs_view ? countViews.inforGiaSu.ugs_view : 0
            let DSPhuHuynhMoiDay = {}
            let countPHMD = 0
            if (result1[0].totalCount.length > 0) {
                DSPhuHuynhMoiDay = result1[0].paginatedResults;
                countPHMD = result1[0].totalCount[0].count;
                for (let i = 0; i < DSPhuHuynhMoiDay.length; i++) {
                    ;
                    // chuyển đổi dạng date
                    DSPhuHuynhMoiDay[i].day_invitation_teach = new Date(DSPhuHuynhMoiDay[i].day_invitation_teach * 1000)
                    // xử lý trạng thái 
                    if (DSPhuHuynhMoiDay[i].pft_form == 1) DSPhuHuynhMoiDay[i].TrangThai = "Gặp mặt"
                    else DSPhuHuynhMoiDay[i].TrangThai = "Online"
                    if (DSPhuHuynhMoiDay[i].it_status == 1) DSPhuHuynhMoiDay[i].TrangThaiLoiMoi = "Đang chờ"
                    if (DSPhuHuynhMoiDay[i].it_status == 2) DSPhuHuynhMoiDay[i].TrangThaiLoiMoi = "Đã đồng ý"
                    if (DSPhuHuynhMoiDay[i].it_status == 3) DSPhuHuynhMoiDay[i].TrangThaiLoiMoi = "Đã từ chối"
                    if (DSPhuHuynhMoiDay[i].it_status == 4) DSPhuHuynhMoiDay[i].TrangThaiLoiMoi = "Đã kết thúc"
                }
            }
            let DSPhuHuynhDeNghi = {}
            let countPHDN = 0
            if (result2[0].totalCount.length > 0) {
                DSPhuHuynhDeNghi = result2[0].paginatedResults;
                countPHDN = result2[0].totalCount[0].count;
                for (let i = 0; i < DSPhuHuynhDeNghi.length; i++) {
                    ;
                    // chuyển đổi dạng date
                    DSPhuHuynhDeNghi[i].day_invitation_teach = new Date(DSPhuHuynhDeNghi[i].day_invitation_teach * 1000)
                    // xử lý trạng thái 
                    if (DSPhuHuynhDeNghi[i].pft_form == 1) DSPhuHuynhDeNghi[i].TrangThai = "Gặp mặt"
                    else DSPhuHuynhDeNghi[i].TrangThai = "Online"
                    if (DSPhuHuynhDeNghi[i].it_status == 1) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đang chờ"
                    if (DSPhuHuynhDeNghi[i].it_status == 2) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đã đồng ý"
                    if (DSPhuHuynhDeNghi[i].it_status == 3) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đã từ chối"
                    if (DSPhuHuynhDeNghi[i].it_status == 4) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đã kết thúc"
                }
            }
            return functions.success(res, "lấy thành công", { countViews, countClassTeaching, countSuggestions, countClassSave, countClassInvite, DSPhuHuynhMoiDay, countPHMD, DSPhuHuynhDeNghi, countPHDN })
        }
        return functions.setError(res, "khong tim thay nguoi dung")


    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}
exports.DS_PH_MoiDay = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;

        //PH mời dạy
        let result1 = await InviteTeach.aggregate([
            {
                $match: {
                    ugs_teach: idGiaSu,
                    type_invite_suggest: 0,
                    hidden: 1,
                    it_status: 1
                }
            },
            { $sort: { it_id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "Users",
                    localField: "ugs_parent",
                    foreignField: "idGiaSu",
                    as: "infoUsers"
                }
            },
            { $unwind: { path: "$infoUsers", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "GS_post_find_tutor",
                    localField: "it_class_code",
                    foreignField: "pft_id",
                    as: "post"
                }
            },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "IdParent": "$infoUsers.idGiaSu",
                    "userNameParent": "$infoUsers.userName",
                    "TenLop": "$post.pft_summary",//ten lop
                    ugs_teach: 1,
                    it_class_code: 1,
                    alias: "$post.alias",
                    "ugs_address": "$infoUsers.address",
                    pft_form: "$post.pft_form",//trang thai gap mat hay online
                    pft_address: "$post.pft_address",
                    day_invitation_teach: 1,
                    it_id: 1,
                    "as_id": "$infoUsers.as_id",
                }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }
        ])
        let DSPhuHuynhMoiDay = {}
        let countPHMD = 0
        if (result1[0].totalCount.length > 0) {
            DSPhuHuynhMoiDay = result1[0].paginatedResults;
            countPHMD = result1[0].totalCount[0].count;
            for (let i = 0; i < DSPhuHuynhMoiDay.length; i++) {
                ;
                // chuyển đổi dạng date
                DSPhuHuynhMoiDay[i].day_invitation_teach = new Date(DSPhuHuynhMoiDay[i].day_invitation_teach * 1000)
                // xử lý trạng thái 
                if (DSPhuHuynhMoiDay[i].pft_form == 1) DSPhuHuynhMoiDay[i].TrangThai = "Gặp mặt"
                else DSPhuHuynhMoiDay[i].TrangThai = "Online"
            }
        }
        return functions.success(res, "lấy thành công", { DSPhuHuynhMoiDay, countPHMD })
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}


exports.DS_PH_DeNghiDay = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;

        let result2 = await InviteTeach.aggregate([
            {
                $match: {
                    ugs_teach: idGiaSu,
                    type_invite_suggest: 1,
                    hidden: 1,
                    it_status: 1
                }
            },
            { $sort: { day_invitation_teach: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "Users",
                    localField: "ugs_parent",
                    foreignField: "idGiaSu",
                    as: "infoUsers"
                }
            },
            { $unwind: { path: "$infoUsers", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "GS_post_find_tutor",
                    localField: "it_class_code",
                    foreignField: "pft_id",
                    as: "post"
                }
            },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "GS_all_subject",
                    localField: "as_id",
                    foreignField: "as_id",
                    as: "Subject"
                }
            },
            { $unwind: { path: "$Subject", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    "IdParent": "$infoUsers.idGiaSu",
                    "userNameParent": "$infoUsers.userName",
                    "TenLop": "$post.pft_summary",//ten lop
                    ugs_teach: 1,
                    it_class_code: 1,
                    alias: "$post.alias",
                    "ugs_address": "$infoUsers.address",
                    pft_form: "$post.pft_form",//trang thai gap mat hay online
                    pft_address: "$post.pft_address",
                    day_invitation_teach: 1,
                    it_status: 1,
                    it_id: 1,
                    "as_id": "$infoUsers.as_id",
                    "as_name": "$Subject.as_name",
                }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }
        ])
        let DSPhuHuynhDeNghi = {}
        let countPHDN = 0
        if (result2[0].totalCount.length > 0) {
            DSPhuHuynhDeNghi = result2[0].paginatedResults;
            countPHDN = result2[0].totalCount[0].count;
            for (let i = 0; i < DSPhuHuynhDeNghi.length; i++) {
                ;
                // chuyển đổi dạng date
                DSPhuHuynhDeNghi[i].day_invitation_teach = new Date(DSPhuHuynhDeNghi[i].day_invitation_teach * 1000)
                // xử lý trạng thái 
                if (DSPhuHuynhDeNghi[i].pft_form == 1) DSPhuHuynhDeNghi[i].TrangThai = "Gặp mặt"
                else DSPhuHuynhDeNghi[i].TrangThai = "Online"
                if (DSPhuHuynhDeNghi[i].it_status == 1) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đang chờ"
                if (DSPhuHuynhDeNghi[i].it_status == 2) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đã đồng ý"
                if (DSPhuHuynhDeNghi[i].it_status == 3) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đã từ chối"
                if (DSPhuHuynhDeNghi[i].it_status == 4) DSPhuHuynhDeNghi[i].TrangThaiLoiMoi = "Đã kết thúc"
            }
        }
        return functions.success(res, "lấy thành công", { DSPhuHuynhDeNghi, countPHDN })

    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}
//gia sư đồng ý mời dạy của phụ huynh
exports.confirmInvite = async (req, res) => {
    try {
        const it_id = Number(req.body.it_id)
        if (it_id) {
            const today = new Date()
            let maxTB = await functions.getMaxIdByField(Notification, "noti_id")
            let check = await InviteTeach.findOne({
                it_id: it_id,
            })
            if (check) {
                let ugs_teach = check.ugs_teach
                let ugs_parent = check.ugs_parent
                let pft_id = check.it_class_code

                await InviteTeach.updateOne({
                    it_id: it_id,
                }, {
                    it_status: 2,
                    received_date: Date.parse(today) / 1000,
                })
                //add thong bao
                let TB = new Notification({
                    noti_id: maxTB,
                    ugs_tutor: ugs_teach,
                    ugs_parent: ugs_parent,
                    pft_id: pft_id,
                    type: 2,
                    noti_date: Date.parse(today) / 1000,
                })
                await TB.save()

                return functions.success(res, "Bạn đã chấp nhận lời đề nghị của phụ huynh")
            }
            return functions.setError(res, "không tìm thấy đề nghị mời dạy")

        }
        return functions.setError(res, "thiếu trường truyền lên")

    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}

//gia sư từ chối mời dạy của phụ huynh
exports.refuseInvite = async (req, res) => {
    try {
        const it_id = Number(req.body.it_id)
        if (it_id) {
            const today = new Date()
            let maxTB = await functions.getMaxIdByField(Notification, "noti_id")
            let check = await InviteTeach.findOne({
                it_id: it_id,
            })
            if (check) {
                let ugs_teach = check.ugs_teach
                let ugs_parent = check.ugs_parent
                let pft_id = check.it_class_code

                await InviteTeach.updateOne({
                    it_id: it_id,
                }, {
                    it_status: 3,
                    received_date: Date.parse(today) / 1000,
                })
                //add thong bao
                let TB = new Notification({
                    noti_id: maxTB,
                    ugs_tutor: ugs_teach,
                    ugs_parent: ugs_parent,
                    pft_id: pft_id,
                    type: 3,
                    noti_date: Date.parse(today) / 1000,
                })
                await TB.save()

                return functions.success(res, "Bạn đã từ chối dạy lớp này")
            }
            return functions.setError(res, "không tìm thấy đề nghị mời dạy")

        }
        return functions.setError(res, "thiếu trường truyền lên")

    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}

exports.DS_PH_DaLuu = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let result2 = await SaveParent.aggregate([
            {
                $match: {
                    ugs_id: idGiaSu,
                }
            },
            { $sort: { sp_id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "Users",
                    localField: "id_parent",
                    foreignField: "idGiaSu",
                    as: "infoUsers"
                }
            },
            { $unwind: { path: "$infoUsers", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    sp_id: 1,//id bang saveParent
                    "IdParent": "$infoUsers.idGiaSu",
                    "userNameParent": "$infoUsers.userName",
                    "ugs_address": "$infoUsers.address",
                }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }
        ])
        let DSPhuHuynhDaLuu = {}
        let countPHDL = 0
        if (result2[0].totalCount.length > 0) {
            DSPhuHuynhDaLuu = result2[0].paginatedResults;
            countPHDL = result2[0].totalCount[0].count;
        }
        return functions.success(res, "lấy thành công", { DSPhuHuynhDaLuu, countPHDL })

    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}
exports.deleteSaveParent = async (req, res) => {
    try {
        const id = req.body.id;
        if (id) {
            let data = await SaveParent.findOne({ sp_id: Number(id) }).lean()
            if (data) {
                await SaveParent.deleteOne({ sp_id: Number(id) });
                return functions.success(res, 'Xoa thanh cong!');
            }
            return functions.setError(res, "khong tim thay ban ghi")
        }
        return functions.setError(res, "thieu truong truyen len")
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}
//danh sach lop da nhan day
exports.DS_Lop_Da_Nhan_Day = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;

        let result2 = await InviteTeach.aggregate([
            {
                $match: {
                    ugs_teach: idGiaSu,
                    type_invite_suggest: 0,
                    $or:
                        [{
                            it_status: 2
                        }, {
                            it_status: 4
                        }]
                }
            },
            { $sort: { it_id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "Users",
                    localField: "ugs_parent",
                    foreignField: "idGiaSu",
                    as: "infoUsers"
                }
            },
            { $unwind: { path: "$infoUsers", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "GS_post_find_tutor",
                    localField: "it_class_code",
                    foreignField: "pft_id",
                    as: "post"
                }
            },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "GS_all_subject",
                    localField: "as_id",
                    foreignField: "as_id",
                    as: "Subject"
                }
            },
            { $unwind: { path: "$Subject", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    it_id: 1,
                    received_date: 1,
                    it_class_code: 1,
                    it_status: 1,
                    "TenLop": "$post.pft_summary",//ten lop
                    alias: "$post.alias",
                    "IdParent": "$infoUsers.idGiaSu",
                    "userNameParent": "$infoUsers.userName",
                    ugs_teach: 1,
                    "as_name": "$Subject.as_name",
                    "ugs_address": "$infoUsers.address",
                    pft_form: "$post.pft_form",//trang thai gap mat hay online
                    pft_address: "$post.pft_address",
                    pft_price_type: "$post.pft_price_type",
                    pft_price: "$post.pft_price",
                    pft_month: "$post.pft_month",
                    day_invitation_teach: 1,
                    "as_id": "$infoUsers.as_id",
                }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }
        ])
        let DS_Lop_Da_Nhan_Day = {}
        let countLDND = 0
        if (result2[0].totalCount.length > 0) {
            DS_Lop_Da_Nhan_Day = result2[0].paginatedResults;
            countLDND = result2[0].totalCount[0].count;
            for (let i = 0; i < DS_Lop_Da_Nhan_Day.length; i++) {
                ;
                // chuyển đổi dạng date
                DS_Lop_Da_Nhan_Day[i].day_invitation_teach = new Date(DS_Lop_Da_Nhan_Day[i].day_invitation_teach * 1000)
                // xử lý trạng thái 
                if (DS_Lop_Da_Nhan_Day[i].pft_form == 1) DS_Lop_Da_Nhan_Day[i].TrangThai = "Gặp mặt"
                else DS_Lop_Da_Nhan_Day[i].TrangThai = "Online"
                if (DS_Lop_Da_Nhan_Day[i].it_status == 1) DS_Lop_Da_Nhan_Day[i].TrangThaiLoiMoi = "Đang chờ"
                if (DS_Lop_Da_Nhan_Day[i].it_status == 2) DS_Lop_Da_Nhan_Day[i].TrangThaiLoiMoi = "Đã đồng ý"
                if (DS_Lop_Da_Nhan_Day[i].it_status == 3) DS_Lop_Da_Nhan_Day[i].TrangThaiLoiMoi = "Đã từ chối"
                if (DS_Lop_Da_Nhan_Day[i].it_status == 4) DS_Lop_Da_Nhan_Day[i].TrangThaiLoiMoi = "Đã kết thúc"
            }
        }
        return functions.success(res, "lấy thành công", { DS_Lop_Da_Nhan_Day, countLDND })

    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}
exports.deleteInvite = async (req, res) => {
    try {
        const id = req.body.id;
        if (id) {
            let data = await InviteTeach.findOne({ it_id: Number(id) }).lean()
            if (data) {
                await InviteTeach.deleteOne({ it_id: Number(id) });
                return functions.success(res, 'Xoa thanh cong!');
            }
            return functions.setError(res, "khong tim thay ban ghi")
        }
        return functions.setError(res, "thieu truong truyen len")
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}

exports.DS_Lop_DaLuu = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let result2 = await SaveCourse.aggregate([
            {
                $match: {
                    ugs_teach: idGiaSu,
                }
            },
            { $sort: { sc_date: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "GS_post_find_tutor",
                    localField: "pft_id",
                    foreignField: "pft_id",
                    as: "post"
                }
            },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "GS_teaching_schedule",
                    localField: "pft_id",
                    foreignField: "pft_id",
                    as: "Schedule"
                }
            },
            { $unwind: { path: "$Schedule", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "GS_all_subject",
                    localField: "as_id",
                    foreignField: "as_id",
                    as: "Subject"
                }
            },
            { $unwind: { path: "$Subject", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    sc_id: 1,//id bang SaveCourse
                    ugs_teach: 1,
                    sc_status: 1,
                    pft_price: "$post.pft_price",
                    "as_id": "$post.as_id",
                    pft_id: "$post.pft_id",
                    pft_month: "$post.pft_month",
                    ugs_id: "$post.ugs_id",
                    pft_price_type: "$post.pft_price_type",
                    "TenLop": "$post.pft_summary",//ten lop
                    alias: "$post.alias",
                    Lich_hoc: "$Schedule",
                    "saved": "Đề nghị dạy",


                }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }
        ])
        let DSLopDaLuu = {}
        let countLDL = 0
        if (result2[0].totalCount.length > 0) {
            DSLopDaLuu = result2[0].paginatedResults;
            countLDL = result2[0].totalCount[0].count;
            for (let i = 0; i < DSLopDaLuu.length; i++) {
                // xử lý tên môn học 
                if (DSLopDaLuu[i].as_id != 0) {
                    let tenMonHoc = await AllSubject.findOne({ as_id: Number(DSLopDaLuu[i].as_id) }).select("as_name").lean()
                    if (tenMonHoc) DSLopDaLuu[i].tenMonHoc = tenMonHoc.as_name
                    else DSLopDaLuu[i].tenMonHoc = "Chưa cập nhật"
                }
                // xử lý đếm đề nghị dạy thành công
                const checkCountInvite = await InviteTeach.countDocuments({
                    it_class_code: DSLopDaLuu[i].pft_id,
                    type_invite_suggest: 1,
                    it_status: 1,
                    hidden: { $ne: 0 },
                }).select("it_id it_status type_invite_suggest").lean()
                if (checkCountInvite) DSLopDaLuu[i].luotDeNghiDay = checkCountInvite
                else DSLopDaLuu[i].luotDeNghiDay = 0
                //xử lý ktra User đã đề nghị dạy chưa
                const user = await functions.getTokenUser(req, res);
                // Xử lý luồng người dùng đăng nhập
                if (user) {
                    const idTeach = user.idGiaSu; // id gia sư
                    //xử lí check đề nghị dạy
                    const check = await InviteTeach.findOne({
                        ugs_teach: idTeach,
                        it_class_code: DSLopDaLuu[i].pft_id,
                        type_invite_suggest: 1,
                        it_status: 1,
                        hidden: { $ne: 0 },
                    }).select("it_id it_status type_invite_suggest").lean()
                    if (check) DSLopDaLuu[i].saved = "Đã đề nghị dạy"
                }
            }
        }
        return functions.success(res, "lấy thành công", { DSLopDaLuu, countLDL })

    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}

exports.deleteSaveClass = async (req, res) => {
    try {
        const id = req.body.id;
        const idGiaSu = req.user.data.idGiaSu
        if (id) {
            let data = await SaveCourse.findOne({ sc_id: Number(id), ugs_teach: idGiaSu }).lean()
            if (data) {
                await SaveCourse.deleteOne({ sc_id: Number(id), ugs_teach: idGiaSu });
                return functions.success(res, 'Xoa thanh cong!');
            }
            return functions.setError(res, "khong tim thay ban ghi")
        }
        return functions.setError(res, "thieu truong truyen len")
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}

exports.offerTeach = async (req, res) => {
    try {
        const ugs_id = req.user.data.idGiaSu
        const pft_id = req.body.pft_id
        const ugs_parent = req.body.ugs_parent
        const pft_nb_lesson = req.body.pft_nb_lesson
        const ot_date = req.body.ot_date
        const ot_status = req.body.ot_status
        const now = functions.getTimeNow()
        let maxIV = await functions.getMaxIdByField(InviteTeach, "it_id")
        let maxTB = await functions.getMaxIdByField(Notification, "noti_id")
        if (pft_id) {

            const check = await PostFindTutor.findOne({ pft_id: Number(pft_id) }).select("trangthai_lop pft_address").lean()
            if (check) {
                const address = check.pft_address
                const qr = await InviteTeach.findOne({
                    ugs_teach: ugs_id,
                    it_class_code: pft_id,
                    $and: [
                        { it_status: { $ne: 3 } },
                        { it_status: { $ne: 4 } },
                    ],
                    hidden: { $ne: 0 },
                }).select("it_id it_status type_invite_suggest").lean()
                if (check.trangthai_lop == 0 || check.trangthai_lop == 1) {
                    if (qr) {
                        if (qr.type_invite_suggest == 0) {
                            if (qr.it_status == 1) {
                                return functions.success(res, "Lớp này bạn đã được mời dạy");
                            } else if (qr.it_status == 2) {
                                return functions.success(res, "Bạn đang dạy lớp này rồi");
                            } else if (qr.it_status == 3 || qr.it_status == 4) {
                                let insert = new InviteTeach({
                                    it_id: maxIV,
                                    ugs_parent: ugs_parent,
                                    ugs_teach: ugs_id,
                                    it_class_code: pft_id,
                                    as_id: pft_nb_lesson,
                                    it_address: address,
                                    day_invitation_teach: now,
                                    it_status: 1,
                                    type_invite_suggest: 1,
                                })
                                await insert.save()
                                //add thong bao
                                let TB = new Notification({
                                    noti_id: maxTB,
                                    ugs_tutor: ugs_id,
                                    ugs_parent: ugs_parent,
                                    pft_id: pft_id,
                                    type: 4,
                                    noti_date: now,
                                })
                                await TB.save()
                                return functions.success(res, "Đề nghị khóa học thành công");
                            }
                        } else if (qr.type_invite_suggest == 1) {
                            if (qr.it_status == 1) {
                                return functions.success(res, "Bạn đã đề nghị dạy lớp này rồi");
                            } else if (qr.it_status == 2) {
                                return functions.success(res, "Bạn đang dạy lớp này rồi");
                            } else if (qr.it_status == 3 || qr.it_status == 4) {
                                let insert = new InviteTeach({
                                    it_id: maxIV,
                                    ugs_parent: ugs_parent,
                                    ugs_teach: ugs_id,
                                    it_class_code: pft_id,
                                    as_id: pft_nb_lesson,
                                    it_address: address,
                                    day_invitation_teach: now,
                                    it_status: 1,
                                    type_invite_suggest: 1,
                                })
                                await insert.save()
                                //add thong bao
                                let TB = new Notification({
                                    noti_id: maxTB,
                                    ugs_tutor: ugs_id,
                                    ugs_parent: ugs_parent,
                                    pft_id: pft_id,
                                    type: 4,
                                    noti_date: now,
                                })
                                await TB.save()
                                return functions.success(res, "Đề nghị khóa học thành công");
                            }
                        }
                    } else {
                        let insert = new InviteTeach({
                            it_id: maxIV,
                            ugs_parent: ugs_parent,
                            ugs_teach: ugs_id,
                            it_class_code: pft_id,
                            as_id: pft_nb_lesson,
                            it_address: address,
                            day_invitation_teach: now,
                            it_status: 1,
                            type_invite_suggest: 1,
                        })
                        await insert.save()
                        //add thong bao
                        let TB = new Notification({
                            noti_id: maxTB,
                            ugs_tutor: ugs_id,
                            ugs_parent: ugs_parent,
                            pft_id: pft_id,
                            type: 4,
                            noti_date: now,
                        })
                        await TB.save()
                        return functions.success(res, "Đề nghị khóa học thành công");

                    }
                }
                return functions.setError(res, "Lớp học đã kết thúc.")
            }
            return functions.setError(res, "Khong tim thay lớp học.")
        }
        return functions.setError(res, "thiếu trường truyền lên.")
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}
exports.SaveCourse = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        const pft_id = req.body.pft_id
        // const sc_status = req.body.sc_status
        const sc_date = functions.getTimeNow()
        if (pft_id) {
            let check = await SaveCourse.findOne({
                pft_id: pft_id,
                ugs_teach: idGiaSu,
            }).select(" ugs_teach pft_id sc_status ").lean()
            if (check) {
                await SaveCourse.deleteOne({
                    pft_id: pft_id,
                    ugs_teach: idGiaSu,
                })
                return functions.success(res, "Xóa lưu Lớp thành công");

            } else {
                let max = await functions.getMaxIdByField(SaveCourse, "sc_id")
                let insert = new SaveCourse({
                    sc_id: max,
                    ugs_teach: idGiaSu,
                    pft_id: pft_id,
                    sc_status: 1,
                    sc_date: sc_date,
                })
                await insert.save()
                return functions.success(res, "Lưu khóa học thành công");
            }

        }
        return functions.setError(res, "thiếu trường truyền lên.")
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}
exports.SaveParent = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu
        const sp_address = req.body.sp_address;
        const id_parent = req.body.id_parent
        if (id_parent && sp_address) {
            let data = await SaveParent.findOne({
                ugs_id: idGiaSu,
                id_parent: id_parent,
            }).select(" ugs_id id_parent sp_detail ").lean()
            if (data) {
                return functions.success(res, 'Bạn đã lưu phụ huynh này rồi');
            } else {
                let max = await functions.getMaxIdByField(SaveParent, "sp_id")
                let insert = new SaveParent({
                    sp_id: max,
                    ugs_id: idGiaSu,
                    id_parent: id_parent,
                    sp_detail: sp_address,
                })
                await insert.save()

                return functions.success(res, 'Lưu phụ huynh thành công');
            }
        }
        return functions.setError(res, "thiếu trường truyền lên.")
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}

exports.typeteach = async (req, res) => {
    try {
        const nametype = req.body.nametype
        const id = req.body.id
        let cond = {}
        if (nametype) cond.nametype = { $regex: nametype, $options: 'i' }
        if (id) cond.id = Number(id)
        let list = await TeachType.find(cond).lean()
        return functions.success(res, "lấy thành công", { list });
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}
exports.teaching_schedule = async (req, res) => {
    try {
        const ugs_id = req.body.ugs_id
        const pft_id = req.body.pft_id
        const ts_id = req.body.ts_id
        let cond = {}
        if (ts_id) cond.ts_id = Number(ts_id)
        if (ugs_id) cond.ugs_id = Number(ugs_id)
        if (pft_id) cond.pft_id = Number(pft_id)
        let list = await TeachingSchedule.find(cond).lean()
        return functions.success(res, "lấy thành công", { list });
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}
exports.UserTeachInformation = async (req, res) => {
    try {
        const ugs_id = req.user.data.idGiaSu
        let cond = {}
        cond.ugs_id = Number(ugs_id)
        let list = await UserTeachInformation.find(cond).select(" ugs_id ugs_unit_price ugs_salary ugs_month ugs_formality ").lean()
        return functions.success(res, "lấy thành công", { list });
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
}