const Web3 = require('web3');
const fs = require('fs');

// Load PancakeSwap Router ABI from external file
const PANCAKE_ROUTER_ABI = JSON.parse(fs.readFileSync('pancake_router_abi.json', 'utf8'));

// Alchemy BSC Node (Replace with your Alchemy API URL)
const Alchemy_Node_API = "https://bsc-dataseed.binance.org/"; // Use BSC mainnet, not Ethereum
const web3 = new Web3(Alchemy_Node_API);

// Convert PancakeSwap Router to checksum format
const PANCAKESWAP_ROUTER = web3.utils.toChecksumAddress("0x10ED43C718714eb63d5aA57B78B54704E256024E");

// Token Addresses (Convert to checksum format)
// const TOKENS = {
//     FDUSD: web3.utils.toChecksumAddress("0xc5f0f7b66764f6ec8c8dff7ba683102295e16409"),
//     WBNB: web3.utils.toChecksumAddress("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"),
//     USDT: web3.utils.toChecksumAddress("0x55d398326f99059fF775485246999027B3197955"),
// };
const TOKENS = {
    FDUSD: web3.utils.toChecksumAddress("0xc5f0f7b66764f6ec8c8dff7ba683102295e16409"),
    WBNB: web3.utils.toChecksumAddress("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"),
    USDT: web3.utils.toChecksumAddress("0x55d398326f99059fF775485246999027B3197955"),
    ETH: web3.utils.toChecksumAddress("0x2170ed0880ac9a755fd29b2688956bd959f933f8"),
    BUSD: web3.utils.toChecksumAddress("0xe9e7cea3dedca5984780bafc599bd69add087d56"),
};


// Initialize PancakeSwap Router contract
const router = new web3.eth.Contract(PANCAKE_ROUTER_ABI, PANCAKESWAP_ROUTER);

// Function to get the price of a token against USDT
const getPrice = async (tokenAddress, baseToken = TOKENS.USDT) => {
    if (tokenAddress.toLowerCase() === baseToken.toLowerCase()) {
        return 1.0; // USDT is always 1 USDT
    }

    const amountIn = web3.utils.toWei('1', 'ether'); // 1 Token
    let path = [tokenAddress, baseToken];

    try {
        const amountsOut = await router.methods.getAmountsOut(amountIn, path).call();
        const price = web3.utils.fromWei(amountsOut[1], 'ether');
        return parseFloat(price);
    } catch (error) {
        console.log(`Direct price fetch failed for ${tokenAddress}, trying via WBNB...`);
    }

    // Try via WBNB if direct conversion fails
    try {
        path = [tokenAddress, TOKENS.WBNB, baseToken]; // Indirect route
        const amountsOut = await router.methods.getAmountsOut(amountIn, path).call();
        const price = web3.utils.fromWei(amountsOut[2], 'ether'); // Second step (WBNB → USDT)
        return parseFloat(price);
    } catch (error) {
        console.log(`Error getting price for ${tokenAddress}: ${error.message}`);
        return null;
    }
};

// Function to fetch prices for all tokens
const fetchPrices = async () => {
    const prices = {};
    const baseToken = TOKENS.USDT; // Use USDT as the base token

    for (const [token, address] of Object.entries(TOKENS)) {
        if (token === "USDT") continue; // Skip base token itself

        const price = await getPrice(address, baseToken);
        if (price !== null) {
            prices[`${token}-USDT`] = {
                price_token1: price,
                price_token2: 1.0, // USDT price is always 1.0
            };
        } else {
            prices[`${token}-USDT`] = "Error";
        }
    }

    return prices;
};

// Export the fetchPrices function
// module.exports = fetchPrices;
module.exports = { fetchPrices };
