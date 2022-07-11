
'use strict';

// module.exports = function(app) {
//   var ethereum = require('../controllers/EthereumController');
//   var auth = require('../auth/auth.js')
  
//   app.route('/eth/get_auth_token')
//   .get(ethereum.get_auth_token);

//   app.route('/eth/wallet')
//     .get(auth.verifyToken,ethereum.get_wallet);
  
//     app.route('/eth/balance') 
//     .get(auth.verifyToken, ethereum.get_balance);

//     app.route('/eth/payment')
//     .post(auth.verifyToken,ethereum.get_payment);

//     app.route('/eth/deposits')
//     .get(auth.verifyToken,ethereum.get_deposits);

//     app.route('/eth/transfer')
//     .post(auth.verifyToken,ethereum.get_transfer);

//     app.route('/eth/getDetails')
//     .get(auth.verifyToken,ethereum.get_details)

//     // app.route('/eth/validator')
//     // .post(ethereum.validator)

  
// };



module.exports = function(app) {
  var ethereum = require('../controllers/EthereumController');
  

  app.route('/eth/wallet')
    .get(ethereum.get_wallet);
  
    app.route('/eth/balance') 
    .get(ethereum.get_balance);

    app.route('/eth/withdraw')
    .post(ethereum.get_payment);

    app.route('/eth/deposits')
    .get(ethereum.get_deposits);

    app.route('/eth/transfer')
    .post(ethereum.get_transfer);

    app.route('/eth/getDetails')
    .get(ethereum.get_details)
  
};


// {
//   "code": 200,
//   "Result": {
//       "address": "0xC181Ec1bcA2c5b54f6591bb582574CA04CC9d960",
//       "privateKey": "0xad61a96e38d1bf656dc23068414d0785ab33ee8fc4aac8cb9e11fed98827fedc"
//   }
// }





































// push on origin2


// {
//   "code": 200,
//   "Result": {
//       "address": "0x603bCE8fF2D77551fF2BC6E7021bBb6632De17e7",
//       "privateKey": "0xab49a0e3081dbcb5c28a33d5560426f4fef0a584cff4d325348e185cd2b9f20f"
//   },
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjE5ODE2NTJ9.WJbhpUDkX-_mo5equo97RbSOmNt-1R15nvvmsY_SrTo"
// }