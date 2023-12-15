const functions = require('../../../services/functions')
const vanthu = require('../../../services/vanthu.js');
const tbl_qly_congvan = require('../../../models/Vanthu365/tbl_qly_congvan');
const tbl_qlcv_edit = require('../../../models/Vanthu365/tbl_qlcv_edit');
const Users = require('../../../models/Users');
const TextBook = require('../../../models/Vanthu365/tbl_textBook');
const OrganizeDetail = require('../../../models/qlc/OrganizeDetail');

// lịch sử cập nhật
exports.getDataHistory = async(req, res, next) => {
    try {
        let comId = Number(req.comId);

        let data = {};

        let countTextUpdate = await tbl_qly_congvan.countDocuments({ cv_type_edit: 1, cv_type_xoa: 0, cv_type_hd: 0, cv_usc_id: comId })

        let countTextRecover = await tbl_qly_congvan.countDocuments({ cv_type_kp: 1, cv_type_xoa: 0, cv_type_hd: 0, cv_usc_id: comId })

        let countContractUpdate = await tbl_qly_congvan.countDocuments({ cv_type_edit: 1, cv_type_xoa: 0, cv_type_hd: 1, cv_usc_id: comId })

        let countContractRecover = await tbl_qly_congvan.countDocuments({ cv_type_kp: 1, cv_type_xoa: 0, cv_type_hd: 1, cv_usc_id: comId })

        let list = await tbl_qly_congvan.find({ $or: [{ cv_type_kp: 1 }, { cv_type_edit: 1 }], cv_type_xoa: 0, cv_usc_id: comId }, {
            cv_id: 1,
            cv_so: 1,
            cv_name: 1,
            cv_type_edit: 1,
            cv_type_kp: 1,
            cv_type_user_kp: 1,
            cv_user_kp: 1,
            cv_type_user_kp: 1,
            cv_user_kp: 1,
            cv_time_edit: 1,
            cv_time_kp: 1
        }).limit(6)

        data.countTextUpdate = countTextUpdate;
        data.countTextRecover = countTextRecover;
        data.countContractUpdate = countContractUpdate;
        data.countContractRecover = countContractRecover;
        data.list = list;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.error(err);
        return functions.setError(res, error)
    }
}

