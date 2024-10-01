const readline = require('readline');
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

// Usage example
(async () => {
    const answer = await getInput('Press "g" to generate key pair: ');
    if (answer.trim().toLowerCase() === 'g') {
        const key = ec.genKeyPair();
        const publicKey = key.getPublic('hex');
        const privateKey = key.getPrivate('hex');

        console.log();
        console.log('Private key:', privateKey);
        console.log();
        console.log('Public key:', publicKey);
    } else {
        console.log('Invalid input. Please press "g" to generate key pair.');
    }
})();
