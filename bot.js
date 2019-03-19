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
const normalizeMentionTweetText = (text) => text.replace(`@${config.screenName} `, "").split(" ");
/* === */

/* === Mention Command stream === */
twitMentionStream.on("tweet", function(tweet) {
    postReplyTextTweet(tweet.id, `@${tweet.user.screen_name} 죄송해요! 아직 멘션 기능이 완성되지 않았어요😥`);
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
