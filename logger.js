// const fs = require("fs");
// const path = require("path");

// // Import log file path from config
// const { LOG_FILE } = require("./config");

// // Create a function to log messages to the console and log file
// function logMessage(message) {
//   const timestamp = new Date().toISOString(); // Generate a timestamp
//   const logEntry = `${timestamp} - INFO - ${message}`;

//   // Print message to the console
//   console.log(logEntry);

//   // Append message to the log file
//   fs.appendFileSync(path.resolve(LOG_FILE), logEntry + "\n", { encoding: "utf8" });
// }

// // Log initialization message if this script is run directly
// if (require.main === module) {
//   logMessage("[INFO] Logger initialized and working.");
// }

// module.exports = logMessage;



const fs = require("fs");
const path = require("path");

// Import log file path from config
const { LOG_FILE } = require("./config");

// Create a function to log messages to the console and log file
function logMessage(message) {
  const timestamp = new Date().toISOString(); // Generate a timestamp
  const logEntry = `${timestamp} - INFO - ${message}`;

  // Print message to the console
  console.log(logEntry);

  // Append message to the log file
  fs.appendFileSync(path.resolve(LOG_FILE), logEntry + "\n", { encoding: "utf8" });
}

// Log initialization message if this script is run directly
if (require.main === module) {
  logMessage("[INFO] Logger initialized and working.");
}

module.exports = { logMessage };  // Ensure logMessage is exported as an object
