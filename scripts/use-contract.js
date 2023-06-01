const Web3 = require('web3');
const MultisigWalletSDK = require('../sdk/MultiSigWalletSDK'); 

const providerUrl = "http://localhost:7545";
const web3Provider = new Web3.providers.HttpProvider(providerUrl);

const web3 = new Web3(web3Provider);

const contractAddress = "0xA691Db2e34D0855360Fc93D7094dD7a25f61f895"; 
const accountPrivateKey = process.argv[2];
const account = web3.eth.accounts.privateKeyToAccount(accountPrivateKey);

const sdk = new MultisigWalletSDK(web3Provider, contractAddress);

(async function() {
    try {
      let balance = await web3.eth.getBalance(account.address);
      console.log(balance)
      await sdk.deposit(web3.utils.toWei('1', 'ether'), account.address, 300000);
      balance = await web3.eth.getBalance(account.address);
      console.log(balance)
    } catch (error) {
      console.error(`Faileds: ${error}`);
    }
})();