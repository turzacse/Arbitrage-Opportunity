const WebSocket = require("ws");
const { ethers } = require("ethers");
const axios = require("axios");

// Alchemy WebSocket URL (replace with your API key)
const ALCHEMY_WS = "wss://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de";

// DEX contract addresses to monitor (e.g., Uniswap Router V2)
const DEX_ADDRESSES = [
    "0x7a250d5630B4cF539739df2c5dAcB4c659F2488D", // Uniswap Router V2
    "0xd9e1ce17f2641f24Ae83637AB66a2CCA9C378B9F", // SushiSwap Router
];

// ABI for swap functions
const SWAP_ABI = [
    "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
    "function swapExactETHForTokens(uint256,address[],address,uint256)",
    "function swapExactTokensForETH(uint256,uint256,address[],address,uint256)",
];

// WebSocket connection
const ws = new WebSocket(ALCHEMY_WS);

// Create ethers Interface for decoding transactions
const iface = new ethers.utils.Interface(SWAP_ABI);

// Function to decode transaction data
const decodeTransaction = (txInput) => {
    try {
        return iface.parseTransaction({ data: txInput });
    } catch (error) {
        return null; // Ignore transactions that don't match the ABI
    }
};

// Fetch token prices from a DEX or CoinGecko
const fetchTokenPrice = async (tokenAddress) => {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum`, {
            params: { contract_addresses: tokenAddress, vs_currencies: "usd" },
        });
        return response.data[tokenAddress.toLowerCase()]?.usd || 0;
    } catch (err) {
        console.error(`Error fetching price for token ${tokenAddress}:`, err.message);
        return 0;
    }
};

// Simulate price impact (simplified formula)
const simulatePriceImpact = (tradeSize, liquidity) => {
    // return (tradeSize / liquidity) * BigInt(100); // Approximate percentage impact
    return (BigInt(tradeSize) / BigInt(liquidity)) * BigInt(100);
};

// Handle incoming messages from Alchemy mempool
ws.on("open", () => {
    console.log("Connected to Alchemy mempool...");

    // Subscribe to pending transactions for DEX addresses
    DEX_ADDRESSES.forEach((address) => {
        ws.send(
            JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "eth_subscribe",
                params: [
                    "alchemy_pendingTransactions",
                    { toAddress: address.toLowerCase() }, // Monitor transactions sent to DEX
                ],
            })
        );
    });
});

ws.on("message", async (data) => {
    const tx = JSON.parse(data);

    // Check if the transaction has `input` data (indicates a contract interaction)
    if (tx.params && tx.params.result && tx.params.result.input) {
        const decoded = decodeTransaction(tx.params.result.input);
        if (decoded) {
            console.log("Decoded Swap Transaction:", decoded);

            const { args } = decoded; // Extract swap parameters
            const [amountIn, amountOutMin, path, recipient, deadline] = args;

            console.log("Input Token:", path[0]);
            console.log("Output Token:", path[path.length - 1]);
            console.log("Amount In (Wei):", amountIn.toString());

            // Fetch token prices
            const inputPrice = await fetchTokenPrice(path[0]);
            const outputPrice = await fetchTokenPrice(path[path.length - 1]);

            if (inputPrice && outputPrice) {
                console.log(`Input Token Price: $${inputPrice}`);
                console.log(`Output Token Price: $${outputPrice}`);

                // Calculate price impact (example: use mock liquidity for now)
                const liquidity = ethers.utils.parseEther("100000"); // Mock liquidity
                const priceImpact = simulatePriceImpact(amountIn, liquidity);

                console.log(`Price Impact: ${priceImpact}%`);

                // Arbitrage logic: compare prices between DEXs
                const potentialProfit = outputPrice - inputPrice;
                if (potentialProfit > 0) {
                    console.log("Arbitrage Opportunity Found!");
                    console.log(`Potential Profit: $${potentialProfit.toFixed(2)}`);

                    // TODO: Execute arbitrage trade
                    // - Construct transaction
                    // - Use ethers.js to send with higher gas fee
                }
            }
        }
    }
});

ws.on("error", (err) => {
    console.error("WebSocket Error:", err.message);
});

ws.on("close", () => {
    console.log("WebSocket connection closed.");
});
