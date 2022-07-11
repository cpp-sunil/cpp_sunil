
const Client = require('bitcoin-core');
const Utils = require('../../lib/utils');
const Config = require('config');
let BigNumber = require('bignumber.js');
const async = require('async')
const _ = require('lodash')
const config = require('../../config/config')
var jwt = require('jsonwebtoken');
const client = new Client(Config.get('Dash.testnet'));

// exports.get_auth_token = function (req, res) {
//     if (!req.query.uniqueId) {
//         return res.json({ 'code': 400, 'message': "Parameters missing." })
//     } else if (req.query.uniqueId == "gmoThailand") {
//         return res.json({ "code": 200, "message": "Success.", "Data": jwt.sign({ id: req.query.uniqueId }, "coinintegration") })
//     } else {
//         res.json({ responseCode: 400, responseMessage: "Please provide valide unique_id" })
//     }

// };

exports.generateNewAddress = function (req, res) {
    
    if (!req.params.account) {
        return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var account = req.params.account;
    console.log(account)
    client.getNewAddress(account, function (err, address) {
        if (err) {
            console.log(err)
            res.send({ 'code': 500, 'Error': err })
        }
        console.log(address)
        res.json({ 'code': 200, address: address })
    });
};

exports.listAddresses = function (req, res) {
    if (!req.params.account) {
        return res.send({ code: 400, message: "Parameters Missing!!" })
    } else {
        var account = req.params.account;
        client.getAddressesByAccount(account, function (err, address) {
            if (err) {
                res.json({ 'code': 200, "Error": err })
            }
            res.json({ 'code': 200, "address": address })
        });
    }

};

exports.getBalance_addr = function (req, res) {
    if (!req.params.address) {
        return res.send({ code: 400, message: "Parameters Missing!!" })
    } else {
        var address = req.params.address;
        listUnspent().then(unspent => {
            var unspentBalance = unspent.filter((unspent) => unspent.address == address);
            var balance = 0;
            if (unspentBalance.length) {
                for (var transactions in unspentBalance) {
                    balance += unspentBalance[transactions].amount;
                }
            }
            balance = Utils.round(balance, '8');
            var bal = balance.toString()
            res.json({ code: 200, balance: bal });
        });
    }
};

exports.getBalance = function (req, res) {
    if (!req.params.account) {
        return res.send({ code: 400, message: "Parameters Missing!!" })
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

exports.getReceivedByAccount = function (req, res) {
    if (!req.params.address) {
        res.send({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }
    client.listReceivedByAddress(async function (err, deposits) {
        if (err) {
            res.send({ code: 500, responseMessage: "Internal server error" })
        }
        else {
            var arr = [];
            var count = 0;
            for (var i = 0; i < deposits.length; i++) {
                if (deposits[i].address == req.params.address) {
                    for (var j = 0; j < deposits[i].txids.length; j++) {
                        await client.getTransaction(deposits[i].txids[j]).then(data => {
                            arr.push({
                                address: req.params.address,
                                amount: data.amount,
                                confirmations: data.confirmations,
                                category: "receive",
                                txid: data.txid,
                                timestamp: data.time
                            })
                        }).catch(err => {
                            console.log("arr is errrr", err)
                            res.send({ code: 500, responseMessage: "Internal server error" })
                        })
                        if (deposits[i].txids.length - 1 == j) {
                            res.send({ code: 200, deposits: arr })
                        }
                    }
                }
            }

        }
    })

};

const listUnspent = async () => {
    try {
        let unspent = await client.listUnspent();
        return unspent;
    }
    catch (err) {
        console.log(err);
    }

}

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
    }
}

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
    }
}

const signRawTransaction = async (rawTransaction) => {
    try {
        let signedTransaction = await client.signRawTransaction(rawTransaction);
        return signedTransaction;
    }
    catch (err) {
        console.log(err);
    }
}

const sendRawTransaction = async (signedTransaction) => {
    try {
        let sendTransactions = await client.sendRawTransaction(signedTransaction);
        return sendTransactions;
    }
    catch (err) {
        console.log(err);
    }
}

const calculateTxFee = async (input, output, confirmations) => {
    try {
        const fee = await client.estimateSmartFee(6);
        var txFee = (((input * 148 + output * 34 + 10) + 40) / 1024) * fee['feerate'];
        return txFee;
    }
    catch (err) {
        console.log(err);
    }
}
const get_txn_size = (inputs, outputs) => {
    return config.bigNumberOpera(config.bigNumberOpera(config.bigNumberOpera(inputs, 180, '*', 0), config.bigNumberOpera(outputs, 34, '*', 0), '+', 0), config.bigNumberOpera(10, inputs, '+', 0), '+', 0);
};

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

exports.performTransfer = function (req, res) {
    console.log("show me request ====>>", req.body)
    if (!req.body.SendTo || !req.body.SendFrom) {
        res.json({ responseCode: 400, responseMessage: "Parameters missing" })
    }
    else {
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
                    createRawTransaction(listTransactions, req.body.SendTo, transactionAmount, fee_final).then(rawtxid => {
                        signRawTransaction(rawtxid).then(signedTransaction => {
                            console.log("sign raw transaction===>>", signedTransaction)
                            sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {
                                console.log("sendRaw TRansaction========>>>", sendTransactions)
                                res.json({
                                    'code': 200,
                                    'tx-hash': sendTransactions,
                                    'fee': Utils.round(fee_final, '8'),
                                    'sent-amount': transactionAmount
                                });
                            }).catch(errsendRaw => {
                                res.send({ responseCode: 400, responseMessage: "Send raw transaction not done", errsendRaw })
                            })
                        }).catch(errsignRaw => {
                            res.send({ responseCode: 400, responseMessage: "Sign raw transaction not done", errsignRaw })
                        })
                    }).catch(errRaw => {

                        res.send({ responseCode: 400, responseMessage: "Raw transaction not done", errRaw })
                    })
                }
            }
            else {
                res.json({ 'code': 500, "message": "No unspent transaction found for given address." });
            }
        });
    }

};

