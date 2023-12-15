const router = require('express').Router()
const controller = require('../../../controllers/qlc/admin/Admin')
const formData = require('express-form-data')
const functions = require('../../../services/functions')
const checkAdmin = require('../../../middleware/checkAdmin')

//check vip

router.post('/vip', formData.parse(), checkAdmin.checkIP, controller.setVip)

router.post('/put', formData.parse(), checkAdmin.checkIP, controller.setVipOnly)

router.post('/listCom', formData.parse(), checkAdmin.checkIP, controller.listCom)

router.post('/listComSummary', formData.parse(), checkAdmin.checkIP, controller.listComSummary)

router.post('/listComErr', formData.parse(), checkAdmin.checkIP, controller.listComErr)

router.post('/updatePassword', formData.parse(), controller.updatePassword)

router.post('/getListFeedback', formData.parse(), checkAdmin.checkIP, controller.getListFeedback)

router.post('/getListReportErr', formData.parse(), checkAdmin.checkIP, controller.getListReportErr)

router.post('/postBlog', formData.parse(), checkAdmin.checkIP, controller.createBlog)

// chưa giới hạn
router.post('/blog', formData.parse(), controller.getBlog)

router.post('/updateBlog', formData.parse(), checkAdmin.checkIP, controller.updateBlog)

router.post('/saveImgBlog', formData.parse(), checkAdmin.checkIP, controller.saveImgBlog)

// chưa giới hạn
router.post('/categoryBlog', formData.parse(), controller.getCategoryBlog)

router.post('/addCategoryBlog', formData.parse(), checkAdmin.checkIP, controller.addCategoryBlog)

router.post(
  '/deleteCategoryBlog',
  formData.parse(),
  checkAdmin.checkIP,
  controller.deleteCategoryBlog
)


router.post("/getUser", formData.parse(), controller.getUser)

module.exports = router
