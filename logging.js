const debuggingLog = require("./config.js").debuggingLog;

module.exports = {
    logInfo: (text) => console.log("[I] " + text),
    logError: (text) => console.error("[E] " + text),
    logDebug: (text) => { if(debuggingLog === true) console.debug("[D] " + text); }
}