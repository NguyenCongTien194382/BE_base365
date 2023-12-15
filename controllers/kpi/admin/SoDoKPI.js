const functions = require('../../../services/functions');
const functions_kpi = require("../../../services/kpi/functions");
const functions_kpi_kpi = require("../../../services/kpi/KPI")

const KPI365_Organization = require("../../../models/kpi/KPI365_Organization");
const KPI365_TargetUnit = require("../../../models/kpi/KPI365_TargetUnit");
const KPI365_Bonus = require("../../../models/kpi/KPI365_Bonus");
const KPI365_ActivityDiary = require('../../../models/kpi/KPI365_ActivityDiary');
const KPI365_Kpi = require('../../../models/kpi/KPI365_Kpi');
const KPI365_NewGroup = require('../../../models/kpi/KPI365_NewGroup');
const KPI365_Result = require('../../../models/kpi/KPI365_Result');
const KPI365_ResultHistory = require('../../../models/kpi/KPI365_ResultHistory');
const KPI365_ConfigAssess = require('../../../models/kpi/KPI365_ConfigAssess');

const QLC_OrganizeDetail = require('../../../models/qlc/OrganizeDetail');
const Users = require('../../../models/Users');

exports.listSoDoKPI = async (req, res) => {
    try {
        //Lấy thông tin từ req
        let { com_id, idQLC, type } = req.user.data;
        let { date_start, date_end, year, search_kpi } = req.body;

        // let totalKpiProcess = await functions_kpi_kpi.totalKpiProcess(com_id);
        let main_diagram = await functions_kpi_kpi.main_diagram(com_id, date_start, date_end, search_kpi)

        return functions.success(res,
            `Lấy danh sách sơ đồ KPI đơn mục tiêu thành công`,
            {
                // totalKpiProcess,
                main_diagram
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}