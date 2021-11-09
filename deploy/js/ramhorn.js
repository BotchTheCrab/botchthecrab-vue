(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
var Vue // late bind
var version
var map = Object.create(null)
if (typeof window !== 'undefined') {
  window.__VUE_HOT_MAP__ = map
}
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) { return }
  installed = true

  Vue = vue.__esModule ? vue.default : vue
  version = Vue.version.split('.').map(Number)
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = version[0] >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
        'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if(map[id]) { return }

  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Ctor,
    options: options,
    instances: []
  }
}

/**
 * Check if module is recorded
 *
 * @param {String} id
 */

exports.isRecorded = function (id) {
  return typeof map[id] !== 'undefined'
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot(id, options) {
  if (options.functional) {
    var render = options.render
    options.render = function (h, ctx) {
      var instances = map[id].instances
      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent)
      }
      return render(h, ctx)
    }
  } else {
    injectHook(options, initHookName, function() {
      var record = map[id]
      if (!record.Ctor) {
        record.Ctor = this.constructor
      }
      record.instances.push(this)
    })
    injectHook(options, 'beforeDestroy', function() {
      var instances = map[id].instances
      instances.splice(instances.indexOf(this), 1)
    })
  }
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook(options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]
    : [hook]
}

function tryWrap(fn) {
  return function (id, arg) {
    try {
      fn(id, arg)
    } catch (e) {
      console.error(e)
      console.warn(
        'Something went wrong during Vue component hot-reload. Full reload required.'
      )
    }
  }
}

function updateOptions (oldOptions, newOptions) {
  for (var key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key]
    }
  }
  for (var key$1 in newOptions) {
    oldOptions[key$1] = newOptions[key$1]
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id]
  if (!options) {
    record.instances.slice().forEach(function (instance) {
      instance.$forceUpdate()
    })
    return
  }
  if (typeof options === 'function') {
    options = options.options
  }
  if (record.Ctor) {
    record.Ctor.options.render = options.render
    record.Ctor.options.staticRenderFns = options.staticRenderFns
    record.instances.slice().forEach(function (instance) {
      instance.$options.render = options.render
      instance.$options.staticRenderFns = options.staticRenderFns
      // reset static trees
      // pre 2.5, all static trees are cached together on the instance
      if (instance._staticTrees) {
        instance._staticTrees = []
      }
      // 2.5.0
      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = []
      }
      // 2.5.3
      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = []
      }

      // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)

      // 2.6: temporarily mark rendered scoped slots as unstable so that
      // child components can be forced to update
      var restore = patchScopedSlots(instance)
      instance.$forceUpdate()
      instance.$nextTick(restore)
    })
  } else {
    // functional or no instance created yet
    record.options.render = options.render
    record.options.staticRenderFns = options.staticRenderFns

    // handle functional component re-render
    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options)
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        var injectStyles = record.options._injectStyles
        if (injectStyles) {
          var render = options.render
          record.options.render = function (h, ctx) {
            injectStyles.call(ctx)
            return render(h, ctx)
          }
        }
      }
      record.options._Ctor = null
      // 2.5.3
      if (Array.isArray(record.options.cached)) {
        record.options.cached = []
      }
      record.instances.slice().forEach(function (instance) {
        instance.$forceUpdate()
      })
    }
  }
})

exports.reload = tryWrap(function (id, options) {
  var record = map[id]
  if (options) {
    if (typeof options === 'function') {
      options = options.options
    }
    makeOptionsHot(id, options)
    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options
      }
      var newCtor = record.Ctor.super.extend(options)
      // prevent record.options._Ctor from being overwritten accidentally
      newCtor.options._Ctor = record.options._Ctor
      record.Ctor.options = newCtor.options
      record.Ctor.cid = newCtor.cid
      record.Ctor.prototype = newCtor.prototype
      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release()
      }
    } else {
      updateOptions(record.options, options)
    }
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn(
        'Root or manually mounted instance modified. Full reload required.'
      )
    }
  })
})

// 2.6 optimizes template-compiled scoped slots and skips updates if child
// only uses scoped slots. We need to patch the scoped slots resolving helper
// to temporarily mark all scoped slots as unstable in order to force child
// updates.
function patchScopedSlots (instance) {
  if (!instance._u) { return }
  // https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js
  var original = instance._u
  instance._u = function (slots) {
    try {
      // 2.6.4 ~ 2.6.6
      return original(slots, true)
    } catch (e) {
      // 2.5 / >= 2.6.7
      return original(slots, null, true)
    }
  }
  return function () {
    instance._u = original
  }
}

},{}],4:[function(require,module,exports){
(function (global,setImmediate){
/*!
 * Vue.js v2.6.11
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */
'use strict';

/*  */

var emptyObject = Object.freeze({});

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive.
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
var _toString = Object.prototype.toString;

function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if an attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array.
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether an object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
});

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length;
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

var bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) { return false; };

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
var identity = function (_) { return _; };

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

/*  */



var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/);

// Firefox has a "watch" function on Object.prototype...
var nativeWatch = ({}).watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', ({
      get: function get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

var hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = /*@__PURE__*/(function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

/*  */

var warn = noop;
var tip = noop;
var generateComponentTrace = (noop); // work around flow check
var formatComponentName = (noop);

{
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = function (str) { return str
    .replace(classifyRE, function (c) { return c.toUpperCase(); })
    .replace(/[-_]/g, ''); };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(("[Vue warn]: " + msg + trace));
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.warn("[Vue tip]: " + msg + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>'
    }
    var options = typeof vm === 'function' && vm.cid != null
      ? vm.options
      : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm;
    var name = options.name || options._componentTag;
    var file = options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
      (file && includeFile !== false ? (" at " + file) : '')
    )
  };

  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) { res += str; }
      if (n > 1) { str += str; }
      n >>= 1;
    }
    return res
  };

  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
            : formatComponentName(vm))); })
        .join('\n')
    } else {
      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
    }
  };
}

/*  */

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  if (!config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort(function (a, b) { return a.id - b.id; });
  }
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
var targetStack = [];

function pushTarget (target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions,
  asyncFactory
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: { configurable: true } };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function (text) {
  if ( text === void 0 ) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
var shouldObserve = true;

function toggleObserving (value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) { return }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  if (isUndef(target) || isPrimitive(target)
  ) {
    warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  if (!ob) {
    target[key] = val;
    return val
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if (isUndef(target) || isPrimitive(target)
  ) {
    warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
{
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;

  var keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === '__ob__') { continue }
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  var res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal;
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  var res = [];
  for (var i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal,
  childVal,
  vm,
  key
) {
  var res = Object.create(parentVal || null);
  if (childVal) {
    assertObjectType(key, childVal, vm);
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key$1] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal,
  childVal,
  vm,
  key
) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) { extend(ret, childVal); }
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName (name) {
  if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    );
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    );
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else {
    warn(
      "Invalid value for option \"props\": expected an Array or an Object, " +
      "but got " + (toRawType(props)) + ".",
      vm
    );
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  var inject = options.inject;
  if (!inject) { return }
  var normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else {
    warn(
      "Invalid value for option \"inject\": expected an Array or an Object, " +
      "but got " + (toRawType(inject)) + ".",
      vm
    );
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def$$1 = dirs[key];
      if (typeof def$$1 === 'function') {
        dirs[key] = { bind: def$$1, update: def$$1 };
      }
    }
  }
}

function assertObjectType (name, value, vm) {
  if (!isPlainObject(value)) {
    warn(
      "Invalid value for option \"" + name + "\": expected an Object, " +
      "but got " + (toRawType(value)) + ".",
      vm
    );
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if (warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */



function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // boolean casting
  var booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
    " Expected " + (expectedTypes.map(capitalize).join(', '));
  var expectedType = expectedTypes[0];
  var receivedType = toRawType(value);
  var expectedValue = styleValue(value, expectedType);
  var receivedValue = styleValue(value, receivedType);
  // check if we need to specify expected value
  if (expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      !isBoolean(expectedType, receivedType)) {
    message += " with value " + expectedValue;
  }
  message += ", got " + receivedType + " ";
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += "with value " + receivedValue + ".";
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return ("\"" + value + "\"")
  } else if (type === 'Number') {
    return ("" + (Number(value)))
  } else {
    return ("" + value)
  }
}

function isExplicable (value) {
  var explicitTypes = ['string', 'number', 'boolean'];
  return explicitTypes.some(function (elem) { return value.toLowerCase() === elem; })
}

function isBoolean () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
}

/*  */

function handleError (err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();
  try {
    if (vm) {
      var cur = vm;
      while ((cur = cur.$parent)) {
        var hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  var res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  {
    warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

/*  */

var isUsingMicroTask = false;

var callbacks = [];
var pending = false;

function flushCallbacks () {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
var timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  timerFunc = function () {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) { setTimeout(noop); }
  };
  isUsingMicroTask = true;
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

function nextTick (cb, ctx) {
  var _resolve;
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    timerFunc();
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    })
  }
}

/*  */

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

{
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    );
  };

  var warnReservedPrefix = function (target, key) {
    warn(
      "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
      if (!has && !isAllowed) {
        if (key in target.$data) { warnReservedPrefix(target, key); }
        else { warnNonPresent(target, key); }
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) { warnReservedPrefix(target, key); }
        else { warnNonPresent(target, key); }
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

var mark;
var measure;

{
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = function (tag) { return perf.mark(tag); };
    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      // perf.clearMeasures(name)
    };
  }
}

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  }
});

function createFnInvoker (fns, vm) {
  function invoker () {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  createOnceHandler,
  vm
) {
  var name, def$$1, cur, old, event;
  for (name in on) {
    def$$1 = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
      warn(
        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }
      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      {
        var keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            "Prop \"" + keyInLowerCase + "\" is passed to component " +
            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
            " \"" + key + "\". " +
            "Note that HTML attributes are case-insensitive and camelCased " +
            "props need to use their kebab-case equivalents when using in-DOM " +
            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') { continue }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function initProvide (vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      {
        defineReactive$$1(vm, key, result[key], function () {
          warn(
            "Avoid mutating an injected value directly since the changes will be " +
            "overwritten whenever the provided component re-renders. " +
            "injection being mutated: \"" + key + "\"",
            vm
          );
        });
      }
    });
    toggleObserving(true);
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      // #6574 in case the inject object is observed...
      if (key === '__ob__') { continue }
      var provideKey = inject[key].from;
      var source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault;
        } else {
          warn(("Injection \"" + key + "\" not found"), vm);
        }
      }
    }
    return result
  }
}

/*  */



/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  if (!children || !children.length) {
    return {}
  }
  var slots = {};
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      var name = data.slot;
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }
  return slots
}

function isWhitespace (node) {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

/*  */

function normalizeScopedSlots (
  slots,
  normalSlots,
  prevSlots
) {
  var res;
  var hasNormalSlots = Object.keys(normalSlots).length > 0;
  var isStable = slots ? !!slots.$stable : !hasNormalSlots;
  var key = slots && slots.$key;
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {};
    for (var key$1 in slots) {
      if (slots[key$1] && key$1[0] !== '$') {
        res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
      }
    }
  }
  // expose normal slots on scopedSlots
  for (var key$2 in normalSlots) {
    if (!(key$2 in res)) {
      res[key$2] = proxyNormalSlot(normalSlots, key$2);
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots)._normalized = res;
  }
  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  var normalized = function () {
    var res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res);
    return res && (
      res.length === 0 ||
      (res.length === 1 && res[0].isComment) // #9658
    ) ? undefined
      : res
  };
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return function () { return slots[key]; }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret)._isVList = true;
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      if (!isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        );
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    nodes = this.$slots[name] || fallback;
  }

  var target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

function isKeyNotMatch (expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInKeyCode,
  eventKeyName,
  builtInKeyName
) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
      warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function ( key ) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        var camelizedKey = camelize(key);
        var hyphenatedKey = hyphenate(key);
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on[("update:" + key)] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop( key );
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  );
  markStatic(tree, ("__static__" + index), false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], (key + "_" + i), isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
      warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data
}

/*  */

function resolveScopedSlots (
  fns, // see flow/vnode
  res,
  // the following are added in 2.6
  hasDynamicKeys,
  contentHashKey
) {
  res = res || { $stable: !hasDynamicKeys };
  for (var i = 0; i < fns.length; i++) {
    var slot = fns[i];
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }
      res[slot.key] = slot.fn;
    }
  }
  if (contentHashKey) {
    (res).$key = contentHashKey;
  }
  return res
}

/*  */

function bindDynamicKeys (baseObj, values) {
  for (var i = 0; i < values.length; i += 2) {
    var key = values[i];
    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if (key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn(
        ("Invalid value for dynamic directive argument (expected string or null): " + key),
        this
      );
    }
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
function prependModifier (value, symbol) {
  return typeof value === 'string' ? symbol + value : value
}

/*  */

function installRenderHelpers (target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

/*  */

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  var this$1 = this;

  var options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = function () {
    if (!this$1.$slots) {
      normalizeScopedSlots(
        data.scopedSlots,
        this$1.$slots = resolveSlots(children, parent)
      );
    }
    return this$1.$slots
  };

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get: function get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  }));

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode
    };
  } else {
    this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  contextVm,
  children
) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
    if (isDef(data.props)) { mergeProps(props, data.props); }
  }

  var renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  );

  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);
    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone
}

function mergeProps (to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

/*  */

/*  */

/*  */

// inline hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init (vnode, hydrating) {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );

  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent // activeInstance in lifecycle state
) {
  var options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data) {
  var hooks = data.hook || (data.hook = {});
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var existing = hooks[key];
    var toMerge = componentVNodeHooks[key];
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1 (f1, f2) {
  var merged = function (a, b) {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  var prop = (options.model && options.model.prop) || 'value';
  var event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  var existing = on[event];
  var callback = data.model.callback;
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
    warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      );
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (isDef(data) && isDef(data.nativeOn)) {
        warn(
          ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
          context
        );
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) { applyNS(vnode, ns); }
    if (isDef(data)) { registerDeepBindings(data); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  }
}

var currentRenderingInstance = null;

function renderMixin (Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e) {
          handleError(e, vm, "renderError");
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };
}

/*  */

function ensureCtor (comp, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  var owner = currentRenderingInstance;
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    var owners = factory.owners = [owner];
    var sync = true;
    var timerLoading = null;
    var timerTimeout = null

    ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

    var forceRender = function (renderCompleted) {
      for (var i = 0, l = owners.length; i < l; i++) {
        (owners[i]).$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;
        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });

    var reject = once(function (reason) {
      warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(function () {
              timerLoading = null;
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(function () {
            timerTimeout = null;
            if (isUndef(factory.resolved)) {
              reject(
                "timeout (" + (res.timeout) + "ms)"
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

/*  */

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add (event, fn) {
  target.$on(event, fn);
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function createOnceHandler (event, fn) {
  var _target = target;
  return function onceHandler () {
    var res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        vm.$off(event[i$1], fn);
      }
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
          "Note that HTML attributes are case-insensitive and you cannot use " +
          "v-on to listen to camelCase events when using in-DOM templates. " +
          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
        );
      }
    }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      var info = "event handler for \"" + event + "\"";
      for (var i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm
  };
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  return function () {
    activeInstance = prevActiveInstance;
  }
}

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if (config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure(("vue " + name + " render"), startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(("vue " + name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  var newScopedSlots = parentVnode.data.scopedSlots;
  var oldScopedSlots = vm.$scopedSlots;
  var hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  );

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  var needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) { return true }
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  var info = hook + " hook";
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  {
    circular = {};
  }
  waiting = flushing = false;
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
var currentFlushTimestamp = 0;

// Async edge case fix requires storing an event listener's attach timestamp.
var getNow = Date.now;

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  var performance = window.performance;
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = function () { return performance.now(); };
  }
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;

      if (!config.async) {
        flushSchedulerQueue();
        return
      }
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */



var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options,
  isRenderWatcher
) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = expOrFn.toString();
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = noop;
      warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
  }
};

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps (vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  var loop = function ( key ) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    {
      var hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      defineReactive$$1(props, key, value, function () {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop( key );
  toggleObserving(true);
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
    warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    {
      if (methods && hasOwn(methods, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a data property."),
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
      warn(
        "The data property \"" + key + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (getter == null) {
      warn(
        ("Getter is missing for computed property \"" + key + "\"."),
        vm
      );
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else {
      if (key in vm.$data) {
        warn(("The computed property \"" + key + "\" is already defined in data."), vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
      }
    }
  }
}

function defineComputed (
  target,
  key,
  userDef
) {
  var shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
        this
      );
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    {
      if (typeof methods[key] !== 'function') {
        warn(
          "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
          "Avoid defining component methods that start with _ or $."
        );
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () { return this._data };
  var propsDef = {};
  propsDef.get = function () { return this._props };
  {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, ("callback for immediate watcher \"" + (watcher.expression) + "\""));
      }
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

var uid$3 = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$3++;

    var startTag, endTag;
    /* istanbul ignore if */
    if (config.performance && mark) {
      startTag = "vue-perf-start:" + (vm._uid);
      endTag = "vue-perf-end:" + (vm._uid);
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    {
      initProxy(vm);
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if (config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(("vue " + (vm._name) + " init"), startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;

  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  var modified;
  var latest = Ctor.options;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) { modified = {}; }
      modified[key] = latest[key];
    }
  }
  return modified
}

function Vue (options) {
  if (!(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    var name = extendOptions.name || Super.options.name;
    if (name) {
      validateComponentName(name);
    }

    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

function initProps$1 (Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1 (Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (type === 'component') {
          validateComponentName(id);
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */



function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  var cached$$1 = cache[key];
  if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
    cached$$1.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created: function created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed () {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted: function mounted () {
    var this$1 = this;

    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },

  render: function render () {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = function (obj) {
    observe(obj);
    return obj
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

Vue.version = '2.6.11';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select,progress');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

var convertEnumeratedValue = function (key, value) {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    // allow arbitrary string value for contenteditable
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
};

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) { res += ' '; }
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) { res += ' '; }
      res += key;
    }
  }
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
      warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setStyleScope (node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!isDef(key)) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement$$1 (vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some(function (ignore) {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    )
  }

  var creatingElmInVPre = 0;

  function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      {
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if (data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (nodeOps.parentNode(ref$$1) === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      {
        checkDuplicateKeys(children);
      }
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) { i.create(emptyNode, vnode); }
      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys (children) {
    var seenKeys = {};
    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) { return i }
    }
  }

  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        {
          checkDuplicateKeys(ch);
        }
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true
    }
    // assert node match
    {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }
              return false
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        var fullInvoke = false;
        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || (
        !isUnknownElement$$1(vnode, inVPre) &&
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm = nodeOps.parentNode(oldElm);

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        );

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);
          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              var insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr (el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE && !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' && value !== '' && !el.__ieph
    ) {
      var blocker = function (e) {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

/*  */

/*  */

/*  */

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    var event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function createOnceHandler$1 (event, handler, capture) {
  var _target = target$1; // save current target element in closure
  return function onceHandler () {
    var res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  }
}

// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1 (
  name,
  handler,
  capture,
  passive
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    var attachedTimestamp = currentFlushTimestamp;
    var original = handler;
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    };
  }
  target$1.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }
      : capture
  );
}

function remove$2 (
  name,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  );
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

var svgContainer;

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = "<svg>" + cur + "</svg>";
      var svg = svgContainer.firstChild;
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecesarry `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (elm, checkVal) {
  return (!elm.composing && (
    elm.tagName === 'OPTION' ||
    isNotInFocusAndDirty(elm, checkVal) ||
    isDirtyWithModifiers(elm, checkVal)
  ))
}

function isNotInFocusAndDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers (elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (
        childNode && childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

var whitespaceRE = /\s+/;

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveClass: (name + "-leave"),
    leaveToClass: (name + "-leave-to"),
    leaveActiveClass: (name + "-leave-active")
  }
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ function (fn) { return fn(); };

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  // JSDOM may return undefined for transition properties
  var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  var activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  var toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  var beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  var enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  var afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  var enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  var explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if (explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if (isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      "<transition> explicit " + name + " duration is not a valid number - " +
      "got " + (JSON.stringify(val)) + ".",
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      "<transition> explicit " + name + " duration is NaN - " +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var directive = {
  inserted: function inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
        // trigger change event if
        // no matching option found for at least one value
        var needReset = el.multiple
          ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected (el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(function () {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  return options.every(function (o) { return !looseEqual(o, value); })
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) { return }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (!value === !oldValue) { return }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: directive,
  show: show
};

/*  */

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

var isVShowDirective = function (d) { return d.name === 'show'; };

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(isNotTextNode);
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  beforeMount: function beforeMount () {
    var this$1 = this;

    var update = this._update;
    this._update = function (vnode, hydrating) {
      var restoreActiveInstance = setActiveInstance(this$1);
      // force removing pass
      this$1.__patch__(
        this$1._vnode,
        this$1.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this$1._vnode = this$1.kept;
      restoreActiveInstance();
      update.call(this$1, vnode, hydrating);
    };
  },

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else {
          var opts = c.componentOptions;
          var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        );
      }
    }
    if (config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        "You are running Vue in development mode.\n" +
        "Make sure to turn on production mode when deploying for production.\n" +
        "See more tips at https://vuejs.org/guide/deployment.html"
      );
    }
  }, 0);
}

/*  */

module.exports = Vue;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"timers":2}],5:[function(require,module,exports){
(function (process){
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./vue.runtime.common.prod.js')
} else {
  module.exports = require('./vue.runtime.common.dev.js')
}

}).call(this,require('_process'))
},{"./vue.runtime.common.dev.js":4,"./vue.runtime.common.prod.js":6,"_process":1}],6:[function(require,module,exports){
(function (global,setImmediate){
/*!
 * Vue.js v2.6.11
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */
"use strict";var t=Object.freeze({});function e(t){return null==t}function n(t){return null!=t}function r(t){return!0===t}function o(t){return"string"==typeof t||"number"==typeof t||"symbol"==typeof t||"boolean"==typeof t}function i(t){return null!==t&&"object"==typeof t}var a=Object.prototype.toString;function s(t){return"[object Object]"===a.call(t)}function c(t){var e=parseFloat(String(t));return e>=0&&Math.floor(e)===e&&isFinite(t)}function u(t){return n(t)&&"function"==typeof t.then&&"function"==typeof t.catch}function l(t){return null==t?"":Array.isArray(t)||s(t)&&t.toString===a?JSON.stringify(t,null,2):String(t)}function f(t){var e=parseFloat(t);return isNaN(e)?t:e}function p(t,e){for(var n=Object.create(null),r=t.split(","),o=0;o<r.length;o++)n[r[o]]=!0;return e?function(t){return n[t.toLowerCase()]}:function(t){return n[t]}}var d=p("key,ref,slot,slot-scope,is");function v(t,e){if(t.length){var n=t.indexOf(e);if(n>-1)return t.splice(n,1)}}var h=Object.prototype.hasOwnProperty;function m(t,e){return h.call(t,e)}function y(t){var e=Object.create(null);return function(n){return e[n]||(e[n]=t(n))}}var g=/-(\w)/g,_=y(function(t){return t.replace(g,function(t,e){return e?e.toUpperCase():""})}),b=y(function(t){return t.charAt(0).toUpperCase()+t.slice(1)}),C=/\B([A-Z])/g,$=y(function(t){return t.replace(C,"-$1").toLowerCase()});var w=Function.prototype.bind?function(t,e){return t.bind(e)}:function(t,e){function n(n){var r=arguments.length;return r?r>1?t.apply(e,arguments):t.call(e,n):t.call(e)}return n._length=t.length,n};function A(t,e){e=e||0;for(var n=t.length-e,r=new Array(n);n--;)r[n]=t[n+e];return r}function x(t,e){for(var n in e)t[n]=e[n];return t}function O(t){for(var e={},n=0;n<t.length;n++)t[n]&&x(e,t[n]);return e}function k(t,e,n){}var S=function(t,e,n){return!1},E=function(t){return t};function j(t,e){if(t===e)return!0;var n=i(t),r=i(e);if(!n||!r)return!n&&!r&&String(t)===String(e);try{var o=Array.isArray(t),a=Array.isArray(e);if(o&&a)return t.length===e.length&&t.every(function(t,n){return j(t,e[n])});if(t instanceof Date&&e instanceof Date)return t.getTime()===e.getTime();if(o||a)return!1;var s=Object.keys(t),c=Object.keys(e);return s.length===c.length&&s.every(function(n){return j(t[n],e[n])})}catch(t){return!1}}function T(t,e){for(var n=0;n<t.length;n++)if(j(t[n],e))return n;return-1}function I(t){var e=!1;return function(){e||(e=!0,t.apply(this,arguments))}}var D="data-server-rendered",N=["component","directive","filter"],P=["beforeCreate","created","beforeMount","mounted","beforeUpdate","updated","beforeDestroy","destroyed","activated","deactivated","errorCaptured","serverPrefetch"],L={optionMergeStrategies:Object.create(null),silent:!1,productionTip:!1,devtools:!1,performance:!1,errorHandler:null,warnHandler:null,ignoredElements:[],keyCodes:Object.create(null),isReservedTag:S,isReservedAttr:S,isUnknownElement:S,getTagNamespace:k,parsePlatformTagName:E,mustUseProp:S,async:!0,_lifecycleHooks:P};function M(t,e,n,r){Object.defineProperty(t,e,{value:n,enumerable:!!r,writable:!0,configurable:!0})}var F=new RegExp("[^"+/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/.source+".$_\\d]");var R,U="__proto__"in{},H="undefined"!=typeof window,B="undefined"!=typeof WXEnvironment&&!!WXEnvironment.platform,V=B&&WXEnvironment.platform.toLowerCase(),z=H&&window.navigator.userAgent.toLowerCase(),W=z&&/msie|trident/.test(z),q=z&&z.indexOf("msie 9.0")>0,K=z&&z.indexOf("edge/")>0,X=(z&&z.indexOf("android"),z&&/iphone|ipad|ipod|ios/.test(z)||"ios"===V),G=(z&&/chrome\/\d+/.test(z),z&&/phantomjs/.test(z),z&&z.match(/firefox\/(\d+)/)),Z={}.watch,J=!1;if(H)try{var Q={};Object.defineProperty(Q,"passive",{get:function(){J=!0}}),window.addEventListener("test-passive",null,Q)}catch(t){}var Y=function(){return void 0===R&&(R=!H&&!B&&"undefined"!=typeof global&&(global.process&&"server"===global.process.env.VUE_ENV)),R},tt=H&&window.__VUE_DEVTOOLS_GLOBAL_HOOK__;function et(t){return"function"==typeof t&&/native code/.test(t.toString())}var nt,rt="undefined"!=typeof Symbol&&et(Symbol)&&"undefined"!=typeof Reflect&&et(Reflect.ownKeys);nt="undefined"!=typeof Set&&et(Set)?Set:function(){function t(){this.set=Object.create(null)}return t.prototype.has=function(t){return!0===this.set[t]},t.prototype.add=function(t){this.set[t]=!0},t.prototype.clear=function(){this.set=Object.create(null)},t}();var ot=k,it=0,at=function(){this.id=it++,this.subs=[]};at.prototype.addSub=function(t){this.subs.push(t)},at.prototype.removeSub=function(t){v(this.subs,t)},at.prototype.depend=function(){at.target&&at.target.addDep(this)},at.prototype.notify=function(){for(var t=this.subs.slice(),e=0,n=t.length;e<n;e++)t[e].update()},at.target=null;var st=[];function ct(t){st.push(t),at.target=t}function ut(){st.pop(),at.target=st[st.length-1]}var lt=function(t,e,n,r,o,i,a,s){this.tag=t,this.data=e,this.children=n,this.text=r,this.elm=o,this.ns=void 0,this.context=i,this.fnContext=void 0,this.fnOptions=void 0,this.fnScopeId=void 0,this.key=e&&e.key,this.componentOptions=a,this.componentInstance=void 0,this.parent=void 0,this.raw=!1,this.isStatic=!1,this.isRootInsert=!0,this.isComment=!1,this.isCloned=!1,this.isOnce=!1,this.asyncFactory=s,this.asyncMeta=void 0,this.isAsyncPlaceholder=!1},ft={child:{configurable:!0}};ft.child.get=function(){return this.componentInstance},Object.defineProperties(lt.prototype,ft);var pt=function(t){void 0===t&&(t="");var e=new lt;return e.text=t,e.isComment=!0,e};function dt(t){return new lt(void 0,void 0,void 0,String(t))}function vt(t){var e=new lt(t.tag,t.data,t.children&&t.children.slice(),t.text,t.elm,t.context,t.componentOptions,t.asyncFactory);return e.ns=t.ns,e.isStatic=t.isStatic,e.key=t.key,e.isComment=t.isComment,e.fnContext=t.fnContext,e.fnOptions=t.fnOptions,e.fnScopeId=t.fnScopeId,e.asyncMeta=t.asyncMeta,e.isCloned=!0,e}var ht=Array.prototype,mt=Object.create(ht);["push","pop","shift","unshift","splice","sort","reverse"].forEach(function(t){var e=ht[t];M(mt,t,function(){for(var n=[],r=arguments.length;r--;)n[r]=arguments[r];var o,i=e.apply(this,n),a=this.__ob__;switch(t){case"push":case"unshift":o=n;break;case"splice":o=n.slice(2)}return o&&a.observeArray(o),a.dep.notify(),i})});var yt=Object.getOwnPropertyNames(mt),gt=!0;function _t(t){gt=t}var bt=function(t){var e;this.value=t,this.dep=new at,this.vmCount=0,M(t,"__ob__",this),Array.isArray(t)?(U?(e=mt,t.__proto__=e):function(t,e,n){for(var r=0,o=n.length;r<o;r++){var i=n[r];M(t,i,e[i])}}(t,mt,yt),this.observeArray(t)):this.walk(t)};function Ct(t,e){var n;if(i(t)&&!(t instanceof lt))return m(t,"__ob__")&&t.__ob__ instanceof bt?n=t.__ob__:gt&&!Y()&&(Array.isArray(t)||s(t))&&Object.isExtensible(t)&&!t._isVue&&(n=new bt(t)),e&&n&&n.vmCount++,n}function $t(t,e,n,r,o){var i=new at,a=Object.getOwnPropertyDescriptor(t,e);if(!a||!1!==a.configurable){var s=a&&a.get,c=a&&a.set;s&&!c||2!==arguments.length||(n=t[e]);var u=!o&&Ct(n);Object.defineProperty(t,e,{enumerable:!0,configurable:!0,get:function(){var e=s?s.call(t):n;return at.target&&(i.depend(),u&&(u.dep.depend(),Array.isArray(e)&&function t(e){for(var n=void 0,r=0,o=e.length;r<o;r++)(n=e[r])&&n.__ob__&&n.__ob__.dep.depend(),Array.isArray(n)&&t(n)}(e))),e},set:function(e){var r=s?s.call(t):n;e===r||e!=e&&r!=r||s&&!c||(c?c.call(t,e):n=e,u=!o&&Ct(e),i.notify())}})}}function wt(t,e,n){if(Array.isArray(t)&&c(e))return t.length=Math.max(t.length,e),t.splice(e,1,n),n;if(e in t&&!(e in Object.prototype))return t[e]=n,n;var r=t.__ob__;return t._isVue||r&&r.vmCount?n:r?($t(r.value,e,n),r.dep.notify(),n):(t[e]=n,n)}function At(t,e){if(Array.isArray(t)&&c(e))t.splice(e,1);else{var n=t.__ob__;t._isVue||n&&n.vmCount||m(t,e)&&(delete t[e],n&&n.dep.notify())}}bt.prototype.walk=function(t){for(var e=Object.keys(t),n=0;n<e.length;n++)$t(t,e[n])},bt.prototype.observeArray=function(t){for(var e=0,n=t.length;e<n;e++)Ct(t[e])};var xt=L.optionMergeStrategies;function Ot(t,e){if(!e)return t;for(var n,r,o,i=rt?Reflect.ownKeys(e):Object.keys(e),a=0;a<i.length;a++)"__ob__"!==(n=i[a])&&(r=t[n],o=e[n],m(t,n)?r!==o&&s(r)&&s(o)&&Ot(r,o):wt(t,n,o));return t}function kt(t,e,n){return n?function(){var r="function"==typeof e?e.call(n,n):e,o="function"==typeof t?t.call(n,n):t;return r?Ot(r,o):o}:e?t?function(){return Ot("function"==typeof e?e.call(this,this):e,"function"==typeof t?t.call(this,this):t)}:e:t}function St(t,e){var n=e?t?t.concat(e):Array.isArray(e)?e:[e]:t;return n?function(t){for(var e=[],n=0;n<t.length;n++)-1===e.indexOf(t[n])&&e.push(t[n]);return e}(n):n}function Et(t,e,n,r){var o=Object.create(t||null);return e?x(o,e):o}xt.data=function(t,e,n){return n?kt(t,e,n):e&&"function"!=typeof e?t:kt(t,e)},P.forEach(function(t){xt[t]=St}),N.forEach(function(t){xt[t+"s"]=Et}),xt.watch=function(t,e,n,r){if(t===Z&&(t=void 0),e===Z&&(e=void 0),!e)return Object.create(t||null);if(!t)return e;var o={};for(var i in x(o,t),e){var a=o[i],s=e[i];a&&!Array.isArray(a)&&(a=[a]),o[i]=a?a.concat(s):Array.isArray(s)?s:[s]}return o},xt.props=xt.methods=xt.inject=xt.computed=function(t,e,n,r){if(!t)return e;var o=Object.create(null);return x(o,t),e&&x(o,e),o},xt.provide=kt;var jt=function(t,e){return void 0===e?t:e};function Tt(t,e,n){if("function"==typeof e&&(e=e.options),function(t,e){var n=t.props;if(n){var r,o,i={};if(Array.isArray(n))for(r=n.length;r--;)"string"==typeof(o=n[r])&&(i[_(o)]={type:null});else if(s(n))for(var a in n)o=n[a],i[_(a)]=s(o)?o:{type:o};t.props=i}}(e),function(t,e){var n=t.inject;if(n){var r=t.inject={};if(Array.isArray(n))for(var o=0;o<n.length;o++)r[n[o]]={from:n[o]};else if(s(n))for(var i in n){var a=n[i];r[i]=s(a)?x({from:i},a):{from:a}}}}(e),function(t){var e=t.directives;if(e)for(var n in e){var r=e[n];"function"==typeof r&&(e[n]={bind:r,update:r})}}(e),!e._base&&(e.extends&&(t=Tt(t,e.extends,n)),e.mixins))for(var r=0,o=e.mixins.length;r<o;r++)t=Tt(t,e.mixins[r],n);var i,a={};for(i in t)c(i);for(i in e)m(t,i)||c(i);function c(r){var o=xt[r]||jt;a[r]=o(t[r],e[r],n,r)}return a}function It(t,e,n,r){if("string"==typeof n){var o=t[e];if(m(o,n))return o[n];var i=_(n);if(m(o,i))return o[i];var a=b(i);return m(o,a)?o[a]:o[n]||o[i]||o[a]}}function Dt(t,e,n,r){var o=e[t],i=!m(n,t),a=n[t],s=Lt(Boolean,o.type);if(s>-1)if(i&&!m(o,"default"))a=!1;else if(""===a||a===$(t)){var c=Lt(String,o.type);(c<0||s<c)&&(a=!0)}if(void 0===a){a=function(t,e,n){if(!m(e,"default"))return;var r=e.default;if(t&&t.$options.propsData&&void 0===t.$options.propsData[n]&&void 0!==t._props[n])return t._props[n];return"function"==typeof r&&"Function"!==Nt(e.type)?r.call(t):r}(r,o,t);var u=gt;_t(!0),Ct(a),_t(u)}return a}function Nt(t){var e=t&&t.toString().match(/^\s*function (\w+)/);return e?e[1]:""}function Pt(t,e){return Nt(t)===Nt(e)}function Lt(t,e){if(!Array.isArray(e))return Pt(e,t)?0:-1;for(var n=0,r=e.length;n<r;n++)if(Pt(e[n],t))return n;return-1}function Mt(t,e,n){ct();try{if(e)for(var r=e;r=r.$parent;){var o=r.$options.errorCaptured;if(o)for(var i=0;i<o.length;i++)try{if(!1===o[i].call(r,t,e,n))return}catch(t){Rt(t,r,"errorCaptured hook")}}Rt(t,e,n)}finally{ut()}}function Ft(t,e,n,r,o){var i;try{(i=n?t.apply(e,n):t.call(e))&&!i._isVue&&u(i)&&!i._handled&&(i.catch(function(t){return Mt(t,r,o+" (Promise/async)")}),i._handled=!0)}catch(t){Mt(t,r,o)}return i}function Rt(t,e,n){if(L.errorHandler)try{return L.errorHandler.call(null,t,e,n)}catch(e){e!==t&&Ut(e,null,"config.errorHandler")}Ut(t,e,n)}function Ut(t,e,n){if(!H&&!B||"undefined"==typeof console)throw t;console.error(t)}var Ht,Bt=!1,Vt=[],zt=!1;function Wt(){zt=!1;var t=Vt.slice(0);Vt.length=0;for(var e=0;e<t.length;e++)t[e]()}if("undefined"!=typeof Promise&&et(Promise)){var qt=Promise.resolve();Ht=function(){qt.then(Wt),X&&setTimeout(k)},Bt=!0}else if(W||"undefined"==typeof MutationObserver||!et(MutationObserver)&&"[object MutationObserverConstructor]"!==MutationObserver.toString())Ht="undefined"!=typeof setImmediate&&et(setImmediate)?function(){setImmediate(Wt)}:function(){setTimeout(Wt,0)};else{var Kt=1,Xt=new MutationObserver(Wt),Gt=document.createTextNode(String(Kt));Xt.observe(Gt,{characterData:!0}),Ht=function(){Kt=(Kt+1)%2,Gt.data=String(Kt)},Bt=!0}function Zt(t,e){var n;if(Vt.push(function(){if(t)try{t.call(e)}catch(t){Mt(t,e,"nextTick")}else n&&n(e)}),zt||(zt=!0,Ht()),!t&&"undefined"!=typeof Promise)return new Promise(function(t){n=t})}var Jt=new nt;function Qt(t){!function t(e,n){var r,o;var a=Array.isArray(e);if(!a&&!i(e)||Object.isFrozen(e)||e instanceof lt)return;if(e.__ob__){var s=e.__ob__.dep.id;if(n.has(s))return;n.add(s)}if(a)for(r=e.length;r--;)t(e[r],n);else for(o=Object.keys(e),r=o.length;r--;)t(e[o[r]],n)}(t,Jt),Jt.clear()}var Yt=y(function(t){var e="&"===t.charAt(0),n="~"===(t=e?t.slice(1):t).charAt(0),r="!"===(t=n?t.slice(1):t).charAt(0);return{name:t=r?t.slice(1):t,once:n,capture:r,passive:e}});function te(t,e){function n(){var t=arguments,r=n.fns;if(!Array.isArray(r))return Ft(r,null,arguments,e,"v-on handler");for(var o=r.slice(),i=0;i<o.length;i++)Ft(o[i],null,t,e,"v-on handler")}return n.fns=t,n}function ee(t,n,o,i,a,s){var c,u,l,f;for(c in t)u=t[c],l=n[c],f=Yt(c),e(u)||(e(l)?(e(u.fns)&&(u=t[c]=te(u,s)),r(f.once)&&(u=t[c]=a(f.name,u,f.capture)),o(f.name,u,f.capture,f.passive,f.params)):u!==l&&(l.fns=u,t[c]=l));for(c in n)e(t[c])&&i((f=Yt(c)).name,n[c],f.capture)}function ne(t,o,i){var a;t instanceof lt&&(t=t.data.hook||(t.data.hook={}));var s=t[o];function c(){i.apply(this,arguments),v(a.fns,c)}e(s)?a=te([c]):n(s.fns)&&r(s.merged)?(a=s).fns.push(c):a=te([s,c]),a.merged=!0,t[o]=a}function re(t,e,r,o,i){if(n(e)){if(m(e,r))return t[r]=e[r],i||delete e[r],!0;if(m(e,o))return t[r]=e[o],i||delete e[o],!0}return!1}function oe(t){return o(t)?[dt(t)]:Array.isArray(t)?function t(i,a){var s=[];var c,u,l,f;for(c=0;c<i.length;c++)e(u=i[c])||"boolean"==typeof u||(l=s.length-1,f=s[l],Array.isArray(u)?u.length>0&&(ie((u=t(u,(a||"")+"_"+c))[0])&&ie(f)&&(s[l]=dt(f.text+u[0].text),u.shift()),s.push.apply(s,u)):o(u)?ie(f)?s[l]=dt(f.text+u):""!==u&&s.push(dt(u)):ie(u)&&ie(f)?s[l]=dt(f.text+u.text):(r(i._isVList)&&n(u.tag)&&e(u.key)&&n(a)&&(u.key="__vlist"+a+"_"+c+"__"),s.push(u)));return s}(t):void 0}function ie(t){return n(t)&&n(t.text)&&!1===t.isComment}function ae(t,e){if(t){for(var n=Object.create(null),r=rt?Reflect.ownKeys(t):Object.keys(t),o=0;o<r.length;o++){var i=r[o];if("__ob__"!==i){for(var a=t[i].from,s=e;s;){if(s._provided&&m(s._provided,a)){n[i]=s._provided[a];break}s=s.$parent}if(!s&&"default"in t[i]){var c=t[i].default;n[i]="function"==typeof c?c.call(e):c}}}return n}}function se(t,e){if(!t||!t.length)return{};for(var n={},r=0,o=t.length;r<o;r++){var i=t[r],a=i.data;if(a&&a.attrs&&a.attrs.slot&&delete a.attrs.slot,i.context!==e&&i.fnContext!==e||!a||null==a.slot)(n.default||(n.default=[])).push(i);else{var s=a.slot,c=n[s]||(n[s]=[]);"template"===i.tag?c.push.apply(c,i.children||[]):c.push(i)}}for(var u in n)n[u].every(ce)&&delete n[u];return n}function ce(t){return t.isComment&&!t.asyncFactory||" "===t.text}function ue(e,n,r){var o,i=Object.keys(n).length>0,a=e?!!e.$stable:!i,s=e&&e.$key;if(e){if(e._normalized)return e._normalized;if(a&&r&&r!==t&&s===r.$key&&!i&&!r.$hasNormal)return r;for(var c in o={},e)e[c]&&"$"!==c[0]&&(o[c]=le(n,c,e[c]))}else o={};for(var u in n)u in o||(o[u]=fe(n,u));return e&&Object.isExtensible(e)&&(e._normalized=o),M(o,"$stable",a),M(o,"$key",s),M(o,"$hasNormal",i),o}function le(t,e,n){var r=function(){var t=arguments.length?n.apply(null,arguments):n({});return(t=t&&"object"==typeof t&&!Array.isArray(t)?[t]:oe(t))&&(0===t.length||1===t.length&&t[0].isComment)?void 0:t};return n.proxy&&Object.defineProperty(t,e,{get:r,enumerable:!0,configurable:!0}),r}function fe(t,e){return function(){return t[e]}}function pe(t,e){var r,o,a,s,c;if(Array.isArray(t)||"string"==typeof t)for(r=new Array(t.length),o=0,a=t.length;o<a;o++)r[o]=e(t[o],o);else if("number"==typeof t)for(r=new Array(t),o=0;o<t;o++)r[o]=e(o+1,o);else if(i(t))if(rt&&t[Symbol.iterator]){r=[];for(var u=t[Symbol.iterator](),l=u.next();!l.done;)r.push(e(l.value,r.length)),l=u.next()}else for(s=Object.keys(t),r=new Array(s.length),o=0,a=s.length;o<a;o++)c=s[o],r[o]=e(t[c],c,o);return n(r)||(r=[]),r._isVList=!0,r}function de(t,e,n,r){var o,i=this.$scopedSlots[t];i?(n=n||{},r&&(n=x(x({},r),n)),o=i(n)||e):o=this.$slots[t]||e;var a=n&&n.slot;return a?this.$createElement("template",{slot:a},o):o}function ve(t){return It(this.$options,"filters",t)||E}function he(t,e){return Array.isArray(t)?-1===t.indexOf(e):t!==e}function me(t,e,n,r,o){var i=L.keyCodes[e]||n;return o&&r&&!L.keyCodes[e]?he(o,r):i?he(i,t):r?$(r)!==e:void 0}function ye(t,e,n,r,o){if(n)if(i(n)){var a;Array.isArray(n)&&(n=O(n));var s=function(i){if("class"===i||"style"===i||d(i))a=t;else{var s=t.attrs&&t.attrs.type;a=r||L.mustUseProp(e,s,i)?t.domProps||(t.domProps={}):t.attrs||(t.attrs={})}var c=_(i),u=$(i);c in a||u in a||(a[i]=n[i],o&&((t.on||(t.on={}))["update:"+i]=function(t){n[i]=t}))};for(var c in n)s(c)}else;return t}function ge(t,e){var n=this._staticTrees||(this._staticTrees=[]),r=n[t];return r&&!e?r:(be(r=n[t]=this.$options.staticRenderFns[t].call(this._renderProxy,null,this),"__static__"+t,!1),r)}function _e(t,e,n){return be(t,"__once__"+e+(n?"_"+n:""),!0),t}function be(t,e,n){if(Array.isArray(t))for(var r=0;r<t.length;r++)t[r]&&"string"!=typeof t[r]&&Ce(t[r],e+"_"+r,n);else Ce(t,e,n)}function Ce(t,e,n){t.isStatic=!0,t.key=e,t.isOnce=n}function $e(t,e){if(e)if(s(e)){var n=t.on=t.on?x({},t.on):{};for(var r in e){var o=n[r],i=e[r];n[r]=o?[].concat(o,i):i}}else;return t}function we(t,e,n,r){e=e||{$stable:!n};for(var o=0;o<t.length;o++){var i=t[o];Array.isArray(i)?we(i,e,n):i&&(i.proxy&&(i.fn.proxy=!0),e[i.key]=i.fn)}return r&&(e.$key=r),e}function Ae(t,e){for(var n=0;n<e.length;n+=2){var r=e[n];"string"==typeof r&&r&&(t[e[n]]=e[n+1])}return t}function xe(t,e){return"string"==typeof t?e+t:t}function Oe(t){t._o=_e,t._n=f,t._s=l,t._l=pe,t._t=de,t._q=j,t._i=T,t._m=ge,t._f=ve,t._k=me,t._b=ye,t._v=dt,t._e=pt,t._u=we,t._g=$e,t._d=Ae,t._p=xe}function ke(e,n,o,i,a){var s,c=this,u=a.options;m(i,"_uid")?(s=Object.create(i))._original=i:(s=i,i=i._original);var l=r(u._compiled),f=!l;this.data=e,this.props=n,this.children=o,this.parent=i,this.listeners=e.on||t,this.injections=ae(u.inject,i),this.slots=function(){return c.$slots||ue(e.scopedSlots,c.$slots=se(o,i)),c.$slots},Object.defineProperty(this,"scopedSlots",{enumerable:!0,get:function(){return ue(e.scopedSlots,this.slots())}}),l&&(this.$options=u,this.$slots=this.slots(),this.$scopedSlots=ue(e.scopedSlots,this.$slots)),u._scopeId?this._c=function(t,e,n,r){var o=Le(s,t,e,n,r,f);return o&&!Array.isArray(o)&&(o.fnScopeId=u._scopeId,o.fnContext=i),o}:this._c=function(t,e,n,r){return Le(s,t,e,n,r,f)}}function Se(t,e,n,r,o){var i=vt(t);return i.fnContext=n,i.fnOptions=r,e.slot&&((i.data||(i.data={})).slot=e.slot),i}function Ee(t,e){for(var n in e)t[_(n)]=e[n]}Oe(ke.prototype);var je={init:function(t,e){if(t.componentInstance&&!t.componentInstance._isDestroyed&&t.data.keepAlive){var r=t;je.prepatch(r,r)}else{(t.componentInstance=function(t,e){var r={_isComponent:!0,_parentVnode:t,parent:e},o=t.data.inlineTemplate;n(o)&&(r.render=o.render,r.staticRenderFns=o.staticRenderFns);return new t.componentOptions.Ctor(r)}(t,qe)).$mount(e?t.elm:void 0,e)}},prepatch:function(e,n){var r=n.componentOptions;!function(e,n,r,o,i){var a=o.data.scopedSlots,s=e.$scopedSlots,c=!!(a&&!a.$stable||s!==t&&!s.$stable||a&&e.$scopedSlots.$key!==a.$key),u=!!(i||e.$options._renderChildren||c);e.$options._parentVnode=o,e.$vnode=o,e._vnode&&(e._vnode.parent=o);if(e.$options._renderChildren=i,e.$attrs=o.data.attrs||t,e.$listeners=r||t,n&&e.$options.props){_t(!1);for(var l=e._props,f=e.$options._propKeys||[],p=0;p<f.length;p++){var d=f[p],v=e.$options.props;l[d]=Dt(d,v,n,e)}_t(!0),e.$options.propsData=n}r=r||t;var h=e.$options._parentListeners;e.$options._parentListeners=r,We(e,r,h),u&&(e.$slots=se(i,o.context),e.$forceUpdate())}(n.componentInstance=e.componentInstance,r.propsData,r.listeners,n,r.children)},insert:function(t){var e,n=t.context,r=t.componentInstance;r._isMounted||(r._isMounted=!0,Ze(r,"mounted")),t.data.keepAlive&&(n._isMounted?((e=r)._inactive=!1,Qe.push(e)):Ge(r,!0))},destroy:function(t){var e=t.componentInstance;e._isDestroyed||(t.data.keepAlive?function t(e,n){if(n&&(e._directInactive=!0,Xe(e)))return;if(!e._inactive){e._inactive=!0;for(var r=0;r<e.$children.length;r++)t(e.$children[r]);Ze(e,"deactivated")}}(e,!0):e.$destroy())}},Te=Object.keys(je);function Ie(o,a,s,c,l){if(!e(o)){var f=s.$options._base;if(i(o)&&(o=f.extend(o)),"function"==typeof o){var p;if(e(o.cid)&&void 0===(o=function(t,o){if(r(t.error)&&n(t.errorComp))return t.errorComp;if(n(t.resolved))return t.resolved;var a=Fe;a&&n(t.owners)&&-1===t.owners.indexOf(a)&&t.owners.push(a);if(r(t.loading)&&n(t.loadingComp))return t.loadingComp;if(a&&!n(t.owners)){var s=t.owners=[a],c=!0,l=null,f=null;a.$on("hook:destroyed",function(){return v(s,a)});var p=function(t){for(var e=0,n=s.length;e<n;e++)s[e].$forceUpdate();t&&(s.length=0,null!==l&&(clearTimeout(l),l=null),null!==f&&(clearTimeout(f),f=null))},d=I(function(e){t.resolved=Re(e,o),c?s.length=0:p(!0)}),h=I(function(e){n(t.errorComp)&&(t.error=!0,p(!0))}),m=t(d,h);return i(m)&&(u(m)?e(t.resolved)&&m.then(d,h):u(m.component)&&(m.component.then(d,h),n(m.error)&&(t.errorComp=Re(m.error,o)),n(m.loading)&&(t.loadingComp=Re(m.loading,o),0===m.delay?t.loading=!0:l=setTimeout(function(){l=null,e(t.resolved)&&e(t.error)&&(t.loading=!0,p(!1))},m.delay||200)),n(m.timeout)&&(f=setTimeout(function(){f=null,e(t.resolved)&&h(null)},m.timeout)))),c=!1,t.loading?t.loadingComp:t.resolved}}(p=o,f)))return function(t,e,n,r,o){var i=pt();return i.asyncFactory=t,i.asyncMeta={data:e,context:n,children:r,tag:o},i}(p,a,s,c,l);a=a||{},_n(o),n(a.model)&&function(t,e){var r=t.model&&t.model.prop||"value",o=t.model&&t.model.event||"input";(e.attrs||(e.attrs={}))[r]=e.model.value;var i=e.on||(e.on={}),a=i[o],s=e.model.callback;n(a)?(Array.isArray(a)?-1===a.indexOf(s):a!==s)&&(i[o]=[s].concat(a)):i[o]=s}(o.options,a);var d=function(t,r,o){var i=r.options.props;if(!e(i)){var a={},s=t.attrs,c=t.props;if(n(s)||n(c))for(var u in i){var l=$(u);re(a,c,u,l,!0)||re(a,s,u,l,!1)}return a}}(a,o);if(r(o.options.functional))return function(e,r,o,i,a){var s=e.options,c={},u=s.props;if(n(u))for(var l in u)c[l]=Dt(l,u,r||t);else n(o.attrs)&&Ee(c,o.attrs),n(o.props)&&Ee(c,o.props);var f=new ke(o,c,a,i,e),p=s.render.call(null,f._c,f);if(p instanceof lt)return Se(p,o,f.parent,s);if(Array.isArray(p)){for(var d=oe(p)||[],v=new Array(d.length),h=0;h<d.length;h++)v[h]=Se(d[h],o,f.parent,s);return v}}(o,d,a,s,c);var h=a.on;if(a.on=a.nativeOn,r(o.options.abstract)){var m=a.slot;a={},m&&(a.slot=m)}!function(t){for(var e=t.hook||(t.hook={}),n=0;n<Te.length;n++){var r=Te[n],o=e[r],i=je[r];o===i||o&&o._merged||(e[r]=o?De(i,o):i)}}(a);var y=o.options.name||l;return new lt("vue-component-"+o.cid+(y?"-"+y:""),a,void 0,void 0,void 0,s,{Ctor:o,propsData:d,listeners:h,tag:l,children:c},p)}}}function De(t,e){var n=function(n,r){t(n,r),e(n,r)};return n._merged=!0,n}var Ne=1,Pe=2;function Le(t,a,s,c,u,l){return(Array.isArray(s)||o(s))&&(u=c,c=s,s=void 0),r(l)&&(u=Pe),function(t,o,a,s,c){if(n(a)&&n(a.__ob__))return pt();n(a)&&n(a.is)&&(o=a.is);if(!o)return pt();Array.isArray(s)&&"function"==typeof s[0]&&((a=a||{}).scopedSlots={default:s[0]},s.length=0);c===Pe?s=oe(s):c===Ne&&(s=function(t){for(var e=0;e<t.length;e++)if(Array.isArray(t[e]))return Array.prototype.concat.apply([],t);return t}(s));var u,l;if("string"==typeof o){var f;l=t.$vnode&&t.$vnode.ns||L.getTagNamespace(o),u=L.isReservedTag(o)?new lt(L.parsePlatformTagName(o),a,s,void 0,void 0,t):a&&a.pre||!n(f=It(t.$options,"components",o))?new lt(o,a,s,void 0,void 0,t):Ie(f,a,t,s,o)}else u=Ie(o,a,t,s);return Array.isArray(u)?u:n(u)?(n(l)&&function t(o,i,a){o.ns=i;"foreignObject"===o.tag&&(i=void 0,a=!0);if(n(o.children))for(var s=0,c=o.children.length;s<c;s++){var u=o.children[s];n(u.tag)&&(e(u.ns)||r(a)&&"svg"!==u.tag)&&t(u,i,a)}}(u,l),n(a)&&function(t){i(t.style)&&Qt(t.style);i(t.class)&&Qt(t.class)}(a),u):pt()}(t,a,s,c,u)}var Me,Fe=null;function Re(t,e){return(t.__esModule||rt&&"Module"===t[Symbol.toStringTag])&&(t=t.default),i(t)?e.extend(t):t}function Ue(t){return t.isComment&&t.asyncFactory}function He(t){if(Array.isArray(t))for(var e=0;e<t.length;e++){var r=t[e];if(n(r)&&(n(r.componentOptions)||Ue(r)))return r}}function Be(t,e){Me.$on(t,e)}function Ve(t,e){Me.$off(t,e)}function ze(t,e){var n=Me;return function r(){null!==e.apply(null,arguments)&&n.$off(t,r)}}function We(t,e,n){Me=t,ee(e,n||{},Be,Ve,ze,t),Me=void 0}var qe=null;function Ke(t){var e=qe;return qe=t,function(){qe=e}}function Xe(t){for(;t&&(t=t.$parent);)if(t._inactive)return!0;return!1}function Ge(t,e){if(e){if(t._directInactive=!1,Xe(t))return}else if(t._directInactive)return;if(t._inactive||null===t._inactive){t._inactive=!1;for(var n=0;n<t.$children.length;n++)Ge(t.$children[n]);Ze(t,"activated")}}function Ze(t,e){ct();var n=t.$options[e],r=e+" hook";if(n)for(var o=0,i=n.length;o<i;o++)Ft(n[o],t,null,t,r);t._hasHookEvent&&t.$emit("hook:"+e),ut()}var Je=[],Qe=[],Ye={},tn=!1,en=!1,nn=0;var rn=0,on=Date.now;if(H&&!W){var an=window.performance;an&&"function"==typeof an.now&&on()>document.createEvent("Event").timeStamp&&(on=function(){return an.now()})}function sn(){var t,e;for(rn=on(),en=!0,Je.sort(function(t,e){return t.id-e.id}),nn=0;nn<Je.length;nn++)(t=Je[nn]).before&&t.before(),e=t.id,Ye[e]=null,t.run();var n=Qe.slice(),r=Je.slice();nn=Je.length=Qe.length=0,Ye={},tn=en=!1,function(t){for(var e=0;e<t.length;e++)t[e]._inactive=!0,Ge(t[e],!0)}(n),function(t){var e=t.length;for(;e--;){var n=t[e],r=n.vm;r._watcher===n&&r._isMounted&&!r._isDestroyed&&Ze(r,"updated")}}(r),tt&&L.devtools&&tt.emit("flush")}var cn=0,un=function(t,e,n,r,o){this.vm=t,o&&(t._watcher=this),t._watchers.push(this),r?(this.deep=!!r.deep,this.user=!!r.user,this.lazy=!!r.lazy,this.sync=!!r.sync,this.before=r.before):this.deep=this.user=this.lazy=this.sync=!1,this.cb=n,this.id=++cn,this.active=!0,this.dirty=this.lazy,this.deps=[],this.newDeps=[],this.depIds=new nt,this.newDepIds=new nt,this.expression="","function"==typeof e?this.getter=e:(this.getter=function(t){if(!F.test(t)){var e=t.split(".");return function(t){for(var n=0;n<e.length;n++){if(!t)return;t=t[e[n]]}return t}}}(e),this.getter||(this.getter=k)),this.value=this.lazy?void 0:this.get()};un.prototype.get=function(){var t;ct(this);var e=this.vm;try{t=this.getter.call(e,e)}catch(t){if(!this.user)throw t;Mt(t,e,'getter for watcher "'+this.expression+'"')}finally{this.deep&&Qt(t),ut(),this.cleanupDeps()}return t},un.prototype.addDep=function(t){var e=t.id;this.newDepIds.has(e)||(this.newDepIds.add(e),this.newDeps.push(t),this.depIds.has(e)||t.addSub(this))},un.prototype.cleanupDeps=function(){for(var t=this.deps.length;t--;){var e=this.deps[t];this.newDepIds.has(e.id)||e.removeSub(this)}var n=this.depIds;this.depIds=this.newDepIds,this.newDepIds=n,this.newDepIds.clear(),n=this.deps,this.deps=this.newDeps,this.newDeps=n,this.newDeps.length=0},un.prototype.update=function(){this.lazy?this.dirty=!0:this.sync?this.run():function(t){var e=t.id;if(null==Ye[e]){if(Ye[e]=!0,en){for(var n=Je.length-1;n>nn&&Je[n].id>t.id;)n--;Je.splice(n+1,0,t)}else Je.push(t);tn||(tn=!0,Zt(sn))}}(this)},un.prototype.run=function(){if(this.active){var t=this.get();if(t!==this.value||i(t)||this.deep){var e=this.value;if(this.value=t,this.user)try{this.cb.call(this.vm,t,e)}catch(t){Mt(t,this.vm,'callback for watcher "'+this.expression+'"')}else this.cb.call(this.vm,t,e)}}},un.prototype.evaluate=function(){this.value=this.get(),this.dirty=!1},un.prototype.depend=function(){for(var t=this.deps.length;t--;)this.deps[t].depend()},un.prototype.teardown=function(){if(this.active){this.vm._isBeingDestroyed||v(this.vm._watchers,this);for(var t=this.deps.length;t--;)this.deps[t].removeSub(this);this.active=!1}};var ln={enumerable:!0,configurable:!0,get:k,set:k};function fn(t,e,n){ln.get=function(){return this[e][n]},ln.set=function(t){this[e][n]=t},Object.defineProperty(t,n,ln)}function pn(t){t._watchers=[];var e=t.$options;e.props&&function(t,e){var n=t.$options.propsData||{},r=t._props={},o=t.$options._propKeys=[];t.$parent&&_t(!1);var i=function(i){o.push(i);var a=Dt(i,e,n,t);$t(r,i,a),i in t||fn(t,"_props",i)};for(var a in e)i(a);_t(!0)}(t,e.props),e.methods&&function(t,e){t.$options.props;for(var n in e)t[n]="function"!=typeof e[n]?k:w(e[n],t)}(t,e.methods),e.data?function(t){var e=t.$options.data;s(e=t._data="function"==typeof e?function(t,e){ct();try{return t.call(e,e)}catch(t){return Mt(t,e,"data()"),{}}finally{ut()}}(e,t):e||{})||(e={});var n=Object.keys(e),r=t.$options.props,o=(t.$options.methods,n.length);for(;o--;){var i=n[o];r&&m(r,i)||(a=void 0,36!==(a=(i+"").charCodeAt(0))&&95!==a&&fn(t,"_data",i))}var a;Ct(e,!0)}(t):Ct(t._data={},!0),e.computed&&function(t,e){var n=t._computedWatchers=Object.create(null),r=Y();for(var o in e){var i=e[o],a="function"==typeof i?i:i.get;r||(n[o]=new un(t,a||k,k,dn)),o in t||vn(t,o,i)}}(t,e.computed),e.watch&&e.watch!==Z&&function(t,e){for(var n in e){var r=e[n];if(Array.isArray(r))for(var o=0;o<r.length;o++)yn(t,n,r[o]);else yn(t,n,r)}}(t,e.watch)}var dn={lazy:!0};function vn(t,e,n){var r=!Y();"function"==typeof n?(ln.get=r?hn(e):mn(n),ln.set=k):(ln.get=n.get?r&&!1!==n.cache?hn(e):mn(n.get):k,ln.set=n.set||k),Object.defineProperty(t,e,ln)}function hn(t){return function(){var e=this._computedWatchers&&this._computedWatchers[t];if(e)return e.dirty&&e.evaluate(),at.target&&e.depend(),e.value}}function mn(t){return function(){return t.call(this,this)}}function yn(t,e,n,r){return s(n)&&(r=n,n=n.handler),"string"==typeof n&&(n=t[n]),t.$watch(e,n,r)}var gn=0;function _n(t){var e=t.options;if(t.super){var n=_n(t.super);if(n!==t.superOptions){t.superOptions=n;var r=function(t){var e,n=t.options,r=t.sealedOptions;for(var o in n)n[o]!==r[o]&&(e||(e={}),e[o]=n[o]);return e}(t);r&&x(t.extendOptions,r),(e=t.options=Tt(n,t.extendOptions)).name&&(e.components[e.name]=t)}}return e}function bn(t){this._init(t)}function Cn(t){t.cid=0;var e=1;t.extend=function(t){t=t||{};var n=this,r=n.cid,o=t._Ctor||(t._Ctor={});if(o[r])return o[r];var i=t.name||n.options.name,a=function(t){this._init(t)};return(a.prototype=Object.create(n.prototype)).constructor=a,a.cid=e++,a.options=Tt(n.options,t),a.super=n,a.options.props&&function(t){var e=t.options.props;for(var n in e)fn(t.prototype,"_props",n)}(a),a.options.computed&&function(t){var e=t.options.computed;for(var n in e)vn(t.prototype,n,e[n])}(a),a.extend=n.extend,a.mixin=n.mixin,a.use=n.use,N.forEach(function(t){a[t]=n[t]}),i&&(a.options.components[i]=a),a.superOptions=n.options,a.extendOptions=t,a.sealedOptions=x({},a.options),o[r]=a,a}}function $n(t){return t&&(t.Ctor.options.name||t.tag)}function wn(t,e){return Array.isArray(t)?t.indexOf(e)>-1:"string"==typeof t?t.split(",").indexOf(e)>-1:(n=t,"[object RegExp]"===a.call(n)&&t.test(e));var n}function An(t,e){var n=t.cache,r=t.keys,o=t._vnode;for(var i in n){var a=n[i];if(a){var s=$n(a.componentOptions);s&&!e(s)&&xn(n,i,r,o)}}}function xn(t,e,n,r){var o=t[e];!o||r&&o.tag===r.tag||o.componentInstance.$destroy(),t[e]=null,v(n,e)}!function(e){e.prototype._init=function(e){var n=this;n._uid=gn++,n._isVue=!0,e&&e._isComponent?function(t,e){var n=t.$options=Object.create(t.constructor.options),r=e._parentVnode;n.parent=e.parent,n._parentVnode=r;var o=r.componentOptions;n.propsData=o.propsData,n._parentListeners=o.listeners,n._renderChildren=o.children,n._componentTag=o.tag,e.render&&(n.render=e.render,n.staticRenderFns=e.staticRenderFns)}(n,e):n.$options=Tt(_n(n.constructor),e||{},n),n._renderProxy=n,n._self=n,function(t){var e=t.$options,n=e.parent;if(n&&!e.abstract){for(;n.$options.abstract&&n.$parent;)n=n.$parent;n.$children.push(t)}t.$parent=n,t.$root=n?n.$root:t,t.$children=[],t.$refs={},t._watcher=null,t._inactive=null,t._directInactive=!1,t._isMounted=!1,t._isDestroyed=!1,t._isBeingDestroyed=!1}(n),function(t){t._events=Object.create(null),t._hasHookEvent=!1;var e=t.$options._parentListeners;e&&We(t,e)}(n),function(e){e._vnode=null,e._staticTrees=null;var n=e.$options,r=e.$vnode=n._parentVnode,o=r&&r.context;e.$slots=se(n._renderChildren,o),e.$scopedSlots=t,e._c=function(t,n,r,o){return Le(e,t,n,r,o,!1)},e.$createElement=function(t,n,r,o){return Le(e,t,n,r,o,!0)};var i=r&&r.data;$t(e,"$attrs",i&&i.attrs||t,null,!0),$t(e,"$listeners",n._parentListeners||t,null,!0)}(n),Ze(n,"beforeCreate"),function(t){var e=ae(t.$options.inject,t);e&&(_t(!1),Object.keys(e).forEach(function(n){$t(t,n,e[n])}),_t(!0))}(n),pn(n),function(t){var e=t.$options.provide;e&&(t._provided="function"==typeof e?e.call(t):e)}(n),Ze(n,"created"),n.$options.el&&n.$mount(n.$options.el)}}(bn),function(t){var e={get:function(){return this._data}},n={get:function(){return this._props}};Object.defineProperty(t.prototype,"$data",e),Object.defineProperty(t.prototype,"$props",n),t.prototype.$set=wt,t.prototype.$delete=At,t.prototype.$watch=function(t,e,n){if(s(e))return yn(this,t,e,n);(n=n||{}).user=!0;var r=new un(this,t,e,n);if(n.immediate)try{e.call(this,r.value)}catch(t){Mt(t,this,'callback for immediate watcher "'+r.expression+'"')}return function(){r.teardown()}}}(bn),function(t){var e=/^hook:/;t.prototype.$on=function(t,n){var r=this;if(Array.isArray(t))for(var o=0,i=t.length;o<i;o++)r.$on(t[o],n);else(r._events[t]||(r._events[t]=[])).push(n),e.test(t)&&(r._hasHookEvent=!0);return r},t.prototype.$once=function(t,e){var n=this;function r(){n.$off(t,r),e.apply(n,arguments)}return r.fn=e,n.$on(t,r),n},t.prototype.$off=function(t,e){var n=this;if(!arguments.length)return n._events=Object.create(null),n;if(Array.isArray(t)){for(var r=0,o=t.length;r<o;r++)n.$off(t[r],e);return n}var i,a=n._events[t];if(!a)return n;if(!e)return n._events[t]=null,n;for(var s=a.length;s--;)if((i=a[s])===e||i.fn===e){a.splice(s,1);break}return n},t.prototype.$emit=function(t){var e=this._events[t];if(e){e=e.length>1?A(e):e;for(var n=A(arguments,1),r='event handler for "'+t+'"',o=0,i=e.length;o<i;o++)Ft(e[o],this,n,this,r)}return this}}(bn),function(t){t.prototype._update=function(t,e){var n=this,r=n.$el,o=n._vnode,i=Ke(n);n._vnode=t,n.$el=o?n.__patch__(o,t):n.__patch__(n.$el,t,e,!1),i(),r&&(r.__vue__=null),n.$el&&(n.$el.__vue__=n),n.$vnode&&n.$parent&&n.$vnode===n.$parent._vnode&&(n.$parent.$el=n.$el)},t.prototype.$forceUpdate=function(){this._watcher&&this._watcher.update()},t.prototype.$destroy=function(){var t=this;if(!t._isBeingDestroyed){Ze(t,"beforeDestroy"),t._isBeingDestroyed=!0;var e=t.$parent;!e||e._isBeingDestroyed||t.$options.abstract||v(e.$children,t),t._watcher&&t._watcher.teardown();for(var n=t._watchers.length;n--;)t._watchers[n].teardown();t._data.__ob__&&t._data.__ob__.vmCount--,t._isDestroyed=!0,t.__patch__(t._vnode,null),Ze(t,"destroyed"),t.$off(),t.$el&&(t.$el.__vue__=null),t.$vnode&&(t.$vnode.parent=null)}}}(bn),function(t){Oe(t.prototype),t.prototype.$nextTick=function(t){return Zt(t,this)},t.prototype._render=function(){var t,e=this,n=e.$options,r=n.render,o=n._parentVnode;o&&(e.$scopedSlots=ue(o.data.scopedSlots,e.$slots,e.$scopedSlots)),e.$vnode=o;try{Fe=e,t=r.call(e._renderProxy,e.$createElement)}catch(n){Mt(n,e,"render"),t=e._vnode}finally{Fe=null}return Array.isArray(t)&&1===t.length&&(t=t[0]),t instanceof lt||(t=pt()),t.parent=o,t}}(bn);var On=[String,RegExp,Array],kn={KeepAlive:{name:"keep-alive",abstract:!0,props:{include:On,exclude:On,max:[String,Number]},created:function(){this.cache=Object.create(null),this.keys=[]},destroyed:function(){for(var t in this.cache)xn(this.cache,t,this.keys)},mounted:function(){var t=this;this.$watch("include",function(e){An(t,function(t){return wn(e,t)})}),this.$watch("exclude",function(e){An(t,function(t){return!wn(e,t)})})},render:function(){var t=this.$slots.default,e=He(t),n=e&&e.componentOptions;if(n){var r=$n(n),o=this.include,i=this.exclude;if(o&&(!r||!wn(o,r))||i&&r&&wn(i,r))return e;var a=this.cache,s=this.keys,c=null==e.key?n.Ctor.cid+(n.tag?"::"+n.tag:""):e.key;a[c]?(e.componentInstance=a[c].componentInstance,v(s,c),s.push(c)):(a[c]=e,s.push(c),this.max&&s.length>parseInt(this.max)&&xn(a,s[0],s,this._vnode)),e.data.keepAlive=!0}return e||t&&t[0]}}};!function(t){var e={get:function(){return L}};Object.defineProperty(t,"config",e),t.util={warn:ot,extend:x,mergeOptions:Tt,defineReactive:$t},t.set=wt,t.delete=At,t.nextTick=Zt,t.observable=function(t){return Ct(t),t},t.options=Object.create(null),N.forEach(function(e){t.options[e+"s"]=Object.create(null)}),t.options._base=t,x(t.options.components,kn),function(t){t.use=function(t){var e=this._installedPlugins||(this._installedPlugins=[]);if(e.indexOf(t)>-1)return this;var n=A(arguments,1);return n.unshift(this),"function"==typeof t.install?t.install.apply(t,n):"function"==typeof t&&t.apply(null,n),e.push(t),this}}(t),function(t){t.mixin=function(t){return this.options=Tt(this.options,t),this}}(t),Cn(t),function(t){N.forEach(function(e){t[e]=function(t,n){return n?("component"===e&&s(n)&&(n.name=n.name||t,n=this.options._base.extend(n)),"directive"===e&&"function"==typeof n&&(n={bind:n,update:n}),this.options[e+"s"][t]=n,n):this.options[e+"s"][t]}})}(t)}(bn),Object.defineProperty(bn.prototype,"$isServer",{get:Y}),Object.defineProperty(bn.prototype,"$ssrContext",{get:function(){return this.$vnode&&this.$vnode.ssrContext}}),Object.defineProperty(bn,"FunctionalRenderContext",{value:ke}),bn.version="2.6.11";var Sn=p("style,class"),En=p("input,textarea,option,select,progress"),jn=p("contenteditable,draggable,spellcheck"),Tn=p("events,caret,typing,plaintext-only"),In=function(t,e){return Mn(e)||"false"===e?"false":"contenteditable"===t&&Tn(e)?e:"true"},Dn=p("allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,translate,truespeed,typemustmatch,visible"),Nn="http://www.w3.org/1999/xlink",Pn=function(t){return":"===t.charAt(5)&&"xlink"===t.slice(0,5)},Ln=function(t){return Pn(t)?t.slice(6,t.length):""},Mn=function(t){return null==t||!1===t};function Fn(t){for(var e=t.data,r=t,o=t;n(o.componentInstance);)(o=o.componentInstance._vnode)&&o.data&&(e=Rn(o.data,e));for(;n(r=r.parent);)r&&r.data&&(e=Rn(e,r.data));return function(t,e){if(n(t)||n(e))return Un(t,Hn(e));return""}(e.staticClass,e.class)}function Rn(t,e){return{staticClass:Un(t.staticClass,e.staticClass),class:n(t.class)?[t.class,e.class]:e.class}}function Un(t,e){return t?e?t+" "+e:t:e||""}function Hn(t){return Array.isArray(t)?function(t){for(var e,r="",o=0,i=t.length;o<i;o++)n(e=Hn(t[o]))&&""!==e&&(r&&(r+=" "),r+=e);return r}(t):i(t)?function(t){var e="";for(var n in t)t[n]&&(e&&(e+=" "),e+=n);return e}(t):"string"==typeof t?t:""}var Bn={svg:"http://www.w3.org/2000/svg",math:"http://www.w3.org/1998/Math/MathML"},Vn=p("html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot"),zn=p("svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view",!0),Wn=function(t){return Vn(t)||zn(t)};var qn=Object.create(null);var Kn=p("text,number,password,search,email,tel,url");var Xn=Object.freeze({createElement:function(t,e){var n=document.createElement(t);return"select"!==t?n:(e.data&&e.data.attrs&&void 0!==e.data.attrs.multiple&&n.setAttribute("multiple","multiple"),n)},createElementNS:function(t,e){return document.createElementNS(Bn[t],e)},createTextNode:function(t){return document.createTextNode(t)},createComment:function(t){return document.createComment(t)},insertBefore:function(t,e,n){t.insertBefore(e,n)},removeChild:function(t,e){t.removeChild(e)},appendChild:function(t,e){t.appendChild(e)},parentNode:function(t){return t.parentNode},nextSibling:function(t){return t.nextSibling},tagName:function(t){return t.tagName},setTextContent:function(t,e){t.textContent=e},setStyleScope:function(t,e){t.setAttribute(e,"")}}),Gn={create:function(t,e){Zn(e)},update:function(t,e){t.data.ref!==e.data.ref&&(Zn(t,!0),Zn(e))},destroy:function(t){Zn(t,!0)}};function Zn(t,e){var r=t.data.ref;if(n(r)){var o=t.context,i=t.componentInstance||t.elm,a=o.$refs;e?Array.isArray(a[r])?v(a[r],i):a[r]===i&&(a[r]=void 0):t.data.refInFor?Array.isArray(a[r])?a[r].indexOf(i)<0&&a[r].push(i):a[r]=[i]:a[r]=i}}var Jn=new lt("",{},[]),Qn=["create","activate","update","remove","destroy"];function Yn(t,o){return t.key===o.key&&(t.tag===o.tag&&t.isComment===o.isComment&&n(t.data)===n(o.data)&&function(t,e){if("input"!==t.tag)return!0;var r,o=n(r=t.data)&&n(r=r.attrs)&&r.type,i=n(r=e.data)&&n(r=r.attrs)&&r.type;return o===i||Kn(o)&&Kn(i)}(t,o)||r(t.isAsyncPlaceholder)&&t.asyncFactory===o.asyncFactory&&e(o.asyncFactory.error))}function tr(t,e,r){var o,i,a={};for(o=e;o<=r;++o)n(i=t[o].key)&&(a[i]=o);return a}var er={create:nr,update:nr,destroy:function(t){nr(t,Jn)}};function nr(t,e){(t.data.directives||e.data.directives)&&function(t,e){var n,r,o,i=t===Jn,a=e===Jn,s=or(t.data.directives,t.context),c=or(e.data.directives,e.context),u=[],l=[];for(n in c)r=s[n],o=c[n],r?(o.oldValue=r.value,o.oldArg=r.arg,ar(o,"update",e,t),o.def&&o.def.componentUpdated&&l.push(o)):(ar(o,"bind",e,t),o.def&&o.def.inserted&&u.push(o));if(u.length){var f=function(){for(var n=0;n<u.length;n++)ar(u[n],"inserted",e,t)};i?ne(e,"insert",f):f()}l.length&&ne(e,"postpatch",function(){for(var n=0;n<l.length;n++)ar(l[n],"componentUpdated",e,t)});if(!i)for(n in s)c[n]||ar(s[n],"unbind",t,t,a)}(t,e)}var rr=Object.create(null);function or(t,e){var n,r,o=Object.create(null);if(!t)return o;for(n=0;n<t.length;n++)(r=t[n]).modifiers||(r.modifiers=rr),o[ir(r)]=r,r.def=It(e.$options,"directives",r.name);return o}function ir(t){return t.rawName||t.name+"."+Object.keys(t.modifiers||{}).join(".")}function ar(t,e,n,r,o){var i=t.def&&t.def[e];if(i)try{i(n.elm,t,n,r,o)}catch(r){Mt(r,n.context,"directive "+t.name+" "+e+" hook")}}var sr=[Gn,er];function cr(t,r){var o=r.componentOptions;if(!(n(o)&&!1===o.Ctor.options.inheritAttrs||e(t.data.attrs)&&e(r.data.attrs))){var i,a,s=r.elm,c=t.data.attrs||{},u=r.data.attrs||{};for(i in n(u.__ob__)&&(u=r.data.attrs=x({},u)),u)a=u[i],c[i]!==a&&ur(s,i,a);for(i in(W||K)&&u.value!==c.value&&ur(s,"value",u.value),c)e(u[i])&&(Pn(i)?s.removeAttributeNS(Nn,Ln(i)):jn(i)||s.removeAttribute(i))}}function ur(t,e,n){t.tagName.indexOf("-")>-1?lr(t,e,n):Dn(e)?Mn(n)?t.removeAttribute(e):(n="allowfullscreen"===e&&"EMBED"===t.tagName?"true":e,t.setAttribute(e,n)):jn(e)?t.setAttribute(e,In(e,n)):Pn(e)?Mn(n)?t.removeAttributeNS(Nn,Ln(e)):t.setAttributeNS(Nn,e,n):lr(t,e,n)}function lr(t,e,n){if(Mn(n))t.removeAttribute(e);else{if(W&&!q&&"TEXTAREA"===t.tagName&&"placeholder"===e&&""!==n&&!t.__ieph){var r=function(e){e.stopImmediatePropagation(),t.removeEventListener("input",r)};t.addEventListener("input",r),t.__ieph=!0}t.setAttribute(e,n)}}var fr={create:cr,update:cr};function pr(t,r){var o=r.elm,i=r.data,a=t.data;if(!(e(i.staticClass)&&e(i.class)&&(e(a)||e(a.staticClass)&&e(a.class)))){var s=Fn(r),c=o._transitionClasses;n(c)&&(s=Un(s,Hn(c))),s!==o._prevClass&&(o.setAttribute("class",s),o._prevClass=s)}}var dr,vr={create:pr,update:pr},hr="__r",mr="__c";function yr(t,e,n){var r=dr;return function o(){null!==e.apply(null,arguments)&&br(t,o,n,r)}}var gr=Bt&&!(G&&Number(G[1])<=53);function _r(t,e,n,r){if(gr){var o=rn,i=e;e=i._wrapper=function(t){if(t.target===t.currentTarget||t.timeStamp>=o||t.timeStamp<=0||t.target.ownerDocument!==document)return i.apply(this,arguments)}}dr.addEventListener(t,e,J?{capture:n,passive:r}:n)}function br(t,e,n,r){(r||dr).removeEventListener(t,e._wrapper||e,n)}function Cr(t,r){if(!e(t.data.on)||!e(r.data.on)){var o=r.data.on||{},i=t.data.on||{};dr=r.elm,function(t){if(n(t[hr])){var e=W?"change":"input";t[e]=[].concat(t[hr],t[e]||[]),delete t[hr]}n(t[mr])&&(t.change=[].concat(t[mr],t.change||[]),delete t[mr])}(o),ee(o,i,_r,br,yr,r.context),dr=void 0}}var $r,wr={create:Cr,update:Cr};function Ar(t,r){if(!e(t.data.domProps)||!e(r.data.domProps)){var o,i,a=r.elm,s=t.data.domProps||{},c=r.data.domProps||{};for(o in n(c.__ob__)&&(c=r.data.domProps=x({},c)),s)o in c||(a[o]="");for(o in c){if(i=c[o],"textContent"===o||"innerHTML"===o){if(r.children&&(r.children.length=0),i===s[o])continue;1===a.childNodes.length&&a.removeChild(a.childNodes[0])}if("value"===o&&"PROGRESS"!==a.tagName){a._value=i;var u=e(i)?"":String(i);xr(a,u)&&(a.value=u)}else if("innerHTML"===o&&zn(a.tagName)&&e(a.innerHTML)){($r=$r||document.createElement("div")).innerHTML="<svg>"+i+"</svg>";for(var l=$r.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;l.firstChild;)a.appendChild(l.firstChild)}else if(i!==s[o])try{a[o]=i}catch(t){}}}}function xr(t,e){return!t.composing&&("OPTION"===t.tagName||function(t,e){var n=!0;try{n=document.activeElement!==t}catch(t){}return n&&t.value!==e}(t,e)||function(t,e){var r=t.value,o=t._vModifiers;if(n(o)){if(o.number)return f(r)!==f(e);if(o.trim)return r.trim()!==e.trim()}return r!==e}(t,e))}var Or={create:Ar,update:Ar},kr=y(function(t){var e={},n=/:(.+)/;return t.split(/;(?![^(]*\))/g).forEach(function(t){if(t){var r=t.split(n);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e});function Sr(t){var e=Er(t.style);return t.staticStyle?x(t.staticStyle,e):e}function Er(t){return Array.isArray(t)?O(t):"string"==typeof t?kr(t):t}var jr,Tr=/^--/,Ir=/\s*!important$/,Dr=function(t,e,n){if(Tr.test(e))t.style.setProperty(e,n);else if(Ir.test(n))t.style.setProperty($(e),n.replace(Ir,""),"important");else{var r=Pr(e);if(Array.isArray(n))for(var o=0,i=n.length;o<i;o++)t.style[r]=n[o];else t.style[r]=n}},Nr=["Webkit","Moz","ms"],Pr=y(function(t){if(jr=jr||document.createElement("div").style,"filter"!==(t=_(t))&&t in jr)return t;for(var e=t.charAt(0).toUpperCase()+t.slice(1),n=0;n<Nr.length;n++){var r=Nr[n]+e;if(r in jr)return r}});function Lr(t,r){var o=r.data,i=t.data;if(!(e(o.staticStyle)&&e(o.style)&&e(i.staticStyle)&&e(i.style))){var a,s,c=r.elm,u=i.staticStyle,l=i.normalizedStyle||i.style||{},f=u||l,p=Er(r.data.style)||{};r.data.normalizedStyle=n(p.__ob__)?x({},p):p;var d=function(t,e){var n,r={};if(e)for(var o=t;o.componentInstance;)(o=o.componentInstance._vnode)&&o.data&&(n=Sr(o.data))&&x(r,n);(n=Sr(t.data))&&x(r,n);for(var i=t;i=i.parent;)i.data&&(n=Sr(i.data))&&x(r,n);return r}(r,!0);for(s in f)e(d[s])&&Dr(c,s,"");for(s in d)(a=d[s])!==f[s]&&Dr(c,s,null==a?"":a)}}var Mr={create:Lr,update:Lr},Fr=/\s+/;function Rr(t,e){if(e&&(e=e.trim()))if(t.classList)e.indexOf(" ")>-1?e.split(Fr).forEach(function(e){return t.classList.add(e)}):t.classList.add(e);else{var n=" "+(t.getAttribute("class")||"")+" ";n.indexOf(" "+e+" ")<0&&t.setAttribute("class",(n+e).trim())}}function Ur(t,e){if(e&&(e=e.trim()))if(t.classList)e.indexOf(" ")>-1?e.split(Fr).forEach(function(e){return t.classList.remove(e)}):t.classList.remove(e),t.classList.length||t.removeAttribute("class");else{for(var n=" "+(t.getAttribute("class")||"")+" ",r=" "+e+" ";n.indexOf(r)>=0;)n=n.replace(r," ");(n=n.trim())?t.setAttribute("class",n):t.removeAttribute("class")}}function Hr(t){if(t){if("object"==typeof t){var e={};return!1!==t.css&&x(e,Br(t.name||"v")),x(e,t),e}return"string"==typeof t?Br(t):void 0}}var Br=y(function(t){return{enterClass:t+"-enter",enterToClass:t+"-enter-to",enterActiveClass:t+"-enter-active",leaveClass:t+"-leave",leaveToClass:t+"-leave-to",leaveActiveClass:t+"-leave-active"}}),Vr=H&&!q,zr="transition",Wr="animation",qr="transition",Kr="transitionend",Xr="animation",Gr="animationend";Vr&&(void 0===window.ontransitionend&&void 0!==window.onwebkittransitionend&&(qr="WebkitTransition",Kr="webkitTransitionEnd"),void 0===window.onanimationend&&void 0!==window.onwebkitanimationend&&(Xr="WebkitAnimation",Gr="webkitAnimationEnd"));var Zr=H?window.requestAnimationFrame?window.requestAnimationFrame.bind(window):setTimeout:function(t){return t()};function Jr(t){Zr(function(){Zr(t)})}function Qr(t,e){var n=t._transitionClasses||(t._transitionClasses=[]);n.indexOf(e)<0&&(n.push(e),Rr(t,e))}function Yr(t,e){t._transitionClasses&&v(t._transitionClasses,e),Ur(t,e)}function to(t,e,n){var r=no(t,e),o=r.type,i=r.timeout,a=r.propCount;if(!o)return n();var s=o===zr?Kr:Gr,c=0,u=function(){t.removeEventListener(s,l),n()},l=function(e){e.target===t&&++c>=a&&u()};setTimeout(function(){c<a&&u()},i+1),t.addEventListener(s,l)}var eo=/\b(transform|all)(,|$)/;function no(t,e){var n,r=window.getComputedStyle(t),o=(r[qr+"Delay"]||"").split(", "),i=(r[qr+"Duration"]||"").split(", "),a=ro(o,i),s=(r[Xr+"Delay"]||"").split(", "),c=(r[Xr+"Duration"]||"").split(", "),u=ro(s,c),l=0,f=0;return e===zr?a>0&&(n=zr,l=a,f=i.length):e===Wr?u>0&&(n=Wr,l=u,f=c.length):f=(n=(l=Math.max(a,u))>0?a>u?zr:Wr:null)?n===zr?i.length:c.length:0,{type:n,timeout:l,propCount:f,hasTransform:n===zr&&eo.test(r[qr+"Property"])}}function ro(t,e){for(;t.length<e.length;)t=t.concat(t);return Math.max.apply(null,e.map(function(e,n){return oo(e)+oo(t[n])}))}function oo(t){return 1e3*Number(t.slice(0,-1).replace(",","."))}function io(t,r){var o=t.elm;n(o._leaveCb)&&(o._leaveCb.cancelled=!0,o._leaveCb());var a=Hr(t.data.transition);if(!e(a)&&!n(o._enterCb)&&1===o.nodeType){for(var s=a.css,c=a.type,u=a.enterClass,l=a.enterToClass,p=a.enterActiveClass,d=a.appearClass,v=a.appearToClass,h=a.appearActiveClass,m=a.beforeEnter,y=a.enter,g=a.afterEnter,_=a.enterCancelled,b=a.beforeAppear,C=a.appear,$=a.afterAppear,w=a.appearCancelled,A=a.duration,x=qe,O=qe.$vnode;O&&O.parent;)x=O.context,O=O.parent;var k=!x._isMounted||!t.isRootInsert;if(!k||C||""===C){var S=k&&d?d:u,E=k&&h?h:p,j=k&&v?v:l,T=k&&b||m,D=k&&"function"==typeof C?C:y,N=k&&$||g,P=k&&w||_,L=f(i(A)?A.enter:A),M=!1!==s&&!q,F=co(D),R=o._enterCb=I(function(){M&&(Yr(o,j),Yr(o,E)),R.cancelled?(M&&Yr(o,S),P&&P(o)):N&&N(o),o._enterCb=null});t.data.show||ne(t,"insert",function(){var e=o.parentNode,n=e&&e._pending&&e._pending[t.key];n&&n.tag===t.tag&&n.elm._leaveCb&&n.elm._leaveCb(),D&&D(o,R)}),T&&T(o),M&&(Qr(o,S),Qr(o,E),Jr(function(){Yr(o,S),R.cancelled||(Qr(o,j),F||(so(L)?setTimeout(R,L):to(o,c,R)))})),t.data.show&&(r&&r(),D&&D(o,R)),M||F||R()}}}function ao(t,r){var o=t.elm;n(o._enterCb)&&(o._enterCb.cancelled=!0,o._enterCb());var a=Hr(t.data.transition);if(e(a)||1!==o.nodeType)return r();if(!n(o._leaveCb)){var s=a.css,c=a.type,u=a.leaveClass,l=a.leaveToClass,p=a.leaveActiveClass,d=a.beforeLeave,v=a.leave,h=a.afterLeave,m=a.leaveCancelled,y=a.delayLeave,g=a.duration,_=!1!==s&&!q,b=co(v),C=f(i(g)?g.leave:g),$=o._leaveCb=I(function(){o.parentNode&&o.parentNode._pending&&(o.parentNode._pending[t.key]=null),_&&(Yr(o,l),Yr(o,p)),$.cancelled?(_&&Yr(o,u),m&&m(o)):(r(),h&&h(o)),o._leaveCb=null});y?y(w):w()}function w(){$.cancelled||(!t.data.show&&o.parentNode&&((o.parentNode._pending||(o.parentNode._pending={}))[t.key]=t),d&&d(o),_&&(Qr(o,u),Qr(o,p),Jr(function(){Yr(o,u),$.cancelled||(Qr(o,l),b||(so(C)?setTimeout($,C):to(o,c,$)))})),v&&v(o,$),_||b||$())}}function so(t){return"number"==typeof t&&!isNaN(t)}function co(t){if(e(t))return!1;var r=t.fns;return n(r)?co(Array.isArray(r)?r[0]:r):(t._length||t.length)>1}function uo(t,e){!0!==e.data.show&&io(e)}var lo=function(t){var i,a,s={},c=t.modules,u=t.nodeOps;for(i=0;i<Qn.length;++i)for(s[Qn[i]]=[],a=0;a<c.length;++a)n(c[a][Qn[i]])&&s[Qn[i]].push(c[a][Qn[i]]);function l(t){var e=u.parentNode(t);n(e)&&u.removeChild(e,t)}function f(t,e,o,i,a,c,l){if(n(t.elm)&&n(c)&&(t=c[l]=vt(t)),t.isRootInsert=!a,!function(t,e,o,i){var a=t.data;if(n(a)){var c=n(t.componentInstance)&&a.keepAlive;if(n(a=a.hook)&&n(a=a.init)&&a(t,!1),n(t.componentInstance))return d(t,e),v(o,t.elm,i),r(c)&&function(t,e,r,o){for(var i,a=t;a.componentInstance;)if(a=a.componentInstance._vnode,n(i=a.data)&&n(i=i.transition)){for(i=0;i<s.activate.length;++i)s.activate[i](Jn,a);e.push(a);break}v(r,t.elm,o)}(t,e,o,i),!0}}(t,e,o,i)){var f=t.data,p=t.children,m=t.tag;n(m)?(t.elm=t.ns?u.createElementNS(t.ns,m):u.createElement(m,t),g(t),h(t,p,e),n(f)&&y(t,e),v(o,t.elm,i)):r(t.isComment)?(t.elm=u.createComment(t.text),v(o,t.elm,i)):(t.elm=u.createTextNode(t.text),v(o,t.elm,i))}}function d(t,e){n(t.data.pendingInsert)&&(e.push.apply(e,t.data.pendingInsert),t.data.pendingInsert=null),t.elm=t.componentInstance.$el,m(t)?(y(t,e),g(t)):(Zn(t),e.push(t))}function v(t,e,r){n(t)&&(n(r)?u.parentNode(r)===t&&u.insertBefore(t,e,r):u.appendChild(t,e))}function h(t,e,n){if(Array.isArray(e))for(var r=0;r<e.length;++r)f(e[r],n,t.elm,null,!0,e,r);else o(t.text)&&u.appendChild(t.elm,u.createTextNode(String(t.text)))}function m(t){for(;t.componentInstance;)t=t.componentInstance._vnode;return n(t.tag)}function y(t,e){for(var r=0;r<s.create.length;++r)s.create[r](Jn,t);n(i=t.data.hook)&&(n(i.create)&&i.create(Jn,t),n(i.insert)&&e.push(t))}function g(t){var e;if(n(e=t.fnScopeId))u.setStyleScope(t.elm,e);else for(var r=t;r;)n(e=r.context)&&n(e=e.$options._scopeId)&&u.setStyleScope(t.elm,e),r=r.parent;n(e=qe)&&e!==t.context&&e!==t.fnContext&&n(e=e.$options._scopeId)&&u.setStyleScope(t.elm,e)}function _(t,e,n,r,o,i){for(;r<=o;++r)f(n[r],i,t,e,!1,n,r)}function b(t){var e,r,o=t.data;if(n(o))for(n(e=o.hook)&&n(e=e.destroy)&&e(t),e=0;e<s.destroy.length;++e)s.destroy[e](t);if(n(e=t.children))for(r=0;r<t.children.length;++r)b(t.children[r])}function C(t,e,r){for(;e<=r;++e){var o=t[e];n(o)&&(n(o.tag)?($(o),b(o)):l(o.elm))}}function $(t,e){if(n(e)||n(t.data)){var r,o=s.remove.length+1;for(n(e)?e.listeners+=o:e=function(t,e){function n(){0==--n.listeners&&l(t)}return n.listeners=e,n}(t.elm,o),n(r=t.componentInstance)&&n(r=r._vnode)&&n(r.data)&&$(r,e),r=0;r<s.remove.length;++r)s.remove[r](t,e);n(r=t.data.hook)&&n(r=r.remove)?r(t,e):e()}else l(t.elm)}function w(t,e,r,o){for(var i=r;i<o;i++){var a=e[i];if(n(a)&&Yn(t,a))return i}}function A(t,o,i,a,c,l){if(t!==o){n(o.elm)&&n(a)&&(o=a[c]=vt(o));var p=o.elm=t.elm;if(r(t.isAsyncPlaceholder))n(o.asyncFactory.resolved)?k(t.elm,o,i):o.isAsyncPlaceholder=!0;else if(r(o.isStatic)&&r(t.isStatic)&&o.key===t.key&&(r(o.isCloned)||r(o.isOnce)))o.componentInstance=t.componentInstance;else{var d,v=o.data;n(v)&&n(d=v.hook)&&n(d=d.prepatch)&&d(t,o);var h=t.children,y=o.children;if(n(v)&&m(o)){for(d=0;d<s.update.length;++d)s.update[d](t,o);n(d=v.hook)&&n(d=d.update)&&d(t,o)}e(o.text)?n(h)&&n(y)?h!==y&&function(t,r,o,i,a){for(var s,c,l,p=0,d=0,v=r.length-1,h=r[0],m=r[v],y=o.length-1,g=o[0],b=o[y],$=!a;p<=v&&d<=y;)e(h)?h=r[++p]:e(m)?m=r[--v]:Yn(h,g)?(A(h,g,i,o,d),h=r[++p],g=o[++d]):Yn(m,b)?(A(m,b,i,o,y),m=r[--v],b=o[--y]):Yn(h,b)?(A(h,b,i,o,y),$&&u.insertBefore(t,h.elm,u.nextSibling(m.elm)),h=r[++p],b=o[--y]):Yn(m,g)?(A(m,g,i,o,d),$&&u.insertBefore(t,m.elm,h.elm),m=r[--v],g=o[++d]):(e(s)&&(s=tr(r,p,v)),e(c=n(g.key)?s[g.key]:w(g,r,p,v))?f(g,i,t,h.elm,!1,o,d):Yn(l=r[c],g)?(A(l,g,i,o,d),r[c]=void 0,$&&u.insertBefore(t,l.elm,h.elm)):f(g,i,t,h.elm,!1,o,d),g=o[++d]);p>v?_(t,e(o[y+1])?null:o[y+1].elm,o,d,y,i):d>y&&C(r,p,v)}(p,h,y,i,l):n(y)?(n(t.text)&&u.setTextContent(p,""),_(p,null,y,0,y.length-1,i)):n(h)?C(h,0,h.length-1):n(t.text)&&u.setTextContent(p,""):t.text!==o.text&&u.setTextContent(p,o.text),n(v)&&n(d=v.hook)&&n(d=d.postpatch)&&d(t,o)}}}function x(t,e,o){if(r(o)&&n(t.parent))t.parent.data.pendingInsert=e;else for(var i=0;i<e.length;++i)e[i].data.hook.insert(e[i])}var O=p("attrs,class,staticClass,staticStyle,key");function k(t,e,o,i){var a,s=e.tag,c=e.data,u=e.children;if(i=i||c&&c.pre,e.elm=t,r(e.isComment)&&n(e.asyncFactory))return e.isAsyncPlaceholder=!0,!0;if(n(c)&&(n(a=c.hook)&&n(a=a.init)&&a(e,!0),n(a=e.componentInstance)))return d(e,o),!0;if(n(s)){if(n(u))if(t.hasChildNodes())if(n(a=c)&&n(a=a.domProps)&&n(a=a.innerHTML)){if(a!==t.innerHTML)return!1}else{for(var l=!0,f=t.firstChild,p=0;p<u.length;p++){if(!f||!k(f,u[p],o,i)){l=!1;break}f=f.nextSibling}if(!l||f)return!1}else h(e,u,o);if(n(c)){var v=!1;for(var m in c)if(!O(m)){v=!0,y(e,o);break}!v&&c.class&&Qt(c.class)}}else t.data!==e.text&&(t.data=e.text);return!0}return function(t,o,i,a){if(!e(o)){var c,l=!1,p=[];if(e(t))l=!0,f(o,p);else{var d=n(t.nodeType);if(!d&&Yn(t,o))A(t,o,p,null,null,a);else{if(d){if(1===t.nodeType&&t.hasAttribute(D)&&(t.removeAttribute(D),i=!0),r(i)&&k(t,o,p))return x(o,p,!0),t;c=t,t=new lt(u.tagName(c).toLowerCase(),{},[],void 0,c)}var v=t.elm,h=u.parentNode(v);if(f(o,p,v._leaveCb?null:h,u.nextSibling(v)),n(o.parent))for(var y=o.parent,g=m(o);y;){for(var _=0;_<s.destroy.length;++_)s.destroy[_](y);if(y.elm=o.elm,g){for(var $=0;$<s.create.length;++$)s.create[$](Jn,y);var w=y.data.hook.insert;if(w.merged)for(var O=1;O<w.fns.length;O++)w.fns[O]()}else Zn(y);y=y.parent}n(h)?C([t],0,0):n(t.tag)&&b(t)}}return x(o,p,l),o.elm}n(t)&&b(t)}}({nodeOps:Xn,modules:[fr,vr,wr,Or,Mr,H?{create:uo,activate:uo,remove:function(t,e){!0!==t.data.show?ao(t,e):e()}}:{}].concat(sr)});q&&document.addEventListener("selectionchange",function(){var t=document.activeElement;t&&t.vmodel&&_o(t,"input")});var fo={inserted:function(t,e,n,r){"select"===n.tag?(r.elm&&!r.elm._vOptions?ne(n,"postpatch",function(){fo.componentUpdated(t,e,n)}):po(t,e,n.context),t._vOptions=[].map.call(t.options,mo)):("textarea"===n.tag||Kn(t.type))&&(t._vModifiers=e.modifiers,e.modifiers.lazy||(t.addEventListener("compositionstart",yo),t.addEventListener("compositionend",go),t.addEventListener("change",go),q&&(t.vmodel=!0)))},componentUpdated:function(t,e,n){if("select"===n.tag){po(t,e,n.context);var r=t._vOptions,o=t._vOptions=[].map.call(t.options,mo);if(o.some(function(t,e){return!j(t,r[e])}))(t.multiple?e.value.some(function(t){return ho(t,o)}):e.value!==e.oldValue&&ho(e.value,o))&&_o(t,"change")}}};function po(t,e,n){vo(t,e,n),(W||K)&&setTimeout(function(){vo(t,e,n)},0)}function vo(t,e,n){var r=e.value,o=t.multiple;if(!o||Array.isArray(r)){for(var i,a,s=0,c=t.options.length;s<c;s++)if(a=t.options[s],o)i=T(r,mo(a))>-1,a.selected!==i&&(a.selected=i);else if(j(mo(a),r))return void(t.selectedIndex!==s&&(t.selectedIndex=s));o||(t.selectedIndex=-1)}}function ho(t,e){return e.every(function(e){return!j(e,t)})}function mo(t){return"_value"in t?t._value:t.value}function yo(t){t.target.composing=!0}function go(t){t.target.composing&&(t.target.composing=!1,_o(t.target,"input"))}function _o(t,e){var n=document.createEvent("HTMLEvents");n.initEvent(e,!0,!0),t.dispatchEvent(n)}function bo(t){return!t.componentInstance||t.data&&t.data.transition?t:bo(t.componentInstance._vnode)}var Co={model:fo,show:{bind:function(t,e,n){var r=e.value,o=(n=bo(n)).data&&n.data.transition,i=t.__vOriginalDisplay="none"===t.style.display?"":t.style.display;r&&o?(n.data.show=!0,io(n,function(){t.style.display=i})):t.style.display=r?i:"none"},update:function(t,e,n){var r=e.value;!r!=!e.oldValue&&((n=bo(n)).data&&n.data.transition?(n.data.show=!0,r?io(n,function(){t.style.display=t.__vOriginalDisplay}):ao(n,function(){t.style.display="none"})):t.style.display=r?t.__vOriginalDisplay:"none")},unbind:function(t,e,n,r,o){o||(t.style.display=t.__vOriginalDisplay)}}},$o={name:String,appear:Boolean,css:Boolean,mode:String,type:String,enterClass:String,leaveClass:String,enterToClass:String,leaveToClass:String,enterActiveClass:String,leaveActiveClass:String,appearClass:String,appearActiveClass:String,appearToClass:String,duration:[Number,String,Object]};function wo(t){var e=t&&t.componentOptions;return e&&e.Ctor.options.abstract?wo(He(e.children)):t}function Ao(t){var e={},n=t.$options;for(var r in n.propsData)e[r]=t[r];var o=n._parentListeners;for(var i in o)e[_(i)]=o[i];return e}function xo(t,e){if(/\d-keep-alive$/.test(e.tag))return t("keep-alive",{props:e.componentOptions.propsData})}var Oo=function(t){return t.tag||Ue(t)},ko=function(t){return"show"===t.name},So={name:"transition",props:$o,abstract:!0,render:function(t){var e=this,n=this.$slots.default;if(n&&(n=n.filter(Oo)).length){var r=this.mode,i=n[0];if(function(t){for(;t=t.parent;)if(t.data.transition)return!0}(this.$vnode))return i;var a=wo(i);if(!a)return i;if(this._leaving)return xo(t,i);var s="__transition-"+this._uid+"-";a.key=null==a.key?a.isComment?s+"comment":s+a.tag:o(a.key)?0===String(a.key).indexOf(s)?a.key:s+a.key:a.key;var c=(a.data||(a.data={})).transition=Ao(this),u=this._vnode,l=wo(u);if(a.data.directives&&a.data.directives.some(ko)&&(a.data.show=!0),l&&l.data&&!function(t,e){return e.key===t.key&&e.tag===t.tag}(a,l)&&!Ue(l)&&(!l.componentInstance||!l.componentInstance._vnode.isComment)){var f=l.data.transition=x({},c);if("out-in"===r)return this._leaving=!0,ne(f,"afterLeave",function(){e._leaving=!1,e.$forceUpdate()}),xo(t,i);if("in-out"===r){if(Ue(a))return u;var p,d=function(){p()};ne(c,"afterEnter",d),ne(c,"enterCancelled",d),ne(f,"delayLeave",function(t){p=t})}}return i}}},Eo=x({tag:String,moveClass:String},$o);function jo(t){t.elm._moveCb&&t.elm._moveCb(),t.elm._enterCb&&t.elm._enterCb()}function To(t){t.data.newPos=t.elm.getBoundingClientRect()}function Io(t){var e=t.data.pos,n=t.data.newPos,r=e.left-n.left,o=e.top-n.top;if(r||o){t.data.moved=!0;var i=t.elm.style;i.transform=i.WebkitTransform="translate("+r+"px,"+o+"px)",i.transitionDuration="0s"}}delete Eo.mode;var Do={Transition:So,TransitionGroup:{props:Eo,beforeMount:function(){var t=this,e=this._update;this._update=function(n,r){var o=Ke(t);t.__patch__(t._vnode,t.kept,!1,!0),t._vnode=t.kept,o(),e.call(t,n,r)}},render:function(t){for(var e=this.tag||this.$vnode.data.tag||"span",n=Object.create(null),r=this.prevChildren=this.children,o=this.$slots.default||[],i=this.children=[],a=Ao(this),s=0;s<o.length;s++){var c=o[s];c.tag&&null!=c.key&&0!==String(c.key).indexOf("__vlist")&&(i.push(c),n[c.key]=c,(c.data||(c.data={})).transition=a)}if(r){for(var u=[],l=[],f=0;f<r.length;f++){var p=r[f];p.data.transition=a,p.data.pos=p.elm.getBoundingClientRect(),n[p.key]?u.push(p):l.push(p)}this.kept=t(e,null,u),this.removed=l}return t(e,null,i)},updated:function(){var t=this.prevChildren,e=this.moveClass||(this.name||"v")+"-move";t.length&&this.hasMove(t[0].elm,e)&&(t.forEach(jo),t.forEach(To),t.forEach(Io),this._reflow=document.body.offsetHeight,t.forEach(function(t){if(t.data.moved){var n=t.elm,r=n.style;Qr(n,e),r.transform=r.WebkitTransform=r.transitionDuration="",n.addEventListener(Kr,n._moveCb=function t(r){r&&r.target!==n||r&&!/transform$/.test(r.propertyName)||(n.removeEventListener(Kr,t),n._moveCb=null,Yr(n,e))})}}))},methods:{hasMove:function(t,e){if(!Vr)return!1;if(this._hasMove)return this._hasMove;var n=t.cloneNode();t._transitionClasses&&t._transitionClasses.forEach(function(t){Ur(n,t)}),Rr(n,e),n.style.display="none",this.$el.appendChild(n);var r=no(n);return this.$el.removeChild(n),this._hasMove=r.hasTransform}}}};bn.config.mustUseProp=function(t,e,n){return"value"===n&&En(t)&&"button"!==e||"selected"===n&&"option"===t||"checked"===n&&"input"===t||"muted"===n&&"video"===t},bn.config.isReservedTag=Wn,bn.config.isReservedAttr=Sn,bn.config.getTagNamespace=function(t){return zn(t)?"svg":"math"===t?"math":void 0},bn.config.isUnknownElement=function(t){if(!H)return!0;if(Wn(t))return!1;if(t=t.toLowerCase(),null!=qn[t])return qn[t];var e=document.createElement(t);return t.indexOf("-")>-1?qn[t]=e.constructor===window.HTMLUnknownElement||e.constructor===window.HTMLElement:qn[t]=/HTMLUnknownElement/.test(e.toString())},x(bn.options.directives,Co),x(bn.options.components,Do),bn.prototype.__patch__=H?lo:k,bn.prototype.$mount=function(t,e){return function(t,e,n){var r;return t.$el=e,t.$options.render||(t.$options.render=pt),Ze(t,"beforeMount"),r=function(){t._update(t._render(),n)},new un(t,r,k,{before:function(){t._isMounted&&!t._isDestroyed&&Ze(t,"beforeUpdate")}},!0),n=!1,null==t.$vnode&&(t._isMounted=!0,Ze(t,"mounted")),t}(this,t=t&&H?function(t){if("string"==typeof t){var e=document.querySelector(t);return e||document.createElement("div")}return t}(t):void 0,e)},H&&setTimeout(function(){L.devtools&&tt&&tt.emit("init",bn)},0),module.exports=bn;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"timers":2}],7:[function(require,module,exports){
var inserted = exports.cache = {}

function noop () {}

exports.insert = function (css) {
  if (inserted[css]) return noop
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return function () {
    document.getElementsByTagName('head')[0].removeChild(elem)
    inserted[css] = false
  }
}

},{}],8:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("@charset \"UTF-8\";\n/* line 3, stdin */\n#about-adam {\n  text-align: justify;\n  width: 600px;\n  max-width: 90%;\n  margin: 0 auto 50px;\n  text-align: left; }\n  /* line 10, stdin */\n  #about-adam .about-header {\n    font-size: 3.5em; }\n  /* line 15, stdin */\n  #about-adam #externalLinks ul {\n    display: flex;\n    justify-content: space-around;\n    margin: 0;\n    padding: 0; }\n    /* line 21, stdin */\n    #about-adam #externalLinks ul li {\n      position: relative;\n      display: inline-block;\n      flex-grow: 1;\n      text-align: center; }\n      /* line 27, stdin */\n      #about-adam #externalLinks ul li:not(:first-of-type) {\n        padding-left: 5px; }\n        /* line 30, stdin */\n        #about-adam #externalLinks ul li:not(:first-of-type)::before {\n          content: \"•\";\n          position: absolute;\n          left: 0; }\n  /* line 40, stdin */\n  #about-adam p {\n    font-size: 0.9em;\n    line-height: 1.5em; }\n    /* line 44, stdin */\n    #about-adam p img {\n      border: 1px solid BLACK;\n      box-shadow: 4px 4px 1px #222;\n      max-width: 40%; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
    }
  },

  components: {
  },

  beforeMount() {
  },

  mounted() {
    globalService.setOfficeDocumentTitle("Adam Alexander");
  },

  methods: {


  },

  computed: {

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"about-adam"}},[_c('div',{staticClass:"about-header"},[_vm._v("Adam Alexander")]),_vm._v(" "),_c('div',{staticClass:"about-desc",attrs:{"id":"externalLinks"}},[_c('ul',[_c('li',[_c('a',{attrs:{"href":"/images/about/adam/adam-alexander-resume-2021.pdf","target":"resume"}},[_vm._v("Résumé")])]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"https://github.com/BotchTheCrab","target":"github"}},[_vm._v("GitHub")])]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"https://www.linkedin.com/in/adam-alexander-7b99b7b0/","target":"linkedin"}},[_vm._v("LinkedIn")])]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"https://twitter.com/BotchTheCrab","target":"twitter"}},[_vm._v("Twitter")])])])]),_vm._v(" "),_c('p',[_c('img',{staticClass:"post-image-left",attrs:{"src":"/images/about/adam/about_adam_dlg_4.jpg","title":"Performing with Die Like Gentlemen"}})]),_c('p',[_vm._v("My first lifelong love was Godzilla. As a little kid I would scan the TV guides on the weekends to make sure I didn't miss a single movie featuring Godzilla (or any other giant monster). I wanted to be Godzilla. I wanted to stomp on the world, make the bullies pay, then leave and be left alone.")]),_vm._v(" "),_c('p',[_vm._v("My second lifelong love was the Transformers. Giant warring robots from another planet really spoke to me. We didn't have much money, so I typically had to wait for birthdays or holidays to acquire a new Transformer. At the age of thirteen I got my first after-school job in order to buy my own Autobots and Decepticons. (And comic books, especially Hulk comics, for which I have a lifelong like, if not love.)")]),_vm._v(" "),_c('p',[_vm._v("My third lifelong love was music. At first it was mostly hard rock (Aerosmith, Led Zeppelin), but discovering Black Sabbath spawned a life-long love of heavy metal, while Mr. Bungle proved there really are no rules when it comes to music and genres. Once I picked up a guitar, my Transformers went into stasis in a large cardboard box in the basement.")]),_vm._v(" "),_c('p',[_vm._v("I spent my high school years writing eclectic songs and playing guitar for my first band, "),_c('a',{attrs:{"href":"https://crayoladeath.bandcamp.com/","target":"crayola"}},[_vm._v("Crayola Death")]),_vm._v(". All I wanted was to play rock music, but attending college is what was expected of me. Circumstances and contrarianism conspired to send me to a Catholic unversity (despite my lifelong adamant atheism) to study musicology, but it disagreed with me, so I switched to studying math, then philosophy, then theology, etc. I was aimless.")]),_vm._v(" "),_c('p',[_vm._v("My fourth lifelong love was New York City. My best friend was attending NYU, and when I visited him, I fell in love with the chaos, sleeplessness, and freedom of New York. I transferred to NYU, and while I continued to put in the minimum attention to school, I immersed myself in city life. When I absent-mindedly failed to secure funding for my fourth year of college, I happily dropped out to work odd jobs from \"fire guard\" to managing an ice cream store.")]),_vm._v(" "),_c('p',[_vm._v("During this time I formed "),_c('a',{attrs:{"href":"https://bromptonscocktail.bandcamp.com","target":"cocktail"}},[_vm._v("Brompton's Cocktail")]),_vm._v(", an experimental rock quartet, and in addition to songwriting and guitar-playing, I took on the role of singer for the first time. I later helped form "),_c('a',{attrs:{"href":"https://drpsyclops.bandcamp.com/","target":"drpsyclops"}},[_vm._v("The Invincible Doctor Psyclops Invasion")]),_vm._v(", a cinematic spy-rock outfit, wherein I switched from guitar to keyboards, theremins, samples and avant-garde vocalizations. In the wake of both of those bands, I founded "),_c('a',{attrs:{"href":"https://themonsterproject.bandcamp.com/","target":"monster"}},[_vm._v("The Monster Project")]),_vm._v(", a rock/jazz septet that performed Godzilla and other monster movie soundtrack selections. (I played bass for that project, occasionally with a bow, and conducted.)")]),_vm._v(" "),_c('p',[_vm._v("My fifth lifelong love was the internet, whereby I rediscovered my love of Autobots and Decepticons. At first it was a happenstance encounter of some classic Transformers box art online. This burst of nostalgia led to the unearthing of the afore-mentioned large cardboard box. I had already built a website for Brompton's Cocktail; I simultaneously started building an online archive of whatever Transformers box art I could find under the moniker "),_c('a',{attrs:{"href":"#/about/botch"}},[_vm._v("\"Botch\"")]),_vm._v(". More importantly, I finally found a lifelong career that interested me, "),_c('a',{attrs:{"href":"/images/about/adam/adam-alexander-resume-2017.pdf","target":"resume"}},[_vm._v("front-end web development")]),_vm._v(". Meanwhile, "),_c('a',{attrs:{"href":"#/archive"}},[_vm._v("Botch's Transformers Box Art Archive")]),_vm._v(" (this site) has showcased Transformers box art online since 1998.")]),_vm._v(" "),_c('p',[_vm._v("My sixth lifelong love is "),_c('a',{attrs:{"href":"https://www.instagram.com/dollfaceinthedark/","target":"heather"}},[_vm._v("Heather")]),_vm._v(", who I met in 1999 at a Brompton's Cocktail show. We courted, fell in love, moved in together, and after six years of romancing we finally got married in a private ceremony on Po'olenana Beach in Maui. She loves horror, cats, bookstores, restaurants, and me.")]),_vm._v(" "),_c('p',[_vm._v("In 2007, we packed up our cats and toys and moved across the country to Portland, Oregon. (I really like Portland, but it's not a love.) For a couple years I sang for an alternative rock band called "),_c('a',{attrs:{"href":"https://idisagree.bandcamp.com/","target":""}},[_vm._v("I Disagree")]),_vm._v(", but eventually I formed "),_c('a',{attrs:{"href":"https://dielikegentlemen.com/","target":"dlg"}},[_vm._v("Die Like Gentlemen")]),_vm._v(", a rock/metal/sludge group that feels like my purest musical distillation of all the heavy, groovy, and progressive music that I enjoy and want to also embody.")]),_vm._v(" "),_c('p',[_vm._v("Heather has "),_c('a',{attrs:{"href":"https://www.instagram.com/heatherliveswithcats/","target":"cats"}},[_vm._v("four cats")]),_vm._v(" -- they're hers, not mine -- and has found her calling as a bookseller at Powell's Books. I continue to work as a web developer, collect toys, and when there isn't a pandemic, spend a lot of time playing and seeing live music.")]),_vm._v(" "),_c('p',[_vm._v("... and my collection of Transformers continues to grow.")]),_vm._v(" "),_c('p',{staticStyle:{"font-size":"0.8em"},attrs:{"align":"right"}},[_c('i',[_vm._v("Last updated March 2021")])])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5fca8c41", __vue__options__)
  } else {
    hotAPI.rerender("data-v-5fca8c41", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],9:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n.botch_section {\n  margin-bottom: 100px; }\n  /* line 6, stdin */\n  .botch_section img {\n    margin: 0 0 20px;\n    border: 1px solid BLACK;\n    box-shadow: 3px 3px 1px #222;\n    max-width: 100%; }\n    /* line 12, stdin */\n    .botch_section img.no-shadow {\n      box-shadow: none;\n      border: 0; }\n  /* line 18, stdin */\n  .botch_section .about-desc {\n    text-align: center;\n    width: 80%; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
      botchSectionClasses: "botch_section col-lg-6"
    }
  },

  components: {
  },

  beforeMount() {
  },

  mounted() {
    globalService.setOfficeDocumentTitle("About Botch");
  },

  methods: {

    getBotchSectionClasses: function(clearLeft) {
      return this.botchSectionClasses + (clearLeft ? ' clearLeft' : '');
    }

  },

  computed: {

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('div',{staticClass:"about-header"},[_vm._v("Botch the Crab")]),_vm._v(" "),_c('div',{staticClass:"about-desc"},[_vm._v("For as long as this site has been online, Botch the Crab has been its official figurehead and mascot: a Decepticon by allegiance, a cassette by function, a crab by choice, and stalker of the shadows by necessity. Over the years, despite his snappish and reclusive ways, Botch has managed to inspire some fans to illustrate and even kitbash some tributes to him. (The ultimate goal is to one day get a small run of actual Botch toys produced by a third party.) Below is Botch's bio as well as many of those fantastic illustrations. Enjoy, and feel free to contribute!")]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(0),_vm._v(" "),_vm._m(1)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(2),_vm._v(" "),_vm._m(3)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses(true)},[_vm._m(4),_vm._v(" "),_vm._m(5)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(6),_vm._v(" "),_vm._m(7)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses(true)},[_vm._m(8),_vm._v(" "),_vm._m(9)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(10),_vm._v(" "),_vm._m(11)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses(true)},[_vm._m(12),_vm._v(" "),_vm._m(13)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(14),_vm._v(" "),_vm._m(15)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses(true)},[_vm._m(16),_vm._v(" "),_vm._m(17)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(18)]),_vm._v(" "),_c('div',{class:_vm.getBotchSectionClasses()},[_vm._m(19),_vm._v(" "),_vm._m(20)])])}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_laurent_libessart.jpg","rel":"fancybox-button","title":"Botch the Crab - by Laurent Libessart","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_laurent_libessart_tn.jpg"}})]),_vm._v(" "),_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_cassette_laurent_libessart.jpg","rel":"fancybox-button","title":"Botch the Crab (cassette mode) - by Laurent Libessart","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_cassette_laurent_libessart_tn.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tIllustrations by "),_c('b',[_c('a',{attrs:{"href":"http://a-loft-on-cybertron.deviantart.com/","target":"laurent"}},[_vm._v("Laurent Libessart")])]),_vm._v(". "),_c('br'),_vm._v("\n\t\t\tGraciously commissioned by "),_c('a',{attrs:{"href":"http://rustingcarcass.yuku.com/forums/64/t/Carcass-Column.html","target":"carcass"}},[_c('b',[_vm._v("Carcass")])]),_vm._v(".\n\t\t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_digital.png","rel":"fancybox-button","title":"Digital Botch - by Rainking","target":"botch"}},[_c('img',{staticClass:"no-shadow",staticStyle:{"width":"650px"},attrs:{"src":"/images/botch/botch_digital.png"}})]),_vm._v(" "),_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_digital_cassette.png","rel":"fancybox-button","title":"Digital Botch (Cassette) - by Rainking","target":"botch"}},[_c('img',{staticClass:"no-shadow",attrs:{"src":"/images/botch/botch_digital_cassette.png"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tDigital Botch art by "),_c('strong',[_vm._v("Rainking")]),_vm._v(" of "),_c('a',{attrs:{"href":"http://www.iaconcity.com/","target":"iacon"}},[_vm._v("Iacon City")]),_vm._v(". "),_c('br'),_vm._v("\n\t\t\tMore Botch renders "),_c('a',{attrs:{"href":"http://10fingersdesigns.com/3d/decepticons30.htm#botch","target":"iacon"}},[_vm._v("here")]),_vm._v(".\n\t\t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_stockel_grimmbot.jpg","rel":"fancybox-button","title":"Very First Botch - by Jon Stockel with Grimmbot","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_stockel_grimmbot.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tThe very first Botch art by "),_c('strong',[_vm._v("Jon Stockel")]),_vm._v(". "),_c('br'),_vm._v("\n\t\t\tRetouched, reformatted and retouched again by "),_c('strong',[_vm._v("Grimmbot")]),_vm._v(".\n\t\t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/Botch_BrendanCahill.jpg","rel":"fancybox-button","title":"Botch by Brendan Cahill","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/Botch_BrendanCahill.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("A sketch by IDW Transformers comic artist "),_c('strong',[_c('a',{attrs:{"href":"http://tfwiki.net/wiki/Brendan_Cahill","target":"cahill"}},[_vm._v("Brendan Cahill")])]),_vm._v(", commissioned and completed at CybFest 2014.")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/Botch_Jackpot.jpg","rel":"fancybox-button","title":"Botch underwater - by Matt Kuphaldt","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/Botch_Jackpot.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("A sketch by Transformers artist "),_c('strong',[_c('a',{attrs:{"href":"http://tfwiki.net/wiki/Matt_Kuphaldt","target":"jackpot"}},[_vm._v("Matt Kuphaldt")])]),_vm._v(" of "),_c('strong',[_c('a',{attrs:{"href":"http://www.spektakle.com/","target":"spektakle"}},[_vm._v("Spektkle Artistic Services")])]),_vm._v(", commissioned and completed at CybCon 2013.")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_zobovor.png","rel":"fancybox-button","title":"Botch, animation-style - by Zobovor","target":"botch"}},[_c('img',{staticClass:"no-shadow",attrs:{"src":"/images/botch/botch_zobovor.png"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tThe inimitable "),_c('strong',[_c('a',{attrs:{"href":"http://members.fortunecity.com/zobovor/","target":"zobovor"}},[_vm._v("Zobovor")])]),_vm._v(" did this rendition of Botch in the style of the original cartoon!\n\t\t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/Botch_~deruji.png","rel":"fancybox-button","title":"Botches - by ~Deruji","target":"botch"}},[_c('img',{staticStyle:{"border":"2px solid BLACK","width":"100%","max-width":"960px"},attrs:{"src":"/images/botch/Botch_~deruji.png"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n      Botch gets lost in a crowd of himselves in this digital render by "),_c('strong',[_c('a',{attrs:{"href":"http://deruji.deviantart.com/","target":"deruji"}},[_vm._v("~Deruji")])]),_vm._v(".\n    ")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/Botch_~hellbat.jpg","rel":"fancybox-button","title":"Botch - by ~hellbat","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/Botch_~hellbat.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tTerrifying Botch by "),_c('b',[_c('a',{attrs:{"href":"http://hellbat.deviantart.com/","target":"hellbat"}},[_c('strong',[_vm._v("navtej heer, aka ~hellbat")])])]),_vm._v(".\n\t\t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_sushi.jpg","rel":"fancybox-button","title":"Botch Sushi! - by Matthew Stein","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_sushi.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tBotch Sushi image by "),_c('b',[_c('a',{attrs:{"href":"http://www.MatthewStein.net","target":"_blank"}},[_vm._v("Matthew Stein")])])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_techspec.jpg","rel":"fancybox-button","title":"Botch Tech Spec - rendered by Slim","target":"ts"}},[_c('img',{attrs:{"src":"/images/botch/botch_techspec.jpg"}})]),_vm._v(" "),_c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\t\tThe JPG version of Botch's Tech Spec comes courtesy of "),_c('br'),_vm._v(" "),_c('a',{attrs:{"href":"http://www.ocf.berkeley.edu/~mingus/tech/","target":"Credit"}},[_vm._v("Slim's Custom Transformers Tech Specs")]),_vm._v(".\n\t\t\t")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._v("\n\t\t\t<"),_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_cardback_front.jpg","rel":"fancybox-button","title":"Botch Cardback (front) - by Archangel","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_cardback_front.jpg"}})]),_vm._v(" "),_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/botch_cardback_back.jpg","rel":"fancybox-button","title":"Botch Cardback (back) - by Archangel","target":"botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_cardback_back.jpg"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_vm._v("\n\t\t\tBotch Cardback image by "),_c('b',[_c('a',{attrs:{"href":"http://sites.google.com/site/primularchangel/","target":"_blank"}},[_vm._v("Archangel")])])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-f8e232ac", __vue__options__)
  } else {
    hotAPI.rerender("data-v-f8e232ac", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],10:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n.about-group {\n  padding: 0; }\n\n/* line 5, stdin */\n.about-section {\n  padding: 0 25px; }\n  /* line 8, stdin */\n  .about-section .about-section-header {\n    background-color: #2C244C;\n    background-color: #000;\n    border: 1px solid #000;\n    border: 1px solid #333;\n    padding: 5px;\n    font-weight: bold;\n    text-align: center;\n    cursor: pointer; }\n  /* line 19, stdin */\n  .about-section .about-section-content {\n    background-color: #EEEEEE;\n    color: BLACK;\n    font-size: 11px;\n    border: 1px solid #000;\n    border: 1px solid #333;\n    border-top: 0;\n    padding: 10px 10px 0;\n    margin-bottom: 25px;\n    text-align: left; }\n    /* line 30, stdin */\n    .about-section .about-section-content a {\n      color: #2C244C;\n      font-style: italic;\n      font-size: 1.1em; }\n    /* line 35, stdin */\n    .about-section .about-section-content br {\n      clear: both; }\n    /* line 38, stdin */\n    .about-section .about-section-content p {\n      margin: 0 0 10px; }\n    /* line 41, stdin */\n    .about-section .about-section-content img {\n      border: 1px solid #555;\n      float: right;\n      margin: 0 0 10px 10px; }\n\n/* line 49, stdin */\n#sideways-scuttle {\n  clear: both;\n  max-width: 500px;\n  margin: 10px auto;\n  font-size: 0.8em; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
      aboutGroupClasses: "about-group col-lg-6 col-md-12 col-sm-12 col-xs-12",
  		aboutSectionClasses: "about-section col-lg-6 col-md-6 col-sm-6 col-xs-12"
    }
  },

  mounted() {
    globalService.setOfficeDocumentTitle("About ...");
  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('div',{staticClass:"about-header"},[_vm._v("About …")]),_vm._v(" "),_c('div',{class:_vm.aboutGroupClasses},[_c('div',{class:_vm.aboutSectionClasses},[_c('div',{staticClass:"about-section-header",attrs:{"onclick":"location.href='#/archive'"}},[_vm._v("Botch's Transformers Box Art Archive")]),_vm._v(" "),_vm._m(0)]),_vm._v(" "),_c('div',{class:_vm.aboutSectionClasses},[_c('div',{staticClass:"about-section-header",attrs:{"onclick":"location.href='#/about/botch'"}},[_vm._v("Botch the Crab")]),_vm._v(" "),_vm._m(1)])]),_vm._v(" "),_c('div',{class:_vm.aboutGroupClasses},[_c('div',{class:_vm.aboutSectionClasses},[_c('div',{staticClass:"about-section-header",attrs:{"onclick":"location.href='#/about/adam'"}},[_vm._v("The Blog")]),_vm._v(" "),_vm._m(2)]),_vm._v(" "),_c('div',{class:_vm.aboutSectionClasses},[_c('div',{staticClass:"about-section-header",attrs:{"onclick":"location.href='#/about/music'"}},[_vm._v("His Music")]),_vm._v(" "),_vm._m(3)])])])}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-section-content"},[_c('a',{attrs:{"href":"#/archive"}},[_c('img',{attrs:{"src":"/archive/autobot/1984/Z_optimus_prime.gif"}})]),_vm._v(" "),_c('p',[_vm._v("Online since 1998, this site attempts to archive high-quality edited scans of all the original (Generation One) Transformers package art. The Archive also hosts scans of all the G1 tech specs and instructions, as well as a gallery of back-of-the-box art.")]),_vm._v(" "),_c('p',[_c('a',{attrs:{"href":"#/archive"}},[_vm._v("Head to the Archive ...")])]),_vm._v(" "),_c('br')])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-section-content"},[_c('a',{attrs:{"href":"#/about/botch"}},[_c('img',{attrs:{"src":"/images/about/about_botch.jpg"}})]),_vm._v(" "),_c('p',[_vm._v("This Decepticon cassette-crustacean is the Archive's mascot and the webmaster's online alter-ego. Devious, eloquent and determined to one day get his own toy.")]),_vm._v(" "),_c('p',[_c('a',{attrs:{"href":"#/about/botch"}},[_vm._v("More about Botch ...")])]),_vm._v(" "),_c('br')])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-section-content"},[_c('a',{attrs:{"href":"#/about/adam"}},[_c('img',{attrs:{"src":"/images/about/adam/about_adam_incantation.jpg"}})]),_vm._v(" "),_c('p',[_vm._v("Adam Alexander is the human behind the black crab. In addition to introducing updates to the Archive, he blogs about life, society and, of course, Transformers.")]),_vm._v(" "),_c('p',[_c('a',{attrs:{"href":"#/about/adam"}},[_vm._v("More about Adam ...")])]),_vm._v(" "),_c('br')])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-section-content"},[_c('a',{attrs:{"href":"#/about/music"}},[_c('img',{attrs:{"src":"/images/about/about_music.jpg"}})]),_vm._v(" "),_c('p',[_vm._v("Adam has been a versatile musician and produced several diverse and experimental rock albums. Listen for free, name-your-price to buy!")]),_vm._v(" "),_c('p',[_c('a',{attrs:{"href":"#/about/music"}},[_vm._v("Listen to some music ...")])]),_vm._v(" "),_c('br')])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-de3e84de", __vue__options__)
  } else {
    hotAPI.rerender("data-v-de3e84de", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],11:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 5, stdin */\n#about-music .album {\n  padding: 10px 20px;\n  background-color: black;\n  box-shadow: 3px 3px 3px #222;\n  font-size: 0.9em;\n  margin-bottom: 25px;\n  text-align: left; }\n  /* line 13, stdin */\n  #about-music .album iframe {\n    float: left;\n    border: 0;\n    width: 100%;\n    height: 500px;\n    max-width: 350px;\n    margin-bottom: 20px;\n    margin-right: 20px; }\n    @media (max-width: 675px) {\n      /* line 13, stdin */\n      #about-music .album iframe {\n        float: none;\n        height: 405px; } }\n\n/* line 29, stdin */\n#about-music .about-band, #about-music .album-title {\n  text-shadow: 3px 3px 1px #444; }\n\n/* line 31, stdin */\n#about-music .about-band {\n  font-size: 1.4em;\n  font-weight: bold;\n  margin-bottom: 5px;\n  text-transform: uppercase; }\n\n/* line 32, stdin */\n#about-music .about-title {\n  font-size: 1.2em;\n  font-style: italic;\n  margin-left: 0px; }\n\n/* line 34, stdin */\n#about-music .album-blurb {\n  margin: 10px 0;\n  line-height: 1.5em;\n  color: #bbb;\n  min-height: 90px; }\n\n/* line 36, stdin */\n#about-music .album-links {\n  text-align: center; }\n  /* line 39, stdin */\n  #about-music .album-links a {\n    margin: 0 15px;\n    white-space: nowrap; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



var albums = [
  {
    albumId: "Stories",
    bandName: "Die Like Gentlemen",
    albumTitle: "Stories",
    bandcampUrl: "https://dielikegentlemen.bandcamp.com/album/stories",
    websiteUrl: "https://dielikegentlemen.com/",
    facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
    blurb: "For some variety, Die Like Gentlemen started playing acoustic gigs in addition to our usual face-melting performances. Eventually we started writing original tunes for these gigs, and this grew into a quiet volume of material that deserved its own album.",
    bandcampIframeId: "922320776"
  },
  {
    albumId: "Quickening",
    bandName: "Die Like Gentlemen",
    albumTitle: "The Quickening Light",
    bandcampUrl: "https://dielikegentlemen.bandcamp.com/album/the-quickening-light",
    websiteUrl: "https://dielikegentlemen.com/",
    facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
    blurb: "Another ambitiuos prog/sludge album, with influences ranging from classic rock to death metal. Throw in some feedback and a small choir and you've got one more solid DLG disc.",
    bandcampIframeId: "243520918"
  },
  {
    albumId: "Lies",
    bandName: "Die Like Gentlemen",
    albumTitle: "Five Easy Lies",
    bandcampUrl: "https://dielikegentlemen.bandcamp.com/album/five-easy-lies",
    websiteUrl: "https://dielikegentlemen.com/",
    facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
    blurb: "Die Like Gentlemen has proven to be my most pure expression of heavy and progressive music. Plus, as far as sound quality, this is probably the most professional-sounding album I've done.",
    bandcampIframeId: "3743777813"
  },
  {
    albumId: "Delusions",
    bandName: "Die Like Gentlemen",
    albumTitle: "Romantic Delusions of Hell",
    bandcampUrl: "http://dielikegentlemen.bandcamp.com/album/romantic-delusions-of-hell",
    websiteUrl: "https://dielikegentlemen.com/",
    facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
    blurb: "The debut album of my progressive sludge outfit here in Portland, OR. The songs are slow, heavy, dramatic and on the long side. The first album of my career actually released on vinyl.",
    bandcampIframeId: "1126785356"
  },
  {
    albumId: "Monster",
    bandName: "The Monster Project",
    albumTitle: null,
    bandcampUrl: "http://themonsterproject.bandcamp.com/",
    websiteUrl: null,
    facebookUrl: null,
    blurb: "My most ambitious undertaking ever, <b>The Monster Project</b> was a septet of progressive musicians executing my arrangements of monster movie music. We got a great response performing the selctions featured on this recording, including over 45 minutes of classic Godzilla music, a medley of 80's slasher movie themes, an excerpt from Tchaikovsky's <i>Swan Lake</i>, and selections from <i>Land of the Lost</i>.",
    bandcampIframeId: "432117078"
  },
  {
    albumId: "Invisible",
    bandName: "The Invincible Doctor Psyclops Invasion",
    albumTitle: "The Invisible Album",
    bandcampUrl: "http://drpsyclops.bandcamp.com/album/the-invisible-album",
    websiteUrl: null,
    facebookUrl: null,
    blurb: "This is the second Doctor Psyclops album, and possibly the most popular recording I've done. Though we lost none of our eccentricity, the Invasion really refined its unusual style. Much is still derived from improvisation, but there's also some exquisite and complicated compositions. At one point, I was performing with up to three keyboards, a laptop for samples, laser theremin, vocals with digital effects, hand percussion and a recorder!",
    bandcampIframeId: "1531036455"
  },
  {
    albumId: "Cardboard",
    bandName: "The Invincible Doctor Psyclops Invasion",
    albumTitle: "The Cardboard Album",
    bandcampUrl: "http://drpsyclops.bandcamp.com/album/the-cardboard-album",
    websiteUrl: null,
    facebookUrl: null,
    blurb: "From surf rock to arabic wailings to free noise and punk, the material on this disc amused and confused audiences for months. Inspired by The Invisibles comic series and Mr. Bungle, I was recruited by the Wicker Man to play keyboards, sing/scream/bellow, and wave my hand around a theremin.",
    bandcampIframeId: "1962577399"
  },
  {
    albumId: "Disagree",
    bandName: "I Disagree",
    albumTitle: "Vices & Virtues",
    bandcampUrl: "http://idisagree.bandcamp.com/album/vices-virtues",
    websiteUrl: null,
    facebookUrl: null,
    blurb: "This 13-song double-EP is the final culmination of three years of inspiration and frustration. After so many musically experimental projects, I wanted to simply sing for a heavy but groovy band, and that's what I found in Portland. Of course my desire to do things just a little bit differently always wins out, so these tracks have a touch of the unconventional anyway.<br/>By the way, album packaging is an origami-like affair that unfolds into a full-size poster with lyrics.",
    bandcampIframeId: "3374298948"
  },
  {
    albumId: "Cocktail",
    bandName: "Brompton's Cocktail",
    albumTitle: "Take On An Empty Mind",
    bandcampUrl: "http://bromptonscocktail.bandcamp.com/album/take-on-an-empty-mind",
    websiteUrl: null,
    facebookUrl: null,
    blurb: "With a bouncy, funerary theme, this eclectic \"art rock\" band mixed Beatles with Black Sabbath and everything in-between to put a grin on your face and death on the brain. I sang and played guitar, as well as wrote most the majority of the music on this eclectic disc. Though tuneful, the album is so all over the place that everyone who enjoys it cites a different favorite track. Decide for yourself!",
    bandcampIframeId: "1337885993"
  }
];


var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
      albums: albums,
      albumClasses: "col-md-12 col-lg-6" // col-xl-4
    }
  },

  components: {
  },

  beforeMount() {
  },

  mounted() {
    globalService.setOfficeDocumentTitle("Music by Adam Alexander");
  },

  methods: {

    getIframeSrc: function(bandcampIframeId) {
  		return 'http://bandcamp.com/EmbeddedPlayer/album=' + bandcampIframeId + '/size=large/bgcol=333333/linkcol=ffffff/tracklist=false/transparent=true/';
    }

  },

  computed: {

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"about-music"}},[_vm._m(0),_vm._v(" "),_c('div',{staticClass:"about-desc"},[_vm._v("I've played in a number of projects over the years. My role often changes: composer, singer, guitarist, bassist, piano and/or keyboardist, and so on. I keep busy. Here are all the albums that I've recorded with different bands.")]),_vm._v(" "),_vm._l((_vm.albums),function(album){return _c('div',{class:_vm.albumClasses},[_c('div',{staticClass:"album"},[_c('a',{attrs:{"name":album.albumId}}),_vm._v(" "),_c('iframe',{attrs:{"id":album.albumId,"src":_vm.getIframeSrc(album.bandcampIframeId),"seamless":""}},[_c('a',{attrs:{"href":album.bandcampUrl}},[_vm._v(_vm._s(album.albumTitle)+" by "+_vm._s(album.bandName))])]),_vm._v(" "),_c('div',{staticClass:"about-band"},[_vm._v(_vm._s(album.bandName))]),_vm._v(" "),_c('div',{staticClass:"album-title"},[_vm._v(_vm._s(album.albumTitle))]),_vm._v(" "),_c('div',{staticClass:"album-blurb",domProps:{"innerHTML":_vm._s(album.blurb)}}),_vm._v(" "),_c('div',{staticClass:"album-links"},[_c('a',{attrs:{"href":album.bandcampUrl,"target":"bandcamp"}},[_vm._v("Listen/Buy on Bandcamp")]),_vm._v(" "),(album.websiteUrl)?_c('a',{attrs:{"href":album.websiteUrl}},[_vm._v("DieLikeGentlemen.com")]):_vm._e(),_vm._v(" "),(album.facebookUrl)?_c('a',{attrs:{"href":album.facebookUrl,"target":"facebook"}},[_vm._v("Follow us on Facebook")]):_vm._e()]),_vm._v(" "),_c('br',{staticClass:"clearLeft"})])])})],2)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-header"},[_vm._v("Music by "),_c('span',{staticClass:"nowrap"},[_vm._v("Adam Alexander")])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-26d71be3", __vue__options__)
  } else {
    hotAPI.rerender("data-v-26d71be3", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],12:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n#about-site {\n  font-size: 1em;\n  width: 700px;\n  max-width: 90%;\n  margin: 0 auto 50px; }\n  /* line 9, stdin */\n  #about-site .about-header {\n    margin-bottom: 30px; }\n  /* line 13, stdin */\n  #about-site #about-site-text {\n    text-align: left; }\n    /* line 16, stdin */\n    #about-site #about-site-text p {\n      margin-bottom: 20px; }\n    /* line 20, stdin */\n    #about-site #about-site-text ul {\n      margin-top: 10px;\n      margin-bottom: 15px;\n      padding-left: 15px; }\n      /* line 25, stdin */\n      #about-site #about-site-text ul li {\n        list-style-type: none;\n        margin-bottom: 5px; }\n  /* line 33, stdin */\n  #about-site .about-site-header {\n    font-style: italic;\n    color: #ccc;\n    font-size: 1.4em; }\n  /* line 39, stdin */\n  #about-site #about-site-ramhorn {\n    padding-bottom: 20px;\n    text-align: center; }\n    /* line 43, stdin */\n    #about-site #about-site-ramhorn img {\n      margin-right: 20px;\n      max-width: 100%; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
    }
  },

  components: {
  },

  beforeMount() {
  },

  mounted() {
    globalService.setOfficeDocumentTitle("About This Site");
  },

  methods: {


  },

  computed: {

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"about-site"}},[_c('div',{staticClass:"about-header"},[_vm._v("About This Site")]),_vm._v(" "),_c('div',[_c('div',{staticClass:"col-sm-4 col-xs-12",attrs:{"id":"about-site-ramhorn"}},[_c('a',{staticClass:"fancybox-button-art",attrs:{"rel":"fancybox-button","title":"Botch digs JavaScript","data-character":"Botch digs JavaScript","href":"/archive/images/javascript_ramhorn_large.jpg","target":"_blank"}},[_c('img',{attrs:{"src":"/archive/images/javascript_ramhorn_large.jpg","title":"Transformers O'Reilly parody"}})])]),_vm._v(" "),_c('div',{staticClass:"col-sm-8 col-xs-12",attrs:{"id":"about-site-text"}},[_c('div',{staticClass:"about-site-header"},[_vm._v("GitHub:")]),_vm._v(" "),_c('ul',[_c('li',[_c('a',{attrs:{"href":"https://github.com/BotchTheCrab/botchthecrab-vue","target":"github"}},[_vm._v("https://github.com/BotchTheCrab/botchthecrab-vue")])])]),_vm._v(" "),_c('div',{staticClass:"about-site-header"},[_vm._v("Built with ...")]),_vm._v(" "),_c('ul',[_c('li',[_c('a',{attrs:{"href":"https://vuejs.org/"}},[_vm._v("Vue.js (v2)")]),_vm._v(" framework")]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"https://sass-lang.com/","target":"sass"}},[_vm._v("SASS")]),_vm._v(" and Vue compilation via "),_c('a',{attrs:{"href":"https://gulpjs.com/","target":"gulp"}},[_vm._v("Gulp")])]),_vm._v(" "),_c('li',[_vm._v("Hosting via "),_c('a',{attrs:{"href":"https://firebase.google.com/","target":"firebase"}},[_vm._v("Google Firebase")]),_vm._v(" with Realtime Database")])]),_vm._v(" "),_c('div',{staticClass:"about-site-header"},[_vm._v("Supplementary JavaScript Libraries:")]),_vm._v(" "),_c('ul',[_c('li',[_c('a',{attrs:{"href":"http://jquery.com/","target":"jquery"}},[_vm._v("jQuery")])]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"http://underscorejs.org/","target":"underscore"}},[_vm._v("Underscore")])]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"http://getbootstrap.com/","target":"bootstrap"}},[_vm._v("Bootstrap")])])]),_vm._v(" "),_c('div',{staticClass:"about-site-header"},[_vm._v("Plugins/Widgets:")]),_vm._v(" "),_c('ul',[_c('li',[_c('a',{attrs:{"href":"http://mmenu.frebsite.nl/","target":"mmenu"}},[_vm._v("mmenu")]),_vm._v(" - site navigation")]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"http://fancyapps.com/fancybox/","target":"fancybox"}},[_vm._v("fancyBox")]),_vm._v(" - box art modals")]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"http://labs.rampinteractive.co.uk/touchSwipe/demos/","target":"touchswipe"}},[_vm._v("TouchSwipe")]),_vm._v(" - swipe effects")]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"https://codepen.io/markhillard/pen/Hjcwu","target":"audioplayer"}},[_vm._v("Responsive Audio Player by Mark Hillard")])])]),_vm._v(" "),_c('div',{staticClass:"about-site-header"},[_vm._v("Tools:")]),_vm._v(" "),_c('ul',[_c('li',[_c('a',{attrs:{"href":"https://atom.io/","target":"atom"}},[_vm._v("Atom")])]),_vm._v(" "),_c('li',[_c('a',{attrs:{"href":"http://www.photoshop.com/products/photoshop","target":"photoshop"}},[_vm._v("Adobe Photoshop")])])])])]),_vm._v(" "),_c('br',{attrs:{"clear":"all"}})])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-53cb980e", __vue__options__)
  } else {
    hotAPI.rerender("data-v-53cb980e", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],13:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n#trio {\n  margin-bottom: 100px; }\n  /* line 6, stdin */\n  #trio img {\n    border: 1px solid BLACK;\n    box-shadow: 3px 3px 1px #222;\n    max-width: 100%; }\n  /* line 12, stdin */\n  #trio .credit {\n    padding: 5px;\n    font-size: 0.9em;\n    color: #ccc;\n    font-style: italic; }\n  /* line 19, stdin */\n  #trio .about-desc {\n    max-width: 700px; }\n    /* line 22, stdin */\n    #trio .about-desc hr {\n      margin: 25px auto; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');

module.exports = {

  components: {
  },

  beforeMount() {
  },

  mounted() {
    globalService.setOfficeDocumentTitle("About Botch's Fellow Cassettes");
  },

  methods: {

    tf: function(name, faction, year) {
      archiveService.tf(name, faction, year);
    }

  },

  computed: {

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"trio"}},[_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_vm._m(2),_vm._v(" "),_vm._m(3),_vm._v(" "),_c('div',{staticClass:"page-title"},[_vm._v("Bungle")]),_vm._v(" "),_vm._m(4),_vm._v(" "),_c('div',{staticClass:"credit"},[_vm._v("Bungle's box art is "),_c('a',{on:{"click":function($event){return _vm.tf('Beastbox', 'Decepticon', '1988')}}},[_vm._v("Beastbox")]),_vm._v(" recolored.")]),_vm._v(" "),_c('br'),_c('br'),_vm._v(" "),_vm._m(5),_vm._v(" "),_c('br'),_c('br'),_vm._v(" "),_vm._m(6),_vm._v(" "),_c('br'),_c('br'),_vm._v(" "),_c('br'),_c('br'),_vm._v(" "),_c('div',{staticClass:"page-title"},[_vm._v("Fuck-Up")]),_vm._v(" "),_vm._m(7),_vm._v(" "),_c('div',{staticClass:"credit"},[_vm._v("Fuck-Up's box art is "),_c('a',{on:{"click":function($event){return _vm.tf('Laserbeak', 'Decepticon', '1984')}}},[_vm._v("Laserbeak")]),_vm._v(" recolored.")]),_vm._v(" "),_c('br'),_c('br'),_vm._v(" "),_vm._m(8),_vm._v(" "),_c('br'),_c('br'),_vm._v(" "),_vm._m(9)])}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-header"},[_vm._v("Botch's Fellow Cassettes:"),_c('br'),_vm._v("Bungle & Fuck-Up")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('img',{attrs:{"src":"/images/botch/trio.jpg"}})])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"credit"},[_vm._v("Digital art by "),_c('strong',[_vm._v("Rainking")]),_vm._v(" of "),_c('a',{attrs:{"href":"http://www.iaconcity.com/","target":"iacon"}},[_vm._v("Iacon City")]),_vm._v(". "),_c('span',{staticClass:"nowrap"},[_vm._v("More renders "),_c('a',{attrs:{"href":"http://10fingersdesigns.com/3d/decepticons30.htm#botch","target":"iacon"}},[_vm._v("here")]),_vm._v(".")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"about-desc"},[_c('p',[_vm._v("Orphaned from their communicator host, three cassette operatives remain together as a semi-autonomous espionage unit for Decepticon Intelligence. Like many unfortunate Decepticons, their unflattering code names were bestowed upon them early in their career by unimpressed superior officers as a badge of ridicule. However, since that notorious debacle, the trio have persistently worked to vindicate and neuter their familiar handles. Well, at least Botch and Bungle. Fuck-Up pretty much remains a fuck-up.")]),_vm._v(" "),_c('hr'),_vm._v(" "),_c('p',[_c('i',[_vm._v("These three characters are based on me (the black crab), my best friend and long-time roommate (the periwinkle ape), and our mutual high school friend and roommate for one cockroach-infested year (the yellow bird).  Bungle knows who he is. Fuck-Up will forever remain clueless, in this and all other matters.")])])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"align":"center"}},[_c('img',{attrs:{"src":"/images/botch/bungle_large.gif"}})])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/bungle_techspec.jpg","rel":"fancybox-button","title":"Bungle Tech Spec - rendered by Slim","target":"ts"}},[_c('img',{attrs:{"src":"/images/botch/bungle_techspec.jpg"}})]),_vm._v(" "),_c('div',{staticClass:"about-desc",staticStyle:{"text-align":"center"}},[_vm._v("\n\t\t\tThe JPG version of Bungle's Tech Spec comes courtesy of "),_c('br'),_vm._v(" "),_c('a',{attrs:{"href":"http://www.ocf.berkeley.edu/~mingus/tech/","target":"Credit"}},[_vm._v("Slim's Custom Transformers Tech Specs")]),_vm._v(".\n\t\t")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"align":"center"}},[_c('img',{attrs:{"src":"/images/botch/digital_bungle.jpg"}})])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"align":"center"}},[_c('img',{attrs:{"src":"/images/botch/fuck-up_large.gif","alt":"Fuck-Up"}})])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"fancybox-button-art",attrs:{"href":"/images/botch/fuck-up_techspec.jpg","rel":"fancybox-button","title":"Fuck-Up Tech Spec - rendered by Slim","target":"ts"}},[_c('img',{attrs:{"src":"/images/botch/fuck-up_techspec.jpg"}})]),_vm._v(" "),_c('div',{staticClass:"about-desc",staticStyle:{"text-align":"center"}},[_vm._v("\n\t\t\tThe JPG version of Fuck-Up's Tech Spec comes courtesy of "),_c('br'),_vm._v(" "),_c('a',{attrs:{"href":"http://www.ocf.berkeley.edu/~mingus/tech/","target":"Credit"}},[_vm._v("Slim's Custom Transformers Tech Specs")]),_vm._v(".\n\t\t")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"align":"center"}},[_c('img',{attrs:{"src":"/images/botch/digital_fuck-up.jpg","alt":"Fuck-Up"}})])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-07db1256", __vue__options__)
  } else {
    hotAPI.rerender("data-v-07db1256", __vue__options__)
  }
})()}
},{"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],14:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');
var botchWatermarkVue = require('components/partials/botch_watermark');

// BLOG COMPONENTS
var blogService = require('services/blog_service');

var vm;
var postingsStore = null;
var numPostingsDisplayed = 0;
var numPostingsPerLoad = 5;

module.exports = {

  components: {
    'botch-watermark': botchWatermarkVue
  },

  data () {
    return {

      postings: []

    }
  },

  beforeMount() {
    vm = this;
    this.getPostingsStore();
  },

  mounted() {
    globalService.setArchiveDocumentTitle();
  },

  methods: {

    getPostingsStore: function() {
      blogService.getAllPostings().then(function(response) {
        postingsStore = _.chain(response.val()).filter(function(posting) {
          return posting.categoryIds.indexOf(2) !== -1;
        }).sortBy(response.val(), 'posted').reverse().value();
        vm.loadInitialPostings();
      });
    },

    loadInitialPostings: function() {
      var initialPostingsCount = numPostingsPerLoad;
      if (numPostingsDisplayed > numPostingsPerLoad) {
        initialPostingsCount = numPostingsDisplayed;
      }

      var initialPostings = postingsStore.slice(0, initialPostingsCount);
      initialPostings = blogService.setPostingBlurbs(initialPostings);
      _.each(initialPostings, function(posting) {
        vm.postings.push(posting);
      });
      numPostingsDisplayed = initialPostingsCount;
    },

    loadMorePostings: function() {
      var newPostingTally = numPostingsDisplayed + numPostingsPerLoad;

      var morePostings = postingsStore.slice(numPostingsDisplayed, newPostingTally);
      morePostings = blogService.setPostingBlurbs(morePostings);
      _.each(morePostings, function(posting) {
        vm.postings.push(posting);
      });
      numPostingsDisplayed = newPostingTally;
    },

    submitSearch: function() {
      this.$router.push({
        path: '/postings',
        query: {
          search: this.searchTerm,
          scope: 'archive'
        }
      });
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid center-content"},[_c('botch-watermark'),_vm._v(" "),_vm._m(0),_vm._v(" "),_c('div',{staticClass:"quicklink-container row text-center"},[_c('div',{staticClass:"quicklink col-sm-6"},[_c('router-link',{attrs:{"to":'/archive/teletran/autobot'}},[_c('img',{attrs:{"src":"/archive/images/home/quicklink_autobots_optimus_prime.jpg","alt":"Autobot Box Art"}})])],1),_vm._v(" "),_c('div',{staticClass:"quicklink col-sm-6"},[_c('router-link',{attrs:{"to":'/archive/teletran/decepticon'}},[_c('img',{attrs:{"src":"/archive/images/home/quicklink_decepticons_megatron.jpg","alt":"Decepticon Box Art"}})])],1)]),_vm._v(" "),_c('hr',{staticStyle:{"margin":"10px auto 40px"}}),_vm._v(" "),_vm._m(1),_vm._v(" "),_vm._m(2),_vm._v(" "),_c('div',{staticClass:"quicklink-container row text-center"},[_c('div',{staticClass:"quicklink col-sm-6"},[_c('form',{attrs:{"id":"archive-search-form"},on:{"submit":function($event){$event.preventDefault();return _vm.submitSearch($event)}}},[_c('div',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.searchTerm),expression:"searchTerm"}],attrs:{"type":"search","placeholder":"Search the Archive ..."},domProps:{"value":(_vm.searchTerm)},on:{"input":function($event){if($event.target.composing){ return; }_vm.searchTerm=$event.target.value}}})])]),_vm._v(" "),_vm._m(3)]),_vm._v(" "),_vm._m(4)]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.postings.length),expression:"postings.length"}],staticClass:"page-title"},[_vm._v("Updates & Blog Posts ...")]),_vm._v(" "),_vm._l((_vm.postings),function(posting){return _c('div',{key:posting.postingId,staticClass:"post-blurb",attrs:{"post-id":posting.postingId}},[_c('div',{staticClass:"post-title-full"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId } }}},[_vm._v(_vm._s(posting.title))])],1),_vm._v(" "),_c('div',{staticClass:"post-body-full",domProps:{"innerHTML":_vm._s(posting.blurb)}}),_vm._v(" "),(posting.blurb.length !== posting.content.length)?_c('p',{staticClass:"post-body-trimmed"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId } }}},[_vm._v("Continue …")])],1):_vm._e()])}),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.postings.length),expression:"postings.length"}],staticClass:"more-posts"},[_c('a',{on:{"click":_vm.loadMorePostings}},[_vm._v("Load More Posts")])])],2)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"text-center",attrs:{"id":"archive-home-logo"}},[_c('img',{attrs:{"src":"/archive/images/home/archive_logo_2014.jpg","alt":"Botch's Transformers Box Art Archive"}}),_vm._v(" "),_c('div',[_vm._v("Generation One Transformers Box Art, Instructions, Tech Specs and much more…")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"quicklink-container row text-center"},[_c('div',{staticClass:"quicklink col-sm-6"},[_c('a',{attrs:{"href":"#/archive/techspecs"}},[_c('img',{attrs:{"src":"/archive/images/home/quicklink_techspecs.jpg","alt":"Transformers Tech Specs"}})])]),_vm._v(" "),_c('div',{staticClass:"quicklink col-sm-6"},[_c('a',{attrs:{"href":"#/archive/instructions"}},[_c('img',{attrs:{"src":"/archive/images/home/quicklink_instructions.gif","alt":"Transformers Instructions"}})])])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"quicklink-container row text-center"},[_c('div',{staticClass:"quicklink col-sm-6"},[_c('a',{attrs:{"href":"#/archive/catalogs"}},[_c('img',{attrs:{"src":"/archive/images/home/quicklink_catalogs.jpg","alt":"Transformers Catalogs"}})])]),_vm._v(" "),_c('div',{staticClass:"quicklink col-sm-6"},[_c('a',{attrs:{"href":"#/archive/boxbattles"}},[_c('img',{attrs:{"src":"/archive/images/home/quicklink_boxbattles.jpg","alt":"Transformers Back of the Box Art"}})])])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{attrs:{"href":"#/tags"}},[_vm._v("Browse Post Tags")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"quicklink col-sm-6"},[_c('div',[_c('a',{attrs:{"href":"#/archive/reinforcements"}},[_vm._v("Reinforcements From Cybertron")])]),_vm._v(" "),_c('div',[_c('a',{attrs:{"href":"#/archive/history"}},[_vm._v("Box Art History")])]),_vm._v(" "),_c('div',[_c('a',{attrs:{"href":"#/contact"}},[_vm._v("Contact")])])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5e8c73e7", __vue__options__)
  } else {
    hotAPI.rerender("data-v-5e8c73e7", __vue__options__)
  }
})()}
},{"components/partials/botch_watermark":37,"services/blog_service":47,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],15:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 5, stdin */\n#boxbattles .teletran-name {\n  height: 80px; }\n\n/* line 8, stdin */\n#boxbattles .teletran-name-note {\n  margin-top: 0.5em;\n  white-space: normal; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
var ArchiveHeaderVue = require('components/archive/partials/archive_header');

module.exports = {

  data () {
    return {
      boxbattles: []
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue
  },

  beforeMount() {
    this.getBoxBattleData();
  },

  mounted() {
    globalService.setArchiveDocumentTitle("Back of the Box Art");
  },

  methods: {

    getBoxBattleData: function() {
      var vm = this;

      firebase.database().ref('archive/boxbattles').once('value').then(function(snapshot) {
        var boxbattles = snapshot.val();

        _.each(boxbattles, function(battle) {
          battle.displayName = vm.getDisplayName(battle);
          battle.displayTitle = vm.getDisplayTitle(battle);
          battle.thumbnailPath = vm.getThumbnailPath(battle);
          battle.imagePath = vm.getImagePath(battle);
        });

        vm.boxbattles = boxbattles;
      });

    },

    getDisplayName: function(entry) {
      var displayName = entry.year;
      if (entry.region !== "USA") {
        displayName += " (" + entry.region + ")";
      }
      return displayName;
    },

    getDisplayTitle: function(entry) {
      var displayTitle = this.getDisplayName(entry);
      if (entry.description) {
        displayTitle += " - " + entry.description;
      }
      return displayTitle;
    },

    getImageName: function(entry) {
      var imageName = 'box_battle_';
      imageName += (entry.year - 1900);
      if (entry.region === 'Europe') {
        imageName += '_eu';
      }
      if (entry.region === 'Japan') {
        imageName += '_japan';
      }
      if (entry.imageId) {
        imageName += '_' + entry.imageId;
      }
      imageName += '.jpg';

      return imageName;
    },

    getThumbnailPath: function(entry) {
      return '/archive/boxbattles/Z_' + this.getImageName(entry);
    },

    getImagePath: function(entry) {
      return '/archive/boxbattles/' + this.getImageName(entry);
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"boxbattles"}},[_c('archive-header'),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('div',{attrs:{"id":"teletran-container"}},_vm._l((_vm.boxbattles),function(battle){return _c('div',{staticClass:"teletran-entry"},[_c('div',{staticClass:"teletran-box"},[_c('a',{staticClass:"fancybox-button-art",attrs:{"rel":"fancybox-button","title":battle.displayTitle,"href":battle.imagePath,"target":"_blank"}},[_c('img',{staticClass:"teletran-thumbnail",attrs:{"src":battle.thumbnailPath,"title":battle.displayName}})]),_vm._v(" "),_c('div',{staticClass:"teletran-name"},[_vm._v("\n          "+_vm._s(battle.displayName)+"\n          "),(battle.description)?_c('div',{staticClass:"teletran-name-note"},[_vm._v(_vm._s(battle.description))]):_vm._e()])])])}),0)],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('span',{staticClass:"teletran-header-neutral"},[_vm._v("Back of the Box Art")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"gallery-description"},[_c('p',[_vm._v("Due to popular demand, Botch's Transformers Box Art Archive presents what you saw when you flipped your box over and looked just above the tech spec: presenting the Back of the Box Art gallery. Of course, why there were multiples of each character, we never knew.")]),_vm._v(" "),_c('p',[_vm._v("If you think my years are wrong (and can show me why), please let me know. If you have one of the missing scans, or a better version of one I have here, please send it to "),_c('a',{attrs:{"href":"mailto:Botch@BotchTheCrab.com"}},[_vm._v("Botch@BotchTheCrab.com")]),_vm._v(".")])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-de4aca0a", __vue__options__)
  } else {
    hotAPI.rerender("data-v-de4aca0a", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],16:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 5, stdin */\n#catalogs .teletran-name {\n  height: 70px; }\n\n/* line 8, stdin */\n#catalogs .teletran-name-note {\n  margin-top: 0.5em; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var ArchiveHeaderVue = require('components/archive/partials/archive_header');

module.exports = {

  data () {
    return {
      catalogs: []
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue
  },

  beforeMount() {
    this.getCatalogData();
  },

  mounted() {
    globalService.setArchiveDocumentTitle("Catalogs");
  },

  methods: {

    getCatalogData: function() {
      var vm = this;

      firebase.database().ref('archive/catalogs').once('value').then(function(snapshot) {
        var catalogs = snapshot.val();

        var mapped_catalogs = [];

        _.each(catalogs, function(catalog) {
          mapped_catalogs.push(_.extend({
            "side": "A"
          }, catalog));
          mapped_catalogs.push(_.extend({
            "side": "B"
          }, catalog));
        });

        _.each(mapped_catalogs, function(catalog) {
          catalog.displayName = vm.getDisplayName(catalog);
          catalog.displayTitle = vm.getDisplayTitle(catalog);
          catalog.thumbnailPath = vm.getThumbnailPath(catalog);
          catalog.imagePath = vm.getImagePath(catalog);
        });

        vm.catalogs = mapped_catalogs;
      });

    },

    getDisplayName: function(entry) {
      var displayName = entry.year;
      if (entry.region !== "USA") {
        displayName += " (" + entry.region + ")";
      }
      return displayName;
    },

    getDisplayTitle: function(entry) {
      var displayTitle = this.getDisplayName(entry);
      if (entry.version) {
        displayTitle += " (" + entry.version + " Version)";
      }
      displayTitle += " - Side " + entry.side;
      return displayTitle;
    },

    getImageName: function(entry) {
      var imageName = 'catalog_';
      if (entry.region !== 'USA') {
        imageName += entry.region.toLowerCase() + '_';
      }
      imageName += entry.year + '_';
      if (entry.version) {
        imageName += entry.version.toLowerCase() + '_';
      }
      imageName += entry.side.toLowerCase();
      imageName += '.jpg';

      return imageName;
    },

    getThumbnailPath: function(entry) {
      return '/archive/catalogs/Z_' + this.getImageName(entry);
    },

    getImagePath: function(entry) {
      return '/archive/catalogs/' + this.getImageName(entry);
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"catalogs"}},[_c('archive-header'),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('div',{attrs:{"id":"teletran-container"}},_vm._l((_vm.catalogs),function(catalog){return _c('div',{staticClass:"teletran-entry"},[_c('div',{staticClass:"teletran-box"},[_c('a',{staticClass:"fancybox-button-art",attrs:{"rel":"fancybox-button","title":catalog.displayTitle,"href":catalog.imagePath,"target":"_blank"}},[_c('img',{staticClass:"teletran-thumbnail",attrs:{"src":catalog.thumbnailPath,"title":catalog.displayName}})]),_vm._v(" "),_c('div',{staticClass:"teletran-name"},[_vm._v("\n          "+_vm._s(catalog.displayName)+"\n          "),(catalog.version)?_c('div',{staticClass:"teletran-name-note"},[_vm._v(_vm._s(catalog.version)+" Version")]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"teletran-name-note"},[_vm._v("Side "+_vm._s(catalog.side))])])])])}),0)],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('span',{staticClass:"teletran-header-neutral"},[_vm._v("Catalogs")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"gallery-description"},[_c('p',[_vm._v("\n  \t\tMan, I loved poring over these catalogs that came with boxed Tranformers back in the 1980's. I still do! I like checklists, I like Transformers, I love assigning numbers to things... What more can I ask for?\n  \t")]),_vm._v(" "),_c('p',[_vm._v("\n      These toy catalogs are the somewhat formalized method by which fans have assigned a release year to all the classic Transformers, and it's the system I use as well for relegating box art entries to their respective years. Now that the Archive hosts Tech Spec scans and Instruction scans -- in addition to Box Art, of course -- it seemed only fitting to finally add the Catalogs that came with the toy.\n  \t")])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1a66d3a5", __vue__options__)
  } else {
    hotAPI.rerender("data-v-1a66d3a5", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],17:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
// var fancyboxService = require('services/fancybox_service');
var ArchiveHeaderVue = require('components/archive/partials/archive_header');
var TeletranHeaderVue = require('components/archive/partials/teletran_header');
var TeletranYearEntryVue = require('components/archive/partials/teletran_year_entry');

module.exports = {

  data () {
    return {
      faction: null,
      displayFaction: null,
      destinations: []
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue,
    'teletran-header': TeletranHeaderVue,
    'teletran-year-entry': TeletranYearEntryVue
  },

  beforeMount() {
    this.updateState();
  },

  watch: {
    $route(to, from) {
      this.updateState();
    }
  },

  mounted() {
    globalService.setArchiveDocumentTitle(this.displayFaction + "s");
  },

  methods: {

    updateState: function() {

      _.extend(this, {
        faction: this.$route.params.faction
      });

      var displayFaction = archiveService.toTitleCase(this.faction);
      _.extend(this, {
        displayFaction: displayFaction
      });

      // set body class
      // var factionClass = archiveService.getFactionClass(this.displayFaction);
      // globalService.setBodyClass(factionClass);

      var isAutobot = this.faction === 'autobot';

      var destinations = [
        { faction: this.faction, year: 1984, character: isAutobot ? "Optimus Prime" : "Megatron" },
        { faction: this.faction, year: 1985, character: isAutobot ? "Grimlock" : "Devastator" },
        { faction: this.faction, year: 1986, character: isAutobot ? "Ultra Magnus" : "Galvatron" },
        { faction: this.faction, year: 1987, character: isAutobot ? "Fortress Maximus" : "Scorponok" },
        { faction: this.faction, year: 1988, character: isAutobot ? "Waverider" : "Bomb-Burst" },
        { faction: this.faction, year: 1989, character: isAutobot ? "Ironworks" : "Airwave" },
        { faction: this.faction, year: 1990, character: isAutobot ? "Battlefield Headquarters" : "Cannon Transport" },
        { faction: this.faction, year: 'action_masters', text: "Action Masters", character: isAutobot ? "Mainframe" : "Krok" },
        { faction: this.faction, year: 'japan', text: "Japanese Exclusives", character: isAutobot ? "Star Saber" : "Deszaras" },
        { faction: this.faction, year: 'europe', text: "European Exclusives", character: isAutobot ? "Thunder Clash" : "Overlord" }
      ];

      this.destinations = destinations;

    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('archive-header'),_vm._v(" "),_c('teletran-header',{attrs:{"faction":_vm.faction}}),_vm._v(" "),_c('div',{class:_vm.containerClass,attrs:{"id":"teletran-container"}},_vm._l((_vm.destinations),function(desination){return _c('teletran-year-entry',{key:desination.year,attrs:{"desination":desination}})}),1)],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4587147e", __vue__options__)
  } else {
    hotAPI.rerender("data-v-4587147e", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"components/archive/partials/teletran_header":23,"components/archive/partials/teletran_year_entry":25,"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],18:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n#history-import {\n  font-size: 1em;\n  text-align: justify;\n  max-width: 800px;\n  margin: 0 auto 50px; }\n  /* line 9, stdin */\n  #history-import img {\n    max-width: 200px; }\n  /* line 12, stdin */\n  #history-import .thumbinner {\n    width: auto !important; }\n\n/* line 17, stdin */\n#toc,\n#TemplateUserinfo,\n#history-import center,\n#history-import h4,\n#history-import h3,\n.editsection,\n.magnify,\n.autonumber,\n.thumbcaption {\n  display: none; }\n\n/* line 28, stdin */\ndiv.tleft {\n  float: left;\n  clear: left;\n  margin: 0 10px 10px 0; }\n\n/* line 34, stdin */\ndiv.tright {\n  float: right;\n  clear: right;\n  margin: 0 0 10px 10px; }\n\n/* line 40, stdin */\ndiv.thumbinner {\n  background-color: #F9F9F9;\n  border: 1px solid #CCCCCC;\n  font-size: 94%;\n  overflow: hidden;\n  padding: 3px !important;\n  text-align: center;\n  color: black; }\n\n/* line 50, stdin */\n.thumbcaption {\n  padding: 3px !important;\n  text-align: left;\n  font-size: 10px; }\n  /* line 55, stdin */\n  .thumbcaption a {\n    color: blue; }\n\n/* line 58, stdin */\n.thumbimage {\n  border: 1px solid #CCCCCC; }\n\n/* line 62, stdin */\n.history-credits {\n  margin: 0 auto 15px;\n  max-width: 800px;\n  font-size: 0.8em;\n  text-align: center;\n  color: #ccc;\n  background-color: #222;\n  box-shadow: 2px 2px 3px #333;\n  padding: 10px; }\n  /* line 72, stdin */\n  .history-credits div {\n    margin-bottom: 3px;\n    font-size: 1.2em; }\n\n/* line 78, stdin */\n.loading,\n.load-error {\n  text-align: center; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var ArchiveHeaderVue = require('components/archive/partials/archive_header');
var TeletranEntryVue = require('components/archive/partials/teletran_entry');

module.exports = {

  data () {
    return {
      parsedHistoryMarkup: '<div class="loading">Loading history ...</div>'
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue,
    'teletran-entry': TeletranEntryVue
  },

  beforeMount() {
    this.getBoxArtHistory();
  },

  mounted() {
    globalService.setArchiveDocumentTitle("Box Art History");
  },

  methods: {

    getBoxArtHistory: function() {

      var boxArtUrl = "https://tfwiki.net/w2/index.php?title=Package_art&action=render";
      var corsProxy = "https://api.allorigins.win/get?url=";

      var vm = this;

      $.getJSON(corsProxy + encodeURIComponent(boxArtUrl), function (data) {
          var markup = data && data.contents;

          var startingIndexMarker = '</center>';
          var startingIndex = markup.indexOf(startingIndexMarker) + startingIndexMarker.length;
          var endingIndexMarker = '<h3> <span class="mw-headline" id="Generation_2">Generation 2</span></h3>';
          var endingIndex = markup.indexOf(endingIndexMarker);

          var historyMarkup = markup.substring(startingIndex, endingIndex);
          historyMarkup = historyMarkup.replace(
            /src="\//g,
            'src="https://tfwiki.net/'
          );

          historyMarkup = historyMarkup.replace(
            / href=/g,
            ' target="tfwiki" href='
          );

          historyMarkup = historyMarkup.replace(/ width="\d+"/g, '');
          historyMarkup = historyMarkup.replace(/ height="\d+"/g, '');

          historyMarkup = historyMarkup.replace(
            'https://tfwiki.net/wiki/File:G1_OptimusPrime_boxart.jpg',
            '#/archive/search/optimus%20prime'
          );

          historyMarkup = historyMarkup.replace(
            'https://tfwiki.net/wiki/File:Thunderwingboxart.jpg',
            '#/archive/search/thunderwing'
          );

          historyMarkup = historyMarkup.replace(
            'https://tfwiki.net/wiki/File:G1_1984_backofboxbattle.jpg',
            '#/archive/boxbattles'
          );

          historyMarkup = historyMarkup.replace(
            'https://tfwiki.net/wiki/File:SpaceshotAngry.jpg',
            '#/archive/boxbattles'
          );

          vm.parsedHistoryMarkup = historyMarkup;
      })
      .fail(function(error) {
        console.log('FAILURE!');
        console.log({
          error: error
        });

        vm.parsedHistoryMarkup = '<div class="load-error">There was an error loading box art history.</div>';
      });

    }
  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"Reinforcements"}},[_c('archive-header'),_vm._v(" "),_vm._m(0),_vm._v(" "),_c('div',{attrs:{"id":"history-import"},domProps:{"innerHTML":_vm._s(_vm.parsedHistoryMarkup)}}),_vm._v(" "),_vm._m(1),_vm._v(" "),_vm._m(2)],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('span',{staticClass:"teletran-header-neutral"},[_vm._v("Box Art History")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"history-credits"},[_c('div',[_c('b',[_vm._v("What now?")])]),_vm._v(" "),_c('div',[_vm._v("• Start browsing Generation One box art with either the heroic "),_c('a',{attrs:{"href":"#/archive/teletran/autobot"}},[_c('b',[_vm._v("Autobots")])]),_vm._v(" or the evil "),_c('a',{attrs:{"href":"#/archive/teletran/decepticon"}},[_c('b',[_vm._v("Decepticons")])]),_vm._v("!")]),_vm._v(" "),_c('div',[_vm._v("• Continue reading about box art "),_c('i',[_vm._v("after")]),_vm._v(" Generation One by visiting the "),_c('a',{attrs:{"href":"http://tfwiki.net/wiki/Package_art","target":"tfwiki"}},[_vm._v("Package Art")]),_vm._v(" page of "),_c('a',{attrs:{"href":"http://tfwiki.net/","target":"tfwiki"}},[_vm._v("TFWiki.net")]),_vm._v(".")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"history-credits"},[_vm._v("\n\t\tThe contents of this page are scraped in real time from the "),_c('a',{attrs:{"href":"http://tfwiki.net/wiki/Package_art","target":"tfwiki"}},[_vm._v("Package Art")]),_vm._v(" article of the incredible "),_c('a',{attrs:{"href":"http://tfwiki.net/","target":"tfwiki"}},[_vm._v("TFWiki.net")]),_vm._v(" via "),_c('a',{attrs:{"href":"https://allorigins.win/","target":"allorigins"}},[_vm._v("allorigins.win")]),_vm._v("."),_c('br'),_vm._v("\n\t\tSpecial thanks to "),_c('a',{attrs:{"href":"http://deriksmith.livejournal.com/","target":"derik"}},[_c('b',[_vm._v("Derik in Minnesota")])]),_vm._v(", a web developer who blogs about content licensing, Transformers and other crazy stuff."),_c('br')])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-30b74439", __vue__options__)
  } else {
    hotAPI.rerender("data-v-30b74439", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"components/archive/partials/teletran_entry":22,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],19:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
var ArchiveHeaderVue = require('components/archive/partials/archive_header');

var yearsUsa = [1984, 1985, 1986, 1987, 1988, 1989, 1990, 'action_masters'];
var yearsEurope = [1990, 1991, 1992, 1993, 'action_masters'];

var instructionsDataModel = {
  usa: {
    autobots: {},
    decepticons: {}
  },
  europe: {
    autobots: {},
    decepticons: {}
  }
};
_.each(yearsUsa, function(year) {
  instructionsDataModel.usa.autobots[String(year)] = [];
  instructionsDataModel.usa.decepticons[String(year)] = [];
});
_.each(yearsEurope, function(year) {
  instructionsDataModel.europe.autobots[String(year)] = [];
  instructionsDataModel.europe.decepticons[String(year)] = [];
});

var globalService = require('services/global_service');

module.exports = {

  data () {
    return {

      yearsUsa: yearsUsa,

      yearsEurope: yearsEurope,

      instructions: instructionsDataModel

    }
  },

  components: {
    'archive-header': ArchiveHeaderVue
  },

  beforeMount() {
    this.getInstructionData();
  },

  mounted() {
    globalService.setArchiveDocumentTitle("Instructions");
  },

  methods: {

    getInstructionData: function() {
      var vm = this;

      var usaRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/transformers_usa').once('value').then(function(usa_snapshot) {
          var transformers_usa = usa_snapshot.val();
          var usa_instructions = _.chain(transformers_usa).where({ hasInstructions: true }).each(function(instr) {
            instr.region = "USA";
          }).value();
          deferred.resolve(usa_instructions);
        });
      }).promise();

      var europeRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/transformers_europe').once('value').then(function(europe_snapshot) {
          var transformers_europe = europe_snapshot.val();
          var europe_instructions = _.chain(transformers_europe).where({ hasInstructions: true }).each(function(instr) {
            instr.region = "Europe";
          }).value();
          deferred.resolve(europe_instructions);
        });
      }).promise();

      var actionMastersRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/action_masters').once('value').then(function(action_masters_snapshot) {
          var action_masters = action_masters_snapshot.val();
          var action_master_instructions = _.where(action_masters, { hasInstructions: true });
          _.each(action_master_instructions, function(instr) {
            instr.year = 'action_masters';
          });
          deferred.resolve(action_master_instructions);
        });
      }).promise();

      var extraRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/extra_instructions').once('value').then(function(extra_instructions_snapshot) {
          var extra_instructions = extra_instructions_snapshot.val();
          deferred.resolve(extra_instructions);
        });
      }).promise();

      $.when(
        usaRequest,
        europeRequest,
        actionMastersRequest,
        extraRequest
      ).done(function(usa_instructions, europe_instructions, action_master_instructions, extra_instructions) {

        var all_instructions = _.flatten([usa_instructions, europe_instructions, action_master_instructions, extra_instructions]);
        var mapped_instructions = _.map(all_instructions, function(instr) {

          // interpolate note into name
          var tsName = instr.name;
          if (instr.note) {
            tsName += ' (' + instr.note + ')';
          }

          return {
            name: tsName,
            faction: instr.faction,
            year: instr.year,
            region: instr.region,
            imgPath: vm.getImagePath(instr)
          };
        });

        // USA
        _.each(yearsUsa, function(year) {
          var autobots = _.chain(mapped_instructions).where({ region: "USA", faction: "Autobot", year: year }).sortBy('name').value();
          var decepticons = _.chain(mapped_instructions).where({ region: "USA", faction: "Decepticon", year: year }).sortBy('name').value();

          _.each(autobots, function(transformer, index) {
            Vue.set(vm.instructions.usa.autobots[String(year)], index, autobots[index]);
          });
          _.each(decepticons, function(transformer, index) {
            Vue.set(vm.instructions.usa.decepticons[String(year)], index, decepticons[index]);
          });
        });

        // Europe
        _.each(yearsEurope, function(year) {
          var autobots = _.where(mapped_instructions, { region: "Europe", faction: "Autobot", year: year });
          var decepticons = _.where(mapped_instructions, { region: "Europe", faction: "Decepticon", year: year });

          _.each(autobots, function(transformer, index) {
            Vue.set(vm.instructions.europe.autobots[String(year)], index, autobots[index]);
          });
          _.each(decepticons, function(transformer, index) {
            Vue.set(vm.instructions.europe.decepticons[String(year)], index, decepticons[index]);
          });
        });

      });

    },

    getImagePath: function(entry) {
      var imagePath = '/archive/instructions/';
      imagePath += entry.faction.toLowerCase() + '/';
      if (entry.region === 'Europe') {
        imagePath += 'europe/';
      }
      imagePath += entry.year + '/';
      imagePath += 'instr_' + archiveService.pathWash(entry.name);
      if (entry.note) {
        imagePath += '_(' + archiveService.pathWash(entry.note) + ')';
      }
      imagePath += '.jpg';

      return imagePath;
    },

    getDisplayYear: function(year) {
      if (isNaN(year)) {
        year = archiveService.pathUnwash(year);
      }
      return year;
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('archive-header'),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-autobot"},[_vm._v("Autobots")]),_vm._v(" "),_vm._l((_vm.yearsUsa),function(year){return (_vm.instructions.usa.autobots[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.instructions.usa.autobots[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-instructions",attrs:{"rel":"fancybox-button","title":entry.name + ' - Instructions',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-decepticon"},[_vm._v("Decepticons")]),_vm._v(" "),_vm._l((_vm.yearsUsa),function(year){return (_vm.instructions.usa.decepticons[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.instructions.usa.decepticons[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-instructions",attrs:{"rel":"fancybox-button","title":entry.name + ' - Instructions',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_vm._m(2),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-autobot"},[_vm._v("Autobots (European)")]),_vm._v(" "),_vm._l((_vm.yearsEurope),function(year){return (_vm.instructions.europe.autobots[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.instructions.europe.autobots[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-instructions",attrs:{"rel":"fancybox-button","title":entry.name + ' - Instructions',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-decepticon"},[_vm._v("Decepticons (European)")]),_vm._v(" "),_vm._l((_vm.yearsEurope),function(year){return (_vm.instructions.europe.decepticons[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.instructions.europe.decepticons[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-instructions",attrs:{"rel":"fancybox-button","title":entry.name + ' - Instructions',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_vm._m(3)],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('span',{staticClass:"teletran-header-neutral"},[_vm._v("Instructions")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',{staticClass:"archive-paperwork-credits"},[_vm._v("\n  \t\tThis page offers Instruction scans for all Generation One (G1) Transformers released in America and Europe."),_c('br'),_vm._v("\n  \t\tScans from Japan and other lines (G2, Beast Wars, etc) can be found "),_c('a',{attrs:{"href":"http://tfwiki.net/~fortmax/","target":"fortmax"}},[_vm._v("here")]),_vm._v("."),_c('br'),_vm._v("\n  \t\tEternal thanks to "),_c('b',[_vm._v("James Wilson")]),_vm._v(", the original curator of the Transfomers G1 Instruction Scan Archive.\n  \t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticStyle:{"clear":"both"}},[_c('br'),_c('br')])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',{staticStyle:{"text-align":"center","font-size":"0.9em","padding":"50px 15px","clear":"both"}},[_c('b',[_vm._v("Historical contributors to the Instruction Scan Archive:")]),_vm._v(" Crazysteve, Devvi, Dr_Nilkog, EwOkSlaYer, Hatch, Hex, Iacon, Jack Lawrence, James Findley, James Wilson, Jarrod Trout, Jason Bell, Jeff Morris, Jeroen Blok, Jim Huey Lee, Kenny McCoy, Kranix2000, Kris Shaw, Matt Anderson, Michael Hofle, Mirage, Napjr, Neil Papworth, Palmeiro, Prime Saber, Primex15, Rapido, Richard C. Mistron, Risk, Rob Rocca, Scott Mangini, Senex Prime, Sonicjay, Steve Taylor, Tec, Tikgnat, Wayne Bickley, William Leijten and Zobovor.\n    ")])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a9237260", __vue__options__)
  } else {
    hotAPI.rerender("data-v-a9237260", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],20:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//


module.exports = {
  computed: {

    headerLink: function() {
      return '/archive';
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"archive-logo"}},[_c('router-link',{attrs:{"to":_vm.headerLink}},[_c('img',{attrs:{"src":"./archive/images/teletran_logo.gif","alt":"Botch's Transformers Box Art Archive"}})])],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1182e96c", __vue__options__)
  } else {
    hotAPI.rerender("data-v-1182e96c", __vue__options__)
  }
})()}
},{"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],21:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//


var archiveService = require('services/archive_service');

module.exports = {
  props: ['faction', 'year'],

  data () {
    return {
      tail: "&#133;"
    }
  },

  computed: {

    backText: function() {
      return this.year + ' ' + archiveService.toTitleCase(this.faction)+'s';
    },
    backLink: function() {
      return '/archive/teletran/' + this.faction.toLowerCase() + '/' + this.year;
    },
    backClass: function() {
      return 'teletran-next-' + this.faction.toLowerCase();
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"teletran-back"}},[_c('router-link',{class:_vm.backClass,attrs:{"to":_vm.backLink}},[_c('span',[_vm._v("Back to")]),_vm._v(" "+_vm._s(_vm.backText)+" "),_c('span',{domProps:{"innerHTML":_vm._s(_vm.tail)}})])],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ce363a82", __vue__options__)
  } else {
    hotAPI.rerender("data-v-ce363a82", __vue__options__)
  }
})()}
},{"services/archive_service":46,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],22:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');

module.exports = {
  props: ['entry'],

  methods: {
    getUnderscoreName: function(entry) {
      var underscoreName = archiveService.pathWash(entry.name);
      if (entry.note) {
        underscoreName += '_(' + archiveService.pathWash(entry.note) + ')';
      }
      return underscoreName;
    },
    getFactionPrefix: function(entry) {
      if (entry.faction) {
        return entry.faction.toLowerCase() + '/';
      }
      return '';
    },
    getImageName: function(entry) {
      return entry.imageName || this.getUnderscoreName(this.entry);
    }
  },

  computed: {

    imageClass: function() {
      if (this.entry.areMicromasters || this.entry.imageStatus){
        return '';
      }
      return 'fancybox-button-art';
    },

    imageTarget: function() {
      if (this.entry.areMicromasters || this.entry.imageStatus){
        return '_self';
      }
      return '_blank';
    },

    imagePath: function() {
      if (this.entry.imageStatus) {
        return '/#/contact';
      }

      if (this.entry.areMicromasters){
        return '/#' + globalService.getCurrentRoute() + '/' + this.getUnderscoreName(this.entry);
      }

      var path = '/archive/' + this.getFactionPrefix(this.entry);
      if (this.entry.micromasterId) {
        path += this.entry.year + '/' + archiveService.pathWash(this.entry.team);
      } else if (this.entry.actionMasterId) {
        path += 'action_masters';
      } else if (this.entry.transformerJapanId) {
        path += 'japan';
      } else if (this.entry.transformerEuropeId) {
        path += 'europe';
      } else if (this.entry.year) {
        path += this.entry.year;
      }
      path += '/' + this.getImageName(this.entry) + '.jpg';
      return path;
    },

    thumbnailPath: function() {
      if (this.entry.imageStatus === 'missing') {
        return '/archive/images/Z_image_missing.gif';
      }
      if (this.entry.imageStatus === 'unedited') {
        return '/archive/images/Z_image_unedited.gif';
      }

      var path = '/archive/' + this.getFactionPrefix(this.entry);
      if (this.entry.micromasterId) {
        path += this.entry.year + '/' + archiveService.pathWash(this.entry.team);
      } else if (this.entry.actionMasterId) {
        path += 'action_masters';
      } else if (this.entry.transformerJapanId) {
        path += 'japan';
      } else if (this.entry.transformerEuropeId) {
        path += 'europe';
      } else if (this.entry.year) {
        path += this.entry.year;
      }
      path += '/Z_' + this.getImageName(this.entry) + '.gif';
      return path;
    },

    techSpecPath: function() {
      var path = '/archive/techspecs/' + this.getFactionPrefix(this.entry);
      if (this.entry.actionMasterId) {
        path += 'action_masters';
      // } else if (this.entry.transformerJapanId) {
      //   path += 'japan';
      } else if (this.entry.transformerEuropeId) {
        path += 'europe/' + this.entry.year;
      } else if (this.entry.year) {
        path += this.entry.year;
      }
      path += '/ts_' + this.getImageName(this.entry) + '.jpg';
      return path;
    },

    instructionsPath: function() {
      var path = '/archive/instructions/' + this.getFactionPrefix(this.entry);
      if (this.entry.actionMasterId) {
        path += 'action_masters';
      // } else if (this.entry.transformerJapanId) {
      //   path += 'japan';
      } else if (this.entry.transformerEuropeId) {
        path += 'europe/' + this.entry.year;
      } else if (this.entry.year) {
        path += this.entry.year;
      }
      path += '/instr_' + this.getImageName(this.entry) + '.jpg';
      return path;
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-entry"},[_c('div',{staticClass:"teletran-box"},[_c('a',{class:_vm.imageClass,attrs:{"rel":"fancybox-button","title":_vm.entry.name,"data-character":_vm.entry.name,"data-techspecs":_vm.entry.hasTechSpec || 'false',"data-instructions":_vm.entry.hasInstructions || 'false',"href":_vm.imagePath,"target":_vm.imageTarget}},[_c('img',{staticClass:"teletran-thumbnail",attrs:{"src":_vm.thumbnailPath,"title":_vm.entry.name + ' - Box Art'}})]),_vm._v(" "),(!this.entry.transformerJapanId)?_c('div',{staticClass:"teletran-icons"},[(_vm.entry.hasTechSpec)?_c('a',{staticClass:"fancybox-button-techspecs",attrs:{"rel":"fancybox-button","title":_vm.entry.name + ' - Tech Specs',"data-character":_vm.entry.name,"data-art":"true","data-instructions":_vm.entry.hasInstructions || 'false',"href":_vm.techSpecPath,"target":"_blank"}},[_c('img',{attrs:{"src":"/archive/images/icon_techspec.gif","title":_vm.entry.name + ' - Tech Specs'}})]):_vm._e(),_vm._v(" "),(_vm.entry.hasInstructions)?_c('a',{staticClass:"fancybox-button-instructions",attrs:{"rel":"fancybox-button","title":_vm.entry.name + ' - Instructions',"data-character":_vm.entry.name,"data-art":"true","data-techspecs":_vm.entry.hasTechSpec || 'false',"href":_vm.instructionsPath,"target":"_blank"}},[_c('img',{attrs:{"src":"/archive/images/icon_instruction.gif","title":_vm.entry.name + ' - Instructions'}})]):_vm._e()]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"teletran-name"},[_vm._v("\n      "+_vm._s(_vm.entry.name)+"\n      "),(_vm.entry.note)?_c('div',{staticClass:"teletran-name-note"},[_vm._v("("+_vm._s(_vm.entry.note)+")")]):_vm._e(),_vm._v(" "),(_vm.entry.releaseId)?_c('div',{staticClass:"teletran-release-number"},[_vm._v(_vm._s(_vm.entry.releaseId))]):_vm._e()])])])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1a30134a", __vue__options__)
  } else {
    hotAPI.rerender("data-v-1a30134a", __vue__options__)
  }
})()}
},{"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],23:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//


// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');

module.exports = {
  props: ['faction', 'year'],

  computed: {

    headerText: function() {
      var displayFaction = archiveService.toTitleCase(this.faction);
      if (!this.year) {
        // Autobot/Decepticon faction landing page
        return displayFaction + "s";
      }

      if (this.year === 'action_masters') {
        return displayFaction + " Action Masters";
      } else if (this.year === 'japan') {
        return "Japanese " + (this.faction === 'autobot' ? "Cybertrons" : "Destrons");
      } else if (this.year === 'europe') {
        return "European " + displayFaction + "s";
      }
      return this.year + " " + displayFaction + "s";
    },

    headerClass: function() {
      return 'teletran-header-' + this.faction.toLowerCase();
    }

  }
};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('span',{class:_vm.headerClass},[_vm._v(_vm._s(_vm.headerText))])])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1975cd65", __vue__options__)
  } else {
    hotAPI.rerender("data-v-1975cd65", __vue__options__)
  }
})()}
},{"services/archive_service":46,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],24:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');

module.exports = {
  props: ['faction', 'year'],

  data () {
    return {
      tail: "&#133;"
    }
  },

  methods: {

    getParams: function() {

      if (!isNaN(this.year)) {
        this.year = Number(this.year);
      }

  		var switchFaction = this.faction === 'autobot' ? 'decepticon' : 'autobot';
      var switchYear = this.year;

      var nextFaction = null;
      var nextYear = null;

			switch (this.year) {
				case 1984:
				case 1985:
				case 1986:
				case 1987:
				case 1988:
				case 1989:
					// go to next year
					nextFaction = this.faction;
					nextYear = this.year + 1;
					break;
				case 1990:
					// go to Action Masters
					nextFaction = this.faction;
					nextYear = 'action_masters';
					break;
        case 'action_masters':
          // go to Japan
          nextFaction = this.faction;
					nextYear = 'japan';
          break;
        case 'japan':
          // go to Europe
          nextFaction = this.faction;
					nextYear = 'europe';
          break;
        case 'europe':
          // switch sides!
          nextFaction = switchFaction;
					nextYear = 1984;
          break;
			}

      return {
        nextFaction: nextFaction,
        nextYear: nextYear,

        switchFaction: switchFaction,
        switchYear: switchYear
      }
    }

  },

  computed: {

    nextText: function() {
      var params = this.getParams();
      var faction = params.nextFaction;
      var year = params.nextYear;

      if (year === 'action_masters') {
        return (faction === 'autobot' ? "Autobot" : "Decepticon") + " Action Masters";
      } else if (year === 'japan') {
        return "Japanese " + (faction === 'autobot' ? "Cybertrons" : "Destrons");
      } else if (year === 'europe') {
        return "European " + (faction === 'autobot' ? "Autobots" : "Decepticons");
      }

      return year + " " + (faction === 'autobot' ? "Autobots" : "Decepticons");
    },
    nextLink: function() {
      var params = this.getParams();
      var faction = params.nextFaction;
      var year = params.nextYear;

      return '/archive/teletran/' + faction + '/' + year;
    },
    nextClass: function() {
      var params = this.getParams();
      var faction = params.nextFaction;

      return 'teletran-next-' + faction;
    },

    switchText: function() {
      var params = this.getParams();
      var faction = params.switchFaction;
      var year = params.switchYear;

      if (year === 'action_masters') {
        return (faction === 'autobot' ? "Autobot" : "Decepticon") + " Action Masters";
      } else if (year === 'japan') {
        return "Japanese " + (faction === 'autobot' ? "Cybertrons" : "Destrons");
      } else if (year === 'europe') {
        return "European " + (faction === 'autobot' ? "Autobots" : "Decepticons");
      }

      return year + " " + (faction === 'autobot' ? "Autobots" : "Decepticons");
    },
    switchLink: function() {
      var params = this.getParams();
      var faction = params.switchFaction;
      var year = params.switchYear;

      return '/archive/teletran/' + faction + '/' + year;
    },
    switchClass: function() {
      var params = this.getParams();
      var faction = params.switchFaction;

      return 'teletran-next-' + faction;
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"teletran-next"}},[_c('div',{attrs:{"id":"teletran-continue"}},[_c('router-link',{class:_vm.nextClass,attrs:{"to":_vm.nextLink}},[_c('span',[_vm._v("Continue to")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.nextText)+" "),_c('span',{domProps:{"innerHTML":_vm._s(_vm.tail)}})])])],1),_vm._v(" "),_c('div',{attrs:{"id":"teletran-switch"}},[_c('router-link',{class:_vm.switchClass,attrs:{"to":_vm.switchLink}},[_c('span',[_vm._v("Switch to")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.switchText)+" "),_c('span',{domProps:{"innerHTML":_vm._s(_vm.tail)}})])])],1)])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6f6082cb", __vue__options__)
  } else {
    hotAPI.rerender("data-v-6f6082cb", __vue__options__)
  }
})()}
},{"services/archive_service":46,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],25:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');

module.exports = {
  props: ['desination'],

  methods: {

  },

  computed: {

    desinationName: function() {
      return this.desination.text || this.desination.year;
    },

    desinationLink: function() {
      return '/archive/teletran/' + this.desination.faction + '/' + this.desination.year;
    },

    thumbnailPath: function() {
      return '/archive/' + this.desination.faction + '/' + this.desination.year + '/Z_' + archiveService.pathWash(this.desination.character) + '.gif';
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-entry"},[_c('div',{staticClass:"teletran-box"},[_c('router-link',{attrs:{"to":_vm.desinationLink}},[_c('img',{staticClass:"teletran-thumbnail",attrs:{"src":_vm.thumbnailPath}})]),_vm._v(" "),_c('div',{staticClass:"teletran-name"},[_vm._v("\n      "+_vm._s(_vm.desinationName)+"\n    ")])],1)])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-12f13348", __vue__options__)
  } else {
    hotAPI.rerender("data-v-12f13348", __vue__options__)
  }
})()}
},{"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],26:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 5, stdin */\n#reinforcements hr {\n  margin: 20px auto 35px; }\n\n/* line 9, stdin */\n#reinforcements .teletran-icons {\n  display: none; }\n\n/* line 13, stdin */\n#reinforcements .archive-paperwork-credits {\n  text-align: left; }\n  /* line 16, stdin */\n  #reinforcements .archive-paperwork-credits b {\n    font-size: 120%; }\n\n/* line 22, stdin */\n#reinforcements #Bumper .archive-paperwork-credits {\n  margin: 0 0 15px; }\n\n/* line 28, stdin */\n#reinforcements #Kronoform .teletran-name {\n  height: 62px; }\n\n/* line 31, stdin */\n#reinforcements #Kronoform .teletran-name-note {\n  white-space: normal;\n  line-height: 1.2em;\n  margin-top: 7px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// ARCHIVE COMPONENTS
var ArchiveHeaderVue = require('components/archive/partials/archive_header');
var TeletranEntryVue = require('components/archive/partials/teletran_entry');

// TELETRAN (PAGE) COMPONENTS

var powerdashers = [
  {
    name: "Sky Dasher",
    note: "robot",
    faction: "reinforcements",
    imageName: "Powerdasher_Sky_robot"
  },
  {
    name: "Sky Dasher",
    note: "vehicle",
    faction: "reinforcements",
    imageName: "Powerdasher_Sky_vehicle"
  },
  {
    name: "F-1 Dasher",
    note: "robot",
    faction: "reinforcements",
    imageName: "Powerdasher_F-1_robot"
  },
  {
    name: "F-1 Dasher",
    note: "vehicle",
    faction: "reinforcements",
    imageName: "Powerdasher_F-1_vehicle"
  },
  {
    name: "Drill Dasher",
    note: "robot",
    faction: "reinforcements",
    imageName: "Powerdasher_Drill_robot"
  },
  {
    name: "Drill Dasher",
    note: "vehicle",
    faction: "reinforcements",
    imageName: "Powerdasher_Drill_vehicle"
  }
];

var bumper = {
  name: "Bumper",
  faction: "reinforcements"
};

var kronoform = [
  {
    name: "Kaltor",
    note: "Autobot robot & calculator-watch",
    faction: "reinforcements",
    imageName: "kaltor"
  },
  {
    name: "Autoceptor",
    note: "Autobot robot, car & watch",
    faction: "reinforcements",
    imageName: "autoceptor"
  },
  {
    name: "Deceptor",
    note: "Decepticon robot, watch & condor-jet",
    faction: "reinforcements",
    imageName: "deceptor"
  }
];

var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
      powerdashers: powerdashers,
      bumper: bumper,
      kronoform: kronoform
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue,
    'teletran-entry': TeletranEntryVue
  },

  mounted() {
    globalService.setArchiveDocumentTitle("Reinforcements From Cybertron");
  },

  methods: {
  },

  computed: {
  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"reinforcements"}},[_c('archive-header'),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('div',{staticClass:"teletran-container"},_vm._l((_vm.powerdashers),function(entry){return _c('teletran-entry',{attrs:{"entry":entry}})}),1),_vm._v(" "),_c('hr'),_vm._v(" "),_c('div',{staticClass:"teletran-container",attrs:{"id":"Bumper"}},[_c('teletran-entry',{attrs:{"entry":_vm.bumper}}),_vm._v(" "),_vm._m(2)],1),_vm._v(" "),_c('hr'),_vm._v(" "),_c('div',{staticClass:"teletran-container",attrs:{"id":"Kronoform"}},[_vm._m(3),_vm._v(" "),_c('div',{staticClass:"teletran-container"},_vm._l((_vm.kronoform),function(entry){return _c('teletran-entry',{attrs:{"entry":entry}})}),1)])],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('img',{attrs:{"src":"/archive/images/hd_reinforcements.gif","alt":"Reinforcements from Cybertron"}})])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',{staticClass:"archive-paperwork-credits"},[_c('b',[_vm._v("POWERDASHERS!")]),_vm._v(" "),_c('br'),_vm._v("Mail-away Autobots from 1984/5. There were three, and you never knew which one you were going to get. They came in plain boxes and plastic bags, so there was never any official Hasbro box art for them. However, like many other Transformers, they were originally Diaclone toys. The illustrious Scott Gray sent these in: the original Diaclone box art.\n  ")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"col-lg-10 col-md-10 col-sm-9 col-xs-12"},[_c('p',{staticClass:"archive-paperwork-credits"},[_c('b',[_vm._v("BUMPER")]),_vm._v(", perhaps more commonly known as "),_c('b',[_vm._v("Bumblejumper")]),_vm._v(", was never officially released in America, but he occasionally showed up packaged on a Bumblebee or Cliffjumper card. He is a completely unique mold similar but not identical to "),_c('a',{attrs:{"href":"#/archive/teletran/autobot/1984"}},[_vm._v("Bumblebee and Cliffjumper")]),_vm._v(": Bumper resembles a Mazda Familia 1500XG, whereas Bumblebee was a Volkswagen Beetle and Cliffjumper was a Porsche 944. All three figures come from the Microman series, one of the toylines that was a predecessor and contributor to the Transformers line. The names \"Bumblejumper\" and \"Bumper\" come from a hybridization by the fans of the names \"Bumblebee\" and \"Cliffjumper\", stemming from its appearance on their two cards, and the fact that originally some mistook the toy for a blend and/or recoloring of the two molds. Bumper was only released officially in Brazil (under the name Sedan and in various colors) and that's where this artwork came from.")]),_vm._v(" "),_c('p',{staticClass:"archive-paperwork-credits"},[_vm._v("Sources: "),_c('a',{attrs:{"href":"http://www.toyarchive.com/Transformers/Brazilian/MiniCars.html"}},[_vm._v("Super Toy Archive")]),_vm._v("; "),_c('a',{attrs:{"href":"http://www.geocities.com/transfandomcomic/collection_bumblejumper.html"}},[_vm._v("Planet Sabretron")]),_vm._v("; "),_c('a',{attrs:{"href":"http://www.ocf.berkeley.edu/~mingus/tech/bumper.htm"}},[_vm._v("Slim's Custom Transformer Tech Specs")]),_vm._v(".")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',{staticClass:"archive-paperwork-credits"},[_c('b',[_vm._v("From the KRONOFORM Collection!")]),_vm._v(" "),_c('br'),_vm._v("Transforms from LCD watch to vehicle to robot. I even think I had Kaltor as a kid, when I was too dumb to save the boxes. Oh well.\n    ")])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3bcab566", __vue__options__)
  } else {
    hotAPI.rerender("data-v-3bcab566", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"components/archive/partials/teletran_entry":22,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],27:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n#BotchTechSpec {\n  padding: 50px 0;\n  margin: 0 auto;\n  font-size: 0.9em;\n  clear: both; }\n  /* line 9, stdin */\n  #BotchTechSpec > div {\n    margin-bottom: 10px; }\n  /* line 13, stdin */\n  #BotchTechSpec img {\n    width: 100%;\n    max-width: 400px; }\n  /* line 18, stdin */\n  #BotchTechSpec a {\n    white-space: nowrap; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
var ArchiveHeaderVue = require('components/archive/partials/archive_header');

var yearsUsa = [1984, 1985, 1986, 1987, 1988, 1989, 1990, 'action_masters'];
var yearsEurope = [1990, 1991, 1992, 1993, 'action_masters'];

var techspecsDataModel = {
  usa: {
    autobots: {},
    decepticons: {}
  },
  europe: {
    autobots: {},
    decepticons: {}
  }
};
_.each(yearsUsa, function(year) {
  techspecsDataModel.usa.autobots[String(year)] = [];
  techspecsDataModel.usa.decepticons[String(year)] = [];
});
_.each(yearsEurope, function(year) {
  techspecsDataModel.europe.autobots[String(year)] = [];
  techspecsDataModel.europe.decepticons[String(year)] = [];
});

var globalService = require('services/global_service');

module.exports = {

  data () {
    return {

      yearsUsa: yearsUsa,

      yearsEurope: yearsEurope,

      techspecs: techspecsDataModel

    }
  },

  components: {
    'archive-header': ArchiveHeaderVue
  },

  beforeMount() {
    this.getTechSpecData();
  },

  mounted() {
    globalService.setArchiveDocumentTitle("Tech Specs");
  },

  methods: {

    getTechSpecData: function() {
      var vm = this;

      firebase.database().ref('archive/transformers_usa').once('value').then(function(usa_snapshot) {
        var transformers_usa = usa_snapshot.val();
        var usa_techspecs = _.chain(transformers_usa).where({ hasTechSpec: true }).each(function(ts) {
          ts.region = "USA";
        }).value();

        firebase.database().ref('archive/transformers_europe').once('value').then(function(europe_snapshot) {
          var transformers_europe = europe_snapshot.val();
          var europe_techspecs = _.chain(transformers_europe).where({ hasTechSpec: true }).each(function(ts) {
            ts.region = "Europe";
          }).value();

          firebase.database().ref('archive/action_masters').once('value').then(function(action_masters_snapshot) {
            var action_masters = action_masters_snapshot.val();
            var action_master_techspecs = _.where(action_masters, { hasTechSpec: true });
            _.each(action_master_techspecs, function(ts) {
              ts.year = 'action_masters';
            });

            firebase.database().ref('archive/extra_techspecs').once('value').then(function(extra_techspecs_snapshot) {
              var extra_techspecs = extra_techspecs_snapshot.val();

              var all_techspecs = _.flatten([usa_techspecs, europe_techspecs, action_master_techspecs, extra_techspecs]);
              var mapped_techspecs = _.map(all_techspecs, function(ts) {

                // interpolate note into name
                var tsName = ts.name;
                if (ts.note) {
                  tsName += ' (' + ts.note + ')';
                }

                return {
                  name: tsName,
                  faction: ts.faction,
                  year: ts.year,
                  region: ts.region,
                  imgPath: vm.getImagePath(ts)
                };
              });

              // USA
              _.each(yearsUsa, function(year) {
                var autobots = _.chain(mapped_techspecs).where({ region: "USA", faction: "Autobot", year: year }).sortBy('name').value();
                var decepticons = _.chain(mapped_techspecs).where({ region: "USA", faction: "Decepticon", year: year }).sortBy('name').value();

                _.each(autobots, function(transformer, index) {
                  Vue.set(vm.techspecs.usa.autobots[String(year)], index, autobots[index]);
                });
                _.each(decepticons, function(transformer, index) {
                  Vue.set(vm.techspecs.usa.decepticons[String(year)], index, decepticons[index]);
                });
              });

              // Europe
              _.each(yearsEurope, function(year) {
                var autobots = _.where(mapped_techspecs, { region: "Europe", faction: "Autobot", year: year });
                var decepticons = _.where(mapped_techspecs, { region: "Europe", faction: "Decepticon", year: year });

                _.each(autobots, function(transformer, index) {
                  Vue.set(vm.techspecs.europe.autobots[String(year)], index, autobots[index]);
                });
                _.each(decepticons, function(transformer, index) {
                  Vue.set(vm.techspecs.europe.decepticons[String(year)], index, decepticons[index]);
                });
              });

            });

          });

        });

      });

    },

    getImagePath: function(entry) {
      var imagePath = '/archive/techspecs/';
      imagePath += entry.faction.toLowerCase() + '/';
      if (entry.region === 'Europe') {
        imagePath += 'europe/';
      }
      imagePath += entry.year + '/';
      imagePath += 'ts_' + archiveService.pathWash(entry.name);
      if (entry.note) {
        imagePath += '_(' + archiveService.pathWash(entry.note) + ')';
      }
      imagePath += '.jpg';

      return imagePath;
    },

    getDisplayYear: function(year) {
      if (isNaN(year)) {
        year = archiveService.pathUnwash(year);
      }
      return year;
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('archive-header'),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-autobot"},[_vm._v("Autobots")]),_vm._v(" "),_vm._l((_vm.yearsUsa),function(year){return (_vm.techspecs.usa.autobots[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.techspecs.usa.autobots[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-techspecs",attrs:{"rel":"fancybox-button","title":entry.name + ' - Tech Specs',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-decepticon"},[_vm._v("Decepticons")]),_vm._v(" "),_vm._l((_vm.yearsUsa),function(year){return (_vm.techspecs.usa.decepticons[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.techspecs.usa.decepticons[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-techspecs",attrs:{"rel":"fancybox-button","title":entry.name + ' - Tech Specs',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_vm._m(2),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-autobot"},[_vm._v("Autobots (European)")]),_vm._v(" "),_vm._l((_vm.yearsEurope),function(year){return (_vm.techspecs.europe.autobots[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.techspecs.europe.autobots[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-techspecs",attrs:{"rel":"fancybox-button","title":entry.name + ' - Tech Specs',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2),_vm._v(" "),_c('div',{staticClass:"col-sm-6"},[_c('div',{staticClass:"archive-paperwork-decepticon"},[_vm._v("Decepticons (European)")]),_vm._v(" "),_vm._l((_vm.yearsEurope),function(year){return (_vm.techspecs.europe.decepticons[year].length)?_c('div',{staticClass:"archive-paperwork-year"},[_c('div',{staticClass:"archive-paperwork-year-header"},[_vm._v(_vm._s(_vm.getDisplayYear(year)))]),_vm._v(" "),_c('div',{staticClass:"archive-paperwork-year-content"},_vm._l((_vm.techspecs.europe.decepticons[year]),function(entry){return _c('div',[_c('a',{staticClass:"fancybox-button-techspecs",attrs:{"rel":"fancybox-button","title":entry.name + ' - Tech Specs',"href":entry.imgPath,"target":"_blank"}},[_vm._v(_vm._s(entry.name))])])}),0)]):_vm._e()})],2)],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"teletran-header"},[_c('span',{staticClass:"teletran-header-neutral"},[_vm._v("Tech Specs")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',{staticClass:"archive-paperwork-credits"},[_vm._v("\n  \t\tEternal thanks to "),_c('b',[_vm._v("Jon and Karl Hartman")]),_vm._v(", the original curators of the Transfomers G1 Tech Spec Scan Archive.\n  \t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"BotchTechSpec"}},[_c('div',[_c('a',{staticClass:"fancybox-button-techspecs",attrs:{"rel":"fancybox-button","title":"Botch - Tech Specs","href":"/images/botch/botch_techspec.jpg","target":"_blank"}},[_c('img',{attrs:{"src":"/images/botch/botch_techspec_small.jpg"}})])]),_vm._v(" "),_c('div',[_vm._v("Botch's custom tech spec courtesy of "),_c('a',{attrs:{"href":"http://www.ocf.berkeley.edu/~mingus/tech/","target":"Credit"}},[_vm._v("Slim's Custom Transformers Tech Specs")]),_vm._v(".")])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-31dc96b2", __vue__options__)
  } else {
    hotAPI.rerender("data-v-31dc96b2", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],28:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n.teletran-sort {\n  margin: 0 auto;\n  width: 90%;\n  max-width: 400px;\n  border: 1px solid #222;\n  margin-top: 10px;\n  margin-bottom: 20px;\n  text-align: center;\n  padding: 3px 2px;\n  color: #999;\n  font-variant: small-caps; }\n  /* line 16, stdin */\n  .teletran-sort a[selected=\"selected\"] {\n    color: white; }\n    /* line 18, stdin */\n    .teletran-sort a[selected=\"selected\"]:hover {\n      text-decoration: none; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');
var cookiesService = require('services/cookies_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
var ArchiveHeaderVue = require('components/archive/partials/archive_header');
var TeletranHeaderVue = require('components/archive/partials/teletran_header');
var TeletranEntryVue = require('components/archive/partials/teletran_entry');

// TELETRAN (PAGE) COMPONENTS
var TeletranNextVue = require('components/archive/partials/teletran_next');

var vm;

module.exports = {

  data () {
    return {
      faction: null,
      year: null,
      displayFaction: null,
      displayYear: null,
      transformers: [],
      japanSortMethod: 'releaseId',
      loading: true
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue,
    'teletran-header': TeletranHeaderVue,
    'teletran-entry': TeletranEntryVue,
    'teletran-next': TeletranNextVue
  },

  beforeMount() {
    vm = this;
    vm.updateState();
  },

  watch: {
    $route: function(to, from) {
      this.updateState();
    }
  },

  mounted() {
  },

  methods: {

    updateState: function() {
      vm.loading = true;

      _.extend(this, {
        faction: this.$route.params.faction,
        year: this.$route.params.year
      });

      var displayFaction = archiveService.toTitleCase(this.faction);
      var displayYear = Number(this.year);
      if (isNaN(displayYear)) {
        // action masters, japan, europe
        displayYear = archiveService.pathUnwash(this.year);
      }
      _.extend(this, {
        displayFaction: displayFaction,
        displayYear: displayYear
      });

      this.updateTitle();

      var dataReference = 'transformers_usa';
      if (this.year === 'action_masters') {
        dataReference = 'action_masters';
      } else if (this.year === 'japan') {
        dataReference = 'transformers_japan';
      } else if (this.year === 'europe') {
        dataReference = 'transformers_europe';
      }

      // fetch characters
      firebase.database().ref('archive/' + dataReference).once('value').then(function(snapshot) {

        var transformers = snapshot.val();

        var filteredTransformers = _.chain(transformers)
          .filter(function(transformer) {

            if (vm.year === 'action_masters') {
              return transformer.faction === displayFaction && transformer.region === 'USA';
            } else if (vm.year === 'japan' || vm.year === 'europe') {
              return transformer.faction === displayFaction;
            }

            return transformer.faction === displayFaction && transformer.year === displayYear;
          })
          .value();

        if (vm.year === 'japan') {
          var japanSort = cookiesService.readCookie('japan-sort') || 'releaseId';
          filteredTransformers = _.sortBy(filteredTransformers, japanSort);
          vm.japanSortMethod = japanSort;
        } else {
          filteredTransformers = _.sortBy(filteredTransformers, 'name');
        }

        // not a fan of this, but simply resetting the array doesn't update the view
        vm.transformers.splice(filteredTransformers.length);
        _.each(filteredTransformers, function(transformer, index) {
          Vue.set(vm.transformers, index, filteredTransformers[index]);
        });

        vm.loading = false;

      }, function(error) {
        console.error(error);
      });

    },

    updateSort: function(sortMethod) {
      sortMethod = sortMethod || 'name';
      vm.transformers = _.sortBy(vm.transformers, sortMethod);
      vm.japanSortMethod = sortMethod;
      cookiesService.setCookie('japan-sort', sortMethod);
      return false;
    },

    updateTitle: function() {
      globalService.setArchiveDocumentTitle(this.displayYear + " " + this.displayFaction + "s");
    }

  },

  computed: {

    containerClass: function() {
      if (this.year === 'japan') {
        return 'teletran-container-japan';
      }
      return '';
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('archive-header'),_vm._v(" "),_c('teletran-header',{attrs:{"faction":_vm.faction,"year":_vm.year}}),_vm._v(" "),(_vm.year === 'japan')?_c('div',{staticClass:"teletran-sort"},[_c('label',[_vm._v("Sort By:")]),_vm._v(" "),_c('a',{attrs:{"selected":_vm.japanSortMethod === 'releaseId'},on:{"click":function($event){return _vm.updateSort('releaseId')}}},[_vm._v("Release Number")]),_vm._v(" | "),_c('a',{attrs:{"selected":_vm.japanSortMethod === 'name'},on:{"click":function($event){return _vm.updateSort('name')}}},[_vm._v("Name")])]):_vm._e(),_vm._v(" "),_c('div',{class:_vm.containerClass,attrs:{"id":"teletran-container"}},[_vm._l((_vm.transformers),function(entry){return _c('teletran-entry',{directives:[{name:"show",rawName:"v-show",value:(!_vm.loading),expression:"!loading"}],key:entry.transformerId,attrs:{"entry":entry}})}),_vm._v(" "),_c('teletran-next',{directives:[{name:"show",rawName:"v-show",value:(!_vm.loading),expression:"!loading"}],key:_vm.$route.fullPath,attrs:{"faction":_vm.faction,"year":_vm.year}})],2)],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-72c45c80", __vue__options__)
  } else {
    hotAPI.rerender("data-v-72c45c80", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"components/archive/partials/teletran_entry":22,"components/archive/partials/teletran_header":23,"components/archive/partials/teletran_next":24,"services/archive_service":46,"services/cookies_service":48,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],29:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
var ArchiveHeaderVue = require('components/archive/partials/archive_header');
var TeletranHeaderVue = require('components/archive/partials/teletran_header');
var TeletranEntryVue = require('components/archive/partials/teletran_entry');

// TELETRAN (PAGE) COMPONENTS
var TeletranBackVue = require('components/archive/partials/teletran_back');

module.exports = {

  data () {
    return {
      currentFaction: null,
      currentYear: null,
      teamName: null,
      teamEntry: {},
      teammates: []
    }
  },

  components: {
    'archive-header': ArchiveHeaderVue,
    'teletran-header': TeletranHeaderVue,
    'teletran-entry': TeletranEntryVue,
    'teletran-back': TeletranBackVue
  },

  beforeMount() {
    this.updateState();
  },

  watch: {
    $route(to, from) {
      this.updateState();
    }
  },

  mounted() {
    globalService.setArchiveDocumentTitle(this.currentYear + " " + this.currentFaction + "s" + " - " + this.teamName);
  },

  methods: {

    getCurrentRoute: globalService.getCurrentRoute,

    updateState: function() {
      var currentFaction = archiveService.toTitleCase(this.$route.params.faction);
      var currentYear = Number(this.$route.params.year);

      var underscoreTeamName = this.$route.params.micromasterTeam;
      var teamName = archiveService.pathUnwash(underscoreTeamName);

      _.extend(this, {
        currentFaction: currentFaction,
        currentYear: currentYear,
        teamName: teamName
      });

      // set body class
      // var factionClass = archiveService.getFactionClass(this.currentFaction);
      // globalService.setBodyClass(factionClass);

      var vm = this;

      // fetch team entry
      firebase.database().ref('archive/transformers_usa').once('value').then(function(snapshot) {

        var transformers = snapshot.val();

        var teamEntry = _.chain(transformers)
          .where({ faction: currentFaction, year: currentYear, name: teamName })
          .sortBy('name')
          .value();

        vm.teamEntry = _.omit(teamEntry[0], 'areMicromasters');

      }, function(error) {
        console.error(error);
      });

      // fetch teammates
      firebase.database().ref('archive/micromasters').once('value').then(function(snapshot) {

        var micromasters = snapshot.val();

        var teammates = _.chain(micromasters)
          .where({ faction: currentFaction, year: currentYear, team: teamName })
          .sortBy('name')
          .value();

        vm.teammates.splice(teammates.length);
        _.each(teammates, function(teammate, index) {
          Vue.set(vm.teammates, index, teammates[index]);
        });

      }, function(error) {
        console.error(error);
      });

    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('archive-header'),_vm._v(" "),_c('teletran-header',{attrs:{"faction":_vm.currentFaction,"year":_vm.currentYear}}),_vm._v(" "),_c('div',{attrs:{"id":"micromaster-team-name"}},[_vm._v(_vm._s(_vm.teamName))]),_vm._v(" "),_c('div',{staticClass:"teletran-container-centered",attrs:{"id":"teletran-container"}},[(_vm.teamEntry.transformerId)?_c('teletran-entry',{attrs:{"entry":_vm.teamEntry}}):_vm._e(),_vm._v(" "),_vm._l((_vm.teammates),function(entry){return _c('teletran-entry',{key:entry.micromasterId,attrs:{"entry":entry}})})],2),_vm._v(" "),_c('teletran-back',{attrs:{"faction":_vm.currentFaction,"year":_vm.currentYear}})],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d96f49c", __vue__options__)
  } else {
    hotAPI.rerender("data-v-2d96f49c", __vue__options__)
  }
})()}
},{"components/archive/partials/archive_header":20,"components/archive/partials/teletran_back":21,"components/archive/partials/teletran_entry":22,"components/archive/partials/teletran_header":23,"services/archive_service":46,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],30:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* ############# */\n/*   VARIABLES   */\n/* ############# */\n/** BOOTSTRAP BOUNDARIES **/\n/* line 6, stdin */\n.faq_Q, .faq_A {\n  font-size: 1.2rem;\n  line-height: 1.5em; }\n\n/* line 10, stdin */\n.faq_Q {\n  margin-bottom: 0px;\n  font-weight: bold; }\n\n/* line 14, stdin */\n.faq_A {\n  margin-bottom: 2em;\n  color: #BBBBBB; }\n\n/* line 19, stdin */\n.about-desc {\n  text-align: center; }\n  /* line 22, stdin */\n  .about-desc .contact-methods {\n    display: -webkit-box;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: -webkit-flex;\n    display: flex;\n    -webkit-flex-wrap: wrap;\n    -moz-flex-wrap: wrap;\n    -ms-flex-wrap: wrap;\n    flex-wrap: wrap;\n    -webkit-justify-content: space-around;\n    -moz-justify-content: space-around;\n    -ms-justify-content: space-around;\n    justify-content: space-around;\n    -ms-flex-pack: space-around; }\n    @media (max-width: 767px) {\n      /* line 28, stdin */\n      .about-desc .contact-methods a {\n        margin: 0 50px; } }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

module.exports = {

  mounted() {
    globalService.setOfficeDocumentTitle('FAQ / Contact');
  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid center-content"},[_c('div',{staticClass:"page-title"},[_vm._v("Frequently Asked Questions")]),_vm._v(" "),_c('div',{staticClass:"about-desc"},[_c('div',{staticClass:"faq_Q"},[_vm._v("Can I use your images?")]),_vm._v(" "),_c('div',{staticClass:"faq_A"},[_vm._v("Of course! That's what they're here for. If you were to put a link back to this site as a courtesy, however, that would be appreciated.")]),_vm._v(" "),_c('div',{staticClass:"faq_Q"},[_vm._v("What about Generation 2, Machine Wars, Beast Wars, Armada, etc.?")]),_vm._v(" "),_c('div',{staticClass:"faq_A"},[_vm._v("No plans at this point, but you never know.")]),_vm._v(" "),_c('div',{staticClass:"faq_Q"},[_vm._v("How can I submit scans?")]),_vm._v(" "),_c('div',{staticClass:"faq_A"},[_vm._v("You can send them to the email address below! Be sure to tell me where they came from.")]),_vm._v(" "),_c('div',{staticClass:"faq_Q"},[_vm._v("I want to make reproduction boxes, do you have scans for…?")]),_vm._v(" "),_c('div',{staticClass:"faq_A"},[_vm._v("Nope, I don't have full-package scans.")]),_vm._v(" "),_c('div',{staticClass:"faq_Q"},[_vm._v("That transformation sound is awesome!")]),_vm._v(" "),_c('div',{staticClass:"faq_A"},[_vm._v("I agree. You can download it "),_c('a',{attrs:{"href":"/archive/sounds/Transform.mp3","target":"transform"}},[_vm._v("here")]),_vm._v(".")]),_vm._v(" "),_c('div',{staticClass:"faq_Q"},[_vm._v("Can you link to my site?")]),_vm._v(" "),_c('div',{staticClass:"faq_A"},[_vm._v("If you contribute to this site, I will gladly mention or link to your site in the post that describes that update. Otherwise, probably not.")])]),_vm._v(" "),_c('br'),_vm._v(" "),_c('br'),_vm._v(" "),_c('div',{staticClass:"page-title"},[_vm._v("Contact")]),_vm._v(" "),_c('div',{staticClass:"about-desc"},[_c('p',[_vm._v("For all other questions, comments, scorn or heapings of praise:")]),_vm._v(" "),_c('div',{staticClass:"contact-methods"},[_c('a',{attrs:{"href":"mailto:Botch@BotchTheCrab.com"}},[_vm._v("Botch@BotchTheCrab.com")]),_vm._v(" "),_c('a',{attrs:{"href":"http://www.facebook.com/TransformersBoxArtArchive","target":"facebook"}},[_vm._v("Facebook")]),_vm._v(" "),_c('a',{attrs:{"href":"https://twitter.com/tfboxart","target":"twitter"}},[_vm._v("Twitter")]),_vm._v(" "),_c('a',{attrs:{"href":"https://www.instagram.com/tfboxart","target":"instagram"}},[_vm._v("Instagram")])])]),_vm._v(" "),_c('div',{staticStyle:{"margin-top":"50px"}},[_c('img',{attrs:{"src":"/images/menu_botch_trans2.png"}})])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4caa2d92", __vue__options__)
  } else {
    hotAPI.rerender("data-v-4caa2d92", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],31:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 6, stdin */\n#create-posting .post-title input {\n  background: transparent;\n  border: transparent;\n  font-size: inherit;\n  font-family: inherit;\n  color: inherit; }\n\n/* line 16, stdin */\n#create-posting .post-body-full:not(.editor-loaded) {\n  visibility: hidden;\n  width: 0;\n  height: 0;\n  overflow: hidden; }\n\n/* line 24, stdin */\n#create-posting #create-posting-categories,\n#create-posting #create-posting-tags {\n  min-width: 300px; }\n\n/* line 29, stdin */\n#create-posting .post-footer-item {\n  margin: 20px 0; }\n  /* line 32, stdin */\n  #create-posting .post-footer-item > label {\n    display: inline-block;\n    width: 120px;\n    text-align: right;\n    margin-right: 10px; }\n\n/* line 43, stdin */\nbody.tox-fullscreen #menu_trigger_container,\nbody.tox-fullscreen #footer {\n  display: none; }\n\n/* line 49, stdin */\n.select2 {\n  margin: 0 !important; }\n  /* line 52, stdin */\n  .select2 .select2-selection__rendered,\n  .select2 .select2-selection__rendered * {\n    white-space: normal; }\n  /* line 57, stdin */\n  .select2 .select2-selection__choice__display {\n    color: black; }\n\n/* line 64, stdin */\n.select2-dropdown.create-posting-select2 .select2-results {\n  background-color: black;\n  text-align: left; }\n\n/* line 69, stdin */\n.select2-dropdown.create-posting-select2 .select2-results__option--selected {\n  background-color: #666; }\n\n/* line 74, stdin */\n#create-posting-posted {\n  font-family: Arial;\n  font-weight: normal;\n  width: 300px;\n  min-height: 32px;\n  border: 1px solid #aaa;\n  border-radius: 4px;\n  padding: 0 5px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// BLOG COMPONENTS
var blogService = require('services/blog_service');

var vm;

var $head = document.getElementsByTagName('head')[0];

function sortBySelectionOrder(event) {
  var element = event.params.data.element;
  var $element = $(element);
  $element.detach();
  $(this).append($element);
  $(this).trigger("change");

  // clear text search field
  $('.select2-search__field').val('');
}


module.exports = {

  data () {
    return {

      editorLoaded: false,

      posting: {
        postingId: null,
        title: '',
        content: '',
        posted: '',
        allowReplies: true,
        categoryIds: [],
        tagIds: []
      },

      categories: [],

      tags: []

    }
  },

  beforeMount() {
    vm = this;
    vm.initAuthorization();
  },

  mounted() {
    globalService.setOfficeDocumentTitle("Create Posting");
  },

  methods: {

    initAuthorization: function() {

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log('SIGNED IN!');
          vm.initContentEditor();
          vm.initSelectors();

        } else {
          console.log('NOT SIGNED IN!');
          var provider = new firebase.auth.GoogleAuthProvider();
          firebase.auth().signInWithRedirect(provider);
        }
      });

    },

    initContentEditor: function() {
      var s = document.createElement('script');
      var tinymceApiKey = "casdhqgylieh1y3j27nsdxsrpn4f1qtupm3zddbpqzvref26";
      s.src = "https://cdn.tiny.cloud/1/" + tinymceApiKey + "/tinymce/5/tinymce.min.js";
      s.type = "text/javascript";
      s.referrerPolicy = "origin";
      s.onload = function() {
        vm.tinymce = tinymce;

        var tinymceOptions = {
          selector: '#create-posting-content',
          plugins: 'image code lists charmap fullscreen media link',

          allow_script_urls: true,
          allow_unsafe_link_target: true,
          browser_spellcheck: true,
          extended_valid_elements: 'a[href|target|onclick|class|style]',

          toolbar1: 'bold italic underline strikethrough | aligncenter | outdent indent | numlist bullist',
          toolbar2: 'charmap | fullscreen | image media link | code',

          skin: 'oxide-dark',
          content_css: 'dark, /css/cassette.css',
          content_style: 'body { text-align: left; margin: 10px; }'
        };

        tinymce.init(tinymceOptions);

        vm.editorLoaded = true;
      };
      $head.appendChild(s);
    },

    initSelectors: function() {
      var k = document.createElement('link');
      k.href = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
      k.rel = "stylesheet";
      $head.appendChild(k);

      var s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";
      s.type = "text/javascript";
      $head.appendChild(s);

      var allCategoriesRequest = vm.getAllCategories().then(function(response) {
        var categoryData = _.map(response, function(category) {
          return {
            id: category.categoryId,
            text: category.name
          };
        });

        $('#create-posting-categories').select2({
          data: categoryData,
          closeOnSelect: false,
          dropdownCssClass: 'create-posting-select2'
        }).on('select2:select', sortBySelectionOrder);
      });

      var allTagsRequest = vm.getAllTags().then(function(response) {
        var tagData = _.map(response, function(tag) {
          return {
            id: tag.tagId,
            text: tag.text
          };
        });
        tagData = _.sortBy(tagData, 'text');

        $('#create-posting-tags').select2({
          data: tagData,
          closeOnSelect: false,
          dropdownCssClass: 'create-posting-select2'
        }).on('select2:select', sortBySelectionOrder);

      });

    },

    getAllCategories: function() {
      return blogService.getAllCategories().then(function(response) {
        return response.val();
      });
    },

    getAllTags: function() {
      return blogService.getAllTags().then(function(response) {
        return response.val();
      });
    },

    getContent: function() {

      vm.posting.content = vm.tinymce.activeEditor.getContent().replace('\n', '').replace(/\n/g, '');

      var postTime = $('#create-posting-posted').val();
      if (postTime) {
        vm.posting.posted = postTime.replace('T', ' ') + ':00';
      }

      var tagSelections = $('#create-posting-tags').select2('data');
      vm.posting.tagIds = _.map(tagSelections, function(selection) {
        return Number(selection.id);
      });

      var categorySelections = $('#create-posting-categories').select2('data');
      vm.posting.categoryIds = _.map(categorySelections, function(selection) {
        return Number(selection.id);
      });

      return vm.posting;
    },

    createPosting: function() {
      var posting = vm.getContent();

      if (!posting.title) {
        window.alert("Title is missing.");
        return;
      }
      if (!posting.content) {
        window.alert("Content is missing.");
        return;
      }
      if (!posting.tagIds.length) {
        window.alert("Tags are missing.");
        return;
      }
      if (!posting.categoryIds.length) {
        window.alert("Categories are missing.");
        return;
      }
      if (!posting.posted) {
        window.alert("Posted time is missing.");
        return;
      }

      blogService.getAllPostings().then(function(response) {
        var allPostings = response.val();
        var nextEntryIndex = allPostings.length;
        var nextPostingId = _.max(allPostings, 'postingId').postingId + 1;
        posting.postingId = nextPostingId;

        var postingUpdate = {};
        postingUpdate['blog/postings/' + nextEntryIndex] = posting;

        return firebase.database().ref().update(postingUpdate).then(function(response) {
          window.alert("Your posting was successfully submitted!");

          // refresh postings and redirect to home page
          blogService.getAllPostings(true).then(function() {
            vm.$router.push({
              path: '/'
            });
          });

        }, function(error) {
          console.error(error);
          window.alert("There was an error attempting to submit your posting.");
        });

      });

    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid center-content",attrs:{"id":"create-posting"}},[_c('botch-watermark'),_vm._v(" "),_c('div',{staticClass:"post-title"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.posting.title),expression:"posting.title"}],attrs:{"type":"text","placeholder":"Post Title Here"},domProps:{"value":(_vm.posting.title)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.posting, "title", $event.target.value)}}})]),_vm._v(" "),_c('div',{class:{ 'post-body-full': true, 'editor-loaded' : _vm.editorLoaded }},[_c('textarea',{directives:[{name:"mode",rawName:"v-mode",value:(_vm.posting.content),expression:"posting.content"}],attrs:{"id":"create-posting-content","rows":"20"}})]),_vm._v(" "),_c('div',{staticClass:"post-footer",style:({ visibility: (_vm.editorLoaded ? 'visible' : 'hidden') })},[_c('div',{staticClass:"post-footer-item"},[_c('label',[_vm._v("Tags:")]),_vm._v(" "),_c('select',{directives:[{name:"model",rawName:"v-model",value:(_vm.posting.tagIds),expression:"posting.tagIds"}],attrs:{"multiple":"","id":"create-posting-tags"},on:{"change":function($event){var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return val}); _vm.$set(_vm.posting, "tagIds", $event.target.multiple ? $$selectedVal : $$selectedVal[0])}}})]),_vm._v(" "),_c('div',{staticClass:"post-footer-item"},[_c('label',[_vm._v("Categories:")]),_vm._v(" "),_c('select',{directives:[{name:"model",rawName:"v-model",value:(_vm.posting.categoryIds),expression:"posting.categoryIds"}],attrs:{"multiple":"","id":"create-posting-categories"},on:{"change":function($event){var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return val}); _vm.$set(_vm.posting, "categoryIds", $event.target.multiple ? $$selectedVal : $$selectedVal[0])}}})]),_vm._v(" "),_c('div',{staticClass:"post-footer-item"},[_c('label',[_vm._v("Allow Replies:")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.posting.allowReplies),expression:"posting.allowReplies"}],attrs:{"type":"checkbox"},domProps:{"checked":Array.isArray(_vm.posting.allowReplies)?_vm._i(_vm.posting.allowReplies,null)>-1:(_vm.posting.allowReplies)},on:{"change":function($event){var $$a=_vm.posting.allowReplies,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.$set(_vm.posting, "allowReplies", $$a.concat([$$v])))}else{$$i>-1&&(_vm.$set(_vm.posting, "allowReplies", $$a.slice(0,$$i).concat($$a.slice($$i+1))))}}else{_vm.$set(_vm.posting, "allowReplies", $$c)}}}})]),_vm._v(" "),_vm._m(0)]),_vm._v(" "),_c('button',{on:{"click":_vm.createPosting}},[_vm._v("Post")])],1)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"post-footer-item"},[_c('label',[_vm._v("Posted:")]),_vm._v(" "),_c('input',{attrs:{"type":"datetime-local","id":"create-posting-posted"}})])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4b662998", __vue__options__)
  } else {
    hotAPI.rerender("data-v-4b662998", __vue__options__)
  }
})()}
},{"services/blog_service":47,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],32:[function(require,module,exports){
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
      galleries: []
    }
  },

  beforeMount() {
    this.getGalleriesData();
  },

  mounted() {
    globalService.setOfficeDocumentTitle("More Galleries");
  },

  methods: {

    getGalleriesData: function() {
      var vm = this;

      firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
        var galleries = galleriesSnapshot.val();

        firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
          var galleryEntries = entriesSnapshot.val();

          _.each(galleries, gallery => {
            var matchingEntries = _.chain(galleryEntries).where({ galleryId: gallery.galleryId }).sortBy('entryId').value();
            gallery.thumbnailPath = vm.getThumbnailPath(matchingEntries[0]);
          });

          vm.galleries = _.sortBy(galleries, 'galleryId').reverse();
        });

      });

    },

    getThumbnailPath: function(entry) {
      return '/gallery/Z_' + entry.imageName.replace(/&/, '_');
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"galleries"}},[_c('botch-watermark'),_vm._v(" "),_c('div',{staticClass:"page-title"},[_vm._v("More Galleries")]),_vm._v(" "),_c('div',{attrs:{"id":"teletran-container"}},_vm._l((_vm.galleries),function(gallery){return _c('div',{staticClass:"teletran-entry"},[_c('div',{staticClass:"teletran-box"},[_c('router-link',{attrs:{"to":{ name: 'gallery', params: { galleryId: gallery.galleryId } }}},[_c('img',{staticClass:"teletran-thumbnail",attrs:{"src":gallery.thumbnailPath}})]),_vm._v(" "),_c('div',{staticClass:"teletran-name"},[_vm._v(_vm._s(gallery.name))])],1)])}),0)],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-67f7633c", __vue__options__)
  } else {
    hotAPI.rerender("data-v-67f7633c", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3}],33:[function(require,module,exports){
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

module.exports = {

  data () {
    return {
      gallery: {},
      galleryEntries: []
    }
  },

  beforeMount() {
    this.getGalleryData();
  },

  methods: {

    getGalleryData: function() {
      var vm = this;

      var galleryId = Number(this.$route.params.galleryId);

      firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
        var galleries = galleriesSnapshot.val();

        vm.gallery = _.findWhere(galleries, { galleryId: galleryId });

        globalService.setOfficeDocumentTitle(vm.gallery.name);

        firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
          var galleryEntries = entriesSnapshot.val();

          let matchingEntries = _.where(galleryEntries, { galleryId: vm.gallery.galleryId });
          switch (vm.gallery.sort) {
            case 'Name':
              matchingEntries = _.sortBy(matchingEntries, 'name');
              break;
            case 'Date Ascending':
              matchingEntries = _.sortBy(matchingEntries, 'entryId');
              break;
            case 'Date Descending':
              matchingEntries = _.sortBy(matchingEntries, 'entryId').reverse();
              break;
            default:
              matchingEntries = _.sortBy(matchingEntries, 'entryId');
          }

          _.each(matchingEntries, galleryEntry => {
            galleryEntry.thumbnailPath = vm.getThumbnailPath(galleryEntry);
          })

          vm.galleryEntries = matchingEntries;
        });

      });

    },

    getThumbnailPath: function(entry) {
      return '/gallery/Z_' + entry.imageName.replace(/&/, '_');
    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"gallery"}},[_c('botch-watermark'),_vm._v(" "),_c('div',{staticClass:"page-title"},[_vm._v(_vm._s(_vm.gallery.name))]),_vm._v(" "),_c('div',{staticClass:"gallery-description",domProps:{"innerHTML":_vm._s(_vm.gallery.description)}}),_vm._v(" "),_c('div',{attrs:{"id":"teletran-container"}},_vm._l((_vm.galleryEntries),function(galleryEntry){return _c('div',{staticClass:"teletran-entry"},[_c('div',{staticClass:"teletran-box"},[_c('router-link',{attrs:{"to":{ name: 'galleryEntry', params: { galleryEntryId: galleryEntry.entryId } }}},[_c('img',{staticClass:"teletran-thumbnail",attrs:{"src":galleryEntry.thumbnailPath}})]),_vm._v(" "),_c('div',{staticClass:"teletran-name",domProps:{"innerHTML":_vm._s(galleryEntry.name)}})],1)])}),0)],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6bc2d078", __vue__options__)
  } else {
    hotAPI.rerender("data-v-6bc2d078", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3}],34:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* ############# */\n/*   VARIABLES   */\n/* ############# */\n/** BOOTSTRAP BOUNDARIES **/\n/* line 7, stdin */\n#gallery-entry #gallery-entry-name {\n  font-family: Audiowide, Arial, Verdana, sans-serif;\n  font-size: 2em;\n  letter-spacing: 1px;\n  font-weight: bold;\n  padding: 5px 15px;\n  text-align: center; }\n\n/* line 17, stdin */\n#gallery-entry #gallery-entry-container {\n  text-align: center;\n  margin-top: 5px;\n  margin-bottom: 15px;\n  position: relative;\n  /*\n    \tOnly display next/prev when mouse-hovering over the parent.\n    \tIn a touch interface, no mouse-hover will be detected, so the\n    \tfull fancybox outer area can be swiped!\n    */ }\n  /* line 28, stdin */\n  #gallery-entry #gallery-entry-container .prevLink,\n  #gallery-entry #gallery-entry-container .nextLink {\n    display: none; }\n  /* line 32, stdin */\n  #gallery-entry #gallery-entry-container:hover .prevLink,\n  #gallery-entry #gallery-entry-container:hover .nextLink {\n    display: block; }\n  /* line 37, stdin */\n  #gallery-entry #gallery-entry-container .prevLink a,\n  #gallery-entry #gallery-entry-container .nextLink a {\n    position: absolute;\n    width: 5%;\n    min-width: 50px;\n    height: 100%; }\n  /* line 44, stdin */\n  #gallery-entry #gallery-entry-container .prevLink a {\n    left: 0px;\n    text-align: left;\n    padding-left: 10px; }\n  /* line 49, stdin */\n  #gallery-entry #gallery-entry-container .nextLink a {\n    right: 0px;\n    text-align: right;\n    padding-right: 10px; }\n  /* line 54, stdin */\n  #gallery-entry #gallery-entry-container .prevLink img,\n  #gallery-entry #gallery-entry-container .nextLink img {\n    /* display: none; */\n    position: relative;\n    top: 40%;\n    width: 36px;\n    height: 34px;\n    background-image: url(/fancybox/source/fancybox_sprite.png);\n    opacity: 0.3; }\n  @media (max-width: 767px) {\n    /* line 65, stdin */\n    #gallery-entry #gallery-entry-container .prevLink img,\n    #gallery-entry #gallery-entry-container .nextLink img {\n      top: 70%;\n      opacity: 0.6; } }\n  /* line 72, stdin */\n  #gallery-entry #gallery-entry-container .prevLink:hover img,\n  #gallery-entry #gallery-entry-container .nextLink:hover img {\n    display: inline;\n    opacity: 1; }\n  /* line 77, stdin */\n  #gallery-entry #gallery-entry-container .prevLink img {\n    background-position: 0px -36px; }\n  /* line 80, stdin */\n  #gallery-entry #gallery-entry-container .nextLink img {\n    background-position: 0px -72px; }\n\n/* line 86, stdin */\n#gallery-entry #gallery-entry-image {\n  border: 2px solid BLACK;\n  max-width: 88%;\n  max-height: 600px; }\n\n/* line 92, stdin */\n#gallery-entry #gallery-entry-desc {\n  width: 90%;\n  background-color: #444;\n  box-shadow: 2px 2px 3px #333;\n  font-size: 1em;\n  border-radius: 8px 8px 0 0;\n  margin: 0 auto 10px;\n  max-width: 600px;\n  font-size: 1em;\n  text-align: left;\n  color: #eee;\n  padding: 10px; }\n  /* line 107, stdin */\n  #gallery-entry #gallery-entry-desc.gallery-entry-desc-short {\n    text-align: center; }\n\n/* line 112, stdin */\n#gallery-entry .adjacent-posts {\n  max-width: 600px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

var vm;

module.exports = {

  data () {
    return {
      gallery: {},
      galleryEntry: {},
      previousEntryId: null,
      nextEntryId: null
    }
  },

  watch: {
    $route(to, from) {
      vm.getGalleryEntryData();
    }
  },

  beforeMount() {
    vm = this;
    vm.getGalleryEntryData();
  },

  mounted() {
  },

  methods: {

    getGalleryEntryData: function() {

      var galleryEntryId = Number(this.$route.params.galleryEntryId);

      firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
        let galleryEntries = entriesSnapshot.val();

        vm.galleryEntry = _.findWhere(galleryEntries, { entryId: galleryEntryId });

        firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
          var galleries = galleriesSnapshot.val();

          vm.gallery = _.findWhere(galleries, { galleryId: vm.galleryEntry.galleryId });

          globalService.setOfficeDocumentTitle(vm.gallery.name + " - " + vm.galleryEntry.name);

          galleryEntries = _.where(galleryEntries, { galleryId: vm.gallery.galleryId });
          switch (vm.gallery.sort) {
            case 'Name':
              galleryEntries = _.sortBy(galleryEntries, 'name');
              break;
            case 'Date Ascending':
              galleryEntries = _.sortBy(galleryEntries, 'entryId');
              break;
            case 'Date Descending':
              galleryEntries = _.sortBy(galleryEntries, 'entryId').reverse();
              break;
            default:
              galleryEntries = _.sortBy(galleryEntries, 'entryId');
          }

          const galleryEntryIndex = _.indexOf(galleryEntries, vm.galleryEntry);

          vm.previousEntryId = galleryEntryIndex > 0 ? galleryEntries[galleryEntryIndex - 1].entryId : null;
          vm.nextEntryId = galleryEntryIndex < galleryEntries.length - 1 ? galleryEntries[galleryEntryIndex + 1].entryId : null;
        });

      });

    }

  }


};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid",attrs:{"id":"gallery-entry"}},[_c('botch-watermark'),_vm._v(" "),(_vm.gallery.name)?_c('div',{staticClass:"page-title"},[_c('router-link',{attrs:{"to":{ name: 'gallery', params: { galleryId: _vm.gallery.galleryId } }}},[_vm._v("\n      "+_vm._s(_vm.gallery.name)+"\n    ")])],1):_vm._e(),_vm._v(" "),(_vm.gallery.name && _vm.galleryEntry.name)?_c('div',{attrs:{"id":"gallery-entry-name"},domProps:{"innerHTML":_vm._s(_vm.galleryEntry.name)}}):_vm._e(),_vm._v(" "),(_vm.galleryEntry.imageName)?_c('div',{attrs:{"id":"gallery-entry-container"}},[(_vm.previousEntryId)?_c('div',{staticClass:"prevLink"},[_c('router-link',{attrs:{"to":{ name: 'galleryEntry', params: { galleryEntryId: _vm.previousEntryId } }}},[_c('img',{attrs:{"src":"/images/_.gif"}})])],1):_vm._e(),_vm._v(" "),(_vm.nextEntryId)?_c('div',{staticClass:"nextLink"},[(_vm.nextEntryId)?_c('router-link',{attrs:{"to":{ name: 'galleryEntry', params: { galleryEntryId: _vm.nextEntryId } }}},[_c('img',{attrs:{"src":"/images/_.gif"}})]):_vm._e()],1):_vm._e(),_vm._v(" "),_c('a',{attrs:{"href":'/gallery/' +  _vm.galleryEntry.imageName,"target":"galleryEntry"}},[_c('img',{attrs:{"id":"gallery-entry-image","src":'/gallery/' +  _vm.galleryEntry.imageName}})])]):_vm._e(),_vm._v(" "),_c('div',{class:{ 'gallery-entry-desc-short' : _vm.galleryEntry.description.length < 60 },attrs:{"id":"gallery-entry-desc"},domProps:{"innerHTML":_vm._s(_vm.galleryEntry.description)}}),_vm._v(" "),_c('div',{staticClass:"adjacent-posts"},[_c('span',[(_vm.previousEntryId)?_c('router-link',{attrs:{"to":{ name: 'galleryEntry', params: { galleryEntryId: _vm.previousEntryId } }}},[_vm._v("\n        ◄ "),_c('span',[_vm._v("PREVIOUS")])]):_vm._e()],1),_vm._v(" "),_c('span',[_c('router-link',{attrs:{"to":{ name: 'gallery', params: { galleryId: _vm.gallery.galleryId } }}},[_vm._v("\n        [ Gallery ]\n      ")])],1),_vm._v(" "),_c('span',[(_vm.nextEntryId)?_c('router-link',{attrs:{"to":{ name: 'galleryEntry', params: { galleryEntryId: _vm.nextEntryId } }}},[_c('span',[_vm._v("NEXT")]),_vm._v(" ►\n      ")]):_vm._e()],1)])],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-63fa6f84", __vue__options__)
  } else {
    hotAPI.rerender("data-v-63fa6f84", __vue__options__)
  }
})()}
},{"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],35:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* ############# */\n/*   VARIABLES   */\n/* ############# */\n/** BOOTSTRAP BOUNDARIES **/\n/* line 7, stdin */\n#home > header {\n  text-align: center;\n  font-style: normal;\n  font-size: 3rem;\n  margin-bottom: 20px;\n  min-height: 4.25rem; }\n  @media (max-width: 575px) {\n    /* line 7, stdin */\n    #home > header {\n      font-size: 2.25rem; } }\n\n/* line 18, stdin */\n#home #home-portal {\n  min-height: 300px;\n  margin-top: 10px;\n  margin-bottom: 50px; }\n  /* line 23, stdin */\n  #home #home-portal #home-portal-botch {\n    margin-bottom: 20px;\n    padding-left: 0; }\n    @media (max-width: 575px) {\n      /* line 27, stdin */\n      #home #home-portal #home-portal-botch img {\n        height: 175px; } }\n  /* line 33, stdin */\n  #home #home-portal #home-portal-links {\n    padding: 10px 0 40px;\n    text-align: left;\n    color: #ccc;\n    font-size: 1em;\n    line-height: 1.8em; }\n    /* line 40, stdin */\n    #home #home-portal #home-portal-links a.standout {\n      font-family: 'Exo 2', Arial, Verdana, sans-serif;\n      font-size: 1.3em;\n      letter-spacing: 1px; }\n    /* line 46, stdin */\n    #home #home-portal #home-portal-links div {\n      margin-bottom: 25px; }\n\n/* line 53, stdin */\n#home #home-search-form {\n  font-size: 1.2em; }\n  /* line 56, stdin */\n  #home #home-search-form input[type=\"text\"],\n  #home #home-search-form input[type=\"search\"] {\n    width: 200px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// BLOG COMPONENTS
var blogService = require('services/blog_service');

var vm;
var postingsStore = null;
var numPostingsDisplayed = 0;
var numPostingsPerLoad = 5;

module.exports = {

  data() {
    return {

      postings: []

    }
  },

  beforeMount() {
    vm = this;
    this.initHome();
  },

  mounted() {
    globalService.setOfficeDocumentTitle();
  },

  methods: {

    initHome: function() {

      var postingsRequest = $.Deferred(function(deferred) {
        blogService.getAllPostings().then(function(postingsSnapshot) {
          deferred.resolve(postingsSnapshot.val());
        });
      }).promise();

      var repliesRequest = $.Deferred(function(deferred) {
        blogService.getAllReplies().then(function(repliesSnapshot) {
          deferred.resolve(repliesSnapshot.val());
        });
      }).promise();

      $.when(postingsRequest, repliesRequest).done(function(postingsResponse, repliesResponse) {
        postingsStore = _.sortBy(postingsResponse, 'posted').reverse();

        repliesStore = _.groupBy(repliesResponse, 'postingId');

        _.each(repliesStore, function(reply, postingId) {
          var matchingPosting = _.findWhere(postingsStore, { postingId: Number(postingId) });
          if (matchingPosting) {
            matchingPosting.replyCount = reply.length;
          }
        });

        vm.loadInitialPostings();
      });

    },

    loadInitialPostings: function() {
      var initialPostingsCount = numPostingsPerLoad;
      if (numPostingsDisplayed > numPostingsPerLoad) {
        initialPostingsCount = numPostingsDisplayed;
      }

      var initialPostings = postingsStore.slice(0, initialPostingsCount);
      initialPostings = blogService.setPostingBlurbs(initialPostings);
      _.each(initialPostings, function(posting) {
        vm.postings.push(posting);
      });
      numPostingsDisplayed = initialPostingsCount;
    },

    loadMorePostings: function() {
      var newPostingTally = numPostingsDisplayed + numPostingsPerLoad;

      var morePostings = postingsStore.slice(numPostingsDisplayed, newPostingTally);
      morePostings = blogService.setPostingBlurbs(morePostings);
      _.each(morePostings, function(posting) {
        vm.postings.push(posting);
      });
      numPostingsDisplayed = newPostingTally;
    },

    formatPosted: function(posted) {
      return globalService.formatPosted(posted);
    },

    submitSearch: function() {
      this.$router.push({
        path: '/postings',
        query: {
          search: this.searchTerm
        }
      });
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid center-content",attrs:{"id":"home"}},[_vm._m(0),_vm._v(" "),_c('div',{attrs:{"id":"home-portal"}},[_vm._m(1),_vm._v(" "),_c('div',{staticClass:"col-sm-7",attrs:{"id":"home-portal-links"}},[_vm._m(2),_vm._v(" "),_vm._m(3),_vm._v(" "),_vm._m(4),_vm._v(" "),_c('form',{attrs:{"id":"home-search-form"},on:{"submit":function($event){$event.preventDefault();return _vm.submitSearch($event)}}},[_c('div',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.searchTerm),expression:"searchTerm"}],attrs:{"type":"search","name":"search","placeholder":"Search ..."},domProps:{"value":(_vm.searchTerm)},on:{"input":function($event){if($event.target.composing){ return; }_vm.searchTerm=$event.target.value}}})])])])]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.postings.length),expression:"postings.length"}],staticClass:"page-title"},[_vm._v("Updates & Blog Posts ...")]),_vm._v(" "),_vm._l((_vm.postings),function(posting){return _c('div',{key:posting.postingId,staticClass:"post-blurb",attrs:{"post-id":posting.postingId}},[_c('div',{staticClass:"post-title-full"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId } }}},[_vm._v(_vm._s(posting.title))])],1),_vm._v(" "),_c('div',{staticClass:"post-details"},[_c('span',{staticClass:"post-timestamp"},[_c('label',[_vm._v("Posted:")]),_vm._v(" "+_vm._s(_vm.formatPosted(posting.posted)))]),(posting.replyCount > 0)?_c('span',{staticClass:"post-reply-count"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId, scrollTo: 'replies' } }}},[_vm._v(_vm._s(posting.replyCount)+" "+_vm._s(posting.replyCount === 1 ? "Reply" : "Replies"))])],1):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"post-body-full",domProps:{"innerHTML":_vm._s(posting.blurb)}}),_vm._v(" "),(posting.blurb.length !== posting.content.length)?_c('p',{staticClass:"post-body-trimmed"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId } }}},[_vm._v("Continue …")])],1):_vm._e()])}),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.postings.length),expression:"postings.length"}],staticClass:"more-posts"},[_c('a',{on:{"click":_vm.loadMorePostings}},[_vm._v("Load More Posts")])])],2)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('header',{staticClass:"btc-header btc-header-autobot"},[_c('span',{staticClass:"nowrap"},[_vm._v("Welcome to")]),_vm._v(" "),_c('span',{staticClass:"nowrap"},[_vm._v("Botch's Office...")])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"col-sm-5",attrs:{"id":"home-portal-botch"}},[_c('a',{attrs:{"href":"#/about/botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_mascot_laurent.png"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('a',{staticClass:"standout",attrs:{"href":"#/archive"}},[_vm._v("Botch's Transformers Box Art Archive")]),_vm._v("  — "),_c('span',{staticClass:"nowrap"},[_vm._v("the #1 online destination")]),_vm._v(" for G1 Transformers package art since 1998 — is why most humans visit this site.\n\t\t\t")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._v("The site's mascot, "),_c('a',{staticClass:"standout",attrs:{"href":"#/about/botch"}},[_vm._v("Botch the Crab")]),_vm._v(", is the alter-ego of "),_c('a',{staticClass:"standout",attrs:{"href":"#/about/adam"}},[_vm._v("Adam Alexander")]),_vm._v(", a "),_c('a',{attrs:{"href":"/images/about/adam/adam-alexander-resume-2017.pdf","target":"resume"}},[_vm._v("front-end web developer")]),_vm._v(", "),_c('a',{attrs:{"href":"#/about/music"}},[_vm._v("prog rock musician")]),_vm._v(", and (obviously) a Transformers fan.")])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._v("This site is also "),_c('a',{attrs:{"href":"#/postings"}},[_vm._v("Adam's blog")]),_vm._v(". Just scroll down to start reading, or search the entire site below.")])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-781bb75d", __vue__options__)
  } else {
    hotAPI.rerender("data-v-781bb75d", __vue__options__)
  }
})()}
},{"services/blog_service":47,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],36:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n.back-to-top {\n  position: fixed;\n  bottom: 50px;\n  right: 0px;\n  text-decoration: none;\n  color: #000000;\n  background-color: transparent;\n  font-size: 12px;\n  padding: 1em;\n  display: none; }\n  /* line 14, stdin */\n  .back-to-top img {\n    opacity: 0.5; }\n  /* line 17, stdin */\n  .back-to-top:hover img {\n    opacity: 0.7; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


function initBackToTop() {
  var offset = 220;
  var duration = 500;

  $backToTop = $('.back-to-top');

  $(window).scroll(function() {
    if ($(this).scrollTop() > offset) {
      $backToTop.fadeIn(duration);
    } else {
      $backToTop.fadeOut(duration);
    }
  });

  $backToTop.click(function(event) {
    event.preventDefault();
    $('html, body').animate({scrollTop: 0}, duration);
    return false;
  })

}

$(document).ready(function() {
  initBackToTop();
});


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('a',{staticClass:"back-to-top",attrs:{"href":"#"}},[_c('img',{attrs:{"src":"/images/footer/icon_backtotop.png"}})])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d02a06a", __vue__options__)
  } else {
    hotAPI.rerender("data-v-2d02a06a", __vue__options__)
  }
})()}
},{"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],37:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//

/* */

})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"hidden-sm hidden-xs",attrs:{"id":"watermark"}},[_c('a',{attrs:{"href":"#/about/botch"}},[_c('img',{attrs:{"src":"/images/botch/botch_mascot_laurent.png"}})])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-928adf5c", __vue__options__)
  } else {
    hotAPI.rerender("data-v-928adf5c", __vue__options__)
  }
})()}
},{"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],38:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


module.exports = {

  data() {
    return {
      searchTerm: ''
    }
  },

  methods: {

    submitSearch: function() {
      this.$router.push({
        path: '/postings',
        query: {
          search: this.searchTerm
        }
      });
      this.searchTerm = '';
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{attrs:{"id":"sfx-container"}},[_c('sfx')],1),_vm._v(" "),_c('div',{staticClass:"footer-item"},[_c('form',{attrs:{"id":"footer-search-form"},on:{"submit":function($event){$event.preventDefault();return _vm.submitSearch($event)}}},[_vm._m(0),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.searchTerm),expression:"searchTerm"}],attrs:{"type":"search","placeholder":"Search ..."},domProps:{"value":(_vm.searchTerm)},on:{"input":function($event){if($event.target.composing){ return; }_vm.searchTerm=$event.target.value}}})])]),_vm._v(" "),_vm._m(1),_vm._v(" "),_vm._m(2),_vm._v(" "),_vm._m(3),_vm._v(" "),_vm._m(4),_vm._v(" "),_vm._m(5)])}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('a',{attrs:{"href":"#/postings","title":"Search"}},[_c('img',{attrs:{"src":"/images/footer/icon_search.png","alt":"Search"}})])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"footer-item"},[_c('a',{attrs:{"href":"#/contact","title":"Email Botch the Crab"}},[_c('img',{attrs:{"src":"/images/footer/icon_email.svg","alt":"Email Botch the Crab"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"footer-item"},[_c('a',{attrs:{"href":"http://www.facebook.com/TransformersBoxArtArchive","target":"facebook","title":"Follow the Archive on Facebook"}},[_c('img',{attrs:{"src":"/images/footer/icon_facebook.svg","alt":"Facebook"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"footer-item"},[_c('a',{attrs:{"href":"https://twitter.com/tfboxart","target":"twitter","title":"Follow the Archive on Twitter"}},[_c('img',{attrs:{"src":"/images/footer/icon_twitter.svg","alt":"Twitter"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"footer-item"},[_c('a',{attrs:{"href":"https://www.instagram.com/tfboxart","target":"instagram","title":"Follow the Botch on Instagram"}},[_c('img',{attrs:{"src":"/images/footer/icon_instagram.svg","alt":"Instagram"}})])])},function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"footer-item"},[_c('form',{attrs:{"action":"https://www.paypal.com/donate","method":"post","target":"_blank"}},[_c('input',{attrs:{"type":"hidden","name":"hosted_button_id","value":"K8CYS282A2L6S"}}),_vm._v(" "),_c('input',{attrs:{"type":"image","src":"/images/footer/icon_paypal.gif","border":"0","name":"submit","alt":"Donate to BotchTheCrab.com through Paypal","title":"Donate to the Archive"}}),_vm._v(" "),_c('img',{attrs:{"alt":"","border":"0","src":"https://www.paypal.com/en_US/i/scr/pixel.gif","width":"1","height":"1"}})])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1c0ebaaa", __vue__options__)
  } else {
    hotAPI.rerender("data-v-1c0ebaaa", __vue__options__)
  }
})()}
},{"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],39:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var factionYears = [
  {
    text: "1984",
    link: '#/archive/teletran/FACTION/1984'
  },
  {
    text: "1985",
    link: '#/archive/teletran/FACTION/1985'
  },
  {
    text: "1986",
    link: '#/archive/teletran/FACTION/1986'
  },
  {
    text: "1987",
    link: '#/archive/teletran/FACTION/1987'
  },
  {
    text: "1988",
    link: '#/archive/teletran/FACTION/1988'
  },
  {
    text: "1989",
    link: '#/archive/teletran/FACTION/1989'
  },
  {
    text: "1990",
    link: '#/archive/teletran/FACTION/1990'
  },
  {
    text: "Action Masters",
    link: '#/archive/teletran/FACTION/action_masters'
  },
  {
    text: "Japanese Exclusives",
    link: '#/archive/teletran/FACTION/japan'
  },
  {
    text: "European Exclusives",
    link: '#/archive/teletran/FACTION/europe'
  }
];

var menuStructure = [
  {
    text: "Home",
    menuIconId: 'home',
    link: '#/'
  },
  {
    text: "Transformers <br/>Box Art Archive",
    menuIconId: 'archive',
    link: '#/archive',
    children: [
      {
        text: "Recent Updates"
      },
      {
        text: "Autobots",
        menuIconId: 'autobot',
        link: '#/archive/teletran/autobot',
        children: _.map(factionYears, function(year) {
          return {
            text: year.text,
            link: year.link.replace(/FACTION/g, 'autobot')
          }
        })
      },
      {
        text: "Decepticons",
        menuIconId: 'decepticon',
        link: '#/archive/teletran/decepticon',
        children: _.map(factionYears, function(year) {
          return {
            text: year.text,
            link: year.link.replace(/FACTION/g, 'decepticon')
          }
        })
      },
      {
        text: "Tech Specs",
        link: '#/archive/techspecs'
      },
      {
        text: "Instructions",
        link: '#/archive/instructions'
      },
      {
        text: "Back of the Box Art",
        link: '#/archive/boxbattles'
      },
      {
        text: "Catalogs",
        link: '#/archive/catalogs'
      },
      {
        text: "Reinforcements From Cybertron",
        link: '#/archive/reinforcements'
      },
      {
        text: "Box Art History",
        link: '#/archive/history'
      },
      {
        text: "Edit / Scan / Donate",
        link: '#/archive/help  '
      }
    ]
  },
  {
    text: "Music",
    menuIconId: 'music',
    link: '#/about/music'
  },
  {
    text: "More Galleries",
    link: '#/galleries'
  },
  {
    text: "About ...",
    link: '#/about',
    children: [
      {
        text: "Adam Alexander",
        link: '#/about/adam'
      },
      {
        text: "Botch the Crab",
        link: '#/about/botch'
      },
      {
        text: "Botch's Fellow Cassettes",
        link: '#/about/trio'
      },
      {
        text: "This Site",
        link: '#/about/site'
      }
    ]
  },
  {
    text: "Browse Tags",
    link: '#/tags'
  },
  {
    text: "FAQ / Contact",
    link: '#/contact'
  },
  {
    text: "R&#0233;sum&#0233;",
    link: '/images/about/adam/adam-alexander-resume-2021.pdf',
    external: true
  }
];


module.exports = {

  props: ['currentRoute'],

  data() {
    return {
      menuStructure: menuStructure,
      btcMenu: null
    }
  },

  mounted() {
    var vm = this;

    $(document).ready(function() {

      vm.btcMenu = new Mmenu('#menu', {
        navbar: {
          add: true,
          title: "Botch the Crab",
          titleLink: "none",
          sticky: false
        },
        onclick: {
          close: true,
          preventDefault: false,
          setSelected: true
        },
        slidingSubmenus: true,
        wrappers: [],
        extensions: [
          "position-front"
        ]
      }, {
        // configuration
        classNames: {
          selected: "menuItemSelected"
        }
      });

      var $menuContent = $('#menu');

      $menuContent.on('click', function($event) {
        var anchor = $event.target.closest('a[href^="#/"]')
        if (anchor && anchor.hash) {
          location.hash = anchor.hash;
          vm.btcMenu.API.close();
        }

      });

      // unhide
      $menuContent.css('visibility', 'visible');

      window.triggerMenuUpdate = vm.updateMenuSelection;

      // initial menu item selection
      var initialRoute = {
        path: location.hash.substring(1)
      };
      vm.updateMenuSelection(initialRoute);

    });

  },

  methods: {

    updateMenuSelection: function(currentRoute) {
      var vm = this;

      var path = currentRoute && currentRoute.path;

      if (!path) { return; }

      var $currentLink = $('#menu a[href="#' + currentRoute.path + '"]');
      if ($currentLink.length) {
        var $currentListItem = $currentLink.closest('li');
        if ($currentListItem && $currentListItem.length) {
          var $currentPanel = $currentListItem.closest('ul');
          vm.btcMenu.API.setSelected($currentListItem[0]);
          vm.btcMenu.API.openPanel($currentPanel[0]);
        }
      }
    }

  }

};



})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ul',_vm._l((_vm.menuStructure),function(item){return _c('li',[_c('a',{attrs:{"href":item.link,"target":item.external ? '_blank' : '_self'}},[(item.menuIconId)?_c('span',{staticClass:"menu_icon",attrs:{"id":'menu_icon_' + item.menuIconId},domProps:{"innerHTML":_vm._s(item.text)}}):_vm._e(),_vm._v(" "),(!item.menuIconId)?_c('span',{domProps:{"innerHTML":_vm._s(item.text)}}):_vm._e()]),_vm._v(" "),(item.children)?_c('ul',_vm._l((item.children),function(item){return _c('li',[_c('a',{attrs:{"href":item.link,"target":item.external ? '_blank' : '_self'}},[(item.menuIconId)?_c('span',{staticClass:"menu_icon",attrs:{"id":'menu_icon_' + item.menuIconId},domProps:{"innerHTML":_vm._s(item.text)}}):_vm._e(),_vm._v(" "),(!item.menuIconId)?_c('span',{domProps:{"innerHTML":_vm._s(item.text)}}):_vm._e()]),_vm._v(" "),(item.children)?_c('ul',_vm._l((item.children),function(item){return _c('li',[_c('a',{attrs:{"href":item.link,"target":item.external ? '_blank' : '_self'}},[(item.menuIconId)?_c('span',{staticClass:"menu_icon",attrs:{"id":'menu_icon_' + item.menuIconId},domProps:{"innerHTML":_vm._s(item.text)}}):_vm._e(),_vm._v(" "),(!item.menuIconId)?_c('span',{domProps:{"innerHTML":_vm._s(item.text)}}):_vm._e()])])}),0):_vm._e()])}),0):_vm._e()])}),0)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4dcde268", __vue__options__)
  } else {
    hotAPI.rerender("data-v-4dcde268", __vue__options__)
  }
})()}
},{"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],40:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* */")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* */

})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"menu_trigger"}},[_c('div',[_c('a',{attrs:{"href":"#menu"}},[_c('img',{attrs:{"src":"/images/icon_menu.png","alt":"Menu","title":"Menu"}})])]),_vm._v(" "),_c('div',[_c('a',{attrs:{"href":"#/"}},[_c('img',{attrs:{"src":"/images/icon_home.png","alt":"Home","title":"Home"}})])]),_vm._v(" "),_c('div',[_c('a',{attrs:{"href":"#/archive"}},[_c('img',{attrs:{"src":"/images/icon_archive.png","alt":"Archive","title":"Archive"}})])])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3c694c27", __vue__options__)
  } else {
    hotAPI.rerender("data-v-3c694c27", __vue__options__)
  }
})()}
},{"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],41:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n#sfx {\n  display: none;\n  float: left;\n  width: 28px;\n  height: 32px;\n  background: no-repeat center center;\n  cursor: pointer; }\n  /* line 11, stdin */\n  #sfx.audio_on {\n    background-image: url(/images/footer/icon_audio_on.png); }\n  /* line 12, stdin */\n  #sfx.audio_off {\n    background-image: url(/images/footer/icon_audio_off.png); }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var cookiesService = require('services/cookies_service');

var sfxStatus = false;

function enableSfx() {
  var $sfx = $('#sfx');
  $sfx.attr('class', 'audio_on');
  $sfx.attr('title', 'mute transforming sound');
  playSfx();
}

function disableSfx() {
  var $sfx = $('#sfx');
  $sfx.attr('class', 'audio_off');
  $sfx.attr('title', 'unmute transforming sound');
}

function playSfx() {
  var $sfx_control = $('#sfx_control');
  $sfx_control.prop('volume', 0.3);
  $sfx_control.trigger('play');
}

function initSfx() {
  var $sfx = $('#sfx');
  var isMobile = $(document).width() < 450;

  if (!isMobile) {
    sfxStatus = cookiesService.readCookie('sfx') || 'audio_on';

    if (sfxStatus === 'audio_on') {
      enableSfx();
    } else {
      disableSfx();
    }
    $sfx.show();

  } else {
    $sfx.remove();
  }
}

module.exports = {

  mounted() {
    initSfx();

    this.$router.afterEach(function(to, from, each) {
      if (sfxStatus === 'audio_on') {
        playSfx();
      }
    });

  },

  methods: {

    toggleSfx: function() {
      if (sfxStatus == 'audio_on') {
        sfxStatus = 'audio_off'
        disableSfx();
      } else {
        sfxStatus = 'audio_on'
        enableSfx();
      }
      cookiesService.setCookie('sfx', sfxStatus);
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"audio_on",attrs:{"id":"sfx"},on:{"click":function($event){$event.preventDefault();return _vm.toggleSfx($event)}}},[_vm._m(0)])}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('audio',{attrs:{"id":"sfx_control","volume":"0.1"}},[_c('source',{attrs:{"src":"/archive/sounds/Transform.mp3","type":"audio/mpeg"}})])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-19bde806", __vue__options__)
  } else {
    hotAPI.rerender("data-v-19bde806", __vue__options__)
  }
})()}
},{"services/cookies_service":48,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],42:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n.replies {\n  text-align: left;\n  margin: 50px auto;\n  max-width: 600px; }\n  /* line 8, stdin */\n  .replies .reply-header {\n    font-family: Audiowide, Arial, Verdana, sans-serif;\n    font-size: 2.5em;\n    letter-spacing: 1px;\n    font-variant: small-caps;\n    color: WHITE;\n    border-bottom: 1px solid #666;\n    padding-bottom: 2px;\n    margin-bottom: 20px;\n    clear: both; }\n  /* line 21, stdin */\n  .replies .reply {\n    margin-bottom: 30px; }\n    /* line 24, stdin */\n    .replies .reply .reply-body {\n      font-size: 1.0em;\n      line-height: 1.5em; }\n    /* line 29, stdin */\n    .replies .reply.reply-wrapper-botch {\n      background-image: url(/images/webmaster.png);\n      background-repeat: no-repeat; }\n      /* line 33, stdin */\n      .replies .reply.reply-wrapper-botch .reply-body {\n        padding-left: 60px; }\n    /* line 38, stdin */\n    .replies .reply .reply-footer {\n      text-align: right;\n      font-variant: small-caps; }\n      /* line 42, stdin */\n      .replies .reply .reply-footer > span {\n        white-space: nowrap; }\n      /* line 46, stdin */\n      .replies .reply .reply-footer .reply-time {\n        font-size: 0.9em;\n        margin-right: 3px; }\n    /* line 53, stdin */\n    .replies .reply .reply-divider {\n      border-bottom: 1px dashed #666;\n      margin: 25px 0px; }\n\n/* line 61, stdin */\n.new-reply {\n  text-align: left;\n  margin: 50px auto;\n  max-width: 600px; }\n  /* line 66, stdin */\n  .new-reply .new-reply-header {\n    font-family: Audiowide, Arial, Verdana, sans-serif;\n    font-size: 2.5em;\n    letter-spacing: 1px;\n    font-variant: small-caps;\n    color: white;\n    border-bottom: 1px solid #666;\n    padding-bottom: 2px;\n    margin-bottom: 20px;\n    clear: both; }\n  /* line 84, stdin */\n  .new-reply .new-reply-field {\n    padding: 0 0 15px 0;\n    text-align: center; }\n    /* line 88, stdin */\n    .new-reply .new-reply-field.secret {\n      padding: 0;\n      width: 0;\n      height: 0;\n      overflow: hidden; }\n    /* line 95, stdin */\n    .new-reply .new-reply-field label {\n      width: 70px;\n      text-align: right;\n      margin-right: 5px;\n      color: #ddd; }\n    /* line 102, stdin */\n    .new-reply .new-reply-field textarea {\n      width: 100%; }\n    /* line 106, stdin */\n    .new-reply .new-reply-field input[type=\"text\"],\n    .new-reply .new-reply-field input[type=\"email\"] {\n      width: 225px;\n      font-size: 12px;\n      margin-right: 15px; }\n  /* line 115, stdin */\n  .new-reply .new-reply-notify {\n    width: 300px;\n    margin: 0 auto;\n    padding-left: 77px;\n    padding-bottom: 15px; }\n    /* line 121, stdin */\n    .new-reply .new-reply-notify label {\n      margin: 0;\n      vertical-align: text-top;\n      font-weight: normal;\n      font-size: 10px; }\n  /* line 129, stdin */\n  .new-reply .new-reply-submit {\n    text-align: center; }\n    /* line 132, stdin */\n    .new-reply .new-reply-submit button {\n      width: 225px;\n      margin-left: 75px;\n      margin-right: 15px; }\n\n/* line 141, stdin */\n.replies-closed {\n  margin-top: 30px;\n  margin-bottom: 20px;\n  margin-left: 10%;\n  margin-right: 10%;\n  padding: 5px;\n  background-color: #333;\n  border: 1px solid #222;\n  text-align: center;\n  font-weight: bold;\n  font-size: 10px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');
var cookiesService = require('services/cookies_service');
var fancyboxService = require('services/fancybox_service');

// BLOG COMPONENTS
var blogService = require('services/blog_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');

var vm;
var postingsStore = null;
var tagsStore = null;
var repliesStore = null;

window.tf = archiveService.tf;
window.decode = fancyboxService.openImage;

const $openGraphMetaTag = $('meta[property="og:image"]');

module.exports = {

  data () {
    return {

      posting: {},

      tags: [],

      replies: [],

      previousPosting: null,
      nextPosting: null,

      reply: {
        content: '',
        poster: '',
        email: '',
        website: '',
        honeypot: '',
        notify: false
      },

      savingReply: false
    }
  },

  beforeMount() {
    vm = this;
    vm.updatePosting();
    vm.populateUserInfo();
  },

  beforeDestroy() {
    vm.clearOpenGraphImageMetaTag();
  },

  watch: {
    $route(to, from) {
      this.updatePosting();

      // remove focus from any links clicked in adjacent posts section
      $('.adjacent-posts a:focus').blur();
    }
  },

  methods: {

    updatePosting: function() {
      var postingId = Number(this.$route.params.postingId);

      blogService.getAllPostings().then(function(response) {
        postingsStore = _.sortBy(response.val(), 'posted');

        vm.posting = _.findWhere(postingsStore, { postingId: postingId });

        vm.updateTitle();
        vm.updateOpenGraphImageMetaTag();

        var postingIndex = _.indexOf(postingsStore, vm.posting);

        vm.previousPosting = postingIndex > 0 ? postingsStore[postingIndex - 1] : null;
        vm.nextPosting = postingIndex < postingsStore.length - 1 ? postingsStore[postingIndex + 1] : null;

        var randomPostingIndex = Math.floor(Math.random() * postingsStore.length);
        vm.randomPosting = postingsStore[randomPostingIndex];

        vm.updateTags();
        vm.updateReplies();
      });

    },

    updateTags: function() {
      blogService.getAllTags().then(function(response) {
        tagsStore = response.val();

        vm.tags = _.map(vm.posting.tagIds, function(tagId) {
          return _.findWhere(tagsStore, { tagId: tagId });
        });
      });
    },

    updateReplies: function(refresh) {
      refresh = refresh || false;

      return blogService.getAllReplies(refresh).then(function(response) {
        repliesStore = response.val();
        vm.replies = _.chain(repliesStore)
          .where({ postingId: vm.posting.postingId })
          .each(function(reply) {
            reply.content = reply.content.replace(/\n/g, '<br/>');
            reply.isWebmaster = (reply.email && reply.email.toLowerCase() === 'botch@botchthecrab.com');
          })
          .sortBy('posted')
          .value();
      });
    },

    updateTitle: function() {
      globalService.setOfficeDocumentTitle(this.posting.title);
    },

    updateOpenGraphImageMetaTag: function() {
      if (!$openGraphMetaTag.length) { return; }

      const postingContent = vm.posting.content;
      const imageRegExp = /<img .+?src="(.+?)".*?>/gi;
      const postingImages = vm.posting.content.match(imageRegExp);

      if (postingImages && postingImages.length && postingImages[0]) {
        let imageUrl = postingImages[0].replace(imageRegExp, '$1');
        if (imageUrl.charAt(0) === '/') {
          imageUrl = imageUrl.replace(/Z_(.+?)\.gif/, '$1.jpg');
          imageUrl = location.protocol + '//' + location.host + imageUrl;
        }
        $openGraphMetaTag.attr('content', imageUrl);
      } else {
        vm.clearOpenGraphImageMetaTag();
      }
    },

    clearOpenGraphImageMetaTag: function() {
      $openGraphMetaTag.attr('content', '');
    },

    formatPosted: function(posted) {
      return globalService.formatPosted(posted);
    },

    populateUserInfo: function() {
      var userInfo = cookiesService.readCookie('userInfo');
      if (userInfo) {
        try {
          userInfo = JSON.parse(userInfo);
          _.each(['poster', 'email', 'website', 'notify'], function(userProperty) {
            if (userInfo[userProperty]) {
              vm.reply[userProperty] = userInfo[userProperty];
            }
          });
        } catch(error) {
          console.error(error);
        }
      }
    },

    handleNewReply: function() {
      if (vm.reply.honeypot) {
        return;
      }

      vm.reply.content = vm.reply.content.trim();
      vm.reply.poster = vm.reply.poster.trim();

      if (vm.reply.website) {
        if (vm.reply.website.indexOf('http') === -1) {
          vm.reply.website = 'https://' + vm.reply.website;
        }
      }

      if (vm.reply.content && vm.reply.poster) {
        vm.savingReply = true;

        blogService.createPostReply(vm.posting, vm.reply).then(function(replyData) {
          vm.reply.content = "";

          vm.updateReplies(true).then(function() {

            window.setTimeout(function() {
              var $newReply = $('#replyId' + replyData.replyId);
              if ($newReply.length) {
                $('html, body').animate({
                  scrollTop: $newReply.offset().top
                }, 100);
              }
            }, 250);

          });

          vm.saveUserDetails(vm.reply);
          vm.savingReply = false;
        }, function(error) {
          vm.savingReply = false;
        });
      }
    },

    saveUserDetails: function(replyData) {
      var userInfo = _.pick(replyData, 'poster', 'email', 'website', 'notify');
      cookiesService.setCookie('userInfo', JSON.stringify(userInfo));
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.posting.title)?_c('div',{staticClass:"container-fluid center-content"},[_c('botch-watermark'),_vm._v(" "),_c('div',{staticClass:"post-title"},[_vm._v(_vm._s(_vm.posting.title))]),_vm._v(" "),_c('div',{staticClass:"post-body-full",domProps:{"innerHTML":_vm._s(_vm.posting.content)}}),_vm._v(" "),(_vm.posting.content.length)?_c('div',{staticClass:"post-footer"},[_c('div',{staticClass:"post-footer-item"},[_c('label',[_vm._v("Tags:")]),_vm._v(" "),_vm._l((_vm.tags),function(tag,index){return [_c('router-link',{attrs:{"to":{ name: 'postings', query: { tagId: tag.tagId } }}},[_vm._v(_vm._s(tag.text))]),_vm._v(" "),(index < _vm.tags.length - 1)?[_vm._v(" • ")]:_vm._e()]})],2),_vm._v(" "),_c('div',{staticClass:"post-footer-item"},[_vm._v("\n        Posted: "),_c('span',[_vm._v(_vm._s(_vm.formatPosted(_vm.posting.posted)))])])]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"adjacent-posts"},[(_vm.previousPosting)?_c('span',[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: _vm.previousPosting.postingId } }}},[_vm._v("◄ "),_c('span',[_vm._v("Older")])])],1):_vm._e(),_vm._v(" "),(_vm.randomPosting)?_c('span',[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: _vm.randomPosting.postingId } }}},[_vm._v("? "),_c('span',[_vm._v("Random")])])],1):_vm._e(),_vm._v(" "),(_vm.nextPosting)?_c('span',[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: _vm.nextPosting.postingId } }}},[_c('span',[_vm._v("Newer")]),_vm._v(" ►")])],1):_vm._e()]),_vm._v(" "),(_vm.replies.length)?_c('div',{staticClass:"replies"},[_c('div',{staticClass:"reply-header"},[_vm._v("Comments")]),_vm._v(" "),_vm._l((_vm.replies),function(reply,index){return _c('div',{staticClass:"reply",class:reply.isWebmaster ? 'reply-wrapper-botch' : '',attrs:{"id":'replyId' + reply.replyId}},[_c('div',{staticClass:"reply-body",domProps:{"innerHTML":_vm._s(reply.content)}}),_vm._v(" "),_c('div',{staticClass:"reply-footer"},[_c('span',[_vm._v("\n            » Posted\n            "),_c('span',{staticClass:"reply-time"},[_vm._v(_vm._s(_vm.formatPosted(reply.posted)))])]),_vm._v(" "),_c('span',[_vm._v("\n            by "),_c('b',[_vm._v(_vm._s(reply.poster))]),_vm._v(" "),(reply.isWebmaster)?_c('span',[_vm._v(" - WEBMASTER")]):_vm._e(),_vm._v(" "),(!reply.isWebmaster && reply.website)?_c('span',[_vm._v("["),_c('a',{attrs:{"href":reply.website,"target":"_blank"}},[_vm._v("website")]),_vm._v("]")]):_vm._e()])]),_vm._v(" "),(index < _vm.replies.length - 1)?_c('div',{staticClass:"reply-divider"}):_vm._e()])})],2):_vm._e(),_vm._v(" "),(!_vm.posting.allowReplies)?_c('div',{staticClass:"replies-closed"},[_vm._v("Comments are "+_vm._s(_vm.replies.length ? "closed" : "disabled")+" for this post.")]):_vm._e(),_vm._v(" "),(_vm.posting.allowReplies)?_c('div',{staticClass:"new-reply"},[_c('div',{staticClass:"new-reply-header"},[_vm._v("Leave a Comment")]),_vm._v(" "),_c('div',{staticClass:"new-reply-field"},[_c('textarea',{directives:[{name:"model",rawName:"v-model",value:(_vm.reply.content),expression:"reply.content"}],attrs:{"name":"content","rows":"4","cols":"10","disabled":_vm.savingReply,"placeholder":"Enter your comments here"},domProps:{"value":(_vm.reply.content)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.reply, "content", $event.target.value)}}})]),_vm._v(" "),_c('div',{staticClass:"new-reply-field"},[_c('label',[_vm._v("Name:")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.reply.poster),expression:"reply.poster"}],attrs:{"type":"text","name":"poster","disabled":_vm.savingReply},domProps:{"value":(_vm.reply.poster)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.reply, "poster", $event.target.value)}}})]),_vm._v(" "),_c('div',{staticClass:"new-reply-field"},[_c('label',[_vm._v("Website:")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.reply.website),expression:"reply.website"}],attrs:{"type":"text","name":"website","disabled":_vm.savingReply},domProps:{"value":(_vm.reply.website)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.reply, "website", $event.target.value)}}})]),_vm._v(" "),_c('div',{staticClass:"new-reply-field secret"},[_c('label',[_vm._v("URL:")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.reply.honeypot),expression:"reply.honeypot"}],attrs:{"type":"text","name":"url","disabled":_vm.savingReply,"tabindex":"-1"},domProps:{"value":(_vm.reply.honeypot)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.reply, "honeypot", $event.target.value)}}})]),_vm._v(" "),_c('div',{staticClass:"new-reply-field"},[_c('label',[_vm._v("Email:")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.reply.email),expression:"reply.email"}],attrs:{"type":"email","name":"email","disabled":_vm.savingReply,"placeholder":"Email will not be displayed/shared"},domProps:{"value":(_vm.reply.email)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.reply, "email", $event.target.value)}}})]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.reply.email),expression:"reply.email"}],staticClass:"new-reply-notify"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.reply.notify),expression:"reply.notify"}],attrs:{"type":"checkbox","id":"new-reply-notify","name":"notify","disabled":_vm.savingReply},domProps:{"checked":Array.isArray(_vm.reply.notify)?_vm._i(_vm.reply.notify,null)>-1:(_vm.reply.notify)},on:{"change":function($event){var $$a=_vm.reply.notify,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.$set(_vm.reply, "notify", $$a.concat([$$v])))}else{$$i>-1&&(_vm.$set(_vm.reply, "notify", $$a.slice(0,$$i).concat($$a.slice($$i+1))))}}else{_vm.$set(_vm.reply, "notify", $$c)}}}}),_vm._v(" "),_c('label',{attrs:{"for":"new-reply-notify"}},[_vm._v("Notify me of new comments")])]),_vm._v(" "),_c('div',{staticClass:"new-reply-submit"},[_c('button',{attrs:{"disabled":_vm.savingReply},on:{"click":_vm.handleNewReply}},[_vm._v(_vm._s(_vm.savingReply ? "Submitting ..." : "Submit"))])])]):_vm._e(),_vm._v(" "),(_vm.replies.length)?_c('div',{staticClass:"adjacent-posts"},[(_vm.previousPosting)?_c('span',[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: _vm.previousPosting.postingId } }}},[_vm._v("◄ "),_c('span',[_vm._v("Older")])])],1):_vm._e(),_vm._v(" "),(_vm.randomPosting)?_c('span',[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: _vm.randomPosting.postingId } }}},[_vm._v("? "),_c('span',[_vm._v("Random")])])],1):_vm._e(),_vm._v(" "),(_vm.nextPosting)?_c('span',[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: _vm.nextPosting.postingId } }}},[_c('span',[_vm._v("Newer")]),_vm._v(" ►")])],1):_vm._e()]):_vm._e()],1):_vm._e()}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7add63b4", __vue__options__)
  } else {
    hotAPI.rerender("data-v-7add63b4", __vue__options__)
  }
})()}
},{"services/archive_service":46,"services/blog_service":47,"services/cookies_service":48,"services/fancybox_service":49,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],43:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 5, stdin */\n#postings #main-search-form {\n  margin-bottom: 30px; }\n  /* line 9, stdin */\n  #postings #main-search-form #main-search-input input, #postings #main-search-form #main-search-input select {\n    margin: 0 5px 10px; }\n    /* line 12, stdin */\n    #postings #main-search-form #main-search-input input[type=\"submit\"], #postings #main-search-form #main-search-input select[type=\"submit\"] {\n      width: 100px; }\n\n/* line 19, stdin */\n#postings .teletran-container {\n  margin-bottom: 30px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// ARCHIVE COMPONENTS
var archiveService = require('services/archive_service');
var TeletranEntryVue = require('components/archive/partials/teletran_entry');

// BLOG COMPONENTS
var blogService = require('services/blog_service');

var vm;
var query = null;

var transformersStore = null;
var numTransformersDisplayed = 0;
var numTransformersPerLoad = 5;

var postingsStore = null;
var numPostingsDisplayed = 0;
var numPostingsPerLoad = 5;

module.exports = {

  data () {
    return {
      pageTitle: '',
      query: {},

      transformers: [],
      totalTransformers: null,

      postings: [],
      totalPostings: null,

      transformersReady: false,
      postingsReady: false
    }
  },

  components: {
    'teletran-entry': TeletranEntryVue
  },

  watch: {
    $route(to, from) {
      vm.init();
    }
  },

  beforeMount() {
    vm = this;

    vm.init();
  },

  methods: {

    init: function() {
      vm.totalTransformers = null;
      vm.transformersReady = false;
      vm.postingsReady = false;

      vm.parseQuery().then(() => {
        vm.setPageTitle();
        vm.initTransformers();
        vm.initPostings();
      });
    },

    parseQuery: function() {
      vm.query = this.$route.query || {};
      vm.query.search = vm.query.search || '';
      vm.query.scope = vm.query.scope || 'site';

      if (vm.query.tag) {
        return blogService.getAllTags().then(function(response) {
          var tagsStore = response.val();
          var matchingTag = _.findWhere(tagsStore, { text: vm.query.tag });
          vm.query.tagId = matchingTag.tagId;
        });
      }

      vm.query.newSearch = String((vm.query && vm.query.search) || '');
      vm.query.newScope = String((vm.query && vm.query.scope) || 'site');

      return Promise.resolve();
    },

    setPageTitle: function() {
      var tagId = vm.query && vm.query.tagId ? Number(vm.query.tagId) : null;
      var searchTerm = vm.query && vm.query.search ? vm.query.search.toLowerCase() : null;

      if (searchTerm) {
        vm.pageTitle = `Search Results for "${searchTerm}"`;
        globalService.setOfficeDocumentTitle(vm.pageTitle);

      } else if (tagId) {
        blogService.getAllTags().then(function(response) {
          var tagsStore = response.val();
          var matchingTag = _.findWhere(tagsStore, { tagId: tagId });
          if (matchingTag && matchingTag.text) {
            vm.pageTitle = `Posts tagged ${matchingTag.text}`;
            globalService.setOfficeDocumentTitle(vm.pageTitle);
          }
        });

      } else {
        vm.pageTitle = "Adam's Blog and Archive Updates";
        globalService.setOfficeDocumentTitle(vm.pageTitle);
      }

    },

    initTransformers: function() {
      transformersStore = null;
      numTransformersDisplayed = 0;

      vm.transformers = [];

      var searchTerm = (vm.query.search || '').toLowerCase();

      if (!searchTerm) {
        vm.transformersReady = true;
        return;
      }

      var getMatching = function(snapshot) {
        return _.filter(snapshot.val(), transformer => {
          return transformer.name.toLowerCase().indexOf(searchTerm) !== -1;
        });
      }

      var usaRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/transformers_usa').once('value').then(function(usa_snapshot) {
          var matching = getMatching(usa_snapshot);
          deferred.resolve(matching);
        });
      }).promise();

      var micromastersRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/micromasters').once('value').then(function(micromasters_snapshot) {
          var matching = getMatching(micromasters_snapshot);
          deferred.resolve(matching);
        });
      }).promise();

      var actionMastersRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/action_masters').once('value').then(function(action_masters_snapshot) {
          var matching = getMatching(action_masters_snapshot);
          matching = _.where(matching, { region: "USA" });
          deferred.resolve(matching);
        });
      }).promise();

      var europeRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/transformers_europe').once('value').then(function(europe_snapshot) {
          var matching = getMatching(europe_snapshot);
          deferred.resolve(matching);
        });
      }).promise();

      var japanRequest = $.Deferred(function(deferred) {
        firebase.database().ref('archive/transformers_japan').once('value').then(function(japan_snapshot) {
          var matching = getMatching(japan_snapshot);
          deferred.resolve(matching);
        });
      }).promise();

      return $.when(
        usaRequest,
        micromastersRequest,
        actionMastersRequest,
        europeRequest,
        japanRequest
      ).done(function(
        usa_matching,
        micromasters_matching,
        action_masters_matching,
        europe_matching,
        japan_matching
      ) {

        transformersStore = _.flatten([
          usa_matching,
          micromasters_matching,
          action_masters_matching,
          europe_matching,
          japan_matching
        ]);

        vm.totalTransformers = transformersStore.length;

        vm.loadInitialTransformers();

        vm.transformersReady = true;
      });

    },

    loadInitialTransformers: function() {
      var initialTransformersCount = numTransformersPerLoad;
      if (numTransformersDisplayed > numTransformersPerLoad) {
        initialTransformersCount = numTransformersDisplayed;
      }
      var initialTransformers = transformersStore.slice(0, initialTransformersCount);
      _.each(initialTransformers, function(transformer) {
        vm.transformers.push(transformer);
      });
      numTransformersDisplayed = initialTransformersCount;
    },

    loadAllTransformers: function() {
      vm.transformers = transformersStore;
    },

    initPostings: function() {
      postingsStore = null;
      numPostingsDisplayed = 0;

      vm.postings = [];

      var queryKeys = _.keys(vm.query);

      if (vm.query && (vm.query.search || vm.query.tagId)) {

        var postingsRequest = $.Deferred(function(deferred) {
          blogService.getAllPostings().then(function(postingsSnapshot) {
            deferred.resolve(postingsSnapshot.val());
          });
        }).promise();

        var repliesRequest = $.Deferred(function(deferred) {
          blogService.getAllReplies().then(function(repliesSnapshot) {
            deferred.resolve(repliesSnapshot.val());
          });
        }).promise();

        $.when(postingsRequest, repliesRequest).done(function(postingsResponse, repliesResponse) {
          postingsStore = _.sortBy(postingsResponse, 'posted').reverse();
          repliesStore = _.groupBy(repliesResponse, 'postingId');

          _.each(repliesStore, function(replyStore, postingId) {
            var matchingPosting = _.findWhere(postingsStore, { postingId: Number(postingId) });
            if (matchingPosting) {
              matchingPosting.replyCount = replyStore.length;
            }
          });

          vm.filterPostings();
          vm.loadInitialPostings();

          vm.postingsReady = true;
        });

      } else {

        vm.postingsReady = true;

        window.setTimeout(() => {
          $('#keywords').focus();
        }, 500);
      }

    },

    filterPostings: function() {

      var tagId = vm.query && vm.query.tagId ? Number(vm.query.tagId) : null;
      var searchTerm = (vm.query && vm.query.search) || null;
      var scope = (vm.query && vm.query.scope) || null;

      if (searchTerm) {

        var allMatchingPostings = [];

        if (scope === 'archive') {
          var transformersBoxArtArchiveTagId = 1;

          postingsStore = _.filter(postingsStore, posting => {
            return Array.isArray(posting.tagIds) && posting.tagIds.indexOf(transformersBoxArtArchiveTagId) !== -1;
          });
        }

        let searchTerms = searchTerm.split(' ');

        // filter out indefinite articles
        searchTerms = _.difference(searchTerms, ['a', 'an', 'the', 'to', 'in']);

        _.each(searchTerms, function(searchTerm) {
          var searchRegExp = new RegExp('\\b' + searchTerm + '\\b', 'ig');

          var matchingPostings = _.filter(postingsStore, function(posting) {
            return posting.title.search(searchRegExp) !== -1 ||
                   posting.content.search(searchRegExp) !== -1;
          });


          _.each(matchingPostings, posting => {

            posting.weight = 0;

            if (posting.title.search(searchRegExp) !== -1) {
              posting.weight = 5;
            }

            let searchMatches = posting.content.match(searchRegExp) || [];

            posting.weight += searchMatches.length;

            let existingMatch = _.findWhere(allMatchingPostings, { postingId: posting.postingId });
            if (existingMatch) {
              existingMatch.weight += posting.weight;
            } else {
              allMatchingPostings.push(posting);
            }

          });

        });

        // match full search phrase and assign additional weight
        var fullSearchTermRegExp = new RegExp(searchTerm, 'i');
        _.each(allMatchingPostings, matchingPosting => {
          if (matchingPosting.title.match(fullSearchTermRegExp)) {
            matchingPosting.weight += 50;
          }
          if (matchingPosting.content.match(fullSearchTermRegExp)) {
            matchingPosting.weight += 5;
          }
        });

        postingsStore = _.sortBy(allMatchingPostings, 'weight').reverse();

      } else if (tagId) {

        postingsStore = _.filter(postingsStore, function(posting) {
          return Array.isArray(posting.tagIds) && posting.tagIds.indexOf(tagId) !== -1;
        });

      } else {
        // nothing to show

        postingsStore = [];

      }

      vm.totalPostings = postingsStore.length;
    },

    loadInitialPostings: function() {
      var initialPostingsCount = numPostingsPerLoad;
      if (numPostingsDisplayed > numPostingsPerLoad) {
        initialPostingsCount = numPostingsDisplayed;
      }
      var initialPostings = postingsStore.slice(0, initialPostingsCount);
      initialPostings = blogService.setPostingBlurbs(initialPostings);
      _.each(initialPostings, function(posting) {
        vm.postings.push(posting);
      });
      numPostingsDisplayed = initialPostingsCount;
    },

    loadMorePostings: function() {
      var newPostingTally = numPostingsDisplayed + numPostingsPerLoad;
      var morePostings = postingsStore.slice(numPostingsDisplayed, newPostingTally);
      morePostings = blogService.setPostingBlurbs(morePostings);
      _.each(morePostings, function(posting) {
        vm.postings.push(posting);
      });
      numPostingsDisplayed = newPostingTally;
    },

    formatPosted: function(posted) {
      return globalService.formatPosted(posted);
    },

    submitSearch: function() {
      this.$router.push({
        path: '/postings',
        query: {
          search: vm.query.newSearch,
          scope: vm.query.newScope
        }
      });
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid center-content",attrs:{"id":"postings"}},[_c('botch-watermark'),_vm._v(" "),(_vm.pageTitle)?_c('div',{staticClass:"page-title"},[_vm._v(_vm._s(_vm.pageTitle))]):_vm._e(),_vm._v(" "),_c('form',{directives:[{name:"show",rawName:"v-show",value:(_vm.pageTitle),expression:"pageTitle"}],attrs:{"id":"main-search-form"},on:{"submit":function($event){$event.preventDefault();return _vm.submitSearch($event)}}},[_c('div',{attrs:{"id":"main-search-input"}},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.query.newSearch),expression:"query.newSearch"}],attrs:{"type":"search","name":"keywords","id":"keywords","placeholder":"Search ..."},domProps:{"value":(_vm.query.newSearch)},on:{"click":function($event){return $event.target.select()},"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.query, "newSearch", $event.target.value)}}}),_vm._v(" "),_c('select',{directives:[{name:"model",rawName:"v-model",value:(_vm.query.newScope),expression:"query.newScope"}],on:{"change":function($event){var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return val}); _vm.$set(_vm.query, "newScope", $event.target.multiple ? $$selectedVal : $$selectedVal[0])}}},[_c('option',{attrs:{"value":"site"}},[_vm._v("Entire Site")]),_vm._v(" "),_c('option',{attrs:{"value":"archive"}},[_vm._v("Box Art Archive")])]),_vm._v(" "),_c('input',{attrs:{"type":"submit","value":"Search"}})])]),_vm._v(" "),(_vm.query.search)?_c('div',{staticClass:"page-subheader"},[_vm._v("Transformers Box Art Results ...")]):_vm._e(),_vm._v(" "),(!_vm.transformersReady)?_c('div',[_vm._v("Loading ...")]):_vm._e(),_vm._v(" "),(_vm.transformersReady && _vm.query.search && _vm.transformers.length === 0)?_c('div',[_vm._v("No matching Transformers")]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"teletran-container teletran-container-search"},[_vm._l((_vm.transformers),function(entry){return _c('teletran-entry',{key:entry.transformerId,attrs:{"entry":entry}})}),_vm._v(" "),(_vm.totalTransformers && _vm.transformers.length < _vm.totalTransformers)?_c('div',{staticClass:"teletran-load-more",on:{"click":_vm.loadAllTransformers}},[_vm._v("Load All Matching Transformers")]):_vm._e()],2),_vm._v(" "),(_vm.query.search)?_c('div',{staticClass:"page-subheader"},[_vm._v("Postings ...")]):_vm._e(),_vm._v(" "),(!_vm.postingsReady)?_c('div',[_vm._v("Loading ...")]):_vm._e(),_vm._v(" "),(_vm.postingsReady && _vm.query.search && _vm.postings.length === 0)?_c('div',[_vm._v("No matching posts")]):_vm._e(),_vm._v(" "),_vm._l((_vm.postings),function(posting){return _c('div',{key:posting.postingId,staticClass:"post-blurb",attrs:{"post-id":posting.postingId}},[_c('div',{staticClass:"post-title-full"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId } }}},[_vm._v(_vm._s(posting.title))])],1),_vm._v(" "),_c('div',{staticClass:"post-details"},[_c('span',{staticClass:"post-timestamp"},[_c('label',[_vm._v("Posted:")]),_vm._v(" "+_vm._s(_vm.formatPosted(posting.posted)))]),(posting.replyCount > 0)?_c('span',{staticClass:"post-reply-count"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId, scrollTo: 'replies' } }}},[_vm._v(_vm._s(posting.replyCount)+" "+_vm._s(posting.replyCount === 1 ? "Reply" : "Replies"))])],1):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"post-body-full",domProps:{"innerHTML":_vm._s(posting.blurb)}}),_vm._v(" "),(posting.blurb.length !== posting.content.length)?_c('p',{staticClass:"post-body-trimmed"},[_c('router-link',{attrs:{"to":{ name: 'posting', params: { postingId: posting.postingId } }}},[_vm._v("Continue …")])],1):_vm._e()])}),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.postings.length && _vm.postings.length < _vm.totalPostings),expression:"postings.length && postings.length < totalPostings"}],staticClass:"more-posts"},[_c('a',{on:{"click":_vm.loadMorePostings}},[_vm._v("Load More Posts")])]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.postings.length && _vm.postings.length === _vm.totalPostings),expression:"postings.length && postings.length === totalPostings"}],staticClass:"no-more-posts"},[_vm._v("\n    No more posts.\n  ")])],2)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-370a9822", __vue__options__)
  } else {
    hotAPI.rerender("data-v-370a9822", __vue__options__)
  }
})()}
},{"components/archive/partials/teletran_entry":22,"services/archive_service":46,"services/blog_service":47,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],44:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("/* line 3, stdin */\n#taglist {\n  text-align: left;\n  font-size: 0.8em;\n  line-height: 150%;\n  -moz-column-width: 120px;\n  -webkit-column-width: 120px;\n  column-width: 120px;\n  -moz-column-gap: 15px;\n  -webkit-column-gap: 15px;\n  column-gap: 15px;\n  margin-bottom: 50px; }\n  /* line 20, stdin */\n  #taglist div {\n    margin-bottom: 5px; }")
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


// GLOBAL COMPONENTS
var globalService = require('services/global_service');

// BLOG COMPONENTS
var blogService = require('services/blog_service');

var vm;

module.exports = {

  data () {
    return {

      tags: []

    }
  },

  beforeMount() {
    vm = this;
    this.loadTags();
  },

  mounted() {
    globalService.setOfficeDocumentTitle('Browse Tags');
  },

  methods: {

    loadTags: function() {
      blogService.getAllTags().then(function(response) {
        vm.tags = _.sortBy(response.val(), function(tag) {
          return tag.text.toUpperCase();
        });
      });
    }

  }

};


})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container-fluid"},[_c('div',{staticClass:"page-title"},[_vm._v("Browse Tags")]),_vm._v(" "),_c('div',{attrs:{"id":"taglist"}},_vm._l((_vm.tags),function(tag){return _c('div',[_c('router-link',{attrs:{"to":{ name: 'postings', query: { tagId: tag.tagId }}}},[_vm._v(_vm._s(tag.text))])],1)}),0)])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-689ac997", __vue__options__)
  } else {
    hotAPI.rerender("data-v-689ac997", __vue__options__)
  }
})()}
},{"services/blog_service":47,"services/global_service":50,"vue":5,"vue-hot-reload-api":3,"vueify/lib/insert-css":7}],45:[function(require,module,exports){

// READY
$(document).ready(function() {

  // Initialize Firebase
  var firebaseConfig = {
    apiKey: "AIzaSyCWCpbe1wdg1v1uJqPZRGv0q6pT8QZiscE",
    authDomain: "botch-the-crab.firebaseapp.com",
    databaseURL: "https://botch-the-crab.firebaseio.com",
    projectId: "botch-the-crab",
    storageBucket: "botch-the-crab.appspot.com",
    messagingSenderId: "957369815270",
    appId: "1:957369815270:web:3ca19aaadf385f84632b27"
  };
  firebase.initializeApp(firebaseConfig);

  // ARCHIVE ... or GLOBAL COMPONENTS ?
  var fancyboxService = require('services/fancybox_service.js');


  // Vue Router
  Vue.use(VueRouter);

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');
  var MenuContentVue = require('components/partials/menu_content');
  var MenuTriggerVue = require('components/partials/menu_trigger');
  var BackToTopVue = require('components/partials/back_to_top');
  var FooterVue = require('components/partials/footer');
  var SfxVue = require('components/partials/sfx');

  // MAIN ROUTES
  var HomeVue = require('components/home');
  var PostingVue = require('components/posting');
  var PostingsVue = require('components/postings');
  var CreatePostingVue = require('components/createPosting');
  var TagsVue = require('components/tags');
  var ContactVue = require('components/contact');

  // ARCHIVE ROUTES
  var ArchiveVue = require('components/archive/archive_home');
  var FactionVue = require('components/archive/faction');
  var TeletranVue = require('components/archive/teletran');
  var TeletranMicromastersVue = require('components/archive/teletran_micromasters');
  var TechSpecsVue = require('components/archive/techspecs');
  var InstructionsVue = require('components/archive/instructions');
  var CatalogsVue = require('components/archive/catalogs');
  var BoxBattlesVue = require('components/archive/boxbattles');
  var ReinforcementsVue = require('components/archive/reinforcements');
  var HistoryVue = require('components/archive/history');

  // GALLERY ROUTES
  var GalleriesVue = require('components/galleries');
  var GalleryVue = require('components/gallery');
  var GalleryEntryVue = require('components/galleryEntry');

  // ABOUT ROUTES
  var AboutVue = require('components/about/about_home');
  var AboutAdamVue = require('components/about/about_adam');
  var AboutBotchVue = require('components/about/about_botch');
  var AboutTrioVue = require('components/about/about_trio');
  var AboutMusicVue = require('components/about/about_music');
  var AboutSiteVue = require('components/about/about_site');

  // var NotFound = require('components/404.vue');

  var routes = [
    { path: '/', component: HomeVue },
    { path: '/posting/:postingId', name: 'posting', component: PostingVue },
    { path: '/postings', name: 'postings', component: PostingsVue },
    { path: '/posting/create/new', component: CreatePostingVue },
    { path: '/tags', component: TagsVue },
    { path: '/contact', component: ContactVue },

    { path: '/archive', component: ArchiveVue },
    { path: '/archive/teletran/:faction', component: FactionVue },
    { path: '/archive/teletran/:faction/:year', component: TeletranVue },
    { path: '/archive/teletran/:faction/:year/:micromasterTeam', component: TeletranMicromastersVue },
    { path: '/archive/techspecs', component: TechSpecsVue },
    { path: '/archive/instructions', component: InstructionsVue },
    { path: '/archive/catalogs', component: CatalogsVue },
    { path: '/archive/boxbattles', component: BoxBattlesVue },
    { path: '/archive/reinforcements', component: ReinforcementsVue },
    { path: '/archive/history', component: HistoryVue },

    { path: '/galleries', component: GalleriesVue },
    { path: '/gallery/:galleryId', name: 'gallery', component: GalleryVue },
    { path: '/gallery/galleryEntry/:galleryEntryId', name: 'galleryEntry', component: GalleryEntryVue },

    { path: '/about', component: AboutVue },
    { path: '/about/adam', component: AboutAdamVue },
    { path: '/about/botch', component: AboutBotchVue },
    { path: '/about/trio', component: AboutTrioVue },
    { path: '/about/music', component: AboutMusicVue },
    { path: '/about/site', component: AboutSiteVue }
  ];

  var router = new VueRouter({
    // mode: 'history',
    routes: routes
  });

  var MenuContent = new Vue({
    el: '#menu',
    components: {
      'menu-content': MenuContentVue
    }
  });
  var MenuTrigger = new Vue({
    el: '#menu_trigger_container',
    components: {
      'menu-trigger': MenuTriggerVue
    }
  });
  var BackToTop = new Vue({
    el: '#back-to-top',
    components: {
      'back-to-top': BackToTopVue
    }
  });
  var Footer = new Vue({
    el: '#footer',
    router: router,
    components: {
      'global-footer': FooterVue,
    }
  });
  var Sfx = new Vue({
    el: '#sfx-container',
    router: router,
    components: {
      'sfx': SfxVue,
    }
  });


  var main = new Vue({
    router: router
  }).$mount('#main');

  globalService.setBodyClass(globalService.getCurrentRoute());

  router.afterEach(function(to, from, each) {
    if (typeof window.triggerMenuUpdate === "function") {
      window.triggerMenuUpdate(to, from);
    }
    globalService.setBodyClass(to.path);
    globalService.scrollTop();
  });


  // FANCYBOX
  fancyboxService.initFancyBox();

});

},{"components/about/about_adam":8,"components/about/about_botch":9,"components/about/about_home":10,"components/about/about_music":11,"components/about/about_site":12,"components/about/about_trio":13,"components/archive/archive_home":14,"components/archive/boxbattles":15,"components/archive/catalogs":16,"components/archive/faction":17,"components/archive/history":18,"components/archive/instructions":19,"components/archive/reinforcements":26,"components/archive/techspecs":27,"components/archive/teletran":28,"components/archive/teletran_micromasters":29,"components/contact":30,"components/createPosting":31,"components/galleries":32,"components/gallery":33,"components/galleryEntry":34,"components/home":35,"components/partials/back_to_top":36,"components/partials/footer":38,"components/partials/menu_content":39,"components/partials/menu_trigger":40,"components/partials/sfx":41,"components/posting":42,"components/postings":43,"components/tags":44,"services/fancybox_service.js":49,"services/global_service":50}],46:[function(require,module,exports){
var fancyboxService = require('services/fancybox_service.js');

module.exports = {
  getCurrentFactionFromRoute: getCurrentFactionFromRoute,
  getCurrentYearFromRoute: getCurrentYearFromRoute,
  getFactionClass: getFactionClass,
  toTitleCase: toTitleCase,
  pathWash: pathWash,
  pathUnwash: pathUnwash,
  tf: tf
};

////////////

function getCurrentFactionFromRoute(route) {
  if (route.indexOf('autobot') !== -1) {
    return 'Autobot';
  } else if (route.indexOf('decepticon') !== -1) {
    return 'Decepticon';
  }
  return null;
}

function getCurrentYearFromRoute(route) {
  var parseYear = route.match(/\d{4}/);
  if (Array.isArray(parseYear) && parseYear.length) {
    return Number(parseYear[0]);
  }
  return null;
}

function getFactionClass (faction) {
  if (faction === "Autobot" || faction === "Cybertron") {
    return 'autobot';
  } else if (faction === "Decepticon" || faction === "Destron") {
    return 'decepticon';
  }
  return '';
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

/* shift to lowercase and replace non-word characters with underscores */
/* ex: "Optimus Prime" becomes "optimus_prime" */
function pathWash(s) {
  s = String(s);
  s = s.replace(/[\s&]/g, '_');
  s = s.toLowerCase();
  return s;
}

/* replace underscores with spaces and shift to title case */
/* ex: "optimus_prime" becomes "Optimus Prime" */
function pathUnwash(s) {
  s = String(s);
  s = s.replace(/_/g, ' ');
  s = this.toTitleCase(s);
  return s;
}

/* load a box art entry from a posting (legacy function) */
function tf(tfName, tfFaction, tfSub, tfTeam) {
  if (tfFaction === "Cybertron") {
    tfFaction = "Autobot";
  }
  if (tfFaction === "Destron") {
    tfFaction = "Decepticon";
  }

  var imgSrc = null
  if (tfSub === 'Japan' || tfSub === 'Europe') {

    // Japanese or European
    imgSrc = pathWash('/archive/' + tfFaction + '/' + tfSub + '/' + tfName + '.jpg');

  } else if (tfSub === 'ActionMasters') {
    // Action Masters
    imgSrc = pathWash('/archive/' + tfFaction + '/action_masters/' + tfName + '.jpg');

  } else if (tfTeam) {
    // US Micromasters
    imgSrc = pathWash('/archive/' + tfFaction + '/' + tfSub + '/' + tfTeam + '/' + tfName + '.jpg');
  } else {
    // US
    imgSrc = pathWash('/archive/' + tfFaction + '/' + tfSub + '/' + tfName + '.jpg');
  }

  if (imgSrc) {
    fancyboxService.openImage(tfName, imgSrc);
  }
  return false;
}

},{"services/fancybox_service.js":49}],47:[function(require,module,exports){
var allPostings = null;

var allPostingsSnapshot;
var allCategoriesSnapshot;
var allTagsSnapshot;
var allRepliesSnapshot;

module.exports = {
  getAllPostings: getAllPostings,
  getAllCategories: getAllCategories,
  getAllTags: getAllTags,
  getAllReplies: getAllReplies,
  setPostingBlurbs: setPostingBlurbs,
  createPostReply: createPostReply
};

////////////

function getAllPostings(refresh) {
  var deferred = $.Deferred();

  if (allPostingsSnapshot && !refresh) {
    deferred.resolve(allPostingsSnapshot);
  } else {

    firebase.database().ref('blog/postings').once('value').then(function(snapshot) {
      allPostingsSnapshot = snapshot;
      deferred.resolve(allPostingsSnapshot);
    });

  }

  return deferred.promise();
}

function getAllCategories() {
  var deferred = $.Deferred();

  if (allCategoriesSnapshot) {
    deferred.resolve(allCategoriesSnapshot);
  } else {

    firebase.database().ref('blog/categories').once('value').then(function(snapshot) {
      allCategoriesSnapshot = snapshot;
      deferred.resolve(allCategoriesSnapshot);
    });

  }

  return deferred.promise();
}

function getAllTags() {
  var deferred = $.Deferred();

  if (allTagsSnapshot) {
    deferred.resolve(allTagsSnapshot);
  } else {

    firebase.database().ref('blog/tags').once('value').then(function(snapshot) {
      allTagsSnapshot = snapshot;
      deferred.resolve(allTagsSnapshot);
    });

  }

  return deferred.promise();
}

function getAllReplies(refresh) {
  var deferred = $.Deferred();

  if (allRepliesSnapshot && !refresh) {
    deferred.resolve(allRepliesSnapshot);
  } else {

    firebase.database().ref('blog/replies').once('value').then(function(snapshot) {
      allRepliesSnapshot = snapshot;
      deferred.resolve(allRepliesSnapshot);
    });

  }

  return deferred.promise();
}

function setPostingBlurbs(postings) {
  var pattern = /<p(.|\n|\r)+?<\/p>/gi;

  _.each(postings, function(posting) {
    var matches = posting.content.match(pattern);

    if (matches && matches.length > 2) {
      posting.blurb = matches[0] + matches[1];
    } else {
      posting.blurb = posting.content;
    }
  });

  return postings;
}

function createPostReply(posting, replyData) {

  var getCurrentReplies = getAllReplies(true).then(function(response) {
    return response.val();
  });

  var getTrace = $.get('https://www.cloudflare.com/cdn-cgi/trace').then(function(response) {
    var ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
    return response.match(ipRegex)[0];
  });

  return $.when(getCurrentReplies, getTrace).done(function(repliesStore, ipAddress) {

    var newReplyIndex = repliesStore.length;

    var newReply = {
      replyId: newReplyIndex + 1,
      postingId: posting.postingId,
      posted: getNewPostTime(),
      poster: replyData.poster,
      content: replyData.content,
      address: ipAddress,
      notify: replyData.notify || false
    };
    if (replyData.email) {
      newReply.email = replyData.email;
    }
    if (replyData.website) {
      newReply.website = replyData.website;
    }

    var replyUpdate = {};
    replyUpdate['blog/replies/' + newReplyIndex] = newReply;

    return firebase.database().ref().update(replyUpdate).then(function(response) {

      // get list of every commenter who requested reply notifications
      var notificationRecipients = _.chain(repliesStore)
        .where({ postingId: posting.postingId, notify: true })
        .filter(function(reply) {
          var email = reply.email.toLowerCase();
          return email !== 'botch@botchthecrab.com' && email !== replyData.email;
        })
        .map(function(reply) {
          return reply.email.toLowerCase();
        })
        .unique()
        .value();
      notificationRecipients.unshift('botch@botchthecrab.com');

      var notificationEmailRequests = [];

      _.each(notificationRecipients, function(recipient) {

        var newMailDocument = {
          to: recipient,
          message: {
            subject: 'New Comment for "' + posting.title +  '" [BotchTheCrab.com]',
            html: '<p>' +
                    '<b>' + replyData.poster + '</b> ' +
                    (replyData.website ? '[<a href="' + replyData.website + '">' + replyData.website + '</a>] ' : '') +
                    'wrote the following on ' + newReply.posted + ':<br />' +
                  '</p>' +
                  '<p>' + newReply.content.replace(/\n/g, '<br/>') + '</p>' +
                  '<hr style="margin: 2em 0 1em" />' +
                  '<p>' +
                    '<i>To unsubscribe to comments from this post, reply back with the word "Unsubscribe" and Botch will adjust your notification settings.</i>' +
                  '</p>'
          },
          fromBTC: true
        };

        var newMailRequest = firebase.firestore().collection('mail').add(newMailDocument)
          .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);

            // delete this document
            /*
            window.setTimeout(function() {

              firebase.firestore().collection('mail').doc(docRef.id).delete().then(function(response) {
                console.log("Document " + docRef.id + " deleted");
              })
              .catch(function(error) {
                console.log("Could not delete new document");
              });

            }, 2000);
            */

            return newReply;
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
            return error;
          });

        notificationEmailRequests.push(newMailRequest);
      });

      return $.when(notificationEmailRequests);

    }, function(error) {
      console.error(error);
      window.alert("There was an error attempting to submit your reply.");
      return error;
    });
  });

}

function getNewPostTime() {
  var now = new Date();
  var postYear = now.getFullYear();
  var postMonth = zeroPad(now.getMonth() + 1);
  var postDate = zeroPad(now.getDate());
  var postHour = zeroPad(now.getHours());
  var postMinutes = zeroPad(now.getMinutes());
  var postSeconds = zeroPad(now.getSeconds());
  return postYear + '-' + postMonth + '-' + postDate + ' ' + postHour + ':' + postMinutes + ':' + postSeconds;
}

function zeroPad(n) {
  return (n < 10) ? '0' + n : n;
}

},{}],48:[function(require,module,exports){
var storage = (typeof(Storage) !== 'undefined');
var now = new Date();
var one_year = new Date(now.getUTCFullYear() + 1, now.getUTCMonth(), now.getUTCDate() );

module.exports = {

  /* set local storage, or cookie if Storage is not supported */
  setCookie: function(name,value,expires,path,domain,secure) {
    if (storage) {
      localStorage[name] = value;
    } else {
      expires = expires || one_year;

      document.cookie = name + "=" + value +
      ((expires)	? ";expires=" + expires.toUTCString() : "") +
      ((path)		? ";path=" + path : "") +
      ((domain)	? ";domain=" + domain : "") +
      ((secure)	? ";secure" : "");
    }
  },

  /* read local storage, cookies if Storage is not supported or value is absent */
  readCookie: function(cookieName) {

    if (storage && localStorage[cookieName]) {

      return localStorage[cookieName];

    } else if (document.cookie) {

      var whichChip = new RegExp("\\b" + cookieName + "=", "i");
      var index = document.cookie.search(whichChip);

      if (index != -1) {

        // Find the start
        cookieStart = index + cookieName.length + 1;

        // Find the end
        cookieStop = document.cookie.indexOf(";", index);
        if (cookieStop == -1) { cookieStop = document.cookie.length }

        // with the start and the end... now you've got the whole thing
        return document.cookie.substring(cookieStart, cookieStop)
      }

      else return false;

    }
    return false;
  }

}

},{}],49:[function(require,module,exports){
var fancyBoxDefaults = {
  prevEffect: 'fade',
  nextEffect: 'fade',
  arrows: true,
  closeBtn: true,
  loop: false,
  helpers: {
    title: { type : 'inside' }
  },
  minWidth: 225,
  minHeight: 50,
  margin: 50,
  padding: 20
}

var fancyBoxSwipeInitialized = false;

module.exports = {
  // initFancyBoxSwipe: initFancyBoxSwipe,
  buildFancyboxPopIcon: buildFancyboxPopIcon,
  initFancyBox: initFancyBox,
  openBoxArt: openBoxArt,
  openTechSpecs: openTechSpecs,
  openInstructions: openInstructions,
  openImage: openImage
};

////////////

/* function initFancyBoxSwipe() {
  if (!fancyBoxSwipeInitialized) {
    fancyBoxSwipeInitialized = true;

    $('body').on('swipe', {
      swipeLeft:function(event, direction, distance, duration, fingerCount){
        $('.fancybox-next').trigger('click');
      },
      swipeRight:function(event, direction, distance, duration, fingerCount){
        $('.fancybox-prev').trigger('click');
      },
      threshold:100
    });

  }
} */

/* function clearFancyBoxSwipe() {
  $('body').off('swipe');
  fancyBoxSwipeInitialized = false;
} */

function buildFancyboxPopIcon(href) {
  return '<div class="fancybox-download" title="open image in new window">' +
    '<a href="' + href + '" target="_blank">' +
      '<img src="/images/icon_newwin.png" />' +
    '</a>' +
  '</div>';
}

function initFancyBox() {

  var buildFancyboxPopIcon = this.buildFancyboxPopIcon;

  _.extend(window, {
    openBoxArt: this.openBoxArt,
    openTechSpecs: this.openTechSpecs,
    openInstructions: this.openInstructions
  });

  // art
  $(".fancybox-button-art").fancybox($.extend({
    beforeLoad: function() {
      var character = $(this.element).data('character');
      var hasTechSpecs = Boolean($(this.element).data('techspecs'));
      var hasInstructions = Boolean($(this.element).data('instructions'));

      this.title = buildFancyboxPopIcon(this.href) + this.title;

      if (hasTechSpecs || hasInstructions) {
        var links = '<div class="fancybox-additional-links">';
        if (hasTechSpecs) {
          links += '<a class="open-techspecs" href="javascript:void(openTechSpecs(\'' + character + '\'))">Tech Specs</a>';
        }
        if (hasInstructions) {
          links += '<a class="open-instructions" href="javascript:void(openInstructions(\'' + character + '\'))">Instructions</a>';
        }
        links += '</div>';
        this.title += links;
      }
    },
    // afterLoad: initFancyBoxSwipe
  }, fancyBoxDefaults));

  // techspecs
  $(".fancybox-button-techspecs").fancybox($.extend({
    beforeLoad: function() {
      var character = $(this.element).data('character');
      var hasBoxArt = Boolean($(this.element).data('art'));
      var hasInstructions = Boolean($(this.element).data('instructions'));

      this.title = buildFancyboxPopIcon(this.href) + this.title;

      if (hasBoxArt || hasInstructions) {
        var links = '<div class="fancybox-additional-links">';
        if (hasBoxArt) {
          links += '<a class="open-boxart" href="javascript:void(openBoxArt(\'' + character + '\'))">Box Art</a>';
        }
        if (hasInstructions) {
          links += '<a class="open-instructions" href="javascript:void(openInstructions(\'' + character + '\'))">Instructions</a>';
        }
        links += '</div>';
        this.title += links;
      }
    },
    // afterLoad: initFancyBoxSwipe
  }, fancyBoxDefaults));

  // instructions
  $(".fancybox-button-instructions").fancybox($.extend({
    beforeLoad: function() {
      var character = $(this.element).data('character');
      var hasBoxArt = Boolean($(this.element).data('art'));
      var hasTechSpecs = Boolean($(this.element).data('techspecs'));

      this.title = buildFancyboxPopIcon(this.href) + this.title;

      if (hasBoxArt || hasTechSpecs) {
        var links = '<div class="fancybox-additional-links">';
        if (hasBoxArt) {
          links += '<a class="open-boxart" href="javascript:void(openBoxArt(\'' + character + '\'))">Box Art</a>';
        }
        if (hasTechSpecs) {
          links += '<a class="open-techspecs" href="javascript:void(openTechSpecs(\'' + character + '\'))">Tech Specs</a>';
        }
        links += '</div>';
        this.title += links;
      }
    },
    // afterLoad: initFancyBoxSwipe
  }, fancyBoxDefaults));

}

// direct link to open Box Art from fancyBox
function openBoxArt(character) {
  // close the character art
  $.fancybox.close(true);
  // find the character's tech spec link
  var BoxArt = $('.fancybox-button-art').filter('[title="' + character + '"]');
  // trigger the click
  BoxArt.trigger('click');
}

// direct link to open Tech Specs from fancyBox
function openTechSpecs(character) {
  // close the character art
  $.fancybox.close(true);
  // find the character's tech spec link
  var TechSpecs = $('.fancybox-button-techspecs').filter('[title="' + character + ' - Tech Specs"]');
  // trigger the click
  TechSpecs.trigger('click');
}

// direct link to open Instructions from fancyBox
function openInstructions(character) {
  // close the character art
  $.fancybox.close(true);
  // find the character's tech spec link
  var Instructions = $('.fancybox-button-instructions').filter('[title="' + character + ' - Instructions"]');
  // trigger the click
  Instructions.trigger('click');
}

// open single image
function openImage(imgName, imgSrc) {
  $.fancybox.open([{
    href : imgSrc,
    title : buildFancyboxPopIcon(imgSrc) + imgName
  }], fancyBoxDefaults);
}

},{}],50:[function(require,module,exports){
module.exports = {
  getCurrentRoute: getCurrentRoute,
  setBodyClass: setBodyClass,
  setOfficeDocumentTitle: setOfficeDocumentTitle,
  setArchiveDocumentTitle: setArchiveDocumentTitle,
  formatPosted: formatPosted,
	scrollTop: scrollTop
};

function getCurrentRoute() {
  return location.hash.substring(1);
}

function setBodyClass(currentRoute) {
  var className = '';
  if (currentRoute.indexOf('/autobot') !== -1) {
    className = "autobot";
  } else if (currentRoute.indexOf('/decepticon') !== -1) {
    className = "decepticon";
  }

  $('body').attr('class', className);
}

function setOfficeDocumentTitle(pageTitle) {
  document.title = "Botch the Crab" + (pageTitle ? " - " + pageTitle : "");
}

function setArchiveDocumentTitle(pageTitle) {
  document.title = "Botch's Transformers Box Art Archive" + (pageTitle ? " - " + pageTitle : "");
}

function formatPosted(posted) {
  var timestampParts = posted.split(' ');
  var datePart = timestampParts[0];
  var timePart = timestampParts[1]
  if (timePart === '00:00:00') {
    timePart = '';
  } else {
    timePart = timePart.substring(0,5);
  }

  return datePart + ' ' + timePart;
}

/* animated scroll to the top */
function scrollTop() {
  var body = $("html, body");
  body.animate({ scrollTop: 0 }, '250', 'swing');
}

},{}]},{},[45]);
