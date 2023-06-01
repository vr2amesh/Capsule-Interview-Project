const Web3 = require('web3');
const MultisigWalletSDK = require('../sdk/MultiSigWalletSDK'); 

const providerUrl = "http://localhost:7545";
const web3Provider = new Web3.providers.HttpProvider(providerUrl);

const web3 = new Web3(web3Provider);

const contractAddress = "0xA691Db2e34D0855360Fc93D7094dD7a25f61f895"; 
const accountPrivateKey = process.argv[2];
const account2PrivateKey = process.argv[3];
const account3PrivateKey = process.argv[4];

const account2 = web3.eth.accounts.privateKeyToAccount(account2PrivateKey);
web3.eth.accounts.wallet.add(account2);

const account3 = web3.eth.accounts.privateKeyToAccount(account3PrivateKey);
web3.eth.accounts.wallet.add(account3);


const account = web3.eth.accounts.privateKeyToAccount(accountPrivateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const sdk = new MultisigWalletSDK(web3Provider, contractAddress);

async function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function assertOwner(address, expected, message) {
    const isOwner = await sdk.isOwner(address);
    await assertEqual(isOwner, expected, message);
}

async function assertBlocked(address, expected, message) {
    const isBlocked = await sdk.isBlocked(address);
    await assertEqual(isBlocked, expected, message);
}

async function assertTransaction(txIndex, expectedTarget, expectedValue, expectedExecuted, message) {
    const transaction = await sdk.getTransaction(txIndex);
    await assertEqual(transaction.target, expectedTarget, message);
    await assertEqual(transaction.value, expectedValue, message);
    await assertEqual(transaction.executed, expectedExecuted, message);
}

async function tests() {
    // Test 1: Deposit
    await sdk.deposit(web3.utils.toWei('1', 'ether'), account.address, 300000);
    // Check account balance
    const balance = await web3.eth.getBalance(contractAddress);
    // assertEqual(web3.utils.fromWei(balance, 'ether'), '1', 'Deposit failed');

    // Test 2: Add owner
    await sdk.addOwner(account.address, account2.address, 300000);
    // Check owner status
    await assertOwner(account2.address, true, 'Add owner failed');

    // Test if an owner can add an existing owner.
    try {
        await sdk.addOwner(account.address, account2.address, 300000);
        console.error("Owner was able to add an existing owner");
    } catch (err) {
        console.log("Owner was correctly prevented from adding an existing owner");
    }

    // Test 3: Remove owner
    await sdk.removeOwner(account.address, account2.address, 300000);
    // Check owner status
    await assertOwner(account2.address, false, 'Remove owner failed');

    // Test 4: Block address
    await sdk.blockAddress(account.address, account3.address, 300000);
    // Check block status
    await assertBlocked(account3.address, true, 'Block address failed');

    // Test if a blocked address can deposit.
    try {
        await sdk.deposit(web3.utils.toWei('1', 'ether'), account3.address, 300000);
        console.error("Blocked address was able to deposit");
    } catch (err) {
        console.log("Blocked address was correctly prevented from depositing");
    }

    // Test if an owner can add a blocked address.
    try {
        await sdk.addOwner(account.address, account3.address, 300000);
        console.error("Owner was able to add a blocked address");
    } catch (err) {
        console.log("Owner was correctly prevented from adding a blocked address");
    }

    // Test if an owner can block an already blocked address.
    try {
        await sdk.blockAddress(account.address, account3.address, 300000);
        console.error("Owner was able to block an already blocked address");
    } catch (err) {
        console.log("Owner was correctly prevented from blocking an already blocked address");
    }

    // Test 5: Unblock address
    await sdk.unblockAddress(account.address, account3.address, 300000);
    // Check block status
    await assertBlocked(account3.address, false, 'Unblock address failed');

    // Test 6: Submit, confirm and execute transaction
    const valueToSend = web3.utils.toWei('0.5', 'ether');
    await sdk.submitTransaction(account.address, account2.address, valueToSend, 'test', 1, 300000);
    await sdk.confirmTransaction(account.address, 0, 300000);
    await sdk.executeTransaction(account.address, 0, 300000);
    // Check transaction
    await assertTransaction(0, account2.address, valueToSend, true, 'Submit, confirm or execute transaction failed');

    // Final balance checks
    const finalAccount2Balance = await web3.eth.getBalance(account2.address);
    const finalContractBalance = await web3.eth.getBalance(contractAddress);

    // assertEqual(web3.utils.fromWei(finalAccount2Balance, 'ether'), '0.5', 'Final account2 balance incorrect');
    // assertEqual(web3.utils.fromWei(finalContractBalance, 'ether'), '0.5', 'Final contract balance incorrect');

    // Test if a non-owner can submit a transaction.
    try {
        await sdk.submitTransaction(account2.address, '0x0', web3.utils.toWei('0.5', 'ether'), '', 2, 300000);
        console.error("Non-owner was able to submit a transaction");
    } catch (err) {
        console.log("Non-owner was correctly prevented from submitting a transaction");
    }

    // Test if a non-owner can confirm a transaction.
    try {
        await sdk.confirmTransaction(account2.address, 0, 300000);
        console.error("Non-owner was able to confirm a transaction");
    } catch (err) {
        console.log("Non-owner was correctly prevented from confirming a transaction");
    }

    // Test if a non-owner can execute a transaction.
    try {
        await sdk.executeTransaction(account2.address, 0, 300000);
        console.error("Non-owner was able to execute a transaction");
    } catch (err) {
        console.log("Non-owner was correctly prevented from executing a transaction");
    }

    // Test if an owner can remove themselves.
    try {
        await sdk.removeOwner(account.address, account.address, 300000);
        console.error("Owner was able to remove themselves");
    } catch (err) {
        console.log("Owner was correctly prevented from removing themselves");
    }

    // Test if an owner can unblock a non-blocked address.
    try {
        await sdk.unblockAddress(account.address, account2.address, 300000);
        console.error("Owner was able to unblock a non-blocked address");
    } catch (err) {
        console.log("Owner was correctly prevented from unblocking a non-blocked address");
    }
}

// Run tests
(async function() {
    try {
      await tests();
      console.log('All tests passed');
    } catch (error) {
      console.error(`Failed to run tests: ${error}`);
    }
  })();



