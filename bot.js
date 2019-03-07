/* === Definitions === */
/* Modules */
const twitter     = new (require("twit"))(require("./config.js").twitterConfigs);
const airKoreaKey = String.raw`${require("./config.js").airkoreaApiKey}`;
const axios       = require("axios");

/* Simple functions */
const isUsableVar = function(obj) { return typeof(obj) !== "undefined" && obj !== null; }
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

    if(isUsableVar(options) && Object.keys(options).length !== 0) {
        for(let index in options) {
            apiParams += index.toString() + "=" + options[index].toString() + "&";
        }
    }

    finalAPIURL += encodeURI(apiParams + "_returnType=json&ServiceKey=") + airKoreaKey;

    try {
        let response = await axios.get(finalAPIURL);
        
        if(isUsableVar(response) && isUsableVar(response.data)) {
            return response.data;
        } else {
            return undefined;
        }
    } catch(error) {
        console.error(error);
    }
}