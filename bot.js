/* === Definitions === */
/* Configurations */
const config      = require("./config.js");

/* Modules */
const twitter     = new (require("twit"))(config.twitterConfigs);
const airKoreaKey = String.raw`${config.airkoreaApiKey}`;
const axios       = require("axios");

/* `twit` setup */
const twitMentionStream  = twitter.stream("statuses/filter", { track: [ `@${config.screenName}` ]});

/* Simple functions */
const logInfo = text => console.log("[I] " + text);
const logError = text => console.error("[E] " + text);
const logDebug = text => console.debug("[D] " + text);
const isUsableVar = obj => typeof(obj) !== "undefined" && obj !== null;
const postPublicTextTweet = text => twitter.post("statuses/update", { status: text });
const safeProcessExit = (exitCode = 0) => { twitMentionStream.stop(); process.exit(exitCode); }
const normalizeMentionTweetText = (text) => text.replace(`@${config.screenName} `, "").split(" ");
/* === */

/**
 * Call AirKorea API and returns the JSON response
 * 
 * @example
 * // Returns JSON response of real-time measurement result of air quality on Seoul
 * callAirKoreaAPI("ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty", {
 *     "sidoName": "서울",
 *     "pageNo": 1,
 *     "numOfRows": 10,
 *     "ver": "1.3" }
 * ).then(response => {
 *     console.log(response);
 * });
 * 
 * @param {string} endpoint  - The end point name of the API
 * @param {object} options - Options to be passed when call the API / *no need to specify `_returnType=json` and `ServiceKey=...`*
 * @returns {object} - *(Promised)* The JSON object parsed from API response
 */
async function callAirKoreaAPI(endpoint, options) {
    let apiParams = "";
    let finalAPIURL = "http://openapi.airkorea.or.kr/openapi/services/rest/" + endpoint + "?";

    logInfo("Calling AirKorea API");
    logDebug("Endpoint is `" + endpoint + "`, with options " + JSON.stringify(options));

    if(isUsableVar(options) && Object.keys(options).length !== 0) {
        logDebug("Parameter `options` have something, start loop");

        for(let index in options) {
            var append = index.toString() + "=" + options[index].toString() + "&";

            logDebug("options[" + index + "] = " + options[index] + " | will be appended to API call parameters as `" + append + "`");
            apiParams += append
        }
    }

    finalAPIURL += encodeURI(apiParams + "_returnType=json&ServiceKey=") + airKoreaKey;
    logDebug("Final AirKorea API request URL is `" + finalAPIURL + "`, start reqeust");

    try {
        let response = await axios.get(finalAPIURL);

        logDebug("Got something from API");

        if(isUsableVar(response) && isUsableVar(response.data)) {
            logInfo("API has called and the response looks good");
            logDebug("Returning `response.data`");

            return response.data;
        } else {
            logError("Response is not usable. Failed to call API");
            logDebug("Will return `undefined`");

            return undefined;
        }
    } catch(error) {
        logError("Something wrong while calling API.");
        logError(error);
        logDebug("API request failed, so will return `undefined`");

        return undefined;
    }
}