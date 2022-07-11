const commonFile = require('../global-files/common-file.js')
const config = require('../config/config')
const async = require('async');
const StellarSdk = require('stellar-sdk');
var request = require('request');
var jwt = require('jsonwebtoken');

let serverKey = process.env.serverKey

let provider = "https://horizon-testnet.stellar.org"; // testnet 

//let provider = "https://horizon.stellar.org"; // mainnet

const server = new StellarSdk.Server(provider);

let myAddr = StellarSdk.Keypair.random();
// console.log(myAddr.publicKey(), myAddr.secret());
let pubKey = "GCLYA5C45M5BDYVFP26X52VB5KGPX3JGTAIPSEE45SRZW477JSBNJJZC" // testnet
//let pubKey = "GAW7QNIHBWKQ6QWL2CH2K53U6N37UBSEHA3M562K7TZNCIBRYUWUSN4S"

StellarSdk.Network.usePublicNetwork();
var pair = StellarSdk.Keypair.random();
//var request = require('request');

module.exports = {


    "get_auth_token": (req, res) => {
        if (!req.query.uniqueId) {
            return res.json({ 'code': 400, 'message': "Parameters missing." })
        } else if (req.query.uniqueId == "gmoThailand") {
            return res.json({ "code": 200, "message": "Success.", "Data": jwt.sign({ id: req.query.uniqueId }, "coinintegration") })
        } else {
            res.json({ responseCode: 400, responseMessage: "Please provide valide unique_id" })
        }

    },

    "wallet": (req, res) => {
        var pair = StellarSdk.Keypair.random();
        let wallet = [];
        console.log("wallet created successfully!!!!", pair)
        pair.secret();
        pair.publicKey();
        wallet.push({
            publicKey: pair.publicKey(),
            secretKey: pair.secret()
        })
        res.json({ code: 200, data: wallet })
    },



    "faucet": (req, res) => {
    //    var pair = StellarSdk.Keypair.random();

        request.get({
            url: 'https://friendbot.stellar.org',
            qs: { addr: req.params.address },
            json: true
        }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                res.send({ responseCode: 500, responseMessage: body })
                console.error('ERROR!', error || body);
            }
            else {
                console.log('SUCCESS! You have a new account :)\n', body);
                res.send({ responseCode: 200, responseMessage: body })
            }
        });

    },

    // {
    //     "publicKey": "GCMHJRLHCDKGR33Y4IN3YKMNH5NX7ZS75H3PYPT3OOCKNZENQJZSJIV2",
    //     "secretKey": "SBDVAEJYCOEUA63O77UUBB56G74WUEZT2M2K566VBIFCMIDXAKWY64S3"
    // }

    // To get the balance of the address-

    "balance": (req, res) => {
        console.log("i am )))))))")
        server.accounts()
            .accountId(req.params.address)
            .call()
            .then(function (accountResult) {
                console.log("show me the accountResult===>>", accountResult)
                res.send({ code: 200, balance: accountResult.balances[0].balance })
            })
            .catch(err => {
                console.log("show me the balance =====>>", err)
                res.send({ code: 200, balance:0  })
            })

    },
    // {
    //     "code": 200,
    //     "balance": "10000.0000000"
    // }

    // {
    //     "address":"GCA7IV2NGK4ZMBAXO5X3TM2MONGH2LJVDMH6KFECIEICWQEFNQO7765Z",
    //     "tag":"1234"
    // }




    "get_transaction": (req, res) => {
        server.transactions()
            .transaction(req.params.txid)
            .call()
            .then(function (transactionResult) {
                console.log("show me the memo ===>>", transactionResult)
                var array = []
                array.push({
                    hash: transactionResult.id,
                    created_at: transactionResult.created_at,
                    source_account: transactionResult.source_account,
                    memo: transactionResult.memo,
                    fee: transactionResult.fee_paid,
                    source_account_sequence: transactionResult.source_account_sequence
                })
                res.send({ code: 200, data: array })
            })
            .catch(function (err) {
                res.send({ code: 500, message: "Internal server error" })
            })

    },

    "deposits": (req, res) => {
        console.log("____________________))))))))")
        var data = [];
         var dataA = [];
        var dataB = []
        var options = {
            url: `https://horizon-testnet.stellar.org/accounts/${req.body.address}/payments?limit=8&order=desc`
          //  url: `https://horizon.stellar.org/accounts/${req.body.address}/payments?limit=8&order=desc`
        };

        function callback(error, response, body) {
    
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body)._embedded
console.log("144444444______===>",body)
                async.forEach(obj.records, (result) => {

     console.log("143====address",result)
                    if (result.to == req.body.address) {
                        data.push({
                            transaction_hash: result.transaction_hash,
                            amount: result.amount,
                            from: result.from,
                            to: result.to,
                            id: result.id

                        })
                    }
                    
                })
                console.log("data isssssss======>>",data)
                server.transactions()
                    .forAccount(req.body.address)
                    .call()
                    .then(function (result) {
                        async.forEach(result.records, (miniTransaction) => {
                            // console.log("miniTransaction==>>", miniTransaction)
                            //    console.log("minitransaction=====>>",miniTransaction.self)
                            //  if (miniTransaction.source_account === req.body.address && miniTransaction.memo === req.body.tag) {
                            if (miniTransaction.memo == req.body.tag) {
                                dataA.push({
                                    memo: miniTransaction.memo,
                                    transaction_hash: miniTransaction.id,

                                })

                            }
                        })
                     //   console.log("data isssss====>>",data)
                      //  console.log("data isssss====>>",dataA)
                        async.forEach(data, (element) => {
                            //  console.log("SSSSSS))))))))))))====>>",element)
                            async.forEach(dataA, (elem) => {
                                //  console.log("aaaaaaaaaaadataA===>",elem)
                                if (element.transaction_hash === elem.transaction_hash) {
                                    dataB.push({
                                        memo: elem.memo,
                                        amount: element.amount,
                                        from: element.from,
                                        to: element.to,
                                        id: element.id,
                                        transaction_hash: element.transaction_hash
                                    })
                                    console.log("!!!!!!!!!!!!!!!!!^^^^#####===>>", dataB)
                                    // res.send({code:200 ,message:dataB})
                                }

                            })
                        })

                        res.send({ code: 200, data: dataB })

                        //  res.send({ code: 200, data:data })
                    }).catch(err => {
                        console.log("show me err======>>", err)
                          res.send({ responseCode: 400, responseMessage: "Bad Request" })
                    })


            }
        }
        request(options, callback);

  
    ////////////////


