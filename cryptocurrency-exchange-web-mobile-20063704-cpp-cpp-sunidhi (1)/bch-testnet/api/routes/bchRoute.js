

'use strict';

module.exports = function (app) {
  var bitcoin = require('../controllers/bchController');
 // var middleware = require('../../middleware/jwtAuthentication')


  // app.route('/bch/get_auth_token')
  // .get(bitcoin.get_auth_token);

  app.route('/bch/address/:account')
    .get(bitcoin.generateAddress);       //done

  app.route('/bch/balance/:account')
    .get(bitcoin.getBalance); //done

  app.route('/bch/addr_balance/:address')
    .get(bitcoin.getBalance_addr); //done

  app.route('/bch/deposits/:address')
    .get(bitcoin.getReceivedByAccount);  ///done 

  app.route('/bch/transfer')
    .post(bitcoin.performTransfer); // done

  app.route('/bch/withdraw')
    .post(bitcoin.performWithdraw); //done

  app.route('/bch/newaddress/:account')
    .get(bitcoin.generateNewAddress); //done

  app.route('/bch/addresses/:account')
    .get(bitcoin.listAddresses); //done



};
