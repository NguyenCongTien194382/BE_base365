const router = require('express').Router();
const formData = require("express-form-data");
const controllers = require("../../controllers/crm/account");
const funtions = require('../../services/functions')

router.post('/employee/list', funtions.checkToken, formData.parse(), controllers.getListEmployee);
router.post('/TakeListUserFromGroup', funtions.checkToken, formData.parse(), controllers.TakeListUserFromGroup);
router.post('/tranformCart', funtions.checkToken, formData.parse(), controllers.tranformCart);
router.post('/AddUserToCart', funtions.checkToken, formData.parse(), controllers.AddUserToCart);
router.post('/deleteCart', funtions.checkToken, formData.parse(), controllers.deleteCart);
router.post('/DeleteUserFromCart', funtions.checkToken, formData.parse(), controllers.DeleteUserFromCart);
router.post('/TakeListGroup', funtions.checkToken, formData.parse(), controllers.TakeListGroup);
router.post('/takeListNvienKinhDoanh', funtions.checkToken, formData.parse(), controllers.takeListNvienKinhDoanh);
router.post('/TakeListGroupOfUser', formData.parse(), controllers.TakeListGroupOfUser);
router.post('/addUserToCrm', formData.parse(), controllers.addUserToCrm);
router.post('/updateVip', formData.parse(), controllers.updateVip);

module.exports = router;