const KPI365_ActivityDiary = require("../../models/kpi/KPI365_ActivityDiary");
const KPI365_DeletedData = require("../../models/kpi/KPI365_DeletedData");
const KPI365_Kpi = require("../../models/kpi/KPI365_Kpi");
const KPI365_NewGroup = require("../../models/kpi/KPI365_NewGroup");
const KPI365_Result = require("../../models/kpi/KPI365_Result");

const KPI365_Organization = require("../../models/kpi/KPI365_Organization");
const QLC_OrganizeDetail = require('../../models/qlc/OrganizeDetail');
const Users = require('../../models/Users');

const functions = require('../functions');
const functions_kpi = require('./functions');
const KPI365_Bonus = require("../../models/kpi/KPI365_Bonus");

exports.delete_kpi_multi_target = async (id, status, com_id, com_name) => {
    try {
        const inFo = await KPI365_Kpi.findOne({ id: id, type_target: 1 });
        let kpi_name = "";
        const now = functions.getTimeNow();

        if (inFo.is_deleted != status) {
            let conn_target = inFo.conn_target;
            await KPI365_Kpi.update({ id: id }, { is_deleted: status, is_parent_deleted: status });
            if (conn_target == 0) {
                let query = await KPI365_Kpi.find({ conn_target: id });
                for (let i = 0; i < query.length; i++) {
                    let value = query[i];
                    if (status != 1) {
                        await KPI365_DeletedData.delete({ deleted_id: value.id, type: 1 });
                    }
                    await KPI365_Kpi.update({ id: value.id }, { is_deleted: status });
                    if (value.is_last == 1) {
                        let result = await KPI365_Kpi.find({ conn_target: value.id })
                        for (j = 0; j < result.length; j++) {
                            let val = result[i];
                            await KPI365_Kpi.update({ id: val.id }, { is_deleted: status });
                        }
                    }
                }
                kpi_name = inFo.name
            } else if (conn_target != 0) {
                if (inFo.is_last == 1) {
                    let query = await KPI365_Kpi.find({ conn_target: id });
                    for (let i = 0; i < query.length; i++) {
                        let result = query[i];
                        await KPI365_Kpi.update({ id: result.id }, { is_deleted: status })
                    }
                }
                let result = await KPI365_Kpi.find({ conn_target: conn_target, is_deleted: status, is_parent_deleted: status })
                let arrayType = [];
                let val;
                let list = []
                for (let j = 0; j < result.length; j++) {
                    val = result[i]
                    arrayType.push(val.type)
                }
                let type = arrayType.join(',');

                await KPI365_Kpi.update({ id: conn_target }, { type: type })
                if (val.type == 4) {
                    list = []
                }
                if (val.type == 5) {
                    list = []
                }
                // kpi_name = info.name + ' - ' + this.nameKpiMultiTarget(id, list)
            }

            let maxIdDD = await functions_kpi.getMaxId().then(data => { return data.MaxIdDeleteData });
            if (status == 1) {
                let msg = 'Xóa KPI ' + kpi_name;
                let deleted_data = new KPI365_DeletedData({
                    id: maxIdDD + 1,
                    type: 1,
                    created_at: now,
                    deleted_id: id,
                    date: functions_kpi.getDate(now * 1000),
                    com_id: com_id,
                    user_name: com_name,
                    content: 'KPI ' + kpi_name,
                });

                await deleted_data.save();
            }
            else if (status == 0) {
                msg = 'Khôi phục KPI ' + kpi_name;
                await KPI365_DeletedData.delete({ deleted_id: id, type: 1 });
            }
            else if (status == 2) {
                msg = 'Xóa vĩnh viễn KPI ' + kpi_name;
                await KPI365_DeletedData.delete({ deleted_id: id, type: 1 });
            }

            let data_insert_diary = new KPI365_ActivityDiary({
                user_i: id(),
                type: 1,
                content: msg,
                created_at: now,
                date: functions_kpi.getDate(now * 1000),
                login_type: type
            });
            await data_insert_diary.save();
        }
    }
    catch (err) {
        console.log("error: delete_kpi_multi_target")
        return;
    }
}

