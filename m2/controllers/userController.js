const commonFunction = require("../helpers/commonFunction");
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const qrCode = require("qrcode");
const joi = require("joi");

const category = require("../models/category")
const product = require("../models/product");

const jwt = require("jsonwebtoken");
module.exports = {
    signUp: async (req, res) => {
        const schema = {
            firstName: joi.string().alphanum().min(3).max(30).required(),
            lastName: joi.string().alphanum().min(3).max(30).required(),
            userName: joi.string().alphanum().min(3).max(30).optional(),
            mobileNumber: joi.string().alphanum().max(10).required(),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
            password: joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/).required(),
            address: joi.string().alphanum().min(3).max(30).optional(),
            dateOfBirth: joi.number().integer().min(1900).max(2022).required(),
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let orCondition = {
                $or: [
                    { email: validateBody.email },
                    { userName: validateBody.userName },
                    { mobileNumber: validateBody.mobileNumber }],
            };
            let userData = await userModel.findOne(orCondition);
            if (userData) {
                if (userData.email == req.body.email) {
                    res.send({ responseCode: 409, responseMessage: "Email already exists.", responseResult: userData });
                }
                else if (userData.mobileNumber == req.body.mobileNumber) {
                    res.send({ responseCode: 409, responseMessage: "Mobile number already exists.", responseResult: userData });
                }
                else {
                    res.send({ responseCode: 409, responseMessage: "User name already exists.", responseResult: userData });
                }
            }
            else {
                let name = await req.body.firstName;
                let num = await req.body.mobileNumber.slice(req.body.mobileNumber.length - 4)
                const username = await name + num;
                req.body.userName = await username;
                req.body.otp = await commonFunction.randomOTP();
                const d = new Date();
                let time = d.getTime();
                req.body.otpExpireTime = time + 1000 * 60 * 3;
                req.body.password = bcrypt.hashSync(req.body.password);
                let subject = `Signup OTP`;
                let link = await `http://localhost:8000/user/linkVerify/${req.body.email}`;
                let text = `Your OTP is ${req.body.otp} valid for 3 minutes , link is ${link} `;
                let sendMailResponse = await commonFunction.sendMail(req.body.email, subject, text)
                if (sendMailResponse) {
                    let saveUser = await userModel(req.body).save();
                    if (saveUser) {
                        res.send({ responseCode: 200, responseMessage: "OTP sent go to  verify  API!", responseResult: saveUser });
                    }
                }
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: 'Something went wrong', responseResult: error })
        }
    },
    otpVerify: async (req, res) => {
        const schema = {
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
            otp: joi.number().required(),
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let query = { $and: [{ email: validateBody.email }, { status: { $ne: "Delete" } }, { userType: { $in: 'User' } }] }

            let userData = await userModel.findOne(query);
            if (userData) {
                if (userData.isVerified == false) {
                    if (userData.otp == req.body.otp) {
                        if (userData.otpExpireTime >= new Date()) {
                            let updateUser = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: { isVerified: true } }, { new: true })
                            console.log(updateUser)
                            res.send({ responseCode: 200, responseMessage: "OTP verified successfully.", responseResult: [] })
                        }
                        else {
                            res.send({ responseCode: 400, responseMessage: "OTP has expired, please try resend OTP." })
                        }
                    }
                    else {
                        res.send({ responseCode: 402, responseMessage: "Invalid OTP.", responseResult: [] })
                    }
                }
                else {
                    res.send({ responseCode: 409, responseMessage: "Already verified.", responseResult: [] })
                }
            }
            else {
                res.send({ responseCode: 404, responseMessage: "User  not found.", responseResult: [] });
            }
        } catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong.", responseResult: error });
        }
    },
    resendOtp: async (req, res) => {
        const schema = {
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
            mobileNumber: joi.string().alphanum().max(10).optional()
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let userData = await userModel.findOne({ email: validateBody.email });
            if (userData) {
                req.body.otp = await commonFunction.randomOTP();
                const d = new Date();
                let time = d.getTime();
                req.body.otpExpireTime = time + 1000 * 60 * 3;
                console.log(req.body.otpExpireTime);
                let subject = "Resend OTP ";
                let text = `Your resend OTP is ${req.body.otp} valid for  3 minutes.`;
                let a = await commonFunction.sendMail(req.body.email, subject, text)
                if (a) {
                    let updateUser = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: { otp: req.body.otp, otpExpireTime: req.body.otpExpireTime, isVerified: false } }, { new: true })
                    console.log(updateUser);
                    if (updateUser) {
                        res.send({ responseCode: 200, responseMessage: "OTP has been sent on your registered email", responseResult: [] })
                    }
                }
            }
            else {
                res.send({ responseCode: 404, responseMessage: "User not found.", responseResult: [] })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong.", responseResult: error })
        }
    },
    forgotPassword: async (req, res) => {
        const schema = {
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
            mobileNumber: joi.number().max(10).optional()
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let query = { $and: [{ or: [{ email: validateBody.email }, { mobileNumber: validateBody.mobileNumber }] }, { status: { $ne: "Delete" } }, { userType: { $in: 'User' } }] }
            let userData = await userModel.findOne(query);
            if (userData) {
                req.body.otp = await commonFunction.randomOTP();
                const d = new Date();
                let time = d.getTime();
                req.body.otpExpireTime = time + 1000 * 60 * 3;
                console.log(req.body.otpExpireTime);
                let subject = " Otp Sent for forgot passord ";
                let text = `Your resend OTP is ${req.body.otp} valid for  3 minutes.`;
                await commonFunction.sendMail(req.body.email, subject, text);

                let updateUser = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: { isVerified: false, otp: req.body.otp, otpExpireTime: req.body.otpExpireTime } }, { new: true })
                if (updateUser) {
                    res.send({ responseCode: 200, responseMessage: "OTP has been sent on your registered ID. ", responseResult: [] })
                }
            }
            else {
                res.send({ responseCode: 404, responseMessage: " User not found.", responseResult: [] })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong.", responseResult: error })
        }
    },
    resetPassword: async (req, res) => {
        const schema = {
            mobileNumber: joi.string().alphanum().max(10).optional(),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
            password: joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/).required(),
            confirmPassword: joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/).required(),
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let query = { $and: [{ email: validateBody.email }, { status: { $ne: "Delete" } }, { userType: { $in: 'User' } }] }
            let userData = await userModel.findOne(query);
            if (userData) {
                if (userData.isVerified == true) {
                    let password = req.body.password;
                    let confirmPassword = req.body.confirmPassword;
                    if (password == confirmPassword) {
                        req.body.newPassword = bcrypt.hashSync(req.body.confirmPassword);
                        let updateUser = await userModel.findByIdAndUpdate({ _id: (userData._id) }, { $set: { password: req.body.newPassword, } }, { new: true })
                        res.send({ responseCode: 200, responseMessage: 'Your password has been changed successfully.', responseResult: updateUser })
                    }
                    else {
                        res.send({ responseCode: 400, responseMessage: "Password not matched.", responseResult: [] })
                    }
                }
                else {
                    res.send({ responseCode: 400, responseMessage: "Please verify first.", responseResult: [] })
                }
            }
            else {
                res.send({ responseCode: 404, responseMessage: "User not found.", responseResult: [] })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong.", responseResult: error })
        }
    },
    login: async (req, res) => {
        const schema = {
            mobileNumber: joi.string().alphanum().max(10).optional(),
            userName: joi.string().alphanum().min(3).max(30).optional(),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).optional(),
            password: joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/).required(),
        }
        try {
            let validateBody = await joi.validate(req.body, schema);

            let query = { $and: [{ $or: [ {userName: validateBody.userName},{email: validateBody.email }, { mobileNumber: validateBody.mobileNumber }] }, { status: { $in: "Active" } }, { userType: { $in: "User" } }] }
            let userData = await userModel.findOne(query);
            if (userData) {
                if (userData.isVerified == true) {
                    let check = bcrypt.compareSync(req.body.password, userData.password)
                    if (check == true) {
                        const token = await jwt.sign({ _id: userData._id, email: userData.email }, 'secret', { expiresIn: "1h" })
                        let obj = {
                            userData: userData,
                            token: token
                        }
                        res.send({ responseCode: 200, responseMessage: "Login successfully.", responseResult: obj })
                    }
                    else {
                        res.send({ responseCode: 400, responseMessage: 'Password not matched.', responseResult: [] })
                    }
                }
                else {
                    res.send({ responseCode: 409, responseMessage: "Please verify  your otp first.", responseResult: [] })
                }
            }
            else {
                res.send({ responseCode: 404, responseMessage: "User not found", responseResult: [] })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong.", responseResult: error })
        }
    },
    userList: async (req, res) => {
        try {
            userData = await userModel.findOne({ $and: [{ _id: req.userId }, { userType: "Admin" }] });
            if (!userData) {
                res.send({ responseCode: 404, responseMessage: "Admin not found, Only admin can view list.", responseResult: [] })
            }
            else {
                userData1 = await userModel.find({ userType: { $in: "User" } });
                if (userData1.length == 0) {
                    res.send({ responseCode: 404, responseMessage: 'list Not found' })
                } else {
                    res.send({ responseCode: 200, responseMessage: 'User List is Presented', responseResult: userData1 })
                }
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: [] })
        }
    },
    viewUser: async (req, res) => {
        try {
            let userData = await userModel.findOne({ $or: [{ _id: req.userId }, { email: req.params.email }, { userName: req.params.userName }, { mobileNumber: req.params.mobileNumber }] });
            if (userData) {
                res.send({ responseCode: 200, responseMessage: 'see Your Profile', responseResult: userData })
            }
            else {
                res.send({ responseCode: 404, responseMessage: 'User Not found',responseResult: [] })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    editProfile: async (req, res) => {
        const schema = {
            firstName: joi.string().alphanum().min(3).max(30).optional(),
            lastName: joi.string().alphanum().min(3).max(30).optional(),
            userName: joi.string().alphanum().min(3).max(30).optional(),
            mobileNumber: joi.string().alphanum().max(10).optional(),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).optional(),
            password: joi.string().alphanum().min(3).max(30).optional(),
            confirmPassword: joi.string().alphanum().min(3).max(30).optional(),
            address: joi.string().alphanum().min(3).max(30).optional(),
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let userData = await userModel.findOne({_id: req.userId});
            if (!userData) {
                res.send({ responseCode: 404, responseMessage: "User Not Found", responseResult: [] })
            }
            else {
                if (userData) {
                    if (userData.email == req.body.email) {
                        const updateUser = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: validateBody }, { new: true })
                        res.send({ responseCode: 200, responseMessage: "Edit Profile successfully done", responseResult: updateUser })
                    }
                    else {
                        let result = await userModel.findOne({ _id: { $ne: userData._id }, email: req.body.email, status: "Active" })
                        if (result) {
                            res.send({ responseCode: 200, responseMessage: "Email already exists", responseResult: [] })
                        }
                        else {
                            const updateUser = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: req.body }, { new: true })
                            res.send({ responseCode: 200, responseMessage: "Edit Profile successfully done", responseResult: updateUser })
                        }
                    }
                }
                else {
                    res.send({ responseCode: 404, responseMessage: "User Not found", responseResult: [] })
                }
            }
        } catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something Went Wrong", result: error })
        }
    },
    linkVerify: async (req, res) => {
        try {
            let userData = await userModel.findOne({ email: req.params.email });
            if (userData) {
                let updateUser = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: { isVerified: true } }, { new: true })
                console.log(updateUser);
                if (updateUser) {
                    res.send({ responseCode: 200, responseMessage: "Otp verified successfully." })
                }
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    adminLogin: async (req, res) => {
        const schema = {
            mobileNumber: joi.string().alphanum().max(10).optional(),
            userName: joi.string().alphanum().min(3).max(30).optional(),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).optional(),
            password: joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/).required(),
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let query = {
                $and: [{ $or: [{userName: validateBody.userName},{ email:validateBody.email }, { mobileNumber: validateBody.mobileNumber }] }, { status: { $in: "Active" } }, { userType:"Admin"}]
            }
            let userData = await userModel.findOne(query);
            console.log(userData);
            if (userData) {
                if (userData.isVerified == true) {
                    let check = bcrypt.compareSync(req.body.password, userData.password)
                    if (check == true) {
                        const token = await jwt.sign({ _id: userData._id, email: userData.email }, 'secret', { expiresIn: "24h" })
                        let obj = {
                            userData: userData,
                            token: token
                        }
                        res.send({ responseCode: 200, responseMessage: "Admin logged in successfully", responseResult: obj })
                    }
                    else {
                        res.send({ responseCode: 400, responseMessage: 'Password not match', responseResult: userData })
                    }
                }
                else {
                    res.send({ responseCode: 404, responseMessage: "Verify first then login..", responseResult: userData })
                }
            }
            else {
                res.send({ responseCode: 404, responseMessage: "AdminData not Found", responseResult: [] })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    pagination: async (req, res) => {
        try {
            const userData = await userModel.find({ _id: req.userId });
            if (!userData) {
                res.send({ responseCode: 404, responseMessage: " User not found", responseResult: [] })
            }
            else {
                let query = { status: { $ne: "Delete" } };
                if (req.query.search) {
                    query.$or = [
                        { productName: { $regex: req.query.search, $options: "i" } },
                        { price: { $regex: req.query.search, $options: "i" } },
                    ]
                }
                let option = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 5,
                    sort: { createAt: -1 }
                };
                let userData = await product.paginate(query, option);
                if (userData.docs.length == 0) {
                    res.send({ responseCode: 404, responseMessage: " Data not found", responseResult: [] })
                }
                else {
                    res.send({ responseCode: 200, responseMessage: " Products list ", responseResult: userData })
                }
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: [] })
        }
    },
    qrGenerator: async (req, res) => {
        try {
            let orCondition = { $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }, { userName: req.body.userName }], status: { $ne: "Delete" }, userType: { $in: 'User' } }
            let userData = await userModel.findOne(orCondition);
            let strData = JSON.stringify(userData)
            let qrImage = await qrCode.toDataURL(strData);
            return res.send({ responseCode: 200, responseMessage: "QRCode generated successfully", responseResult: qrImage })
        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    uploadImage: async (req, res) => {
        try {
            let image = [];
            for (let index = 0; index < req.files.length; index++) {
                let img = await commonFunction.uploadImage(req.files[index].path);
                image.push(img)
            }
            if (image.length != 0) { return res.send({ responseCode: 200, responseMessage: "Image uploaded.", responseResult: image }) }
        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    createCategory: async (req, res) => {
        const schema = {
            category: joi.string().alphanum().min(3).max(30).required(),            
        }
        try {
            let validateBody = await joi.validate(req.body, schema);
            let userData = await userModel.findOne({ $and: [{ _id: req.userId }, { userType: "Admin" }] })
            if (!userData) {
                res.send({ responseCode: 404, responseMessage: "Admin not found, Only admin can create categories.", responseResult: [] })
            }
            else {
                let productData = await category.findOne({ category: validateBody.category });
                if (productData) {
                    res.send({ responseCode: 409, responseMessage: "category already exists", responseResult: productData })
                }
                else {
                    let saveUser = await category(req.body).save();
                    res.send({ responseCode: 200, responseMessage: "Category created Succeccfully", responseResult: saveUser })
                }
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    createProduct: async (req, res) => {
        const schema = {
            productName: joi.string().alphanum().min(3).max(30).required(),
            price: joi.number().required(),
            quentity: joi.number().required(),
            image: joi.string().optional(),
            category: joi.string().alphanum().min(3).max(50).required(),    
        }
        try {
            let validateBody = await joi.validate(req.body, schema);

            let userData = await userModel.findOne({ $and: [{ _id: req.userId }, { userType: "Admin" }] })
            if (!userData) {
                res.send({ responseCode: 404, responseMessage: "Admin not found, Only admin can create products.", responseResult: [] })
            }
            else {
                let productData = await product.findOne({ productName: validateBody.productName });
                if (productData) {
                   return  res.send({ responseCode: 409, responseMessage: "Product already exists", responseResult: [] })
                }
                else {
                    let qrImage, productData1;
                    let saveUser = await product(req.body).save();
                    if (saveUser) {
                        let strData = JSON.stringify(req.body)
                        qrImage = await qrCode.toDataURL(strData);
                        productData1 = await product.findByIdAndUpdate({ _id: saveUser._id }, { $set: { qr: qrImage } }, { new: true });
                    }
                    res.send({ responseCode: 200, responseMessage: "Product created Succeccfully", responseResult: productData1 });
                }
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    },
    productList: async (req, res) => {
        try {
            userData1 = await product.find().populate("category");
            if (userData1.length == 0) {
                res.send({ responseCode: 404, responseMessage: 'list Not found' })
            } else {
                res.send({ responseCode: 200, responseMessage: 'User List is Presented', responseResult: userData1 })
            }
        }
        catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong", responseResult: error })
        }
    }
}
