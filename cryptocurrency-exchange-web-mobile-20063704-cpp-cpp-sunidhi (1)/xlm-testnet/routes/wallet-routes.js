const walletRoutes = require('express').Router()
const wallet = require('../services/wallet-handlers.js')
const auth = require('../auth/auth')

walletRoutes.get('/get_auth_token', wallet.get_auth_token);

walletRoutes.get('/generateAddress', wallet.wallet);

walletRoutes.get('/getBalance/:address',wallet.balance)

walletRoutes.post('/deposits',wallet.deposits)

walletRoutes.post('/withdraw', wallet.send_stellar);

walletRoutes.get('/get_transaction/:txid', wallet.get_transaction)

walletRoutes.get('/faucet/:address',wallet.faucet)

//walletRoutes.get('/deposites',wallet.deposites)




module.exports = walletRoutes;


// {
//     "code": 200,
//     "data": [
//         {
//             "publicKey": "GAQJBU7IDQDG2UWGPAEK24QB5AMSDP4RAVWTX4VFBJCRCJPBLKD27VQE",
//             "secretKey": "SBLCIQQSMO5NY7WRMXFM2LHRCPWIJSXCULIJ2NFR7AMXNF5TKXS2HK3M"
//         }
//     ]
// }








// get_transaction - 
//http://localhost:9042/xlm/get_transaction/841b4bf6cd3ef17acfe2fdd1ac24031b7f8d8f9e8549556e4007ce7d11672a09
// {
//     "code": 200,
//     "data": [
//         {
//             "hash": "841b4bf6cd3ef17acfe2fdd1ac24031b7f8d8f9e8549556e4007ce7d11672a09",
//             "created_at": "2019-07-09T12:34:02Z",
//             "source_account": "GCTB5FOPEGMVFAAQSZ7XMO3DEVNEW7CEDFUQGNNZ554BWJS4BBIDZFVQ",
//             "fee": 100,
//             "source_account_sequence": "4224912084435183"
//         }
//     ]
// }







// publicKey": "GCFEYS76LCCUQ3HTEFSFZU7IICIGWHQOEQPG7XCKH6O6UNSZO7ZIQE47",
//             "secretKey": "SDM3X7GCUQ3T5ZH4P34IYEXVCS72UNJ5CIICMKIXXRWISFMHMYTXYPIB"