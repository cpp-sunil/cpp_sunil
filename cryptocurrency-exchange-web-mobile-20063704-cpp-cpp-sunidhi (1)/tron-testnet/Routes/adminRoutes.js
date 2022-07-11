const router = require('express').Router();

const adminController = require('../controller/adminController');
var auth =require("../middleware/adminAuthToken")



router.post('/adminLogin', adminController.adminLogin);
router.post('/adminForgotPassword',adminController.adminForgotPassword);
router.post('/adminResendOtp',adminController.adminResendOtp);
router.post('/adminVerifyUser',adminController.adminVerifyUser);
router.post('/adminResetPassword',adminController.adminResetPassword);
router.post('/adminUploadImage',adminController.uploadImage);
router.post('/adminEditProfile',auth.adminToken, adminController.adminEditProfile);
router.get('/adminViewProfile', auth.adminToken, adminController.viewAdminProfile);
router.post('/adminChangePassword', auth.adminToken, adminController.adminChangePassword);


module.exports = router;