exports.nameKpiMultiTarget = async (id, com_id) => {
    const kpi_info = await KPI365_Kpi.findOne({ id: id })
    let name = "";
    if (kpi_info.type == "4") {
        let group_id = kpi_info.group_id;
        let group_name = await KPI365_NewGroup.findOne(
            {
                is_deleted: 0,
                com_id: com_id,
                id: group_id

            }
        ).then(data => data.group_name)
            .catch(error => "")
        name = group_name;
    }
    else if (kpi_info.type == "5") {
        let idQLC = parseInt(kpi_info.staff);
        let staff_name = await Users.findOne({ idQLC: idQLC, type: 2 }).then(data => data.userName).catch(err => "");
        name = staff_name;
    }
    else if (kpi_info.type == "6") {
        let organization_id = parseInt(kpi_info.organization_id);
        let organization_name = await QLC_OrganizeDetail.findOne({ id: organization_id }).then(data => data.organizeDetailName).catch(error => "");
        name = organization_name;
    }

    return name;
}

exports.nameKPISingle = async (id, com_id) => {
    const kpi_info = await KPI365_Kpi.findOne({ id: id });
    let name = "";
    if (kpi_info.type == "4") {
        let group_id = kpi_info.group_id;
        let group_name = await KPI365_NewGroup.findOne(
            {
                is_deleted: 0,
                com_id: com_id,
                id: group_id

            }
        ).then(data => data.group_name)
            .catch(error => "")
        name = group_name + " - " + kpi_info.name;
    }
    else if (kpi_info.type == "5") {
        name = kpi_info.name;
    }
    else if (kpi_info.type == "6") {
        let organization_id = parseInt(kpi_info.organization_id);
        let organization_name = await QLC_OrganizeDetail.findOne({ id: organization_id }).then(data => data.organizeDetailName).catch(error => "");
        name = organization_name + " - " + kpi_info.name;
    }
    else if (kpi_info.type == "1") {
        name = kpi_info.name;
    }

    return name;
}
exports.strNameKpiMultiTarget = async (array_id, com_id) => {
    let str_name = ""
    let array_name = [];
    for (let i = 0; i < array_id.length; i++) {
        const kpi_info = await KPI365_Kpi.findOne({ id: parseInt(array_id[i]) })
        let name = "";
        if (kpi_info.type == "4") {
            let group_id = kpi_info.group_id;
            let group_name = await KPI365_NewGroup.findOne(
                {
                    is_deleted: 0,
                    com_id: com_id,
                    id: group_id

                }
            ).then(data => data.group_name)
                .catch(error => "")
            name = group_name;
        }
        else if (kpi_info.type == "5") {
            let idQLC = parseInt(kpi_info.staff);
            let staff_name = await Users.findOne({ idQLC: idQLC, type: 2 }).then(data => data.userName).catch(err => "");
            name = staff_name;
        }
        else if (kpi_info.type == "6") {
            let organization_id = parseInt(kpi_info.organization_id);
            let organization_name = await QLC_OrganizeDetail.findOne({ id: organization_id }).then(data => data.organizeDetailName).catch(error => "");
            name = organization_name;
        }
        array_name.push(name);
    }
    if (array_name.length > 0)
        str_name = array_name.join(", ");
    return str_name;
}
//Hàm đệ quy sao chép KPI
exports.recursion_copy = async (id, new_id, from_date, to_date, now) => {
    //Lấy danh sách KPI đơn mục tiêu con
    let dataChildren = await KPI365_Kpi.find({ conn_target: id, is_deleted: 0, is_parent_deleted: 0 })
        .then(data => data);

    // Tạo mới các KPI đơn mục tiêu con tương ứng
    for (let i = 0; i < dataChildren.length; i++) {
        let { MaxIdKPI } = await functions_kpi.getMaxId().then(data => { return { MaxIdKPI: data.MaxIdKPI } });
        let dataChildren_1 = dataChildren[i];
        let new_kpi_child = new KPI365_Kpi({
            id: MaxIdKPI + 1,
            name: dataChildren_1.name,
            type: dataChildren_1.type,
            type_unit: dataChildren_1.type_unit,
            unit_id: dataChildren_1.unit_id,
            target: dataChildren_1.target,
            percent: dataChildren_1.percent,
            conn_target: parseInt(new_id),
            created_at: now,
            updated_at: now,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            description: dataChildren_1.description,
            target_year: dataChildren_1.target_year,
            department_id: dataChildren_1.department_id,
            nest_id: dataChildren_1.nest_id,
            group_id: dataChildren_1.group_id,
            organization_id: dataChildren_1.organization_id,
            level: dataChildren_1.level,
            staff: dataChildren_1.staff,
            manager: dataChildren_1.manager,
            followers: dataChildren_1.followers,
            company_id: dataChildren_1.company_id,
            is_deleted: dataChildren_1.is_deleted,
            is_last: dataChildren_1.is_last,
            group_type: dataChildren_1.group_type,
            type_target: dataChildren_1.type_target,
            precent_target: dataChildren_1.precent_target,
            calculate: dataChildren_1.calculate,
            target_id: dataChildren_1.target_id,
            is_parent_deleted: dataChildren_1.is_parent_deleted,
            formula: dataChildren_1.formula,
        })
        await new_kpi_child.save();
        if (dataChildren_1.is_last == 1) {
            await this.recursion_copy(dataChildren_1.id, MaxIdKPI + 1, from_date, to_date, now);
        }
    }
}

