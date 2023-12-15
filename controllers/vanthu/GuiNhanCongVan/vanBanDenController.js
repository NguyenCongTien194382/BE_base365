const functions = require("../../../services/functions");
const vanThuService = require("../../../services/vanthu");
const VanBan = require('../../../models/Vanthu365/van_ban');
const FeedBack = require('../../../models/Vanthu365/tbl_feedback');
const DeXuatXuLy = require('../../../models/Vanthu/de_xuat_xu_ly');
const history_duyet_vb = require('../../../models/Vanthu365/history_duyet_vb');
const Users = require('../../../models/Users');

let listVanBan = async(condition, skip, limit) => {
    try {
        let listVB = await VanBan.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "vanthu_group_van_bans",
                    localField: "nhom_vb",
                    foreignField: "id_group_vb",
                    as: "matchedDocuments"
                }
            },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        return listVB;
    } catch (err) {
        console.log(err);
    }
}

let totalVanBan = async(condition) => {
    try {
        let totalVB = await VanBan.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "vanthu_group_van_bans",
                    localField: "nhom_vb",
                    foreignField: "id_group_vb",
                    as: "matchedDocuments"
                }
            },
            {
                $group: { _id: null, count: { $sum: 1 } }
            },
            {
                $project: { _id: 0, count: 1 }
            }
        ]);
        return totalVB;
    } catch (err) {
        console.log(err);
    }
}

