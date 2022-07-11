// Nodejs e CTR
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key ="9D7A7A5F8A49DBD4761D1DB999CC9343"
const iv = crypto.randomBytes(16);

module.exports = {


     encrypt: (text)=> {
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
       },

       decrypt:(text)=> {
        let iv = Buffer.from(text.iv, 'hex');
        let encryptedText = Buffer.from(text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
       }
 
}