//Lấy ds KPI theo id nhân viên
exports.arrayKpiByStaff = async (id, com_id, type_target = 0, type_list = 0) => {
    // type_target: 0.KPI đơn mục tiêu, 1.KPI đa mục tiêu
    // type_list: 0.KPI đa mục tiêu(cha), 1.KPI đa mục tiêu + KPI phòng, tổ, nhóm, cá nhân(cha + con)
    //Tạo mảng lưu id KPI trả về
    let array_kpi = [];
    //Với KPI đa mục tiêu
    if (type_target == 1) {
        //Tìm nhân viên là quản lý trong tổ chức hoặc nhóm mới trả về id nhóm mới và tổ chức
        //Danh sách id KPI đa mục tiêu mà nhân viên là người quản lý hoặc theo dõi
        let list_id_kpi = await KPI365_Kpi.aggregate([{
            $sort: { id: -1 },
        },
        {
            $match: {
                $or: [
                    { staff: { $regex: new RegExp(id.toString(), 'i') } },
                    {
                        manager: { $regex: new RegExp(id.toString(), 'i') }
                    },
                    {
                        followers: { $regex: new RegExp(id.toString(), 'i') }
                    }
                ],
                company_id: com_id
            }
        },
        {
            $project: {
                _id: 0,
                id: 1
            }
        }])
        array_kpi = list_id_kpi.map(item => item.id);
    }
    return array_kpi;
}

