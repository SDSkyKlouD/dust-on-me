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

/* `twit` setup */
const twitMentionStream         = twitter.stream("statuses/filter", { track: [ `@${config.screenName}` ]});

/* Simple functions */
const postPublicTextTweet       = (text) => twitter.post("statuses/update", { status: text });
const postReplyTextTweet        = (inReplyToStatusId, text) => twitter.post("statuses/update", { status: text, in_reply_to_status_id: inReplyToStatusId });
const destroyTweet              = (tweetId) => twitter.post("statuses/destroy/:id", { id: tweetId });
const normalizeMentionTweetText = (text) => text.replace(`@${config.screenName} `, "").split(" ");
/* === */

/* === Mention Command stream === */
twitMentionStream.on("tweet", async (tweet) => {
    logging.logInfo("Got mention to this bot");

    let caller = tweet.user.id;
    let replyToCallerTweet = (text) => postReplyTextTweet(tweet.id, `@${tweet.user.screen_name} ${text}`);
    let splitted = normalizeMentionTweetText(tweet.text);
    logging.logDebug(`Text splitted to process command : ${splitted}`);

    switch(splitted[0]) {
        case "테스트":
            logging.logDebug("The command is to check the bot doing its work well");

            if(caller === config.maintainerAccountId) {
                logging.logDebug("Test caller is the bot maintainer; response to him/her");

                let uptime = common.getUptime();
                let tweetResponse = await replyToCallerTweet(`잘 들려요! 현재 ${uptime.days}일 ${uptime.hours}시 ${uptime.minutes}분 ${uptime.seconds}초동안 가동되고 있어요.`);

                if(common.isUsableVar(tweetResponse)) {
                    setTimeout(async () => {
                        try {
                            await destroyTweet(tweetResponse.data.id_str);         // `tweetResponse.data.id` is wrong id
                            logging.logDebug("Test tweet destroyed");
                        } catch(error) {
                            logging.logDebug("Failed to destroy test tweet");
                            console.error(error);
                        }
                    }, 10000);
                }
            } else {
                logging.logDebug("Test caller is NOT the bot maintainer; act like the command is not exist");

                replyToCallerTweet("알 수 없는 명령어에요! 명령어를 다시 한 번 확인해주세요😅");
            }
            break;
        default:
            logging.logDebug("The command is not exist; pass to default behavior");

            replyToCallerTweet("죄송해요! 아직 멘션 기능이 완성되지 않았어요😥");
            break;
    }
});
/* === */

cron.schedule("0 3 */1 * * *", async () => {        // Scheduled: Post hourly dust info for each sido on Twitter every hour
    let PM25data = await airkorea.call(airkorea.endpoints.lastHourRTPM25InfoBySido[0],
                                       airkorea.endpoints.lastHourRTPM25InfoBySido[1]);
    PM25data = PM25data.list[0];
    let PM10data = await airkorea.call(airkorea.endpoints.lastHourRTPM10InfoBySido[0],
                                       airkorea.endpoints.lastHourRTPM10InfoBySido[1]);
    PM10data = PM10data.list[0];

    if(common.isUsableVar(PM25data) && common.isUsableVar(PM10data)
        && PM25data.dataTime === PM10data.dataTime) {
        let lastUpdatedDate = PM25data.dataTime.replace(/-/g, "");
        let text = `${lastUpdatedDate}\nPM2.5 / PM10 | 단위 ${common.PMDustUnit}\n`;

        Object.keys(common.sidoNamesKor).forEach((item) => {
            if(common.isUsableVar(PM25data[item]) && common.isUsableVar(PM10data[item])
            && PM25data[item] > 0 && PM10data[item] > 0) {
                text += `\n${common.sidoNamesKor[item][0]} ${PM25data[item]} / ${PM10data[item]}`;
            }
        });

        logging.logInfo(text);
        postPublicTextTweet(text);
    }
});
