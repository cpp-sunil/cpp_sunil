var Web3 = require('web');
var BigNumber = require('bignumber.js');
let Tx = require('ethereumjs-tx');
//var web3 = new Web3(Web3.givenProvider || 'https://mainnet.infura.io');//mainnet
var web3 = new Web3(Web3.givenProvider || 'https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f');//testnet
var Accounts = require('web3-eth-accounts');
//var accounts = new Accounts('https://mainnet.infura.io');//mainnet
var accounts = new Accounts('https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f');//testnet
const safeJsonStringify = require('safe-json-stringify');
const numberToBN = require('number-to-bn');
var CircularJSON = require('circular-json');
const request = require('request');
const config1 = require('../../configuration');
//var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var CryptoJS = require("crypto-js");
var WAValidator = require('wallet-address-validator');
var value = 'myEthereum3222335'


function getBalance(address, cb) {
  web3.eth.getBalance(address).then(amount => {
    console.log("amount==>>", amount)
    amount = new BigNumber(amount).dividedBy(new BigNumber(Math.pow(10, 18)))
    console.log("amountBigNo.==>>", amount)
    cb(null, amount)
  }).catch(err => {
    cb(null, err)
  })
}


getCurrentGasPrice = (cb) => {
  web3.eth.getGasPrice()
    .then((currentGasPrice) => {
      console.log("currentGasPrice===>>", currentGasPrice)
      return cb(currentGasPrice)
    })
}

estGas = (toAddr, fromAddr, value, cb) => {
  web3.eth.estimateGas({
    from: fromAddr,
    to: toAddr,
    value: value
  }).then((estmdGas) => {
    console.log(" Your estmdGas is ==>>", estmdGas)
    return cb(estmdGas)
  }).catch(console.log)
}

getTxnCountForNonce = (addr, cb) => {
  web3.eth.getTransactionCount(addr)
    .then((count) => {
      return cb(count)
    });
}

signTxn_transfer = (toAddr, fromAddr, value, key, cb) => {
  estGas(toAddr, fromAddr, value, (estmdGas) => {
    getCurrentGasPrice((currentGasPrice) => {
      getTxnCountForNonce(fromAddr, (hardCount) => {
        // /* by manish sharma also working this calculate fee automatically
        var fee_res = new BigNumber(estmdGas).multipliedBy(new BigNumber(2 * 1e9));
        var data = new BigNumber(value).minus(new BigNumber(fee_res));
        var actual_fee = new BigNumber(fee_res).dividedBy(new BigNumber(Math.pow(10, 18)))
        console.log("data@@@@@", data)
        console.log("***********", fee_res)
        console.log("actual fee can be ducted----", estmdGas * currentGasPrice)
        let rawTx = {
          nonce: web3.utils.toHex(hardCount),
          from: web3.utils.toHex(fromAddr),
          //          gasPrice: web3.utils.toHex(5*1e9),
          gasPrice: web3.utils.toHex(2 * 1e9),
          gas: web3.utils.toHex(estmdGas),
          to: web3.utils.toHex(toAddr),
          value: web3.utils.toHex(data)
        }
        // let rawTx = {
        //   nonce: web3.utils.toHex(hardCount),
        //   from: web3.utils.toHex(fromAddr),
        //   gasPrice: web3.utils.toHex(2 * 1e9),//this gas used for transaction (used ethereum for gas) 
        //   gas: web3.utils.toHex(21000),
        //   to: web3.utils.toHex(toAddr),
        //   value: web3.utils.toHex(value)
        // }
        var tx = new Tx(rawTx);
        tx.sign(key);
        let serializedTx = tx.serialize();
        console.log("serializedTx", serializedTx)
        let cbData = '0x' + serializedTx.toString('hex')
        console.log("cb Data is ", cbData)
        cb(cbData)
      })
    })
  })
}

