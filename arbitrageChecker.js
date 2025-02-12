// const { TOKEN_PAIRS, MIN_PROFIT_PERCENT } = require("./config");
// const { fetchPrices } = require("./price_fetcher");
// const {logMessage} = require("./logger");

// // Function to calculate profit percentage
// function calculateProfit(buyPrice, sellPrice) {
//   // Ensure prices are reasonable (non-zero, non-negative)
//   if (!buyPrice || !sellPrice || buyPrice <= 0 || sellPrice <= 0) {
//     return 0; // Return 0 profit if prices are invalid
//   }

//   // Apply a maximum profit threshold to prevent huge values
//   if (sellPrice > 1000) { // Arbitrary threshold to cap unreasonable values
//     return 0;
//   }

//   return ((sellPrice - buyPrice) / buyPrice) * 100;
// }

// // Function to check for arbitrage opportunities
// async function checkArbitrage() {
//   // Fetch the latest prices for the monitored token pairs
//   const prices = await fetchPrices();
//   if (!prices || Object.keys(prices).length === 0) {
//     logMessage("[INFO] No prices available to check for arbitrage opportunities.");
//     return;
//   }

//   // Log start of the search process
//   logMessage("[INFO] Searching for arbitrage opportunities...");

//   // Check each token pair for arbitrage opportunities
//   for (const [pair, priceData] of Object.entries(prices)) {
//     if (!Array.isArray(pair) || pair.length !== 2) {
//       logMessage(`[WARNING] Skipping invalid pair: ${pair}`);
//       continue;
//     }

//     const [token1, token2] = pair;

//     if (!priceData || typeof priceData !== "object" || !priceData.price_token1 || !priceData.price_token2) {
//       logMessage(`[WARNING] Skipping invalid price data for pair: ${pair}`);
//       continue;
//     }

//     const buyPrice = priceData.price_token1;
//     const sellPrice = priceData.price_token2;

//     // Skip if either price is unrealistic
//     if (buyPrice <= 0 || sellPrice <= 0) {
//       logMessage(`[ERROR] Skipping invalid price data: ${token1} Buy=${buyPrice}, ${token2} Sell=${sellPrice}`);
//       continue;
//     }

//     // Calculate potential profit for the opportunity
//     const profit = calculateProfit(buyPrice, sellPrice);

//     // If the profit is greater than or equal to the minimum threshold, log the opportunity
//     if (profit >= MIN_PROFIT_PERCENT) {
//       logMessage("[ALERT] Arbitrage Opportunity Found!");
//       logMessage("-------------------------------------");
//       logMessage(`Token Pair: ${token1}/${token2}`);
//       logMessage(
//         `Opportunity: Buy ${token1} at ${buyPrice} on PancakeSwap, Sell at ${sellPrice} via pending transaction on UniSwap`
//       );
//       logMessage(`Potential Profit: ${profit.toFixed(2)}%`);
//       logMessage("[INFO] Monitoring for more opportunities...");
//     }
//   }
// }

// // Function to continuously run arbitrage checks at regular intervals
// function startPeriodicCheck(interval = 60) {
//   setInterval(() => {
//     checkArbitrage();
//   }, interval * 1000); // Convert interval from seconds to milliseconds
// }

// // Start the arbitrage checker when the script is run directly
// if (require.main === module) {
//   startPeriodicCheck(); // Start the arbitrage checker with a periodic interval (default is 60 seconds)
// }

// // module.exports = startPeriodicCheck;
// module.exports = { startPeriodicCheck };





const { TOKEN_PAIRS, MIN_PROFIT_PERCENT } = require("./config");
const { fetchPrices } = require("./price_fetcher");
const { logMessage } = require("./logger");

// Function to calculate profit percentage
function calculateProfit(buyPrice, sellPrice) {
  // Ensure prices are reasonable (non-zero, non-negative)
  if (!buyPrice || !sellPrice || buyPrice <= 0 || sellPrice <= 0) {
    return 0; // Return 0 profit if prices are invalid
  }

  // Apply a maximum profit threshold to prevent huge values
  if (sellPrice > 1000) { // Arbitrary threshold to cap unreasonable values
    return 0;
  }

  return ((sellPrice - buyPrice) / buyPrice) * 100;
}

