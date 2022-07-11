const router = require('express').Router();
const tron = require('../controller/tronController.js');
// const dbapi = require('../controller/dbApi');

 router.get('/get_auth_token/',tron.get_auth_token)
router.get('/generateAddress/',tron.generateAddress);
router.get('/get_balance/', tron.get_balance);
router.post('/block', tron.block);
router.post('/Transfer', tron.Transfer);
router.post('/gettransactionbyid', tron.gettransactionbyid);
router.post('/accounthistory',tron.accounthistory);
router.post('/withdraw', tron.withdraw);

// router.post('/assetissue', tron.assetissue);
// router.post('/tokenbyAddress', tron.tokenbyAddress);
// router.post('/tokenTransfer', tron.tokenTransfer);
// router.post('/tokenBalance', tron.tokenBalance);


// router.post('/signUp', dbapi.signUp);
// router.post('/logIn', dbapi.logIn);
// router.post('/forgotPassword',dbapi.forgotPassword);
// router.post('/resendOtp',dbapi.resendOtp);
// router.post('/verifyUser',dbapi.verifyUser);
// router.post('/resetPassword',dbapi.resetPassword);
// router.post('/uploadImage', dbapi.uploadImage);
// router.post('/editProfile', dbapi.editProfile);
// router.post('/getInfo',  dbapi.getInfo);
// router.post('/changePassword',  dbapi.changePassword);
// router.post('/deleteUser', dbapi.deleteUser);
// //router.post('/otp', dbapi.otp);
//router.post('/neweditProfile', dbapi.neweditProfile);

module.exports = router;