//Lấy tiến độ của KPI đa mục tiêu
exports.processKpiMultiTarget = async (kpi_id, staff_id = 0, target = 0) => {
    try {
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(kpi_id), type_target: 1, is_deleted: 0 });
        let conn_target = ""
        let target_id = ""
        let calculate = ""
        let precent_target = ""
        let array_target_id = [];
        let array_calculate = [];
        let array_precent_target = [];
        let sum_precent = 0;
        let process = 0;

        if (info_kpi != null && info_kpi != undefined) {
            conn_target = info_kpi.conn_target;
            target_id = info_kpi.target_id; // ID chỉ tiêu
            calculate = info_kpi.calculate; // 0.Tự nhập, 1.Công thức
            precent_target = info_kpi.precent_target; // Trọng số của chỉ tiêu
            array_target_id = target_id.split(",");
            array_calculate = calculate.split(",");
            array_precent_target = precent_target.split(",");
            if (conn_target == 0) { //KPI đa mục tiêu cha
                let check = true;
                //Lấy danh sách KPI đa mục tiêu con
                let infoChild = await KPI365_Kpi.find({ conn_target: parseInt(kpi_id), type_target: 1, is_deleted: 0 }).then(data => data);
                let temp = 0;
                for (let i = 0; i < infoChild.length; i++) {
                    let value = infoChild[i];
                    let precent = value.percent;
                    sum_precent = sum_precent + parseInt(precent);
                    let process_organization = await this.progressParent(value, array_precent_target, value.id, array_target_id, array_calculate);
                    let process_parent = process_organization / 100 * precent;
                    process = process + process_parent;
                    if (process_parent < parseInt(precent)) {
                        check = false;
                        temp = temp + process_parent;
                    } else {
                        temp = temp + parseInt(precent);
                    }
                }
            }
            else {
                if (staff_id == "0") { // KPI tổ chức, nhóm mới hoặc cá nhân
                    process = await this.progressParent(info_kpi, array_precent_target, parseInt(kpi_id), array_target_id, array_calculate);
                } else { // KPI con của tổ chức nhóm mới hoặc cá nhân
                    process = await this.progressChild(target, array_precent_target, kpi_id, staff_id, array_target_id, array_calculate);
                }
            }
        }
        //Làm tròn về 1 chữ số
        process = parseFloat(process).toFixed(1);
        if (process == parseInt(process, 10)) {
            process = parseInt(process, 10);
        }
        return process;
    }
    catch (error) { return 0; }
}

//Tiến độ của KPI con là tổ chức hoặc nhóm mới hoặc cá nhân
exports.progressParent = async (infoKpi, array_precent_target, kpi_id, array_target_id, array_calculate) => {
    let target = 0;
    let process = 0;
    let sum_precent = 0;
    let temp = 0;
    //Nếu là KPI cá nhân
    if (infoKpi.type == "5") {
        target = infoKpi.target;
        process = await this.progressChild(target, array_precent_target, kpi_id, infoKpi.staff, array_target_id, array_calculate);
    } else {
        let check = true;
        let infoChild = await KPI365_Kpi.find({ conn_target: parseInt(kpi_id), is_deleted: 0, type_target: 1 }).then(data => data);
        for (let i = 0; i < infoChild.length; i++) {
            value = infoChild[i];
            target = value['target'];
            precent = value['percent'];
            sum_precent = sum_precent + precent;
            let process_staff = await this.progressChild(target, array_precent_target, kpi_id, value['staff'], array_target_id, array_calculate);
            let process_parent = process_staff / 100 * precent;
            process = process + process_parent;
            if (process_parent < precent) {
                check = false;
                temp = temp + process_parent;
            } else {
                temp = temp + precent;
            }
        }
        if (!check || sum_precent < 100) {
            process = temp;
        }
    }
    return process;
}

//Tiến độ của KPI con của tổ chức, nhóm mới
exports.progressChild = async (target, array_precent_target, kpi_id, staff_id, array_target_id, array_calculate) => {
    let array_target = target.split(",");
    let check = true;
    let sum_precent = 0;
    let process = 0;
    let temp = 0;
    for (let i = 0; i < array_target.length; i++) {
        let value = array_target[i];
        let precent = array_precent_target[i];
        sum_precent = sum_precent + parseFloat(precent);
        let result = await this.resultsKpiMultiTarget(kpi_id, staff_id, array_target_id[i], array_calculate[i], 5);
        let process_target = (value == 0) ? 0 : result / parseFloat(value) * parseFloat(precent);
        process = process + process_target;
        if (process_target < precent) {
            check = false;
            temp = temp + process_target;
        } else {
            temp = temp + parseFloat(precent);
        }
    }
    if (!check || sum_precent < 100) {
        process = temp;
    }

    return process;
}

