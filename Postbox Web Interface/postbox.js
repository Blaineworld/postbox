'use strict';

/* If you edit this file and you aren't supposed to you're a furry. */

/* # Translation Strings */
translate.register({
	"error.cooldown": "You need to wait %s to do that.",
	"error.nope": "Nope.",
	"error.post.titleTooLong": "Your title is %s characters long, but should be at most %s.",
	"error.post.titleTooShort": "Your title is %s characters long, but should be at least %s.",
	"error.post.tooLong": "Your post is %s characters long, but should be at most %s.",
	"error.post.tooShort": "Your post is %s characters long, but should be at least %s.",
	"error.read.cutOff": "The post %s doesn't contain enough data!",
	"error.read.invalidVersion": "The post %s has an invalid version number.",
	"error.read.nonexistent": "The post %s does not exist!",
	"test": "Hello, world!",
	"test.data": "Hello, %s!",
	"test.multiple": "%s, %s.",
	"ui.placeholder.content": "Speak your mind in %s-%s characters. Don't say anything bad; we will find you! (partial joke) You can also use Markdown to format your post. You can read more on formatting in the manual.",
	"ui.placeholder.title": "Write a descriptive title of %s-%s characters."
});

/* # Main */

{
	/* # Configurations */
	let furtard = false; // Unless you're authorized to do this.

	let postBodyMin = 40; // Smallest number of characters posts can have.
	let postBodyMax = 960; // Largest number of characters posts can have.
	let postCooldown = 1200; // The wait period for posting in seconds.
	let postExistence = 2160; // Base post existence in minutes.
	let postIDLength = 2; // The number of characters to use in a post ID.
	let postTitleMin = 12; // Smallest number of characters titles can have.
	let postTitleMax = 60; // Largest number of characters titles can have.

	let upvoteSelf = true; // Whether posts should automatically be upvoted.

	let voteCooldown = 360; // The wait period for voting in seconds.
	let voteInfluence = 240; // Number of seconds added per vote.

	let reverseSandboxStorage = true; // Hide storage from the outside world.

	/* # Constants */
	const NULL = String.fromCharCode(0);

	/* # Declarations */
	let converter = new showdown.Converter({
		"tables": true,
		"parseImageDimensions": true,
		"omitExtraWLInCodeBlocks": true,
		"emoji": true,
		"backslashEscapesHTMLTags": true
	});
	const ls = localStorage;
	let rn = new Date(); // If you don't know what it stands for Google it.

	/* # Helper Functions */
	const digits = function(num, count = 2) {
		return "'".repeat(String(num).length > count) + "0".repeat(Math.max(0, count - String(num).length)) + String(num).substring(String(num).length - count);
	};

	const plural = function(noun, count = 2) {
		if (Math.abs(count) <= 1)
			return String(noun);
		return String(noun) + "s";
	};

	const formatDate = function(date) {
		// Format an amount of time.
		return digits(date.getDate()) + "/" + digits(date.getMonth() + 1) + "/" + digits(date.getFullYear()) + " @ " + digits(date.getHours()) + ":" + digits(date.getMinutes());
	};

	const formatTime = function(ms) {
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
	};

	const stringFromBinary = function(arr) {
		// Uses UTF-16...
		var str = "", i = 0;
		for (; i < arr.length; i += 2)
			str += String.fromCharCode((Number(arr[i]) || 0) * 256 + (Number(arr[i + 1]) || 0));
		return str;
	};

	const stringToBinary = function(str, arr = []) {
		// Uses UTF-16...
		var c, i = 0, s = String(str);
		for (; i < s.length; i++) {
			c = s.charCodeAt(i);
			arr[i * 2] = Math.floor(c / 256);
			arr[i * 2 + 1] = c % 256;
		}
		return arr;
	};

	/* # Admin Methods */
	const H4X0R_L33T = function() {
		throw translate("error.nope");
	};

	const adminHardReset = function() {
		// Completely clear everything.
		ls.clear();
		return !ls.length; // Returns whether everything was cleared.
	};

	const adminResetCooldowns = function() {
		// Reset the cooldowns.
		ls.removeItem("DATA-pt");
		ls.removeItem("DATA-vt");
		return true; // Wasn't sure what to put here.
	};

	const adminWrite = function(id, info) {
		// Produce data in the latest format.
		var data = [ 0, 0 ], i = 0, txt = String(info.title || "");
		var date = info.date.getTime().toString(2);
		date = "0".repeat(48 - date.length) + date;
		for (; i < date.length / 8; i++)
			data[2 + i] = parseInt(date.substring(i * 8, i * 8 + 8), 2);
		var score = info.points.toString(2);
		score = "0".repeat(32 - score.length) + score;
		for (i = 0; i < score.length / 8; i++)
			data[8 + i] = parseInt(score.substring(i * 8, i * 8 + 8), 2);
		data[12] = txt.length - (txt.length % 256);
		data[13] = txt.length % 256;
		for (i = 0; i < txt.length; i++)
			data[14 + i] = txt.charCodeAt(i);
		for (i = 0; i < info.markdown.length; i++)
			data[14 + txt.length + i] = info.markdown.charCodeAt(i);
		ls.setItem("POST-" + id, stringFromBinary(data));
		return true;
	};

	/* # Methods */
	const methodAllPostIDs = function() {
		// What are all of the existing post IDs?
		var ids = [];
		for (var i = 0, k; i < ls.length; i++)
			if ((k = ls.key(i)).substring(0, 5) === "POST-")
				ids.push(k.replace("POST-", ""));
		return ids;
	};

	const methodBodySize = function() {
		// How long can and should my post be?
		return {
			"min": postBodyMin,
			"max": postBodyMax
		};
	};

	const methodDownvote = function(id) {
		// Decrease a post's score by one point.
		var object = methodRead(id), cooldown = propVoteCooldown();
		if (cooldown)
			throw translate("error.cooldown", formatTime(cooldown * 1000));
		ls.setItem("DATA-vt", Date.now().toString(36));
		object.points--;
		adminWrite(id, object);
		return object.points;
	};

	const methodExists = function(id) {
		// Does this post exist?
		return ls.getItem("POST-" + id) !== null;
	};

	const methodGeneratePostID = function() {
		// Generate a new unique post ID.
		var id = "", i;
		while (!id || ls.getItem("POST-" + id))
			for (i = Number(id = ""); i < postIDLength; i++)
				id += String.fromCharCode(Math.round(Math.random() * 94) + 32);
		return id;
	};

	const methodGetVoteInfluence = function() {
		// How many seconds are added by a vote?
		return voteInfluence;
	};

	const methodPost = function(bodyText, titleText = "") {
		// Create a post on Postbox!
		var content = String(bodyText), title = String(titleText), id = methodGeneratePostID(), cooldown = propPostCooldown();
		if (content.length < postBodyMin)
			throw translate("error.post.tooShort", content.length, postBodyMin);
		if (content.length > postBodyMax)
			throw translate("error.post.tooLong", content.length, postBodyMax);
		if (title.length < postTitleMin)
			throw translate("error.post.titleTooShort", title.length, postTitleMin);
		if (title.length > postTitleMax)
			throw translate("error.post.titleTooLong", title.length, postTitleMax);
		if (cooldown)
			throw translate("error.cooldown", formatTime(cooldown * 1000));
		ls.setItem("DATA-pt", Date.now().toString(36));
		adminWrite(id, {
			"title": titleText,
			"markdown": bodyText,
			"points": Number(!!upvoteSelf),
			"date": rn
		});
		if (upvoteSelf)
			ls.setItem("DATA-vt", Date.now().toString(36));
		return id;
	};

	const methodRead = function(id) {
		// Read a specific post, or throw an error if something goes wrong.
		var raw = ls.getItem("POST-" + id), data = stringToBinary(raw), object = {
			"raw": raw,
			"data": data,
			"markdown": "",
			"html": "",
			"points": 0,
			"identifier": String(id)
		}, len, trg, pos = 2; // Format Version
		if (raw === null)
			throw translate("error.read.nonexistent", id);
		// Format versions are already 16-bit in case I update it 256 times.
		switch (data[0] * 256 + data[1]) {
			case 0:
			if (data.length < 14) // 2b for version, 6b for date, 4b for score, 2b for title length
				throw translate("error.read.cutOff");
			(object.date = new Date()).setTime(data[pos] * 1099511627776 + data[pos + 1] * 4294967296 + data[pos + 2] * 16777216 + data[pos + 3] * 65536 + data[pos + 4] * 256 + data[pos + 5]);
			pos += 6;
			object.points = (data[pos] * 16777216 + data[pos + 1] * 65536 + data[pos + 2] * 256 + data[pos + 3]).toString(2);
			object.points = parseInt(("0".repeat(32 - object.points.length) + object.points).replace(/^1/, "-"), 2);
			pos += 4; // Score
			trg = pos + 2 + (len = data[pos + 1] + data[pos] * 256);
			pos += 2; // Title Length
			if (len)
				if (trg <= data.length)
					for (object.title = ""; pos < trg; object.title += String.fromCharCode(data[pos++])); // Title Text
				else
					throw translate("error.read.cutOff", id);
			for (; pos < data.length; object.markdown += String.fromCharCode(data[pos++])); // Body Text
			break;
			default:
			throw translate("error.read.invalidVersion", id);
			break;
		}
		object.html = converter.makeHtml(object.markdown);
		object.posted = formatDate(object.date);
		object.removalTime = Number(object.date) + postExistence * 60000 + object.points * voteInfluence;
		object.age = performance.now() / 1000 - object.date.getTime() / 1000;
		return object;
	};

	const methodSort = function(list) {
		list.sort(methodSort.SORT_FUNCTION);
		return list;
	};
	methodSort.SORT_FUNCTION = function youCanChangeThis(a, b) {
		try {
			return (b.age - a.age) - ((b.points * voteInfluence * 8) - (a.points * voteInfluence * 8));
		} catch(error) {
			return -Infinity;
		}
	};

	const methodRemoveExpiredPosts = function() {
		// Remove all expired posts, and return the number removed.
		var removed = 0, end = 0, object, i = 0, k;
		for (; i < ls.length; i++)
			if ((k = ls.key(i)).substring(0, 5) === "POST-")
				try {
					object = methodRead(k.replace("POST-", ""));
					end = Number(object.date) + postExistence * 60000 + object.points * voteInfluence;
					if (end < Date.now())
						ls.removeItem(k);
				} catch(error) {
				}
		return removed;
	};

	const methodUpvote = function(id) {
		// Increase a post's score by one point.
		var object = methodRead(id), cooldown = propVoteCooldown();
		if (cooldown)
			throw translate("error.cooldown", formatTime(cooldown * 1000));
		ls.setItem("DATA-vt", Date.now().toString(36));
		object.points++;
		adminWrite(id, object);
		return object.points;
	};

	let probjBodySize = {};

	const propBodySize = function() {
		// How long can and should my post be?
		if (probjBodySize.min !== postBodyMin || probjBodySize.max !== postSizeMax)
			return probjBodySize = {
				"min": postBodyMin,
				"max": postBodyMax
			};
		return probjTitleSize;
	};

	const propLastPosted = function() {
		// When was the last time anyone posted?
		var d = ls.getItem("DATA-pt");
		if (!d)
			return null;
		return new Date(parseInt(d, 36));
	};

	const propLastVoted = function() {
		// When was the last time anyone voted?
		var d = ls.getItem("DATA-vt");
		if (!d)
			return null;
		return new Date(parseInt(d, 36));
	};

	const propPostCooldown = function() {
		// How many seconds until I can post again?
		return (Math.max(0, postCooldown * 1000 - (Date.now() - parseInt(ls.getItem("DATA-pt") || "0", 36))) || 0) / 1000;
	};

	let probjTitleSize = {};

	const propTitleSize = function() {
		// How long can and should my title be?
		if (probjTitleSize.min !== postTitleMin || probjTitleSize.max !== postTitleMax)
			return probjTitleSize = {
				"min": postTitleMin,
				"max": postTitleMax
			};
		return probjTitleSize;
	};

	const propVoteCooldown = function() {
		// How many seconds until I can vote again?
		return (Math.max(0, voteCooldown * 1000 - (Date.now() - parseInt(ls.getItem("DATA-vt") || "0", 36))) || 0) / 1000;
	};

	/* # Initialization */
	let pb = window.Postbox = {
		get bodySize() {
			return propBodySize();
		},
		set bodySize(object) {
			H4X0R_L33T();
		},
		get lastPosted() {
			return propLastPosted();
		},
		set lastPosted(date) {
			H4X0R_L33T();
		},
		get lastVoted() {
			return propLastVoted();
		},
		set lastVoted(date) {
			H4X0R_L33T();
		},
		get postCooldown() {
			return propPostCooldown();
		},
		set postCooldown(seconds) {
			H4X0R_L33T();
		},
		get titleSize() {
			return propTitleSize();
		},
		set titleSize(object) {
			H4X0R_L33T();
		},
		get version() {
			return "alpha 2.0";
		},
		set version(code) {
			H4X0R_L33T();
		},
		get voteCooldown() {
			return propVoteCooldown();
		},
		set voteCooldown(seconds) {
			H4X0R_L33T();
		}
	};
	pb.allPostIDs = methodAllPostIDs;
	pb.downvote = methodDownvote;
	pb.exists = methodExists;
	pb.generatePostID = methodGeneratePostID;
	pb.getVoteInfluence = methodGetVoteInfluence;
	pb.post = methodPost;
	pb.removeExpiredPosts = methodRemoveExpiredPosts;
	pb.read = methodRead;
	pb.sort = methodSort;
	pb.upvote = methodUpvote;

	let admin = pb.admin = {
		"hardReset": adminHardReset,
		"resetCooldowns": adminResetCooldowns,
		"write": adminWrite
	};

	if (!furtard) {
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
		return !!furtard;
	};

	/* # Finalization */
	if (reverseSandboxStorage)
		delete window.localStorage;
}