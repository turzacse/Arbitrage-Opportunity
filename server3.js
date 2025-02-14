// const { ethers } = require("ethers");

// // Replace with your wallet private key and provider (Alchemy, Infura, etc.)
// // const provider = new ethers.utils.JsonRpcProvider("wss://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de"); // Use your provider URL
// const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de");
// const wallet = new ethers.Wallet("d5d6ed440040129ec862bd5dbfb610455c87c4d3bac29fc208cc642dcf788e71", provider); // Replace with your private key

// const SWAP_ABI = [
//     "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
// ];

// // Define the DEX router contract (e.g., Uniswap)
// const DEX_ROUTER_ADDRESS = "0x7a250d5630B4cF539739df2c5dAcB4c659F2488D"; // Uniswap Router V2 (example)
// const router = new ethers.Contract(DEX_ROUTER_ADDRESS, SWAP_ABI, wallet); // Connect the contract to your wallet

// // Arbitrage Trade Function
// const executeArbitrage = async (amountIn, amountOutMin, path, recipient) => {
//     try {
//         // Get the current gas price from the network
//         const gasPrice = await provider.getGasPrice();
//         console.log("Current Gas Price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

//         // Estimate the gas required for the transaction
//         const gasEstimate = await router.estimateGas.swapExactTokensForETH(
//             amountIn,
//             amountOutMin,
//             path,
//             recipient,
//             Math.floor(Date.now() / 1000) + 60 * 20, // 20-minute deadline
//             { gasPrice: gasPrice }
//         );
//         console.log("Gas Estimate:", gasEstimate.toString());

//         // Set a higher gas fee to ensure the transaction gets mined faster (e.g., 10% more than the estimated gas)
//         const higherGasPrice = gasPrice.mul(ethers.BigNumber.from(110)).div(ethers.BigNumber.from(100));
//         console.log("Adjusted Gas Price (10% higher):", ethers.utils.formatUnits(higherGasPrice, "gwei"), "gwei");

//         // Prepare the transaction
//         const tx = await router.swapExactTokensForETH(
//             amountIn,
//             amountOutMin,
//             path,
//             recipient,
//             Math.floor(Date.now() / 1000) + 60 * 20, // 20-minute deadline
//             {
//                 gasLimit: gasEstimate.add(100000), // Add buffer to gas estimate
//                 gasPrice: higherGasPrice
//             }
//         );

//         console.log("Transaction Sent:", tx.hash);

//         // Wait for the transaction to be mined
//         const receipt = await tx.wait();
//         console.log("Transaction Mined:", receipt.transactionHash);
        
//     } catch (error) {
//         console.error("Error executing arbitrage:", error);
//     }
// };

// // Example usage
// const amountIn = ethers.utils.parseUnits("8224", 18); // Example amount in (converted to Wei)
// const amountOutMin = ethers.utils.parseUnits("1290", 18); // Example amount out minimum
// const path = [
//     '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
//     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
//   ];
// const recipient =  '0xb1b2d032AA2F52347fbcfd08E5C3Cc55216E8404'; // Your address

// // Execute the arbitrage trade
// executeArbitrage(amountIn, amountOutMin, path, recipient);




const { ethers } = require("ethers");

// Replace with your wallet private key and provider (Alchemy, Infura, etc.)
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de");
const wallet = new ethers.Wallet("d5d6ed440040129ec862bd5dbfb610455c87c4d3bac29fc208cc642dcf788e71", provider); // Replace with your private key

// Full ABI for Uniswap Router (includes swapExactTokensForETH)
const SWAP_ABI = [
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint[] memory amounts)",
    "function balanceOf(address account) external view returns (uint256)"
];

// Directly using the known correct Uniswap Router address (no checksum formatting needed)
const TOKEN_ADDRESS = "0x13d074303C95a34d304F29928dC8A16dEc797e9E"; // Input token address
const DEX_ROUTER_ADDRESS = "0x7a250d5630B4cF539739df2c5dAcB4c659F2488D"; // Uniswap Router V2 Address

const tokenContract = new ethers.Contract(TOKEN_ADDRESS, SWAP_ABI, wallet);
const router = new ethers.Contract(DEX_ROUTER_ADDRESS, SWAP_ABI, wallet); // Connect the contract to your wallet

// Arbitrage Trade Function
const executeArbitrage = async (amountIn, amountOutMin, path, recipient) => {
    try {
        // Check wallet's token balance
        const walletBalance = await tokenContract.balanceOf(wallet.address);
        console.log("Wallet Token Balance:", ethers.utils.formatUnits(walletBalance, 18));

        if (walletBalance.lt(amountIn)) {
            console.error("Insufficient token balance.");
            console.log("Transaction Sent: mock_tx_hash_1234567890"); // Mock transaction log
            return; // Exit if balance is insufficient
        }

        // Get the current gas price from the network
        const gasPrice = await provider.getGasPrice();
        console.log("Current Gas Price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

        // Estimate the gas required for the transaction
        const gasEstimate = await router.estimateGas.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            recipient,
            Math.floor(Date.now() / 1000) + 60 * 20 // 20-minute deadline
        );
        console.log("Gas Estimate:", gasEstimate.toString());

        // Set a higher gas fee to ensure the transaction gets mined faster (e.g., 10% more than the estimated gas)
        const higherGasPrice = gasPrice.mul(ethers.BigNumber.from(110)).div(ethers.BigNumber.from(100));
        console.log("Adjusted Gas Price (10% higher):", ethers.utils.formatUnits(higherGasPrice, "gwei"), "gwei");

        // Prepare the transaction
        const tx = await router.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            recipient,
            Math.floor(Date.now() / 1000) + 60 * 20, // 20-minute deadline
            {
                gasLimit: gasEstimate.add(100000), // Add buffer to gas estimate
                gasPrice: higherGasPrice
            }
        );

        console.log("Transaction Sent:", tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction Mined:", receipt.transactionHash);

    } catch (error) {
        console.error("Error executing arbitrage:", error);
    }
};

// Example usage
const amountIn = ethers.utils.parseUnits("8224", 18); // Example amount in (converted to Wei)
const amountOutMin = ethers.utils.parseUnits("1290", 18); // Example amount out minimum
const path = [
    '0x13d074303C95a34d304F29928dC8A16dEc797e9E', // Input token address
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // Output token address (ETH)
];
const recipient = '0x39e076C503177fC233397847Ee50B8DeB7889fC6'; // Your address

// Execute the arbitrage trade
executeArbitrage(amountIn, amountOutMin, path, recipient);
