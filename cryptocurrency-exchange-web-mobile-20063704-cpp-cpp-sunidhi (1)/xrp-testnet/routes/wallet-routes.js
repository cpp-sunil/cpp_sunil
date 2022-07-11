const walletRoutes = require('express').Router()
const wallet = require('../services/wallet-handler.js')

walletRoutes.get('/get_auth_token', wallet.get_auth_token);  //done

walletRoutes.get('/get_server_info',wallet.verifyAuthToken,wallet.get_server_info); //done

walletRoutes.get('/generateAddress',wallet.verifyAuthToken,wallet.generate_new_addr);  //done

walletRoutes.get('/getBalance',wallet.verifyAuthToken, wallet.get_addr_info);  //done

walletRoutes.post('/deposits',wallet.verifyAuthToken, wallet.deposit_history); //done

walletRoutes.post('/withdraw', wallet.verifyAuthToken,wallet.payment_method);  //done






// walletRoutes.get('/get_auth_token', wallet.get_auth_token);  //done

// walletRoutes.get('/get_server_info',wallet.verifyAuthToken,wallet.get_server_info); //done
// walletRoutes.get('/generateAddress',wallet.verifyAuthToken,wallet.generate_new_addr);  //done
// walletRoutes.get('/getBalance',wallet.verifyAuthToken, wallet.get_addr_info);  //done
// walletRoutes.post('/deposits',wallet.verifyAuthToken, wallet.deposit_history); //done
// walletRoutes.post('/withdraw', wallet.verifyAuthToken,wallet.payment_method);  //done

module.exports = walletRoutes;
