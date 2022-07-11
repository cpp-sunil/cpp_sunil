'use strict';

const Client = require('bitcoin-core');
const Utils = require('../../lib/utils');
const Config = require('config');
let BigNumber = require('bignumber.js');
const async = require('async')
var config = require('../../config/config')

var headers = require('../../server')
var request = require('request')

const client = new Client(Config.get('Bitcoin.testnet'));




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
        //console.log("unspents are", unspents);
        return cb(unspents)
    }).catch((err) => {
        console.log("==>>error log", err);
        return cb(null)
    })
}

/**
 * Returns the current bitcoin address for receiving payments to this account.
 * If <account> does not exist, it will be created along with an associated
 * new address that will be returned.
 *
 * @param  {[type]}
 * @param  {[type]}
 *
 * @return {[type]}
 */
exports.generateAddress = function (req, res) {
    var account = req.params.account;

    client.getAccountAddress(account, function (err, address) {
        if (err) {
            return console.error(err);
        }
        res.json({ 'code': 200, "address": address })
    });
};

//////////Generate a new address for an Corresponding Account /////////////////////


exports.generateNewAddress = function (req, res) {
    var account = req.params.account;

    client.getNewAddress(account, function (err, address) {
        if (err) {
            return console.error(err);
            res.json({ 'code': 200, "Error": err })

        }
        res.json({ 'code': 200, "address": address })
    });
};

/////////Get an adresss for an corresponding Account /////////////////////////

exports.listAddresses = function (req, res) {
    var account = req.params.account;

    client.getAddressesByAccount(account, function (err, address) {
        if (err) {
            return console.error(err);
            res.json({ 'code': 200, "Error": err })

        }
        res.json({ 'code': 200, "address": address })
    });
};

//////////Get balance of an address //////////////

