
module.exports = function (app) {
  var dash = require('../controllers/dashController');
  
  // const auth = require('../common/auth.js')

  // app.route('/dash/get_auth_token')
  //   .get(dash.get_auth_token)
  
  app.route('/dash/generateAddress/:account')
    .get( dash.generateNewAddress);
  app.route('/dash/getBalance/:address')
    .get( dash.getBalance_addr);
  app.route('/dash/deposits/:address')
    .get( dash.getReceivedByAccount);
  app.route('/dash/transfer')
    .post( dash.performTransfer);
  app.route('/dash/withdraw')
    .post( dash.performWithdraw);
  app.route('/dash/receiveBalance')
    .post( dash.receiveBalance);
  app.route('/dash/addresses/:account')
    .get( dash.listAddresses);
  app.route('/dash/getBalanceAccount/:account')
    .get( dash.getBalance);
  app.route('/dash/multipleWithdraw')
    .post( dash.multipleWithdraw);









};





