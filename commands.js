const common = require("./common.js");
const logging = require("./logging.js");

module.exports = (twitModule) => {
    async function tweetDestroy(tweetId) {
        try {
            return await twitModule.post("statuses/destroy/:id", { id: tweetId });
        } catch(error) {
            logging.logError("Can't destroy the tweet. Maybe it's already destroyed?");
            console.error(error);
        }
    }

    async function tweetDelayedDestroy(tweetId, delay) {
        await new Promise((resolve) => { setTimeout(() => { resolve(); }, delay); });
        return await tweetDestroy(tweetId);
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
                await tweetDestroy(tweetResponse.data.id_str);
            }, delay);
        }
    }

    async function tweetReply(tweetId, targetAccountScreenName, text) {
        return await twitModule.post("statuses/update", { status: `@${targetAccountScreenName} ${text}`, in_reply_to_status_id: tweetId });
    }
    
    async function tweetReplyAndDestroy(tweetId, targetAccountScreenName, text, delay) {
        let tweetResponse;

        try {
            tweetResponse = await tweetReply(tweetId, targetAccountScreenName, text);
        } catch(error) {
            logging.logError("Failed to post reply Tweet");
            console.error(error);
        }

        if(common.isUsableVar(tweetResponse)) {
            setTimeout(async () => {
                await tweetDestroy(tweetResponse.data.id_str);
            }, delay);
        }
    }

    return {
        tweetDestroy: tweetDestroy,
        tweetDelayedDestroy: tweetDelayedDestroy,
        tweet: tweet,
        tweetAndDestroy: tweetAndDestroy,
        tweetReply: tweetReply,
        tweetReplyAndDestroy: tweetReplyAndDestroy
    }
}