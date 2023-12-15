const functions = require('../../../services/functions');
const functions_kpi = require('../../../services/kpi/functions');

const Users = require('../../../models/Users');
const KPI365_ActivityDiary = require('../../../models/kpi/KPI365_ActivityDiary');
const KPI365_Decentralization = require('../../../models/kpi/KPI365_Decentralization');

//API phân quyền cho danh sách nhân viên
exports.createDecentralization = async (req, res) => {
    try {
        let { type, com_id, idQLC } = req.user.data;
        if (com_id == undefined) com_id = req.user.data.idQLC;
        let { role_sd, role_td, role_dg, role_tl, role_qlpb, role_qlnv, role_dlx, role_kpi } = req.body;
        let arr_role_sd = [],
            arr_role_td = [],
            arr_role_dg = [],
            arr_role_tl = [],
            arr_role_qlpb = [],
            arr_role_qlnv = [],
            arr_role_dlx = [],
            arr_role_kpi = [];

        if (role_sd) arr_role_sd = functions_kpi.convertStrToArr(role_sd);
        if (role_td) arr_role_td = functions_kpi.convertStrToArr(role_td);
        if (role_dg) arr_role_dg = functions_kpi.convertStrToArr(role_dg);
        if (role_tl) arr_role_tl = functions_kpi.convertStrToArr(role_tl);
        if (role_qlpb) arr_role_qlpb = functions_kpi.convertStrToArr(role_qlpb);
        if (role_qlnv) arr_role_qlnv = functions_kpi.convertStrToArr(role_qlnv);
        if (role_dlx) arr_role_dlx = functions_kpi.convertStrToArr(role_dlx);
        if (role_kpi) arr_role_kpi = functions_kpi.convertStrToArr(role_kpi);

        const list_id = req.body.list_id || "";
        if (list_id == "")
            return functions.setError(res, "Chưa truyền vào nhân viên nào", 400)

        let list_id_arr = []
        if (list_id) list_id_arr = functions_kpi.convertStrToArr(list_id);
        let name_staff = await Users.aggregate([
            {
                $match: {
                    idQLC: { $in: list_id_arr },
                    type: 2
                }
            },
            {
                $project: {
                    _id: 0,
                    userName: 1
                }
            }
        ]);
        let now = functions.getTimeNow();
        let name_staff_str = name_staff.map(item => item.userName).join(', ');
        let maxIdAD = await functions_kpi.getMaxId().then(data => { return data.MaxIdActivityDiary });
        let data_insert_diary = new KPI365_ActivityDiary(
            {
                id: maxIdAD + 1,
                user_id: idQLC,
                type: 6,
                content: "Cập nhật phân quyền cho nhân viên " + name_staff_str,
                created_at: now,
                date: functions_kpi.getDate(now * 1000),
                login_type: type
            }
        )
        await data_insert_diary.save()

        for (let i = 0; i < list_id_arr.length; i++) {
            let item_nv = list_id_arr[i];
            await KPI365_Decentralization.deleteMany({ user_id: item_nv });
            if (arr_role_sd != "") {
                for (let a = 0; a < arr_role_sd.length; a++) {
                    let item_sd = arr_role_sd[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_sd,
                            type: 1
                        })
                    if (checkRole == 0) {
                        let data_insert_sd = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_sd,
                                type: 1
                            }
                        )
                        await data_insert_sd.save();
                    }
                }
            }
            if (arr_role_td != "") {
                for (let a = 0; a < arr_role_td.length; a++) {
                    let item_td = arr_role_td[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_td,
                            type: 2
                        })
                    if (checkRole == 0) {
                        let data_insert_td = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_td,
                                type: 2
                            }
                        )
                        await data_insert_td.save();
                    }
                }
            }
            if (arr_role_dg != "") {
                for (let a = 0; a < arr_role_dg.length; a++) {
                    let item_dg = arr_role_dg[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_dg,
                            type: 3
                        })
                    if (checkRole == 0) {
                        let data_insert_dg = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_dg,
                                type: 3
                            }
                        )
                        await data_insert_dg.save();
                    }
                }
            }
            if (arr_role_tl != "") {
                for (let a = 0; a < arr_role_tl.length; a++) {
                    let item_tl = arr_role_tl[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_tl,
                            type: 4
                        })
                    if (checkRole == 0) {
                        let data_insert_tl = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_tl,
                                type: 4
                            }
                        )
                        await data_insert_tl.save();
                    }
                }
            }
            if (arr_role_qlpb != "") {
                for (let a = 0; a < arr_role_qlpb.length; a++) {
                    let item_qlpb = arr_role_qlpb[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_qlpb,
                            type: 5
                        })
                    if (checkRole == 0) {
                        let data_insert_qlpb = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_qlpb,
                                type: 5
                            }
                        )
                        await data_insert_qlpb.save();
                    }
                }
            }
            if (arr_role_qlnv != "") {
                for (let a = 0; a < arr_role_qlnv.length; a++) {
                    let item_qlnv = arr_role_qlnv[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_qlnv,
                            type: 6
                        })
                    if (checkRole == 0) {
                        let data_insert_qlnv = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_qlnv,
                                type: 6
                            }
                        )
                        await data_insert_qlnv.save();
                    }
                }
            }
            if (arr_role_dlx != "") {
                for (let a = 0; a < arr_role_dlx.length; a++) {
                    let item_dlx = arr_role_dlx[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_dlx,
                            type: 7
                        })
                    if (checkRole == 0) {
                        let data_insert_dlx = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_dlx,
                                type: 7
                            }
                        )
                        await data_insert_dlx.save();
                    }
                }
            }
            if (arr_role_kpi != "") {
                for (let a = 0; a < arr_role_kpi.length; a++) {
                    let item_kpi = arr_role_kpi[a];
                    let maxIdDecen = await functions_kpi.getMaxId().then(data => { return data.MaxIdDecentralization });
                    let checkRole = await KPI365_Decentralization.countDocuments(
                        {
                            user_id: item_nv,
                            function: item_kpi,
                            type: 8
                        })
                    if (checkRole == 0) {
                        let data_insert_kpi = new KPI365_Decentralization(
                            {
                                id: maxIdDecen + 1,
                                user_id: item_nv,
                                function: item_kpi,
                                type: 8
                            }
                        )
                        await data_insert_kpi.save();
                    }
                }
            }
        }
        return functions.success(res, "Phân quyền thành công", { data: { data_insert_diary } })
    }
    catch (err) {
        console.log(err);
        return functions.setError(res, err.message)
    }
}