//kết quả kpi phòng ban, tổ, nhóm, cá nhân (đa mục tiêu) // calculate (0.Tự nhập, 1.Công thức)
exports.resultsKpiMultiTarget = async (kpi_id, staff_id, target_id, calculate, type) => {
    let result = 0;
    let condition = {
        kpi_id: parseInt(kpi_id),
        accuracy: 1,
        target_id: parseInt(target_id)
    };
    if (parseInt(calculate) == 0) {
        if (parseInt(type) == 5) {
            condition.staff_id = staff_id.toString();
            result = await KPI365_Result.find(condition).then(data => {
                let sum = 0;
                data.map(item => {
                    sum = sum + parseFloat(item.result);
                })
                return sum;
            });
        }
    }
    else if (parseInt(calculate) == 1) {
        if (parseInt(type) == 5) {
            condition.staff_id = staff_id.toString();
            let sum = await KPI365_Result.countDocuments(condition);
            let employeeResults = await this.employeeResults(kpi_id, staff_id, target_id);
            result = sum * employeeResults;
        } else {
            for (let i = 0; i < staff_id.length; i++) {
                let value = staff_id[i];
                condition.staff_id = value.toString();
                let sum = await KPI365_Result.countDocuments(condition);
                let employeeResults = await this.employeeResults(kpi_id, value, target_id);
                result = sum * employeeResults;
            }
        }
    }
    return result;
}

//kết quả của nhân viên áp dụng công thức (đa mục tiêu)
exports.employeeResults = async (kpi_id, staff_id, target_id) => {
    const info_kpi = await KPI365_Kpi.findOne({ id: parseInt(kpi_id) }).then(data => data);
    let array_target_id = info.target_id.split(","); //mảng id chỉ tiêu
    let location = array_target_id.indexOf(target_id); //vị trí chỉ tiêu
    let formula = JSON.parse(info.formula)[location];
    if (info_kpi == null) return 0;

    let infoChildren = ""
    if (info_kpi.type != "5") {
        infoChildren = await KPI365_Kpi.find({ conn_target: parseInt(kpi_id), staff: staff_id.toString(), is_deleted: 0 }).then(data => data);
    }
    if (formula.includes('%')) {
        formula = formula.replace(/%/g, '/100');
    }
    if (formula.includes('tong_muc_tieu')) {
        const array_target = info_kpi.target.split(',');
        const sum_target = parseFloat(array_target[location]);
        formula = formula.replace('tong_muc_tieu', sum_target);
    }

    if (formula.includes('tong_nhan_vien')) {
        let sumChildren;
        if (info_kpi.type == "5") {
            sumChildren = 1;
        } else {
            sumChildren = await KPI365_Kpi.countDocuments({ conn_target: parseInt(id), is_deleted: 0 })
        }
        formula = formula.replace('tong_nhan_vien', parseFloat(sumChildren));
    }

    if (formula.includes('nhan_vien_thuc_hien')) {
        const sumChildren = await KPI365_Result.countDocuments({ kpi_id: parseInt(id), target_id: parseInt(target_id) });
        formula = formula.replace('nhan_vien_thuc_hien', parseFloat(sumChildren));
    }

    if (formula.includes('trong_so_chi_tieu')) {
        const array_precent = info_kpi.precent_target.split(',');
        const sum_precent = parseFloat(array_precent[location]);
        formula = formula.replace('trong_so_chi_tieu', parseFloat(sum_precent));
    }

    if (formula.includes('tong_trong_so')) {
        const percent = info_kpi.percent;
        formula = formula.replace('tong_trong_so', parseFloat(percent));
    }

    if (formula.includes('trong_so_nhan_vien')) {
        let percent_staff;
        if (info_kpi.type == "5") {
            percent_staff = info_kpi.percent;
        } else {
            percent_staff = infoChildren.percent;
        }
        formula = formula.replace('trong_so_nhan_vien', parseFloat(percent_staff));
    }

    if (formula.includes('muc_tieu')) {
        let array_target;
        if (info_kpi.type == "5") {
            array_target = info_kpi.target.split(',');
        } else {
            array_target = infoChildren.target.split(',');
        }
        const sum_target = parseFloat(array_target[location]);
        formula = formula.replace('muc_tieu', parseFloat(sum_target));
    }

    if (formula.includes('thoi_gian_thuc_hien')) {
        const endDate = new Date(info_kpi.end_date * 1000);
        const startDay = new Date(info_kpi.start_day * 1000);
        const diff = endDate - startDay;
        const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        formula = formula.replace('thoi_gian_thuc_hien', diffInDays);
    }

    if (/[a-zA-Z]/.test(formula)) {
        return 0;
    } else {
        try {
            // Sử dụng eval() để tính toán biểu thức
            const result = eval(formula);
            if (!isNaN(result)) {
                return result;
            } else {
                return 0;
            }
        } catch (error) {
            // Nếu có lỗi trong việc tính toán biểu thức, trả về 0
            return 0;
        }
    }
}

