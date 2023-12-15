const router = require("express").Router();
const formData = require("express-form-data");
const Controllers = require("../../../controllers/crm/Customer/ScheduleEmail");
const functions = require("../../../services/functions")

// lấy số lượng khách hàng theo group
router.post("/getGroupCustomer", functions.checkToken, formData.parse(), Controllers.getGroupCustomer)

// thêm hẹn lịch gọi điện
router.post("/AutoCall", functions.checkToken, formData.parse(), Controllers.AutoCall)

// lấy danh sách lịch gọi điện
router.post("/getListSchedule", functions.checkToken, formData.parse(), Controllers.getListSchedule)

// lấy danh sách kd
router.get("/getListAdminUsers", functions.checkToken, formData.parse(), Controllers.getListAdminUsers)

// lấy danh sách group con của cty
router.get("/getListGroupCompany", functions.checkToken, formData.parse(), Controllers.getListGroupCompany)

//kd đề xuất
router.post("/suggest", functions.checkToken, formData.parse(), Controllers.suggest)

//cty duyệt đề xuất
router.post("/duyet", functions.checkToken, formData.parse(), Controllers.duyet)


module.exports = router;