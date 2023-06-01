import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

class MultisigWalletSDK {
    web3: Web3;
    contract: Contract;

    constructor(web3Provider: string, contractAddress: string, contractABI: any[]) {
        this.web3 = new Web3(web3Provider);
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
    }

    async deposit(value: string, from: string, gas: number) {
        return this.contract.methods.deposit().send({ value, from, gas });
    }

    async submitTransaction(from: string, target: string, value: string, data: string, confirmationsRequired: number, gas: number) {
        return this.contract.methods.submitTransaction(target, value, this.web3.utils.asciiToHex(data), confirmationsRequired).send({ from, gas });
    }

    async confirmTransaction(from: string, txIndex: number, gas: number) {
        return this.contract.methods.confirmTransaction(txIndex).send({ from, gas });
    }

    async executeTransaction(from: string, txIndex: number, gas: number) {
        return this.contract.methods.executeTransaction(txIndex).send({ from, gas });
    }

    async addOwner(from: string, newOwner: string, gas: number) {
        return this.contract.methods.addOwner(newOwner).send({ from, gas });
    }

    async removeOwner(from: string, owner: string, gas: number) {
        return this.contract.methods.removeOwner(owner).send({ from, gas });
    }

    async blockAddress(from: string, address: string, gas: number) {
        return this.contract.methods.blockAddress(address).send({ from, gas });
    }

    async unblockAddress(from: string, address: string, gas: number) {
        return this.contract.methods.unblockAddress(address).send({ from, gas });
    }

    // Getters
    async getOwners() {
        return this.contract.methods.owners().call();
    }

    async isOwner(address: string) {
        return this.contract.methods.isOwner(address).call();
    }

    async isBlocked(address: string) {
        return this.contract.methods.isBlocked(address).call();
    }

    async getTransaction(txIndex: number) {
        return this.contract.methods.transactions(txIndex).call();
    }
}

export default MultisigWalletSDK;
