const { ethers } = require("ethers");
require("dotenv").config();

// Set up your provider (Alchemy WebSocket in your case)
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_WS);

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

