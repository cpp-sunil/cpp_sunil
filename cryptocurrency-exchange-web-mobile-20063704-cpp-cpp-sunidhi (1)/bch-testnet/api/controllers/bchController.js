'use strict';

const Client = require('bitcoin-core');
var jwt = require('jsonwebtoken')
const Utils = require('../../lib/utils');
const Config = require('config');
var config = require('../../config/config')
let BigNumber = require('bignumber.js');
const async = require('async')
const commonFun = require('../../commonFunction/crypto')
const client = new Client(Config.get('BCH.testnet'));





/**
 * Returns the current bitcoin address for receiving payments to this account.
 * If <account> does not exist, it will be created along with an associated
 * new address that will be returned.
 *
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */


exports.get_auth_token = function (req, res) {
    if (!req.query.uniqueId) {
        return res.json({ 'code': 400, 'message': "Parameters missing." })
    } else if (req.query.uniqueId == "gmoThailand") {
        return res.json({ "code": 200, "message": "Success.", "Data": jwt.sign({ id: req.query.uniqueId }, "coinintegration") })
    } else {
        res.json({ responseCode: 400, responseMessage: "Please provide valide unique_id" })
    }

};

exports.generateAddress = function (req, res) {
    if (!req.params.account) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    var account = req.params.account;
    // var encryptData= commonFun.encrypt(req.params.address)
    //  console.log("this is encrptData data",encryptData )
    // var dycrptedData = commonFun.decrypt(encryptData)
    //  console.log("this is DycrptData data",dycrptedData )  
    client.getAccountAddress(account, function (err, address) {
        if (err) {
            return console.error(err);
        }
        //var token = jwt.sign(address, "coinintegration");
        res.json({ 'code': 200, "address": address })
    });
};

//////////Generate a new address for an Corresponding Account /////////////////////


exports.generateNewAddress = function (req, res) {
    if (!req.params.account) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    var account = req.params.account;

    client.getNewAddress(account, function (err, address) {
        if (err) {
            return console.error(err);
            res.json({ 'code': 200, "Error": err })

        }
        var token = jwt.sign(address, "coinintegration");
        res.json({ 'code': 200, "address": address, token })
    });
};

/////////Get an adresss for an corresponding Account /////////////////////////

exports.listAddresses = function (req, res) {
    if (!req.params.account) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    var account = req.params.account;

    client.getAddressesByAccount(account, function (err, address) {
        if (err) {
            return console.error(err);
            res.json({ 'code': 200, "Error": err })

        }
        //  console.log("Your balance of address : ", balance);
        //var encryptData1= commonFun.encrypt(balance.toString())
        // console.log("this is encrptData data " +encryptData1);
        res.json({ 'code': 200, "address": address })
    });
};

//////////Get balance of an address //////////////

exports.getBalance_addr = function (req, res) {
    if (!req.params.address) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    var address = req.params.address;

    listUnspent().then(unspent => {
        var unspentBalance = unspent.filter((unspent) => unspent.address == address);
        console.log("hhhhhhhhhhh", unspentBalance)
        var balance = 0;
        if (unspentBalance.length) {
            for (var transactions in unspentBalance) {
                balance += unspentBalance[transactions].amount;
            }
        }
        balance = Utils.round(balance, '8');
        console.log("Your balance of address : " + address + " is", balance);
        res.json({ 'code': 200, 'message': "Success", "balance": balance });
    });
};


// exports.getBalance_addr = (req, res) => {
//     let total = 0;
//     listUnspent().then(unspents => {
//         async.forEachSeries(unspents, (unspent, next) => {
//             console.log("unspent", unspent)
//             client.getTransaction(unspent.txid).then((success) => {
//                 console.log("==>>came inside this block ", success)
//                 next();
//             }).catch((err) => {
//                 // console.log("==>>", JSON.parse(err.text).result.details)
//                 let tx_data = JSON.parse(err.text);
//                 if (err && err.text && tx_data && tx_data.result && tx_data.result.details.length) {
//                     tx_data.result.details.forEach((item) => {
//                         console.log(item.amount, typeof item.amount)
//                         if (item.address === req.params.address && item.category === "receive" && item.amount === unspent.amount) {
//                             console.log("total before", total)
//                             total = bigNumberOpera(total, item.amount, '+', 8);
//                         }
//                     })
//                 }
//                 next();
//             })
//         }, (end_of_iter) => {
//             console.log("final total is ", total);
//             res.json({
//                 "code": 200,
//                 "balance": total
//             });

