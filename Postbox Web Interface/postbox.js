'use strict';

/* If you edit this file and you aren't supposed to you're a furry. */

/* # Translation Strings */
translate.register({
	"error.cooldown": "You need to wait %s to do that.",
	"error.nope": "Nope.",
	"error.post.nullsInTitle": "Your post's title contains null characters. Null characters are used to separate post components, so please remove them.",
	"error.post.titleTooLong": "Your title is %s characters long, but should be at most %s.",
	"error.post.titleTooShort": "Your title is %s characters long, but should be at least %s.",
	"error.post.tooLong": "Your post is %s characters long, but should be at most %s.",
	"error.post.tooShort": "Your post is %s characters long, but should be at least %s.",
	"error.readPost.nonexistent": "The post %s does not exist!",
	"error.readPost.wrongNullCount": "The data for post %s contains %s null characters, but should contain %s.",
	"test": "Hello, world!",
	"test.data": "Hello, %s!",
	"test.multiple": "%s, %s.",
	"ui.placeholder.content": "Speak your mind in %s-%s characters. Don't say anything bad; we will find you! (partial joke) You can also use Markdown to format your post. You can read more on formatting in the manual.",
	"ui.placeholder.title": "Write a descriptive title of %s-%s characters."
});

/* # Main */

{
	/* # Configurations */
	let gaeFurry = false; // Unless you're authorized to do this.

	let postBodyMin = 40; // Smallest number of characters posts can have.
	let postBodyMax = 960; // Largest number of characters posts can have.
	let postCooldown = 900; // The wait period for posting in seconds.
	let postExistence = 86400; // Base post existence in seconds.
	let postIDLength = 5; // The number of characters to use in a post ID.
	let postTitleMin = 9; // Smallest number of characters titles can have.
	let postTitleMax = 60; // Largest number of characters titles can have.

	let voteCooldown = 300; // The wait period for voting in seconds.
	let voteInfluence = 150; // Number of seconds added per vote.

	let reverseSandboxStorage = true; // Hide storage from the outside world.

	/* # Constants */
	const NULL = String.fromCharCode(0);

	/* # Declarations */
	let converter = new showdown.Converter();
	converter.setOption("emoji", true);
	let ls = localStorage;

	let events = {};

	/* # Helper Functions */
	function digits(num, count = 2) {
		return "'".repeat(String(num).length > count) + "0".repeat(Math.max(0, count - String(num).length)) + String(num).substring(String(num).length - count);
	}

	function plural(noun, count = 2) {
		if (Math.abs(count) <= 1)
			return String(noun);
		return String(noun) + "s";
	}

	function formatDate(date) {
		// Format an amount of time.
		return digits(date.getDate()) + "/" + digits(date.getMonth() + 1) + "/" + digits(date.getFullYear()) + " @ " + digits(date.getHours()) + ":" + digits(date.getMinutes());
	}

	function formatTime(ms) {
		// Format an amount of time.
		var t = Number(ms);
		if (t !== t)
			return "meep";
		if (t < 1000)
			return Math.ceil(t) + plural(" millisecond", t);
		if ((t = Math.ceil(t / 1000)) < 60)
			return t + plural(" second", t);
		if ((t = Math.ceil(t / 60)) < 60)
			return t + plural(" minute", t);
		if ((t = Math.ceil(t / 60)) < 24)
			return t + plural(" hour", t);
		if ((t = Math.ceil(t / 24)) < 7)
			return t + plural(" day", t);
		return Math.ceil(t / 7) + plural(" week", Math.ceil(t / 7));
	}

	/* # Admin Methods */
	function H4X0R_L33T() {
		throw translate("error.nope");
	}

	function adminHardReset() {
		// Completely clear everything.
		ls.clear();
		return !ls.length; // Returns whether everything was cleared.
	}

	function adminResetCooldowns() {
		// Reset the cooldowns.
		ls.removeItem("DATA-pt");
		ls.removeItem("DATA-vt");
		return true; // Wasn't sure what to put here.
	}

	/* # Methods */
	function eventsAddListener(e, f) {
		if (typeof f === "function")
			(events[e] = events[e] || []).push(f);
		return null;
	}

	function eventsDispatch(e, d) {
		if (events[e])
			for (var i = 0; i < events[e].length; i++)
				try {
					eventsDispatchF(events[e][i], d);
				} catch(error) {
				}
		return null;
	}

	async function eventsDispatchF(f, d) {
		await f(d);
		return null;
	}

	function eventsRemoveListener(e, f) {
		if (typeof e === "string")
			if (typeof f === "function") {
				if (events[e])
					while (events[e].includes(f))
						events[e].splice(events[e].indexOf(f), 1);
			} else
				delete events[e];
		return null;
	}

	function methodAllPostIDs() {
		// What are all of the existing post IDs?
		var ids = [];
		for (var i = 0, k; i < ls.length; i++)
			if ((k = ls.key(i)).substring(0, 5) === "POST-")
				ids.push(k.replace("POST-", ""));
		return ids;
	}

	function methodBodySize() {
		// How long can and should my post be?
		return {
			"min": postBodyMin,
			"max": postBodyMax
		};
	}

	function methodDownvote(id) {
		// Decrease a post's score by one point.
		var object = methodRead(id), cooldown = methodVoteCooldown();
		if (cooldown)
			throw translate("error.cooldown", formatTime(cooldown * 1000));
		ls.setItem("POST-" + id, (--object.points).toString(36) + object.raw.substring(object.raw.indexOf(NULL)));
		ls.setItem("DATA-vt", Date.now().toString(36));
		return object.points;
	}

	function methodGeneratePostID() {
		// Generate a new unique post ID.
		var id = "", i;
		while (!id || ls.getItem("POST-" + id))
			for (i = Number(id = ""); i < postIDLength; i++)
				id += String.fromCharCode(Math.round(Math.random() * 94) + 32);
		return id;
	}

	function methodPost(bodyText, titleText = "") {
		var content = String(bodyText), title = String(titleText), id = methodGeneratePostID(), cooldown = methodPostCooldown();
		if (content.length < postBodyMin)
			throw translate("error.post.tooShort", content.length, postBodyMin);
		if (content.length > postBodyMax)
			throw translate("error.post.tooLong", content.length, postBodyMax);
		if (title.length < postTitleMin)
			throw translate("error.post.titleTooShort", title.length, postTitleMin);
		if (title.length > postTitleMax)
			throw translate("error.post.titleTooLong", title.length, postTitleMax);
		if (title.includes("\0"))
			throw translate("error.post.nullsInTitle");
		if (cooldown)
			throw translate("error.cooldown", formatTime(cooldown * 1000));
		ls.setItem("DATA-pt", Date.now().toString(36));
		ls.setItem("POST-" + id, "1" + NULL + Date.now().toString(36) + NULL + title + NULL + content);
		return id;
	}

	function methodPostCooldown() {
		// How many seconds until I can post again?
		return (Math.max(0, postCooldown * 1000 - (Date.now() - parseInt(ls.getItem("DATA-pt") || "0", 36))) || 0) / 1000;
	}

	function methodRead(id) {
		// Read a specific post, or throw an error if something goes wrong.
		var raw = ls.getItem("POST-" + id), object = {
			"raw": raw,
			"markdown": "",
			"html": "",
			"identifier": String(id)
		}, currentNull = 0, nulls = (String(raw).match(/\0/g) || []).length;
		if (raw === null)
			throw translate("error.readPost.nonexistent", id);
		if (nulls !== 3)
			throw translate("error.readPost.wrongNullCount", id, nulls, 3);
		object.points = parseInt(raw.substring(0, currentNull = raw.indexOf(NULL)), 36) || 0;
		(object.date = new Date()).setTime(parseInt(raw.substring(currentNull + 1, currentNull = raw.indexOf(NULL, currentNull + 1)), 36) || 0);
		object.posted = formatDate(object.date);
		object.title = raw.substring(currentNull + 1, currentNull = raw.indexOf(NULL, currentNull + 1));
		if (!object.title)
			delete object.title;
		object.markdown = raw.substring(currentNull + 1, raw.length);
		object.html = converter.makeHtml(object.markdown);
		object.removalTime = Number(object.date) + postExistence * 1000 + object.points * voteInfluence;
		return object;
	}

	function methodRemoveExpiredPosts() {
		// Remove all expired posts, and return the number removed.
		var removed = 0, end = 0, object, i = 0, k;
		for (; i < ls.length; i++)
			if ((k = ls.key(i)).substring(0, 5) === "POST-")
				try {
					object = methodRead(k.replace("POST-", ""));
					end = Number(object.date) + postExistence * 1000 + object.points * voteInfluence;
					if (end < Date.now())
						ls.removeItem(k);
				} catch(error) {
				}
		return removed;
	}

	function methodTitleSize() {
		// How long can and should my title be?
		return {
			"min": postTitleMin,
			"max": postTitleMax
		};
	}

	function methodUpvote(id) {
		// Increase a post's score by one point.
		var object = methodRead(id), cooldown = methodVoteCooldown();
		if (cooldown)
			throw translate("error.cooldown", formatTime(cooldown * 1000));
		ls.setItem("POST-" + id, (++object.points).toString(36) + object.raw.substring(object.raw.indexOf(NULL)));
		ls.setItem("DATA-vt", Date.now().toString(36));
		return object.points;
	}

	function methodVoteCooldown() {
		// How many seconds until I can vote again?
		return (Math.max(0, voteCooldown * 1000 - (Date.now() - parseInt(ls.getItem("DATA-vt") || "0", 36))) || 0) / 1000;
	}

	/* # Initialization */
	let pb = window.postbox = function createPostboxPost(content, title) {
		// Create a Postbox post.
		return methodPost(content, title);
	};
	pb.allPostIDs = methodAllPostIDs;
	pb.bodySize = methodBodySize;
	pb.detach = eventsRemoveListener;
	pb.dispatch = eventsDispatch;
	pb.downvote = methodDownvote;
	pb.generatePostID = methodGeneratePostID;
	pb.on = eventsAddListener;
	pb.post = methodPost;
	pb.removeExpiredPosts = methodRemoveExpiredPosts;
	pb.read = methodRead;
	pb.titleSize = methodTitleSize;
	pb.upvote = methodUpvote;
	pb.voteCooldown = methodVoteCooldown;

	let admin = pb.admin = {
		"hardReset": adminHardReset,
		"resetCooldowns": adminResetCooldowns
	};

	if (!gaeFurry) {
		for (var i in admin)
			switch (typeof admin[i]) {
				case "boolean":
				admin[i] = Boolean(Math.round(Math.random()));
				break;
				case "function":
				admin[i] = H4X0R_L33T;
				break;
				case "number":
				admin[i] = NaN;
				break;
				case "string":
				admin[i] = "";
				break;
				case "symbol":
				case "object":
				admin[i] = null;
				break;
			}
	}
	admin.amIIn = function ifYouCallThisFunctionYouWatchCNN() {
		// But not if you're authorized to do so.
		return !!amIIn;
	};

	/* # Finalization */
	if (reverseSandboxStorage)
		delete window.localStorage;
}