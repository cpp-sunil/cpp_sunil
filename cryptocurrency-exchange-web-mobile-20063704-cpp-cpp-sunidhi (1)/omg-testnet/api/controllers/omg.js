




var Web3 = require('web3');
var fs = require('fs');
var BigNumber = require('bignumber.js');
let Tx = require('ethereumjs-tx');
//var web3 = new Web3(Web3.givenProvider || 'https://mainnet.infura.io');//mainnet
var web3 = new Web3(Web3.givenProvider || 'https://api.infura.io/1c7b730f883e44f39134bc8a680efb9f');//testnet
var Accounts = require('web3-eth-accounts');
const ERC20Contract = require('erc20-contract-js');
//var accounts = new Accounts('https://mainnet.infura.io');//mainnet
var accounts = new Accounts('https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f');//testnet

const numberToBN = require('number-to-bn');
var CircularJSON = require('circular-json');
const request = require('request');

const jwt = require('jsonwebtoken');

var path = require("path");
var async = require('async')

let contractAddresss = "0xbb0b8aafa815d2c16bd131f2612516fa8d7022e9"

//---------------------------------------------=======================

const getBalance = (address, cb) => {
  web3.eth.getBalance(address).then(token => {
    console.log("amount==>>", token)
    token = new BigNumber(token).dividedBy(new BigNumber(Math.pow(10, 18)))
    console.log("amountBigNo.==>>", token)
    cb(null, token)
  }).catch(err => {
    cb(null, err)
  })
}


const getCurrentGasPrice = (cb) => {
  web3.eth.getGasPrice()
    .then((currentGasPrice) => {
      console.log("currentGasPrice===>>", currentGasPrice)
      return cb(currentGasPrice)
    })
}

const estGas = (toAddr, fromAddr, value, cb) => {
  web3.eth.estimateGas({
    from: fromAddr,
    to: toAddr,
    value: value
  }).then((estmdGas) => {
    console.log(" Your estmdGas is ==>>", estmdGas)
    return cb(estmdGas)
  }).catch(console.log)
}

const getTxnCountForNonce = (addr, cb) => {
  web3.eth.getTransactionCount(addr)
    .then((count) => {
      return cb(count)
    });
}

