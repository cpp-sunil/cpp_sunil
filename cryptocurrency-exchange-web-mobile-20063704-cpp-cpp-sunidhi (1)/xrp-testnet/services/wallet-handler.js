const commonFile = require('../global-files/common-file.js')
const mongoose = require('mongoose')
//const jwt = require('jsonwebtoken')
const config = require('../config/config')
const RippleAPI = require('ripple-lib').RippleAPI
const async = require('async')
const commonFun = require('../commonFunction/crypto')

let serverKey = process.env.serverKey

//const api = new RippleAPI({
  //  server: config.get('rippled')
//});

 const api = new RippleAPI({
     server:	'wss://s.altnet.rippletest.net:51233'
 });

let temp,

    getIntTkn = (serverId) => {
        return jwt.sign({ _id: serverId }, config.get('jwtSecretKey'))
    },

    generateAddrMainNet = () => {
        api.connect().then(() => {
            return api.generateAddress();
        }).then((newAddr) => {
            console.log("=======>>", newAddr)
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected.');
        }).catch(console.error);
    },


    getSeqNo = (srcAddr, cb) => {
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


    preparePaymentFn = (sourceAddr, destAddr, destTag, withdrawAmt, cb ) => {
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
                console.log("22",commonFile.bigNumberOpera(Number(balInAddr), Number(withdrawAmt), '-', 6))
                if(commonFile.bigNumberOpera(Number(balInAddr), Number(withdrawAmt), '-', 6) >= 20){
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
                }else{
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
        preparePaymentFn(sourceAddr, destAddr, destTag, withdrawAmt, (preparedPayment) => {
            console.log("@@@@@@@@payment prepared", preparedPayment)
            if (preparedPayment) {
                signPayment(preparedPayment.txJSON, secret, (signedPayment) => {
                    console.log("#######signed payment====>>>>", signedPayment)
                    if (signedPayment) {
                        return cb(signedPayment)
                    } else {
                        return cb(false)
                        
                    }
                })
            } else {
                return cb(false)
                
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

  //  "verifyAuthToken": (req, res, next) => {
    //    console.log("sending directly to the api")
      //  if (!req.headers.token) {
        //    return commonFile.responseHandler(res, 400, "No token provided.")
       // }
       // commonFile.jwtDecode(req.headers.token, (decoded) => {
         //   if (decoded) {
           //     console.log("token verified")
             //   next();
           // } else {
             //   return commonFile.responseHandler(res, 400, "Invalid token.")
           // }
       // })
  //  },


   // "get_auth_token": (req, res) => {
     //   if (!req.query.uniqueId) {
       //     return res.json({ 'code': 400, 'message': "Parameters missing." })
       // } else if (req.query.uniqueId == "gmoThailand") {
         //   return res.json({ "code": 200, "message": "Success.", "token": jwt.sign({ id: req.query.uniqueId }, "coinintegration") })
       // } else {
         //   res.json({ code: 400, message: "Please provide valide unique_id" })
      //  }
        // if (!req.query.uniqueId) {
        //     return commonFile.responseHandler(res, 400, "Parameters missing.")
        // }
        // return commonFile.responseHandler(res, 200, "Success.", jwt.sign({ id: req.query.uniqueId }, config.get('jwtSecretKey'),  ))
//    },
   
    "generate_new_addr": (req, res) => {
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
            return commonFile.responseHandler(res, 500, "Internal server error.")
        });
    },
"get_addr_info": (req, res) => {
        if (!req.query.addr) {
            return commonFile.responseHandler(res, 400, "Parameters missing.")
        }
         // var encryptData= commonFun.encrypt(req.query.addr)
    //  console.log("this is encrptData data",encryptData )
    // var dycrptedData = commonFun.decrypt(encryptData)
    //  console.log("this is DycrptData data",dycrptedData )
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
    },

    "deposit_history": (req, res) => {
        console.log("gDTxn", req.body)
        if (!req.body.destTags || !req.body.addr) {
            return commonFile.responseHandler(res, 400, "Parameters missing.")
        }
        let xrp_address = req.body.addr,
        tags = Number(req.body.destTags)
        // getUserTags(req.body.userId, (tags, withDrewAmt, lastUpdatedAmt) => {
        // tags=[10002]
        console.log("====>>", req.body.destTags)
        // if (tags) {
        let transDet = []
        api.connect().then(() => {
            return api.getServerInfo().then(info => {
               // console.log("Ripple ledger data received")
                let max = 0, min = 0;
                min = Number(info.completeLedgers.split('-')[0])
                max = Number(info.completeLedgers.split('-')[1])

                const address = xrp_address;
                let options = { minLedgerVersion: min, maxLedgerVersion: max }
                return api.getTransactions(address, options).then(transaction => {
                     //console.log("transactions are received here........281", transaction)
                    transaction.forEach((miniTransaction) => {
                       //console.log("transactions are received here", miniTransaction)
                        // tags.forEach((tag) => {
                        console.log("miniTransaction.specification.destination.tag======>>",miniTransaction.specification.destination.tag)
                        //console.log("tags======>>",tags)
                         console.log("miniTransaction.specification.destination======>>",miniTransaction.specification.destination)
                            if (miniTransaction.type === "payment" && miniTransaction.specification.destination.address === xrp_address || miniTransaction.specification.destination.tag === tags) {
                                transDet.push({ 
                                    transaction_hash: miniTransaction.id, 
                                    balance: miniTransaction.outcome.deliveredAmount.value, 
                                    created_at: new Date(miniTransaction.outcome.timestamp), 
                                    from: miniTransaction.specification.source.address ,
                                    to: miniTransaction.specification.destination.address 
                                })
                            }
                        // })
                    })
                  //  console.log("users total available balance is", transDet)
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
    },

    "payment_method": (req, res) => {
        let hash='';
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
}