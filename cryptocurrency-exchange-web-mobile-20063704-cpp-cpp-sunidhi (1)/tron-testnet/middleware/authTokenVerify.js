var jwt = require('jsonwebtoken');
const auth = {
    verifyToken: (req, res, next) => {
        console.log("token verified")
        if (req.headers.token) {
            jwt.verify(req.headers.token, 'coinintegration', (err, result) => {
                if (err) {
                    res.send({ response_code: 500, response_message: "Internal server error", err })
                }
                else if (!result) {
                   res.send({response_code:404, response_message:"Token is wrong"})
                }
                else {
                    console.log("token verified")
                    next();
                }
            })
        } else {
            res.send({ response_code: 400, response_message: "Please provide token" })
        }
    }
}
module.exports = auth