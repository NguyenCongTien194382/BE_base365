const router = require("express").Router();
const formData = require("express-form-data");
const controllers = require("../../../controllers/crm/Potential/potential")
const potentialDetail = require("../../../controllers/crm/Potential/potential_details")
const functions = require('../../../services/functions')
const crmServices = require("../../../services/CRM/CRMservice")
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); 
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// API Them Moi Tiem Nang
router.post("/add_potential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'add'),  controllers.addNewPotential)

//sua tiem nang
router.post("/edit_potential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'edit'),  controllers.updatePotential)

// API Hien danh sach va tim kiem
router.post("/listPotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'view'),  controllers.listPotential)

//API Hien thi chi tiet Tiem nang
router.post("/detail-potential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'view'), potentialDetail.showDetailPotential)

// API Xoa Tiem nag
router.post("/delete-potential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'delete'), controllers.deletePotential)

//API Them moi tiem nang tu file upload
router.post("/add-file-potential", functions.checkToken, upload.single('file'), crmServices.checkRight(1, 'add'), controllers.addPotentialFromFile)

// API Convert Tiem nang sang Khach hang
router.post("/convert-potential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'edit'),  controllers.convertToCustomer)

//API Xóa tiềm năng
router.post("/delete-potential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'delete'),  controllers.deletePotential)

//hang hoa quan tam
router.post("/listProductInterest", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'view'),  potentialDetail.listProductInterest)
router.post("/addProductInterest", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'add'),  potentialDetail.addProductInterest)
router.post("/deleteProductPotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'delete'),  potentialDetail.deleteProductPotential)

//chien dich
router.post("/listCampaignContainPotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'view'),  potentialDetail.listCampaignContainPotential)
router.post("/addPotentialIntoCampaign", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'add'),  potentialDetail.addPotentialIntoCampaign)

//ghi chu
router.post("/createNoteForPotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'add'),  potentialDetail.createNoteForPotential)
router.post("/listNotePotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'view'),  potentialDetail.listNotePotential)
router.post("/updateNoteForPotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'edit'),  potentialDetail.updateNoteForPotential)
router.post("/deleteNotePotential", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'delete'),  potentialDetail.deleteNotePotential)

//tai lieu dinh kem
router.post("/createAttachment", functions.checkToken, formData.parse(), potentialDetail.createAttachment)
router.post("/listAttachment", functions.checkToken, formData.parse(), potentialDetail.listAttachment)
router.post("/deleteAttachment", functions.checkToken, formData.parse(), potentialDetail.deleteAttachment)

//lich hen
router.post("/createAppointment", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'add'),  potentialDetail.createAppointment)
router.post("/updateAppointment", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'edit'),  potentialDetail.updateAppointment)
router.post("/listAppointment", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'view'),  potentialDetail.listAppointment)
router.post("/changeStatusAppointment", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'edit'),  potentialDetail.changeStatusAppointment)
router.post("/cancelAppointment", functions.checkToken, formData.parse(), crmServices.checkRight(1, 'edit'),  potentialDetail.cancelAppointment)

//email
router.post("/listEmailPotential", functions.checkToken, formData.parse(), potentialDetail.listEmailPotential)


//danh sach chia se
router.post("/listShare", functions.checkToken, formData.parse(), potentialDetail.listShare)
router.post("/createShareCustomer", functions.checkToken, formData.parse(), potentialDetail.createShareCustomer)
router.post("/deleteShare", functions.checkToken, formData.parse(), potentialDetail.deleteShare)

module.exports = router