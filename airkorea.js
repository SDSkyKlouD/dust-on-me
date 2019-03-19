/* Modules */
const common                    = require("./common.js");
const isUsableVar               = common.isUsableVar;
const logging                   = require("./logging.js");
const axios                     = require("axios");
const airKoreaKey               = String.raw`${require("./config.js").airkoreaApiKey}`;
/* === */
/* Useful API call presets */
const endpoints                 = {
    lastHourRTPM10InfoBySido: [                           // Last hour PM10 dust info
        "ArpltnInforInqireSvc/getCtprvnMesureLIst",
        {
            "numOfRows": 1,
            "pageNo": 1,
            "itemCode": "PM10",
            "dataGubun": "HOUR"
        }
    ],
    lastHourRTPM25InfoBySido: [                           // Last hour PM2.5 dust info
        "ArpltnInforInqireSvc/getCtprvnMesureLIst",
        {
            "numOfRows": 1,
            "pageNo": 1,
            "itemCode": "PM25",
            "dataGubun": "HOUR"
        }
    ],
    lastDayRTPM10InfoBySido: [                            // Last day PM10 dust info
        "ArpltnInforInqireSvc/getCtprvnMesureLIst",
        {
            "numOfRows": 1,
            "pageNo": 1,
            "itemCode": "PM10",
            "dataGubun": "DAILY",
            "searchCondition": "WEEK"
        }
    ],
    lastDayRTPM25InfoBySido: [                            // Last day PM2.5 dust info
        "ArpltnInforInqireSvc/getCtprvnMesureLIst",
        {
            "numOfRows": 1,
            "pageNo": 1,
            "itemCode": "PM25",
            "dataGubun": "DAILY",
            "searchCondition": "WEEK"
        }
    ]
};
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

    logging.logInfo("Calling AirKorea API");
    logging.logDebug("Endpoint is `" + endpoint + "`, with options " + JSON.stringify(options));

    if(isUsableVar(options) && Object.keys(options).length !== 0) {
        logging.logDebug("Parameter `options` have something, start loop");

        for(let index in options) {
            var append = index.toString() + "=" + options[index].toString() + "&";

            logging.logDebug("options[" + index + "] = " + options[index] + " | will be appended to API call parameters as `" + append + "`");
            apiParams += append
        }
    }

    finalAPIURL += encodeURI(apiParams + "_returnType=json&ServiceKey=") + airKoreaKey;
    logging.logDebug("Final AirKorea API request URL is `" + finalAPIURL + "`, start reqeust");

    try {
        let response = await axios.get(finalAPIURL);

        logging.logDebug("Got something from API");

        if(isUsableVar(response) && isUsableVar(response.data)) {
            logging.logInfo("API has called and the response looks good");
            logging.logDebug("Returning `response.data`");

            return response.data;
        } else {
            logging.logError("Response is not usable. Failed to call API");
            logging.logDebug("Will return `undefined`");

            return undefined;
        }
    } catch(error) {
        logging.logError("Something wrong while calling API.");
        logging.logError(error);
        logging.logDebug("API request failed, so will return `undefined`");

        return undefined;
    }
}
/* === */

/* === Module setup === */
module.exports = {
    endpoints: endpoints,
    call: callAirKoreaAPI
};
/* === */