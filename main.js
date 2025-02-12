const { startListenerThread } = require('./mempoolListener');
const { startPeriodicCheck } = require('./arbitrageChecker');
const { logMessage } = require('./logger');

// Function to run the system and monitor for arbitrage opportunities
const runSystem = () => {
    // Start the mempool listener in a separate thread
    logMessage("[INFO] Starting mempool listener...");
    startListenerThread();

    // Run arbitrage checks periodically
    logMessage("[INFO] Starting arbitrage checker...");
    setInterval(() => {
        startPeriodicCheck();
    }, 10000);  // Check for arbitrage opportunities every 10 seconds
};

logMessage("[INFO] Starting Arbitrage Detection System...");
runSystem();
