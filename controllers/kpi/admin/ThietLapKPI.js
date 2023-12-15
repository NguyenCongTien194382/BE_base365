const functions = require('../../../services/functions');
const functions_kpi = require('../../../services/kpi/functions');
const functions_kpi_kpi = require('../../../services/kpi/KPI');

const KPI365_Organization = require('../../../models/kpi/KPI365_Organization');
const KPI365_NewGroup = require('../../../models/kpi/KPI365_NewGroup');
const KPI365_ActivityDiary = require('../../../models/kpi/KPI365_ActivityDiary');
const KPI365_Kpi = require('../../../models/kpi/KPI365_Kpi');
const KPI365_DeletedData = require('../../../models/kpi/KPI365_DeletedData');
const KPI365_TargetUnit = require('../../../models/kpi/KPI365_TargetUnit');

const Users = require('../../../models/Users');
const QLC_OrganizeDetail = require('../../../models/qlc/OrganizeDetail');

exports.capNhatTC = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        let { organization_id, array_ql, array_ntd } = req.body;
        if (!organization_id || !parseInt(organization_id))
            return functions.setError(res, 'Bạn chưa nhập id tổ chức', 400);
        const organizeDetailName = await QLC_OrganizeDetail.findOne({ organization_id: parseInt(organization_id) })
            .then((data) => {
                return organizeDetailName;
            })
            .catch((err) => {
                return '';
            });
        let data_insert = {};
        const now = functions.getTimeNow();
        if (array_ql == '' && array_ntd == '') {
            await KPI365_Organization.deleteOne({
                organization_id: parseInt(organization_id),
                com_id: parseInt(com_id),
            });
        } else {
            data_insert.com_id = com_id;
            const count = await KPI365_Organization.countDocuments({
                organization_id: parseInt(organization_id),
                com_id: parseInt(com_id),
            });
            if (count == 0) {
                data_insert['organization_id'] = parseInt(organization_id);
                if (array_ql != '') {
                    data_insert.manage_id = array_ql;
                }
                if (array_ntd != '') {
                    data_insert.followers_id = array_ntd;
                }
                data_insert.created_at = now;
                data_insert.updated_at = now;
                const { MaxIdOrganization } = await functions_kpi.getMaxId();

                data_insert.id = MaxIdOrganization + 1;
                let organization = new KPI365_Organization(data_insert);
                await organization.save();
            } else {
                data_insert.manage_id = array_ql != '' ? array_ql : '0';
                data_insert.followers_id = array_ntd != '' ? array_ntd : '0';
                data_insert.updated_at = now;
                await KPI365_Organization.updateOne({ organization_id: parseInt(organization_id) }, data_insert);
            }

            let maxIdAD = await functions_kpi.getMaxId().then((data) => {
                return data.MaxIdActivityDiary;
            });
            const data_insert_diary = new KPI365_ActivityDiary({
                id: maxIdAD + 1,
                user_id: idQLC,
                type: 4,
                content: `Cập nhật tổ chức ${organizeDetailName}`,
                created_at: now,
                date: functions_kpi.getDate(now * 1000),
                login_type: type,
            });
            await data_insert_diary.save();

            return functions.success(res, `Thiết lập cho tổ chức ${organizeDetailName} thành công`, {
                data_insert_diary,
                data_insert,
                organizeDetailName,
            });
        }
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.getListManager = async(req, res) => {
    try {
        let { organization_id, organizeDetailName } = req.body;
        let { com_id, idQLC, type } = req.user.data;

        let condition = {
            comId: com_id,
            idQLC: { $ne: 0 },
        };
        if (organization_id) condition.id = parseInt(organization_id);
        if (organizeDetailName)
            condition.organizeDetailName = {
                $regex: new RegExp(organizeDetailName, 'i'),
            };
        const data = await QLC_OrganizeDetail.aggregate([{
                $sort: { level: 1 },
            },
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: 'KPI365_Organization',
                    let: { comId: '$comId', id: '$id' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$organization_id', '$$id'] }, // So sánh a và c
                                    { $eq: ['$com_id', '$$comId'] }, // So sánh b và d
                                ],
                            },
                        },
                    }, ],
                    as: 'kpi365_organization',
                },
            },
            {
                $unwind: { path: '$kpi365_organization', preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    organizeDetailName: 1,
                    manage_id: '$kpi365_organization.manage_id',
                    followers_id: '$kpi365_organization.followers_id',
                },
            },
        ]);

        let list_manage = [];
        for (let i = 0; i < data.length; i++) {
            let value = data[i];
            let conditions = {
                'inForPerson.employee.com_id': com_id,
                'inForPerson.employee.ep_status': 'Active',
            };
            let organization_info = await QLC_OrganizeDetail.findOne({ id: parseInt(value.id), comId: com_id }).then(
                (data) => data
            );
            conditions['inForPerson.employee.listOrganizeDetailId'] = { $all: organization_info.listOrganizeDetailId };

            const total = await Users.countDocuments(conditions);
            if (value.manage_id && value.manage_id != '0') {
                let arr_manage_str = value.manage_id.split(',');
                let arr_manage_id = arr_manage_str.map((str) => parseInt(str, 10));
                let manage_id = await Users.aggregate([
                    { $sort: { idQLC: -1 } },
                    { $match: { idQLC: { $in: arr_manage_id }, type: 2 } },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            let: { comId: '$comId' },
                            pipeline: [{ $match: { comId: com_id } }],
                            as: 'positions',
                        },
                    },
                    { $unwind: { path: '$positions', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            fromWeb: 1,
                            createdAt: 1,
                            type: 1,
                            idQLC: 1,
                            userName: 1,
                            avatarUser: 1,
                            position: '$positions.positionName',
                        },
                    },
                ]);
                let list_manage = manage_id.map((item) => {
                    if (item.avatarUser) {
                        item.avatarUser = functions_kpi.createLinkFileEmpQLC(
                            item._id,
                            item.type,
                            item.fromWeb,
                            item.createdAt,
                            item.userName,
                            item.avatarUser
                        );
                    }
                    delete item._id;
                    delete item.fromWeb;
                    delete item.createdAt;
                    delete item.type;
                    return item;
                });

                value.manage_id = list_manage;
            }
            if (value.manage_id == '0') value.manage_id = [];
            if (value.followers_id && value.followers_id != '0') {
                let arr_followers_str = value.followers_id.split(',');
                let arr_followers_id = arr_followers_str.map((str) => parseInt(str, 10));
                let followers_id = await Users.aggregate([
                    { $sort: { idQLC: -1 } },
                    { $match: { idQLC: { $in: arr_followers_id }, type: 2 } },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            let: { comId: '$comId' },
                            pipeline: [{ $match: { comId: com_id } }],
                            as: 'positions',
                        },
                    },
                    { $unwind: { path: '$positions', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            fromWeb: 1,
                            createdAt: 1,
                            type: 1,
                            idQLC: 1,
                            userName: 1,
                            avatarUser: 1,
                            position: '$positions.positionName',
                        },
                    },
                ]);
                let list_followers = followers_id.map((item) => {
                    if (item.avatarUser) {
                        item.avatarUser = functions_kpi.createLinkFileEmpQLC(
                            item._id,
                            item.type,
                            item.fromWeb,
                            item.createdAt,
                            item.userName,
                            item.avatarUser
                        );
                    }
                    delete item._id;
                    delete item.fromWeb;
                    delete item.createdAt;
                    delete item.type;
                    return item;
                });
                value.followers_id = list_followers;
            }
            if (value.followers_id == '0') value.followers_id = [];
            value.ep_num = total;

            list_manage.push(value);
        }

        return functions.success(res, `Lấy danh sách người quản lý thành công`, {
            list_manage,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.addNewGroupKPI = async(req, res) => {
    try {
        let { group_name, array_ql, array_ntd, array_tv } = req.body;
        if (!group_name || group_name == '')
            return functions.setError(res, 'Trường group_name là trường bắt buộc', 400);
        let { com_id, idQLC, type } = req.user.data;
        const now = functions.getTimeNow();
        let data_insert = {
            com_id: com_id,
            group_name: group_name,
            created_at: now,
            updated_at: now,
            is_deleted: 0,
        };

        if (array_ql && array_ql != '') {
            data_insert.manage_id = array_ql;
        }

        if (array_ntd && array_ntd != '') {
            data_insert.followers_id = array_ntd;
        }

        if (array_tv && array_tv != '') {
            data_insert.staff_id = array_tv;
        }

        let maxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let maxIdNG = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdNewGroup;
        });

        let data_insert_new_group = new KPI365_NewGroup({
            id: maxIdNG + 1,
            ...data_insert,
        });

        await data_insert_new_group.save();

        let data_insert_diary = new KPI365_ActivityDiary({
            id: maxIdAD + 1,
            user_id: idQLC,
            type: 4,
            content: `Thêm nhóm mới ${group_name}`,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();

        return functions.success(res, 'Thêm mới nhóm KPI mới thành công', {
            data_insert,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.getListManagerNewGroup = async(req, res) => {
    try {
        let { com_id } = req.user.data;
        let { id, group_name } = req.body;
        let condition = {
            is_deleted: 0,
            com_id: com_id,
        };
        if (id) condition.id = parseInt(id);
        if (group_name)
            condition.group_name = {
                $regex: new RegExp(group_name, 'i'),
            };
        let new_group = await KPI365_NewGroup.aggregate([
            { $sort: { id: -1 } },
            {
                $match: condition,
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ]);
        let count = await KPI365_NewGroup.countDocuments(condition);
        for (let i = 0; i < new_group.length; i++) {
            let group = new_group[i];
            if (group.manage_id) {
                let arr_manage_id_str = group.manage_id.split(',');
                let arr_manage_id = arr_manage_id_str.map((item) => parseInt(item));
                let arr_manage_inFo = await Users.aggregate([
                    { $sort: { idQLC: -1 } },
                    {
                        $match: {
                            idQLC: { $in: arr_manage_id },
                            type: 2,
                        },
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            let: { comId: '$comId' },
                            pipeline: [{ $match: { comId: com_id } }],
                            as: 'positions',
                        },
                    },
                    {
                        $unwind: { path: '$positions', preserveNullAndEmptyArrays: true },
                    },
                    {
                        $project: {
                            _id: 1,
                            fromWeb: 1,
                            createdAt: 1,
                            type: 1,
                            userName: 1,
                            idQLC: 1,
                            positionName: '$positions.positionName',
                            avatarUser: 1,
                        },
                    },
                ]);
                let list_manage = arr_manage_inFo.map((item) => {
                    if (item.avatarUser) {
                        item.avatarUser = functions_kpi.createLinkFileEmpQLC(
                            item._id,
                            item.type,
                            item.fromWeb,
                            item.createdAt,
                            item.userName,
                            item.avatarUser
                        );
                    }
                    delete item._id;
                    delete item.fromWeb;
                    delete item.createdAt;
                    delete item.type;
                    return item;
                });
                group.arr_manage_inFo = list_manage;
            }
            if (group.followers_id) {
                let arr_followers_id_str = group.followers_id.split(',');
                let arr_followers_id = arr_followers_id_str.map((item) => parseInt(item));
                let arr_followers_inFo = await Users.aggregate([
                    { $sort: { idQLC: -1 } },
                    {
                        $match: {
                            idQLC: { $in: arr_followers_id },
                            type: 2,
                        },
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            let: { comId: '$comId' },
                            pipeline: [{ $match: { comId: com_id } }],
                            as: 'positions',
                        },
                    },
                    {
                        $unwind: { path: '$positions', preserveNullAndEmptyArrays: true },
                    },
                    {
                        $project: {
                            _id: 1,
                            fromWeb: 1,
                            createdAt: 1,
                            type: 1,
                            userName: 1,
                            idQLC: 1,
                            positionName: '$positions.positionName',
                            avatarUser: 1,
                        },
                    },
                ]);
                let list_followers = arr_followers_inFo.map((item) => {
                    if (item.avatarUser) {
                        item.avatarUser = functions_kpi.createLinkFileEmpQLC(
                            item._id,
                            item.type,
                            item.fromWeb,
                            item.createdAt,
                            item.userName,
                            item.avatarUser
                        );
                    }
                    delete item._id;
                    delete item.fromWeb;
                    delete item.createdAt;
                    delete item.type;
                    return item;
                });
                group.arr_followers_inFo = list_followers;
            }
            if (group.staff_id) {
                let arr_staff_id_str = group.staff_id.split(',');
                let arr_staff_id = arr_staff_id_str.map((item) => parseInt(item));
                let arr_staff_inFo = await Users.aggregate([
                    { $sort: { idQLC: -1 } },
                    {
                        $match: {
                            idQLC: { $in: arr_staff_id },
                            type: 2,
                        },
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            let: { comId: '$comId' },
                            pipeline: [{ $match: { comId: com_id } }],
                            as: 'positions',
                        },
                    },
                    {
                        $unwind: { path: '$positions', preserveNullAndEmptyArrays: true },
                    },
                    {
                        $project: {
                            _id: 1,
                            fromWeb: 1,
                            createdAt: 1,
                            type: 1,
                            userName: 1,
                            idQLC: 1,
                            positionName: '$positions.positionName',
                            avatarUser: 1,
                        },
                    },
                ]);
                let list_staff = arr_staff_inFo.map((item) => {
                    if (item.avatarUser) {
                        item.avatarUser = functions_kpi.createLinkFileEmpQLC(
                            item._id,
                            item.type,
                            item.fromWeb,
                            item.createdAt,
                            item.userName,
                            item.avatarUser
                        );
                    }
                    delete item._id;
                    delete item.fromWeb;
                    delete item.createdAt;
                    delete item.type;
                    return item;
                });
                group.arr_staff_inFo = list_staff;
            }
            new_group[i] = group;
        }

        return functions.success(res, 'Lấy danh sách nhóm KPI mới thành công', {
            new_group,
            count,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.capNhatNewGroupKPI = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;
        let { array_ql, array_ntd, array_tv, id, group_name } = req.body;
        if (id == undefined || !parseInt(id)) return functions.setError(res, 'Bạn chưa nhập id nhóm mới', 400);

        let data_insert = {};
        const now = functions.getTimeNow();

        data_insert.com_id = com_id;
        data_insert.id = parseInt(id);
        data_insert.group_name = group_name;
        data_insert.manage_id = array_ql != '' ? array_ql : '0';
        data_insert.followers_id = array_ntd != '' ? array_ntd : '0';
        data_insert.staff_id = array_tv != '' ? array_tv : '0';
        data_insert.updated_at = now;
        await KPI365_NewGroup.updateOne({ id: parseInt(id) }, data_insert);

        let maxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        const data_insert_diary = new KPI365_ActivityDiary({
            id: maxIdAD + 1,
            user_id: idQLC,
            type: 4,
            content: `Cập nhật nhóm mới ${group_name}`,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });

        await data_insert_diary.save();

        return functions.success(res, `Bạn đã cập nhật thành công ${group_name}`, {
            data_insert_diary,
            data_insert,
            group_name,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.deleteNewGroupKPI = async(req, res) => {
    try {
        let { com_id, idQLC, type } = req.user.data;

        let { id, status } = req.body;
        if (id == undefined || id == '') return functions.setError(res, 'Bạn chưa nhập id nhóm KPI mới', 400);

        const now = functions.getTimeNow();
        const new_group = await KPI365_NewGroup.findOne({ id: parseInt(id) });
        const group_name = new_group.group_name;
        const user = await Users.findOne({ idQLC: idQLC, type: type }).select('userName');
        let msg = '';
        if (status == 1) {
            const kpi_don = await KPI365_Kpi.find({ type_target: 0, group_id: id, group_type: 1, is_deleted: 0 });
            for (let i = 0; i < kpi_don.length; i++) {
                let value = kpi_don[i];
                let kpi_name = value.kpi_name;

                await KPI365_Kpi.updateOne({ id: value.id }, { is_deleted: 1 });

                const { MaxIdActivityDiary, MaxIdDeleteData } = await functions_kpi.getMaxId().then((data) => data);
                let deleted_data = new KPI365_DeletedData({
                    id: MaxIdDeleteData + 1,
                    type: 1,
                    created_at: now,
                    deleted_id: value.id,
                    date: functions_kpi.getDate(now * 1000),
                    com_id: com_id,
                    user_name: user.userName,
                    content: `KPI ${kpi_name}`,
                });
                let data_insert_diary = new KPI365_ActivityDiary({
                    id: MaxIdActivityDiary + 1,
                    user_id: idQLC,
                    type: 4,
                    content: `Xóa KPI ${kpi_name}`,
                    created_at: now,
                    date: functions_kpi.getDate(now * 1000),
                    login_type: type,
                });
                await data_insert_diary.save();
                await deleted_data.save();

                let conn_target = value.conn_target;
                let count = await KPI365_Kpi.countDocuments({
                    type_target: 0,
                    conn_target: conn_target,
                    is_deleted: 0,
                });

                if (count == 0) {
                    await KPI365_Kpi.updateMany({ id: conn_target }, { is_last: 0 });
                }
            }

            const kpi_da = await KPI365_Kpi.find({ type_target: 1, group_id: id, group_type: 1, is_deleted: 0 });
            for (let i = 0; i < kpi_da.length; i++) {
                let value = kpi_da[i];

                let conn_target = value.conn_target;
                let count = await KPI365_Kpi.countDocuments({
                    type_target: 1,
                    conn_target: conn_target,
                    is_deleted: 0,
                });

                if (count == 0) {
                    await KPI365_Kpi.updateMany({ id: conn_target }, { is_last: 0 });
                }

                if (count <= 1) {
                    await functions_kpi_kpi.delete_kpi_multi_target(conn_target, 1);
                } else {
                    await functions_kpi_kpi.delete_kpi_multi_target(value.id, 1);
                }

                msg = 'Xóa nhóm mới ' + group_name;
                const { MaxIdDeleteData } = await functions_kpi.getMaxId().then((data) => data);

                if (type == 1) {
                    user_name = await Users.findOne({ type: 1, idQLC: idQLC }).then((data) => data.userName);
                }
                if (type == 2) {
                    user_name = await Users.findOne({ type: 2, idQLC: idQLC }).then((data) => data.userName);
                }
                let deleted_data = new KPI365_DeletedData({
                    id: MaxIdDeleteData + 1,
                    type: 3,
                    created_at: now,
                    deleted_id: id,
                    date: functions_kpi.getDate(now * 1000),
                    com_id: com_id,
                    user_name: user_name,
                    content: 'Nhóm ' + group_name,
                });
                await deleted_data.save();
            }
        } else if (status == 0) {
            msg = 'Khôi phục nhóm mới ' + group_name;
            await KPI365_DeletedData.delete({ deleted_id: id, type: 3 });
        } else if (status == 2) {
            msg = 'Xóa vĩnh viễn nhóm mới ' + group_name;
            await KPI365_DeletedData.delete({ deleted_id: id, type: 3 });
        }
        let data_insert_diary = new KPI365_ActivityDiary({
            user_id: idQLC,
            type: 4,
            content: msg,
            created_at: time(),
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });
        await data_insert_diary.save();
        return functions.success(res, msg, {});
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.getListUnit = async(req, res) => {
    try {
        const { idQLC, type, com_id } = req.user.data;
        const { type_unit, id } = req.body;

        let condition = {
            com_id: com_id,
        };
        if (type_unit != undefined && type_unit != '') condition.type_unit = type_unit;
        if (id != undefined && id != '') condition.id = id;

        let list = await KPI365_TargetUnit.find(condition).sort({ type_unit: 1 });
        let count = await KPI365_TargetUnit.countDocuments(condition);

        return functions.success(res, 'Lấy danh sách chỉ tiêu thành công', {
            list,
            count,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.addUnit = async(req, res) => {
    try {
        const { idQLC, type, com_id } = req.user.data;
        const { type_unit, name, unit, note, formula } = req.body;
        if (
            type_unit == '' ||
            type_unit == undefined ||
            name == undefined ||
            name == '' ||
            unit == undefined ||
            unit == ''
        )
            return functions.setError(res, 'Chưa truyền đủ trường', 400);
        let MaxIdTU = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdTargetUnit;
        });
        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        const now = functions.getTimeNow();
        let new_unit = new KPI365_TargetUnit({
            id: MaxIdTU + 1,
            type_unit: type_unit,
            name: name,
            unit: unit,
            formula: formula || '',
            note: note || '',
            created_at: now,
            com_id: com_id,
        });

        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 4,
            content: 'Thêm mới chỉ tiêu viễn cảnh ' + name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });

        await data_insert_diary.save();
        await new_unit.save();

        return functions.success(res, 'Thêm mới chỉ tiêu thành công', {
            new_unit,
            data_insert_diary,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};

exports.updateUnit = async(req, res) => {
    try {
        const { idQLC, type, com_id } = req.user.data;
        const { id, name, unit, note, formula } = req.body;
        if (id == '' || id == undefined || name == undefined || name == '' || unit == undefined || unit == '')
            return functions.setError(res, 'Chưa truyền đủ trường', 400);
        const now = functions.getTimeNow();
        let update_unit = {
            name: name,
            unit: unit,
            formula: formula || '',
            note: note || '',
            updated_at: now,
        };
        await KPI365_TargetUnit.updateOne({ id: parseInt(id) }, update_unit);

        let condition = {
            type_target: 1,
            conn_target: 0,
            company_id: com_id,
            end_date: {
                $gte: now,
            },
            type_unit_arr: id.toString(),
        };

        let inFo = await KPI365_Kpi.aggregate([{
                $addFields: {
                    type_unit_arr: {
                        $split: ['$type_unit', ','],
                    },
                },
            },
            {
                $match: condition,
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ]);

        for (let i = 0; i < inFo.length; i++) {
            let kpi = inFo[i];
            let kpi_id = kpi.id;
            let array_target_id = kpi.target_id.split(',');
            let array_calculate = kpi.calculate.split(',');
            let location = array_target_id.indexOf(id.toString());
            if (array_calculate[location] == 1) {
                let array_formula = kpi.formula;
                array_formula[location] = formula;
                let data = array_formula;
                await KPI365_Kpi.update({ id: kpi_id }, { formula: data });
                await KPI365_Kpi.update({ conn_target: kpi_id }, { formula: data });
            }
        }

        let MaxIdAD = await functions_kpi.getMaxId().then((data) => {
            return data.MaxIdActivityDiary;
        });
        let data_insert_diary = new KPI365_ActivityDiary({
            id: MaxIdAD + 1,
            user_id: idQLC,
            type: 4,
            content: 'Chỉnh sửa chỉ tiêu viễn cảnh ' + name,
            created_at: now,
            date: functions_kpi.getDate(now * 1000),
            login_type: type,
        });

        await data_insert_diary.save();
        return functions.success(res, 'Chỉnh sửa thành công chỉ tiêu viễn cảnh', {
            update_unit,
            data_insert_diary,
            inFo,
        });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
};