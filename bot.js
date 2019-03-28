/* === Definitions === */
/* Configurations */
let config;
try { config = require("./config.js"); } catch(error) { throw "Config file is not found!"; }

/* Modules */
const common                    = require("./common.js");
const logging                   = require("./logging.js");
const airkorea                  = require("./airkorea.js");
const twitter                   = new (require("twit"))(config.twitterConfigs);
const cron                      = require("node-cron");
const commands                  = require("./commands.js")(twitter);
const messages                  = require("./messages.js");

/* `twit` setup */
const twitMentionStream         = twitter.stream("statuses/filter", { track: [ `@${config.screenName}` ]});
/* === */

/* === Mention Command stream === */
twitMentionStream.on("tweet", async (tweet) => {
    let caller = tweet.user.id_str;
    if(caller === config.botAccountId) return;

    logging.logInfo("Got mention to this bot");

    let callerScreenName = tweet.user.screen_name;
    let originalTweetId = tweet.id_str;
    let replyToCallerTweet = (text) => commands.tweetReply(originalTweetId, callerScreenName, text);
    let replyToCallerTweetAndDestroy = (text, delay) => commands.tweetReplyAndDestroy(originalTweetId, callerScreenName, text, delay);
    let splitted = tweet.text.replace(`@${config.screenName} `, "").split(" ");
    logging.logDebug(`Text splitted to process command : ${splitted}`);

    switch(splitted[0].toLowerCase()) {     // TODO: merge mergable parts between help command and test command (like `tweet and destroy`...) into a function
        case "명령어":
        case "커맨드":
        case "헬프":
        case "도움":
        case "도움말": {
            logging.logInfo("The command is to give the user some help message");

            let helpMessageTweet = await replyToCallerTweet(messages.command_HelpMain(config.screenName));
            await commands.tweetReplyAndDestroy(helpMessageTweet.data.id_str, config.screenName, messages.command_HelpCommand(caller, config.maintainerAccountId), 60000);
            await commands.tweetDelayedDestroy(helpMessageTweet.data.id_str, 60000);

            break;
        }
        case "테스트": {
            logging.logInfo("The command is to check the bot doing its work well");

            if(caller === config.maintainerAccountId) {
                logging.logDebug("Test caller is the bot maintainer; response to him/her");

                let uptime = common.uptime();
                await replyToCallerTweetAndDestroy(messages.command_Uptime(uptime), 10000);
            } else {
                logging.logDebug("Test caller is NOT the bot maintainer; act like the command is not exist");

                await replyToCallerTweetAndDestroy(messages.command_NotFound(), 10000);
            }

            break;
        }
        default: {
            logging.logDebug("The command is not exist; pass to default behavior");

            await replyToCallerTweet(messages.command_NotFound(), 10000);
            break;
        }
    }
});
/* === */

/* === Scheduled Jobs === */
cron.schedule("0 30 */1 * * *", async () => {        // Scheduled: Post hourly dust info for each sido on Twitter every hour
    logging.logInfo("Scheduled job: post hourly PM2.5/PM1.0 information for each sido on Twitter every hour half");

    let PM25data = await airkorea.call(airkorea.endpoints.lastHourRTPM25InfoBySido[0],
                                       airkorea.endpoints.lastHourRTPM25InfoBySido[1]);
    PM25data = PM25data.list[0];
    let PM10data = await airkorea.call(airkorea.endpoints.lastHourRTPM10InfoBySido[0],
                                       airkorea.endpoints.lastHourRTPM10InfoBySido[1]);
    PM10data = PM10data.list[0];

    if(common.isUsableVar(PM25data) && common.isUsableVar(PM10data)
        && PM25data.dataTime === PM10data.dataTime) {
        logging.logDebug("Both data looks good and data time is match");

        let lastUpdatedDate = PM25data.dataTime.replace(/-/g, "").replace(/:00/g, "시");
        let text = `${lastUpdatedDate} 시도별 평균\n단위 ${common.PMDustUnit}\nPM2.5｜PM10\n`;

        Object.keys(common.sidoNamesKor).forEach((item) => {
            if(common.isUsableVar(PM25data[item]) && common.isUsableVar(PM10data[item])
            && PM25data[item] > 0 && PM10data[item] > 0) {
                text += `\n${common.sidoNamesKor[item][0]} ${PM25data[item]}｜${PM10data[item]}`;
            }
        });

        try {
            let postedTweet = await commands.tweet(text);
            
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