//     var options = {
//         url: `https://horizon-testnet.stellar.org/accounts/${req.body.address}/payments?limit=25&order=desc`
//     };
    
//     function callback(error, response, body) {
//         if (!error && response.statusCode == 200) {
//             console.log(body);
//             var obj = JSON.parse(body)._embedded
//             async.forEach(obj.records, (result) => {
//  console.log("141====address",result)
//                 if (result.to == req.body.address) {
//                     data.push({
//                         transaction_hash: result.transaction_hash,
//                         amount: result.amount,
//                         from: result.from,
//                         to: result.to,
//                         id: result.id

//                     })
//                 }
//                 console.log("shhhhhhh=====",result)

//             })
//         }
//     }
    
//     request(options, callback);


},

    send_stellar: (req, res) => {

        console.log("Request is=================>", req.body)
        var sourceSecretKey = req.body.secret_address;
        var sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
        var sourcePublicKey = req.body.from_address //sourceKeypair.publicKey();
        var receiverPublicKey = req.body.to_address;
        var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
        StellarSdk.Network.useTestNetwork();
        server.loadAccount(sourcePublicKey).then(function (account) {
            console.log("account is ===>>", account)
            var transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(StellarSdk.Operation.payment({
                    destination: receiverPublicKey,
                    asset: StellarSdk.Asset.native(),
                    amount: req.body.amount,
                }))
                .addMemo(StellarSdk.Memo.id(req.body.to_memo))
                .build();
            transaction.sign(sourceKeypair);
            console.log("))))))))))))))((((((((((((*****", transaction.toEnvelope().toXDR('base64'));
            server.submitTransaction(transaction)
                .then(function (transactionResult) {
                    console.log("transaction resulttttttt----", JSON.stringify(transactionResult, null, 2));
                    console.log("Transaction successfully=============>", transactionResult);
                    res.send({ code: 200, message: "Transaction Successfully", Hash: transactionResult.hash });
                })
                .catch(function (err) {
                    console.log("Error is============>", err);
                    return res.send({ code: 500, message: "Internal server error" });
                });
        })
            .catch(function (error) {
                console.log("show me error===>>", error)
                return res.send({ code: 500, message: "Ledger can't accept the Transaction" })
            });
    }

}