//Lấy kết quả của KPI = tổng các kết quả
exports.sumKPIResult = async (id = 0) => {
    let sum_kpi = 0;
    await KPI365_Result.find({ kpi_id: parseInt(id), accuracy: 1 })
        .then(data => {
            data.map(item => {
                sum_kpi = sum_kpi + parseFloat(item.result);
            })
        })
        .catch(error => console.log(error));
    return sum_kpi;
}

//Tiến độ KPI đơn mục tiêu
exports.process = async (id, is_last = 1, com_id) => {// nếu $is_last = 0 là KPI đó là ko có con thì sẽ hiển thị vượt KPI

    let kpi_query = await KPI365_Kpi.findOne({ id: parseInt(id), is_deleted: 0, company_id: com_id })
    if (kpi_query) {
        let type_okr = "5";
        let KPIProcess = 0;
        if (kpi_query.type_unit && kpi_query.type_unit != type_okr) {
            let sumKPIResult = await this.sumKPIResult(kpi_query.id);
            let KPITarget = kpi_query.target;
            let sumChildKPIPercent = 0;
            await KPI365_Kpi.find({ conn_target: kpi_query.id }).then(data => data.map(item => {
                sumChildKPIPercent = sumChildKPIPercent + parseFloat(item.percent);
            }))

            KPIProcess = (KPITarget == 0) ? 0 : (100 - sumChildKPIPercent) * (sumKPIResult / KPITarget);
            let query = await KPI365_Kpi.find({ conn_target: parseInt(kpi_query.id), is_deleted: 0, company_id: com_id })

            for (let i = 0; i < query.length; i++) {
                let result = query[i];
                let processKpi = await this.process(result.id, 1, com_id);
                let childProcess = (processKpi > 100) ? parseFloat(kpi_query.percent) : (processKpi * parseFloat(result.percent)) / 100;
                KPIProcess = KPIProcess + childProcess;
            }
        } else {
            let sumKPIResult = await this.sumKPIResult(kpi_query.id);
            let countKPIResult = await KPI365_Result.countDocuments({ kpi_id: kpi_query.id, accuracy: 1 });
            let sumChildKPIPercent = 0
            await KPI365_Kpi.find({ conn_target: kpi_query.id }).then(data => data.map(item => {
                sumChildKPIPercent = sumChildKPIPercent + parseFloat(item.percent);
            }))
            KPIProcess = 0;
            if (countKPIResult != 0) {
                KPIProcess = (100 - sumChildKPIPercent) * (sumKPIResult / countKPIResult) / 100;
            } else {
                KPIProcess = 0;
            }
            let query = await KPI365_Kpi.find({ conn_target: kpi_query.id, is_deleted: 0, company_id: com_id });
            for (let i = 0; i < query.length; i++) {
                let result = query[i];
                let childProcess = await this.process(result.id, 1, com_id) * parseFloat(result.percent) / 100;
                KPIProcess = KPIProcess + childProcess;
            }
        }
        if (is_last == 1) {
            KPIProcess = KPIProcess > 100 ? 100 : KPIProcess;
        }
        return KPIProcess;
    }
    else {
        return 0;
    }
}

