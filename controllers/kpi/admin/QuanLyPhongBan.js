const functions = require('../../../services/functions');
const functions_kpi = require('../../../services/kpi/functions');

const QLC_Department = require('../../../models/qlc/Deparment');
const QLC_Team = require('../../../models/qlc/Team')
const QLC_Group = require('../../../models/qlc/Group')
const Users = require('../../../models/Users')

//Lấy danh sách phòng ban
exports.getListPB = async (req, res) => {
    try {
        //Data 
        let { dep_id } = req.body;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 20;
        let skip = (page - 1) * pageSize;
        //Phân quyền
        let { type, com_id, idQLC } = req.user.data;
        if (com_id == undefined) com_id = req.user.data.idQLC;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);

        let lists = []
        let new_list = []
        let match = {}
        if (dep_id)
            match = { com_id: com_id, dep_id: dep_id }
        else
            match = { com_id: com_id }

        lists = await QLC_Department.find(match).sort({ dep_id: 1 }).skip(skip).limit(pageSize);
        for (let index = 0; index < lists.length; index++) {
            let element = lists[index];
            let total_emp = await Users.countDocuments({
                'inForPerson.employee.com_id': com_id,
                'inForPerson.employee.dep_id': element.dep_id,
                type: 2,
                'inForPerson.employee.ep_status': 'Active',
            })

            let manager = await Users.findOne(
                {
                    'inForPerson.employee.com_id': com_id,
                    'inForPerson.employee.dep_id': element.dep_id,
                    type: 2,
                    'inForPerson.employee.ep_status': 'Active',
                    'inForPerson.employee.position_id': 6,
                },
                { userName: 1 }
            )
            manager = manager ? manager : "";

            let deputy = await Users.findOne(
                {
                    'inForPerson.employee.com_id': com_id,
                    'inForPerson.employee.dep_id': element.dep_id,
                    type: 2,
                    'inForPerson.employee.ep_status': 'Active',
                    'inForPerson.employee.position_id': 5,
                },
                { userName: 1 }
            )
            deputy = deputy ? deputy : "";

            new_list.push({
                dep_id: element.dep_id,
                com_id: element.com_id,
                dep_name: element.dep_name,
                dep_create_time: element.dep_create_time,
                manager_id: element.manager_id,
                dep_order: element.dep_order,
                deputy: deputy,
                manager: manager,
                total_emp: total_emp
            })
        }

        return functions.success(res, "Lấy danh sách phòng ban", { data: new_list, com_id })
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}

//Lấy danh sách tổ
exports.getListTo = async (req, res) => {
    try {
        //Data 
        let { nest_id, dep_id } = req.body;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 20;
        let skip = (page - 1) * pageSize;
        //Phân quyền
        let { type, com_id, idQLC } = req.user.data;
        if (com_id == undefined) com_id = req.user.data.idQLC;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);

        let lists = []
        let new_list = []
        let match = { com_id: com_id }
        if (dep_id) match.dep_id = Number(dep_id)
        if (nest_id) match.team_id = Number(nest_id)

        const data = await QLC_Team.aggregate([
            { $match: match },
            { $sort: { team_id: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "QLC_Deparments",
                    foreignField: "dep_id",
                    localField: "dep_id",
                    as: "deparment",
                }
            },
            { $unwind: "$deparment" },
            {
                $project: {
                    _id: 0,
                    team_id: 1,
                    team_name: 1,
                    dep_id: "$deparment.dep_id",
                    dep_name: "$deparment.dep_name",
                }
            }
        ]);
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            element.total_emp = await Users.countDocuments({
                "inForPerson.employee.com_id": com_id,
                "inForPerson.employee.team_id": element.team_id,
                type: 2,
                "inForPerson.employee.ep_status": "Active"
            });
            const manager = await Users.findOne({
                "inForPerson.employee.com_id": com_id,
                "inForPerson.employee.team_id": element.team_id,
                type: 2,
                "inForPerson.employee.ep_status": "Active",
                "inForPerson.employee.position_id": 13,
            }, { userName: 1 });
            element.manager = (manager) ? manager.userName : "";

            const deputy = await Users.findOne({
                "inForPerson.employee.com_id": com_id,
                "inForPerson.employee.dep_id": element.dep_id,
                type: 2,
                "inForPerson.employee.ep_status": "Active",
                "inForPerson.employee.position_id": 12,
            }, { userName: 1 });
            element.deputy = (deputy) ? deputy.userName : "";

            new_list.push({
                nest_id: element.team_id,
                nest_name: element.team_name,
                dep_id: element.dep_id,
                dep_name: element.dep_name,
                manager: element.manager,
                deputy: element.deputy,
                total_emp: element.total_emp
            })
        }

        return functions.success(res, "Lấy danh sách phòng ban", { data: new_list })
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}

