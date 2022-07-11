const commonFile = require('../global-files/common-file.js')
//const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const async = require('async');
const StellarSdk = require('stellar-sdk');
const config1 = require('../configuration.js');
var value = 'myStellar1200008'

let serverKey = process.env.serverKey

//let provider = "https://horizon.stellar.org"; // testnet 

let provider = "https://stellar.org"

const server = new StellarSdk.Server(provider);

let myAddr = StellarSdk.Keypair.random();
// console.log(myAddr.publicKey(), myAddr.secret());
let pubKey = "GCLYA5C45M5BDYVFP26X52VB5KGPX3JGTAIPSEE45SRZW477JSBNJJZC"
//"GDHUWSWSTTGO46D3TB6HKZM6CHXVUX2N6H6IJQ5QCDUQOFWEXXFJ7TU7"//""//myAddr.publicKey()
// let new_public_key = StellarSdk.Keypair.fromPublicKey("GCLYA5C45M5BDYVFP26X52VB5KGPX3JGTAIPSEE45SRZW477JSBNJJZC")
// console.log("==>>keys", new_public_key.publicKey(), new_public_key.secret());

// server.loadAccount(pubKey).then(function (account) {
//     console.log('Balances for account: ' + pubKey);
//     account.balances.forEach(function (balance) {
//         console.log(balance, 'Type:', balance.asset_type, ', Balance:', balance.balance);
//     });
// });

StellarSdk.Network.usePublicNetwork();

let temp,

    getIntTkn = (serverId) => {
        return jwt.sign({ _id: serverId }, config.get('jwtSecretKey'))
    },

    generate_addr_mainnet = (cb) => {
        let new_addr = StellarSdk.Keypair.random();
        return cb(new_addr.publicKey(), new_addr.secret())
    },

    get_balance = (addr, cb) => {
        let balance = 0;
        server.loadAccount(addr).then(function (account) {
            account.balances.forEach(function (balance) {
                if (balance.asset_type === "native") {
                    balance = Number(balance.balance);
                }
            });
            return cb(balance);
        });
    }

const getSeqNo = (srcAddr, cb) => {
    let rspns, balance;
    api.connect().then(() => {
        const myAddress = srcAddr
        return api.getAccountInfo(myAddress);
    }).then(info => {
        temp = info
        console.log(info);
        rspns = info.sequence;
        balance = Number(info.xrpBalance);
        // return cb(info.sequence)
    }).then(() => {
        return api.disconnect();
    }).then(() => {
        console.log('done and disconnected gSNo.');
        return cb(rspns, balance)
    }).catch((error) => { console.log(error); return cb(null) });
},

   const preparePaymentFn = (sourceAddr, destAddr, destTag, withdrawAmt, cb) => {
        console.log("lkljklhn", destTag)
        let prep
        // api.connect().then(() => {   
        const address = sourceAddr;
        if (address === destAddr) {
            return cb(null)
        }
        const payment = {
            "source": {
                "address": address,
                "maxAmount": {
                    "value": String(withdrawAmt),
                    "currency": "XRP"
                }
            },
            "destination": {
                "address": destAddr,
                "amount": {
                    "value": String(withdrawAmt),
                    "currency": "XRP"
                },
                "tag": Number(destTag)
            }
        };
 
        getSeqNo(sourceAddr, (seqNo, balInAddr) => {
            console.log("1111", seqNo)
            if (seqNo) {
                console.log("22", commonFile.bigNumberOpera(Number(balInAddr), Number(withdrawAmt), '-', 6))
                if (commonFile.bigNumberOpera(Number(balInAddr), Number(withdrawAmt), '-', 6) >= 20) {
                    console.log("true val")
                    api.connect().then(() => {
                        console.log("check payment===>>>", payment)
                        const instructions = { fee: config.get('rippleFeeTemp'), sequence: seqNo, maxLedgerVersionOffset: 5000 };
                        console.log(instructions)
                        return api.preparePayment(address, payment, instructions).then(prepared => {
                            console.log("test prepared", prepared)
                            prep = prepared
                            // return cb(prepared)
                        })
                    }).then(() => {
                        return api.disconnect();
                    }).then(() => {
                        console.log('done and disconnected pPFn.');
                        return cb(prep)
                    }).catch((error) => { console.log(error); return cb(null) });
                } else {
                    return cb(null);
                }
            } else {
                return cb(null)
            }
        })
    },

    signPayment = (txJSONTemp, secret, cb) => {
        let sig;
        const txJSON = txJSONTemp;
        api.connect().then(() => {
            return api.sign(txJSON, secret)
        }).then((sign) => {
            console.log("payment signed=======>>>>>>", sign)
            sig = sign
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected sP.');
            return cb(sig)
        }).catch(error => { console.log(error); return cb(null) });
    },

    submitTxn = (signedTransactionTemp, cb) => {
        let sub
        const signedTransaction = signedTransactionTemp;
        api.connect().then(() => {
            return api.submit(signedTransaction)
        }).then((submit) => {
            console.log("submit response==========>>>>>", submit)
            sub = submit;
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected sT.');
            return cb(sub)
        }).catch(error => { console.log(error); return cb(null) });
    },

    prepAndSignTxn = (sourceAddr, destAddr, destTag, withdrawAmt, secret, cb) => {
        // console.log("wXRP 01", req.body)
        // let destAddr = req.body.destAddr,
        //     destTag = req.body.destTag,//Number
        //     withdrawAmt = req.body.withdrawAmt//String
        preparePaymentFn(sourceAddr, destAddr, destTag, withdrawAmt, (preparedPayment) => {
            console.log("@@@@@@@@payment prepared", preparedPayment)
            if (preparedPayment) {
                signPayment(preparedPayment.txJSON, secret, (signedPayment) => {
                    console.log("#######signed payment====>>>>", signedPayment)
                    if (signedPayment) {
                        return cb(signedPayment)
                    } else {
                        return cb(false)
                        // return commonFile.responseHandler(res, 400, "Payment could not be signed.")
                    }
                })
            } else {
                return cb(false)
                // return commonFile.responseHandler(res, 400, "Payment could not be prepared.")
            }
        })
    },

    getCurrentFee = (cb) => {
        let currentFee = 0
        api.connect().then(() => {
            return api.getFee().then(fee => {
                console.log("fee is this value", fee)
                currentFee = fee;
            }).then(() => {
                return api.disconnect();
            }).then(() => {
                console.log('done and disconnected fee.');
                return cb(currentFee)

            }).catch(error => { console.log(error); return cb(null) });
        })
    };

