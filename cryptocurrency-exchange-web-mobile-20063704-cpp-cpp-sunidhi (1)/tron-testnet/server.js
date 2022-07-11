const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json({
    limit: "50mb"
}));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,token,_id");
    next();
});

// mongoose.connect('mongodb://localhost:27017/userdata', {useNewUrlParser: true}, function(err){
//     if (err) throw err;

//     console.log('Successfully connected to database');
// })

app.use(bodyParser.urlencoded({
    extended:false
}))

app.use('/tron', require('./Routes/tronRoutes'));
//app.use('/admin', require('./Routes/adminRoutes'));

app.listen(()=>{
    console.log('Server is listen on 1517')
})