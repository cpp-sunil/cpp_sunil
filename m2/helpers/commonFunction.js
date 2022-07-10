const nodemailer = require('nodemailer');
const cloudinary = require("cloudinary").v2;


// Cloudinary concfig set
cloudinary.config({
    cloud_name: 'didugviac',
    api_key: '651914452778265',
    api_secret: 'ZAqtC4ntt44lqi3WancFnPsx4V0'
});

module.exports = {
    randomOTP: async () => {
        let otp = Math.floor(100000 + (Math.random() * 99999));
        return otp;
    },
    sendMail: async (email, subject, text) => {
        try {
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'pqc-trainee@mobiloitte.com',
                    pass: 'Mobiloitte1'
                }
            })
            let mailOption = {
                from: 'pqc-trainee@mobiloitte.com',
                to: "cpp-sunil@indicchain.com",
                subject: subject,
                html: text
            };
            let mailResponse = await transporter.sendMail(mailOption);
            return mailResponse;

        }
        catch (e) {
            console.log('sendMail error:', e)

        }
    },
    uploadImage: async (image) => {
        try {
            let upload = await cloudinary.uploader.upload(image);
            console.log('44 ==>', upload);
            return upload.secure_url;
        } catch (e) {
            console.log('45 ==>', e)
        }
    }

}