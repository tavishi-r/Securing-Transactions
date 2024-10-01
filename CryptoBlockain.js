const readline = require('readline');
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transaction for other wallets.');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) {
            console.log("1");
            return true;
        }

        if (this.signature.length === 0) {
            throw new Error('No signature in this transaction.');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        console.log("\nNew Transaction");
        console.log("\nThe signature is: " + this.signature);
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

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

// Usage example
(async () => {
    const fromAddress = await getInput('Enter sender address: ');
    const toAddress = await getInput('Enter recipient address: ');
    const amount = await getInput('Enter transaction amount: ');

    const transaction = new Transaction(fromAddress, toAddress, amount);
    console.log('Transaction created:', transaction);
})();
