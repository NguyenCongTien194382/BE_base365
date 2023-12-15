const functions = require('../../../services/functions');
const QLC_OrganizeDetail = require('../../../models/qlc/OrganizeDetail');
const Users = require('../../../models/Users');
// danh sách tổ chức trong công ty
exports.getListTC = async(req, res) => {
    try {
        const { id, level, parentId, organizeDetailName } = req.body;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 20;
        let skip = (page - 1) * pageSize;
        let com_id = req.user.data.com_id;

        let condition = {
            comId: com_id,
        };
        if (id) condition.id = Number(id);
        if (level) condition.level = Number(level);
        if (parentId) condition.parentId = Number(parentId);
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
                $skip: skip,
            },
            {
                $limit: pageSize,
            },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'comId',
                    foreignField: 'idQLC',
                    let: { type: '$type' },
                    pipeline: [{ $match: { type: 1 } }],
                    as: 'comInfo',
                },
            },
            {
                $unwind: { path: '$comInfo', preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    parentId: 1,
                    organizeDetailName: 1,
                    comId: 1,
                    comName: '$comInfo.userName',
                    level: 1,
                    listOrganizeDetailId: 1,
                },
            },
        ]);

        await Promise.all(
            data.map(async(value, index) => {
                const ep_num = await Users.countDocuments({
                    'inForPerson.employee.com_id': com_id,
                    'inForPerson.employee.listOrganizeDetailId': {
                        $all: value.listOrganizeDetailId,
                    },
                    'inForPerson.employee.ep_status': 'Active',
                });
                data[index].ep_num = ep_num;

                const manager = await Users.aggregate([{
                        $match: {
                            'inForPerson.employee.com_id': com_id,
                            'inForPerson.employee.listOrganizeDetailId': {
                                $all: value.listOrganizeDetailId,
                            },
                            'inForPerson.employee.ep_status': 'Active',
                        },
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            pipeline: [{ $match: { comId: com_id } }],
                            as: 'positions',
                        },
                    },
                    {
                        $unwind: '$positions',
                    },
                    {
                        $sort: {
                            'positions.level': 1,
                        },
                    },
                    {
                        $skip: 0,
                    },
                    {
                        $limit: 2,
                    },
                    {
                        $project: {
                            _id: 0,
                            userName: 1,
                            idQLC: 1,
                            position_id: '$inForPerson.employee.position_id',
                        },
                    },
                ]);
                if (manager && Number(manager.length) === 2) {
                    if (Number(manager[0].position_id) !== Number(manager[1].position_id)) {
                        data[index].manager = manager[0].userName;
                        data[index].managerId = manager[0].idQLC;
                    }
                } else if (manager && Number(manager.length) === 1) {
                    data[index].manager = manager[0].userName;
                    data[index].managerId = manager[0].idQLC;
                }
            })
        );

        let count = await QLC_OrganizeDetail.countDocuments(condition);

        return functions.success(res, 'Danh sách tổ chức: ', { data, count });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

//Thêm tổ chức mới
exports.create = async(req, res, next) => {
    try {
        const { organizeDetailName, content } = req.body;
        const parentId = Number(req.body.parentId) || 0;
        const comId = req.body.comId || req.user.data.com_id;
        const type = req.user.data.type;
        let { level } = req.body;
        const listOrganizeDetailId = req.body.listOrganizeDetailId || [];
        if (Number(type) === 1) {
            const maxId = (await QLC_OrganizeDetail.findOne({}, { id: 1 }, { sort: { id: -1 } }).lean()) || 0;
            const id = Number(maxId.id) + 1 || 1;
            if ((comId, organizeDetailName, content)) {
                const foundGateway = await QLC_OrganizeDetail.findOne({
                    organizeDetailName: organizeDetailName,
                    comId: comId,
                    parentId: parentId,
                });
                if (foundGateway) return functions.setError(res, 'Tên tổ chức chi tiết đã tồn tại');

                if (!level || !Number(parentId)) level = 1;

                listOrganizeDetailId.push({
                    level: level,
                    organizeDetailId: id,
                });
                const newData = new QLC_OrganizeDetail({
                    id: id,
                    range: id,
                    comId: Number(comId),
                    parentId: Number(parentId) || 0,
                    organizeDetailName: organizeDetailName,
                    content: content,
                    level: level,
                    listOrganizeDetailId: listOrganizeDetailId,
                    created_time: functions.getTimeNow(),
                    update_time: functions.getTimeNow(),
                });
                await newData.save();
                return functions.success(res, 'Tạo thành công', { data: newData });
            } else return functions.setError(res, 'Không được để trống comId hoặc organizeName');
        } else return functions.setError(res, 'Tài khoản không phải Công ty');
    } catch (error) {
        console.log('error', error);
        return functions.setError(res, error.message);
    }
};