module.exports = {

    "verifyAuthToken": (req, res, next) => {
        console.log("sending directly to the api")
        if (!req.headers.auth_token) {
            return commonFile.responseHandler(res, 400, "No token provided.")
        }
        commonFile.jwtDecode(req.headers.auth_token, (decoded) => {
            if (decoded) {
                next();
            } else {
                return commonFile.responseHandler(res, 400, "Invalid token.")
            }
        })
    },

    "get_auth_token": (req, res) => {
        if (!req.query.uniqueId) {
            return commonFile.responseHandler(res, 400, "Parameters missing.")
        }
        return commonFile.responseHandler(res, 200, "Success.", jwt.sign({ id: req.query.uniqueId }, config.get('jwtSecretKey'), { expiresIn: '1h' }))
    },

    "generate_new_addr": (req, res) => {
         if (req.headers.value == config1.jwtSecretKey) {
             let addr = {}
        api.connect().then(() => {
            return api.generateAddress();
        }).then((newAddr) => {
            console.log("=======>>", newAddr)
            addr = newAddr;
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected.');
            return commonFile.responseHandler(res, 200, "Address generated successfully.", addr)
        }).catch((err) => {
            return commonFile.responseHandler(res, 200, "Internal server error.")
        });
         }
         else{
            res.send({
                code: 500,
                message: 'Not authurised person'
            });
         }
       
    },

    "get_addr_info": (req, res) => {
         if (req.headers.value == config1.jwtSecretKey) {
             if (!req.query.addr) {
            return commonFile.responseHandler(res, 400, "Parameters missing.")
        }
        console.log(req.body)
        temp = {};
        api.connect().then(() => {

            const myAddress = req.query.addr;//"rE2fYXMtm23Y158adNhtkRqD8ts5VygAh4"//
            console.log('getting account info for', myAddress);
            return api.getAccountInfo(myAddress);

        }).then(info => {
            temp = info
            console.log(temp)
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected.');
            return commonFile.responseHandler(res, 200, "Info Found Successfully", temp)
        }).catch((err) => {
            return commonFile.responseHandler(res, 500, "Internal server error.")
        });
         }
         else{
            res.send({
                code: 500,
                message: 'Not authurised person'
            });
         }
       
    },

    "deposit_history": (req, res) => {
         if (req.headers.value == config1.jwtSecretKey) {
             console.log("equal")
         }
         else{
            res.send({
                code: 500,
                message: 'Not authurised person'
            });
         }
       
    },

    "payment_method": (req, res) => {
         if (req.headers.value == config1.jwtSecretKey) {
             console.log("gDTxn", req.body)
        if (!req.body.destTags || !req.body.addr) {
            return commonFile.responseHandler(res, 400, "Parameters missing.")
        }
        let xrp_address = req.body.addr, tags = [];
        tags = Number(req.body.destTags)
        // getUserTags(req.body.userId, (tags, withDrewAmt, lastUpdatedAmt) => {
        // tags=[10002]
        console.log("====>>", req.body.destTags)
        // if (tags) {
        let transDet = []
        api.connect().then(() => {
            return api.getServerInfo().then(info => {
                console.log("Ripple ledger data received")
                let max = 0, min = 0;
                min = Number(info.completeLedgers.split('-')[0])
                max = Number(info.completeLedgers.split('-')[1])

                const address = xrp_address;
                let options = { minLedgerVersion: min, maxLedgerVersion: max }
                return api.getTransactions(address, options).then(transaction => {
                    console.log("transactions are received here", transaction)
                    transaction.forEach((miniTransaction) => {
                        // tags.forEach((tag) => {
                        if (miniTransaction.type === "payment" && miniTransaction.specification.destination.address === xrp_address && miniTransaction.specification.destination.tag === tags) {
                            transDet.push({ txnId: miniTransaction.id, quantity: miniTransaction.specification.destination.amount.value, time: (new Date(miniTransaction.outcome.timestamp).getTime()), symbol: "XRP", status: "APPROVED" })
                        }
                        // })
                    })
                    console.log("users total available balance is", transDet)
                });
            });
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected cuB.');
            return commonFile.responseHandler(res, 200, "Txns found successfully.", transDet)
        }).catch(error => {
            console.log("is this the error", error);
            return commonFile.responseHandler(res, 500, "Error loading Ledger: Txns cannot be found.")
        });
         }
         else{
            res.send({
                code: 500,
                message: 'Not authurised person'
            });
         }
        let hash = '';
        prepAndSignTxn(req.body.srcAddr, req.body.destAddr, req.body.toTag, req.body.amount, req.body.secret, (signedTxn) => {
            if (signedTxn) {
                submitTxn(signedTxn.signedTransaction, (submittedTxn) => {
                    if (submittedTxn.resultCode === "tesSUCCESS") {
                        hash = signedTxn.id;
                        return commonFile.responseHandler(res, 200, "XRP ledger processed the txn successfully.", hash)
                    } else {
                        return commonFile.responseHandler(res, 500, "XRP ledger could not submit the txn.")
                    }
                })
            } else {
                return commonFile.responseHandler(res, 500, "XRP ledger could not prepare the txn.")
            }
        })
    },

    "get_server_info": (req, res) => {
         if (req.headers.value == config1.jwtSecretKey) {
              let info_g;
        console.log("control is here.")
        api.connect().then(() => {
            return api.getServerInfo().then(info => { info_g = info; console.log(info) });
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected.');
            return commonFile.responseHandler(res, 200, "XRP server info.", info_g)
        }).catch(console.error);
         }
         else{
            res.send({
                code: 500,
                message: 'Not authurised person'
            });
         }
      
    },

    "send_stellar":(req, res)=>{
         if (req.headers.value == config1.jwtSecretKey) {
            var sourceKeys = StellarSdk.Keypair
          .fromSecret(req.body.secret_address);
        var destinationId = req.body.to_address;
        // Transaction will hold a built transaction we can resubmit if the result is unknown.
        var transaction;
        
        // First, check to make sure that the destination account exists.
        // You could skip this, but if the account does not exist, you will be charged
        // the transaction fee when the transaction fails.
        server.loadAccount(destinationId)
          // If the account is not found, surface a nicer error message for logging.
          .catch(StellarSdk.NotFoundError, function (error) {
            throw new Error('The destination account does not exist!');
          })
          // If there was no error, load up-to-date information on your account.
          .then(function() {
            return server.loadAccount(sourceKeys.publicKey());
          })
          .then(function(sourceAccount) {
            // Start building the transaction.
            transaction = new StellarSdk.TransactionBuilder(sourceAccount)
              .addOperation(StellarSdk.Operation.payment({
                destination: destinationId,
                // Because Stellar allows transaction in many currencies, you must
                // specify the asset type. The special "native" asset represents Lumens.
                asset: StellarSdk.Asset.native(),
                amount: req.body.amount
              }))
              // A memo allows you to add your own metadata to a transaction. It's
              // optional and does not affect how Stellar treats the transaction.
              .addMemo(StellarSdk.Memo.id(req.body.to_memo))
              .build();
            // Sign the transaction to prove you are actually the person sending it.
            transaction.sign(sourceKeys);
            // And finally, send it off to Stellar!
            return server.submitTransaction(transaction);
          })
          .then(function(result) {
            console.log('Success! Results:', result);
            return commonFile.responseHandler_1(res, 200, "Success",  result.hash )
          })
          .catch(function(error) {
            console.error('Something went wrong!', error);
            // If the result is unknown (no response body, timeout etc.) we simply resubmit
            // already built transaction:
            // server.submitTransaction(transaction);
          });
         }
         else{
            res.send({
                code: 500,
                message: 'Not authurised person'
            });
         }

        
        
    }
}