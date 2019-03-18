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
const normalizeMentionTweetText = (text) => text.replace(`@${config.screenName} `, "").split(" ");
/* === */
