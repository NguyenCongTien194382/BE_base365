const router = require("express").Router()
const controller = require("../../../controllers/crm/Setting/PermissionAccount")
const formData = require("express-form-data")
const functions = require('../../../services/functions')


//cập nhật quyền th
router.post("/createPermisionUser", functions.checkToken, formData.parse(), controller.createPermisionUser)

//lấy ds nv đã thiết lập quyền
router.get('/getListPermisionUser', functions.checkToken, formData.parse(), controller.getListPermisionUser)

module.exports = router