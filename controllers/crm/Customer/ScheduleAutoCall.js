const axios = require('axios')
const mongoose = require('mongoose')
const Customer = require("../../../models/crm/Customer/customer");
const CustomerGroup = require("../../../models/crm/Customer/customer_group");
const ScheduleAutoCall = require("../../../models/crm/Customer/schedule_auto_call");
const StorageAutoCall = require("../../../models/crm/Customer/storage_auto_call");
const PermissionAccount = require('../../../models/crm/setting/PermissionAccount')
const AdminUser = require('../../../models/Timviec365/Admin/AdminUser');
const functions = require("../../../services/functions");
const { count } = require('console');
const ObjectId = mongoose.Types.ObjectId;
const FormData = require('form-data');

exports.getGroupCustomer = async (req, res) => {
    try {
        let { listGroup, timeStartUpdate, timeEndUpdate, emp_id } = req.body
        const user = req.user.data
        const time_start = Number(timeStartUpdate)
        const time_end = Number(timeEndUpdate)

        let condition_match = {
            company_id: user.com_id,
            updated_at: { $lt: time_end, $gt: time_start },
            group_id: { $in: listGroup },
            phone_number: { $ne: null }
        }
        if (user.type == 1) {
            if (!emp_id.includes(2)) {
                condition_match.emp_id = { $in: emp_id }
            }
        }
        else {
            condition_match.emp_id = user.idQLC
        }

        const customer = await Customer.aggregate([
            {
                '$match': condition_match
            }, {
                '$lookup': {
                    'from': 'CRM_customer_group',
                    'foreignField': 'gr_id',
                    'localField': 'group_id',
                    'as': 'group'
                }
            }, {
                '$unwind': '$group'
            }, {
                '$match': {
                    'company_id': user.com_id
                }
            }, {
                '$group': {
                    '_id': {
                        'group_id': '$group_id',
                        'group_name': '$group.gr_name'
                    },
                    'count': {
                        '$sum': 1
                    },
                    'list': {
                        '$push': {
                            'phone_number': '$phone_number',
                            'name': '$name'
                        }
                    }
                }
            }, {
                '$project': {
                    'group_id': '$_id.group_id',
                    'group_name': '$_id.group_name',
                    'count': 1,
                    'list': 1,
                    '_id': 0
                }
            }
        ])
        return functions.success(res, "Lấy thông tin thành công", { data: customer });
    } catch (error) {
        console.error("Failed to getGroupCustomer", error);
        res.status(500).json({ error: "Failed to search getGroupCustomer" });
    }
}

