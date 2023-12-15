const functions = require('../../../services/functions')
const vanthu = require('../../../services/vanthu.js');
const tbl_qly_congvan = require('../../../models/Vanthu365/tbl_qly_congvan');
const tbl_qlcv_edit = require('../../../models/Vanthu365/tbl_qlcv_edit');
const Users = require('../../../models/Users');

exports.getDataDidDelete = async(req, res, next) => {
    try {
        let comId = Number(req.comId);

        let data = {};

        let countTextReceve = await tbl_qly_congvan.countDocuments({ cv_type_loai: 1, cv_type_xoa: 1, cv_type_hd: 0, cv_usc_id: comId })

        let countTextSend = await tbl_qly_congvan.countDocuments({ cv_type_loai: 2, cv_type_xoa: 1, cv_type_hd: 0, cv_usc_id: comId })

        let countContractReceve = await tbl_qly_congvan.countDocuments({ cv_type_loai: 1, cv_type_xoa: 1, cv_type_hd: 1, cv_usc_id: comId })

        let countContractSend = await tbl_qly_congvan.countDocuments({ cv_type_loai: 2, cv_type_xoa: 1, cv_type_hd: 1, cv_usc_id: comId })

        // let list = await tbl_qly_congvan.find({ cv_type_xoa: 1, cv_usc_id: comId }, {
        //     cv_id: 1,
        //     cv_name: 1,
        //     cv_so: 1,
        //     cv_type_user_xoa: 1,
        //     cv_user_xoa: 1,
        //     cv_time_xoa: 1,
        //     cv_type_loai: 1
        // }).sort({ cv_time_xoa: -1 }).limit(6)

        let list = await tbl_qly_congvan.aggregate([
            { $match: { cv_type_xoa: 1, cv_usc_id: comId } },
            { $sort: { cv_time_xoa: -1 } },
            { $limit: 6 },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'cv_user_xoa',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    cv_id: 1,
                    cv_name: 1,
                    cv_so: 1,
                    cv_type_user_xoa: 1,
                    cv_user_xoa: '$user.userName',
                    cv_time_xoa: 1,
                    cv_type_loai: 1
                }
            }
        ])
        data.countTextReceve = countTextReceve;
        data.countTextSend = countTextSend;
        data.countContractReceve = countContractReceve;
        data.countContractSend = countContractSend;

        data.list = list;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.error(err);
        return functions.setError(res, error)
    }
}

exports.getDetailDataDelete = async(req, res, next) => {
    try {
        let data = {};
        let comId = req.comId;
        let dateNow = new Date();
        let day = dateNow.getDate();
        let month = dateNow.getMonth() + 1;
        let year = dateNow.getFullYear();
        let date = year + '/' + month + '/' + day
        let timeNow = new Date(date).getTime() / 1000;
        let searchKey = req.body.searchKey;
        let type = Number(req.body.type);
        let cv_type_loai = Number(req.body.cv_type_loai);
        let conditions = {};
        if (!type || !cv_type_loai) return functions.setError(res, 'missing data', 400)

        if (searchKey) {
            conditions = {
                $or: [
                    { cv_name: new RegExp(searchKey, 'i') },
                    { cv_so: { $regex: searchKey } }
                ]
            }
        }
        if (type === 1) conditions.cv_type_hd = 0
        if (type === 2) conditions.cv_type_hd = 1
        if (cv_type_loai === 1) conditions.cv_type_loai = 1
        if (cv_type_loai === 2) conditions.cv_type_loai = 2
        conditions.cv_usc_id = comId;
        conditions.cv_type_xoa = 1;
        conditions.cv_time_xoa = { $gte: timeNow }
        let dataToday = await tbl_qly_congvan.find(conditions).sort({ cv_time_xoa: -1 }).lean();
        for (let i = 0; i < dataToday.length; i++) {
            const userXoa = await Users.findOne({
                _id: dataToday[i].cv_user_xoa
            })
            if (userXoa) {
                dataToday[i].nameUserXoa = userXoa.userName;
            }
        }
        conditions.cv_time_xoa = { $lt: timeNow }
        let dataPrevious = await tbl_qly_congvan.find(conditions).sort({ cv_time_xoa: -1 }).lean();
        for (let i = 0; i < dataPrevious.length; i++) {
            const userXoa = await Users.findOne({
                _id: dataPrevious[i].cv_user_xoa
            })
            if (userXoa) {
                dataPrevious[i].nameUserXoa = userXoa.userName;
            }
        }
        data.dataToday = dataToday;
        data.dataPrevious = dataPrevious;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.error(error);
        return functions.setError(res, error)
    }
};

exports.deleteVV = async(req, res, next) => {
    try {
        let id = req.body.id;
        let arr = id.split(',');
        if (Array.isArray(arr)) {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Number(arr[i])
                let check = await tbl_qly_congvan.findById(arr[i]);
                if (!check) return functions.setError(res, 'Không tìm thấy bài đăng', 404)
            }
            await tbl_qly_congvan.deleteMany({ _id: { $in: arr } })
            await tbl_qlcv_edit.deleteMany({ ed_cv_id: { $in: arr } })
            return functions.success(res, 'Xoá dữ liệu thành công')
        }
        return functions.setError(res, 'Nhập lại id đúng định dạng', 400)
    } catch (error) {
        return functions.setError(res, error.message)
    }
};