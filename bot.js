/* === Definitions === */
/* Configurations */
const config                    = require("./config.js");

/* Modules */
const twitter                   = new (require("twit"))(config.twitterConfigs);
const logging                   = require("./logging.js");

/* `twit` setup */
const twitMentionStream         = twitter.stream("statuses/filter", { track: [ `@${config.screenName}` ]});

/* Simple functions */
const postPublicTextTweet       = (text) => twitter.post("statuses/update", { status: text });
const postReplyTextTweet        = (inReplyToStatusId, text) => twitter.post("statuses/update", { status: text, in_reply_to_status_id: inReplyToStatusId });
const normalizeMentionTweetText = (text) => text.replace(`@${config.screenName} `, "").split(" ");
/* === */

twitMentionStream.on("tweet", function(tweet) {
    postReplyTextTweet(tweet.id, `@${tweet.user.screen_name} 죄송해요! 아직 멘션 기능이 완성되지 않았어요😥`);
});