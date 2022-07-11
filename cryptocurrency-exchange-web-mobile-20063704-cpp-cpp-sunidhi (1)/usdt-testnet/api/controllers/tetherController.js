'use strict';

const Client = require('bitcoin-core');
const client1 = new Client(
    {
        "username": "user",
        "password": "pass",
        "network": "testnet",
        "otherip": "172.16.21.76",
        "port": 18332

    }
    // Config.get('Tether.testnet')
)

const Omni = require('../../lib/OmniClient.js').Omni
const client = new Omni.init();
//====================================================================get_auth_token=======================================================================

//17fNTbisvEP8j86ieuR5Q3zzu45s86T7q4
//================================================================generate_address=============================================================================
exports.generateAddress = function (req, res) {
    console.log("...........", req.params.account)
    var account = req.params.account;

    Omni.getnewaddress(account, function (result) {
        console.log("///////////////////", result)
        if (!result) {
            return console.error("Error in finding result");
        }
        return res.send({ 'code': 200, "address": result })
    });
};
//===============================================================get_balance===================================================================================
exports.getBalanceAddress = async function (req, res) {

    var addr = req.params.address;


    await Omni.getomnibalance(addr, 31, (result) => {
        if (result) {
            res.send({ code: 200, balance: result.balance })
        }
        else {
            res.send({ code: 400, message: "Error in finding address", err })
        }

    })

};
//18SKXDCqnmWcmWd6t7rrDZtfQZTEGe7K3r
//====================================================================deposit_history==========================================================================

exports.history = function (req, res) {

    var address = req.params.address+""

    Omni.listtransactions(address, function (result) {
        if (!result) {
            console.log("Error is")
        }
        else {
            res.send({ code: 200, deposits: result })
        }
    })
}
//=================================================================transfer_funds======================================================================
exports.transferFunds = function (req, res) {
    var obj = {
        SendFrom: req.body.SendFrom,
        SendTo: req.body.SendTo,
    }
    if (!obj.SendFrom || !obj.SendTo) {
        res.send({
            code: 500,
            message: "Parameter missing..!"
        })
    } else {
        console.log("omni obj.....", obj)
        Omni.getomnibalance(obj.SendFrom, 31, (data) => {
            console.log("generateAddress...............", data)
            if (!data) {
                res.send({
                    code: 500,
                    message: "Internal Server Error!"
                })
            } else if (data.balance == "0.00000000") {
                res.send({
                    code: 404,
                    message: "Insufficient balance"
                })
            } else {
                Omni.omnifundedsend(obj.SendFrom, obj.SendTo, 31, data.balance, "1GafQ42Hw7Lzn6nJoYzpxHXYvmZLXrkAeY", (data1) => {
                    console.log("omni send.....", data1)
                    if (!data1) {
                        res.send({
                            code: 500,
                            message: "Internal Server Error!"
                        })
                    } else {
                        res.send({
                            "code": 200,
                            "txid": data1
                        })
                    }
                })
            }
        })
    }
}

//==============================================================================withdraw_funds===================================================================
exports.withdrawFunds = function (req, res) {
    var obj = {
        SendFrom: req.body.SendFrom,
        SendTo: req.body.SendTo,
        balance: req.body.AmountToTransfer
    }
    if (!obj.SendFrom || !obj.SendTo || !obj.balance) {
        res.send({
            code: 500,
            message: "Parameter missing..!"
        })
    } else if(obj.balance >= 10){
        var fee = 2;
        var newAmount = obj.balance - fee ;
        console.log("newAmount....", newAmount) 
         Omni.getomnibalance(obj.SendFrom, 31, (data) => {
             console.log("getomnibalance...............", data)
             var balance1 = obj.balance.toString();
             if (!data) {
                 res.send({
                     code: 500,
                     message: "Internal Server Error!"
                 })
                 
             } else if (data.balance < balance1) {
                 res.send({
                     code: 404,
                     message: "Insufficient balance"
                 })
             } else { 
                     var balance1= newAmount.toString();
                 console.log("omnifundedsend data....", obj.SendFrom, obj.SendTo, 31, balance1)
                 Omni.omnifundedsend(obj.SendFrom, obj.SendTo, 31,  balance1, "1GafQ42Hw7Lzn6nJoYzpxHXYvmZLXrkAeY", (data1) => {
                     console.log("omni send.....user", data1)
                     if (!data1) {
                         res.send({
                             code: 500,
                             message: "Internal Server Error!"
                         })
                     } else {
                        res.send({"code": 200, "txid": data1 })                        
 
                     }
                 })
             }
         })
    } else {
        res.send({
            code: 500,
            message: "Please fill the minimum 10 usdt!"
        }) 
    }
}
//=================================================================================================================================================================



 ///////////////////////////////




    // ETH - 172.16.21.74:4001,
    // BTC - 172.16.21.1:4000,
    // BCH - 172.16.21.67:4003,
    // LTC -172.16.21.27:4006,
    // eos - 172.16.21.27:4007