//--------van ban moi
exports.getListVanBanMoi = async(req, res, next) => {
    try {
        let { ten_vb_search, trang_thai_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;
        if (trang_thai_search == 1) trang_thai_search = 0;
        let _id = req.user.data._id;
        let id = req.user.data.idQLC;
        let com_id = req.user.data.com_id;
        let minTime = vanThuService.convertTimestamp(Date.now()) - 2592000;
        let condition = {
            $and: [{
                    $or: [{
                            $and: [{
                                    $or: [{
                                            user_nhan: new RegExp(String(id)),
                                            gui_ngoai_cty: 0,
                                        },
                                        {
                                            user_nhan: new RegExp(String(id)),
                                            gui_ngoai_cty: { $exists: false }
                                        },
                                        {
                                            user_nhan: new RegExp(String(_id)),
                                            gui_ngoai_cty: 1,
                                        },
                                    ]
                                },
                                {
                                    trang_thai_vb: 6,
                                    $or: [{
                                        type_thu_hoi: 0,
                                    }, {
                                        type_thu_hoi: { $exists: false }
                                    }]
                                }
                            ]
                        },
                        {
                            $and: [{
                                    $or: [{
                                            nguoi_xet_duyet: new RegExp(String(id)),
                                            gui_ngoai_cty: 0,
                                        },
                                        {
                                            nguoi_xet_duyet: new RegExp(String(id)),
                                            gui_ngoai_cty: { $exists: false }
                                        },
                                        {
                                            nguoi_xet_duyet: new RegExp(String(_id)),
                                            gui_ngoai_cty: 1,
                                        },
                                    ]
                                }
                                // { type_duyet: 1 }
                            ]
                        },
                        {
                            nguoi_ky: new RegExp(String(id)),
                        },
                        {
                            user_forward: new RegExp(String(id))
                        },
                        {
                            $or: [{
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: 0,
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: { $exists: false }
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(_id)),
                                    gui_ngoai_cty: 1,
                                },
                            ]
                        },
                    ],
                },
                // { created_date: { $gt: minTime } }
            ]
        };
        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (trang_thai_search) condition.trang_thai_vb = Number(trang_thai_search);
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (time_end && !time_start) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanMoi = await listVanBan(condition, skip, limit);
        for (let i = 0; i < listVanBanMoi.length; i++) {
            const history_confirm = await history_duyet_vb.findOne({
                id_user: id,
                id_vb: listVanBanMoi[i]._id,
            }).sort({ time: -1 });

            if (history_confirm && history_confirm.type_handling == 2) {
                listVanBanMoi[i].you_confirm = true;
            } else {
                listVanBanMoi[i].you_confirm = false;
            }
        }
        let totalCount = await totalVanBan(condition);
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        return functions.success(res, "Get list van ban moi success!", { totalCount, page, pageSize, listVanBanMoi });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

//--------van ban da xu ly
exports.getListVanBanDaXuLy = async(req, res, next) => {
    try {
        let { ten_vb_search, trang_thai_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;
        if (trang_thai_search == 1) trang_thai_search = 0;

        let id = req.user.data.idQLC;
        let _id = req.user.data._id;
        let com_id = req.user.data.com_id;

        let condition = {
            $and: [{
                    $or: [{
                            $and: [{
                                    $or: [{
                                            user_nhan: new RegExp(String(id)),
                                            gui_ngoai_cty: 0,
                                        },
                                        {
                                            user_nhan: new RegExp(String(id)),
                                            gui_ngoai_cty: { $exists: false }
                                        },
                                        {
                                            user_nhan: new RegExp(String(_id)),
                                            gui_ngoai_cty: 1,
                                        },
                                    ]
                                },
                                {
                                    trang_thai_vb: 6,
                                    $or: [{
                                        type_thu_hoi: 0,
                                    }, {
                                        type_thu_hoi: { $exists: false }
                                    }]
                                }
                            ]
                        },
                        {
                            $and: [{
                                    $or: [{
                                            nguoi_xet_duyet: new RegExp(String(id)),
                                            gui_ngoai_cty: 0,
                                        },
                                        {
                                            nguoi_xet_duyet: new RegExp(String(id)),
                                            gui_ngoai_cty: { $exists: false }
                                        },
                                        {
                                            nguoi_xet_duyet: new RegExp(String(_id)),
                                            gui_ngoai_cty: 1,
                                        },
                                    ]
                                }
                                // { type_duyet: 1 }
                            ]
                        },
                        {
                            nguoi_ky: new RegExp(String(id)),
                        },
                        {
                            user_forward: new RegExp(String(id))
                        },
                        {
                            $or: [{
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: 0,
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: { $exists: false }
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(_id)),
                                    gui_ngoai_cty: 1,
                                },
                            ]
                        },
                    ],
                },
                {
                    trang_thai_vb: {
                        $in: [3, 6]
                    }
                }
            ]
        };

        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (trang_thai_search) condition.trang_thai_vb = Number(trang_thai_search);
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (time_end && !time_start) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanDaXuLy = await listVanBan(condition, skip, limit);
        let totalCount = await totalVanBan(condition);
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        return functions.success(res, "Get list van ban den da xu ly success!", { totalCount, page, pageSize, listVanBanDaXuLy });
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}

//--------van ban can duyet
exports.getListVanBanCanDuyet = async(req, res, next) => {
    try {
        let { ten_vb_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;

        let id = req.user.data.idQLC;
        let _id = req.user.data._id
        let com_id = req.user.data.com_id;

        condition = {
            $and: [{
                    $or: [{
                            nguoi_xet_duyet: new RegExp(String(id)),
                            gui_ngoai_cty: 0,
                        },
                        {
                            nguoi_xet_duyet: new RegExp(String(id)),
                            gui_ngoai_cty: { $exists: false }
                        },
                        {
                            nguoi_xet_duyet: new RegExp(String(_id)),
                            gui_ngoai_cty: 1,
                        },
                    ]
                },
                // {
                //     trang_thai_vb: {
                //         $in: [0, 10]
                //     },
                // }
            ]
        }
        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (time_end && !time_start) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanDenCanDuyet = await listVanBan(condition, skip, limit);
        let totalCount = await totalVanBan(condition);
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        for (let i = 0; i < listVanBanDenCanDuyet.length; i++) {
            const history_confirm = await history_duyet_vb.findOne({
                id_user: id,
                id_vb: listVanBanDenCanDuyet[i]._id,
            }).sort({ time: -1 });

            if (history_confirm && history_confirm.type_handling == 2) {
                listVanBanDenCanDuyet[i].you_confirm = true;
            } else {
                listVanBanDenCanDuyet[i].you_confirm = false;
            }
        }
        return functions.success(res, "Get list van ban den can duyet success!", { totalCount, page, pageSize, listVanBanDenCanDuyet });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}


//---van ban thu hoi
exports.getListVanBanThuHoi = async(req, res, next) => {
    try {
        let { ten_vb_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;

        let _id = req.user.data._id;
        let id = req.user.data.idQLC;
        let com_id = req.user.data.com_id;

        let condition = {
            $and: [{
                $or: [{
                        $and: [{
                                $or: [{
                                        nguoi_xet_duyet: new RegExp(String(id)),
                                        gui_ngoai_cty: 0,
                                    },
                                    {
                                        nguoi_xet_duyet: new RegExp(String(id)),
                                        gui_ngoai_cty: { $exists: false }
                                    },
                                    {
                                        nguoi_xet_duyet: new RegExp(String(_id)),
                                        gui_ngoai_cty: 1,
                                    },
                                ]
                            },
                            {
                                type_thu_hoi: 1,
                            }
                        ]
                    },
                    {
                        nguoi_ky: new RegExp(String(id)),
                        type_thu_hoi: 1,
                    },
                    {
                        user_forward: new RegExp(String(id)),
                        type_thu_hoi: 1,
                    },
                    {
                        $and: [{
                            $or: [{
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: 0,
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: { $exists: false }
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(_id)),
                                    gui_ngoai_cty: 1,
                                },
                            ]
                        }, {
                            type_thu_hoi: 1,
                        }]
                    },
                ],
            }, ]
        };

        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (time_end && !time_start) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanDaThuHoi = await listVanBan(condition, skip, limit);
        let totalCount = await totalVanBan(condition);
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        return functions.success(res, "Get list van ban den thu hoi success!", { totalCount, page, pageSize, listVanBanDaThuHoi });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

//van ban cap nhat
exports.getListVanBanCapNhat = async(req, res, next) => {
    try {
        let { type_thay_the, type_thu_hoi, ten_vb_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;

        let _id = req.user.data._id
        let id = req.user.data.idQLC;
        let com_id = req.user.data.com_id;

        let condition = {
            $and: [{
                $or: [{
                        $and: [{
                            $or: [{
                                    nguoi_xet_duyet: new RegExp(String(id)),
                                    gui_ngoai_cty: 0,
                                },
                                {
                                    nguoi_xet_duyet: new RegExp(String(id)),
                                    gui_ngoai_cty: { $exists: false }
                                },
                                {
                                    nguoi_xet_duyet: new RegExp(String(_id)),
                                    gui_ngoai_cty: 1,
                                },
                            ]
                        }]
                    },
                    {
                        nguoi_ky: new RegExp(String(id)),
                    },
                    {
                        user_forward: new RegExp(String(id))
                    },
                    {
                        $or: [{
                                nguoi_theo_doi: new RegExp(String(id)),
                                gui_ngoai_cty: 0,
                            },
                            {
                                nguoi_theo_doi: new RegExp(String(id)),
                                gui_ngoai_cty: { $exists: false }
                            },
                            {
                                nguoi_theo_doi: new RegExp(String(_id)),
                                gui_ngoai_cty: 1,
                            },
                        ]
                    },
                ],
            }, ]
        };
        if (!type_thu_hoi && !type_thay_the) {
            return functions.setError(res, "Missing input type_thu_hoi or type_thay_the");
        }
        if (type_thu_hoi && type_thay_the) {
            condition['$or'] = [{
                type_thu_hoi: 1,
            }, {
                type_thay_the: 1,
            }]
        }
        //lay ra van ban thu hoi
        else if (type_thu_hoi) condition.type_thu_hoi = 1;
        //lay ra van ban thay the
        else if (type_thay_the) condition.type_thay_the = 1;

        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (time_end && !time_start) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanCapNhat = await listVanBan(condition, skip, limit);
        let totalCount = await totalVanBan(condition);
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        return functions.success(res, "Get list van ban den da xu ly success!", { totalCount, page, pageSize, listVanBanCapNhat });
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}

//----------------------khac---------------------

//gui feedback (tra loi)
exports.sendFeedback = async(req, res, next) => {
    try {
        let { id_vb, feedback } = req.body;
        let id_user = req.user.data.idQLC;
        let name_user = req.user.data.userName;
        if (!id_vb || !feedback) {
            return functions.setError(res, "Missing input value!", 404);
        }
        let idMax = await vanThuService.getMaxId(FeedBack);
        let timestamp = vanThuService.convertTimestamp(Date.now());

        let feedBack = new FeedBack({
            _id: idMax,
            userFb: id_user,
            vb_fb: id_vb,
            nameUser: name_user,
            ndFeedback: feedback,
            createTime: timestamp
        })
        feedBack = await feedBack.save();
        if (!feedBack) {
            return functions.setError(res, "Tao feed back that bai!", 405);
        }
        return functions.success(res, "Tao feed back thanh cong!");
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

//
exports.sendLeader = async(req, res, next) => {
    try {
        let { id_leader, y_kien, ghi_chu, id_vb } = req.body;
        if (!id_leader || !y_kien || !ghi_chu || !id_vb) {
            return functions.setError(res, "Missing input value!", 404);
        }
        let idMax = await vanThuService.getMaxId(DeXuatXuLy);
        let deXuatXuLy = new DeXuatXuLy({
            _id: idMax,
            id_vb: id_vb,
            user_xu_ly: id_leader,
            y_kien_xu_ly: y_kien,
            ghi_chu: ghi_chu
        })
        deXuatXuLy = await deXuatXuLy.save();
        if (!deXuatXuLy) {
            return functions.setError(res, "Gui cho leader that bai!", 505);
        }
        let vanBan = await VanBan.findOne({ _id: id_vb }, { _id: 1, user_forward: 1 });
        let ct_ld = id_leader;
        if (vanBan.user_forward != "") {
            ct_ld = `${vanBan.user_forward},${id_leader}`;
        }
        let timestamp = vanThuService.convertTimestamp(Date.now());
        vanBan = await VanBan.findOneAndUpdate({ _id: id_vb }, { user_forward: ct_ld, update_time: timestamp });
        if (!vanBan) {
            return functions.setError(res, "update van ban that bai!", 506);
        }
        return functions.success(res, "Gui cho leader thanh cong!");
    } catch (err) {
        return functions.setError(res, err.message);
    }
}
exports.confirm_vanban = async(req, res, next) => {
    try {
        const {
            id_vb
        } = req.body;
        const idQLC = req.user.data.idQLC;
        const com_id = req.user.data.com_id;
        const vb = await VanBan.findOne({
            _id: id_vb
        })
        if (vb) {
            //Duyệt đồng thời
            if (vb.type_xet_duyet == 2) {
                let timeNow = new Date();
                const maxID = await vanThuService.getMaxID(history_duyet_vb);
                let newID = 0;
                if (maxID) {
                    newID = Number(maxID) + 1;
                }
                const createHis = new history_duyet_vb({
                    _id: newID,
                    id_user: idQLC,
                    com_id: com_id,
                    id_vb: vb._id,
                    type_handling: 2,
                    time: timeNow
                });
                await createHis.save();
                let id_user_duyet = [];
                if (vb.gui_ngoai_cty == 1) {
                    const _id_user_duyet = vb.nguoi_xet_duyet.split(',').map(Number);
                    const listUserDuyet = await Users.find({
                        _id: {
                            $in: _id_user_duyet
                        },
                    }, { idQLC: 1 });
                    id_user_duyet = listUserDuyet.map(user => user.idQLC);
                } else {
                    id_user_duyet = vb.nguoi_xet_duyet.split(',').map(Number);
                }
                let history = [];
                for (var i = 0; i < id_user_duyet.length; i++) {
                    let id = id_user_duyet[i];
                    const his = await history_duyet_vb.findOne({ id_user: id, id_vb: vb._id }).sort({ time: -1 })
                    history.push({ id: id, history: his ? his.type_handling : null });
                }
                if (history.length > 0) {
                    if (history.every(his => his.history === 2)) {
                        await VanBan.findOneAndUpdate({ _id: vb._id }, {
                            $set: {
                                trang_thai_vb: 6,
                                time_duyet: timeNow
                            }
                        }, { new: true });
                        if (vb.gui_ngoai_cty == 1) {
                            const com = Users.findOne({
                                idQLC: com_id,
                                type: 1,
                            })
                            vanThuService.chatNotification_using_id(com._id, vb.user_send, 'Văn bản đã được duyệt', `https://hungha365.com/van-thu-luu-tru/van-ban-di/van-ban-di-da-gui/${vb._id}`)
                            const listUserNhan = vb.user_nhan.split(',').map(Number);
                            for (let i = 0; i < listUserNhan.length; i++) {
                                vanThuService.chatNotification_using_id(vb.user_send, listUserNhan[i], `Bạn đã nhận được văn bản \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                            }
                        } else {
                            vanThuService.chatNotification(com_id, vb.user_send, com_id, 'Văn bản đã được duyệt', `https://hungha365.com/van-thu-luu-tru/van-ban-di/van-ban-di-da-gui/${vb._id}`)
                            const listUserNhan = vb.user_nhan.split(',').map(Number);
                            for (let i = 0; i < listUserNhan.length; i++) {
                                vanThuService.chatNotification(vb.user_send, listUserNhan[i], com_id, `Bạn đã nhận được văn bản \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                            }
                        }

                        return res.status(200).json({ message: 'Đã duyệt văn bản' });
                    } else {
                        await VanBan.findOneAndUpdate({ _id: vb._id }, {
                            $set: {
                                trang_thai_vb: 10,
                                time_duyet: timeNow
                            }
                        }, { new: true });

                        return res.status(200).json({ message: 'Đã duyệt văn bản. Chờ lãnh đạo còn lại duyệt' });
                    }
                }
            }

            //Duyệt lần lượt
            else if (vb.type_xet_duyet == 1) {
                let id_user_duyet = [];
                if (vb.gui_ngoai_cty == 1) {
                    const _id_user_duyet = vb.nguoi_xet_duyet.split(',').map(Number);
                    const listUserDuyet = await Users.find({
                        _id: {
                            $in: _id_user_duyet
                        },
                    }, { idQLC: 1 });
                    id_user_duyet = listUserDuyet.map(user => user.idQLC);
                } else {
                    id_user_duyet = vb.nguoi_xet_duyet.split(',').map(Number);
                }
                const userDuyet = await Users.aggregate([{
                        $match: {
                            idQLC: idQLC,
                            'inForPerson.employee.com_id': com_id,
                            type: 2,
                        }
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            pipeline: [{
                                $match: {
                                    comId: com_id,
                                },
                            }, ],
                            as: 'position',
                        },
                    },
                    {
                        $unwind: '$position',
                    },
                    {
                        $project: {
                            idQLC: '$idQLC',
                            userName: '$userName',
                            position: '$position',
                            com_id: '$inForPerson.employee.com_id',
                        },
                    },
                ])

                //tìm ra những người duyệt có vị trí thấp hơn người duyệt hiện tại
                const listUserDuyet_withLowerLevel = await Users.aggregate([{
                        $match: {
                            idQLC: {
                                $in: id_user_duyet
                            },
                            'inForPerson.employee.com_id': com_id,
                            type: 2,
                        }
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            pipeline: [{
                                $match: {
                                    comId: com_id,
                                    level: {
                                        $gt: userDuyet[0].position.level
                                    }
                                },
                            }, ],
                            as: 'position',
                        },
                    },
                    {
                        $unwind: '$position',
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            pipeline: [{
                                $match: {
                                    comId: com_id,
                                    level: {
                                        $gt: userDuyet[0].position.level
                                    }
                                },
                            }, ],
                            as: 'position',
                        },
                    },
                    {
                        $project: {
                            idQLC: '$idQLC',
                            userName: '$userName',
                            position: '$position',
                            com_id: '$inForPerson.employee.com_id',
                        },
                    },
                ])
                let history_of_lowerLevel = [];
                for (let i = 0; i < listUserDuyet_withLowerLevel.length; i++) {
                    let id = listUserDuyet_withLowerLevel[i].idQLC;
                    const his = await history_duyet_vb.findOne({ id_user: id, id_vb: vb._id }).sort({ time: -1 })
                    history_of_lowerLevel.push({ id: id, history: his ? his.type_handling : null });
                }
                if (listUserDuyet_withLowerLevel.length < 0 || history_of_lowerLevel.every(his => his.history === 2)) {
                    let timeNow = new Date();
                    const maxID = await vanThuService.getMaxID(history_duyet_vb);
                    let newID = 0;
                    if (maxID) {
                        newID = Number(maxID) + 1;
                    }
                    const createHis = new history_duyet_vb({
                        _id: newID,
                        id_user: idQLC,
                        com_id: com_id,
                        id_vb: vb._id,
                        type_handling: 2,
                        time: timeNow
                    });
                    await createHis.save();
                    let id_user_duyet = [];
                    if (vb.gui_ngoai_cty == 1) {
                        const _id_user_duyet = vb.nguoi_xet_duyet.split(',').map(Number);
                        const listUserDuyet = await Users.find({
                            _id: {
                                $in: _id_user_duyet
                            },
                        }, { idQLC: 1 });
                        id_user_duyet = listUserDuyet.map(user => user.idQLC);
                    } else {
                        id_user_duyet = vb.nguoi_xet_duyet.split(',').map(Number);
                    }
                    let history = [];
                    for (var i = 0; i < id_user_duyet.length; i++) {
                        let id = id_user_duyet[i];
                        const his = await history_duyet_vb.findOne({ id_user: id, id_vb: vb._id }).sort({ time: -1 })
                        history.push({ id: id, history: his ? his.type_handling : null });
                    }
                    if (history.length > 0) {
                        if (history.every(his => his.history === 2)) {
                            await VanBan.findOneAndUpdate({ _id: vb._id }, {
                                $set: {
                                    trang_thai_vb: 6,
                                    time_duyet: timeNow
                                }
                            }, { new: true });

                            if (vb.gui_ngoai_cty == 1) {
                                const com = Users.findOne({
                                    idQLC: com_id,
                                    type: 1,
                                })
                                vanThuService.chatNotification_using_id(com._id, vb.user_send, 'Văn bản đã được duyệt', `https://hungha365.com/van-thu-luu-tru/van-ban-di/van-ban-di-da-gui/${vb._id}`)
                                const listUserNhan = vb.user_nhan.split(',').map(Number);
                                for (let i = 0; i < listUserNhan.length; i++) {
                                    vanThuService.chatNotification_using_id(vb.user_send, listUserNhan[i], `Bạn đã nhận được văn bản \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                                }
                            } else {
                                vanThuService.chatNotification(com_id, vb.user_send, com_id, 'Văn bản đã được duyệt', `https://hungha365.com/van-thu-luu-tru/van-ban-di/van-ban-di-da-gui/${vb._id}`)
                                const listUserNhan = vb.user_nhan.split(',').map(Number);
                                for (let i = 0; i < listUserNhan.length; i++) {
                                    vanThuService.chatNotification(vb.user_send, listUserNhan[i], com_id, `Bạn đã nhận được văn bản \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                                }
                            }

                            return res.status(200).json({ message: 'Đã duyệt văn bản' });
                        } else {
                            await VanBan.findOneAndUpdate({ _id: vb._id }, {
                                $set: {
                                    trang_thai_vb: 10,
                                    time_duyet: timeNow
                                }
                            }, { new: true });

                            return res.status(200).json({ message: 'Đã duyệt văn bản. Chờ lãnh đạo cấp cao hơn duyệt' });
                        }
                    }
                } else {
                    return res.status(200).json({ message: 'Cần chờ lãnh đạo cấp dưới duyệt trước' });
                }
                return res.status(200).json({ userDuyet, listUserDuyet_withLowerLevel, history_of_lowerLevel })
            }
        } else {
            return res.status(200).json({ message: 'Không tìm thấy văn bản trong hệ thống' });
        }
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}
exports.reject_vanban = async(req, res, next) => {
    try {
        const {
            id_vb
        } = req.body;
        const idQLC = req.user.data.idQLC;
        const _id = req.user.data._id;
        const com_id = req.user.data.com_id;
        const vb = await VanBan.findOne({
            _id: id_vb
        })
        if (vb) {
            let timeNow = new Date();
            const maxID = await vanThuService.getMaxID(history_duyet_vb);
            let newID = 0;
            if (maxID) {
                newID = Number(maxID) + 1;
            }
            const createHis = new history_duyet_vb({
                _id: newID,
                id_user: idQLC,
                com_id: com_id,
                id_vb: vb._id,
                type_handling: 2,
                time: timeNow
            });
            await createHis.save();
            await VanBan.findOneAndUpdate({ _id: vb._id }, {
                $set: {
                    trang_thai_vb: 3,
                    time_duyet: timeNow
                }
            }, { new: true });
            if (vb.gui_ngoai_cty == 1) {
                vanThuService.chatNotification_using_id(_id, vb.user_send, `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                if (vb.nguoi_theo_doi) {
                    vanThuService.chatNotification_using_id(_id, Number(vb.nguoi_theo_doi), `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                }
                const listUserDuyet = vb.nguoi_xet_duyet.split(',').map(Number);
                for (let i = 0; i < listUserDuyet.length; i++) {
                    vanThuService.chatNotification_using_id(_id, listUserDuyet[i], `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                }
            } else {
                vanThuService.chatNotification(idQLC, vb.user_send, com_id, `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                if (vb.nguoi_theo_doi) {
                    vanThuService.chatNotification(idQLC, Number(vb.nguoi_theo_doi), com_id, `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                }
                const listUserDuyet = vb.nguoi_xet_duyet.split(',').map(Number);
                for (let i = 0; i < listUserDuyet.length; i++) {
                    vanThuService.chatNotification(idQLC, listUserDuyet[i], com_id, `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                }
                const listUserKy = vb.nguoi_ky.split(',').map(Number);
                for (let i = 0; i < listUserKy.length; i++) {
                    vanThuService.chatNotification(idQLC, listUserKy[i], com_id, `Văn bản bị tử chối \n Người gửi: ${vb.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vb._id}`)
                }
            }
            return res.status(200).json({ message: 'Đã từ chối văn bản' });
        } else {
            return res.status(200).json({ message: 'Không tìm thấy văn bản trong hệ thống' });
        }
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}