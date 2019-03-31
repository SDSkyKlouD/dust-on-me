/* === Definitions === */
/* Configurations */
let config;
try { config = require("./config.js"); } catch(error) { throw "Config file is not found!"; }

/* Modules */
const common                    = require("./common.js");
const logging                   = require("./logging.js");
const airkorea                  = require("./airkorea.js");
const twit                      = new (require("twit"))(config.twitterConfigs);
const cron                      = require("node-cron");
const twitHelper                = require("./twit.helper.js")(twit);
const messages                  = require("./messages.js");

/* `twit` setup */
const twitMentionStream         = twit.stream("statuses/filter", { track: [ `@${config.screenName}` ]});
/* === */

/* === Shared Variables === */
let pm25AverageData_SidoCurrentHour;
let pm10AverageData_SidoCurrentHour;
/* === */

/* === Mention Command stream === */
twitMentionStream.on("tweet", async (tweet) => {
    let caller = tweet.user.id_str;
    if(caller === config.botAccountId) return;
  
    let tweetText = tweet.text;
    if(!tweetText.startsWith(`@${config.screenName} `)) return;

    logging.logInfo("Got mention to this bot");

    let callerScreenName = tweet.user.screen_name;
    let originalTweetId = tweet.id_str;
    let replyToCallerTweet = (text) => twitHelper.tweetReply(originalTweetId, callerScreenName, text);
    let replyToCallerTweetAndDestroy = (text, delay) => twitHelper.tweetReplyAndDestroy(originalTweetId, callerScreenName, text, delay);
    let splitted = tweet.text.replace(`@${config.screenName} `, "").split(" ");
    logging.logDebug(`Text splitted to process the command : ${splitted}`);

    switch(splitted[0].toLowerCase()) {
        case "평균": {
            logging.logInfo("The command is to give the user hourly average dust level of requested sido");

            if(splitted.length === 2) {
                logging.logDebug("Command length is 2, continuing process the command");

                let found = false;
                let sidoName = "";
                Object.keys(common.sidoNamesKor).forEach((key) => {
                    for(let item in common.sidoNamesKor[key]) {
                        if(item === splitted[1]) {
                            found = true;
                            sidoName = common.sidoNamesKor[key][0];
                        }
                    }
                });

                if(found && sidoName !== "") {
                    logging.logDebug("Sido name found; getting API data");


                } else {
                    logging.logDebug("No sido name found; notice to user");

                    await replyToCallerTweetAndDestroy(messages.command_NoSidoNameFound(), common.noticeDelayShort);
                }
            } else {
                logging.logDebug("Command length is not 2, request for more parameters");

                await replyToCallerTweetAndDestroy(messages.command_ParametersTooManyOrLess(), common.noticeDelayShort);
            }

            break;
        }
        case "명령어":
        case "커맨드":
        case "헬프":
        case "도움":
        case "도움말": {
            logging.logInfo("The command is to give the user some help message");

            let helpMessageTweet = await replyToCallerTweet(messages.command_HelpMain(config.screenName));
            twitHelper.tweetReplyAndDestroy(helpMessageTweet.data.id_str, config.screenName, messages.command_HelpCommand(caller, config.maintainerAccountId), common.noticeDelayLong);
            await twitHelper.tweetDestroyDelayed(helpMessageTweet.data.id_str, common.noticeDelayLong);

            break;
        }
        case "테스트": {
            logging.logInfo("The command is to check the bot doing its work well");

            if(caller === config.maintainerAccountId) {
                logging.logDebug("Test caller is the bot maintainer; response to him/her");

                let uptime = common.uptime();
                await replyToCallerTweetAndDestroy(messages.command_Uptime(uptime), common.noticeDelayShort);
            } else {
                logging.logDebug("Test caller is NOT the bot maintainer; act like the command is not exist");

                await replyToCallerTweetAndDestroy(messages.command_NotFound(), common.noticeDelayShort);
            }

            break;
        }
        default: {
            logging.logDebug("The command is not exist; pass to default behavior");

            await replyToCallerTweetAndDestroy(messages.command_NotFound(), common.noticeDelayShort);
            break;
        }
    }
});
/* === */

/* === Scheduled Jobs === */
cron.schedule("0 30 */1 * * *", async () => {        // Scheduled: Post hourly dust info for each sido on Twitter every hour
    logging.logInfo("Scheduled job: post hourly PM2.5/PM1.0 information for each sido on Twitter every hour half");

    pm25AverageData_SidoCurrentHour = await airkorea.call(airkorea.endpoints.lastHourRTPM25InfoBySido[0],
                                              airkorea.endpoints.lastHourRTPM25InfoBySido[1]);
    pm25AverageData_SidoCurrentHour = pm25AverageData_SidoCurrentHour.list[0];
    pm10AverageData_SidoCurrentHour = await airkorea.call(airkorea.endpoints.lastHourRTPM10InfoBySido[0],
                                              airkorea.endpoints.lastHourRTPM10InfoBySido[1]);
    pm10AverageData_SidoCurrentHour = pm10AverageData_SidoCurrentHour.list[0];

    if(common.isUsableVar(pm25AverageData_SidoCurrentHour) && common.isUsableVar(pm10AverageData_SidoCurrentHour)
        && pm25AverageData_SidoCurrentHour.dataTime === pm10AverageData_SidoCurrentHour.dataTime) {
        logging.logDebug("Both data looks good and data time is match");

        let lastUpdatedDate = pm25AverageData_SidoCurrentHour.dataTime.replace(/-/g, "").replace(/:00/g, "시");
        let text = `${lastUpdatedDate} 시도별 평균\n단위 ${common.PMDustUnit}\nPM2.5｜PM10\n`;

        Object.keys(common.sidoNamesKor).forEach((item) => {
            if(common.isUsableVar(pm25AverageData_SidoCurrentHour[item]) && common.isUsableVar(pm10AverageData_SidoCurrentHour[item])
            && pm25AverageData_SidoCurrentHour[item] > 0 && pm10AverageData_SidoCurrentHour[item] > 0) {
                text += `\n${common.sidoNamesKor[item][0]} ${pm25AverageData_SidoCurrentHour[item]}｜${pm10AverageData_SidoCurrentHour[item]}`;
            }
        });

        try {
            let postedTweet = await twitHelper.tweet(text);
            
            if(common.isUsableVar(postedTweet)) {
                logging.logInfo("Posted on Twitter; scheduled job done");
            } else {
                logging.logError("Something's wrong while posting on Twitter; no Tweet data returned");
            }
        } catch(error) {
            logging.logError("Something's wrong while posting on Twitter");
            console.log(error);
        }
    }
});
/* === */