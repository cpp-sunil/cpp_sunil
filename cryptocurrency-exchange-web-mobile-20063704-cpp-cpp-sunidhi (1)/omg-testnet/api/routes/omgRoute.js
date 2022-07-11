
'use strict';

module.exports = function(app) {
  var omg = require('../controllers/omg');
  //var auth=require('../../middleware/jwtAuthentication')


  // app.route('/usdc/get_auth_token')
  //   .get(usdc.get_auth_token);
  
  app.route('/omg/generateAddress')
    .get(omg.get_wallet);
  
    app.route('/omg/getBalance')
    .get(omg.get_balance);
  
    app.route('/omg/deposits')
    .get(omg.get_deposits);   

    app.route('/omg/transfer')
    .post(omg.transfer);
    
    app.route('/omg/withdraw')
    .post(omg.withdraw);
  
};



///////////////////////////////////////////////////


// For mainnet address ------->>
// {
//   "code": 200,
//   "Result": {
//       "address": "0xe97A19d6e0E917B4b501E44198544F07b61EA759",
//       "privateKey": "0x67e8647987f40bef0e1feb45132a512a531d1fb5f3f3908afb9e1624e9495a86"
//   }
// }
  

//receiver address
// {
//   "code": 200,
//   "Result": {
//       "address": "0xD2Bd4412156296e262b5908fA42e260FBeB7B4a8",
//       "privateKey": "0x56220ce21d416574834b641e78ce3835c0ef22b576d95940a38c8969c8ec9efe"
//   }
// }



//transaction hash - 0x95fb63c1ef4cf2adccf319e5f9928bf97182253b5cb121491be68e3706f3ab36",
//0xcc061556fe27bb1e0d2da947c4257e715a03e815473b327fb5f57ce887fb1491