// chi tiết lịch sử cập nhật
exports.getDetailHistoryUpdate = async(req, res, next) => {
    try {
        let comId = req.comId;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        let type_vb = Number(req.body.type_vb);
        let name_vb = req.body.name_vb;
        let date_start = new Date(req.body.date_start).getTime() / 1000;
        let date_end = new Date(req.body.date_end).getTime() / 1000;
        let type_book = Number(req.body.type_book);
        let type = Number(req.body.type);
        if (!type) return functions.setError(res, 'missing type', 400);

        let conditions = {};
        switch (type_vb) {
            case 1:
                conditions.cv_type_loai = 1;
                conditions.cv_type_hd = 0;
                break;
            case 2:
                conditions.cv_type_loai = 2;
                conditions.cv_type_hd = 0;
                break;
            case 3:
                conditions.cv_type_loai = 1;
                conditions.cv_type_hd = 1;
                break;
            case 4:
                conditions.cv_type_loai = 2;
                conditions.cv_type_hd = 1;
                break;
            case 5:
                conditions.cv_type_hd = 1;
                break;
            default:
                conditions.cv_type_hd = 0;
        }
        if (type_book) conditions.cv_id_book = type_book;
        if (date_start) conditions.cv_time_edit = { $gte: date_start };
        if (date_end) conditions.cv_time_edit = { $lte: date_end };
        if (date_start && date_end) conditions.cv_time_edit = { $gte: date_start, $lte: date_end };
        conditions.cv_usc_id = comId;
        conditions.cv_type_xoa = 0;
        if (type === 1) {
            conditions.cv_type_edit = 1;
        } else if (type === 2) {
            conditions.cv_type_kp = 1;
        }
        if (name_vb) {
            conditions.cv_name = new RegExp(name_vb, 'i');
        }

        let data = await tbl_qly_congvan.find(conditions).sort({ cv_time_edit: -1 }).skip(skip).limit(limit).lean();
        let count = await tbl_qly_congvan.countDocuments(conditions);
        for (let i = 0; i < data.length; i++) {
            let lichsucapnhat = await tbl_qlcv_edit.findOne({ ed_cv_id: data[i]._id }).lean();
            if (lichsucapnhat) data[i].lichsucapnhat = lichsucapnhat.ed_nd;
            else data[i].lichsucapnhat = '';
            if (data[i].cv_id_book) {
                const book = await TextBook.findOne({
                    _id: data[i].cv_id_book
                });
                if (book) {
                    data[i].bookName = book.name_book;
                }
            }
        }
        return functions.success(res, 'get data success', { data, count })
    } catch (error) {
        console.error(error);
        return functions.setError(res, error)
    }
}
exports.getDetailAndHistory = async(req, res, next) => {
    try {
        let comId = req.comId;
        let data = await tbl_qly_congvan.findOne({
            _id: Number(req.body._id),
            cv_usc_id: req.comId,
            cv_type_xoa: 0,
        }).lean();
        data.lichsucapnhat = await tbl_qlcv_edit.aggregate([{
            $match: {
                ed_cv_id: data._id
            }
        }, {
            $lookup: {
                from: 'Users',
                localField: 'ed_user',
                foreignField: '_id',
                pipeline: [{
                    $project: {
                        userName: '$userName',
                        idQLC: '$idQLC'
                    }
                }],
                as: 'editUser'
            }
        }, {
            $unwind: {
                path: '$editUser',
                preserveNullAndEmptyArrays: true,
            },
        }]);
        if (data.cv_file && data.cv_file !== "") {
            data.cv_file = vanthu.getLinkFile('file_van_ban', data.cv_time_create, data.cv_file)
        }
        if (data.cv_user_save.length > 0) {
            const listIDUserSave = data.cv_user_save.split(',').map(Number);
            const listUserSave = await Users.find({
                _id: {
                    $in: listIDUserSave
                }
            }, { userName: 1, idQLC: 1 });
            data.userSave = listUserSave
        }
        if (data.cv_user_ky) {
            const listIDUserKy = data.cv_user_ky.split(',').map(Number);
            const listUserKy = await Users.find({
                _id: {
                    $in: listIDUserKy
                }
            }, { userName: 1, idQLC: 1 });
            data.userKy = listUserKy
        }
        if (data.cv_id_book) {
            const book = await TextBook.findOne({
                _id: data.cv_id_book
            });
            if (book) {
                data.bookName = book.name_book;
            }
        }
        if (data.cv_type_soan == 2) {
            data.noiGui = data.cv_soan_ngoai;
            data.userSoan = {
                userName: data.cv_name_soan
            };
        } else {
            if (data.cv_user_soan) {
                const userSoan = await Users.findOne({
                    _id: data.cv_user_soan
                }, { userName: 1, idQLC: 1 })
                data.userSoan = userSoan
            }
            // if (data.cv_nhan_ngoai) {
            //     const userGui = await Users.findOne({
            //         _id: Number(data.cv_nhan_ngoai)
            //     });
            //     if (userGui && userGui.type == 1) {
            //         data.noiGui = userGui.userName;
            //     } else if (userGui && userGui.type == 2) {
            //         let idComGui = userGui.inForPerson.employee.com_id
            //         const ctyGui = await Users.findOne({
            //             idQLC: idComGui,
            //             type: 1
            //         });
            //         data.noiGui = ctyGui.userName;
            //     }
            // } else {
            if (data.cv_phong_soan) {
                const organize = await OrganizeDetail.findOne({
                    id: data.cv_phong_soan,
                    comId: comId,
                })
                if (organize) {
                    data.noiGui = organize.organizeDetailName;
                }
            }
            // }
        }
        if (data.cv_nhan_noibo) {
            const organize = await OrganizeDetail.findOne({
                id: data.cv_nhan_noibo,
                comId: comId,
            })
            if (organize) {
                data.noi_nhan = organize.organizeDetailName;
            }
        }
        if (data.cv_chuyen_noibo) {
            const userChuyen = await Users.findOne({
                _id: Number(data.cv_chuyen_noibo)
            }, { userName: 1, idQLC: 1 });
            if (userChuyen) {
                data.user_chuyen = userChuyen.userName
            }
        }
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.error(error);
        return functions.setError(res, error)
    }
}