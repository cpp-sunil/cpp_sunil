const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const schema = mongoose.Schema;
let userKey = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    image: { type: String },
    countryCode: { type: String },
    userName: { type: String },
    mobileNumber: { type: String },
    password: { type: String },
    address: { type: String },
    dateOfBirth: { type: String },
    newPassword: { type: String },
    confirmPassword: { type: String },
    otp: { type: Number },
    otpExpireTime: { type: Number },
    isVerified: { type: Boolean, default: false },
    status: {
        enum: ["Active", "Block", "Delete"],
        type: String,
        default: "Active"
    },
    userType: {
        enum: ["User", "Admin"],
        type: String,
        default: "User"
    }

}, { timestamps: true });
userKey.plugin(mongoosePaginate);
module.exports = mongoose.model('user', userKey);
mongoose.model("user", userKey).findOne({ userType: "Admin" }, (err, result) => {
    if (err) {
        console.log("Default Admin Error", err)
    } else if (result) {
        console.log("Default Admin Already exists");
    }
    else {
        let obj = {
            userType: "Admin",
            firstName: "Sunil",
            lastName: "Kumar",
            mobileNumber: "0101010123",
            email: "developer.tester.trainner@gmail.com",
            countryCode: "+91",
            userName: "Sunil_module1",
            dateOfBirth: "12/11/2000",
            address: "Lucknow",
            status: "Active",
            password: bcrypt.hashSync("Indicchain@123"),
            isVerified: true


        };
        mongoose.model("user", userKey)(obj).save((err1, result1) => {
            if (err) {
                console.log("Default Admin Creation Error")
            }
            else {
                console.log("Default Admin Creation ", result1)
            }
        });
    }
})