//API lấy danh sách quyền của 1 nhân viên
exports.getInfoRoleEmployee = async (req, res) => {
    try {
        const { com_id } = req.user.data;
        const user_id = req.body.user_id;
        if (user_id == "" || !parseInt(user_id)) return functions.setError(res, "Chưa truyền vào id nhân viên", 400)
        const userName = await Users.findOne({ idQLC: parseInt(user_id), type: 2 })
            .then(data => { return data.userName })
            .catch(err => { return "" })
        if (userName == "") return functions.setError(res, "Id nhân viên không đúng( hãy truyền vào idQLC của nhân viên )", 400)
        let infoRoleSD = await KPI365_Decentralization.find({ user_id: user_id, type: 1 }).select("id user_id function type")
        let infoRoleTD = await KPI365_Decentralization.find({ user_id: user_id, type: 2 }).select("id user_id function type")
        let infoRoleDG = await KPI365_Decentralization.find({ user_id: user_id, type: 3 }).select("id user_id function type")
        let infoRoleTL = await KPI365_Decentralization.find({ user_id: user_id, type: 4 }).select("id user_id function type")
        let infoRoleQLPB = await KPI365_Decentralization.find({ user_id: user_id, type: 5 }).select("id user_id function type")
        let infoRoleQLNV = await KPI365_Decentralization.find({ user_id: user_id, type: 6 }).select("id user_id function type")
        let infoRoleDLX = await KPI365_Decentralization.find({ user_id: user_id, type: 7 }).select("id user_id function type")
        let infoRoleKPI = await KPI365_Decentralization.find({ user_id: user_id, type: 8 }).select("id user_id function type")
        return functions.success(res, `Lấy danh sách quyền cho nhân viên ${userName} thành công`, {
            data: {
                infoRoleSD,
                infoRoleTD,
                infoRoleDG,
                infoRoleTL,
                infoRoleQLPB,
                infoRoleQLNV,
                infoRoleDLX,
                infoRoleKPI
            }
        })
    }
    catch (err) {
        console.log(err);
        return functions.setError(res, err.message)
    }
}