const config = {
    // Alchemy WebSocket API endpoint
    ALCHEMY_WEBSOCKET_URL: "wss://eth-mainnet.g.alchemy.com/v2/AAQGx9Gpmx8MK3_JwUFCz61iS6YSbybi",
  
    // Smart contract address of the monitored DEX
    DEX_SMART_CONTRACT_ADDRESS: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  
    // Token pairs to monitor on PancakeSwap
    TOKEN_PAIRS: [
      ["FDUSD", "USDT"],
      ["PEPE", "USDT"],
      ["UNI", "USDT"],
      ["WBNB", "USDT"],
      ["ATOM", "USDT"]
    ],
  
    // PancakeSwap API endpoint (modify if needed based on data provider)
    PANCAKESWAP_API_URL: "https://pancakeswap.finance/info/token/",
  
    // Logging configuration
    LOG_FILE: "arbitrage.log",
  
    // WebSocket reconnection settings
    RECONNECT_DELAY: 1, // Delay in seconds before reconnecting to WebSocket
  
    // Threshold for arbitrage opportunity (minimum profit percentage required)
    MIN_PROFIT_PERCENT: 0.05 // Example: 0.5% minimum profit to consider an opportunity
  };
  
  module.exports = config;
  