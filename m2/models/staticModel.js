const mongoose = require('mongoose')
const staticSchema = mongoose.Schema;
let staticKeys = new staticSchema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: String,
        enum: ["Active","Block","Delete"],
        default: "Active"
    },

}, {timestamps: true});
module.exports = mongoose.model("static",staticKeys);
mongoose.model('static', staticKeys).find({ status: { $ne: "Delete" } }, (err, res) => {
    if (err) {
        console.log("static search error:", err);
    } else if (res.length != 0) {
        console.log("Static is already exists.");
    } else {
        let static1 = {
            type: "T&C",
            title: "terms&conditions",
            description: "Terms of service are the legal agreements between a service provider and a person who wants to use that service. The person must agree to abide by the terms of service in order to use the offered service. Terms of service can also be merely a disclaimer, especially regarding the use of websites."
        };
        let static2 = {
            type: "P&P",
            title: "Privacy and Policies",
            descripition: "A privacy policy is a statement or legal document (in privacy law) that discloses some or all of the ways a party gathers, uses, discloses, and manages a customer or client's data. ... Their privacy laws apply not only to government operations but also to private enterprises and commercial transactions."
        };
        let static3 = {
            type: "aboutUs",
            title: "contactUs",
            descripition:"Your  page is perhaps the main page on your site, and it should be well crafted. This page likewise can also turn out to be the most disregarded pages, which is why you should make it stick out. "
        };
        mongoose.model('static', staticKeys).create(static1, static2, static3, (createErr, createRes) => {
            if (createErr) {
                console.log("static creation err", createErr);
            } else {
                console.log("Static data is created.");
            }
        });
    }
});