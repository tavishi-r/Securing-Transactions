const readline = require('readline');
const { CryptoBlockchain, CryptoBlock, Transaction } = require('./CryptoBlockchain');
const { NetworkObserver } = require('./NetworkObserver');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Helper function to get input from the user
function getInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

(async () => {
    const myPrivateKey = await getInput('Enter your private key: ');
    const key1PrivateKey = await getInput('Enter private key for address 1: ');
    const key2PrivateKey = await getInput('Enter private key for address 2: ');

    const myKey = ec.keyFromPrivate(myPrivateKey);
    const key1 = ec.keyFromPrivate(key1PrivateKey);
    const key2 = ec.keyFromPrivate(key2PrivateKey);

    const myWalletAddress = myKey.getPublic('hex');
    const address1 = key1.getPublic('hex');
    const address2 = key2.getPublic('hex');

    function fetchAddress() {
        const key = ec.genKeyPair();
        const publicKey = key.getPublic('hex');
        return publicKey;
    }

    const recv_address = fetchAddress();
    const new_address = fetchAddress();

    global.smashingCoin = new CryptoBlockchain();

    const sendAddr = [address2, myWalletAddress, myWalletAddress, address1];
    const recvAddr = [fetchAddress(), recv_address, new_address, fetchAddress()];

    const tx3 = new Transaction(address2, fetchAddress(), 3);
    tx3.signTransaction(key2);
    global.smashingCoin.addTransaction(tx3);

    const tx1 = new Transaction(myWalletAddress, recv_address, 10);
    tx1.signTransaction(myKey);
    global.smashingCoin.addTransaction(tx1);

    const dsa_tx = new Transaction(myWalletAddress, new_address, 10);
    dsa_tx.signTransaction(myKey);
    global.smashingCoin.addTransaction(dsa_tx);

    const tx2 = new Transaction(address1, fetchAddress(), 5);
    tx2.signTransaction(key1);
    global.smashingCoin.addTransaction(tx2);

    console.log("\nThe current blockchain is:");
    console.log(global.smashingCoin);

    console.log("\nStarting the miner...");

    for (const addr of sendAddr) {
        global.smashingCoin.minePendingTransactions(addr);
    }

    const ne = new NetworkObserver(global.smashingCoin.pendingTransactions, global.smashingCoin);

    ne.getRecords(sendAddr);
    console.log("\nThe current blockchain is:");
    console.log(global.smashingCoin);

    for (const block of global.smashingCoin.blockchain) {
        if (block.precedingHash == null) {
            global.smashingCoin.blockchain.splice(global.smashingCoin.blockchain.indexOf(block), 1);
            const cb = new CryptoBlock(0, Date.now(), "0");
            global.smashingCoin.blockchain.push(cb);
        }
    }

    console.log("Current blockchain is:", global.smashingCoin);

    console.log("\nPerforming Transactions:");
    console.log("Current balance of address ", address2, "is: " + global.smashingCoin.getBalanceOfAddress(address2));
    console.log("Current balance of address ", address1, "is: " + global.smashingCoin.getBalanceOfAddress(address1));
})();
