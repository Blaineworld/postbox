'use strict';

{
	// Various configurations and things, which are only to be modified by people who are supposed to do that, otherwise you're a gay furry.
	let languageStrings = {
		"admin.warning": "\n~~ if you aren't an admin, your r arted you indent your code with spaces instead of tabs. ~~",
		"gui.nope": "Nope",
		"gui.nope.cooldown": "That has been done too recently. Please wait for %s before trying again.",
		"gui.nonexistent": "That %s does not exist!",
		"gui.nope.tooFewCharacters": "Your post is too short. Use least %s characters.",
		"gui.post.contentPlaceholder": "Speak your mind. Format it using Markdown if you want to. You can use up to %s characters, but don't say anything mean because there's no such thing as unposting!",
		"gui.post.titlePlaceholder": "Optionally, write a descriptive title of at most %s characters.",
		"security.linkXXS": "I am an idiot and I tried to make you run the following Javascript:\n\n",
		"week.day.sunday": "Sunday",
		"week.day.monday": "Monday",
		"week.day.tuesday": "Tuesday",
		"week.day.wednesday": "Wednesday",
		"week.day.thursday": "Thursday",
		"week.day.friday": "Friday",
		"week.day.saturday": "Saturday",
		"week.day.today": "Today"
	}; // Translation strings. They use %s like in Minecraft.
	let postBodyLimit = 960; // The character limit for post content.
	let postBodyMin = 10; // The smallest number of characters a post can have.
	let postCooldown = 600; // The post cooldown time in seconds.
	let postExistence = 86400000; // The number of seconds a post normally exists for.
	let postTitleLimit = 50; // The character limit for post titles.
	let voteCooldown = 300; // The post cooldown time in seconds.
	let voteInfluence = 150; // The number of seconds added per upvote.
	let weekdays = [
		"week.day.sunday",
		"week.day.monday",
		"week.day.tuesday",
		"week.day.wednesday",
		"week.day.thursday",
		"week.day.friday",
		"week.day.saturday",
		"week.day.today"
	]; // The names of each week. The eighth one is shown for days that are today.

	let converter = new showdown.Converter();

	function digits(int, digits = 2, apostrophe = true) {
		// actually not from StackOverflow
		// I wrote this one myself. Pretty unusual, right?
		var n = Math.round(int);
		if (n !== n)
			return "??";
		n = String(n);
		return "0".repeat(digits - n.substring(n.length - digits).length) + n.substring(n.length - digits);
	}

	function methodTranslate(string, data = "%s") {
		// Get a language string by name.
		if (string in languageStrings)
			return String(languageStrings[string]).replace(/%s/g, data);
		return String(string);
	}

	// Security Measure #1: Give only this block access to localStorage.
	// It ain't much, but it's honest work.
	let ls = window.localStorage;
	delete window.localStorage;

	let ascii = String.fromCharCode(0) + "	\n\r !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~€ ‚ƒ„…†‡ˆ‰Š‹Œ Ž  ‘’“”•–—˜™š›œ žŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";

	function methodCooldown() {
		// Get the amount of time until anyone can post.
		return Math.max(0, postCooldown * 1000 - (Date.now() - methodLast())) || 0;
	}

	function methodCreate(postText, title = "") {
		// Create a post in memory.
		var c = Math.ceil(methodCooldown() / 1000), t = Date.now(), T = "";
		if (String(postText).length < postBodyMin)
			throw methodTranslate("gui.nope") + ": " + methodTranslate("gui.nope.tooFewCharacters", postBodyMin);
		if (c > 0)
			throw methodTranslate("gui.nope") + ": " + methodTranslate("gui.nope.cooldown", digits(Math.floor(c / 60)) + ":" + digits(Math.floor(c % 60)));
		t = t.toString(16);
		t = "0".repeat(16 - t.length) + t;
		ls.setItem("DATA-pt", t = String.fromCharCode("0x" + t.substring(0, 4)) + String.fromCharCode("0x" + t.substring(4, 8)) + String.fromCharCode("0x" + t.substring(8, 12)) + String.fromCharCode("0x" + t.substring(12, 16)));
		var id = String.fromCharCode(Math.round(32 + Math.random() * 95)) +  String.fromCharCode(Math.round(32 + Math.random() * 95)) + String.fromCharCode(Math.round(32 + Math.random() * 95)) + String.fromCharCode(Math.round(32 + Math.random() * 95));
		ls.setItem("POST-" + id, "1" + ascii[0] + t + String(title).substring(0, postTitleLimit) + ascii[0] + String(postText).substring(0, postBodyLimit));
		return id;
	}

	let methodDownvote;

	function methodGetCharacterLimit() {
		// Get the maximum number of characters you can use in the body of a post.
		return postBodyLimit;
	}

	function methodGetTitleCharacterLimit() {
		// Get the maximum number of characters you can use in the title of a post.
		return postTitleLimit;
	}

	function methodHardReset() {
		// ADMIN: Delete everything.
		for (var i = 0; i < ls.length; ls.removeItem(ls.key(i)));
		return "Everything has been deleted. " + methodTranslate("admin.warning");
	}

	function methodLast() {
		// Get the most recent time somebody posted.
		var d = ls.getItem("DATA-pt") || "";
		return 281474976710656 * d.charCodeAt(0) + 4294967296 * d.charCodeAt(1) + 65536 * d.charCodeAt(2) + d.charCodeAt(3);
	}

	function methodLastVote() {
		// Get the most recent time somebody voted on a post.
		var d = ls.getItem("DATA-vt") || "";
		return 281474976710656 * d.charCodeAt(0) + 4294967296 * d.charCodeAt(1) + 65536 * d.charCodeAt(2) + d.charCodeAt(3);
	}

	function methodList() {
		// Get a list of all the existing post IDs.
		var a = [], i = 0, k;
		for (; i <= ls.length; i++)
			if (k = ls.key(i))
				if (k.substring(0, 5) === "POST-")
					a.push(k.substring(5));
		return a;
	}

	function methodRead(postId) {
		// Read a post from memory.
		var key = "POST-" + postId, data = ls.getItem(key), post = {
			"identifier": postId
		}, dateStart = data.indexOf(ascii[0]) + 1, now = new Date();
		post.raw = data;
		post.points = Math.floor(data.substring(0, dateStart - 1)) || 0;
		if (data !== ascii[0]) {
			(post.date = new Date).setTime(281474976710656 * data.charCodeAt(dateStart) + 4294967296 * data.charCodeAt(dateStart + 1) + 65536 * data.charCodeAt(dateStart + 2) + data.charCodeAt(dateStart + 3));
		var y = post.date.getFullYear();
		if (y !== now.getFullYear())
			if (Math.floor(y / 100) === Math.floor(now.getFullYear() / 100))
				y = "/'" + digits(y);
			else
				y = "/" + y;
		else
			y = "";
		post.posted = digits(post.date.getMonth() + 1) + "/" + digits(post.date.getDate()) + y + " @ " + digits(post.date.getHours()) + ":" + digits(post.date.getMinutes());
			var titleEnd = data.indexOf(ascii[0], dateStart + 4);
			post.title = data.substring(dateStart + 4, titleEnd).replace(/\n/g, " ");
			post.html = converter.makeHtml((post.markdown = data.substring(titleEnd + 1)).replace(/\</g, "&lt;")).replace(/\<a href="javascript:/g, "<a href=\"data:text/plain," + encodeURIComponent(methodTranslate("security.linkXXS"))).replace(/\<a /g, "<a target=\"_blank\" ");
		} else
			throw "Nope: The post ID '" + postId + "' doesn't exist!";
		return post;
	}

	function methodRemove(post) {
		// Delete a post from memory.
		if (ls.getItem("POST-" + post) === null)
			throw methodTranslate("nope.nonexistent", "post");
		ls.removeItem("POST-" + post);
		return "The post has been removed. " + methodTranslate("admin.warning");
	}

	function methodRemoveExpired() {
		// Delete all expired posts from memory.
		for (var a = 0, e, i = 0, k, p; i < ls.length; i++)
			if ((k = ls.key(i)).substring(0, 5) === "POST-") {
				p = methodRead(k.replace("POST-", ""));
				e = (p.date.getTime() / 1000 + postExistence + p.points * voteInfluence);
				if (Date.now() / 1000 > e) {
					console.log(k + " has been removed because it is expired.");
					ls.removeItem(k);
					a++;
				} else
					console.log(k + " will continue existing for " + (e - Date.now() / 1000) + " more seconds.");
			}
		return a;
	}

	function methodResetCooldown() {
		// ADMIN: Reset the post cooldown.
		ls.removeItem("DATA-pt");
		ls.removeItem("DATA-vt");
		return "The cooldown has beem reset. " + methodTranslate("admin.warning");
	}

	function methodUpvote(post) {
		// Give a post one point.
		var c, d = ls.getItem("POST-" + post), p, t = Date.now(), points;
		if (d === null)
			throw methodTranslate("gui.nope") + ": " + methodTranslate("gui.nope.nonexistent", "post");
		if (c = methodVoteCooldown())
			throw methodTranslate("gui.nope") + ": " + methodTranslate("gui.nope.cooldown", digits(Math.floor(c / 60)) + ":" + digits(Math.floor(c % 60)));
		var t = Date.now().toString(16);
		t = "0".repeat(16 - t.length) + t;
		ls.setItem("DATA-vt", t = String.fromCharCode("0x" + t.substring(0, 4)) + String.fromCharCode("0x" + t.substring(4, 8)) + String.fromCharCode("0x" + t.substring(8, 12)) + String.fromCharCode("0x" + t.substring(12, 16)));
		return points;
	}

	function methodVoteCooldown() {
		// Get the amount of time until anyone can vote.
		return Math.max(0, voteCooldown * 1000 - (Date.now() - methodLastVote())) || 0;
	}

	// Security Measure #4: Declare the API object as local.
	// Again, someone might try to mess with.
	let pb = window.postbox = function createPostboxPost(content, title) {
		// Create a Postbox post.
		return methodCreate(content, title);
	};
	pb.cooldown = methodCooldown;
	pb.create = methodCreate;
	pb.downvote = methodDownvote;
	pb.getCharacterLimit = methodGetCharacterLimit;
	pb.getTitleCharacterLimit = methodGetTitleCharacterLimit;
	// pb.hardReset = methodHardReset; // Security measure #5: admin methods are commented out
	pb.last = methodLast;
	pb.lastVote = methodLastVote;
	pb.list = methodList;
	pb.read = methodRead;
	// pb.remove = methodRemove;
	pb.removeExpired = methodRemoveExpired;
	// pb.resetCooldown = methodResetCooldown;
	pb.translate = methodTranslate;
	pb.upvote = methodUpvote;
	pb.voteCooldown = methodVoteCooldown;

	addEventListener("load", function() {
		// Security Measure #2: Delete all the scripts.
		// Doesn't really do anything, but can reduce memory usage.
		for (let e; e = document.getElementsByTagName("script")[0]; e.parentElement.removeChild(e));
	});methodResetCooldown();window.localStorage=ls;
}