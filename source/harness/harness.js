(function(_win, _doc) {
	'use strict';

	var routes = [],
		bound = [];

	var $ = function(selector) {

			// Force constructor usage for Harness
			if (! (this instanceof $)) {
				return new $(selector);
			}

			this.length = 0;
			this.sel = '';

			if (selector && typeof selector === 'string') {
				var queryValue,
					nodes;

				if (selector.indexOf('ref:') > -1) {
					queryValue = '[data-ref="' + selector.replace('ref:', '') + '"]';
				} else {
					queryValue = selector;
				}

				nodes = _doc.querySelectorAll(queryValue);

				for (var i = 0; i < nodes.length; i++) {
					this[i] = nodes[i];
				}

				this.length = nodes.length;
				this.sel = selector;
			}
		},
		Harness = {
			toCamel: function(string) {
				return string.toLowerCase().replace(/-(.)/g, function(match, value) {
					return value.toUpperCase();
				});
			},

			toDashed: function(string) {
				return string.replace(/[A-Z]/g, function(match) {
					return '-' + match[0].toLowerCase();
				});
			},

			hasProp: function(obj, prop) {
				return Object.hasOwnProperty.call(obj, prop);
			},

			extend: function(defaults, obj) {
				for (var key in defaults) {
					if (obj.hasOwnProperty(key)) {
						defaults[key] = obj[key];
					}
				}

				return defaults;
			},

			parseHTML: function(string) {
				var div = _doc.createElement('div');

				div.innerHTML = string;

				return div;
			},

			fetch: function(options) {
				var request = new XMLHttpRequest();

				if (! Harness.hasProp(options, 'url')) {
					return false;
				}

				request.addEventListener('load', options.success);
				request.addEventListener('error', options.error);
				request.addEventListener('abort', options.fail);

				request.open(options.method, options.url);

				if (options.method.toUpperCase() == 'POST') {
					request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				}

				request.send(options.data);
			},

			routes: {
				make: function(segment, callback) {
					routes[segment] = callback;
				},

				run: function(segment) {
					var path = segment ? segment : (_win.location.pathname).substr(1);

					if (Harness.hasProp(routes, path)) {
						var obj = routes[path];

						obj.init();
					}
				}
			}
		};

	// Create a shortcut to the constructed object's Prototype
	$.fn = $.prototype = {
		each: function(cb) {
			for (var i = 0; i < this.length; i++) {
				cb.call(this[i], this[i], i);
			}

			return this;
		},

		createReturn: function(el) {
			var returnObject = $();

			returnObject[0] = el;

			returnObject.sel = this.sel ? this.sel : '';
			returnObject.length = 1;

			return returnObject;
		},

		first: function() {
			return this.createReturn(this[0]);
		},

		last: function() {
			return this.createReturn(this[this.length - 1]);
		},

		eq: function(index) {
			return this.createReturn(this[index]);
		},

		addClass: function(className) {
			if (className.indexOf(' ') > -1) {
				className = className.split(' ');
			}

			this.each(function(el) {
				if (className instanceof Array) {
					className.forEach(function(className) {
						el.classList.add(className);
					});
				} else {
					el.classList.add(className);
				}
			});

			return this;
		},

		removeClass: function(className) {
			if (className.indexOf(' ') > -1) {
				className = className.split(' ');
			}

			this.each(function(el) {
				if (className instanceof Array) {
					className.forEach(function(className) {
						el.classList.remove(className);
					});
				} else {
					el.classList.remove(className);
				}

				if (! el.classList.length) {
					el.removeAttribute('class');
				}
			});

			return this;
		},

		hasClass: function(className) {
			var output = true;

			this.each(function(el) {
				if (! el.classList.contains(className)) {
					output = false;
				}
			});

			return output;
		},

		toggleClass: function(className) {
			this.each(function(el) {
				el.classList.toggle(className);

				if (! el.classList.length) {
					el.removeAttribute('class');
				}
			});
		},

		data: function(attribute, value) {
			var attrName = (typeof attribute !== 'undefined') ? 'data-' + Harness.toDashed(attribute) : '',
				result;

			if (value || value === '') {
				this.each(function(el) {
					if (el.hasAttribute(attrName) && el.getAttribute(attrName).indexOf(value) === -1) {
						var oldValue = el.getAttribute(attrName);

						el.setAttribute(attrName, oldValue.trim() + ' ' + value);
					} else {
						el.setAttribute(attrName, value);
					}

					if (! el.getAttribute(attrName).length) {
						el.removeAttribute(attrName);
					}
				});
			} else if (attribute) {
				this.each(function(el) {
					if (el.hasAttribute(attrName)) {
						result += ' ' + el.getAttribute(attrName);
					}
				});

				return (typeof result === 'string') ? result.trim() : '';
			} else {
				result = {};

				this.each(function(el) {
					[].forEach.call(el.attributes, function(attr) {
						if (attr.name.indexOf('data-') > -1) {
							var key = attr.name.replace('data-', '');

							result[Harness.toCamel(key)] = attr.value;
						}
					});
				});

				return result;
			}

			return this;
		},

		bound: function() {
			var result = [];

			this.each(function(el) {
				bound.forEach(function(obj) {
					if (obj.el === el) {
						result.push(obj);
					}
				});
			});

			return result;
		},

		on: function(type, cb) {
			this.each(function(el) {
				el.addEventListener(type, cb);

				bound.push({
					el: el,
					type: type,
					cb: cb
				});
			});

			return this;
		},

		off: function(type) {
			this.each(function(el) {
				bound.forEach(function(obj) {
					if (obj.el === el) {
						el.removeEventListener(obj.type, obj.cb);

						bound.splice(obj, 1);
					}
				});
			});
		},

		serializeForm: function() {
			if (Harness.hasProp(this, 0) && this[0].nodeName === 'FORM') {
				var inputs = this[0].querySelectorAll('input, select'),
					string = '';

				for (var key in inputs) {
					var nodeName = inputs[key].nodeName;

					if (nodeName === 'INPUT' || nodeName === 'SELECT') {
						string += '&' + inputs[key].name + '=' + inputs[key].value.replace(' ', '%20');
					}
				}

				return string.substr(1);
			}
		}
	};

	// Claim the dollar sign as Harness' namespace
	_win.$ = $;

	// Expose utlity methods
	_win.Harness = Harness;
})(window, document);