exports.getBalance_addr = function (req, res) {
    var address = req.params.address;

    listUnspent().then(unspent => {
        var unspentBalance = unspent.filter((unspent) => unspent.address == address && unspent.confirmations >= 6);
        console.log("hhhhhhhhhhh", unspentBalance)
        var balance = 0;
        if (unspentBalance.length) {
            for (var transactions in unspentBalance) {
                balance += unspentBalance[transactions].amount;
            }
        }
        balance = Utils.round(balance, '8');
        console.log("Your balance of address : " + address + " is", balance);
        res.json({ code: 200, message: "Success", "balance": balance });
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
    var account = req.params.account;

    listUnspent().then(unspent => {
        var unspentBalance = unspent.filter((unspent) => unspent.account == account && unspent.confirmations >= 6);
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
    var account = req.params.account;

    client.listTransactions(account, function (err, deposits) {
        if (err) {
            return console.log(err);
        }
        if (deposits.length) {
            var depositSubet = [];
            for (var deposit in deposits) {
                var subset = (({ txid, amount, confirmations, address }) => ({ txid, amount, confirmations, address }))(deposits[deposit]);
                depositSubet.push(subset);
            }
            res.json(depositSubet);
        }
        else {
            res.json({ "code": "500" })
        }
    });
};


//Deposits from an Address

exports.addr_deposits = function (req, res) {
    if (!req.params.address) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    var address = req.params.address;
    client.getAccount(address, function (err, data) {
        console.log("Account name corressponding to the Address are --->", data)
        //})
        client.listTransactions(data, function (err, deposits) {
            console.log("----------------&&&&&&&&&&&", JSON.stringify(deposits));
            var array = deposits.filter((deposits) => deposits.address == address);
            if (err) {
                return console.log(err);
            }
            if (array.length) {
                var depositSubet = [];
                for (var deposit in array) {
                    var subset = (({ txid, amount, confirmations, account, timereceived }) => ({ txid, amount, confirmations, account, timereceived }))(array[deposit]);
                    depositSubet.push(subset);
                }
                res.json(depositSubet);
            }
            else {
                //console.log(array)
                res.json({ "code": "500" })
            }
        });
    })
};


//Time of the transactions
exports.accountDetails = function (req, res) {
    var account = req.params.account;

    client.listTransactions(account, function (err, deposits) {
        if (err) {
            return console.log(err);
        }
        if (deposits.length) {
            var depositSubet = [];
            for (var deposit in deposits) {
                var subset = (({ txid, amount, confirmations, address, category, timereceived }) => ({ txid, amount, confirmations, address, category, timereceived }))(deposits[deposit]);
                depositSubet.push(subset);
            }
            res.json(depositSubet);
        }
        else {
            res.json({ "code": "500" })
        }
    });
};



//
exports.tx_details = function (req, res) {
    var txid = req.params.txid;

    client.getTransaction(txid, function (err, data) {
        if (err) {
            console.log(err);
            return res.json({ "code": "500", "Message": "Internal server Error" })
        }
        if (data) {
            var data_details = data.details;
            var depositSubet = [];
            for (var deposit in data_details) {
                //console.log("%%%%%%%%%%%",data_details)
                if (data_details[deposit].category == 'receive') {
                    var subset = (({ account, address, category, amount, label }) => ({ account, address, category, amount, label }))(data_details[deposit]);
                    depositSubet.push(subset);
                }
            }
            data.details = depositSubet;
            res.json({ 'code': 200, 'result': data });
        }
        else {
            res.json({ "code": "500", "Message": "Internal server Error" })
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
        let rawtxid = await client.createRawTransaction(transactions, { [sendTo]: amount });
        return rawtxid;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}




///Withdraw for multiple addressses craete raw transactions
/**const createRawTransaction1 = async(transactions, destinations, fee) => {



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

*/

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
        console.log(err);
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
const signRawTransaction = (rawTransaction, privateKey) => {

    // try {
    //     let signedTransaction = await client.signRawTransaction(rawTransaction, [privateKey]);
    //     return signedTransaction;
    // }
    // catch (err) {
    //     console.log(err);
    //     throw err;
    // }
    // console.log("====>>>", rawTransaction, "===>>>>>>>>", privateKey)


    try {
        var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"signrawtransactionwithkey","params":["${rawTransaction}",["${privateKey}"]]}`;
        console.log("dataString=========>>>", dataString)
        var USER = "rpcuser";
        var PASS = "password";
        var options = {
            url: `http://${USER}:${PASS}@172.16.21.1:18332/`,
            // url: client,
            method: "POST",
            headers: headers,
            body: dataString
        };

        request(options, (err, data) => {
            console.log("Data============>>>>>>>", err, data.body)
            if (data) {
                let signedTransaction = data.body;
                return signedTransaction;
            }
        })



        // .then(data => {
        //     console.log("===>>>>>>", data)
        // })


        // var callback = (error, response, body) => {
        //     if (!error && response.statusCode == 200) {
        //         const data = JSON.parse(body);
        //         console.log("=======>>>>", data)
        //         // res.send(data);
        //         // cb(null,data)
        //         return data
        //     }
        // };
        //  request(options, callback);

    }
    catch (err) {
        console.log(err);
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
/**const calculateTxFee = async(input, output, confirmations) => {
    try {
        const fee = await client.estimateSmartFee(6);
        var txFee = (((input * 148 + output * 34 + 10) + 40) / 1024) * fee['feerate'];
        return txFee;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}*/

const calculateTxFee = async (input, output, confirmations) => {
    try {
        const fee = await client.estimateSmartFee(6);
        var txFee = 0.00001
        return txFee;
    }
    catch (err) {
        throw err;
    }
}


const createRawTransaction1 = async (transactions, destinations, fee) => {
    if (fee) {
        var txFee = Utils.round(fee, '8');
        var amount = amount - txFee;
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

/**
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.performTransfer = function (req, res) {
    listUnspent().then(unspent => {
        console.log("unspent", unspent)
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
            var addr = req.body.SendFrom;
            client.dumpPrivKey(addr).then(privateKey => {
                console.log("dumpprevkey", privateKey)
                console.log("transactionAmoun======>>>", transactionAmount)
                calculateTxFee(listTransactions.length, 1, 6).then(fee => {
                    console.log("================>>>", listTransactions)
                    createRawTransaction(listTransactions, req.body.SendTo, transactionAmount, fee).then(rawtxid => {
                        var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"signrawtransactionwithkey","params":["${rawtxid}",["${privateKey}"]]}`;
                        console.log("dataString=========>>>", dataString)
                        var USER = "rpcuser";
                        var PASS = "password";
                        var options = {
                            url: `http://${USER}:${PASS}@172.16.21.1:18332/`,
                            method: "POST",
                            headers: headers,
                            body: dataString
                        };
                        request(options, (err, data) => {
                            console.log("Data============>>>>>>>", err, data.body)
                            if (data) {
                                let signedTransaction = JSON.parse(data.body);
                                let resultSigned = signedTransaction.result.hex
                                console.log("data========<<>>>", resultSigned)
                                sendRawTransaction(resultSigned).then(sendTransactions => {
                                    res.json({
                                        'code': 200,
                                        'tx-hash': sendTransactions,
                                        'fee': Utils.round(fee, '8'),
                                        'sent-amount': transactionAmount
                                    });
                                });
                            }
                        })
                        // signRawTransaction(rawtxid, privateKey).then(signedTransaction => {
                        // console.log("signedTransaction===>>", signedTransaction)

                        // sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {
                        //     res.json({
                        //         'code': 200,
                        //         'tx-hash': sendTransactions,
                        //         'fee': Utils.round(fee, '8'),
                        //         'sent-amount': transactionAmount
                        //     });
                        // });
                        // });
                    });

                });

            })

        }
        else {
            res.json({ 'code': 500, "message": "No unspent transaction found for given address." });
        }
    });
};

/**
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.performWithdraw = function (req, res) {
console.log(client)
    //SendTo
    //AmountToTransfer
    //ChangeAddress
    var changeaddress = req.body.ChangeAddress ? req.body.ChangeAddress : null;
    // Get all unspent transactions
    listUnspent().then(unspent => {
        console.log("unspent=======>>", unspent)
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
            var addr = req.body.SendFrom;
            client.dumpPrivKey(addr).then(privateKey => {
                console.log("==========>>>>", privateKey)
                // Check if sufficient funds available...
                if (req.body.AmountToTransfer < transactionAmount) {
                    //Updated to use the fundRawTransaction method
                    createRawTransaction(listTransactions, req.body.SendTo, req.body.AmountToTransfer, null).then(rawtxid => {
                        fundRawTransaction(rawtxid, changeaddress).then(frt => {
                            console.log("frt=========>>>", frt)
                            var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"signrawtransactionwithkey","params":["${frt.hex}",["${privateKey}"]]}`;
                            console.log("dataString=========>>>", dataString)
                            var USER = "rpcuser";
                            var PASS = "password";
                            var options = {
                                url: `http://${USER}:${PASS}@172.16.21.1:18332/`,
                                method: "POST",
                                headers: headers,
                                body: dataString
                            };
                            request(options, (err, data) => {
                                // console.log("Data============>>>>>>>", err, data)
                                if (data) {
                                    // let signedTransaction = JSON.parse(data.body);
                                    console.log("signedTransaction==============>>>>>>",data.body)
                                    let signedTransaction = JSON.parse(data.body);
                                    let resultSigned = signedTransaction.result.hex
                                    console.log("data========<<>>>", resultSigned)
                                    sendRawTransaction(resultSigned).then(sendTransactions => {
                                        res.json({
                                            'code': 200,
                                            'tx-hash': sendTransactions,
                                            'fee': frt['fee']
                                        });
                                    });
                                }
                            })

                        }).catch(err => { res.json({ code: 500, message: err.message }); });
                    }).catch(err => { res.json({ code: 500, message: err.message }); });
                }
                else {
                    res.json({ 'code': 500, "message": "Insufficient Funds!" });
                }
            })

        }
        else {
            res.json({ 'code': 500, "message": "No unspent transaction found for given address." });
        }
    });
};




//multiple withdraw for an api

exports.multipleWithdraw = function (req, res) {
    if (!req.body.SendFrom || !req.body.ChangeAddress || !req.body.destinations) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    //SendTo
    //AmountToTransfer
    //ChangeAddress
    var changeaddress = req.body.ChangeAddress ? req.body.ChangeAddress : null;
    // Get all unspent transactions
    listUnspent().then(unspent => {
        var sendTransactions = unspent.filter((unspent) => unspent.address == req.body.SendFrom);
        var listTransactions = [];
        var transactionAmount = 0;
        console.log("hellooooo", sendTransactions)
        if (sendTransactions.length) {
            for (var transactions in sendTransactions) {
                listTransactions.push({
                    'txid': sendTransactions[transactions].txid,
                    'vout': sendTransactions[transactions].vout
                });
                transactionAmount += sendTransactions[transactions].amount;
            }
            var data = req.body.destinations;
            console.log("destinations---->", data)
            var obj = {};
            var arr = {};
            var totalamount = 0;
            for (var i in data) {
                totalamount = totalamount + data[i].amount;
                arr[data[i].address] = data[i].amount
            }
            console.log("result=======>", arr)
            console.log("total----->", totalamount)
            // Check if sufficient funds available...
            if (totalamount < transactionAmount) {
                //Updated to use the fundRawTransaction method
                createRawTransaction1(listTransactions, arr, null).then(rawtxid => {
                    fundRawTransaction(rawtxid, changeaddress).then(frt => {
                        console.log("frt==============>>>>", frt);
                        signRawTransaction(frt['hex']).then(signedTransaction => {
                            sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {
                                res.json({
                                    'code': 200,
                                    'tx-hash': sendTransactions,
                                    'fee': frt['fee']
                                });
                            }).catch(err => { res.json({ code: 500, message: err.message }); });
                        }).catch(err => { res.json({ code: 500, message: err.message }); });
                    }).catch(err => { res.json({ code: 500, message: err.message }); });
                }).catch(err => { res.json({ code: 500, message: err.message }); });
            }
            else {
                res.json({ 'code': 500, "message": "Insufficient Funds!" });
            }
        }
        else {
            res.json({ 'code': 500, "message": "No unspent transaction found for given address." });
        }
    });
};




//Api for getting the Transaction including fees

exports.transfer_fee = function (req, res) {
    let inputs = [], balance = 0, outputs = {}, change = 0, fee_rate = 0, fee_final = 0, change_address = "";
    if (!req.body.SendTo || !req.body.fee || !req.body.SendFrom) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }

    fee_rate = set_fee("med")
    fee_final = req.body.fee;
    console.log("AFSASFASFAF", fee_rate)
    list_unspent((unspents) => {
        if (unspents) {
            unspents = unspents.filter((elem) => {
                if (elem.address === req.body.SendFrom) {
                    inputs.push({ txid: elem.txid, vout: elem.vout });
                    balance = config.bigNumberOpera(balance, elem.amount, '+', 8);
                }
            })
            if (balance) {
                console.log("get the transaction size======>", get_txn_size(inputs.length, 1))
                console.log("SDFFSD", fee_rate, fee_final)
                //fee_final = config.bigNumberOpera(config.bigNumberOpera(get_txn_size(inputs.length, 1), fee_rate, '*', 8), Math.pow(10, 8), '/', 8);
                //console.log("fee_final------->",fee_final)
                //check if there is balance left after giving fee.
                if (config.bigNumberOpera(balance, fee_final, '-', 8) > 0) {
                    outputs[req.body.SendTo] = config.bigNumberOpera(balance, fee_final, '-', 8);

                    console.log("==>>", inputs, outputs, fee_final);
                    client.createRawTransaction(inputs, outputs).then((raw_txn) => {

                        client.signRawTransaction(raw_txn).then((signed_txn) => {

                            client.sendRawTransaction(signed_txn.hex).then((txn_hash) => {

                                res.json({
                                    'code': 200,
                                    'tx-hash': txn_hash,
                                    'fee': fee_final,
                                    'sent-amount': balance
                                });
                            }).catch((err_srt) => {
                                return res.send({ code: 500, message: "Txn cannot be sent." })
                            })
                        }).catch((err_srt) => {
                            return res.send({ code: 500, message: "Txn cannot be signed." })
                        })
                    }).catch((err_crt) => {
                        return res.send({ code: 500, message: "Txn cannot be generated." })
                    })
                } else {
                    return res.send({ code: 400, message: "Available balance will be used for fee. Not processed." });
                }
            } else {
                return res.send({ code: 400, message: "No balance to transfer." });
            }
        } else {
            return res.send({ code: 500, mesaage: "Internal Server error" });
        }
    })
};




exports.withdraw_fee = function (req, res) {
    let inputs = [], reqd = 0, outputs = {}, change = 0, fee_rate = 0, fee_final = 0;
    if (!req.body.SendFrom || !req.body.SendTo || !req.body.AmountToTransfer || !req.body.ChangeAddress || !req.body.fee) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    //fee_rate = set_fee("high");
    fee_final = req.body.fee;

    list_unspent((unspents) => {
        if (unspents) {
            unspents = unspents.filter(elem => elem.address === req.body.SendFrom);
            get_account_total(req.body.SendFrom, (hot_wallet_total) => {
                if (hot_wallet_total > req.body.AmountToTransfer) { //no equal comparison since zero fee txn will not show up.
                    for (let i = 0; i < unspents.length; i++) {
                        let txn_size = 0;
                        txn_size = get_txn_size(inputs.length + 1, 2);//inputs + 1 is on-purpose as we are estm one step before
                        // fee_final = config.bigNumberOpera(config.bigNumberOpera(txn_size, fee_rate, '*', 8), Math.pow(10, 8), '/', 8);

                        inputs.push({ "txid": unspents[i].txid, "vout": unspents[i].vout })
                        reqd = config.bigNumberOpera(reqd, unspents[i].amount, '+', 8);
                    }

                    let txn_size = get_txn_size(inputs.length, 2);
                    // fee_final = config.bigNumberOpera(config.bigNumberOpera(txn_size, fee_rate, '*', 8), Math.pow(10, 8), '/', 8);



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

//***************************************************************************************//

exports.getblockcount = function (req, res) {
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"signrawtransactionwithkey","params":[]}`;

    var USER = "rpcuser";
    var PASS = "password";
    var options = {
        url: `http://${USER}:${PASS}@172.16.21.1:18332/`,
        // url: client,
        method: "POST",
        headers: headers,
        body: dataString
    };

    var callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log("=======>>>>", data)
            res.send(data);
        }
    };
    request(options, callback);
};