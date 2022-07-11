const jwt = require('jsonwebtoken');
const config=require('../config/config')
let BigNumber = require('bignumber.js');

let isJson=(val)=> {
    try {
        JSON.parse(val);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = {
    responseHandler: (res, code, message, data) => {
        res.status(code).send({responseCode: code, responseMessage: message, data: data});
    },

    jwtDecode: (token, callback) => {
        jwt.verify(token, 'coinintegration', (err, decoded) => {
            if (err) {
                callback(null);
                console.log(err);
            } else {
                callback(decoded);
                console.log(decoded);
            }
        });
    },

    requestFn: (auth_token, baseUrl, url, data, callback) => {
        console.log("======1", url);
        request.post({ url: baseUrl + url, form: data, headers: {auth_token:auth_token} }, function(err, httpResponse, body) {
            if (err) {
                console.log(null);
                return callback(null);
            }
            if (body && isJson(body)) {
                return callback(JSON.parse(body));
            }else{
                return callback(null)
            }
        });
    },

    getRequest: (auth_token, baseUrl, url, callback) => {
        // request(baseUrl + url,
        request.get({ url: baseUrl + url, headers: {auth_token:auth_token} }, function(error, response, bodyMktUpdate) {
            if (error)
                return callback(null);
            if (bodyMktUpdate && isJson(bodyMktUpdate)) {
                return callback(JSON.parse(bodyMktUpdate));
            }else{
                return callback(null)
            }
        });
    },
    
    getPreciseVal:(val,precision)=>{
        let temp=0;
        console.log("chelsea 1",val, typeof val, isNaN(val))
        val=Number(val);
        console.log("2",val, typeof val, isNaN(val))
        if(!isNaN(val)){
            // temp=(parseInt(val*Math.pow(10,precision)))/Math.pow(10,precision);
            temp= new BigNumber(val);
            temp=temp.dp(precision,1).toString();
            temp=Number(temp);
            console.log("3=>",temp)
            return temp;
        }
    },

    bigNumberOpera:(val1, val2, oprtr, precision)=>{
        let temp=0;
        val1=Number(val1);
        val2=Number(val2);
        if(!isNaN(val1)&&!isNaN(val2)){
            temp=new BigNumber(val1);
            if(oprtr==='+'){
                temp=temp.plus(val2).decimalPlaces(precision,1).toString() //this 1 signifies ROUND_DOWN 
                temp=Number(temp)
            }
            if(oprtr==='-'){
                temp=temp.minus(val2).decimalPlaces(precision,1).toString()
                temp=Number(temp)
            }
            if(oprtr==='*'){
                temp=temp.multipliedBy(val2).decimalPlaces(precision,1).toString()
                temp=Number(temp)
            }
            if(oprtr==='/'){
                temp=temp.dividedBy(val2).decimalPlaces(precision,1).toString()
                temp=Number(temp)
            }
            return temp;
        }
    }

};
