"use strict";

var lastScrollPosition = NaN, jokeTriggered = false;

var jokeElement = document.body.appendChild(document.createElement("DIV"));
jokeElement.id = "joke-1";

function jokeTransitionEndHandler() {
	window.close();
	console.error("Whoops! Should've read the warnings at the bottom!");
}

addEventListener("wheel", function(event) {
	if (jokeTriggered)
		return event.preventDefault() || null;
	if (event.deltaY > 0 && lastScrollPosition === document.scrollingElement.scrollTop && document.scrollingElement.scrollTop >= document.scrollingElement.offsetHeight - innerHeight) {
		jokeTriggered = true;
		jokeElement.style.height = "200vh";
		addEventListener("webkittransitionend", jokeTransitionEndHandler);
		addEventListener("moztransitionend", jokeTransitionEndHandler);
		addEventListener("mstransitionend", jokeTransitionEndHandler);
		addEventListener("otransitionend", jokeTransitionEndHandler);
		addEventListener("transitionend", jokeTransitionEndHandler);
	}
	lastScrollPosition = document.scrollingElement.scrollTop;
});

addEventListener("resize", function() {
	lastScrollPosition = document.scrollingElement.scrollTop;
});