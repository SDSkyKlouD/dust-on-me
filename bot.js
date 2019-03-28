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

/* `twit` setup */
const twitMentionStream         = twitter.stream("statuses/filter", { track: [ `@${config.screenName}` ]});

/* Simple functions */
const normalizeMentionTweetText = (text) => text.replace(`@${config.screenName} `, "").split(" ");
/* === */

/* === Mention Command stream === */
twitMentionStream.on("tweet", async (tweet) => {
    let caller = tweet.user.id_str;
    if(caller === config.botAccountId) return;

    logging.logInfo("Got mention to this bot");

    let originalTweetId = tweet.id_str;
    let splitted = normalizeMentionTweetText(tweet.text);
    logging.logDebug(`Text splitted to process command : ${splitted}`);

    let commandNotFoundMessage =  "알 수 없는 명령어에요! 명령어를 다시 한 번 확인해주세요😅";

    switch(splitted[0].toLowerCase()) {     // TODO: merge mergable parts between help command and test command (like `tweet and destroy`...) into a function
        case "명령어":
        case "커맨드":
        case "헬프":
        case "도움":
        case "도움말": {
            logging.logInfo("The command is to give the user some help message");

            let helpMessage =     "\n인터렉티브 미세먼지 정보봇, 『더스트.온.미』에요!\n" +
                                  "현재 개발 단계라 일부 기능/명령어가 없거나 작동하지 않을 수 있어요.\n" +
                                  `명령어는 【@${config.screenName} [명령어]】 형태로 멘션하시면 돼요.\n\n` +
                                  "사용 API : 한국환경공단 대기오염정보 OpenAPI\n" +
                                  ((common.isUsableVar(common.gitRevision)) ? `개발 리비전 : ${common.gitRevision}` : "");
            let commandsMessage = "명령어 목록\n\n" +
                                  ((caller === config.maintainerAccountId) ? "🔧 테스트 : 봇 관리자용 명령어\n" : "") +
                                  "💬 도움말 : 간단한 도움말과 명령어 목록을 보여드려요.\n";

            let helpMessageTweet = await commands.tweetReplyAndDestroy(originalTweetId, helpMessage, 60000);
            await commands.tweetReplyAndDestroy(helpMessageTweet.data.id_str, commandsMessage, 60000);

            break;
        }
        case "테스트": {
            logging.logInfo("The command is to check the bot doing its work well");

            if(caller === config.maintainerAccountId) {
                logging.logDebug("Test caller is the bot maintainer; response to him/her");

                let uptime = common.uptime();
                await commands.tweetReplyAndDestroy(originalTweetId, `잘 들려요! 현재 ${uptime.days}일 ${uptime.hours}시 ${uptime.minutes}분 ${uptime.seconds}초동안 가동되고 있어요.`, 10000);
            } else {
                logging.logDebug("Test caller is NOT the bot maintainer; act like the command is not exist");

                await commands.tweetReplyAndDestroy(originalTweetId, commandNotFoundMessage, 10000);
            }

            break;
        }
        default: {
            logging.logDebug("The command is not exist; pass to default behavior");

            await commands.tweetReplyAndDestroy(originalTweetId, commandNotFoundMessage, 10000);
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