const userRouter = require('express').Router();
const userController = require('./tokenController');

userRouter.get('/generateMnemonic',userController.generateMnemonic);
userRouter.get('/generateBNBWallet',userController.generateBNBWallet);

userRouter.post('/tokenTransfer',userController.tokenTranfer);
userRouter.get('/getTokenBalance',userController.getTokenBalance);






module.exports = userRouter;

