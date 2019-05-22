var titleSize = postbox.titleSize(), bodySize = postbox.bodySize();

inputtitle.placeholder = translate("ui.placeholder.title", inputtitle.minLength = titleSize.min, inputtitle.maxLength = titleSize.max);
inputcontent.placeholder = translate("ui.placeholder.content", inputcontent.minLength = bodySize.min, inputcontent.maxLength = bodySize.max);

var noVoteStyles = document.querySelector("#no-vote-styles");
setTimeout(disableNoVoteStyles, postbox.voteCooldown() * 1000);

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

postbox.removeExpiredPosts();
setInterval(postbox.removeExpiredPosts, 300000); // Remove old posts every ~5 minutes.

function sortFunction(a, b) {
	return (a.date - b.date) + ((a.points - b.points) * 75000);
}

function disableNoVoteStyles() {
	noVoteStyles.disabled = true;
}

function renderPosts() {
	posts.innerHTML = "";

	var p = [];

	var ids = postbox.allPostIDs();
	for (var i = 0; i < ids.length; i++)
		try {
			p.push(postbox.read(ids[i]));
		} catch(error) {
		}

	for (var i = 0; i < p.length; i++) {
		render(p[i]);
	}
	p.sort(sortFunction);
}

renderPosts();

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
			renderPosts();
			noVoteStyles.disabled = false;
			setTimeout(disableNoVoteStyles, postbox.voteCooldown() * 1000);
		}
	}
});