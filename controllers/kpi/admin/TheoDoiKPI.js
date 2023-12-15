const functions = require('../../../services/functions');
const functions_kpi = require('../../../services/kpi/functions');
const functions_kpi_kpi = require('../../../services/kpi/KPI');

const KPI365_Organization = require('../../../models/kpi/KPI365_Organization');
const KPI365_TargetUnit = require('../../../models/kpi/KPI365_TargetUnit');
const KPI365_Bonus = require('../../../models/kpi/KPI365_Bonus');
const KPI365_ActivityDiary = require('../../../models/kpi/KPI365_ActivityDiary');
const KPI365_Kpi = require('../../../models/kpi/KPI365_Kpi');
const KPI365_NewGroup = require('../../../models/kpi/KPI365_NewGroup');
const KPI365_Result = require('../../../models/kpi/KPI365_Result');
const KPI365_ResultHistory = require('../../../models/kpi/KPI365_ResultHistory');
const KPI365_ConfigAssess = require('../../../models/kpi/KPI365_ConfigAssess');

const QLC_OrganizeDetail = require('../../../models/qlc/OrganizeDetail');
const Users = require('../../../models/Users');

exports.addSingleKPI = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            single,
            target_connect,
            type_unit,
            year,
            unit_target,
            target2,
            percent,
            to_date,
            from_date,
            member_manager,
            member_follow,
            description,
            type_add,
        } = req.body;
        let group_id = req.body.group_id; //Id chỉ dành riêng khi thêm KPI cho nhóm mới
        let organizations_id = req.body.organizations_id; //Id chỉ dành riêng khi thêm KPI cho tổ chức
        let now = functions.getTimeNow();

        //Thêm mới 1-công ty, 2-Tổ chức, 3-Nhóm, 4-Cá nhân
        if (type_add == undefined || type_add == null || type_add == '') {
            type_add = 4;
        } else if ([1, 2, 3, 4].includes(parseInt(type_add))) {
            type_add = parseInt(type_add);
        } else {
            return functions.setError(res, 'Chọn sai kiểu type_add vui lòng chọn type_add trong [1, 2, 3, 4]', 400);
        }

        if (type_add == 3) {
            if (group_id == undefined || group_id == null || group_id == '') {
                return functions.setError(res, 'Chưa điền group_id', 400);
            }
            const new_group = await KPI365_NewGroup.findOne({ id: parseInt(group_id) }).then((data) => data);
            if (new_group == null || new_group == undefined) {
                return functions.setError(res, 'Không tồn tại nhóm này', 400);
            }
        }

        let unit_info = {};
        let msg = '';

        //Check viễn cảnh có phải là OKR hay không
        if (type_unit != 5) {
            unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);

            if (type_add == 4)
                msg = 'Thêm KPI cá nhân ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (type_add == 3)
                msg = 'Thêm KPI nhóm ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (type_add == 2)
                msg = 'Thêm KPI tổ chức ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (type_add == 1)
                msg = 'Thêm KPI công ty ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + target2 + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            if (type_add == 4) msg = 'Thêm KPI cá nhân : ' + target2;
            if (type_add == 3) msg = 'Thêm KPI nhóm : ' + target2;
            if (type_add == 2) msg = 'Thêm KPI tổ chức : ' + target2;
            if (type_add == 1) msg = 'Thêm KPI công ty : ' + target2;
            if (name == '') {
                name = target2;
            }
        }
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        //Thêm mới KPI
        let data_insert_kpi = {};
        if (type_add == 4) {
            data_insert_kpi = {
                id: MaxIdKPI + 1,
                type: 5,
                name: name || '',
                staff: single || '0',
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                manager: member_manager || '0',
                followers: member_follow || '0',
                description: description || '',
                company_id: com_id,
                created_at: now,
                updated_at: now,
                is_last: 0,
            };
        }
        if (type_add == 1) {
            data_insert_kpi = {
                id: MaxIdKPI + 1,
                type: 1,
                name: name || '',
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                target_year: parseInt(year) || new Date().getFullYear(),
                followers: member_follow || '0',
                description: description || '',
                company_id: com_id,
                created_at: now,
                updated_at: now,
                is_last: 0,
            };
        }
        if (type_add == 3) {
            data_insert_kpi = {
                id: MaxIdKPI + 1,
                type: 4,
                name: name || '',
                group_id: group_id,
                group_type: 1,
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                description: description || '',
                company_id: com_id,
                created_at: now,
                updated_at: now,
                is_last: 0,
            };
        }
        let data = new KPI365_Kpi(data_insert_kpi);
        await data.save();

        //Cập nhật các KPI mục tiêu kết nối
        await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });

        //Thông báo
        let kpi_info = await functions_kpi.getInfoKPI(MaxIdKPI + 1, com_id).then((data) => data);
        let user_id = kpi_info.staffs.join(',');
        msg = 'Bạn đã được thêm vào KPI ' + kpi_info.name;
        let notification_data = {
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info.detail_url,
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        //Gửi tin nhắn vào chat 365 nếu là KPI cá nhân(4)
        if (type_add == 4) {
            let TypeSenderId = 1;
            let SenderId = com_id;
            let CompanyId = com_id;
            let Title = '';
            if (type == 1) {
                TypeSenderId = 1;
                SenderId = idQLC;
                CompanyId = idQLC;
                Title = 'Từ: Công ty ' + data_login.name;
            } else {
                TypeSenderId = 2;
                SenderId = idQLC;
                CompanyId = data_login.com_id;
                Title = 'Từ: ' + data_login.name;
            }
            let Message = 'Bạn đã được thêm vào KPI ' + name;
            let ListComReceive = [];
            let ListEpReceive = kpi_info['staffs'].map((item) => parseInt(item));
            let Link = `https://kpi.timviec365.vn${kpi_info['detail_url']}`;
            await functions_kpi.send_mess(
                SenderId,
                TypeSenderId,
                CompanyId,
                Title,
                Message,
                ListComReceive,
                ListEpReceive,
                Link
            );
        }

        return functions.success(
            res,
            `Thêm mới KPI ${
                type_add == 1 ? 'công ty' : type_add == 2 ? 'tổ chức' : type_add == 3 ? 'nhóm mới' : 'cá nhân'
            } thành công`, {
                data_insert_diary,
                data,
                notification_data,
            }
        );
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addSingleKPIPersonal = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            single,
            target_connect,
            type_unit,
            unit_target,
            target2,
            percent,
            to_date,
            from_date,
            member_manager,
            member_follow,
            description,
        } = req.body;
        let now = functions.getTimeNow();

        let unit_info = {};
        let msg = '';

        //Check viễn cảnh có phải là OKR hay không
        if (type_unit != 5) {
            unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Thêm KPI cá nhân ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Thêm KPI cá nhân : ' + target2;
            if (name == '') {
                name = target2;
            }
        }
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        //Thêm mới KPI
        let data_insert_kpi = {};

        data_insert_kpi = {
            id: MaxIdKPI + 1,
            type: '5',
            name: name || '',
            staff: single || '0',
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            manager: member_manager || '0',
            followers: member_follow || '0',
            description: description || '',
            company_id: com_id,
            created_at: now,
            updated_at: now,
            is_last: 0,
        };

        let data = new KPI365_Kpi(data_insert_kpi);
        await data.save();

        //Cập nhật các KPI mục tiêu kết nối
        await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });

        //Thông báo
        let kpi_info = await functions_kpi.getInfoKPI(MaxIdKPI + 1, com_id).then((data) => data);
        let user_id = kpi_info.staffs.join(',');
        msg = 'Bạn đã được thêm vào KPI ' + kpi_info.name;
        let notification_data = {
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info.detail_url,
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        //Gửi tin nhắn vào chat 365 nếu là KPI cá nhân(4)
        let TypeSenderId = 1;
        let SenderId = com_id;
        let CompanyId = com_id;
        let Title = '';
        if (type == 1) {
            TypeSenderId = 1;
            SenderId = idQLC;
            CompanyId = idQLC;
            Title = 'Từ: Công ty ' + data_login.name;
        } else {
            TypeSenderId = 2;
            SenderId = idQLC;
            CompanyId = data_login.com_id;
            Title = 'Từ: ' + data_login.name;
        }
        let Message = 'Bạn đã được thêm vào KPI ' + name;
        let ListComReceive = [];
        let ListEpReceive = kpi_info['staffs'].map((item) => parseInt(item));
        let Link = `https://kpi.timviec365.vn${kpi_info['detail_url']}`;
        await functions_kpi.send_mess(
            SenderId,
            TypeSenderId,
            CompanyId,
            Title,
            Message,
            ListComReceive,
            ListEpReceive,
            Link
        );

        return functions.success(res, `Thêm mới KPI cá nhân thành công`, {
            data_insert_diary,
            data,
            notification_data,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addSingleKPICompany = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            target_connect,
            type_unit,
            year,
            unit_target,
            target2,
            percent,
            to_date,
            from_date,
            member_follow,
            description,
        } = req.body;
        let now = functions.getTimeNow();

        let unit_info = {};
        let msg = '';

        //Check viễn cảnh có phải là OKR hay không
        if (type_unit != 5) {
            unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Thêm KPI công ty ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Thêm KPI công ty : ' + target2;
            if (name == '') {
                name = target2;
            }
        }
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        //Thêm mới KPI
        let data_insert_kpi = {};

        data_insert_kpi = {
            id: MaxIdKPI + 1,
            type: '1',
            name: name || '',
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2) || '0',
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            target_year: parseInt(year) || new Date().getFullYear(),
            followers: member_follow || '0',
            description: description || '',
            company_id: com_id,
            created_at: now,
            updated_at: now,
            is_last: 0,
        };

        let data = new KPI365_Kpi(data_insert_kpi);
        await data.save();

        //Cập nhật các KPI mục tiêu kết nối
        if (target_connect && parseInt(target_connect) != 0)
            await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });

        //Thông báo
        let kpi_info = await functions_kpi.getInfoKPI(MaxIdKPI + 1, com_id).then((data) => data);
        let user_id = kpi_info.staffs.join(',');
        msg = 'Bạn đã được thêm vào KPI ' + kpi_info.name;
        let notification_data = {
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info.detail_url,
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        return functions.success(res, `Thêm mới KPI công ty thành công`, {
            data_insert_diary,
            data,
            notification_data,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addSingleKPINewGroup = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { name, target_connect, type_unit, unit_target, target2, percent, to_date, from_date, description } =
        req.body;
        let group_id = req.body.group_id; //Id chỉ dành riêng khi thêm KPI cho nhóm mới
        let now = functions.getTimeNow();

        if (group_id == undefined || group_id == null || group_id == '') {
            return functions.setError(res, 'Chưa điền group_id', 400);
        }
        const new_group = await KPI365_NewGroup.findOne({ id: parseInt(group_id) }).then((data) => data);
        if (new_group == null || new_group == undefined) {
            return functions.setError(res, 'Không tồn tại nhóm này', 400);
        }

        let unit_info = {};
        let msg = '';

        //Check viễn cảnh có phải là OKR hay không
        if (type_unit != 5) {
            unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);

            msg = 'Thêm KPI nhóm ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Thêm KPI nhóm : ' + target2;
            if (name == '') {
                name = target2;
            }
        }
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        //Thêm mới KPI
        let data_insert_kpi = {};

        data_insert_kpi = {
            id: MaxIdKPI + 1,
            type: '4',
            name: name || '',
            group_id: group_id,
            group_type: 1,
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            description: description || '',
            company_id: com_id,
            created_at: now,
            updated_at: now,
            is_last: 0,
        };

        let data = new KPI365_Kpi(data_insert_kpi);
        await data.save();

        //Cập nhật các KPI mục tiêu kết nối
        await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });

        //Thông báo
        let kpi_info = await functions_kpi.getInfoKPI(MaxIdKPI + 1, com_id).then((data) => data);
        let user_id = kpi_info.staffs.join(',');
        msg = 'Bạn đã được thêm vào KPI ' + kpi_info.name;
        let notification_data = {
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info.detail_url,
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        return functions.success(res, `Thêm mới KPI nhóm mới thành công`, {
            data_insert_diary,
            data,
            notification_data,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addSingleKPIOrganization = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            target_connect,
            type_unit,
            year,
            unit_target,
            target2,
            percent,
            to_date,
            from_date,
            description,
            level,
        } = req.body;
        let organization_id = req.body.organization_id;
        let now = functions.getTimeNow();

        if (organization_id == undefined || organization_id == null || organization_id == '') {
            return functions.setError(res, 'Chưa điền organization_id', 400);
        }
        const organization = await QLC_OrganizeDetail.findOne({ id: parseInt(organization_id), comId: com_id }).then(
            (data) => data
        );
        if (organization == null || organization == undefined) {
            return functions.setError(res, 'Không tồn tại tổ chức này', 400);
        }

        let unit_info = {};
        let msg = '';

        //Check viễn cảnh có phải là OKR hay không
        if (type_unit != 5) {
            unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);

            msg = 'Thêm KPI tổ chức ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Thêm KPI tổ chức : ' + target2;
            if (name == '') {
                name = target2;
            }
        }
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        //Thêm mới KPI
        let data_insert_kpi = {};
        data_insert_kpi = {
            id: MaxIdKPI + 1,
            type: '6',
            name: name || '',
            organization_id: parseInt(organization_id),
            level: parseInt(level),
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            description: description || '',
            company_id: com_id,
            created_at: now,
            updated_at: now,
            is_last: 0,
        };

        let data = new KPI365_Kpi(data_insert_kpi);
        await data.save();

        //Cập nhật các KPI mục tiêu kết nối
        if (target_connect && parseInt(target_connect) != 0)
            await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });

        //Thông báo
        let kpi_info = await functions_kpi.getInfoKPI(MaxIdKPI + 1, com_id).then((data) => data);
        let user_id = kpi_info.staffs.join(',');
        msg = 'Bạn đã được thêm vào KPI ' + kpi_info.name;
        let notification_data = {
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info.detail_url,
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        return functions.success(res, `Thêm mới KPI tổ chức thành công`, {
            data_insert_diary,
            data,
            notification_data,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editSingleKPIPersonal = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            single,
            type_unit,
            unit_target,
            target2,
            percent,
            to_date,
            from_date,
            member_manager,
            member_follow,
            description,
        } = req.body;
        let { id, target_connect } = req.body;

        let msg = '';
        let now = functions.getTimeNow();
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });

        //Check trường bắt buộc
        if (
            id == undefined ||
            id == null ||
            id == '' ||
            target_connect == undefined ||
            target_connect == null ||
            target_connect == ''
        ) {
            return functions.setError(res, 'Truyền thiếu trường', 400);
        }

        //Check KPI
        let kpi_personal = await KPI365_Kpi.findOne({ id: parseInt(id) }).then((data) => data);
        if (kpi_personal == null || kpi_personal == undefined) {
            return functions.setError(res, 'Không tìm thấy KPI', 400);
        }

        //Check mục tiêu kết nối
        let old_con_target = kpi_personal.conn_target;

        if (target_connect != undefined && parseInt(target_connect) != 0) {
            if (old_con_target != parseInt(target_connect)) {
                let count = await KPI365_Kpi.countDocuments({ conn_target: old_con_target, is_deleted: 0 });
                if (count <= 1) {
                    await KPI365_Kpi.updateMany({ id: old_con_target }, { is_last: 0 });
                }
            }
        }

        //Check viễn cảnh cập nhật
        if (type_unit != 5) {
            let unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Chỉnh sửa KPI cá nhân ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Chỉnh sửa KPI cá nhân : ' + target2;
            if (name == '') {
                name = target2;
            }
        }

        //Cập nhật
        await KPI365_Kpi.updateOne({ id: parseInt(id) }, {
            type: 5,
            name: name || '',
            staff: single || '0',
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            manager: member_manager || '0',
            followers: member_follow || '0',
            description: description || '',
            company_id: com_id,
            updated_at: now,
        });

        //Cập nhật mục tiêu mới nếu có
        if (target_connect != undefined && parseInt(target_connect) != 0) {
            await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });
        }

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Cập nhật KPI cá nhân thành công`, {
            data_insert_diary,
            data_insert_kpi: {
                id: parseInt(id),
                type: 5,
                name: name || '',
                staff: single || '0',
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                manager: member_manager || '0',
                followers: member_follow || '0',
                description: description || '',
                company_id: com_id,
                updated_at: now,
            },
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editSingleKPINewGroup = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { name, group_id, type_unit, unit_target, target2, percent, to_date, from_date, description } = req.body;
        let { id, target_connect } = req.body;

        let msg = '';
        let now = functions.getTimeNow();
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });

        //Check trường bắt buộc
        if (
            id == undefined ||
            id == null ||
            id == '' ||
            target_connect == undefined ||
            target_connect == null ||
            target_connect == '' ||
            group_id == undefined ||
            group_id == ''
        ) {
            return functions.setError(res, 'Truyền thiếu trường', 400);
        }

        //Check KPI
        let kpi_personal = await KPI365_Kpi.findOne({ id: parseInt(id) }).then((data) => data);
        if (kpi_personal == null || kpi_personal == undefined) {
            return functions.setError(res, 'Không tìm thấy KPI', 400);
        }

        //Check mục tiêu kết nối
        let old_con_target = kpi_personal.conn_target;

        if (target_connect != undefined && parseInt(target_connect) != 0) {
            if (old_con_target != parseInt(target_connect)) {
                let count = await KPI365_Kpi.countDocuments({ conn_target: old_con_target, is_deleted: 0 });
                if (count <= 1) {
                    await KPI365_Kpi.updateMany({ id: old_con_target }, { is_last: 0 });
                }
            }
        }

        //Check viễn cảnh cập nhật
        if (type_unit != 5) {
            let unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Chỉnh sửa KPI nhóm mới ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Chỉnh sửa KPI nhóm mới : ' + target2;
            if (name == '') {
                name = target2;
            }
        }

        //Cập nhật
        await KPI365_Kpi.updateOne({ id: parseInt(id) }, {
            type: 4,
            name: name || '',
            group_id: parseInt(group_id),
            group_type: 1,
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            description: description || '',
            company_id: com_id,
            updated_at: now,
        });

        //Cập nhật mục tiêu mới nếu có
        if (target_connect != undefined && parseInt(target_connect) != 0) {
            await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });
        }

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa KPI nhóm mới thành công`, {
            data_insert_diary,
            data_insert_kpi: {
                type: 4,
                name: name || '',
                group_id: parseInt(group_id),
                group_type: 1,
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                description: description || '',
                company_id: com_id,
                updated_at: now,
            },
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editSingleKPICompany = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            target_connect,
            type_unit,
            unit_target,
            member_follow,
            target2,
            percent,
            to_date,
            from_date,
            year,
            description,
        } = req.body;
        let { id } = req.body;

        let msg = '';
        let now = functions.getTimeNow();
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });

        //Check trường bắt buộc
        if (id == undefined || id == null || id == '') {
            return functions.setError(res, 'Truyền thiếu trường', 400);
        }

        //Check KPI
        let kpi_personal = await KPI365_Kpi.findOne({ id: parseInt(id) }).then((data) => data);
        if (kpi_personal == null || kpi_personal == undefined) {
            return functions.setError(res, 'Không tìm thấy KPI', 400);
        }

        //Check mục tiêu kết nối
        let old_con_target = kpi_personal.conn_target;

        if (target_connect != undefined && parseInt(target_connect) != 0) {
            if (old_con_target != parseInt(target_connect)) {
                let count = await KPI365_Kpi.countDocuments({ conn_target: old_con_target, is_deleted: 0 });
                if (count <= 1) {
                    await KPI365_Kpi.updateMany({ id: old_con_target }, { is_last: 0 });
                }
            }
        }

        //Check viễn cảnh cập nhật
        if (type_unit != 5) {
            let unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Chỉnh sửa KPI công ty ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Chỉnh sửa KPI công ty : ' + target2;
            if (name == '') {
                name = target2;
            }
        }

        //Cập nhật
        await KPI365_Kpi.updateOne({ id: parseInt(id) }, {
            type: 1,
            name: name || '',
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            target_year: parseInt(year) || new Date().getFullYear(),
            description: description || '',
            followers: member_follow || '0',
            company_id: com_id,
            updated_at: now,
        });

        //Cập nhật mục tiêu mới nếu có
        if (target_connect != undefined && parseInt(target_connect) != 0) {
            await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });
        }

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa KPI công ty thành công`, {
            data_insert_diary,
            data_insert_kpi: {
                id: parseInt(id),
                type: 1,
                name: name || '',
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                target_year: parseInt(year) || new Date().getFullYear(),
                description: description || '',
                followers: member_follow || '0',
                company_id: com_id,
                updated_at: now,
            },
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editSingleKPIOrganization = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { name, target_connect, type_unit, year, unit_target, target2, percent, to_date, from_date, description } =
        req.body;
        let { id } = req.body;

        let msg = '';
        let now = functions.getTimeNow();
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });

        //Check trường bắt buộc
        if (id == undefined || id == null || id == '') {
            return functions.setError(res, 'Truyền thiếu trường', 400);
        }

        //Check KPI
        let kpi_personal = await KPI365_Kpi.findOne({ id: parseInt(id) }).then((data) => data);
        if (kpi_personal == null || kpi_personal == undefined) {
            return functions.setError(res, 'Không tìm thấy KPI', 400);
        }

        //Check mục tiêu kết nối
        let old_con_target = kpi_personal.conn_target;

        if (target_connect != undefined && parseInt(target_connect) != 0) {
            if (old_con_target != parseInt(target_connect)) {
                let count = await KPI365_Kpi.countDocuments({ conn_target: old_con_target, is_deleted: 0 });
                if (count <= 1) {
                    await KPI365_Kpi.updateMany({ id: old_con_target }, { is_last: 0 });
                }
            }
        }

        //Check viễn cảnh cập nhật
        if (type_unit != 5) {
            let unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Chỉnh sửa KPI tổ chức ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Chỉnh sửa KPI tổ chức : ' + target2;
            if (name == '') {
                name = target2;
            }
        }

        //Cập nhật
        await KPI365_Kpi.updateOne({ id: parseInt(id) }, {
            type: 6,
            name: name || '',
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            target_year: parseInt(year) || new Date().getFullYear(),
            description: description || '',
            company_id: com_id,
            updated_at: now,
        });

        //Cập nhật mục tiêu mới nếu có
        if (target_connect != undefined && parseInt(target_connect) != 0) {
            await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });
        }

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa KPI tổ chức thành công`, {
            data_insert_diary,
            data_insert_kpi: {
                id: parseInt(id),
                type: 6,
                name: name || '',
                type_unit: type_unit,
                unit_id: parseInt(unit_target),
                target: target2,
                percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                    (percent = parseInt(percent, 10)) :
                    parseFloat(percent).toFixed(2),
                conn_target: parseInt(target_connect) || 0,
                start_day: parseInt(from_date),
                end_date: parseInt(to_date) + 86399,
                target_year: parseInt(year) || new Date().getFullYear(),
                description: description || '',
                company_id: com_id,
                updated_at: now,
            },
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.copySingleKPI = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { id, from_date, to_date, percent } = req.body;
        let conn_target = req.body.conn_target || 0;
        let now = functions.getTimeNow();
        let { MaxIdKPI } = await functions_kpi.getMaxId().then((data) => {
            return { MaxIdKPI: data.MaxIdKPI };
        });

        //Check trường bắt buộc
        if (
            id == undefined ||
            id == '' ||
            from_date == undefined ||
            from_date == '' ||
            to_date == undefined ||
            to_date == ''
        ) {
            return functions.setError(res, 'Truyền thiếu trường id, from_date, to_date', 400);
        }

        //Check result KPI
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id) }).then((data) => data);
        if (info_kpi == null || info_kpi == undefined) {
            return functions.setError(res, 'Không tìm thấy KPI', 400);
        }

        //Tạo mới KPI đa mục tiêu cha
        let new_kpi = new KPI365_Kpi({
            id: MaxIdKPI + 1,
            name: info_kpi.name,
            type: info_kpi.type,
            type_unit: info_kpi.type_unit,
            unit_id: info_kpi.unit_id,
            target: info_kpi.target,
            percent: percent,
            conn_target: parseInt(conn_target) || 0,
            created_at: now,
            updated_at: now,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            description: info_kpi.description,
            target_year: info_kpi.target_year,
            department_id: info_kpi.department_id,
            nest_id: info_kpi.nest_id,
            group_id: info_kpi.group_id,
            organization_id: info_kpi.organization_id,
            level: info_kpi.level,
            staff: info_kpi.staff,
            manager: info_kpi.manager,
            followers: info_kpi.followers,
            company_id: info_kpi.company_id,
            is_deleted: info_kpi.is_deleted,
            is_last: info_kpi.is_last,
            group_type: info_kpi.group_type,
            type_target: info_kpi.type_target,
            precent_target: info_kpi.precent_target,
            calculate: info_kpi.calculate,
            target_id: info_kpi.target_id,
            is_parent_deleted: info_kpi.is_parent_deleted,
            formula: info_kpi.formula,
        });
        await new_kpi.save();

        //Check nếu có mục tiêu kết nối thì update cho mục tiêu kết nối
        if (conn_target != undefined && conn_target != '' && parseInt(conn_target) != 0) {
            await KPI365_Kpi.updateOne({ id: parseInt(conn_target) }, { is_last: 1 });
        }

        //Check nếu là KPI đơn mục tiêu cha thì tạo các bản sao của KPI đơn mục tiêu con
        if (info_kpi.is_last == 1) {
            //Dùng hàm đệ quy tạo các bản sao của KPI đơn mục tiêu con
            await functions_kpi_kpi.recursion_copy(id, MaxIdKPI + 1, from_date, to_date, now);
        }

        return functions.success(res, `Sao chép KPI đơn mục tiêu thành công`, {
            new_kpi,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.listSingleKPI = async(req, res) => {
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
            company_id: com_id,
        };
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
            condition['$or'] = [
                { type: '1' },
                {
                    manager: { $regex: new RegExp(staff_id.toString(), 'i') },
                },
                {
                    followers: { $regex: new RegExp(staff_id.toString(), 'i') },
                },
                {
                    staff: { $regex: new RegExp(staff_id.toString(), 'i') },
                },
            ];

            let organization_id = await Users.findOne({
                    idQLC: parseInt(staff_id),
                    'inForPerson.employee.com_id': com_id,
                })
                .then((data) => data.inForPerson.employee.organizeDetailId)
                .catch((error) => 0);
            if (organization_id != 0) {
                condition['$or'].push({ organization_id: organization_id });
            }

            let group_id = await KPI365_NewGroup.find({
                    com_id: com_id,
                    staff_id: { $regex: new RegExp(staff_id.toString(), 'i') },
                })
                .then((data) => data.map((item) => item.id))
                .catch((error) => 0);

            if (group_id != 0) {
                condition['$or'].push({
                    $and: [{ group_id: { $in: group_id } }, { group_type: 1 }],
                });
            }
        }
        if (kpi_id) {
            condition.id = parseInt(kpi_id);
        }
        const count = await KPI365_Kpi.countDocuments(condition);
        let data_kpi_single = await KPI365_Kpi.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: 'KPI365_TargetUnit',
                    localField: 'unit_id',
                    foreignField: 'id',
                    as: 'target_unit',
                },
            },
            {
                $unwind: { path: '$target_unit', preserveNullAndEmptyArrays: true },
            },
            {
                $skip: skip,
            },
            {
                $limit: pageSize,
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
                    unit: '$target_unit.unit',
                    target_name: '$target_unit.name',
                },
            },
        ]);

        let list_kpi_single = [];
        for (let i = 0; i < data_kpi_single.length; i++) {
            let item = data_kpi_single[i];
            let type_unit = item.type_unit;

            //Xử lý kết quả KPI, loại KPI, kết quả KPI
            item.result =
                type_unit == '5' ? '' : (await functions_kpi_kpi.sumKPIResult(parseInt(item.id))) + ' ' + item.unit;
            item.process = await functions_kpi_kpi
                .process(item.id, item.is_last, com_id)
                .then((data) => data.toFixed(1));
            if (parseInt(item.process) == parseFloat(item.process)) item.process = parseInt(item.process);

            //Xử lý điểm, xu hướng, thưởng
            let scores = 0;
            let trend = 0; // 0.Không đạt, 1.Đạt
            let time = 1; // 0.Quá hạn, 1.Trong thời gian được cài đặt

            if (now > item.end_date && parseFloat(item.process) < 100) {
                //quá hạn
                time = 0;
            }

            let configAssess = await KPI365_ConfigAssess.findOne({
                start: { $lte: parseFloat(item.process) },
                end: { $gte: parseFloat(item.process) },
                time: time,
                com_id: com_id,
            }).sort({ scores: -1 });
            if (configAssess != null) {
                scores = configAssess.scores;
                trend = configAssess.trend;
                item.scores = scores + ' điểm';
                item.trend = trend == 0 ? 'Không đạt' : trend == 1 ? 'Đạt' : 'Chưa cập nhật';
            } else {
                item.scores = 'Chưa thiết lập';
                item.trend = 'Chưa thiết lập';
            }

            let condition = await KPI365_Bonus.findOne({ kpi_id: parseInt(item.id), is_deleted: 0 })
                .then((data) => data.condition)
                .catch((error) => 0);
            if (condition == 0) {
                item.bonus = 'Chưa có thưởng';
            }

            if (condition == 1) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [{
                            $and: [
                                { start: { $lte: parseFloat(item.process) } },
                                { end: { $gte: parseFloat(item.process) } },
                            ],
                        },
                        {
                            end: { $lt: parseFloat(item.process) },
                        },
                    ],
                };
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then((data) => data.value)
                    .catch((error) => 0);
                if (valueBonus !== null) {
                    item.bonus = valueBonus + ' VNĐ';
                } else {
                    item.bonus = 'Chưa có thưởng';
                }
            }
            if (condition == 2) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [{
                            $and: [{ start: { $lte: parseFloat(scores) } }, { end: { $gte: parseFloat(scores) } }],
                        },
                        {
                            end: { $lt: parseFloat(scores) },
                        },
                    ],
                };
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then((data) => data.value)
                    .catch((error) => 0);
                if (valueBonus !== null) {
                    item.bonus = valueBonus + ' VNĐ';
                } else {
                    item.bonus = 'Chưa có thưởng';
                }
            }

            //Xử lý link và id người quản lý, theo dõi + tên kpi <chỉ nhóm hoặc tổ chức mới phải xử lý tên>
            if (item.type == '5') {
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatSingleOkrKPI(item.id) :
                    functions_kpi.capNhatSingleKPI(item.id);
                item.detail_kpi_url = functions_kpi.detailSingleKPI(item.id);
            } else if (item.type == '4') {
                await KPI365_NewGroup.findOne({ id: item.group_id, com_id: com_id })
                    .sort({ id: -1 })
                    .then((data) => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                        item.name = data.group_name + ' - ' + item.name;
                    })
                    .catch((error) => {
                        item.manager = '0';
                        item.followers = '0';
                    });
                item.detail_kpi_url = functions_kpi.detailGroupKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatGroupOkrKPI(item.id) :
                    functions_kpi.capNhatGroupKPI(item.id);
            } else if (item.type == '6') {
                await KPI365_Organization.findOne({ organization_id: item.organization_id, com_id: com_id })
                    .sort({ id: -1 })
                    .then((data) => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                    })
                    .catch((error) => {
                        item.manager = '0';
                        item.followers = '0';
                    });
                await QLC_OrganizeDetail.findOne({ id: item.organization_id, comId: com_id })
                    .then((data) => {
                        item.name = data.organizeDetailName + ' - ' + item.name;
                    })
                    .catch((error) => console.log('Lỗi khi lấy danh sách KPI đơn mục tiêu - tổ chức'));
                item.detail_kpi_url = functions_kpi.detailSingleKPIOrganization(item.id);
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatSingleOkrKPIOrganization(item.id) :
                    functions_kpi.capNhatSingleKPIOrganization(item.id);
            } else if (item.type == '1') {
                item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ? functions_kpi.capNhatComOkrKPI(item.id) : functions_kpi.capNhatComKPI(item.id);
            }

            //Xử lý tên quản lý, người theo dõi, nhân viên, thời gian thực hiện
            if (item.manager != '') {
                item.manager = item.manager.split(',').map((data) => parseInt(data));
                item.manager = await Users.find({
                        idQLC: { $in: item.manager },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            if (item.followers != '') {
                item.followers = item.followers.split(',').map((data) => parseInt(data));
                item.followers = await Users.find({
                    idQLC: { $in: item.followers },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((data) => data.userName).join(','));
            }

            if (item.type != '5') {
                item.staff = 'Toàn bộ nhân viên';
            }

            if (item.type == '5') {
                let staff_id = item.staff.split(',');
                staff_id = staff_id.map((data) => parseInt(data));
                item.staff = await Users.find({
                        idQLC: { $in: staff_id },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            item.process = item.process + '%';
            item.percent = item.percent + '%';
            item.type_kpi =
                type_unit == '5' ?
                'OKR' :
                item.target_name +
                ' - ' +
                (type_unit == '1' ?
                    'Tài chính' :
                    type_unit == '2' ?
                    'Khách hàng' :
                    type_unit == '3' ?
                    'Quy trình nội bộ' :
                    'Học hỏi phát triển');
            if (item.conn_target != 0)
                item.name_parent = await functions_kpi_kpi.nameKPISingle(item.conn_target, com_id);
            else item.name_parent = '';
            item.execution_time =
                functions_kpi.getDate(item.start_day * 1000) + ' - ' + functions_kpi.getDate(item.end_date * 1000);

            //Xóa các trường không dùng tới
            delete item.is_last;
            delete item.target_name;
            delete item.unit;
            delete item.unit_id;
            delete item.manager_id;
            delete item.followers_id;
            delete item.group_id;
            delete item.organization_id;
            delete item.start_day;
            delete item.end_date;
            delete item.type_unit;
            delete item.target;
            delete item.conn_target;

            list_kpi_single.push(item);
        }

        return functions.success(res, `Danh sách KPI đơn mục tiêu thành công`, {
            list_kpi_single,
            count,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.detailSingleKPIPersonal = async(req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        let kpi_id = parseInt(req.body.kpi_id) || 0;
        let now = functions.getTimeNow();

        if (kpi_id == 0) return functions.setError(res, 'Chưa truyền kpi_id hoặc truyền sai định dạng kpi', 400);

        let info = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 0 });
        if (info == null) return functions.setError(res, 'Không tồn tại KPI đơn mục tiêu này', 400);

        let condition = {
            is_deleted: 0,
            type_target: 0,
            company_id: com_id,
            id: kpi_id,
        };

        let data_kpi_single = await KPI365_Kpi.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: 'KPI365_TargetUnit',
                    localField: 'unit_id',
                    foreignField: 'id',
                    as: 'target_unit',
                },
            },
            {
                $unwind: { path: '$target_unit', preserveNullAndEmptyArrays: true },
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
                    unit: '$target_unit.unit',
                    target_name: '$target_unit.name',
                },
            },
        ]);

        let detail_kpi_single = [];
        for (let i = 0; i < data_kpi_single.length; i++) {
            let item = data_kpi_single[i];
            let type_unit = item.type_unit;

            //Xử lý kết quả KPI, loại KPI, kết quả KPI
            item.result =
                type_unit == '5' ? '' : (await functions_kpi_kpi.sumKPIResult(parseInt(item.id))) + ' ' + item.unit;
            item.process = await functions_kpi_kpi
                .process(item.id, item.is_last, com_id)
                .then((data) => data.toFixed(1));
            if (parseInt(item.process) == parseFloat(item.process)) item.process = parseInt(item.process);

            //Xử lý điểm, xu hướng, thưởng
            let scores = 0;
            let trend = 0; // 0.Không đạt, 1.Đạt
            let time = 1; // 0.Quá hạn, 1.Trong thời gian được cài đặt

            if (now > item.end_date && parseFloat(item.process) < 100) {
                //quá hạn
                time = 0;
            }

            let configAssess = await KPI365_ConfigAssess.findOne({
                start: { $lte: parseFloat(item.process) },
                end: { $gte: parseFloat(item.process) },
                time: time,
                com_id: com_id,
            }).sort({ scores: -1 });
            if (configAssess != null) {
                scores = configAssess.scores;
                trend = configAssess.trend;
                item.scores = scores + ' điểm';
                item.trend = trend == 0 ? 'Không đạt' : trend == 1 ? 'Đạt' : 'Chưa cập nhật';
            } else {
                item.scores = 'Chưa thiết lập';
                item.trend = 'Chưa thiết lập';
            }

            let condition = await KPI365_Bonus.findOne({ kpi_id: parseInt(item.id), is_deleted: 0 })
                .then((data) => data.condition)
                .catch((error) => 0);
            if (condition == 0) {
                item.bonus = 'Chưa có thưởng';
            }

            if (condition == 1) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [{
                            $and: [
                                { start: { $lte: parseFloat(item.process) } },
                                { end: { $gte: parseFloat(item.process) } },
                            ],
                        },
                        {
                            end: { $lt: parseFloat(item.process) },
                        },
                    ],
                };
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then((data) => data.value)
                    .catch((error) => 0);
                if (valueBonus !== null) {
                    item.bonus = valueBonus + ' VNĐ';
                } else {
                    item.bonus = 'Chưa có thưởng';
                }
            }
            if (condition == 2) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [{
                            $and: [{ start: { $lte: parseFloat(scores) } }, { end: { $gte: parseFloat(scores) } }],
                        },
                        {
                            end: { $lt: parseFloat(scores) },
                        },
                    ],
                };
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then((data) => data.value)
                    .catch((error) => 0);
                if (valueBonus !== null) {
                    item.bonus = valueBonus + ' VNĐ';
                } else {
                    item.bonus = 'Chưa có thưởng';
                }
            }

            //Xử lý link và id người quản lý, theo dõi + tên kpi <chỉ nhóm hoặc tổ chức mới phải xử lý tên>
            if (item.type == '5') {
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatSingleOkrKPI(item.id) :
                    functions_kpi.capNhatSingleKPI(item.id);
                item.detail_kpi_url = functions_kpi.detailSingleKPI(item.id);
            } else if (item.type == '4') {
                await KPI365_NewGroup.findOne({ id: item.group_id, com_id: com_id })
                    .sort({ id: -1 })
                    .then((data) => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                        item.name = data.group_name + ' - ' + item.name;
                    })
                    .catch((error) => {
                        item.manager = '0';
                        item.followers = '0';
                    });
                item.detail_kpi_url = functions_kpi.detailGroupKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatGroupOkrKPI(item.id) :
                    functions_kpi.capNhatGroupKPI(item.id);
            } else if (item.type == '6') {
                await KPI365_Organization.findOne({ organization_id: item.organization_id, com_id: com_id })
                    .sort({ id: -1 })
                    .then((data) => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                    })
                    .catch((error) => {
                        item.manager = '0';
                        item.followers = '0';
                    });
                await QLC_OrganizeDetail.findOne({ id: item.organization_id, comId: com_id })
                    .then((data) => {
                        item.name = data.organizeDetailName + ' - ' + item.name;
                    })
                    .catch((error) => console.log('Lỗi khi lấy danh sách KPI đơn mục tiêu - tổ chức'));
                item.detail_kpi_url = functions_kpi.detailSingleKPIOrganization(item.id);
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatSingleOkrKPIOrganization(item.id) :
                    functions_kpi.capNhatSingleKPIOrganization(item.id);
            } else if (item.type == '1') {
                item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ? functions_kpi.capNhatComOkrKPI(item.id) : functions_kpi.capNhatComKPI(item.id);
            }

            //Xử lý tên quản lý, người theo dõi, nhân viên, thời gian thực hiện
            if (item.manager != '') {
                item.manager = item.manager.split(',').map((data) => parseInt(data));
                item.manager = await Users.find({
                        idQLC: { $in: item.manager },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            if (item.followers != '') {
                item.followers = item.followers.split(',').map((data) => parseInt(data));
                item.followers = await Users.find({
                    idQLC: { $in: item.followers },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((followers) => data.userName).join(','));
            }

            if (item.type != '5') {
                item.staff = 'Toàn bộ nhân viên';
            }

            if (item.type == '5') {
                let staff_id = item.staff.split(',');
                staff_id = staff_id.map((data) => parseInt(data));
                item.staff = await Users.find({
                        idQLC: { $in: staff_id },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            item.process = item.process + '%';
            item.percent = item.percent + '%';

            item.type_kpi = type_unit == '5' ? 'OKR' : item.target_name + ': ' + item.target + ' ' + item.unit;

            if (item.conn_target != 0)
                item.name_parent = await functions_kpi_kpi.nameKPISingle(item.conn_target, com_id);
            else item.name_parent = '';

            item.type = 'Cá nhân';
            item.execution_time =
                functions_kpi.getDate(item.start_day * 1000) + ' - ' + functions_kpi.getDate(item.end_date * 1000);

            //Xóa các trường không dùng tới
            delete item.is_last;
            delete item.target_name;
            delete item.unit_id;
            delete item.manager_id;
            delete item.followers_id;
            delete item.group_id;
            delete item.organization_id;
            delete item.start_day;
            delete item.end_date;
            delete item.type_unit;
            delete item.conn_target;
            delete item.target;

            detail_kpi_single.push(item);
        }

        let list_result = await KPI365_Result.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: {
                    kpi_id: kpi_id,
                },
            },
            {
                $addFields: {
                    staff_id: { $toInt: '$staff_id' },
                },
            },
            {
                $addFields: {
                    result: { $toInt: '$result' },
                },
            },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'staff_id',
                    foreignField: 'idQLC',
                    as: 'users',
                },
            },
            {
                $unwind: { path: '$Users', preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: '$staff_id',
                    total_result: { $sum: '$result' },
                    userName: { $push: '$users.userName' },
                },
            },
            {
                $project: {
                    _id: 0,
                    total_result: 1,
                    userName: { $arrayElemAt: ['$userName', 0] },
                },
            },
        ]);

        return functions.success(res, `Lấy chi tiết KPI đơn mục tiêu cá nhân thành công`, {
            detail_kpi_single,
            list_result,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.detailSingleKPICompany = async(req, res) => {
    try {
        const { type, idQLC, com_id } = req.user.data;
        let kpi_id = parseInt(req.body.kpi_id) || 0;
        let now = functions.getTimeNow();

        if (kpi_id == 0) return functions.setError(res, 'Chưa truyền kpi_id hoặc truyền sai định dạng kpi', 400);

        let info = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 0 });
        if (info == null) return functions.setError(res, 'Không tồn tại KPI đơn mục tiêu này', 400);

        let condition = {
            is_deleted: 0,
            type_target: 0,
            company_id: com_id,
            conn_target: kpi_id,
        };

        //Xử lý KPI công ty
        let data_kpi_com = await KPI365_Kpi.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: 'KPI365_TargetUnit',
                    localField: 'unit_id',
                    foreignField: 'id',
                    as: 'target_unit',
                },
            },
            {
                $unwind: { path: '$target_unit', preserveNullAndEmptyArrays: true },
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
                    unit: '$target_unit.unit',
                    target_name: '$target_unit.name',
                },
            },
        ]);
        let detail_kpi_com = [];
        for (let i = 0; i < data_kpi_com.length; i++) {
            let item = data_kpi_com[i];
            let type_unit = item.type_unit;

            //Xử lý kết quả KPI, loại KPI, kết quả KPI
            item.result =
                type_unit == '5' ? '' : (await functions_kpi_kpi.sumKPIResult(parseInt(item.id))) + ' ' + item.unit;
            item.process = await functions_kpi_kpi
                .process(item.id, item.is_last, com_id)
                .then((data) => data.toFixed(1));
            if (parseInt(item.process) == parseFloat(item.process)) item.process = parseInt(item.process);

            //Xử lý điểm, xu hướng, thưởng
            let scores = 0;
            let trend = 0; // 0.Không đạt, 1.Đạt
            let time = 1; // 0.Quá hạn, 1.Trong thời gian được cài đặt

            if (now > item.end_date && parseFloat(item.process) < 100) {
                //quá hạn
                time = 0;
            }

            let configAssess = await KPI365_ConfigAssess.findOne({
                start: { $lte: parseFloat(item.process) },
                end: { $gte: parseFloat(item.process) },
                time: time,
                com_id: com_id,
            }).sort({ scores: -1 });
            if (configAssess != null) {
                scores = configAssess.scores;
                trend = configAssess.trend;
                item.scores = scores + ' điểm';
                item.trend = trend == 0 ? 'Không đạt' : trend == 1 ? 'Đạt' : 'Chưa cập nhật';
            } else {
                item.scores = 'Chưa thiết lập';
                item.trend = 'Chưa thiết lập';
            }

            let condition = await KPI365_Bonus.findOne({ kpi_id: parseInt(item.id), is_deleted: 0 })
                .then((data) => data.condition)
                .catch((error) => 0);
            if (condition == 0) {
                item.bonus = 'Chưa có thưởng';
            }

            if (condition == 1) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [{
                            $and: [
                                { start: { $lte: parseFloat(item.process) } },
                                { end: { $gte: parseFloat(item.process) } },
                            ],
                        },
                        {
                            end: { $lt: parseFloat(item.process) },
                        },
                    ],
                };
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then((data) => data.value)
                    .catch((error) => 0);
                if (valueBonus !== null) {
                    item.bonus = valueBonus + ' VNĐ';
                } else {
                    item.bonus = 'Chưa có thưởng';
                }
            }
            if (condition == 2) {
                let condition_1 = {
                    is_deleted: 0,
                    kpi_id: parseInt(item.id),
                    $or: [{
                            $and: [{ start: { $lte: parseFloat(scores) } }, { end: { $gte: parseFloat(scores) } }],
                        },
                        {
                            end: { $lt: parseFloat(scores) },
                        },
                    ],
                };
                let valueBonus = await KPI365_Bonus.findOne(condition_1)
                    .then((data) => data.value)
                    .catch((error) => 0);
                if (valueBonus !== null) {
                    item.bonus = valueBonus + ' VNĐ';
                } else {
                    item.bonus = 'Chưa có thưởng';
                }
            }

            //Xử lý link và id người quản lý, theo dõi + tên kpi <chỉ nhóm hoặc tổ chức mới phải xử lý tên>
            if (item.type == '1') {
                item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ? functions_kpi.capNhatComOkrKPI(item.id) : functions_kpi.capNhatComKPI(item.id);
            }

            //Xử lý tên quản lý, người theo dõi, nhân viên, thời gian thực hiện
            if (item.manager != '') {
                item.manager = item.manager.split(',').map((data) => parseInt(data));
                item.manager = await Users.find({
                        idQLC: { $in: item.manager },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            if (item.followers != '') {
                item.followers = item.followers.split(',').map((data) => parseInt(data));
                item.followers = await Users.find({
                    idQLC: { $in: item.followers },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((followers) => data.userName).join(','));
            }

            if (item.type != '5') {
                item.staff = 'Toàn bộ nhân viên';
            }

            if (item.type == '5') {
                let staff_id = item.staff.split(',');
                staff_id = staff_id.map((data) => parseInt(data));
                item.staff = await Users.find({
                        idQLC: { $in: staff_id },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            item.process = item.process + '%';
            item.percent = item.percent + '%';

            item.type_kpi = type_unit == '5' ? 'OKR' : item.target_name + ': ' + item.target + ' ' + item.unit;

            if (item.conn_target != 0)
                item.name_parent = await functions_kpi_kpi.nameKPISingle(item.conn_target, com_id);
            else item.name_parent = '';

            item.type = 'Cá nhân';
            item.execution_time =
                functions_kpi.getDate(item.start_day * 1000) + ' - ' + functions_kpi.getDate(item.end_date * 1000);

            //Xóa các trường không dùng tới
            delete item.is_last;
            delete item.target_name;
            delete item.unit_id;
            delete item.manager_id;
            delete item.followers_id;
            delete item.group_id;
            delete item.organization_id;
            delete item.start_day;
            delete item.end_date;
            delete item.type_unit;
            delete item.conn_target;
            delete item.target;

            detail_kpi_com.push(item);
        }

        //Xử lý KPI kết quả của KPI công ty
        let list_result_personal = await KPI365_Result.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: {
                    kpi_id: kpi_id,
                },
            },
            {
                $addFields: {
                    staff_id: { $toInt: '$staff_id' },
                },
            },
            {
                $addFields: {
                    result: { $toInt: '$result' },
                },
            },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'staff_id',
                    foreignField: 'idQLC',
                    as: 'users',
                },
            },
            {
                $unwind: { path: '$Users', preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: '$staff_id',
                    total_result: { $sum: '$result' },
                    userName: { $push: '$users.userName' },
                },
            },
            {
                $project: {
                    _id: 0,
                    total_result: 1,
                    userName: { $arrayElemAt: ['$userName', 0] },
                },
            },
        ]);

        //Xử lý danh sách KPI con của KPI công ty
        let data_result_child = await KPI365_Kpi.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: 'KPI365_TargetUnit',
                    localField: 'unit_id',
                    foreignField: 'id',
                    as: 'target_unit',
                },
            },
            {
                $unwind: { path: '$target_unit', preserveNullAndEmptyArrays: true },
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
                    unit: '$target_unit.unit',
                    target_name: '$target_unit.name',
                },
            },
        ]);
        let list_result_child = [];
        for (let i = 0; i < data_result_child.length; i++) {
            let item = data_result_child[i];
            let type_unit = item.type_unit;

            //Xử lý kết quả KPI, loại KPI, kết quả KPI
            item.result =
                type_unit == '5' ? '' : (await functions_kpi_kpi.sumKPIResult(parseInt(item.id))) + ' ' + item.unit;
            item.process = await functions_kpi_kpi
                .process(item.id, item.is_last, com_id)
                .then((data) => data.toFixed(1));
            if (parseInt(item.process) == parseFloat(item.process)) item.process = parseInt(item.process);

            //Xử lý link và id người quản lý, theo dõi + tên kpi <chỉ nhóm hoặc tổ chức mới phải xử lý tên>
            if (item.type == '5') {
                let staff_id = item.staff.split(',');
                staff_id = staff_id.map((data) => parseInt(data));
                item.staff = await Users.find({
                    idQLC: { $in: staff_id },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((item) => item.userName));
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatSingleOkrKPI(item.id) :
                    functions_kpi.capNhatSingleKPI(item.id);
                item.detail_kpi_url = functions_kpi.detailSingleKPI(item.id);
            } else if (item.type == '4') {
                let staff_id = '';
                await KPI365_NewGroup.findOne({ id: item.group_id, com_id: com_id })
                    .sort({ id: -1 })
                    .then((data) => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                        item.name = data.group_name + ' - ' + item.name;
                        staff_id = data.staff_id.split(',');
                        staff_id = staff_id.map((data) => parseInt(data));
                    })
                    .catch((error) => {
                        item.manager = '0';
                        item.followers = '0';
                        item.staff = '0';
                    });
                item.staff = await Users.find({
                    idQLC: { $in: staff_id },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((item) => item.userName));
                item.detail_kpi_url = functions_kpi.detailGroupKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatGroupOkrKPI(item.id) :
                    functions_kpi.capNhatGroupKPI(item.id);
            } else if (item.type == '6') {
                await KPI365_Organization.findOne({ organization_id: item.organization_id, com_id: com_id })
                    .sort({ id: -1 })
                    .then((data) => {
                        item.manager = data.manage_id;
                        item.followers = data.followers_id;
                    })
                    .catch((error) => {
                        item.manager = '0';
                        item.followers = '0';
                    });
                await QLC_OrganizeDetail.findOne({ id: item.organization_id, comId: com_id })
                    .then((data) => {
                        item.name = data.organizeDetailName + ': ' + item.name;
                    })
                    .catch((error) => console.log('Lỗi khi lấy danh sách KPI đơn mục tiêu - tổ chức'));
                let organization_info = await QLC_OrganizeDetail.findOne({
                    id: parseInt(item.organization_id),
                    comId: com_id,
                }).then((data) => data);
                let conditions = {
                    'inForPerson.employee.listOrganizeDetailId': { $all: organization_info.listOrganizeDetailId },
                    'inForPerson.employee.com_id': com_id,
                };
                item.staff = await Users.aggregate([{
                        $match: conditions,
                    },
                    {
                        $project: {
                            _id: 0,
                            userName: '$userName',
                        },
                    },
                ]).then((data) => data.map((item) => item.userName));
                item.detail_kpi_url = functions_kpi.detailSingleKPIOrganization(item.id);
                item.update_result_url =
                    type_unit == '5' ?
                    functions_kpi.capNhatSingleOkrKPIOrganization(item.id) :
                    functions_kpi.capNhatSingleKPIOrganization(item.id);
            } else if (item.type == '1') {
                let organization_info = await QLC_OrganizeDetail.find({ level: 1, comId: com_id }).then((data) => data);
                let conditions = {
                    'inForPerson.employee.com_id': com_id,
                };
                let match = [];
                for (let i = 0; i < organization_info.length; i++) {
                    let listOrganizeDetailId = organization_info[i].listOrganizeDetailId;
                    match.push({ 'inForPerson.employee.listOrganizeDetailId': { $all: listOrganizeDetailId } });
                }
                conditions['$or'] = match;
                item.staff = await Users.aggregate([{
                        $match: conditions,
                    },
                    {
                        $project: {
                            _id: 0,
                            userName: '$userName',
                        },
                    },
                ]).then((data) => data.map((item) => item.userName));
                item.detail_kpi_url = functions_kpi.detailComKPI(item.id);
                item.update_result_url =
                    type_unit == '5' ? functions_kpi.capNhatComOkrKPI(item.id) : functions_kpi.capNhatComKPI(item.id);
            }

            //Xử lý tên quản lý, người theo dõi, nhân viên, thời gian thực hiện
            if (item.manager != '') {
                item.manager = item.manager.split(',').map((data) => parseInt(data));
                item.manager = await Users.find({
                        idQLC: { $in: item.manager },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((item) => item.userName))
                    .catch((error) => '');
            }

            if (item.followers != '') {
                item.followers = item.followers.split(',').map((data) => parseInt(data));
                item.followers = await Users.find({
                    idQLC: { $in: item.followers },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((item) => item.userName));
            }

            item.process = item.process + '%';
            item.percent = item.percent + '%';

            item.execution_time =
                functions_kpi.getDate(item.start_day * 1000) + ' - ' + functions_kpi.getDate(item.end_date * 1000);

            //Xóa các trường không dùng tới
            delete item.is_last;
            delete item.target_name;
            delete item.unit_id;
            delete item.group_id;
            delete item.organization_id;
            delete item.start_day;
            delete item.end_date;
            delete item.type_unit;
            delete item.conn_target;
            delete item.target;
            delete item._id;
            delete item.formula;
            delete item.is_parent_deleted;
            delete item.target_id;
            delete item.calculate;
            delete item.precent_target;
            delete item.type_target;
            delete item.group_type;
            delete item.is_last;
            delete item.is_deleted;
            delete item.level;

            list_result_child.push(item);
        }

        return functions.success(res, `Lấy chi tiết KPI đơn mục tiêu công ty thành công`, {
            detail_kpi_com,
            list_result_child,
            list_result_personal,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.assignSingleKPI = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let {
            name,
            single,
            target_connect,
            type_unit,
            unit_target,
            target2,
            percent,
            to_date,
            from_date,
            member_follow,
            member_manager,
            description,
        } = req.body;
        let now = functions.getTimeNow();

        let unit_info = {};
        let msg = '';

        //Check viễn cảnh có phải là OKR hay không
        if (type_unit != 5) {
            unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(unit_target) }).then((data) => data);
            msg = 'Giao KPI cá nhân ' + unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            if (name == '') {
                name = unit_info.name + ': ' + Math.round(target2) + ' ' + unit_info.unit;
            }
            target2 = parseFloat(target2).toFixed(1);
            if (target2 == parseInt(target2, 10)) {
                target2 = parseInt(target2, 10);
            }
        } else {
            msg = 'Giao KPI cá nhân : ' + target2;
            if (name == '') {
                name = target2;
            }
        }
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        //Thêm mới KPI
        let data_insert_kpi = {};

        data_insert_kpi = {
            id: MaxIdKPI + 1,
            type: 1,
            name: name || '',
            staff: single,
            type_unit: type_unit,
            unit_id: parseInt(unit_target),
            target: target2,
            percent: parseFloat(percent).toFixed(2) == parseInt(percent, 10) ?
                (percent = parseInt(percent, 10)) :
                parseFloat(percent).toFixed(2),
            conn_target: parseInt(target_connect) || 0,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            manager: member_manager || '0',
            followers: member_follow || '0',
            description: description || '',
            company_id: com_id,
            created_at: now,
            updated_at: now,
            is_last: 0,
        };

        let data = new KPI365_Kpi(data_insert_kpi);
        await data.save();

        //Cập nhật các KPI mục tiêu kết nối
        await KPI365_Kpi.updateOne({ id: parseInt(target_connect) }, { is_last: 1 });

        //Chuyển kết quả từ kpi cha sang kpi cá nhân mới tạo
        await KPI365_Result.updateOne({ kpi_id: parseInt(target_connect), staff_id: single }, { kpi_id: MaxIdKPI + 1 });

        //Thông báo
        let kpi_info = await functions_kpi.getInfoKPI(MaxIdKPI + 1, com_id).then((data) => data);
        let user_id = kpi_info.staffs.join(',');
        msg = 'Bạn đã được giao KPI ' + kpi_info.name;
        let notification_data = {
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info.detail_url,
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        let SenderId = idQLC;
        let TypeSenderId = type;
        let CompanyId = com_id;
        let Title = type == 1 ? 'Từ: Công ty ' + data_login.name : 'Từ: ' + data_login.name;
        let Message = Title + '\n' + 'Bạn đã được thêm vào KPI ' + info_kpi.name;
        let Link = `https://kpi.timviec365.vn` + kpi_info['detail_url'];
        let ListComReceive = [];
        let ListEpReceive = [parseInt(single)];
        await functions_kpi.send_mess(
            SenderId,
            TypeSenderId,
            CompanyId,
            Title,
            Message,
            ListComReceive,
            ListEpReceive,
            Link
        );

        return functions.success(res, `Giao KPI thành công`, {
            data_insert_diary,
            data,
            notification_data,
            single,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addResultSingleKPI = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { staff_id, kpi_id, result, result_name, result_date } = req.body;

        let now = functions.getTimeNow();
        let { MaxIdAD, MaxIdResult, MaxIdN } = await functions_kpi.getMaxId().then((data) => {
            return { MaxIdAD: data.MaxIdActivityDiary, MaxIdResult: data.MaxIdResult, MaxIdN: data.MaxIdN };
        });

        //Check trường bắt buộc
        if (kpi_id == undefined || kpi_id == '') {
            return functions.setError(res, 'Truyền thiếu trường kpi_id', 400);
        }

        //Check KPI
        let kpi_personal = await KPI365_Kpi.findOne({ id: parseInt(kpi_id) }).then((data) => data);
        if (kpi_personal == null || kpi_personal == undefined) {
            return functions.setError(res, 'Không tìm thấy KPI', 400);
        }

        let data_insert_result = new KPI365_Result({
            id: MaxIdResult + 1,
            staff_id: staff_id,
            kpi_id: kpi_id,
            result: result,
            name: result_name,
            time_achieved: parseInt(result_date),
            created_at: now,
            updated_at: now,
            accuracy: 1,
        });
        await data_insert_result.save();

        let kpi_info = await functions_kpi.getInfoKPI(parseInt(kpi_id), com_id).then((data) => data);
        let user_id_all = [...kpi_info['managers'], ...kpi_info['followers']];
        let user_id = [...new Set(user_id_all)].join(',');
        let msg = 'Nhân viên đã thêm kết quả KPI ' + kpi_info['name'];

        let notification_data = {
            id: MaxIdN + 1,
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info['result_update_url'],
        };

        await functions_kpi.addNotification(notification_data, com_id, type);

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Thêm thành kết quả thành công`, {
            data_insert_diary,
            data_insert_result,
            notification_data,
            user_id,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.listResultSingleKPI = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let kpi_id = parseInt(req.body.kpi_id) || 0;
        let now = functions.getTimeNow();

        if (kpi_id == 0) return functions.setError(res, 'Chưa truyền kpi_id hoặc truyền sai định dạng kpi', 400);

        let info = await KPI365_Kpi.findOne({ id: kpi_id, is_deleted: 0, type_target: 0 });
        if (info == null) return functions.setError(res, 'Không tồn tại KPI đơn mục tiêu này', 400);

        let unit = await KPI365_TargetUnit.findOne({ id: info.unit_id }).then((data) => data.unit);

        let list_result = await KPI365_Result.aggregate([{
                $sort: {
                    updated_at: -1,
                },
            },
            {
                $match: {
                    kpi_id: kpi_id,
                },
            },
            {
                $addFields: {
                    staff_id: { $toInt: '$staff_id' },
                },
            },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'staff_id',
                    foreignField: 'idQLC',
                    as: 'users',
                    pipeline: [{
                            $match: {
                                'inForPerson.employee.com_id': com_id,
                            },
                        },
                        {
                            $project: {
                                userName: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: { path: '$users', preserveNullAndEmptyArrays: true },
            },
            {
                $addFields: {
                    date: { $toDate: { $multiply: ['$time_achieved', 1000] } },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                    },
                    result: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    result: {
                        // _id: 0,
                        id: 1,
                        staff_id: 1,
                        kpi_id: 1,
                        name: 1,
                        'users.userName': 1,
                        result: 1,
                    },
                },
            },
        ]);

        return functions.success(res, `Lấy danh sách kết quả KPI đơn mục tiêu thành công`, {
            list_result,
            unit,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.listKPIMultiTarget = async(req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { organization_id, group_id, staff_id, date_start, date_end, kpi_id } = req.body;
        let page = parseInt(req.body.page) || 1;
        let pageSize = parseInt(req.body.pageSize) || 10;
        let skip = (page - 1) * pageSize;
        let now = functions.getTimeNow();
        let condition = {
            type_target: 1,
            is_deleted: 0,
            company_id: com_id,
            type: { $ne: '' },
        };
        let condition_staff = {
            type_target: 1,
            is_deleted: 0,
            company_id: com_id,
        };
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
            condition_staff['$or'] = [{
                    manager: { $regex: new RegExp(staff_id.toString(), 'i') },
                },
                {
                    followers: { $regex: new RegExp(staff_id.toString(), 'i') },
                },
                {
                    staff: { $regex: new RegExp(staff_id.toString(), 'i') },
                },
            ];
        }

        //Biến lưu danh sách id KPI đa mục tiêu khi tìm kiếm
        let list_kpi_id = [];
        let list_kpi_by_staff = [];
        //Lấy ds id kpi nếu điều kiện tìm kiếm có nhân viên thì lọc qua nhân viên trước
        if (staff_id) {
            await KPI365_Kpi.aggregate([{
                    $sort: { id: -1 },
                },
                {
                    $match: condition_staff,
                },
                {
                    $lookup: {
                        from: 'KPI365_Kpi',
                        localField: 'conn_target',
                        foreignField: 'id',
                        as: 'kpi_parent',
                    },
                },
                {
                    $unwind: { path: '$kpi_parent', preserveNullAndEmptyArrays: true },
                },
                {
                    $project: {
                        _id: 0,
                        type: 1,
                        id: 1,
                        conn_target: 1,
                        conn_target_parent: '$kpi_parent.conn_target',
                    },
                },
            ]).then((data) =>
                data.map((item) => {
                    //Nếu type = "" thì lấy KPI cha của nó
                    if (item.type == '') {
                        list_kpi_by_staff.push(item.conn_target);
                        if (
                            item.conn_target_parent != null &&
                            item.conn_target_parent != undefined &&
                            item.conn_target_parent != 0
                        )
                            list_kpi_by_staff.push(item.conn_target_parent);
                    }
                    //Nếu type != "" thì thêm cả nó và cha của nó vào
                    else {
                        list_kpi_by_staff.push(item.id);
                        if (item.conn_target != 0) {
                            list_kpi_by_staff.push(item.conn_target);
                        }
                    }
                })
            );

            list_kpi_by_staff = [...new Set(list_kpi_by_staff)];
        }

        //Tiếp tục lọc qua các điều kiện còn lại nếu có
        if (list_kpi_by_staff.length > 0) {
            condition.id = { $in: list_kpi_by_staff };
        }

        if (kpi_id) {
            condition.id = parseInt(kpi_id);
        }

        // Đếm số lượng KPI
        list_kpi_id = await KPI365_Kpi.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: condition,
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                },
            },
        ]).then((data) => data.map((item) => item.id));

        let count = list_kpi_id.length;

        //Biến lưu danh sách KPI đa mục tiêu chưa xử lý có phân trang
        let data_kpi_multi = await KPI365_Kpi.aggregate([{
                $sort: { id: -1 },
            },
            {
                $match: {
                    id: { $in: list_kpi_id },
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: pageSize,
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
                    followers: 1,
                },
            },
        ]);

        //Biến lưu danh sách KPI đa mục tiêu đã qua xử lý
        let list_kpi_multi = [];
        for (let i = 0; i < data_kpi_multi.length; i++) {
            let item = data_kpi_multi[i];
            if (item.conn_target == 0) {
                //KPI đa mục tiêu
                let perform = await KPI365_Kpi.find({ conn_target: item.id, is_deleted: 0, type_target: 1 }).then(
                    async(data) => {
                        return await functions_kpi_kpi.strNameKpiMultiTarget(
                            data.map((item) => item.id),
                            com_id
                        );
                    }
                );
                item.sum_kpi = 2;
                item.url = '/chi-tiet-kpi-da-muc-tieu-p' + item.id + '.html';
                item.url_update = '';
                item.perform = perform;
                item.type = '--';
                item.scores = '--';
                item.trend = '--';
                item.bonus = '--';
                item.percent = '--';
            }
            if (item.conn_target != 0) {
                //KPI tổ chức, nhóm mới, cá nhân
                let perform = await functions_kpi_kpi.nameKpiMultiTarget(parseInt(item.id), com_id);
                if (item.percent == '') {
                    item.url = `/chi-tiet-kpi-da-muc-tieu-p${item.conn_target}.html`;
                    item.percent = '0%';
                } else {
                    item.url = `/chi-tiet-kpi-da-muc-tieu-c${item.id}.html`;
                    item.percent = `${item.percent}%`;
                    if ((item.is_last == 1 && item.type != '5') || item.type == '5') {
                        item.url_update =
                            item.type == '5' ?
                            `/cap-nhat-ket-qua-e${item.id}.html` :
                            `/cap-nhat-ket-qua-p${item.id}.html`;
                    }
                }
                // tổng số KPI con của KPI đa mục tiêu (nếu = 1 thì ko cho cho xóa)
                item.sum_kpi = await KPI365_Kpi.countDocuments({
                    conn_target: parseInt(item.conn_target),
                    type_target: 1,
                    is_deleted: 0,
                });
                item.name = item.name + ' - ' + perform;
                item.perform = perform;
                item.type = item.type != 4 ? (item.type == 5 ? 'Cá nhân' : 'Tổ chức') : 'Nhóm';

                if (item.type != '') {
                    item.process =
                        (await functions_kpi_kpi.processKpiMultiTarget(item.id).then((data) => data.toString())) + '%';
                } else {
                    item.process =
                        (await functions_kpi_kpi
                            .processKpiMultiTarget(item.conn_target, item.staff, item.target)
                            .then((data) => data.toString())) + '%';
                }

                let scores = 0;
                let trend = 0; // 0.Không đạt, 1.Đạt
                let time = 1; // 0.Quá hạn, 1.Trong thời gian được cài đặt

                if (now > item.end_date && parseFloat(item.process) < 100) {
                    //quá hạn
                    time = 0;
                }

                let configAssess = await KPI365_ConfigAssess.findOne({
                    start: { $lte: parseFloat(item.process) },
                    end: { $gte: parseFloat(item.process) },
                    time: time,
                    com_id: com_id,
                }).sort({ scores: -1 });
                if (configAssess != null) {
                    scores = configAssess.scores;
                    trend = configAssess.trend;
                    item.scores = scores + ' điểm';
                    item.trend = trend == 0 ? 'Không đạt' : trend == 1 ? 'Đạt' : 'Chưa cập nhật';
                } else {
                    item.scores = 'Chưa thiết lập';
                    item.trend = 'Chưa thiết lập';
                }

                let condition = await KPI365_Bonus.findOne({ kpi_id: parseInt(item.id), is_deleted: 0 })
                    .then((data) => data.condition)
                    .catch((error) => 0);
                if (condition == 0) {
                    item.bonus = 'Chưa có thưởng';
                }

                if (condition == 1) {
                    let condition_1 = {
                        is_deleted: 0,
                        kpi_id: parseInt(item.id),
                        $or: [{
                                $and: [
                                    { start: { $lte: parseFloat(item.process) } },
                                    { end: { $gte: parseFloat(item.process) } },
                                ],
                            },
                            {
                                end: { $lt: parseFloat(item.process) },
                            },
                        ],
                    };
                    let valueBonus = await KPI365_Bonus.findOne(condition_1)
                        .then((data) => data.value)
                        .catch((error) => 0);
                    if (valueBonus !== null) {
                        item.bonus = valueBonus + ' VNĐ';
                    } else {
                        item.bonus = 'Chưa có thưởng';
                    }
                }
                if (condition == 2) {
                    let condition_1 = {
                        is_deleted: 0,
                        kpi_id: parseInt(item.id),
                        $or: [{
                                $and: [{ start: { $lte: parseFloat(scores) } }, { end: { $gte: parseFloat(scores) } }],
                            },
                            {
                                end: { $lt: parseFloat(scores) },
                            },
                        ],
                    };
                    let valueBonus = await KPI365_Bonus.findOne(condition_1)
                        .then((data) => data.value)
                        .catch((error) => 0);
                    if (valueBonus !== null) {
                        item.bonus = valueBonus + ' VNĐ';
                    } else {
                        item.bonus = 'Chưa có thưởng';
                    }
                }
            }

            item.execution_time =
                functions_kpi.getDate(item.start_day * 1000) + ' - ' + functions_kpi.getDate(item.end_date * 1000);
            if (item.manager != '') {
                item.manager = item.manager.split(',').map((data) => parseInt(data));
                item.manager = await Users.find({
                        idQLC: { $in: item.manager },
                        'inForPerson.employee.com_id': com_id,
                    })
                    .then((data) => data.map((data) => data.userName).join(','))
                    .catch((error) => '');
            }

            if (item.followers != '') {
                item.followers = item.followers.split(',').map((data) => parseInt(data));
                item.followers = await Users.find({
                    idQLC: { $in: item.followers },
                    'inForPerson.employee.com_id': com_id,
                }).then((data) => data.map((followers) => data.userName).join(','));
            }

            list_kpi_multi.push(item);
        }

        return functions.success(res, `Danh sách KPI đa mục tiêu`, {
            list_kpi_multi,
            count,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addKPIMultiTarget = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, type, idQLC } = req.user.data;
        let {
            name,
            manager,
            followers,
            start_day,
            end_date,
            description,
            perform_type,
            perform_id,
            target_id,
            target,
            type_unit,
            target_percent,
            target_calculate,
        } = req.body;

        //Tiền xử lý thông tin từ req
        let now = functions.getTimeNow();
        let arr_type = [...new Set(perform_type.split(','))];

        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdKPI;
        });
        let newIdKPI = MaxIdKPI + 1;
        let data_insert_kpi = {};
        let data_insert_diary = {};
        if (
            name != '' &&
            type_unit != '' &&
            manager != '' &&
            followers != '' &&
            start_day != '' &&
            end_date != '' &&
            perform_type != '' &&
            perform_id != '' &&
            target_id != '' &&
            target_percent != '' &&
            target_calculate != ''
        ) {
            formula = await functions_kpi.json_formula(target_id, target_calculate);
            data_insert_kpi = new KPI365_Kpi({
                id: MaxIdKPI + 1,
                name: name,
                type_unit: type_unit,
                manager: manager,
                followers: followers,
                start_day: parseInt(start_day),
                end_date: parseInt(end_date) + 86399,
                type: arr_type.join(','),
                precent_target: target_percent,
                calculate: target_calculate,
                target_id: target_id,
                target: target,
                description: description,
                company_id: com_id,
                created_at: now,
                updated_at: now,
                type_target: 1, // 0.KPI đơn mục tiêu, 1.KPI đa mục tiêu
                formula: formula,
            });
            await data_insert_kpi.save();
            arr_type = perform_type.split(',');
            let array_perform_id = perform_id.split(',');
            for (let j = 0; j < array_perform_id.length; j++) {
                let type_kpi = arr_type[j].toString();
                let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
                    return data.MaxIdKPI;
                });
                data = {
                    id: MaxIdKPI + 1,
                    name: name,
                    type_unit: type_unit,
                    manager: manager,
                    followers: followers,
                    start_day: parseInt(start_day),
                    end_date: parseInt(end_date) + 86399,
                    type: type_kpi,
                    precent_target: target_percent,
                    calculate: target_calculate,
                    target_id: target_id,
                    target: target,
                    description: description,
                    company_id: com_id,
                    created_at: now,
                    updated_at: now,
                    type_target: 1,
                    conn_target: newIdKPI,
                    formula: formula,
                };
                if (type_kpi == '4') {
                    data.group_id = array_perform_id[j];
                    data.group_type = 1;
                } else if (type_kpi == '5') {
                    data.staff = array_perform_id[j];
                } else if (type_kpi == '6') {
                    data.organization_id = array_perform_id[j];
                    let organization_info = await QLC_OrganizeDetail.findOne({
                        id: parseInt(array_perform_id[j]),
                        comId: parseInt(com_id),
                    }).then((data) => data);
                    if (organization_info == null)
                        return functions.setError(
                            res,
                            `Không tồn tại tổ chức có id ${parseInt(array_perform_id[j])}`,
                            400
                        );
                    data.level = parseInt(organization_info.level);
                }

                await KPI365_Kpi.create(data);
            }
            data_insert_diary = new KPI365_ActivityDiary({
                id: MaxIdAD + 1,
                user_id: idQLC,
                type: 1,
                content: 'Thêm KPI đa mục tiêu: ' + name,
                created_at: now,
                date: functions_kpi.getDate(now * 1000),
                login_type: type,
            });
            await data_insert_diary.save();
        } else {
            return functions.setError(
                res,
                `Điền thiếu trường trong (name, type_unit, manager, followers, start_day, end_date, perform_type, perform_id, target_id, target_percent, target_calculate) `,
                400
            );
        }
        return functions.success(res, `Thêm mới KPI đa mục tiêu thành công`, {
            data_insert_kpi,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editKPIMultiTarget = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, type, idQLC } = req.user.data;
        let {
            id,
            is_last,
            name,
            manager,
            followers,
            start_day,
            end_date,
            description,
            perform_id,
            perform_type,
            kpi_id,
            kpi_id_old,
            target_id,
            type_unit,
            target,
            exist_id,
            target_percent,
            target_calculate,
            sum_target,
        } = req.body;
        let data_update_kpi = {};
        let now = functions.getTimeNow();

        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        let arr_type = [...new Set(perform_type.split(','))];
        let array_id_kpi_deleted = [];
        let array_kpi_id_old = [];
        let array_kpi_id = [];
        let arr_target_id_old = [];
        let array_location = [];

        //Check đủ trường mới chỉnh sửa
        if (
            id != '' &&
            is_last != '' &&
            kpi_id != '' &&
            kpi_id_old != '' &&
            target != '' &&
            name != '' &&
            type_unit != '' &&
            manager != '' &&
            followers != '' &&
            start_day != '' &&
            end_date != '' &&
            perform_id != '' &&
            perform_type != '' &&
            target_id != '' &&
            target_percent != '' &&
            target_calculate != ''
        ) {
            let formula = await functions_kpi.json_formula(target_id, target_calculate);
            is_last = parseInt(is_last);
            //Chỉnh sửa KPI đa mục tiêu cha
            data_update_kpi = {
                name: name,
                type_unit: type_unit,
                manager: manager,
                followers: followers,
                start_day: parseInt(start_day),
                end_date: parseInt(end_date) + 86399,
                type: arr_type.join(','),
                precent_target: target_percent,
                calculate: target_calculate,
                target_id: target_id,
                target: sum_target,
                description: description,
                updated_at: now,
                formula: formula,
            };
            // await KPI365_Kpi.update({ id: parseInt(id) }, data_update_kpi)

            let array_type = perform_type.split(',');
            let array_perform_id = perform_id.split(',');
            array_kpi_id = kpi_id.split(',');

            //Xóa KPI đa mục tiêu con nếu có bằng cách so sánh 2 ds cũ và mới
            array_kpi_id_old = kpi_id_old.split(',');
            array_id_kpi_deleted = array_kpi_id_old.filter((item) => !array_kpi_id.includes(item));
            if (array_id_kpi_deleted.length > 0) {
                for (let j = 0; j < array_id_kpi_deleted.length; j++) {
                    let item = array_id_kpi_deleted[j];
                    // delete_kpi_multi_target(item, 1);
                }
            }

            //Lọc và chỉnh sửa các mục tiêu và chỉ tiêu
            let target_id_old = info_kpi.target_id;
            let arr_target_id_old = target_id_old.split(',');
            let arr_target_id = target_id.split(',');
            let arr_exist_id = exist_id.split(',');
            arr_id_target_deleted = arr_target_id_old.filter((item) => !arr_exist_id.includes(item));
            //Lấy vị trí các mục tiêu bị xóa
            for (let j = 0; j < arr_id_target_deleted.length; j++) {
                let value = arr_id_target_deleted[j];
                let index = arr_target_id_old.indexOf(value);
                array_location.push(index);
            }

            for (let j = 0; j < array_kpi_id.length; j++) {
                let value = parseInt(array_kpi_id[j]);
                let type_kpi = array_type[j].toString();
                //kpi_id = 0 là thêm mới
                if (value == 0) {
                    let MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
                        return data.MaxIdKPI;
                    });
                    let data_insert_kpi = {
                        id: MaxIdKPI + 1,
                        name: name,
                        type_unit: type_unit,
                        manager: manager,
                        followers: followers,
                        start_day: parseInt(start_day),
                        end_date: parseInt(end_date) + 86399,
                        type: type_kpi.toString(),
                        precent_target: target_percent,
                        calculate: target_calculate,
                        target_id: target_id,
                        description: description,
                        company_id: com_id,
                        created_at: now,
                        updated_at: now,
                        type_target: 1,
                        conn_target: id,
                        formula: formula,
                    };
                    if (is_last == '1') {
                        data_insert_kpi.percent = 0;
                        data_insert_kpi.target = target;
                    }
                    if (type_kpi == '4') {
                        data_insert_kpi.group_id = array_perform_id[j];
                        data_insert_kpi.group_type = 1;
                    } else if (type_kpi == '5') {
                        data_insert_kpi.staff = array_perform_id[j];
                    } else if (type_kpi == '6') {
                        data_insert_kpi.organization_id = array_perform_id[j];
                        let organization_info = await QLC_OrganizeDetail.findOne({
                            id: parseInt(array_perform_id[j]),
                            comId: parseInt(com_id),
                        }).then((data) => data);
                        data_insert_kpi.level = parseInt(organization_info.level);
                    }
                    // await KPI365_Kpi.create(data_insert_kpi);
                } else {
                    //kpi_id !=0 là chỉnh sửa kpi đa mục tiêu con
                    let infoChildren = await KPI365_Kpi.findOne({ id: parseInt(value) }).then((data) => data);
                    //Xử lý mảng mục tiêu sau khi sửa nếu đã giao KPI
                    let target_old = infoChildren.target;
                    let arr_target = target_old.split(',');
                    array_location.forEach((vt, index) => {
                        arr_target.splice(vt - index, 1);
                    });
                    let sum_target_add = arr_target_id.length - arr_target.length;
                    if (sum_target_add > 0) {
                        for (let k = 0; k < sum_target_add; k++) {
                            arr_target.push('0');
                        }
                    }

                    let data_update_kpi_chil = {
                        name: name,
                        type_unit: type_unit,
                        manager: manager,
                        followers: followers,
                        start_day: parseInt(start_day),
                        end_date: parseInt(end_date) + 86399,
                        type: type_kpi,
                        precent_target: target_percent,
                        calculate: target_calculate,
                        target_id: target_id,
                        description: description,
                        updated_at: now,
                        formula: formula,
                    };
                    if (is_last == 1) {
                        data_update_kpi_chil.target = arr_target.join(',');
                    }
                    // await KPI365_Kpi.update({ id: parseInt(value) }, data_update_kpi_chil);
                    if (infoChildren.is_last == 1) {
                        let result = await KPI365_Kpi.find({ conn_target: value }).then((data) => data);
                        for (let k = 0; k < result.length; k++) {
                            let val = result[k];
                            let target_old_chil = val.target;
                            let arr_target_chil = target_old_chil.split(','); // mảng mục tiêu cũ
                            array_location.forEach((vt, index) => {
                                arr_target_chil.splice(vt - index, 1);
                            });
                            let sum_target_add_chil = arr_target_id.length - arr_target.length;
                            if (sum_target_add_chil > 0) {
                                for (let l = 0; l < sum_target_add_chil; l++) {
                                    arr_target_chil.push('0');
                                }
                            }
                            // await KPI365_Kpi.update({ id: val.id }, { target: arr_target_chil.join(",") });
                        }
                    }
                }
            }
        } else {
            return functions.setError(
                res,
                'Truyền thiếu 1 trong các trường: id, is_last, kpi_id, kpi_id_old, ' +
                'target, name, type_unit, manager, followers, start_day, end_date, perform_id, perform_type, target_id, ' +
                'target_percent, target_calculate',
                400
            );
        }

        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Chỉnh sửa KPI đa mục tiêu: ' + name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        // await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa KPI đa mục tiêu thành công`, {
            data_update_kpi,
            array_id_kpi_deleted,
            array_kpi_id,
            data_insert_diary,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addResultMultiKPI = async(req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { kpi_id, result_name, target_id, staff_id, result, result_date } = req.body;
        let now = functions.getTimeNow();

        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(kpi_id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        if (
            kpi_id == '' ||
            kpi_id == undefined ||
            result_name == '' ||
            result_name == undefined ||
            target_id == '' ||
            target_id == undefined ||
            staff_id == '' ||
            staff_id == undefined ||
            result_date == '' ||
            result_date == undefined
        ) {
            return functions.setError(
                res,
                'Truyền thiếu trường kpi_id, result_name, target_id, staff_id, result, result_date',
                400
            );
        }

        let array_staff = staff_id.split(',');
        let array_result = [];
        if (result != '') {
            array_result = result.split(',');
        }

        for (let i = 0; i < array_staff.length; i++) {
            let MaxIdResult = await functions_kpi.getMaxId().then((data) => data.MaxIdResult);
            let value = array_staff[i];
            let data_insert_result = new KPI365_Result({
                id: MaxIdResult + 1,
                staff_id: value,
                kpi_id: parseInt(kpi_id),
                result: array_result[i] || '',
                name: result_name,
                time_achieved: parseInt(result_date),
                created_at: now,
                updated_at: now,
                accuracy: 1,
                target_id: parseInt(target_id) || 0,
            });
            await data_insert_result.save();
        }

        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let name = await functions_kpi_kpi.nameKpiMultiTarget(parseInt(kpi_id), com_id);
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Thêm kết quả KPI đa mục tiêu ' + info_kpi.name + ' - ' + name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Thêm kết quả KPI đa mục tiêu thành công`, {
            name,
            data_insert_diary,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.copyMultiKPI = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { id, from_date, to_date } = req.body;
        let now = functions.getTimeNow();
        let { MaxIdKPI } = await functions_kpi.getMaxId().then((data) => {
            return { MaxIdKPI: data.MaxIdKPI };
        });

        //Check trường bắt buộc
        if (
            id == undefined ||
            id == '' ||
            from_date == undefined ||
            from_date == '' ||
            to_date == undefined ||
            to_date == ''
        ) {
            return functions.setError(res, 'Truyền thiếu trường id, from_date, to_date', 400);
        }

        //Check result KPI
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id) }).then((data) => data);
        if (info_kpi == null || info_kpi == undefined) {
            return functions.setError(res, 'Không tìm thấy result KPI', 400);
        }

        //Tạo mới KPI đa mục tiêu cha
        let new_kpi = new KPI365_Kpi({
            id: MaxIdKPI + 1,
            name: info_kpi.name,
            type: info_kpi.type,
            type_unit: info_kpi.type_unit,
            unit_id: info_kpi.unit_id,
            target: info_kpi.target,
            percent: info_kpi.percent,
            conn_target: 0,
            created_at: now,
            updated_at: now,
            start_day: parseInt(from_date),
            end_date: parseInt(to_date) + 86399,
            description: info_kpi.description,
            target_year: info_kpi.target_year,
            department_id: info_kpi.department_id,
            nest_id: info_kpi.nest_id,
            group_id: info_kpi.group_id,
            organization_id: info_kpi.organization_id,
            level: info_kpi.level,
            staff: info_kpi.staff,
            manager: info_kpi.manager,
            followers: info_kpi.followers,
            company_id: info_kpi.company_id,
            is_deleted: info_kpi.is_deleted,
            is_last: info_kpi.is_last,
            group_type: info_kpi.group_type,
            type_target: info_kpi.type_target,
            precent_target: info_kpi.precent_target,
            calculate: info_kpi.calculate,
            target_id: info_kpi.target_id,
            is_parent_deleted: info_kpi.is_parent_deleted,
            formula: info_kpi.formula,
        });

        await new_kpi.save();
        //Lấy danh sách KPI đa mục tiêu con
        let dataChildren = await KPI365_Kpi.find({
            conn_target: info_kpi.id,
            is_deleted: 0,
            is_parent_deleted: 0,
        }).then((data) => data);

        let conn_target = MaxIdKPI + 1;
        for (let i = 0; i < dataChildren.length; i++) {
            let { MaxIdKPI } = await functions_kpi.getMaxId().then((data) => {
                return { MaxIdKPI: data.MaxIdKPI };
            });
            let dataChildren_1 = dataChildren[i];

            let new_kpi_child = new KPI365_Kpi({
                id: MaxIdKPI + 1,
                name: dataChildren_1.name,
                type: dataChildren_1.type,
                type_unit: dataChildren_1.type_unit,
                unit_id: dataChildren_1.unit_id,
                target: dataChildren_1.target,
                percent: dataChildren_1.percent,
                conn_target: conn_target,
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
            });
            await new_kpi_child.save();
        }
        return functions.success(res, `Sao chép KPI thành công`, {
            new_kpi,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.assignKPIMultiParent = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, type, idQLC } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { id, kpi_id, percent, target } = req.body;

        let array_kpi_id = kpi_id.split(',');
        let array_percent = percent.split(',');
        let array_target = target.split(',');
        let sum_target = array_target.length / array_percent.length;
        let now = functions.getTimeNow();

        if (
            id == '' ||
            id == undefined ||
            percent == '' ||
            percent == undefined ||
            target == '' ||
            target == undefined
        ) {
            return functions.setError(res, 'Truyền thiếu 1 trong các trường: id, percent, target', 400);
        }
        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        const splitArray = [];
        for (let i = 0; i < array_target.length; i += sum_target) {
            splitArray.push(array_target.slice(i, i + sum_target));
        }
        await KPI365_Kpi.updateOne({ id: parseInt(id) }, { is_last: 1 });
        for (let i = 0; i < array_kpi_id.length; i++) {
            let value = parseInt(array_kpi_id[i]);
            await KPI365_Kpi.updateOne({ id: value }, { target: splitArray[i].join(','), percent: array_percent[i] });

            let kpi = await KPI365_Kpi.findOne({ id: value }).then((data) => data);
            if (kpi.type == 5) {
                let SenderId = idQLC;
                let TypeSenderId = type;
                let CompanyId = com_id;
                let Title = type == 1 ? 'Từ: Công ty ' + data_login.name : 'Từ: ' + data_login.name;
                let Message = Title + '\n' + 'Bạn đã được thêm vào KPI ' + info_kpi.name;
                let Link = `https://kpi.timviec365.vn/chi-tiet-kpi-da-muc-tieu-p${id}.html`;
                let ListComReceive = [];
                let ListEpReceive = [parseInt(kpi.staff)];
                await functions_kpi.send_mess(
                    SenderId,
                    TypeSenderId,
                    CompanyId,
                    Title,
                    Message,
                    ListComReceive,
                    ListEpReceive,
                    Link
                );
            }
        }

        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Giao KPI đa mục tiêu: ' + info_kpi.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();
        return functions.success(res, `Giao KPI đa mục tiêu cha thành công`, {
            data_insert_diary,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editAssignKPIMultiParent = async(req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { id, kpi_id, percent, target } = req.body;

        let array_kpi_id = kpi_id.split(',');
        let array_percent = percent.split(',');
        let array_target = target.split(',');
        let sum_target = array_target.length / array_percent.length;
        let now = functions.getTimeNow();

        if (
            id == '' ||
            id == undefined ||
            percent == '' ||
            percent == undefined ||
            target == '' ||
            target == undefined
        ) {
            return functions.setError(res, 'Truyền thiếu 1 trong các trường: id, percent, target', 400);
        }
        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        const splitArray = [];
        for (let i = 0; i < array_target.length; i += sum_target) {
            splitArray.push(array_target.slice(i, i + sum_target));
        }

        for (let i = 0; i < array_kpi_id.length; i++) {
            let value = parseInt(array_kpi_id[i]);
            let data_update_kpi = {
                percent: array_percent[i],
                target: splitArray.join(','),
            };
            await KPI365_Kpi.updateOne({ id: value }, data_update_kpi);
        }

        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Giao KPI đa mục tiêu: ' + info_kpi.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa giao KPI đa mục tiêu cha thành công`, {
            data_insert_diary,
            array_kpi_id,
            array_percent,
            array_target,
            sum_target,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.assignKPIMultiChild = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, type, idQLC } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { id, staff_id, percent, target } = req.body;

        //Đưa các trường về mảng
        let array_staff_id = staff_id.split(',');
        let array_percent = percent.split(',');
        let array_target = target.split(',');
        let sum_target = array_target.length / array_percent.length;
        let now = functions.getTimeNow();

        //Kiểm tra trường phải được nhập vào
        if (
            id == '' ||
            id == undefined ||
            staff_id == '' ||
            staff_id == undefined ||
            percent == '' ||
            percent == undefined ||
            target == '' ||
            target == undefined
        ) {
            return functions.setError(res, 'Truyền thiếu 1 trong các trường: id, staff_id, percent, target', 400);
        }
        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        //Chia mảng các mục tiêu cho từng API con
        const splitArray = [];
        for (let i = 0; i < array_target.length; i += sum_target) {
            splitArray.push(array_target.slice(i, i + sum_target));
        }
        //Update giao KPI cho KPI cha
        await KPI365_Kpi.updateOne({ id: parseInt(id) }, { is_last: 1 });

        //Tạo mới KPI con và gửi tin nhắn về chat365
        for (let i = 0; i < array_staff_id.length; i++) {
            let value = array_staff_id[i];
            const MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
                return data.MaxIdKPI;
            });
            let data_insert_kpi = new KPI365_Kpi({
                id: MaxIdKPI + 1,
                conn_target: parseInt(id),
                staff: value,
                percent: array_percent[i],
                target: splitArray[i].join(','),
                created_at: now,
                updated_at: now,
                company_id: parseInt(com_id),
                type_target: 1,
            });
            await data_insert_kpi.save();

            let SenderId = idQLC;
            let TypeSenderId = type;
            let CompanyId = com_id;
            let Title = type == 1 ? 'Từ: Công ty ' + data_login.name : 'Từ: ' + data_login.name;
            let Message = Title + '\n' + 'Bạn đã được thêm vào KPI ' + info_kpi.name;
            let Link = `https://kpi.timviec365.vn/chi-tiet-kpi-da-muc-tieu-c${id}.html`;
            let ListComReceive = [];
            let ListEpReceive = [parseInt(array_staff_id[i])];
            await functions_kpi.send_mess(
                SenderId,
                TypeSenderId,
                CompanyId,
                Title,
                Message,
                ListComReceive,
                ListEpReceive,
                Link
            );
        }

        //Ghi lại nhật ký
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let name = await functions_kpi_kpi.nameKpiMultiTarget(parseInt(id), com_id);
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Giao KPI đa mục tiêu: ' + info_kpi.name + ' - ' + name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();
        return functions.success(res, `Giao KPI đa mục tiêu con thành công`, {
            data_insert_diary,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editAssignKPIMultiChild = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, type, idQLC } = req.user.data;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);
        let { id, staff_id, percent, target, kpi_id } = req.body;

        //Đưa các trường về mảng
        let array_staff_id = staff_id.split(',');
        let array_percent = percent.split(',');
        let array_target = target.split(',');
        let array_kpi_id = kpi_id.split(',');
        let sum_target = array_target.length / array_percent.length;
        let now = functions.getTimeNow();

        //Kiểm tra trường phải được nhập vào
        if (
            id == '' ||
            id == undefined ||
            staff_id == '' ||
            staff_id == undefined ||
            percent == '' ||
            percent == undefined ||
            target == '' ||
            target == undefined ||
            kpi_id == '' ||
            kpi_id == undefined
        ) {
            return functions.setError(
                res,
                'Truyền thiếu 1 trong các trường: id, staff_id, kpi_id, percent, target',
                400
            );
        }
        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        let array_kpi_id_old = [];
        await KPI365_Kpi.find({ conn_target: parseInt(id), is_deleted: 0 }).then((data) => {
            array_kpi_id_old = data.map((item) => item.id.toString());
        });

        //Chia mảng các mục tiêu cho từng API con
        const splitArray = [];
        for (let i = 0; i < array_target.length; i += sum_target) {
            splitArray.push(array_target.slice(i, i + sum_target));
        }

        //Xóa nhân viên ra khỏi KPI bằng cách nhập trọng số và mục tiêu cho nhân viên bằng "" trên FE
        let array_id_kpi_deleted = array_kpi_id_old.filter((item) => !array_kpi_id.includes(item));
        if (array_id_kpi_deleted.length > 0) {
            for (let i = 0; i < array_id_kpi_deleted.length; i++) {
                let value = parseInt(array_id_kpi_deleted[i]);
                let infoKPIdelete = await KPI365_Kpi.findOne({ id: value }).then((data) => data);
                await KPI365_Kpi.deleteOne({ id: value });
                await KPI365_Result.deleteOne({ kpi_id: parseInt(id), staff_id: infoKPIdelete.staff });
            }
        }
        for (let i = 0; i < array_kpi_id.length; i++) {
            let value = parseInt(array_kpi_id[i]);
            if (value == 0) {
                // Thêm KPI
                const MaxIdKPI = await functions_kpi.getMaxId().then((data) => {
                    return data.MaxIdKPI;
                });
                let data_insert_kpi = new KPI365_Kpi({
                    id: MaxIdKPI + 1,
                    conn_target: parseInt(id),
                    staff: array_staff_id[i],
                    percent: array_percent[i],
                    target: splitArray[i].join(','),
                    created_at: now,
                    updated_at: now,
                    company_id: parseInt(com_id),
                    type_target: 1,
                });
                await data_insert_kpi.save();
            } else {
                // Chỉnh sửa KPI
                let data_update_kpi = {
                    percent: array_percent[i],
                    target: splitArray[i].join(','),
                };
                await KPI365_Kpi.updateOne({ id: value }, data_update_kpi);
            }
        }

        //Ghi lại nhật ký
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let name = await functions_kpi_kpi.nameKpiMultiTarget(parseInt(id), com_id);
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Sửa giao KPI đa mục tiêu: ' + info_kpi.name + ' - ' + name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();
        return functions.success(res, `Sửa giao KPI đa mục tiêu con thành công`, {
            data_insert_diary,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.accuracyResult = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { result_id } = req.body;

        if (result_id == undefined || result_id == '') return functions.setError(res, 'Chưa truyền id kết quả', 400);
        let now = functions.getTimeNow();
        let info_result = await KPI365_Result.findOne({ id: parseInt(result_id) }).then((data) => data);
        if (info_result == null) return functions.setError(res, 'Không tồn tại kết quả', 400);
        await KPI365_Result.updateOne({ id: parseInt(result_id) }, { accuracy: 1 });

        let kpi_id = info_result.kpi_id;
        let staff_id = info_result.staff_id;
        let kpi_info = await functions_kpi.getInfoKPI(parseInt(kpi_id), com_id).then((data) => data);
        let msg = 'Kết quả KPI ' + kpi_info['name'] + ' của bạn đã được xác thực';
        let { MaxIdAD, MaxIdResult, MaxIdN } = await functions_kpi.getMaxId().then((data) => {
            return { MaxIdAD: data.MaxIdActivityDiary, MaxIdResult: data.MaxIdResult, MaxIdN: data.MaxIdN };
        });

        let notification_data = {
            id: MaxIdN + 1,
            type_title: 1,
            content: msg,
            user_id: staff_id,
            url: kpi_info['result_update_url'],
        };

        await functions_kpi.addNotification(notification_data, com_id, type);

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: msg,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Xác thực kết quả KPI thành công`, {
            data_insert_diary,
            notification_data,
            staff_id,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.addOkrResult = async(req, res) => {
    try {
        let { com_id, type, idQLC } = req.user.data;
        let { kpi_id, result_name, staff_id, result, result_date } = req.body;
        let now = functions.getTimeNow();

        //Check tồn tại
        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(kpi_id), company_id: com_id }).then((data) => data);
        if (info_kpi == undefined || info_kpi == null) {
            return functions.setError(res, 'Không tồn tại KPI', 400);
        }

        if (
            kpi_id == '' ||
            kpi_id == undefined ||
            result_name == '' ||
            result_name == undefined ||
            staff_id == '' ||
            staff_id == undefined ||
            result_date == '' ||
            result_date == undefined
        ) {
            return functions.setError(
                res,
                'Truyền thiếu trường kpi_id, result_name, staff_id, result, result_date',
                400
            );
        }
        //Lấy id max
        let { MaxIdAD, MaxIdResult, MaxIdResultOkr, MaxIdN } = await functions_kpi.getMaxId().then((data) => {
            return {
                MaxIdAD: data.MaxIdActivityDiary,
                MaxIdResult: data.MaxIdResult,
                MaxIdN: data.MaxIdN,
                MaxIdResultOkr: data.MaxIdResultOkr,
            };
        });

        //Thêm mới kết quả
        let data_insert_result_okr = {
            id: MaxIdResultOkr + 1,
            staff_id: staff_id,
            kpi_id: parseInt(kpi_id),
            result: result,
            name: result_name,
            time_achieved: now,
            created_at: now,
        };
        await KPI365_ResultHistory.create(data_insert_result_okr);

        let data_insert_result = {
            id: MaxIdResult + 1,
            staff_id: staff_id,
            kpi_id: parseInt(kpi_id),
            result: result,
            name: result_name,
            time_achieved: now,
            created_at: now,
            updated_at: now,
            accuracy: 1,
        };
        await KPI365_Result.create(data_insert_result);

        //Tạo thông báo
        let kpi_info = await functions_kpi.getInfoKPI(parseInt(kpi_id), com_id).then((data) => data);
        let user_id_all = [...kpi_info['managers'], ...kpi_info['followers']];
        let user_id = [...new Set(user_id_all)].join(',');
        let msg = 'Nhân viên đã thêm kết quả KPI ' + kpi_info['name'];

        let notification_data = {
            id: MaxIdN + 1,
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info['result_update_url'],
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Thêm kết quả KPI ' + info_kpi.name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Thêm kết quả KPI đơn mục tiêu thành công`, {
            data_insert_result_okr,
            data_insert_result,
            data_insert_diary,
            notification_data,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editResult = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { result_id, result, result_name, result_date } = req.body;
        let now = functions.getTimeNow();
        let { MaxIdAD } = await functions_kpi.getMaxId().then((data) => {
            return { MaxIdAD: data.MaxIdActivityDiary };
        });

        //Check trường bắt buộc
        if (result_id == undefined || result_id == '') {
            return functions.setError(res, 'Truyền thiếu trường result_id', 400);
        }

        //Check result KPI
        let result_kpi = await KPI365_Result.findOne({ id: parseInt(result_id) }).then((data) => data);
        if (result_kpi == null || result_kpi == undefined) {
            return functions.setError(res, 'Không tìm thấy result KPI', 400);
        }

        //Cập nhật kết quả
        let data_update_result = {
            result: result,
            name: result_name,
            time_achieved: parseInt(result_date),
            updated_at: now,
        };
        await KPI365_Result.updateOne({ id: parseInt(result_id) }, data_update_result);

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Cập nhật kết quả KPI',
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa kết quả thành công`, {
            data_insert_diary,
            data_update_result,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.editOkrResult = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { result_id, result, result_name } = req.body;
        let now = functions.getTimeNow();
        let { MaxIdAD, MaxIdResultOkr, MaxIdN } = await functions_kpi.getMaxId().then((data) => {
            return {
                MaxIdAD: data.MaxIdActivityDiary,
                MaxIdResultOkr: data.MaxIdResultOkr,
                MaxIdN: data.MaxIdN,
            };
        });

        //Check trường bắt buộc
        if (result_id == undefined || result_id == '') {
            return functions.setError(res, 'Truyền thiếu trường result_id', 400);
        }

        //Check result KPI
        let result_kpi = await KPI365_Result.findOne({ id: parseInt(result_id) }).then((data) => data);
        if (result_kpi == null || result_kpi == undefined) {
            return functions.setError(res, 'Không tìm thấy result KPI', 400);
        }

        //Cập nhật kết quả
        let data_update_result = {
            result: result,
            name: result_name,
            time_achieved: now,
            updated_at: now,
            accuracy: 1,
        };
        await KPI365_Result.updateOne({ id: parseInt(result_id) }, data_update_result);
        result_kpi = await KPI365_Result.findOne({ id: parseInt(result_id) }).then((data) => data);
        //Tạo lịch sử kết quả OKR
        let data_insert_result_okr = {
            id: MaxIdResultOkr + 1,
            staff_id: result_kpi.staff_id,
            kpi_id: result_kpi.kpi_id,
            result: result_kpi.result,
            name: result_kpi.name,
            time_achieved: now,
            created_at: now,
        };
        await KPI365_ResultHistory.createOne(data_insert_result_okr);

        //Tạo thông báo
        let kpi_id = result_kpi.kpi_id;
        let kpi_info = await functions_kpi.getInfoKPI(parseInt(kpi_id), com_id).then((data) => data);
        let user_id_all = [...kpi_info['managers'], ...kpi_info['followers']];
        let user_id = [...new Set(user_id_all)].join(',');
        let msg = 'Nhân viên đã cập nhật kết quả KPI ' + kpi_info['name'];

        let notification_data = {
            id: MaxIdN + 1,
            type_title: 1,
            content: msg,
            user_id: user_id,
            url: kpi_info['result_update_url'],
        };
        await functions_kpi.addNotification(notification_data, com_id, type);

        //Ghi lại nhật ký hoạt động
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 1,
            content: 'Cập nhật kết quả KPI',
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, `Chỉnh sửa kết quả thành công`, {
            data_update_result,
            data_insert_result_okr,
            notification_data,
            data_insert_diary,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.processKpiMultiTarget = async(req, res) => {
    try {
        //Lấy thông tin từ req
        let kpi_id = parseInt(req.body.kpi_id);
        let staff_id = req.body.staff_id || 0;
        let target = req.body.target || 0;

        if (isNaN(kpi_id)) return functions.setError(res, 'Truyền sai định dạng của biến kpi_id', 400);

        let info_kpi = await KPI365_Kpi.findOne({ id: parseInt(kpi_id), type_target: 1, is_deleted: 0 });

        if (info_kpi == null) return functions.setError(res, 'Không tìm thấy KPI', 400);

        let conn_target = '';
        let target_id = '';
        let calculate = '';
        let precent_target = '';
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
            array_target_id = target_id.split(',');
            array_calculate = calculate.split(',');
            array_precent_target = precent_target.split(',');
            if (conn_target == 0) {
                //KPI đa mục tiêu cha
                let check = true;
                //Lấy danh sách KPI đa mục tiêu con
                let infoChild = await KPI365_Kpi.find({
                    conn_target: parseInt(kpi_id),
                    type_target: 1,
                    is_deleted: 0,
                }).then((data) => data);
                let temp = 0;
                for (let i = 0; i < infoChild.length; i++) {
                    let value = infoChild[i];
                    let precent = value.percent;
                    sum_precent = sum_precent + parseInt(precent);
                    let process_organization = await functions_kpi_kpi.progressParent(
                        value,
                        array_precent_target,
                        value.id,
                        array_target_id,
                        array_calculate
                    );
                    let process_parent = (process_organization / 100) * precent;
                    process = process + process_parent;
                    if (process_parent < parseInt(precent)) {
                        check = false;
                        temp = temp + process_parent;
                    } else {
                        temp = temp + parseInt(precent);
                    }
                }
            } else {
                if (staff_id == '0') {
                    // KPI tổ chức, nhóm mới hoặc cá nhân
                    process = await functions_kpi_kpi.progressParent(
                        info_kpi,
                        array_precent_target,
                        parseInt(kpi_id),
                        array_target_id,
                        array_calculate
                    );
                } else {
                    // KPI con của tổ chức nhóm mới hoặc cá nhân
                    process = await functions_kpi_kpi.progressChild(
                        target,
                        array_precent_target,
                        kpi_id,
                        staff_id,
                        array_target_id,
                        array_calculate
                    );
                }
            }
        }

        return functions.success(res, `Lấy tiến độ thành công`, {
            process,
            sum_precent,
            precent_target,
            array_target_id,
            array_calculate,
            array_precent_target,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.listConnTargetSingleKPI = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        let type_kpi = parseInt(req.body.type) || 1;
        let condition = {
            company_id: com_id,
            type_target: 0,
            is_deleted: 0,
            is_parent_deleted: 0,
        };

        if (type_kpi == 1) {
            condition.type = '1';
        } else if (type_kpi == 6) {
            condition.type = { $in: ['1', '6'] };
        } else if (type_kpi == 4 || type_kpi == 5) {
            condition.type = { $in: ['1', '4', '6'] };
        } else {
            condition.type = '-1';
        }

        const list_conn_target = await KPI365_Kpi.aggregate([{
                $sort: {
                    id: -1,
                },
            },
            {
                $match: condition,
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                },
            },
        ]);

        return functions.success(res, `Lấy danh sách thành công`, {
            list_conn_target,
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};