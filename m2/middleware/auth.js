const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken");
module.exports = {
    verifyToken: (req, res, next) => {
        try {
            jwt.verify(req.headers.token, 'secret', (err, result) => {
                if (err) {
                    res.send({ responseCode: 500, responseMessage: " Internal server error!", responseResult: err });
                }
                else {
                    userModel.findOne({ _id: result._id }, (userErr, userData) => {
                        if (userData) {
                            if (userData.status == "Block") {
                                res.send({ responseCode: 402, responseMessage: " Your Accoun Has Been Blocked By Admin", responseResult: userData })
                            }
                            else {
                                if (userData == "Delete") {
                                    res.send({ responseCode: 402, responseMessage: "Your Account Has Been DELETED", responseResult: [] })
                                }
                                else {
                                    req.userId = userData._id;
                                    next();
                                }
                            }
                        }
                        else {
                            res.send({ responseCode: 404, responseMessage: "UserData not Found", responseResult: userData })
                        }
                    })
                }
            })

        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Internal Server Error", responseResult: error })
        }
    }
}