// const WebSocket = require("ws");
// const {
//   ALCHEMY_WEBSOCKET_URL,
//   DEX_SMART_CONTRACT_ADDRESS,
//   RECONNECT_DELAY,
// } = require("./config");
// const logMessage = require("./logger");

// // Function to handle WebSocket messages and capture pending transactions
// function onMessage(message) {
//   try {
//     const data = JSON.parse(message);
//     if (data.params && data.params.result) {
//       const transaction = data.params.result;
//       const txHash = transaction.hash;
//       const toAddress = transaction.to;
//       const inputData = transaction.input;

//       // Check if the transaction involves the DEX smart contract
//       if (
//         toAddress &&
//         toAddress.toLowerCase() === DEX_SMART_CONTRACT_ADDRESS.toLowerCase()
//       ) {
//         logMessage(`[ALERT] Pending transaction captured: ${txHash}`);
//         logMessage(
//           `Transaction details: To: ${toAddress}, Input data: ${inputData}`
//         );
//       }
//     }
//   } catch (error) {
//     logMessage(`[ERROR] Failed to process message: ${error.message}`);
//   }
// }

// // Function to handle WebSocket errors and reconnect
// function onError(ws, error) {
//   logMessage(`[ERROR] WebSocket error: ${error.message}`);
//   reconnect(ws);
// }

// // Function to handle WebSocket close events and reconnect
// function onClose(ws, code, reason) {
//   logMessage("[INFO] WebSocket connection closed.");
//   reconnect(ws);
// }

// // Function to handle WebSocket open events
// function onOpen() {
//   logMessage("[INFO] WebSocket connection established.");
// }

// // Function to reconnect to the WebSocket service
// function reconnect(ws) {
//   logMessage("[INFO] Reconnecting to WebSocket...");
//   setTimeout(() => {
//     startListener();
//   }, RECONNECT_DELAY);
// }

// // Function to start the WebSocket listener
// function startListener() {
//   const ws = new WebSocket(ALCHEMY_WEBSOCKET_URL);

//   ws.on("open", onOpen);
//   ws.on("message", onMessage);
//   ws.on("error", (error) => onError(ws, error));
//   ws.on("close", (code, reason) => onClose(ws, code, reason));
// }

// // Start the WebSocket listener in a separate thread
// function startListenerThread() {
//   logMessage("[INFO] Starting WebSocket listener thread...");
//   startListener();
// }

// // Start the listener when the script is run directly
// if (require.main === module) {
//   startListenerThread();

//   // Keep the process alive
//   setInterval(() => {}, 1000);
// }

// // module.exports = startListenerThread;
// module.exports = { startListenerThread };


const WebSocket = require("ws");
const {
  ALCHEMY_WEBSOCKET_URL,
  DEX_SMART_CONTRACT_ADDRESS,
  RECONNECT_DELAY,
} = require("./config");
const { logMessage } = require("./logger");  // Destructure correctly

// Function to handle WebSocket messages and capture pending transactions
function onMessage(message) {
  try {
    const data = JSON.parse(message);
    if (data.params && data.params.result) {
      const transaction = data.params.result;
      const txHash = transaction.hash;
      const toAddress = transaction.to;
      const inputData = transaction.input;

      // Check if the transaction involves the DEX smart contract
      if (
        toAddress &&
        toAddress.toLowerCase() === DEX_SMART_CONTRACT_ADDRESS.toLowerCase()
      ) {
        logMessage(`[ALERT] Pending transaction captured: ${txHash}`);
        logMessage(
          `Transaction details: To: ${toAddress}, Input data: ${inputData}`
        );
      }
    }
  } catch (error) {
    logMessage(`[ERROR] Failed to process message: ${error.message}`);
  }
}

// Function to handle WebSocket errors and reconnect
function onError(ws, error) {
  logMessage(`[ERROR] WebSocket error: ${error.message}`);
  reconnect(ws);
}

// Function to handle WebSocket close events and reconnect
function onClose(ws, code, reason) {
  logMessage("[INFO] WebSocket connection closed.");
  reconnect(ws);
}

// Function to handle WebSocket open events
function onOpen() {
  logMessage("[INFO] WebSocket connection established.");
}

// Function to reconnect to the WebSocket service
function reconnect(ws) {
  logMessage("[INFO] Reconnecting to WebSocket...");
  setTimeout(() => {
    startListener();
  }, RECONNECT_DELAY);
}

// Function to start the WebSocket listener
function startListener() {
  const ws = new WebSocket(ALCHEMY_WEBSOCKET_URL);

  ws.on("open", onOpen);
  ws.on("message", onMessage);
  ws.on("error", (error) => onError(ws, error));
  ws.on("close", (code, reason) => onClose(ws, code, reason));
}

// Start the WebSocket listener in a separate thread
function startListenerThread() {
  logMessage("[INFO] Starting WebSocket listener thread...");
  startListener();
}

// Start the listener when the script is run directly
if (require.main === module) {
  startListenerThread();

  // Keep the process alive
  setInterval(() => {}, 1000);
}

// module.exports = startListenerThread;
module.exports = { startListenerThread };
