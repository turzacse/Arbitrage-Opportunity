# Finding Arbitrage Opportunities Using Alchemy Mempools

This guide explains how to use Alchemy mempools to monitor pending transactions and find arbitrage opportunities before they are confirmed on-chain.

---

## 1. Understanding Mempools & Alchemy's Role
- The **mempool** (memory pool) is where unconfirmed transactions wait before they are included in a block.
- **Alchemy's Enhanced API** provides access to pending transactions, allowing you to anticipate price changes across DEXs before they happen.

---

## 2. Steps to Identify Arbitrage Using Alchemy Mempools

### A. Connect to Alchemy Mempool API
Use Alchemy’s Ethereum Pending Transactions WebSockets to get real-time updates:

```javascript
const WebSocket = require('ws');

const alchemyWs = "wss://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY";
const ws = new WebSocket(alchemyWs);

ws.on("open", () => {
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_subscribe",
    params: ["alchemy_pendingTransactions", { toAddress: "DEX_CONTRACT_ADDRESS" }]
  }));
});

ws.on("message", (data) => {
  const tx = JSON.parse(data);
  console.log("Pending TX:", tx);
});
