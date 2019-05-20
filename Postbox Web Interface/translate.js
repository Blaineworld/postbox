{
	let lang = {};

	(window.translate = function translateString(string) {
		// Translate some text.
		string = String(string);
		if (string in lang) {
			string = lang[string].split("%s");
			for (var i = 1; i < string.length; i++)
				if (i in arguments)
					string[i] = String(arguments[i]) + string[i];
				else
					string[i] = "?" + string[i];
			return string.join("");
		}
		if (arguments.length > 1) {
			string += "(";
			for (var i = 1; i < arguments.length; i++)
				string += String(arguments[i]) + ",";
			string = string.substring(0, string.length - 1) + ")";
		}
		return string;
	}).register = function registerTranslationStrings(strings) {
		// Register translation strings for later use.
		// Returns the number of strings that were replaced.
		var a = 0, i;
		for (i in strings) {
			a += i in lang;
			lang[i] = String(strings[i]);
		}
		return a;
	};
}