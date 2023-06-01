const Web3 = require('web3');
const contractABI = require('../build/contracts/MultiSigWallet.json');

class MultisigWalletSDK {
    constructor(web3Provider, contractAddress) {
        this.web3 = new Web3(web3Provider);
        this.contract = new this.web3.eth.Contract(contractABI.abi, contractAddress);
    }

    deposit(value, from, gas) {
        return this.contract.methods.deposit().send({ value, from, gas });
    }

    submitTransaction(from, target, value, data, confirmationsRequired, gas) {
        return this.contract.methods.submitTransaction(target, value, this.web3.utils.asciiToHex(data), confirmationsRequired).send({ from, gas });
    }

    confirmTransaction(from, txIndex, gas) {
        return this.contract.methods.confirmTransaction(txIndex).send({ from, gas });
    }

    executeTransaction(from, txIndex, gas) {
        return this.contract.methods.executeTransaction(txIndex).send({ from, gas });
    }

    addOwner(from, newOwner, gas) {
        return this.contract.methods.addOwner(newOwner).send({ from, gas });
    }

    removeOwner(from, owner, gas) {
        return this.contract.methods.removeOwner(owner).send({ from, gas });
    }

    blockAddress(from, address, gas) {
        return this.contract.methods.blockAddress(address).send({ from, gas });
    }

    unblockAddress(from, address, gas) {
        return this.contract.methods.unblockAddress(address).send({ from, gas });
    }

    async getOwner(index) {
        return this.contract.methods.owners(index).call();
    }

    async isOwner(address) {
        return this.contract.methods.isOwner(address).call();
    }

    async isBlocked(address) {
        return this.contract.methods.isBlocked(address).call();
    }

    async getTransaction(txIndex) {
        return this.contract.methods.transactions(txIndex).call();
    }

    async getTransactions() {
        const transactionCount = await this.contract.methods.getTransactionCount().call();
        const transactions = [];
        for (let i = 0; i < transactionCount; i++) {
          const transaction = await this.contract.methods.transactions(i).call();
          const valueInWei = transaction.value;
          const valueInEther = this.web3.utils.fromWei(valueInWei.toString(), 'ether');
          transactions.push({
            destination: transaction.destination,
            value: valueInEther,
            executed: transaction.executed,
          });
        }
        return transactions;
      }
      
      
      
}

module.exports = MultisigWalletSDK;

