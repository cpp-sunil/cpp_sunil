const express = require('express');
app = express();
require('./database/dbTest')
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({extended:true,limit:"100mb"}));

const userRouter = require('./routes/userRouter')
app.use('/user',userRouter);
app.use('/admin',userRouter);

 const staticRouter = require('./routes/staticRouter')
 app.use('/static',staticRouter);

PORT = 4000;
app.listen(PORT,(error,result) =>{
    if (error) {
        console.log("server listenign error")
    }
    else {
        console.log("server is started on listing on PORT",PORT)
    }
})