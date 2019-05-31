/*
	The purpose of this file is to add
	backwards compatibility with browsers
	like Internet Explorer. Old browsers
	are weird, man!
*/

(function() {
	// I put the methods on an object so after this script finishes, I
	// can delete them from it to free up some memory.
	var compatObj = {
		"includes": function(value, start) {
			return !!(this.indexOf(value, start) + 1);
		}
	};

	Array.prototype.includes = Array.prototype.includes || compatObj.includes;
	String.prototype.includes = String.prototype.includes || compatObj.includes;

	// Delete the unused ones so we don't waste memory.
	for (var i in compatObj)
		delete compatObj[i];
})();