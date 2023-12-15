const functions = require('../../../services/functions');

const KPI365_Department = require('../../../models/kpi/KPI365_Department');
const KPI365_Kpi = require('../../../models/kpi/KPI365_Kpi');
const QLC_Department = require('../../../models/qlc/Deparment');
exports.getTongSoKPI = async (req, res) => {
    try {
        // let today = Date.now();
        // let condition = 'is_deleted = 0 and type != "" ';
        // let { month, year, search_type, name } = req.body;
        // let condition = {};
        // const kpi = await KPI365_Kpi.aggregate([{
        //     $sort: { created_at: -1 }
        // },
        // {
        //     $match: condition
        // },
        // {
        //     $project:
        //     {
        //         id: 1,
        //         start_day: 1,
        //         end_date: 1,
        //         type_target: 1,
        //         is_last: 1
        //     }
        // }])
        return functions.success(res, "Tổng số KPI", { data: { kpi } })
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message)
    }
}

