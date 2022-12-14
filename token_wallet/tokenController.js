const bip39 = require('bip39')
const axios = require('axios')
const { BncClient } = require("@binance-chain/javascript-sdk")
    
const { hdkey } = require('ethereumjs-wallet');

// mainnet 
const BNB_URL = 'https://bsc-dataseed1.binance.org:443';
// testnet
// const BNB_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common');
const contractABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
const contract = "0xE150881a2aF7BbF1E985024c14CdfF4061126c34";
const web3 = new Web3(new Web3.providers.HttpProvider(BNB_URL));

module.exports = {
  
    generateMnemonic: async (req,res) => {
      try {
        let mnemonic = bip39.generateMnemonic();
        res.send({ responseCode: 200, responseMessage: "Generated.", responseResult: mnemonic });
      } catch (error) {
        {
          return res.send({
            responseCode: 501,
            resposenMessage: "Something went wrong!!!",
            responseResult: `${error}`,
          });
        }
      }
    },
    generateBNBWallet: async (req,res) => {
            try {
                // console.log('hrlloooo');
                // if (!req.body.count || !req.body.mnemonic) {
                //     return res.status(404).json({ Message: `Invalid payment details.` })
                // }
                const seed = bip39.mnemonicToSeedSync(req.query.mnemonic)
    
                let hdwallet = hdkey.fromMasterSeed(seed);
                // console.log('hrlloooo');
                let countvalue = req.query.count ? req.query.count : 0;

                let path = `m/44'/60'/0'/0/${countvalue}`;
    
                let wallet = hdwallet.derivePath(path).getWallet();
                let address = "0x" + wallet.getAddress().toString("hex");
                let privateKey = wallet.getPrivateKey().toString("hex");
                // console.log(address, privateKey);
                let totalwallet = [];
                let importWallet = [];
                if (req.query.accountName === undefined || req.query.accountName === "") {
                  req.query.accountName = `Account ${req.query.count}`;
                }
                if (countvalue === 0) {
                  req.query.accountName = `BNBMainAccount`;
                }
            
                totalwallet.push({
                  address: address,
                  privateKey: privateKey,
                  balance: 0,
                  accountName: req.query.accountName,
                });
                let Body = {};
                if (countvalue > 0) {
                  Body = {
                    count:
                      totalwallet && totalwallet.length
                        ? parseInt(totalwallet.length) + parseInt(countvalue)
                        : parseInt(countvalue),
                    name: "Binance",
                    totalwallet: totalwallet,
                    importWallet: importWallet,
                  };
                } else {
            
                  Body = {
                    count: 1,
                    name: "Binance",
                    totalwallet: totalwallet,
                    importWallet: importWallet,
                  };
                }
                return res.send({ responseCode: 200, resposenMessage: 'Wallet generated successfully.', responseResult: Body });
    
                res.send({ responseCode: 200, responseMessage: "Account Created successfully.",path: path, Address: address, PrivateKey: privateKey });
    
    
            } catch (error) {
                res.send({ responseCode: 501, responseMessage: "Something went wrong!", error: error })
    
            }
    
        
    },
    
    
    tokenTranfer: async (req,res) => {
        try {
            const myContract = new web3.eth.Contract(contractABI,contract)
            const preBalance = await web3.eth.accounts.privateKeyToAccount(req.body.privateKey);
            const precheck = await myContract.methods.balanceOf((preBalance.address).toString()).call();
            const balance = web3.utils.toWei((req.body.tokenAmount).toString());
            if(precheck < balance){
                return res.status(401).json({ responseCode: 401, Status: "Insufficient funds!" })
            }
            const Data = await myContract.methods.transfer(req.body.toAddress, balance.toString()).encodeABI()
            
    
            const rawTransaction = {
                to: contract,
                gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
                gasLimit: web3.utils.toHex('200000'), // Always in Wei
                data: Data // Setting the pid 12 with 0 alloc and 0 deposit fee
            };
            const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, req.body.privateKey);
            web3.eth.sendSignedTransaction(signPromise.rawTransaction).then(() => {
                return res.status(200).json({ responseCode: 200, Status: "Success", Hash: signPromise.transactionHash })
            }).catch((error) => {
                res.status(501).send({ responseCode: 501, responseMessage: "Something went wrong!", error: error })
            })
    
        } catch (error) {
            console.log(error);
            return res.status(501).send({ responseCode: 501, responseMessage: "Something went wrong!", error: error })
    
        }
    },
    getTokenBalance: async(req,res) => {
        try {
            const myContract = new web3.eth.Contract(contractABI,contract)

    
            var balance = await myContract.methods.balanceOf(req.body.address).call()
    
            balance = web3.utils.fromWei(balance)
    
            if (balance) {
                return res.status(200).json({ responseCode: 200, Status: "Success", responseMessage: "Balance fetched successfully.", balance: balance.toString() });
            }
            
        } catch (error) {
            console.log(error)
                return res.status(501).send({ responseCode: 501, responseMessage: "Something went wrong!", error: error })
    
        }
    }
}