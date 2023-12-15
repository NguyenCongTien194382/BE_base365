const functions = require('../../../services/functions');
const functions_kpi = require("../../../services/kpi/functions");
const functions_kpi_kpi = require("../../../services/kpi/KPI")

const KPI365_Organization = require("../../../models/kpi/KPI365_Organization");
const KPI365_TargetUnit = require("../../../models/kpi/KPI365_TargetUnit");
const KPI365_Bonus = require("../../../models/kpi/KPI365_Bonus");
const KPI365_BonusDetails = require("../../../models/kpi/KPI365_BonusDetails");
const KPI365_ActivityDiary = require('../../../models/kpi/KPI365_ActivityDiary');
const KPI365_Kpi = require('../../../models/kpi/KPI365_Kpi');
const KPI365_NewGroup = require('../../../models/kpi/KPI365_NewGroup');
const KPI365_Result = require('../../../models/kpi/KPI365_Result');
const KPI365_ResultHistory = require('../../../models/kpi/KPI365_ResultHistory');
const KPI365_ConfigAssess = require('../../../models/kpi/KPI365_ConfigAssess');
const KPI365_DeletedData = require('../../../models/kpi/KPI365_DeletedData');

const QLC_OrganizeDetail = require('../../../models/qlc/OrganizeDetail');
const Users = require('../../../models/Users');

