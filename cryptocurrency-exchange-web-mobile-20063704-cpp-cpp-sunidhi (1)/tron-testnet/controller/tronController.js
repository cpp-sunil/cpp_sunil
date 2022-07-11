//===============================================mainnet================================================================

// const request = require('request')
// const TronWeb = require('tronweb')
// var jwt = require('jsonwebtoken')
// const HttpProvider = TronWeb.providers.HttpProvider;  //This provider is optional, you can just use a url for the nodes instead
// const fullNode = new HttpProvider('http://api.trongrid.io'); //Full node http endpoint
// const solidityNode = new HttpProvider('https://api.trongrid.io'); // Solidity node http endpoint
// const eventServer = 'https://api.trongrid.io/' ; // Contract events http endpoint
// const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';

//==============================================testnet==================================================================

const request = require('request')
const TronWeb = require('tronweb')
var jwt = require('jsonwebtoken')
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider('https://api.shasta.trongrid.io'); //Full node http endpoint
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io'); // Solidity node http endpoint
const eventServer = new HttpProvider('https://api.shasta.trongrid.io'); //solidity node http endpoint
const privateKey = 'b695d2143f9817f0f8bfa1d003ed330cb9131c833bdea6ee59d0586e09668fc5';
const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);
const tronApi = {

    // get_auth_token :function(req, res)  {
    //     if (!req.query.uniqueId) {
    //     return res.json({ 'code': 400, 'message': "Parameters missing." })
    //     } else if (req.query.uniqueId == "TRX") {
    //     return res.json({ "code": 200, "messaTge": "Success.", "Data": jwt.sign({ id: req.query.uniqueId }, "coinintegration") })
    //     } else {
    //     res.json({ code: 400, result: "Please provide valide unique_id" })
    //     }
        
    //     },
    //......................................Generate_Address..........................................................
    
    generateAddress : (req, res)=> {
        console.log(req.body)
        var options = {
           // url: 'https://api.trongrid.io/wallet/generateaddress',  //- mainnet
           url: 'https://api.shasta.trongrid.io/wallet/generateaddress', //- testnet

           method: 'GET'

        };
        function callback(error, response, body) {
            if(error){
                res.send({ responseCode: 400, Result: error });
                console.log(error);
            }
            else {
               // var token = jwt.sign({ body: body.address }, "coinintegration");
                var Result = JSON.parse(body);
                console.log("Show me the body ====>", Result)
              //  console.log("show me the token ====>", token)
                res.send({ responseCode: 200, Result })
            }
        }
        request(options, callback);
    },



    //.............................................Get_Balance......................................................
get_balance: (req, res) => {

    var address = req.query.address

    tronWeb.trx.getBalance(address, (err, balance) => {
        if (err) {
            return res.send({ responseCode: 400, Result: err})
        }

        else {
            
            res.send({ responseCode: 200, Balance: balance })
        }
        console.log({balance});
    });
    
},



//.....................................................Blocks..........................................................

block: (req, res) => {

    var options = {

        //url: 'https://api.trongrid.io/wallet/getblockbynum',
        url: 'https://api.shasta.trongrid.io/wallet/getblockbynum',

        method: 'POST',
        body: `{"num" : ${req.body.num}}`
    };
    function callback(error, response, body) {
        if (!error && response.statusCode == 200){
            res.send({response_code:200 , response_message:JSON.parse(body)})
        }
        
    }
    request(options, callback);
},

//......................................................Transfer.......................................................

Transfer: (req, res)=> {
    var options = {
        //url:'https://api.trongrid.io/wallet/easytransferbyprivate',
        url:'https://api.shasta.trongrid.io/wallet/easytransferbyprivate',

        method: 'POST',

        body: `{"privateKey":"${req.body.privateKey}","toAddress":"${req.body.toAddress}","amount":${req.body.amount}}`

    };
    function callback(error, response, body){
        console.log(")))))))))))((((((((((===>>", body)
        if(!error && response.statusCode ==200){
            res.send({response_code:200, response_message:JSON.parse(body)})
        }
    }
    request(options, callback);
},


//-----------------------------------Get transaction by transaction id-------------------------------------------

gettransactionbyid: (req, res) => {

var options = {
  //url :'https://api.trongrid.io/wallet/gettransactionbyid',
  url :'https://api.shasta.trongrid.io/wallet/gettransactionbyid',


  method: 'POST',
  body: `{"value":"${req.body.value}"}`
};

function callback(error, response, body) {
    
    if(error){
        res.send({ responseCode: 400, ret: error })
    }
    else {
        var Result = JSON.parse(body);
        console.log("00000000000000000000");
        res.send({ responseCode: 200, Result})

    }
}
request(options, callback);
},


//-------------------------------------------Account History------------------------------------------



accounthistory: (req, res) => {


    console.log("9009090909090909090909090990")
    var options = {

        //url: 'https://api.trongrid.io/v1/contracts/'+ req.body.address +'/transactions',
        url: 'https://api.shasta.trongrid.io/v1/contracts/'+ req.body.address +'/transactions',
    };

function callback(error, response, body) {
     if (error) {
      Response.send({ responseCode: 400, ret: error})
}
      else {
    console.log(body);
    res.send({ responseCode: 200,Result:JSON.parse(body)})
     }
}
request(options, callback);

},



//-------------------------------------withdraw---------------------------------------------------------


withdraw: (req, res) => {
    console.log("()()()()()**********&&&")
    var address = req.body.address
    tronWeb.trx.getBalance(address, (err, balance) => {
        if(err) {
            return res.send({ code: 400, result: err })
        }
        else if (balance ==0) {
            console.log("**********()()()())()()()=======>>", balance)
            res.send({ code: 400, result: "Insufficient Balance"})
        }
        else {

            var options = {
              //url:'https://api.trongrid.io/wallet/easytransferbyprivate',
                url:'https://api.shasta.trongrid.io/wallet/easytransferbyprivate',
                method: 'POST',
                body: `{"privateKey":"${req.body.privateKey}", "toAddress":"${req.body.toAddress}", "amount":${balance}}`
            };
            function callback(error, response, body) {
                if(error) {
                    res.send({ code: 500, result: "Internal server error" })
                }
                else if (JSON.parse(body).result.code) {
                    console.log("!!!!!!!!******",JSON.parse(body).result.code)
                    res.send({ code: 400, result: JSON.parse(body) })
                }

                else {
                    var data = JSON.parse(body).transaction.txID
                    console.log("data=====>>>", data)
                    res.send({ code: 200, txid: data })
                }
            }
            request(options, callback);
        }
    });
},


//..................................................Token Details.....................................................

// assetissue: (req, res) => {
//     var options = {
//         url: 'https://api.trongrid.io/wallet/getassetissuebyid',
//         method: 'POST',
//         body: `{"value":"${req.body.value}"}`
//     };
//     function callback(error, response, body) {
//         if(error) {
//             res.send({ code: 500, result: "Internal server error" })
//         }
//         else if(!error && response.statusCode == 200) {
//             console.log(body);
//             res.send({response_code:200, response_message:JSON.parse(body)})
//         }

//     }
//     request(options, callback);
// },



// //...........................................Get Asset Issue by Account......................................................

// tokenbyAddress: (req, res) => {
//     var options = {
//         url: 'https://api.trongrid.io/wallet/getassetissuebyaccount',
//         method: 'POST',
//         body: `{"address":"${req.body.address}"}`
//     };
//     function callback(error, response, body) {
        
//         if(error) {
//             res.send({ code: 500, result: "Internal server error" })
//         }
//         else if (!error && response.statusCode == 200) {
//             res.send({response_code:200, response_message:JSON.parse(body)})
//             console.log(body);
//         }
//     }
//     request(options, callback);
// },


// //...............................................Token transfer.......................................................

// tokenTransfer: (req, res) => {
//     console.log("Token Transfer")
//     var options = {
//         url: 'http://api.trongrid.io/wallet/easytransferassetbyprivate',
//         method: 'POST',
//         body: `{"privateKey":"${req.body.privateKey}", "toAddress":"${req.body.toAddress}","assetId":"${req.body.assetId}", "amount":"${req.body.amount}"}`
//     };
//     console.log(options)
//     function callback(error, response, body){
//         if(error) {
//             res.send({ code: 500, result: "Internal server error"})
//         }
//         else if(!error && response.statusCode == 200) {
//             res.send({response_code:200, response_message: JSON.parse(body)})
//             console.log(body);
//         }
//     }
//     request(options, callback);
// },
                                                                                                                                                                                                                                                   


// //...................................................Token Balance................................................................

// tokenBalance: (req, res) => {

// var options = {
//     url: 'https://apilist.tronscan.org/api/account?address',
//     method: 'POST',
//     body: `{"address":"${req.body.address}"}`

// };
                                                                             
// function callback(error, response, body) {
//     if(error) {
//         res.send({ code: 500, result: "Internal server error"})
    
//     }
//     else if (!error && response.statusCode == 200) {
//     var arr =  JSON.parse(body).tokenBalances;
        
//           arr.forEach((element) => {
//            if(element.name == "1002000")
//            {
//             res.send({response_code:200, response_message: element})
//            }
       
//         })
       
//         console.log(body);
       
//     }
// }
                          
// request(options, callback);
         

// }

 }
 
module.exports = tronApi;