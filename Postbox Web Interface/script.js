// Display all the posts...
inputtitle.placeholder = postbox.translate("gui.post.titlePlaceholder", inputtitle.maxLength = postbox.getTitleCharacterLimit());
inputcontent.placeholder = postbox.translate("gui.post.contentPlaceholder", inputcontent.maxLength = postbox.getCharacterLimit());

var noVoteStyles = document.querySelector("#no-vote-styles");
setTimeout(disableNoVoteStyles, postbox.voteCooldown());

function render(post) {
	// Render a post.
	var e, f;
	(e = posts.insertBefore(document.createElement("FIELDSET"), posts.children[0])).className = "post";
	e.innerHTML = post.html;
	(f = e.appendChild(document.createElement("P"))).setAttribute("id", "post-id");
	f.innerText = post.identifier;
	(e = e.appendChild(document.createElement("LEGEND"))).innerHTML = "<span class=\"date\">" + post.posted + "</span> " + ((post.title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "<i>Untitled</i>") + "<span title=\"" + post.points + " points\" class=\"vote\"><span class=\"vote-up\">▲</span><span id=\"points\">" + post.points + "</span><span class=\"vote-down\">▼</span></span>";
	e.title = "ID: " + post.identifier;
}

postbox.removeExpired();
setInterval(postbox.removeExpired, 120000); // Remove old posts every ~2 minutes.

var p = [];

var ids = postbox.list();
for (var i = 0; i < ids.length; i++) {
	p.push(postbox.read(ids[i]));
}

p.sort(function(a, b) {
	return (a.date - b.date) + ((a.points - b.points) * 100000);
});

for (var i = 0; i < p.length; i++) {
	render(p[i]);
}

function disableNoVoteStyles() {
	noVoteStyles.disabled = true;
}

addEventListener("click", function(event) {
	if (event.detail === 3) {
		if (event.target.tagName.toUpperCase() === "LI" || event.target.tagName.toUpperCase() === "CODE") {
			document.execCommand("Copy");
			console.info("Copied!");
		}
	} else {
		if (event.target.className.replace("down", "up") === "vote-up" && !postbox.voteCooldown()) {
			if (event.target.className === "vote-down") {
				postbox.downvote(event.target.parentElement.parentElement.parentElement.querySelector("#post-id").innerText);
				event.target.parentElement.querySelector("#points").innerText--;
			} else {
				postbox.upvote(event.target.parentElement.parentElement.parentElement.querySelector("#post-id").innerText);
				event.target.parentElement.querySelector("#points").innerText++;
			}
			noVoteStyles.disabled = false;
			setTimeout(disableNoVoteStyles, postbox.voteCooldown());
		}
	}
});