exports.performWithdraw = function (req, res) {
    if (!req.body.SendTo || !req.body.AmountToTransfer || !req.body.ChangeAddress || !req.body.SendFrom) {
        res.send({ code: 400, message: "Parameters missing" })
    }
    else {
        var changeaddress = req.body.ChangeAddress ? req.body.ChangeAddress : null;
        listUnspent().then(unspent => {
            console.log("listUnspent>>>>>>>>>>>>>>>>>>>>>", unspent)
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
                if (req.body.AmountToTransfer < transactionAmount) {
                    createRawTransaction(listTransactions, req.body.SendTo, req.body.AmountToTransfer, null).then(rawtxid => {
                        fundRawTransaction(rawtxid, changeaddress).then(frt => {
                            signRawTransaction(frt['hex']).then(signedTransaction => {
                                sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {
                                    res.json({
                                        'code': 200,
                                        'tx-hash': sendTransactions,
                                        'fee': frt['fee']
                                    });
                                }).catch(errSendRaw => {
                                    res.json({ code: 500, responseMessage: "Send raw transaction not done", errSendRaw })
                                })
                            }).catch(errSignRaw => {
                                res.json({ code: 500, responseMessage: "Sign raw transaction not done", errSignRaw })
                            })
                        }).catch(errfundRawTxn => {
                            res.json({ code: 500, responseMessage: "Fund_raw transaction not done", errfundRawTxn })
                        })
                    }).catch(errRawTxn => {
                        res.json({ code: 500, responseMessage: "Raw transaction not created", errRawTxn })
                    })
                }
                else {
                    res.json({ 'code': 500, responseMessage: "Insufficient Funds!" });
                }
            }
            else {
                res.json({ 'code': 500, responseMessage: "No unspent transaction found for given address." });
            }
        });
    }

};

exports.multipleWithdraw = function (req, res) {
    if (!req.body.SendFrom || !req.body.ChangeAddress || !req.body.destinations) {
        return res.json({ 'code': 400, 'message': "Parameters is Missing!!!!" })
    }

    var changeaddress = req.body.ChangeAddress ? req.body.ChangeAddress : null;
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
            var data = req.body.destinations;
            var obj = {};
            var arr = {};
            var totalamount = 0;
            for (var i in data) {
                totalamount = totalamount + data[i].amount;
                arr[data[i].address] = data[i].amount
            }
            if (totalamount < transactionAmount) {
                createRawTransaction1(listTransactions, arr, null).then(rawtxid => {
                    fundRawTransaction(rawtxid, changeaddress).then(frt => {
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

exports.receiveBalance = function (req, res) {
    var address = req.body.address
    client.sendToAddress(address, function (err, deposits) {
        if (err) {
            console.log("give me the err===>>", err)
        }
        else {
            console.log("show me result", JSON.parse(deposits))
        }
    })
}



