const functions = require("../../services/functions");
const ReceiveSalaryDay = require("../../models/qlc/ReceiveSalaryDay");
const Users = require("../../models/Users");

exports.getReceiveSalaryDay = async(req, res) => {
    const {
        ep_id,
        apply_month,
        start_date,
        end_date,
    } = req.body
    const com_id = req.user.data.com_id;
    let conditions = {
        com_id: com_id,
    };
    if (ep_id) {
        conditions.ep_id = Number(ep_id);
    }
    if (apply_month) {
        conditions.apply_month = apply_month;
    }
    if (start_date) {
        conditions.start_date = start_date;
    }
    if (end_date) {
        conditions.end_date = end_date;
    }
    const data = await ReceiveSalaryDay.aggregate([{
        $match: conditions,
    }, {
        $lookup: {
            from: 'Users',
            localField: 'ep_id',
            foreignField: 'idQLC',
            pipeline: [{
                $match: {
                    type: 2,
                    'inForPerson.employee.com_id': com_id,
                }
            }, {
                $lookup: {
                    from: 'QLC_OrganizeDetail',
                    localField: 'inForPerson.employee.organizeDetailId',
                    foreignField: 'id',
                    pipeline: [{
                        $match: {
                            comId: com_id,
                        }
                    }],
                    as: 'organizeDetail',
                }
            }, {
                $unwind: '$organizeDetail'
            }, ],
            as: 'ep',
        }
    }, {
        $unwind: '$ep'
    }, {
        $project: {
            _id: '$_id',
            com_id: '$com_id',
            ep_id: '$ep_id',
            apply_month: '$apply_month',
            start_date: '$start_date',
            end_date: '$end_date',
            ep_name: '$ep.userName',
            ep_email: '$ep.email',
            organizeDetailId: '$ep.inForPerson.employee.organizeDetailId',
            organizeDetailName: '$ep.organizeDetail.organizeDetailName'
        }
    }])
    return res.status(200).json({ data });
}