//Kd đề xuất
exports.suggest = async (req, res) => {
    try {
        let status
        const time_create = Date.now()
        const user = req.user.data
        let { listGroup, timeStartUpdate, timeEndUpdate, timeStart, emp_id } = req.body

        const time_start_update = Number(timeStartUpdate)
        const time_end_update = Number(timeEndUpdate)
        const time_start = Number(timeStart)

        let condition_match = {
            company_id: user.com_id,
            updated_at: { $lt: time_end_update, $gt: time_start_update },
            group_id: { $in: listGroup },
            phone_number: { $ne: null }
        }
        if (user.type == 1) {
            if (emp_id.includes(2)) {
                const list_admin = await AdminUser.find({
                    'adm_loginname': new RegExp('^kd_'),
                    'emp_id': {
                        '$exists': true,
                        '$ne': 0
                    }
                }, { emp_id: 1 })
                list_id = list_admin.map(item => item.emp_id)
                condition_match.emp_id = { $in: list_id }
            }
            else {
                condition_match.emp_id = { $in: emp_id }
            }
        }
        else {
            condition_match.emp_id = user.idQLC
        }
        const customer = await Customer.find(condition_match, {
            cus_id: 1
        }).lean()

        let list_cus_id = customer.map(item => Number(item.cus_id))
        //kt quyền có cần duyệt không
        if (user.type == 1) {
            status = 2
        }
        else {
            const permission = await PermissionAccount.findOne({ emp_id: Number(user.idQLC), com_id: Number(user.com_id) })
            status = (permission && permission.auto_call === 1) ? 2 : 1
        }
        await ScheduleAutoCall.create({
            emp_id: user.type == 1 ? emp_id : [user.idQLC],
            comId: user.com_id,
            list_group_id: listGroup,
            time_start_update,
            time_end_update,
            time_start,
            list_cus_id,
            status_doing: 'Chưa bắt đầu',
            status,
            time_create
        })
        return functions.success(res, "Tạo đề xuất thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

//Cty duyệt
exports.duyet = async (req, res) => {
    try {
        const data = req.body.data

        const list = JSON.parse(data)
        console.log(list)
        await Promise.all([
            list.map(async item => {
                await ScheduleAutoCall.updateOne({ _id: item.id }, { status: Number(item.status) })
            })
        ])
        functions.success(res, "Cập nhật thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.AutoCall = async (req, res) => {
    try {
        let user = req.user.data
        const data = req.body.data
        const time_create = Date.now()
        const list_schedule = JSON.parse(data)
        await Promise.all([
            list_schedule.map(async schedule => {
                let { listGroup, emp_id, timeStartUpdate, timeEndUpdate, timeStart } = schedule
                listGroup = listGroup.split(',').map(item => Number(item))

                const time_start_update = Number(timeStartUpdate)
                const time_end_update = Number(timeEndUpdate)
                const time_start = Number(timeStart)

                const customer = await Customer.find({
                    emp_id: Number(emp_id),
                    updated_at: { $lt: time_end_update, $gt: time_start_update },
                    group_id: { $in: listGroup }
                }, {
                    cus_id: 1
                }).lean()

                let list_cus_id = customer.map(item => Number(item.cus_id))
                await ScheduleAutoCall.create({
                    emp_id: Number(emp_id),
                    comId: user.com_id,
                    list_group_id: listGroup,
                    time_start_update,
                    time_end_update,
                    time_start,
                    list_cus_id,
                    status: 'Chưa bắt đầu',
                    time_create
                })
            })
        ]).catch(err => console.log('AutoCall', err))
        return functions.success(res, "Thêm cuộc gọi thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

//Lấy danh sách theo trạng thái và loại tk
exports.getListSchedule = async (req, res) => {
    try {
        let condition_match = {}
        let status = req.body.status  //0,1,2 ds các trạng thái cần lấy
        const user = req.user.data

        status = status.split(',').map(item => Number(item))
        condition_match["status"] = { $in: status }
        if (user.type === 1) {
            condition_match["comId"] = user.com_id
        }
        else {
            condition_match["comId"] = user.com_id
            condition_match["emp_id"] = { $in: [user.idQLC] }
        }
        const list_schedule = await ScheduleAutoCall.aggregate([
            {
                '$match': condition_match
            }, {
                '$sort': {
                    'time_create': -1
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'emp_id',
                    'foreignField': 'idQLC',
                    'as': 'user'
                }
            }, {
                '$lookup': {
                    'from': 'CRM_customer_group',
                    'foreignField': 'list_group_id',
                    'localField': 'gr_id',
                    'as': 'customer_group'
                }
            }, {
                '$addFields': {
                    'customer_group': {
                        '$filter': {
                            'input': '$customer_group',
                            'as': 'group',
                            'cond': {
                                '$in': [
                                    '$$group.gr_id', '$list_group_id'
                                ]
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'CRM_customer',
                    'localField': 'list_cus_id',
                    'foreignField': 'cus_id',
                    'as': 'customer'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'emp_id': 1,
                    'emp_name': {
                        '$ifNull': [
                            '$user.userName', 'Tất cả'
                        ]
                    },
                    'list_group': {
                        '$map': {
                            'input': '$customer_group',
                            'as': 'group',
                            'in': {
                                'gr_id': '$$group.gr_id',
                                'gr_name': '$$group.gr_name'
                            }
                        }
                    },
                    'status': 1,
                    'status_doing': 1,
                    'time_start': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M',
                            'timezone': '+07:00',
                            'date': {
                                '$toDate': {
                                    '$multiply': [
                                        '$time_start', 1000
                                    ]
                                }
                            }
                        }
                    },
                    'time_create': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M',
                            'timezone': '+07:00',
                            'date': {
                                '$toDate': '$time_create'
                            }
                        }
                    },
                    'time_start_update': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M',
                            'timezone': '+07:00',
                            'date': {
                                '$toDate': {
                                    '$multiply': [
                                        '$time_start_update', 1000
                                    ]
                                }
                            }
                        }
                    },
                    'time_end_update': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M',
                            'timezone': '+07:00',
                            'date': {
                                '$toDate': {
                                    '$multiply': [
                                        '$time_end_update', 1000
                                    ]
                                }
                            }
                        }
                    },
                    'count_phone': {
                        '$size': '$list_cus_id'
                    },
                    'list': {
                        '$map': {
                            'input': '$customer',
                            'as': 'cus',
                            'in': {
                                'phone_number': '$$cus.phone_number',
                                'name': '$$cus.name'
                            }
                        }
                    },
                    // 'list_emp': {
                    //     '$map': {
                    //         'input': '$user',
                    //         'as': 'usr',
                    //         'in': {
                    //             'userName': '$$usr.userName',
                    //             'idQLC': '$$usr.idQLC'
                    //         }
                    //     }
                    // }
                }
            }
        ])
        return functions.success(res, "Lấy thông tin thành công", { data: list_schedule, count: list_schedule.length });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.getListAdminUsers = async (req, res, next) => {
    try {
        const admin = await AdminUser.aggregate([
            {
                '$match': {
                    'adm_loginname': new RegExp('^kd_'),
                    'emp_id': {
                        '$exists': true,
                        '$ne': 0
                    }
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'emp_id',
                    'foreignField': 'idQLC',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$project': {
                    '_id': 0,
                    'emp_id': 1,
                    'emp_name': '$user.userName'
                }
            }
        ])

        return functions.success(res, 'get admin finance is successfully', {
            admin,
        });
    } catch (e) {
        return functions.setError(res, e.message);
    }
};

exports.getListGroupCompany = async (req, res) => {
    try {
        const user = req.user.data

        const list_group = await CustomerGroup.find({
            company_id: user.com_id,
            group_parent: 429,
            is_delete: 0,
        }, { gr_id: 1, gr_name: 1 }).sort({ updated_at: -1 }).lean()

        // const list_group = await CustomerGroup.aggregate([
        //     {
        //         '$match': {
        //             'company_id': user.com_id,
        //             'is_delete': 0,
        //             'group_parent': {
        //                 '$ne': 0
        //             }
        //         }
        //     }, {
        //         '$sort': {
        //             'group_parent': -1,
        //             'updated_at': -1
        //         }
        //     }, {
        //         '$project': {
        //             '_id': 0,
        //             'gr_id': 1,
        //             'gr_name': 1
        //         }
        //     }
        // ])

        return functions.success(res, 'Lấy danh sách thành công', { list_group });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.handle_auto_call = async () => {
    try {
        console.log('Auto Call')
        const time_now = Date.now() / 1000
        const list_schedule = await ScheduleAutoCall.find({ time_start: { $lt: time_now }, status: 2, status_run: 0 }, { _id: 1, list_cus_id: 1 }).lean()
        await ScheduleAutoCall.updateMany({ time_start: { $lt: time_now }, status: 2, status_run: 0 }, { status_run: 1 })
        for (let i = 0; i < list_schedule.length; i++) {
            const list_customer = await Customer.find({ cus_id: { $in: list_schedule[i].list_cus_id } }, { emp_id: 1, phone_number: 1, cus_id: 1 }).lean()
            await ScheduleAutoCall.updateOne({ _id: list_schedule[i]._id }, { status_doing: 'Đang chạy' })
            for (let j = 0; j < list_customer.length; j++) {
                if (list_customer[j].phone_number && list_customer.phone_number !== '') {
                    console.log(list_customer[j].cus_id)
                    //bắt lỗi ko để chết vòng lặp
                    try {
                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: `http://43.239.223.185:9000/api/AutoCall`,
                            data: {
                                phone: list_customer[j].phone_number.split(',')[0],
                                ep_id: list_customer[j].emp_id,
                                cus_id: list_customer[j].cus_id,
                                group_id: list_customer[j].group_id,
                                idSchedule: list_schedule[i]._id
                            },
                        };
                        await axios.request(config);
                        await sleep(30000);
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
            await ScheduleAutoCall.updateOne({ _id: list_schedule[i]._id }, { status_doing: 'Hoàn thành' })
        }
    } catch (err) {
        console.log(err)
    }
}

exports.CreateHistoryAutoCall = async (req, res) => {
    try {
        const { idSchedule, cus_id, emp_id, group_id, state, link } = req.body

        await StorageAutoCall.create({
            idSchedule,
            cus_id: Number(cus_id),
            emp_id: Number(emp_id),
            group_id: Number(group_id),
            timeStart: Math.floor(Date.now() / 1000),
            state,
            link,
        })
        return functions.success(res, "Cập nhật thông tin thành công");
    } catch (e) {
        return functions.setError(res, err.message);
    }
}

exports.UpdateTextAutoCall = async (req, res) => {
    try {
        const { text, idSchedule, cus_id } = req.body

        await StorageAutoCall.updateOne({ idSchedule, cus_id: Number(cus_id) }, { $set: { text: text } })
        await Customer.updateOne({ cus_id: Number(cus_id) }, { $set: { text_record: text } })
        return functions.success(res, "Cập nhật thông tin thành công");
    } catch (e) {
        return functions.setError(res, err.message);
    }
}

exports.GetStorageAutoCall = async (req, res) => {
    try {
        const { idSchedule, status, timeStart, timeEnd, emp_id } = req.body
        const condition_match = {}
        if (idSchedule) {
            condition_match['idSchedule'] = idSchedule
        }
        if (status) {
            condition_match['state'] = status
        }
        if (emp_id) {
            condition_match['emp_id'] = emp_id
        }
        if (timeStart && timeEnd) {
            condition_match['timeStart'] = { $gt: timeStart, $lt: timeEnd }
        }
        else if (timeStart) {
            condition_match['timeStart'] = { $gt: timeStart }
        }
        else if (timeEnd) {
            condition_match['timeStart'] = { $lt: timeEnd }
        }

        const storage = await StorageAutoCall.aggregate([
            {
                $match: condition_match
            },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'emp_id',
                    foreignField: 'idQLC',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'CRM_customer',
                    localField: 'cus_id',
                    foreignField: 'cus_id',
                    as: 'customer'
                }
            },
            {
                $unwind: {
                    path: '$customer',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'CRM_customer_group',
                    localField: 'group_id',
                    foreignField: 'gr_id',
                    as: 'group'
                }
            },
            {
                $unwind: {
                    path: '$group',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    'user.type': 2
                }
            },
            {
                $sort: {
                    timeStart: -1
                }
            },
            {
                $limit: 1000
            },
            {
                $project: {
                    emp_id: '$emp_id',
                    emp_name: '$user.userName',
                    customer_name: '$customer.name',
                    customer_phone: '$customer.phone_number',
                    start_time: {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M',
                            'timezone': '+07:00',
                            'date': {
                                '$toDate': {
                                    '$multiply': [
                                        '$timeStart', 1000
                                    ]
                                }
                            }
                        }
                    },
                    group_name: '$group.gr_name',
                    state: '$state',
                    link: '$link',
                    text: '$text',
                }
            }
        ])
        return functions.success(res, 'Lấy danh sách thành công', { list: storage });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}
