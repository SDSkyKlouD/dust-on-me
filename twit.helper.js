const common = require("./common.js");
const logging = require("./logging.js");

const wait = (delayMilliseconds) => new Promise((resolve) => { setTimeout(() => { resolve(); }, delayMilliseconds); });

module.exports = (twitModule) => {
    async function tweetDestroy(tweetId) {
        try {
            return await twitModule.post("statuses/destroy/:id", { id: tweetId });
        } catch(error) {
            logging.logError("Can't destroy the tweet. Maybe it's already destroyed?");
            console.error(error);
        }
    }

    async function tweetDestroyDelayed(tweetId, delayMilliseconds) {
        await wait(delayMilliseconds);
        return await tweetDestroy(tweetId);
    }

    async function tweet(text) {
        return await twitModule.post("statuses/update", { status: text });
    }

    async function tweetDelayed(text, delayMilliseconds) {
        await wait(delayMilliseconds);
        return await tweet(text);
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
            await wait(delay);
            return await tweetDestroy(tweetResponse.data.id_str);
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
            await wait(delay);
            return await tweetDestroy(tweetResponse.data.id_str);
        }
    }

    return {
        tweetDestroy: tweetDestroy,
        tweetDestroyDelayed: tweetDestroyDelayed,
        tweet: tweet,
        tweetDelayed: tweetDelayed,
        tweetAndDestroy: tweetAndDestroy,
        tweetReply: tweetReply,
        tweetReplyAndDestroy: tweetReplyAndDestroy
    }
}