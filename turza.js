const WebSocket = require("ws");
const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

// Alchemy WebSocket URL
const ALCHEMY_WS = process.env.ALCHEMY_WS;

// Ethereum provider for signing transactions
const provider = new ethers.providers.WebSocketProvider(ALCHEMY_WS);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// DEX contract addresses to monitor
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

// Fetch token prices from CoinGecko
const fetchTokenPrice = async (tokenAddress) => {
    try {
        const response = await axios.get(process.env.COINGECKO , {
            params: { contract_addresses: tokenAddress, vs_currencies: "usd" },
        });
        return response.data[tokenAddress.toLowerCase()]?.usd || 0;
    } catch (err) {
        console.error(`Error fetching price for token ${tokenAddress}:`, err.message);
        return 0;
    }
};


// Function to fetch liquidity for a token
const fetchLiquidity = async (tokenAddress) => {
    try {
        const query = `
        {
          pools(where: { token0: "${tokenAddress.toLowerCase()}" }) {
            liquidity
            token0 {
              symbol
            }
            token1 {
              symbol
            }
          }
        }`;
        const response = await axios.post("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", { query });
        const pools = response.data.data?.pools;

        if (pools && pools.length > 0) {
            const liquidity = ethers.utils.parseEther(pools[0].liquidity.toString());
            console.log(`Liquidity for token ${tokenAddress}:`, liquidity.toString());
            return liquidity;
        } else {
            console.warn(`No liquidity data found for token ${tokenAddress}`);
            return ethers.utils.parseEther("0");
        }
    } catch (error) {
        console.error(`Error fetching liquidity for token ${tokenAddress}:`, error.message);
        return ethers.utils.parseEther("0");
    }
};


// Estimate gas fees
const estimateGas = async (transaction) => {
    const gasEstimate = await provider.estimateGas(transaction);
    const gasPrice = await provider.getGasPrice();
    const totalGasCost = gasEstimate.mul(gasPrice);
    console.log("Estimated Gas Fee (ETH):", ethers.utils.formatEther(totalGasCost));
    return totalGasCost;
};

// Execute arbitrage trade
const executeTrade = async (transaction, wallet) => {
    try {
        const gasEstimate = await provider.estimateGas(transaction);
        const gasPrice = await provider.getGasPrice();
        const totalGasCost = await estimateGas(transaction);

        const hasFunds = await checkFunds(wallet.address, gasEstimate, gasPrice);
        if (!hasFunds) {
            console.log("Skipping trade due to insufficient funds.");
            return;
        }

        // Send transaction
        const tx = await wallet.sendTransaction(transaction);
        await tx.wait();
        console.log("Trade executed:", tx.hash);
    } catch (error) {
        console.error("Error executing trade:", error.message);
    }
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
                    { toAddress: address.toLowerCase() },
                ],
            })
        );
    });
});

ws.on("message", async (data) => {
    const tx = JSON.parse(data);

    if (tx.params && tx.params.result && tx.params.result.input) {
        const decoded = decodeTransaction(tx.params.result.input);
        if (decoded) {
            console.log("Decoded Swap Transaction:", decoded);

            const { args } = decoded;
            const [amountIn, amountOutMin, path, recipient, deadline] = args;

            console.log("Input Token:", path[0]);
            console.log("Output Token:", path[path.length - 1]);
            console.log("Amount In (Wei):", amountIn.toString());

            // Fetch real liquidity data
            const liquidity = await fetchLiquidity(path[0]);
            if (!liquidity) return;
            console.log("Liquidity:", liquidity);

            // Fetch token prices
            const inputPrice = await fetchTokenPrice(path[0]);
            const outputPrice = await fetchTokenPrice(path[path.length - 1]);

            if (inputPrice && outputPrice) {
                console.log(`Input Token Price: $${inputPrice}`);
                console.log(`Output Token Price: $${outputPrice}`);

                // Calculate potential profit
                const potentialProfit = outputPrice - inputPrice;
                const priceImpact = (amountIn / liquidity) * 100;
                console.log(`Price Impact: ${priceImpact}%`);

                if (potentialProfit > 0) {
                    console.log("Arbitrage Opportunity Found!");
                    console.log(`Potential Profit: $${potentialProfit.toFixed(2)}`);

                    // Estimate gas fees
                    const txData = {
                        to: path[path.length - 1],
                        value: amountIn,
                        gasLimit: 21000, // Adjust as needed
                    };
                    const gasFees = await estimateGas(txData);

                    console.log("Gas Fees (Wei):", gasFees.toString());

                    // Execute trade if profitable
                    if (potentialProfit > parseFloat(ethers.utils.formatEther(gasFees))) {
                        console.log("Executing trade...");
                        await executeTrade(txData);
                    } else {
                        console.log("Not profitable after gas fees.");
                    }
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