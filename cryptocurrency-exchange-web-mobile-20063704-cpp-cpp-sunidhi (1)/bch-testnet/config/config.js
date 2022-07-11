var jwt = require('jsonwebtoken')
var config = require('../config/config')
var resHandler = require('../api/controllers/bchController')
let BigNumber = require('bignumber.js');

module.exports = {
    secret:"unknownPassword",
    jwtDecode: (token, callback) => {
        jwt.verify(token, "unknownPassword", (err, decoded) => {
            if (err) {
                callback(null);
                console.log(err);
            } else {
                callback(decoded);
                console.log(decoded);
            }
        });
    },


    //Function for Big number
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

}