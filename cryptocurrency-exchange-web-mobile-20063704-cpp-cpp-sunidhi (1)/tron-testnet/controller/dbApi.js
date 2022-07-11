const schema = require('../models/userModel');
const bcrypt = require('bcrypt-nodejs');
//var inbound = require('inbound');
//const detect = require('detect-port');
var nodemailer = require('nodemailer');
const commonFunction = require('../commanFunction/func');
const async = require('async');
var jwt = require('jsonwebtoken');


module.exports = {

    //................................................signUpApi.............................................................
    signUp: (req, res) => {
        console.log('Inside signup', req.body);
        try {
            if (!req.body.username || !req.body.email || !req.body.password) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Fill the required Fields"
                })
            } else {

                schema.findOne({
                    $or: [{
                        email: req.body.email
                    }, {
                        username: req.body.username
                    }]
                }, (error, result) => {
                    console.log('I am here   ', result);
                    if (error) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal Server Error",
                            data: error
                        })

                    } else if (result) {
                        // console.log("Checking: ",result, result.Mob_Number )
                        if (result.username == req.body.username) {
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Username Already Exist!"
                            })

                        } else if (result.email == req.body.email) {
                            console.log("Checking email : ", result.email)
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Email Already Exist!"
                            })
                        }

                    } else if (req.body.referralLink) {
                        schema.findOne({
                            referralLink: req.body.referralLink
                        }, (err, result1) => {
                            if (err) {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal Server Error!",
                                    data: error
                                })
                            } else if (!result1) {
                                return res.send({
                                    responseCode: 404,
                                    responseMessage: "Referral Link Not Found!"
                                })

                            } else if (result1.referralLink == req.body.referralLink) {
                                let salt = bcrypt.genSaltSync(10);
                                req.body.password = bcrypt.hashSync(req.body.password, salt)
                                var obj = new schema({
                                    username: req.body.username,
                                    email: req.body.email,
                                    password: req.body.password,
                                    facebook: req.body.facebook,
                                    twitter: req.body.twitter,
                                    Gmail: req.body.Gmail,
                                    //Mob_Number: req.body.Mob_Number,
                                    referBy: result1._id,
                                    // referralLink: "http://localhost:8000/signUp?"

                                })
                                obj.save((err1, succ) => {
                                    console.log('I am here    ', err1, succ);

                                    if (err1) {
                                        return res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal Server Error!",
                                            err1
                                        })
                                    } else if (!succ) {
                                        return res.send({
                                            responseCode: 404,
                                            responseMessage: "Not Found!"
                                        })
                                    } else if (succ) {
                                        var text = "Congratulations!!" + req.body.username + "You Have Successfully Registered with us!";
                                        commonFunction.mailer(req.body.email, text, (err, result) => {
                                            if (err) {
                                                console.log("ERROR IN MAILER ======>", err)
                                            } else {
                                                console.log("MAILER RESPONSE =====>", result)
                                            }
                                        })
                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "Saved Successfully",
                                            data: succ


                                        })
                                    }
                                })
                            } else {
                                console.log('somthing went wrong');
                            }
                        })

                    } else {
                        let salt = bcrypt.genSaltSync(10);
                        req.body.password = bcrypt.hashSync(req.body.password, salt)
                        var obj = new schema({
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password,
                            facebook: req.body.facebook,
                            twitter: req.body.twitter,
                            Gmail: req.body.Gmail
                            // Mob_Number: req.body.Mob_Number,
                            //referBy: req.body.username,
                            //referralLink: "http://localhost:8000/signUp"

                        })
                        obj.save((err1, succ) => {
                            console.log('I am here    ', err1, succ);

                            if (err1) {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal Server Error!",
                                    err1
                                })
                            } else if (!succ) {
                                return res.send({
                                    responseCode: 404,
                                    responseMessage: "Not Found!"
                                })
                            } else if (succ) {
                                var text = "Congratulations " + req.body.username + "!! You Have Successfully Registered with us!";
                                commonFunction.mailer(req.body.email, text, (err, result) => {
                                    if (err) {
                                        console.log("ERROR IN MAILER ======>", err)
                                    } else {
                                        console.log("MAILER RESPONSE =====>", result)
                                    }
                                })
                                return res.send({
                                    responseCode: 200,
                                    responseMessage: "Saved Successfully",
                                    data: succ
                                })
                            }
                        })
                    }


                })
            }
        } catch (Error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
            })
        }
    },



    //....................................................login Api.........................................................

    logIn: async (req, res) => {
        try {
            if (!req.body.username || !req.body.password) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal Server Error!"
                })
            } else {
                schema.findOne({
                    username: req.body.username
                }, async (err, succ) => {
                    console.log('I am here    ', succ);
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal Server Error!",
                            data: err
                        })
                    } else if (succ) {
                        var check = bcrypt.compareSync(req.body.password, succ.password);
                        if (check) {
                            if (succ) {

                                schema.find({
                                    referBy: succ._id
                                }, function (err, foundrefer) {
                                    //console.log("Refer list:  ",foundrefer)


                                    var arr1 = []
                                    // var arr2 = []
                                    async.forEach(foundrefer, function (result) {

                                        console.log("result is ===>>", result.username)

                                        refData = {
                                            "Username": result.username,
                                            "EmailId": result.email
                                        }

                                        arr1.push(refData)
                                    });
                                    


                                    console.log("show me usernames : ", arr1)



                                    res.locals.requested_url = req.protocol + '://' + req.host + ':1615'

                                    console.log("link is: ", res.locals.requested_url);
                                    const filter = {
                                        _id: succ._id
                                    };
                                    const update = {
                                        referralLink: res.locals.requested_url + '/signUp?id=' + succ._id
                                    };

                                    // `doc` is the document _after_ `update` was applied because of
                                    // `new: true`
                                    schema.findOneAndUpdate(filter, update, {
                                        new: true
                                    }).then(data => {
                                        if (!data) {
                                            return res.send({
                                                responseCode: 404,
                                                responseMessage: "Data Not Found!"
                                            })
                                        }

                                        console.log("Updated successfully:  ", data)

                                        var get_auth_token = jwt.sign({
                                            id: req.body.username
                                        }, "tronblockchain")


                                        var referralCount = (arr1.length)*20 +" SIMC";
                                        var responseData = {
                                            // data: data.referralLink,
                                            referredList: arr1,
                                            userData: data,
                                            authToken: get_auth_token,
                                            referralBonus: referralCount


                                        }

                                        console.log("Auth token=============>", get_auth_token);
                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "User Data :",
                                            responseData
                                        })
                                    })


                                }).catch(error => {
                                    console.log(error)
                                });


                            } else {
                                return res.send({
                                    responseCode: 401,
                                    responseMessage: "Please Verify Your Account!!"
                                })
                            }
                        } else {
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Password Does Not Match!"
                            })
                        }
                    } else {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Username Does Not Match!"
                        })
                    }
                })
            }
        } catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })
        }
    },




    //.................................................forgot Password.........................................................

    forgotPassword: (req, res) => {
        console.log('I am here   ');
        try {

            if (!req.body.email) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Fill the required fields"
                })

            } else {

                schema.findOne({
                    email: req.body.email
                }, (err, result) => {
                    console.log('I am here   ', result);
                    if (err) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Incorrect Email ID"
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Email Not Found!"
                        })
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
                                return res.send({
                                    responseCode: 404,
                                    responseMessage: "Data not found"
                                })
                            }

                            //console.log("Updated successfully:  ", data)



                            //return res.send({ responseCode: 200, responseMessage: "Referral Link :", data })
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
                            console.log('I am here    ', result2);
                            if (err) {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error"
                                })
                            } else if (result2.n >= 0) {
                                return res.send({
                                    responseCode: 200,
                                    responseMessage: "OTP has been sent to your email ID",
                                    data: result2
                                })
                            } else {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error",
                                    data: result2
                                })
                            }
                        })
                    }
                })
            }
        } catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
            })
        }
    },




    //.............................................resend_OTP_Email_API............................................................

    resendOtp: (req, res) => {
        try {

            if (!req.body.email && !req.body.Mob_Number) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Fill the required fields"
                })
            } else {
                if (req.body.email && !req.body.Mob_Number) {
                    schema.findOne({
                        email: req.body.email
                    }, (err, result) => {
                        console.log("I am here    ", result);
                        if (err) {
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Your email ID not found"
                            })
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
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "Data not found"
                                    })
                                }

                                //console.log("Updated successfully:  ", data)



                                //return res.send({ responseCode: 200, responseMessage: "Referral Link :", data })
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
                            console.log("Resend OTP check $$$$$$$$$$$$$$$$$$", result);
                            schema.updateOne({
                                email: result.email
                            }, {
                                $set: {
                                    OTP_email: otp1
                                }
                            }, (err, result1) => {
                                console.log("I am here    ", result1);
                                if (err) {
                                    return res.send({
                                        responseCode: 500,
                                        responseMessage: 'Internal Server error'
                                    })
                                } else if (result1.n >= 0) {
                                    console.log("Inside resend OTP email @@@@@@@@@", result1);
                                    return res.send({
                                        responseCode: 200,
                                        responseMessage: 'Resend OTP Successful',
                                        userData: result ///============================================
                                    })

                                } else {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: 'OTP not sent',
                                        data: result1
                                    })

                                }

                            })

                        } else {
                            return res.send({
                                responseCode: 404,
                                responseMessage: 'Email ID not found'
                            })
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
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Record Not Found!"
                            })
                        } else {
                            commonFunction.otp(req.body.Mob_Number, (err, data) => {
                                if (err) {
                                    console.log("Error in resend OTP ======>>>", err);
                                    return res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal Server Error"
                                    })

                                } else if (!data) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "No result"
                                    })
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
                                            return res.send({
                                                responseCode: 404,
                                                responseMessage: "Data not found"
                                            })
                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                            return res.send({
                                                responseCode: 200,
                                                responseMessage: "OTP has been sent on your registered Mobile Number",
                                                responseData
                                            })

                                        }
                                    }).catch(err => {
                                        console.log("catch error===", err)
                                    })
                                }
                            })
                        }
                    })
                } else {
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Invalid Request!"
                    })
                }
            }

        } catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: 'Internal Server error'
            })

        }
    },





    //...................................................VerificationAPI.........................................................

    verifyUser: (req, res) => {
        console.log('I am here >>> 103');
        try {
            console.log("I am here >>> 103");
            if (req.body.email && !req.body.Mob_Number) {

                if (!req.body.OTP || !req.body.email) {
                    console.log("I am here >>> 103", req.body.OTP, req.body.email);
                    return res.send({
                        responseCode: 404,
                        responseMessage: 'Fill the required fields'
                    })
                } else {
                    schema.findOne({
                        email: req.body.email
                    }, (err, data1) => {
                        console.log("I am here >>> 103", data1, err);
                        if (err) {
                            return res.send({
                                responseCode: 404,
                                responseMessage: 'Your Email ID not found'
                            })
                        } else if (data1) {
                            console.log("I am here >>> 103", data1.email);
                            if (req.body.OTP == data1.OTP_email) {
                                if (data1.verifyEmail == false) {
                                    schema.updateOne({
                                        verifyEmail: data1.verifyEmail
                                    }, {
                                        $set: {
                                            verifyEmail: true,

                                        }
                                    }, (err, result2) => {
                                        console.log("I am here >>> 103", result2);
                                        //console.log("OTP to verify: ", data1.verifyOtp);
                                        if (err) {
                                            return res.send({
                                                responseCode: 500,
                                                responseMessage: 'Internal Server Error'
                                            })
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
                            return res.send({
                                responseCode: 504,
                                responseMessage: "Your email not found"
                            })
                        }
                    })
                }


            } else if (!req.body.email && req.body.Mob_Number) {

                if (!req.body.OTP || !req.body.Mob_Number) {
                    console.log("I am here >>> 103", req.body.OTP, req.body.Mob_Number);
                    return res.send({
                        responseCode: 404,
                        responseMessage: 'Fill the required fields'
                    })
                } else {
                    schema.findOne({
                        Mob_Number: req.body.Mob_Number
                    }, (err, data1) => {
                        console.log("I am here >>> 103", data1, err);
                        if (err) {
                            return res.send({
                                responseCode: 404,
                                responseMessage: 'Your Mobile Number not found'
                            })
                        } else if (data1) {
                            console.log("I am here >>> 103", data1.Mob_Number);
                            if (req.body.OTP == data1.OTP_Mob) {
                                if (data1.verifyMob == false) {
                                    schema.updateOne({
                                        verifyMob: data1.verifyMob
                                    }, {
                                        $set: {
                                            verifyMob: true

                                        }
                                    }, (err, result2) => {
                                        console.log("I am here >>> 103", result2);
                                        //console.log("OTP to verify: ", data1.verifyOtp);
                                        if (err) {
                                            return res.send({
                                                responseCode: 500,
                                                responseMessage: 'Internal Server Error'
                                            })
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
                            return res.send({
                                responseCode: 504,
                                responseMessage: "Your Mobile Number not found"
                            })
                        }
                    })
                }

            } else {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Invalid Request!"
                })
            }



        } catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })
        }
    },



    //.....................................................Reset_Password............................................................
    resetPassword: (req, res) => {
        console.log("Inside reset password");
        try {

            if (!req.body.createPassword || !req.body.confirmPassword) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Fill the required fields"
                })
            } else if (req.body.createPassword != req.body.confirmPassword) {
                return res.send({
                    responseConde: 404,
                    responseMessage: "Password does not matched"
                })
            } else {
                schema.findOne({
                    email: req.body.email
                }, (err, result) => {
                    console.log("Inside findOne function =====>    ", result);
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal Server Error"
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Your email ID not found"
                        })
                    } else if (result) {
                        console.log("Inside update function=======>");

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
                                return res.send({
                                    responseCode: 404,
                                    responseMessage: "Data not found"
                                })
                            }

                            console.log("Updated successfully:  ", data)



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
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })
        }

    },


    //.......................................................uploadImage......................................................

    uploadImage: (req, res) => {
        console.log("Inside uplodadImage===================> ");
        try {
            if (!req.body.username || !req.body.base64) {
                return res({
                    responseCode: 404,
                    responseMessage: "Fill the required fields"
                })
            } else {
                schema.findOne({
                    username: req.body.username
                }, (err, result) => {
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal Server Error"
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Username not found"
                        })
                    } else {

                        commonFunction.uploadImage(req.body.base64, (err, result1) => {
                            console.log("im in cloudinary>>>>>>>>>>>>>>>>>>>", result1);

                            if (err) {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal Server Error"
                                })
                            } else if (!result1) {
                                return res.send({
                                    responseCode: 404,
                                    responseMessage: "Data not found"
                                })
                            } else if (result1) {
                                console.log("im in cloudinary111111111111", result1);

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
                                        return res.send({
                                            responseCode: 404,
                                            responseMessage: "Data not found"
                                        })
                                    }

                                    console.log("Updated successfully:  ", data)

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
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })
        }

    },


    //.......................................................Edit_Profile..................................................

    // editProfile: (req, res) => {
    //     console.log("Inside Edit Profile===========>");
    //     try {
    //         if (!req.body.username) {
    //             return res.send({
    //                 responseCode: 404,
    //                 responseMessage: "Please provide the user name"
    //             })
    //         } else {
    //             schema.findOne({
    //                 username: req.body.username
    //             }, (err, result) => {
    //                 if (err) {
    //                     console.log("Edit Profile error :", err);
    //                     return res.send({
    //                         responseCode: 500,
    //                         responseMessage: "Internal Server Error"
    //                     })
    //                 } else if (!result) {
    //                     return res.send({
    //                         responseCode: 404,
    //                         responseMessage: "Data Not Found!"
    //                     })

    //                 } else {
    //                     if (req.body.Mob_Number == result.Mob_Number) {
    //                         return res.send({
    //                             responseCode: 200,
    //                             responseMessage: "Mobile Number Already Exist!"
    //                         })
    //                     } else if (req.body.base64 == "" && req.body.Mob_Number == "") {
    //                         return res.send({
    //                             responseCode: 200,
    //                             responseMessage: "Nothing to update!"
    //                         })
    //                     } else if (req.body.base64 == "" && req.body.Mob_Number != "") {
    //                         const filter = {
    //                             username: result.username
    //                         };
    //                         const update = {
    //                             Mob_Number: req.body.Mob_Number
    //                         };

    //                         schema.findOneAndUpdate(filter, update, {
    //                             new: true
    //                         }).then(data => {
    //                             if (!data) {
    //                                 return res.send({
    //                                     responseCode: 404,
    //                                     responseMessage: "Data not found"
    //                                 })
    //                             } else {

    //                                 var responseData = {
    //                                     userData: data


    //                                 }
    //                                 return res.send({
    //                                     responseCode: 200,
    //                                     responseMessage: "Record Updated Successfully",
    //                                     responseData
    //                                 })

    //                             }
    //                         })
    //                     } else if (req.body.base64 != "" && req.body.Mob_Number == "") {

    //                         commonFunction.uploadImage(req.body.base64, (err, result1) => {
    //                             console.log("im in cloudinary>>>>>>>>>>>>>>>>>>>", result1);

    //                             if (err) {
    //                                 return res.send({
    //                                     responseCode: 500,
    //                                     responseMessage: "Internal Server Error"
    //                                 })
    //                             } else if (!result1) {
    //                                 return res.send({
    //                                     responseCode: 404,
    //                                     responseMessage: "Data not found"
    //                                 })
    //                             } else {
    //                                 const filter = {
    //                                     username: result.username
    //                                 };
    //                                 const update = {
    //                                     image: result1
    //                                 };

    //                                 schema.findOneAndUpdate(filter, update, {
    //                                     new: true
    //                                 }).then(data => {
    //                                     if (!data) {
    //                                         return res.send({
    //                                             responseCode: 404,
    //                                             responseMessage: "Data not found"
    //                                         })
    //                                     } else {
    //                                         var responseData = {
    //                                             userData: data


    //                                         }
    //                                         return res.send({
    //                                             responseCode: 200,
    //                                             responseMessage: "Record Updated Successfully",
    //                                             responseData
    //                                         })

    //                                     }
    //                                 })
    //                             }
    //                         })
    //                     } else {
    //                         commonFunction.uploadImage(req.body.base64, (err, result1) => {
    //                             console.log("im in cloudinary>>>>>>>>>>>>>>>>>>>", result1);

    //                             if (err) {
    //                                 return res.send({
    //                                     responseCode: 500,
    //                                     responseMessage: "Internal Server Error"
    //                                 })
    //                             } else if (!result1) {
    //                                 return res.send({
    //                                     responseCode: 404,
    //                                     responseMessage: "Data not found"
    //                                 })
    //                             } else {
    //                                 const filter = {
    //                                     username: result.username
    //                                 };
    //                                 const update = {
    //                                     $set: {
    //                                         image: result1,
    //                                         Mob_Number: req.body.Mob_Number
    //                                     }
    //                                 };

    //                                 schema.findOneAndUpdate(filter, update, {
    //                                     new: true
    //                                 }).then(data => {
    //                                     if (!data) {
    //                                         return res.send({
    //                                             responseCode: 404,
    //                                             responseMessage: "Data not found"
    //                                         })
    //                                     } else {
    //                                         var responseData = {
    //                                             userData: data


    //                                         }
    //                                         return res.send({
    //                                             responseCode: 200,
    //                                             responseMessage: "Record Updated Successfully",
    //                                             responseData
    //                                         })

    //                                     }
    //                                 })
    //                             }
    //                         })
    //                     }
    //                 }
    //             })
    //         }

    //     } catch (error) {
    //         return res.send({
    //             responseCode: 500,
    //             responseMessage: "Internal Server Error"
    //         })
    //     }
    // },




    //.................................................getInfo...........................................................

    getInfo: (req, res) => {
        console.log("Inside getInfo============>");
        try {
            if (!req.body.username) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Please provide username"
                })

            } else {

                schema.findOne({
                    username: req.body.username
                }, (err, data) => {
                    if (err) {
                        console.log("Error in getInfo===============>", err);
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal Server Error"
                        })

                    } else if (!data) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Data not found"
                        })
                    } else {

                        schema.find({
                            referBy: data._id
                        }, function (err, foundrefer) {
                            //console.log("Refer list:  ",foundrefer)


                            var arr1 = []
                            // var arr2 = []
                            async.forEach(foundrefer, function (result) {

                                console.log("result is ===>>", result.username)

                                refData = {
                                    "Username": result.username,
                                    "EmailId": result.email
                                }

                                arr1.push(refData)
                            });
                             var responseData = {
                                            // data: data.referralLink,
                                            referredList: arr1,
                                            userData: data,
                                          
                             }
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Record Found",
                            responseData
                           
                        })
                    })
                } 

            })
        
        } }catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })
        }
    },


    //........................................changePassword.............................................................

    changePassword: (req, res) => {
        console.log("Inside changePassword =================>>>>>");
        console.log("old password before bcrypt==========>>>", req.body.oldPassword);
        try {
            if (!req.body.username || !req.body.oldPassword || !req.body.newPassword || !req.body.confirmPassword) {
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

                console.log("Inside else=======> ")
                schema.findOne({
                    username: req.body.username
                }, (err, result) => {
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: err
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Data Not Found!"
                        })
                    } else {
                        var check = bcrypt.compareSync(req.body.oldPassword, result.password);
                        if (check) {
                            console.log("Inside check=======>>>>", check);
                            console.log("Old Password in DB==============>>>>>", result.password);
                            console.log("Old password in body============>>>>>", req.body.oldPassword);

                            let salt = bcrypt.genSaltSync(10);
                            req.body.confirmPassword = bcrypt.hashSync(req.body.confirmPassword, salt)
                            const filter = {
                                username: req.body.username
                            };
                            const update = {
                                password: req.body.confirmPassword
                            };

                            schema.findOneAndUpdate(filter, update, {
                                new: true
                            }).then(data => {
                                if (!data) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "Data not found"
                                    })
                                } else {
                                    
                                    return res.send({
                                        responseCode: 200,
                                        responseMessage: "Record Updated Successfully"
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
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })

        }
    },


    

    //..................................................newEditProfile......................................................

    editProfile: (req, res) => {
        console.log("Inside Edit Profile===========>");
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
                        console.log("Edit Profile error :", err);
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal Server Error"
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "Data Not Found!"
                        })

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
                                    console.log("ERROR: ===>>", error);
                                    return res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal Server Error",
                                        data: err
                                    })
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
                                            return res.send({
                                                responseCode: 404,
                                                responseMessage: "Data not found"
                                            })
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
                                console.log("im in cloudinary>>>>>>>>>>>>>>>>>>>", result1);

                                if (err) {
                                    return res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal Server Error"
                                    })
                                } else if (!result1) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "Data not found"
                                    })
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
                                            return res.send({
                                                responseCode: 404,
                                                responseMessage: "Data not found"
                                            })
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
                                    return res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal Server Error"
                                    })
                                } else if (!result) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "No result"
                                    })
                                } else {
                                    console.log("OTP in result =====>>>", result);
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
                                            return res.send({
                                                responseCode: 404,
                                                responseMessage: "Data not found"
                                            })
                                        } else {
                                            var responseData = {
                                                userData: data


                                            }
                                            // return res.send({
                                            //     responseCode: 200,
                                            //     responseMessage: "Record Updated Successfully",
                                            //     responseData
                                            // })

                                        }
                                    })

                                }
                            })


                            commonFunction.uploadImage(req.body.base64, (err, result1) => {
                                console.log("im in cloudinary>>>>>>>>>>>>>>>>>>>", result1);

                                if (err) {
                                    return res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal Server Error"
                                    })
                                } else if (!result1) {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "Data not found"
                                    })
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
                                            return res.send({
                                                responseCode: 404,
                                                responseMessage: "Data not found"
                                            })
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
            return res.send({
                responseCode: 500,
                responseMessage: "Internal Server Error"
            })
        }
    },



    //..................................................adminLogin........................................................

    adminLogin: (req, res) => {
        try {
            if (!req.body.username || !req.body.password) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Please fill the required fields"
                })
            } else {
                schema.findOne({
                    adminname: req.body.username
                }, (err, result) => {
                    if (err) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: err
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 404,
                            responseMessage: "User Not Found!"
                        })
                    } else {
                        var check = bcrypt.compareSync(req.body.password, result.adminPassword);
                        if (check) {
                            return res.send({
                                responseCode: 200,
                                responseMessage: result
                            })
                        } else {
                            return res.send({
                                responseCode: 404,
                                responseMessage: "Wrong Password!"
                            })
                        }
                    }
                })
            }
        } catch (err) {
            console.log(err)
        }
    },


    //..................................................deleteUser........................................................

    deleteUser: (req,res)=>{
        console.log("==========Inside deleteUser========");
        try{
            if(!req.body.username){
                return res.send({ responseCode: 500, responseMessage: "Please provide a user name"})
            }
            else{
                schema.findOneAndDelete({username: req.body.username}, (err, result)=>{
                    if(err){
                        return res.send({ responseCode: 500, responseMessage: err})
                    }
                    else if(!result){
                        return res.send({ responseCode: 404, responseMessage: "Record Not Found!"})
                    }
                    else{
                        return res.send({ responseCode: 200, responseMessage: "Record Deleted Successfully!"})
                    }
                })
            }

        }catch(error){
            console.log("Inside Catch of deleteUser=======>>>", error)
        }
    }


}