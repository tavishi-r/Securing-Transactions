const readline = require('readline');

class PeerAlert {
    constructor(indices, cbc) {
        this.indices = indices;
        this.cbc = cbc;
    }

    process() {
        const disconnectedBlocks = [];

        for (const v of this.indices) {
            if (v >= 1) {
                disconnectedBlocks.push(v);
            }
        }

        console.log("Disconnected block numbers due to suspected double spending attacks:", disconnectedBlocks.join(', '));

        for (const v of this.indices) {
            this.cbc.pendingTransactions.splice(v, 1);

            if (v <= this.cbc.blockchain.length - 1) {
                this.cbc.blockchain[v + 1].precedingHash = null;
                this.cbc.blockchain.splice(v, 1);
            }

            for (let i = 0; i < this.indices.length; i++) {
                this.indices[i] -= 1;
            }
        }

        console.log("Blockchain updated after processing PeerAlert:", this.cbc);
        return this.cbc;
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
    // Get input for indices and cbc
    const indicesInput = await getInput('Enter indices (comma-separated): ');
    const indices = indicesInput.split(',').map(Number);
    const cbcInput = await getInput('Enter cbc: ');
    const cbc = JSON.parse(cbcInput); // Assuming cbc is a JSON string

    // Create an instance of PeerAlert with user input
    const peerAlert = new PeerAlert(indices, cbc);
    const updatedCbc = peerAlert.process();
    console.log('Updated CBC:', updatedCbc);
})();
