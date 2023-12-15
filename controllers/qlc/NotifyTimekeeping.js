const functions = require("../../services/functions")
const OrganizeDetail = require("../../models/qlc/OrganizeDetail")
const NotifyTimekeeping = require("../../models/qlc/NotifyTimekeeping")
const Users = require('../../models/Users');

const fs = require('fs');


exports.update = async (req, res, next) => {
    try {
        const comId = req.user.data.com_id
        const type = req.user.data.type
        const { minute, content, status } = req.body
        if (comId && type) {
            if (type == 1) {
                const foundGateway = await NotifyTimekeeping.findOne({
                    com_id: comId
                })
                if (!foundGateway) {
                    const newData = new NotifyTimekeeping({
                        minute: 10,
                        com_id: comId,
                        content: `Còn 10 phút nữa là tới giờ chấm công.Chúc bạn có một ngày làm việc vui vẻ`,
                    })
                    await newData.save()
                    return functions.success(res, "Thay đổi thành công")
                }
                else {
                    const conditions = {

                    }
                    if (minute) conditions.minute = Number(minute)
                    if (content) conditions.content = content
                    if (status) conditions.status = Number(status)
                    await NotifyTimekeeping.updateOne(
                        {
                            com_id: comId
                        },
                        {
                            $set: conditions
                        }
                    )
                    return functions.success(res, "Thay đổi thành công")
                }
            }
            else return functions.setError(res, "Yêu cầu tài khoản công ty")
        }
        return functions.setError(res, "Thiếu thông tin truyền lên")

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

exports.getData = async (req, res, next) => {
    try {
        const comId = req.user.data.com_id
        const type = req.user.data.type
        if (comId && type) {
            if (type == 1) {
                const foundGateway = await NotifyTimekeeping.findOne({
                    com_id: comId
                })

                if (!foundGateway) {
                    return functions.success(res, {
                        status: -1
                    })
                }
                else {

                    return functions.success(res, {
                        status: foundGateway.status,
                        minute: foundGateway.minute,
                        content: foundGateway.content
                    })
                }
            }
            else return functions.setError(res, "Yêu cầu tài khoản công ty")
        }
        return functions.setError(res, "Thiếu thông tin truyền lên")

    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}


