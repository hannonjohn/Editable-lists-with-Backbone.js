/*
 * jQuery serializeObject - v0.2 - 1/20/2010
 * http://benalman.com/projects/jquery-misc-plugins/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function ($, undefined) {
	'$:nomunge'; // Used by YUI compressor.

	$.fn.serializeObject = function () {
		var obj = {};
		var inputElements = this.find(":input").add(this.filter(":input"));
		inputElements.each(function (i, o) {
			var n = o.name, v = o.value, t = o.type, c = o.checked;
			if (!$.trim(o.name).length) return;
			if (t == "radio" && !c) return;
			obj[n] = obj[n] === undefined ? v
          : $.isArray(obj[n]) ? obj[n].concat(v)
          : [obj[n], v];
		});

		return obj;
	};

})(jQuery);