signTxn = (toAddr, fromAddr, value, key, cb) => {
  estGas(toAddr, fromAddr, value, (estmdGas) => {
    getCurrentGasPrice((currentGasPrice) => {
      getTxnCountForNonce(fromAddr, (hardCount) => {
        // /* by manish sharma also working this calculate fee automatically
        let rawTx = {
          nonce: web3.utils.toHex(hardCount),
          from: web3.utils.toHex(fromAddr),
          gasPrice: web3.utils.toHex(5 * 1e9),
          gas: web3.utils.toHex(estmdGas),
          to: web3.utils.toHex(toAddr),
          value: web3.utils.toHex(value)
        }
        // let rawTx = {
        //   nonce: web3.utils.toHex(hardCount),
        //   from: web3.utils.toHex(fromAddr),
        //   gasPrice: web3.utils.toHex(2 * 1e9),//this gas used for transaction (used ethereum for gas) 
        //   gas: web3.utils.toHex(21000),
        //   to: web3.utils.toHex(toAddr),
        //   value: web3.utils.toHex(value)
        // }
        var tx = new Tx(rawTx);
        tx.sign(key);
        let serializedTx = tx.serialize();
        console.log("serializedTx", serializedTx)
        let cbData = '0x' + serializedTx.toString('hex')
        console.log("cb Data is ", cbData)
        cb(cbData)
      })
    })
  })
}


