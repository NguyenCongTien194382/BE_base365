
const functions = require('../../services/functions')
const Users = require('../../models/Users')
exports.get_type_timesheet = async (req, res) => {
    const com_id = req.user.data.idQLC;
    const type = req.user.data.type;
    if (type === 1) {
        const info_company = await Users.findOne({
            idQLC: com_id,
            type: 1
        })
        if (info_company) {
            if (info_company.inForCompany && info_company.inForCompany.cds && !info_company.inForCompany.cds.type_timesheet) {
                await Users.updateOne(
                    {
                        idQLC: com_id,
                        type: 1
                    },
                    {
                        $set: {
                            "inForCompany.cds.type_timesheet": 3
                        }
                    }
                )
                return functions.success(res, "Loại hình chấm công", {
                    data: {
                        type_timesheet: 3
                    }
                })
            }
            return functions.success(res, "Loại hình chấm công", {
                data: {
                    type_timesheet: info_company.inForCompany.cds.type_timesheet || 0
                }
            })
        }
        return functions.setError(res, "Công ty không tồn tại")
    }
    return functions.setError(res, "Yêu cầu tài khoản công ty")

}

exports.update_type_timesheet = async (req, res) => {
    const com_id = req.user.data.idQLC;
    const type = req.user.data.type;
    if (type === 1) {
        const info_company = await Users.findOne({
            idQLC: com_id,
            type: 1
        })
        if (info_company) {
            const type_timesheet = Number(req.body.type_timesheet)
            console.log("com_id", com_id)
            console.log("type_timesheet", type_timesheet)
            await Users.updateOne(
                {
                    idQLC: com_id,
                    type: 1
                },
                {
                    $set: {
                        "inForCompany.cds.type_timesheet": type_timesheet
                    }
                }
            )
            return functions.success(res, "Cập nhật thành công")
        }
        return functions.setError(res, "Công ty không tồn tại")
    }
    return functions.setError(res, "Yêu cầu tài khoản công ty")

}
