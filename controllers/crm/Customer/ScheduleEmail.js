const axios = require('axios')
const mongoose = require('mongoose')
const Customer = require("../../../models/crm/Customer/customer");
const CustomerGroup = require("../../../models/crm/Customer/customer_group");
const ScheduleEmail = require("../../../models/crm/Customer/schedule_email");
const PermissionAccount = require('../../../models/crm/setting/PermissionAccount')
const AdminUser = require('../../../models/Timviec365/Admin/AdminUser');
const functions = require("../../../services/functions");
const { count } = require('console');
const ObjectId = mongoose.Types.ObjectId;

exports.getGroupCustomer = async (req, res) => {
    try {
        let { listGroup, timeStartUpdate, timeEndUpdate } = req.body
        const user = req.user.data

        listGroup = listGroup.split(',').map(item => Number(item))

        const time_start = Number(timeStartUpdate)
        const time_end = Number(timeEndUpdate)

        const customer = await Customer.aggregate([
            {
                '$match': {
                    emp_id: Number(user.idQLC),
                    company_id: user.com_id,
                    updated_at: { $lt: time_end, $gt: time_start },
                    group_id: { $in: listGroup },
                    email: { $ne: null, $ne: '' }
                }
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
                            'email': '$email',
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
        const time_create = Date.now()
        const user = req.user.data
        let { listGroup, timeStartUpdate, timeEndUpdate, timeStart } = req.body

        listGroup = listGroup.split(',').map(item => Number(item))
        const time_start_update = Number(timeStartUpdate)
        const time_end_update = Number(timeEndUpdate)
        const time_start = Number(timeStart)

        const customer = await Customer.find({
            emp_id: Number(user.idQLC),
            updated_at: { $lt: time_end_update, $gt: time_start_update },
            group_id: { $in: listGroup },
            email: { $ne: null, $ne: '' }
        }, {
            cus_id: 1
        }).lean()

        let list_cus_id = customer.map(item => Number(item.cus_id))
        //kt quyền có cần duyệt không
        const permission = await PermissionAccount.findOne({ emp_id: Number(user.idQLC), com_id: Number(user.com_id) })
        const status = (permission && permission.email === 1) ? 2 : 1
        await ScheduleEmail.create({
            emp_id: Number(user.idQLC),
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
                await ScheduleEmail.updateOne({ _id: item.id }, { status: Number(item.status) })
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
                await ScheduleEmail.create({
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
        condition_match.status = { $in: status }
        if (user.type === 1) {
            condition_match.comId = user.com_id
        }
        else {
            condition_match.comId = user.com_id
            condition_match.emp_id = user.idQLC
        }
        const list_schedule = await ScheduleEmail.aggregate([
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
                '$unwind': '$user'
            }, {
                '$match': {
                    // 'user.type': 2
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
                '$project': {
                    '_id': 1,
                    'emp_id': 1,
                    'emp_name': '$user.userName',
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
                    }
                }
            }
        ])
        console.log(list_schedule, user, status, condition_match)
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

exports.handle_auto_call = async () => {
    try {
        const time_now = Date.now()
        const list_schedule = await ScheduleEmail.find({ time_start: { $lt: time_now }, status: 2 }, { _id: 1, list_cus_id: 1 }).lean()
        for (let i = 0; i < list_schedule.length; i++) {
            const list_customer = await Customer.find({ cus_id: { $in: list_schedule[i].list_cus_id } }, { emp_id: 1, phone_number: 1, cus_id: 1 }).lean()
            const ds_email = list_customer.map(cus => {
                const obj = {
                    schedule_id: list_schedule[i]._id,
                    
                }
            })
            try {
                await axios({
                    method: "post",
                    url: "http://43.239.223.137:7040/luu_ds_email",
                    data: {
                        ds_email: list_customer[j].phone_number,
                    },
                    headers: { "Content-Type": "multipart/form-data" },
                })
            } catch (e) {
                console.log(e)
            }
            await ScheduleEmail.updateOne({ _id: list_schedule[i]._id }, { status: 'Hoàn thành' })
        }
    } catch (err) {
        console.log(err)
    }
}