module.exports = {

  // get_auth_token: (req, res) => {
  //   if (!req.query.uniqueId) {
  //     return res.json({ 'code': 400, 'message': "Parameters missing." })
  //   } else if (req.query.uniqueId == "gmoThailand") {
  //     return res.json({ "code": 200, "message": "Success.", "Data": jwt.sign({ id: req.query.uniqueId }, "coinintegration") })
  //   } else {
  //     res.json({ code: 400, message: "Please provide valide unique_id" })
  //   }

  // },


  get_wallet: (req, res) => {

    if (!req.query.password) {

      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    else {
      var privateKey = web3.eth.accounts.wallet.create(1, req.query.password)
      //console.log("privatekey--------------" + CircularJSON.stringify(privateKey))
      var objInfo = privateKey.length - 1;
      //console.log("=====address>>====", privateKey[objInfo].address)

      var result = {
        address: privateKey[objInfo].address,
        privateKey: privateKey[objInfo].privateKey
      }
      console.log("show me result====>>", result)

      return res.send({ code: 200, Result: result })
    }


    //return res.send({ code: 200, Result: result, Alert: "1) Do not lose it! It cannot be recovered if you lose it. 2) Do not share it! 3) Your funds will be stolen if you use this file on a malicious/phishing site. 4) Make a backup! 5)  Secure it like the millions of dollars it may one day be worth." })
  },


  ///////Getting an payment////////    
  get_payment: (req, res) => {

    console.log("req.body1111======>>>", req.body)
    if (!req.body.privateKey || !req.body.fromAddr || !req.body.toAddr || !req.body.value) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }

    getBalance(req.body.fromAddr, (err, result) => {
      console.log("result--->", result)
      //console.log("check balance ===>>", result > req.body.value)     
      if (err) {
        console.log("err34343", err)
        return res.send({ code: 500, message: "Internal server error" })
      }
      else if (result == undefined) {
        console.log("*****************")
        res.send({ code: 500, message: "Private key is Invalid!!" })
      }
      else if (result) {
        console.log("check balance ===>>", result)
        privateKey = (req.body.privateKey).split('0x')
        privateKey = privateKey[1]
        console.log("PrivateKey=======>>>", privateKey)
        var privateKey = new Buffer(privateKey, 'hex');
        console.log("=======>>>", privateKey)
        var amount = new BigNumber(req.body.value).multipliedBy(new BigNumber(Math.pow(10, 18)));
        signTxn(req.body.toAddr, req.body.fromAddr, amount, privateKey, (hash) => {
          if (hash) {
            console.log("hash=====>>", hash)
            web3.eth.sendSignedTransaction(hash).then((receipt) => {
              console.log('Transaction Hash---------->', receipt)
              //var fee_data = new BigNumber(receipt.gasUsed).dividedBy(new BigNumber(Math.pow(10, 9)));
              //  console.log("fee_data---->",fee_data)
              //var transactionFee = web3.eth.gasPrice * 21001;
              //web3.eth.getGasPrice().then((price) =>{
              var transactionFee = (5 * 1e9) * receipt.gasUsed;
              console.log("*************8", transactionFee)
              var fee_data = new BigNumber(transactionFee).dividedBy(new BigNumber(Math.pow(10, 18)));


              return res.send({ code: 200, txid: receipt.transactionHash, fee: fee_data })
            }).catch(err => {
              console.log("show me the error===>>", err)

              return res.send({ code: 500, message: "Insufficients Funds!!" })
            })
            // }) 
          }
        })
      } else {

        return res.send({ code: 500, message: "Internal server error" })
      }
    })

    //     })
    //   })
    // })
    //     })

  },

  ///////Getting an deposits////////
  get_deposits: function (req, res, ) {

    // console.log("We are in Deposits Api")
    if (!req.query.address) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var dataString = {
      "name": req.query.address,
    }

    var options = {
      //url:'http://api.etherscan.io/api?module=account&action=txlist&address='+ req.query.address +'&sort=asc',//mainnet
      url: 'http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + req.query.address + '&sort=desc',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataString)
    };

    function callback(error, response, body) {
      var arr = [];
      if (!error && response.statusCode == 200) {
        var body_result = JSON.parse(body).result
        if (body_result) {
          body_result.forEach((elem) => {
            if (elem.to === (req.query.address).toLowerCase()) { arr.push(elem) }
          })
          res.send({ code: 200, deposits: arr })
        }
        else {
          res.send({ code: 500, message: "Not Found." })
        }
      } else
        res.send({ code: 500, message: "Internal Sever Error" })
    }

    request(options, callback);



  },

  ///////Getting an balance////////
  get_balance: (req, res) => {

  //   if (!req.query.address) {
  //     return res.send({ code: 400, message: "Parameters Missing!!" })
  //   }
  //   else{
  //   getBalance(req.query.address).then((result) => {
  //     return res.send({ code: 200, balance: result })

  //   }).catch(err => {
  //     console.log("errrrr=====", err)
  //     res.send({ responseCode: 400, err })
  //   })
  // }
    if (!req.query.address) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    getBalance(req.query.address, (err, result) => {
      if (err) {
        console.log("show me err===>>",err)
        return res.send({ code: 500, message: "Internal Sever Error" })
      } else {
        return res.send({ code: 200, balance: result })
      }
    })
  },

  ///////Getting an transfer////////

  get_transfer: (req, res) => {

    console.log("req.body======>>>", req.body)
    if (!req.body.privateKey || !req.body.fromAddr || !req.body.toAddr) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    getBalance(req.body.fromAddr, (err, result) => {
      console.log("balance_api---->", result)
      if (err) {
        console.log("err34343", err)
        return res.send({ code: 500, message: "Internal server error" })
      }
      else if (result) {
        console.log("resultt----->", result)
        privateKey = (req.body.privateKey).split('0x')
        privateKey = privateKey[1]
        //console.log("=======>>>", privateKey)
        var privateKey = new Buffer(privateKey, 'hex');
        //console.log("=======>>>", privateKey)
        var amount = new BigNumber(result).multipliedBy(new BigNumber(Math.pow(10, 18)));
        console.log("**********", amount)
        // var current_fee = getCurrentGasPrice();
        // console.log("current_fee========>",current_fee)
        // var estGas_fee = estGas(req.body.toAddr, req.body.fromAddr, amount,cb);
        // console.log("estGas_fee====>",estGas_fee)
        // var amount_change = amount - 210000000000000000;
        //console.log("amount-change===>",amount_change)
        signTxn_transfer(req.body.toAddr, req.body.fromAddr, amount, privateKey, (hash) => {
          if (hash) {
            console.log("hash=====>>", hash)
            web3.eth.sendSignedTransaction(hash).then((receipt) => {
              console.log('Transaction Hash---------->', receipt)
              var fee_data = new BigNumber(receipt.gasUsed).dividedBy(new BigNumber(Math.pow(10, 9)));
              console.log("fee_data---->", fee_data)
              //var transactionFee = web3.eth.gasPrice * 21001;
              //  web3.eth.getGasPrice().then((price) =>{

              var transactionFee = (2 * 1e9) * receipt.gasUsed;
              console.log("*************8", transactionFee)
              var fee_data = new BigNumber(transactionFee).dividedBy(new BigNumber(Math.pow(10, 18)));
              var Sentamount_s = new BigNumber(amount).dividedBy(new BigNumber(Math.pow(10, 18)));
              var Sentamount = new BigNumber(Sentamount_s).minus(new BigNumber(fee_data));
              return res.send({ code: 200, txid: receipt.transactionHash, fee: fee_data, sent_amount: Sentamount })
            }).catch(err => {
              res.send({ code: 500, message: "Insufficients Funds!!" })
            })
            // })
          }
        })
      } else {

        return res.send({ code: 500, message: "Internal server error" })
      }
    })


  },

  //Details from the Transaction Id

  get_details: (req, res) => {
    if (!req.query.txid) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var command = {
      "jsonrpc": "2.0",
      "id": "1",
      "method": "eth_getTransactionByHash",
      "params": [
        req.query.txid
      ]
    }
    var options = {
      url: 'https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      form: JSON.stringify(command)
    };
    request(options, function (error, response, data) {
      const arr = []
      const data_result = JSON.parse(data)
      const d_value = parseInt(data_result.result.value)
      var amount = new BigNumber(d_value).dividedBy(new BigNumber(Math.pow(10, 18)));
      const d_gas = parseInt(data_result.result.gas)
      var fee = new BigNumber(d_gas).dividedBy(new BigNumber(Math.pow(10, 9)));

      arr.push({
        txid: data_result.result.hash,
        from: data_result.result.from,
        to: data_result.result.to,
        value: amount,
        gas: fee
      })
      if (!error && response.statusCode == 200) {

        res.send({ code: 200, message: "Success", Details: arr })
      }
      else
        res.send({ code: 500, message: "Internal Sever Error" })
    })


  },
}