// GDYPOKP6TLNZNHZGTXGGZWQYYV3PBT5LJJBKIDMLTQ6G6XFYY6GT7ZNV


// SBWT5YFTVH2MXCJCRMN5FR7EPFHQYYZ46NGXSRPO2KKGDW4SD5QY7TLN



// "send_stellar": (req, res) => {

//     var sourceKeys = StellarSdk.Keypair
//         .fromSecret(req.body.secret_address);
//     var destinationId = req.body.to_address;

//     var transaction;


//     server.loadAccount(destinationId)

//         .catch(StellarSdk.NotFoundError, function (error) {
//             throw new Error('The destination account does not exist!');
//         })

//         .then(function () {
//             return server.loadAccount(sourceKeys.publicKey());
//         })
//         .then(function (sourceAccount) {

//             console.log("source address----->",sourceAccount)
//             transaction = new StellarSdk.TransactionBuilder("GDYPOKP6TLNZNHZGTXGGZWQYYV3PBT5LJJBKIDMLTQ6G6XFYY6GT7ZNV")
//                 .addOperation(StellarSdk.Operation.payment({
//                     destination: destinationId,
//                     asset: StellarSdk.Asset.native(),
//                     amount: req.body.amount
//                 }))


//                 .addMemo(StellarSdk.Memo.id(req.body.to_memo))
//                 .build();

//             transaction.sign(sourceKeys);

//             return server.submitTransaction(transaction);
//         })
//         .then(function (result) {
//             //console.log('Success! Results:', result);
//             return commonFile.responseHandler_1(res, 200, "Success", result.hash)
//         })
//         .catch(function (error) {
//             console.error('Something went wrong!', error);



//         });

// }





// "responseMessage": {
//     "_links": {
//         "transaction": {
//             "href": "https://horizon-testnet.stellar.org/transactions/24fa0ca6fe55caf1ae058d0a983b274aba8e75f1eaf0e397574dfa07fef56432"
//         }
//     },
//     "hash": "24fa0ca6fe55caf1ae058d0a983b274aba8e75f1eaf0e397574dfa07fef56432",
//     "ledger": 1217267,
//     "envelope_xdr": "AAAAAO5bdS1wFEE8wVoxBEiBbIQJFogkVyTds3/htCNdV+NbAAAAZAAPAn8AAADvAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAAAEH3Rayw4M0iCLoEe96rPFNGYim8AVHJU0z4ebYZW4JwAAAAAAAAAALn8XqgNZ+U4SrP1byhNZBhv+n0IN8fyD7B0YNE5swvXAAAAF0h26AAAAAAAAAAAAl1X41sAAABAZBgOEEjM/2DXBswSjy9em751hEKQ+naN9UlFoIptOQDWMj7hY7az9nJCuFvU+K15/OiXbQpVJH1MHK3hXYBdCIZW4JwAAABA9qqE+g/ZXhlISkIEPQuYy1D2tuGPpfaxcxdbolz6UuqvPIyjHzasMfyAvaTMt5CYAdqZlQX73x37Jp/hhYSYDg==",
//     "result_xdr": "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAA=",
//     "result_meta_xdr": "AAAAAQAAAAIAAAADABKS8wAAAAAAAAAA7lt1LXAUQTzBWjEESIFshAkWiCRXJN2zf+G0I11X41sAAAAAPDMDJAAPAn8AAADuAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABABKS8wAAAAAAAAAA7lt1LXAUQTzBWjEESIFshAkWiCRXJN2zf+G0I11X41sAAAAAPDMDJAAPAn8AAADvAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAMAEpLzAAAAAAAAAAAQfdFrLDgzSIIugR73qs8U0ZiKbwBUclTTPh5thlbgnAAknoi30QQsAAAAmgAFUPUAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAEpLzAAAAAAAAAAAQfdFrLDgzSIIugR73qs8U0ZiKbwBUclTTPh5thlbgnAAknnFvWhwsAAAAmgAFUPUAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAEpLzAAAAAAAAAAC5/F6oDWflOEqz9W8oTWQYb/p9CDfH8g+wdGDRObML1wAAABdIdugAABKS8wAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA=="
// }
// }


  //https://horizon-testnet.stellar.org/transactions/24fa0ca6fe55caf1ae058d0a983b274aba8e75f1eaf0e397574dfa07fef56432





