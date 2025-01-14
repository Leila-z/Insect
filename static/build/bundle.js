
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    const nodes_to_detach = new Set();
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
        for (const node of nodes_to_detach) {
            node.parentNode.removeChild(node);
        }
        nodes_to_detach.clear();
    }
    function append(target, node) {
        if (is_hydrating) {
            nodes_to_detach.delete(node);
        }
        if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating) {
            nodes_to_detach.delete(node);
        }
        if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        if (is_hydrating) {
            nodes_to_detach.add(node);
        }
        else if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update$1(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

    /*!
     * GSAP 3.6.1
     * https://greensock.com
     *
     * @license Copyright 2008-2021, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var _config = {
      autoSleep: 120,
      force3D: "auto",
      nullTargetWarn: 1,
      units: {
        lineHeight: ""
      }
    },
        _defaults$1 = {
      duration: .5,
      overwrite: false,
      delay: 0
    },
        _suppressOverwrites$1,
        _bigNum$1 = 1e8,
        _tinyNum = 1 / _bigNum$1,
        _2PI = Math.PI * 2,
        _HALF_PI = _2PI / 4,
        _gsID = 0,
        _sqrt = Math.sqrt,
        _cos = Math.cos,
        _sin = Math.sin,
        _isString$1 = function _isString(value) {
      return typeof value === "string";
    },
        _isFunction$1 = function _isFunction(value) {
      return typeof value === "function";
    },
        _isNumber$1 = function _isNumber(value) {
      return typeof value === "number";
    },
        _isUndefined = function _isUndefined(value) {
      return typeof value === "undefined";
    },
        _isObject$1 = function _isObject(value) {
      return typeof value === "object";
    },
        _isNotFalse = function _isNotFalse(value) {
      return value !== false;
    },
        _windowExists$2 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _isFuncOrString = function _isFuncOrString(value) {
      return _isFunction$1(value) || _isString$1(value);
    },
        _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
        // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
    _isArray = Array.isArray,
        _strictNumExp = /(?:-?\.?\d|\.)+/gi,
        //only numbers (including negatives and decimals) but NOT relative values.
    _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
        //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
    _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
        _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
        //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
    _relExp = /[+-]=-?[.\d]+/,
        _delimitedValueExp = /[#\-+.]*\b[a-z\d-=+%.]+/gi,
        _unitExp = /[\d.+\-=]+(?:e[-+]\d*)*/i,
        _globalTimeline,
        _win$2,
        _coreInitted$1,
        _doc$2,
        _globals = {},
        _installScope = {},
        _coreReady,
        _install = function _install(scope) {
      return (_installScope = _merge(scope, _globals)) && gsap$2;
    },
        _missingPlugin = function _missingPlugin(property, value) {
      return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
    },
        _warn = function _warn(message, suppress) {
      return !suppress && console.warn(message);
    },
        _addGlobal = function _addGlobal(name, obj) {
      return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
    },
        _emptyFunc = function _emptyFunc() {
      return 0;
    },
        _reservedProps = {},
        _lazyTweens = [],
        _lazyLookup = {},
        _lastRenderedFrame,
        _plugins = {},
        _effects = {},
        _nextGCFrame = 30,
        _harnessPlugins = [],
        _callbackNames = "",
        _harness = function _harness(targets) {
      var target = targets[0],
          harnessPlugin,
          i;
      _isObject$1(target) || _isFunction$1(target) || (targets = [targets]);

      if (!(harnessPlugin = (target._gsap || {}).harness)) {
        // find the first target with a harness. We assume targets passed into an animation will be of similar type, meaning the same kind of harness can be used for them all (performance optimization)
        i = _harnessPlugins.length;

        while (i-- && !_harnessPlugins[i].targetTest(target)) {}

        harnessPlugin = _harnessPlugins[i];
      }

      i = targets.length;

      while (i--) {
        targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
      }

      return targets;
    },
        _getCache = function _getCache(target) {
      return target._gsap || _harness(toArray(target))[0]._gsap;
    },
        _getProperty = function _getProperty(target, property, v) {
      return (v = target[property]) && _isFunction$1(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
    },
        _forEachName = function _forEachName(names, func) {
      return (names = names.split(",")).forEach(func) || names;
    },
        //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
    _round$1 = function _round(value) {
      return Math.round(value * 100000) / 100000 || 0;
    },
        _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
      //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
      var l = toFind.length,
          i = 0;

      for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

      return i < l;
    },
        _parseVars = function _parseVars(params, type, parent) {
      //reads the arguments passed to one of the key methods and figures out if the user is defining things with the OLD/legacy syntax where the duration is the 2nd parameter, and then it adjusts things accordingly and spits back the corrected vars object (with the duration added if necessary, as well as runBackwards or startAt or immediateRender). type 0 = to()/staggerTo(), 1 = from()/staggerFrom(), 2 = fromTo()/staggerFromTo()
      var isLegacy = _isNumber$1(params[1]),
          varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
          vars = params[varsIndex],
          irVars;

      isLegacy && (vars.duration = params[1]);
      vars.parent = parent;

      if (type) {
        irVars = vars;

        while (parent && !("immediateRender" in irVars)) {
          // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
          irVars = parent.vars.defaults || {};
          parent = _isNotFalse(parent.vars.inherit) && parent.parent;
        }

        vars.immediateRender = _isNotFalse(irVars.immediateRender);
        type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
      }

      return vars;
    },
        _lazyRender = function _lazyRender() {
      var l = _lazyTweens.length,
          a = _lazyTweens.slice(0),
          i,
          tween;

      _lazyLookup = {};
      _lazyTweens.length = 0;

      for (i = 0; i < l; i++) {
        tween = a[i];
        tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
      }
    },
        _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
      _lazyTweens.length && _lazyRender();
      animation.render(time, suppressEvents, force);
      _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
    },
        _numericIfPossible = function _numericIfPossible(value) {
      var n = parseFloat(value);
      return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString$1(value) ? value.trim() : value;
    },
        _passThrough$1 = function _passThrough(p) {
      return p;
    },
        _setDefaults$1 = function _setDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || (obj[p] = defaults[p]);
      }

      return obj;
    },
        _setKeyframeDefaults = function _setKeyframeDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
      }
    },
        _merge = function _merge(base, toMerge) {
      for (var p in toMerge) {
        base[p] = toMerge[p];
      }

      return base;
    },
        _mergeDeep = function _mergeDeep(base, toMerge) {
      for (var p in toMerge) {
        p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject$1(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
      }

      return base;
    },
        _copyExcluding = function _copyExcluding(obj, excluding) {
      var copy = {},
          p;

      for (p in obj) {
        p in excluding || (copy[p] = obj[p]);
      }

      return copy;
    },
        _inheritDefaults = function _inheritDefaults(vars) {
      var parent = vars.parent || _globalTimeline,
          func = vars.keyframes ? _setKeyframeDefaults : _setDefaults$1;

      if (_isNotFalse(vars.inherit)) {
        while (parent) {
          func(vars, parent.vars.defaults);
          parent = parent.parent || parent._dp;
        }
      }

      return vars;
    },
        _arraysMatch = function _arraysMatch(a1, a2) {
      var i = a1.length,
          match = i === a2.length;

      while (match && i-- && a1[i] === a2[i]) {}

      return i < 0;
    },
        _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
      if (firstProp === void 0) {
        firstProp = "_first";
      }

      if (lastProp === void 0) {
        lastProp = "_last";
      }

      var prev = parent[lastProp],
          t;

      if (sortBy) {
        t = child[sortBy];

        while (prev && prev[sortBy] > t) {
          prev = prev._prev;
        }
      }

      if (prev) {
        child._next = prev._next;
        prev._next = child;
      } else {
        child._next = parent[firstProp];
        parent[firstProp] = child;
      }

      if (child._next) {
        child._next._prev = child;
      } else {
        parent[lastProp] = child;
      }

      child._prev = prev;
      child.parent = child._dp = parent;
      return child;
    },
        _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
      if (firstProp === void 0) {
        firstProp = "_first";
      }

      if (lastProp === void 0) {
        lastProp = "_last";
      }

      var prev = child._prev,
          next = child._next;

      if (prev) {
        prev._next = next;
      } else if (parent[firstProp] === child) {
        parent[firstProp] = next;
      }

      if (next) {
        next._prev = prev;
      } else if (parent[lastProp] === child) {
        parent[lastProp] = prev;
      }

      child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
    },
        _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
      child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
      child._act = 0;
    },
        _uncache = function _uncache(animation, child) {
      if (animation && (!child || child._end > animation._dur || child._start < 0)) {
        // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
        var a = animation;

        while (a) {
          a._dirty = 1;
          a = a.parent;
        }
      }

      return animation;
    },
        _recacheAncestors = function _recacheAncestors(animation) {
      var parent = animation.parent;

      while (parent && parent.parent) {
        //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
        parent._dirty = 1;
        parent.totalDuration();
        parent = parent.parent;
      }

      return animation;
    },
        _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
      return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
    },
        _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
      return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
    },
        // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
    _animationCycle = function _animationCycle(tTime, cycleDuration) {
      var whole = Math.floor(tTime /= cycleDuration);
      return tTime && whole === tTime ? whole - 1 : whole;
    },
        _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
      return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
    },
        _setEnd = function _setEnd(animation) {
      return animation._end = _round$1(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
    },
        _alignPlayhead = function _alignPlayhead(animation, totalTime) {
      // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
      var parent = animation._dp;

      if (parent && parent.smoothChildTiming && animation._ts) {
        animation._start = _round$1(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

        _setEnd(animation);

        parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
      }

      return animation;
    },

    /*
    _totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
    	let cycleDuration = duration + repeatDelay,
    		time = _round(clampedTotalTime % cycleDuration);
    	if (time > duration) {
    		time = duration;
    	}
    	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
    },
    */
    _postAddChecks = function _postAddChecks(timeline, child) {
      var t;

      if (child._time || child._initted && !child._dur) {
        //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
        t = _parentToChildTotalTime(timeline.rawTime(), child);

        if (!child._dur || _clamp$1(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
          child.render(t, true);
        }
      } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


      if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
        //in case any of the ancestors had completed but should now be enabled...
        if (timeline._dur < timeline.duration()) {
          t = timeline;

          while (t._dp) {
            t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

            t = t._dp;
          }
        }

        timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
      }
    },
        _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
      child.parent && _removeFromParent(child);
      child._start = _round$1(position + child._delay);
      child._end = _round$1(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

      _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

      timeline._recent = child;
      skipChecks || _postAddChecks(timeline, child);
      return timeline;
    },
        _scrollTrigger = function _scrollTrigger(animation, trigger) {
      return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
    },
        _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
      _initTween(tween, totalTime);

      if (!tween._initted) {
        return 1;
      }

      if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
        _lazyTweens.push(tween);

        tween._lazy = [totalTime, suppressEvents];
        return 1;
      }
    },
        _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
      var parent = _ref.parent;
      return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
    },
        // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0
    _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
      var prevRatio = tween.ratio,
          ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) || (tween._ts < 0 || tween._dp._ts < 0) && tween.data !== "isFromStart" && tween.data !== "isStart") ? 0 : 1,
          // if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0.
      repeatDelay = tween._rDelay,
          tTime = 0,
          pt,
          iteration,
          prevIteration;

      if (repeatDelay && tween._repeat) {
        // in case there's a zero-duration tween that has a repeat with a repeatDelay
        tTime = _clamp$1(0, tween._tDur, totalTime);
        iteration = _animationCycle(tTime, repeatDelay);
        prevIteration = _animationCycle(tween._tTime, repeatDelay);
        tween._yoyo && iteration & 1 && (ratio = 1 - ratio);

        if (iteration !== prevIteration) {
          prevRatio = 1 - ratio;
          tween.vars.repeatRefresh && tween._initted && tween.invalidate();
        }
      }

      if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
        if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
          // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
          return;
        }

        prevIteration = tween._zTime;
        tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

        tween.ratio = ratio;
        tween._from && (ratio = 1 - ratio);
        tween._time = 0;
        tween._tTime = tTime;
        pt = tween._pt;

        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }

        tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
        tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
        tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

        if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
          ratio && _removeFromParent(tween, 1);

          if (!suppressEvents) {
            _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

            tween._prom && tween._prom();
          }
        }
      } else if (!tween._zTime) {
        tween._zTime = totalTime;
      }
    },
        _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
      var child;

      if (time > prevTime) {
        child = animation._first;

        while (child && child._start <= time) {
          if (!child._dur && child.data === "isPause" && child._start > prevTime) {
            return child;
          }

          child = child._next;
        }
      } else {
        child = animation._last;

        while (child && child._start >= time) {
          if (!child._dur && child.data === "isPause" && child._start < prevTime) {
            return child;
          }

          child = child._prev;
        }
      }
    },
        _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
      var repeat = animation._repeat,
          dur = _round$1(duration) || 0,
          totalProgress = animation._tTime / animation._tDur;
      totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
      animation._dur = dur;
      animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round$1(dur * (repeat + 1) + animation._rDelay * repeat);
      totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
      skipUncache || _uncache(animation.parent, animation);
      return animation;
    },
        _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
      return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
    },
        _zeroPosition = {
      _start: 0,
      endTime: _emptyFunc
    },
        _parsePosition$1 = function _parsePosition(animation, position) {
      var labels = animation.labels,
          recent = animation._recent || _zeroPosition,
          clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur,
          //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
      i,
          offset;

      if (_isString$1(position) && (isNaN(position) || position in labels)) {
        //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
        i = position.charAt(0);

        if (i === "<" || i === ">") {
          return (i === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0);
        }

        i = position.indexOf("=");

        if (i < 0) {
          position in labels || (labels[position] = clippedDuration);
          return labels[position];
        }

        offset = +(position.charAt(i - 1) + position.substr(i + 1));
        return i > 1 ? _parsePosition(animation, position.substr(0, i - 1)) + offset : clippedDuration + offset;
      }

      return position == null ? clippedDuration : +position;
    },
        _conditionalReturn = function _conditionalReturn(value, func) {
      return value || value === 0 ? func(value) : func;
    },
        _clamp$1 = function _clamp(min, max, value) {
      return value < min ? min : value > max ? max : value;
    },
        getUnit = function getUnit(value) {
      if (typeof value !== "string") {
        return "";
      }

      var v = _unitExp.exec(value);

      return v ? value.substr(v.index + v[0].length) : "";
    },
        // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
    clamp$1 = function clamp(min, max, value) {
      return _conditionalReturn(value, function (v) {
        return _clamp$1(min, max, v);
      });
    },
        _slice = [].slice,
        _isArrayLike = function _isArrayLike(value, nonEmpty) {
      return value && _isObject$1(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject$1(value[0])) && !value.nodeType && value !== _win$2;
    },
        _flatten = function _flatten(ar, leaveStrings, accumulator) {
      if (accumulator === void 0) {
        accumulator = [];
      }

      return ar.forEach(function (value) {
        var _accumulator;

        return _isString$1(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
      }) || accumulator;
    },
        //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
    toArray = function toArray(value, leaveStrings) {
      return _isString$1(value) && !leaveStrings && (_coreInitted$1 || !_wake()) ? _slice.call(_doc$2.querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
    },
        shuffle = function shuffle(a) {
      return a.sort(function () {
        return .5 - Math.random();
      });
    },
        // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
    //for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
    distribute = function distribute(v) {
      if (_isFunction$1(v)) {
        return v;
      }

      var vars = _isObject$1(v) ? v : {
        each: v
      },
          //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
      ease = _parseEase(vars.ease),
          from = vars.from || 0,
          base = parseFloat(vars.base) || 0,
          cache = {},
          isDecimal = from > 0 && from < 1,
          ratios = isNaN(from) || isDecimal,
          axis = vars.axis,
          ratioX = from,
          ratioY = from;

      if (_isString$1(from)) {
        ratioX = ratioY = {
          center: .5,
          edges: .5,
          end: 1
        }[from] || 0;
      } else if (!isDecimal && ratios) {
        ratioX = from[0];
        ratioY = from[1];
      }

      return function (i, target, a) {
        var l = (a || vars).length,
            distances = cache[l],
            originX,
            originY,
            x,
            y,
            d,
            j,
            max,
            min,
            wrapAt;

        if (!distances) {
          wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];

          if (!wrapAt) {
            max = -_bigNum$1;

            while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

            wrapAt--;
          }

          distances = cache[l] = [];
          originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
          originY = ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
          max = 0;
          min = _bigNum$1;

          for (j = 0; j < l; j++) {
            x = j % wrapAt - originX;
            y = originY - (j / wrapAt | 0);
            distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
            d > max && (max = d);
            d < min && (min = d);
          }

          from === "random" && shuffle(distances);
          distances.max = max - min;
          distances.min = min;
          distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
          distances.b = l < 0 ? base - l : base;
          distances.u = getUnit(vars.amount || vars.each) || 0; //unit

          ease = ease && l < 0 ? _invertEase(ease) : ease;
        }

        l = (distances[i] - distances.min) / distances.max || 0;
        return _round$1(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
      };
    },
        _roundModifier = function _roundModifier(v) {
      //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
      var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1; //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed()

      return function (raw) {
        var n = Math.round(parseFloat(raw) / v) * v * p;
        return (n - n % 1) / p + (_isNumber$1(raw) ? 0 : getUnit(raw)); // n - n % 1 replaces Math.floor() in order to handle negative values properly. For example, Math.floor(-150.00000000000003) is 151!
      };
    },
        snap = function snap(snapTo, value) {
      var isArray = _isArray(snapTo),
          radius,
          is2D;

      if (!isArray && _isObject$1(snapTo)) {
        radius = isArray = snapTo.radius || _bigNum$1;

        if (snapTo.values) {
          snapTo = toArray(snapTo.values);

          if (is2D = !_isNumber$1(snapTo[0])) {
            radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
          }
        } else {
          snapTo = _roundModifier(snapTo.increment);
        }
      }

      return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction$1(snapTo) ? function (raw) {
        is2D = snapTo(raw);
        return Math.abs(is2D - raw) <= radius ? is2D : raw;
      } : function (raw) {
        var x = parseFloat(is2D ? raw.x : raw),
            y = parseFloat(is2D ? raw.y : 0),
            min = _bigNum$1,
            closest = 0,
            i = snapTo.length,
            dx,
            dy;

        while (i--) {
          if (is2D) {
            dx = snapTo[i].x - x;
            dy = snapTo[i].y - y;
            dx = dx * dx + dy * dy;
          } else {
            dx = Math.abs(snapTo[i] - x);
          }

          if (dx < min) {
            min = dx;
            closest = i;
          }
        }

        closest = !radius || min <= radius ? snapTo[closest] : raw;
        return is2D || closest === raw || _isNumber$1(raw) ? closest : closest + getUnit(raw);
      });
    },
        random = function random(min, max, roundingIncrement, returnFunction) {
      return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
        return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
      });
    },
        pipe = function pipe() {
      for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
        functions[_key] = arguments[_key];
      }

      return function (value) {
        return functions.reduce(function (v, f) {
          return f(v);
        }, value);
      };
    },
        unitize = function unitize(func, unit) {
      return function (value) {
        return func(parseFloat(value)) + (unit || getUnit(value));
      };
    },
        normalize$1 = function normalize(min, max, value) {
      return mapRange(min, max, 0, 1, value);
    },
        _wrapArray = function _wrapArray(a, wrapper, value) {
      return _conditionalReturn(value, function (index) {
        return a[~~wrapper(index)];
      });
    },
        wrap = function wrap(min, max, value) {
      // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
      var range = max - min;
      return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
        return (range + (value - min) % range) % range + min;
      });
    },
        wrapYoyo = function wrapYoyo(min, max, value) {
      var range = max - min,
          total = range * 2;
      return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
        value = (total + (value - min) % total) % total || 0;
        return min + (value > range ? total - value : value);
      });
    },
        _replaceRandom = function _replaceRandom(value) {
      //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
      var prev = 0,
          s = "",
          i,
          nums,
          end,
          isArray;

      while (~(i = value.indexOf("random(", prev))) {
        end = value.indexOf(")", i);
        isArray = value.charAt(i + 7) === "[";
        nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
        s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
        prev = end + 1;
      }

      return s + value.substr(prev, value.length - prev);
    },
        mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
      var inRange = inMax - inMin,
          outRange = outMax - outMin;
      return _conditionalReturn(value, function (value) {
        return outMin + ((value - inMin) / inRange * outRange || 0);
      });
    },
        interpolate = function interpolate(start, end, progress, mutate) {
      var func = isNaN(start + end) ? 0 : function (p) {
        return (1 - p) * start + p * end;
      };

      if (!func) {
        var isString = _isString$1(start),
            master = {},
            p,
            i,
            interpolators,
            l,
            il;

        progress === true && (mutate = 1) && (progress = null);

        if (isString) {
          start = {
            p: start
          };
          end = {
            p: end
          };
        } else if (_isArray(start) && !_isArray(end)) {
          interpolators = [];
          l = start.length;
          il = l - 2;

          for (i = 1; i < l; i++) {
            interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
          }

          l--;

          func = function func(p) {
            p *= l;
            var i = Math.min(il, ~~p);
            return interpolators[i](p - i);
          };

          progress = end;
        } else if (!mutate) {
          start = _merge(_isArray(start) ? [] : {}, start);
        }

        if (!interpolators) {
          for (p in end) {
            _addPropTween.call(master, start, p, "get", end[p]);
          }

          func = function func(p) {
            return _renderPropTweens(p, master) || (isString ? start.p : start);
          };
        }
      }

      return _conditionalReturn(progress, func);
    },
        _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
      //used for nextLabel() and previousLabel()
      var labels = timeline.labels,
          min = _bigNum$1,
          p,
          distance,
          label;

      for (p in labels) {
        distance = labels[p] - fromTime;

        if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
          label = p;
          min = distance;
        }
      }

      return label;
    },
        _callback = function _callback(animation, type, executeLazyFirst) {
      var v = animation.vars,
          callback = v[type],
          params,
          scope;

      if (!callback) {
        return;
      }

      params = v[type + "Params"];
      scope = v.callbackScope || animation;
      executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

      return params ? callback.apply(scope, params) : callback.call(scope);
    },
        _interrupt = function _interrupt(animation) {
      _removeFromParent(animation);

      animation.scrollTrigger && animation.scrollTrigger.kill(false);
      animation.progress() < 1 && _callback(animation, "onInterrupt");
      return animation;
    },
        _quickTween,
        _createPlugin = function _createPlugin(config) {
      config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

      var name = config.name,
          isFunc = _isFunction$1(config),
          Plugin = name && !isFunc && config.init ? function () {
        this._props = [];
      } : config,
          //in case someone passes in an object that's not a plugin, like CustomEase
      instanceDefaults = {
        init: _emptyFunc,
        render: _renderPropTweens,
        add: _addPropTween,
        kill: _killPropTweensOf,
        modifier: _addPluginModifier,
        rawVars: 0
      },
          statics = {
        targetTest: 0,
        get: 0,
        getSetter: _getSetter,
        aliases: {},
        register: 0
      };

      _wake();

      if (config !== Plugin) {
        if (_plugins[name]) {
          return;
        }

        _setDefaults$1(Plugin, _setDefaults$1(_copyExcluding(config, instanceDefaults), statics)); //static methods


        _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


        _plugins[Plugin.prop = name] = Plugin;

        if (config.targetTest) {
          _harnessPlugins.push(Plugin);

          _reservedProps[name] = 1;
        }

        name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
      }

      _addGlobal(name, Plugin);

      config.register && config.register(gsap$2, Plugin, PropTween);
    },

    /*
     * --------------------------------------------------------------------------------------
     * COLORS
     * --------------------------------------------------------------------------------------
     */
    _255 = 255,
        _colorLookup = {
      aqua: [0, _255, _255],
      lime: [0, _255, 0],
      silver: [192, 192, 192],
      black: [0, 0, 0],
      maroon: [128, 0, 0],
      teal: [0, 128, 128],
      blue: [0, 0, _255],
      navy: [0, 0, 128],
      white: [_255, _255, _255],
      olive: [128, 128, 0],
      yellow: [_255, _255, 0],
      orange: [_255, 165, 0],
      gray: [128, 128, 128],
      purple: [128, 0, 128],
      green: [0, 128, 0],
      red: [_255, 0, 0],
      pink: [_255, 192, 203],
      cyan: [0, _255, _255],
      transparent: [_255, _255, _255, 0]
    },
        _hue = function _hue(h, m1, m2) {
      h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
      return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
    },
        splitColor = function splitColor(v, toHSL, forceAlpha) {
      var a = !v ? _colorLookup.black : _isNumber$1(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
          r,
          g,
          b,
          h,
          s,
          l,
          max,
          min,
          d,
          wasHSL;

      if (!a) {
        if (v.substr(-1) === ",") {
          //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
          v = v.substr(0, v.length - 1);
        }

        if (_colorLookup[v]) {
          a = _colorLookup[v];
        } else if (v.charAt(0) === "#") {
          if (v.length < 6) {
            //for shorthand like #9F0 or #9F0F (could have alpha)
            r = v.charAt(1);
            g = v.charAt(2);
            b = v.charAt(3);
            v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
          }

          if (v.length === 9) {
            // hex with alpha, like #fd5e53ff
            a = parseInt(v.substr(1, 6), 16);
            return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
          }

          v = parseInt(v.substr(1), 16);
          a = [v >> 16, v >> 8 & _255, v & _255];
        } else if (v.substr(0, 3) === "hsl") {
          a = wasHSL = v.match(_strictNumExp);

          if (!toHSL) {
            h = +a[0] % 360 / 360;
            s = +a[1] / 100;
            l = +a[2] / 100;
            g = l <= .5 ? l * (s + 1) : l + s - l * s;
            r = l * 2 - g;
            a.length > 3 && (a[3] *= 1); //cast as number

            a[0] = _hue(h + 1 / 3, r, g);
            a[1] = _hue(h, r, g);
            a[2] = _hue(h - 1 / 3, r, g);
          } else if (~v.indexOf("=")) {
            //if relative values are found, just return the raw strings with the relative prefixes in place.
            a = v.match(_numExp);
            forceAlpha && a.length < 4 && (a[3] = 1);
            return a;
          }
        } else {
          a = v.match(_strictNumExp) || _colorLookup.transparent;
        }

        a = a.map(Number);
      }

      if (toHSL && !wasHSL) {
        r = a[0] / _255;
        g = a[1] / _255;
        b = a[2] / _255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h *= 60;
        }

        a[0] = ~~(h + .5);
        a[1] = ~~(s * 100 + .5);
        a[2] = ~~(l * 100 + .5);
      }

      forceAlpha && a.length < 4 && (a[3] = 1);
      return a;
    },
        _colorOrderData = function _colorOrderData(v) {
      // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
      var values = [],
          c = [],
          i = -1;
      v.split(_colorExp).forEach(function (v) {
        var a = v.match(_numWithUnitExp) || [];
        values.push.apply(values, a);
        c.push(i += a.length + 1);
      });
      values.c = c;
      return values;
    },
        _formatColors = function _formatColors(s, toHSL, orderMatchData) {
      var result = "",
          colors = (s + result).match(_colorExp),
          type = toHSL ? "hsla(" : "rgba(",
          i = 0,
          c,
          shell,
          d,
          l;

      if (!colors) {
        return s;
      }

      colors = colors.map(function (color) {
        return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
      });

      if (orderMatchData) {
        d = _colorOrderData(s);
        c = orderMatchData.c;

        if (c.join(result) !== d.c.join(result)) {
          shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
          l = shell.length - 1;

          for (; i < l; i++) {
            result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
          }
        }
      }

      if (!shell) {
        shell = s.split(_colorExp);
        l = shell.length - 1;

        for (; i < l; i++) {
          result += shell[i] + colors[i];
        }
      }

      return result + shell[l];
    },
        _colorExp = function () {
      var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
          //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
      p;

      for (p in _colorLookup) {
        s += "|" + p + "\\b";
      }

      return new RegExp(s + ")", "gi");
    }(),
        _hslExp = /hsl[a]?\(/,
        _colorStringFilter = function _colorStringFilter(a) {
      var combined = a.join(" "),
          toHSL;
      _colorExp.lastIndex = 0;

      if (_colorExp.test(combined)) {
        toHSL = _hslExp.test(combined);
        a[1] = _formatColors(a[1], toHSL);
        a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

        return true;
      }
    },

    /*
     * --------------------------------------------------------------------------------------
     * TICKER
     * --------------------------------------------------------------------------------------
     */
    _tickerActive,
        _ticker = function () {
      var _getTime = Date.now,
          _lagThreshold = 500,
          _adjustedLag = 33,
          _startTime = _getTime(),
          _lastUpdate = _startTime,
          _gap = 1000 / 240,
          _nextTime = _gap,
          _listeners = [],
          _id,
          _req,
          _raf,
          _self,
          _delta,
          _i,
          _tick = function _tick(v) {
        var elapsed = _getTime() - _lastUpdate,
            manual = v === true,
            overlap,
            dispatch,
            time,
            frame;

        elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
        _lastUpdate += elapsed;
        time = _lastUpdate - _startTime;
        overlap = time - _nextTime;

        if (overlap > 0 || manual) {
          frame = ++_self.frame;
          _delta = time - _self.time * 1000;
          _self.time = time = time / 1000;
          _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
          dispatch = 1;
        }

        manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

        if (dispatch) {
          for (_i = 0; _i < _listeners.length; _i++) {
            // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
            _listeners[_i](time, _delta, frame, v);
          }
        }
      };

      _self = {
        time: 0,
        frame: 0,
        tick: function tick() {
          _tick(true);
        },
        deltaRatio: function deltaRatio(fps) {
          return _delta / (1000 / (fps || 60));
        },
        wake: function wake() {
          if (_coreReady) {
            if (!_coreInitted$1 && _windowExists$2()) {
              _win$2 = _coreInitted$1 = window;
              _doc$2 = _win$2.document || {};
              _globals.gsap = gsap$2;
              (_win$2.gsapVersions || (_win$2.gsapVersions = [])).push(gsap$2.version);

              _install(_installScope || _win$2.GreenSockGlobals || !_win$2.gsap && _win$2 || {});

              _raf = _win$2.requestAnimationFrame;
            }

            _id && _self.sleep();

            _req = _raf || function (f) {
              return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
            };

            _tickerActive = 1;

            _tick(2);
          }
        },
        sleep: function sleep() {
          (_raf ? _win$2.cancelAnimationFrame : clearTimeout)(_id);
          _tickerActive = 0;
          _req = _emptyFunc;
        },
        lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
          _lagThreshold = threshold || 1 / _tinyNum; //zero should be interpreted as basically unlimited

          _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
        },
        fps: function fps(_fps) {
          _gap = 1000 / (_fps || 240);
          _nextTime = _self.time * 1000 + _gap;
        },
        add: function add(callback) {
          _listeners.indexOf(callback) < 0 && _listeners.push(callback);

          _wake();
        },
        remove: function remove(callback) {
          var i;
          ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
        },
        _listeners: _listeners
      };
      return _self;
    }(),
        _wake = function _wake() {
      return !_tickerActive && _ticker.wake();
    },
        //also ensures the core classes are initialized.

    /*
    * -------------------------------------------------
    * EASING
    * -------------------------------------------------
    */
    _easeMap = {},
        _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
        _quotesExp = /["']/g,
        _parseObjectInString = function _parseObjectInString(value) {
      //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
      var obj = {},
          split = value.substr(1, value.length - 3).split(":"),
          key = split[0],
          i = 1,
          l = split.length,
          index,
          val,
          parsedVal;

      for (; i < l; i++) {
        val = split[i];
        index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
        parsedVal = val.substr(0, index);
        obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
        key = val.substr(index + 1).trim();
      }

      return obj;
    },
        _valueInParentheses = function _valueInParentheses(value) {
      var open = value.indexOf("(") + 1,
          close = value.indexOf(")"),
          nested = value.indexOf("(", open);
      return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
    },
        _configEaseFromString = function _configEaseFromString(name) {
      //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
      var split = (name + "").split("("),
          ease = _easeMap[split[0]];
      return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
    },
        _invertEase = function _invertEase(ease) {
      return function (p) {
        return 1 - ease(1 - p);
      };
    },
        // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
    _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
      var child = timeline._first,
          ease;

      while (child) {
        if (child instanceof Timeline) {
          _propagateYoyoEase(child, isYoyo);
        } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
          if (child.timeline) {
            _propagateYoyoEase(child.timeline, isYoyo);
          } else {
            ease = child._ease;
            child._ease = child._yEase;
            child._yEase = ease;
            child._yoyo = isYoyo;
          }
        }

        child = child._next;
      }
    },
        _parseEase = function _parseEase(ease, defaultEase) {
      return !ease ? defaultEase : (_isFunction$1(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
    },
        _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
      if (easeOut === void 0) {
        easeOut = function easeOut(p) {
          return 1 - easeIn(1 - p);
        };
      }

      if (easeInOut === void 0) {
        easeInOut = function easeInOut(p) {
          return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
        };
      }

      var ease = {
        easeIn: easeIn,
        easeOut: easeOut,
        easeInOut: easeInOut
      },
          lowercaseName;

      _forEachName(names, function (name) {
        _easeMap[name] = _globals[name] = ease;
        _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

        for (var p in ease) {
          _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
        }
      });

      return ease;
    },
        _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
      return function (p) {
        return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
      };
    },
        _configElastic = function _configElastic(type, amplitude, period) {
      var p1 = amplitude >= 1 ? amplitude : 1,
          //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
      p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
          p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
          easeOut = function easeOut(p) {
        return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
      },
          ease = type === "out" ? easeOut : type === "in" ? function (p) {
        return 1 - easeOut(1 - p);
      } : _easeInOutFromOut(easeOut);

      p2 = _2PI / p2; //precalculate to optimize

      ease.config = function (amplitude, period) {
        return _configElastic(type, amplitude, period);
      };

      return ease;
    },
        _configBack = function _configBack(type, overshoot) {
      if (overshoot === void 0) {
        overshoot = 1.70158;
      }

      var easeOut = function easeOut(p) {
        return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
      },
          ease = type === "out" ? easeOut : type === "in" ? function (p) {
        return 1 - easeOut(1 - p);
      } : _easeInOutFromOut(easeOut);

      ease.config = function (overshoot) {
        return _configBack(type, overshoot);
      };

      return ease;
    }; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
    // _weightedEase = ratio => {
    // 	let y = 0.5 + ratio / 2;
    // 	return p => (2 * (1 - p) * p * y + p * p);
    // },
    // a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
    // _weightedEaseStrong = ratio => {
    // 	ratio = .5 + ratio / 2;
    // 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
    // 		b = ratio - o,
    // 		c = ratio + o;
    // 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
    // };


    _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
      var power = i < 5 ? i + 1 : i;

      _insertEase(name + ",Power" + (power - 1), i ? function (p) {
        return Math.pow(p, power);
      } : function (p) {
        return p;
      }, function (p) {
        return 1 - Math.pow(1 - p, power);
      }, function (p) {
        return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
      });
    });

    _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

    _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

    (function (n, c) {
      var n1 = 1 / c,
          n2 = 2 * n1,
          n3 = 2.5 * n1,
          easeOut = function easeOut(p) {
        return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
      };

      _insertEase("Bounce", function (p) {
        return 1 - easeOut(1 - p);
      }, easeOut);
    })(7.5625, 2.75);

    _insertEase("Expo", function (p) {
      return p ? Math.pow(2, 10 * (p - 1)) : 0;
    });

    _insertEase("Circ", function (p) {
      return -(_sqrt(1 - p * p) - 1);
    });

    _insertEase("Sine", function (p) {
      return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
    });

    _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

    _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
      config: function config(steps, immediateStart) {
        if (steps === void 0) {
          steps = 1;
        }

        var p1 = 1 / steps,
            p2 = steps + (immediateStart ? 0 : 1),
            p3 = immediateStart ? 1 : 0,
            max = 1 - _tinyNum;
        return function (p) {
          return ((p2 * _clamp$1(0, max, p) | 0) + p3) * p1;
        };
      }
    };
    _defaults$1.ease = _easeMap["quad.out"];

    _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
      return _callbackNames += name + "," + name + "Params,";
    });
    /*
     * --------------------------------------------------------------------------------------
     * CACHE
     * --------------------------------------------------------------------------------------
     */


    var GSCache = function GSCache(target, harness) {
      this.id = _gsID++;
      target._gsap = this;
      this.target = target;
      this.harness = harness;
      this.get = harness ? harness.get : _getProperty;
      this.set = harness ? harness.getSetter : _getSetter;
    };
    /*
     * --------------------------------------------------------------------------------------
     * ANIMATION
     * --------------------------------------------------------------------------------------
     */

    var Animation = /*#__PURE__*/function () {
      function Animation(vars, time) {
        var parent = vars.parent || _globalTimeline;
        this.vars = vars;
        this._delay = +vars.delay || 0;

        if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
          // TODO: repeat: Infinity on a timeline's children must flag that timeline internally and affect its totalDuration, otherwise it'll stop in the negative direction when reaching the start.
          this._rDelay = vars.repeatDelay || 0;
          this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
        }

        this._ts = 1;

        _setDuration(this, +vars.duration, 1, 1);

        this.data = vars.data;
        _tickerActive || _ticker.wake();
        parent && _addToTimeline(parent, this, time || time === 0 ? time : parent._time, 1);
        vars.reversed && this.reverse();
        vars.paused && this.paused(true);
      }

      var _proto = Animation.prototype;

      _proto.delay = function delay(value) {
        if (value || value === 0) {
          this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
          this._delay = value;
          return this;
        }

        return this._delay;
      };

      _proto.duration = function duration(value) {
        return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
      };

      _proto.totalDuration = function totalDuration(value) {
        if (!arguments.length) {
          return this._tDur;
        }

        this._dirty = 0;
        return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
      };

      _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
        _wake();

        if (!arguments.length) {
          return this._tTime;
        }

        var parent = this._dp;

        if (parent && parent.smoothChildTiming && this._ts) {
          _alignPlayhead(this, _totalTime);

          !parent._dp || parent.parent || _postAddChecks(parent, this); // edge case: if this is a child of a timeline that already completed, for example, we must re-activate the parent.
          //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.

          while (parent.parent) {
            if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
              parent.totalTime(parent._tTime, true);
            }

            parent = parent.parent;
          }

          if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
            //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
            _addToTimeline(this._dp, this, this._start - this._delay);
          }
        }

        if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
          // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
          this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause
          //if (!this._lock) { // avoid endless recursion (not sure we need this yet or if it's worth the performance hit)
          //   this._lock = 1;

          _lazySafeRender(this, _totalTime, suppressEvents); //   this._lock = 0;
          //}

        }

        return this;
      };

      _proto.time = function time(value, suppressEvents) {
        return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % this._dur || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
      };

      _proto.totalProgress = function totalProgress(value, suppressEvents) {
        return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
      };

      _proto.progress = function progress(value, suppressEvents) {
        return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
      };

      _proto.iteration = function iteration(value, suppressEvents) {
        var cycleDuration = this.duration() + this._rDelay;

        return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
      } // potential future addition:
      // isPlayingBackwards() {
      // 	let animation = this,
      // 		orientation = 1; // 1 = forward, -1 = backward
      // 	while (animation) {
      // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
      // 		animation = animation.parent;
      // 	}
      // 	return orientation < 0;
      // }
      ;

      _proto.timeScale = function timeScale(value) {
        if (!arguments.length) {
          return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
        }

        if (this._rts === value) {
          return this;
        }

        var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
        // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

        this._rts = +value || 0;
        this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

        return _recacheAncestors(this.totalTime(_clamp$1(-this._delay, this._tDur, tTime), true));
      };

      _proto.paused = function paused(value) {
        if (!arguments.length) {
          return this._ps;
        }

        if (this._ps !== value) {
          this._ps = value;

          if (value) {
            this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

            this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
          } else {
            _wake();

            this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

            this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && (this._tTime -= _tinyNum) && Math.abs(this._zTime) !== _tinyNum); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
          }
        }

        return this;
      };

      _proto.startTime = function startTime(value) {
        if (arguments.length) {
          this._start = value;
          var parent = this.parent || this._dp;
          parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
          return this;
        }

        return this._start;
      };

      _proto.endTime = function endTime(includeRepeats) {
        return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
      };

      _proto.rawTime = function rawTime(wrapRepeats) {
        var parent = this.parent || this._dp; // _dp = detatched parent

        return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
      };

      _proto.globalTime = function globalTime(rawTime) {
        var animation = this,
            time = arguments.length ? rawTime : animation.rawTime();

        while (animation) {
          time = animation._start + time / (animation._ts || 1);
          animation = animation._dp;
        }

        return time;
      };

      _proto.repeat = function repeat(value) {
        if (arguments.length) {
          this._repeat = value === Infinity ? -2 : value;
          return _onUpdateTotalDuration(this);
        }

        return this._repeat === -2 ? Infinity : this._repeat;
      };

      _proto.repeatDelay = function repeatDelay(value) {
        if (arguments.length) {
          this._rDelay = value;
          return _onUpdateTotalDuration(this);
        }

        return this._rDelay;
      };

      _proto.yoyo = function yoyo(value) {
        if (arguments.length) {
          this._yoyo = value;
          return this;
        }

        return this._yoyo;
      };

      _proto.seek = function seek(position, suppressEvents) {
        return this.totalTime(_parsePosition$1(this, position), _isNotFalse(suppressEvents));
      };

      _proto.restart = function restart(includeDelay, suppressEvents) {
        return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
      };

      _proto.play = function play(from, suppressEvents) {
        from != null && this.seek(from, suppressEvents);
        return this.reversed(false).paused(false);
      };

      _proto.reverse = function reverse(from, suppressEvents) {
        from != null && this.seek(from || this.totalDuration(), suppressEvents);
        return this.reversed(true).paused(false);
      };

      _proto.pause = function pause(atTime, suppressEvents) {
        atTime != null && this.seek(atTime, suppressEvents);
        return this.paused(true);
      };

      _proto.resume = function resume() {
        return this.paused(false);
      };

      _proto.reversed = function reversed(value) {
        if (arguments.length) {
          !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

          return this;
        }

        return this._rts < 0;
      };

      _proto.invalidate = function invalidate() {
        this._initted = this._act = 0;
        this._zTime = -_tinyNum;
        return this;
      };

      _proto.isActive = function isActive() {
        var parent = this.parent || this._dp,
            start = this._start,
            rawTime;
        return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
      };

      _proto.eventCallback = function eventCallback(type, callback, params) {
        var vars = this.vars;

        if (arguments.length > 1) {
          if (!callback) {
            delete vars[type];
          } else {
            vars[type] = callback;
            params && (vars[type + "Params"] = params);
            type === "onUpdate" && (this._onUpdate = callback);
          }

          return this;
        }

        return vars[type];
      };

      _proto.then = function then(onFulfilled) {
        var self = this;
        return new Promise(function (resolve) {
          var f = _isFunction$1(onFulfilled) ? onFulfilled : _passThrough$1,
              _resolve = function _resolve() {
            var _then = self.then;
            self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

            _isFunction$1(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
            resolve(f);
            self.then = _then;
          };

          if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
            _resolve();
          } else {
            self._prom = _resolve;
          }
        });
      };

      _proto.kill = function kill() {
        _interrupt(this);
      };

      return Animation;
    }();

    _setDefaults$1(Animation.prototype, {
      _time: 0,
      _start: 0,
      _end: 0,
      _tTime: 0,
      _tDur: 0,
      _dirty: 0,
      _repeat: 0,
      _yoyo: false,
      parent: null,
      _initted: false,
      _rDelay: 0,
      _ts: 1,
      _dp: 0,
      ratio: 0,
      _zTime: -_tinyNum,
      _prom: 0,
      _ps: false,
      _rts: 1
    });
    /*
     * -------------------------------------------------
     * TIMELINE
     * -------------------------------------------------
     */


    var Timeline = /*#__PURE__*/function (_Animation) {
      _inheritsLoose(Timeline, _Animation);

      function Timeline(vars, time) {
        var _this;

        if (vars === void 0) {
          vars = {};
        }

        _this = _Animation.call(this, vars, time) || this;
        _this.labels = {};
        _this.smoothChildTiming = !!vars.smoothChildTiming;
        _this.autoRemoveChildren = !!vars.autoRemoveChildren;
        _this._sort = _isNotFalse(vars.sortChildren);
        _this.parent && _postAddChecks(_this.parent, _assertThisInitialized(_this));
        vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
        return _this;
      }

      var _proto2 = Timeline.prototype;

      _proto2.to = function to(targets, vars, position) {
        new Tween(targets, _parseVars(arguments, 0, this), _parsePosition$1(this, _isNumber$1(vars) ? arguments[3] : position));
        return this;
      };

      _proto2.from = function from(targets, vars, position) {
        new Tween(targets, _parseVars(arguments, 1, this), _parsePosition$1(this, _isNumber$1(vars) ? arguments[3] : position));
        return this;
      };

      _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
        new Tween(targets, _parseVars(arguments, 2, this), _parsePosition$1(this, _isNumber$1(fromVars) ? arguments[4] : position));
        return this;
      };

      _proto2.set = function set(targets, vars, position) {
        vars.duration = 0;
        vars.parent = this;
        _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
        vars.immediateRender = !!vars.immediateRender;
        new Tween(targets, vars, _parsePosition$1(this, position), 1);
        return this;
      };

      _proto2.call = function call(callback, params, position) {
        return _addToTimeline(this, Tween.delayedCall(0, callback, params), _parsePosition$1(this, position));
      } //ONLY for backward compatibility! Maybe delete?
      ;

      _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
        vars.duration = duration;
        vars.stagger = vars.stagger || stagger;
        vars.onComplete = onCompleteAll;
        vars.onCompleteParams = onCompleteAllParams;
        vars.parent = this;
        new Tween(targets, vars, _parsePosition$1(this, position));
        return this;
      };

      _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
        vars.runBackwards = 1;
        _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
        return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
      };

      _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
        toVars.startAt = fromVars;
        _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
        return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
      };

      _proto2.render = function render(totalTime, suppressEvents, force) {
        var prevTime = this._time,
            tDur = this._dirty ? this.totalDuration() : this._tDur,
            dur = this._dur,
            tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
            crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
            time,
            child,
            next,
            iteration,
            cycleDuration,
            prevPaused,
            pauseTween,
            timeScale,
            prevStart,
            prevIteration,
            yoyo,
            isYoyo;

        if (tTime !== this._tTime || force || crossingStart) {
          if (prevTime !== this._time && dur) {
            //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
            tTime += this._time - prevTime;
            totalTime += this._time - prevTime;
          }

          time = tTime;
          prevStart = this._start;
          timeScale = this._ts;
          prevPaused = !timeScale;

          if (crossingStart) {
            dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

            (totalTime || !suppressEvents) && (this._zTime = totalTime);
          }

          if (this._repeat) {
            //adjust the time for repeats and yoyos
            yoyo = this._yoyo;
            cycleDuration = dur + this._rDelay;

            if (this._repeat < -1 && totalTime < 0) {
              return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
            }

            time = _round$1(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

            if (tTime === tDur) {
              // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
              iteration = this._repeat;
              time = dur;
            } else {
              iteration = ~~(tTime / cycleDuration);

              if (iteration && iteration === tTime / cycleDuration) {
                time = dur;
                iteration--;
              }

              time > dur && (time = dur);
            }

            prevIteration = _animationCycle(this._tTime, cycleDuration);
            !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

            if (yoyo && iteration & 1) {
              time = dur - time;
              isYoyo = 1;
            }
            /*
            make sure children at the end/beginning of the timeline are rendered properly. If, for example,
            a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
            would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
            could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
            we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
            ensure that zero-duration tweens at the very beginning or end of the Timeline work.
            */


            if (iteration !== prevIteration && !this._lock) {
              var rewinding = yoyo && prevIteration & 1,
                  doesWrap = rewinding === (yoyo && iteration & 1);
              iteration < prevIteration && (rewinding = !rewinding);
              prevTime = rewinding ? 0 : dur;
              this._lock = 1;
              this.render(prevTime || (isYoyo ? 0 : _round$1(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
              !suppressEvents && this.parent && _callback(this, "onRepeat");
              this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

              if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
                // if prevTime is 0 and we render at the very end, _time will be the end, thus won't match. So in this edge case, prevTime won't match _time but that's okay. If it gets killed in the onRepeat, eject as well.
                return this;
              }

              dur = this._dur; // in case the duration changed in the onRepeat

              tDur = this._tDur;

              if (doesWrap) {
                this._lock = 2;
                prevTime = rewinding ? dur : -0.0001;
                this.render(prevTime, true);
              }

              this._lock = 0;

              if (!this._ts && !prevPaused) {
                return this;
              } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


              _propagateYoyoEase(this, isYoyo);
            }
          }

          if (this._hasPause && !this._forcing && this._lock < 2) {
            pauseTween = _findNextPauseTween(this, _round$1(prevTime), _round$1(time));

            if (pauseTween) {
              tTime -= time - (time = pauseTween._start);
            }
          }

          this._tTime = tTime;
          this._time = time;
          this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

          if (!this._initted) {
            this._onUpdate = this.vars.onUpdate;
            this._initted = 1;
            this._zTime = totalTime;
            prevTime = 0; // upon init, the playhead should always go forward; someone could invalidate() a completed timeline and then if they restart(), that would make child tweens render in reverse order which could lock in the wrong starting values if they build on each other, like tl.to(obj, {x: 100}).to(obj, {x: 0}).
          }

          !prevTime && time && !suppressEvents && _callback(this, "onStart");

          if (time >= prevTime && totalTime >= 0) {
            child = this._first;

            while (child) {
              next = child._next;

              if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
                if (child.parent !== this) {
                  // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                  return this.render(totalTime, suppressEvents, force);
                }

                child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

                if (time !== this._time || !this._ts && !prevPaused) {
                  //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                  pauseTween = 0;
                  next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

                  break;
                }
              }

              child = next;
            }
          } else {
            child = this._last;
            var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

            while (child) {
              next = child._prev;

              if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
                if (child.parent !== this) {
                  // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                  return this.render(totalTime, suppressEvents, force);
                }

                child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

                if (time !== this._time || !this._ts && !prevPaused) {
                  //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                  pauseTween = 0;
                  next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

                  break;
                }
              }

              child = next;
            }
          }

          if (pauseTween && !suppressEvents) {
            this.pause();
            pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

            if (this._ts) {
              //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
              this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

              _setEnd(this);

              return this.render(totalTime, suppressEvents, force);
            }
          }

          this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
          if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
              _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }

        return this;
      };

      _proto2.add = function add(child, position) {
        var _this2 = this;

        _isNumber$1(position) || (position = _parsePosition$1(this, position));

        if (!(child instanceof Animation)) {
          if (_isArray(child)) {
            child.forEach(function (obj) {
              return _this2.add(obj, position);
            });
            return this;
          }

          if (_isString$1(child)) {
            return this.addLabel(child, position);
          }

          if (_isFunction$1(child)) {
            child = Tween.delayedCall(0, child);
          } else {
            return this;
          }
        }

        return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
      };

      _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
        if (nested === void 0) {
          nested = true;
        }

        if (tweens === void 0) {
          tweens = true;
        }

        if (timelines === void 0) {
          timelines = true;
        }

        if (ignoreBeforeTime === void 0) {
          ignoreBeforeTime = -_bigNum$1;
        }

        var a = [],
            child = this._first;

        while (child) {
          if (child._start >= ignoreBeforeTime) {
            if (child instanceof Tween) {
              tweens && a.push(child);
            } else {
              timelines && a.push(child);
              nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
            }
          }

          child = child._next;
        }

        return a;
      };

      _proto2.getById = function getById(id) {
        var animations = this.getChildren(1, 1, 1),
            i = animations.length;

        while (i--) {
          if (animations[i].vars.id === id) {
            return animations[i];
          }
        }
      };

      _proto2.remove = function remove(child) {
        if (_isString$1(child)) {
          return this.removeLabel(child);
        }

        if (_isFunction$1(child)) {
          return this.killTweensOf(child);
        }

        _removeLinkedListItem(this, child);

        if (child === this._recent) {
          this._recent = this._last;
        }

        return _uncache(this);
      };

      _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
        if (!arguments.length) {
          return this._tTime;
        }

        this._forcing = 1;

        if (!this._dp && this._ts) {
          //special case for the global timeline (or any other that has no parent or detached parent).
          this._start = _round$1(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
        }

        _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

        this._forcing = 0;
        return this;
      };

      _proto2.addLabel = function addLabel(label, position) {
        this.labels[label] = _parsePosition$1(this, position);
        return this;
      };

      _proto2.removeLabel = function removeLabel(label) {
        delete this.labels[label];
        return this;
      };

      _proto2.addPause = function addPause(position, callback, params) {
        var t = Tween.delayedCall(0, callback || _emptyFunc, params);
        t.data = "isPause";
        this._hasPause = 1;
        return _addToTimeline(this, t, _parsePosition$1(this, position));
      };

      _proto2.removePause = function removePause(position) {
        var child = this._first;
        position = _parsePosition$1(this, position);

        while (child) {
          if (child._start === position && child.data === "isPause") {
            _removeFromParent(child);
          }

          child = child._next;
        }
      };

      _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
        var tweens = this.getTweensOf(targets, onlyActive),
            i = tweens.length;

        while (i--) {
          _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
        }

        return this;
      };

      _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
        var a = [],
            parsedTargets = toArray(targets),
            child = this._first,
            isGlobalTime = _isNumber$1(onlyActive),
            // a number is interpreted as a global time. If the animation spans
        children;

        while (child) {
          if (child instanceof Tween) {
            if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
              // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
              a.push(child);
            }
          } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
            a.push.apply(a, children);
          }

          child = child._next;
        }

        return a;
      } // potential future feature - targets() on timelines
      // targets() {
      // 	let result = [];
      // 	this.getChildren(true, true, false).forEach(t => result.push(...t.targets()));
      // 	return result;
      // }
      ;

      _proto2.tweenTo = function tweenTo(position, vars) {
        vars = vars || {};

        var tl = this,
            endTime = _parsePosition$1(tl, position),
            _vars = vars,
            startAt = _vars.startAt,
            _onStart = _vars.onStart,
            onStartParams = _vars.onStartParams,
            immediateRender = _vars.immediateRender,
            tween = Tween.to(tl, _setDefaults$1({
          ease: vars.ease || "none",
          lazy: false,
          immediateRender: false,
          time: endTime,
          overwrite: "auto",
          duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
          onStart: function onStart() {
            tl.pause();
            var duration = vars.duration || Math.abs((endTime - tl._time) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
          }
        }, vars));

        return immediateRender ? tween.render(0) : tween;
      };

      _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
        return this.tweenTo(toPosition, _setDefaults$1({
          startAt: {
            time: _parsePosition$1(this, fromPosition)
          }
        }, vars));
      };

      _proto2.recent = function recent() {
        return this._recent;
      };

      _proto2.nextLabel = function nextLabel(afterTime) {
        if (afterTime === void 0) {
          afterTime = this._time;
        }

        return _getLabelInDirection(this, _parsePosition$1(this, afterTime));
      };

      _proto2.previousLabel = function previousLabel(beforeTime) {
        if (beforeTime === void 0) {
          beforeTime = this._time;
        }

        return _getLabelInDirection(this, _parsePosition$1(this, beforeTime), 1);
      };

      _proto2.currentLabel = function currentLabel(value) {
        return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
      };

      _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
        if (ignoreBeforeTime === void 0) {
          ignoreBeforeTime = 0;
        }

        var child = this._first,
            labels = this.labels,
            p;

        while (child) {
          if (child._start >= ignoreBeforeTime) {
            child._start += amount;
            child._end += amount;
          }

          child = child._next;
        }

        if (adjustLabels) {
          for (p in labels) {
            if (labels[p] >= ignoreBeforeTime) {
              labels[p] += amount;
            }
          }
        }

        return _uncache(this);
      };

      _proto2.invalidate = function invalidate() {
        var child = this._first;
        this._lock = 0;

        while (child) {
          child.invalidate();
          child = child._next;
        }

        return _Animation.prototype.invalidate.call(this);
      };

      _proto2.clear = function clear(includeLabels) {
        if (includeLabels === void 0) {
          includeLabels = true;
        }

        var child = this._first,
            next;

        while (child) {
          next = child._next;
          this.remove(child);
          child = next;
        }

        this._dp && (this._time = this._tTime = this._pTime = 0);
        includeLabels && (this.labels = {});
        return _uncache(this);
      };

      _proto2.totalDuration = function totalDuration(value) {
        var max = 0,
            self = this,
            child = self._last,
            prevStart = _bigNum$1,
            prev,
            start,
            parent;

        if (arguments.length) {
          return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
        }

        if (self._dirty) {
          parent = self.parent;

          while (child) {
            prev = child._prev; //record it here in case the tween changes position in the sequence...

            child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

            start = child._start;

            if (start > prevStart && self._sort && child._ts && !self._lock) {
              //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
              self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

              _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
            } else {
              prevStart = start;
            }

            if (start < 0 && child._ts) {
              //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
              max -= start;

              if (!parent && !self._dp || parent && parent.smoothChildTiming) {
                self._start += start / self._ts;
                self._time -= start;
                self._tTime -= start;
              }

              self.shiftChildren(-start, false, -1e999);
              prevStart = 0;
            }

            child._end > max && child._ts && (max = child._end);
            child = prev;
          }

          _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

          self._dirty = 0;
        }

        return self._tDur;
      };

      Timeline.updateRoot = function updateRoot(time) {
        if (_globalTimeline._ts) {
          _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

          _lastRenderedFrame = _ticker.frame;
        }

        if (_ticker.frame >= _nextGCFrame) {
          _nextGCFrame += _config.autoSleep || 120;
          var child = _globalTimeline._first;
          if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child && !child._ts) {
              child = child._next;
            }

            child || _ticker.sleep();
          }
        }
      };

      return Timeline;
    }(Animation);

    _setDefaults$1(Timeline.prototype, {
      _lock: 0,
      _hasPause: 0,
      _forcing: 0
    });

    var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
      //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
      var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
          index = 0,
          matchIndex = 0,
          result,
          startNums,
          color,
          endNum,
          chunk,
          startNum,
          hasRandom,
          a;
      pt.b = start;
      pt.e = end;
      start += ""; //ensure values are strings

      end += "";

      if (hasRandom = ~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }

      if (stringFilter) {
        a = [start, end];
        stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

        start = a[0];
        end = a[1];
      }

      startNums = start.match(_complexStringNumExp) || [];

      while (result = _complexStringNumExp.exec(end)) {
        endNum = result[0];
        chunk = end.substring(index, result.index);

        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(") {
          color = 1;
        }

        if (endNum !== startNums[matchIndex++]) {
          startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
            m: color && color < 4 ? Math.round : 0
          };
          index = _complexStringNumExp.lastIndex;
        }
      }

      pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

      pt.fp = funcParam;

      if (_relExp.test(end) || hasRandom) {
        pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
      }

      this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

      return pt;
    },
        _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
      _isFunction$1(end) && (end = end(index || 0, target, targets));
      var currentValue = target[prop],
          parsedStart = start !== "get" ? start : !_isFunction$1(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction$1(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
          setter = !_isFunction$1(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
          pt;

      if (_isString$1(end)) {
        if (~end.indexOf("random(")) {
          end = _replaceRandom(end);
        }

        if (end.charAt(1) === "=") {
          end = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
        }
      }

      if (parsedStart !== end) {
        if (!isNaN(parsedStart * end)) {
          pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
          funcParam && (pt.fp = funcParam);
          modifier && pt.modifier(modifier, this, target);
          return this._pt = pt;
        }

        !currentValue && !(prop in target) && _missingPlugin(prop, end);
        return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
      }
    },
        //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
    _processVars = function _processVars(vars, index, target, targets, tween) {
      _isFunction$1(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

      if (!_isObject$1(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
        return _isString$1(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
      }

      var copy = {},
          p;

      for (p in vars) {
        copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
      }

      return copy;
    },
        _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
      var plugin, pt, ptLookup, i;

      if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

        if (tween !== _quickTween) {
          ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

          i = plugin._props.length;

          while (i--) {
            ptLookup[plugin._props[i]] = pt;
          }
        }
      }

      return plugin;
    },
        _overwritingTween,
        //store a reference temporarily so we can avoid overwriting itself.
    _initTween = function _initTween(tween, time) {
      var vars = tween.vars,
          ease = vars.ease,
          startAt = vars.startAt,
          immediateRender = vars.immediateRender,
          lazy = vars.lazy,
          onUpdate = vars.onUpdate,
          onUpdateParams = vars.onUpdateParams,
          callbackScope = vars.callbackScope,
          runBackwards = vars.runBackwards,
          yoyoEase = vars.yoyoEase,
          keyframes = vars.keyframes,
          autoRevert = vars.autoRevert,
          dur = tween._dur,
          prevStartAt = tween._startAt,
          targets = tween._targets,
          parent = tween.parent,
          fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
          autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites$1,
          tl = tween.timeline,
          cleanVars,
          i,
          p,
          pt,
          target,
          hasPriority,
          gsData,
          harness,
          plugin,
          ptLookup,
          index,
          harnessVars,
          overwritten;
      tl && (!keyframes || !ease) && (ease = "none");
      tween._ease = _parseEase(ease, _defaults$1.ease);
      tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults$1.ease)) : 0;

      if (yoyoEase && tween._yoyo && !tween._repeat) {
        //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
        yoyoEase = tween._yEase;
        tween._yEase = tween._ease;
        tween._ease = yoyoEase;
      }

      if (!tl) {
        //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
        harness = targets[0] ? _getCache(targets[0]).harness : 0;
        harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

        cleanVars = _copyExcluding(vars, _reservedProps);
        prevStartAt && prevStartAt.render(-1, true).kill();

        if (startAt) {
          _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults$1({
            data: "isStart",
            overwrite: false,
            parent: parent,
            immediateRender: true,
            lazy: _isNotFalse(lazy),
            startAt: null,
            delay: 0,
            onUpdate: onUpdate,
            onUpdateParams: onUpdateParams,
            callbackScope: callbackScope,
            stagger: 0
          }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


          if (immediateRender) {
            if (time > 0) {
              autoRevert || (tween._startAt = 0); //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in Timeline instances where immediateRender was false or when autoRevert is explicitly set to true.
            } else if (dur && !(time < 0 && prevStartAt)) {
              time && (tween._zTime = time);
              return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
            }
          } else if (autoRevert === false) {
            tween._startAt = 0;
          }
        } else if (runBackwards && dur) {
          //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
          if (prevStartAt) {
            !autoRevert && (tween._startAt = 0);
          } else {
            time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

            p = _setDefaults$1({
              overwrite: false,
              data: "isFromStart",
              //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
              lazy: immediateRender && _isNotFalse(lazy),
              immediateRender: immediateRender,
              //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
              stagger: 0,
              parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})

            }, cleanVars);
            harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

            _removeFromParent(tween._startAt = Tween.set(targets, p));

            if (!immediateRender) {
              _initTween(tween._startAt, _tinyNum); //ensures that the initial values are recorded

            } else if (!time) {
              return;
            }
          }
        }

        tween._pt = 0;
        lazy = dur && _isNotFalse(lazy) || lazy && !dur;

        for (i = 0; i < targets.length; i++) {
          target = targets[i];
          gsData = target._gsap || _harness(targets)[i]._gsap;
          tween._ptLookup[i] = ptLookup = {};
          _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

          index = fullTargets === targets ? i : fullTargets.indexOf(target);

          if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
            tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

            plugin._props.forEach(function (name) {
              ptLookup[name] = pt;
            });

            plugin.priority && (hasPriority = 1);
          }

          if (!harness || harnessVars) {
            for (p in cleanVars) {
              if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
                plugin.priority && (hasPriority = 1);
              } else {
                ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
              }
            }
          }

          tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

          if (autoOverwrite && tween._pt) {
            _overwritingTween = tween;

            _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0)); //Also make sure the overwriting doesn't overwrite THIS tween!!!


            overwritten = !tween.parent;
            _overwritingTween = 0;
          }

          tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
        }

        hasPriority && _sortPropTweensByPriority(tween);
        tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
      }

      tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

      tween._onUpdate = onUpdate;
      tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.
    },
        _addAliasesToVars = function _addAliasesToVars(targets, vars) {
      var harness = targets[0] ? _getCache(targets[0]).harness : 0,
          propertyAliases = harness && harness.aliases,
          copy,
          p,
          i,
          aliases;

      if (!propertyAliases) {
        return vars;
      }

      copy = _merge({}, vars);

      for (p in propertyAliases) {
        if (p in copy) {
          aliases = propertyAliases[p].split(",");
          i = aliases.length;

          while (i--) {
            copy[aliases[i]] = copy[p];
          }
        }
      }

      return copy;
    },
        _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
      return _isFunction$1(value) ? value.call(tween, i, target, targets) : _isString$1(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
    },
        _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
        _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
    /*
     * --------------------------------------------------------------------------------------
     * TWEEN
     * --------------------------------------------------------------------------------------
     */


    var Tween = /*#__PURE__*/function (_Animation2) {
      _inheritsLoose(Tween, _Animation2);

      function Tween(targets, vars, time, skipInherit) {
        var _this3;

        if (typeof vars === "number") {
          time.duration = vars;
          vars = time;
          time = null;
        }

        _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars), time) || this;
        var _this3$vars = _this3.vars,
            duration = _this3$vars.duration,
            delay = _this3$vars.delay,
            immediateRender = _this3$vars.immediateRender,
            stagger = _this3$vars.stagger,
            overwrite = _this3$vars.overwrite,
            keyframes = _this3$vars.keyframes,
            defaults = _this3$vars.defaults,
            scrollTrigger = _this3$vars.scrollTrigger,
            yoyoEase = _this3$vars.yoyoEase,
            parent = _this3.parent,
            parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber$1(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
            tl,
            i,
            copy,
            l,
            p,
            curTarget,
            staggerFunc,
            staggerVarsToMerge;
        _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
        _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

        _this3._overwrite = overwrite;

        if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
          vars = _this3.vars;
          tl = _this3.timeline = new Timeline({
            data: "nested",
            defaults: defaults || {}
          });
          tl.kill();
          tl.parent = tl._dp = _assertThisInitialized(_this3);
          tl._start = 0;

          if (keyframes) {
            _setDefaults$1(tl.vars.defaults, {
              ease: "none"
            });

            keyframes.forEach(function (frame) {
              return tl.to(parsedTargets, frame, ">");
            });
          } else {
            l = parsedTargets.length;
            staggerFunc = stagger ? distribute(stagger) : _emptyFunc;

            if (_isObject$1(stagger)) {
              //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
              for (p in stagger) {
                if (~_staggerTweenProps.indexOf(p)) {
                  staggerVarsToMerge || (staggerVarsToMerge = {});
                  staggerVarsToMerge[p] = stagger[p];
                }
              }
            }

            for (i = 0; i < l; i++) {
              copy = {};

              for (p in vars) {
                if (_staggerPropsToSkip.indexOf(p) < 0) {
                  copy[p] = vars[p];
                }
              }

              copy.stagger = 0;
              yoyoEase && (copy.yoyoEase = yoyoEase);
              staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
              curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

              copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
              copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

              if (!stagger && l === 1 && copy.delay) {
                // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
                _this3._delay = delay = copy.delay;
                _this3._start += delay;
                copy.delay = 0;
              }

              tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
            }

            tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
          }

          duration || _this3.duration(duration = tl.duration());
        } else {
          _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
        }

        if (overwrite === true && !_suppressOverwrites$1) {
          _overwritingTween = _assertThisInitialized(_this3);

          _globalTimeline.killTweensOf(parsedTargets);

          _overwritingTween = 0;
        }

        parent && _postAddChecks(parent, _assertThisInitialized(_this3));

        if (immediateRender || !duration && !keyframes && _this3._start === _round$1(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
          _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

          _this3.render(Math.max(0, -delay)); //in case delay is negative

        }

        scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
        return _this3;
      }

      var _proto3 = Tween.prototype;

      _proto3.render = function render(totalTime, suppressEvents, force) {
        var prevTime = this._time,
            tDur = this._tDur,
            dur = this._dur,
            tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
            time,
            pt,
            iteration,
            cycleDuration,
            prevIteration,
            isYoyo,
            ratio,
            timeline,
            yoyoEase;

        if (!dur) {
          _renderZeroDurationTween(this, totalTime, suppressEvents, force);
        } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== totalTime < 0) {
          //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
          time = tTime;
          timeline = this.timeline;

          if (this._repeat) {
            //adjust the time for repeats and yoyos
            cycleDuration = dur + this._rDelay;

            if (this._repeat < -1 && totalTime < 0) {
              return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
            }

            time = _round$1(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

            if (tTime === tDur) {
              // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
              iteration = this._repeat;
              time = dur;
            } else {
              iteration = ~~(tTime / cycleDuration);

              if (iteration && iteration === tTime / cycleDuration) {
                time = dur;
                iteration--;
              }

              time > dur && (time = dur);
            }

            isYoyo = this._yoyo && iteration & 1;

            if (isYoyo) {
              yoyoEase = this._yEase;
              time = dur - time;
            }

            prevIteration = _animationCycle(this._tTime, cycleDuration);

            if (time === prevTime && !force && this._initted) {
              //could be during the repeatDelay part. No need to render and fire callbacks.
              return this;
            }

            if (iteration !== prevIteration) {
              timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

              if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
                this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

                this.render(_round$1(cycleDuration * iteration), true).invalidate()._lock = 0;
              }
            }
          }

          if (!this._initted) {
            if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
              this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

              return this;
            }

            if (dur !== this._dur) {
              // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
              return this.render(totalTime, suppressEvents, force);
            }
          }

          this._tTime = tTime;
          this._time = time;

          if (!this._act && this._ts) {
            this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

            this._lazy = 0;
          }

          this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

          if (this._from) {
            this.ratio = ratio = 1 - ratio;
          }

          time && !prevTime && !suppressEvents && _callback(this, "onStart");
          pt = this._pt;

          while (pt) {
            pt.r(ratio, pt.d);
            pt = pt._next;
          }

          timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);

          if (this._onUpdate && !suppressEvents) {
            totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

            _callback(this, "onUpdate");
          }

          this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

          if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
            totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
            (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
              // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
              _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }

        return this;
      };

      _proto3.targets = function targets() {
        return this._targets;
      };

      _proto3.invalidate = function invalidate() {
        this._pt = this._op = this._startAt = this._onUpdate = this._lazy = this.ratio = 0;
        this._ptLookup = [];
        this.timeline && this.timeline.invalidate();
        return _Animation2.prototype.invalidate.call(this);
      };

      _proto3.kill = function kill(targets, vars) {
        if (vars === void 0) {
          vars = "all";
        }

        if (!targets && (!vars || vars === "all")) {
          this._lazy = this._pt = 0;
          return this.parent ? _interrupt(this) : this;
        }

        if (this.timeline) {
          var tDur = this.timeline.totalDuration();
          this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweening, interrupt.

          this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

          return this;
        }

        var parsedTargets = this._targets,
            killingTargets = targets ? toArray(targets) : parsedTargets,
            propTweenLookup = this._ptLookup,
            firstPT = this._pt,
            overwrittenProps,
            curLookup,
            curOverwriteProps,
            props,
            p,
            pt,
            i;

        if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
          vars === "all" && (this._pt = 0);
          return _interrupt(this);
        }

        overwrittenProps = this._op = this._op || [];

        if (vars !== "all") {
          //so people can pass in a comma-delimited list of property names
          if (_isString$1(vars)) {
            p = {};

            _forEachName(vars, function (name) {
              return p[name] = 1;
            });

            vars = p;
          }

          vars = _addAliasesToVars(parsedTargets, vars);
        }

        i = parsedTargets.length;

        while (i--) {
          if (~killingTargets.indexOf(parsedTargets[i])) {
            curLookup = propTweenLookup[i];

            if (vars === "all") {
              overwrittenProps[i] = vars;
              props = curLookup;
              curOverwriteProps = {};
            } else {
              curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
              props = vars;
            }

            for (p in props) {
              pt = curLookup && curLookup[p];

              if (pt) {
                if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                  _removeLinkedListItem(this, pt, "_pt");
                }

                delete curLookup[p];
              }

              if (curOverwriteProps !== "all") {
                curOverwriteProps[p] = 1;
              }
            }
          }
        }

        this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

        return this;
      };

      Tween.to = function to(targets, vars) {
        return new Tween(targets, vars, arguments[2]);
      };

      Tween.from = function from(targets, vars) {
        return new Tween(targets, _parseVars(arguments, 1));
      };

      Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
        return new Tween(callback, 0, {
          immediateRender: false,
          lazy: false,
          overwrite: false,
          delay: delay,
          onComplete: callback,
          onReverseComplete: callback,
          onCompleteParams: params,
          onReverseCompleteParams: params,
          callbackScope: scope
        });
      };

      Tween.fromTo = function fromTo(targets, fromVars, toVars) {
        return new Tween(targets, _parseVars(arguments, 2));
      };

      Tween.set = function set(targets, vars) {
        vars.duration = 0;
        vars.repeatDelay || (vars.repeat = 0);
        return new Tween(targets, vars);
      };

      Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
        return _globalTimeline.killTweensOf(targets, props, onlyActive);
      };

      return Tween;
    }(Animation);

    _setDefaults$1(Tween.prototype, {
      _targets: [],
      _lazy: 0,
      _startAt: 0,
      _op: 0,
      _onInit: 0
    }); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
    // _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
    // 	Tween.prototype[name] = function() {
    // 		let tl = new Timeline();
    // 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
    // 	}
    // });
    //for backward compatibility. Leverage the timeline calls.


    _forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
      Tween[name] = function () {
        var tl = new Timeline(),
            params = _slice.call(arguments, 0);

        params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
        return tl[name].apply(tl, params);
      };
    });
    /*
     * --------------------------------------------------------------------------------------
     * PROPTWEEN
     * --------------------------------------------------------------------------------------
     */


    var _setterPlain = function _setterPlain(target, property, value) {
      return target[property] = value;
    },
        _setterFunc = function _setterFunc(target, property, value) {
      return target[property](value);
    },
        _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
      return target[property](data.fp, value);
    },
        _setterAttribute = function _setterAttribute(target, property, value) {
      return target.setAttribute(property, value);
    },
        _getSetter = function _getSetter(target, property) {
      return _isFunction$1(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
    },
        _renderPlain = function _renderPlain(ratio, data) {
      return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000, data);
    },
        _renderBoolean = function _renderBoolean(ratio, data) {
      return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
    },
        _renderComplexString = function _renderComplexString(ratio, data) {
      var pt = data._pt,
          s = "";

      if (!ratio && data.b) {
        //b = beginning string
        s = data.b;
      } else if (ratio === 1 && data.e) {
        //e = ending string
        s = data.e;
      } else {
        while (pt) {
          s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

          pt = pt._next;
        }

        s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
      }

      data.set(data.t, data.p, s, data);
    },
        _renderPropTweens = function _renderPropTweens(ratio, data) {
      var pt = data._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    },
        _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
      var pt = this._pt,
          next;

      while (pt) {
        next = pt._next;
        pt.p === property && pt.modifier(modifier, tween, target);
        pt = next;
      }
    },
        _killPropTweensOf = function _killPropTweensOf(property) {
      var pt = this._pt,
          hasNonDependentRemaining,
          next;

      while (pt) {
        next = pt._next;

        if (pt.p === property && !pt.op || pt.op === property) {
          _removeLinkedListItem(this, pt, "_pt");
        } else if (!pt.dep) {
          hasNonDependentRemaining = 1;
        }

        pt = next;
      }

      return !hasNonDependentRemaining;
    },
        _setterWithModifier = function _setterWithModifier(target, property, value, data) {
      data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
    },
        _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
      var pt = parent._pt,
          next,
          pt2,
          first,
          last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

      while (pt) {
        next = pt._next;
        pt2 = first;

        while (pt2 && pt2.pr > pt.pr) {
          pt2 = pt2._next;
        }

        if (pt._prev = pt2 ? pt2._prev : last) {
          pt._prev._next = pt;
        } else {
          first = pt;
        }

        if (pt._next = pt2) {
          pt2._prev = pt;
        } else {
          last = pt;
        }

        pt = next;
      }

      parent._pt = first;
    }; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


    var PropTween = /*#__PURE__*/function () {
      function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
        this.t = target;
        this.s = start;
        this.c = change;
        this.p = prop;
        this.r = renderer || _renderPlain;
        this.d = data || this;
        this.set = setter || _setterPlain;
        this.pr = priority || 0;
        this._next = next;

        if (next) {
          next._prev = this;
        }
      }

      var _proto4 = PropTween.prototype;

      _proto4.modifier = function modifier(func, tween, target) {
        this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

        this.set = _setterWithModifier;
        this.m = func;
        this.mt = target; //modifier target

        this.tween = tween;
      };

      return PropTween;
    }(); //Initialization tasks

    _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
      return _reservedProps[name] = 1;
    });

    _globals.TweenMax = _globals.TweenLite = Tween;
    _globals.TimelineLite = _globals.TimelineMax = Timeline;
    _globalTimeline = new Timeline({
      sortChildren: false,
      defaults: _defaults$1,
      autoRemoveChildren: true,
      id: "root",
      smoothChildTiming: true
    });
    _config.stringFilter = _colorStringFilter;
    /*
     * --------------------------------------------------------------------------------------
     * GSAP
     * --------------------------------------------------------------------------------------
     */

    var _gsap = {
      registerPlugin: function registerPlugin() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        args.forEach(function (config) {
          return _createPlugin(config);
        });
      },
      timeline: function timeline(vars) {
        return new Timeline(vars);
      },
      getTweensOf: function getTweensOf(targets, onlyActive) {
        return _globalTimeline.getTweensOf(targets, onlyActive);
      },
      getProperty: function getProperty(target, property, unit, uncache) {
        _isString$1(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

        var getter = _getCache(target || {}).get,
            format = unit ? _passThrough$1 : _numericIfPossible;

        unit === "native" && (unit = "");
        return !target ? target : !property ? function (property, unit, uncache) {
          return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
        } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
      },
      quickSetter: function quickSetter(target, property, unit) {
        target = toArray(target);

        if (target.length > 1) {
          var setters = target.map(function (t) {
            return gsap$2.quickSetter(t, property, unit);
          }),
              l = setters.length;
          return function (value) {
            var i = l;

            while (i--) {
              setters[i](value);
            }
          };
        }

        target = target[0] || {};

        var Plugin = _plugins[property],
            cache = _getCache(target),
            p = cache.harness && (cache.harness.aliases || {})[property] || property,
            // in case it's an alias, like "rotate" for "rotation".
        setter = Plugin ? function (value) {
          var p = new Plugin();
          _quickTween._pt = 0;
          p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
          p.render(1, p);
          _quickTween._pt && _renderPropTweens(1, _quickTween);
        } : cache.set(target, p);

        return Plugin ? setter : function (value) {
          return setter(target, p, unit ? value + unit : value, cache, 1);
        };
      },
      isTweening: function isTweening(targets) {
        return _globalTimeline.getTweensOf(targets, true).length > 0;
      },
      defaults: function defaults(value) {
        value && value.ease && (value.ease = _parseEase(value.ease, _defaults$1.ease));
        return _mergeDeep(_defaults$1, value || {});
      },
      config: function config(value) {
        return _mergeDeep(_config, value || {});
      },
      registerEffect: function registerEffect(_ref2) {
        var name = _ref2.name,
            effect = _ref2.effect,
            plugins = _ref2.plugins,
            defaults = _ref2.defaults,
            extendTimeline = _ref2.extendTimeline;
        (plugins || "").split(",").forEach(function (pluginName) {
          return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
        });

        _effects[name] = function (targets, vars, tl) {
          return effect(toArray(targets), _setDefaults$1(vars || {}, defaults), tl);
        };

        if (extendTimeline) {
          Timeline.prototype[name] = function (targets, vars, position) {
            return this.add(_effects[name](targets, _isObject$1(vars) ? vars : (position = vars) && {}, this), position);
          };
        }
      },
      registerEase: function registerEase(name, ease) {
        _easeMap[name] = _parseEase(ease);
      },
      parseEase: function parseEase(ease, defaultEase) {
        return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
      },
      getById: function getById(id) {
        return _globalTimeline.getById(id);
      },
      exportRoot: function exportRoot(vars, includeDelayedCalls) {
        if (vars === void 0) {
          vars = {};
        }

        var tl = new Timeline(vars),
            child,
            next;
        tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

        _globalTimeline.remove(tl);

        tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

        tl._time = tl._tTime = _globalTimeline._time;
        child = _globalTimeline._first;

        while (child) {
          next = child._next;

          if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
            _addToTimeline(tl, child, child._start - child._delay);
          }

          child = next;
        }

        _addToTimeline(_globalTimeline, tl, 0);

        return tl;
      },
      utils: {
        wrap: wrap,
        wrapYoyo: wrapYoyo,
        distribute: distribute,
        random: random,
        snap: snap,
        normalize: normalize$1,
        getUnit: getUnit,
        clamp: clamp$1,
        splitColor: splitColor,
        toArray: toArray,
        mapRange: mapRange,
        pipe: pipe,
        unitize: unitize,
        interpolate: interpolate,
        shuffle: shuffle
      },
      install: _install,
      effects: _effects,
      ticker: _ticker,
      updateRoot: Timeline.updateRoot,
      plugins: _plugins,
      globalTimeline: _globalTimeline,
      core: {
        PropTween: PropTween,
        globals: _addGlobal,
        Tween: Tween,
        Timeline: Timeline,
        Animation: Animation,
        getCache: _getCache,
        _removeLinkedListItem: _removeLinkedListItem,
        suppressOverwrites: function suppressOverwrites(value) {
          return _suppressOverwrites$1 = value;
        }
      }
    };

    _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
      return _gsap[name] = Tween[name];
    });

    _ticker.add(Timeline.updateRoot);

    _quickTween = _gsap.to({}, {
      duration: 0
    }); // ---- EXTRA PLUGINS --------------------------------------------------------

    var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
      var pt = plugin._pt;

      while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
        pt = pt._next;
      }

      return pt;
    },
        _addModifiers = function _addModifiers(tween, modifiers) {
      var targets = tween._targets,
          p,
          i,
          pt;

      for (p in modifiers) {
        i = targets.length;

        while (i--) {
          pt = tween._ptLookup[i][p];

          if (pt && (pt = pt.d)) {
            if (pt._pt) {
              // is a plugin
              pt = _getPluginPropTween(pt, p);
            }

            pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
          }
        }
      }
    },
        _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
      return {
        name: name,
        rawVars: 1,
        //don't pre-process function-based values or "random()" strings.
        init: function init(target, vars, tween) {
          tween._onInit = function (tween) {
            var temp, p;

            if (_isString$1(vars)) {
              temp = {};

              _forEachName(vars, function (name) {
                return temp[name] = 1;
              }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


              vars = temp;
            }

            if (modifier) {
              temp = {};

              for (p in vars) {
                temp[p] = modifier(vars[p]);
              }

              vars = temp;
            }

            _addModifiers(tween, vars);
          };
        }
      };
    }; //register core plugins


    var gsap$2 = _gsap.registerPlugin({
      name: "attr",
      init: function init(target, vars, tween, index, targets) {
        var p, pt;

        for (p in vars) {
          pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
          pt && (pt.op = p);

          this._props.push(p);
        }
      }
    }, {
      name: "endArray",
      init: function init(target, value) {
        var i = value.length;

        while (i--) {
          this.add(target, i, target[i] || 0, value[i]);
        }
      }
    }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

    Tween.version = Timeline.version = gsap$2.version = "3.6.1";
    _coreReady = 1;

    if (_windowExists$2()) {
      _wake();
    }

    /*!
     * CSSPlugin 3.6.1
     * https://greensock.com
     *
     * Copyright 2008-2021, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    var _win$1,
        _doc$1,
        _docElement,
        _pluginInitted,
        _tempDiv$1,
        _recentSetterPlugin,
        _windowExists$1 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _transformProps = {},
        _RAD2DEG = 180 / Math.PI,
        _DEG2RAD = Math.PI / 180,
        _atan2 = Math.atan2,
        _bigNum = 1e8,
        _capsExp$1 = /([A-Z])/g,
        _horizontalExp = /(?:left|right|width|margin|padding|x)/i,
        _complexExp = /[\s,\(]\S/,
        _propertyAliases = {
      autoAlpha: "opacity,visibility",
      scale: "scaleX,scaleY",
      alpha: "opacity"
    },
        _renderCSSProp = function _renderCSSProp(ratio, data) {
      return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
    },
        _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
      return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
    },
        _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
      return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
    },
        //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
    _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
      var value = data.s + data.c * ratio;
      data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
    },
        _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
      return data.set(data.t, data.p, ratio ? data.e : data.b, data);
    },
        _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
      return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
    },
        _setterCSSStyle = function _setterCSSStyle(target, property, value) {
      return target.style[property] = value;
    },
        _setterCSSProp = function _setterCSSProp(target, property, value) {
      return target.style.setProperty(property, value);
    },
        _setterTransform = function _setterTransform(target, property, value) {
      return target._gsap[property] = value;
    },
        _setterScale = function _setterScale(target, property, value) {
      return target._gsap.scaleX = target._gsap.scaleY = value;
    },
        _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
      var cache = target._gsap;
      cache.scaleX = cache.scaleY = value;
      cache.renderTransform(ratio, cache);
    },
        _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
      var cache = target._gsap;
      cache[property] = value;
      cache.renderTransform(ratio, cache);
    },
        _transformProp$1 = "transform",
        _transformOriginProp = _transformProp$1 + "Origin",
        _supports3D,
        _createElement = function _createElement(type, ns) {
      var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

      return e.style ? e : _doc$1.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
    },
        _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
      var cs = getComputedStyle(target);
      return cs[property] || cs.getPropertyValue(property.replace(_capsExp$1, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
    },
        _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
        _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
      var e = element || _tempDiv$1,
          s = e.style,
          i = 5;

      if (property in s && !preferPrefix) {
        return property;
      }

      property = property.charAt(0).toUpperCase() + property.substr(1);

      while (i-- && !(_prefixes[i] + property in s)) {}

      return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
    },
        _initCore = function _initCore() {
      if (_windowExists$1() && window.document) {
        _win$1 = window;
        _doc$1 = _win$1.document;
        _docElement = _doc$1.documentElement;
        _tempDiv$1 = _createElement("div") || {
          style: {}
        };
        _createElement("div");
        _transformProp$1 = _checkPropPrefix(_transformProp$1);
        _transformOriginProp = _transformProp$1 + "Origin";
        _tempDiv$1.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

        _supports3D = !!_checkPropPrefix("perspective");
        _pluginInitted = 1;
      }
    },
        _getBBoxHack = function _getBBoxHack(swapIfPossible) {
      //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
      var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
          oldParent = this.parentNode,
          oldSibling = this.nextSibling,
          oldCSS = this.style.cssText,
          bbox;

      _docElement.appendChild(svg);

      svg.appendChild(this);
      this.style.display = "block";

      if (swapIfPossible) {
        try {
          bbox = this.getBBox();
          this._gsapBBox = this.getBBox; //store the original

          this.getBBox = _getBBoxHack;
        } catch (e) {}
      } else if (this._gsapBBox) {
        bbox = this._gsapBBox();
      }

      if (oldParent) {
        if (oldSibling) {
          oldParent.insertBefore(this, oldSibling);
        } else {
          oldParent.appendChild(this);
        }
      }

      _docElement.removeChild(svg);

      this.style.cssText = oldCSS;
      return bbox;
    },
        _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
      var i = attributesArray.length;

      while (i--) {
        if (target.hasAttribute(attributesArray[i])) {
          return target.getAttribute(attributesArray[i]);
        }
      }
    },
        _getBBox = function _getBBox(target) {
      var bounds;

      try {
        bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
      } catch (error) {
        bounds = _getBBoxHack.call(target, true);
      }

      bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

      return bounds && !bounds.width && !bounds.x && !bounds.y ? {
        x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
        y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
        width: 0,
        height: 0
      } : bounds;
    },
        _isSVG = function _isSVG(e) {
      return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
    },
        //reports if the element is an SVG on which getBBox() actually works
    _removeProperty = function _removeProperty(target, property) {
      if (property) {
        var style = target.style;

        if (property in _transformProps && property !== _transformOriginProp) {
          property = _transformProp$1;
        }

        if (style.removeProperty) {
          if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
            //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
            property = "-" + property;
          }

          style.removeProperty(property.replace(_capsExp$1, "-$1").toLowerCase());
        } else {
          //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
          style.removeAttribute(property);
        }
      }
    },
        _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
      var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
      plugin._pt = pt;
      pt.b = beginning;
      pt.e = end;

      plugin._props.push(property);

      return pt;
    },
        _nonConvertibleUnits = {
      deg: 1,
      rad: 1,
      turn: 1
    },
        //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
    _convertToUnit = function _convertToUnit(target, property, value, unit) {
      var curValue = parseFloat(value) || 0,
          curUnit = (value + "").trim().substr((curValue + "").length) || "px",
          // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
      style = _tempDiv$1.style,
          horizontal = _horizontalExp.test(property),
          isRootSVG = target.tagName.toLowerCase() === "svg",
          measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
          amount = 100,
          toPixels = unit === "px",
          toPercent = unit === "%",
          px,
          parent,
          cache,
          isSVG;

      if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
        return curValue;
      }

      curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
      isSVG = target.getCTM && _isSVG(target);

      if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
        px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
        return _round$1(toPercent ? curValue / px * amount : curValue / 100 * px);
      }

      style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
      parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

      if (isSVG) {
        parent = (target.ownerSVGElement || {}).parentNode;
      }

      if (!parent || parent === _doc$1 || !parent.appendChild) {
        parent = _doc$1.body;
      }

      cache = parent._gsap;

      if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
        return _round$1(curValue / cache.width * amount);
      } else {
        (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
        parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

        parent.appendChild(_tempDiv$1);
        px = _tempDiv$1[measureProperty];
        parent.removeChild(_tempDiv$1);
        style.position = "absolute";

        if (horizontal && toPercent) {
          cache = _getCache(parent);
          cache.time = _ticker.time;
          cache.width = parent[measureProperty];
        }
      }

      return _round$1(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
    },
        _get = function _get(target, property, unit, uncache) {
      var value;
      _pluginInitted || _initCore();

      if (property in _propertyAliases && property !== "transform") {
        property = _propertyAliases[property];

        if (~property.indexOf(",")) {
          property = property.split(",")[0];
        }
      }

      if (_transformProps[property] && property !== "transform") {
        value = _parseTransform(target, uncache);
        value = property !== "transformOrigin" ? value[property] : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
      } else {
        value = target.style[property];

        if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
          value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
        }
      }

      return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
    },
        _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
      //note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
      if (!start || start === "none") {
        // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
        var p = _checkPropPrefix(prop, target, 1),
            s = p && _getComputedProperty(target, p, 1);

        if (s && s !== start) {
          prop = p;
          start = s;
        } else if (prop === "borderColor") {
          start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
        }
      }

      var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
          index = 0,
          matchIndex = 0,
          a,
          result,
          startValues,
          startNum,
          color,
          startValue,
          endValue,
          endNum,
          chunk,
          endUnit,
          startUnit,
          relative,
          endValues;
      pt.b = start;
      pt.e = end;
      start += ""; //ensure values are strings

      end += "";

      if (end === "auto") {
        target.style[prop] = end;
        end = _getComputedProperty(target, prop) || end;
        target.style[prop] = start;
      }

      a = [start, end];

      _colorStringFilter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().


      start = a[0];
      end = a[1];
      startValues = start.match(_numWithUnitExp) || [];
      endValues = end.match(_numWithUnitExp) || [];

      if (endValues.length) {
        while (result = _numWithUnitExp.exec(end)) {
          endValue = result[0];
          chunk = end.substring(index, result.index);

          if (color) {
            color = (color + 1) % 5;
          } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
            color = 1;
          }

          if (endValue !== (startValue = startValues[matchIndex++] || "")) {
            startNum = parseFloat(startValue) || 0;
            startUnit = startValue.substr((startNum + "").length);
            relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

            if (relative) {
              endValue = endValue.substr(2);
            }

            endNum = parseFloat(endValue);
            endUnit = endValue.substr((endNum + "").length);
            index = _numWithUnitExp.lastIndex - endUnit.length;

            if (!endUnit) {
              //if something like "perspective:300" is passed in and we must add a unit to the end
              endUnit = endUnit || _config.units[prop] || startUnit;

              if (index === end.length) {
                end += endUnit;
                pt.e += endUnit;
              }
            }

            if (startUnit !== endUnit) {
              startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
            } //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


            pt._pt = {
              _next: pt._pt,
              p: chunk || matchIndex === 1 ? chunk : ",",
              //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
              s: startNum,
              c: relative ? relative * endNum : endNum - startNum,
              m: color && color < 4 || prop === "zIndex" ? Math.round : 0
            };
          }
        }

        pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
      } else {
        pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
      }

      _relExp.test(end) && (pt.e = 0); //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).

      this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

      return pt;
    },
        _keywordToPercent = {
      top: "0%",
      bottom: "100%",
      left: "0%",
      right: "100%",
      center: "50%"
    },
        _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
      var split = value.split(" "),
          x = split[0],
          y = split[1] || "50%";

      if (x === "top" || x === "bottom" || y === "left" || y === "right") {
        //the user provided them in the wrong order, so flip them
        value = x;
        x = y;
        y = value;
      }

      split[0] = _keywordToPercent[x] || x;
      split[1] = _keywordToPercent[y] || y;
      return split.join(" ");
    },
        _renderClearProps = function _renderClearProps(ratio, data) {
      if (data.tween && data.tween._time === data.tween._dur) {
        var target = data.t,
            style = target.style,
            props = data.u,
            cache = target._gsap,
            prop,
            clearTransforms,
            i;

        if (props === "all" || props === true) {
          style.cssText = "";
          clearTransforms = 1;
        } else {
          props = props.split(",");
          i = props.length;

          while (--i > -1) {
            prop = props[i];

            if (_transformProps[prop]) {
              clearTransforms = 1;
              prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp$1;
            }

            _removeProperty(target, prop);
          }
        }

        if (clearTransforms) {
          _removeProperty(target, _transformProp$1);

          if (cache) {
            cache.svg && target.removeAttribute("transform");

            _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


            cache.uncache = 1;
          }
        }
      }
    },
        // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
    _specialProps = {
      clearProps: function clearProps(plugin, target, property, endValue, tween) {
        if (tween.data !== "isFromStart") {
          var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
          pt.u = endValue;
          pt.pr = -10;
          pt.tween = tween;

          plugin._props.push(property);

          return 1;
        }
      }
      /* className feature (about 0.4kb gzipped).
      , className(plugin, target, property, endValue, tween) {
      	let _renderClassName = (ratio, data) => {
      			data.css.render(ratio, data.css);
      			if (!ratio || ratio === 1) {
      				let inline = data.rmv,
      					target = data.t,
      					p;
      				target.setAttribute("class", ratio ? data.e : data.b);
      				for (p in inline) {
      					_removeProperty(target, p);
      				}
      			}
      		},
      		_getAllStyles = (target) => {
      			let styles = {},
      				computed = getComputedStyle(target),
      				p;
      			for (p in computed) {
      				if (isNaN(p) && p !== "cssText" && p !== "length") {
      					styles[p] = computed[p];
      				}
      			}
      			_setDefaults(styles, _parseTransform(target, 1));
      			return styles;
      		},
      		startClassList = target.getAttribute("class"),
      		style = target.style,
      		cssText = style.cssText,
      		cache = target._gsap,
      		classPT = cache.classPT,
      		inlineToRemoveAtEnd = {},
      		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
      		changingVars = {},
      		startVars = _getAllStyles(target),
      		transformRelated = /(transform|perspective)/i,
      		endVars, p;
      	if (classPT) {
      		classPT.r(1, classPT.d);
      		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
      	}
      	target.setAttribute("class", data.e);
      	endVars = _getAllStyles(target, true);
      	target.setAttribute("class", startClassList);
      	for (p in endVars) {
      		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
      			changingVars[p] = endVars[p];
      			if (!style[p] && style[p] !== "0") {
      				inlineToRemoveAtEnd[p] = 1;
      			}
      		}
      	}
      	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
      	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
      		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
      	}
      	_parseTransform(target, true); //to clear the caching of transforms
      	data.css = new gsap.plugins.css();
      	data.css.init(target, changingVars, tween);
      	plugin._props.push(...data.css._props);
      	return 1;
      }
      */

    },

    /*
     * --------------------------------------------------------------------------------------
     * TRANSFORMS
     * --------------------------------------------------------------------------------------
     */
    _identity2DMatrix = [1, 0, 0, 1, 0, 0],
        _rotationalProperties = {},
        _isNullTransform = function _isNullTransform(value) {
      return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
    },
        _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
      var matrixString = _getComputedProperty(target, _transformProp$1);

      return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round$1);
    },
        _getMatrix = function _getMatrix(target, force2D) {
      var cache = target._gsap || _getCache(target),
          style = target.style,
          matrix = _getComputedTransformMatrixAsArray(target),
          parent,
          nextSibling,
          temp,
          addedToDOM;

      if (cache.svg && target.getAttribute("transform")) {
        temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

        matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
        return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
      } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
        //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
        temp = style.display;
        style.display = "block";
        parent = target.parentNode;

        if (!parent || !target.offsetParent) {
          // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
          addedToDOM = 1; //flag

          nextSibling = target.nextSibling;

          _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

        }

        matrix = _getComputedTransformMatrixAsArray(target);
        temp ? style.display = temp : _removeProperty(target, "display");

        if (addedToDOM) {
          nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
        }
      }

      return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
    },
        _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
      var cache = target._gsap,
          matrix = matrixArray || _getMatrix(target, true),
          xOriginOld = cache.xOrigin || 0,
          yOriginOld = cache.yOrigin || 0,
          xOffsetOld = cache.xOffset || 0,
          yOffsetOld = cache.yOffset || 0,
          a = matrix[0],
          b = matrix[1],
          c = matrix[2],
          d = matrix[3],
          tx = matrix[4],
          ty = matrix[5],
          originSplit = origin.split(" "),
          xOrigin = parseFloat(originSplit[0]) || 0,
          yOrigin = parseFloat(originSplit[1]) || 0,
          bounds,
          determinant,
          x,
          y;

      if (!originIsAbsolute) {
        bounds = _getBBox(target);
        xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
        yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
      } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
        //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
        x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
        y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
        xOrigin = x;
        yOrigin = y;
      }

      if (smooth || smooth !== false && cache.smooth) {
        tx = xOrigin - xOriginOld;
        ty = yOrigin - yOriginOld;
        cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
        cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
      } else {
        cache.xOffset = cache.yOffset = 0;
      }

      cache.xOrigin = xOrigin;
      cache.yOrigin = yOrigin;
      cache.smooth = !!smooth;
      cache.origin = origin;
      cache.originIsAbsolute = !!originIsAbsolute;
      target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

      if (pluginToAddPropTweensTo) {
        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
      }

      target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
    },
        _parseTransform = function _parseTransform(target, uncache) {
      var cache = target._gsap || new GSCache(target);

      if ("x" in cache && !uncache && !cache.uncache) {
        return cache;
      }

      var style = target.style,
          invertedScaleX = cache.scaleX < 0,
          px = "px",
          deg = "deg",
          origin = _getComputedProperty(target, _transformOriginProp) || "0",
          x,
          y,
          z,
          scaleX,
          scaleY,
          rotation,
          rotationX,
          rotationY,
          skewX,
          skewY,
          perspective,
          xOrigin,
          yOrigin,
          matrix,
          angle,
          cos,
          sin,
          a,
          b,
          c,
          d,
          a12,
          a22,
          t1,
          t2,
          t3,
          a13,
          a23,
          a33,
          a42,
          a43,
          a32;
      x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
      scaleX = scaleY = 1;
      cache.svg = !!(target.getCTM && _isSVG(target));
      matrix = _getMatrix(target, cache.svg);

      if (cache.svg) {
        t1 = !cache.uncache && !uncache && target.getAttribute("data-svg-origin");

        _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
      }

      xOrigin = cache.xOrigin || 0;
      yOrigin = cache.yOrigin || 0;

      if (matrix !== _identity2DMatrix) {
        a = matrix[0]; //a11

        b = matrix[1]; //a21

        c = matrix[2]; //a31

        d = matrix[3]; //a41

        x = a12 = matrix[4];
        y = a22 = matrix[5]; //2D matrix

        if (matrix.length === 6) {
          scaleX = Math.sqrt(a * a + b * b);
          scaleY = Math.sqrt(d * d + c * c);
          rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

          skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
          skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));

          if (cache.svg) {
            x -= xOrigin - (xOrigin * a + yOrigin * c);
            y -= yOrigin - (xOrigin * b + yOrigin * d);
          } //3D matrix

        } else {
          a32 = matrix[6];
          a42 = matrix[7];
          a13 = matrix[8];
          a23 = matrix[9];
          a33 = matrix[10];
          a43 = matrix[11];
          x = matrix[12];
          y = matrix[13];
          z = matrix[14];
          angle = _atan2(a32, a33);
          rotationX = angle * _RAD2DEG; //rotationX

          if (angle) {
            cos = Math.cos(-angle);
            sin = Math.sin(-angle);
            t1 = a12 * cos + a13 * sin;
            t2 = a22 * cos + a23 * sin;
            t3 = a32 * cos + a33 * sin;
            a13 = a12 * -sin + a13 * cos;
            a23 = a22 * -sin + a23 * cos;
            a33 = a32 * -sin + a33 * cos;
            a43 = a42 * -sin + a43 * cos;
            a12 = t1;
            a22 = t2;
            a32 = t3;
          } //rotationY


          angle = _atan2(-c, a33);
          rotationY = angle * _RAD2DEG;

          if (angle) {
            cos = Math.cos(-angle);
            sin = Math.sin(-angle);
            t1 = a * cos - a13 * sin;
            t2 = b * cos - a23 * sin;
            t3 = c * cos - a33 * sin;
            a43 = d * sin + a43 * cos;
            a = t1;
            b = t2;
            c = t3;
          } //rotationZ


          angle = _atan2(b, a);
          rotation = angle * _RAD2DEG;

          if (angle) {
            cos = Math.cos(angle);
            sin = Math.sin(angle);
            t1 = a * cos + b * sin;
            t2 = a12 * cos + a22 * sin;
            b = b * cos - a * sin;
            a22 = a22 * cos - a12 * sin;
            a = t1;
            a12 = t2;
          }

          if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
            //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
            rotationX = rotation = 0;
            rotationY = 180 - rotationY;
          }

          scaleX = _round$1(Math.sqrt(a * a + b * b + c * c));
          scaleY = _round$1(Math.sqrt(a22 * a22 + a32 * a32));
          angle = _atan2(a12, a22);
          skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
          perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
        }

        if (cache.svg) {
          //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
          t1 = target.getAttribute("transform");
          cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp$1));
          t1 && target.setAttribute("transform", t1);
        }
      }

      if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
        if (invertedScaleX) {
          scaleX *= -1;
          skewX += rotation <= 0 ? 180 : -180;
          rotation += rotation <= 0 ? 180 : -180;
        } else {
          scaleY *= -1;
          skewX += skewX <= 0 ? 180 : -180;
        }
      }

      cache.x = x - ((cache.xPercent = x && (cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
      cache.y = y - ((cache.yPercent = y && (cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
      cache.z = z + px;
      cache.scaleX = _round$1(scaleX);
      cache.scaleY = _round$1(scaleY);
      cache.rotation = _round$1(rotation) + deg;
      cache.rotationX = _round$1(rotationX) + deg;
      cache.rotationY = _round$1(rotationY) + deg;
      cache.skewX = skewX + deg;
      cache.skewY = skewY + deg;
      cache.transformPerspective = perspective + px;

      if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
        style[_transformOriginProp] = _firstTwoOnly(origin);
      }

      cache.xOffset = cache.yOffset = 0;
      cache.force3D = _config.force3D;
      cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
      cache.uncache = 0;
      return cache;
    },
        _firstTwoOnly = function _firstTwoOnly(value) {
      return (value = value.split(" "))[0] + " " + value[1];
    },
        //for handling transformOrigin values, stripping out the 3rd dimension
    _addPxTranslate = function _addPxTranslate(target, start, value) {
      var unit = getUnit(start);
      return _round$1(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
    },
        _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
      cache.z = "0px";
      cache.rotationY = cache.rotationX = "0deg";
      cache.force3D = 0;

      _renderCSSTransforms(ratio, cache);
    },
        _zeroDeg = "0deg",
        _zeroPx = "0px",
        _endParenthesis = ") ",
        _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
      var _ref = cache || this,
          xPercent = _ref.xPercent,
          yPercent = _ref.yPercent,
          x = _ref.x,
          y = _ref.y,
          z = _ref.z,
          rotation = _ref.rotation,
          rotationY = _ref.rotationY,
          rotationX = _ref.rotationX,
          skewX = _ref.skewX,
          skewY = _ref.skewY,
          scaleX = _ref.scaleX,
          scaleY = _ref.scaleY,
          transformPerspective = _ref.transformPerspective,
          force3D = _ref.force3D,
          target = _ref.target,
          zOrigin = _ref.zOrigin,
          transforms = "",
          use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


      if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
        var angle = parseFloat(rotationY) * _DEG2RAD,
            a13 = Math.sin(angle),
            a33 = Math.cos(angle),
            cos;

        angle = parseFloat(rotationX) * _DEG2RAD;
        cos = Math.cos(angle);
        x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
        y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
        z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
      }

      if (transformPerspective !== _zeroPx) {
        transforms += "perspective(" + transformPerspective + _endParenthesis;
      }

      if (xPercent || yPercent) {
        transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
      }

      if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
        transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
      }

      if (rotation !== _zeroDeg) {
        transforms += "rotate(" + rotation + _endParenthesis;
      }

      if (rotationY !== _zeroDeg) {
        transforms += "rotateY(" + rotationY + _endParenthesis;
      }

      if (rotationX !== _zeroDeg) {
        transforms += "rotateX(" + rotationX + _endParenthesis;
      }

      if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
        transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
      }

      if (scaleX !== 1 || scaleY !== 1) {
        transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
      }

      target.style[_transformProp$1] = transforms || "translate(0, 0)";
    },
        _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
      var _ref2 = cache || this,
          xPercent = _ref2.xPercent,
          yPercent = _ref2.yPercent,
          x = _ref2.x,
          y = _ref2.y,
          rotation = _ref2.rotation,
          skewX = _ref2.skewX,
          skewY = _ref2.skewY,
          scaleX = _ref2.scaleX,
          scaleY = _ref2.scaleY,
          target = _ref2.target,
          xOrigin = _ref2.xOrigin,
          yOrigin = _ref2.yOrigin,
          xOffset = _ref2.xOffset,
          yOffset = _ref2.yOffset,
          forceCSS = _ref2.forceCSS,
          tx = parseFloat(x),
          ty = parseFloat(y),
          a11,
          a21,
          a12,
          a22,
          temp;

      rotation = parseFloat(rotation);
      skewX = parseFloat(skewX);
      skewY = parseFloat(skewY);

      if (skewY) {
        //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
        skewY = parseFloat(skewY);
        skewX += skewY;
        rotation += skewY;
      }

      if (rotation || skewX) {
        rotation *= _DEG2RAD;
        skewX *= _DEG2RAD;
        a11 = Math.cos(rotation) * scaleX;
        a21 = Math.sin(rotation) * scaleX;
        a12 = Math.sin(rotation - skewX) * -scaleY;
        a22 = Math.cos(rotation - skewX) * scaleY;

        if (skewX) {
          skewY *= _DEG2RAD;
          temp = Math.tan(skewX - skewY);
          temp = Math.sqrt(1 + temp * temp);
          a12 *= temp;
          a22 *= temp;

          if (skewY) {
            temp = Math.tan(skewY);
            temp = Math.sqrt(1 + temp * temp);
            a11 *= temp;
            a21 *= temp;
          }
        }

        a11 = _round$1(a11);
        a21 = _round$1(a21);
        a12 = _round$1(a12);
        a22 = _round$1(a22);
      } else {
        a11 = scaleX;
        a22 = scaleY;
        a21 = a12 = 0;
      }

      if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
        tx = _convertToUnit(target, "x", x, "px");
        ty = _convertToUnit(target, "y", y, "px");
      }

      if (xOrigin || yOrigin || xOffset || yOffset) {
        tx = _round$1(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
        ty = _round$1(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
      }

      if (xPercent || yPercent) {
        //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
        temp = target.getBBox();
        tx = _round$1(tx + xPercent / 100 * temp.width);
        ty = _round$1(ty + yPercent / 100 * temp.height);
      }

      temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
      target.setAttribute("transform", temp);
      forceCSS && (target.style[_transformProp$1] = temp); //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the  transform attribute changes!)
    },
        _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue, relative) {
      var cap = 360,
          isString = _isString$1(endValue),
          endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
          change = relative ? endNum * relative : endNum - startNum,
          finalValue = startNum + change + "deg",
          direction,
          pt;

      if (isString) {
        direction = endValue.split("_")[1];

        if (direction === "short") {
          change %= cap;

          if (change !== change % (cap / 2)) {
            change += change < 0 ? cap : -cap;
          }
        }

        if (direction === "cw" && change < 0) {
          change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
        } else if (direction === "ccw" && change > 0) {
          change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
        }
      }

      plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
      pt.e = finalValue;
      pt.u = "deg";

      plugin._props.push(property);

      return pt;
    },
        _assign = function _assign(target, source) {
      // Internet Explorer doesn't have Object.assign(), so we recreate it here.
      for (var p in source) {
        target[p] = source[p];
      }

      return target;
    },
        _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
      //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
      var startCache = _assign({}, target._gsap),
          exclude = "perspective,force3D,transformOrigin,svgOrigin",
          style = target.style,
          endCache,
          p,
          startValue,
          endValue,
          startNum,
          endNum,
          startUnit,
          endUnit;

      if (startCache.svg) {
        startValue = target.getAttribute("transform");
        target.setAttribute("transform", "");
        style[_transformProp$1] = transforms;
        endCache = _parseTransform(target, 1);

        _removeProperty(target, _transformProp$1);

        target.setAttribute("transform", startValue);
      } else {
        startValue = getComputedStyle(target)[_transformProp$1];
        style[_transformProp$1] = transforms;
        endCache = _parseTransform(target, 1);
        style[_transformProp$1] = startValue;
      }

      for (p in _transformProps) {
        startValue = startCache[p];
        endValue = endCache[p];

        if (startValue !== endValue && exclude.indexOf(p) < 0) {
          //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
          startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
          endNum = parseFloat(endValue);
          plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
          plugin._pt.u = endUnit || 0;

          plugin._props.push(p);
        }
      }

      _assign(endCache, startCache);
    }; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


    _forEachName("padding,margin,Width,Radius", function (name, index) {
      var t = "Top",
          r = "Right",
          b = "Bottom",
          l = "Left",
          props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
        return index < 2 ? name + side : "border" + side + name;
      });

      _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
        var a, vars;

        if (arguments.length < 4) {
          // getter, passed target, property, and unit (from _get())
          a = props.map(function (prop) {
            return _get(plugin, prop, property);
          });
          vars = a.join(" ");
          return vars.split(a[0]).length === 5 ? a[0] : vars;
        }

        a = (endValue + "").split(" ");
        vars = {};
        props.forEach(function (prop, i) {
          return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
        });
        plugin.init(target, vars, tween);
      };
    });

    var CSSPlugin = {
      name: "css",
      register: _initCore,
      targetTest: function targetTest(target) {
        return target.style && target.nodeType;
      },
      init: function init(target, vars, tween, index, targets) {
        var props = this._props,
            style = target.style,
            startAt = tween.vars.startAt,
            startValue,
            endValue,
            endNum,
            startNum,
            type,
            specialProp,
            p,
            startUnit,
            endUnit,
            relative,
            isTransformRelated,
            transformPropTween,
            cache,
            smooth,
            hasPriority;
        _pluginInitted || _initCore();

        for (p in vars) {
          if (p === "autoRound") {
            continue;
          }

          endValue = vars[p];

          if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
            // plugins
            continue;
          }

          type = typeof endValue;
          specialProp = _specialProps[p];

          if (type === "function") {
            endValue = endValue.call(tween, index, target, targets);
            type = typeof endValue;
          }

          if (type === "string" && ~endValue.indexOf("random(")) {
            endValue = _replaceRandom(endValue);
          }

          if (specialProp) {
            specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
          } else if (p.substr(0, 2) === "--") {
            //CSS variable
            startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
            endValue += "";
            _colorExp.lastIndex = 0;

            if (!_colorExp.test(startValue)) {
              // colors don't have units
              startUnit = getUnit(startValue);
              endUnit = getUnit(endValue);
            }

            endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
            this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
          } else if (type !== "undefined") {
            if (startAt && p in startAt) {
              // in case someone hard-codes a complex value as the start, like top: "calc(2vh / 2)". Without this, it'd use the computed value (always in px)
              startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
              p in _config.units && !getUnit(startValue) && (startValue += _config.units[p]); // for cases when someone passes in a unitless value like {x: 100}; if we try setting translate(100, 0px) it won't work.

              (startValue + "").charAt(1) === "=" && (startValue = _get(target, p)); // can't work with relative values
            } else {
              startValue = _get(target, p);
            }

            startNum = parseFloat(startValue);
            relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;
            relative && (endValue = endValue.substr(2));
            endNum = parseFloat(endValue);

            if (p in _propertyAliases) {
              if (p === "autoAlpha") {
                //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
                if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                  //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
                  startNum = 0;
                }

                _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
              }

              if (p !== "scale" && p !== "transform") {
                p = _propertyAliases[p];
                ~p.indexOf(",") && (p = p.split(",")[0]);
              }
            }

            isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

            if (isTransformRelated) {
              if (!transformPropTween) {
                cache = target._gsap;
                cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

                smooth = vars.smoothOrigin !== false && cache.smooth;
                transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp$1, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

                transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
              }

              if (p === "scale") {
                this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, relative ? relative * endNum : endNum - cache.scaleY);
                props.push("scaleY", p);
                p += "X";
              } else if (p === "transformOrigin") {
                endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

                if (cache.svg) {
                  _applySVGOrigin(target, endValue, 0, smooth, 0, this);
                } else {
                  endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

                  endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

                  _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
                }

                continue;
              } else if (p === "svgOrigin") {
                _applySVGOrigin(target, endValue, 1, smooth, 0, this);

                continue;
              } else if (p in _rotationalProperties) {
                _addRotationalPropTween(this, cache, p, startNum, endValue, relative);

                continue;
              } else if (p === "smoothOrigin") {
                _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

                continue;
              } else if (p === "force3D") {
                cache[p] = endValue;
                continue;
              } else if (p === "transform") {
                _addRawTransformPTs(this, endValue, target);

                continue;
              }
            } else if (!(p in style)) {
              p = _checkPropPrefix(p) || p;
            }

            if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
              startUnit = (startValue + "").substr((startNum + "").length);
              endNum || (endNum = 0); // protect against NaN

              endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
              startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
              this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
              this._pt.u = endUnit || 0;

              if (startUnit !== endUnit) {
                //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
                this._pt.b = startValue;
                this._pt.r = _renderCSSPropWithBeginning;
              }
            } else if (!(p in style)) {
              if (p in target) {
                //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
                this.add(target, p, target[p], endValue, index, targets);
              } else {
                _missingPlugin(p, endValue);

                continue;
              }
            } else {
              _tweenComplexCSSString.call(this, target, p, startValue, endValue);
            }

            props.push(p);
          }
        }

        hasPriority && _sortPropTweensByPriority(this);
      },
      get: _get,
      aliases: _propertyAliases,
      getSetter: function getSetter(target, property, plugin) {
        //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
        var p = _propertyAliases[property];
        p && p.indexOf(",") < 0 && (property = p);
        return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
      },
      core: {
        _removeProperty: _removeProperty,
        _getMatrix: _getMatrix
      }
    };
    gsap$2.utils.checkPrefix = _checkPropPrefix;

    (function (positionAndScale, rotation, others, aliases) {
      var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
        _transformProps[name] = 1;
      });

      _forEachName(rotation, function (name) {
        _config.units[name] = "deg";
        _rotationalProperties[name] = 1;
      });

      _propertyAliases[all[13]] = positionAndScale + "," + rotation;

      _forEachName(aliases, function (name) {
        var split = name.split(":");
        _propertyAliases[split[1]] = all[split[0]];
      });
    })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

    _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
      _config.units[name] = "px";
    });

    gsap$2.registerPlugin(CSSPlugin);

    var gsapWithCSS = gsap$2.registerPlugin(CSSPlugin) || gsap$2;
        // to protect from tree shaking
    gsapWithCSS.core.Tween;

    /*!
     * ScrollTrigger 3.6.1
     * https://greensock.com
     *
     * @license Copyright 2008-2021, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var gsap$1,
        _coreInitted,
        _win,
        _doc,
        _docEl,
        _body,
        _root,
        _resizeDelay,
        _raf,
        _request,
        _toArray,
        _clamp,
        _time2,
        _syncInterval,
        _refreshing,
        _pointerIsDown,
        _transformProp,
        _i,
        _prevWidth,
        _prevHeight,
        _autoRefresh,
        _sort,
        _suppressOverwrites,
        _ignoreResize,
        _limitCallbacks,
        // if true, we'll only trigger callbacks if the active state toggles, so if you scroll immediately past both the start and end positions of a ScrollTrigger (thus inactive to inactive), neither its onEnter nor onLeave will be called. This is useful during startup.
    _startup = 1,
        _proxies = [],
        _scrollers = [],
        _getTime = Date.now,
        _time1 = _getTime(),
        _lastScrollTime = 0,
        _enabled = 1,
        _passThrough = function _passThrough(v) {
      return v;
    },
        _round = function _round(value) {
      return Math.round(value * 100000) / 100000 || 0;
    },
        _windowExists = function _windowExists() {
      return typeof window !== "undefined";
    },
        _getGSAP$1 = function _getGSAP() {
      return gsap$1 || _windowExists() && (gsap$1 = window.gsap) && gsap$1.registerPlugin && gsap$1;
    },
        _isViewport = function _isViewport(e) {
      return !!~_root.indexOf(e);
    },
        _getProxyProp = function _getProxyProp(element, property) {
      return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
    },
        _getScrollFunc = function _getScrollFunc(element, _ref) {
      var s = _ref.s,
          sc = _ref.sc;

      var i = _scrollers.indexOf(element),
          offset = sc === _vertical.sc ? 1 : 2;

      !~i && (i = _scrollers.push(element) - 1);
      return _scrollers[i + offset] || (_scrollers[i + offset] = _getProxyProp(element, s) || (_isViewport(element) ? sc : function (value) {
        return arguments.length ? element[s] = value : element[s];
      }));
    },
        _getBoundsFunc = function _getBoundsFunc(element) {
      return _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? function () {
        _winOffsets.width = _win.innerWidth;
        _winOffsets.height = _win.innerHeight;
        return _winOffsets;
      } : function () {
        return _getBounds(element);
      });
    },
        _getSizeFunc = function _getSizeFunc(scroller, isViewport, _ref2) {
      var d = _ref2.d,
          d2 = _ref2.d2,
          a = _ref2.a;
      return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function () {
        return a()[d];
      } : function () {
        return (isViewport ? _win["inner" + d2] : scroller["client" + d2]) || 0;
      };
    },
        _getOffsetsFunc = function _getOffsetsFunc(element, isViewport) {
      return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function () {
        return _winOffsets;
      };
    },
        _maxScroll = function _maxScroll(element, _ref3) {
      var s = _ref3.s,
          d2 = _ref3.d2,
          d = _ref3.d,
          a = _ref3.a;
      return (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? Math.max(_docEl[s], _body[s]) - (_win["inner" + d2] || _docEl["client" + d2] || _body["client" + d2]) : element[s] - element["offset" + d2];
    },
        _iterateAutoRefresh = function _iterateAutoRefresh(func, events) {
      for (var i = 0; i < _autoRefresh.length; i += 3) {
        (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
      }
    },
        _isString = function _isString(value) {
      return typeof value === "string";
    },
        _isFunction = function _isFunction(value) {
      return typeof value === "function";
    },
        _isNumber = function _isNumber(value) {
      return typeof value === "number";
    },
        _isObject = function _isObject(value) {
      return typeof value === "object";
    },
        _callIfFunc = function _callIfFunc(value) {
      return _isFunction(value) && value();
    },
        _combineFunc = function _combineFunc(f1, f2) {
      return function () {
        var result1 = _callIfFunc(f1),
            result2 = _callIfFunc(f2);

        return function () {
          _callIfFunc(result1);

          _callIfFunc(result2);
        };
      };
    },
        _abs = Math.abs,
        _scrollLeft = "scrollLeft",
        _scrollTop = "scrollTop",
        _left = "left",
        _top = "top",
        _right = "right",
        _bottom = "bottom",
        _width = "width",
        _height = "height",
        _Right = "Right",
        _Left = "Left",
        _Top = "Top",
        _Bottom = "Bottom",
        _padding = "padding",
        _margin = "margin",
        _Width = "Width",
        _Height = "Height",
        _px = "px",
        _horizontal = {
      s: _scrollLeft,
      p: _left,
      p2: _Left,
      os: _right,
      os2: _Right,
      d: _width,
      d2: _Width,
      a: "x",
      sc: function sc(value) {
        return arguments.length ? _win.scrollTo(value, _vertical.sc()) : _win.pageXOffset || _doc[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
      }
    },
        _vertical = {
      s: _scrollTop,
      p: _top,
      p2: _Top,
      os: _bottom,
      os2: _Bottom,
      d: _height,
      d2: _Height,
      a: "y",
      op: _horizontal,
      sc: function sc(value) {
        return arguments.length ? _win.scrollTo(_horizontal.sc(), value) : _win.pageYOffset || _doc[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
      }
    },
        _getComputedStyle = function _getComputedStyle(element) {
      return _win.getComputedStyle(element);
    },
        _makePositionable = function _makePositionable(element) {
      return element.style.position = _getComputedStyle(element).position === "absolute" ? "absolute" : "relative";
    },
        // if the element already has position: absolute, leave that, otherwise make it position: relative
    _setDefaults = function _setDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || (obj[p] = defaults[p]);
      }

      return obj;
    },
        //_isInViewport = element => (element = _getBounds(element)) && !(element.top > (_win.innerHeight || _docEl.clientHeight) || element.bottom < 0 || element.left > (_win.innerWidth || _docEl.clientWidth) || element.right < 0) && element,
    _getBounds = function _getBounds(element, withoutTransforms) {
      var tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap$1.to(element, {
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        skewX: 0,
        skewY: 0
      }).progress(1),
          bounds = element.getBoundingClientRect();
      tween && tween.progress(0).kill();
      return bounds;
    },
        _getSize = function _getSize(element, _ref4) {
      var d2 = _ref4.d2;
      return element["offset" + d2] || element["client" + d2] || 0;
    },
        _getLabelRatioArray = function _getLabelRatioArray(timeline) {
      var a = [],
          labels = timeline.labels,
          duration = timeline.duration(),
          p;

      for (p in labels) {
        a.push(labels[p] / duration);
      }

      return a;
    },
        _getClosestLabel = function _getClosestLabel(animation) {
      return function (value) {
        return gsap$1.utils.snap(_getLabelRatioArray(animation), value);
      };
    },
        _getLabelAtDirection = function _getLabelAtDirection(timeline) {
      return function (value, st) {
        var a = _getLabelRatioArray(timeline),
            i;

        a.sort(function (a, b) {
          return a - b;
        });

        if (st.direction > 0) {
          value -= 1e-4; // to avoid rounding errors. If we're too strict, it might snap forward, then immediately again, and again.

          for (i = 0; i < a.length; i++) {
            if (a[i] >= value) {
              return a[i];
            }
          }

          return a.pop();
        } else {
          i = a.length;
          value += 1e-4;

          while (i--) {
            if (a[i] <= value) {
              return a[i];
            }
          }
        }

        return a[0];
      };
    },
        _multiListener = function _multiListener(func, element, types, callback) {
      return types.split(",").forEach(function (type) {
        return func(element, type, callback);
      });
    },
        _addListener = function _addListener(element, type, func) {
      return element.addEventListener(type, func, {
        passive: true
      });
    },
        _removeListener = function _removeListener(element, type, func) {
      return element.removeEventListener(type, func);
    },
        _markerDefaults = {
      startColor: "green",
      endColor: "red",
      indent: 0,
      fontSize: "16px",
      fontWeight: "normal"
    },
        _defaults = {
      toggleActions: "play",
      anticipatePin: 0
    },
        _keywords = {
      top: 0,
      left: 0,
      center: 0.5,
      bottom: 1,
      right: 1
    },
        _offsetToPx = function _offsetToPx(value, size) {
      if (_isString(value)) {
        var eqIndex = value.indexOf("="),
            relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;

        if (~eqIndex) {
          value.indexOf("%") > eqIndex && (relative *= size / 100);
          value = value.substr(0, eqIndex - 1);
        }

        value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
      }

      return value;
    },
        _createMarker = function _createMarker(type, name, container, direction, _ref5, offset, matchWidthEl) {
      var startColor = _ref5.startColor,
          endColor = _ref5.endColor,
          fontSize = _ref5.fontSize,
          indent = _ref5.indent,
          fontWeight = _ref5.fontWeight;

      var e = _doc.createElement("div"),
          useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed",
          isScroller = type.indexOf("scroller") !== -1,
          parent = useFixedPosition ? _body : container,
          isStart = type.indexOf("start") !== -1,
          color = isStart ? startColor : endColor,
          css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";

      css += "position:" + (isScroller && useFixedPosition ? "fixed;" : "absolute;");
      (isScroller || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
      matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
      e._isStart = isStart;
      e.setAttribute("class", "gsap-marker-" + type);
      e.style.cssText = css;
      e.innerText = name || name === 0 ? type + "-" + name : type;
      parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
      e._offset = e["offset" + direction.op.d2];

      _positionMarker(e, 0, direction, isStart);

      return e;
    },
        _positionMarker = function _positionMarker(marker, start, direction, flipped) {
      var vars = {
        display: "block"
      },
          side = direction[flipped ? "os2" : "p2"],
          oppositeSide = direction[flipped ? "p2" : "os2"];
      marker._isFlipped = flipped;
      vars[direction.a + "Percent"] = flipped ? -100 : 0;
      vars[direction.a] = flipped ? "1px" : 0;
      vars["border" + side + _Width] = 1;
      vars["border" + oppositeSide + _Width] = 0;
      vars[direction.p] = start + "px";
      gsap$1.set(marker, vars);
    },
        _triggers = [],
        _ids = {},
        _sync = function _sync() {
      return _request || (_request = _raf(_updateAll));
    },
        _onScroll = function _onScroll() {
      if (!_request) {
        _request = _raf(_updateAll);
        _lastScrollTime || _dispatch("scrollStart");
        _lastScrollTime = _getTime();
      }
    },
        _onResize = function _onResize() {
      return !_refreshing && !_ignoreResize && !_doc.fullscreenElement && _resizeDelay.restart(true);
    },
        // ignore resizes triggered by refresh()
    _listeners = {},
        _emptyArray = [],
        _media = [],
        _creatingMedia,
        // when ScrollTrigger.matchMedia() is called, we record the current media key here (like "(min-width: 800px)") so that we can assign it to everything that's created during that call. Then we can revert just those when necessary. In the ScrollTrigger's init() call, the _creatingMedia is recorded as a "media" property on the instance.
    _lastMediaTick,
        _onMediaChange = function _onMediaChange(e) {
      var tick = gsap$1.ticker.frame,
          matches = [],
          i = 0,
          index;

      if (_lastMediaTick !== tick || _startup) {
        _revertAll();

        for (; i < _media.length; i += 4) {
          index = _win.matchMedia(_media[i]).matches;

          if (index !== _media[i + 3]) {
            // note: some browsers fire the matchMedia event multiple times, like when going full screen, so we shouldn't call the function multiple times. Check to see if it's already matched.
            _media[i + 3] = index;
            index ? matches.push(i) : _revertAll(1, _media[i]) || _isFunction(_media[i + 2]) && _media[i + 2](); // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.
          }
        }

        _revertRecorded(); // in case killing/reverting any of the animations actually added inline styles back.


        for (i = 0; i < matches.length; i++) {
          index = matches[i];
          _creatingMedia = _media[index];
          _media[index + 2] = _media[index + 1](e);
        }

        _creatingMedia = 0;
        _coreInitted && _refreshAll(0, 1);
        _lastMediaTick = tick;

        _dispatch("matchMedia");
      }
    },
        _softRefresh = function _softRefresh() {
      return _removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true);
    },
        _dispatch = function _dispatch(type) {
      return _listeners[type] && _listeners[type].map(function (f) {
        return f();
      }) || _emptyArray;
    },
        _savedStyles = [],
        // when ScrollTrigger.saveStyles() is called, the inline styles are recorded in this Array in a sequential format like [element, cssText, gsCache, media]. This keeps it very memory-efficient and fast to iterate through.
    _revertRecorded = function _revertRecorded(media) {
      for (var i = 0; i < _savedStyles.length; i += 4) {
        if (!media || _savedStyles[i + 3] === media) {
          _savedStyles[i].style.cssText = _savedStyles[i + 1];
          _savedStyles[i + 2].uncache = 1;
        }
      }
    },
        _revertAll = function _revertAll(kill, media) {
      var trigger;

      for (_i = 0; _i < _triggers.length; _i++) {
        trigger = _triggers[_i];

        if (!media || trigger.media === media) {
          if (kill) {
            trigger.kill(1);
          } else {
            trigger.scroll.rec || (trigger.scroll.rec = trigger.scroll()); // record the scroll positions so that in each refresh() we can ensure that it doesn't shift. Remember, pinning can make things change around, especially if the same element is pinned multiple times. If one was already recorded, don't re-record because unpinning may have occurred and made it shorter.

            trigger.revert();
          }
        }
      }

      _revertRecorded(media);

      media || _dispatch("revert");
    },
        _refreshAll = function _refreshAll(force, skipRevert) {
      if (_lastScrollTime && !force) {
        _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

        return;
      }

      var refreshInits = _dispatch("refreshInit");

      _sort && ScrollTrigger.sort();
      skipRevert || _revertAll();

      for (_i = 0; _i < _triggers.length; _i++) {
        _triggers[_i].refresh();
      }

      refreshInits.forEach(function (result) {
        return result && result.render && result.render(-1);
      }); // if the onRefreshInit() returns an animation (typically a gsap.set()), revert it. This makes it easy to put things in a certain spot before refreshing for measurement purposes, and then put things back.

      _i = _triggers.length;

      while (_i--) {
        _triggers[_i].scroll.rec = 0;
      }

      _resizeDelay.pause();

      _dispatch("refresh");
    },
        _lastScroll = 0,
        _direction = 1,
        _updateAll = function _updateAll() {
      var l = _triggers.length,
          time = _getTime(),
          recordVelocity = time - _time1 >= 50,
          scroll = l && _triggers[0].scroll();

      _direction = _lastScroll > scroll ? -1 : 1;
      _lastScroll = scroll;

      if (recordVelocity) {
        if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
          _lastScrollTime = 0;

          _dispatch("scrollEnd");
        }

        _time2 = _time1;
        _time1 = time;
      }

      if (_direction < 0) {
        _i = l;

        while (_i-- > 0) {
          _triggers[_i] && _triggers[_i].update(0, recordVelocity);
        }

        _direction = 1;
      } else {
        for (_i = 0; _i < l; _i++) {
          _triggers[_i] && _triggers[_i].update(0, recordVelocity);
        }
      }

      _request = 0;
    },
        _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float", "zIndex"],
        _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]),
        _swapPinOut = function _swapPinOut(pin, spacer, state) {
      _setState(state);

      if (pin.parentNode === spacer) {
        var parent = spacer.parentNode;

        if (parent) {
          parent.insertBefore(pin, spacer);
          parent.removeChild(spacer);
        }
      }
    },
        _swapPinIn = function _swapPinIn(pin, spacer, cs, spacerState) {
      if (pin.parentNode !== spacer) {
        var i = _propNamesToCopy.length,
            spacerStyle = spacer.style,
            pinStyle = pin.style,
            p;

        while (i--) {
          p = _propNamesToCopy[i];
          spacerStyle[p] = cs[p];
        }

        spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
        cs.display === "inline" && (spacerStyle.display = "inline-block");
        pinStyle[_bottom] = pinStyle[_right] = "auto";
        spacerStyle.overflow = "visible";
        spacerStyle.boxSizing = "border-box";
        spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
        spacerStyle[_height] = _getSize(pin, _vertical) + _px;
        spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";

        _setState(spacerState);

        pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
        pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
        pinStyle[_padding] = cs[_padding];
        pin.parentNode.insertBefore(spacer, pin);
        spacer.appendChild(pin);
      }
    },
        _capsExp = /([A-Z])/g,
        _setState = function _setState(state) {
      if (state) {
        var style = state.t.style,
            l = state.length,
            i = 0,
            p,
            value;
        (state.t._gsap || gsap$1.core.getCache(state.t)).uncache = 1; // otherwise transforms may be off

        for (; i < l; i += 2) {
          value = state[i + 1];
          p = state[i];

          if (value) {
            style[p] = value;
          } else if (style[p]) {
            style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
          }
        }
      }
    },
        _getState = function _getState(element) {
      // returns an Array with alternating values like [property, value, property, value] and a "t" property pointing to the target (element). Makes it fast and cheap.
      var l = _stateProps.length,
          style = element.style,
          state = [],
          i = 0;

      for (; i < l; i++) {
        state.push(_stateProps[i], style[_stateProps[i]]);
      }

      state.t = element;
      return state;
    },
        _copyState = function _copyState(state, override, omitOffsets) {
      var result = [],
          l = state.length,
          i = omitOffsets ? 8 : 0,
          // skip top, left, right, bottom if omitOffsets is true
      p;

      for (; i < l; i += 2) {
        p = state[i];
        result.push(p, p in override ? override[p] : state[i + 1]);
      }

      result.t = state.t;
      return result;
    },
        _winOffsets = {
      left: 0,
      top: 0
    },
        _parsePosition = function _parsePosition(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax) {
      _isFunction(value) && (value = value(self));

      if (_isString(value) && value.substr(0, 3) === "max") {
        value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
      }

      if (!_isNumber(value)) {
        _isFunction(trigger) && (trigger = trigger(self));

        var element = _toArray(trigger)[0] || _body,
            bounds = _getBounds(element) || {},
            offsets = value.split(" "),
            localOffset,
            globalOffset,
            display;

        if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
          // if display is "none", it won't report getBoundingClientRect() properly
          display = element.style.display;
          element.style.display = "block";
          bounds = _getBounds(element);
          display ? element.style.display = display : element.style.removeProperty("display");
        }

        localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
        globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
        value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
        markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
        scrollerSize -= scrollerSize - globalOffset; // adjust for the marker
      } else if (markerScroller) {
        _positionMarker(markerScroller, scrollerSize, direction, true);
      }

      if (marker) {
        var position = value + scrollerSize,
            isStart = marker._isStart;
        scrollerMax = "scroll" + direction.d2;

        _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[scrollerMax], _docEl[scrollerMax]) : marker.parentNode[scrollerMax]) <= position + 1);

        if (useFixedPosition) {
          scrollerBounds = _getBounds(markerScroller);
          useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
        }
      }

      return Math.round(value);
    },
        _prefixExp = /(?:webkit|moz|length|cssText|inset)/i,
        _reparent = function _reparent(element, parent, top, left) {
      if (element.parentNode !== parent) {
        var style = element.style,
            p,
            cs;

        if (parent === _body) {
          element._stOrig = style.cssText; // record original inline styles so we can revert them later

          cs = _getComputedStyle(element);

          for (p in cs) {
            // must copy all relevant styles to ensure that nothing changes visually when we reparent to the <body>. Skip the vendor prefixed ones.
            if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
              style[p] = cs[p];
            }
          }

          style.top = top;
          style.left = left;
        } else {
          style.cssText = element._stOrig;
        }

        gsap$1.core.getCache(element).uncache = 1;
        parent.appendChild(element);
      }
    },
        // returns a function that can be used to tween the scroll position in the direction provided, and when doing so it'll add a .tween property to the FUNCTION itself, and remove it when the tween completes or gets killed. This gives us a way to have multiple ScrollTriggers use a central function for any given scroller and see if there's a scroll tween running (which would affect if/how things get updated)
    _getTweenCreator = function _getTweenCreator(scroller, direction) {
      var getScroll = _getScrollFunc(scroller, direction),
          prop = "_scroll" + direction.p2,
          // add a tweenable property to the scroller that's a getter/setter function, like _scrollTop or _scrollLeft. This way, if someone does gsap.killTweensOf(scroller) it'll kill the scroll tween.
      lastScroll1,
          lastScroll2,
          getTween = function getTween(scrollTo, vars, initialValue, change1, change2) {
        var tween = getTween.tween,
            onComplete = vars.onComplete,
            modifiers = {};
        tween && tween.kill();
        lastScroll1 = Math.round(initialValue);
        vars[prop] = scrollTo;
        vars.modifiers = modifiers;

        modifiers[prop] = function (value) {
          value = _round(getScroll()); // round because in some [very uncommon] Windows environments, it can get reported with decimals even though it was set without.

          if (value !== lastScroll1 && value !== lastScroll2 && Math.abs(value - lastScroll1) > 2) {
            // if the user scrolls, kill the tween. iOS Safari intermittently misreports the scroll position, it may be the most recently-set one or the one before that! When Safari is zoomed (CMD-+), it often misreports as 1 pixel off too! So if we set the scroll position to 125, for example, it'll actually report it as 124.
            tween.kill();
            getTween.tween = 0;
          } else {
            value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
          }

          lastScroll2 = lastScroll1;
          return lastScroll1 = _round(value);
        };

        vars.onComplete = function () {
          getTween.tween = 0;
          onComplete && onComplete.call(tween);
        };

        tween = getTween.tween = gsap$1.to(scroller, vars);
        return tween;
      };

      scroller[prop] = getScroll;
      scroller.addEventListener("wheel", function () {
        return getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
      }); // Windows machines handle mousewheel scrolling in chunks (like "3 lines per scroll") meaning the typical strategy for cancelling the scroll isn't as sensitive. It's much more likely to match one of the previous 2 scroll event positions. So we kill any snapping as soon as there's a wheel event.

      return getTween;
    };

    _horizontal.op = _vertical;
    var ScrollTrigger = /*#__PURE__*/function () {
      function ScrollTrigger(vars, animation) {
        _coreInitted || ScrollTrigger.register(gsap$1) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
        this.init(vars, animation);
      }

      var _proto = ScrollTrigger.prototype;

      _proto.init = function init(vars, animation) {
        this.progress = this.start = 0;
        this.vars && this.kill(1); // in case it's being initted again

        if (!_enabled) {
          this.update = this.refresh = this.kill = _passThrough;
          return;
        }

        vars = _setDefaults(_isString(vars) || _isNumber(vars) || vars.nodeType ? {
          trigger: vars
        } : vars, _defaults);

        var direction = vars.horizontal ? _horizontal : _vertical,
            _vars = vars,
            onUpdate = _vars.onUpdate,
            toggleClass = _vars.toggleClass,
            id = _vars.id,
            onToggle = _vars.onToggle,
            onRefresh = _vars.onRefresh,
            scrub = _vars.scrub,
            trigger = _vars.trigger,
            pin = _vars.pin,
            pinSpacing = _vars.pinSpacing,
            invalidateOnRefresh = _vars.invalidateOnRefresh,
            anticipatePin = _vars.anticipatePin,
            onScrubComplete = _vars.onScrubComplete,
            onSnapComplete = _vars.onSnapComplete,
            once = _vars.once,
            snap = _vars.snap,
            pinReparent = _vars.pinReparent,
            isToggle = !scrub && scrub !== 0,
            scroller = _toArray(vars.scroller || _win)[0],
            scrollerCache = gsap$1.core.getCache(scroller),
            isViewport = _isViewport(scroller),
            useFixedPosition = "pinType" in vars ? vars.pinType === "fixed" : isViewport || _getProxyProp(scroller, "pinType") === "fixed",
            callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack],
            toggleActions = isToggle && vars.toggleActions.split(" "),
            markers = "markers" in vars ? vars.markers : _defaults.markers,
            borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0,
            self = this,
            onRefreshInit = vars.onRefreshInit && function () {
          return vars.onRefreshInit(self);
        },
            getScrollerSize = _getSizeFunc(scroller, isViewport, direction),
            getScrollerOffsets = _getOffsetsFunc(scroller, isViewport),
            tweenTo,
            pinCache,
            snapFunc,
            isReverted,
            scroll1,
            scroll2,
            start,
            end,
            markerStart,
            markerEnd,
            markerStartTrigger,
            markerEndTrigger,
            markerVars,
            change,
            pinOriginalState,
            pinActiveState,
            pinState,
            spacer,
            offset,
            pinGetter,
            pinSetter,
            pinStart,
            pinChange,
            spacingStart,
            spacerState,
            markerStartSetter,
            markerEndSetter,
            cs,
            snap1,
            snap2,
            scrubTween,
            scrubSmooth,
            snapDurClamp,
            snapDelayedCall,
            prevProgress,
            prevScroll,
            prevAnimProgress;

        self.media = _creatingMedia;
        anticipatePin *= 45;

        _triggers.push(self);

        self.scroller = scroller;
        self.scroll = _getScrollFunc(scroller, direction);
        scroll1 = self.scroll();
        self.vars = vars;
        animation = animation || vars.animation;
        "refreshPriority" in vars && (_sort = 1);
        scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
          top: _getTweenCreator(scroller, _vertical),
          left: _getTweenCreator(scroller, _horizontal)
        };
        self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];

        if (animation) {
          animation.vars.lazy = false;
          animation._initted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.render(0, true, true);
          self.animation = animation.pause();
          animation.scrollTrigger = self;
          scrubSmooth = _isNumber(scrub) && scrub;
          scrubSmooth && (scrubTween = gsap$1.to(animation, {
            ease: "power3",
            duration: scrubSmooth,
            onComplete: function onComplete() {
              return onScrubComplete && onScrubComplete(self);
            }
          }));
          snap1 = 0;
          id || (id = animation.vars.id);
        }

        if (snap) {
          _isObject(snap) || (snap = {
            snapTo: snap
          });
          "scrollBehavior" in _body.style && gsap$1.set(isViewport ? [_body, _docEl] : scroller, {
            scrollBehavior: "auto"
          }); // smooth scrolling doesn't work with snap.

          snapFunc = _isFunction(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getClosestLabel(animation) : snap.snapTo === "labelsDirectional" ? _getLabelAtDirection(animation) : gsap$1.utils.snap(snap.snapTo);
          snapDurClamp = snap.duration || {
            min: 0.1,
            max: 2
          };
          snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
          snapDelayedCall = gsap$1.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, function () {
            if (Math.abs(self.getVelocity()) < 10 && !_pointerIsDown) {
              var totalProgress = animation && !isToggle ? animation.totalProgress() : self.progress,
                  velocity = (totalProgress - snap2) / (_getTime() - _time2) * 1000 || 0,
                  change1 = _abs(velocity / 2) * velocity / 0.185,
                  naturalEnd = totalProgress + (snap.inertia === false ? 0 : change1),
                  endValue = _clamp(0, 1, snapFunc(naturalEnd, self)),
                  scroll = self.scroll(),
                  endScroll = Math.round(start + endValue * change),
                  _snap = snap,
                  onStart = _snap.onStart,
                  _onInterrupt = _snap.onInterrupt,
                  _onComplete = _snap.onComplete,
                  tween = tweenTo.tween;

              if (scroll <= end && scroll >= start && endScroll !== scroll) {
                if (tween && !tween._initted && tween.data <= Math.abs(endScroll - scroll)) {
                  // there's an overlapping snap! So we must figure out which one is closer and let that tween live.
                  return;
                }

                tweenTo(endScroll, {
                  duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
                  ease: snap.ease || "power3",
                  data: Math.abs(endScroll - scroll),
                  // record the distance so that if another snap tween occurs (conflict) we can prioritize the closest snap.
                  onInterrupt: function onInterrupt() {
                    return snapDelayedCall.restart(true) && _onInterrupt && _onInterrupt(self);
                  },
                  onComplete: function onComplete() {
                    snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
                    onSnapComplete && onSnapComplete(self);
                    _onComplete && _onComplete(self);
                  }
                }, scroll, change1 * change, endScroll - scroll - change1 * change);
                onStart && onStart(self, tweenTo.tween);
              }
            } else if (self.isActive) {
              snapDelayedCall.restart(true);
            }
          }).pause();
        }

        id && (_ids[id] = self);
        trigger = self.trigger = _toArray(trigger || pin)[0];
        pin = pin === true ? trigger : _toArray(pin)[0];
        _isString(toggleClass) && (toggleClass = {
          targets: trigger,
          className: toggleClass
        });

        if (pin) {
          pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding); // if the parent is display: flex, don't apply pinSpacing by default.

          self.pin = pin;
          vars.force3D !== false && gsap$1.set(pin, {
            force3D: true
          });
          pinCache = gsap$1.core.getCache(pin);

          if (!pinCache.spacer) {
            // record the spacer and pinOriginalState on the cache in case someone tries pinning the same element with MULTIPLE ScrollTriggers - we don't want to have multiple spacers or record the "original" pin state after it has already been affected by another ScrollTrigger.
            pinCache.spacer = spacer = _doc.createElement("div");
            spacer.setAttribute("class", "pin-spacer" + (id ? " pin-spacer-" + id : ""));
            pinCache.pinState = pinOriginalState = _getState(pin);
          } else {
            pinOriginalState = pinCache.pinState;
          }

          self.spacer = spacer = pinCache.spacer;
          cs = _getComputedStyle(pin);
          spacingStart = cs[pinSpacing + direction.os2];
          pinGetter = gsap$1.getProperty(pin);
          pinSetter = gsap$1.quickSetter(pin, direction.a, _px); // pin.firstChild && !_maxScroll(pin, direction) && (pin.style.overflow = "hidden"); // protects from collapsing margins, but can have unintended consequences as demonstrated here: https://codepen.io/GreenSock/pen/1e42c7a73bfa409d2cf1e184e7a4248d so it was removed in favor of just telling people to set up their CSS to avoid the collapsing margins (overflow: hidden | auto is just one option. Another is border-top: 1px solid transparent).

          _swapPinIn(pin, spacer, cs);

          pinState = _getState(pin);
        }

        if (markers) {
          markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
          markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
          markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
          offset = markerStartTrigger["offset" + direction.op.d2];
          markerStart = _createMarker("start", id, scroller, direction, markerVars, offset);
          markerEnd = _createMarker("end", id, scroller, direction, markerVars, offset);

          if (!useFixedPosition) {
            _makePositionable(isViewport ? _body : scroller);

            gsap$1.set([markerStartTrigger, markerEndTrigger], {
              force3D: true
            });
            markerStartSetter = gsap$1.quickSetter(markerStartTrigger, direction.a, _px);
            markerEndSetter = gsap$1.quickSetter(markerEndTrigger, direction.a, _px);
          }
        }

        self.revert = function (revert) {
          var r = revert !== false || !self.enabled,
              prevRefreshing = _refreshing;

          if (r !== isReverted) {
            if (r) {
              prevScroll = Math.max(self.scroll(), self.scroll.rec || 0); // record the scroll so we can revert later (repositioning/pinning things can affect scroll position). In the static refresh() method, we first record all the scroll positions as a reference.

              prevProgress = self.progress;
              prevAnimProgress = animation && animation.progress();
            }

            markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
              return m.style.display = r ? "none" : "block";
            });
            r && (_refreshing = 1);
            self.update(r); // make sure the pin is back in its original position so that all the measurements are correct.

            _refreshing = prevRefreshing;
            pin && (r ? _swapPinOut(pin, spacer, pinOriginalState) : (!pinReparent || !self.isActive) && _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState));
            isReverted = r;
          }
        };

        self.refresh = function (soft, force) {
          if ((_refreshing || !self.enabled) && !force) {
            return;
          }

          if (pin && soft && _lastScrollTime) {
            _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

            return;
          }

          _refreshing = 1;
          scrubTween && scrubTween.pause();
          invalidateOnRefresh && animation && animation.progress(0).invalidate();
          isReverted || self.revert();

          var size = getScrollerSize(),
              scrollerBounds = getScrollerOffsets(),
              max = _maxScroll(scroller, direction),
              offset = 0,
              otherPinOffset = 0,
              parsedEnd = vars.end,
              parsedEndTrigger = vars.endTrigger || trigger,
              parsedStart = vars.start || (vars.start === 0 || !trigger ? 0 : pin ? "0 0" : "0 100%"),
              triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0,
              i = triggerIndex,
              cs,
              bounds,
              scroll,
              isVertical,
              override,
              curTrigger,
              curPin,
              oppositeScroll,
              initted;

          while (i--) {
            // user might try to pin the same element more than once, so we must find any prior triggers with the same pin, revert them, and determine how long they're pinning so that we can offset things appropriately. Make sure we revert from last to first so that things "rewind" properly.
            curTrigger = _triggers[i];
            curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = 1); // if it's a timeline-based trigger that hasn't been fully initialized yet because it's waiting for 1 tick, just force the refresh() here, otherwise if it contains a pin that's supposed to affect other ScrollTriggers further down the page, they won't be adjusted properly.

            curPin = curTrigger.pin;
            curPin && (curPin === trigger || curPin === pin) && curTrigger.revert();
          }

          start = _parsePosition(parsedStart, trigger, size, direction, self.scroll(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max) || (pin ? -0.001 : 0);
          _isFunction(parsedEnd) && (parsedEnd = parsedEnd(self));

          if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
            if (~parsedEnd.indexOf(" ")) {
              parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
            } else {
              offset = _offsetToPx(parsedEnd.substr(2), size);
              parsedEnd = _isString(parsedStart) ? parsedStart : start + offset; // _parsePosition won't factor in the offset if the start is a number, so do it here.

              parsedEndTrigger = trigger;
            }
          }

          end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, self.scroll() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max)) || -0.001;
          change = end - start || (start -= 0.01) && 0.001;
          offset = 0;
          i = triggerIndex;

          while (i--) {
            curTrigger = _triggers[i];
            curPin = curTrigger.pin;

            if (curPin && curTrigger.start - curTrigger._pinPush < start) {
              cs = curTrigger.end - curTrigger.start;
              curPin === trigger && (offset += cs);
              curPin === pin && (otherPinOffset += cs);
            }
          }

          start += offset;
          end += offset;
          self._pinPush = otherPinOffset;

          if (markerStart && offset) {
            // offset the markers if necessary
            cs = {};
            cs[direction.a] = "+=" + offset;
            gsap$1.set([markerStart, markerEnd], cs);
          }

          if (pin) {
            cs = _getComputedStyle(pin);
            isVertical = direction === _vertical;
            scroll = self.scroll(); // recalculate because the triggers can affect the scroll

            pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
            !max && end > 1 && ((isViewport ? _body : scroller).style["overflow-" + direction.a] = "scroll"); // makes sure the scroller has a scrollbar, otherwise if something has width: 100%, for example, it would be too big (exclude the scrollbar). See https://greensock.com/forums/topic/25182-scrolltrigger-width-of-page-increase-where-markers-are-set-to-false/

            _swapPinIn(pin, spacer, cs);

            pinState = _getState(pin); // transforms will interfere with the top/left/right/bottom placement, so remove them temporarily. getBoundingClientRect() factors in transforms.

            bounds = _getBounds(pin, true);
            oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();

            if (pinSpacing) {
              spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
              spacerState.t = spacer;
              i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
              i && spacerState.push(direction.d, i + _px); // for box-sizing: border-box (must include padding).

              _setState(spacerState);

              useFixedPosition && self.scroll(prevScroll);
            }

            if (useFixedPosition) {
              override = {
                top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
                left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
                boxSizing: "border-box",
                position: "fixed"
              };
              override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
              override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
              override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
              override[_padding] = cs[_padding];
              override[_padding + _Top] = cs[_padding + _Top];
              override[_padding + _Right] = cs[_padding + _Right];
              override[_padding + _Bottom] = cs[_padding + _Bottom];
              override[_padding + _Left] = cs[_padding + _Left];
              pinActiveState = _copyState(pinOriginalState, override, pinReparent);
            }

            if (animation) {
              // the animation might be affecting the transform, so we must jump to the end, check the value, and compensate accordingly. Otherwise, when it becomes unpinned, the pinSetter() will get set to a value that doesn't include whatever the animation did.
              initted = animation._initted; // if not, we must invalidate() after this step, otherwise it could lock in starting values prematurely.

              _suppressOverwrites(1);

              animation.progress(1, true);
              pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
              change !== pinChange && pinActiveState.splice(pinActiveState.length - 2, 2); // transform is the last property/value set in the state Array. Since the animation is controlling that, we should omit it.

              animation.progress(0, true);
              initted || animation.invalidate();

              _suppressOverwrites(0);
            } else {
              pinChange = change;
            }
          } else if (trigger && self.scroll()) {
            // it may be INSIDE a pinned element, so walk up the tree and look for any elements with _pinOffset to compensate because anything with pinSpacing that's already scrolled would throw off the measurements in getBoundingClientRect()
            bounds = trigger.parentNode;

            while (bounds && bounds !== _body) {
              if (bounds._pinOffset) {
                start -= bounds._pinOffset;
                end -= bounds._pinOffset;
              }

              bounds = bounds.parentNode;
            }
          }

          for (i = 0; i < triggerIndex; i++) {
            // make sure we revert from first to last to make sure things reach their end state properly
            curTrigger = _triggers[i].pin;
            curTrigger && (curTrigger === trigger || curTrigger === pin) && _triggers[i].revert(false);
          }

          self.start = start;
          self.end = end;
          scroll1 = scroll2 = self.scroll(); // reset velocity

          scroll1 < prevScroll && self.scroll(prevScroll);
          self.revert(false);
          _refreshing = 0;
          animation && isToggle && animation._initted && animation.progress(prevAnimProgress, true).render(animation.time(), true, true); // must force a re-render because if saveStyles() was used on the target(s), the styles could have been wiped out during the refresh().

          if (prevProgress !== self.progress) {
            // ensures that the direction is set properly (when refreshing, progress is set back to 0 initially, then back again to wherever it needs to be) and that callbacks are triggered.
            scrubTween && animation.totalProgress(prevProgress, true); // to avoid issues where animation callbacks like onStart aren't triggered.

            self.progress = prevProgress;
            self.update();
          }

          pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
          onRefresh && onRefresh(self);
        };

        self.getVelocity = function () {
          return (self.scroll() - scroll2) / (_getTime() - _time2) * 1000 || 0;
        };

        self.update = function (reset, recordVelocity) {
          var scroll = self.scroll(),
              p = reset ? 0 : (scroll - start) / change,
              clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0,
              prevProgress = self.progress,
              isActive,
              wasActive,
              toggleState,
              action,
              stateChanged,
              toggled;

          if (recordVelocity) {
            scroll2 = scroll1;
            scroll1 = scroll;

            if (snap) {
              snap2 = snap1;
              snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
            }
          } // anticipate the pinning a few ticks ahead of time based on velocity to avoid a visual glitch due to the fact that most browsers do scrolling on a separate thread (not synced with requestAnimationFrame).


          anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin && (clipped = 0.0001);

          if (clipped !== prevProgress && self.enabled) {
            isActive = self.isActive = !!clipped && clipped < 1;
            wasActive = !!prevProgress && prevProgress < 1;
            toggled = isActive !== wasActive;
            stateChanged = toggled || !!clipped !== !!prevProgress; // could go from start all the way to end, thus it didn't toggle but it did change state in a sense (may need to fire a callback)

            self.direction = clipped > prevProgress ? 1 : -1;
            self.progress = clipped;

            if (!isToggle) {
              if (scrubTween && !_refreshing && !_startup) {
                scrubTween.vars.totalProgress = clipped;
                scrubTween.invalidate().restart();
              } else if (animation) {
                animation.totalProgress(clipped, !!_refreshing);
              }
            }

            if (pin) {
              reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);

              if (!useFixedPosition) {
                pinSetter(pinStart + pinChange * clipped);
              } else if (stateChanged) {
                action = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction); // if it's at the VERY end of the page, don't switch away from position: fixed because it's pointless and it could cause a brief flash when the user scrolls back up (when it gets pinned again)

                if (pinReparent) {
                  if (!reset && (isActive || action)) {
                    var bounds = _getBounds(pin, true),
                        _offset = scroll - start;

                    _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
                  } else {
                    _reparent(pin, spacer);
                  }
                }

                _setState(isActive || action ? pinActiveState : pinState);

                pinChange !== change && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !action ? pinChange : 0));
              }
            }

            snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
            toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function (el) {
              return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
            }); // classes could affect positioning, so do it even if reset or refreshing is true.

            onUpdate && !isToggle && !reset && onUpdate(self);

            if (stateChanged && !_refreshing) {
              toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3; // 0 = enter, 1 = leave, 2 = enterBack, 3 = leaveBack (we prioritize the FIRST encounter, thus if you scroll really fast past the onEnter and onLeave in one tick, it'd prioritize onEnter.

              if (isToggle) {
                action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState]; // if it didn't toggle, that means it shot right past and since we prioritize the "enter" action, we should switch to the "leave" in this case (but only if one is defined)

                if (animation && (action === "complete" || action === "reset" || action in animation)) {
                  if (action === "complete") {
                    animation.pause().totalProgress(1);
                  } else if (action === "reset") {
                    animation.restart(true).pause();
                  } else {
                    animation[action]();
                  }
                }

                onUpdate && onUpdate(self);
              }

              if (toggled || !_limitCallbacks) {
                // on startup, the page could be scrolled and we don't want to fire callbacks that didn't toggle. For example onEnter shouldn't fire if the ScrollTrigger isn't actually entered.
                onToggle && toggled && onToggle(self);
                callbacks[toggleState] && callbacks[toggleState](self);
                once && (clipped === 1 ? self.kill(false, 1) : callbacks[toggleState] = 0); // a callback shouldn't be called again if once is true.

                if (!toggled) {
                  // it's possible to go completely past, like from before the start to after the end (or vice-versa) in which case BOTH callbacks should be fired in that order
                  toggleState = clipped === 1 ? 1 : 3;
                  callbacks[toggleState] && callbacks[toggleState](self);
                }
              }
            } else if (isToggle && onUpdate && !_refreshing) {
              onUpdate(self);
            }
          } // update absolutely-positioned markers (only if the scroller isn't the viewport)


          if (markerEndSetter) {
            markerStartSetter(scroll + (markerStartTrigger._isFlipped ? 1 : 0));
            markerEndSetter(scroll);
          }
        };

        self.enable = function () {
          if (!self.enabled) {
            self.enabled = true;

            _addListener(scroller, "resize", _onResize);

            _addListener(scroller, "scroll", _onScroll);

            onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);
            !animation || !animation.add ? self.refresh() : gsap$1.delayedCall(0.01, function () {
              return start || end || self.refresh();
            }) && (change = 0.01) && (start = end = 0); // if the animation is a timeline, it may not have been populated yet, so it wouldn't render at the proper place on the first refresh(), thus we should schedule one for the next tick.
          }
        };

        self.disable = function (reset, allowAnimation) {
          if (self.enabled) {
            reset !== false && self.revert();
            self.enabled = self.isActive = false;
            allowAnimation || scrubTween && scrubTween.pause();
            prevScroll = 0;
            pinCache && (pinCache.uncache = 1);
            onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);

            if (snapDelayedCall) {
              snapDelayedCall.pause();
              tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
            }

            if (!isViewport) {
              var i = _triggers.length;

              while (i--) {
                if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
                  return; //don't remove the listeners if there are still other triggers referencing it.
                }
              }

              _removeListener(scroller, "resize", _onResize);

              _removeListener(scroller, "scroll", _onScroll);
            }
          }
        };

        self.kill = function (revert, allowAnimation) {
          self.disable(revert, allowAnimation);
          id && delete _ids[id];

          var i = _triggers.indexOf(self);

          _triggers.splice(i, 1);

          i === _i && _direction > 0 && _i--; // if we're in the middle of a refresh() or update(), splicing would cause skips in the index, so adjust...

          if (animation) {
            animation.scrollTrigger = null;
            revert && animation.render(-1);
            allowAnimation || animation.kill();
          }

          markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
            return m.parentNode.removeChild(m);
          });

          if (pin) {
            pinCache && (pinCache.uncache = 1);
            i = 0;

            _triggers.forEach(function (t) {
              return t.pin === pin && i++;
            });

            i || (pinCache.spacer = 0); // if there aren't any more ScrollTriggers with the same pin, remove the spacer, otherwise it could be contaminated with old/stale values if the user re-creates a ScrollTrigger for the same element.
          }
        };

        self.enable();
      };

      ScrollTrigger.register = function register(core) {
        if (!_coreInitted) {
          gsap$1 = core || _getGSAP$1();

          if (_windowExists() && window.document) {
            _win = window;
            _doc = document;
            _docEl = _doc.documentElement;
            _body = _doc.body;
          }

          if (gsap$1) {
            _toArray = gsap$1.utils.toArray;
            _clamp = gsap$1.utils.clamp;
            _suppressOverwrites = gsap$1.core.suppressOverwrites || _passThrough;
            gsap$1.core.globals("ScrollTrigger", ScrollTrigger); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.

            if (_body) {
              _raf = _win.requestAnimationFrame || function (f) {
                return setTimeout(f, 16);
              };

              _addListener(_win, "wheel", _onScroll);

              _root = [_win, _doc, _docEl, _body];

              _addListener(_doc, "scroll", _onScroll); // some browsers (like Chrome), the window stops dispatching scroll events on the window if you scroll really fast, but it's consistent on the document!


              var bodyStyle = _body.style,
                  border = bodyStyle.borderTop,
                  bounds;
              bodyStyle.borderTop = "1px solid #000"; // works around an issue where a margin of a child element could throw off the bounds of the _body, making it seem like there's a margin when there actually isn't. The border ensures that the bounds are accurate.

              bounds = _getBounds(_body);
              _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0; // accommodate the offset of the <body> caused by margins and/or padding

              _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
              border ? bodyStyle.borderTop = border : bodyStyle.removeProperty("border-top");
              _syncInterval = setInterval(_sync, 200);
              gsap$1.delayedCall(0.5, function () {
                return _startup = 0;
              });

              _addListener(_doc, "touchcancel", _passThrough); // some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document.


              _addListener(_body, "touchstart", _passThrough); //works around Safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/


              _multiListener(_addListener, _doc, "pointerdown,touchstart,mousedown", function () {
                return _pointerIsDown = 1;
              });

              _multiListener(_addListener, _doc, "pointerup,touchend,mouseup", function () {
                return _pointerIsDown = 0;
              });

              _transformProp = gsap$1.utils.checkPrefix("transform");

              _stateProps.push(_transformProp);

              _coreInitted = _getTime();
              _resizeDelay = gsap$1.delayedCall(0.2, _refreshAll).pause();
              _autoRefresh = [_doc, "visibilitychange", function () {
                var w = _win.innerWidth,
                    h = _win.innerHeight;

                if (_doc.hidden) {
                  _prevWidth = w;
                  _prevHeight = h;
                } else if (_prevWidth !== w || _prevHeight !== h) {
                  _onResize();
                }
              }, _doc, "DOMContentLoaded", _refreshAll, _win, "load", function () {
                return _lastScrollTime || _refreshAll();
              }, _win, "resize", _onResize];

              _iterateAutoRefresh(_addListener);
            }
          }
        }

        return _coreInitted;
      };

      ScrollTrigger.defaults = function defaults(config) {
        for (var p in config) {
          _defaults[p] = config[p];
        }
      };

      ScrollTrigger.kill = function kill() {
        _enabled = 0;

        _triggers.slice(0).forEach(function (trigger) {
          return trigger.kill(1);
        });
      };

      ScrollTrigger.config = function config(vars) {
        "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
        var ms = vars.syncInterval;
        ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);

        if ("autoRefreshEvents" in vars) {
          _iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none");
          _ignoreResize = (vars.autoRefreshEvents + "").indexOf("resize") === -1;
        }
      };

      ScrollTrigger.scrollerProxy = function scrollerProxy(target, vars) {
        var t = _toArray(target)[0],
            i = _scrollers.indexOf(t),
            isViewport = _isViewport(t);

        if (~i) {
          _scrollers.splice(i, isViewport ? 6 : 2);
        }

        isViewport ? _proxies.unshift(_win, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
      };

      ScrollTrigger.matchMedia = function matchMedia(vars) {
        // _media is populated in the following order: mediaQueryString, onMatch, onUnmatch, isMatched. So if there are two media queries, the Array would have a length of 8
        var mq, p, i, func, result;

        for (p in vars) {
          i = _media.indexOf(p);
          func = vars[p];
          _creatingMedia = p;

          if (p === "all") {
            func();
          } else {
            mq = _win.matchMedia(p);

            if (mq) {
              mq.matches && (result = func());

              if (~i) {
                _media[i + 1] = _combineFunc(_media[i + 1], func);
                _media[i + 2] = _combineFunc(_media[i + 2], result);
              } else {
                i = _media.length;

                _media.push(p, func, result);

                mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
              }

              _media[i + 3] = mq.matches;
            }
          }

          _creatingMedia = 0;
        }

        return _media;
      };

      ScrollTrigger.clearMatchMedia = function clearMatchMedia(query) {
        query || (_media.length = 0);
        query = _media.indexOf(query);
        query >= 0 && _media.splice(query, 4);
      };

      return ScrollTrigger;
    }();
    ScrollTrigger.version = "3.6.1";

    ScrollTrigger.saveStyles = function (targets) {
      return targets ? _toArray(targets).forEach(function (target) {
        if (target && target.style) {
          var i = _savedStyles.indexOf(target);

          i >= 0 && _savedStyles.splice(i, 4);

          _savedStyles.push(target, target.style.cssText, gsap$1.core.getCache(target), _creatingMedia);
        }
      }) : _savedStyles;
    };

    ScrollTrigger.revert = function (soft, media) {
      return _revertAll(!soft, media);
    };

    ScrollTrigger.create = function (vars, animation) {
      return new ScrollTrigger(vars, animation);
    };

    ScrollTrigger.refresh = function (safe) {
      return safe ? _onResize() : _refreshAll(true);
    };

    ScrollTrigger.update = _updateAll;

    ScrollTrigger.maxScroll = function (element, horizontal) {
      return _maxScroll(element, horizontal ? _horizontal : _vertical);
    };

    ScrollTrigger.getScrollFunc = function (element, horizontal) {
      return _getScrollFunc(_toArray(element)[0], horizontal ? _horizontal : _vertical);
    };

    ScrollTrigger.getById = function (id) {
      return _ids[id];
    };

    ScrollTrigger.getAll = function () {
      return _triggers.slice(0);
    };

    ScrollTrigger.isScrolling = function () {
      return !!_lastScrollTime;
    };

    ScrollTrigger.addEventListener = function (type, callback) {
      var a = _listeners[type] || (_listeners[type] = []);
      ~a.indexOf(callback) || a.push(callback);
    };

    ScrollTrigger.removeEventListener = function (type, callback) {
      var a = _listeners[type],
          i = a && a.indexOf(callback);
      i >= 0 && a.splice(i, 1);
    };

    ScrollTrigger.batch = function (targets, vars) {
      var result = [],
          varsCopy = {},
          interval = vars.interval || 0.016,
          batchMax = vars.batchMax || 1e9,
          proxyCallback = function proxyCallback(type, callback) {
        var elements = [],
            triggers = [],
            delay = gsap$1.delayedCall(interval, function () {
          callback(elements, triggers);
          elements = [];
          triggers = [];
        }).pause();
        return function (self) {
          elements.length || delay.restart(true);
          elements.push(self.trigger);
          triggers.push(self);
          batchMax <= elements.length && delay.progress(1);
        };
      },
          p;

      for (p in vars) {
        varsCopy[p] = p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
      }

      if (_isFunction(batchMax)) {
        batchMax = batchMax();

        _addListener(ScrollTrigger, "refresh", function () {
          return batchMax = vars.batchMax();
        });
      }

      _toArray(targets).forEach(function (target) {
        var config = {};

        for (p in varsCopy) {
          config[p] = varsCopy[p];
        }

        config.trigger = target;
        result.push(ScrollTrigger.create(config));
      });

      return result;
    };

    ScrollTrigger.sort = function (func) {
      return _triggers.sort(func || function (a, b) {
        return (a.vars.refreshPriority || 0) * -1e6 + a.start - (b.start + (b.vars.refreshPriority || 0) * -1e6);
      });
    };

    _getGSAP$1() && gsap$1.registerPlugin(ScrollTrigger);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var check = function (it) {
      return it && it.Math == Math && it;
    };

    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global$1 =
      // eslint-disable-next-line es/no-global-this -- safe
      check(typeof globalThis == 'object' && globalThis) ||
      check(typeof window == 'object' && window) ||
      // eslint-disable-next-line no-restricted-globals -- safe
      check(typeof self == 'object' && self) ||
      check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
      // eslint-disable-next-line no-new-func -- fallback
      (function () { return this; })() || Function('return this')();

    var fails = function (exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };

    // Detect IE8's incomplete defineProperty implementation
    var descriptors = !fails(function () {
      // eslint-disable-next-line es/no-object-defineproperty -- required for testing
      return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
    });

    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

    // Nashorn ~ JDK8 bug
    var NASHORN_BUG = getOwnPropertyDescriptor$1 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

    // `Object.prototype.propertyIsEnumerable` method implementation
    // https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
    var f$4 = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor$1(this, V);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;

    var objectPropertyIsEnumerable = {
    	f: f$4
    };

    var createPropertyDescriptor = function (bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };

    var toString = {}.toString;

    var classofRaw = function (it) {
      return toString.call(it).slice(8, -1);
    };

    var split = ''.split;

    // fallback for non-array-like ES3 and non-enumerable old V8 strings
    var indexedObject = fails(function () {
      // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
      // eslint-disable-next-line no-prototype-builtins -- safe
      return !Object('z').propertyIsEnumerable(0);
    }) ? function (it) {
      return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
    } : Object;

    // `RequireObjectCoercible` abstract operation
    // https://tc39.es/ecma262/#sec-requireobjectcoercible
    var requireObjectCoercible = function (it) {
      if (it == undefined) throw TypeError("Can't call method on " + it);
      return it;
    };

    // toObject with fallback for non-array-like ES3 strings



    var toIndexedObject = function (it) {
      return indexedObject(requireObjectCoercible(it));
    };

    var isObject$1 = function (it) {
      return typeof it === 'object' ? it !== null : typeof it === 'function';
    };

    // `ToPrimitive` abstract operation
    // https://tc39.es/ecma262/#sec-toprimitive
    // instead of the ES6 spec version, we didn't implement @@toPrimitive case
    // and the second argument - flag - preferred type is a string
    var toPrimitive = function (input, PREFERRED_STRING) {
      if (!isObject$1(input)) return input;
      var fn, val;
      if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
      if (typeof (fn = input.valueOf) == 'function' && !isObject$1(val = fn.call(input))) return val;
      if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
      throw TypeError("Can't convert object to primitive value");
    };

    // `ToObject` abstract operation
    // https://tc39.es/ecma262/#sec-toobject
    var toObject = function (argument) {
      return Object(requireObjectCoercible(argument));
    };

    var hasOwnProperty$1 = {}.hasOwnProperty;

    var has$1 = function hasOwn(it, key) {
      return hasOwnProperty$1.call(toObject(it), key);
    };

    var document$1 = global$1.document;
    // typeof document.createElement is 'object' in old IE
    var EXISTS = isObject$1(document$1) && isObject$1(document$1.createElement);

    var documentCreateElement = function (it) {
      return EXISTS ? document$1.createElement(it) : {};
    };

    // Thank's IE8 for his funny defineProperty
    var ie8DomDefine = !descriptors && !fails(function () {
      // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
      return Object.defineProperty(documentCreateElement('div'), 'a', {
        get: function () { return 7; }
      }).a != 7;
    });

    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
    var f$3 = descriptors ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject(O);
      P = toPrimitive(P, true);
      if (ie8DomDefine) try {
        return $getOwnPropertyDescriptor(O, P);
      } catch (error) { /* empty */ }
      if (has$1(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
    };

    var objectGetOwnPropertyDescriptor = {
    	f: f$3
    };

    var anObject = function (it) {
      if (!isObject$1(it)) {
        throw TypeError(String(it) + ' is not an object');
      } return it;
    };

    // eslint-disable-next-line es/no-object-defineproperty -- safe
    var $defineProperty = Object.defineProperty;

    // `Object.defineProperty` method
    // https://tc39.es/ecma262/#sec-object.defineproperty
    var f$2 = descriptors ? $defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPrimitive(P, true);
      anObject(Attributes);
      if (ie8DomDefine) try {
        return $defineProperty(O, P, Attributes);
      } catch (error) { /* empty */ }
      if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
      if ('value' in Attributes) O[P] = Attributes.value;
      return O;
    };

    var objectDefineProperty = {
    	f: f$2
    };

    var createNonEnumerableProperty = descriptors ? function (object, key, value) {
      return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };

    var setGlobal = function (key, value) {
      try {
        createNonEnumerableProperty(global$1, key, value);
      } catch (error) {
        global$1[key] = value;
      } return value;
    };

    var SHARED = '__core-js_shared__';
    var store$1 = global$1[SHARED] || setGlobal(SHARED, {});

    var sharedStore = store$1;

    var functionToString = Function.toString;

    // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
    if (typeof sharedStore.inspectSource != 'function') {
      sharedStore.inspectSource = function (it) {
        return functionToString.call(it);
      };
    }

    var inspectSource = sharedStore.inspectSource;

    var WeakMap$2 = global$1.WeakMap;

    var nativeWeakMap = typeof WeakMap$2 === 'function' && /native code/.test(inspectSource(WeakMap$2));

    var shared = createCommonjsModule(function (module) {
    (module.exports = function (key, value) {
      return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: '3.11.2',
      mode: 'global',
      copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
    });
    });

    var id$1 = 0;
    var postfix = Math.random();

    var uid = function (key) {
      return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id$1 + postfix).toString(36);
    };

    var keys = shared('keys');

    var sharedKey = function (key) {
      return keys[key] || (keys[key] = uid(key));
    };

    var hiddenKeys$1 = {};

    var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
    var WeakMap$1 = global$1.WeakMap;
    var set, get, has;

    var enforce = function (it) {
      return has(it) ? get(it) : set(it, {});
    };

    var getterFor = function (TYPE) {
      return function (it) {
        var state;
        if (!isObject$1(it) || (state = get(it)).type !== TYPE) {
          throw TypeError('Incompatible receiver, ' + TYPE + ' required');
        } return state;
      };
    };

    if (nativeWeakMap) {
      var store = sharedStore.state || (sharedStore.state = new WeakMap$1());
      var wmget = store.get;
      var wmhas = store.has;
      var wmset = store.set;
      set = function (it, metadata) {
        if (wmhas.call(store, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        wmset.call(store, it, metadata);
        return metadata;
      };
      get = function (it) {
        return wmget.call(store, it) || {};
      };
      has = function (it) {
        return wmhas.call(store, it);
      };
    } else {
      var STATE = sharedKey('state');
      hiddenKeys$1[STATE] = true;
      set = function (it, metadata) {
        if (has$1(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        createNonEnumerableProperty(it, STATE, metadata);
        return metadata;
      };
      get = function (it) {
        return has$1(it, STATE) ? it[STATE] : {};
      };
      has = function (it) {
        return has$1(it, STATE);
      };
    }

    var internalState = {
      set: set,
      get: get,
      has: has,
      enforce: enforce,
      getterFor: getterFor
    };

    var redefine = createCommonjsModule(function (module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split('String');

    (module.exports = function (O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;
      var state;
      if (typeof value == 'function') {
        if (typeof key == 'string' && !has$1(value, 'name')) {
          createNonEnumerableProperty(value, 'name', key);
        }
        state = enforceInternalState(value);
        if (!state.source) {
          state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
        }
      }
      if (O === global$1) {
        if (simple) O[key] = value;
        else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }
      if (simple) O[key] = value;
      else createNonEnumerableProperty(O, key, value);
    // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, 'toString', function toString() {
      return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
    });
    });

    var path = global$1;

    var aFunction$1 = function (variable) {
      return typeof variable == 'function' ? variable : undefined;
    };

    var getBuiltIn = function (namespace, method) {
      return arguments.length < 2 ? aFunction$1(path[namespace]) || aFunction$1(global$1[namespace])
        : path[namespace] && path[namespace][method] || global$1[namespace] && global$1[namespace][method];
    };

    var ceil = Math.ceil;
    var floor = Math.floor;

    // `ToInteger` abstract operation
    // https://tc39.es/ecma262/#sec-tointeger
    var toInteger = function (argument) {
      return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
    };

    var min$1 = Math.min;

    // `ToLength` abstract operation
    // https://tc39.es/ecma262/#sec-tolength
    var toLength = function (argument) {
      return argument > 0 ? min$1(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
    };

    var max = Math.max;
    var min = Math.min;

    // Helper for a popular repeating case of the spec:
    // Let integer be ? ToInteger(index).
    // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
    var toAbsoluteIndex = function (index, length) {
      var integer = toInteger(index);
      return integer < 0 ? max(integer + length, 0) : min(integer, length);
    };

    // `Array.prototype.{ indexOf, includes }` methods implementation
    var createMethod$2 = function (IS_INCLUDES) {
      return function ($this, el, fromIndex) {
        var O = toIndexedObject($this);
        var length = toLength(O.length);
        var index = toAbsoluteIndex(fromIndex, length);
        var value;
        // Array#includes uses SameValueZero equality algorithm
        // eslint-disable-next-line no-self-compare -- NaN check
        if (IS_INCLUDES && el != el) while (length > index) {
          value = O[index++];
          // eslint-disable-next-line no-self-compare -- NaN check
          if (value != value) return true;
        // Array#indexOf ignores holes, Array#includes - not
        } else for (;length > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
        } return !IS_INCLUDES && -1;
      };
    };

    var arrayIncludes = {
      // `Array.prototype.includes` method
      // https://tc39.es/ecma262/#sec-array.prototype.includes
      includes: createMethod$2(true),
      // `Array.prototype.indexOf` method
      // https://tc39.es/ecma262/#sec-array.prototype.indexof
      indexOf: createMethod$2(false)
    };

    var indexOf = arrayIncludes.indexOf;


    var objectKeysInternal = function (object, names) {
      var O = toIndexedObject(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O) !has$1(hiddenKeys$1, key) && has$1(O, key) && result.push(key);
      // Don't enum bug & hidden keys
      while (names.length > i) if (has$1(O, key = names[i++])) {
        ~indexOf(result, key) || result.push(key);
      }
      return result;
    };

    // IE8- don't enum bug keys
    var enumBugKeys = [
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf'
    ];

    var hiddenKeys = enumBugKeys.concat('length', 'prototype');

    // `Object.getOwnPropertyNames` method
    // https://tc39.es/ecma262/#sec-object.getownpropertynames
    // eslint-disable-next-line es/no-object-getownpropertynames -- safe
    var f$1 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return objectKeysInternal(O, hiddenKeys);
    };

    var objectGetOwnPropertyNames = {
    	f: f$1
    };

    // eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
    var f = Object.getOwnPropertySymbols;

    var objectGetOwnPropertySymbols = {
    	f: f
    };

    // all object keys, includes non-enumerable and symbols
    var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
      var keys = objectGetOwnPropertyNames.f(anObject(it));
      var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
      return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
    };

    var copyConstructorProperties = function (target, source) {
      var keys = ownKeys(source);
      var defineProperty = objectDefineProperty.f;
      var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!has$1(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
      }
    };

    var replacement = /#|\.prototype\./;

    var isForced = function (feature, detection) {
      var value = data[normalize(feature)];
      return value == POLYFILL ? true
        : value == NATIVE ? false
        : typeof detection == 'function' ? fails(detection)
        : !!detection;
    };

    var normalize = isForced.normalize = function (string) {
      return String(string).replace(replacement, '.').toLowerCase();
    };

    var data = isForced.data = {};
    var NATIVE = isForced.NATIVE = 'N';
    var POLYFILL = isForced.POLYFILL = 'P';

    var isForced_1 = isForced;

    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;






    /*
      options.target      - name of the target object
      options.global      - target is the global object
      options.stat        - export as static methods of target
      options.proto       - export as prototype methods of target
      options.real        - real prototype method for the `pure` version
      options.forced      - export even if the native feature is available
      options.bind        - bind methods to the target, required for the `pure` version
      options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
      options.unsafe      - use the simple assignment of property instead of delete + defineProperty
      options.sham        - add a flag to not completely full polyfills
      options.enumerable  - export as enumerable property
      options.noTargetGet - prevent calling a getter on target
    */
    var _export = function (options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var FORCED, target, key, targetProperty, sourceProperty, descriptor;
      if (GLOBAL) {
        target = global$1;
      } else if (STATIC) {
        target = global$1[TARGET] || setGlobal(TARGET, {});
      } else {
        target = (global$1[TARGET] || {}).prototype;
      }
      if (target) for (key in source) {
        sourceProperty = source[key];
        if (options.noTargetGet) {
          descriptor = getOwnPropertyDescriptor(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];
        FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
        // contained in target
        if (!FORCED && targetProperty !== undefined) {
          if (typeof sourceProperty === typeof targetProperty) continue;
          copyConstructorProperties(sourceProperty, targetProperty);
        }
        // add a flag to not completely full polyfills
        if (options.sham || (targetProperty && targetProperty.sham)) {
          createNonEnumerableProperty(sourceProperty, 'sham', true);
        }
        // extend global
        redefine(target, key, sourceProperty, options);
      }
    };

    var freezing = !fails(function () {
      // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
      return Object.isExtensible(Object.preventExtensions({}));
    });

    var internalMetadata = createCommonjsModule(function (module) {
    var defineProperty = objectDefineProperty.f;



    var METADATA = uid('meta');
    var id = 0;

    // eslint-disable-next-line es/no-object-isextensible -- safe
    var isExtensible = Object.isExtensible || function () {
      return true;
    };

    var setMetadata = function (it) {
      defineProperty(it, METADATA, { value: {
        objectID: 'O' + ++id, // object ID
        weakData: {}          // weak collections IDs
      } });
    };

    var fastKey = function (it, create) {
      // return a primitive with prefix
      if (!isObject$1(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
      if (!has$1(it, METADATA)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return 'F';
        // not necessary to add metadata
        if (!create) return 'E';
        // add missing metadata
        setMetadata(it);
      // return object ID
      } return it[METADATA].objectID;
    };

    var getWeakData = function (it, create) {
      if (!has$1(it, METADATA)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return true;
        // not necessary to add metadata
        if (!create) return false;
        // add missing metadata
        setMetadata(it);
      // return the store of weak collections IDs
      } return it[METADATA].weakData;
    };

    // add metadata on freeze-family methods calling
    var onFreeze = function (it) {
      if (freezing && meta.REQUIRED && isExtensible(it) && !has$1(it, METADATA)) setMetadata(it);
      return it;
    };

    var meta = module.exports = {
      REQUIRED: false,
      fastKey: fastKey,
      getWeakData: getWeakData,
      onFreeze: onFreeze
    };

    hiddenKeys$1[METADATA] = true;
    });

    var engineIsNode = classofRaw(global$1.process) == 'process';

    var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

    var process = global$1.process;
    var versions = process && process.versions;
    var v8 = versions && versions.v8;
    var match, version;

    if (v8) {
      match = v8.split('.');
      version = match[0] + match[1];
    } else if (engineUserAgent) {
      match = engineUserAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = engineUserAgent.match(/Chrome\/(\d+)/);
        if (match) version = match[1];
      }
    }

    var engineV8Version = version && +version;

    // eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
    var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
      // eslint-disable-next-line es/no-symbol -- required for testing
      return !Symbol.sham &&
        // Chrome 38 Symbol has incorrect toString conversion
        // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
        (engineIsNode ? engineV8Version === 38 : engineV8Version > 37 && engineV8Version < 41);
    });

    /* eslint-disable es/no-symbol -- required for testing */

    var useSymbolAsUid = nativeSymbol
      && !Symbol.sham
      && typeof Symbol.iterator == 'symbol';

    var WellKnownSymbolsStore = shared('wks');
    var Symbol$2 = global$1.Symbol;
    var createWellKnownSymbol = useSymbolAsUid ? Symbol$2 : Symbol$2 && Symbol$2.withoutSetter || uid;

    var wellKnownSymbol = function (name) {
      if (!has$1(WellKnownSymbolsStore, name) || !(nativeSymbol || typeof WellKnownSymbolsStore[name] == 'string')) {
        if (nativeSymbol && has$1(Symbol$2, name)) {
          WellKnownSymbolsStore[name] = Symbol$2[name];
        } else {
          WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
        }
      } return WellKnownSymbolsStore[name];
    };

    var iterators = {};

    var ITERATOR$5 = wellKnownSymbol('iterator');
    var ArrayPrototype$1 = Array.prototype;

    // check on default Array iterator
    var isArrayIteratorMethod = function (it) {
      return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$5] === it);
    };

    var aFunction = function (it) {
      if (typeof it != 'function') {
        throw TypeError(String(it) + ' is not a function');
      } return it;
    };

    // optional / simple context binding
    var functionBindContext = function (fn, that, length) {
      aFunction(fn);
      if (that === undefined) return fn;
      switch (length) {
        case 0: return function () {
          return fn.call(that);
        };
        case 1: return function (a) {
          return fn.call(that, a);
        };
        case 2: return function (a, b) {
          return fn.call(that, a, b);
        };
        case 3: return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
      }
      return function (/* ...args */) {
        return fn.apply(that, arguments);
      };
    };

    var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
    var test = {};

    test[TO_STRING_TAG$3] = 'z';

    var toStringTagSupport = String(test) === '[object z]';

    var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
    // ES3 wrong here
    var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

    // fallback for IE11 Script Access Denied error
    var tryGet = function (it, key) {
      try {
        return it[key];
      } catch (error) { /* empty */ }
    };

    // getting tag from ES6+ `Object.prototype.toString`
    var classof = toStringTagSupport ? classofRaw : function (it) {
      var O, tag, result;
      return it === undefined ? 'Undefined' : it === null ? 'Null'
        // @@toStringTag case
        : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
        // builtinTag case
        : CORRECT_ARGUMENTS ? classofRaw(O)
        // ES3 arguments fallback
        : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
    };

    var ITERATOR$4 = wellKnownSymbol('iterator');

    var getIteratorMethod = function (it) {
      if (it != undefined) return it[ITERATOR$4]
        || it['@@iterator']
        || iterators[classof(it)];
    };

    var iteratorClose = function (iterator) {
      var returnMethod = iterator['return'];
      if (returnMethod !== undefined) {
        return anObject(returnMethod.call(iterator)).value;
      }
    };

    var Result = function (stopped, result) {
      this.stopped = stopped;
      this.result = result;
    };

    var iterate = function (iterable, unboundFunction, options) {
      var that = options && options.that;
      var AS_ENTRIES = !!(options && options.AS_ENTRIES);
      var IS_ITERATOR = !!(options && options.IS_ITERATOR);
      var INTERRUPTED = !!(options && options.INTERRUPTED);
      var fn = functionBindContext(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
      var iterator, iterFn, index, length, result, next, step;

      var stop = function (condition) {
        if (iterator) iteratorClose(iterator);
        return new Result(true, condition);
      };

      var callFn = function (value) {
        if (AS_ENTRIES) {
          anObject(value);
          return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
        } return INTERRUPTED ? fn(value, stop) : fn(value);
      };

      if (IS_ITERATOR) {
        iterator = iterable;
      } else {
        iterFn = getIteratorMethod(iterable);
        if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
        // optimisation for array iterators
        if (isArrayIteratorMethod(iterFn)) {
          for (index = 0, length = toLength(iterable.length); length > index; index++) {
            result = callFn(iterable[index]);
            if (result && result instanceof Result) return result;
          } return new Result(false);
        }
        iterator = iterFn.call(iterable);
      }

      next = iterator.next;
      while (!(step = next.call(iterator)).done) {
        try {
          result = callFn(step.value);
        } catch (error) {
          iteratorClose(iterator);
          throw error;
        }
        if (typeof result == 'object' && result && result instanceof Result) return result;
      } return new Result(false);
    };

    var anInstance = function (it, Constructor, name) {
      if (!(it instanceof Constructor)) {
        throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
      } return it;
    };

    var ITERATOR$3 = wellKnownSymbol('iterator');
    var SAFE_CLOSING = false;

    try {
      var called = 0;
      var iteratorWithReturn = {
        next: function () {
          return { done: !!called++ };
        },
        'return': function () {
          SAFE_CLOSING = true;
        }
      };
      iteratorWithReturn[ITERATOR$3] = function () {
        return this;
      };
      // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
      Array.from(iteratorWithReturn, function () { throw 2; });
    } catch (error) { /* empty */ }

    var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
      if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
      var ITERATION_SUPPORT = false;
      try {
        var object = {};
        object[ITERATOR$3] = function () {
          return {
            next: function () {
              return { done: ITERATION_SUPPORT = true };
            }
          };
        };
        exec(object);
      } catch (error) { /* empty */ }
      return ITERATION_SUPPORT;
    };

    var defineProperty$2 = objectDefineProperty.f;



    var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');

    var setToStringTag = function (it, TAG, STATIC) {
      if (it && !has$1(it = STATIC ? it : it.prototype, TO_STRING_TAG$1)) {
        defineProperty$2(it, TO_STRING_TAG$1, { configurable: true, value: TAG });
      }
    };

    var aPossiblePrototype = function (it) {
      if (!isObject$1(it) && it !== null) {
        throw TypeError("Can't set " + String(it) + ' as a prototype');
      } return it;
    };

    /* eslint-disable no-proto -- safe */

    // `Object.setPrototypeOf` method
    // https://tc39.es/ecma262/#sec-object.setprototypeof
    // Works with __proto__ only. Old v8 can't work with null proto objects.
    // eslint-disable-next-line es/no-object-setprototypeof -- safe
    var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
      var CORRECT_SETTER = false;
      var test = {};
      var setter;
      try {
        // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
        setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
        setter.call(test, []);
        CORRECT_SETTER = test instanceof Array;
      } catch (error) { /* empty */ }
      return function setPrototypeOf(O, proto) {
        anObject(O);
        aPossiblePrototype(proto);
        if (CORRECT_SETTER) setter.call(O, proto);
        else O.__proto__ = proto;
        return O;
      };
    }() : undefined);

    // makes subclassing work correct for wrapped built-ins
    var inheritIfRequired = function ($this, dummy, Wrapper) {
      var NewTarget, NewTargetPrototype;
      if (
        // it can work only with native `setPrototypeOf`
        objectSetPrototypeOf &&
        // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
        typeof (NewTarget = dummy.constructor) == 'function' &&
        NewTarget !== Wrapper &&
        isObject$1(NewTargetPrototype = NewTarget.prototype) &&
        NewTargetPrototype !== Wrapper.prototype
      ) objectSetPrototypeOf($this, NewTargetPrototype);
      return $this;
    };

    var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
      var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
      var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
      var ADDER = IS_MAP ? 'set' : 'add';
      var NativeConstructor = global$1[CONSTRUCTOR_NAME];
      var NativePrototype = NativeConstructor && NativeConstructor.prototype;
      var Constructor = NativeConstructor;
      var exported = {};

      var fixMethod = function (KEY) {
        var nativeMethod = NativePrototype[KEY];
        redefine(NativePrototype, KEY,
          KEY == 'add' ? function add(value) {
            nativeMethod.call(this, value === 0 ? 0 : value);
            return this;
          } : KEY == 'delete' ? function (key) {
            return IS_WEAK && !isObject$1(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
          } : KEY == 'get' ? function get(key) {
            return IS_WEAK && !isObject$1(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
          } : KEY == 'has' ? function has(key) {
            return IS_WEAK && !isObject$1(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
          } : function set(key, value) {
            nativeMethod.call(this, key === 0 ? 0 : key, value);
            return this;
          }
        );
      };

      var REPLACE = isForced_1(
        CONSTRUCTOR_NAME,
        typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
          new NativeConstructor().entries().next();
        }))
      );

      if (REPLACE) {
        // create collection constructor
        Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
        internalMetadata.REQUIRED = true;
      } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
        var instance = new Constructor();
        // early implementations not supports chaining
        var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
        // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
        var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
        // most early implementations doesn't supports iterables, most modern - not close it correctly
        // eslint-disable-next-line no-new -- required for testing
        var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
        // for early implementations -0 and +0 not the same
        var BUGGY_ZERO = !IS_WEAK && fails(function () {
          // V8 ~ Chromium 42- fails only with 5+ elements
          var $instance = new NativeConstructor();
          var index = 5;
          while (index--) $instance[ADDER](index, index);
          return !$instance.has(-0);
        });

        if (!ACCEPT_ITERABLES) {
          Constructor = wrapper(function (dummy, iterable) {
            anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
            var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
            if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
            return that;
          });
          Constructor.prototype = NativePrototype;
          NativePrototype.constructor = Constructor;
        }

        if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
          fixMethod('delete');
          fixMethod('has');
          IS_MAP && fixMethod('get');
        }

        if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

        // weak collections should not contains .clear method
        if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
      }

      exported[CONSTRUCTOR_NAME] = Constructor;
      _export({ global: true, forced: Constructor != NativeConstructor }, exported);

      setToStringTag(Constructor, CONSTRUCTOR_NAME);

      if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

      return Constructor;
    };

    // `Object.keys` method
    // https://tc39.es/ecma262/#sec-object.keys
    // eslint-disable-next-line es/no-object-keys -- safe
    var objectKeys = Object.keys || function keys(O) {
      return objectKeysInternal(O, enumBugKeys);
    };

    // `Object.defineProperties` method
    // https://tc39.es/ecma262/#sec-object.defineproperties
    // eslint-disable-next-line es/no-object-defineproperties -- safe
    var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
      anObject(O);
      var keys = objectKeys(Properties);
      var length = keys.length;
      var index = 0;
      var key;
      while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
      return O;
    };

    var html = getBuiltIn('document', 'documentElement');

    var GT = '>';
    var LT = '<';
    var PROTOTYPE = 'prototype';
    var SCRIPT = 'script';
    var IE_PROTO$1 = sharedKey('IE_PROTO');

    var EmptyConstructor = function () { /* empty */ };

    var scriptTag = function (content) {
      return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
    };

    // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
    var NullProtoObjectViaActiveX = function (activeXDocument) {
      activeXDocument.write(scriptTag(''));
      activeXDocument.close();
      var temp = activeXDocument.parentWindow.Object;
      activeXDocument = null; // avoid memory leak
      return temp;
    };

    // Create object with fake `null` prototype: use iframe Object with cleared prototype
    var NullProtoObjectViaIFrame = function () {
      // Thrash, waste and sodomy: IE GC bug
      var iframe = documentCreateElement('iframe');
      var JS = 'java' + SCRIPT + ':';
      var iframeDocument;
      iframe.style.display = 'none';
      html.appendChild(iframe);
      // https://github.com/zloirock/core-js/issues/475
      iframe.src = String(JS);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(scriptTag('document.F=Object'));
      iframeDocument.close();
      return iframeDocument.F;
    };

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    // avoid IE GC bug
    var activeXDocument;
    var NullProtoObject = function () {
      try {
        /* global ActiveXObject -- old IE */
        activeXDocument = document.domain && new ActiveXObject('htmlfile');
      } catch (error) { /* ignore */ }
      NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
      var length = enumBugKeys.length;
      while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
      return NullProtoObject();
    };

    hiddenKeys$1[IE_PROTO$1] = true;

    // `Object.create` method
    // https://tc39.es/ecma262/#sec-object.create
    var objectCreate = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        EmptyConstructor[PROTOTYPE] = anObject(O);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null;
        // add "__proto__" for Object.getPrototypeOf polyfill
        result[IE_PROTO$1] = O;
      } else result = NullProtoObject();
      return Properties === undefined ? result : objectDefineProperties(result, Properties);
    };

    var redefineAll = function (target, src, options) {
      for (var key in src) redefine(target, key, src[key], options);
      return target;
    };

    var correctPrototypeGetter = !fails(function () {
      function F() { /* empty */ }
      F.prototype.constructor = null;
      // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
      return Object.getPrototypeOf(new F()) !== F.prototype;
    });

    var IE_PROTO = sharedKey('IE_PROTO');
    var ObjectPrototype = Object.prototype;

    // `Object.getPrototypeOf` method
    // https://tc39.es/ecma262/#sec-object.getprototypeof
    // eslint-disable-next-line es/no-object-getprototypeof -- safe
    var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
      O = toObject(O);
      if (has$1(O, IE_PROTO)) return O[IE_PROTO];
      if (typeof O.constructor == 'function' && O instanceof O.constructor) {
        return O.constructor.prototype;
      } return O instanceof Object ? ObjectPrototype : null;
    };

    var ITERATOR$2 = wellKnownSymbol('iterator');
    var BUGGY_SAFARI_ITERATORS$1 = false;

    var returnThis$2 = function () { return this; };

    // `%IteratorPrototype%` object
    // https://tc39.es/ecma262/#sec-%iteratorprototype%-object
    var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

    /* eslint-disable es/no-array-prototype-keys -- safe */
    if ([].keys) {
      arrayIterator = [].keys();
      // Safari 8 has buggy iterators w/o `next`
      if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
      else {
        PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
        if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
      }
    }

    var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails(function () {
      var test = {};
      // FF44- legacy iterators case
      return IteratorPrototype$2[ITERATOR$2].call(test) !== test;
    });

    if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

    // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
    if (!has$1(IteratorPrototype$2, ITERATOR$2)) {
      createNonEnumerableProperty(IteratorPrototype$2, ITERATOR$2, returnThis$2);
    }

    var iteratorsCore = {
      IteratorPrototype: IteratorPrototype$2,
      BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
    };

    var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





    var returnThis$1 = function () { return this; };

    var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
      var TO_STRING_TAG = NAME + ' Iterator';
      IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
      setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
      iterators[TO_STRING_TAG] = returnThis$1;
      return IteratorConstructor;
    };

    var IteratorPrototype = iteratorsCore.IteratorPrototype;
    var BUGGY_SAFARI_ITERATORS = iteratorsCore.BUGGY_SAFARI_ITERATORS;
    var ITERATOR$1 = wellKnownSymbol('iterator');
    var KEYS = 'keys';
    var VALUES = 'values';
    var ENTRIES = 'entries';

    var returnThis = function () { return this; };

    var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
      createIteratorConstructor(IteratorConstructor, NAME, next);

      var getIterationMethod = function (KIND) {
        if (KIND === DEFAULT && defaultIterator) return defaultIterator;
        if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
        switch (KIND) {
          case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
          case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
          case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
        } return function () { return new IteratorConstructor(this); };
      };

      var TO_STRING_TAG = NAME + ' Iterator';
      var INCORRECT_VALUES_NAME = false;
      var IterablePrototype = Iterable.prototype;
      var nativeIterator = IterablePrototype[ITERATOR$1]
        || IterablePrototype['@@iterator']
        || DEFAULT && IterablePrototype[DEFAULT];
      var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
      var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
      var CurrentIteratorPrototype, methods, KEY;

      // fix native
      if (anyNativeIterator) {
        CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
        if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
          if (objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
            if (objectSetPrototypeOf) {
              objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
            } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
              createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis);
            }
          }
          // Set @@toStringTag to native iterators
          setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
        }
      }

      // fix Array#{values, @@iterator}.name in V8 / FF
      if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
        INCORRECT_VALUES_NAME = true;
        defaultIterator = function values() { return nativeIterator.call(this); };
      }

      // define iterator
      if (IterablePrototype[ITERATOR$1] !== defaultIterator) {
        createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
      }
      iterators[NAME] = defaultIterator;

      // export additional methods
      if (DEFAULT) {
        methods = {
          values: getIterationMethod(VALUES),
          keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
          entries: getIterationMethod(ENTRIES)
        };
        if (FORCED) for (KEY in methods) {
          if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
            redefine(IterablePrototype, KEY, methods[KEY]);
          }
        } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
      }

      return methods;
    };

    var SPECIES$1 = wellKnownSymbol('species');

    var setSpecies = function (CONSTRUCTOR_NAME) {
      var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
      var defineProperty = objectDefineProperty.f;

      if (descriptors && Constructor && !Constructor[SPECIES$1]) {
        defineProperty(Constructor, SPECIES$1, {
          configurable: true,
          get: function () { return this; }
        });
      }
    };

    var defineProperty$1 = objectDefineProperty.f;








    var fastKey = internalMetadata.fastKey;


    var setInternalState$3 = internalState.set;
    var internalStateGetterFor$1 = internalState.getterFor;

    var collectionStrong = {
      getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
        var C = wrapper(function (that, iterable) {
          anInstance(that, C, CONSTRUCTOR_NAME);
          setInternalState$3(that, {
            type: CONSTRUCTOR_NAME,
            index: objectCreate(null),
            first: undefined,
            last: undefined,
            size: 0
          });
          if (!descriptors) that.size = 0;
          if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
        });

        var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

        var define = function (that, key, value) {
          var state = getInternalState(that);
          var entry = getEntry(that, key);
          var previous, index;
          // change existing entry
          if (entry) {
            entry.value = value;
          // create new entry
          } else {
            state.last = entry = {
              index: index = fastKey(key, true),
              key: key,
              value: value,
              previous: previous = state.last,
              next: undefined,
              removed: false
            };
            if (!state.first) state.first = entry;
            if (previous) previous.next = entry;
            if (descriptors) state.size++;
            else that.size++;
            // add to index
            if (index !== 'F') state.index[index] = entry;
          } return that;
        };

        var getEntry = function (that, key) {
          var state = getInternalState(that);
          // fast case
          var index = fastKey(key);
          var entry;
          if (index !== 'F') return state.index[index];
          // frozen object case
          for (entry = state.first; entry; entry = entry.next) {
            if (entry.key == key) return entry;
          }
        };

        redefineAll(C.prototype, {
          // 23.1.3.1 Map.prototype.clear()
          // 23.2.3.2 Set.prototype.clear()
          clear: function clear() {
            var that = this;
            var state = getInternalState(that);
            var data = state.index;
            var entry = state.first;
            while (entry) {
              entry.removed = true;
              if (entry.previous) entry.previous = entry.previous.next = undefined;
              delete data[entry.index];
              entry = entry.next;
            }
            state.first = state.last = undefined;
            if (descriptors) state.size = 0;
            else that.size = 0;
          },
          // 23.1.3.3 Map.prototype.delete(key)
          // 23.2.3.4 Set.prototype.delete(value)
          'delete': function (key) {
            var that = this;
            var state = getInternalState(that);
            var entry = getEntry(that, key);
            if (entry) {
              var next = entry.next;
              var prev = entry.previous;
              delete state.index[entry.index];
              entry.removed = true;
              if (prev) prev.next = next;
              if (next) next.previous = prev;
              if (state.first == entry) state.first = next;
              if (state.last == entry) state.last = prev;
              if (descriptors) state.size--;
              else that.size--;
            } return !!entry;
          },
          // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
          // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
          forEach: function forEach(callbackfn /* , that = undefined */) {
            var state = getInternalState(this);
            var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
            var entry;
            while (entry = entry ? entry.next : state.first) {
              boundFunction(entry.value, entry.key, this);
              // revert to the last existing entry
              while (entry && entry.removed) entry = entry.previous;
            }
          },
          // 23.1.3.7 Map.prototype.has(key)
          // 23.2.3.7 Set.prototype.has(value)
          has: function has(key) {
            return !!getEntry(this, key);
          }
        });

        redefineAll(C.prototype, IS_MAP ? {
          // 23.1.3.6 Map.prototype.get(key)
          get: function get(key) {
            var entry = getEntry(this, key);
            return entry && entry.value;
          },
          // 23.1.3.9 Map.prototype.set(key, value)
          set: function set(key, value) {
            return define(this, key === 0 ? 0 : key, value);
          }
        } : {
          // 23.2.3.1 Set.prototype.add(value)
          add: function add(value) {
            return define(this, value = value === 0 ? 0 : value, value);
          }
        });
        if (descriptors) defineProperty$1(C.prototype, 'size', {
          get: function () {
            return getInternalState(this).size;
          }
        });
        return C;
      },
      setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
        var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
        var getInternalCollectionState = internalStateGetterFor$1(CONSTRUCTOR_NAME);
        var getInternalIteratorState = internalStateGetterFor$1(ITERATOR_NAME);
        // add .keys, .values, .entries, [@@iterator]
        // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
        defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
          setInternalState$3(this, {
            type: ITERATOR_NAME,
            target: iterated,
            state: getInternalCollectionState(iterated),
            kind: kind,
            last: undefined
          });
        }, function () {
          var state = getInternalIteratorState(this);
          var kind = state.kind;
          var entry = state.last;
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
          // get next entry
          if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
            // or finish the iteration
            state.target = undefined;
            return { value: undefined, done: true };
          }
          // return step by kind
          if (kind == 'keys') return { value: entry.key, done: false };
          if (kind == 'values') return { value: entry.value, done: false };
          return { value: [entry.key, entry.value], done: false };
        }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

        // add [@@species], 23.1.2.2, 23.2.2.2
        setSpecies(CONSTRUCTOR_NAME);
      }
    };

    // `Map` constructor
    // https://tc39.es/ecma262/#sec-map-objects
    collection('Map', function (init) {
      return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
    }, collectionStrong);

    // `Object.prototype.toString` method implementation
    // https://tc39.es/ecma262/#sec-object.prototype.tostring
    var objectToString$1 = toStringTagSupport ? {}.toString : function toString() {
      return '[object ' + classof(this) + ']';
    };

    // `Object.prototype.toString` method
    // https://tc39.es/ecma262/#sec-object.prototype.tostring
    if (!toStringTagSupport) {
      redefine(Object.prototype, 'toString', objectToString$1, { unsafe: true });
    }

    // `String.prototype.{ codePointAt, at }` methods implementation
    var createMethod$1 = function (CONVERT_TO_STRING) {
      return function ($this, pos) {
        var S = String(requireObjectCoercible($this));
        var position = toInteger(pos);
        var size = S.length;
        var first, second;
        if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
        first = S.charCodeAt(position);
        return first < 0xD800 || first > 0xDBFF || position + 1 === size
          || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
            ? CONVERT_TO_STRING ? S.charAt(position) : first
            : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
      };
    };

    var stringMultibyte = {
      // `String.prototype.codePointAt` method
      // https://tc39.es/ecma262/#sec-string.prototype.codepointat
      codeAt: createMethod$1(false),
      // `String.prototype.at` method
      // https://github.com/mathiasbynens/String.prototype.at
      charAt: createMethod$1(true)
    };

    var charAt = stringMultibyte.charAt;



    var STRING_ITERATOR = 'String Iterator';
    var setInternalState$2 = internalState.set;
    var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

    // `String.prototype[@@iterator]` method
    // https://tc39.es/ecma262/#sec-string.prototype-@@iterator
    defineIterator(String, 'String', function (iterated) {
      setInternalState$2(this, {
        type: STRING_ITERATOR,
        string: String(iterated),
        index: 0
      });
    // `%StringIteratorPrototype%.next` method
    // https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
    }, function next() {
      var state = getInternalState$1(this);
      var string = state.string;
      var index = state.index;
      var point;
      if (index >= string.length) return { value: undefined, done: true };
      point = charAt(string, index);
      state.index += point.length;
      return { value: point, done: false };
    });

    // iterable DOM collections
    // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
    var domIterables = {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0
    };

    var UNSCOPABLES = wellKnownSymbol('unscopables');
    var ArrayPrototype = Array.prototype;

    // Array.prototype[@@unscopables]
    // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
    if (ArrayPrototype[UNSCOPABLES] == undefined) {
      objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
        configurable: true,
        value: objectCreate(null)
      });
    }

    // add a key to Array.prototype[@@unscopables]
    var addToUnscopables = function (key) {
      ArrayPrototype[UNSCOPABLES][key] = true;
    };

    var ARRAY_ITERATOR = 'Array Iterator';
    var setInternalState$1 = internalState.set;
    var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

    // `Array.prototype.entries` method
    // https://tc39.es/ecma262/#sec-array.prototype.entries
    // `Array.prototype.keys` method
    // https://tc39.es/ecma262/#sec-array.prototype.keys
    // `Array.prototype.values` method
    // https://tc39.es/ecma262/#sec-array.prototype.values
    // `Array.prototype[@@iterator]` method
    // https://tc39.es/ecma262/#sec-array.prototype-@@iterator
    // `CreateArrayIterator` internal method
    // https://tc39.es/ecma262/#sec-createarrayiterator
    var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
      setInternalState$1(this, {
        type: ARRAY_ITERATOR,
        target: toIndexedObject(iterated), // target
        index: 0,                          // next index
        kind: kind                         // kind
      });
    // `%ArrayIteratorPrototype%.next` method
    // https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
    }, function () {
      var state = getInternalState(this);
      var target = state.target;
      var kind = state.kind;
      var index = state.index++;
      if (!target || index >= target.length) {
        state.target = undefined;
        return { value: undefined, done: true };
      }
      if (kind == 'keys') return { value: index, done: false };
      if (kind == 'values') return { value: target[index], done: false };
      return { value: [index, target[index]], done: false };
    }, 'values');

    // argumentsList[@@iterator] is %ArrayProto_values%
    // https://tc39.es/ecma262/#sec-createunmappedargumentsobject
    // https://tc39.es/ecma262/#sec-createmappedargumentsobject
    iterators.Arguments = iterators.Array;

    // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
    addToUnscopables('keys');
    addToUnscopables('values');
    addToUnscopables('entries');

    var ITERATOR = wellKnownSymbol('iterator');
    var TO_STRING_TAG = wellKnownSymbol('toStringTag');
    var ArrayValues = es_array_iterator.values;

    for (var COLLECTION_NAME in domIterables) {
      var Collection = global$1[COLLECTION_NAME];
      var CollectionPrototype = Collection && Collection.prototype;
      if (CollectionPrototype) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
          createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
        } catch (error) {
          CollectionPrototype[ITERATOR] = ArrayValues;
        }
        if (!CollectionPrototype[TO_STRING_TAG]) {
          createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
        }
        if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
          // some Chrome versions have non-configurable methods on DOMTokenList
          if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
            createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
          } catch (error) {
            CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
          }
        }
      }
    }

    path.Map;

    // `Set` constructor
    // https://tc39.es/ecma262/#sec-set-objects
    collection('Set', function (init) {
      return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
    }, collectionStrong);

    path.Set;

    // `IsArray` abstract operation
    // https://tc39.es/ecma262/#sec-isarray
    // eslint-disable-next-line es/no-array-isarray -- safe
    var isArray = Array.isArray || function isArray(arg) {
      return classofRaw(arg) == 'Array';
    };

    var SPECIES = wellKnownSymbol('species');

    // `ArraySpeciesCreate` abstract operation
    // https://tc39.es/ecma262/#sec-arrayspeciescreate
    var arraySpeciesCreate = function (originalArray, length) {
      var C;
      if (isArray(originalArray)) {
        C = originalArray.constructor;
        // cross-realm fallback
        if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
        else if (isObject$1(C)) {
          C = C[SPECIES];
          if (C === null) C = undefined;
        }
      } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
    };

    var push = [].push;

    // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
    var createMethod = function (TYPE) {
      var IS_MAP = TYPE == 1;
      var IS_FILTER = TYPE == 2;
      var IS_SOME = TYPE == 3;
      var IS_EVERY = TYPE == 4;
      var IS_FIND_INDEX = TYPE == 6;
      var IS_FILTER_OUT = TYPE == 7;
      var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
      return function ($this, callbackfn, that, specificCreate) {
        var O = toObject($this);
        var self = indexedObject(O);
        var boundFunction = functionBindContext(callbackfn, that, 3);
        var length = toLength(self.length);
        var index = 0;
        var create = specificCreate || arraySpeciesCreate;
        var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
        var value, result;
        for (;length > index; index++) if (NO_HOLES || index in self) {
          value = self[index];
          result = boundFunction(value, index, O);
          if (TYPE) {
            if (IS_MAP) target[index] = result; // map
            else if (result) switch (TYPE) {
              case 3: return true;              // some
              case 5: return value;             // find
              case 6: return index;             // findIndex
              case 2: push.call(target, value); // filter
            } else switch (TYPE) {
              case 4: return false;             // every
              case 7: push.call(target, value); // filterOut
            }
          }
        }
        return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
      };
    };

    var arrayIteration = {
      // `Array.prototype.forEach` method
      // https://tc39.es/ecma262/#sec-array.prototype.foreach
      forEach: createMethod(0),
      // `Array.prototype.map` method
      // https://tc39.es/ecma262/#sec-array.prototype.map
      map: createMethod(1),
      // `Array.prototype.filter` method
      // https://tc39.es/ecma262/#sec-array.prototype.filter
      filter: createMethod(2),
      // `Array.prototype.some` method
      // https://tc39.es/ecma262/#sec-array.prototype.some
      some: createMethod(3),
      // `Array.prototype.every` method
      // https://tc39.es/ecma262/#sec-array.prototype.every
      every: createMethod(4),
      // `Array.prototype.find` method
      // https://tc39.es/ecma262/#sec-array.prototype.find
      find: createMethod(5),
      // `Array.prototype.findIndex` method
      // https://tc39.es/ecma262/#sec-array.prototype.findIndex
      findIndex: createMethod(6),
      // `Array.prototype.filterOut` method
      // https://github.com/tc39/proposal-array-filtering
      filterOut: createMethod(7)
    };

    var getWeakData = internalMetadata.getWeakData;








    var setInternalState = internalState.set;
    var internalStateGetterFor = internalState.getterFor;
    var find = arrayIteration.find;
    var findIndex = arrayIteration.findIndex;
    var id = 0;

    // fallback for uncaught frozen keys
    var uncaughtFrozenStore = function (store) {
      return store.frozen || (store.frozen = new UncaughtFrozenStore());
    };

    var UncaughtFrozenStore = function () {
      this.entries = [];
    };

    var findUncaughtFrozen = function (store, key) {
      return find(store.entries, function (it) {
        return it[0] === key;
      });
    };

    UncaughtFrozenStore.prototype = {
      get: function (key) {
        var entry = findUncaughtFrozen(this, key);
        if (entry) return entry[1];
      },
      has: function (key) {
        return !!findUncaughtFrozen(this, key);
      },
      set: function (key, value) {
        var entry = findUncaughtFrozen(this, key);
        if (entry) entry[1] = value;
        else this.entries.push([key, value]);
      },
      'delete': function (key) {
        var index = findIndex(this.entries, function (it) {
          return it[0] === key;
        });
        if (~index) this.entries.splice(index, 1);
        return !!~index;
      }
    };

    var collectionWeak = {
      getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
        var C = wrapper(function (that, iterable) {
          anInstance(that, C, CONSTRUCTOR_NAME);
          setInternalState(that, {
            type: CONSTRUCTOR_NAME,
            id: id++,
            frozen: undefined
          });
          if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
        });

        var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

        var define = function (that, key, value) {
          var state = getInternalState(that);
          var data = getWeakData(anObject(key), true);
          if (data === true) uncaughtFrozenStore(state).set(key, value);
          else data[state.id] = value;
          return that;
        };

        redefineAll(C.prototype, {
          // 23.3.3.2 WeakMap.prototype.delete(key)
          // 23.4.3.3 WeakSet.prototype.delete(value)
          'delete': function (key) {
            var state = getInternalState(this);
            if (!isObject$1(key)) return false;
            var data = getWeakData(key);
            if (data === true) return uncaughtFrozenStore(state)['delete'](key);
            return data && has$1(data, state.id) && delete data[state.id];
          },
          // 23.3.3.4 WeakMap.prototype.has(key)
          // 23.4.3.4 WeakSet.prototype.has(value)
          has: function has(key) {
            var state = getInternalState(this);
            if (!isObject$1(key)) return false;
            var data = getWeakData(key);
            if (data === true) return uncaughtFrozenStore(state).has(key);
            return data && has$1(data, state.id);
          }
        });

        redefineAll(C.prototype, IS_MAP ? {
          // 23.3.3.3 WeakMap.prototype.get(key)
          get: function get(key) {
            var state = getInternalState(this);
            if (isObject$1(key)) {
              var data = getWeakData(key);
              if (data === true) return uncaughtFrozenStore(state).get(key);
              return data ? data[state.id] : undefined;
            }
          },
          // 23.3.3.5 WeakMap.prototype.set(key, value)
          set: function set(key, value) {
            return define(this, key, value);
          }
        } : {
          // 23.4.3.1 WeakSet.prototype.add(value)
          add: function add(value) {
            return define(this, value, true);
          }
        });

        return C;
      }
    };

    createCommonjsModule(function (module) {






    var enforceIternalState = internalState.enforce;


    var IS_IE11 = !global$1.ActiveXObject && 'ActiveXObject' in global$1;
    // eslint-disable-next-line es/no-object-isextensible -- safe
    var isExtensible = Object.isExtensible;
    var InternalWeakMap;

    var wrapper = function (init) {
      return function WeakMap() {
        return init(this, arguments.length ? arguments[0] : undefined);
      };
    };

    // `WeakMap` constructor
    // https://tc39.es/ecma262/#sec-weakmap-constructor
    var $WeakMap = module.exports = collection('WeakMap', wrapper, collectionWeak);

    // IE11 WeakMap frozen keys fix
    // We can't use feature detection because it crash some old IE builds
    // https://github.com/zloirock/core-js/issues/485
    if (nativeWeakMap && IS_IE11) {
      InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
      internalMetadata.REQUIRED = true;
      var WeakMapPrototype = $WeakMap.prototype;
      var nativeDelete = WeakMapPrototype['delete'];
      var nativeHas = WeakMapPrototype.has;
      var nativeGet = WeakMapPrototype.get;
      var nativeSet = WeakMapPrototype.set;
      redefineAll(WeakMapPrototype, {
        'delete': function (key) {
          if (isObject$1(key) && !isExtensible(key)) {
            var state = enforceIternalState(this);
            if (!state.frozen) state.frozen = new InternalWeakMap();
            return nativeDelete.call(this, key) || state.frozen['delete'](key);
          } return nativeDelete.call(this, key);
        },
        has: function has(key) {
          if (isObject$1(key) && !isExtensible(key)) {
            var state = enforceIternalState(this);
            if (!state.frozen) state.frozen = new InternalWeakMap();
            return nativeHas.call(this, key) || state.frozen.has(key);
          } return nativeHas.call(this, key);
        },
        get: function get(key) {
          if (isObject$1(key) && !isExtensible(key)) {
            var state = enforceIternalState(this);
            if (!state.frozen) state.frozen = new InternalWeakMap();
            return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
          } return nativeGet.call(this, key);
        },
        set: function set(key, value) {
          if (isObject$1(key) && !isExtensible(key)) {
            var state = enforceIternalState(this);
            if (!state.frozen) state.frozen = new InternalWeakMap();
            nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
          } else nativeSet.call(this, key, value);
          return this;
        }
      });
    }
    });

    path.WeakMap;

    // call something on iterator step with safe closing on error
    var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
      try {
        return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
      // 7.4.6 IteratorClose(iterator, completion)
      } catch (error) {
        iteratorClose(iterator);
        throw error;
      }
    };

    var createProperty = function (object, key, value) {
      var propertyKey = toPrimitive(key);
      if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
      else object[propertyKey] = value;
    };

    // `Array.from` method implementation
    // https://tc39.es/ecma262/#sec-array.from
    var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
      var O = toObject(arrayLike);
      var C = typeof this == 'function' ? this : Array;
      var argumentsLength = arguments.length;
      var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iteratorMethod = getIteratorMethod(O);
      var index = 0;
      var length, result, step, iterator, next, value;
      if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
      // if the target is not iterable or it's an array with the default iterator - use a simple case
      if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
        iterator = iteratorMethod.call(O);
        next = iterator.next;
        result = new C();
        for (;!(step = next.call(iterator)).done; index++) {
          value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
          createProperty(result, index, value);
        }
      } else {
        length = toLength(O.length);
        result = new C(length);
        for (;length > index; index++) {
          value = mapping ? mapfn(O[index], index) : O[index];
          createProperty(result, index, value);
        }
      }
      result.length = index;
      return result;
    };

    var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
      // eslint-disable-next-line es/no-array-from -- required for testing
      Array.from(iterable);
    });

    // `Array.from` method
    // https://tc39.es/ecma262/#sec-array.from
    _export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
      from: arrayFrom
    });

    path.Array.from;

    // eslint-disable-next-line es/no-object-assign -- safe
    var $assign = Object.assign;
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    var defineProperty = Object.defineProperty;

    // `Object.assign` method
    // https://tc39.es/ecma262/#sec-object.assign
    var objectAssign = !$assign || fails(function () {
      // should have correct order of operations (Edge bug)
      if (descriptors && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
        enumerable: true,
        get: function () {
          defineProperty(this, 'b', {
            value: 3,
            enumerable: false
          });
        }
      }), { b: 2 })).b !== 1) return true;
      // should work with symbols and should have deterministic property order (V8 bug)
      var A = {};
      var B = {};
      // eslint-disable-next-line es/no-symbol -- safe
      var symbol = Symbol();
      var alphabet = 'abcdefghijklmnopqrst';
      A[symbol] = 7;
      alphabet.split('').forEach(function (chr) { B[chr] = chr; });
      return $assign({}, A)[symbol] != 7 || objectKeys($assign({}, B)).join('') != alphabet;
    }) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
      var T = toObject(target);
      var argumentsLength = arguments.length;
      var index = 1;
      var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
      var propertyIsEnumerable = objectPropertyIsEnumerable.f;
      while (argumentsLength > index) {
        var S = indexedObject(arguments[index++]);
        var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
        var length = keys.length;
        var j = 0;
        var key;
        while (length > j) {
          key = keys[j++];
          if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
        }
      } return T;
    } : $assign;

    // `Object.assign` method
    // https://tc39.es/ecma262/#sec-object.assign
    // eslint-disable-next-line es/no-object-assign -- required for testing
    _export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
      assign: objectAssign
    });

    path.Object.assign;

    /**
     * The base implementation of `_.clamp` which doesn't coerce arguments.
     *
     * @private
     * @param {number} number The number to clamp.
     * @param {number} [lower] The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the clamped number.
     */
    function baseClamp(number, lower, upper) {
      if (number === number) {
        if (upper !== undefined) {
          number = number <= upper ? number : upper;
        }
        if (lower !== undefined) {
          number = number >= lower ? number : lower;
        }
      }
      return number;
    }

    /** Used to match a single whitespace character. */
    var reWhitespace = /\s/;

    /**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
     * character of `string`.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {number} Returns the index of the last non-whitespace character.
     */
    function trimmedEndIndex(string) {
      var index = string.length;

      while (index-- && reWhitespace.test(string.charAt(index))) {}
      return index;
    }

    /** Used to match leading whitespace. */
    var reTrimStart = /^\s+/;

    /**
     * The base implementation of `_.trim`.
     *
     * @private
     * @param {string} string The string to trim.
     * @returns {string} Returns the trimmed string.
     */
    function baseTrim(string) {
      return string
        ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
        : string;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol$1 = root.Symbol;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto$1.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /** Built-in value references. */
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag$1),
          tag = value[symToStringTag$1];

      try {
        value[symToStringTag$1] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    /**
     * Clamps `number` within the inclusive `lower` and `upper` bounds.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Number
     * @param {number} number The number to clamp.
     * @param {number} [lower] The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the clamped number.
     * @example
     *
     * _.clamp(-10, -5, 5);
     * // => -5
     *
     * _.clamp(10, -5, 5);
     * // => 5
     */
    function clamp(number, lower, upper) {
      if (upper === undefined) {
        upper = lower;
        lower = undefined;
      }
      if (upper !== undefined) {
        upper = toNumber(upper);
        upper = upper === upper ? upper : 0;
      }
      if (lower !== undefined) {
        lower = toNumber(lower);
        lower = lower === lower ? lower : 0;
      }
      return baseClamp(toNumber(number), lower, upper);
    }

    function range(min, max) {
        if (min === void 0) { min = -Infinity; }
        if (max === void 0) { max = Infinity; }
        return function (proto, key) {
            var alias = "_" + key;
            Object.defineProperty(proto, key, {
                get: function () {
                    return this[alias];
                },
                set: function (val) {
                    Object.defineProperty(this, alias, {
                        value: clamp(val, min, max),
                        enumerable: false,
                        writable: true,
                        configurable: true,
                    });
                },
                enumerable: true,
                configurable: true,
            });
        };
    }

    function boolean(proto, key) {
        var alias = "_" + key;
        Object.defineProperty(proto, key, {
            get: function () {
                return this[alias];
            },
            set: function (val) {
                Object.defineProperty(this, alias, {
                    value: !!val,
                    enumerable: false,
                    writable: true,
                    configurable: true,
                });
            },
            enumerable: true,
            configurable: true,
        });
    }

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now = function() {
      return root.Date.now();
    };

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max,
        nativeMin = Math.min;

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce$1(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;

        return maxing
          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now());
      }

      function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    function debounce() {
        var options = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            options[_i] = arguments[_i];
        }
        return function (_proto, key, descriptor) {
            var fn = descriptor.value;
            return {
                get: function () {
                    if (!this.hasOwnProperty(key)) {
                        Object.defineProperty(this, key, {
                            value: debounce$1.apply(void 0, __spreadArrays([fn], options)),
                        });
                    }
                    return this[key];
                },
            };
        };
    }

    var Options = /** @class */ (function () {
        function Options(config) {
            var _this = this;
            if (config === void 0) { config = {}; }
            /**
             * Momentum reduction damping factor, a float value between `(0, 1)`.
             * The lower the value is, the more smooth the scrolling will be
             * (also the more paint frames).
             */
            this.damping = 0.1;
            /**
             * Minimal size for scrollbar thumbs.
             */
            this.thumbMinSize = 20;
            /**
             * Render every frame in integer pixel values
             * set to `true` to improve scrolling performance.
             */
            this.renderByPixels = true;
            /**
             * Keep scrollbar tracks visible
             */
            this.alwaysShowTracks = false;
            /**
             * Set to `true` to allow outer scrollbars continue scrolling
             * when current scrollbar reaches edge.
             */
            this.continuousScrolling = true;
            /**
             * Delegate wheel events and touch events to the given element.
             * By default, the container element is used.
             * This option will be useful for dealing with fixed elements.
             */
            this.delegateTo = null;
            /**
             * Options for plugins. Syntax:
             *   plugins[pluginName] = pluginOptions: any
             */
            this.plugins = {};
            Object.keys(config).forEach(function (prop) {
                _this[prop] = config[prop];
            });
        }
        Object.defineProperty(Options.prototype, "wheelEventTarget", {
            get: function () {
                return this.delegateTo;
            },
            set: function (el) {
                console.warn('[smooth-scrollbar]: `options.wheelEventTarget` is deprecated and will be removed in the future, use `options.delegateTo` instead.');
                this.delegateTo = el;
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            range(0, 1)
        ], Options.prototype, "damping", void 0);
        __decorate([
            range(0, Infinity)
        ], Options.prototype, "thumbMinSize", void 0);
        __decorate([
            boolean
        ], Options.prototype, "renderByPixels", void 0);
        __decorate([
            boolean
        ], Options.prototype, "alwaysShowTracks", void 0);
        __decorate([
            boolean
        ], Options.prototype, "continuousScrolling", void 0);
        return Options;
    }());

    var eventListenerOptions;
    var eventMap = new WeakMap();
    function getOptions() {
        if (eventListenerOptions !== undefined) {
            return eventListenerOptions;
        }
        var supportPassiveEvent = false;
        try {
            var noop = function () { };
            var options = Object.defineProperty({}, 'passive', {
                get: function () {
                    supportPassiveEvent = true;
                },
            });
            window.addEventListener('testPassive', noop, options);
            window.removeEventListener('testPassive', noop, options);
        }
        catch (e) { }
        eventListenerOptions = supportPassiveEvent ? { passive: false } : false;
        return eventListenerOptions;
    }
    function eventScope(scrollbar) {
        var configs = eventMap.get(scrollbar) || [];
        eventMap.set(scrollbar, configs);
        return function addEvent(elem, events, fn) {
            function handler(event) {
                // ignore default prevented events
                if (event.defaultPrevented) {
                    return;
                }
                fn(event);
            }
            events.split(/\s+/g).forEach(function (eventName) {
                configs.push({ elem: elem, eventName: eventName, handler: handler });
                elem.addEventListener(eventName, handler, getOptions());
            });
        };
    }
    function clearEventsOn(scrollbar) {
        var configs = eventMap.get(scrollbar);
        if (!configs) {
            return;
        }
        configs.forEach(function (_a) {
            var elem = _a.elem, eventName = _a.eventName, handler = _a.handler;
            elem.removeEventListener(eventName, handler, getOptions());
        });
        eventMap.delete(scrollbar);
    }

    /**
     * Get pointer/touch data
     */
    function getPointerData(evt) {
        // if is touch event, return last item in touchList
        // else return original event
        return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
    }

    /**
     * Get pointer/finger position
     */
    function getPosition(evt) {
        var data = getPointerData(evt);
        return {
            x: data.clientX,
            y: data.clientY,
        };
    }

    /**
     * Check if `a` is one of `[...b]`
     */
    function isOneOf(a, b) {
        if (b === void 0) { b = []; }
        return b.some(function (v) { return a === v; });
    }

    var VENDOR_PREFIX = [
        'webkit',
        'moz',
        'ms',
        'o',
    ];
    var RE = new RegExp("^-(?!(?:" + VENDOR_PREFIX.join('|') + ")-)");
    function autoPrefix(styles) {
        var res = {};
        Object.keys(styles).forEach(function (prop) {
            if (!RE.test(prop)) {
                res[prop] = styles[prop];
                return;
            }
            var val = styles[prop];
            prop = prop.replace(/^-/, '');
            res[prop] = val;
            VENDOR_PREFIX.forEach(function (prefix) {
                res["-" + prefix + "-" + prop] = val;
            });
        });
        return res;
    }
    function setStyle(elem, styles) {
        styles = autoPrefix(styles);
        Object.keys(styles).forEach(function (prop) {
            var cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, function (_, $1) { return $1.toUpperCase(); });
            elem.style[cssProp] = styles[prop];
        });
    }

    var Tracker = /** @class */ (function () {
        function Tracker(touch) {
            this.updateTime = Date.now();
            this.delta = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
            this.lastPosition = { x: 0, y: 0 };
            this.lastPosition = getPosition(touch);
        }
        Tracker.prototype.update = function (touch) {
            var _a = this, velocity = _a.velocity, updateTime = _a.updateTime, lastPosition = _a.lastPosition;
            var now = Date.now();
            var position = getPosition(touch);
            var delta = {
                x: -(position.x - lastPosition.x),
                y: -(position.y - lastPosition.y),
            };
            var duration = (now - updateTime) || 16;
            var vx = delta.x / duration * 16;
            var vy = delta.y / duration * 16;
            velocity.x = vx * 0.9 + velocity.x * 0.1;
            velocity.y = vy * 0.9 + velocity.y * 0.1;
            this.delta = delta;
            this.updateTime = now;
            this.lastPosition = position;
        };
        return Tracker;
    }());
    var TouchRecord = /** @class */ (function () {
        function TouchRecord() {
            this._touchList = {};
        }
        Object.defineProperty(TouchRecord.prototype, "_primitiveValue", {
            get: function () {
                return { x: 0, y: 0 };
            },
            enumerable: true,
            configurable: true
        });
        TouchRecord.prototype.isActive = function () {
            return this._activeTouchID !== undefined;
        };
        TouchRecord.prototype.getDelta = function () {
            var tracker = this._getActiveTracker();
            if (!tracker) {
                return this._primitiveValue;
            }
            return __assign({}, tracker.delta);
        };
        TouchRecord.prototype.getVelocity = function () {
            var tracker = this._getActiveTracker();
            if (!tracker) {
                return this._primitiveValue;
            }
            return __assign({}, tracker.velocity);
        };
        TouchRecord.prototype.track = function (evt) {
            var _this = this;
            var targetTouches = evt.targetTouches;
            Array.from(targetTouches).forEach(function (touch) {
                _this._add(touch);
            });
            return this._touchList;
        };
        TouchRecord.prototype.update = function (evt) {
            var _this = this;
            var touches = evt.touches, changedTouches = evt.changedTouches;
            Array.from(touches).forEach(function (touch) {
                _this._renew(touch);
            });
            this._setActiveID(changedTouches);
            return this._touchList;
        };
        TouchRecord.prototype.release = function (evt) {
            var _this = this;
            delete this._activeTouchID;
            Array.from(evt.changedTouches).forEach(function (touch) {
                _this._delete(touch);
            });
        };
        TouchRecord.prototype._add = function (touch) {
            if (this._has(touch)) {
                return;
            }
            var tracker = new Tracker(touch);
            this._touchList[touch.identifier] = tracker;
        };
        TouchRecord.prototype._renew = function (touch) {
            if (!this._has(touch)) {
                return;
            }
            var tracker = this._touchList[touch.identifier];
            tracker.update(touch);
        };
        TouchRecord.prototype._delete = function (touch) {
            delete this._touchList[touch.identifier];
        };
        TouchRecord.prototype._has = function (touch) {
            return this._touchList.hasOwnProperty(touch.identifier);
        };
        TouchRecord.prototype._setActiveID = function (touches) {
            this._activeTouchID = touches[touches.length - 1].identifier;
        };
        TouchRecord.prototype._getActiveTracker = function () {
            var _a = this, _touchList = _a._touchList, _activeTouchID = _a._activeTouchID;
            return _touchList[_activeTouchID];
        };
        return TouchRecord;
    }());

    var TrackDirection;
    (function (TrackDirection) {
        TrackDirection["X"] = "x";
        TrackDirection["Y"] = "y";
    })(TrackDirection || (TrackDirection = {}));

    var ScrollbarThumb = /** @class */ (function () {
        function ScrollbarThumb(_direction, _minSize) {
            if (_minSize === void 0) { _minSize = 0; }
            this._direction = _direction;
            this._minSize = _minSize;
            /**
             * Thumb element
             */
            this.element = document.createElement('div');
            /**
             * Display size of the thumb
             * will always be greater than `scrollbar.options.thumbMinSize`
             */
            this.displaySize = 0;
            /**
             * Actual size of the thumb
             */
            this.realSize = 0;
            /**
             * Thumb offset to the top
             */
            this.offset = 0;
            this.element.className = "scrollbar-thumb scrollbar-thumb-" + _direction;
        }
        /**
         * Attach to track element
         *
         * @param trackEl Track element
         */
        ScrollbarThumb.prototype.attachTo = function (trackEl) {
            trackEl.appendChild(this.element);
        };
        ScrollbarThumb.prototype.update = function (scrollOffset, containerSize, pageSize) {
            // calculate thumb size
            // pageSize > containerSize -> scrollable
            this.realSize = Math.min(containerSize / pageSize, 1) * containerSize;
            this.displaySize = Math.max(this.realSize, this._minSize);
            // calculate thumb offset
            this.offset = scrollOffset / pageSize * (containerSize + (this.realSize - this.displaySize));
            setStyle(this.element, this._getStyle());
        };
        ScrollbarThumb.prototype._getStyle = function () {
            switch (this._direction) {
                case TrackDirection.X:
                    return {
                        width: this.displaySize + "px",
                        '-transform': "translate3d(" + this.offset + "px, 0, 0)",
                    };
                case TrackDirection.Y:
                    return {
                        height: this.displaySize + "px",
                        '-transform': "translate3d(0, " + this.offset + "px, 0)",
                    };
                default:
                    return null;
            }
        };
        return ScrollbarThumb;
    }());

    var ScrollbarTrack = /** @class */ (function () {
        function ScrollbarTrack(direction, thumbMinSize) {
            if (thumbMinSize === void 0) { thumbMinSize = 0; }
            /**
             * Track element
             */
            this.element = document.createElement('div');
            this._isShown = false;
            this.element.className = "scrollbar-track scrollbar-track-" + direction;
            this.thumb = new ScrollbarThumb(direction, thumbMinSize);
            this.thumb.attachTo(this.element);
        }
        /**
         * Attach to scrollbar container element
         *
         * @param scrollbarContainer Scrollbar container element
         */
        ScrollbarTrack.prototype.attachTo = function (scrollbarContainer) {
            scrollbarContainer.appendChild(this.element);
        };
        /**
         * Show track immediately
         */
        ScrollbarTrack.prototype.show = function () {
            if (this._isShown) {
                return;
            }
            this._isShown = true;
            this.element.classList.add('show');
        };
        /**
         * Hide track immediately
         */
        ScrollbarTrack.prototype.hide = function () {
            if (!this._isShown) {
                return;
            }
            this._isShown = false;
            this.element.classList.remove('show');
        };
        ScrollbarTrack.prototype.update = function (scrollOffset, containerSize, pageSize) {
            setStyle(this.element, {
                display: pageSize <= containerSize ? 'none' : 'block',
            });
            this.thumb.update(scrollOffset, containerSize, pageSize);
        };
        return ScrollbarTrack;
    }());

    var TrackController = /** @class */ (function () {
        function TrackController(_scrollbar) {
            this._scrollbar = _scrollbar;
            var thumbMinSize = _scrollbar.options.thumbMinSize;
            this.xAxis = new ScrollbarTrack(TrackDirection.X, thumbMinSize);
            this.yAxis = new ScrollbarTrack(TrackDirection.Y, thumbMinSize);
            this.xAxis.attachTo(_scrollbar.containerEl);
            this.yAxis.attachTo(_scrollbar.containerEl);
            if (_scrollbar.options.alwaysShowTracks) {
                this.xAxis.show();
                this.yAxis.show();
            }
        }
        /**
         * Updates track appearance
         */
        TrackController.prototype.update = function () {
            var _a = this._scrollbar, size = _a.size, offset = _a.offset;
            this.xAxis.update(offset.x, size.container.width, size.content.width);
            this.yAxis.update(offset.y, size.container.height, size.content.height);
        };
        /**
         * Automatically hide tracks when scrollbar is in idle state
         */
        TrackController.prototype.autoHideOnIdle = function () {
            if (this._scrollbar.options.alwaysShowTracks) {
                return;
            }
            this.xAxis.hide();
            this.yAxis.hide();
        };
        __decorate([
            debounce(300)
        ], TrackController.prototype, "autoHideOnIdle", null);
        return TrackController;
    }());

    function getSize(scrollbar) {
        var containerEl = scrollbar.containerEl, contentEl = scrollbar.contentEl;
        return {
            container: {
                // requires `overflow: hidden`
                width: containerEl.clientWidth,
                height: containerEl.clientHeight,
            },
            content: {
                // border width should be included
                width: contentEl.offsetWidth - contentEl.clientWidth + contentEl.scrollWidth,
                height: contentEl.offsetHeight - contentEl.clientHeight + contentEl.scrollHeight,
            },
        };
    }

    function isVisible(scrollbar, elem) {
        var bounding = scrollbar.bounding;
        var targetBounding = elem.getBoundingClientRect();
        // check overlapping
        var top = Math.max(bounding.top, targetBounding.top);
        var left = Math.max(bounding.left, targetBounding.left);
        var right = Math.min(bounding.right, targetBounding.right);
        var bottom = Math.min(bounding.bottom, targetBounding.bottom);
        return top < bottom && left < right;
    }

    function update(scrollbar) {
        var newSize = scrollbar.getSize();
        var limit = {
            x: Math.max(newSize.content.width - newSize.container.width, 0),
            y: Math.max(newSize.content.height - newSize.container.height, 0),
        };
        // metrics
        var containerBounding = scrollbar.containerEl.getBoundingClientRect();
        var bounding = {
            top: Math.max(containerBounding.top, 0),
            right: Math.min(containerBounding.right, window.innerWidth),
            bottom: Math.min(containerBounding.bottom, window.innerHeight),
            left: Math.max(containerBounding.left, 0),
        };
        // assign props
        scrollbar.size = newSize;
        scrollbar.limit = limit;
        scrollbar.bounding = bounding;
        // update tracks
        scrollbar.track.update();
        // re-positioning
        scrollbar.setPosition();
    }

    function setPosition(scrollbar, x, y) {
        var options = scrollbar.options, offset = scrollbar.offset, limit = scrollbar.limit, track = scrollbar.track, contentEl = scrollbar.contentEl;
        if (options.renderByPixels) {
            x = Math.round(x);
            y = Math.round(y);
        }
        x = clamp(x, 0, limit.x);
        y = clamp(y, 0, limit.y);
        // position changed -> show track for 300ms
        if (x !== offset.x)
            track.xAxis.show();
        if (y !== offset.y)
            track.yAxis.show();
        if (!options.alwaysShowTracks) {
            track.autoHideOnIdle();
        }
        if (x === offset.x && y === offset.y) {
            return null;
        }
        offset.x = x;
        offset.y = y;
        setStyle(contentEl, {
            '-transform': "translate3d(" + -x + "px, " + -y + "px, 0)",
        });
        track.update();
        return {
            offset: __assign({}, offset),
            limit: __assign({}, limit),
        };
    }

    var animationIDStorage = new WeakMap();
    function scrollTo(scrollbar, x, y, duration, _a) {
        if (duration === void 0) { duration = 0; }
        var _b = _a === void 0 ? {} : _a, _c = _b.easing, easing = _c === void 0 ? defaultEasing : _c, callback = _b.callback;
        var options = scrollbar.options, offset = scrollbar.offset, limit = scrollbar.limit;
        if (options.renderByPixels) {
            // ensure resolved with integer
            x = Math.round(x);
            y = Math.round(y);
        }
        var startX = offset.x;
        var startY = offset.y;
        var disX = clamp(x, 0, limit.x) - startX;
        var disY = clamp(y, 0, limit.y) - startY;
        var start = Date.now();
        function scroll() {
            var elapse = Date.now() - start;
            var progress = duration ? easing(Math.min(elapse / duration, 1)) : 1;
            scrollbar.setPosition(startX + disX * progress, startY + disY * progress);
            if (elapse >= duration) {
                if (typeof callback === 'function') {
                    callback.call(scrollbar);
                }
            }
            else {
                var animationID = requestAnimationFrame(scroll);
                animationIDStorage.set(scrollbar, animationID);
            }
        }
        cancelAnimationFrame(animationIDStorage.get(scrollbar));
        scroll();
    }
    /**
     * easeOutCubic
     */
    function defaultEasing(t) {
        return Math.pow((t - 1), 3) + 1;
    }

    function scrollIntoView(scrollbar, elem, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.alignToTop, alignToTop = _c === void 0 ? true : _c, _d = _b.onlyScrollIfNeeded, onlyScrollIfNeeded = _d === void 0 ? false : _d, _e = _b.offsetTop, offsetTop = _e === void 0 ? 0 : _e, _f = _b.offsetLeft, offsetLeft = _f === void 0 ? 0 : _f, _g = _b.offsetBottom, offsetBottom = _g === void 0 ? 0 : _g;
        var containerEl = scrollbar.containerEl, bounding = scrollbar.bounding, offset = scrollbar.offset, limit = scrollbar.limit;
        if (!elem || !containerEl.contains(elem))
            return;
        var targetBounding = elem.getBoundingClientRect();
        if (onlyScrollIfNeeded && scrollbar.isVisible(elem))
            return;
        var delta = alignToTop ? targetBounding.top - bounding.top - offsetTop : targetBounding.bottom - bounding.bottom + offsetBottom;
        scrollbar.setMomentum(targetBounding.left - bounding.left - offsetLeft, clamp(delta, -offset.y, limit.y - offset.y));
    }

    var ScrollbarPlugin = /** @class */ (function () {
        function ScrollbarPlugin(scrollbar, options) {
            var _newTarget = this.constructor;
            this.scrollbar = scrollbar;
            this.name = _newTarget.pluginName;
            this.options = __assign(__assign({}, _newTarget.defaultOptions), options);
        }
        ScrollbarPlugin.prototype.onInit = function () { };
        ScrollbarPlugin.prototype.onDestroy = function () { };
        ScrollbarPlugin.prototype.onUpdate = function () { };
        ScrollbarPlugin.prototype.onRender = function (_remainMomentum) { };
        ScrollbarPlugin.prototype.transformDelta = function (delta, _evt) {
            return __assign({}, delta);
        };
        ScrollbarPlugin.pluginName = '';
        ScrollbarPlugin.defaultOptions = {};
        return ScrollbarPlugin;
    }());
    var globalPlugins = {
        order: new Set(),
        constructors: {},
    };
    function addPlugins() {
        var Plugins = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            Plugins[_i] = arguments[_i];
        }
        Plugins.forEach(function (P) {
            var pluginName = P.pluginName;
            if (!pluginName) {
                throw new TypeError("plugin name is required");
            }
            globalPlugins.order.add(pluginName);
            globalPlugins.constructors[pluginName] = P;
        });
    }
    function initPlugins(scrollbar, options) {
        return Array.from(globalPlugins.order)
            .filter(function (pluginName) {
            return options[pluginName] !== false;
        })
            .map(function (pluginName) {
            var Plugin = globalPlugins.constructors[pluginName];
            var instance = new Plugin(scrollbar, options[pluginName]);
            // bind plugin options to `scrollbar.options`
            options[pluginName] = instance.options;
            return instance;
        });
    }

    var KEY_CODE;
    (function (KEY_CODE) {
        KEY_CODE[KEY_CODE["TAB"] = 9] = "TAB";
        KEY_CODE[KEY_CODE["SPACE"] = 32] = "SPACE";
        KEY_CODE[KEY_CODE["PAGE_UP"] = 33] = "PAGE_UP";
        KEY_CODE[KEY_CODE["PAGE_DOWN"] = 34] = "PAGE_DOWN";
        KEY_CODE[KEY_CODE["END"] = 35] = "END";
        KEY_CODE[KEY_CODE["HOME"] = 36] = "HOME";
        KEY_CODE[KEY_CODE["LEFT"] = 37] = "LEFT";
        KEY_CODE[KEY_CODE["UP"] = 38] = "UP";
        KEY_CODE[KEY_CODE["RIGHT"] = 39] = "RIGHT";
        KEY_CODE[KEY_CODE["DOWN"] = 40] = "DOWN";
    })(KEY_CODE || (KEY_CODE = {}));
    function keyboardHandler(scrollbar) {
        var addEvent = eventScope(scrollbar);
        var container = scrollbar.containerEl;
        addEvent(container, 'keydown', function (evt) {
            var activeElement = document.activeElement;
            if (activeElement !== container && !container.contains(activeElement)) {
                return;
            }
            if (isEditable(activeElement)) {
                return;
            }
            var delta = getKeyDelta(scrollbar, evt.keyCode || evt.which);
            if (!delta) {
                return;
            }
            var x = delta[0], y = delta[1];
            scrollbar.addTransformableMomentum(x, y, evt, function (willScroll) {
                if (willScroll) {
                    evt.preventDefault();
                }
                else {
                    scrollbar.containerEl.blur();
                    if (scrollbar.parent) {
                        scrollbar.parent.containerEl.focus();
                    }
                }
            });
        });
    }
    function getKeyDelta(scrollbar, keyCode) {
        var size = scrollbar.size, limit = scrollbar.limit, offset = scrollbar.offset;
        switch (keyCode) {
            case KEY_CODE.TAB:
                return handleTabKey(scrollbar);
            case KEY_CODE.SPACE:
                return [0, 200];
            case KEY_CODE.PAGE_UP:
                return [0, -size.container.height + 40];
            case KEY_CODE.PAGE_DOWN:
                return [0, size.container.height - 40];
            case KEY_CODE.END:
                return [0, limit.y - offset.y];
            case KEY_CODE.HOME:
                return [0, -offset.y];
            case KEY_CODE.LEFT:
                return [-40, 0];
            case KEY_CODE.UP:
                return [0, -40];
            case KEY_CODE.RIGHT:
                return [40, 0];
            case KEY_CODE.DOWN:
                return [0, 40];
            default:
                return null;
        }
    }
    function handleTabKey(scrollbar) {
        // handle in next frame
        requestAnimationFrame(function () {
            scrollbar.scrollIntoView(document.activeElement, {
                offsetTop: scrollbar.size.container.height / 2,
                onlyScrollIfNeeded: true,
            });
        });
    }
    function isEditable(elem) {
        if (elem.tagName === 'INPUT' ||
            elem.tagName === 'SELECT' ||
            elem.tagName === 'TEXTAREA' ||
            elem.isContentEditable) {
            return !elem.disabled;
        }
        return false;
    }

    var Direction;
    (function (Direction) {
        Direction[Direction["X"] = 0] = "X";
        Direction[Direction["Y"] = 1] = "Y";
    })(Direction || (Direction = {}));
    function mouseHandler(scrollbar) {
        var addEvent = eventScope(scrollbar);
        var container = scrollbar.containerEl;
        var _a = scrollbar.track, xAxis = _a.xAxis, yAxis = _a.yAxis;
        function calcOffset(direction, clickPosition) {
            var size = scrollbar.size;
            if (direction === Direction.X) {
                var totalWidth = size.container.width + (xAxis.thumb.realSize - xAxis.thumb.displaySize);
                return clickPosition / totalWidth * size.content.width;
            }
            if (direction === Direction.Y) {
                var totalHeight = size.container.height + (yAxis.thumb.realSize - yAxis.thumb.displaySize);
                return clickPosition / totalHeight * size.content.height;
            }
            return 0;
        }
        function getTrackDirection(elem) {
            if (isOneOf(elem, [xAxis.element, xAxis.thumb.element])) {
                return Direction.X;
            }
            if (isOneOf(elem, [yAxis.element, yAxis.thumb.element])) {
                return Direction.Y;
            }
            return void 0;
        }
        var isMouseDown;
        var isMouseMoving;
        var startOffsetToThumb;
        var startTrackDirection;
        var containerRect;
        addEvent(container, 'click', function (evt) {
            if (isMouseMoving || !isOneOf(evt.target, [xAxis.element, yAxis.element])) {
                return;
            }
            var track = evt.target;
            var direction = getTrackDirection(track);
            var rect = track.getBoundingClientRect();
            var clickPos = getPosition(evt);
            var offset = scrollbar.offset, limit = scrollbar.limit;
            if (direction === Direction.X) {
                var offsetOnTrack = clickPos.x - rect.left - xAxis.thumb.displaySize / 2;
                scrollbar.setMomentum(clamp(calcOffset(direction, offsetOnTrack) - offset.x, -offset.x, limit.x - offset.x), 0);
            }
            if (direction === Direction.Y) {
                var offsetOnTrack = clickPos.y - rect.top - yAxis.thumb.displaySize / 2;
                scrollbar.setMomentum(0, clamp(calcOffset(direction, offsetOnTrack) - offset.y, -offset.y, limit.y - offset.y));
            }
        });
        addEvent(container, 'mousedown', function (evt) {
            if (!isOneOf(evt.target, [xAxis.thumb.element, yAxis.thumb.element])) {
                return;
            }
            isMouseDown = true;
            var thumb = evt.target;
            var cursorPos = getPosition(evt);
            var thumbRect = thumb.getBoundingClientRect();
            startTrackDirection = getTrackDirection(thumb);
            // pointer offset to thumb
            startOffsetToThumb = {
                x: cursorPos.x - thumbRect.left,
                y: cursorPos.y - thumbRect.top,
            };
            // container bounding rectangle
            containerRect = container.getBoundingClientRect();
            // prevent selection, see:
            // https://github.com/idiotWu/smooth-scrollbar/issues/48
            setStyle(scrollbar.containerEl, {
                '-user-select': 'none',
            });
        });
        addEvent(window, 'mousemove', function (evt) {
            if (!isMouseDown)
                return;
            isMouseMoving = true;
            var offset = scrollbar.offset;
            var cursorPos = getPosition(evt);
            if (startTrackDirection === Direction.X) {
                // get percentage of pointer position in track
                // then tranform to px
                // don't need easing
                var offsetOnTrack = cursorPos.x - startOffsetToThumb.x - containerRect.left;
                scrollbar.setPosition(calcOffset(startTrackDirection, offsetOnTrack), offset.y);
            }
            if (startTrackDirection === Direction.Y) {
                var offsetOnTrack = cursorPos.y - startOffsetToThumb.y - containerRect.top;
                scrollbar.setPosition(offset.x, calcOffset(startTrackDirection, offsetOnTrack));
            }
        });
        addEvent(window, 'mouseup blur', function () {
            isMouseDown = isMouseMoving = false;
            setStyle(scrollbar.containerEl, {
                '-user-select': '',
            });
        });
    }

    function resizeHandler(scrollbar) {
        var addEvent = eventScope(scrollbar);
        addEvent(window, 'resize', debounce$1(scrollbar.update.bind(scrollbar), 300));
    }

    function selectHandler(scrollbar) {
        var addEvent = eventScope(scrollbar);
        var containerEl = scrollbar.containerEl, contentEl = scrollbar.contentEl;
        var isSelected = false;
        var animationID;
        function scroll(_a) {
            var x = _a.x, y = _a.y;
            if (!x && !y)
                return;
            var offset = scrollbar.offset, limit = scrollbar.limit;
            // DISALLOW delta transformation
            scrollbar.setMomentum(clamp(offset.x + x, 0, limit.x) - offset.x, clamp(offset.y + y, 0, limit.y) - offset.y);
            animationID = requestAnimationFrame(function () {
                scroll({ x: x, y: y });
            });
        }
        addEvent(window, 'mousemove', function (evt) {
            if (!isSelected)
                return;
            cancelAnimationFrame(animationID);
            var dir = calcMomentum(scrollbar, evt);
            scroll(dir);
        });
        addEvent(contentEl, 'selectstart', function (evt) {
            evt.stopPropagation();
            cancelAnimationFrame(animationID);
            isSelected = true;
        });
        addEvent(window, 'mouseup blur', function () {
            cancelAnimationFrame(animationID);
            isSelected = false;
        });
        // patch for touch devices
        addEvent(containerEl, 'scroll', function (evt) {
            evt.preventDefault();
            containerEl.scrollTop = containerEl.scrollLeft = 0;
        });
    }
    function calcMomentum(scrollbar, evt) {
        var _a = scrollbar.bounding, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left;
        var _b = getPosition(evt), x = _b.x, y = _b.y;
        var res = {
            x: 0,
            y: 0,
        };
        var padding = 20;
        if (x === 0 && y === 0)
            return res;
        if (x > right - padding) {
            res.x = (x - right + padding);
        }
        else if (x < left + padding) {
            res.x = (x - left - padding);
        }
        if (y > bottom - padding) {
            res.y = (y - bottom + padding);
        }
        else if (y < top + padding) {
            res.y = (y - top - padding);
        }
        res.x *= 2;
        res.y *= 2;
        return res;
    }

    var activeScrollbar;
    function touchHandler(scrollbar) {
        var MIN_EAING_MOMENTUM = 50;
        var EASING_MULTIPLIER = /Android/.test(navigator.userAgent) ? 3 : 2;
        var target = scrollbar.options.delegateTo || scrollbar.containerEl;
        var touchRecord = new TouchRecord();
        var addEvent = eventScope(scrollbar);
        var damping;
        var pointerCount = 0;
        addEvent(target, 'touchstart', function (evt) {
            // start records
            touchRecord.track(evt);
            // stop scrolling
            scrollbar.setMomentum(0, 0);
            // save damping
            if (pointerCount === 0) {
                damping = scrollbar.options.damping;
                scrollbar.options.damping = Math.max(damping, 0.5); // less frames on touchmove
            }
            pointerCount++;
        });
        addEvent(target, 'touchmove', function (evt) {
            if (activeScrollbar && activeScrollbar !== scrollbar)
                return;
            touchRecord.update(evt);
            var _a = touchRecord.getDelta(), x = _a.x, y = _a.y;
            scrollbar.addTransformableMomentum(x, y, evt, function (willScroll) {
                if (willScroll && evt.cancelable) {
                    evt.preventDefault();
                    activeScrollbar = scrollbar;
                }
            });
        });
        addEvent(target, 'touchcancel touchend', function (evt) {
            var velocity = touchRecord.getVelocity();
            var momentum = { x: 0, y: 0 };
            Object.keys(velocity).forEach(function (dir) {
                var s = velocity[dir] / damping;
                // throw small values
                momentum[dir] = Math.abs(s) < MIN_EAING_MOMENTUM ? 0 : s * EASING_MULTIPLIER;
            });
            scrollbar.addTransformableMomentum(momentum.x, momentum.y, evt);
            pointerCount--;
            // restore damping
            if (pointerCount === 0) {
                scrollbar.options.damping = damping;
            }
            touchRecord.release(evt);
            activeScrollbar = null;
        });
    }

    function wheelHandler(scrollbar) {
        var addEvent = eventScope(scrollbar);
        var target = scrollbar.options.delegateTo || scrollbar.containerEl;
        var eventName = ('onwheel' in window || document.implementation.hasFeature('Events.wheel', '3.0')) ? 'wheel' : 'mousewheel';
        addEvent(target, eventName, function (evt) {
            var _a = normalizeDelta(evt), x = _a.x, y = _a.y;
            scrollbar.addTransformableMomentum(x, y, evt, function (willScroll) {
                if (willScroll) {
                    evt.preventDefault();
                }
            });
        });
    }
    // Normalizing wheel delta
    var DELTA_SCALE = {
        STANDARD: 1,
        OTHERS: -3,
    };
    var DELTA_MODE = [1.0, 28.0, 500.0];
    var getDeltaMode = function (mode) { return DELTA_MODE[mode] || DELTA_MODE[0]; };
    function normalizeDelta(evt) {
        if ('deltaX' in evt) {
            var mode = getDeltaMode(evt.deltaMode);
            return {
                x: evt.deltaX / DELTA_SCALE.STANDARD * mode,
                y: evt.deltaY / DELTA_SCALE.STANDARD * mode,
            };
        }
        if ('wheelDeltaX' in evt) {
            return {
                x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
                y: evt.wheelDeltaY / DELTA_SCALE.OTHERS,
            };
        }
        // ie with touchpad
        return {
            x: 0,
            y: evt.wheelDelta / DELTA_SCALE.OTHERS,
        };
    }

    var eventHandlers = /*#__PURE__*/Object.freeze({
        __proto__: null,
        keyboardHandler: keyboardHandler,
        mouseHandler: mouseHandler,
        resizeHandler: resizeHandler,
        selectHandler: selectHandler,
        touchHandler: touchHandler,
        wheelHandler: wheelHandler
    });

    // DO NOT use WeakMap here
    // .getAll() methods requires `scrollbarMap.values()`
    var scrollbarMap = new Map();
    var Scrollbar = /** @class */ (function () {
        function Scrollbar(containerEl, options) {
            var _this = this;
            /**
             * Current scrolling offsets
             */
            this.offset = {
                x: 0,
                y: 0,
            };
            /**
             * Max-allowed scrolling offsets
             */
            this.limit = {
                x: Infinity,
                y: Infinity,
            };
            /**
             * Container bounding rect
             */
            this.bounding = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            };
            this._plugins = [];
            this._momentum = { x: 0, y: 0 };
            this._listeners = new Set();
            this.containerEl = containerEl;
            var contentEl = this.contentEl = document.createElement('div');
            this.options = new Options(options);
            // mark as a scroll element
            containerEl.setAttribute('data-scrollbar', 'true');
            // make container focusable
            containerEl.setAttribute('tabindex', '-1');
            setStyle(containerEl, {
                overflow: 'hidden',
                outline: 'none',
            });
            // enable touch event capturing in IE, see:
            // https://github.com/idiotWu/smooth-scrollbar/issues/39
            if (window.navigator.msPointerEnabled) {
                containerEl.style.msTouchAction = 'none';
            }
            // mount content
            contentEl.className = 'scroll-content';
            Array.from(containerEl.childNodes).forEach(function (node) {
                contentEl.appendChild(node);
            });
            containerEl.appendChild(contentEl);
            // attach track
            this.track = new TrackController(this);
            // initial measuring
            this.size = this.getSize();
            // init plugins
            this._plugins = initPlugins(this, this.options.plugins);
            // preserve scroll offset
            var scrollLeft = containerEl.scrollLeft, scrollTop = containerEl.scrollTop;
            containerEl.scrollLeft = containerEl.scrollTop = 0;
            this.setPosition(scrollLeft, scrollTop, {
                withoutCallbacks: true,
            });
            var global = window;
            var MutationObserver = global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;
            // observe
            if (typeof MutationObserver === 'function') {
                this._observer = new MutationObserver(function () {
                    _this.update();
                });
                this._observer.observe(contentEl, {
                    subtree: true,
                    childList: true,
                });
            }
            scrollbarMap.set(containerEl, this);
            // wait for DOM ready
            requestAnimationFrame(function () {
                _this._init();
            });
        }
        Object.defineProperty(Scrollbar.prototype, "parent", {
            /**
             * Parent scrollbar
             */
            get: function () {
                var elem = this.containerEl.parentElement;
                while (elem) {
                    var parentScrollbar = scrollbarMap.get(elem);
                    if (parentScrollbar) {
                        return parentScrollbar;
                    }
                    elem = elem.parentElement;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollbar.prototype, "scrollTop", {
            /**
             * Gets or sets `scrollbar.offset.y`
             */
            get: function () {
                return this.offset.y;
            },
            set: function (y) {
                this.setPosition(this.scrollLeft, y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollbar.prototype, "scrollLeft", {
            /**
             * Gets or sets `scrollbar.offset.x`
             */
            get: function () {
                return this.offset.x;
            },
            set: function (x) {
                this.setPosition(x, this.scrollTop);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Returns the size of the scrollbar container element
         * and the content wrapper element
         */
        Scrollbar.prototype.getSize = function () {
            return getSize(this);
        };
        /**
         * Forces scrollbar to update geometry infomation.
         *
         * By default, scrollbars are automatically updated with `100ms` debounce (or `MutationObserver` fires).
         * You can call this method to force an update when you modified contents
         */
        Scrollbar.prototype.update = function () {
            update(this);
            this._plugins.forEach(function (plugin) {
                plugin.onUpdate();
            });
        };
        /**
         * Checks if an element is visible in the current view area
         */
        Scrollbar.prototype.isVisible = function (elem) {
            return isVisible(this, elem);
        };
        /**
         * Sets the scrollbar to the given offset without easing
         */
        Scrollbar.prototype.setPosition = function (x, y, options) {
            var _this = this;
            if (x === void 0) { x = this.offset.x; }
            if (y === void 0) { y = this.offset.y; }
            if (options === void 0) { options = {}; }
            var status = setPosition(this, x, y);
            if (!status || options.withoutCallbacks) {
                return;
            }
            this._listeners.forEach(function (fn) {
                fn.call(_this, status);
            });
        };
        /**
         * Scrolls to given position with easing function
         */
        Scrollbar.prototype.scrollTo = function (x, y, duration, options) {
            if (x === void 0) { x = this.offset.x; }
            if (y === void 0) { y = this.offset.y; }
            if (duration === void 0) { duration = 0; }
            if (options === void 0) { options = {}; }
            scrollTo(this, x, y, duration, options);
        };
        /**
         * Scrolls the target element into visible area of scrollbar,
         * likes the DOM method `element.scrollIntoView().
         */
        Scrollbar.prototype.scrollIntoView = function (elem, options) {
            if (options === void 0) { options = {}; }
            scrollIntoView(this, elem, options);
        };
        /**
         * Adds scrolling listener
         */
        Scrollbar.prototype.addListener = function (fn) {
            if (typeof fn !== 'function') {
                throw new TypeError('[smooth-scrollbar] scrolling listener should be a function');
            }
            this._listeners.add(fn);
        };
        /**
         * Removes listener previously registered with `scrollbar.addListener()`
         */
        Scrollbar.prototype.removeListener = function (fn) {
            this._listeners.delete(fn);
        };
        /**
         * Adds momentum and applys delta transformers.
         */
        Scrollbar.prototype.addTransformableMomentum = function (x, y, fromEvent, callback) {
            this._updateDebounced();
            var finalDelta = this._plugins.reduce(function (delta, plugin) {
                return plugin.transformDelta(delta, fromEvent) || delta;
            }, { x: x, y: y });
            var willScroll = !this._shouldPropagateMomentum(finalDelta.x, finalDelta.y);
            if (willScroll) {
                this.addMomentum(finalDelta.x, finalDelta.y);
            }
            if (callback) {
                callback.call(this, willScroll);
            }
        };
        /**
         * Increases scrollbar's momentum
         */
        Scrollbar.prototype.addMomentum = function (x, y) {
            this.setMomentum(this._momentum.x + x, this._momentum.y + y);
        };
        /**
         * Sets scrollbar's momentum to given value
         */
        Scrollbar.prototype.setMomentum = function (x, y) {
            if (this.limit.x === 0) {
                x = 0;
            }
            if (this.limit.y === 0) {
                y = 0;
            }
            if (this.options.renderByPixels) {
                x = Math.round(x);
                y = Math.round(y);
            }
            this._momentum.x = x;
            this._momentum.y = y;
        };
        /**
         * Update options for specific plugin
         *
         * @param pluginName Name of the plugin
         * @param [options] An object includes the properties that you want to update
         */
        Scrollbar.prototype.updatePluginOptions = function (pluginName, options) {
            this._plugins.forEach(function (plugin) {
                if (plugin.name === pluginName) {
                    Object.assign(plugin.options, options);
                }
            });
        };
        Scrollbar.prototype.destroy = function () {
            var _a = this, containerEl = _a.containerEl, contentEl = _a.contentEl;
            clearEventsOn(this);
            this._listeners.clear();
            this.setMomentum(0, 0);
            cancelAnimationFrame(this._renderID);
            if (this._observer) {
                this._observer.disconnect();
            }
            scrollbarMap.delete(this.containerEl);
            // restore contents
            var childNodes = Array.from(contentEl.childNodes);
            while (containerEl.firstChild) {
                containerEl.removeChild(containerEl.firstChild);
            }
            childNodes.forEach(function (el) {
                containerEl.appendChild(el);
            });
            // reset scroll position
            setStyle(containerEl, {
                overflow: '',
            });
            containerEl.scrollTop = this.scrollTop;
            containerEl.scrollLeft = this.scrollLeft;
            // invoke plugin.onDestroy
            this._plugins.forEach(function (plugin) {
                plugin.onDestroy();
            });
            this._plugins.length = 0;
        };
        Scrollbar.prototype._init = function () {
            var _this = this;
            this.update();
            // init evet handlers
            Object.keys(eventHandlers).forEach(function (prop) {
                eventHandlers[prop](_this);
            });
            // invoke `plugin.onInit`
            this._plugins.forEach(function (plugin) {
                plugin.onInit();
            });
            this._render();
        };
        Scrollbar.prototype._updateDebounced = function () {
            this.update();
        };
        // check whether to propagate monmentum to parent scrollbar
        // the following situations are considered as `true`:
        //         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
        //         2. scrollbar reaches one side and is not about to scroll on the other direction
        Scrollbar.prototype._shouldPropagateMomentum = function (deltaX, deltaY) {
            if (deltaX === void 0) { deltaX = 0; }
            if (deltaY === void 0) { deltaY = 0; }
            var _a = this, options = _a.options, offset = _a.offset, limit = _a.limit;
            if (!options.continuousScrolling)
                return false;
            // force an update when scrollbar is "unscrollable", see #106
            if (limit.x === 0 && limit.y === 0) {
                this._updateDebounced();
            }
            var destX = clamp(deltaX + offset.x, 0, limit.x);
            var destY = clamp(deltaY + offset.y, 0, limit.y);
            var res = true;
            // offsets are not about to change
            // `&=` operator is not allowed for boolean types
            res = res && (destX === offset.x);
            res = res && (destY === offset.y);
            // current offsets are on the edge
            res = res && (offset.x === limit.x || offset.x === 0 || offset.y === limit.y || offset.y === 0);
            return res;
        };
        Scrollbar.prototype._render = function () {
            var _momentum = this._momentum;
            if (_momentum.x || _momentum.y) {
                var nextX = this._nextTick('x');
                var nextY = this._nextTick('y');
                _momentum.x = nextX.momentum;
                _momentum.y = nextY.momentum;
                this.setPosition(nextX.position, nextY.position);
            }
            var remain = __assign({}, this._momentum);
            this._plugins.forEach(function (plugin) {
                plugin.onRender(remain);
            });
            this._renderID = requestAnimationFrame(this._render.bind(this));
        };
        Scrollbar.prototype._nextTick = function (direction) {
            var _a = this, options = _a.options, offset = _a.offset, _momentum = _a._momentum;
            var current = offset[direction];
            var remain = _momentum[direction];
            if (Math.abs(remain) <= 0.1) {
                return {
                    momentum: 0,
                    position: current + remain,
                };
            }
            var nextMomentum = remain * (1 - options.damping);
            if (options.renderByPixels) {
                nextMomentum |= 0;
            }
            return {
                momentum: nextMomentum,
                position: current + remain - nextMomentum,
            };
        };
        __decorate([
            debounce(100, { leading: true })
        ], Scrollbar.prototype, "_updateDebounced", null);
        return Scrollbar;
    }());

    var TRACK_BG = 'rgba(222, 222, 222, .75)';
    var THUMB_BG = 'rgba(0, 0, 0, .5)';
    var SCROLLBAR_STYLE = "\n[data-scrollbar] {\n  display: block;\n  position: relative;\n}\n\n.scroll-content {\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n}\n\n.scrollbar-track {\n  position: absolute;\n  opacity: 0;\n  z-index: 1;\n  background: " + TRACK_BG + ";\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  -webkit-transition: opacity 0.5s 0.5s ease-out;\n          transition: opacity 0.5s 0.5s ease-out;\n}\n.scrollbar-track.show,\n.scrollbar-track:hover {\n  opacity: 1;\n  -webkit-transition-delay: 0s;\n          transition-delay: 0s;\n}\n\n.scrollbar-track-x {\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 8px;\n}\n.scrollbar-track-y {\n  top: 0;\n  right: 0;\n  width: 8px;\n  height: 100%;\n}\n.scrollbar-thumb {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 8px;\n  height: 8px;\n  background: " + THUMB_BG + ";\n  border-radius: 4px;\n}\n";
    var STYLE_ID = 'smooth-scrollbar-style';
    var isStyleAttached = false;
    function attachStyle() {
        if (isStyleAttached || typeof window === 'undefined') {
            return;
        }
        var styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = SCROLLBAR_STYLE;
        if (document.head) {
            document.head.appendChild(styleEl);
        }
        isStyleAttached = true;
    }
    function detachStyle() {
        if (!isStyleAttached || typeof window === 'undefined') {
            return;
        }
        var styleEl = document.getElementById(STYLE_ID);
        if (!styleEl || !styleEl.parentNode) {
            return;
        }
        styleEl.parentNode.removeChild(styleEl);
        isStyleAttached = false;
    }

    /*!
     * cast `I.Scrollbar` to `Scrollbar` to avoid error
     *
     * `I.Scrollbar` is not assignable to `Scrollbar`:
     *     "privateProp" is missing in `I.Scrollbar`
     *
     * @see https://github.com/Microsoft/TypeScript/issues/2672
     */
    var SmoothScrollbar = /** @class */ (function (_super) {
        __extends(SmoothScrollbar, _super);
        function SmoothScrollbar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Initializes a scrollbar on the given element.
         *
         * @param elem The DOM element that you want to initialize scrollbar to
         * @param [options] Initial options
         */
        SmoothScrollbar.init = function (elem, options) {
            if (!elem || elem.nodeType !== 1) {
                throw new TypeError("expect element to be DOM Element, but got " + elem);
            }
            // attach stylesheet
            attachStyle();
            if (scrollbarMap.has(elem)) {
                return scrollbarMap.get(elem);
            }
            return new Scrollbar(elem, options);
        };
        /**
         * Automatically init scrollbar on all elements base on the selector `[data-scrollbar]`
         *
         * @param options Initial options
         */
        SmoothScrollbar.initAll = function (options) {
            return Array.from(document.querySelectorAll('[data-scrollbar]'), function (elem) {
                return SmoothScrollbar.init(elem, options);
            });
        };
        /**
         * Check if there is a scrollbar on given element
         *
         * @param elem The DOM element that you want to check
         */
        SmoothScrollbar.has = function (elem) {
            return scrollbarMap.has(elem);
        };
        /**
         * Gets scrollbar on the given element.
         * If no scrollbar instance exsits, returns `undefined`
         *
         * @param elem The DOM element that you want to check.
         */
        SmoothScrollbar.get = function (elem) {
            return scrollbarMap.get(elem);
        };
        /**
         * Returns an array that contains all scrollbar instances
         */
        SmoothScrollbar.getAll = function () {
            return Array.from(scrollbarMap.values());
        };
        /**
         * Removes scrollbar on the given element
         */
        SmoothScrollbar.destroy = function (elem) {
            var scrollbar = scrollbarMap.get(elem);
            if (scrollbar) {
                scrollbar.destroy();
            }
        };
        /**
         * Removes all scrollbar instances from current document
         */
        SmoothScrollbar.destroyAll = function () {
            scrollbarMap.forEach(function (scrollbar) {
                scrollbar.destroy();
            });
        };
        /**
         * Attaches plugins to scrollbars
         *
         * @param ...Plugins Scrollbar plugin classes
         */
        SmoothScrollbar.use = function () {
            var Plugins = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                Plugins[_i] = arguments[_i];
            }
            return addPlugins.apply(void 0, Plugins);
        };
        /**
         * Attaches default style sheets to current document.
         * You don't need to call this method manually unless
         * you removed the default styles via `Scrollbar.detachStyle()`
         */
        SmoothScrollbar.attachStyle = function () {
            return attachStyle();
        };
        /**
         * Removes default styles from current document.
         * Use this method when you want to use your own css for scrollbars.
         */
        SmoothScrollbar.detachStyle = function () {
            return detachStyle();
        };
        SmoothScrollbar.version = "8.6.2";
        SmoothScrollbar.ScrollbarPlugin = ScrollbarPlugin;
        return SmoothScrollbar;
    }(Scrollbar));

    /* src\components\elements\Slide.svelte generated by Svelte v3.38.1 */
    const file$5 = "src\\components\\elements\\Slide.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div0;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let img4;
    	let img4_src_value;
    	let t6;
    	let img5;
    	let img5_src_value;
    	let t7;
    	let img6;
    	let img6_src_value;
    	let t8;
    	let img7;
    	let img7_src_value;
    	let t9;
    	let img8;
    	let img8_src_value;
    	let t10;
    	let img9;
    	let img9_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ما حشرات رو دوست داریم ولی انسان ها رو بیشتر";
    			t1 = space();
    			img0 = element("img");
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			div0 = element("div");
    			img2 = element("img");
    			t4 = space();
    			img3 = element("img");
    			t5 = space();
    			img4 = element("img");
    			t6 = space();
    			img5 = element("img");
    			t7 = space();
    			img6 = element("img");
    			t8 = space();
    			img7 = element("img");
    			t9 = space();
    			img8 = element("img");
    			t10 = space();
    			img9 = element("img");
    			attr_dev(h1, "class", "header__text parallax svelte-ni5pj4");
    			attr_dev(h1, "data-depth", "0.4");
    			add_location(h1, file$5, 47, 4, 1687);
    			attr_dev(img0, "class", "slide__man parallax svelte-ni5pj4");
    			attr_dev(img0, "data-depth", "0.3");
    			attr_dev(img0, "alt", "man slide");
    			if (img0.src !== (img0_src_value = "assets/slide/man.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$5, 50, 4, 1809);
    			attr_dev(img1, "class", "slide__grass svelte-ni5pj4");
    			attr_dev(img1, "alt", "man slide");
    			if (img1.src !== (img1_src_value = "assets/slide/grass.png")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$5, 56, 4, 1967);
    			attr_dev(img2, "class", "slide__insects--Bee parallax svelte-ni5pj4");
    			attr_dev(img2, "data-depth", "0.05");
    			attr_dev(img2, "alt", "man slide");
    			if (img2.src !== (img2_src_value = "assets/slide/Bee.png")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$5, 58, 8, 2083);
    			attr_dev(img3, "class", "slide__insects--Bee--2 parallax svelte-ni5pj4");
    			attr_dev(img3, "data-depth", "0.3");
    			attr_dev(img3, "alt", "man slide");
    			if (img3.src !== (img3_src_value = "assets/slide/Bee-black.png")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$5, 64, 8, 2275);
    			attr_dev(img4, "class", "slide__insects--Dragonfly parallax svelte-ni5pj4");
    			attr_dev(img4, "data-depth", "0.2");
    			attr_dev(img4, "alt", "man slide");
    			if (img4.src !== (img4_src_value = "assets/slide/Dragonfly.png")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$5, 70, 8, 2475);
    			attr_dev(img5, "class", "slide__insects--Dragonfly--2 parallax svelte-ni5pj4");
    			attr_dev(img5, "data-depth", "0.2");
    			attr_dev(img5, "alt", "man slide");
    			if (img5.src !== (img5_src_value = "assets/slide/Dragonfly.png")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$5, 76, 8, 2678);
    			attr_dev(img6, "class", "slide__insects--butterfly parallax svelte-ni5pj4");
    			attr_dev(img6, "data-depth", "0.10");
    			attr_dev(img6, "alt", "man slide");
    			if (img6.src !== (img6_src_value = "assets/slide/butterfly.png")) attr_dev(img6, "src", img6_src_value);
    			add_location(img6, file$5, 82, 8, 2884);
    			attr_dev(img7, "class", "slide__insects--butterfly--2 parallax svelte-ni5pj4");
    			attr_dev(img7, "data-depth", "0.15");
    			attr_dev(img7, "alt", "man slide");
    			if (img7.src !== (img7_src_value = "assets/slide/butterfly-blue.png")) attr_dev(img7, "src", img7_src_value);
    			add_location(img7, file$5, 88, 8, 3088);
    			attr_dev(img8, "class", "slide__insects--bug parallax svelte-ni5pj4");
    			attr_dev(img8, "data-depth", "0.50");
    			attr_dev(img8, "alt", "man slide");
    			if (img8.src !== (img8_src_value = "assets/slide/bug.png")) attr_dev(img8, "src", img8_src_value);
    			add_location(img8, file$5, 94, 8, 3300);
    			attr_dev(img9, "class", "slide__insects--bug--2 parallax svelte-ni5pj4");
    			attr_dev(img9, "data-depth", "0.50");
    			attr_dev(img9, "alt", "man slide");
    			if (img9.src !== (img9_src_value = "assets/slide/red-bug.png")) attr_dev(img9, "src", img9_src_value);
    			add_location(img9, file$5, 100, 8, 3492);
    			attr_dev(div0, "class", "slide__insects svelte-ni5pj4");
    			add_location(div0, file$5, 57, 4, 2045);
    			attr_dev(div1, "class", "slide svelte-ni5pj4");
    			attr_dev(div1, "id", "hero");
    			add_location(div1, file$5, 46, 0, 1652);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, img0);
    			append_dev(div1, t2);
    			append_dev(div1, img1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, img2);
    			append_dev(div0, t4);
    			append_dev(div0, img3);
    			append_dev(div0, t5);
    			append_dev(div0, img4);
    			append_dev(div0, t6);
    			append_dev(div0, img5);
    			append_dev(div0, t7);
    			append_dev(div0, img6);
    			append_dev(div0, t8);
    			append_dev(div0, img7);
    			append_dev(div0, t9);
    			append_dev(div0, img8);
    			append_dev(div0, t10);
    			append_dev(div0, img9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slide", slots, []);
    	gsapWithCSS.registerPlugin(ScrollTrigger);

    	onMount(() => {
    		// const scroller = document.querySelector('body');
    		// //
    		// const bodyScrollBar = Scrollbar.init(scroller, {damping: 0.1, delegateTo: document, alwaysShowTracks: true});
    		//
    		// ScrollTrigger.scrollerProxy("body", {
    		//     scrollTop(value) {
    		//         if (arguments.length) {
    		//             bodyScrollBar.scrollTop = value; // setter
    		//         }
    		//         return bodyScrollBar.scrollTop;    // getter
    		//     },
    		//     getBoundingClientRect() {
    		//         return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    		//     }
    		// });
    		//
    		// bodyScrollBar.addListener(ScrollTrigger.update);
    		//
    		// ScrollTrigger.defaults({scroller: scroller});
    		const tl = gsapWithCSS.timeline({
    			scrollTrigger: {
    				trigger: "#hero",
    				start: "top top",
    				end: window.innerHeight,
    				scrub: 1
    			}
    		});

    		// tl.addLabel('start').to(".parallax",{y:100}).addLabel('end')
    		gsapWithCSS.utils.toArray(".parallax").forEach(layer => {
    			const depth = layer.dataset.depth;
    			const movement = 500 * depth;

    			tl.to(
    				layer,
    				{
    					y: movement,
    					ease: "slow (0.7 , 0.7 ,false )"
    				},
    				0
    			);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slide> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ gsap: gsapWithCSS, ScrollTrigger, Scrollbar: SmoothScrollbar, onMount });
    	return [];
    }

    class Slide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slide",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /*!
     * strings: 3.6.1
     * https://greensock.com
     *
     * Copyright 2008-2021, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var _trimExp = /(^\s+|\s+$)/g;
    var emojiExp = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;
    function getText(e) {
      var type = e.nodeType,
          result = "";

      if (type === 1 || type === 9 || type === 11) {
        if (typeof e.textContent === "string") {
          return e.textContent;
        } else {
          for (e = e.firstChild; e; e = e.nextSibling) {
            result += getText(e);
          }
        }
      } else if (type === 3 || type === 4) {
        return e.nodeValue;
      }

      return result;
    }
    function splitInnerHTML(element, delimiter, trim) {
      var node = element.firstChild,
          result = [];

      while (node) {
        if (node.nodeType === 3) {
          result.push.apply(result, emojiSafeSplit((node.nodeValue + "").replace(/^\n+/g, "").replace(/\s+/g, " "), delimiter, trim));
        } else if ((node.nodeName + "").toLowerCase() === "br") {
          result[result.length - 1] += "<br>";
        } else {
          result.push(node.outerHTML);
        }

        node = node.nextSibling;
      }

      return result;
    }
    /*
    //smaller kb version that only handles the simpler emoji's, which is often perfectly adequate.

    let _emoji = "[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D]|[\uD800-\uDBFF][\uDC00-\uDFFF]",
    	_emojiExp = new RegExp(_emoji),
    	_emojiAndCharsExp = new RegExp(_emoji + "|.", "g"),
    	_emojiSafeSplit = (text, delimiter, trim) => {
    		if (trim) {
    			text = text.replace(_trimExp, "");
    		}
    		return ((delimiter === "" || !delimiter) && _emojiExp.test(text)) ? text.match(_emojiAndCharsExp) : text.split(delimiter || "");
    	};
     */

    function emojiSafeSplit(text, delimiter, trim) {
      text += ""; // make sure it's cast as a string. Someone may pass in a number.

      if (trim) {
        text = text.replace(_trimExp, "");
      }

      if (delimiter && delimiter !== "") {
        return text.replace(/>/g, "&gt;").replace(/</g, "&lt;").split(delimiter);
      }

      var result = [],
          l = text.length,
          i = 0,
          j,
          character;

      for (; i < l; i++) {
        character = text.charAt(i);

        if (character.charCodeAt(0) >= 0xD800 && character.charCodeAt(0) <= 0xDBFF || text.charCodeAt(i + 1) >= 0xFE00 && text.charCodeAt(i + 1) <= 0xFE0F) {
          //special emoji characters use 2 or 4 unicode characters that we must keep together.
          j = ((text.substr(i, 12).split(emojiExp) || [])[1] || "").length || 2;
          character = text.substr(i, j);
          result.emoji = 1;
          i += j - 1;
        }

        result.push(character === ">" ? "&gt;" : character === "<" ? "&lt;" : character);
      }

      return result;
    }

    /*!
     * TextPlugin 3.6.1
     * https://greensock.com
     *
     * @license Copyright 2008-2021, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    var gsap,
        _tempDiv,
        _getGSAP = function _getGSAP() {
      return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
    };

    var TextPlugin = {
      version: "3.6.1",
      name: "text",
      init: function init(target, value, tween) {
        var i = target.nodeName.toUpperCase(),
            data = this,
            _short,
            text,
            original,
            j,
            condensedText,
            condensedOriginal,
            aggregate,
            s;

        data.svg = target.getBBox && (i === "TEXT" || i === "TSPAN");

        if (!("innerHTML" in target) && !data.svg) {
          return false;
        }

        data.target = target;

        if (typeof value !== "object") {
          value = {
            value: value
          };
        }

        if (!("value" in value)) {
          data.text = data.original = [""];
          return;
        }

        data.delimiter = value.delimiter || "";
        original = splitInnerHTML(target, data.delimiter);

        if (!_tempDiv) {
          _tempDiv = document.createElement("div");
        }

        _tempDiv.innerHTML = value.value;
        text = splitInnerHTML(_tempDiv, data.delimiter);
        data.from = tween._from;

        if (data.from) {
          i = original;
          original = text;
          text = i;
        }

        data.hasClass = !!(value.newClass || value.oldClass);
        data.newClass = value.newClass;
        data.oldClass = value.oldClass;
        i = original.length - text.length;
        _short = i < 0 ? original : text;
        data.fillChar = value.fillChar || (value.padSpace ? "&nbsp;" : "");

        if (i < 0) {
          i = -i;
        }

        while (--i > -1) {
          _short.push(data.fillChar);
        }

        if (value.type === "diff") {
          j = 0;
          condensedText = [];
          condensedOriginal = [];
          aggregate = "";

          for (i = 0; i < text.length; i++) {
            s = text[i];

            if (s === original[i]) {
              aggregate += s;
            } else {
              condensedText[j] = aggregate + s;
              condensedOriginal[j++] = aggregate + original[i];
              aggregate = "";
            }
          }

          text = condensedText;
          original = condensedOriginal;

          if (aggregate) {
            text.push(aggregate);
            original.push(aggregate);
          }
        }

        if (value.speed) {
          tween.duration(Math.min(0.05 / value.speed * _short.length, value.maxDuration || 9999));
        }

        this.original = original;
        this.text = text;

        this._props.push("text");
      },
      render: function render(ratio, data) {
        if (ratio > 1) {
          ratio = 1;
        } else if (ratio < 0) {
          ratio = 0;
        }

        if (data.from) {
          ratio = 1 - ratio;
        }

        var text = data.text,
            hasClass = data.hasClass,
            newClass = data.newClass,
            oldClass = data.oldClass,
            delimiter = data.delimiter,
            target = data.target,
            fillChar = data.fillChar,
            original = data.original,
            l = text.length,
            i = ratio * l + 0.5 | 0,
            applyNew,
            applyOld,
            str;

        if (hasClass) {
          applyNew = newClass && i;
          applyOld = oldClass && i !== l;
          str = (applyNew ? "<span class='" + newClass + "'>" : "") + text.slice(0, i).join(delimiter) + (applyNew ? "</span>" : "") + (applyOld ? "<span class='" + oldClass + "'>" : "") + delimiter + original.slice(i).join(delimiter) + (applyOld ? "</span>" : "");
        } else {
          str = text.slice(0, i).join(delimiter) + delimiter + original.slice(i).join(delimiter);
        }

        if (data.svg) {
          //SVG text elements don't have an "innerHTML" in Microsoft browsers.
          target.textContent = str;
        } else {
          target.innerHTML = fillChar === "&nbsp;" && ~str.indexOf("  ") ? str.split("  ").join("&nbsp;&nbsp;") : str;
        }
      }
    };
    TextPlugin.splitInnerHTML = splitInnerHTML;
    TextPlugin.emojiSafeSplit = emojiSafeSplit;
    TextPlugin.getText = getText;
    _getGSAP() && gsap.registerPlugin(TextPlugin);

    /* src\components\commons\Button.svelte generated by Svelte v3.38.1 */

    const file$4 = "src\\components\\commons\\Button.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let button;
    	let t1;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "ادامه مطلب";
    			t1 = space();
    			img = element("img");
    			attr_dev(button, "class", "button__more");
    			add_location(button, file$4, 1, 4, 33);
    			attr_dev(img, "class", "button__more--icon svelte-d7tbe3");
    			attr_dev(img, "alt", "");
    			if (img.src !== (img_src_value = "assets/icons/3.PNG")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$4, 2, 4, 106);
    			attr_dev(div, "class", "d-flex button");
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { onClick } = $$props;
    	const writable_props = ["onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({ onClick });

    	$$self.$inject_state = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[0] === undefined && !("onClick" in props)) {
    			console.warn("<Button> was created without expected prop 'onClick'");
    		}
    	}

    	get onClick() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\elements\insects\Insect-item.svelte generated by Svelte v3.38.1 */
    const file$3 = "src\\components\\elements\\insects\\Insect-item.svelte";

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let figure;
    	let div2;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let span0;
    	let t3;
    	let button0;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let article;
    	let span1;
    	let t6;
    	let t7;
    	let p;
    	let t8;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	button1 = new Button({
    			props: { onClick: /*handleShow*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			figure = element("figure");
    			div2 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "ما حشرات رو دوست داریم ولی انسان ها رو بیشتر";
    			t3 = space();
    			button0 = element("button");
    			img1 = element("img");
    			t4 = space();
    			img2 = element("img");
    			t5 = space();
    			article = element("article");
    			span1 = element("span");
    			t6 = text(/*title*/ ctx[0]);
    			t7 = space();
    			p = element("p");
    			t8 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div0, "class", "insectsInfo__replace svelte-paexfk");
    			add_location(div0, file$3, 143, 4, 4672);
    			attr_dev(img0, "class", "insectsInfo__item--header--logo svelte-paexfk");
    			if (img0.src !== (img0_src_value = "assets/logo.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$3, 148, 20, 4991);
    			attr_dev(span0, "class", "insectsInfo__item--header--titre svelte-paexfk");
    			add_location(span0, file$3, 153, 20, 5197);
    			attr_dev(div1, "class", "d-flex d-flex__aline-center");
    			add_location(div1, file$3, 147, 16, 4928);
    			attr_dev(img1, "class", "insectsInfo__item--header--back svelte-paexfk");
    			if (img1.src !== (img1_src_value = "assets/icons/back.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$3, 158, 20, 5433);
    			add_location(button0, file$3, 157, 16, 5381);
    			attr_dev(div2, "class", "insectsInfo__item--header svelte-paexfk");
    			add_location(div2, file$3, 146, 12, 4848);
    			if (img2.src !== (img2_src_value = /*img*/ ctx[2])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-paexfk");
    			add_location(img2, file$3, 165, 12, 5684);
    			attr_dev(figure, "class", "insectsInfo__item--image svelte-paexfk");
    			add_location(figure, file$3, 145, 8, 4793);
    			attr_dev(span1, "class", "insectsInfo__item--title svelte-paexfk");
    			add_location(span1, file$3, 168, 12, 5789);
    			attr_dev(p, "class", "insectsInfo__item--body svelte-paexfk");
    			add_location(p, file$3, 169, 12, 5856);
    			attr_dev(article, "class", "d-flex d-flex__column svelte-paexfk");
    			add_location(article, file$3, 167, 8, 5736);
    			attr_dev(div3, "class", "insectsInfo__item svelte-paexfk");
    			add_location(div3, file$3, 144, 4, 4733);
    			set_style(div4, "position", "relative");
    			add_location(div4, file$3, 142, 0, 4634);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			/*div0_binding*/ ctx[7](div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, figure);
    			append_dev(figure, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t1);
    			append_dev(div1, span0);
    			append_dev(div2, t3);
    			append_dev(div2, button0);
    			append_dev(button0, img1);
    			/*div2_binding*/ ctx[8](div2);
    			append_dev(figure, t4);
    			append_dev(figure, img2);
    			append_dev(div3, t5);
    			append_dev(div3, article);
    			append_dev(article, span1);
    			append_dev(span1, t6);
    			append_dev(article, t7);
    			append_dev(article, p);
    			p.innerHTML = /*body*/ ctx[1];
    			append_dev(article, t8);
    			mount_component(button1, article, null);
    			/*div3_binding*/ ctx[9](div3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button0, "click", /*handleShow*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*img*/ 4 && img2.src !== (img2_src_value = /*img*/ ctx[2])) {
    				attr_dev(img2, "src", img2_src_value);
    			}

    			if (!current || dirty & /*title*/ 1) set_data_dev(t6, /*title*/ ctx[0]);
    			if (!current || dirty & /*body*/ 2) p.innerHTML = /*body*/ ctx[1];		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			/*div0_binding*/ ctx[7](null);
    			/*div2_binding*/ ctx[8](null);
    			destroy_component(button1);
    			/*div3_binding*/ ctx[9](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Insect_item", slots, []);
    	let { title } = $$props, { body } = $$props, { img } = $$props;
    	let parent, replace, itemHeader, moreButton, tl = gsapWithCSS.timeline(), show = false;
    	const desc = "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است،\n" + "\n" + "&nbsp\n" + "\n" + "و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،\n" + "\n" + "&nbsp\n" + "\n" + "شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،\n" + "\n" + "&nbsp\n" + "\n" + "در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی،\n" + "\n" + "&nbsp\n" + "\n" + "و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است،\n" + "\n" + "&nbsp\n" + "\n" + "و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،\n" + "\n" + "&nbsp\n" + "\n" + "شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،\n" + "\n" + "&nbsp\n" + "\n" + "در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی،\n" + "\n" + "&nbsp\n" + "\n" + "و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.";
    	gsapWithCSS.registerPlugin(TextPlugin);

    	function handleShow() {
    		show = !show;
    		const { width, height, top, left, x, y } = parent.getBoundingClientRect();
    		tl.set(replace, { position: "relative", width, height });
    		tl.set(parent.querySelector(".button"), { display: "none" });

    		// tl.set(parent.querySelector('.insectsInfo__item--image'), {
    		//     width: "100%"
    		// });
    		// tl.set(parent.querySelector('article'), {
    		//     padding: '2rem 4rem'
    		// });
    		tl.set(parent, {
    			position: "fixed",
    			zIndex: 900,
    			width,
    			height,
    			top: 0,
    			left: 0,
    			x: left,
    			y: top
    		});

    		tl.to(parent, 1.2, {
    			ease: "power2.inOut",
    			width: "100%",
    			height: "100%",
    			x: 0,
    			y: 0,
    			top: 0,
    			left: 0
    		}).then(() => {
    			handelHeader();
    		});

    		// tl.to(parent.querySelector('.insectsInfo__item--image'),1.2, {
    		//     ease: "power2.inOut",
    		//     width: '100%'
    		// },0);
    		tl.to(
    			parent.querySelector("article"),
    			{
    				ease: "power2.inOut",
    				transform: "translateY(0)",
    				top: 0
    			},
    			0
    		);

    		tl.to(
    			parent.querySelector(".insectsInfo__item--body"),
    			1,
    			{
    				text: { value: desc, delimiter: "" },
    				ease: "power2.inOut"
    			},
    			"-=0.3"
    		);

    		if (show) {
    			tl.play();
    		} else {
    			tl.reverse();
    		}
    	}

    	

    	function handelHeader() {
    		tl.set(itemHeader, { opacity: 1, width: "calc(100% - 4rem)" });
    		tl.to(itemHeader, 0.5, { ease: "power2.inOut", height: "5rem" });
    	}

    	const writable_props = ["title", "body", "img"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Insect_item> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			replace = $$value;
    			$$invalidate(4, replace);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			itemHeader = $$value;
    			$$invalidate(5, itemHeader);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			parent = $$value;
    			$$invalidate(3, parent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("body" in $$props) $$invalidate(1, body = $$props.body);
    		if ("img" in $$props) $$invalidate(2, img = $$props.img);
    	};

    	$$self.$capture_state = () => ({
    		gsap: gsapWithCSS,
    		TextPlugin,
    		onMount,
    		Button,
    		title,
    		body,
    		img,
    		parent,
    		replace,
    		itemHeader,
    		moreButton,
    		tl,
    		show,
    		desc,
    		handleShow,
    		handelHeader
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("body" in $$props) $$invalidate(1, body = $$props.body);
    		if ("img" in $$props) $$invalidate(2, img = $$props.img);
    		if ("parent" in $$props) $$invalidate(3, parent = $$props.parent);
    		if ("replace" in $$props) $$invalidate(4, replace = $$props.replace);
    		if ("itemHeader" in $$props) $$invalidate(5, itemHeader = $$props.itemHeader);
    		if ("moreButton" in $$props) moreButton = $$props.moreButton;
    		if ("tl" in $$props) tl = $$props.tl;
    		if ("show" in $$props) show = $$props.show;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		body,
    		img,
    		parent,
    		replace,
    		itemHeader,
    		handleShow,
    		div0_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Insect_item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0, body: 1, img: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Insect_item",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Insect_item> was created without expected prop 'title'");
    		}

    		if (/*body*/ ctx[1] === undefined && !("body" in props)) {
    			console.warn("<Insect_item> was created without expected prop 'body'");
    		}

    		if (/*img*/ ctx[2] === undefined && !("img" in props)) {
    			console.warn("<Insect_item> was created without expected prop 'img'");
    		}
    	}

    	get title() {
    		throw new Error("<Insect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Insect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get body() {
    		throw new Error("<Insect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set body(value) {
    		throw new Error("<Insect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get img() {
    		throw new Error("<Insect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<Insect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\elements\insects\InsectsInfo.svelte generated by Svelte v3.38.1 */
    const file$2 = "src\\components\\elements\\insects\\InsectsInfo.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let t2;
    	let div1;
    	let insectitem0;
    	let t3;
    	let insectitem1;
    	let t4;
    	let insectitem2;
    	let t5;
    	let insectitem3;
    	let t6;
    	let insectitem4;
    	let t7;
    	let insectitem5;
    	let current;

    	insectitem0 = new Insect_item({
    			props: {
    				title: "کفشدوزک",
    				body: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ...",
    				img: "assets/insects/3.jpeg",
    				index: 0
    			},
    			$$inline: true
    		});

    	insectitem1 = new Insect_item({
    			props: {
    				title: "زنبور عسل",
    				body: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ...",
    				img: "assets/insects/1.jpeg",
    				index: 1
    			},
    			$$inline: true
    		});

    	insectitem2 = new Insect_item({
    			props: {
    				title: "ملخ",
    				body: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ...",
    				img: "assets/insects/2.jpeg",
    				index: 2
    			},
    			$$inline: true
    		});

    	insectitem3 = new Insect_item({
    			props: {
    				title: "مگس",
    				body: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ...",
    				img: "assets/insects/4.jpeg",
    				index: 3
    			},
    			$$inline: true
    		});

    	insectitem4 = new Insect_item({
    			props: {
    				title: "سنجاقک",
    				body: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ...",
    				img: "assets/insects/6.jpeg",
    				index: 4
    			},
    			$$inline: true
    		});

    	insectitem5 = new Insect_item({
    			props: {
    				title: "پروانه",
    				body: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ...",
    				img: "assets/insects/7.jpeg",
    				index: 5
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "بیشتر با دوستانمون آشنا بشیم";
    			t2 = space();
    			div1 = element("div");
    			create_component(insectitem0.$$.fragment);
    			t3 = space();
    			create_component(insectitem1.$$.fragment);
    			t4 = space();
    			create_component(insectitem2.$$.fragment);
    			t5 = space();
    			create_component(insectitem3.$$.fragment);
    			t6 = space();
    			create_component(insectitem4.$$.fragment);
    			t7 = space();
    			create_component(insectitem5.$$.fragment);
    			attr_dev(img, "class", "insectsInfo__titre--icon");
    			if (img.src !== (img_src_value = "assets/insects/info-2.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 7, 6, 171);
    			attr_dev(span, "class", "insectsInfo__titre--text");
    			add_location(span, file$2, 8, 6, 251);
    			attr_dev(div0, "class", "insectsInfo__titre svelte-6v4jxo");
    			add_location(div0, file$2, 6, 4, 131);
    			attr_dev(div1, "class", "insectsInfo__items svelte-6v4jxo");
    			add_location(div1, file$2, 12, 4, 361);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$2, 5, 2, 102);
    			attr_dev(div3, "class", "insectsInfo svelte-6v4jxo");
    			add_location(div3, file$2, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			mount_component(insectitem0, div1, null);
    			append_dev(div1, t3);
    			mount_component(insectitem1, div1, null);
    			append_dev(div1, t4);
    			mount_component(insectitem2, div1, null);
    			append_dev(div1, t5);
    			mount_component(insectitem3, div1, null);
    			append_dev(div1, t6);
    			mount_component(insectitem4, div1, null);
    			append_dev(div1, t7);
    			mount_component(insectitem5, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(insectitem0.$$.fragment, local);
    			transition_in(insectitem1.$$.fragment, local);
    			transition_in(insectitem2.$$.fragment, local);
    			transition_in(insectitem3.$$.fragment, local);
    			transition_in(insectitem4.$$.fragment, local);
    			transition_in(insectitem5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(insectitem0.$$.fragment, local);
    			transition_out(insectitem1.$$.fragment, local);
    			transition_out(insectitem2.$$.fragment, local);
    			transition_out(insectitem3.$$.fragment, local);
    			transition_out(insectitem4.$$.fragment, local);
    			transition_out(insectitem5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(insectitem0);
    			destroy_component(insectitem1);
    			destroy_component(insectitem2);
    			destroy_component(insectitem3);
    			destroy_component(insectitem4);
    			destroy_component(insectitem5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InsectsInfo", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InsectsInfo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ InsectItem: Insect_item });
    	return [];
    }

    class InsectsInfo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InsectsInfo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\elements\Contact.svelte generated by Svelte v3.38.1 */
    const file$1 = "src\\components\\elements\\Contact.svelte";

    function create_fragment$1(ctx) {
    	let div12;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let span0;
    	let t2;
    	let div11;
    	let div10;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let h1;
    	let t5;
    	let div2;
    	let t6;
    	let div6;
    	let p;
    	let t8;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let span1;
    	let t11;
    	let div4;
    	let img3;
    	let img3_src_value;
    	let t12;
    	let span2;
    	let t14;
    	let div5;
    	let a0;
    	let img4;
    	let img4_src_value;
    	let t15;
    	let a1;
    	let img5;
    	let img5_src_value;
    	let t16;
    	let a2;
    	let img6;
    	let img6_src_value;
    	let t17;
    	let div9;
    	let img7;
    	let img7_src_value;
    	let t18;
    	let div8;
    	let img8;
    	let img8_src_value;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "با ما در ارتباط باشید";
    			t2 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div7 = element("div");
    			img1 = element("img");
    			t3 = space();
    			h1 = element("h1");
    			h1.textContent = "ما حشرات رو دوست داریم ولی انسان ها رو بیشتر";
    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			div6 = element("div");
    			p = element("p");
    			p.textContent = "راه های ارتباطی";
    			t8 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t9 = space();
    			span1 = element("span");
    			span1.textContent = "۰۳۱ - ۵۵۴۴۸۸۹۹ , ۵۵۴۴۸۸۳۳";
    			t11 = space();
    			div4 = element("div");
    			img3 = element("img");
    			t12 = space();
    			span2 = element("span");
    			span2.textContent = "۰۹۱۳۷۷۷۸۸۷۷ , ۰۹۱۲۲۲۲۴۴۶۶";
    			t14 = space();
    			div5 = element("div");
    			a0 = element("a");
    			img4 = element("img");
    			t15 = space();
    			a1 = element("a");
    			img5 = element("img");
    			t16 = space();
    			a2 = element("a");
    			img6 = element("img");
    			t17 = space();
    			div9 = element("div");
    			img7 = element("img");
    			t18 = space();
    			div8 = element("div");
    			img8 = element("img");
    			attr_dev(img0, "class", "contact__titre--icon");
    			if (img0.src !== (img0_src_value = "assets/icons/contact.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$1, 63, 16, 1434);
    			attr_dev(span0, "class", "contact__titre--text");
    			add_location(span0, file$1, 64, 16, 1518);
    			attr_dev(div0, "class", "contact__titre svelte-13kp7d");
    			add_location(div0, file$1, 62, 12, 1388);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$1, 61, 8, 1351);
    			attr_dev(img1, "class", "contact__element--logo svelte-13kp7d");
    			if (img1.src !== (img1_src_value = "assets/logo.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 72, 20, 1796);
    			attr_dev(h1, "class", "svelte-13kp7d");
    			add_location(h1, file$1, 77, 20, 1993);
    			attr_dev(div2, "class", "contact__element--line svelte-13kp7d");
    			add_location(div2, file$1, 78, 20, 2069);
    			attr_dev(p, "class", "contact__element--p svelte-13kp7d");
    			add_location(p, file$1, 80, 24, 2195);
    			attr_dev(img2, "class", "contact__element--ways--icon");
    			if (img2.src !== (img2_src_value = "assets/contact/telephone.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$1, 82, 28, 2345);
    			attr_dev(span1, "class", "svelte-13kp7d");
    			add_location(span1, file$1, 88, 28, 2654);
    			attr_dev(div3, "class", "contact__element--ways--phone svelte-13kp7d");
    			add_location(div3, file$1, 81, 24, 2272);
    			attr_dev(img3, "class", "contact__element--ways--icon");
    			if (img3.src !== (img3_src_value = "assets/contact/mobile.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$1, 92, 28, 2825);
    			attr_dev(span2, "class", "svelte-13kp7d");
    			add_location(span2, file$1, 98, 28, 3131);
    			attr_dev(div4, "class", "contact__element--ways--phone svelte-13kp7d");
    			add_location(div4, file$1, 91, 24, 2752);
    			if (img4.src !== (img4_src_value = "assets/contact/whatsapp.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			attr_dev(img4, "class", "svelte-13kp7d");
    			add_location(img4, file$1, 103, 32, 3349);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$1, 102, 28, 3303);
    			if (img5.src !== (img5_src_value = "assets/contact/telegram.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			attr_dev(img5, "class", "svelte-13kp7d");
    			add_location(img5, file$1, 111, 32, 3681);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$1, 110, 28, 3635);
    			if (img6.src !== (img6_src_value = "assets/contact/instagram.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			attr_dev(img6, "class", "svelte-13kp7d");
    			add_location(img6, file$1, 119, 32, 4013);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$1, 118, 28, 3967);
    			attr_dev(div5, "class", "contact__element--ways--social svelte-13kp7d");
    			add_location(div5, file$1, 101, 24, 3229);
    			attr_dev(div6, "class", "contact__element--ways svelte-13kp7d");
    			add_location(div6, file$1, 79, 20, 2133);
    			attr_dev(div7, "class", "contact__element--text svelte-13kp7d");
    			add_location(div7, file$1, 71, 16, 1738);
    			attr_dev(img7, "class", "contact__element--img svelte-13kp7d");
    			if (img7.src !== (img7_src_value = "assets/contact/5.jpg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			add_location(img7, file$1, 129, 20, 4397);
    			attr_dev(img8, "class", "contact__element--icon--img svelte-13kp7d");
    			if (img8.src !== (img8_src_value = "assets/contact/phone.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$1, 137, 24, 4724);
    			attr_dev(div8, "class", "contact__element--icon svelte-13kp7d");
    			add_location(div8, file$1, 136, 20, 4645);
    			add_location(div9, file$1, 128, 16, 4370);
    			attr_dev(div10, "class", "contact__element svelte-13kp7d");
    			add_location(div10, file$1, 70, 12, 1690);
    			attr_dev(div11, "class", "container");
    			add_location(div11, file$1, 69, 8, 1653);
    			attr_dev(div12, "class", "contact svelte-13kp7d");
    			add_location(div12, file$1, 60, 4, 1320);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div12, t2);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t3);
    			append_dev(div7, h1);
    			append_dev(div7, t5);
    			append_dev(div7, div2);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, p);
    			append_dev(div6, t8);
    			append_dev(div6, div3);
    			append_dev(div3, img2);
    			/*img2_binding*/ ctx[2](img2);
    			append_dev(div3, t9);
    			append_dev(div3, span1);
    			append_dev(div6, t11);
    			append_dev(div6, div4);
    			append_dev(div4, img3);
    			/*img3_binding*/ ctx[3](img3);
    			append_dev(div4, t12);
    			append_dev(div4, span2);
    			append_dev(div6, t14);
    			append_dev(div6, div5);
    			append_dev(div5, a0);
    			append_dev(a0, img4);
    			/*img4_binding*/ ctx[4](img4);
    			append_dev(div5, t15);
    			append_dev(div5, a1);
    			append_dev(a1, img5);
    			/*img5_binding*/ ctx[5](img5);
    			append_dev(div5, t16);
    			append_dev(div5, a2);
    			append_dev(a2, img6);
    			/*img6_binding*/ ctx[6](img6);
    			append_dev(div10, t17);
    			append_dev(div10, div9);
    			append_dev(div9, img7);
    			/*img7_binding*/ ctx[7](img7);
    			append_dev(div9, t18);
    			append_dev(div9, div8);
    			append_dev(div8, img8);
    			/*div8_binding*/ ctx[8](div8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			/*img2_binding*/ ctx[2](null);
    			/*img3_binding*/ ctx[3](null);
    			/*img4_binding*/ ctx[4](null);
    			/*img5_binding*/ ctx[5](null);
    			/*img6_binding*/ ctx[6](null);
    			/*img7_binding*/ ctx[7](null);
    			/*div8_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	gsapWithCSS.registerPlugin(ScrollTrigger);

    	let img,
    		icon,
    		tl = gsapWithCSS.timeline({
    			scrollTrigger: {
    				trigger: ".contact",
    				start: "center",
    				end: window.innerHeight,
    				scrub: 1
    			}
    		});

    	onMount(() => HandleImg());

    	function HandleImg() {
    		const { width, height, top, left, x, y } = img.getBoundingClientRect();
    		tl.set(img, { width });
    		tl.set(icon, { width });
    		tl.to(img, 2, { ease: "power2.inOut", width: "50%" });

    		tl.to(icon, 1.2, {
    			ease: "power2.inOut",
    			opacity: 1,
    			width: "5rem"
    		});

    		tl.to(document.getElementsByClassName("contact__element--icon--img"), { ease: "power2.inOut", opacity: 1 }, "-=0.9");
    	} // tl.play()
    	// ScrollTrigger.create(document.getElementsByClassName('contact'),

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	function img2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(0, img);
    		});
    	}

    	function img3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(0, img);
    		});
    	}

    	function img4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(0, img);
    		});
    	}

    	function img5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(0, img);
    		});
    	}

    	function img6_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(0, img);
    		});
    	}

    	function img7_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(0, img);
    		});
    	}

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			icon = $$value;
    			$$invalidate(1, icon);
    		});
    	}

    	$$self.$capture_state = () => ({
    		gsap: gsapWithCSS,
    		ScrollTrigger,
    		onMount,
    		img,
    		icon,
    		tl,
    		HandleImg
    	});

    	$$self.$inject_state = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("tl" in $$props) tl = $$props.tl;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		img,
    		icon,
    		img2_binding,
    		img3_binding,
    		img4_binding,
    		img5_binding,
    		img6_binding,
    		img7_binding,
    		div8_binding
    	];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let slide;
    	let t0;
    	let insectsinfo;
    	let t1;
    	let contact;
    	let t2;
    	let div;
    	let p;
    	let current;
    	slide = new Slide({ $$inline: true });
    	insectsinfo = new InsectsInfo({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(slide.$$.fragment);
    			t0 = space();
    			create_component(insectsinfo.$$.fragment);
    			t1 = space();
    			create_component(contact.$$.fragment);
    			t2 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "\" Made by Leila Zomorrdi under the supervision of Mr. Ehtesham \"";
    			add_location(p, file, 13, 4, 313);
    			attr_dev(div, "class", "Signature svelte-1e8ayn9");
    			add_location(div, file, 12, 2, 284);
    			add_location(main, file, 7, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(slide, main, null);
    			append_dev(main, t0);
    			mount_component(insectsinfo, main, null);
    			append_dev(main, t1);
    			mount_component(contact, main, null);
    			append_dev(main, t2);
    			append_dev(main, div);
    			append_dev(div, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slide.$$.fragment, local);
    			transition_in(insectsinfo.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slide.$$.fragment, local);
    			transition_out(insectsinfo.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(slide);
    			destroy_component(insectsinfo);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Slide, InsectsInfo, Contact });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