exports.delete_bonus = async (id, status, data_login) => {
    try {
        const now = functions.getTimeNow();
        let result_bonus = await KPI365_Bonus.findOne({ id: parseInt(id) })
        let kpi_id = result_bonus.kpi_id;
        let value_bonus = parseInt(result_bonus['value']);
        let info = await KPI365_Kpi.findOne({ id: kpi_id, company_id: data_login.com_id });

        await KPI365_Bonus.updateOne({ id: id }, { is_deleted: status });
        let msg = ""
        if (status == 1) {
            msg = 'Xóa thưởng KPI ' + info.name + ' - Mức thưởng: ' + value_bonus;
            const MaxIdDeleteData = await KPI365_DeletedData.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
            let deleted_data = new KPI365_DeletedData({
                id: MaxIdDeleteData + 1,
                type: 2,
                created_at: now,
                deleted_id: id_bonus,
                date: functions_kpi.getDate(now * 1000),
                com_id: data_login.com_id,
                user_name: data_login.user_name,
                content: 'Thưởng KPI ' + info.name + ' - Mức thưởng: ' + value_bonus,
            });
            await deleted_data.save();
        } else if (status == 0) {
            msg = 'Khôi phục thiết lập thưởng KPI ' + info.name + ' - Mức thưởng: ' + value_bonus;
        } else if (status == 2) {
            msg = 'Xóa vĩnh viễn thiết lập thưởng KPI ' + info.name + ' - Mức thưởng: ' + value_bonus;
        }

        let MaxIdAD = await KPI365_ActivityDiary.findOne({}).sort({ id: -1 }).then(data => { return data.id }).catch(err => { return 0 });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: data_login.idQLC,
            type: 3,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: data_login.type
        });
        await data_insert_diary.save();
    }
    catch (error) {
        console.log("Lỗi ở xóa thưởng: " + error)
    }
}

//Tổng KPI toàn công ty
exports.totalKpiProcess = async (com_id) => {
    let totalKpiProcess = 0;
    let kpis = await KPI365_Kpi.find({ conn_target: 0, is_deleted: 0, company_id: com_id });
    let countKpi = await KPI365_Kpi.countDocuments({ conn_target: 0, is_deleted: 0, company_id: com_id });
    for (let i = 0; i < kpis.length; i++) {
        let process = await this.process(kpis[i].id, kpis[i].is_last, com_id);
        if (process > 100) {
            process = 100;
        }
        console.log(process)
        if (kpis[i].percent != "")
            totalKpiProcess = totalKpiProcess + (process * parseFloat(kpis[i].percent)) / 100;
        console.log(totalKpiProcess)
    }
    if (countKpi != 0) {
        return totalKpiProcess.toFixed(1);
    } else {
        return 0;
    }
}

//main_diagram
exports.main_diagram = async (com_id, start_day, end_day, search_kpi) => {
    let now = functions.getTimeNow()
    let condition = {
        conn_target: 0,
        is_deleted: 0,
        company_id: com_id,
        type_target: 0
    };
    if (start_day) {
        condition.end_date = { $gte: start_day }
    }
    if (end_day) {
        end_day = end_day + 86399;
        condition.start_day = { $lte: end_day }
    }
    if (search_kpi) {
        condition.id = parseInt(search_kpi);
    }
    let query = await KPI365_Kpi.aggregate([
        {
            $sort: { id: -1 }
        },
        {
            $match: condition
        },
        {
            $project: {
                _id: 0,
                id: 1,
                name: 1,
                end_date: 1,
                type: 1,
                group_id: 1,
                organization_id: 1,
                manager: 1,
                followers: 1,
                is_last: 1,
            }
        }
    ])
    let tree_arr = [];
    for (let i = 0; i < query.length; i++) {
        let item = query[i];
        let type_unit = item.type_unit;
        item.process = await this.process(item.id, item.is_last, com_id).then(data => data.toFixed(1));
        let color = 'C4C4C4';
        if (process > 100) { //vượt
            color = '2E3994';
        } else if (now > item.end_date && process < 100) { //quá hạn
            color = 'E34949';
        } else { //đang làm
            color = '76B51B';
        }
        item.color = color;
        if (parseInt(item.process) == parseFloat(item.process))
            item.process = parseInt(item.process)
        if (item.type == "5") {
            item.detail_kpi_url = functions_kpi.detailSingleKPI(item.id);
        }
        else if (item.type == "4") {
            await KPI365_NewGroup.findOne({ id: item.group_id, com_id: com_id }).sort({ id: -1 })
                .then(data => {
                    item.manager = data.manage_id;
                    item.followers = data.followers_id;
                    item.name = item.name + " - " + data.group_name
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
                .then(data => { item.name = item.name + " - " + data.organizeDetailName })
                .catch(error => console.log("Lỗi khi lấy danh sách KPI đơn mục tiêu - tổ chức"))
            item.detail_kpi_url = functions_kpi.detailSingleKPIOrganization(item.id);
        }
        else if (item.type == "1") {
            item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
        }

        //Xử lý tên quản lý, người theo dõi, nhân viên, thời gian thực hiện
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
            }).then(data => data.map(data => data.userName).join(","));
        }
        item.execution_time = functions_kpi.getDate(item.start_day * 1000) + " - " + functions_kpi.getDate(item.end_date * 1000);
        if (item['is_last'] == 1) {
            let children = await this.com_detail_diagram(com_id, item.id, start_day, end_day);
            item['child_info'] = children;
        }
        delete item.type
        delete item.end_date
        delete item.group_id
        delete item.organization_id
        delete item.organization_id
        tree_arr.push(item);
    }
    return tree_arr;
}