//  validator:(req,res)=>{
//   // WAValidator.validate('0x47dd7aA36C2BDFce75fE172EBcE53e3c00a00389', 'ETH').then((result)=>{
//   //   console.log("result is ====>>",result)

//   // }).catch(err=>{
//   //   console.log("show me error===>>",err)
//   // })


// // var promise1 = new Promise(function (resolve ,reject){

// //   WAValidator.validate('0x47dd7aA36C2BDFce75fE172EBcE53e3c00a00389', 'ETH').then(function(value){

// //     console.log("show me value", value)

// //   })

// //   // promise1.then(function(value) {
// //   //   console.log(value);


// // })


// //   // var valid = WAValidator.validate('0x47dd7aA36C2BDFce75fE172EBcE53e3c00a00389', 'ETH');
// //   // if(valid)
// //   //   console.log('This is a valid address',valid);
// //   // else
// //   //   console.log('Address INVALID');


//  //})






// }






//0x47dd7aA36C2BDFce75fE172EBcE53e3c00a00389 - eth address
//0xd00021947ab4eFc518C416c7f262515A18A943C1

// {
//   "code": 200,
//   "Result": {
//       "address": "0x47dd7aA36C2BDFce75fE172EBcE53e3c00a00389",
//       "privateKey": "0x8114a3a0eef859daa5b38b990e4e4686e6e5a76482d492e21b853180ed36d3fe"
//   }
// }




// {
// 	"privateKey":"",
// 	"fromAddr":"",
// 	"toAddr":""
// }


// {
//   "code": 200,
//   "txid": "0x2f39be8c9f22d12133d8ebe0feb23c7ccce1e8afa7a0c06e6d5fd181e87ae33e",
//   "fee": "0.000042",
//   "sent_amount": "0.999958"
// }






// { address: '0xf3887898300c7841c7ec1FB220567478a2F4FAC3',
// privateKey:
//  '0x71038183be080e92804cef1ace2d2f122f6c2b2ab85f8f545ab06c763a7732f0' }


// 0xd00021947ab4eFc518C416c7f262515A18A943C1 - ether contained


// {
//   "code": 200,
//   "Result": {
//       "address": "0x324C4c16Fa16109E5F0716953Fc22cc3a50866BB",
//       "privateKey": "0x5d29830577c71e8610f24cf73138ffdb5dbb8b6154345cfa809a3b0315b34dbb"
//   },
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjE5NTc5NjZ9.qjZhKFWeLQ3TgaN8OT4kjqlkkS32CWGgVA3KgoRPKy8"
// }

