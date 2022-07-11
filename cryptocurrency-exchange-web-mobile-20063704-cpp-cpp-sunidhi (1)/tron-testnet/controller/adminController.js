const schema = require('../models/userModel');
const bcrypt = require('bcrypt-nodejs');
const Response = require('../helper/responseHandler')
const responseMsg = require('../helper/responseMessage')
const responseCode = require('../helper/responseCode')
var nodemailer = require('nodemailer');
const commonFunction = require('../commanFunction/func');
const async = require('async');
var jwt = require('jsonwebtoken');


module.exports = {
    //.................................................forgot Password.........................................................

    adminForgotPassword: (req, res) => {
        try {

            if (!req.body.email) {
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA)

            } else {

                schema.findOne({
                    email: req.body.email
                }, (err, result) => {
                   
                    if (err) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.INCORRECT_EMAIL)

                    } else if (!result) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_FOUND)

                    } else {
                        const filter = {
                            email: result.email
                        };
                        const update = {
                            verifyEmail: false
                        };
                        schema.findOneAndUpdate(filter, update, {
                            new: true
                        }).then(data => {
                            if (!data) {
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)

                            }

                        })
                        otp1 = commonFunction.getOTP();
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'no-arjunsingh@mobiloitte.com',
                                pass: 'Mobiloitte1'
                            }
                        });
                        port: 587,
                            'smtp@gmail.com'
                        var mailOptions = {
                            from: 'no-arjunsigh@mobiloitte.com',
                            to: req.body.email,
                            subject: 'OTP',
                            text: 'OTP to reset password is: ' + otp1
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent' + info.response);
                            }
                        });

                        schema.updateOne({
                            email: req.body.email
                        }, {
                            $set: {
                                OTP_email: otp1

                            }
                        }, (err, result2) => {
                            
                            if (err) {
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                            } else if (result2.n >= 0) {
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.OTP_SENT)

                            } else {
                               
                                 return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                            }
                        })
                    }
                })
            }
        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        }
    },
    //.............................................resend_OTP_Email_API............................................................

    adminResendOtp: (req, res) => {
        try {

            if (!req.body.email && !req.body.Mob_Number) {
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA)

            } else {
                if (req.body.email && !req.body.Mob_Number) {
                    schema.findOne({
                        email: req.body.email
                    }, (err, result) => {
                       
                        if (err) {
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_EXISTS)

                        } else if (result) {
                            const filter = {
                                email: result.email
                            };
                            const update = {
                                verifyEmail: false
                            };
                            schema.findOneAndUpdate(filter, update, {
                                new: true
                            }).then(data => {
                                if (!data) {
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)

                                }

                            })
                            otp1 = commonFunction.getOTP();
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'no-arjunsingh@mobiloitte.com',
                                    pass: 'Mobiloitte1'
                                }
                            });
                            port: 587,
                                'smtp@gmail.com'
                            var mailOptions = {
                                from: 'no-arjunsingh@mobiloitte.com',
                                to: req.body.email,
                                subject: 'Resend OTP for verification',
                                text: 'Your OTP for verification is: ' + otp1
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log("error")
                                } else {
                                    console.log("OTP sent to your email ID" + info.response);
                                }
                            });
                            schema.updateOne({
                                email: result.email
                            }, {
                                $set: {
                                    OTP_email: otp1
                                }
                            }, (err, result1) => {
                                if (err) {
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                                } else if (result1.n >= 0) {
                                    
                                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.OTP_RESENT);


                                } else {
                                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.OTP_NOT_SENT);


                                }

                            })

                        } else {
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_EXISTS);

                        }
                    })
                } else if (!req.body.email && req.body.Mob_Number) {
                    schema.findOne({
                        Mob_Number: req.body.Mob_Number
                    }, (err, result) => {
                        if (err) {
                            return res.send({
                                responseCode: 500,
                                responseMessage: err
                            })
                        } else if (!result) {
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND);

                        } else {
                            commonFunction.otp(req.body.Mob_Number, (err, data) => {
                                if (err) {
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);


                                } else if (!data) {
                                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND);

                                } else {
                                    const filter = {
                                        Mob_Number: req.body.Mob_Number
                                    };
                                    const update = {
                                        $set: {
                                            Mob_Number: req.body.Mob_Number,
                                            OTP_Mob: data,
                                            verifyMob: false
                                        }
                                    };

                                    schema.findOneAndUpdate(filter, update, {
                                        new: true
                                    }).then(data => {
                                        if (!data) {
                                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND);

                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.OTP_SENT);

                                        }
                                    }).catch(err => {
                                        console.log("catch error===", err)
                                    })
                                }
                            })
                        }
                    })
                } else {
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INVALID_REQUEST, err);

                }
            }

        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);


        }
    },

    //...................................................VerificationAPI.........................................................
    adminVerifyUser: (req, res) => {
        try {
            if (req.body.email && !req.body.Mob_Number) {
                if (!req.body.OTP || !req.body.email) {
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA)
                } else {
                    schema.findOne({
                        email: req.body.email
                    }, (err, data1) => {
                        if (err) {
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_EXISTS)
                        } else if (data1) {
                            if (req.body.OTP == data1.OTP_email) {
                                if (data1.verifyEmail == false) {
                                    schema.updateOne({
                                        verifyEmail: data1.verifyEmail
                                    }, {
                                        $set: {
                                            verifyEmail: true,
                                        }
                                    }, (err, result2) => {
                                        if (err) {
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                                        } else {
                                            if (result2.n >= 0) {
                                                return res.send({
                                                    responseCode: 200,
                                                    responseMessage: "OTP successfully verified",
                                                    data: result2
                                                })
                                            } else {
                                                return res.send({
                                                    responseCode: 200,
                                                    responseMessage: "OTP not verified",
                                                    data: result2
                                                })
                                            }

                                        }
                                    })
                                } else {
                                    return res.send({
                                        responseMessage: "OTP already verified"
                                    })
                                }
                            } else {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Incorrect OTP"
                                })
                            }
                        } else {
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_EXISTS)
                        }
                    })
                }


            } else if (!req.body.email && req.body.Mob_Number) {

                if (!req.body.OTP || !req.body.Mob_Number) {
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA)

                } else {
                    schema.findOne({
                        Mob_Number: req.body.Mob_Number
                    }, (err, data1) => {
                        if (err) {
                            return res.send({
                                responseCode: 404,
                                responseMessage: 'Your Mobile Number not found'
                            })
                        } else if (data1) {
                            if (req.body.OTP == data1.OTP_Mob) {
                                if (data1.verifyMob == false) {
                                    schema.updateOne({
                                        verifyMob: data1.verifyMob
                                    }, {
                                        $set: {
                                            verifyMob: true

                                        }
                                    }, (err, result2) => {
                                      
                                        if (err) {
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                                        } else {
                                            if (result2.n >= 0) {
                                                return res.send({
                                                    responseCode: 200,
                                                    responseMessage: "OTP successfully verified",
                                                    data: result2
                                                })
                                            } else {
                                                return res.send({
                                                    responseCode: 200,
                                                    responseMessage: "OTP not verified",
                                                    data: result2
                                                })
                                            }

                                        }
                                    })
                                } else {
                                    return res.send({
                                        responseMessage: "OTP already verified"
                                    })
                                }
                            } else {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Incorrect OTP"
                                })
                            }
                        } else {
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                        }
                    })
                }

            } else {
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INVALID_REQUEST, err);

            }



        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

        }
    },

    //.....................................................Reset_Password............................................................
    adminResetPassword: (req, res) => {
        console.log("Inside reset password");
        try {

            if (!req.body.createPassword || !req.body.confirmPassword) {
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA)

            } else if (req.body.createPassword != req.body.confirmPassword) {
                return res.send({
                    responseConde: 404,
                    responseMessage: "Password does not matched"
                })
            } else {
                schema.findOne({
                    email: req.body.email
                }, (err, result) => {
                    if (err) {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                    } else if (!result) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_EXISTS)
                    } else if (result) {

                        let salt = bcrypt.genSaltSync(10);
                        req.body.confirmPassword = bcrypt.hashSync(req.body.confirmPassword, salt)
                        const filter = {
                            email: result.email
                        };
                        const update = {
                            password: req.body.confirmPassword
                        };

                        schema.findOneAndUpdate(filter, update, {
                            new: true
                        }).then(data => {
                            if (!data) {
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                            }


                            return res.send({
                                responseCode: 200,
                                responseMessage: "Password Successfully Changed",
                                data
                            })
                        })

                    }
                }).catch(error => {
                    console.log(error)
                });
            }

        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

        }

    },
    //.......................................................uploadImage......................................................

    uploadImage: (req, res) => {
        try {
            if (!req.body.username || !req.body.base64) {
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA)

            } else {
                schema.findOne({
                    username: req.body.username
                }, (err, result) => {
                    if (err) {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                    } else if (!result) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USERNAME_NOT_FOUND)
                    } else {

                        commonFunction.uploadImage(req.body.base64, (err, result1) => {

                            if (err) {
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                            } else if (!result1) {
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                            } else if (result1) {

                                const filter = {
                                    username: result.username
                                };
                                const update = {
                                    image: result1
                                };

                                schema.findOneAndUpdate(filter, update, {
                                    new: true
                                }).then(data => {
                                    if (!data) {
                                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                    }


                                    var responseData = {
                                        userData: data


                                    }

                                    return res.send({
                                        responseCode: 200,
                                        responseMessage: "Image Successfully Uploaded",
                                        data: data.image
                                    })
                                })

                            }

                        })

                    }

                })

            }
        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

        }

    },

    //.................................................getInfo...........................................................

    viewAdminProfile: (req, res) => {
        try {
           

                schema.findOne({
                    userType: "ADMIN"
                }, (err, data) => {
                    if (err) {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);


                    } else if (!data) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                    } else {

                       
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Record Found",
                            data: data
                           
                        })
                    
                } 

            })
        
         }catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

        }
    },

    //........................................changePassword.............................................................

    adminChangePassword: (req, res) => {
        try {
            if (!req.body.userType || !req.body.oldPassword || !req.body.newPassword || !req.body.confirmPassword) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Please Fill the required fields"
                })
            } else if (req.body.newPassword != req.body.confirmPassword) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Password does not match!"
                })

            } else {

                schema.findOne({
                    userType: req.body.userType
                }, (err, result) => {
                    console.log(result)
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: err
                        })
                    } else if (!result) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                    } else {
                        var check = bcrypt.compareSync(req.body.oldPassword, result.password);
                        if (check) {

                            let salt = bcrypt.genSaltSync(10);
                            req.body.confirmPassword = bcrypt.hashSync(req.body.confirmPassword, salt)
                            const filter = {
                                userType: req.body.userType
                            };
                            const update = {
                                password: req.body.confirmPassword
                            };

                            schema.findOneAndUpdate(filter, update, {
                                new: true
                            }).then(data => {
                                if (!data) {
                                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                } else {
                                    
                                    return res.send({
                                        responseCode: 200,
                                        responseMessage: "Record Updated Successfully",data
                                    })

                                }
                            })
                        } else {
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Incorrect Old Password"
                            })
                        }
                    }
                })
            }
        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);


        }
    },

    //..................................................newEditProfile......................................................

    adminEditProfile: (req, res) => {
        try {
            if (!req.body.username) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Please provide the user name"
                })
            } else {
                schema.findOne({
                    username: req.body.username
                }, (err, result) => {
                    if (err) {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                    } else if (!result) {
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)

                    } else {
                        if (req.body.Mob_Number == result.Mob_Number) {
                            return res.send({
                                responseCode: 200,
                                responseMessage: "Mobile Number Already Exist!"
                            })
                        } else if (req.body.base64 == "" && req.body.Mob_Number == "") {
                            return res.send({
                                responseCode: 200,
                                responseMessage: "Nothing to update!"
                            })
                        } else if (req.body.base64 == "" && req.body.Mob_Number != "") {
                            commonFunction.otp(req.body.Mob_Number, function (error, result) {
                                if (error) {
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                                } else if (!result) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "No result"
                                    })
                                } else {
                                    const filter = {
                                        username: req.body.username
                                    };
                                    const update = {
                                        $set: {
                                            Mob_Number: req.body.Mob_Number,
                                            OTP_Mob: result,
                                            verifyMob: false
                                        }
                                    };

                                    schema.findOneAndUpdate(filter, update, {
                                        new: true
                                    }).then(data => {
                                        if (!data) {
                                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                            return res.send({
                                                responseCode: 200,
                                                responseMessage: "Record Updated Successfully",
                                                responseData
                                            })

                                        }
                                    })

                                }
                            })

                        } else if (req.body.base64 != "" && req.body.Mob_Number == "") {

                            commonFunction.uploadImage(req.body.base64, (err, result1) => {

                                if (err) {
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                                } else if (!result1) {
                                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                } else {
                                    const filter = {
                                        username: result.username
                                    };
                                    const update = {
                                        image: result1
                                    };

                                    schema.findOneAndUpdate(filter, update, {
                                        new: true
                                    }).then(data => {
                                        if (!data) {
                                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                            return res.send({
                                                responseCode: 200,
                                                responseMessage: "Record Updated Successfully",
                                                responseData
                                            })

                                        }
                                    })
                                }
                            })
                        } else {
                            commonFunction.otp(req.body.Mob_Number, (err, result) => {
                                if (err) {
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                                } else if (!result) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "No result"
                                    })
                                } else {
                                    const filter = {
                                        username: req.body.username
                                    };
                                    const update = {
                                        $set: {
                                            OTP_Mob: result,
                                            verifyMob: false
                                        }
                                    };

                                    schema.findOneAndUpdate(filter, update, {
                                        new: true
                                    }).then(data => {
                                        if (!data) {
                                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                           

                                        }
                                    })

                                }
                            })


                            commonFunction.uploadImage(req.body.base64, (err, result1) => {

                                if (err) {
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

                                } else if (!result1) {
                                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                } else {
                                    const filter = {
                                        username: result.username
                                    };
                                    const update = {
                                        $set: {
                                            image: result1,
                                            Mob_Number: req.body.Mob_Number
                                        }
                                    };

                                    schema.findOneAndUpdate(filter, update, {
                                        new: true
                                    }).then(data => {
                                        if (!data) {
                                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.DATA_NOT_FOUND)
                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                            return res.send({
                                                responseCode: 200,
                                                responseMessage: "Record Updated Successfully",
                                                responseData
                                            })

                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }

        } catch (error) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

        }
    },

    //..................................................adminLogin........................................................

    adminLogin: (req, res) => {
        try {
            if (!req.body.email || !req.body.password) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Please fill the required fields"
                })
            } else {
                schema.findOne({
                    userType: "ADMIN"
                }, (err, result) => {
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: err
                        })
                    } else if (!result) {
                         return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USERNAME_NOT_FOUND )
                    } else if(result.email == req.body.email) {
                        var check = bcrypt.compareSync(req.body.password, result.password);
                        if (check) {
                            var get_auth_token = jwt.sign({
                                userType: "ADMIN"
                            }, "tronblockchain")
                            return res.send({
                                responseCode: 200,
                                responseMessage: result,get_auth_token
                            })
                        } else {
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Wrong Password!"
                            })
                        }
                    }else {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Invalid email!"
                        })
                    }
                })
            }
        } catch (err) {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);

        }
    },

}