//com_detail_diagram
exports.com_detail_diagram = async (com_id, kpi_id, start_day, end_day) => {
    let now = functions.getTimeNow()
    let condition = {
        conn_target: kpi_id,
        is_deleted: 0,
        company_id: com_id,
        type_target: 0
    };
    if (start_day) {
        condition.end_date = { $gte: start_day }
    }
    if (end_day) {
        end_day = end_day + 86399;
        condition.start_day = { $lte: end_day }
    }

    let query = await KPI365_Kpi.aggregate([
        {
            $sort: { id: -1 }
        },
        {
            $match: condition
        },
        {
            $project: {
                _id: 0,
                id: 1,
                name: 1,
                end_date: 1,
                type: 1,
                group_id: 1,
                organization_id: 1,
                manager: 1,
                followers: 1,
                is_last: 1,
            }
        }
    ])
    let tree_arr = [];
    for (let i = 0; i < query.length; i++) {
        let item = query[i];
        let type_unit = item.type_unit;
        item.process = await this.process(item.id, item.is_last, com_id).then(data => data.toFixed(1));
        let color = 'C4C4C4';
        if (process > 100) { //vượt
            color = '2E3994';
        } else if (now > item.end_date && process < 100) { //quá hạn
            color = 'E34949';
        } else { //đang làm
            color = '76B51B';
        }
        item.color = color;
        if (parseInt(item.process) == parseFloat(item.process))
            item.process = parseInt(item.process)
        if (item.type == "5") {
            item.detail_kpi_url = functions_kpi.detailSingleKPI(item.id);
        }
        else if (item.type == "4") {
            await KPI365_NewGroup.findOne({ id: item.group_id, com_id: com_id }).sort({ id: -1 })
                .then(data => {
                    item.manager = data.manage_id;
                    item.followers = data.followers_id;
                    item.name = item.name + " - " + data.group_name
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
                .then(data => { item.name = item.name + " - " + data.organizeDetailName })
                .catch(error => console.log("Lỗi khi lấy danh sách KPI đơn mục tiêu - tổ chức"))
            item.detail_kpi_url = functions_kpi.detailSingleKPIOrganization(item.id);
        }
        else if (item.type == "1") {
            item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
        }

        //Xử lý tên quản lý, người theo dõi, nhân viên, thời gian thực hiện
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
            }).then(data => data.map(data => data.userName).join(","));
        }
        item.execution_time = functions_kpi.getDate(item.start_day * 1000) + " - " + functions_kpi.getDate(item.end_date * 1000);

        if (item['is_last'] == 1) {
            let children = await this.com_detail_diagram(com_id, item.id, start_day, end_day);
            item['child_info'] = children;
        }
        delete item.type
        delete item.end_date
        delete item.group_id
        delete item.organization_id
        delete item.organization_id
        tree_arr.push(item);
    }
    return tree_arr;

}