// Function to check for arbitrage opportunities
async function checkArbitrage() {
  // Fetch the latest prices for the monitored token pairs
  const prices = await fetchPrices();
  if (!prices || Object.keys(prices).length === 0) {
    logMessage("[INFO] No prices available to check for arbitrage opportunities.");
    return;
  }

  // Log start of the search process
  logMessage("[INFO] Searching for arbitrage opportunities...");

  // Check each token pair for arbitrage opportunities
  for (const [pair, priceData] of Object.entries(prices)) {
    let tokens = pair;

    // If pair is a string like 'FDUSD-USDT', replace the hyphen with a slash
    if (typeof pair === "string") {
      tokens = pair.replace('-', '/').split('/');  // Create a new tokens array
    }

    // If tokens is not an array with exactly 2 elements, skip it
    if (!Array.isArray(tokens) || tokens.length !== 2) {
      logMessage(`[WARNING] Invalid pair format (not 'token1/token2'): ${pair}`);
      continue;
    }

    const [token1, token2] = tokens;

    if (!priceData || typeof priceData !== "object" || !priceData.price_token1 || !priceData.price_token2) {
      logMessage(`[WARNING] Skipping invalid price data for pair: ${pair}`);
      continue;
    }

    const buyPrice = priceData.price_token1;
    const sellPrice = priceData.price_token2;

    // Skip if either price is unrealistic
    if (buyPrice <= 0 || sellPrice <= 0) {
      logMessage(`[ERROR] Skipping invalid price data: ${token1} Buy=${buyPrice}, ${token2} Sell=${sellPrice}`);
      continue;
    }

    // Calculate potential profit for the opportunity
    const profit = calculateProfit(buyPrice, sellPrice);

    // If the profit is greater than or equal to the minimum threshold, log the opportunity
    if (profit >= MIN_PROFIT_PERCENT) {
      logMessage("[ALERT] Arbitrage Opportunity Found!");
      logMessage("-------------------------------------");
      logMessage(`Token Pair: ${token1}/${token2}`);
      logMessage(
        `Opportunity: Buy ${token1} at ${buyPrice} on PancakeSwap, Sell at ${sellPrice} via pending transaction on UniSwap`
      );
      logMessage(`Potential Profit: ${profit.toFixed(2)}%`);
      logMessage("[INFO] Monitoring for more opportunities...");
    }
  }
}

// Function to continuously run arbitrage checks at regular intervals
function startPeriodicCheck(interval = 60) {
  setInterval(() => {
    checkArbitrage();
  }, interval * 1000); // Convert interval from seconds to milliseconds
}

// Start the arbitrage checker when the script is run directly
if (require.main === module) {
  startPeriodicCheck(); // Start the arbitrage checker with a periodic interval (default is 60 seconds)
}

// module.exports = startPeriodicCheck;
module.exports = { startPeriodicCheck };






// const { TOKEN_PAIRS, MIN_PROFIT_PERCENT } = require("./config");
// const { fetchPrices } = require("./price_fetcher");
// const { logMessage } = require("./logger");

// // Function to calculate profit percentage
// function calculateProfit(buyPrice, sellPrice) {
//   if (!buyPrice || !sellPrice || buyPrice <= 0 || sellPrice <= 0) {
//     return 0;
//   }

//   if (sellPrice > 1000) {
//     return 0;
//   }

//   return ((sellPrice - buyPrice) / buyPrice) * 100;
// }

// // Function to check for arbitrage opportunities
// async function checkArbitrage() {
//   const prices = await fetchPrices();
//   if (!prices || Object.keys(prices).length === 0) {
//     logMessage("[INFO] No prices available to check for arbitrage opportunities.");
//     return;
//   }

//   logMessage("[INFO] Searching for arbitrage opportunities...");

//   for (const [pair, priceData] of Object.entries(prices)) {
//     // Log to inspect the exact format of the pair before processing
//     logMessage(`[INFO] Checking pair: ${JSON.stringify(pair)}`);

//     // If pair is a string like 'eth/btc', split it into an array
//     if (typeof pair === "string") {
//       const tokens = pair.split('/');
//       if (tokens.length === 2) {
//         pair = tokens;  // Update pair to an array [token1, token2]
//       } else {
//         logMessage(`[WARNING] Invalid pair format (not 'token1/token2'): ${pair}`);
//         continue;
//       }
//     }

//     // If pair is not an array with exactly 2 elements, skip it
//     if (!Array.isArray(pair) || pair.length !== 2) {
//       logMessage(`[WARNING] Skipping invalid pair format: ${pair}`);
//       continue;
//     }

//     const [token1, token2] = pair;

//     // Check if priceData exists and contains the necessary properties
//     if (!priceData || typeof priceData !== "object" || !priceData.price_token1 || !priceData.price_token2) {
//       logMessage(`[WARNING] Skipping invalid price data for pair: ${pair}`);
//       continue;
//     }

//     const buyPrice = priceData.price_token1;
//     const sellPrice = priceData.price_token2;

//     if (buyPrice <= 0 || sellPrice <= 0) {
//       logMessage(`[ERROR] Skipping invalid price data: ${token1} Buy=${buyPrice}, ${token2} Sell=${sellPrice}`);
//       continue;
//     }

//     const profit = calculateProfit(buyPrice, sellPrice);

//     if (profit >= MIN_PROFIT_PERCENT) {
//       logMessage("[ALERT] Arbitrage Opportunity Found!");
//       logMessage("-------------------------------------");
//       logMessage(`Token Pair: ${token1}/${token2}`);
//       logMessage(`Opportunity: Buy ${token1} at ${buyPrice} on PancakeSwap, Sell at ${sellPrice} via pending transaction on UniSwap`);
//       logMessage(`Potential Profit: ${profit.toFixed(2)}%`);
//       logMessage("[INFO] Monitoring for more opportunities...");
//     }
//   }
// }

// // Function to continuously run arbitrage checks at regular intervals
// function startPeriodicCheck(interval = 60) {
//   setInterval(() => {
//     checkArbitrage();
//   }, interval * 1000); // Convert interval from seconds to milliseconds
// }

// // Start the arbitrage checker when the script is run directly
// if (require.main === module) {
//   startPeriodicCheck();
// }

// module.exports = { startPeriodicCheck };