//Lấy danh sách nhóm
exports.getListNhom = async (req, res) => {
    try {
        //Data 
        let { nest_id, dep_id, group_id } = req.body;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 20;
        let skip = (page - 1) * pageSize;
        //Phân quyền
        let { type, com_id, idQLC } = req.user.data;
        if (com_id == undefined) com_id = req.user.data.idQLC;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);

        let lists = []
        let new_list = []
        let match = { com_id: com_id }
        if (dep_id) match.dep_id = Number(dep_id)
        if (nest_id) match.team_id = Number(nest_id)
        if (group_id) match.gr_id = Number(group_id)

        const data = await QLC_Group.aggregate([
            { $match: match },
            { $sort: { gr_id: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'QLC_Deparments',
                    foreignField: 'dep_id',
                    localField: 'dep_id',
                    as: 'deparment',
                },
            },
            { $unwind: '$deparment' },
            {
                $lookup: {
                    from: 'QLC_Teams',
                    foreignField: 'team_id',
                    localField: 'team_id',
                    as: 'team',
                },
            },
            { $unwind: '$team' },
            {
                $project: {
                    _id: 0,
                    gr_id: 1,
                    gr_name: 1,
                    nest_id: '$team.team_id',
                    nest_name: '$team.team_name',
                    dep_id: '$deparment.dep_id',
                    dep_name: '$deparment.dep_name',
                },
            },
        ])

        for (let index = 0; index < data.length; index++) {
            const element = data[index]
            element.total_emp = await Users.countDocuments({
                'inForPerson.employee.com_id': com_id,
                'inForPerson.employee.group_id': element.gr_id,
                // type: 4,
                'inForPerson.employee.ep_status': 'Active',
            })

            const manager = await Users.findOne(
                {
                    'inForPerson.employee.com_id': com_id,
                    'inForPerson.employee.group_id': element.gr_id,
                    type: 20,
                    'inForPerson.employee.ep_status': 'Active',
                    'inForPerson.employee.position_id': 6,
                },
                { userName: 1 }
            )
            element.manager = manager ? manager.userName : ''

            const deputy = await Users.findOne(
                {
                    'inForPerson.employee.com_id': com_id,
                    'inForPerson.employee.dep_id': element.dep_id,
                    type: 2,
                    'inForPerson.employee.ep_status': 'Active',
                    'inForPerson.employee.position_id': 5,
                },
                { userName: 1 }
            )
            element.deputy = deputy ? deputy.userName : ''

            new_list.push({
                nhom_id: element.gr_id,
                nhom_name: element.gr_name,
                dep_id: element.dep_id,
                dep_name: element.dep_name,
                nest_id: element.nest_id,
                nest_name: element.nest_name,
                manager: element.manager,
                deputy: element.deputy,
                total_emp: element.total_emp,
            })
        }

        return functions.success(res, "Lấy danh sách nhóm", { data: new_list })
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}

//Lấy danh sách nhân viên thuộc phòng ban
exports.getListNV = async (req, res) => {
    try {
        //Data 
        let { group_id, nest_id, dep_id, idNV, active, name } = req.body;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 20;
        let skip = (page - 1) * pageSize;
        //Phân quyền
        let { type, com_id, idQLC } = req.user.data;
        if (com_id == undefined) com_id = req.user.data.idQLC;
        const data_login = await functions_kpi.getInfoCom(type, idQLC, com_id);

        let count = 0
        let list = []
        let new_list = []
        let match = { 'inForPerson.employee.com_id': com_id, type: 2 }

        if (dep_id) match['inForPerson.employee.dep_id'] = Number(dep_id)
        if (nest_id) match['inForPerson.employee.team_id'] = Number(nest_id)
        if (group_id) match['inForPerson.employee.group_id'] = Number(group_id)
        if (idNV) match.idQLC = Number(idNV)
        if (active && Number(active) == 1) match['inForPerson.employee.ep_status'] = "Active"
        if (name) match.userName = { $regex: new RegExp(String(name), 'i') }

        list = await Users.aggregate([
            { $match: match },
            { $sort: { idQLC: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "QLC_Deparments",
                    localField: "inForPerson.employee.dep_id",
                    foreignField: "dep_id",
                    as: "deparment"
                }
            },
            {
                $unwind: { path: "$deparment", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "QLC_Teams",
                    localField: "inForPerson.employee.team_id",
                    foreignField: "team_id",
                    as: "team"
                }
            },
            {
                $unwind: { path: "$team", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "QLC_Groups",
                    localField: "inForPerson.employee.group_id",
                    foreignField: "gr_id",
                    as: "Groups"
                }
            },
            {
                $unwind: { path: "$Groups", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    idQLC: 1,
                    email: 1,
                    name: "$userName",
                    phone: 1,
                    image: "$avatarUser",
                    address: 1,
                    education: "$inForPerson.account.education",
                    exp: "$inForPerson.account.experience",
                    birthday: "$inForPerson.account.birthday",
                    married: "$inForPerson.account.married",
                    gender: "$inForPerson.account.gender",
                    role_id: "$role",
                    position_id: "$inForPerson.employee.position_id",
                    dep_id: "$inForPerson.employee.dep_id",
                    create_time: "$createdAt",
                    group_id: "$inForPerson.employee.group_id",
                    nest_id: "$inForPerson.employee.team_id",
                    status: "$inForPerson.employee.ep_status",
                    start_working_time: "$inForPerson.employee.start_working_time",
                    allow_update_face: "$inForPerson.employee.allow_update_face",
                    dep_name: "$deparment.dep_name",
                    gr_name: "$Groups.gr_name",
                    nest_name: "$team.team_name"
                }
            },
        ]);

        new_list = list.map((item) => {
            let img = "";
            if (item.image) img = functions_kpi.createLinkFileEmpQLC(item.idQLC, item.image)
            return {
                ...item,
                image: img
            };
        });
        count = await Users.countDocuments(match);

        return functions.success(res, "Lấy danh sách nhân viên thành công", { data: { new_list, count } })
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}
