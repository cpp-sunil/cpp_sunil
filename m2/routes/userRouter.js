const userRouter = require('express').Router();

const userController = require('../controllers/userController')
const auth = require("../middleware/auth")
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
userRouter.post('/signUp', userController.signUp);
userRouter.put('/otpVerify', userController.otpVerify);
userRouter.post('/login', userController.login);
userRouter.put('/resendOtp', userController.resendOtp);
userRouter.put('/forgotPassword', userController.forgotPassword);
userRouter.put('/resetPassword', userController.resetPassword);
userRouter.get('/viewUser/:_id', auth.verifyToken, userController.viewUser);
userRouter.put('/editProfile', auth.verifyToken, userController.editProfile);
userRouter.get('/linkVerify/:email', userController.linkVerify);
userRouter.get('/userList',auth.verifyToken,userController.userList);
userRouter.post('/adminLogin', userController.adminLogin);
userRouter.get('/pagination',auth.verifyToken, userController.pagination);
userRouter.get('/qrGenerator', userController.qrGenerator);
userRouter.post('/uploadImage',upload.array('image',10),userController.uploadImage);
userRouter.post('/createProduct',auth.verifyToken, userController.createProduct);
userRouter.post('/createCategory',auth.verifyToken, userController.createCategory);
userRouter.get('/productList', userController.productList);
module.exports = userRouter;