//         })
//     }).catch((err_balanace) => {
//         console.log(err_balanace);
//     })
// }

/**
 * If [account] is not specified, returns the server's total available
 * balance. If [account] is specified, returns the balance in
 * the account.
 *
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.getBalance = function (req, res) {
    if (!req.params.account) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    var account = req.params.account;

    listUnspent().then(unspent => {
        var unspentBalance = unspent.filter((unspent) => unspent.account == account);
        var balance = 0;
        if (unspentBalance.length) {
            for (var transactions in unspentBalance) {
                balance += unspentBalance[transactions].amount;
            }
        }
        balance = Utils.round(balance, '8');
        res.json({ 'code': 200, "balance": balance });
    });
};


/**
 * Returns up to [count] most recent transactions skipping the
 * first [from] transactions for account [account].
 * If [account] not provided it'll return recent transactions
 * from all accounts.
 *
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.getReceivedByAccount = function (req, res) {
//    if (!req.params.account) {
  //      return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
   // }
   // var account = req.params.account;

   // client.listTransactions(account, function (err, deposits) {
     //   console.log(err, deposits);
       // if (err) {
         //   return console.log(err);
     //   }
      //  if (deposits.length) {
        //    var depositSubet = [];
          //  for (var deposit in deposits) {
            //    var subset = (({ txid, amount, confirmations, address }) => ({ txid, amount, confirmations, address }))(deposits[deposit]);
              //  depositSubet.push(subset);
         //   }
        //    res.json(depositSubet);
     //   }
    //    else {
      //      res.json({ "code": "500" })
      //  }
   // });
//};
if (!req.params.address) {
    return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
}
//var address = req.params.address;
client.listReceivedByAddress(async function (err, deposits) {
    // console.log("..........", err, deposits);
    if (err) {
        return console.log(err); 
    }
    else {
        //  res.send({code:200 , result:deposits})
        var arr = []
       // var flag = 0
             await async.forEach(deposits, async function (elements) {

            if (elements.address == req.params.address) {
             await async.forEach(elements.txids, async function (elements1) {

          await  client.getTransaction(elements1, function (err, resultss) {

                          //   console.log("show get Tranactions",resultss)
                        if (err) {
                            console.log("err is ==>>", err)
                            res.send({code:500 , responseMessage:"Internal server error"})
                        }
                        else {
                            var piece = {
                                address: req.params.address,
                                amount: resultss.amount,
                                confirmations: resultss.confirmations,
                                category: "receive",
                                txid: elements1,
                                timestamp:resultss.time

                            }

                            arr.push(piece)

                        }                    })
                })
            }
        })

        console.log("arr is   ", arr)
            res.send({ code: 200, deposits: arr })
       
    
    }

   
});

};

/**
 * Returns array of unspent transaction inputs in the wallet
 *
 * @return {Array} unspent transactions
 */
const listUnspent = async () => {
    try {
        let unspent = await client.listUnspent();
        return unspent;
    }
    catch (err) {
        //Failed to fetch unspent transactions.
        console.log(err);
    }

}


/**
 * Create a transaction spending given inputs, send to given address(es)
 *
 * @param  {Array} Transaction Object
 * @param  {String} Sending Address
 * @param  {Float} Spendable Amount
 * @return {String} Returns the hex-encoded transaction in a string
 */
const createRawTransaction = async (transactions, sendTo, amount, fee) => {

    if (fee) {
        var txFee = Utils.round(fee, '8');
        amount = amount - txFee;
        amount = Utils.round(amount, '8');

    }

    try {
        if (txFee) {
            let transactionFee = await client.setTxFee(txFee);
        }
        console.log("asdfasdfas", amount, txFee)
        let rawtxid = await client.createRawTransaction(transactions, { [sendTo]: amount });
        return rawtxid;
    }
    catch (err) {
        console.log("error 1 -------", err);
        throw err;
    }
}


const createRawTransaction_data = async (transactions, output) => {



    try {

        console.log("asdfasdfas", transactions, output)
        let rawtxid = await client.createRawTransaction(transactions, output);
        return rawtxid;
    }
    catch (err) {
        console.log("error 1 -------", err);
        throw err;
    }
}

