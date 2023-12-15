const functions = require('../../../services/CRM/CRMservice')
const PermissionAccount = require('../../../models/crm/setting/PermissionAccount')
const AdminUser = require('../../../models/Timviec365/Admin/AdminUser');

exports.createPermisionUser = async (req, res) => {
    try {
        const user = req.user.data
        const { emp_id, role_auto_call, role_mail } = req.body
        if (user.type !== 1) {
            return functions.setError(res, "Not company!");
        }
        const updated_at = Math.floor(Date.now() / 1000)
        const check_exist = await PermissionAccount.findOne({ emp_id: Number(emp_id), com_id: user.com_id })
        if (check_exist) {
            const update = {}
            if (role_auto_call) {
                update.auto_call = Number(role_auto_call)
            }
            if (role_mail) {
                update.mail = Number(role_mail)
            }
            update.updated_at = updated_at
            await PermissionAccount.updateOne({ emp_id: Number(emp_id), com_id: user.com_id }, { $set: update })
        }
        else {
            await PermissionAccount.create({
                emp_id: Number(emp_id),
                com_id: user.com_id,
                auto_call: role_auto_call ? Number(role_auto_call) : 1,
                email: role_mail ? Number(role_mail) : 1,
                updated_at
            })
        }
        return functions.success(res, "Cập nhật thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.getListPermisionUser = async (req, res) => {
    try {
        const user = req.user.data
        if (user.type !== 1) {
            return functions.setError(res, "Not company!");
        }

        const list = await PermissionAccount.aggregate([
            {
                $match: {
                    com_id: user.com_id
                }
            },
            {
                $sort: {
                    emp_id: -1
                }
            },
            {
                $lookup: {
                    'from': 'Users',
                    'localField': 'emp_id',
                    'foreignField': 'idQLC',
                    'as': 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    emp_id: 1,
                    emp_name: '$user.userName',
                    auto_call: 1,
                    mail: 1
                }
            }
        ])

        const list_emp_id = list.map(item => item.emp_id)

        const admin = await AdminUser.aggregate([
            {
                '$match': {
                    'adm_loginname': new RegExp('^kd_'),
                    'emp_id': {
                        '$exists': true,
                        '$ne': 0,
                        '$nin': list_emp_id
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
                    'emp_name': '$user.userName',
                    'auto_call': { $ifNull: ['$auto_call', 1] },
                    'mail': { $ifNull: ['$mail', 1] }
                }
            }
        ])
        return functions.success(res, "Lấy thông tin thành công", { data: [...list, ...admin] });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}
