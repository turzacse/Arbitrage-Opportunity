// const Web3 = require('web3');
// const fs = require('fs');

// // Alchemy WebSocket URL (Replace with your own)
// const ALCHEMY_WSS_URL = "https://eth-mainnet.g.alchemy.com/v2/AAQGx9Gpmx8MK3_JwUFCz61iS6YSbybi";

// // Web3 instance
// const web3 = new Web3(new Web3.providers.WebsocketProvider(ALCHEMY_WSS_URL));

// // Function to get a transaction hash from the mempool based on the token pair
// const getTransactionHash = async (token1, token2, buyPrice, sellPrice) => {
//     try {
//         const pendingTxFilter = web3.eth.subscribe('pendingTransactions');

//         pendingTxFilter.on('data', async (txHash) => {
//             try {
//                 const tx = await web3.eth.getTransaction(txHash);

//                 if (!tx) {
//                     return; // Skip if transaction details are missing
//                 }

//                 // Extract transaction input data (function call, parameters, etc.)
//                 const txInput = tx.input;

//                 // Decode input data if interacting with a router (like PancakeSwap)
//                 if (tx.to && tx.to.toLowerCase() === "0x1111111254EEB25477B68fb85Ed929f73A960582".toLowerCase()) { // Replace with your DEX router address
//                     const decodedData = await decodeTransactionInput(txInput);

//                     // Ensure it's a swap involving the tokens in question
//                     if (decodedData && decodedData.params && decodedData.params.path) {
//                         const path = decodedData.params.path;
//                         if (path.includes(token1.toLowerCase()) && path.includes(token2.toLowerCase())) {
//                             console.log(`[INFO] Matching pending transaction found: ${txHash}`);
//                             return txHash; // Return the real transaction hash
//                         }
//                     }
//                 }
//             } catch (error) {
//                 console.log(`[ERROR] Error processing transaction: ${error.message}`);
//             }
//         });
//     } catch (error) {
//         console.log(`[ERROR] Error fetching transaction hash: ${error.message}`);
//     }

//     return null; // Return null if no matching transaction is found
// };

// // Function to decode transaction input data (Assumes Uniswap/PancakeSwap ABI is available)
// const decodeTransactionInput = async (inputData) => {
//     try {
//         const routerAbi = JSON.parse(fs.readFileSync("router_abi.json", "utf8")); // Load DEX router ABI
//         const routerContract = new web3.eth.Contract(routerAbi, "0x1111111254EEB25477B68fb85Ed929f73A960582"); // Replace with DEX router address
//         const decoded = routerContract.methods.decodeFunctionInput(inputData);
//         return decoded;
//     } catch (error) {
//         console.log(`[ERROR] Failed to decode transaction input: ${error.message}`);
//         return null;
//     }
// };

// // Usage example:
// const token1 = "0xc5f0f7b66764f6ec8c8dff7ba683102295e16409";  // Replace with actual token1 address
// const token2 = "0xe9e7cea3dedca5984780bafc599bd69add087d56";  // Replace with actual token2 address
// const buyPrice = 0.9761751266809685;  // Define buy price (if needed)
// const sellPrice = 1;  // Define sell price (if needed)

// getTransactionHash(token1, token2, buyPrice, sellPrice);





const Web3 = require('web3');
const fs = require('fs');

// Alchemy WebSocket URL (Replace with your own valid WebSocket URL)
const ALCHEMY_WSS_URL = "wss://eth-mainnet.g.alchemy.com/v2/AAQGx9Gpmx8MK3_JwUFCz61iS6YSbybi";

// Web3 instance
const web3 = new Web3(new Web3.providers.WebsocketProvider(ALCHEMY_WSS_URL));

// Function to decode transaction input data
const decodeTransactionInput = (inputData) => {
    try {
        const routerAbi = JSON.parse(fs.readFileSync("pancake_router_abi.json", "utf8")); // Load ABI
        const routerContract = new web3.eth.Contract(routerAbi, "0x1111111254EEB25477B68fb85Ed929f73A960582");
        const decoded = routerContract.methods.decodeFunctionInput(inputData);
        return decoded;
    } catch (error) {
        console.log(`[ERROR] Failed to decode transaction input: ${error.message}`);
        return null;
    }
};

// Function to listen for pending transactions and find matches
const listenToPendingTransactions = (token1, token2) => {
    const subscription = web3.eth.subscribe("pendingTransactions", (error) => {
        if (error) {
            console.log(`[ERROR] Subscription error: ${error.message}`);
            return;
        }
    });

    subscription.on("data", async (txHash) => {
        try {
            // Fetch transaction details
            const tx = await web3.eth.getTransaction(txHash);

            if (!tx) return; // Skip if transaction is null

            // Log basic transaction details (debugging purposes)
            console.log(`[INFO] Processing transaction: ${txHash}`);

            // Check if transaction interacts with the router
            if (tx.to && tx.to.toLowerCase() === "0x1111111254EEB25477B68fb85Ed929f73A960582".toLowerCase()) {
                const decodedData = decodeTransactionInput(tx.input);

                if (decodedData && decodedData.params && decodedData.params.path) {
                    const path = decodedData.params.path.map((address) => address.toLowerCase());
                    if (path.includes(token1.toLowerCase()) && path.includes(token2.toLowerCase())) {
                        console.log(`[MATCH] Found a matching transaction: ${txHash}`);
                    }
                }
            }
        } catch (error) {
            console.log(`[ERROR] Error processing transaction: ${error.message}`);
        }
    });

    subscription.on("error", (error) => {
        console.log(`[ERROR] Subscription error: ${error.message}`);
    });
};

// Start listening for transactions
const token1 = "0xc5f0f7b66764f6ec8c8dff7ba683102295e16409"; // Replace with actual token1 address
const token2 = "0xe9e7cea3dedca5984780bafc599bd69add087d56"; // Replace with actual token2 address

console.log("[INFO] Starting to listen for pending transactions...");
listenToPendingTransactions(token1, token2);
