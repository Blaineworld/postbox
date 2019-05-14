// Display all the posts...
inputtitle.placeholder = postbox.translate("gui.post.titlePlaceholder", inputtitle.maxLength = postbox.getTitleCharacterLimit());
inputcontent.placeholder = postbox.translate("gui.post.contentPlaceholder", inputcontent.maxLength = postbox.getCharacterLimit());

function onLinkClicked(a) {
	// Processes the link and opens it in a little window thingy.
	window.open(a.src);
}

function render(post) {
	// Render a post.
	var e;
	(e = posts.insertBefore(document.createElement("FIELDSET"), posts.children[0])).className = "post";
	e.innerHTML = post.html;
	(e = e.appendChild(document.createElement("LEGEND"))).innerHTML = "<span class=\"date\">" + post.posted + "</span> " + ((post.title||'').replace(/</g, "&lt;").replace(/>/g, "&gt;")||'<i>Untitled</i>');
}

var p = [];

var ids = postbox.list();
for (var i = 0; i < ids.length; i++) {
	p.push(postbox.read(ids[i]));
}

p.sort(function(a, b) {
	return a.date - b.date;
});

for (var i = 0; i < p.length; i++) {
	render(p[i]);
}