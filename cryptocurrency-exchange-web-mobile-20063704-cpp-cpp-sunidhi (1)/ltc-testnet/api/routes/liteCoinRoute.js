
module.exports = function(app) {
  var litecoin = require('../controllers/liteCoinController');
  




app.route('/ltc/generateAddress/:account').get(litecoin.generateNewAddress); //Done

app.route('/ltc/getBalance/:address').get(litecoin.getBalance_addr); //done

app.route('/ltc/deposits/:address').get(litecoin.getReceivedByAccount);

app.route('/ltc/transfer').post(litecoin.performTransfer); ///DONE

app.route('/ltc/withdraw').post(litecoin.performWithdraw); //Done
//app.route('/ltc/address/:account').get(middleware.verifyToken,litecoin.generateAddress); //getaccountaddress is deprecated and will be removed in V0.18. To '+'use this command, start litecoind with -deprecatedrpc=accounts

  app.route('/ltc/depositsOfAddress/:account').get(litecoin.depositsOfAddress); //Done
  
  app.route('/ltc/addresses/:account').get(litecoin.listAddresses);// 
  
  app.route('/ltc/multipleWithdraw').post(litecoin.multipleWithdraw);

};