const signTxn_transfer = (toAddr, fromAddr, value, key, cb) => {
  estGas(toAddr, fromAddr, value, (estmdGas) => {
    getCurrentGasPrice((currentGasPrice) => {
      getTxnCountForNonce(fromAddr, (hardCount) => {
      
        var fee_res = new BigNumber(estmdGas).multipliedBy(new BigNumber(2 * 1e9));
        var data = new BigNumber(value).minus(new BigNumber(fee_res));
        // var actual_fee = new BigNumber(fee_res).dividedBy(new BigNumber(Math.pow(10, 18)))
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

const signTxn = (toAddr, fromAddr, value, key, cb) => {
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


  //---------------------------------------------------------------------------newAddress----------------------------------
  get_wallet: (req, res) => {

    if (!req.query.password) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var privateKey = web3.eth.accounts.wallet.create(1, req.query.password)
    //console.log("privatekey--------------" + CircularJSON.stringify(privateKey))
    var objInfo = privateKey.length - 1;
    //console.log("=====address>>====", privateKey[objInfo].address)

    var result = {
      address: privateKey[objInfo].address,
      privateKey: privateKey[objInfo].privateKey,
    }

    return res.send({ code: 200, Result: result })

  },

  ///////----------------------------------------Getting balance----------------------------------------------------------------------////////

  get_balance: (req, res) => {
    var options = {
          
     // url: `http://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddresss}&address=${req.query.address}`  
      url: `https://api-ropsten.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddresss}&address=${req.query.address}`
  
    };
    console.log(options);
    function callback(error, response, body) {
      console.log("))))))))))))(((((((((((===>>", body)
      if (!error && response.statusCode == 200) {
        res.send({ code: 200, balance: JSON.parse(body).result / 1000000 })
      } else {

        res.send({ code: 500, error: "Internal server error" })
      }
    }
    request(options, callback);

  },

  ////////////////////////////////////////////////withdraw///////////////////////////////

  withdraw: async (req, res) => {
    var str = req.body.privateKey
    var res1 = await str.split("x");  
    req.body.privateKey = res1[1];
    var obj = {
      fromAddr: req.body.fromAddr,
      toAddr: req.body.toAddr,
      privateKey: req.body.privateKey,
      amount: req.body.amount
    }
    
    if (!obj.fromAddr || !obj.toAddr || !obj.privateKey) {
      res.send({ code: 409, message: "Parameter Missing..!!!" })
    } else {
      var options = {
       
       // url: `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddresss}&address=${obj.fromAddr}`
        url: `https://api-ropsten.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddresss}&address=${obj.fromAddr}`
      };

      async function callback(error, response, body) {
        console.log("hshsd", body, )
       
        if (!error && response.statusCode == 200) {
 
          var balance1 = JSON.parse(body).result
          var mm = obj.amount*1000000
         obj.amount = parseInt(mm)
          console.log("balance===>>>", balance1, "....", obj.amount);

          if (balance1 > obj.amount) {
            
            // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
            var abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));
           
            var contractAddress = "0xbb0b8aafa815d2c16bd131f2612516fa8d7022e9";//Contract Address
            var contract = await new web3.eth.Contract(abiArray, contractAddress, { from: obj.fromAddr });
            
           var count= await web3.eth.getTransactionCount(obj.fromAddr)
           console.log("count>>", count)
            
            var rawTransaction = {
              "from": web3.utils.toHex(obj.fromAddr),
              "nonce": "0x" + count.toString(16),
              "gasPrice": web3.utils.toHex(2 * 1e9),
              "gasLimit": "0x250CA",
              "to": contractAddress,
              "value": "0x0",
              "data": contract.methods.transfer(obj.toAddr,  web3.utils.toHex(obj.amount)).encodeABI(),
             
              "chainId": 3     // FOR Ropsten Testnet 3 -- for mainnet 1
            };


           console.log("amount is ===>>",obj.amount)
        
            var privKey = new Buffer(obj.privateKey, 'hex');
            console.log("privKey ", privKey )
            var tx = new Tx(rawTransaction);
          //  console.log("tx  ", tx  )
            await tx.sign(privKey)
            var serializedTx = await tx.serialize();
            //console.log("tx  ", tx  )

            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).then(receipt => {
              console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
       
              var transactionFee = (5 * 1e9) * receipt.gasUsed;

                console.log("*************8", transactionFee)
              var fee_data = new BigNumber(transactionFee).dividedBy(new BigNumber(Math.pow(10, 18)));


              res.send({ code: 200, txid: receipt.transactionHash , fee :fee_data})
            }).catch(err => {
              console.log("show me the err", err)
              res.send({ code: 500, error: "Insufficient funds" })
            });//
          }
          else {
            res.send({ code: 404, error: "Insufficient funds.." })
          }
        }
        else {
          res.send({ code: 500, error: "Internal server error" })
        }
      }
      request(options, callback);
    }
  },

  //=========================================================transfer==================================================================
  transfer: async (req, res) => {
    var str = req.body.privateKey
    var res1 = await str.split("x");
    req.body.privateKey = res1[1];
    var obj = {
      fromAddr: req.body.fromAddr,
      toAddr: req.body.toAddr,
      privateKey: req.body.privateKey,
      //amount: req.body.amount
    }

   // console.log("obj", obj.fromAddr, obj.toAddr, obj.privateKey, obj.amount)
    if (!obj.fromAddr || !obj.toAddr || !obj.privateKey) {
      res.send({ code: 409, message: "Parameter Missing..!!!" })
    } else {
      var options = {
        
        //url: `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddresss}&address=${obj.fromAddr}`
        url: `https://api-ropsten.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddresss}&address=${obj.fromAddr}`
      };
      console.log(options);

      async function callback(error, response, body) {
      
        console.log("...", balance1);
        if (!error && response.statusCode == 200) {

          var balance1 = JSON.parse(body).result                
          var mm = obj.amount*1000000
         obj.amount = parseInt(mm)
          console.log("balance===>>>", balance1, "....", obj.amount);

          if (balance1 != 0) {

            // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
            var abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));
            var contractAddress = "0xbb0b8aafa815d2c16bd131f2612516fa8d7022e9";//Contract Address
            var contract = new web3.eth.Contract(abiArray, contractAddress, { from: obj.fromAddr });
            var count = await web3.eth.getTransactionCount(obj.fromAddr);
            var rawTransaction = {
              "from": web3.utils.toHex(obj.fromAddr),
              "nonce": "0x" + count.toString(16),
              "gasPrice": web3.utils.toHex(2 * 1e9),
              "gasLimit": "0x250CA",
              "to": contractAddress,
              "value": "0x0",
              "data": contract.methods.transfer(obj.toAddr,  web3.utils.toHex(balance1)).encodeABI(),
              "chainId": 3          //FOR Ropsten Testnet 3 -- for mainnet 1
            };
            var privKey = new Buffer(obj.privateKey, 'hex');
            var tx = new Tx(rawTransaction);
            tx.sign(privKey)
            var serializedTx = await tx.serialize();

            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).then(receipt => {
              console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
              var transactionFee = (5 * 1e9) * receipt.gasUsed;

             console.log("*************8", transactionFee)
              var fee_data = new BigNumber(transactionFee).dividedBy(new BigNumber(Math.pow(10, 18)));

              res.send({ code: 200, txid:receipt.transactionHash , fee:fee_data})
            }).catch(err => {
              console.log("errrrr", err);
              res.send({ code: 500, err: "Transaction receipt not found"})
            });//
          } else {
            res.send({ code: 500, error: "Insufficient funds" })
          }
        } else {
          res.send({ code: 500, error: "Internal server error" })
        }
      }
      request(options, callback);
    }
  },

  ///////-------------------------------------------------accountHistory--------------------------------------////////
  get_deposits: function (req, res, ) {
    if (!req.query.address) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var dataString = {
      "name": req.query.address,
    }

    var options = {
     // url: 'http://api.etherscan.io/api?module=account&action=txlist&address=' + req.query.address + '&sort=asc',//mainnet
       url: 'http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + req.query.address + '&sort=desc',//testnet
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataString)
    };

    function callback(error, response, body) {
      var arr =[]
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
      }
      else
        res.send({ code: 500, message: "Internal Sever Error" })
    }
       
    request(options, callback);

  },

}


//----usdc---mainnet

// {
//   "code": 200,
//   "Result": {
//       "address": "0xC46E069Bf62c983295b04e8f91f4691b4Ea83a42",
//       "privateKey": "0x8e317cb45851bdc52bcda956cb693077e2a4672896443787b63ebcc8cb57e3dc"
//   }
// }