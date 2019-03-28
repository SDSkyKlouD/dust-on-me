const common = require("./common.js");
const logging = require("./logging.js");

module.exports = (twitModule) => {
    async function tweetDelete(tweetId) {
        return await twitModule.post("statuses/destroy/:id", { id: tweetId });
    }

    async function tweet(text) {
        return await twitModule.post("statuses/update", { status: text });
    }

    async function tweetAndDestroy(text, delay) {
        let tweetResponse;

        try {
            tweetResponse = await tweet(text);
        } catch(error) {
            logging.logError("Failed to post Tweet");
            console.error(error);
        }

        if(common.isUsableVar(tweetResponse)) {
            setTimeout(async () => {
                await tweetDelete(tweetResponse.data.id_str);
            }, delay);
        }
    }

    async function tweetReply(tweetId, text) {
        return await twitModule.post("statuses/update", { status: text, in_reply_to_status_id: tweetId });
    }
    
    async function tweetReplyAndDestroy(tweetId, text, delay) {
        let tweetResponse;

        try {
            tweetResponse = await tweetReply(tweetId, text);
        } catch(error) {
            logging.logError("Failed to post reply Tweet");
            console.error(error);
        }

        if(common.isUsableVar(tweetResponse)) {
            setTimeout(async () => {
                await tweetDelete(tweetResponse.data.id_str);
            }, delay);
        }
    }

    return {
        tweetDelete: tweetDelete,
        tweet: tweet,
        tweetAndDestroy: tweetAndDestroy,
        tweetReply: tweetReply,
        tweetReplyAndDestroy: tweetReplyAndDestroy
    }
}