//Danh sách đánh giá KPI đơn mục tiêu
exports.listAssessSingleKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const page = parseInt(req.body.page) || 1;
        const pageSize = parseInt(req.body.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        let { organization_id, group_id, staff_id, date_start, date_end, kpi_id } = req.body;
        let now = functions.getTimeNow();
        let condition = {
            is_deleted: 0,
            type_target: 0,
            company_id: com_id
        }
        if (organization_id) {
            condition.organization_id = parseInt(organization_id);
        }
        if (group_id) {
            condition.group_id = parseInt(group_id);
            condition.group_type = 1;
        }
        if (date_start) {
            condition.start_day = { $gte: parseInt(date_start) };
        }
        if (date_end) {
            condition.end_date = { $lte: parseInt(date_end) + 86399 };
        }

        //Tìm tất cả KPI có chứa nhân viên hoặc tổ chức chứa nhân viên và nhóm mới chứa nhân viên và công ty
        if (staff_id) {
            condition["$or"] = [
                { type: "1" },
                {
                    manager: { $regex: new RegExp(staff_id.toString(), 'i') }
                },
                {
                    followers: { $regex: new RegExp(staff_id.toString(), 'i') }
                },
                {
                    staff: { $regex: new RegExp(staff_id.toString(), 'i') }
                }
            ]

            let organization_id = await Users.findOne({ idQLC: parseInt(staff_id), "inForPerson.employee.com_id": com_id })
                .then(data => data.inForPerson.employee.organizeDetailId)
                .catch(error => 0)
            if (organization_id != 0) {
                condition["$or"].push({ organization_id: organization_id });
            }

            let group_id = await KPI365_NewGroup.find({
                com_id: com_id,
                staff_id: { $regex: new RegExp(staff_id.toString(), 'i') }
            }).then(data => data.map(item => item.id))
                .catch(error => 0)

            if (group_id != 0) {
                condition["$or"].push({
                    $and: [
                        { group_id: { $in: group_id } },
                        { group_type: 1 }
                    ]
                })
            }
        }
        if (kpi_id) {
            condition.id = parseInt(kpi_id);
        }
        const count = await KPI365_Kpi.countDocuments(condition);
        let data_kpi_single = await KPI365_Kpi.aggregate([
            {
                $sort: { id: -1 }
            },
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "KPI365_TargetUnit",
                    localField: "unit_id",
                    foreignField: "id",
                    as: "target_unit"
                }
            },
            {
                $unwind: { path: "$target_unit", preserveNullAndEmptyArrays: true }
            },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    staff: 1,
                    start_day: 1,
                    end_date: 1,
                    percent: 1,
                    conn_target: 1,
                    type: 1,
                    group_id: 1,
                    organization_id: 1,
                    manager: 1,
                    followers: 1,
                    type_unit: 1,
                    unit_id: 1,
                    target: 1,
                    kpi_id: 1,
                    is_last: 1,
                    unit: "$target_unit.unit",
                    target_name: "$target_unit.name",
                }
            }
        ])

        let list_kpi_single = [];
        for (let i = 0; i < data_kpi_single.length; i++) {
            let item = data_kpi_single[i];
            let type_unit = item.type_unit;

            //Xử lý kết quả KPI, loại KPI, kết quả KPI
            item.result = type_unit == "5" ? "" : await functions_kpi_kpi.sumKPIResult(parseInt(item.id)) + " " + item.unit;
            item.process = await functions_kpi_kpi.process(item.id, item.is_last, com_id).then(data => data.toFixed(1));
            if (parseInt(item.process) == parseFloat(item.process))
                item.process = parseInt(item.process)

            //Xử lý điểm, xu hướng, thưởng
            let scores = 0;
            let trend = 0; // 0.Không đạt, 1.Đạt
            let time = 1; // 0.Quá hạn, 1.Trong thời gian được cài đặt 

            if (now > item.end_date && parseFloat(item.process) < 100) { //quá hạn
                time = 0;
            }

            let configAssess = await KPI365_ConfigAssess.findOne({ start: { $lte: parseFloat(item.process) }, end: { $gte: parseFloat(item.process) }, time: time, com_id: com_id }).sort({ scores: -1 });
            if (configAssess != null) {
                scores = configAssess.scores;
                trend = configAssess.trend;
                item.scores = scores + " điểm";
                item.trend = trend == 0 ? "Không đạt" : (trend == 1 ? "Đạt" : "Chưa cập nhật");
            }
            else {
                item.scores = "Chưa thiết lập";
                item.trend = "Chưa thiết lập";
            }

            let condition = await KPI365_Bonus.findOne({ kpi_id: parseInt(item.id), is_deleted: 0 })
                .then(data => data.condition)
                .catch(error => 0)
            if (condition == 0) {
                item.bonus = "Chưa có thưởng"
            }

            if (condition == 1) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [
                        {
                            $and: [
                                { start: { $lte: parseFloat(item.process) } },
                                { end: { $gte: parseFloat(item.process) } }
                            ]
                        },
                        {
                            end: { $lt: parseFloat(item.process) }
                        }
                    ]
                }
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then(data => data.value)
                    .catch(error => 0)
                if (valueBonus !== null) {
                    item.bonus = valueBonus + " VNĐ"
                }
                else {
                    item.bonus = "Chưa có thưởng"
                }
            }
            if (condition == 2) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [
                        {
                            $and: [
                                { start: { $lte: parseFloat(scores) } },
                                { end: { $gte: parseFloat(scores) } }
                            ]
                        },
                        {
                            end: { $lt: parseFloat(scores) }
                        }
                    ]
                }
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then(data => data.value)
                    .catch(error => 0)
                if (valueBonus !== null) {
                    item.bonus = valueBonus + " VNĐ"
                }
                else {
                    item.bonus = "Chưa có thưởng"
                }
            }

            //Xử lý link và id người quản lý, theo dõi + tên kpi <chỉ nhóm hoặc tổ chức mới phải xử lý tên>
            if (item.type == "5") {
                item.detail_kpi_url = functions_kpi.detailSingleKPI(item.id);
            }
            else if (item.type == "4") {
                await KPI365_NewGroup.findOne({ id: item.group_id, com_id: com_id }).sort({ id: -1 })
                    .then(data => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                        item.name = data.group_name + " - " + item.name
                    })
                    .catch(error => { item.manager = "0"; item.followers = "0" })
                item.detail_kpi_url = functions_kpi.detailGroupKPI(item.id);
            }
            else if (item.type == "6") {
                await KPI365_Organization.findOne({ organization_id: item.organization_id, com_id: com_id }).sort({ id: -1 })
                    .then(data => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id
                    })
                    .catch(error => { item.manager = "0"; item.followers = "0" })
                await QLC_OrganizeDetail.findOne({ id: item.organization_id, comId: com_id })
                    .then(data => { item.name = data.organizeDetailName + " - " + item.name })
                    .catch(error => console.log("Lỗi khi lấy danh sách KPI đơn mục tiêu - tổ chức"))
                item.detail_kpi_url = functions_kpi.detailSingleKPIOrganization(item.id);
            }
            else if (item.type == "1") {
                item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
            }

            //Xử lý nhân viên, thời gian thực hiện

            if (item.type != "5") {
                item.staff = "Toàn bộ nhân viên"
            }

            if (item.type == "5") {
                let staff_id = item.staff.split(",");
                staff_id = staff_id.map(data => parseInt(data));
                item.staff = await Users.find({
                    idQLC: { $in: staff_id }, "inForPerson.employee.com_id": com_id
                }).then(data => data.map(data => data.userName).join(","))
                    .catch(error => "")
            }

            item.process = item.process + "%";
            item.percent = item.percent + "%";
            if (item.type == "5") item.type = "Cá nhân"
            else if (item.type == "6") item.type = "Tổ chức"
            else if (item.type == "1") item.type = "Công ty"
            else if (item.type == "4") item.type = "Nhóm"
            let check = await KPI365_Bonus.find({ kpi_id: item.id, is_deleted: 0 })
            item.check_bonus = check.length == 0 ? 0 : 1;
            item.execution_time = functions_kpi.getDate(item.start_day * 1000) + " - " + functions_kpi.getDate(item.end_date * 1000);

            //Xóa các trường không dùng tới
            delete item.is_last;
            delete item.target_name;
            delete item.unit;
            delete item.unit_id;
            delete item.manager_id;
            delete item.followers_id;
            delete item.manager;
            delete item.followers;
            delete item.group_id;
            delete item.organization_id;
            delete item.start_day;
            delete item.end_date;
            delete item.type_unit;
            delete item.target;
            delete item.conn_target;

            list_kpi_single.push(item);
        }

        return functions.success(res,
            `Danh sách đánh giá KPI đơn mục tiêu thành công`,
            {
                list_kpi_single,
                count
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Chi tiết thưởng KPI đơn mục tiêu
exports.detailBonusSingleKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const kpi_id = parseInt(req.body.kpi_id) || 0;
        if (kpi_id == 0)
            return functions.setError(res, "Chưa truyền id hoặc truyền sai định dạng id");

        let result = await KPI365_Kpi.findOne({ id: kpi_id, type_target: 0, is_deleted: 0 });
        if (result == null) return functions.setError(res, "Không tìm thấy KPI đơn mục tiêu này", 400);

        let name = await functions_kpi_kpi.nameKPISingle(parseInt(kpi_id), com_id);
        // let result_bonus = await KPI365_Bonus.find({ kpi_id: parseInt(kpi_id) });
        let result_bonus = await KPI365_Bonus.aggregate([{
            $match: {
                kpi_id: parseInt(kpi_id),
                is_deleted: 0
            }
        },
        {
            $lookup: {
                from: 'KPI365_BonusDetails',
                localField: 'id',
                foreignField: 'bonus_id',
                as: 'bonusDetails',
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            staff_id: 1,
                            percent: 1
                        }
                    }
                ]
            },
        },
        {
            $project: {
                _id: 0,
                id: 1,
                condition: 1,
                start: 1,
                end: 1,
                value: 1,
                arrDetails: "$bonusDetails"
            }
        }])


        let type_kpi = result.type;
        let list_staff = [];
        let list_manager = [];
        let list_followers = [];
        let conditions = {
            "inForPerson.employee.com_id": com_id,
            "inForPerson.employee.ep_status": "Active"
        }
        let conditions_1 = {
            "inForPerson.employee.com_id": com_id,
            "inForPerson.employee.ep_status": "Active"
        }
        if (type_kpi == "4") {
            await KPI365_NewGroup.findOne({ id: result.group_id }).then(data => {
                if (data.staff_id != "" && data.staff_id != "0") {
                    let staff = data.staff_id.split(",");
                    list_staff = staff.map(item => parseInt(item));
                }
                if (data.manage_id != "" && data.manage_id != "0") {
                    let manage = data.manage_id.split(",");
                    list_manager = manage.map(item => parseInt(item));
                }
                if (data.followers_id != "" && data.followers_id != "0") {
                    let followers = data.followers_id.split(",");
                    list_followers = followers.map(item => parseInt(item))
                }
                conditions.idQLC = { $in: list_staff }
                conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]
            })
        }
        if (type_kpi == "5") {
            if (result.staff != "" && result.staff != "0") {
                let staff = result.staff.split(",");
                list_staff = staff.map(item => parseInt(item));
            }
            if (result.manager != "" && result.manager != "0") {
                let manage = result.manager.split(",");
                list_manager = manage.map(item => parseInt(item));
            }
            if (result.followers != "" && result.followers != "0") {
                let followers = result.followers.split(",");
                list_followers = followers.map(item => parseInt(item))
            }
            conditions.idQLC = { $in: list_staff }
            conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]
        }
        if (type_kpi == "6") {
            await KPI365_Organization.findOne({ id: result.organization_id }).then(async (data) => {
                if (data.manage_id != "" && data.manage_id != "0") {
                    let manage = data.manage_id.split(",");
                    list_manager = manage.map(item => parseInt(item));
                }
                if (data.followers_id != "" && data.followers_id != "0") {
                    let followers = data.followers_id.split(",");
                    list_followers = followers.map(item => parseInt(item))
                }

            })
            let organization_info = await QLC_OrganizeDetail.findOne({ id: parseInt(result.organization_id), comId: com_id }).then(data => data);
            conditions["inForPerson.employee.listOrganizeDetailId"] = { $all: organization_info.listOrganizeDetailId }
            conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]
        }

        if (type_kpi == "1") {
            if (result.manager != "" && result.manager != "0") {
                let manage = result.manager.split(",");
                list_manager = manage.map(item => parseInt(item));
            }
            if (result.followers != "" && result.followers != "0") {
                let followers = result.followers.split(",");
                list_followers = followers.map(item => parseInt(item))
            }

            conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]
        }

        const arrStaff = await Users.aggregate([
            {
                $match: conditions
            },
            {
                $lookup: {
                    from: 'QLC_Positions',
                    localField: 'inForPerson.employee.position_id',
                    foreignField: 'id',
                    let: { "comId": "$comId" },
                    pipeline: [{ $match: { comId: com_id } }],
                    as: 'positions'
                }
            },
            {
                $unwind: { path: "$positions", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    "_id": 0,
                    ep_id: "$idQLC",
                    userName: "$userName",
                    positionName: "$positions.positionName",
                    position_kpi: "Nhân viên thực hiện"
                }
            }
        ])

        const arrManageFollower = await Users.aggregate([
            {
                $match: conditions_1
            },
            {
                $lookup: {
                    from: 'QLC_Positions',
                    localField: 'inForPerson.employee.position_id',
                    foreignField: 'id',
                    let: { "comId": "$comId" },
                    pipeline: [{ $match: { comId: com_id } }],
                    as: 'positions'
                }
            },
            {
                $unwind: { path: "$positions", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    "_id": 0,
                    ep_id: "$idQLC",
                    userName: "$userName",
                    positionName: "$positions.positionName"
                }
            }
        ])

        arrManageFollower.map(item => {
            if (list_manager.includes(item.ep_id)) {
                item.position_kpi = "Quản lý"
            }
            if (list_followers.includes(item.ep_id)) {
                item.position_kpi = "Theo dõi"
            }
        })

        return functions.success(res,
            `Chi tiết thưởng KPI đơn mục tiêu thành công`,
            {
                name,
                result_bonus,
                arrStaff,
                arrManageFollower
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Thiết lập thưởng KPI đơn mục tiêu
exports.settingBonusSingleKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const kpi_id = parseInt(req.body.kpi_id) || 0;
        let { condition, start, end, value, staff_id, percent } = req.body;
        let now = functions.getTimeNow();
        if (condition == undefined || condition == "" || start == undefined || start == "" ||
            end == undefined || end == "" || value == undefined || value == "") {
            return functions.setError(res, "Truyền thiếu 1 trong các trường condition, start, end, value, staff_id, percent");
        }

        if (kpi_id == 0)
            return functions.setError(res, "Chưa truyền id hoặc truyền sai định dạng id");

        let result = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 0 })
        if (result == null) {
            return functions.setError(res, `Không tìm thấy KPI đơn mục tiêu ${kpi_id}`, 400);
        }
        let arrarStart = start.split(",");
        let arrEnd = end.split(",");
        let arrValue = value.split(",");
        let arrStaff = staff_id.split(";");
        let arrPercent = percent.split(";");

        for (let i = 0; i < arrarStart.length; i++) {
            let val = arrarStart[i];
            let MaxIdB = await KPI365_Bonus.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
            let data_insert_bonus = new KPI365_Bonus({
                id: MaxIdB + 1,
                kpi_id: kpi_id,
                condition: parseInt(condition),
                start: parseInt(val),
                end: parseInt(arrEnd[i]),
                value: parseInt(arrValue[i]),
                created_at: now,
                updated_at: now,
                is_deleted: 0
            })
            data_insert_bonus.save();
            let infoStaff = arrStaff[i];
            let infoPercent = arrPercent[i];
            let arrayStaff = infoStaff.split(",");
            let arrayPercent = infoPercent.split(",");
            if (arrStaff[i] != "" && arrPercent[i] != "") {
                for (let j = 0; j < arrayPercent.length; j++) {
                    let value = arrayPercent[j];
                    let MaxIdBD = await KPI365_BonusDetails.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                    let dataBonus = new KPI365_BonusDetails({
                        id: MaxIdBD + 1,
                        bonus_id: MaxIdB + 1,
                        staff_id: parseInt(arrayStaff[j]),
                        percent: parseInt(value)
                    })
                    await dataBonus.save();
                }
            }
        }

        let MaxIdAD = await KPI365_ActivityDiary.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: "Thiết lập thưởng " + result.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Thiết lập thưởng cho KPI đơn mục tiêu thành công`,
            {
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Xóa + khôi phục thưởng KPI đơn mục tiêu
exports.deleteBonusSingleKPI = async (req, res) => {
    try {
        let { type, com_id, idQLC } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        const now = functions.getTimeNow();

        const id_bonus_1 = req.body.id_bonus;
        if (id_bonus_1 == "")
            return functions.setError(res, "Chưa truyền id thưởng", 400);
        let list_id = id_bonus_1.split(",");

        list_id = list_id.map(item => parseInt(item));
        let status = parseInt(req.body.status) || 1;

        if (![0, 1, 2].includes(status)) {
            return functions.setError(res, "status phải thuộc 0 hoặc 1 hoặc 2", 400);
        }

        for (let i = 0; i < list_id.length; i++) {
            let id_bonus = list_id[i];
            let result_bonus = await KPI365_Bonus.findOne({ id: parseInt(id_bonus) });
            let kpi_id = result_bonus.kpi_id;
            let value_bonus = result_bonus.value;
            let info = await KPI365_Kpi.find({ company_id: com_id, id: parseInt(kpi_id) });
            await KPI365_Bonus.updateOne({ id: parseInt(id_bonus) }, { is_deleted: parseInt(status) })
            let msg = "";
            let user_name = data_login.name;
            if (status == 1) {
                msg = 'Xóa thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus;
                const MaxIdDeleteData = await KPI365_DeletedData.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                let deleted_data = new KPI365_DeletedData({
                    id: MaxIdDeleteData + 1,
                    type: 2,
                    created_at: now,
                    deleted_id: id_bonus,
                    date: functions_kpi.getDate(now * 1000),
                    com_id: com_id,
                    user_name: user_name,
                    content: 'Thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus,
                });
                await deleted_data.save();
            } else if (status == 0) {
                msg = 'Khôi phục thiết lập thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus;
            } else if (status == 2) {
                msg = 'Xóa vĩnh viễn thiết lập thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus;
            }

            const MaxIdActivityDiary = await functions_kpi.getMaxId().then(data => data.MaxIdActivityDiary);
            let data_insert_diary = new KPI365_ActivityDiary({
                id: MaxIdActivityDiary + 1,
                user_id: idQLC,
                type: 3,
                content: msg,
                created_at: now,
                date: functions_kpi.getDate(now * 1000),
                login_type: type
            });
            await data_insert_diary.save();
        }

        return functions.success(res,
            `${status == 0 ? "Khôi phục" : (status == 1 ? "Xóa" : " Xóa vĩnh viễn")} thưởng KPI đa mục tiêu thành công`,
            {
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Chỉnh sửa thưởng KPI đơn mục tiêu
exports.editBonusSingleKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        const kpi_id = parseInt(req.body.kpi_id) || 0;
        const id = req.body.id;
        let { condition, start, end, value, staff_id, percent } = req.body;
        let now = functions.getTimeNow();
        if (condition == undefined || condition == "" || start == undefined || start == "" ||
            end == undefined || end == "" || value == undefined || value == "" ||
            staff_id == undefined || staff_id == "" || percent == undefined || percent == "") {
            return functions.setError(res, "Truyền thiếu 1 trong các trường condition, start, end, value, staff_id, percent");
        }

        if (kpi_id == 0 || id == 0)
            return functions.setError(res, "Chưa truyền id, kpi hoặc truyền sai định dạng");

        let result = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 0 })
        if (result == null) {
            return functions.setError(res, `Không tìm thấy KPI đơn mục tiêu ${kpi_id}`, 400);
        }
        //Chỉnh sửa hoặc thêm mới 1 chuỗi id thưởng
        let arrID = id.split(",");
        arrID = arrID.map(item => parseInt(item));
        let arrarStart = start.split(",");
        let arrEnd = end.split(",");
        let arrValue = value.split(",");
        let arrStaff = staff_id.split(";");
        let arrPercent = percent.split(";");

        //Xóa thưởng không trong ds id trả về
        let arrBonus = await KPI365_Bonus.find({ kpi_id: parseInt(kpi_id), is_deleted: 0 });
        for (let i = 0; i < arrBonus.length; i++) {
            let val = arrBonus[i].id;
            if (!arrID.includes(val) && val != 0) {
                await functions_kpi_kpi.delete_bonus(val, 1, data_login)
            }
        }

        //Lấy các thưởng còn lại và cập nhật hoặc thêm mới
        arrBonus = await KPI365_Bonus.find({ kpi_id: parseInt(kpi_id), is_deleted: 0 }).sort({ id: 1 });
        for (let i = 0; i < arrarStart.length; i++) {
            let val = arrarStart[i];
            if (arrBonus[i] != undefined) { // chỉnh sửa thưởng
                let data_update_bonus = {
                    condition: parseInt(condition),
                    start: parseInt(val),
                    end: parseInt(arrEnd[i]),
                    value: parseInt(arrValue[i]),
                    updated_at: now
                }
                await KPI365_Bonus.updateOne({ id: arrBonus[i].id }, data_update_bonus);
                await KPI365_BonusDetails.deleteMany({ bonus_id: arrBonus[i].id });
                let arrayStaff = arrStaff[i].split(",");
                let arrayPercent = arrPercent[i].split(",");
                if (arrayStaff.length > 0 && arrayPercent.length > 0) {
                    for (let j = 0; j < arrayPercent.length; j++) {
                        let value = arrayPercent[j];
                        let MaxIdBD = await KPI365_BonusDetails.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                        let dataBonus = new KPI365_BonusDetails({
                            id: MaxIdBD + 1,
                            bonus_id: arrBonus[i].id,
                            staff_id: parseInt(arrayStaff[j]),
                            percent: parseInt(value)
                        })
                        await dataBonus.save();
                    }
                }
            }
            else {//Thêm mới thưởng
                let MaxIdB = await KPI365_Bonus.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                let data_insert_bonus = new KPI365_Bonus({
                    id: MaxIdB + 1,
                    kpi_id: kpi_id,
                    condition: parseInt(condition),
                    start: parseInt(val),
                    end: parseInt(arrEnd[i]),
                    value: parseInt(arrValue[i]),
                    created_at: now,
                    updated_at: now,
                    is_deleted: 0
                })
                data_insert_bonus.save();
                let arrayStaff = arrStaff[i].split(",");
                let arrayPercent = arrPercent[i].split(",");
                if (arrayStaff.length > 0 && arrayPercent.length > 0) {
                    for (let j = 0; j < arrayPercent.length; j++) {
                        let value = arrayPercent[j];
                        let MaxIdBD = await KPI365_BonusDetails.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                        let MaxIdB = await KPI365_Bonus.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                        let dataBonus = new KPI365_BonusDetails({
                            id: MaxIdBD + 1,
                            bonus_id: MaxIdB + 1,
                            staff_id: parseInt(arrayStaff[j]),
                            percent: parseInt(value)
                        })
                        await dataBonus.save();
                    }
                }
            }
        }

        let MaxIdAD = await KPI365_ActivityDiary.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: "Thiết lập thưởng " + result.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Thiết lập thưởng cho KPI đơn mục tiêu thành công`,
            {
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Danh sách đánh giá KPI đa mục tiêu
exports.listAssessMultiKPI = async (req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { organization_id, group_id, staff_id, date_start, date_end, id_kpi } = req.body;
        let page = parseInt(req.body.page) || 1;
        let pageSize = parseInt(req.body.pageSize) || 10;
        let skip = (page - 1) * pageSize;
        let now = functions.getTimeNow();
        let condition = {
            type_target: 1,
            is_deleted: 0,
            company_id: com_id,
        }
        let condition_staff = {
            type_target: 1,
            is_deleted: 0,
            company_id: com_id,
        }
        if (organization_id) {
            condition.organization_id = parseInt(organization_id);
        }
        if (group_id) {
            condition.group_id = parseInt(group_id);
            condition.group_type = 1;
        }
        if (date_start) {
            condition.start_day = { $gte: parseInt(date_start) };
        }
        if (date_end) {
            condition.end_date = { $lte: parseInt(date_end) + 86399 };
        }
        if (staff_id) {
            condition_staff["$or"] = [
                {
                    manager: { $regex: new RegExp(staff_id.toString(), 'i') }
                },
                {
                    followers: { $regex: new RegExp(staff_id.toString(), 'i') }
                },
                {
                    staff: { $regex: new RegExp(staff_id.toString(), 'i') }
                }
            ]
        }

        //Biến lưu danh sách id KPI đa mục tiêu khi tìm kiếm
        let list_kpi_id = [];
        let list_kpi_by_staff = [];
        //Lấy ds id kpi nếu điều kiện tìm kiếm có nhân viên thì lọc qua nhân viên trước
        if (staff_id) {
            await KPI365_Kpi.aggregate([{
                $sort: { id: -1 }
            },
            {
                $match: condition_staff
            },
            {
                $lookup: {
                    from: "KPI365_Kpi",
                    localField: "conn_target",
                    foreignField: "id",
                    as: "kpi_parent"
                }
            },
            {
                $unwind: { path: "$kpi_parent", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 0,
                    type: 1,
                    id: 1,
                    conn_target: 1,
                    conn_target_parent: "$kpi_parent.conn_target"
                }
            }]).then(data => data.map(item => {
                //Nếu type = "" thì lấy KPI cha của nó
                if (item.type == "") {
                    list_kpi_by_staff.push(item.conn_target)
                    if (item.conn_target_parent != null && item.conn_target_parent != undefined && item.conn_target_parent != 0)
                        list_kpi_by_staff.push(item.conn_target_parent)
                }
                //Nếu type != "" thì thêm cả nó và cha của nó vào
                else {
                    list_kpi_by_staff.push(item.id);
                    if (item.conn_target != 0) {
                        list_kpi_by_staff.push(item.conn_target);
                    }
                }
            }))

            list_kpi_by_staff = [...new Set(list_kpi_by_staff)];
        }

        //Tiếp tục lọc qua các điều kiện còn lại nếu có
        if (list_kpi_by_staff.length > 0) {
            condition.id = { $in: list_kpi_by_staff }
        }

        if (id_kpi) {
            condition.id = parseInt(id_kpi);
        }

        // Đếm số lượng KPI
        list_kpi_id = await KPI365_Kpi.aggregate([{
            $sort: { id: -1 }
        },
        {
            $match: condition

        },
        {
            $project: {
                _id: 0,
                id: 1
            }
        }]).then(data => data.map(item => item.id))

        let count = list_kpi_id.length;

        //Biến lưu danh sách KPI đa mục tiêu chưa xử lý có phân trang
        let data_kpi_multi = await KPI365_Kpi.aggregate([
            {
                $sort: { id: -1 }
            },
            {
                $match: {
                    id: { $in: list_kpi_id }
                }
            },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    type: 1,
                    percent: 1,
                    conn_target: 1,
                    created_at: 1,
                    updated_at: 1,
                    start_day: 1,
                    end_date: 1,
                    group_id: 1,
                    organization_id: 1,
                    staff: 1,
                    manager: 1,
                    followers: 1
                }
            }
        ])

        //Biến lưu danh sách KPI đa mục tiêu đã qua xử lý
        let list_kpi_multi = []
        for (let i = 0; i < data_kpi_multi.length; i++) {
            let item = data_kpi_multi[i]
            if (item.conn_target == 0) {//KPI đa mục tiêu
                let perform = await KPI365_Kpi.find({ conn_target: item.id, is_deleted: 0, type_target: 1 })
                    .then(async (data) => {
                        return await functions_kpi_kpi.strNameKpiMultiTarget(data.map(item => item.id), com_id)
                    });
                item.sum_kpi = 2;
                item.url = '/chi-tiet-kpi-da-muc-tieu-p' + item.id + '.html';
                item.url_update = "";
                item.perform = perform;
                item.type = "--";
                item.scores = "--";
                item.trend = "--";
                item.bonus = "--";
                item.percent = "--";
            }
            if (item.conn_target != 0) {//KPI tổ chức, nhóm mới, cá nhân
                let perform = await functions_kpi_kpi.nameKpiMultiTarget(parseInt(item.id), com_id);
                if (item.percent == "") {
                    item.url = `/chi-tiet-kpi-da-muc-tieu-p${item.conn_target}.html`;
                    item.percent = '0%';
                } else {
                    item.url = `/chi-tiet-kpi-da-muc-tieu-c${item.id}.html`;
                    item.percent = `${item.percent}%`;
                    if ((item.is_last == 1 && item.type != "5") || item.type == "5") {
                        item.url_update = (item.type == "5") ? `/cap-nhat-ket-qua-e${item.id}.html` : `/cap-nhat-ket-qua-p${item.id}.html`;
                    }
                }
                // tổng số KPI con của KPI đa mục tiêu (nếu = 1 thì ko cho cho xóa)
                item.sum_kpi = await KPI365_Kpi.countDocuments({ conn_target: parseInt(item.conn_target), type_target: 1, is_deleted: 0 })
                item.name = item.name + " - " + perform;
                item.perform = perform;
                item.type = item.type != 4 ? (item.type == 5 ? "Cá nhân" : "Tổ chức") : "Nhóm";

                if (item.type != "") {
                    item.process = await functions_kpi_kpi.processKpiMultiTarget(item.id).then(data => data.toString()) + "%";
                }
                else {
                    item.process = await functions_kpi_kpi.processKpiMultiTarget(item.conn_target, item.staff, item.target).then(data => data.toString()) + "%";
                }

                let scores = 0;
                let trend = 0; // 0.Không đạt, 1.Đạt
                let time = 1; // 0.Quá hạn, 1.Trong thời gian được cài đặt 

                if (now > item.end_date && parseFloat(item.process) < 100) { //quá hạn
                    time = 0;
                }

                let configAssess = await KPI365_ConfigAssess.findOne({ start: { $lte: parseFloat(item.process) }, end: { $gte: parseFloat(item.process) }, time: time, com_id: com_id }).sort({ scores: -1 });
                if (configAssess != null) {
                    scores = configAssess.scores;
                    trend = configAssess.trend;
                    item.scores = scores + " điểm";
                    item.trend = trend == 0 ? "Không đạt" : (trend == 1 ? "Đạt" : "Chưa cập nhật");
                }
                else {
                    item.scores = "Chưa thiết lập";
                    item.trend = "Chưa thiết lập";
                }

                let condition = await KPI365_Bonus.findOne({ kpi_id: parseInt(item.id), is_deleted: 0 })
                    .then(data => data.condition)
                    .catch(error => 0)
                if (condition == 0) {
                    item.bonus = "Chưa có thưởng"
                }

                if (condition == 1) {
                    let condition_1 = {
                        is_deleted: 0,
                        kpi_id: parseInt(item.id),
                        $or: [
                            {
                                $and: [
                                    { start: { $lte: parseFloat(item.process) } },
                                    { end: { $gte: parseFloat(item.process) } }
                                ]
                            },
                            {
                                end: { $lt: parseFloat(item.process) }
                            }
                        ]
                    }
                    let valueBonus = await KPI365_Bonus.findOne(condition_1)
                        .then(data => data.value)
                        .catch(error => 0)
                    if (valueBonus !== null) {
                        item.bonus = valueBonus + " VNĐ"
                    }
                    else {
                        item.bonus = "Chưa có thưởng"
                    }
                }
                if (condition == 2) {
                    let condition_1 = {
                        is_deleted: 0,
                        kpi_id: parseInt(item.id),
                        $or: [
                            {
                                $and: [
                                    { start: { $lte: parseFloat(scores) } },
                                    { end: { $gte: parseFloat(scores) } }
                                ]
                            },
                            {
                                end: { $lt: parseFloat(scores) }
                            }
                        ]
                    }
                    let valueBonus = await KPI365_Bonus.findOne(condition_1)
                        .then(data => data.value)
                        .catch(error => 0)
                    if (valueBonus !== null) {
                        item.bonus = valueBonus + " VNĐ"
                    }
                    else {
                        item.bonus = "Chưa có thưởng"
                    }
                }

            }

            item.execution_time = functions_kpi.getDate(item.start_day * 1000) + " - " + functions_kpi.getDate(item.end_date * 1000);
            if (item.manager != "") {
                item.manager = item.manager.split(",").map(data => parseInt(data));
                item.manager = await Users.find({
                    idQLC: { $in: item.manager }, "inForPerson.employee.com_id": com_id
                }).then(data => data.map(data => data.userName).join(","))
                    .catch(error => "");
            }

            if (item.followers != "") {
                item.followers = item.followers.split(",").map(data => parseInt(data));
                item.followers = await Users.find({
                    idQLC: { $in: item.followers }, "inForPerson.employee.com_id": com_id
                }).then(data => data.map(followers => data.userName).join(","));
            }

            list_kpi_multi.push(item)
        }

        return functions.success(res,
            `Danh sách đánh giá KPI đa mục tiêu`,
            {
                list_kpi_multi,
                count
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Chi tiết thưởng KPI đa mục tiêu
exports.detailBonusMultiKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const kpi_id = parseInt(req.body.kpi_id) || 0;

        if (kpi_id == 0)
            return functions.setError(res, "Chưa truyền id hoặc truyền sai định dạng id");

        let result = await KPI365_Kpi.findOne({ id: kpi_id, type_target: 1, is_deleted: 0 });
        if (result == null) return functions.setError(res, "Không tìm thấy KPI đa mục tiêu này", 400);

        let name = result.name;
        if (result.conn_target != 0) {
            let perform = await functions_kpi_kpi.nameKpiMultiTarget(parseInt(result.id), com_id);
            name = result.name + " - " + perform;
        }
        let result_bonus = await KPI365_Bonus.aggregate([{
            $match: {
                kpi_id: parseInt(kpi_id),
                is_deleted: 0
            }
        },
        {
            $lookup: {
                from: 'KPI365_BonusDetails',
                localField: 'id',
                foreignField: 'bonus_id',
                as: 'bonusDetails',
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            staff_id: 1,
                            percent: 1
                        }
                    }
                ]
            },
        },
        {
            $project: {
                _id: 0,
                id: 1,
                condition: 1,
                start: 1,
                end: 1,
                value: 1,
                arrDetails: "$bonusDetails"
            }
        }])

        let type_kpi = result.type;
        let list_staff = [];
        let list_manager = [];
        let list_followers = [];
        let conditions = {
            "inForPerson.employee.com_id": com_id,
            "inForPerson.employee.ep_status": "Active"
        }
        let conditions_1 = {
            "inForPerson.employee.com_id": com_id,
            "inForPerson.employee.ep_status": "Active"
        }
        if (type_kpi == "4") {

            if (result.manager != "" && result.manager != "0") {
                let manage = result.manager.split(",");
                list_manager = manage.map(item => parseInt(item));
            }
            if (result.followers != "" && result.followers != "0") {
                let followers = result.followers.split(",");
                list_followers = followers.map(item => parseInt(item))
            }
            conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]

            list_staff = await KPI365_Kpi.find({ conn_target: result.id, is_deleted: 0, type_target: 1 }).then(
                data => {
                    if (data.length > 0)
                        return data.map(item => parseInt(item.staff))
                    else return []
                }
            )
            conditions.idQLC = { $in: list_staff }
        }
        if (type_kpi == "5") {
            if (result.staff != "" && result.staff != "0") {
                let staff = result.staff.split(",");
                list_staff = staff.map(item => parseInt(item));
            }
            if (result.manager != "" && result.manager != "0") {
                let manage = result.manager.split(",");
                list_manager = manage.map(item => parseInt(item));
            }
            if (result.followers != "" && result.followers != "0") {
                let followers = result.followers.split(",");
                list_followers = followers.map(item => parseInt(item))
            }
            conditions.idQLC = { $in: list_staff }
            conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]
        }
        if (type_kpi == "6") {
            if (result.manager != "" && result.manager != "0") {
                let manage = result.manager.split(",");
                list_manager = manage.map(item => parseInt(item));
            }
            if (result.followers != "" && result.followers != "0") {
                let followers = result.followers.split(",");
                list_followers = followers.map(item => parseInt(item))
            }
            list_staff = await KPI365_Kpi.find({ conn_target: result.id, is_deleted: 0, type_target: 1 }).then(
                data => {
                    if (data.length > 0)
                        return data.map(item => parseInt(item.staff))
                    else return []
                }
            )
            conditions.idQLC = { $in: list_staff }
            conditions_1["$or"] = [{ idQLC: { $in: list_manager } }, { idQLC: { $in: list_followers } }]
        }

        const arrStaff = await Users.aggregate([
            {
                $match: conditions
            },
            {
                $lookup: {
                    from: 'QLC_Positions',
                    localField: 'inForPerson.employee.position_id',
                    foreignField: 'id',
                    let: { "comId": "$comId" },
                    pipeline: [{ $match: { comId: com_id } }],
                    as: 'positions'
                }
            },
            {
                $unwind: { path: "$positions", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    "_id": 0,
                    ep_id: "$idQLC",
                    userName: "$userName",
                    positionName: "$positions.positionName",
                    position_kpi: "Nhân viên thực hiện"
                }
            }
        ])

        const arrManageFollower = await Users.aggregate([
            {
                $match: conditions_1
            },
            {
                $lookup: {
                    from: 'QLC_Positions',
                    localField: 'inForPerson.employee.position_id',
                    foreignField: 'id',
                    let: { "comId": "$comId" },
                    pipeline: [{ $match: { comId: com_id } }],
                    as: 'positions'
                }
            },
            {
                $unwind: { path: "$positions", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    "_id": 0,
                    ep_id: "$idQLC",
                    userName: "$userName",
                    positionName: "$positions.positionName"
                }
            }
        ])

        arrManageFollower.map(item => {
            if (list_manager.includes(item.ep_id)) {
                item.position_kpi = "Quản lý"
            }
            if (list_followers.includes(item.ep_id)) {
                item.position_kpi = "Theo dõi"
            }
        })

        return functions.success(res,
            `Chi tiết thưởng KPI đa mục tiêu thành công`,
            {
                name,
                result_bonus,
                arrStaff,
                arrManageFollower
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Thiết lập thưởng KPI đa mục tiêu
exports.settingBonusMultiKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const kpi_id = parseInt(req.body.kpi_id) || 0;
        let { condition, start, end, value, staff_id, percent } = req.body;
        let now = functions.getTimeNow();
        if (condition == undefined || condition == "" || start == undefined || start == "" ||
            end == undefined || end == "" || value == undefined || value == "" ||
            staff_id == undefined || staff_id == "" || percent == undefined || percent == "") {
            return functions.setError(res, "Truyền thiếu 1 trong các trường condition, start, end, value, staff_id, percent");
        }

        if (kpi_id == 0)
            return functions.setError(res, "Chưa truyền id hoặc truyền sai định dạng id");

        let result = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 1 })
        if (result == null) {
            return functions.setError(res, `Không tìm thấy KPI đa mục tiêu ${kpi_id}`, 400);
        }

        let arrarStart = start.split(",");
        let arrEnd = end.split(",");
        let arrValue = value.split(",");
        let arrStaff = staff_id.split(";");
        let arrPercent = percent.split(";");

        for (let i = 0; i < arrarStart.length; i++) {
            let val = arrarStart[i];
            let MaxIdB = await KPI365_Bonus.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
            let data_insert_bonus = new KPI365_Bonus({
                id: MaxIdB + 1,
                kpi_id: kpi_id,
                condition: parseInt(condition),
                start: parseInt(val),
                end: parseInt(arrEnd[i]),
                value: parseInt(arrValue[i]),
                created_at: now,
                updated_at: now
            })
            data_insert_bonus.save();
            let infoStaff = arrStaff[i];
            let infoPercent = arrPercent[i];
            let arrayStaff = infoStaff.split(",");
            let arrayPercent = infoPercent.split(",");
            if (arrStaff[i] != "" && arrPercent[i] != "") {
                for (let j = 0; j < arrayPercent.length; j++) {
                    let value = arrayPercent[j];
                    let MaxIdBD = await KPI365_BonusDetails.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                    let dataBonus = new KPI365_BonusDetails({
                        id: MaxIdBD + 1,
                        bonus_id: MaxIdB + 1,
                        staff_id: parseInt(arrayStaff[j]),
                        percent: parseInt(value)
                    })
                    await dataBonus.save();
                }
            }
        }

        let MaxIdAD = await KPI365_ActivityDiary.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: "Thiết lập thưởng " + result.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Thiết lập thưởng cho KPI đa mục tiêu thành công`,
            {
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Xóa + khôi phục thưởng KPI đa mục tiêu
exports.deleteBonusMultiKPI = async (req, res) => {
    try {
        let { type, com_id, idQLC } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        const now = functions.getTimeNow();

        const id_bonus_1 = req.body.id_bonus;
        if (id_bonus_1 == "")
            return functions.setError(res, "Chưa truyền id thưởng", 400);
        let list_id = id_bonus_1.split(",");

        list_id = list_id.map(item => parseInt(item));
        const status = parseInt(req.body.status) || 1;
        if (![0, 1, 2].includes(status)) {
            return functions.setError(res, "status phải thuộc 0 hoặc 1 hoặc 2", 400);
        }

        for (let i = 0; i < list_id.length; i++) {
            let id_bonus = list_id[i];
            let result_bonus = await KPI365_Bonus.find({ id: parseInt(result_bonus) });
            let kpi_id = result_bonus.kpi_id;
            let value_bonus = result_bonus.value;
            let info = await KPI365_Kpi.find({ company_id: com_id, id: parseInt(kpi_id) });
            await KPI365_Bonus.update({ id: parseInt(id_bonus) }, { is_deleted: parseInt(status) })
            let msg = "";
            let user_name = data_login.name;
            if (status == 1) {
                msg = 'Xóa thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus;
                const MaxIdDeleteData = await KPI365_DeletedData.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                let deleted_data = new KPI365_DeletedData({
                    id: MaxIdDeleteData + 1,
                    type: 2,
                    created_at: now,
                    deleted_id: id_bonus,
                    date: functions_kpi.getDate(now * 1000),
                    com_id: com_id,
                    user_name: user_name,
                    content: 'Thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus,
                });
                await deleted_data.save();
            } else if (status == 0) {
                msg = 'Khôi phục thiết lập thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus;
            } else if (status == 2) {
                msg = 'Xóa vĩnh viễn thiết lập thưởng KPI ' + info.kpi_name + ' - Mức thưởng: ' + value_bonus;
            }

            let MaxIdActivityDiary = await KPI365_ActivityDiary.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
            let data_insert_diary = new KPI365_ActivityDiary({
                id: MaxIdActivityDiary + 1,
                user_id: idQLC,
                type: 3,
                content: msg,
                created_at: now,
                date: functions_kpi.getDate(now * 1000),
                login_type: type
            });
            await data_insert_diary.save();
        }

        return functions.success(res,
            `${status == 0 ? "Khôi phục" : (status == 1 ? "Xóa" : " Xóa vĩnh viễn")} thưởng KPI đa mục tiêu thành công`,
            {
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Chỉnh sửa thưởng KPI đa mục tiêu 
exports.editBonusMultiKPI = async (req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        const kpi_id = parseInt(req.body.kpi_id) || 0;
        const id = req.body.id;
        let { condition, start, end, value, staff_id, percent } = req.body;
        let now = functions.getTimeNow();
        if (condition == undefined || condition == "" || start == undefined || start == "" ||
            end == undefined || end == "" || value == undefined || value == "" ||
            staff_id == undefined || staff_id == "" || percent == undefined || percent == "") {
            return functions.setError(res, "Truyền thiếu 1 trong các trường condition, start, end, value, staff_id, percent");
        }

        if (kpi_id == 0 || id == 0)
            return functions.setError(res, "Chưa truyền id, kpi hoặc truyền sai định dạng");

        let result = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 1 })
        if (result == null) {
            return functions.setError(res, `Không tìm thấy KPI đa mục tiêu ${kpi_id}`, 400);
        }
        //Chỉnh sửa hoặc thêm mới 1 chuỗi id thưởng
        let arrID = id.split(",");
        arrID = arrID.map(item => parseInt(item));
        let arrarStart = start.split(",");
        let arrEnd = end.split(",");
        let arrValue = value.split(",");
        let arrStaff = staff_id.split(";");
        let arrPercent = percent.split(";");

        //Xóa thưởng không trong ds id trả về
        let arrBonus = await KPI365_Bonus.find({ kpi_id: parseInt(kpi_id), is_deleted: 0 });
        for (let i = 0; i < arrBonus.length; i++) {
            let val = arrBonus[i].id;
            if (!arrID.includes(val) && val != 0) {
                await functions_kpi_kpi.delete_bonus(val, 1, data_login)
            }
        }

        //Lấy các thưởng còn lại và cập nhật hoặc thêm mới
        arrBonus = await KPI365_Bonus.find({ kpi_id: parseInt(kpi_id), is_deleted: 0 }).sort({ id: 1 });
        for (let i = 0; i < arrarStart.length; i++) {
            let val = arrarStart[i];
            if (arrBonus[i] != undefined) { // chỉnh sửa thưởng
                let data_update_bonus = {
                    condition: parseInt(condition),
                    start: parseInt(val),
                    end: parseInt(arrEnd[i]),
                    value: parseInt(arrValue[i]),
                    updated_at: now
                }
                await KPI365_Bonus.updateOne({ id: arrBonus[i].id }, data_update_bonus);
                await KPI365_BonusDetails.deleteMany({ bonus_id: arrBonus[i].id });
                let arrayStaff = arrStaff[i].split(",");
                let arrayPercent = arrPercent[i].split(",");
                if (arrayStaff.length > 0 && arrayPercent.length > 0) {
                    for (let j = 0; j < arrayPercent.length; j++) {
                        let value = arrayPercent[j];
                        let MaxIdBD = await KPI365_BonusDetails.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                        let dataBonus = new KPI365_BonusDetails({
                            id: MaxIdBD + 1,
                            bonus_id: arrBonus[i].id,
                            staff_id: parseInt(arrayStaff[j]),
                            percent: parseInt(value)
                        })
                        await dataBonus.save();
                    }
                }
            }
            else {//Thêm mới thưởng
                let MaxIdB = await KPI365_Bonus.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                let data_insert_bonus = new KPI365_Bonus({
                    id: MaxIdB + 1,
                    kpi_id: kpi_id,
                    condition: parseInt(condition),
                    start: parseInt(val),
                    end: parseInt(arrEnd[i]),
                    value: parseInt(arrValue[i]),
                    created_at: now,
                    updated_at: now,
                    is_deleted: 0
                })
                data_insert_bonus.save();
                let arrayStaff = arrStaff[i].split(",");
                let arrayPercent = arrPercent[i].split(",");
                if (arrayStaff.length > 0 && arrayPercent.length > 0) {
                    for (let j = 0; j < arrayPercent.length; j++) {
                        let value = arrayPercent[j];
                        let MaxIdBD = await KPI365_BonusDetails.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                        let MaxIdB = await KPI365_Bonus.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
                        let dataBonus = new KPI365_BonusDetails({
                            id: MaxIdBD + 1,
                            bonus_id: MaxIdB + 1,
                            staff_id: parseInt(arrayStaff[j]),
                            percent: parseInt(value)
                        })
                        await dataBonus.save();
                    }
                }
            }
        }

        let MaxIdAD = await KPI365_ActivityDiary.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: "Thiết lập thưởng " + result.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Thiết lập thưởng cho KPI đa mục tiêu thành công`,
            {
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Cấu hình đánh giá thêm mới
exports.addConfigAssess = async (req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { percent_head, percent_end, point, trend, time, color } = req.body;
        let now = functions.getTimeNow();
        let { MaxIdCA, MaxIdAD } = await functions_kpi.getMaxId().then(data => {
            return { MaxIdCA: data.MaxIdConfigAssess, MaxIdAD: data.MaxIdActivityDiary }
        })
        if (percent_head == undefined || percent_end == undefined || point == undefined ||
            trend == undefined || time == undefined || color == undefined || percent_head == "" ||
            percent_end == "" || point == "" ||
            trend == "" || time == "" || color == "") {
            return functions.setError(res, "Truyền thiếu trường, phải truyền hết các trường percent_head, percent_end, point, trend, time, color", 400);
        }
        if ([0, 1].includes(parseInt(time)) == false)
            return functions.setError(res, "Truyền sai kiểu time, phải thuộc [0,1]", 400);

        if ([0, 1].includes(parseInt(trend)) == false)
            return functions.setError(res, "Truyền sai kiểu trend, phải thuộc [0,1]", 400);

        let data_insert_config_assess = new KPI365_ConfigAssess({
            id: MaxIdCA + 1,
            start: percent_head,
            end: percent_end,
            scores: point,
            trend: trend,
            time: time, //Thời gian thực hiện
            color: color,
            com_id: com_id,
            created_at: now
        });
        await data_insert_config_assess.save();

        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: 'Thêm cấu hình đánh giá KPI',
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Thêm mới cấu hình đánh giá thành công`,
            {
                data_insert_config_assess,
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Danh sách cấu hình đánh giá
exports.listConfigAssess = async (req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let list_config_assess = [];
        await KPI365_ConfigAssess.find({ com_id: com_id }).sort({ id: -1 }).select("id start end scores trend time")
            .then(data => data.map(item => {
                let con_assess = {}
                con_assess.id = item.id;
                con_assess.percentAssess = item.start + " - " + item.end + " %";
                con_assess.point = item.scores + " điểm";
                con_assess.trend = item.trend == 0 ? "Không đạt" : "Đạt";
                con_assess.time = item.time == 0 ? "Quá hạn" : "Trong thời gian thực hiện được cài đặt";
                list_config_assess.push(con_assess);
            }))

        return functions.success(res,
            `Lấy danh sách cấu hình đánh giá thành công`,
            {
                list_config_assess
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Xóa cấu hình đánh giá
exports.deleteConfigAssess = async (req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { id } = req.body;
        let config_assess_info = await KPI365_ConfigAssess.findOne({ id: parseInt(id) });
        if (config_assess_info == null)
            return functions.setError(res, "Không tìm thấy bản ghi cần xóa", 400);

        await KPI365_ConfigAssess.deleteOne({ id: parseInt(id) });

        let MaxIdAD = await functions_kpi.getMaxId().then(data => data.MaxIdActivityDiary);
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: 'Xóa cấu hình đánh giá KPI',
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Xóa vĩnh viễn cấu hình đánh giá thành công`,
            {
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Chỉnh sửa cấu hình đánh giá
exports.editConfigAssess = async (req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { id, percent_head, percent_end, point, trend, time, color } = req.body;
        let now = functions.getTimeNow();
        let { MaxIdCA, MaxIdAD } = await functions_kpi.getMaxId().then(data => {
            return { MaxIdCA: data.MaxIdConfigAssess, MaxIdAD: data.MaxIdActivityDiary }
        })
        if (id == undefined || percent_head == undefined || percent_end == undefined || point == undefined ||
            trend == undefined || time == undefined || color == undefined || percent_head == "" ||
            percent_end == "" || point == "" ||
            trend == "" || time == "" || color == "") {
            return functions.setError(res, "Truyền thiếu trường, phải truyền hết các trường id, percent_head, percent_end, point, trend, time, color", 400);
        }
        if ([0, 1].includes(parseInt(time)) == false)
            return functions.setError(res, "Truyền sai kiểu time, phải thuộc [0,1]", 400);

        if ([0, 1].includes(parseInt(trend)) == false)
            return functions.setError(res, "Truyền sai kiểu trend, phải thuộc [0,1]", 400);

        const info_con_assess = await KPI365_ConfigAssess.findOne({ id: parseInt(id) });
        if (info_con_assess == null)
            return functions.setError(res, "Không tìm thấy bản ghi cần cập nhật", 400);

        let data_update_config_assess = {
            start: percent_head,
            end: percent_end,
            scores: point,
            trend: trend,
            time: time, //Thời gian thực hiện
            color: color,
            com_id: com_id,
            created_at: now
        };
        await KPI365_ConfigAssess.updateOne({ id: parseInt(id) }, data_update_config_assess);

        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 3,
            content: 'Chỉnh sửa cấu hình đánh giá KPI',
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type
        });
        await data_insert_diary.save();

        return functions.success(res,
            `Chỉnh cấu hình đánh giá thành công`,
            {
                data_update_config_assess,
                data_insert_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Chi tiết cấu hình đánh giá
exports.detailConfigAssess = async (req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let id = parseInt(req.body.id) || 0;
        if (id == 0)
            return functions.setError(res, "Chưa truyền hoặc truyền sai định dạng id", 400);

        let detail_config_assess = await KPI365_ConfigAssess.findOne({ id: id, com_id: com_id }).sort({ id: -1 })
            .then(data => data)
            .catch(error => { })

        return functions.success(res,
            `Lấy chi tiết cấu hình đánh giá thành công`,
            {
                detail_config_assess
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}