'use strict';

module.exports = function(app) {

  var usdt = require("../controllers/tetherController")
 
 

  app.route('/usdt/generateAddress/:account')
  .get(usdt.generateAddress);

   app.route('/usdt/addr_balance/:address')
   .get(usdt.getBalanceAddress);

 app.route('/usdt/deposits/:address')
   .get(usdt.history);

app.route('/usdt/transfer')
  .post(usdt.transferFunds);

  app.route('/usdt/withdraw')
  .post(usdt.withdrawFunds);
  ///////////////////testing ///////////////////////
 

};


