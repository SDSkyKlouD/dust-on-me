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
    let caller = tweet.user.id;
    if(caller === config.botAccountId) return;

    logging.logInfo("Got mention to this bot");

    let replyToCallerTweet = (text) => postReplyTextTweet(tweet.id_str, `@${tweet.user.screen_name} ${text}`);
    let replyToMyTweet     = (tweetObj, text) => postReplyTextTweet(tweetObj.data.id_str, `@${tweet.user.screen_name} ${text}`);
    let splitted = normalizeMentionTweetText(tweet.text);
    logging.logDebug(`Text splitted to process command : ${splitted}`);

    switch(splitted[0].toLowerCase()) {
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
            let helpMessage_tweetResponse;
            let commandsMessage_tweetResponse;

            try {
                helpMessage_tweetResponse = await replyToCallerTweet(helpMessage);
                commandsMessage_tweetResponse = await replyToMyTweet(helpMessage_tweetResponse, commandsMessage);
                logging.logDebug("Posted some replies with help messages to caller");
            } catch(error) {
                logging.logDebug("Failed to post help tweet in reply to caller");
                console.error(error);
            }

            if(common.isUsableVar(helpMessage_tweetResponse) && common.isUsableVar(commandsMessage_tweetResponse)) {
                logging.logDebug("Both help tweet data and command list tweet data looks good; delete them after 1 minutes");

                setTimeout(async () => {
                    try {
                        await destroyTweet(commandsMessage_tweetResponse.data.id_str);
                        await destroyTweet(helpMessage_tweetResponse.data.id_str);
                        logging.logDebug("Help tweets destroyed");
                    } catch(error) {
                        logging.logError("Failed to destroy help tweets; maybe it's already destroyed?");
                        console.error(error);
                    }
                }, 60000);
            }

            break;
        }
        case "테스트": {
            logging.logInfo("The command is to check the bot doing its work well");

            if(caller === config.maintainerAccountId) {
                logging.logDebug("Test caller is the bot maintainer; response to him/her");

                let uptime = common.uptime();
                let tweetResponse;
                try {
                    tweetResponse = await replyToCallerTweet(`잘 들려요! 현재 ${uptime.days}일 ${uptime.hours}시 ${uptime.minutes}분 ${uptime.seconds}초동안 가동되고 있어요.`);
                } catch(error) {
                    logging.logDebug("Failed to post test tweet");
                    console.error(error);
                }

                if(common.isUsableVar(tweetResponse)) {
                    logging.logDebug("Test tweet data looks good; delete it after 10 seconds");

                    setTimeout(async () => {
                        try {
                            await destroyTweet(tweetResponse.data.id_str);         // `tweetResponse.data.id` is wrong data (not accurate)
                            logging.logDebug("Test tweet destroyed");
                        } catch(error) {
                            logging.logDebug("Failed to destroy test tweet; maybe it's already destroyed?");
                            console.error(error);
                        }
                    }, 10000);
                }
            } else {
                logging.logDebug("Test caller is NOT the bot maintainer; act like the command is not exist");

                replyToCallerTweet("알 수 없는 명령어에요! 명령어를 다시 한 번 확인해주세요😅");
            }

            break;
        }
        default: {
            logging.logDebug("The command is not exist; pass to default behavior");

            replyToCallerTweet("알 수 없는 명령어에요! 명령어를 다시 한 번 확인해주세요😅");
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

        let lastUpdatedDate = PM25data.dataTime.replace(/-/g, "");
        let text = `${lastUpdatedDate} 시도별 평균\n단위 ${common.PMDustUnit}\nPM2.5｜PM10\n`;

        Object.keys(common.sidoNamesKor).forEach((item) => {
            if(common.isUsableVar(PM25data[item]) && common.isUsableVar(PM10data[item])
            && PM25data[item] > 0 && PM10data[item] > 0) {
                text += `\n${common.sidoNamesKor[item][0]} ${PM25data[item]}｜${PM10data[item]}`;
            }
        });

        try {
            let postedTweet = await postPublicTextTweet(text);
            
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