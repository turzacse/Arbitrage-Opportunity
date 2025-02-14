// const { ethers } = require("ethers");

// // Manually set the pairAddress and provider
// const pairAddress = "0x5C69bEe701ef814a2B6a3EDD8b8b4a4d7f1c30B1"; // Example Uniswap pair address (WETH/USDT on Ethereum)
// const network = "ethereum"; // Can be "ethereum" or "bsc" (Binance Smart Chain)

// // Alchemy WebSocket URLs
// const NETWORKS = {
//   ethereum: "https://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de", // Use the RPC URL for Ethereum
//   bsc: "https://bsc-dataseed.binance.org/", // Binance Smart Chain RPC URL (if you're using BSC)
// };

// // Ensure NETWORKS[network] is valid before creating the provider
// if (!NETWORKS[network]) {
//   console.error("Invalid network selected");
//   process.exit(1); // Exit the process if network is invalid
// }

// const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);

// // Fetch liquidity function
// const fetchLiquidity = async (pairAddress, provider) => {
//   try {
//     // Log the original address and apply checksum
//     console.log(`Original Address: ${pairAddress}`);
//     const formattedPairAddress = ethers.utils.getAddress(pairAddress);
//     console.log(`Formatted Pair Address: ${formattedPairAddress}`);

//     const abi = [
//       "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
//     ];
//     const pairContract = new ethers.Contract(formattedPairAddress, abi, provider);

//     console.log(`Fetching reserves for pair ${formattedPairAddress}...`);

//     const [reserve0, reserve1] = await pairContract.getReserves();

//     // Log the raw reserve values to inspect them
//     console.log(`Raw Reserves for ${formattedPairAddress}:`, reserve0.toString(), reserve1.toString());

//     const formattedReserve0 = ethers.utils.formatEther(reserve0);
//     const formattedReserve1 = ethers.utils.formatEther(reserve1);

//     // Log the formatted reserves
//     console.log(`Formatted Reserves for ${formattedPairAddress}:`, formattedReserve0, formattedReserve1);

//     return {
//       reserve0: formattedReserve0,
//       reserve1: formattedReserve1,
//     };
//   } catch (error) {
//     console.error(`Error fetching liquidity for pair ${pairAddress}:`, error.message);
//     return null;
//   }
// };

// // Manually call the function with the provided data
// fetchLiquidity(pairAddress, provider);



const { ethers } = require("ethers");

// Set up your provider (Alchemy WebSocket in your case)
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de");

// Uniswap V2 pair ABI
const IUniswapV2PairABI = [
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
];

// Example pair address (for ETH/USDT pair on Uniswap)
const pairAddress = "0x4e38a3A8BfA9C37cE4E3081E4ddFf44170886289"; // Replace with actual pair address

// Set up the contract
const uniswapPairContract = new ethers.Contract(pairAddress, IUniswapV2PairABI, provider);

// Check contract existence
async function checkContractExistence() {
    try {
        const code = await provider.getCode(pairAddress);
        if (code === "0x") {
            console.log("No contract code found at the given address");
        } else {
            console.log("Contract code found at the given address");
        }
    } catch (error) {
        console.error("Error checking contract existence:", error.message);
    }
}

async function fetchLiquidity() {
    try {
        const reserves = await uniswapPairContract.getReserves();
        const reserve0 = ethers.utils.formatUnits(reserves[0], 18); // Token 0 liquidity
        const reserve1 = ethers.utils.formatUnits(reserves[1], 18); // Token 1 liquidity
        console.log(`Liquidity for token 0: ${reserve0}`);
        console.log(`Liquidity for token 1: ${reserve1}`);
    } catch (error) {
        console.error("Error fetching liquidity:", error);
    }
}

// Check contract existence first
checkContractExistence().then(() => {
    fetchLiquidity();
});

