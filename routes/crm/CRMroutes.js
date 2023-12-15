const router = require('express').Router();
// const GroupCustomerRouter = require('./groupCustomer')
const CustomerRouter = require('./Customer/CustomerRoutes')
const CustomerDetailsRoutes = require('./Customer/CustomerDetailsRoutes')
const GroupCustomerRoutes = require("./Customer/groupCustomer");
const formContract = require("./Contract/formContract");
const Contract = require("./Contract/ContractForCus");
const settingContract = require("./Setting/AccountAPI");
const CustomerContact = require("./Customer/CustomerContact");
const ToolCRM = require('../crm/toolCRM')
const Nhap_lieu = require('./Nhap_lieu')
const CustomerCare = require("../crm/CustomerCare/CustomerCare")
const CustomerStatus = require('../crm/Customer/CustomerStatus')
const contractAI = require('../crm/Contract/ContractAI');
const RoleSetting = require("./RoleSetting")
const AccountRouter = require("./AccountRouter")
const marketingZalo = require('../crm/Marketing/MarketingZalo');
const DexuatWordSensitive = require('../crm/DexuatWordSensitive');
const scheduleAutoCall = require('./Customer/ScheduleAutoCall');
const scheduleEmail = require('./Customer/ScheduleEmail');
const permissionAccount = require("./Setting/PermissionAccount");
const Potential = require("../crm/Potential/Potential");
const Notification = require("../crm/Notification");
const campaign = require("../crm/Campaign");
const product = require("../crm/Product/Product");
const chance = require("../crm/Chance/chance");
const order = require("../crm/Order/order");
// const settingMarketing = require("../crm/Setting/marketing");
const email = require("../crm/Marketing/email");
const bill = require("../crm/Bill/bill");
const sms = require("../crm/Marketing/sms");
// const dataDeleted = require("../crm/DataDeleted");
const Quote = require('../crm/Quote/Quote')


router.use('/DexuatWordSensitive', DexuatWordSensitive)

router.use('/tool', ToolCRM)

// khách hàng
router.use('/customer', CustomerRouter);

router.use('/account', AccountRouter)

//chi tiết khách hàng
router.use('/customerdetails', CustomerDetailsRoutes)

//nhóm khách hàng
router.use('/group', GroupCustomerRoutes);

//hợp đồng 
router.use('/contract', formContract);

//tình trạng khách hàng
router.use('/customerStatus', CustomerStatus)

//hợp đồng bán
router.use('/contractforcus', Contract);

//chăm sóc khách hàng
router.use('/cutomerCare', CustomerCare)

//cài đặt tong dai
router.use('/settingContract', settingContract);

//lien he KH
router.use('/CustomerContact', CustomerContact);

//nhập liệu
router.use('/nhaplieu', Nhap_lieu);

// Phan Quyen
router.use('/role', RoleSetting);

router.use('/contractAI', contractAI);

router.use('/marketingZalo', marketingZalo);

// Auto call
router.use('/scheduleAutoCall', scheduleAutoCall);

// Auto call
router.use('/scheduleEmail', scheduleEmail);

// Thiết lập quyền
router.use('/permissionAccount', permissionAccount);

// Phan Quyen
router.use("/role", RoleSetting);

// Tiem nang
router.use("/potential", Potential);

//Chien dich
router.use("/campaign", campaign);

//Thông báo
router.use("/notification", Notification);

//Hang hoa
router.use("/product", product);

// Co hoi
router.use("/chance", chance);

// Don hang
router.use("/order", order);

//setting marketing
// router.use("/settingMarketing", settingMarketing);

//marking email
router.use("/marketing/email", email);

//Bill
router.use("/bill", bill);
router.use("/marketing/sms", sms);

// router.use('/dataDeleted', dataDeleted);

// Báo giá
router.use('/quote', Quote)

module.exports = router;