const Web3 = require('web3');
const fs = require('fs');

// Alchemy WebSocket URL (Replace with your own)
const ALCHEMY_WSS_URL = "https://eth-mainnet.g.alchemy.com/v2/AAQGx9Gpmx8MK3_JwUFCz61iS6YSbybi";

// Web3 instance
const web3 = new Web3(new Web3.providers.WebsocketProvider(ALCHEMY_WSS_URL));

// Function to get a transaction hash from the mempool based on the token pair
const getTransactionHash = async (token1, token2, buyPrice, sellPrice) => {
    try {
        const pendingTxFilter = web3.eth.subscribe('pendingTransactions');

        pendingTxFilter.on('data', async (txHash) => {
            try {
                const tx = await web3.eth.getTransaction(txHash);

                if (!tx) {
                    return; // Skip if transaction details are missing
                }

                // Extract transaction input data (function call, parameters, etc.)
                const txInput = tx.input;

                // Decode input data if interacting with a router (like PancakeSwap)
                if (tx.to && tx.to.toLowerCase() === "0x1111111254EEB25477B68fb85Ed929f73A960582".toLowerCase()) { // Replace with your DEX router address
                    const decodedData = await decodeTransactionInput(txInput);

                    // Ensure it's a swap involving the tokens in question
                    if (decodedData && decodedData.params && decodedData.params.path) {
                        const path = decodedData.params.path;
                        if (path.includes(token1.toLowerCase()) && path.includes(token2.toLowerCase())) {
                            console.log(`[INFO] Matching pending transaction found: ${txHash}`);
                            return txHash; // Return the real transaction hash
                        }
                    }
                }
            } catch (error) {
                console.log(`[ERROR] Error processing transaction: ${error.message}`);
            }
        });
    } catch (error) {
        console.log(`[ERROR] Error fetching transaction hash: ${error.message}`);
    }

    return null; // Return null if no matching transaction is found
};

// Function to decode transaction input data (Assumes Uniswap/PancakeSwap ABI is available)
const decodeTransactionInput = async (inputData) => {
    try {
        const routerAbi = JSON.parse(fs.readFileSync("router_abi.json", "utf8")); // Load DEX router ABI
        const routerContract = new web3.eth.Contract(routerAbi, "0x1111111254EEB25477B68fb85Ed929f73A960582"); // Replace with DEX router address
        const decoded = routerContract.methods.decodeFunctionInput(inputData);
        return decoded;
    } catch (error) {
        console.log(`[ERROR] Failed to decode transaction input: ${error.message}`);
        return null;
    }
};

// Usage example:
const token1 = "0xToken1Address";  // Replace with actual token1 address
const token2 = "0xToken2Address";  // Replace with actual token2 address
const buyPrice = 100;  // Define buy price (if needed)
const sellPrice = 90;  // Define sell price (if needed)

getTransactionHash(token1, token2, buyPrice, sellPrice);
