const express=require('express');
const app=require('express')();
const server = require('http').createServer(app);
const mongoose=require('mongoose');
const path=require('path')
const bodyParser=require('body-parser');
const morgan=require('morgan');
const ripple=require('./routes/wallet-routes');
const config=require('./config/config')

app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true,limit:"2mb"}))

app.use((req,res,next)=>{
	res.header('Access-Control-Allow-Origin','*')
	res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept, auth_token,type,deviceToken')
	next();
})

app.use('/xrp', ripple)
server.listen(config.get('port'),(err,result)=>{
	console.log("Server listening to XRP ",config.get('port'))
})
