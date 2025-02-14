const WebSocket = require("ws");
const { ethers } = require("ethers");

// Alchemy WebSocket URL (replace with your API key)
const ALCHEMY_WS = "wss://eth-mainnet.alchemyapi.io/v2/mj1HI77hXcqgw0Oo6LHgfHSnpcRNH9de";

// DEX contract addresses to monitor (e.g., Uniswap Router V2)
const DEX_ADDRESSES = [
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap Router V2
  "0xd9e1CE17f2641F24aE83637ab66a2CCA9C378B9F", // SushiSwap Router
];

// ABI for swap functions (replace with the ABI of the DEX you're targeting)
const SWAP_ABI = [
  "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
  "function swapExactETHForTokens(uint256,address[],address,uint256)",
  "function swapExactTokensForETH(uint256,uint256,address[],address,uint256)",
];

// WebSocket connection
const ws = new WebSocket(ALCHEMY_WS);

// Create ethers Interface for decoding transactions
// const iface = new ethers.utils.Interface(SWAP_ABI);
const iface = new ethers.Interface(SWAP_ABI);

// Function to decode transaction data
const decodeTransaction = (txInput) => {
  try {
    return iface.parseTransaction({ data: txInput });
  } catch (error) {
    return null; // Ignore transactions that don't match the ABI
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
      console.log("Amount In:", ethers.formatUnits(amountIn, "ether"));

      // TODO: Add price fetching, simulate price impact, and compare DEX prices
    }
  }
});

ws.on("error", (err) => {
  console.error("WebSocket Error:", err.message);
});

ws.on("close", () => {
  console.log("WebSocket connection closed.");
});
