'use strict';

module.exports = function(app) {
  var bitcoin = require('../controllers/bitCoinController');

  app.route('/btc/address/:account')
    .get(bitcoin.generateAddress);

  app.route('/btc/balance/:account')
    .get(bitcoin.getBalance);

    app.route('/btc/addr_balance/:address')
    .get(bitcoin.getBalance_addr);

  app.route('/btc/deposits/:account')
    .get(bitcoin.getReceivedByAccount);

  app.route('/btc/transfer')
    .post(bitcoin.performTransfer);

  app.route('/btc/withdraw')
    .post(bitcoin.performWithdraw);

    app.route('/btc/newaddress/:account')
    .get(bitcoin.generateNewAddress);

    app.route('/btc/addresses/:account')
    .get(bitcoin.listAddresses);
    
     app.route('/btc/details/:account')
    .get(bitcoin.accountDetails);
    
    app.route('/btc/multipleWithdraw')
    .post(bitcoin.multipleWithdraw);

//Api for transaction for fees
   app.route('/btc/transfer_fee')
   .post(bitcoin.transfer_fee);

  app.route('/btc/withdraw_fee')
  .post(bitcoin.withdraw_fee)

//Details from the Address and Recieve	
  app.route('/btc/tx_details/:txid')
  .get(bitcoin.tx_details)

  app.route('/btc/addr_deposits/:address')
  .get(bitcoin.addr_deposits)
};
