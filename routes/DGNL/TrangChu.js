const router = require("express").Router()
const controller = require("../../controllers/DGNL/TrangChu/TrangChu")
const formData = require("express-form-data")
const functions = require("../../services/functions")

router.get("/Trang-Chu", functions.checkToken, controller.TrangChu);

module.exports = router