/**
 * @param  {[type]}
 * @return {[type]}
 */
const fundRawTransaction = async (rawTransaction, changeAddress) => {

    try {
        if (changeAddress) {
            let frt = await client.fundRawTransaction(rawTransaction, { "changeAddress": changeAddress });
            return frt;
        }
        else {
            let frt = await client.fundRawTransaction(rawTransaction);
            return frt;
        }
    }
    catch (err) {
        console.log("error 2 ------", err);
        throw err;
    }
}

/**
 * Adds signatures to a raw transaction and returns the resulting
 * raw transaction.
 *
 * @param  {String} Hex encoded transaction
 * @return {String} Signed raw transaction
 */
const signRawTransactionWith = async (rawTransaction) => {

    try {
        let signedTransaction = await client.signRawTransaction(rawTransaction);
        return signedTransaction;
    }
    catch (err) {
        console.log("error 3 ---------", err);
        throw err;
    }
}


/**
 * Submits raw transaction (serialized, hex-encoded) to local node and network.
 *
 * @param  {String} Signed transaction
 * @return {String} Transaction Id
 */
const sendRawTransaction = async (signedTransaction) => {
    try {
        let sendTransactions = await client.sendRawTransaction(signedTransaction);
        return sendTransactions;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Calculate transaction fees for Regular pay-to addresses
 * (Legacy Non-segwit - P2PKH/P2SH)
 *
 * @param  {Integer} Total inputs of unspent transactions
 * @param  {Integer} Total outputs
 * @param  {Integer} # of confirmations for the transaction to calculate the transaction fees
 * @return {Double}  Transaction Fee
 */
const calculateTxFee = async (input, output, confirmations) => {
    try {
        const fee = await client.estimateSmartFee(6);
        var txFee = (((input * 148 + output * 34 + 10) + 40) / 1024) * fee['feerate'];
        console.log("txfee-------->", txFee)
        return txFee;
    }
    catch (err) {
        console.log("error 4 ------", err);
        throw err;
    }
}

///Withdraw for multiple addressses craete raw transactions
const createRawTransaction1 = async (transactions, destinations, fee) => {



    if (fee) {
        var txFee = Utils.round(fee, '8');
        amount = amount - txFee;
        amount = Utils.round(amount, '8');
    }

    try {
        if (txFee) {
            let transactionFee = await client.setTxFee(txFee);
        }
        let rawtxid = await client.createRawTransaction(transactions, destinations);
        return rawtxid;
    }
    catch (err) {
        console.log(err);
    }
}

//Function for getting the transaction size
const get_txn_size = (inputs, outputs) => {
    return config.bigNumberOpera(config.bigNumberOpera(config.bigNumberOpera(inputs, 180, '*', 0), config.bigNumberOpera(outputs, 34, '*', 0), '+', 0), config.bigNumberOpera(10, inputs, '+', 0), '+', 0);
};

//Function for setting the fee
const set_fee = (param) => {
    if (param === "low") {
        return 10;
    }
    else if (param === "med") {
        return 15;
    }
    else if (param === "high") {
        return 40;
    }
    else if (isNaN(param) === false) {
        return Number(param);
    } else {
        return 15;
    }
}


let get_account_total = (address, cb) => {
    let balance = 0;
    list_unspent((unspents) => {
        if (unspents) {
            unspents.forEach((elem) => {
                if (elem.address === address) {
                    balance = config.bigNumberOpera(balance, elem.amount, '+', 8);
                }
            })
            console.log("balance is", balance);
            return cb(balance);
        } else {
            return cb(null);
        }
    })
}

let list_unspent = (cb) => {
    client.listUnspent().then((unspents) => {
        console.log("unspents are", unspents);
        return cb(unspents)
    }).catch((err) => {
        console.log("==>>error log", err);
        return cb(null)
    })
}


/**
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.performTransfer = function (req, res) {
    console.log("0000000000000")
    if (!req.body.SendFrom || !req.body.SendTo) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    // Get all unspent transactions
    listUnspent().then(unspent => {
        var sendTransactions = unspent.filter((unspent) => unspent.address == req.body.SendFrom);
        var listTransactions = [];
        var transactionAmount = 0;

        if (sendTransactions.length) {
            for (var transactions in sendTransactions) {
                listTransactions.push({
                    'txid': sendTransactions[transactions].txid,
                    'vout': sendTransactions[transactions].vout
                });
                transactionAmount += sendTransactions[transactions].amount;
            }
            if (transactionAmount) {
                let fee_rate = set_fee("high");

                let fee_final = config.bigNumberOpera(config.bigNumberOpera(get_txn_size(listTransactions.length, 1), fee_rate, '*', 8), Math.pow(10, 8), '/', 8);
                console.log("final_fee is", fee_final, listTransactions, transactionAmount);

                //calculateTxFee(listTransactions.length, 1, 6).then(fee => {
                createRawTransaction(listTransactions, req.body.SendTo, transactionAmount, fee_final).then(rawtxid => {
                    signRawTransaction(rawtxid).then(signedTransaction => {
                        sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {

                            res.json({
                                'code': 200,
                                'tx-hash': sendTransactions,
                                'fee': Utils.round(fee_final, '8'),
                                'sent-amount': transactionAmount
                            });
                        }).catch(err => { res.json({ code: 500, message: err.message }); });
                    }).catch(err => { res.json({ code: 500, message: err.message }); });
                }).catch(err => { res.json({ code: 500, message: err.message }); });
                // }).catch(err => {  res.json({ code: 500,message: err.message });   });
            }
            else {
                res.json({ 'code': 500, "message": "No unspent transaction found for given address." });
            }

        }
    });
};

/**
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.performWithdraw = function (req, res) {
    let inputs = [], reqd = 0, outputs = {}, change = 0, fee_rate = 0, fee_final = 0;
    if (!req.body.SendFrom || !req.body.SendTo || !req.body.AmountToTransfer || !req.body.ChangeAddress) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    fee_rate = set_fee("high");
    list_unspent((unspents) => {
        if (unspents) {
            unspents = unspents.filter(elem => elem.address === req.body.SendFrom);
            get_account_total(req.body.SendFrom, (hot_wallet_total) => {
                if (hot_wallet_total > req.body.AmountToTransfer) { //no equal comparison since zero fee txn will not show up.
                    for (let i = 0; i < unspents.length; i++) {
                        let txn_size = 0;
                        txn_size = get_txn_size(inputs.length + 1, 2);//inputs + 1 is on-purpose as we are estm one step before
                        fee_final = config.bigNumberOpera(config.bigNumberOpera(txn_size, fee_rate, '*', 8), Math.pow(10, 8), '/', 8);

                        inputs.push({ "txid": unspents[i].txid, "vout": unspents[i].vout })
                        reqd = config.bigNumberOpera(reqd, unspents[i].amount, '+', 8);

                    }

                    let txn_size = get_txn_size(inputs.length, 2);
                    fee_final = config.bigNumberOpera(config.bigNumberOpera(txn_size, fee_rate, '*', 8), Math.pow(10, 8), '/', 8);



                    change = config.bigNumberOpera(reqd, config.bigNumberOpera(req.body.AmountToTransfer, fee_final, '+', 8), '-', 8);
                    outputs[req.body.SendTo] = Number(req.body.AmountToTransfer);
                    outputs[req.body.ChangeAddress] = change;
                    console.log("inputs, outputs=>", inputs, outputs, fee_final);
                    client.createRawTransaction(inputs, outputs).then((raw_txn) => {
                        console.log("raw txn =>", raw_txn)
                        client.signRawTransaction(raw_txn).then((signed_txn) => {
                            console.log("==>>signed raw txn", signed_txn);
                            client.sendRawTransaction(signed_txn.hex).then((txn_hash) => {
                                console.log("==>>txn_hash==>>", txn_hash);
                                res.json({
                                    'code': 200,
                                    'tx-hash': txn_hash,
                                    'fee': fee_final
                                });
                            }).catch((err_srt) => {
                                return res.send({ code: 500, message: "Txn cannot be sent." })
                            })
                        }).catch((err_srt) => {
                            return res.send({ code: 500, message: "Txn cannot be signed." })
                        })
                    }).catch((err_crt) => {
                        res.send({ code: 500, message: "Txn cannot be generated." })
                    })
                } else {
                    res.send({ code: 500, message: "Not enough balance." });
                }
            })
        } else {
            res.send({ code: 500, message: "Internal Server error" })
        }
    })
};








