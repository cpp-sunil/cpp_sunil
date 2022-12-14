const express = require('express');
app = express();
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({extended:true,limit:"100mb"}));

const userRouter = require('./tokenRouter')
app.use('/user',userRouter);


PORT = 6000;
app.listen(PORT,(error,result) =>{
    if (error) {
        console.log("server listenign error")
    }
    else {
        console.log("server is started on listing on PORT",PORT)
    }
})