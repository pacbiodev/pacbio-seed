"format register";
System.register("rx", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  ;
  (function(undefined) {
    var objectTypes = {
      'boolean': false,
      'function': true,
      'object': true,
      'number': false,
      'string': false,
      'undefined': false
    };
    var root = (objectTypes[typeof window] && window) || this,
        freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
        freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
        moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
        freeGlobal = objectTypes[typeof global] && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
      root = freeGlobal;
    }
    var Rx = {
      internals: {},
      config: {Promise: root.Promise},
      helpers: {}
    };
    var noop = Rx.helpers.noop = function() {},
        notDefined = Rx.helpers.notDefined = function(x) {
          return typeof x === 'undefined';
        },
        isScheduler = Rx.helpers.isScheduler = function(x) {
          return x instanceof Rx.Scheduler;
        },
        identity = Rx.helpers.identity = function(x) {
          return x;
        },
        pluck = Rx.helpers.pluck = function(property) {
          return function(x) {
            return x[property];
          };
        },
        just = Rx.helpers.just = function(value) {
          return function() {
            return value;
          };
        },
        defaultNow = Rx.helpers.defaultNow = Date.now,
        defaultComparer = Rx.helpers.defaultComparer = function(x, y) {
          return isEqual(x, y);
        },
        defaultSubComparer = Rx.helpers.defaultSubComparer = function(x, y) {
          return x > y ? 1 : (x < y ? -1 : 0);
        },
        defaultKeySerializer = Rx.helpers.defaultKeySerializer = function(x) {
          return x.toString();
        },
        defaultError = Rx.helpers.defaultError = function(err) {
          throw err;
        },
        isPromise = Rx.helpers.isPromise = function(p) {
          return !!p && typeof p.then === 'function';
        },
        asArray = Rx.helpers.asArray = function() {
          return Array.prototype.slice.call(arguments);
        },
        not = Rx.helpers.not = function(a) {
          return !a;
        },
        isFunction = Rx.helpers.isFunction = (function() {
          var isFn = function(value) {
            return typeof value == 'function' || false;
          };
          if (isFn(/x/)) {
            isFn = function(value) {
              return typeof value == 'function' && toString.call(value) == '[object Function]';
            };
          }
          return isFn;
        }());
    function cloneArray(arr) {
      for (var a = [],
          i = 0,
          len = arr.length; i < len; i++) {
        a.push(arr[i]);
      }
      return a;
    }
    Rx.config.longStackSupport = false;
    var hasStacks = false;
    try {
      throw new Error();
    } catch (e) {
      hasStacks = !!e.stack;
    }
    var rStartingLine = captureLine(),
        rFileName;
    var STACK_JUMP_SEPARATOR = "From previous event:";
    function makeStackTraceLong(error, observable) {
      if (hasStacks && observable.stack && typeof error === "object" && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
        var stacks = [];
        for (var o = observable; !!o; o = o.source) {
          if (o.stack) {
            stacks.unshift(o.stack);
          }
        }
        stacks.unshift(error.stack);
        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
      }
    }
    function filterStackString(stackString) {
      var lines = stackString.split("\n"),
          desiredLines = [];
      for (var i = 0,
          len = lines.length; i < len; i++) {
        var line = lines[i];
        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
          desiredLines.push(line);
        }
      }
      return desiredLines.join("\n");
    }
    function isInternalFrame(stackLine) {
      var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
      if (!fileNameAndLineNumber) {
        return false;
      }
      var fileName = fileNameAndLineNumber[0],
          lineNumber = fileNameAndLineNumber[1];
      return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;
    }
    function isNodeFrame(stackLine) {
      return stackLine.indexOf("(module.js:") !== -1 || stackLine.indexOf("(node.js:") !== -1;
    }
    function captureLine() {
      if (!hasStacks) {
        return ;
      }
      try {
        throw new Error();
      } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
          return ;
        }
        rFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
      }
    }
    function getFileNameAndLineNumber(stackLine) {
      var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
      if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
      }
      var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
      if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
      }
      var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
      if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
      }
    }
    var EmptyError = Rx.EmptyError = function() {
      this.message = 'Sequence contains no elements.';
      Error.call(this);
    };
    EmptyError.prototype = Error.prototype;
    var ObjectDisposedError = Rx.ObjectDisposedError = function() {
      this.message = 'Object has been disposed';
      Error.call(this);
    };
    ObjectDisposedError.prototype = Error.prototype;
    var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function() {
      this.message = 'Argument out of range';
      Error.call(this);
    };
    ArgumentOutOfRangeError.prototype = Error.prototype;
    var NotSupportedError = Rx.NotSupportedError = function(message) {
      this.message = message || 'This operation is not supported';
      Error.call(this);
    };
    NotSupportedError.prototype = Error.prototype;
    var NotImplementedError = Rx.NotImplementedError = function(message) {
      this.message = message || 'This operation is not implemented';
      Error.call(this);
    };
    NotImplementedError.prototype = Error.prototype;
    var notImplemented = Rx.helpers.notImplemented = function() {
      throw new NotImplementedError();
    };
    var notSupported = Rx.helpers.notSupported = function() {
      throw new NotSupportedError();
    };
    var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';
    if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
      $iterator$ = '@@iterator';
    }
    var doneEnumerator = Rx.doneEnumerator = {
      done: true,
      value: undefined
    };
    var isIterable = Rx.helpers.isIterable = function(o) {
      return o[$iterator$] !== undefined;
    };
    var isArrayLike = Rx.helpers.isArrayLike = function(o) {
      return o && o.length !== undefined;
    };
    Rx.helpers.iterator = $iterator$;
    var bindCallback = Rx.internals.bindCallback = function(func, thisArg, argCount) {
      if (typeof thisArg === 'undefined') {
        return func;
      }
      switch (argCount) {
        case 0:
          return function() {
            return func.call(thisArg);
          };
        case 1:
          return function(arg) {
            return func.call(thisArg, arg);
          };
        case 2:
          return function(value, index) {
            return func.call(thisArg, value, index);
          };
        case 3:
          return function(value, index, collection) {
            return func.call(thisArg, value, index, collection);
          };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    };
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
        dontEnumsLength = dontEnums.length;
    var argsClass = '[object Arguments]',
        arrayClass = '[object Array]',
        boolClass = '[object Boolean]',
        dateClass = '[object Date]',
        errorClass = '[object Error]',
        funcClass = '[object Function]',
        numberClass = '[object Number]',
        objectClass = '[object Object]',
        regexpClass = '[object RegExp]',
        stringClass = '[object String]';
    var toString = Object.prototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        supportsArgsClass = toString.call(arguments) == argsClass,
        supportNodeClass,
        errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype,
        propertyIsEnumerable = objectProto.propertyIsEnumerable;
    try {
      supportNodeClass = !(toString.call(document) == objectClass && !({'toString': 0} + ''));
    } catch (e) {
      supportNodeClass = true;
    }
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
      'constructor': true,
      'toLocaleString': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
      'constructor': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
      'constructor': true,
      'toString': true
    };
    nonEnumProps[objectClass] = {'constructor': true};
    var support = {};
    (function() {
      var ctor = function() {
        this.x = 1;
      },
          props = [];
      ctor.prototype = {
        'valueOf': 1,
        'y': 1
      };
      for (var key in new ctor) {
        props.push(key);
      }
      for (key in arguments) {}
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
      support.nonEnumArgs = key != 0;
      support.nonEnumShadows = !/valueOf/.test(props);
    }(1));
    var isObject = Rx.internals.isObject = function(value) {
      var type = typeof value;
      return value && (type == 'function' || type == 'object') || false;
    };
    function keysIn(object) {
      var result = [];
      if (!isObject(object)) {
        return result;
      }
      if (support.nonEnumArgs && object.length && isArguments(object)) {
        object = slice.call(object);
      }
      var skipProto = support.enumPrototypes && typeof object == 'function',
          skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);
      for (var key in object) {
        if (!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name'))) {
          result.push(key);
        }
      }
      if (support.nonEnumShadows && object !== objectProto) {
        var ctor = object.constructor,
            index = -1,
            length = dontEnumsLength;
        if (object === (ctor && ctor.prototype)) {
          var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
              nonEnum = nonEnumProps[className];
        }
        while (++index < length) {
          key = dontEnums[index];
          if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
            result.push(key);
          }
        }
      }
      return result;
    }
    function internalFor(object, callback, keysFunc) {
      var index = -1,
          props = keysFunc(object),
          length = props.length;
      while (++index < length) {
        var key = props[index];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }
    function internalForIn(object, callback) {
      return internalFor(object, callback, keysIn);
    }
    function isNode(value) {
      return typeof value.toString != 'function' && typeof(value + '') == 'string';
    }
    var isArguments = function(value) {
      return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
    };
    if (!supportsArgsClass) {
      isArguments = function(value) {
        return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
      };
    }
    var isEqual = Rx.internals.isEqual = function(x, y) {
      return deepEquals(x, y, [], []);
    };
    function deepEquals(a, b, stackA, stackB) {
      if (a === b) {
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;
      if (a === a && (a == null || b == null || (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
        return false;
      }
      var className = toString.call(a),
          otherClass = toString.call(b);
      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          return +a == +b;
        case numberClass:
          return (a != +a) ? b != +b : (a == 0 ? (1 / a == 1 / b) : a == +b);
        case regexpClass:
        case stringClass:
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
        if (ctorA != ctorB && !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
      }
      var initedStack = !stackA;
      stackA || (stackA = []);
      stackB || (stackB = []);
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      var result = true;
      stackA.push(a);
      stackB.push(b);
      if (isArr) {
        length = a.length;
        size = b.length;
        result = size == length;
        if (result) {
          while (size--) {
            var index = length,
                value = b[size];
            if (!(result = deepEquals(a[size], value, stackA, stackB))) {
              break;
            }
          }
        }
      } else {
        internalForIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            size++;
            return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
          }
        });
        if (result) {
          internalForIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();
      return result;
    }
    var hasProp = {}.hasOwnProperty,
        slice = Array.prototype.slice;
    var inherits = this.inherits = Rx.internals.inherits = function(child, parent) {
      function __() {
        this.constructor = child;
      }
      __.prototype = parent.prototype;
      child.prototype = new __();
    };
    var addProperties = Rx.internals.addProperties = function(obj) {
      for (var sources = [],
          i = 1,
          len = arguments.length; i < len; i++) {
        sources.push(arguments[i]);
      }
      for (var idx = 0,
          ln = sources.length; idx < ln; idx++) {
        var source = sources[idx];
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    };
    var addRef = Rx.internals.addRef = function(xs, r) {
      return new AnonymousObservable(function(observer) {
        return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
      });
    };
    function arrayInitialize(count, factory) {
      var a = new Array(count);
      for (var i = 0; i < count; i++) {
        a[i] = factory();
      }
      return a;
    }
    var errorObj = {e: {}};
    var tryCatchTarget;
    function tryCatcher() {
      try {
        return tryCatchTarget.apply(this, arguments);
      } catch (e) {
        errorObj.e = e;
        return errorObj;
      }
    }
    function tryCatch(fn) {
      if (!isFunction(fn)) {
        throw new TypeError('fn must be a function');
      }
      tryCatchTarget = fn;
      return tryCatcher;
    }
    function thrower(e) {
      throw e;
    }
    function IndexedItem(id, value) {
      this.id = id;
      this.value = value;
    }
    IndexedItem.prototype.compareTo = function(other) {
      var c = this.value.compareTo(other.value);
      c === 0 && (c = this.id - other.id);
      return c;
    };
    var PriorityQueue = Rx.internals.PriorityQueue = function(capacity) {
      this.items = new Array(capacity);
      this.length = 0;
    };
    var priorityProto = PriorityQueue.prototype;
    priorityProto.isHigherPriority = function(left, right) {
      return this.items[left].compareTo(this.items[right]) < 0;
    };
    priorityProto.percolate = function(index) {
      if (index >= this.length || index < 0) {
        return ;
      }
      var parent = index - 1 >> 1;
      if (parent < 0 || parent === index) {
        return ;
      }
      if (this.isHigherPriority(index, parent)) {
        var temp = this.items[index];
        this.items[index] = this.items[parent];
        this.items[parent] = temp;
        this.percolate(parent);
      }
    };
    priorityProto.heapify = function(index) {
      +index || (index = 0);
      if (index >= this.length || index < 0) {
        return ;
      }
      var left = 2 * index + 1,
          right = 2 * index + 2,
          first = index;
      if (left < this.length && this.isHigherPriority(left, first)) {
        first = left;
      }
      if (right < this.length && this.isHigherPriority(right, first)) {
        first = right;
      }
      if (first !== index) {
        var temp = this.items[index];
        this.items[index] = this.items[first];
        this.items[first] = temp;
        this.heapify(first);
      }
    };
    priorityProto.peek = function() {
      return this.items[0].value;
    };
    priorityProto.removeAt = function(index) {
      this.items[index] = this.items[--this.length];
      this.items[this.length] = undefined;
      this.heapify();
    };
    priorityProto.dequeue = function() {
      var result = this.peek();
      this.removeAt(0);
      return result;
    };
    priorityProto.enqueue = function(item) {
      var index = this.length++;
      this.items[index] = new IndexedItem(PriorityQueue.count++, item);
      this.percolate(index);
    };
    priorityProto.remove = function(item) {
      for (var i = 0; i < this.length; i++) {
        if (this.items[i].value === item) {
          this.removeAt(i);
          return true;
        }
      }
      return false;
    };
    PriorityQueue.count = 0;
    var CompositeDisposable = Rx.CompositeDisposable = function() {
      var args = [],
          i,
          len;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
        len = args.length;
      } else {
        len = arguments.length;
        args = new Array(len);
        for (i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      for (i = 0; i < len; i++) {
        if (!isDisposable(args[i])) {
          throw new TypeError('Not a disposable');
        }
      }
      this.disposables = args;
      this.isDisposed = false;
      this.length = args.length;
    };
    var CompositeDisposablePrototype = CompositeDisposable.prototype;
    CompositeDisposablePrototype.add = function(item) {
      if (this.isDisposed) {
        item.dispose();
      } else {
        this.disposables.push(item);
        this.length++;
      }
    };
    CompositeDisposablePrototype.remove = function(item) {
      var shouldDispose = false;
      if (!this.isDisposed) {
        var idx = this.disposables.indexOf(item);
        if (idx !== -1) {
          shouldDispose = true;
          this.disposables.splice(idx, 1);
          this.length--;
          item.dispose();
        }
      }
      return shouldDispose;
    };
    CompositeDisposablePrototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var len = this.disposables.length,
            currentDisposables = new Array(len);
        for (var i = 0; i < len; i++) {
          currentDisposables[i] = this.disposables[i];
        }
        this.disposables = [];
        this.length = 0;
        for (i = 0; i < len; i++) {
          currentDisposables[i].dispose();
        }
      }
    };
    var Disposable = Rx.Disposable = function(action) {
      this.isDisposed = false;
      this.action = action || noop;
    };
    Disposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.action();
        this.isDisposed = true;
      }
    };
    var disposableCreate = Disposable.create = function(action) {
      return new Disposable(action);
    };
    var disposableEmpty = Disposable.empty = {dispose: noop};
    var isDisposable = Disposable.isDisposable = function(d) {
      return d && isFunction(d.dispose);
    };
    var checkDisposed = Disposable.checkDisposed = function(disposable) {
      if (disposable.isDisposed) {
        throw new ObjectDisposedError();
      }
    };
    var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = (function() {
      function BooleanDisposable() {
        this.isDisposed = false;
        this.current = null;
      }
      var booleanDisposablePrototype = BooleanDisposable.prototype;
      booleanDisposablePrototype.getDisposable = function() {
        return this.current;
      };
      booleanDisposablePrototype.setDisposable = function(value) {
        var shouldDispose = this.isDisposed;
        if (!shouldDispose) {
          var old = this.current;
          this.current = value;
        }
        old && old.dispose();
        shouldDispose && value && value.dispose();
      };
      booleanDisposablePrototype.dispose = function() {
        if (!this.isDisposed) {
          this.isDisposed = true;
          var old = this.current;
          this.current = null;
        }
        old && old.dispose();
      };
      return BooleanDisposable;
    }());
    var SerialDisposable = Rx.SerialDisposable = SingleAssignmentDisposable;
    var RefCountDisposable = Rx.RefCountDisposable = (function() {
      function InnerDisposable(disposable) {
        this.disposable = disposable;
        this.disposable.count++;
        this.isInnerDisposed = false;
      }
      InnerDisposable.prototype.dispose = function() {
        if (!this.disposable.isDisposed && !this.isInnerDisposed) {
          this.isInnerDisposed = true;
          this.disposable.count--;
          if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
            this.disposable.isDisposed = true;
            this.disposable.underlyingDisposable.dispose();
          }
        }
      };
      function RefCountDisposable(disposable) {
        this.underlyingDisposable = disposable;
        this.isDisposed = false;
        this.isPrimaryDisposed = false;
        this.count = 0;
      }
      RefCountDisposable.prototype.dispose = function() {
        if (!this.isDisposed && !this.isPrimaryDisposed) {
          this.isPrimaryDisposed = true;
          if (this.count === 0) {
            this.isDisposed = true;
            this.underlyingDisposable.dispose();
          }
        }
      };
      RefCountDisposable.prototype.getDisposable = function() {
        return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
      };
      return RefCountDisposable;
    })();
    function ScheduledDisposable(scheduler, disposable) {
      this.scheduler = scheduler;
      this.disposable = disposable;
      this.isDisposed = false;
    }
    function scheduleItem(s, self) {
      if (!self.isDisposed) {
        self.isDisposed = true;
        self.disposable.dispose();
      }
    }
    ScheduledDisposable.prototype.dispose = function() {
      this.scheduler.scheduleWithState(this, scheduleItem);
    };
    var ScheduledItem = Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer) {
      this.scheduler = scheduler;
      this.state = state;
      this.action = action;
      this.dueTime = dueTime;
      this.comparer = comparer || defaultSubComparer;
      this.disposable = new SingleAssignmentDisposable();
    };
    ScheduledItem.prototype.invoke = function() {
      this.disposable.setDisposable(this.invokeCore());
    };
    ScheduledItem.prototype.compareTo = function(other) {
      return this.comparer(this.dueTime, other.dueTime);
    };
    ScheduledItem.prototype.isCancelled = function() {
      return this.disposable.isDisposed;
    };
    ScheduledItem.prototype.invokeCore = function() {
      return this.action(this.scheduler, this.state);
    };
    var Scheduler = Rx.Scheduler = (function() {
      function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
        this.now = now;
        this._schedule = schedule;
        this._scheduleRelative = scheduleRelative;
        this._scheduleAbsolute = scheduleAbsolute;
      }
      function invokeAction(scheduler, action) {
        action();
        return disposableEmpty;
      }
      var schedulerProto = Scheduler.prototype;
      schedulerProto.schedule = function(action) {
        return this._schedule(action, invokeAction);
      };
      schedulerProto.scheduleWithState = function(state, action) {
        return this._schedule(state, action);
      };
      schedulerProto.scheduleWithRelative = function(dueTime, action) {
        return this._scheduleRelative(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative(state, dueTime, action);
      };
      schedulerProto.scheduleWithAbsolute = function(dueTime, action) {
        return this._scheduleAbsolute(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute(state, dueTime, action);
      };
      Scheduler.now = defaultNow;
      Scheduler.normalize = function(timeSpan) {
        timeSpan < 0 && (timeSpan = 0);
        return timeSpan;
      };
      return Scheduler;
    }());
    var normalizeTime = Scheduler.normalize;
    (function(schedulerProto) {
      function invokeRecImmediate(scheduler, pair) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        function recursiveAction(state1) {
          action(state1, function(state2) {
            var isAdded = false,
                isDone = false,
                d = scheduler.scheduleWithState(state2, function(scheduler1, state3) {
                  if (isAdded) {
                    group.remove(d);
                  } else {
                    isDone = true;
                  }
                  recursiveAction(state3);
                  return disposableEmpty;
                });
            if (!isDone) {
              group.add(d);
              isAdded = true;
            }
          });
        }
        recursiveAction(state);
        return group;
      }
      function invokeRecDate(scheduler, pair, method) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        function recursiveAction(state1) {
          action(state1, function(state2, dueTime1) {
            var isAdded = false,
                isDone = false,
                d = scheduler[method](state2, dueTime1, function(scheduler1, state3) {
                  if (isAdded) {
                    group.remove(d);
                  } else {
                    isDone = true;
                  }
                  recursiveAction(state3);
                  return disposableEmpty;
                });
            if (!isDone) {
              group.add(d);
              isAdded = true;
            }
          });
        }
        ;
        recursiveAction(state);
        return group;
      }
      function scheduleInnerRecursive(action, self) {
        action(function(dt) {
          self(action, dt);
        });
      }
      schedulerProto.scheduleRecursive = function(action) {
        return this.scheduleRecursiveWithState(action, function(_action, self) {
          _action(function() {
            self(_action);
          });
        });
      };
      schedulerProto.scheduleRecursiveWithState = function(state, action) {
        return this.scheduleWithState([state, action], invokeRecImmediate);
      };
      schedulerProto.scheduleRecursiveWithRelative = function(dueTime, action) {
        return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative([state, action], dueTime, function(s, p) {
          return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
        });
      };
      schedulerProto.scheduleRecursiveWithAbsolute = function(dueTime, action) {
        return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute([state, action], dueTime, function(s, p) {
          return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      Scheduler.prototype.schedulePeriodic = function(period, action) {
        return this.schedulePeriodicWithState(null, period, action);
      };
      Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        if (typeof root.setInterval === 'undefined') {
          throw new NotSupportedError();
        }
        period = normalizeTime(period);
        var s = state,
            id = root.setInterval(function() {
              s = action(s);
            }, period);
        return disposableCreate(function() {
          root.clearInterval(id);
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      schedulerProto.catchError = schedulerProto['catch'] = function(handler) {
        return new CatchScheduler(this, handler);
      };
    }(Scheduler.prototype));
    var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function() {
      function tick(command, recurse) {
        recurse(0, this._period);
        try {
          this._state = this._action(this._state);
        } catch (e) {
          this._cancel.dispose();
          throw e;
        }
      }
      function SchedulePeriodicRecursive(scheduler, state, period, action) {
        this._scheduler = scheduler;
        this._state = state;
        this._period = period;
        this._action = action;
      }
      SchedulePeriodicRecursive.prototype.start = function() {
        var d = new SingleAssignmentDisposable();
        this._cancel = d;
        d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));
        return d;
      };
      return SchedulePeriodicRecursive;
    }());
    var immediateScheduler = Scheduler.immediate = (function() {
      function scheduleNow(state, action) {
        return action(this, state);
      }
      return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
    }());
    var currentThreadScheduler = Scheduler.currentThread = (function() {
      var queue;
      function runTrampoline() {
        while (queue.length > 0) {
          var item = queue.dequeue();
          !item.isCancelled() && item.invoke();
        }
      }
      function scheduleNow(state, action) {
        var si = new ScheduledItem(this, state, action, this.now());
        if (!queue) {
          queue = new PriorityQueue(4);
          queue.enqueue(si);
          var result = tryCatch(runTrampoline)();
          queue = null;
          if (result === errorObj) {
            return thrower(result.e);
          }
        } else {
          queue.enqueue(si);
        }
        return si.disposable;
      }
      var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
      currentScheduler.scheduleRequired = function() {
        return !queue;
      };
      return currentScheduler;
    }());
    var scheduleMethod,
        clearMethod;
    var localTimer = (function() {
      var localSetTimeout,
          localClearTimeout = noop;
      if (!!root.WScript) {
        localSetTimeout = function(fn, time) {
          root.WScript.Sleep(time);
          fn();
        };
      } else if (!!root.setTimeout) {
        localSetTimeout = root.setTimeout;
        localClearTimeout = root.clearTimeout;
      } else {
        throw new NotSupportedError();
      }
      return {
        setTimeout: localSetTimeout,
        clearTimeout: localClearTimeout
      };
    }());
    var localSetTimeout = localTimer.setTimeout,
        localClearTimeout = localTimer.clearTimeout;
    (function() {
      var nextHandle = 1,
          tasksByHandle = {},
          currentlyRunning = false;
      clearMethod = function(handle) {
        delete tasksByHandle[handle];
      };
      function runTask(handle) {
        if (currentlyRunning) {
          localSetTimeout(function() {
            runTask(handle);
          }, 0);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunning = true;
            var result = tryCatch(task)();
            clearMethod(handle);
            currentlyRunning = false;
            if (result === errorObj) {
              return thrower(result.e);
            }
          }
        }
      }
      var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
      var setImmediate = typeof(setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
      function postMessageSupported() {
        if (!root.postMessage || root.importScripts) {
          return false;
        }
        var isAsync = false,
            oldHandler = root.onmessage;
        root.onmessage = function() {
          isAsync = true;
        };
        root.postMessage('', '*');
        root.onmessage = oldHandler;
        return isAsync;
      }
      if (isFunction(setImmediate)) {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          setImmediate(function() {
            runTask(id);
          });
          return id;
        };
      } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          process.nextTick(function() {
            runTask(id);
          });
          return id;
        };
      } else if (postMessageSupported()) {
        var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
        function onGlobalPostMessage(event) {
          if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
            runTask(event.data.substring(MSG_PREFIX.length));
          }
        }
        if (root.addEventListener) {
          root.addEventListener('message', onGlobalPostMessage, false);
        } else {
          root.attachEvent('onmessage', onGlobalPostMessage, false);
        }
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          root.postMessage(MSG_PREFIX + currentId, '*');
          return id;
        };
      } else if (!!root.MessageChannel) {
        var channel = new root.MessageChannel();
        channel.port1.onmessage = function(e) {
          runTask(e.data);
        };
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          channel.port2.postMessage(id);
          return id;
        };
      } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
        scheduleMethod = function(action) {
          var scriptElement = root.document.createElement('script');
          var id = nextHandle++;
          tasksByHandle[id] = action;
          scriptElement.onreadystatechange = function() {
            runTask(id);
            scriptElement.onreadystatechange = null;
            scriptElement.parentNode.removeChild(scriptElement);
            scriptElement = null;
          };
          root.document.documentElement.appendChild(scriptElement);
          return id;
        };
      } else {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          localSetTimeout(function() {
            runTask(id);
          }, 0);
          return id;
        };
      }
    }());
    var timeoutScheduler = Scheduler.timeout = Scheduler.default = (function() {
      function scheduleNow(state, action) {
        var scheduler = this,
            disposable = new SingleAssignmentDisposable();
        var id = scheduleMethod(function() {
          if (!disposable.isDisposed) {
            disposable.setDisposable(action(scheduler, state));
          }
        });
        return new CompositeDisposable(disposable, disposableCreate(function() {
          clearMethod(id);
        }));
      }
      function scheduleRelative(state, dueTime, action) {
        var scheduler = this,
            dt = Scheduler.normalize(dueTime);
        if (dt === 0) {
          return scheduler.scheduleWithState(state, action);
        }
        var disposable = new SingleAssignmentDisposable();
        var id = localSetTimeout(function() {
          if (!disposable.isDisposed) {
            disposable.setDisposable(action(scheduler, state));
          }
        }, dt);
        return new CompositeDisposable(disposable, disposableCreate(function() {
          localClearTimeout(id);
        }));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
      }
      return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
    })();
    var CatchScheduler = (function(__super__) {
      function scheduleNow(state, action) {
        return this._scheduler.scheduleWithState(state, this._wrap(action));
      }
      function scheduleRelative(state, dueTime, action) {
        return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
      }
      inherits(CatchScheduler, __super__);
      function CatchScheduler(scheduler, handler) {
        this._scheduler = scheduler;
        this._handler = handler;
        this._recursiveOriginal = null;
        this._recursiveWrapper = null;
        __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
      }
      CatchScheduler.prototype._clone = function(scheduler) {
        return new CatchScheduler(scheduler, this._handler);
      };
      CatchScheduler.prototype._wrap = function(action) {
        var parent = this;
        return function(self, state) {
          try {
            return action(parent._getRecursiveWrapper(self), state);
          } catch (e) {
            if (!parent._handler(e)) {
              throw e;
            }
            return disposableEmpty;
          }
        };
      };
      CatchScheduler.prototype._getRecursiveWrapper = function(scheduler) {
        if (this._recursiveOriginal !== scheduler) {
          this._recursiveOriginal = scheduler;
          var wrapper = this._clone(scheduler);
          wrapper._recursiveOriginal = scheduler;
          wrapper._recursiveWrapper = wrapper;
          this._recursiveWrapper = wrapper;
        }
        return this._recursiveWrapper;
      };
      CatchScheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        var self = this,
            failed = false,
            d = new SingleAssignmentDisposable();
        d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function(state1) {
          if (failed) {
            return null;
          }
          try {
            return action(state1);
          } catch (e) {
            failed = true;
            if (!self._handler(e)) {
              throw e;
            }
            d.dispose();
            return null;
          }
        }));
        return d;
      };
      return CatchScheduler;
    }(Scheduler));
    var Notification = Rx.Notification = (function() {
      function Notification(kind, value, exception, accept, acceptObservable, toString) {
        this.kind = kind;
        this.value = value;
        this.exception = exception;
        this._accept = accept;
        this._acceptObservable = acceptObservable;
        this.toString = toString;
      }
      Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted) {
        return observerOrOnNext && typeof observerOrOnNext === 'object' ? this._acceptObservable(observerOrOnNext) : this._accept(observerOrOnNext, onError, onCompleted);
      };
      Notification.prototype.toObservable = function(scheduler) {
        var self = this;
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new AnonymousObservable(function(observer) {
          return scheduler.scheduleWithState(self, function(_, notification) {
            notification._acceptObservable(observer);
            notification.kind === 'N' && observer.onCompleted();
          });
        });
      };
      return Notification;
    })();
    var notificationCreateOnNext = Notification.createOnNext = (function() {
      function _accept(onNext) {
        return onNext(this.value);
      }
      function _acceptObservable(observer) {
        return observer.onNext(this.value);
      }
      function toString() {
        return 'OnNext(' + this.value + ')';
      }
      return function(value) {
        return new Notification('N', value, null, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnError = Notification.createOnError = (function() {
      function _accept(onNext, onError) {
        return onError(this.exception);
      }
      function _acceptObservable(observer) {
        return observer.onError(this.exception);
      }
      function toString() {
        return 'OnError(' + this.exception + ')';
      }
      return function(e) {
        return new Notification('E', null, e, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnCompleted = Notification.createOnCompleted = (function() {
      function _accept(onNext, onError, onCompleted) {
        return onCompleted();
      }
      function _acceptObservable(observer) {
        return observer.onCompleted();
      }
      function toString() {
        return 'OnCompleted()';
      }
      return function() {
        return new Notification('C', null, null, _accept, _acceptObservable, toString);
      };
    }());
    var Enumerator = Rx.internals.Enumerator = function(next) {
      this._next = next;
    };
    Enumerator.prototype.next = function() {
      return this._next();
    };
    Enumerator.prototype[$iterator$] = function() {
      return this;
    };
    var Enumerable = Rx.internals.Enumerable = function(iterator) {
      this._iterator = iterator;
    };
    Enumerable.prototype[$iterator$] = function() {
      return this._iterator();
    };
    Enumerable.prototype.concat = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var e = sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return ;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return o.onError(ex);
          }
          if (currentItem.done) {
            return o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(err) {
            o.onError(err);
          }, self));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    Enumerable.prototype.catchError = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var e = sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function(lastException, self) {
          if (isDisposed) {
            return ;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return observer.onError(ex);
          }
          if (currentItem.done) {
            if (lastException !== null) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return ;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, self, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    Enumerable.prototype.catchErrorWhen = function(notificationHandler) {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var exceptions = new Subject(),
            notifier = new Subject(),
            handled = notificationHandler(exceptions),
            notificationDisposable = handled.subscribe(notifier);
        var e = sources[$iterator$]();
        var isDisposed,
            lastException,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return ;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return o.onError(ex);
          }
          if (currentItem.done) {
            if (lastException) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return ;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var outer = new SingleAssignmentDisposable();
          var inner = new SingleAssignmentDisposable();
          subscription.setDisposable(new CompositeDisposable(inner, outer));
          outer.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));
            exceptions.onNext(exn);
          }, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    var enumerableRepeat = Enumerable.repeat = function(value, repeatCount) {
      if (repeatCount == null) {
        repeatCount = -1;
      }
      return new Enumerable(function() {
        var left = repeatCount;
        return new Enumerator(function() {
          if (left === 0) {
            return doneEnumerator;
          }
          if (left > 0) {
            left--;
          }
          return {
            done: false,
            value: value
          };
        });
      });
    };
    var enumerableOf = Enumerable.of = function(source, selector, thisArg) {
      if (selector) {
        var selectorFn = bindCallback(selector, thisArg, 3);
      }
      return new Enumerable(function() {
        var index = -1;
        return new Enumerator(function() {
          return ++index < source.length ? {
            done: false,
            value: !selector ? source[index] : selectorFn(source[index], index, source)
          } : doneEnumerator;
        });
      });
    };
    var Observer = Rx.Observer = function() {};
    Observer.prototype.toNotifier = function() {
      var observer = this;
      return function(n) {
        return n.accept(observer);
      };
    };
    Observer.prototype.asObserver = function() {
      return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));
    };
    Observer.prototype.checked = function() {
      return new CheckedObserver(this);
    };
    var observerCreate = Observer.create = function(onNext, onError, onCompleted) {
      onNext || (onNext = noop);
      onError || (onError = defaultError);
      onCompleted || (onCompleted = noop);
      return new AnonymousObserver(onNext, onError, onCompleted);
    };
    Observer.fromNotifier = function(handler, thisArg) {
      return new AnonymousObserver(function(x) {
        return handler.call(thisArg, notificationCreateOnNext(x));
      }, function(e) {
        return handler.call(thisArg, notificationCreateOnError(e));
      }, function() {
        return handler.call(thisArg, notificationCreateOnCompleted());
      });
    };
    Observer.prototype.notifyOn = function(scheduler) {
      return new ObserveOnObserver(scheduler, this);
    };
    Observer.prototype.makeSafe = function(disposable) {
      return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
    };
    var AbstractObserver = Rx.internals.AbstractObserver = (function(__super__) {
      inherits(AbstractObserver, __super__);
      function AbstractObserver() {
        this.isStopped = false;
        __super__.call(this);
      }
      AbstractObserver.prototype.next = notImplemented;
      AbstractObserver.prototype.error = notImplemented;
      AbstractObserver.prototype.completed = notImplemented;
      AbstractObserver.prototype.onNext = function(value) {
        if (!this.isStopped) {
          this.next(value);
        }
      };
      AbstractObserver.prototype.onError = function(error) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(error);
        }
      };
      AbstractObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.completed();
        }
      };
      AbstractObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      AbstractObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(e);
          return true;
        }
        return false;
      };
      return AbstractObserver;
    }(Observer));
    var AnonymousObserver = Rx.AnonymousObserver = (function(__super__) {
      inherits(AnonymousObserver, __super__);
      function AnonymousObserver(onNext, onError, onCompleted) {
        __super__.call(this);
        this._onNext = onNext;
        this._onError = onError;
        this._onCompleted = onCompleted;
      }
      AnonymousObserver.prototype.next = function(value) {
        this._onNext(value);
      };
      AnonymousObserver.prototype.error = function(error) {
        this._onError(error);
      };
      AnonymousObserver.prototype.completed = function() {
        this._onCompleted();
      };
      return AnonymousObserver;
    }(AbstractObserver));
    var CheckedObserver = (function(__super__) {
      inherits(CheckedObserver, __super__);
      function CheckedObserver(observer) {
        __super__.call(this);
        this._observer = observer;
        this._state = 0;
      }
      var CheckedObserverPrototype = CheckedObserver.prototype;
      CheckedObserverPrototype.onNext = function(value) {
        this.checkAccess();
        var res = tryCatch(this._observer.onNext).call(this._observer, value);
        this._state = 0;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onError = function(err) {
        this.checkAccess();
        var res = tryCatch(this._observer.onError).call(this._observer, err);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onCompleted = function() {
        this.checkAccess();
        var res = tryCatch(this._observer.onCompleted).call(this._observer);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.checkAccess = function() {
        if (this._state === 1) {
          throw new Error('Re-entrancy detected');
        }
        if (this._state === 2) {
          throw new Error('Observer completed');
        }
        if (this._state === 0) {
          this._state = 1;
        }
      };
      return CheckedObserver;
    }(Observer));
    var ScheduledObserver = Rx.internals.ScheduledObserver = (function(__super__) {
      inherits(ScheduledObserver, __super__);
      function ScheduledObserver(scheduler, observer) {
        __super__.call(this);
        this.scheduler = scheduler;
        this.observer = observer;
        this.isAcquired = false;
        this.hasFaulted = false;
        this.queue = [];
        this.disposable = new SerialDisposable();
      }
      ScheduledObserver.prototype.next = function(value) {
        var self = this;
        this.queue.push(function() {
          self.observer.onNext(value);
        });
      };
      ScheduledObserver.prototype.error = function(e) {
        var self = this;
        this.queue.push(function() {
          self.observer.onError(e);
        });
      };
      ScheduledObserver.prototype.completed = function() {
        var self = this;
        this.queue.push(function() {
          self.observer.onCompleted();
        });
      };
      ScheduledObserver.prototype.ensureActive = function() {
        var isOwner = false,
            parent = this;
        if (!this.hasFaulted && this.queue.length > 0) {
          isOwner = !this.isAcquired;
          this.isAcquired = true;
        }
        if (isOwner) {
          this.disposable.setDisposable(this.scheduler.scheduleRecursive(function(self) {
            var work;
            if (parent.queue.length > 0) {
              work = parent.queue.shift();
            } else {
              parent.isAcquired = false;
              return ;
            }
            try {
              work();
            } catch (ex) {
              parent.queue = [];
              parent.hasFaulted = true;
              throw ex;
            }
            self();
          }));
        }
      };
      ScheduledObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.disposable.dispose();
      };
      return ScheduledObserver;
    }(AbstractObserver));
    var ObserveOnObserver = (function(__super__) {
      inherits(ObserveOnObserver, __super__);
      function ObserveOnObserver(scheduler, observer, cancel) {
        __super__.call(this, scheduler, observer);
        this._cancel = cancel;
      }
      ObserveOnObserver.prototype.next = function(value) {
        __super__.prototype.next.call(this, value);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.error = function(e) {
        __super__.prototype.error.call(this, e);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.completed = function() {
        __super__.prototype.completed.call(this);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this._cancel && this._cancel.dispose();
        this._cancel = null;
      };
      return ObserveOnObserver;
    })(ScheduledObserver);
    var observableProto;
    var Observable = Rx.Observable = (function() {
      function Observable(subscribe) {
        if (Rx.config.longStackSupport && hasStacks) {
          try {
            throw new Error();
          } catch (e) {
            this.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
          }
          var self = this;
          this._subscribe = function(observer) {
            var oldOnError = observer.onError.bind(observer);
            observer.onError = function(err) {
              makeStackTraceLong(err, self);
              oldOnError(err);
            };
            return subscribe.call(self, observer);
          };
        } else {
          this._subscribe = subscribe;
        }
      }
      observableProto = Observable.prototype;
      observableProto.subscribe = observableProto.forEach = function(observerOrOnNext, onError, onCompleted) {
        return this._subscribe(typeof observerOrOnNext === 'object' ? observerOrOnNext : observerCreate(observerOrOnNext, onError, onCompleted));
      };
      observableProto.subscribeOnNext = function(onNext, thisArg) {
        return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) {
          onNext.call(thisArg, x);
        } : onNext));
      };
      observableProto.subscribeOnError = function(onError, thisArg) {
        return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) {
          onError.call(thisArg, e);
        } : onError));
      };
      observableProto.subscribeOnCompleted = function(onCompleted, thisArg) {
        return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() {
          onCompleted.call(thisArg);
        } : onCompleted));
      };
      return Observable;
    })();
    var ObservableBase = Rx.ObservableBase = (function(__super__) {
      inherits(ObservableBase, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.subscribeCore).call(self, ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function subscribe(observer) {
        var ado = new AutoDetachObserver(observer),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.scheduleWithState(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      }
      function ObservableBase() {
        __super__.call(this, subscribe);
      }
      ObservableBase.prototype.subscribeCore = notImplemented;
      return ObservableBase;
    }(Observable));
    observableProto.observeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(new ObserveOnObserver(scheduler, observer));
      }, source);
    };
    observableProto.subscribeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            d = new SerialDisposable();
        d.setDisposable(m);
        m.setDisposable(scheduler.schedule(function() {
          d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
        }));
        return d;
      }, source);
    };
    var observableFromPromise = Observable.fromPromise = function(promise) {
      return observableDefer(function() {
        var subject = new Rx.AsyncSubject();
        promise.then(function(value) {
          subject.onNext(value);
          subject.onCompleted();
        }, subject.onError.bind(subject));
        return subject;
      });
    };
    observableProto.toPromise = function(promiseCtor) {
      promiseCtor || (promiseCtor = Rx.config.Promise);
      if (!promiseCtor) {
        throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise');
      }
      var source = this;
      return new promiseCtor(function(resolve, reject) {
        var value,
            hasValue = false;
        source.subscribe(function(v) {
          value = v;
          hasValue = true;
        }, reject, function() {
          hasValue && resolve(value);
        });
      });
    };
    var ToArrayObservable = (function(__super__) {
      inherits(ToArrayObservable, __super__);
      function ToArrayObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      ToArrayObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new ToArrayObserver(observer));
      };
      return ToArrayObservable;
    }(ObservableBase));
    function ToArrayObserver(observer) {
      this.observer = observer;
      this.a = [];
      this.isStopped = false;
    }
    ToArrayObserver.prototype.onNext = function(x) {
      if (!this.isStopped) {
        this.a.push(x);
      }
    };
    ToArrayObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    ToArrayObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onNext(this.a);
        this.observer.onCompleted();
      }
    };
    ToArrayObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    ToArrayObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.toArray = function() {
      return new ToArrayObservable(this);
    };
    Observable.create = Observable.createWithDisposable = function(subscribe, parent) {
      return new AnonymousObservable(subscribe, parent);
    };
    var observableDefer = Observable.defer = function(observableFactory) {
      return new AnonymousObservable(function(observer) {
        var result;
        try {
          result = observableFactory();
        } catch (e) {
          return observableThrow(e).subscribe(observer);
        }
        isPromise(result) && (result = observableFromPromise(result));
        return result.subscribe(observer);
      });
    };
    var observableEmpty = Observable.empty = function(scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(observer) {
        return scheduler.scheduleWithState(null, function() {
          observer.onCompleted();
        });
      });
    };
    var FromObservable = (function(__super__) {
      inherits(FromObservable, __super__);
      function FromObservable(iterable, mapper, scheduler) {
        this.iterable = iterable;
        this.mapper = mapper;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromSink(observer, this);
        return sink.run();
      };
      return FromObservable;
    }(ObservableBase));
    var FromSink = (function() {
      function FromSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      FromSink.prototype.run = function() {
        var list = Object(this.parent.iterable),
            it = getIterable(list),
            observer = this.observer,
            mapper = this.parent.mapper;
        function loopRecursive(i, recurse) {
          try {
            var next = it.next();
          } catch (e) {
            return observer.onError(e);
          }
          if (next.done) {
            return observer.onCompleted();
          }
          var result = next.value;
          if (mapper) {
            try {
              result = mapper(result, i);
            } catch (e) {
              return observer.onError(e);
            }
          }
          observer.onNext(result);
          recurse(i + 1);
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return FromSink;
    }());
    var maxSafeInteger = Math.pow(2, 53) - 1;
    function StringIterable(str) {
      this._s = s;
    }
    StringIterable.prototype[$iterator$] = function() {
      return new StringIterator(this._s);
    };
    function StringIterator(str) {
      this._s = s;
      this._l = s.length;
      this._i = 0;
    }
    StringIterator.prototype[$iterator$] = function() {
      return this;
    };
    StringIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._s.charAt(this._i++)
      } : doneEnumerator;
    };
    function ArrayIterable(a) {
      this._a = a;
    }
    ArrayIterable.prototype[$iterator$] = function() {
      return new ArrayIterator(this._a);
    };
    function ArrayIterator(a) {
      this._a = a;
      this._l = toLength(a);
      this._i = 0;
    }
    ArrayIterator.prototype[$iterator$] = function() {
      return this;
    };
    ArrayIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._a[this._i++]
      } : doneEnumerator;
    };
    function numberIsFinite(value) {
      return typeof value === 'number' && root.isFinite(value);
    }
    function isNan(n) {
      return n !== n;
    }
    function getIterable(o) {
      var i = o[$iterator$],
          it;
      if (!i && typeof o === 'string') {
        it = new StringIterable(o);
        return it[$iterator$]();
      }
      if (!i && o.length !== undefined) {
        it = new ArrayIterable(o);
        return it[$iterator$]();
      }
      if (!i) {
        throw new TypeError('Object is not iterable');
      }
      return o[$iterator$]();
    }
    function sign(value) {
      var number = +value;
      if (number === 0) {
        return number;
      }
      if (isNaN(number)) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }
    function toLength(o) {
      var len = +o.length;
      if (isNaN(len)) {
        return 0;
      }
      if (len === 0 || !numberIsFinite(len)) {
        return len;
      }
      len = sign(len) * Math.floor(Math.abs(len));
      if (len <= 0) {
        return 0;
      }
      if (len > maxSafeInteger) {
        return maxSafeInteger;
      }
      return len;
    }
    var observableFrom = Observable.from = function(iterable, mapFn, thisArg, scheduler) {
      if (iterable == null) {
        throw new Error('iterable cannot be null.');
      }
      if (mapFn && !isFunction(mapFn)) {
        throw new Error('mapFn when provided must be a function');
      }
      if (mapFn) {
        var mapper = bindCallback(mapFn, thisArg, 2);
      }
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromObservable(iterable, mapper, scheduler);
    };
    var FromArrayObservable = (function(__super__) {
      inherits(FromArrayObservable, __super__);
      function FromArrayObservable(args, scheduler) {
        this.args = args;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromArrayObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromArraySink(observer, this);
        return sink.run();
      };
      return FromArrayObservable;
    }(ObservableBase));
    function FromArraySink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    FromArraySink.prototype.run = function() {
      var observer = this.observer,
          args = this.parent.args,
          len = args.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          observer.onNext(args[i]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };
    var observableFromArray = Observable.fromArray = function(array, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    };
    Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new AnonymousObservable(function(o) {
        var first = true;
        return scheduler.scheduleRecursiveWithState(initialState, function(state, self) {
          var hasResult,
              result;
          try {
            if (first) {
              first = false;
            } else {
              state = iterate(state);
            }
            hasResult = condition(state);
            hasResult && (result = resultSelector(state));
          } catch (e) {
            return o.onError(e);
          }
          if (hasResult) {
            o.onNext(result);
            self(state);
          } else {
            o.onCompleted();
          }
        });
      });
    };
    var observableNever = Observable.never = function() {
      return new AnonymousObservable(function() {
        return disposableEmpty;
      });
    };
    function observableOf(scheduler, array) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    }
    Observable.of = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new FromArrayObservable(args, currentThreadScheduler);
    };
    Observable.ofWithScheduler = function(scheduler) {
      var len = arguments.length,
          args = new Array(len - 1);
      for (var i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }
      return new FromArrayObservable(args, scheduler);
    };
    Observable.pairs = function(obj, scheduler) {
      scheduler || (scheduler = Rx.Scheduler.currentThread);
      return new AnonymousObservable(function(observer) {
        var keys = Object.keys(obj),
            len = keys.length;
        return scheduler.scheduleRecursiveWithState(0, function(idx, self) {
          if (idx < len) {
            var key = keys[idx];
            observer.onNext([key, obj[key]]);
            self(idx + 1);
          } else {
            observer.onCompleted();
          }
        });
      });
    };
    var RangeObservable = (function(__super__) {
      inherits(RangeObservable, __super__);
      function RangeObservable(start, count, scheduler) {
        this.start = start;
        this.count = count;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RangeObservable.prototype.subscribeCore = function(observer) {
        var sink = new RangeSink(observer, this);
        return sink.run();
      };
      return RangeObservable;
    }(ObservableBase));
    var RangeSink = (function() {
      function RangeSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      RangeSink.prototype.run = function() {
        var start = this.parent.start,
            count = this.parent.count,
            observer = this.observer;
        function loopRecursive(i, recurse) {
          if (i < count) {
            observer.onNext(start + i);
            recurse(i + 1);
          } else {
            observer.onCompleted();
          }
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return RangeSink;
    }());
    Observable.range = function(start, count, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RangeObservable(start, count, scheduler);
    };
    Observable.repeat = function(value, repeatCount, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return observableReturn(value, scheduler).repeat(repeatCount == null ? -1 : repeatCount);
    };
    var observableReturn = Observable['return'] = Observable.just = Observable.returnValue = function(value, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(o) {
        return scheduler.scheduleWithState(value, function(_, v) {
          o.onNext(v);
          o.onCompleted();
        });
      });
    };
    var observableThrow = Observable['throw'] = Observable.throwError = function(error, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(observer) {
        return scheduler.schedule(function() {
          observer.onError(error);
        });
      });
    };
    Observable.throwException = function() {
      return Observable.throwError.apply(null, arguments);
    };
    Observable.using = function(resourceFactory, observableFactory) {
      return new AnonymousObservable(function(observer) {
        var disposable = disposableEmpty,
            resource,
            source;
        try {
          resource = resourceFactory();
          resource && (disposable = resource);
          source = observableFactory(resource);
        } catch (exception) {
          return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);
        }
        return new CompositeDisposable(source.subscribe(observer), disposable);
      });
    };
    observableProto.amb = function(rightSource) {
      var leftSource = this;
      return new AnonymousObservable(function(observer) {
        var choice,
            leftChoice = 'L',
            rightChoice = 'R',
            leftSubscription = new SingleAssignmentDisposable(),
            rightSubscription = new SingleAssignmentDisposable();
        isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));
        function choiceL() {
          if (!choice) {
            choice = leftChoice;
            rightSubscription.dispose();
          }
        }
        function choiceR() {
          if (!choice) {
            choice = rightChoice;
            leftSubscription.dispose();
          }
        }
        leftSubscription.setDisposable(leftSource.subscribe(function(left) {
          choiceL();
          if (choice === leftChoice) {
            observer.onNext(left);
          }
        }, function(err) {
          choiceL();
          if (choice === leftChoice) {
            observer.onError(err);
          }
        }, function() {
          choiceL();
          if (choice === leftChoice) {
            observer.onCompleted();
          }
        }));
        rightSubscription.setDisposable(rightSource.subscribe(function(right) {
          choiceR();
          if (choice === rightChoice) {
            observer.onNext(right);
          }
        }, function(err) {
          choiceR();
          if (choice === rightChoice) {
            observer.onError(err);
          }
        }, function() {
          choiceR();
          if (choice === rightChoice) {
            observer.onCompleted();
          }
        }));
        return new CompositeDisposable(leftSubscription, rightSubscription);
      });
    };
    Observable.amb = function() {
      var acc = observableNever(),
          items = [];
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          items.push(arguments[i]);
        }
      }
      function func(previous, current) {
        return previous.amb(current);
      }
      for (var i = 0,
          len = items.length; i < len; i++) {
        acc = func(acc, items[i]);
      }
      return acc;
    };
    function observableCatchHandler(source, handler) {
      return new AnonymousObservable(function(o) {
        var d1 = new SingleAssignmentDisposable(),
            subscription = new SerialDisposable();
        subscription.setDisposable(d1);
        d1.setDisposable(source.subscribe(function(x) {
          o.onNext(x);
        }, function(e) {
          try {
            var result = handler(e);
          } catch (ex) {
            return o.onError(ex);
          }
          isPromise(result) && (result = observableFromPromise(result));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(result.subscribe(o));
        }, function(x) {
          o.onCompleted(x);
        }));
        return subscription;
      }, source);
    }
    observableProto['catch'] = observableProto.catchError = observableProto.catchException = function(handlerOrSecond) {
      return typeof handlerOrSecond === 'function' ? observableCatchHandler(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
    };
    var observableCatch = Observable.catchError = Observable['catch'] = Observable.catchException = function() {
      var items = [];
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          items.push(arguments[i]);
        }
      }
      return enumerableOf(items).catchError();
    };
    observableProto.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args[0].unshift(this);
      } else {
        args.unshift(this);
      }
      return combineLatest.apply(this, args);
    };
    var combineLatest = Observable.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop();
      Array.isArray(args[0]) && (args = args[0]);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            falseFactory = function() {
              return false;
            },
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            isDone = arrayInitialize(n, falseFactory),
            values = new Array(n);
        function next(i) {
          hasValue[i] = true;
          if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
            try {
              var res = resultSelector.apply(null, values);
            } catch (e) {
              return o.onError(e);
            }
            o.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            o.onCompleted();
          }
        }
        function done(i) {
          isDone[i] = true;
          isDone.every(identity) && o.onCompleted();
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              values[i] = x;
              next(i);
            }, function(e) {
              o.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          }(idx));
        }
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    observableProto.concat = function() {
      for (var args = [],
          i = 0,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args.unshift(this);
      return observableConcat.apply(null, args);
    };
    var observableConcat = Observable.concat = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(arguments.length);
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return enumerableOf(args).concat();
    };
    observableProto.concatAll = observableProto.concatObservable = function() {
      return this.merge(1);
    };
    var MergeObservable = (function(__super__) {
      inherits(MergeObservable, __super__);
      function MergeObservable(source, maxConcurrent) {
        this.source = source;
        this.maxConcurrent = maxConcurrent;
        __super__.call(this);
      }
      MergeObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable();
        g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
        return g;
      };
      return MergeObservable;
    }(ObservableBase));
    var MergeObserver = (function() {
      function MergeObserver(o, max, g) {
        this.o = o;
        this.max = max;
        this.g = g;
        this.done = false;
        this.q = [];
        this.activeCount = 0;
        this.isStopped = false;
      }
      MergeObserver.prototype.handleSubscribe = function(xs) {
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(xs) && (xs = observableFromPromise(xs));
        sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
      };
      MergeObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return ;
        }
        if (this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeObserver;
    }());
    observableProto.merge = function(maxConcurrentOrOther) {
      return typeof maxConcurrentOrOther !== 'number' ? observableMerge(this, maxConcurrentOrOther) : new MergeObservable(this, maxConcurrentOrOther);
    };
    var observableMerge = Observable.merge = function() {
      var scheduler,
          sources = [],
          i,
          len = arguments.length;
      if (!arguments[0]) {
        scheduler = immediateScheduler;
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else if (isScheduler(arguments[0])) {
        scheduler = arguments[0];
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else {
        scheduler = immediateScheduler;
        for (i = 0; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      if (Array.isArray(sources[0])) {
        sources = sources[0];
      }
      return observableOf(scheduler, sources).mergeAll();
    };
    var CompositeError = Rx.CompositeError = function(errors) {
      this.name = "NotImplementedError";
      this.innerErrors = errors;
      this.message = 'This contains multiple errors. Check the innerErrors';
      Error.call(this);
    };
    CompositeError.prototype = Error.prototype;
    Observable.mergeDelayError = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        var len = arguments.length;
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      var source = observableOf(null, args);
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable(),
            m = new SingleAssignmentDisposable(),
            isStopped = false,
            errors = [];
        function setCompletion() {
          if (errors.length === 0) {
            o.onCompleted();
          } else if (errors.length === 1) {
            o.onError(errors[0]);
          } else {
            o.onError(new CompositeError(errors));
          }
        }
        group.add(m);
        m.setDisposable(source.subscribe(function(innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          innerSubscription.setDisposable(innerSource.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            errors.push(e);
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }, function() {
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }));
        }, function(e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        }, function() {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
        return group;
      });
    };
    var MergeAllObservable = (function(__super__) {
      inherits(MergeAllObservable, __super__);
      function MergeAllObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      MergeAllObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable(),
            m = new SingleAssignmentDisposable();
        g.add(m);
        m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
        return g;
      };
      return MergeAllObservable;
    }(ObservableBase));
    var MergeAllObserver = (function() {
      function MergeAllObserver(o, g) {
        this.o = o;
        this.g = g;
        this.isStopped = false;
        this.done = false;
      }
      MergeAllObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return ;
        }
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        sad.setDisposable(innerSource.subscribe(new InnerObserver(this, this.g, sad)));
      };
      MergeAllObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeAllObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.g.length === 1 && this.o.onCompleted();
        }
      };
      MergeAllObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeAllObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, g, sad) {
        this.parent = parent;
        this.g = g;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          var parent = this.parent;
          this.isStopped = true;
          parent.g.remove(this.sad);
          parent.done && parent.g.length === 1 && parent.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeAllObserver;
    }());
    observableProto.mergeAll = observableProto.mergeObservable = function() {
      return new MergeAllObservable(this);
    };
    observableProto.onErrorResumeNext = function(second) {
      if (!second) {
        throw new Error('Second observable is required');
      }
      return onErrorResumeNext([this, second]);
    };
    var onErrorResumeNext = Observable.onErrorResumeNext = function() {
      var sources = [];
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      return new AnonymousObservable(function(observer) {
        var pos = 0,
            subscription = new SerialDisposable(),
            cancelable = immediateScheduler.scheduleRecursive(function(self) {
              var current,
                  d;
              if (pos < sources.length) {
                current = sources[pos++];
                isPromise(current) && (current = observableFromPromise(current));
                d = new SingleAssignmentDisposable();
                subscription.setDisposable(d);
                d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
              } else {
                observer.onCompleted();
              }
            });
        return new CompositeDisposable(subscription, cancelable);
      });
    };
    observableProto.skipUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var isOpen = false;
        var disposables = new CompositeDisposable(source.subscribe(function(left) {
          isOpen && o.onNext(left);
        }, function(e) {
          o.onError(e);
        }, function() {
          isOpen && o.onCompleted();
        }));
        isPromise(other) && (other = observableFromPromise(other));
        var rightSubscription = new SingleAssignmentDisposable();
        disposables.add(rightSubscription);
        rightSubscription.setDisposable(other.subscribe(function() {
          isOpen = true;
          rightSubscription.dispose();
        }, function(e) {
          o.onError(e);
        }, function() {
          rightSubscription.dispose();
        }));
        return disposables;
      }, source);
    };
    observableProto['switch'] = observableProto.switchLatest = function() {
      var sources = this;
      return new AnonymousObservable(function(observer) {
        var hasLatest = false,
            innerSubscription = new SerialDisposable(),
            isStopped = false,
            latest = 0,
            subscription = sources.subscribe(function(innerSource) {
              var d = new SingleAssignmentDisposable(),
                  id = ++latest;
              hasLatest = true;
              innerSubscription.setDisposable(d);
              isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
              d.setDisposable(innerSource.subscribe(function(x) {
                latest === id && observer.onNext(x);
              }, function(e) {
                latest === id && observer.onError(e);
              }, function() {
                if (latest === id) {
                  hasLatest = false;
                  isStopped && observer.onCompleted();
                }
              }));
            }, function(e) {
              observer.onError(e);
            }, function() {
              isStopped = true;
              !hasLatest && observer.onCompleted();
            });
        return new CompositeDisposable(subscription, innerSubscription);
      }, sources);
    };
    observableProto.takeUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        isPromise(other) && (other = observableFromPromise(other));
        return new CompositeDisposable(source.subscribe(o), other.subscribe(function() {
          o.onCompleted();
        }, function(e) {
          o.onError(e);
        }, noop));
      }, source);
    };
    observableProto.withLatestFrom = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop(),
          source = this;
      if (typeof source === 'undefined') {
        throw new Error('Source observable not found for withLatestFrom().');
      }
      if (typeof resultSelector !== 'function') {
        throw new Error('withLatestFrom() expects a resultSelector function.');
      }
      if (Array.isArray(args[0])) {
        args = args[0];
      }
      return new AnonymousObservable(function(observer) {
        var falseFactory = function() {
          return false;
        },
            n = args.length,
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            values = new Array(n);
        var subscriptions = new Array(n + 1);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var other = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(other) && (other = observableFromPromise(other));
            sad.setDisposable(other.subscribe(function(x) {
              values[i] = x;
              hasValue[i] = true;
              hasValueAll = hasValue.every(identity);
            }, observer.onError.bind(observer), function() {}));
            subscriptions[i] = sad;
          }(idx));
        }
        var sad = new SingleAssignmentDisposable();
        sad.setDisposable(source.subscribe(function(x) {
          var res;
          var allValues = [x].concat(values);
          if (!hasValueAll)
            return ;
          try {
            res = resultSelector.apply(null, allValues);
          } catch (ex) {
            observer.onError(ex);
            return ;
          }
          observer.onNext(res);
        }, observer.onError.bind(observer), function() {
          observer.onCompleted();
        }));
        subscriptions[n] = sad;
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    function zipArray(second, resultSelector) {
      var first = this;
      return new AnonymousObservable(function(observer) {
        var index = 0,
            len = second.length;
        return first.subscribe(function(left) {
          if (index < len) {
            var right = second[index++],
                result;
            try {
              result = resultSelector(left, right);
            } catch (e) {
              return observer.onError(e);
            }
            observer.onNext(result);
          } else {
            observer.onCompleted();
          }
        }, function(e) {
          observer.onError(e);
        }, function() {
          observer.onCompleted();
        });
      }, first);
    }
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    observableProto.zip = function() {
      if (Array.isArray(arguments[0])) {
        return zipArray.apply(this, arguments);
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var parent = this,
          resultSelector = args.pop();
      args.unshift(parent);
      return new AnonymousObservable(function(observer) {
        var n = args.length,
            queues = arrayInitialize(n, emptyArrayFactory),
            isDone = arrayInitialize(n, falseFactory);
        function next(i) {
          var res,
              queuedValues;
          if (queues.every(function(x) {
            return x.length > 0;
          })) {
            try {
              queuedValues = queues.map(function(x) {
                return x.shift();
              });
              res = resultSelector.apply(parent, queuedValues);
            } catch (ex) {
              observer.onError(ex);
              return ;
            }
            observer.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            observer.onCompleted();
          }
        }
        ;
        function done(i) {
          isDone[i] = true;
          if (isDone.every(function(x) {
            return x;
          })) {
            observer.onCompleted();
          }
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              queues[i].push(x);
              next(i);
            }, function(e) {
              observer.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      }, parent);
    };
    Observable.zip = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var first = args.shift();
      return first.zip.apply(first, args);
    };
    Observable.zipArray = function() {
      var sources;
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        var len = arguments.length;
        sources = new Array(len);
        for (var i = 0; i < len; i++) {
          sources[i] = arguments[i];
        }
      }
      return new AnonymousObservable(function(observer) {
        var n = sources.length,
            queues = arrayInitialize(n, function() {
              return [];
            }),
            isDone = arrayInitialize(n, function() {
              return false;
            });
        function next(i) {
          if (queues.every(function(x) {
            return x.length > 0;
          })) {
            var res = queues.map(function(x) {
              return x.shift();
            });
            observer.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            observer.onCompleted();
            return ;
          }
        }
        ;
        function done(i) {
          isDone[i] = true;
          if (isDone.every(identity)) {
            observer.onCompleted();
            return ;
          }
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            subscriptions[i] = new SingleAssignmentDisposable();
            subscriptions[i].setDisposable(sources[i].subscribe(function(x) {
              queues[i].push(x);
              next(i);
            }, function(e) {
              observer.onError(e);
            }, function() {
              done(i);
            }));
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      });
    };
    observableProto.asObservable = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(o);
      }, this);
    };
    observableProto.bufferWithCount = function(count, skip) {
      if (typeof skip !== 'number') {
        skip = count;
      }
      return this.windowWithCount(count, skip).selectMany(function(x) {
        return x.toArray();
      }).where(function(x) {
        return x.length > 0;
      });
    };
    observableProto.dematerialize = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(function(x) {
          return x.accept(o);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto.distinctUntilChanged = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hasCurrentKey = false,
            currentKey;
        return source.subscribe(function(value) {
          var key = value;
          if (keySelector) {
            try {
              key = keySelector(value);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          if (hasCurrentKey) {
            try {
              var comparerEquals = comparer(currentKey, key);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          if (!hasCurrentKey || !comparerEquals) {
            hasCurrentKey = true;
            currentKey = key;
            o.onNext(value);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto['do'] = observableProto.tap = observableProto.doAction = function(observerOrOnNext, onError, onCompleted) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var tapObserver = !observerOrOnNext || isFunction(observerOrOnNext) ? observerCreate(observerOrOnNext || noop, onError || noop, onCompleted || noop) : observerOrOnNext;
        return source.subscribe(function(x) {
          try {
            tapObserver.onNext(x);
          } catch (e) {
            observer.onError(e);
          }
          observer.onNext(x);
        }, function(err) {
          try {
            tapObserver.onError(err);
          } catch (e) {
            observer.onError(e);
          }
          observer.onError(err);
        }, function() {
          try {
            tapObserver.onCompleted();
          } catch (e) {
            observer.onError(e);
          }
          observer.onCompleted();
        });
      }, this);
    };
    observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg) {
      return this.tap(typeof thisArg !== 'undefined' ? function(x) {
        onNext.call(thisArg, x);
      } : onNext);
    };
    observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg) {
      return this.tap(noop, typeof thisArg !== 'undefined' ? function(e) {
        onError.call(thisArg, e);
      } : onError);
    };
    observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg) {
      return this.tap(noop, null, typeof thisArg !== 'undefined' ? function() {
        onCompleted.call(thisArg);
      } : onCompleted);
    };
    observableProto['finally'] = observableProto.ensure = function(action) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var subscription;
        try {
          subscription = source.subscribe(observer);
        } catch (e) {
          action();
          throw e;
        }
        return disposableCreate(function() {
          try {
            subscription.dispose();
          } catch (e) {
            throw e;
          } finally {
            action();
          }
        });
      }, this);
    };
    observableProto.finallyAction = function(action) {
      return this.ensure(action);
    };
    observableProto.ignoreElements = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(noop, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.materialize = function() {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(function(value) {
          observer.onNext(notificationCreateOnNext(value));
        }, function(e) {
          observer.onNext(notificationCreateOnError(e));
          observer.onCompleted();
        }, function() {
          observer.onNext(notificationCreateOnCompleted());
          observer.onCompleted();
        });
      }, source);
    };
    observableProto.repeat = function(repeatCount) {
      return enumerableRepeat(this, repeatCount).concat();
    };
    observableProto.retry = function(retryCount) {
      return enumerableRepeat(this, retryCount).catchError();
    };
    observableProto.retryWhen = function(notifier) {
      return enumerableRepeat(this).catchErrorWhen(notifier);
    };
    observableProto.scan = function() {
      var hasSeed = false,
          seed,
          accumulator,
          source = this;
      if (arguments.length === 2) {
        hasSeed = true;
        seed = arguments[0];
        accumulator = arguments[1];
      } else {
        accumulator = arguments[0];
      }
      return new AnonymousObservable(function(o) {
        var hasAccumulation,
            accumulation,
            hasValue;
        return source.subscribe(function(x) {
          !hasValue && (hasValue = true);
          try {
            if (hasAccumulation) {
              accumulation = accumulator(accumulation, x);
            } else {
              accumulation = hasSeed ? accumulator(seed, x) : x;
              hasAccumulation = true;
            }
          } catch (e) {
            o.onError(e);
            return ;
          }
          o.onNext(accumulation);
        }, function(e) {
          o.onError(e);
        }, function() {
          !hasValue && hasSeed && o.onNext(seed);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.skipLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && o.onNext(q.shift());
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.startWith = function() {
      var values,
          scheduler,
          start = 0;
      if (!!arguments.length && isScheduler(arguments[0])) {
        scheduler = arguments[0];
        start = 1;
      } else {
        scheduler = immediateScheduler;
      }
      for (var args = [],
          i = start,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      return enumerableOf([observableFromArray(args, scheduler), this]).concat();
    };
    observableProto.takeLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          while (q.length > 0) {
            o.onNext(q.shift());
          }
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeLastBuffer = function(count) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(q);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.windowWithCount = function(count, skip) {
      var source = this;
      +count || (count = 0);
      Math.abs(count) === Infinity && (count = 0);
      if (count <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      skip == null && (skip = count);
      +skip || (skip = 0);
      Math.abs(skip) === Infinity && (skip = 0);
      if (skip <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            refCountDisposable = new RefCountDisposable(m),
            n = 0,
            q = [];
        function createWindow() {
          var s = new Subject();
          q.push(s);
          observer.onNext(addRef(s, refCountDisposable));
        }
        createWindow();
        m.setDisposable(source.subscribe(function(x) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onNext(x);
          }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        }, function(e) {
          while (q.length > 0) {
            q.shift().onError(e);
          }
          observer.onError(e);
        }, function() {
          while (q.length > 0) {
            q.shift().onCompleted();
          }
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    function concatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).concatAll();
    }
    observableProto.selectConcat = observableProto.concatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.concatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        });
      }
      return isFunction(selector) ? concatMap(this, selector, thisArg) : concatMap(this, function() {
        return selector;
      });
    };
    observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this,
          onNextFunc = bindCallback(onNext, thisArg, 2),
          onErrorFunc = bindCallback(onError, thisArg, 1),
          onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, this).concatAll();
    };
    observableProto.defaultIfEmpty = function(defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function(observer) {
        var found = false;
        return source.subscribe(function(x) {
          found = true;
          observer.onNext(x);
        }, function(e) {
          observer.onError(e);
        }, function() {
          !found && observer.onNext(defaultValue);
          observer.onCompleted();
        });
      }, source);
    };
    function arrayIndexOfComparer(array, item, comparer) {
      for (var i = 0,
          len = array.length; i < len; i++) {
        if (comparer(array[i], item)) {
          return i;
        }
      }
      return -1;
    }
    function HashSet(comparer) {
      this.comparer = comparer;
      this.set = [];
    }
    HashSet.prototype.push = function(value) {
      var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
      retValue && this.set.push(value);
      return retValue;
    };
    observableProto.distinct = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hashSet = new HashSet(comparer);
        return source.subscribe(function(x) {
          var key = x;
          if (keySelector) {
            try {
              key = keySelector(x);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          hashSet.push(key) && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    var MapObservable = (function(__super__) {
      inherits(MapObservable, __super__);
      function MapObservable(source, selector, thisArg) {
        this.source = source;
        this.selector = bindCallback(selector, thisArg, 3);
        __super__.call(this);
      }
      MapObservable.prototype.internalMap = function(selector, thisArg) {
        var self = this;
        return new MapObservable(this.source, function(x, i, o) {
          return selector.call(this, self.selector(x, i, o), i, o);
        }, thisArg);
      };
      MapObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new MapObserver(observer, this.selector, this));
      };
      return MapObservable;
    }(ObservableBase));
    function MapObserver(observer, selector, source) {
      this.observer = observer;
      this.selector = selector;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
    MapObserver.prototype.onNext = function(x) {
      if (this.isStopped) {
        return ;
      }
      var result = tryCatch(this.selector).call(this, x, this.i++, this.source);
      if (result === errorObj) {
        return this.observer.onError(result.e);
      }
      this.observer.onNext(result);
    };
    MapObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    MapObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onCompleted();
      }
    };
    MapObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    MapObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.map = observableProto.select = function(selector, thisArg) {
      var selectorFn = typeof selector === 'function' ? selector : function() {
        return selector;
      };
      return this instanceof MapObservable ? this.internalMap(selectorFn, thisArg) : new MapObservable(this, selectorFn, thisArg);
    };
    observableProto.pluck = function() {
      var args = arguments,
          len = arguments.length;
      if (len === 0) {
        throw new Error('List of properties cannot be empty.');
      }
      return this.map(function(x) {
        var currentProp = x;
        for (var i = 0; i < len; i++) {
          var p = currentProp[args[i]];
          if (typeof p !== 'undefined') {
            currentProp = p;
          } else {
            return undefined;
          }
        }
        return currentProp;
      });
    };
    observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, source).mergeAll();
    };
    function flatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).mergeAll();
    }
    observableProto.selectMany = observableProto.flatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.flatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        }, thisArg);
      }
      return isFunction(selector) ? flatMap(this, selector, thisArg) : flatMap(this, function() {
        return selector;
      });
    };
    observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function(selector, thisArg) {
      return this.select(selector, thisArg).switchLatest();
    };
    observableProto.skip = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining <= 0) {
            o.onNext(x);
          } else {
            remaining--;
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.skipWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = false;
        return source.subscribe(function(x) {
          if (!running) {
            try {
              running = !callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          running && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.take = function(count, scheduler) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (count === 0) {
        return observableEmpty(scheduler);
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining-- > 0) {
            o.onNext(x);
            remaining === 0 && o.onCompleted();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = true;
        return source.subscribe(function(x) {
          if (running) {
            try {
              running = callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return ;
            }
            if (running) {
              o.onNext(x);
            } else {
              o.onCompleted();
            }
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    var FilterObservable = (function(__super__) {
      inherits(FilterObservable, __super__);
      function FilterObservable(source, predicate, thisArg) {
        this.source = source;
        this.predicate = bindCallback(predicate, thisArg, 3);
        __super__.call(this);
      }
      FilterObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new FilterObserver(observer, this.predicate, this));
      };
      FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
        var self = this;
        return new FilterObservable(this.source, function(x, i, o) {
          return self.predicate(x, i, o) && predicate.call(this, x, i, o);
        }, thisArg);
      };
      return FilterObservable;
    }(ObservableBase));
    function FilterObserver(observer, predicate, source) {
      this.observer = observer;
      this.predicate = predicate;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
    FilterObserver.prototype.onNext = function(x) {
      if (this.isStopped) {
        return ;
      }
      var shouldYield = tryCatch(this.predicate).call(this, x, this.i++, this.source);
      if (shouldYield === errorObj) {
        return this.observer.onError(shouldYield.e);
      }
      shouldYield && this.observer.onNext(x);
    };
    FilterObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    FilterObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onCompleted();
      }
    };
    FilterObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    FilterObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.filter = observableProto.where = function(predicate, thisArg) {
      return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) : new FilterObservable(this, predicate, thisArg);
    };
    observableProto.transduce = function(transducer) {
      var source = this;
      function transformForObserver(o) {
        return {
          '@@transducer/init': function() {
            return o;
          },
          '@@transducer/step': function(obs, input) {
            return obs.onNext(input);
          },
          '@@transducer/result': function(obs) {
            return obs.onCompleted();
          }
        };
      }
      return new AnonymousObservable(function(o) {
        var xform = transducer(transformForObserver(o));
        return source.subscribe(function(v) {
          try {
            xform['@@transducer/step'](o, v);
          } catch (e) {
            o.onError(e);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          xform['@@transducer/result'](o);
        });
      }, source);
    };
    var AnonymousObservable = Rx.AnonymousObservable = (function(__super__) {
      inherits(AnonymousObservable, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            subscribe = state[1];
        var sub = tryCatch(subscribe)(ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function AnonymousObservable(subscribe, parent) {
        this.source = parent;
        function s(observer) {
          var ado = new AutoDetachObserver(observer),
              state = [ado, subscribe];
          if (currentThreadScheduler.scheduleRequired()) {
            currentThreadScheduler.scheduleWithState(state, setDisposable);
          } else {
            setDisposable(null, state);
          }
          return ado;
        }
        __super__.call(this, s);
      }
      return AnonymousObservable;
    }(Observable));
    var AutoDetachObserver = (function(__super__) {
      inherits(AutoDetachObserver, __super__);
      function AutoDetachObserver(observer) {
        __super__.call(this);
        this.observer = observer;
        this.m = new SingleAssignmentDisposable();
      }
      var AutoDetachObserverPrototype = AutoDetachObserver.prototype;
      AutoDetachObserverPrototype.next = function(value) {
        var result = tryCatch(this.observer.onNext).call(this.observer, value);
        if (result === errorObj) {
          this.dispose();
          thrower(result.e);
        }
      };
      AutoDetachObserverPrototype.error = function(err) {
        var result = tryCatch(this.observer.onError).call(this.observer, err);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.completed = function() {
        var result = tryCatch(this.observer.onCompleted).call(this.observer);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.setDisposable = function(value) {
        this.m.setDisposable(value);
      };
      AutoDetachObserverPrototype.getDisposable = function() {
        return this.m.getDisposable();
      };
      AutoDetachObserverPrototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.m.dispose();
      };
      return AutoDetachObserver;
    }(AbstractObserver));
    var InnerSubscription = function(subject, observer) {
      this.subject = subject;
      this.observer = observer;
    };
    InnerSubscription.prototype.dispose = function() {
      if (!this.subject.isDisposed && this.observer !== null) {
        var idx = this.subject.observers.indexOf(this.observer);
        this.subject.observers.splice(idx, 1);
        this.observer = null;
      }
    };
    var Subject = Rx.Subject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
          return disposableEmpty;
        }
        observer.onCompleted();
        return disposableEmpty;
      }
      inherits(Subject, __super__);
      function Subject() {
        __super__.call(this, subscribe);
        this.isDisposed = false, this.isStopped = false, this.observers = [];
        this.hasError = false;
      }
      addProperties(Subject.prototype, Observer.prototype, {
        hasObservers: function() {
          return this.observers.length > 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onCompleted();
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.error = error;
            this.hasError = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (!this.isStopped) {
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onNext(value);
            }
          }
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
        }
      });
      Subject.create = function(observer, observable) {
        return new AnonymousSubject(observer, observable);
      };
      return Subject;
    }(Observable));
    var AsyncSubject = Rx.AsyncSubject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
        } else if (this.hasValue) {
          observer.onNext(this.value);
          observer.onCompleted();
        } else {
          observer.onCompleted();
        }
        return disposableEmpty;
      }
      inherits(AsyncSubject, __super__);
      function AsyncSubject() {
        __super__.call(this, subscribe);
        this.isDisposed = false;
        this.isStopped = false;
        this.hasValue = false;
        this.observers = [];
        this.hasError = false;
      }
      addProperties(AsyncSubject.prototype, Observer, {
        hasObservers: function() {
          checkDisposed(this);
          return this.observers.length > 0;
        },
        onCompleted: function() {
          var i,
              len;
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            var os = cloneArray(this.observers),
                len = os.length;
            if (this.hasValue) {
              for (i = 0; i < len; i++) {
                var o = os[i];
                o.onNext(this.value);
                o.onCompleted();
              }
            } else {
              for (i = 0; i < len; i++) {
                os[i].onCompleted();
              }
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.hasError = true;
            this.error = error;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return ;
          }
          this.value = value;
          this.hasValue = true;
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
          this.exception = null;
          this.value = null;
        }
      });
      return AsyncSubject;
    }(Observable));
    var AnonymousSubject = Rx.AnonymousSubject = (function(__super__) {
      inherits(AnonymousSubject, __super__);
      function subscribe(observer) {
        return this.observable.subscribe(observer);
      }
      function AnonymousSubject(observer, observable) {
        this.observer = observer;
        this.observable = observable;
        __super__.call(this, subscribe);
      }
      addProperties(AnonymousSubject.prototype, Observer.prototype, {
        onCompleted: function() {
          this.observer.onCompleted();
        },
        onError: function(error) {
          this.observer.onError(error);
        },
        onNext: function(value) {
          this.observer.onNext(value);
        }
      });
      return AnonymousSubject;
    }(Observable));
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      root.Rx = Rx;
      define(function() {
        return Rx;
      });
    } else if (freeExports && freeModule) {
      if (moduleExports) {
        (freeModule.exports = Rx).Rx = Rx;
      } else {
        freeExports.Rx = Rx;
      }
    } else {
      root.Rx = Rx;
    }
    var rEndingLine = captureLine();
  }.call(this));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/facade/lang", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/lang";
  var _global,
      Type,
      BaseException,
      Math,
      Date,
      assertionsEnabled_,
      StringWrapper,
      StringJoiner,
      NumberParseError,
      NumberWrapper,
      RegExp,
      RegExpWrapper,
      RegExpMatcherWrapper,
      FunctionWrapper,
      Json,
      DateWrapper;
  function assertionsEnabled() {
    return assertionsEnabled_;
  }
  function ENUM_INDEX(value) {
    return value;
  }
  function CONST_EXPR(expr) {
    return expr;
  }
  function CONST() {
    return (function(target) {
      return target;
    });
  }
  function ABSTRACT() {
    return (function(t) {
      return t;
    });
  }
  function IMPLEMENTS(_) {
    return (function(t) {
      return t;
    });
  }
  function isPresent(obj) {
    return obj !== undefined && obj !== null;
  }
  function isBlank(obj) {
    return obj === undefined || obj === null;
  }
  function isString(obj) {
    return typeof obj === "string";
  }
  function isFunction(obj) {
    return typeof obj === "function";
  }
  function isType(obj) {
    return isFunction(obj);
  }
  function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
  }
  function isPromise(obj) {
    return obj instanceof _global.Promise;
  }
  function isArray(obj) {
    return Array.isArray(obj);
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return token;
    }
    if (token === undefined || token === null) {
      return '' + token;
    }
    if (token.name) {
      return token.name;
    }
    return token.toString();
  }
  function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
  }
  function getMapKey(value) {
    return value;
  }
  function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
  }
  function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
  }
  function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
  }
  function print(obj) {
    if (obj instanceof Error) {
      console.log(obj.stack);
    } else {
      console.log(obj);
    }
  }
  $__export("assertionsEnabled", assertionsEnabled);
  $__export("ENUM_INDEX", ENUM_INDEX);
  $__export("CONST_EXPR", CONST_EXPR);
  $__export("CONST", CONST);
  $__export("ABSTRACT", ABSTRACT);
  $__export("IMPLEMENTS", IMPLEMENTS);
  $__export("isPresent", isPresent);
  $__export("isBlank", isBlank);
  $__export("isString", isString);
  $__export("isFunction", isFunction);
  $__export("isType", isType);
  $__export("isStringMap", isStringMap);
  $__export("isPromise", isPromise);
  $__export("isArray", isArray);
  $__export("stringify", stringify);
  $__export("looseIdentical", looseIdentical);
  $__export("getMapKey", getMapKey);
  $__export("normalizeBlank", normalizeBlank);
  $__export("normalizeBool", normalizeBool);
  $__export("isJsObject", isJsObject);
  $__export("print", print);
  return {
    setters: [],
    execute: function() {
      _global = (typeof window === 'undefined' ? global : window);
      $__export("global", _global);
      Type = Function;
      $__export("Type", Type);
      BaseException = (function($__super) {
        function BaseException(message, originalException, originalStack) {
          $traceurRuntime.superConstructor(BaseException).call(this, message);
          this.message = message;
          this.originalException = originalException;
          this.originalStack = originalStack;
          this.stack = (new Error(message)).stack;
        }
        return ($traceurRuntime.createClass)(BaseException, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error));
      $__export("BaseException", BaseException);
      Math = _global.Math;
      $__export("Math", Math);
      Date = _global.Date;
      $__export("Date", Date);
      assertionsEnabled_ = typeof _global['assert'] !== 'undefined';
      _global.assert = function assert(condition) {
        if (assertionsEnabled_) {
          _global['assert'].call(condition);
        }
      };
      StringWrapper = (function() {
        function StringWrapper() {}
        return ($traceurRuntime.createClass)(StringWrapper, {}, {
          fromCharCode: function(code) {
            return String.fromCharCode(code);
          },
          charCodeAt: function(s, index) {
            return s.charCodeAt(index);
          },
          split: function(s, regExp) {
            return s.split(regExp);
          },
          equals: function(s, s2) {
            return s === s2;
          },
          replace: function(s, from, replace) {
            return s.replace(from, replace);
          },
          replaceAll: function(s, from, replace) {
            return s.replace(from, replace);
          },
          toUpperCase: function(s) {
            return s.toUpperCase();
          },
          toLowerCase: function(s) {
            return s.toLowerCase();
          },
          startsWith: function(s, start) {
            return s.startsWith(start);
          },
          substring: function(s, start) {
            var end = arguments[2] !== (void 0) ? arguments[2] : null;
            return s.substring(start, end === null ? undefined : end);
          },
          replaceAllMapped: function(s, from, cb) {
            return s.replace(from, function() {
              for (var matches = [],
                  $__1 = 0; $__1 < arguments.length; $__1++)
                matches[$__1] = arguments[$__1];
              matches.splice(-2, 2);
              return cb(matches);
            });
          },
          contains: function(s, substr) {
            return s.indexOf(substr) != -1;
          }
        });
      }());
      $__export("StringWrapper", StringWrapper);
      StringJoiner = (function() {
        function StringJoiner() {
          var parts = arguments[0] !== (void 0) ? arguments[0] : [];
          this.parts = parts;
        }
        return ($traceurRuntime.createClass)(StringJoiner, {
          add: function(part) {
            this.parts.push(part);
          },
          toString: function() {
            return this.parts.join("");
          }
        }, {});
      }());
      $__export("StringJoiner", StringJoiner);
      NumberParseError = (function($__super) {
        function NumberParseError(message) {
          $traceurRuntime.superConstructor(NumberParseError).call(this);
          this.message = message;
        }
        return ($traceurRuntime.createClass)(NumberParseError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("NumberParseError", NumberParseError);
      NumberWrapper = (function() {
        function NumberWrapper() {}
        return ($traceurRuntime.createClass)(NumberWrapper, {}, {
          toFixed: function(n, fractionDigits) {
            return n.toFixed(fractionDigits);
          },
          equal: function(a, b) {
            return a === b;
          },
          parseIntAutoRadix: function(text) {
            var result = parseInt(text);
            if (isNaN(result)) {
              throw new NumberParseError("Invalid integer literal when parsing " + text);
            }
            return result;
          },
          parseInt: function(text, radix) {
            if (radix == 10) {
              if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
              }
            } else if (radix == 16) {
              if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
              }
            } else {
              var result = parseInt(text, radix);
              if (!isNaN(result)) {
                return result;
              }
            }
            throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " + radix);
          },
          parseFloat: function(text) {
            return parseFloat(text);
          },
          get NaN() {
            return NaN;
          },
          isNaN: function(value) {
            return isNaN(value);
          },
          isInteger: function(value) {
            return Number.isInteger(value);
          }
        });
      }());
      $__export("NumberWrapper", NumberWrapper);
      RegExp = _global.RegExp;
      $__export("RegExp", RegExp);
      RegExpWrapper = (function() {
        function RegExpWrapper() {}
        return ($traceurRuntime.createClass)(RegExpWrapper, {}, {
          create: function(regExpStr) {
            var flags = arguments[1] !== (void 0) ? arguments[1] : '';
            flags = flags.replace(/g/g, '');
            return new _global.RegExp(regExpStr, flags + 'g');
          },
          firstMatch: function(regExp, input) {
            regExp.lastIndex = 0;
            return regExp.exec(input);
          },
          test: function(regExp, input) {
            return regExp.test(input);
          },
          matcher: function(regExp, input) {
            regExp.lastIndex = 0;
            return {
              re: regExp,
              input: input
            };
          }
        });
      }());
      $__export("RegExpWrapper", RegExpWrapper);
      RegExpMatcherWrapper = (function() {
        function RegExpMatcherWrapper() {}
        return ($traceurRuntime.createClass)(RegExpMatcherWrapper, {}, {next: function(matcher) {
            return matcher.re.exec(matcher.input);
          }});
      }());
      $__export("RegExpMatcherWrapper", RegExpMatcherWrapper);
      FunctionWrapper = (function() {
        function FunctionWrapper() {}
        return ($traceurRuntime.createClass)(FunctionWrapper, {}, {apply: function(fn, posArgs) {
            return fn.apply(null, posArgs);
          }});
      }());
      $__export("FunctionWrapper", FunctionWrapper);
      Json = (function() {
        function Json() {}
        return ($traceurRuntime.createClass)(Json, {}, {
          parse: function(s) {
            return _global.JSON.parse(s);
          },
          stringify: function(data) {
            return _global.JSON.stringify(data, null, 2);
          }
        });
      }());
      $__export("Json", Json);
      DateWrapper = (function() {
        function DateWrapper() {}
        return ($traceurRuntime.createClass)(DateWrapper, {}, {
          fromMillis: function(ms) {
            return new Date(ms);
          },
          toMillis: function(date) {
            return date.getTime();
          },
          now: function() {
            return new Date();
          },
          toJson: function(date) {
            return date.toJSON();
          }
        });
      }());
      $__export("DateWrapper", DateWrapper);
    }
  };
});

System.register("angular2/src/facade/collection", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/collection";
  var isJsObject,
      global,
      isPresent,
      isArray,
      List,
      Map,
      Set,
      StringMap,
      createMapFromPairs,
      createMapFromMap,
      _clearValues,
      MapWrapper,
      StringMapWrapper,
      ListWrapper,
      createSetFromList,
      SetWrapper;
  function isListLikeIterable(obj) {
    if (!isJsObject(obj))
      return false;
    return isArray(obj) || (!(obj instanceof Map) && Symbol.iterator in obj);
  }
  function iterateListLike(obj, fn) {
    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        fn(obj[i]);
      }
    } else {
      var iterator = obj[Symbol.iterator]();
      var item;
      while (!((item = iterator.next()).done)) {
        fn(item.value);
      }
    }
  }
  function iterableToList(ii) {
    var res = [];
    var $__4 = true;
    var $__5 = false;
    var $__6 = undefined;
    try {
      for (var $__2 = void 0,
          $__1 = (ii)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
        var i = $__2.value;
        {
          res.push(i);
        }
      }
    } catch ($__7) {
      $__5 = true;
      $__6 = $__7;
    } finally {
      try {
        if (!$__4 && $__1.return != null) {
          $__1.return();
        }
      } finally {
        if ($__5) {
          throw $__6;
        }
      }
    }
    return res;
  }
  $__export("isListLikeIterable", isListLikeIterable);
  $__export("iterateListLike", iterateListLike);
  $__export("iterableToList", iterableToList);
  return {
    setters: [function($__m) {
      isJsObject = $__m.isJsObject;
      global = $__m.global;
      isPresent = $__m.isPresent;
      isArray = $__m.isArray;
    }],
    execute: function() {
      List = global.Array;
      $__export("List", List);
      Map = global.Map;
      $__export("Map", Map);
      Set = global.Set;
      $__export("Set", Set);
      StringMap = global.Object;
      $__export("StringMap", StringMap);
      createMapFromPairs = (function() {
        try {
          if (new Map([1, 2]).size === 2) {
            return function createMapFromPairs(pairs) {
              return new Map(pairs);
            };
          }
        } catch (e) {}
        return function createMapAndPopulateFromPairs(pairs) {
          var map = new Map();
          for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            map.set(pair[0], pair[1]);
          }
          return map;
        };
      })();
      createMapFromMap = (function() {
        try {
          if (new Map(new Map())) {
            return function createMapFromMap(m) {
              return new Map(m);
            };
          }
        } catch (e) {}
        return function createMapAndPopulateFromMap(m) {
          var map = new Map();
          m.forEach((function(v, k) {
            map.set(k, v);
          }));
          return map;
        };
      })();
      _clearValues = (function() {
        if ((new Map()).keys().next) {
          return function _clearValues(m) {
            var keyIterator = m.keys();
            var k;
            while (!((k = keyIterator.next()).done)) {
              m.set(k.value, null);
            }
          };
        } else {
          return function _clearValuesWithForeEach(m) {
            m.forEach((function(v, k) {
              m.set(k, null);
            }));
          };
        }
      })();
      MapWrapper = (function() {
        function MapWrapper() {}
        return ($traceurRuntime.createClass)(MapWrapper, {}, {
          clone: function(m) {
            return createMapFromMap(m);
          },
          createFromStringMap: function(stringMap) {
            var result = new Map();
            for (var prop in stringMap) {
              result.set(prop, stringMap[prop]);
            }
            return result;
          },
          createFromPairs: function(pairs) {
            return createMapFromPairs(pairs);
          },
          forEach: function(m, fn) {
            m.forEach(fn);
          },
          size: function(m) {
            return m.size;
          },
          delete: function(m, k) {
            m.delete(k);
          },
          clearValues: function(m) {
            _clearValues(m);
          },
          iterable: function(m) {
            return m;
          },
          keys: function(m) {
            return Array.from(m.keys());
          },
          values: function(m) {
            return Array.from(m.values());
          }
        });
      }());
      $__export("MapWrapper", MapWrapper);
      StringMapWrapper = (function() {
        function StringMapWrapper() {}
        return ($traceurRuntime.createClass)(StringMapWrapper, {}, {
          create: function() {
            return {};
          },
          contains: function(map, key) {
            return map.hasOwnProperty(key);
          },
          get: function(map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
          },
          set: function(map, key, value) {
            map[key] = value;
          },
          keys: function(map) {
            return Object.keys(map);
          },
          isEmpty: function(map) {
            for (var prop in map) {
              return false;
            }
            return true;
          },
          delete: function(map, key) {
            delete map[key];
          },
          forEach: function(map, callback) {
            for (var prop in map) {
              if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
              }
            }
          },
          merge: function(m1, m2) {
            var m = {};
            for (var attr in m1) {
              if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
              }
            }
            for (var attr in m2) {
              if (m2.hasOwnProperty(attr)) {
                m[attr] = m2[attr];
              }
            }
            return m;
          },
          equals: function(m1, m2) {
            var k1 = Object.keys(m1);
            var k2 = Object.keys(m2);
            if (k1.length != k2.length) {
              return false;
            }
            var key;
            for (var i = 0; i < k1.length; i++) {
              key = k1[i];
              if (m1[key] !== m2[key]) {
                return false;
              }
            }
            return true;
          }
        });
      }());
      $__export("StringMapWrapper", StringMapWrapper);
      ListWrapper = (function() {
        function ListWrapper() {}
        return ($traceurRuntime.createClass)(ListWrapper, {}, {
          createFixedSize: function(size) {
            return new List(size);
          },
          createGrowableSize: function(size) {
            return new List(size);
          },
          get: function(m, k) {
            return m[k];
          },
          set: function(m, k, v) {
            m[k] = v;
          },
          clone: function(array) {
            return array.slice(0);
          },
          map: function(array, fn) {
            return array.map(fn);
          },
          forEach: function(array, fn) {
            for (var i = 0; i < array.length; i++) {
              fn(array[i]);
            }
          },
          first: function(array) {
            if (!array)
              return null;
            return array[0];
          },
          last: function(array) {
            if (!array || array.length == 0)
              return null;
            return array[array.length - 1];
          },
          find: function(list, pred) {
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return list[i];
            }
            return null;
          },
          indexOf: function(array, value) {
            var startIndex = arguments[2] !== (void 0) ? arguments[2] : 0;
            return array.indexOf(value, startIndex);
          },
          reduce: function(list, fn, init) {
            return list.reduce(fn, init);
          },
          filter: function(array, pred) {
            return array.filter(pred);
          },
          any: function(list, pred) {
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return true;
            }
            return false;
          },
          contains: function(list, el) {
            return list.indexOf(el) !== -1;
          },
          reversed: function(array) {
            var a = ListWrapper.clone(array);
            return a.reverse();
          },
          concat: function(a, b) {
            return a.concat(b);
          },
          insert: function(list, index, value) {
            list.splice(index, 0, value);
          },
          removeAt: function(list, index) {
            var res = list[index];
            list.splice(index, 1);
            return res;
          },
          removeAll: function(list, items) {
            for (var i = 0; i < items.length; ++i) {
              var index = list.indexOf(items[i]);
              list.splice(index, 1);
            }
          },
          removeLast: function(list) {
            return list.pop();
          },
          remove: function(list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
              list.splice(index, 1);
              return true;
            }
            return false;
          },
          clear: function(list) {
            list.splice(0, list.length);
          },
          join: function(list, s) {
            return list.join(s);
          },
          isEmpty: function(list) {
            return list.length == 0;
          },
          fill: function(list, value) {
            var start = arguments[2] !== (void 0) ? arguments[2] : 0;
            var end = arguments[3] !== (void 0) ? arguments[3] : null;
            list.fill(value, start, end === null ? undefined : end);
          },
          equals: function(a, b) {
            if (a.length != b.length)
              return false;
            for (var i = 0; i < a.length; ++i) {
              if (a[i] !== b[i])
                return false;
            }
            return true;
          },
          slice: function(l) {
            var from = arguments[1] !== (void 0) ? arguments[1] : 0;
            var to = arguments[2] !== (void 0) ? arguments[2] : null;
            return l.slice(from, to === null ? undefined : to);
          },
          splice: function(l, from, length) {
            return l.splice(from, length);
          },
          sort: function(l, compareFn) {
            if (isPresent(compareFn)) {
              l.sort(compareFn);
            } else {
              l.sort();
            }
          },
          toString: function(l) {
            return l.toString();
          },
          toJSON: function(l) {
            return JSON.stringify(l);
          }
        });
      }());
      $__export("ListWrapper", ListWrapper);
      createSetFromList = (function() {
        var test = new Set([1, 2, 3]);
        if (test.size === 3) {
          return function createSetFromList(lst) {
            return new Set(lst);
          };
        } else {
          return function createSetAndPopulateFromList(lst) {
            var res = new Set(lst);
            if (res.size !== lst.length) {
              for (var i = 0; i < lst.length; i++) {
                res.add(lst[i]);
              }
            }
            return res;
          };
        }
      })();
      SetWrapper = (function() {
        function SetWrapper() {}
        return ($traceurRuntime.createClass)(SetWrapper, {}, {
          createFromList: function(lst) {
            return createSetFromList(lst);
          },
          has: function(s, key) {
            return s.has(key);
          }
        });
      }());
      $__export("SetWrapper", SetWrapper);
    }
  };
});

System.register("angular2/src/di/annotations_impl", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/annotations_impl";
  var __decorate,
      __metadata,
      CONST,
      CONST_EXPR,
      stringify,
      isBlank,
      Inject,
      Optional,
      DependencyAnnotation,
      Injectable,
      Visibility,
      Self,
      self,
      Parent,
      Ancestor,
      Unbounded,
      unbounded;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
      CONST_EXPR = $__m.CONST_EXPR;
      stringify = $__m.stringify;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Inject = (($traceurRuntime.createClass)(function(token) {
        this.token = token;
      }, {toString: function() {
          return ("@Inject(" + stringify(this.token) + ")");
        }}, {}));
      $__export("Inject", Inject);
      $__export("Inject", Inject = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Inject));
      Optional = (($traceurRuntime.createClass)(function() {}, {toString: function() {
          return "@Optional()";
        }}, {}));
      $__export("Optional", Optional);
      $__export("Optional", Optional = __decorate([CONST(), __metadata('design:paramtypes', [])], Optional));
      DependencyAnnotation = (($traceurRuntime.createClass)(function() {}, {get token() {
          return null;
        }}, {}));
      $__export("DependencyAnnotation", DependencyAnnotation);
      $__export("DependencyAnnotation", DependencyAnnotation = __decorate([CONST(), __metadata('design:paramtypes', [])], DependencyAnnotation));
      Injectable = (($traceurRuntime.createClass)(function() {
        var visibility = arguments[0] !== (void 0) ? arguments[0] : unbounded;
        this.visibility = visibility;
      }, {}, {}));
      $__export("Injectable", Injectable);
      $__export("Injectable", Injectable = __decorate([CONST(), __metadata('design:paramtypes', [Visibility])], Injectable));
      Visibility = (($traceurRuntime.createClass)(function(depth, crossBoundaries, _includeSelf) {
        this.depth = depth;
        this.crossBoundaries = crossBoundaries;
        this._includeSelf = _includeSelf;
      }, {
        get includeSelf() {
          return isBlank(this._includeSelf) ? false : this._includeSelf;
        },
        toString: function() {
          return ("@Visibility(depth: " + this.depth + ", crossBoundaries: " + this.crossBoundaries + ", includeSelf: " + this.includeSelf + "})");
        }
      }, {}));
      $__export("Visibility", Visibility);
      $__export("Visibility", Visibility = __decorate([CONST(), __metadata('design:paramtypes', [Number, Boolean, Boolean])], Visibility));
      Self = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, 0, false, true);
        }
        return ($traceurRuntime.createClass)($__0, {toString: function() {
            return "@Self()";
          }}, {}, $__super);
      }(Visibility));
      $__export("Self", Self);
      $__export("Self", Self = __decorate([CONST(), __metadata('design:paramtypes', [])], Self));
      self = CONST_EXPR(new Self());
      $__export("self", self);
      Parent = (function($__super) {
        function $__0() {
          var self = (arguments[0] !== (void 0) ? arguments[0] : {}).self;
          $traceurRuntime.superConstructor($__0).call(this, 1, false, self);
        }
        return ($traceurRuntime.createClass)($__0, {toString: function() {
            return ("@Parent(self: " + this.includeSelf + "})");
          }}, {}, $__super);
      }(Visibility));
      $__export("Parent", Parent);
      $__export("Parent", Parent = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Parent));
      Ancestor = (function($__super) {
        function $__0() {
          var self = (arguments[0] !== (void 0) ? arguments[0] : {}).self;
          $traceurRuntime.superConstructor($__0).call(this, 999999, false, self);
        }
        return ($traceurRuntime.createClass)($__0, {toString: function() {
            return ("@Ancestor(self: " + this.includeSelf + "})");
          }}, {}, $__super);
      }(Visibility));
      $__export("Ancestor", Ancestor);
      $__export("Ancestor", Ancestor = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Ancestor));
      Unbounded = (function($__super) {
        function $__0() {
          var self = (arguments[0] !== (void 0) ? arguments[0] : {}).self;
          $traceurRuntime.superConstructor($__0).call(this, 999999, true, self);
        }
        return ($traceurRuntime.createClass)($__0, {toString: function() {
            return ("@Unbounded(self: " + this.includeSelf + "})");
          }}, {}, $__super);
      }(Visibility));
      $__export("Unbounded", Unbounded);
      $__export("Unbounded", Unbounded = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Unbounded));
      unbounded = CONST_EXPR(new Unbounded({self: true}));
      $__export("unbounded", unbounded);
    }
  };
});

System.register("angular2/src/util/decorators", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/util/decorators";
  var global,
      isFunction,
      stringify,
      Reflect;
  function extractAnnotation(annotation) {
    if (isFunction(annotation) && annotation.hasOwnProperty('annotation')) {
      annotation = annotation.annotation;
    }
    return annotation;
  }
  function applyParams(fnOrArray, key) {
    if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function || fnOrArray === Number || fnOrArray === Array) {
      throw new Error(("Can not use native " + stringify(fnOrArray) + " as constructor"));
    }
    if (isFunction(fnOrArray)) {
      return fnOrArray;
    } else if (fnOrArray instanceof Array) {
      var annotations = fnOrArray;
      var fn = fnOrArray[fnOrArray.length - 1];
      if (!isFunction(fn)) {
        throw new Error(("Last position of Class method array must be Function in key " + key + " was '" + stringify(fn) + "'"));
      }
      var annoLength = annotations.length - 1;
      if (annoLength != fn.length) {
        throw new Error(("Number of annotations (" + annoLength + ") does not match number of arguments (" + fn.length + ") in the function: " + stringify(fn)));
      }
      var paramsAnnotations = [];
      for (var i = 0,
          ii = annotations.length - 1; i < ii; i++) {
        var paramAnnotations = [];
        paramsAnnotations.push(paramAnnotations);
        var annotation = annotations[i];
        if (annotation instanceof Array) {
          for (var j = 0; j < annotation.length; j++) {
            paramAnnotations.push(extractAnnotation(annotation[j]));
          }
        } else if (isFunction(annotation)) {
          paramAnnotations.push(extractAnnotation(annotation));
        } else {
          paramAnnotations.push(annotation);
        }
      }
      Reflect.defineMetadata('parameters', paramsAnnotations, fn);
      return fn;
    } else {
      throw new Error(("Only Function or Array is supported in Class definition for key '" + key + "' is '" + stringify(fnOrArray) + "'"));
    }
  }
  function Class(clsDef) {
    var constructor = applyParams(clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
    var proto = constructor.prototype;
    if (clsDef.hasOwnProperty('extends')) {
      if (isFunction(clsDef.extends)) {
        constructor.prototype = proto = Object.create(clsDef.extends.prototype);
      } else {
        throw new Error(("Class definition 'extends' property must be a constructor function was: " + stringify(clsDef.extends)));
      }
    }
    for (var key in clsDef) {
      if (key != 'extends' && key != 'prototype' && clsDef.hasOwnProperty(key)) {
        proto[key] = applyParams(clsDef[key], key);
      }
    }
    if (this && this.annotations instanceof Array) {
      Reflect.defineMetadata('annotations', this.annotations, constructor);
    }
    return constructor;
  }
  function makeDecorator(annotationCls) {
    var chainFn = arguments[1] !== (void 0) ? arguments[1] : null;
    function DecoratorFactory(objOrType) {
      var annotationInstance = new annotationCls(objOrType);
      if (this instanceof annotationCls) {
        return annotationInstance;
      } else {
        var chainAnnotation = isFunction(this) && this.annotations instanceof Array ? this.annotations : [];
        chainAnnotation.push(annotationInstance);
        var TypeDecorator = function TypeDecorator(cls) {
          var annotations = Reflect.getMetadata('annotations', cls);
          annotations = annotations || [];
          annotations.push(annotationInstance);
          Reflect.defineMetadata('annotations', annotations, cls);
          return cls;
        };
        TypeDecorator.annotations = chainAnnotation;
        TypeDecorator.Class = Class;
        if (chainFn)
          chainFn(TypeDecorator);
        return TypeDecorator;
      }
    }
    DecoratorFactory.prototype = Object.create(annotationCls.prototype);
    return DecoratorFactory;
  }
  function makeParamDecorator(annotationCls) {
    function ParamDecoratorFactory() {
      for (var args = [],
          $__0 = 0; $__0 < arguments.length; $__0++)
        args[$__0] = arguments[$__0];
      var annotationInstance = Object.create(annotationCls.prototype);
      annotationCls.apply(annotationInstance, args);
      if (this instanceof annotationCls) {
        return annotationInstance;
      } else {
        ParamDecorator.annotation = annotationInstance;
        return ParamDecorator;
      }
      function ParamDecorator(cls, unusedKey, index) {
        var parameters = Reflect.getMetadata('parameters', cls);
        parameters = parameters || [];
        while (parameters.length <= index) {
          parameters.push(null);
        }
        parameters[index] = parameters[index] || [];
        var annotationsForParam = parameters[index];
        annotationsForParam.push(annotationInstance);
        Reflect.defineMetadata('parameters', parameters, cls);
        return cls;
      }
    }
    ParamDecoratorFactory.prototype = Object.create(annotationCls.prototype);
    return ParamDecoratorFactory;
  }
  $__export("Class", Class);
  $__export("makeDecorator", makeDecorator);
  $__export("makeParamDecorator", makeParamDecorator);
  return {
    setters: [function($__m) {
      global = $__m.global;
      isFunction = $__m.isFunction;
      stringify = $__m.stringify;
    }],
    execute: function() {
      Reflect = global.Reflect;
      if (!(Reflect && Reflect.getMetadata)) {
        throw 'reflect-metadata shim is required when using class decorators';
      }
    }
  };
});

System.register("angular2/src/reflection/reflector", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/reflector";
  var isPresent,
      Map,
      StringMapWrapper,
      Reflector;
  function _mergeMaps(target, config) {
    StringMapWrapper.forEach(config, (function(v, k) {
      return target.set(k, v);
    }));
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      Map = $__m.Map;
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      Reflector = (function() {
        function Reflector(reflectionCapabilities) {
          this._typeInfo = new Map();
          this._getters = new Map();
          this._setters = new Map();
          this._methods = new Map();
          this.reflectionCapabilities = reflectionCapabilities;
        }
        return ($traceurRuntime.createClass)(Reflector, {
          registerType: function(type, typeInfo) {
            this._typeInfo.set(type, typeInfo);
          },
          registerGetters: function(getters) {
            _mergeMaps(this._getters, getters);
          },
          registerSetters: function(setters) {
            _mergeMaps(this._setters, setters);
          },
          registerMethods: function(methods) {
            _mergeMaps(this._methods, methods);
          },
          factory: function(type) {
            if (this._containsTypeInfo(type)) {
              return this._getTypeInfoField(type, "factory", null);
            } else {
              return this.reflectionCapabilities.factory(type);
            }
          },
          parameters: function(typeOrFunc) {
            if (this._typeInfo.has(typeOrFunc)) {
              return this._getTypeInfoField(typeOrFunc, "parameters", []);
            } else {
              return this.reflectionCapabilities.parameters(typeOrFunc);
            }
          },
          annotations: function(typeOrFunc) {
            if (this._typeInfo.has(typeOrFunc)) {
              return this._getTypeInfoField(typeOrFunc, "annotations", []);
            } else {
              return this.reflectionCapabilities.annotations(typeOrFunc);
            }
          },
          interfaces: function(type) {
            if (this._typeInfo.has(type)) {
              return this._getTypeInfoField(type, "interfaces", []);
            } else {
              return this.reflectionCapabilities.interfaces(type);
            }
          },
          getter: function(name) {
            if (this._getters.has(name)) {
              return this._getters.get(name);
            } else {
              return this.reflectionCapabilities.getter(name);
            }
          },
          setter: function(name) {
            if (this._setters.has(name)) {
              return this._setters.get(name);
            } else {
              return this.reflectionCapabilities.setter(name);
            }
          },
          method: function(name) {
            if (this._methods.has(name)) {
              return this._methods.get(name);
            } else {
              return this.reflectionCapabilities.method(name);
            }
          },
          _getTypeInfoField: function(typeOrFunc, key, defaultValue) {
            var res = this._typeInfo.get(typeOrFunc)[key];
            return isPresent(res) ? res : defaultValue;
          },
          _containsTypeInfo: function(typeOrFunc) {
            return this._typeInfo.has(typeOrFunc);
          }
        }, {});
      }());
      $__export("Reflector", Reflector);
    }
  };
});

System.register("angular2/src/reflection/reflection_capabilities", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/reflection_capabilities";
  var isPresent,
      isFunction,
      global,
      stringify,
      BaseException,
      ListWrapper,
      ReflectionCapabilities;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isFunction = $__m.isFunction;
      global = $__m.global;
      stringify = $__m.stringify;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      ReflectionCapabilities = (function() {
        function ReflectionCapabilities(reflect) {
          this._reflect = isPresent(reflect) ? reflect : global.Reflect;
        }
        return ($traceurRuntime.createClass)(ReflectionCapabilities, {
          factory: function(t) {
            switch (t.length) {
              case 0:
                return (function() {
                  return new t();
                });
              case 1:
                return (function(a1) {
                  return new t(a1);
                });
              case 2:
                return (function(a1, a2) {
                  return new t(a1, a2);
                });
              case 3:
                return (function(a1, a2, a3) {
                  return new t(a1, a2, a3);
                });
              case 4:
                return (function(a1, a2, a3, a4) {
                  return new t(a1, a2, a3, a4);
                });
              case 5:
                return (function(a1, a2, a3, a4, a5) {
                  return new t(a1, a2, a3, a4, a5);
                });
              case 6:
                return (function(a1, a2, a3, a4, a5, a6) {
                  return new t(a1, a2, a3, a4, a5, a6);
                });
              case 7:
                return (function(a1, a2, a3, a4, a5, a6, a7) {
                  return new t(a1, a2, a3, a4, a5, a6, a7);
                });
              case 8:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8);
                });
              case 9:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9);
                });
              case 10:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
                });
              case 11:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
                });
              case 12:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
                });
              case 13:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
                });
              case 14:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
                });
              case 15:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
                });
              case 16:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
                });
              case 17:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
                });
              case 18:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
                });
              case 19:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
                });
              case 20:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);
                });
            }
            ;
            throw new Error(("Cannot create a factory for '" + stringify(t) + "' because its constructor has more than 20 arguments"));
          },
          _zipTypesAndAnnotaions: function(paramTypes, paramAnnotations) {
            var result;
            if (typeof paramTypes === 'undefined') {
              result = ListWrapper.createFixedSize(paramAnnotations.length);
            } else {
              result = ListWrapper.createFixedSize(paramTypes.length);
            }
            for (var i = 0; i < result.length; i++) {
              if (typeof paramTypes === 'undefined') {
                result[i] = [];
              } else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
              } else {
                result[i] = [];
              }
              if (isPresent(paramAnnotations) && isPresent(paramAnnotations[i])) {
                result[i] = result[i].concat(paramAnnotations[i]);
              }
            }
            return result;
          },
          parameters: function(typeOfFunc) {
            if (isPresent(typeOfFunc.parameters)) {
              return typeOfFunc.parameters;
            }
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
              var paramAnnotations = this._reflect.getMetadata('parameters', typeOfFunc);
              var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOfFunc);
              if (isPresent(paramTypes) || isPresent(paramAnnotations)) {
                return this._zipTypesAndAnnotaions(paramTypes, paramAnnotations);
              }
            }
            return ListWrapper.createFixedSize(typeOfFunc.length);
          },
          annotations: function(typeOfFunc) {
            if (isPresent(typeOfFunc.annotations)) {
              var annotations = typeOfFunc.annotations;
              if (isFunction(annotations) && annotations.annotations) {
                annotations = annotations.annotations;
              }
              return annotations;
            }
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
              var annotations = this._reflect.getMetadata('annotations', typeOfFunc);
              if (isPresent(annotations))
                return annotations;
            }
            return [];
          },
          interfaces: function(type) {
            throw new BaseException("JavaScript does not support interfaces");
          },
          getter: function(name) {
            return new Function('o', 'return o.' + name + ';');
          },
          setter: function(name) {
            return new Function('o', 'v', 'return o.' + name + ' = v;');
          },
          method: function(name) {
            var functionBody = ("if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);");
            return new Function('o', 'args', functionBody);
          }
        }, {});
      }());
      $__export("ReflectionCapabilities", ReflectionCapabilities);
    }
  };
});

System.register("angular2/src/change_detection/parser/locals", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/locals";
  var isPresent,
      BaseException,
      MapWrapper,
      Locals;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }],
    execute: function() {
      Locals = (function() {
        function Locals(parent, current) {
          this.parent = parent;
          this.current = current;
        }
        return ($traceurRuntime.createClass)(Locals, {
          contains: function(name) {
            if (this.current.has(name)) {
              return true;
            }
            if (isPresent(this.parent)) {
              return this.parent.contains(name);
            }
            return false;
          },
          get: function(name) {
            if (this.current.has(name)) {
              return this.current.get(name);
            }
            if (isPresent(this.parent)) {
              return this.parent.get(name);
            }
            throw new BaseException(("Cannot find '" + name + "'"));
          },
          set: function(name, value) {
            if (this.current.has(name)) {
              this.current.set(name, value);
            } else {
              throw new BaseException(("Setting of new keys post-construction is not supported. Key: " + name + "."));
            }
          },
          clearValues: function() {
            MapWrapper.clearValues(this.current);
          }
        }, {});
      }());
      $__export("Locals", Locals);
    }
  };
});

System.register("angular2/src/change_detection/exceptions", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/exceptions";
  var BaseException,
      ExpressionChangedAfterItHasBeenChecked,
      ChangeDetectionError,
      DehydratedException;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      ExpressionChangedAfterItHasBeenChecked = (function($__super) {
        function ExpressionChangedAfterItHasBeenChecked(proto, change) {
          $traceurRuntime.superConstructor(ExpressionChangedAfterItHasBeenChecked).call(this);
          this.message = ("Expression '" + proto.expressionAsString + "' has changed after it was checked. ") + ("Previous value: '" + change.previousValue + "'. Current value: '" + change.currentValue + "'");
        }
        return ($traceurRuntime.createClass)(ExpressionChangedAfterItHasBeenChecked, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("ExpressionChangedAfterItHasBeenChecked", ExpressionChangedAfterItHasBeenChecked);
      ChangeDetectionError = (function($__super) {
        function ChangeDetectionError(proto, originalException) {
          $traceurRuntime.superConstructor(ChangeDetectionError).call(this);
          this.originalException = originalException;
          this.location = proto.expressionAsString;
          this.message = (this.originalException + " in [" + this.location + "]");
        }
        return ($traceurRuntime.createClass)(ChangeDetectionError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("ChangeDetectionError", ChangeDetectionError);
      DehydratedException = (function($__super) {
        function DehydratedException() {
          $traceurRuntime.superConstructor(DehydratedException).call(this, 'Attempt to detect changes on a dehydrated detector.');
        }
        return ($traceurRuntime.createClass)(DehydratedException, {}, {}, $__super);
      }(BaseException));
      $__export("DehydratedException", DehydratedException);
    }
  };
});

System.register("angular2/src/change_detection/interfaces", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/interfaces";
  var __decorate,
      __metadata,
      CONST,
      ChangeDetection,
      ChangeDetectorDefinition;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ChangeDetection = (($traceurRuntime.createClass)(function() {}, {createProtoChangeDetector: function(definition) {
          return null;
        }}, {}));
      $__export("ChangeDetection", ChangeDetection);
      $__export("ChangeDetection", ChangeDetection = __decorate([CONST(), __metadata('design:paramtypes', [])], ChangeDetection));
      ChangeDetectorDefinition = (function() {
        function ChangeDetectorDefinition(id, strategy, variableNames, bindingRecords, directiveRecords) {
          this.id = id;
          this.strategy = strategy;
          this.variableNames = variableNames;
          this.bindingRecords = bindingRecords;
          this.directiveRecords = directiveRecords;
        }
        return ($traceurRuntime.createClass)(ChangeDetectorDefinition, {}, {});
      }());
      $__export("ChangeDetectorDefinition", ChangeDetectorDefinition);
    }
  };
});

System.register("angular2/src/change_detection/constants", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/constants";
  var CHECK_ONCE,
      CHECKED,
      CHECK_ALWAYS,
      DETACHED,
      ON_PUSH,
      DEFAULT;
  return {
    setters: [],
    execute: function() {
      CHECK_ONCE = "CHECK_ONCE";
      $__export("CHECK_ONCE", CHECK_ONCE);
      CHECKED = "CHECKED";
      $__export("CHECKED", CHECKED);
      CHECK_ALWAYS = "ALWAYS_CHECK";
      $__export("CHECK_ALWAYS", CHECK_ALWAYS);
      DETACHED = "DETACHED";
      $__export("DETACHED", DETACHED);
      ON_PUSH = "ON_PUSH";
      $__export("ON_PUSH", ON_PUSH);
      DEFAULT = "DEFAULT";
      $__export("DEFAULT", DEFAULT);
    }
  };
});

System.register("angular2/src/change_detection/pipes/pipe", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/pipe";
  var __decorate,
      __metadata,
      BaseException,
      CONST,
      WrappedValue,
      _wrappedValues,
      _wrappedIndex,
      BasePipe;
  function _abstract() {
    throw new BaseException('This method is abstract');
  }
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      WrappedValue = (function() {
        function WrappedValue(wrapped) {
          this.wrapped = wrapped;
        }
        return ($traceurRuntime.createClass)(WrappedValue, {}, {wrap: function(value) {
            var w = _wrappedValues[_wrappedIndex++ % 5];
            w.wrapped = value;
            return w;
          }});
      }());
      $__export("WrappedValue", WrappedValue);
      _wrappedValues = [new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null)];
      _wrappedIndex = 0;
      BasePipe = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obj) {
          return true;
        },
        onDestroy: function() {},
        transform: function(value, args) {
          return _abstract();
        }
      }, {}));
      $__export("BasePipe", BasePipe);
      $__export("BasePipe", BasePipe = __decorate([CONST(), __metadata('design:paramtypes', [])], BasePipe));
    }
  };
});

System.register("angular2/src/change_detection/change_detector_ref", ["angular2/src/change_detection/constants"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detector_ref";
  var DETACHED,
      CHECK_ALWAYS,
      ChangeDetectorRef;
  return {
    setters: [function($__m) {
      DETACHED = $__m.DETACHED;
      CHECK_ALWAYS = $__m.CHECK_ALWAYS;
    }],
    execute: function() {
      ChangeDetectorRef = (function() {
        function ChangeDetectorRef(_cd) {
          this._cd = _cd;
        }
        return ($traceurRuntime.createClass)(ChangeDetectorRef, {
          requestCheck: function() {
            this._cd.markPathToRootAsCheckOnce();
          },
          detach: function() {
            this._cd.mode = DETACHED;
          },
          reattach: function() {
            this._cd.mode = CHECK_ALWAYS;
            this.requestCheck();
          }
        }, {});
      }());
      $__export("ChangeDetectorRef", ChangeDetectorRef);
    }
  };
});

System.register("angular2/src/change_detection/proto_record", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/proto_record";
  var RecordType,
      ProtoRecord;
  return {
    setters: [],
    execute: function() {
      $__export("RecordType", RecordType);
      (function(RecordType) {
        RecordType[RecordType["SELF"] = 0] = "SELF";
        RecordType[RecordType["CONST"] = 1] = "CONST";
        RecordType[RecordType["PRIMITIVE_OP"] = 2] = "PRIMITIVE_OP";
        RecordType[RecordType["PROPERTY"] = 3] = "PROPERTY";
        RecordType[RecordType["LOCAL"] = 4] = "LOCAL";
        RecordType[RecordType["INVOKE_METHOD"] = 5] = "INVOKE_METHOD";
        RecordType[RecordType["INVOKE_CLOSURE"] = 6] = "INVOKE_CLOSURE";
        RecordType[RecordType["KEYED_ACCESS"] = 7] = "KEYED_ACCESS";
        RecordType[RecordType["PIPE"] = 8] = "PIPE";
        RecordType[RecordType["INTERPOLATE"] = 9] = "INTERPOLATE";
        RecordType[RecordType["SAFE_PROPERTY"] = 10] = "SAFE_PROPERTY";
        RecordType[RecordType["SAFE_INVOKE_METHOD"] = 11] = "SAFE_INVOKE_METHOD";
        RecordType[RecordType["DIRECTIVE_LIFECYCLE"] = 12] = "DIRECTIVE_LIFECYCLE";
      })(RecordType || ($__export("RecordType", RecordType = {})));
      ProtoRecord = (function() {
        function ProtoRecord(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex, selfIndex, bindingRecord, expressionAsString, lastInBinding, lastInDirective) {
          this.mode = mode;
          this.name = name;
          this.funcOrValue = funcOrValue;
          this.args = args;
          this.fixedArgs = fixedArgs;
          this.contextIndex = contextIndex;
          this.directiveIndex = directiveIndex;
          this.selfIndex = selfIndex;
          this.bindingRecord = bindingRecord;
          this.expressionAsString = expressionAsString;
          this.lastInBinding = lastInBinding;
          this.lastInDirective = lastInDirective;
        }
        return ($traceurRuntime.createClass)(ProtoRecord, {
          isPureFunction: function() {
            return this.mode === RecordType.INTERPOLATE || this.mode === RecordType.PRIMITIVE_OP;
          },
          isPipeRecord: function() {
            return this.mode === RecordType.PIPE;
          },
          isLifeCycleRecord: function() {
            return this.mode === RecordType.DIRECTIVE_LIFECYCLE;
          }
        }, {});
      }());
      $__export("ProtoRecord", ProtoRecord);
    }
  };
});

System.register("angular2/src/change_detection/directive_record", ["angular2/src/change_detection/constants", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/directive_record";
  var ON_PUSH,
      StringWrapper,
      normalizeBool,
      DirectiveIndex,
      DirectiveRecord;
  return {
    setters: [function($__m) {
      ON_PUSH = $__m.ON_PUSH;
    }, function($__m) {
      StringWrapper = $__m.StringWrapper;
      normalizeBool = $__m.normalizeBool;
    }],
    execute: function() {
      DirectiveIndex = (function() {
        function DirectiveIndex(elementIndex, directiveIndex) {
          this.elementIndex = elementIndex;
          this.directiveIndex = directiveIndex;
        }
        return ($traceurRuntime.createClass)(DirectiveIndex, {get name() {
            return (this.elementIndex + "_" + this.directiveIndex);
          }}, {});
      }());
      $__export("DirectiveIndex", DirectiveIndex);
      DirectiveRecord = (function() {
        function DirectiveRecord() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              directiveIndex = $__1.directiveIndex,
              callOnAllChangesDone = $__1.callOnAllChangesDone,
              callOnChange = $__1.callOnChange,
              callOnCheck = $__1.callOnCheck,
              callOnInit = $__1.callOnInit,
              changeDetection = $__1.changeDetection;
          this.directiveIndex = directiveIndex;
          this.callOnAllChangesDone = normalizeBool(callOnAllChangesDone);
          this.callOnChange = normalizeBool(callOnChange);
          this.callOnCheck = normalizeBool(callOnCheck);
          this.callOnInit = normalizeBool(callOnInit);
          this.changeDetection = changeDetection;
        }
        return ($traceurRuntime.createClass)(DirectiveRecord, {isOnPushChangeDetection: function() {
            return StringWrapper.equals(this.changeDetection, ON_PUSH);
          }}, {});
      }());
      $__export("DirectiveRecord", DirectiveRecord);
    }
  };
});

System.register("angular2/src/change_detection/coalesce", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/proto_record"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/coalesce";
  var isPresent,
      ListWrapper,
      Map,
      RecordType,
      ProtoRecord;
  function coalesce(records) {
    var res = [];
    var indexMap = new Map();
    for (var i = 0; i < records.length; ++i) {
      var r = records[i];
      var record = _replaceIndices(r, res.length + 1, indexMap);
      var matchingRecord = _findMatching(record, res);
      if (isPresent(matchingRecord) && record.lastInBinding) {
        res.push(_selfRecord(record, matchingRecord.selfIndex, res.length + 1));
        indexMap.set(r.selfIndex, matchingRecord.selfIndex);
      } else if (isPresent(matchingRecord) && !record.lastInBinding) {
        indexMap.set(r.selfIndex, matchingRecord.selfIndex);
      } else {
        res.push(record);
        indexMap.set(r.selfIndex, record.selfIndex);
      }
    }
    return res;
  }
  function _selfRecord(r, contextIndex, selfIndex) {
    return new ProtoRecord(RecordType.SELF, "self", null, [], r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString, r.lastInBinding, r.lastInDirective);
  }
  function _findMatching(r, rs) {
    return ListWrapper.find(rs, (function(rr) {
      return rr.mode !== RecordType.DIRECTIVE_LIFECYCLE && rr.mode === r.mode && rr.funcOrValue === r.funcOrValue && rr.contextIndex === r.contextIndex && rr.name === r.name && ListWrapper.equals(rr.args, r.args);
    }));
  }
  function _replaceIndices(r, selfIndex, indexMap) {
    var args = ListWrapper.map(r.args, (function(a) {
      return _map(indexMap, a);
    }));
    var contextIndex = _map(indexMap, r.contextIndex);
    return new ProtoRecord(r.mode, r.name, r.funcOrValue, args, r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString, r.lastInBinding, r.lastInDirective);
  }
  function _map(indexMap, value) {
    var r = indexMap.get(value);
    return isPresent(r) ? r : value;
  }
  $__export("coalesce", coalesce);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      Map = $__m.Map;
    }, function($__m) {
      RecordType = $__m.RecordType;
      ProtoRecord = $__m.ProtoRecord;
    }],
    execute: function() {
    }
  };
});

System.register("angular2/src/change_detection/binding_record", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/binding_record";
  var isPresent,
      DIRECTIVE,
      DIRECTIVE_LIFECYCLE,
      ELEMENT_PROPERTY,
      ELEMENT_ATTRIBUTE,
      ELEMENT_CLASS,
      ELEMENT_STYLE,
      TEXT_NODE,
      BindingRecord;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      DIRECTIVE = "directive";
      DIRECTIVE_LIFECYCLE = "directiveLifecycle";
      ELEMENT_PROPERTY = "elementProperty";
      ELEMENT_ATTRIBUTE = "elementAttribute";
      ELEMENT_CLASS = "elementClass";
      ELEMENT_STYLE = "elementStyle";
      TEXT_NODE = "textNode";
      BindingRecord = (function() {
        function BindingRecord(mode, implicitReceiver, ast, elementIndex, propertyName, propertyUnit, setter, lifecycleEvent, directiveRecord) {
          this.mode = mode;
          this.implicitReceiver = implicitReceiver;
          this.ast = ast;
          this.elementIndex = elementIndex;
          this.propertyName = propertyName;
          this.propertyUnit = propertyUnit;
          this.setter = setter;
          this.lifecycleEvent = lifecycleEvent;
          this.directiveRecord = directiveRecord;
        }
        return ($traceurRuntime.createClass)(BindingRecord, {
          callOnChange: function() {
            return isPresent(this.directiveRecord) && this.directiveRecord.callOnChange;
          },
          isOnPushChangeDetection: function() {
            return isPresent(this.directiveRecord) && this.directiveRecord.isOnPushChangeDetection();
          },
          isDirective: function() {
            return this.mode === DIRECTIVE;
          },
          isDirectiveLifecycle: function() {
            return this.mode === DIRECTIVE_LIFECYCLE;
          },
          isElementProperty: function() {
            return this.mode === ELEMENT_PROPERTY;
          },
          isElementAttribute: function() {
            return this.mode === ELEMENT_ATTRIBUTE;
          },
          isElementClass: function() {
            return this.mode === ELEMENT_CLASS;
          },
          isElementStyle: function() {
            return this.mode === ELEMENT_STYLE;
          },
          isTextNode: function() {
            return this.mode === TEXT_NODE;
          }
        }, {
          createForDirective: function(ast, propertyName, setter, directiveRecord) {
            return new BindingRecord(DIRECTIVE, 0, ast, 0, propertyName, null, setter, null, directiveRecord);
          },
          createDirectiveOnCheck: function(directiveRecord) {
            return new BindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, "onCheck", directiveRecord);
          },
          createDirectiveOnInit: function(directiveRecord) {
            return new BindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, "onInit", directiveRecord);
          },
          createDirectiveOnChange: function(directiveRecord) {
            return new BindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, "onChange", directiveRecord);
          },
          createForElementProperty: function(ast, elementIndex, propertyName) {
            return new BindingRecord(ELEMENT_PROPERTY, 0, ast, elementIndex, propertyName, null, null, null, null);
          },
          createForElementAttribute: function(ast, elementIndex, attributeName) {
            return new BindingRecord(ELEMENT_ATTRIBUTE, 0, ast, elementIndex, attributeName, null, null, null, null);
          },
          createForElementClass: function(ast, elementIndex, className) {
            return new BindingRecord(ELEMENT_CLASS, 0, ast, elementIndex, className, null, null, null, null);
          },
          createForElementStyle: function(ast, elementIndex, styleName, unit) {
            return new BindingRecord(ELEMENT_STYLE, 0, ast, elementIndex, styleName, unit, null, null, null);
          },
          createForHostProperty: function(directiveIndex, ast, propertyName) {
            return new BindingRecord(ELEMENT_PROPERTY, directiveIndex, ast, directiveIndex.elementIndex, propertyName, null, null, null, null);
          },
          createForHostAttribute: function(directiveIndex, ast, attributeName) {
            return new BindingRecord(ELEMENT_ATTRIBUTE, directiveIndex, ast, directiveIndex.elementIndex, attributeName, null, null, null, null);
          },
          createForHostClass: function(directiveIndex, ast, className) {
            return new BindingRecord(ELEMENT_CLASS, directiveIndex, ast, directiveIndex.elementIndex, className, null, null, null, null);
          },
          createForHostStyle: function(directiveIndex, ast, styleName, unit) {
            return new BindingRecord(ELEMENT_STYLE, directiveIndex, ast, directiveIndex.elementIndex, styleName, unit, null, null, null);
          },
          createForTextNode: function(ast, elementIndex) {
            return new BindingRecord(TEXT_NODE, 0, ast, elementIndex, null, null, null, null, null);
          }
        });
      }());
      $__export("BindingRecord", BindingRecord);
    }
  };
});

System.register("angular2/src/change_detection/pipes/pipe_registry", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/di/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/pipe_registry";
  var __decorate,
      __metadata,
      ListWrapper,
      isBlank,
      isPresent,
      BaseException,
      CONST,
      Injectable,
      PipeRegistry;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      CONST = $__m.CONST;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      PipeRegistry = (($traceurRuntime.createClass)(function(config) {
        this.config = config;
      }, {
        get: function(type, obj, cdRef, existingPipe) {
          if (isPresent(existingPipe) && existingPipe.supports(obj))
            return existingPipe;
          if (isPresent(existingPipe))
            existingPipe.onDestroy();
          var factories = this._getListOfFactories(type, obj);
          var factory = this._getMatchingFactory(factories, type, obj);
          return factory.create(cdRef);
        },
        _getListOfFactories: function(type, obj) {
          var listOfFactories = this.config[type];
          if (isBlank(listOfFactories)) {
            throw new BaseException(("Cannot find '" + type + "' pipe supporting object '" + obj + "'"));
          }
          return listOfFactories;
        },
        _getMatchingFactory: function(listOfFactories, type, obj) {
          var matchingFactory = ListWrapper.find(listOfFactories, (function(pipeFactory) {
            return pipeFactory.supports(obj);
          }));
          if (isBlank(matchingFactory)) {
            throw new BaseException(("Cannot find '" + type + "' pipe supporting object '" + obj + "'"));
          }
          return matchingFactory;
        }
      }, {}));
      $__export("PipeRegistry", PipeRegistry);
      $__export("PipeRegistry", PipeRegistry = __decorate([Injectable(), CONST(), __metadata('design:paramtypes', [Object])], PipeRegistry));
    }
  };
});

System.register("angular2/src/change_detection/pipes/null_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/null_pipe";
  var __decorate,
      __metadata,
      isBlank,
      CONST,
      BasePipe,
      WrappedValue,
      NullPipeFactory,
      NullPipe;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      CONST = $__m.CONST;
    }, function($__m) {
      BasePipe = $__m.BasePipe;
      WrappedValue = $__m.WrappedValue;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NullPipeFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obj) {
          return NullPipe.supportsObj(obj);
        },
        create: function(cdRef) {
          return new NullPipe();
        }
      }, {}));
      $__export("NullPipeFactory", NullPipeFactory);
      $__export("NullPipeFactory", NullPipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], NullPipeFactory));
      NullPipe = (function($__super) {
        function NullPipe() {
          var $__3;
          for (var args = [],
              $__2 = 0; $__2 < arguments.length; $__2++)
            args[$__2] = arguments[$__2];
          ($__3 = $traceurRuntime.superConstructor(NullPipe)).call.apply($__3, $traceurRuntime.spread([this], args));
          this.called = false;
        }
        return ($traceurRuntime.createClass)(NullPipe, {
          supports: function(obj) {
            return NullPipe.supportsObj(obj);
          },
          transform: function(value) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (!this.called) {
              this.called = true;
              return WrappedValue.wrap(null);
            } else {
              return null;
            }
          }
        }, {supportsObj: function(obj) {
            return isBlank(obj);
          }}, $__super);
      }(BasePipe));
      $__export("NullPipe", NullPipe);
    }
  };
});

System.register("angular2/src/change_detection/change_detection_jit_generator", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/abstract_change_detector", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/proto_record"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detection_jit_generator";
  var BaseException,
      ListWrapper,
      AbstractChangeDetector,
      ChangeDetectionUtil,
      RecordType,
      ABSTRACT_CHANGE_DETECTOR,
      UTIL,
      DISPATCHER_ACCESSOR,
      PIPE_REGISTRY_ACCESSOR,
      PROTOS_ACCESSOR,
      DIRECTIVES_ACCESSOR,
      CONTEXT_ACCESSOR,
      IS_CHANGED_LOCAL,
      CHANGES_LOCAL,
      LOCALS_ACCESSOR,
      MODE_ACCESSOR,
      CURRENT_PROTO,
      ALREADY_CHECKED_ACCESSOR,
      ChangeDetectorJITGenerator;
  function _sanitizeName(s) {
    return s.replace(new RegExp("\\W", "g"), '');
  }
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      AbstractChangeDetector = $__m.AbstractChangeDetector;
    }, function($__m) {
      ChangeDetectionUtil = $__m.ChangeDetectionUtil;
    }, function($__m) {
      RecordType = $__m.RecordType;
    }],
    execute: function() {
      ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
      UTIL = "ChangeDetectionUtil";
      DISPATCHER_ACCESSOR = "this.dispatcher";
      PIPE_REGISTRY_ACCESSOR = "this.pipeRegistry";
      PROTOS_ACCESSOR = "this.protos";
      DIRECTIVES_ACCESSOR = "this.directiveRecords";
      CONTEXT_ACCESSOR = "this.context";
      IS_CHANGED_LOCAL = "isChanged";
      CHANGES_LOCAL = "changes";
      LOCALS_ACCESSOR = "this.locals";
      MODE_ACCESSOR = "this.mode";
      CURRENT_PROTO = "currentProto";
      ALREADY_CHECKED_ACCESSOR = "this.alreadyChecked";
      ChangeDetectorJITGenerator = (function() {
        function ChangeDetectorJITGenerator(id, changeDetectionStrategy, records, directiveRecords) {
          this.id = id;
          this.changeDetectionStrategy = changeDetectionStrategy;
          this.records = records;
          this.directiveRecords = directiveRecords;
          this._localNames = this._getLocalNames(records);
          this._changeNames = this._getChangeNames(this._localNames);
          this._fieldNames = this._getFieldNames(this._localNames);
          this._pipeNames = this._getPipeNames(this._localNames);
        }
        return ($traceurRuntime.createClass)(ChangeDetectorJITGenerator, {
          _getLocalNames: function(records) {
            var index = 0;
            var names = records.map((function(r) {
              return _sanitizeName(("" + r.name + index++));
            }));
            return ["context"].concat(names);
          },
          _getChangeNames: function(_localNames) {
            return _localNames.map((function(n) {
              return ("change_" + n);
            }));
          },
          _getFieldNames: function(_localNames) {
            return _localNames.map((function(n) {
              return ("this." + n);
            }));
          },
          _getPipeNames: function(_localNames) {
            return _localNames.map((function(n) {
              return ("this." + n + "_pipe");
            }));
          },
          generate: function() {
            var $__0 = this;
            var typeName = _sanitizeName(("ChangeDetector_" + this.id));
            var classDefinition = ("\n      var " + typeName + " = function " + typeName + "(dispatcher, pipeRegistry, protos, directiveRecords) {\n        " + ABSTRACT_CHANGE_DETECTOR + ".call(this, " + JSON.stringify(this.id) + ");\n        " + DISPATCHER_ACCESSOR + " = dispatcher;\n        " + PIPE_REGISTRY_ACCESSOR + " = pipeRegistry;\n        " + PROTOS_ACCESSOR + " = protos;\n        " + DIRECTIVES_ACCESSOR + " = directiveRecords;\n        " + LOCALS_ACCESSOR + " = null;\n        " + ALREADY_CHECKED_ACCESSOR + " = false;\n        " + this._genFieldDefinitions() + "\n      }\n\n      " + typeName + ".prototype = Object.create(" + ABSTRACT_CHANGE_DETECTOR + ".prototype);\n\n      " + typeName + ".prototype.detectChangesInRecords = function(throwOnChange) {\n        if (!this.hydrated()) {\n          " + UTIL + ".throwDehydrated();\n        }\n        " + this._genLocalDefinitions() + "\n        " + this._genChangeDefinitions() + "\n        var " + IS_CHANGED_LOCAL + " = false;\n        var " + CURRENT_PROTO + ";\n        var " + CHANGES_LOCAL + " = null;\n\n        context = " + CONTEXT_ACCESSOR + ";\n\n        " + this.records.map((function(r) {
              return $__0._genRecord(r);
            })).join("\n") + "\n\n        " + ALREADY_CHECKED_ACCESSOR + " = true;\n      }\n\n      " + typeName + ".prototype.callOnAllChangesDone = function() {\n        " + this._genCallOnAllChangesDoneBody() + "\n      }\n\n      " + typeName + ".prototype.hydrate = function(context, locals, directives) {\n        " + MODE_ACCESSOR + " = \"" + ChangeDetectionUtil.changeDetectionMode(this.changeDetectionStrategy) + "\";\n        " + CONTEXT_ACCESSOR + " = context;\n        " + LOCALS_ACCESSOR + " = locals;\n        " + this._genHydrateDirectives() + "\n        " + this._genHydrateDetectors() + "\n        " + ALREADY_CHECKED_ACCESSOR + " = false;\n      }\n\n      " + typeName + ".prototype.dehydrate = function() {\n        " + this._genPipeOnDestroy() + "\n        " + this._genFieldDefinitions() + "\n        " + LOCALS_ACCESSOR + " = null;\n      }\n\n      " + typeName + ".prototype.hydrated = function() {\n        return " + CONTEXT_ACCESSOR + " !== null;\n      }\n\n      return function(dispatcher, pipeRegistry) {\n        return new " + typeName + "(dispatcher, pipeRegistry, protos, directiveRecords);\n      }\n    ");
            return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'protos', 'directiveRecords', classDefinition)(AbstractChangeDetector, ChangeDetectionUtil, this.records, this.directiveRecords);
          },
          _genGetDirectiveFieldNames: function() {
            var $__0 = this;
            return this.directiveRecords.map((function(d) {
              return $__0._genGetDirective(d.directiveIndex);
            }));
          },
          _genGetDetectorFieldNames: function() {
            var $__0 = this;
            return this.directiveRecords.filter((function(r) {
              return r.isOnPushChangeDetection();
            })).map((function(d) {
              return $__0._genGetDetector(d.directiveIndex);
            }));
          },
          _genGetDirective: function(d) {
            return ("this.directive_" + d.name);
          },
          _genGetDetector: function(d) {
            return ("this.detector_" + d.name);
          },
          _getNonNullPipeNames: function() {
            var $__0 = this;
            var pipes = [];
            this.records.forEach((function(r) {
              if (r.isPipeRecord()) {
                pipes.push($__0._pipeNames[r.selfIndex]);
              }
            }));
            return pipes;
          },
          _genFieldDefinitions: function() {
            var fields = [];
            fields = fields.concat(this._fieldNames);
            fields = fields.concat(this._getNonNullPipeNames());
            fields = fields.concat(this._genGetDirectiveFieldNames());
            fields = fields.concat(this._genGetDetectorFieldNames());
            return fields.map((function(n) {
              return n == CONTEXT_ACCESSOR ? (n + " = null;") : (n + " = " + UTIL + ".uninitialized();");
            })).join("\n");
          },
          _genHydrateDirectives: function() {
            var directiveFieldNames = this._genGetDirectiveFieldNames();
            var lines = ListWrapper.createFixedSize(directiveFieldNames.length);
            for (var i = 0,
                iLen = directiveFieldNames.length; i < iLen; ++i) {
              lines[i] = (directiveFieldNames[i] + " = directives.getDirectiveFor(" + DIRECTIVES_ACCESSOR + "[" + i + "].directiveIndex);");
            }
            return lines.join('\n');
          },
          _genHydrateDetectors: function() {
            var detectorFieldNames = this._genGetDetectorFieldNames();
            var lines = ListWrapper.createFixedSize(detectorFieldNames.length);
            for (var i = 0,
                iLen = detectorFieldNames.length; i < iLen; ++i) {
              lines[i] = (detectorFieldNames[i] + " =\n          directives.getDetectorFor(" + DIRECTIVES_ACCESSOR + "[" + i + "].directiveIndex);");
            }
            return lines.join('\n');
          },
          _genPipeOnDestroy: function() {
            return this._getNonNullPipeNames().map((function(p) {
              return (p + ".onDestroy();");
            })).join("\n");
          },
          _genCallOnAllChangesDoneBody: function() {
            var notifications = [];
            var dirs = this.directiveRecords;
            for (var i = dirs.length - 1; i >= 0; --i) {
              var dir = dirs[i];
              if (dir.callOnAllChangesDone) {
                notifications.push((this._genGetDirective(dir.directiveIndex) + ".onAllChangesDone();"));
              }
            }
            var directiveNotifications = notifications.join("\n");
            return ("\n      this.dispatcher.notifyOnAllChangesDone();\n      " + directiveNotifications + "\n    ");
          },
          _genLocalDefinitions: function() {
            return this._localNames.map((function(n) {
              return ("var " + n + ";");
            })).join("\n");
          },
          _genChangeDefinitions: function() {
            return this._changeNames.map((function(n) {
              return ("var " + n + " = false;");
            })).join("\n");
          },
          _genRecord: function(r) {
            var rec;
            if (r.isLifeCycleRecord()) {
              rec = this._genDirectiveLifecycle(r);
            } else if (r.isPipeRecord()) {
              rec = this._genPipeCheck(r);
            } else {
              rec = this._genReferenceCheck(r);
            }
            return ("" + rec + this._maybeGenLastInDirective(r));
          },
          _genDirectiveLifecycle: function(r) {
            if (r.name === "onCheck") {
              return this._genOnCheck(r);
            } else if (r.name === "onInit") {
              return this._genOnInit(r);
            } else if (r.name === "onChange") {
              return this._genOnChange(r);
            } else {
              throw new BaseException(("Unknown lifecycle event '" + r.name + "'"));
            }
          },
          _genPipeCheck: function(r) {
            var $__0 = this;
            var context = this._localNames[r.contextIndex];
            var argString = r.args.map((function(arg) {
              return $__0._localNames[arg];
            })).join(", ");
            var oldValue = this._fieldNames[r.selfIndex];
            var newValue = this._localNames[r.selfIndex];
            var change = this._changeNames[r.selfIndex];
            var pipe = this._pipeNames[r.selfIndex];
            var cdRef = "this.ref";
            var protoIndex = r.selfIndex - 1;
            var pipeType = r.name;
            return ("\n      " + CURRENT_PROTO + " = " + PROTOS_ACCESSOR + "[" + protoIndex + "];\n      if (" + pipe + " === " + UTIL + ".uninitialized()) {\n        " + pipe + " = " + PIPE_REGISTRY_ACCESSOR + ".get('" + pipeType + "', " + context + ", " + cdRef + ");\n      } else if (!" + pipe + ".supports(" + context + ")) {\n        " + pipe + ".onDestroy();\n        " + pipe + " = " + PIPE_REGISTRY_ACCESSOR + ".get('" + pipeType + "', " + context + ", " + cdRef + ");\n      }\n\n      " + newValue + " = " + pipe + ".transform(" + context + ", [" + argString + "]);\n      if (" + oldValue + " !== " + newValue + ") {\n        " + newValue + " = " + UTIL + ".unwrapValue(" + newValue + ");\n        " + change + " = true;\n        " + this._genUpdateDirectiveOrElement(r) + "\n        " + this._genAddToChanges(r) + "\n        " + oldValue + " = " + newValue + ";\n      }\n    ");
          },
          _genReferenceCheck: function(r) {
            var $__0 = this;
            var oldValue = this._fieldNames[r.selfIndex];
            var newValue = this._localNames[r.selfIndex];
            var protoIndex = r.selfIndex - 1;
            var check = ("\n      " + CURRENT_PROTO + " = " + PROTOS_ACCESSOR + "[" + protoIndex + "];\n      " + this._genUpdateCurrentValue(r) + "\n      if (" + newValue + " !== " + oldValue + ") {\n        " + this._changeNames[r.selfIndex] + " = true;\n        " + this._genUpdateDirectiveOrElement(r) + "\n        " + this._genAddToChanges(r) + "\n        " + oldValue + " = " + newValue + ";\n      }\n    ");
            if (r.isPureFunction()) {
              var condition = r.args.map((function(a) {
                return $__0._changeNames[a];
              })).join(" || ");
              return ("if (" + condition + ") { " + check + " } else { " + newValue + " = " + oldValue + "; }");
            } else {
              return check;
            }
          },
          _genUpdateCurrentValue: function(r) {
            var $__0 = this;
            var context = (r.contextIndex == -1) ? this._genGetDirective(r.directiveIndex) : this._localNames[r.contextIndex];
            var newValue = this._localNames[r.selfIndex];
            var argString = r.args.map((function(arg) {
              return $__0._localNames[arg];
            })).join(", ");
            var rhs;
            switch (r.mode) {
              case RecordType.SELF:
                rhs = context;
                break;
              case RecordType.CONST:
                rhs = JSON.stringify(r.funcOrValue);
                break;
              case RecordType.PROPERTY:
                rhs = (context + "." + r.name);
                break;
              case RecordType.SAFE_PROPERTY:
                rhs = (UTIL + ".isValueBlank(" + context + ") ? null : " + context + "." + r.name);
                break;
              case RecordType.LOCAL:
                rhs = (LOCALS_ACCESSOR + ".get('" + r.name + "')");
                break;
              case RecordType.INVOKE_METHOD:
                rhs = (context + "." + r.name + "(" + argString + ")");
                break;
              case RecordType.SAFE_INVOKE_METHOD:
                rhs = (UTIL + ".isValueBlank(" + context + ") ? null : " + context + "." + r.name + "(" + argString + ")");
                break;
              case RecordType.INVOKE_CLOSURE:
                rhs = (context + "(" + argString + ")");
                break;
              case RecordType.PRIMITIVE_OP:
                rhs = (UTIL + "." + r.name + "(" + argString + ")");
                break;
              case RecordType.INTERPOLATE:
                rhs = this._genInterpolation(r);
                break;
              case RecordType.KEYED_ACCESS:
                rhs = (context + "[" + this._localNames[r.args[0]] + "]");
                break;
              default:
                throw new BaseException(("Unknown operation " + r.mode));
            }
            return (newValue + " = " + rhs);
          },
          _genInterpolation: function(r) {
            var res = "";
            for (var i = 0; i < r.args.length; ++i) {
              res += JSON.stringify(r.fixedArgs[i]);
              res += " + ";
              res += this._localNames[r.args[i]];
              res += " + ";
            }
            res += JSON.stringify(r.fixedArgs[r.args.length]);
            return res;
          },
          _genUpdateDirectiveOrElement: function(r) {
            if (!r.lastInBinding)
              return "";
            var newValue = this._localNames[r.selfIndex];
            var oldValue = this._fieldNames[r.selfIndex];
            var br = r.bindingRecord;
            if (br.isDirective()) {
              var directiveProperty = (this._genGetDirective(br.directiveRecord.directiveIndex) + "." + br.propertyName);
              return ("\n        " + this._genThrowOnChangeCheck(oldValue, newValue) + "\n        " + directiveProperty + " = " + newValue + ";\n        " + IS_CHANGED_LOCAL + " = true;\n      ");
            } else {
              return ("\n        " + this._genThrowOnChangeCheck(oldValue, newValue) + "\n        " + DISPATCHER_ACCESSOR + ".notifyOnBinding(" + CURRENT_PROTO + ".bindingRecord, " + newValue + ");\n      ");
            }
          },
          _genThrowOnChangeCheck: function(oldValue, newValue) {
            return ("\n      if(throwOnChange) {\n        " + UTIL + ".throwOnChange(" + CURRENT_PROTO + ", " + UTIL + ".simpleChange(" + oldValue + ", " + newValue + "));\n      }\n      ");
          },
          _genAddToChanges: function(r) {
            var newValue = this._localNames[r.selfIndex];
            var oldValue = this._fieldNames[r.selfIndex];
            if (!r.bindingRecord.callOnChange())
              return "";
            return ("\n      " + CHANGES_LOCAL + " = " + UTIL + ".addChange(\n          " + CHANGES_LOCAL + ", " + CURRENT_PROTO + ".bindingRecord.propertyName,\n          " + UTIL + ".simpleChange(" + oldValue + ", " + newValue + "));\n    ");
          },
          _maybeGenLastInDirective: function(r) {
            if (!r.lastInDirective)
              return "";
            return ("\n      " + CHANGES_LOCAL + " = null;\n      " + this._genNotifyOnPushDetectors(r) + "\n      " + IS_CHANGED_LOCAL + " = false;\n    ");
          },
          _genOnCheck: function(r) {
            var br = r.bindingRecord;
            return ("if (!throwOnChange) " + this._genGetDirective(br.directiveRecord.directiveIndex) + ".onCheck();");
          },
          _genOnInit: function(r) {
            var br = r.bindingRecord;
            return ("if (!throwOnChange && !" + ALREADY_CHECKED_ACCESSOR + ") " + this._genGetDirective(br.directiveRecord.directiveIndex) + ".onInit();");
          },
          _genOnChange: function(r) {
            var br = r.bindingRecord;
            return ("if (!throwOnChange && " + CHANGES_LOCAL + ") " + this._genGetDirective(br.directiveRecord.directiveIndex) + ".onChange(" + CHANGES_LOCAL + ");");
          },
          _genNotifyOnPushDetectors: function(r) {
            var br = r.bindingRecord;
            if (!r.lastInDirective || !br.isOnPushChangeDetection())
              return "";
            var retVal = ("\n      if(" + IS_CHANGED_LOCAL + ") {\n        " + this._genGetDetector(br.directiveRecord.directiveIndex) + ".markAsCheckOnce();\n      }\n    ");
            return retVal;
          }
        }, {});
      }());
      $__export("ChangeDetectorJITGenerator", ChangeDetectorJITGenerator);
    }
  };
});

System.register("angular2/src/change_detection/pregen_proto_change_detector", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pregen_proto_change_detector";
  var BaseException,
      PregenProtoChangeDetector;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      $__export("PregenProtoChangeDetectorFactory", Function);
      PregenProtoChangeDetector = (function() {
        function PregenProtoChangeDetector() {}
        return ($traceurRuntime.createClass)(PregenProtoChangeDetector, {instantiate: function(dispatcher) {
            throw new BaseException('Pregen change detection not supported in Js');
          }}, {isSupported: function() {
            return false;
          }});
      }());
      $__export("PregenProtoChangeDetector", PregenProtoChangeDetector);
    }
  };
});

System.register("angular2/src/change_detection/pipes/iterable_changes", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/iterable_changes";
  var __decorate,
      __metadata,
      CONST,
      isListLikeIterable,
      iterateListLike,
      MapWrapper,
      isBlank,
      isPresent,
      stringify,
      getMapKey,
      looseIdentical,
      isArray,
      WrappedValue,
      BasePipe,
      IterableChangesFactory,
      IterableChanges,
      CollectionChangeRecord,
      _DuplicateItemRecordList,
      _DuplicateMap;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      stringify = $__m.stringify;
      getMapKey = $__m.getMapKey;
      looseIdentical = $__m.looseIdentical;
      isArray = $__m.isArray;
    }, function($__m) {
      isListLikeIterable = $__m.isListLikeIterable;
      iterateListLike = $__m.iterateListLike;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
      BasePipe = $__m.BasePipe;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      IterableChangesFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obj) {
          return IterableChanges.supportsObj(obj);
        },
        create: function(cdRef) {
          return new IterableChanges();
        }
      }, {}));
      $__export("IterableChangesFactory", IterableChangesFactory);
      $__export("IterableChangesFactory", IterableChangesFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], IterableChangesFactory));
      IterableChanges = (function($__super) {
        function IterableChanges() {
          $traceurRuntime.superConstructor(IterableChanges).call(this);
          this._collection = null;
          this._length = null;
          this._linkedRecords = null;
          this._unlinkedRecords = null;
          this._previousItHead = null;
          this._itHead = null;
          this._itTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._movesHead = null;
          this._movesTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        }
        return ($traceurRuntime.createClass)(IterableChanges, {
          supports: function(obj) {
            return IterableChanges.supportsObj(obj);
          },
          get collection() {
            return this._collection;
          },
          get length() {
            return this._length;
          },
          forEachItem: function(fn) {
            var record;
            for (record = this._itHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            var record;
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachMovedItem: function(fn) {
            var record;
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          transform: function(collection) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (this.check(collection)) {
              return WrappedValue.wrap(this);
            } else {
              return null;
            }
          },
          check: function(collection) {
            var $__0 = this;
            this._reset();
            var record = this._itHead;
            var mayBeDirty = false;
            var index;
            var item;
            if (isArray(collection)) {
              var list = collection;
              this._length = collection.length;
              for (index = 0; index < this._length; index++) {
                item = list[index];
                if (record === null || !looseIdentical(record.item, item)) {
                  record = this._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = this._verifyReinsertion(record, item, index);
                }
                record = record._next;
              }
            } else {
              index = 0;
              iterateListLike(collection, (function(item) {
                if (record === null || !looseIdentical(record.item, item)) {
                  record = $__0._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = $__0._verifyReinsertion(record, item, index);
                }
                record = record._next;
                index++;
              }));
              this._length = index;
            }
            this._truncate(record);
            this._collection = collection;
            return this.isDirty;
          },
          get isDirty() {
            return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null;
          },
          _reset: function() {
            if (this.isDirty) {
              var record;
              var nextRecord;
              for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
              }
              for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
              }
              this._additionsHead = this._additionsTail = null;
              for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
              }
              this._movesHead = this._movesTail = null;
              this._removalsHead = this._removalsTail = null;
            }
          },
          _mismatch: function(record, item, index) {
            var previousRecord;
            if (record === null) {
              previousRecord = this._itTail;
            } else {
              previousRecord = record._prev;
              this._remove(record);
            }
            record = this._linkedRecords === null ? null : this._linkedRecords.get(item, index);
            if (record !== null) {
              this._moveAfter(record, previousRecord, index);
            } else {
              record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
              if (record !== null) {
                this._reinsertAfter(record, previousRecord, index);
              } else {
                record = this._addAfter(new CollectionChangeRecord(item), previousRecord, index);
              }
            }
            return record;
          },
          _verifyReinsertion: function(record, item, index) {
            var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
            if (reinsertRecord !== null) {
              record = this._reinsertAfter(reinsertRecord, record._prev, index);
            } else if (record.currentIndex != index) {
              record.currentIndex = index;
              this._addToMoves(record, index);
            }
            return record;
          },
          _truncate: function(record) {
            while (record !== null) {
              var nextRecord = record._next;
              this._addToRemovals(this._unlink(record));
              record = nextRecord;
            }
            if (this._unlinkedRecords !== null) {
              this._unlinkedRecords.clear();
            }
            if (this._additionsTail !== null) {
              this._additionsTail._nextAdded = null;
            }
            if (this._movesTail !== null) {
              this._movesTail._nextMoved = null;
            }
            if (this._itTail !== null) {
              this._itTail._next = null;
            }
            if (this._removalsTail !== null) {
              this._removalsTail._nextRemoved = null;
            }
          },
          _reinsertAfter: function(record, prevRecord, index) {
            if (this._unlinkedRecords !== null) {
              this._unlinkedRecords.remove(record);
            }
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
              this._removalsHead = next;
            } else {
              prev._nextRemoved = next;
            }
            if (next === null) {
              this._removalsTail = prev;
            } else {
              next._prevRemoved = prev;
            }
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
          },
          _moveAfter: function(record, prevRecord, index) {
            this._unlink(record);
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
          },
          _addAfter: function(record, prevRecord, index) {
            this._insertAfter(record, prevRecord, index);
            if (this._additionsTail === null) {
              this._additionsTail = this._additionsHead = record;
            } else {
              this._additionsTail = this._additionsTail._nextAdded = record;
            }
            return record;
          },
          _insertAfter: function(record, prevRecord, index) {
            var next = prevRecord === null ? this._itHead : prevRecord._next;
            record._next = next;
            record._prev = prevRecord;
            if (next === null) {
              this._itTail = record;
            } else {
              next._prev = record;
            }
            if (prevRecord === null) {
              this._itHead = record;
            } else {
              prevRecord._next = record;
            }
            if (this._linkedRecords === null) {
              this._linkedRecords = new _DuplicateMap();
            }
            this._linkedRecords.put(record);
            record.currentIndex = index;
            return record;
          },
          _remove: function(record) {
            return this._addToRemovals(this._unlink(record));
          },
          _unlink: function(record) {
            if (this._linkedRecords !== null) {
              this._linkedRecords.remove(record);
            }
            var prev = record._prev;
            var next = record._next;
            if (prev === null) {
              this._itHead = next;
            } else {
              prev._next = next;
            }
            if (next === null) {
              this._itTail = prev;
            } else {
              next._prev = prev;
            }
            return record;
          },
          _addToMoves: function(record, toIndex) {
            if (record.previousIndex === toIndex) {
              return record;
            }
            if (this._movesTail === null) {
              this._movesTail = this._movesHead = record;
            } else {
              this._movesTail = this._movesTail._nextMoved = record;
            }
            return record;
          },
          _addToRemovals: function(record) {
            if (this._unlinkedRecords === null) {
              this._unlinkedRecords = new _DuplicateMap();
            }
            this._unlinkedRecords.put(record);
            record.currentIndex = null;
            record._nextRemoved = null;
            if (this._removalsTail === null) {
              this._removalsTail = this._removalsHead = record;
              record._prevRemoved = null;
            } else {
              record._prevRemoved = this._removalsTail;
              this._removalsTail = this._removalsTail._nextRemoved = record;
            }
            return record;
          },
          toString: function() {
            var record;
            var list = [];
            for (record = this._itHead; record !== null; record = record._next) {
              list.push(record);
            }
            var previous = [];
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              previous.push(record);
            }
            var additions = [];
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              additions.push(record);
            }
            var moves = [];
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              moves.push(record);
            }
            var removals = [];
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              removals.push(record);
            }
            return "collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n";
          }
        }, {supportsObj: function(obj) {
            return isListLikeIterable(obj);
          }}, $__super);
      }(BasePipe));
      $__export("IterableChanges", IterableChanges);
      CollectionChangeRecord = (function() {
        function CollectionChangeRecord(item) {
          this.item = item;
          this.currentIndex = null;
          this.previousIndex = null;
          this._nextPrevious = null;
          this._prev = null;
          this._next = null;
          this._prevDup = null;
          this._nextDup = null;
          this._prevRemoved = null;
          this._nextRemoved = null;
          this._nextAdded = null;
          this._nextMoved = null;
        }
        return ($traceurRuntime.createClass)(CollectionChangeRecord, {toString: function() {
            return this.previousIndex === this.currentIndex ? stringify(this.item) : stringify(this.item) + '[' + stringify(this.previousIndex) + '->' + stringify(this.currentIndex) + ']';
          }}, {});
      }());
      $__export("CollectionChangeRecord", CollectionChangeRecord);
      _DuplicateItemRecordList = (function() {
        function _DuplicateItemRecordList() {
          this._head = null;
          this._tail = null;
        }
        return ($traceurRuntime.createClass)(_DuplicateItemRecordList, {
          add: function(record) {
            if (this._head === null) {
              this._head = this._tail = record;
              record._nextDup = null;
              record._prevDup = null;
            } else {
              this._tail._nextDup = record;
              record._prevDup = this._tail;
              record._nextDup = null;
              this._tail = record;
            }
          },
          get: function(item, afterIndex) {
            var record;
            for (record = this._head; record !== null; record = record._nextDup) {
              if ((afterIndex === null || afterIndex < record.currentIndex) && looseIdentical(record.item, item)) {
                return record;
              }
            }
            return null;
          },
          remove: function(record) {
            var prev = record._prevDup;
            var next = record._nextDup;
            if (prev === null) {
              this._head = next;
            } else {
              prev._nextDup = next;
            }
            if (next === null) {
              this._tail = prev;
            } else {
              next._prevDup = prev;
            }
            return this._head === null;
          }
        }, {});
      }());
      _DuplicateMap = (function() {
        function _DuplicateMap() {
          this.map = new Map();
        }
        return ($traceurRuntime.createClass)(_DuplicateMap, {
          put: function(record) {
            var key = getMapKey(record.item);
            var duplicates = this.map.get(key);
            if (!isPresent(duplicates)) {
              duplicates = new _DuplicateItemRecordList();
              this.map.set(key, duplicates);
            }
            duplicates.add(record);
          },
          get: function(value) {
            var afterIndex = arguments[1] !== (void 0) ? arguments[1] : null;
            var key = getMapKey(value);
            var recordList = this.map.get(key);
            return isBlank(recordList) ? null : recordList.get(value, afterIndex);
          },
          remove: function(record) {
            var key = getMapKey(record.item);
            var recordList = this.map.get(key);
            if (recordList.remove(record)) {
              MapWrapper.delete(this.map, key);
            }
            return record;
          },
          get isEmpty() {
            return MapWrapper.size(this.map) === 0;
          },
          clear: function() {
            this.map.clear();
          },
          toString: function() {
            return '_DuplicateMap(' + stringify(this.map) + ')';
          }
        }, {});
      }());
    }
  };
});

System.register("angular2/src/change_detection/pipes/keyvalue_changes", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/keyvalue_changes";
  var __decorate,
      __metadata,
      MapWrapper,
      StringMapWrapper,
      stringify,
      looseIdentical,
      isJsObject,
      CONST,
      WrappedValue,
      BasePipe,
      KeyValueChangesFactory,
      KeyValueChanges,
      KVChangeRecord;
  return {
    setters: [function($__m) {
      MapWrapper = $__m.MapWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      stringify = $__m.stringify;
      looseIdentical = $__m.looseIdentical;
      isJsObject = $__m.isJsObject;
      CONST = $__m.CONST;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
      BasePipe = $__m.BasePipe;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      KeyValueChangesFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obj) {
          return KeyValueChanges.supportsObj(obj);
        },
        create: function(cdRef) {
          return new KeyValueChanges();
        }
      }, {}));
      $__export("KeyValueChangesFactory", KeyValueChangesFactory);
      $__export("KeyValueChangesFactory", KeyValueChangesFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], KeyValueChangesFactory));
      KeyValueChanges = (function($__super) {
        function KeyValueChanges() {
          var $__4;
          for (var args = [],
              $__3 = 0; $__3 < arguments.length; $__3++)
            args[$__3] = arguments[$__3];
          ($__4 = $traceurRuntime.superConstructor(KeyValueChanges)).call.apply($__4, $traceurRuntime.spread([this], args));
          this._records = new Map();
          this._mapHead = null;
          this._previousMapHead = null;
          this._changesHead = null;
          this._changesTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        }
        return ($traceurRuntime.createClass)(KeyValueChanges, {
          supports: function(obj) {
            return KeyValueChanges.supportsObj(obj);
          },
          transform: function(map) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (this.check(map)) {
              return WrappedValue.wrap(this);
            } else {
              return null;
            }
          },
          get isDirty() {
            return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
          },
          forEachItem: function(fn) {
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            var record;
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachChangedItem: function(fn) {
            var record;
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          check: function(map) {
            var $__0 = this;
            this._reset();
            var records = this._records;
            var oldSeqRecord = this._mapHead;
            var lastOldSeqRecord = null;
            var lastNewSeqRecord = null;
            var seqChanged = false;
            this._forEach(map, (function(value, key) {
              var newSeqRecord;
              if (oldSeqRecord !== null && key === oldSeqRecord.key) {
                newSeqRecord = oldSeqRecord;
                if (!looseIdentical(value, oldSeqRecord.currentValue)) {
                  oldSeqRecord.previousValue = oldSeqRecord.currentValue;
                  oldSeqRecord.currentValue = value;
                  $__0._addToChanges(oldSeqRecord);
                }
              } else {
                seqChanged = true;
                if (oldSeqRecord !== null) {
                  oldSeqRecord._next = null;
                  $__0._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                  $__0._addToRemovals(oldSeqRecord);
                }
                if (records.has(key)) {
                  newSeqRecord = records.get(key);
                } else {
                  newSeqRecord = new KVChangeRecord(key);
                  records.set(key, newSeqRecord);
                  newSeqRecord.currentValue = value;
                  $__0._addToAdditions(newSeqRecord);
                }
              }
              if (seqChanged) {
                if ($__0._isInRemovals(newSeqRecord)) {
                  $__0._removeFromRemovals(newSeqRecord);
                }
                if (lastNewSeqRecord == null) {
                  $__0._mapHead = newSeqRecord;
                } else {
                  lastNewSeqRecord._next = newSeqRecord;
                }
              }
              lastOldSeqRecord = oldSeqRecord;
              lastNewSeqRecord = newSeqRecord;
              oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
            }));
            this._truncate(lastOldSeqRecord, oldSeqRecord);
            return this.isDirty;
          },
          _reset: function() {
            if (this.isDirty) {
              var record;
              for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
              }
              for (record = this._changesHead; record !== null; record = record._nextChanged) {
                record.previousValue = record.currentValue;
              }
              for (record = this._additionsHead; record != null; record = record._nextAdded) {
                record.previousValue = record.currentValue;
              }
              this._changesHead = this._changesTail = null;
              this._additionsHead = this._additionsTail = null;
              this._removalsHead = this._removalsTail = null;
            }
          },
          _truncate: function(lastRecord, record) {
            while (record !== null) {
              if (lastRecord === null) {
                this._mapHead = null;
              } else {
                lastRecord._next = null;
              }
              var nextRecord = record._next;
              this._addToRemovals(record);
              lastRecord = record;
              record = nextRecord;
            }
            for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
              rec.previousValue = rec.currentValue;
              rec.currentValue = null;
              MapWrapper.delete(this._records, rec.key);
            }
          },
          _isInRemovals: function(record) {
            return record === this._removalsHead || record._nextRemoved !== null || record._prevRemoved !== null;
          },
          _addToRemovals: function(record) {
            if (this._removalsHead === null) {
              this._removalsHead = this._removalsTail = record;
            } else {
              this._removalsTail._nextRemoved = record;
              record._prevRemoved = this._removalsTail;
              this._removalsTail = record;
            }
          },
          _removeFromSeq: function(prev, record) {
            var next = record._next;
            if (prev === null) {
              this._mapHead = next;
            } else {
              prev._next = next;
            }
          },
          _removeFromRemovals: function(record) {
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
              this._removalsHead = next;
            } else {
              prev._nextRemoved = next;
            }
            if (next === null) {
              this._removalsTail = prev;
            } else {
              next._prevRemoved = prev;
            }
            record._prevRemoved = record._nextRemoved = null;
          },
          _addToAdditions: function(record) {
            if (this._additionsHead === null) {
              this._additionsHead = this._additionsTail = record;
            } else {
              this._additionsTail._nextAdded = record;
              this._additionsTail = record;
            }
          },
          _addToChanges: function(record) {
            if (this._changesHead === null) {
              this._changesHead = this._changesTail = record;
            } else {
              this._changesTail._nextChanged = record;
              this._changesTail = record;
            }
          },
          toString: function() {
            var items = [];
            var previous = [];
            var changes = [];
            var additions = [];
            var removals = [];
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              items.push(stringify(record));
            }
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              previous.push(stringify(record));
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              changes.push(stringify(record));
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              additions.push(stringify(record));
            }
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              removals.push(stringify(record));
            }
            return "map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n";
          },
          _forEach: function(obj, fn) {
            if (obj instanceof Map) {
              MapWrapper.forEach(obj, fn);
            } else {
              StringMapWrapper.forEach(obj, fn);
            }
          }
        }, {supportsObj: function(obj) {
            return obj instanceof Map || isJsObject(obj);
          }}, $__super);
      }(BasePipe));
      $__export("KeyValueChanges", KeyValueChanges);
      KVChangeRecord = (function() {
        function KVChangeRecord(key) {
          this.key = key;
          this.previousValue = null;
          this.currentValue = null;
          this._nextPrevious = null;
          this._next = null;
          this._nextAdded = null;
          this._nextRemoved = null;
          this._prevRemoved = null;
          this._nextChanged = null;
        }
        return ($traceurRuntime.createClass)(KVChangeRecord, {toString: function() {
            return looseIdentical(this.previousValue, this.currentValue) ? stringify(this.key) : (stringify(this.key) + '[' + stringify(this.previousValue) + '->' + stringify(this.currentValue) + ']');
          }}, {});
      }());
      $__export("KVChangeRecord", KVChangeRecord);
    }
  };
});

System.register("angular2/src/change_detection/pipes/promise_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/promise_pipe";
  var __decorate,
      __metadata,
      isBlank,
      isPresent,
      isPromise,
      CONST,
      WrappedValue,
      PromisePipe,
      PromisePipeFactory;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      isPromise = $__m.isPromise;
      CONST = $__m.CONST;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      PromisePipe = (function() {
        function PromisePipe(_ref) {
          this._ref = _ref;
          this._latestValue = null;
          this._latestReturnedValue = null;
        }
        return ($traceurRuntime.createClass)(PromisePipe, {
          supports: function(promise) {
            return isPromise(promise);
          },
          onDestroy: function() {
            if (isPresent(this._sourcePromise)) {
              this._latestValue = null;
              this._latestReturnedValue = null;
              this._sourcePromise = null;
            }
          },
          transform: function(promise) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            var $__0 = this;
            if (isBlank(this._sourcePromise)) {
              this._sourcePromise = promise;
              promise.then((function(val) {
                if ($__0._sourcePromise === promise) {
                  $__0._updateLatestValue(val);
                }
              }));
              return null;
            }
            if (promise !== this._sourcePromise) {
              this._sourcePromise = null;
              return this.transform(promise);
            }
            if (this._latestValue === this._latestReturnedValue) {
              return this._latestReturnedValue;
            } else {
              this._latestReturnedValue = this._latestValue;
              return WrappedValue.wrap(this._latestValue);
            }
          },
          _updateLatestValue: function(value) {
            this._latestValue = value;
            this._ref.requestCheck();
          }
        }, {});
      }());
      $__export("PromisePipe", PromisePipe);
      PromisePipeFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(promise) {
          return isPromise(promise);
        },
        create: function(cdRef) {
          return new PromisePipe(cdRef);
        }
      }, {}));
      $__export("PromisePipeFactory", PromisePipeFactory);
      $__export("PromisePipeFactory", PromisePipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], PromisePipeFactory));
    }
  };
});

System.register("angular2/src/change_detection/pipes/uppercase_pipe", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/uppercase_pipe";
  var __decorate,
      __metadata,
      isString,
      StringWrapper,
      CONST,
      UpperCasePipe,
      UpperCaseFactory;
  return {
    setters: [function($__m) {
      isString = $__m.isString;
      StringWrapper = $__m.StringWrapper;
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      UpperCasePipe = (function() {
        function UpperCasePipe() {
          this._latestValue = null;
        }
        return ($traceurRuntime.createClass)(UpperCasePipe, {
          supports: function(str) {
            return isString(str);
          },
          onDestroy: function() {
            this._latestValue = null;
          },
          transform: function(value) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (this._latestValue !== value) {
              this._latestValue = value;
              return StringWrapper.toUpperCase(value);
            } else {
              return this._latestValue;
            }
          }
        }, {});
      }());
      $__export("UpperCasePipe", UpperCasePipe);
      UpperCaseFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(str) {
          return isString(str);
        },
        create: function(cdRef) {
          return new UpperCasePipe();
        }
      }, {}));
      $__export("UpperCaseFactory", UpperCaseFactory);
      $__export("UpperCaseFactory", UpperCaseFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], UpperCaseFactory));
    }
  };
});

System.register("angular2/src/change_detection/pipes/lowercase_pipe", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/lowercase_pipe";
  var __decorate,
      __metadata,
      isString,
      StringWrapper,
      CONST,
      LowerCasePipe,
      LowerCaseFactory;
  return {
    setters: [function($__m) {
      isString = $__m.isString;
      StringWrapper = $__m.StringWrapper;
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      LowerCasePipe = (function() {
        function LowerCasePipe() {
          this._latestValue = null;
        }
        return ($traceurRuntime.createClass)(LowerCasePipe, {
          supports: function(str) {
            return isString(str);
          },
          onDestroy: function() {
            this._latestValue = null;
          },
          transform: function(value) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (this._latestValue !== value) {
              this._latestValue = value;
              return StringWrapper.toLowerCase(value);
            } else {
              return this._latestValue;
            }
          }
        }, {});
      }());
      $__export("LowerCasePipe", LowerCasePipe);
      LowerCaseFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(str) {
          return isString(str);
        },
        create: function(cdRef) {
          return new LowerCasePipe();
        }
      }, {}));
      $__export("LowerCaseFactory", LowerCaseFactory);
      $__export("LowerCaseFactory", LowerCaseFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], LowerCaseFactory));
    }
  };
});

System.register("angular2/src/change_detection/pipes/json_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/json_pipe";
  var __decorate,
      __metadata,
      Json,
      CONST,
      BasePipe,
      JsonPipe;
  return {
    setters: [function($__m) {
      Json = $__m.Json;
      CONST = $__m.CONST;
    }, function($__m) {
      BasePipe = $__m.BasePipe;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      JsonPipe = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)($__0, {
          transform: function(value) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            return Json.stringify(value);
          },
          create: function(cdRef) {
            return this;
          }
        }, {}, $__super);
      }(BasePipe));
      $__export("JsonPipe", JsonPipe);
      $__export("JsonPipe", JsonPipe = __decorate([CONST(), __metadata('design:paramtypes', [])], JsonPipe));
    }
  };
});

System.register("angular2/src/facade/math", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/math";
  var global,
      Math,
      NaN;
  return {
    setters: [function($__m) {
      global = $__m.global;
    }],
    execute: function() {
      Math = global.Math;
      $__export("Math", Math);
      NaN = typeof NaN;
      $__export("NaN", NaN);
    }
  };
});

System.register("angular2/src/di/forward_ref", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/forward_ref";
  var stringify,
      isFunction;
  function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    forwardRefFn.toString = function() {
      return stringify(this());
    };
    return forwardRefFn;
  }
  function resolveForwardRef(type) {
    if (isFunction(type) && type.hasOwnProperty('__forward_ref__') && type.__forward_ref__ === forwardRef) {
      return type();
    } else {
      return type;
    }
  }
  $__export("forwardRef", forwardRef);
  $__export("resolveForwardRef", resolveForwardRef);
  return {
    setters: [function($__m) {
      stringify = $__m.stringify;
      isFunction = $__m.isFunction;
    }],
    execute: function() {
    }
  };
});

System.register("angular2/src/di/type_literal", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/type_literal";
  var TypeLiteral;
  return {
    setters: [],
    execute: function() {
      TypeLiteral = (function() {
        function TypeLiteral() {}
        return ($traceurRuntime.createClass)(TypeLiteral, {get type() {
            throw new Error("Type literals are only supported in Dart");
          }}, {});
      }());
      $__export("TypeLiteral", TypeLiteral);
    }
  };
});

System.register("angular2/src/di/exceptions", ["angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/exceptions";
  var ListWrapper,
      stringify,
      BaseException,
      isBlank,
      AbstractBindingError,
      NoBindingError,
      AsyncBindingError,
      CyclicDependencyError,
      InstantiationError,
      InvalidBindingError,
      NoAnnotationError,
      OutOfBoundsError;
  function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
      if (ListWrapper.contains(res, keys[i])) {
        res.push(keys[i]);
        return res;
      } else {
        res.push(keys[i]);
      }
    }
    return res;
  }
  function constructResolvingPath(keys) {
    if (keys.length > 1) {
      var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
      var tokenStrs = ListWrapper.map(reversed, (function(k) {
        return stringify(k.token);
      }));
      return " (" + tokenStrs.join(' -> ') + ")";
    } else {
      return "";
    }
  }
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      stringify = $__m.stringify;
      BaseException = $__m.BaseException;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      AbstractBindingError = (function($__super) {
        function AbstractBindingError(key, constructResolvingMessage, originalException, originalStack) {
          $traceurRuntime.superConstructor(AbstractBindingError).call(this, null, originalException, originalStack);
          this.keys = [key];
          this.constructResolvingMessage = constructResolvingMessage;
          this.message = this.constructResolvingMessage(this.keys);
        }
        return ($traceurRuntime.createClass)(AbstractBindingError, {
          addKey: function(key) {
            this.keys.push(key);
            this.message = this.constructResolvingMessage(this.keys);
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(BaseException));
      $__export("AbstractBindingError", AbstractBindingError);
      NoBindingError = (function($__super) {
        function NoBindingError(key) {
          $traceurRuntime.superConstructor(NoBindingError).call(this, key, function(keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return ("No provider for " + first + "!" + constructResolvingPath(keys));
          });
        }
        return ($traceurRuntime.createClass)(NoBindingError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("NoBindingError", NoBindingError);
      AsyncBindingError = (function($__super) {
        function AsyncBindingError(key) {
          $traceurRuntime.superConstructor(AsyncBindingError).call(this, key, function(keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return ("Cannot instantiate " + first + " synchronously. It is provided as a promise!" + constructResolvingPath(keys));
          });
        }
        return ($traceurRuntime.createClass)(AsyncBindingError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("AsyncBindingError", AsyncBindingError);
      CyclicDependencyError = (function($__super) {
        function CyclicDependencyError(key) {
          $traceurRuntime.superConstructor(CyclicDependencyError).call(this, key, function(keys) {
            return ("Cannot instantiate cyclic dependency!" + constructResolvingPath(keys));
          });
        }
        return ($traceurRuntime.createClass)(CyclicDependencyError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("CyclicDependencyError", CyclicDependencyError);
      InstantiationError = (function($__super) {
        function InstantiationError(originalException, originalStack, key) {
          $traceurRuntime.superConstructor(InstantiationError).call(this, key, function(keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return ("Error during instantiation of " + first + "!" + constructResolvingPath(keys) + ".") + (" ORIGINAL ERROR: " + originalException) + ("\n\n ORIGINAL STACK: " + originalStack);
          }, originalException, originalStack);
          this.causeKey = key;
        }
        return ($traceurRuntime.createClass)(InstantiationError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("InstantiationError", InstantiationError);
      InvalidBindingError = (function($__super) {
        function InvalidBindingError(binding) {
          $traceurRuntime.superConstructor(InvalidBindingError).call(this);
          this.message = "Invalid binding - only instances of Binding and Type are allowed, got: " + binding.toString();
        }
        return ($traceurRuntime.createClass)(InvalidBindingError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("InvalidBindingError", InvalidBindingError);
      NoAnnotationError = (function($__super) {
        function NoAnnotationError(typeOrFunc, params) {
          $traceurRuntime.superConstructor(NoAnnotationError).call(this);
          var signature = [];
          for (var i = 0,
              ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (isBlank(parameter) || parameter.length == 0) {
              signature.push('?');
            } else {
              signature.push(ListWrapper.map(parameter, stringify).join(' '));
            }
          }
          this.message = "Cannot resolve all parameters for " + stringify(typeOrFunc) + "(" + signature.join(', ') + "). " + 'Make sure they all have valid type or annotations.';
        }
        return ($traceurRuntime.createClass)(NoAnnotationError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("NoAnnotationError", NoAnnotationError);
      OutOfBoundsError = (function($__super) {
        function OutOfBoundsError(index) {
          $traceurRuntime.superConstructor(OutOfBoundsError).call(this);
          this.message = ("Index " + index + " is out-of-bounds.");
        }
        return ($traceurRuntime.createClass)(OutOfBoundsError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("OutOfBoundsError", OutOfBoundsError);
    }
  };
});

System.register("angular2/src/di/opaque_token", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/opaque_token";
  var __decorate,
      __metadata,
      CONST,
      OpaqueToken;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      OpaqueToken = (($traceurRuntime.createClass)(function(desc) {
        this._desc = 'Token(' + desc + ')';
      }, {toString: function() {
          return this._desc;
        }}, {}));
      $__export("OpaqueToken", OpaqueToken);
      $__export("OpaqueToken", OpaqueToken = __decorate([CONST(), __metadata('design:paramtypes', [String])], OpaqueToken));
    }
  };
});

System.register("angular2/src/core/annotations_impl/view", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/view";
  var __decorate,
      __metadata,
      CONST,
      View;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      View = (($traceurRuntime.createClass)(function() {
        var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
            templateUrl = $__2.templateUrl,
            template = $__2.template,
            directives = $__2.directives,
            renderer = $__2.renderer,
            styles = $__2.styles,
            styleUrls = $__2.styleUrls;
        this.templateUrl = templateUrl;
        this.template = template;
        this.styleUrls = styleUrls;
        this.styles = styles;
        this.directives = directives;
        this.renderer = renderer;
      }, {}, {}));
      $__export("View", View);
      $__export("View", View = __decorate([CONST(), __metadata('design:paramtypes', [Object])], View));
    }
  };
});

System.register("angular2/src/dom/dom_adapter", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/dom/dom_adapter";
  var BaseException,
      isBlank,
      DOM,
      DomAdapter;
  function setRootDomAdapter(adapter) {
    if (isBlank(DOM)) {
      $__export("DOM", DOM = adapter);
    }
  }
  function _abstract() {
    return new BaseException('This method is abstract');
  }
  $__export("setRootDomAdapter", setRootDomAdapter);
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      $__export("DOM", DOM);
      DomAdapter = (function() {
        function DomAdapter() {}
        return ($traceurRuntime.createClass)(DomAdapter, {
          hasProperty: function(element, name) {
            throw _abstract();
          },
          setProperty: function(el, name, value) {
            throw _abstract();
          },
          getProperty: function(el, name) {
            throw _abstract();
          },
          invoke: function(el, methodName, args) {
            throw _abstract();
          },
          logError: function(error) {
            throw _abstract();
          },
          get attrToPropMap() {
            throw _abstract();
          },
          parse: function(templateHtml) {
            throw _abstract();
          },
          query: function(selector) {
            throw _abstract();
          },
          querySelector: function(el, selector) {
            throw _abstract();
          },
          querySelectorAll: function(el, selector) {
            throw _abstract();
          },
          on: function(el, evt, listener) {
            throw _abstract();
          },
          onAndCancel: function(el, evt, listener) {
            throw _abstract();
          },
          dispatchEvent: function(el, evt) {
            throw _abstract();
          },
          createMouseEvent: function(eventType) {
            throw _abstract();
          },
          createEvent: function(eventType) {
            throw _abstract();
          },
          preventDefault: function(evt) {
            throw _abstract();
          },
          getInnerHTML: function(el) {
            throw _abstract();
          },
          getOuterHTML: function(el) {
            throw _abstract();
          },
          nodeName: function(node) {
            throw _abstract();
          },
          nodeValue: function(node) {
            throw _abstract();
          },
          type: function(node) {
            throw _abstract();
          },
          content: function(node) {
            throw _abstract();
          },
          firstChild: function(el) {
            throw _abstract();
          },
          nextSibling: function(el) {
            throw _abstract();
          },
          parentElement: function(el) {
            throw _abstract();
          },
          childNodes: function(el) {
            throw _abstract();
          },
          childNodesAsList: function(el) {
            throw _abstract();
          },
          clearNodes: function(el) {
            throw _abstract();
          },
          appendChild: function(el, node) {
            throw _abstract();
          },
          removeChild: function(el, node) {
            throw _abstract();
          },
          replaceChild: function(el, newNode, oldNode) {
            throw _abstract();
          },
          remove: function(el) {
            throw _abstract();
          },
          insertBefore: function(el, node) {
            throw _abstract();
          },
          insertAllBefore: function(el, nodes) {
            throw _abstract();
          },
          insertAfter: function(el, node) {
            throw _abstract();
          },
          setInnerHTML: function(el, value) {
            throw _abstract();
          },
          getText: function(el) {
            throw _abstract();
          },
          setText: function(el, value) {
            throw _abstract();
          },
          getValue: function(el) {
            throw _abstract();
          },
          setValue: function(el, value) {
            throw _abstract();
          },
          getChecked: function(el) {
            throw _abstract();
          },
          setChecked: function(el, value) {
            throw _abstract();
          },
          createTemplate: function(html) {
            throw _abstract();
          },
          createElement: function(tagName) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : null;
            throw _abstract();
          },
          createTextNode: function(text) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : null;
            throw _abstract();
          },
          createScriptTag: function(attrName, attrValue) {
            var doc = arguments[2] !== (void 0) ? arguments[2] : null;
            throw _abstract();
          },
          createStyleElement: function(css) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : null;
            throw _abstract();
          },
          createShadowRoot: function(el) {
            throw _abstract();
          },
          getShadowRoot: function(el) {
            throw _abstract();
          },
          getHost: function(el) {
            throw _abstract();
          },
          getDistributedNodes: function(el) {
            throw _abstract();
          },
          clone: function(node) {
            throw _abstract();
          },
          getElementsByClassName: function(element, name) {
            throw _abstract();
          },
          getElementsByTagName: function(element, name) {
            throw _abstract();
          },
          classList: function(element) {
            throw _abstract();
          },
          addClass: function(element, classname) {
            throw _abstract();
          },
          removeClass: function(element, classname) {
            throw _abstract();
          },
          hasClass: function(element, classname) {
            throw _abstract();
          },
          setStyle: function(element, stylename, stylevalue) {
            throw _abstract();
          },
          removeStyle: function(element, stylename) {
            throw _abstract();
          },
          getStyle: function(element, stylename) {
            throw _abstract();
          },
          tagName: function(element) {
            throw _abstract();
          },
          attributeMap: function(element) {
            throw _abstract();
          },
          hasAttribute: function(element, attribute) {
            throw _abstract();
          },
          getAttribute: function(element, attribute) {
            throw _abstract();
          },
          setAttribute: function(element, name, value) {
            throw _abstract();
          },
          removeAttribute: function(element, attribute) {
            throw _abstract();
          },
          templateAwareRoot: function(el) {
            throw _abstract();
          },
          createHtmlDocument: function() {
            throw _abstract();
          },
          defaultDoc: function() {
            throw _abstract();
          },
          getBoundingClientRect: function(el) {
            throw _abstract();
          },
          getTitle: function() {
            throw _abstract();
          },
          setTitle: function(newTitle) {
            throw _abstract();
          },
          elementMatches: function(n, selector) {
            throw _abstract();
          },
          isTemplateElement: function(el) {
            throw _abstract();
          },
          isTextNode: function(node) {
            throw _abstract();
          },
          isCommentNode: function(node) {
            throw _abstract();
          },
          isElementNode: function(node) {
            throw _abstract();
          },
          hasShadowRoot: function(node) {
            throw _abstract();
          },
          isShadowRoot: function(node) {
            throw _abstract();
          },
          importIntoDoc: function(node) {
            throw _abstract();
          },
          isPageRule: function(rule) {
            throw _abstract();
          },
          isStyleRule: function(rule) {
            throw _abstract();
          },
          isMediaRule: function(rule) {
            throw _abstract();
          },
          isKeyframesRule: function(rule) {
            throw _abstract();
          },
          getHref: function(element) {
            throw _abstract();
          },
          getEventKey: function(event) {
            throw _abstract();
          },
          resolveAndSetHref: function(element, baseUrl, href) {
            throw _abstract();
          },
          cssToRules: function(css) {
            throw _abstract();
          },
          supportsDOMEvents: function() {
            throw _abstract();
          },
          supportsNativeShadowDOM: function() {
            throw _abstract();
          },
          getGlobalEventTarget: function(target) {
            throw _abstract();
          },
          getHistory: function() {
            throw _abstract();
          },
          getLocation: function() {
            throw _abstract();
          },
          getBaseHref: function() {
            throw _abstract();
          },
          getUserAgent: function() {
            throw _abstract();
          },
          setData: function(element, name, value) {
            throw _abstract();
          },
          getData: function(element, name) {
            throw _abstract();
          },
          setGlobalVar: function(name, value) {
            throw _abstract();
          }
        }, {});
      }());
      $__export("DomAdapter", DomAdapter);
    }
  };
});

System.register("angular2/src/dom/generic_browser_adapter", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/dom/generic_browser_adapter";
  var ListWrapper,
      isPresent,
      isFunction,
      DomAdapter,
      GenericBrowserDomAdapter;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isFunction = $__m.isFunction;
    }, function($__m) {
      DomAdapter = $__m.DomAdapter;
    }],
    execute: function() {
      GenericBrowserDomAdapter = (function($__super) {
        function GenericBrowserDomAdapter() {
          $traceurRuntime.superConstructor(GenericBrowserDomAdapter).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(GenericBrowserDomAdapter, {
          getDistributedNodes: function(el) {
            return el.getDistributedNodes();
          },
          resolveAndSetHref: function(el, baseUrl, href) {
            el.href = href == null ? baseUrl : baseUrl + '/../' + href;
          },
          cssToRules: function(css) {
            var style = this.createStyleElement(css);
            this.appendChild(this.defaultDoc().head, style);
            var rules = [];
            if (isPresent(style.sheet)) {
              try {
                var rawRules = style.sheet.cssRules;
                rules = ListWrapper.createFixedSize(rawRules.length);
                for (var i = 0; i < rawRules.length; i++) {
                  rules[i] = rawRules[i];
                }
              } catch (e) {}
            } else {}
            this.remove(style);
            return rules;
          },
          supportsDOMEvents: function() {
            return true;
          },
          supportsNativeShadowDOM: function() {
            return isFunction(this.defaultDoc().body.createShadowRoot);
          }
        }, {}, $__super);
      }(DomAdapter));
      $__export("GenericBrowserDomAdapter", GenericBrowserDomAdapter);
    }
  };
});

System.register("angular2/src/core/annotations_impl/annotations", ["angular2/src/facade/lang", "angular2/src/di/annotations_impl", "angular2/change_detection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/annotations";
  var __decorate,
      __metadata,
      CONST,
      CONST_EXPR,
      Injectable,
      self,
      DEFAULT,
      Directive,
      Component,
      LifecycleEvent,
      onDestroy,
      onChange,
      onCheck,
      onInit,
      onAllChangesDone;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      Injectable = $__m.Injectable;
      self = $__m.self;
    }, function($__m) {
      DEFAULT = $__m.DEFAULT;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Directive = (function($__super) {
        function $__0() {
          var $__3;
          var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__2.selector,
              properties = $__2.properties,
              events = $__2.events,
              host = $__2.host,
              lifecycle = $__2.lifecycle,
              hostInjector = $__2.hostInjector,
              exportAs = $__2.exportAs,
              compileChildren = ($__3 = $__2.compileChildren) === void 0 ? true : $__3;
          $traceurRuntime.superConstructor($__0).call(this, self);
          this.selector = selector;
          this.properties = properties;
          this.events = events;
          this.host = host;
          this.exportAs = exportAs;
          this.lifecycle = lifecycle;
          this.compileChildren = compileChildren;
          this.hostInjector = hostInjector;
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Injectable));
      $__export("Directive", Directive);
      $__export("Directive", Directive = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Directive));
      Component = (function($__super) {
        function $__0() {
          var $__3,
              $__4;
          var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__2.selector,
              properties = $__2.properties,
              events = $__2.events,
              host = $__2.host,
              exportAs = $__2.exportAs,
              lifecycle = $__2.lifecycle,
              hostInjector = $__2.hostInjector,
              viewInjector = $__2.viewInjector,
              changeDetection = ($__3 = $__2.changeDetection) === void 0 ? DEFAULT : $__3,
              compileChildren = ($__4 = $__2.compileChildren) === void 0 ? true : $__4;
          $traceurRuntime.superConstructor($__0).call(this, {
            selector: selector,
            properties: properties,
            events: events,
            host: host,
            exportAs: exportAs,
            hostInjector: hostInjector,
            lifecycle: lifecycle,
            compileChildren: compileChildren
          });
          this.changeDetection = changeDetection;
          this.viewInjector = viewInjector;
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Directive));
      $__export("Component", Component);
      $__export("Component", Component = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Component));
      LifecycleEvent = (($traceurRuntime.createClass)(function(name) {
        this.name = name;
      }, {}, {}));
      $__export("LifecycleEvent", LifecycleEvent);
      $__export("LifecycleEvent", LifecycleEvent = __decorate([CONST(), __metadata('design:paramtypes', [String])], LifecycleEvent));
      onDestroy = CONST_EXPR(new LifecycleEvent("onDestroy"));
      $__export("onDestroy", onDestroy);
      onChange = CONST_EXPR(new LifecycleEvent("onChange"));
      $__export("onChange", onChange);
      onCheck = CONST_EXPR(new LifecycleEvent("onCheck"));
      $__export("onCheck", onCheck);
      onInit = CONST_EXPR(new LifecycleEvent("onInit"));
      $__export("onInit", onInit);
      onAllChangesDone = CONST_EXPR(new LifecycleEvent("onAllChangesDone"));
      $__export("onAllChangesDone", onAllChangesDone);
    }
  };
});

System.register("angular2/src/core/compiler/view_ref", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_ref";
  var isPresent,
      ViewRef,
      ProtoViewRef;
  function internalView(viewRef) {
    return viewRef._view;
  }
  function internalProtoView(protoViewRef) {
    return isPresent(protoViewRef) ? protoViewRef._protoView : null;
  }
  $__export("internalView", internalView);
  $__export("internalProtoView", internalProtoView);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      ViewRef = (function() {
        function ViewRef(_view) {
          this._view = _view;
        }
        return ($traceurRuntime.createClass)(ViewRef, {
          get render() {
            return this._view.render;
          },
          setLocal: function(contextName, value) {
            this._view.setLocal(contextName, value);
          }
        }, {});
      }());
      $__export("ViewRef", ViewRef);
      ProtoViewRef = (function() {
        function ProtoViewRef(_protoView) {
          this._protoView = _protoView;
        }
        return ($traceurRuntime.createClass)(ProtoViewRef, {}, {});
      }());
      $__export("ProtoViewRef", ProtoViewRef);
    }
  };
});

System.register("angular2/src/core/annotations_impl/di", ["angular2/src/facade/lang", "angular2/src/di/annotations_impl", "angular2/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/di";
  var __decorate,
      __metadata,
      CONST,
      stringify,
      StringWrapper,
      isString,
      DependencyAnnotation,
      resolveForwardRef,
      Attribute,
      Query;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
      stringify = $__m.stringify;
      StringWrapper = $__m.StringWrapper;
      isString = $__m.isString;
    }, function($__m) {
      DependencyAnnotation = $__m.DependencyAnnotation;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Attribute = (function($__super) {
        function $__0(attributeName) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.attributeName = attributeName;
        }
        return ($traceurRuntime.createClass)($__0, {
          get token() {
            return this;
          },
          toString: function() {
            return ("@Attribute(" + stringify(this.attributeName) + ")");
          }
        }, {}, $__super);
      }(DependencyAnnotation));
      $__export("Attribute", Attribute);
      $__export("Attribute", Attribute = __decorate([CONST(), __metadata('design:paramtypes', [String])], Attribute));
      Query = (function($__super) {
        function $__0(_selector) {
          var $__3;
          var $__2 = arguments[1] !== (void 0) ? arguments[1] : {},
              descendants = ($__3 = $__2.descendants) === void 0 ? false : $__3;
          $traceurRuntime.superConstructor($__0).call(this);
          this._selector = _selector;
          this.descendants = descendants;
        }
        return ($traceurRuntime.createClass)($__0, {
          get selector() {
            return resolveForwardRef(this._selector);
          },
          get isVarBindingQuery() {
            return isString(this.selector);
          },
          get varBindings() {
            return StringWrapper.split(this.selector, new RegExp(","));
          },
          toString: function() {
            return ("@Query(" + stringify(this.selector) + ")");
          }
        }, {}, $__super);
      }(DependencyAnnotation));
      $__export("Query", Query);
      $__export("Query", Query = __decorate([CONST(), __metadata('design:paramtypes', [Object, Object])], Query));
    }
  };
});

System.register("angular2/src/render/api", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/api";
  var isPresent,
      isBlank,
      RegExpWrapper,
      Map,
      MapWrapper,
      EventBinding,
      PropertyBindingType,
      ElementPropertyBinding,
      ElementBinder,
      DirectiveBinder,
      ViewType,
      ProtoViewDto,
      hostRegExp,
      DirectiveMetadata,
      RenderProtoViewRef,
      RenderViewRef,
      ViewDefinition,
      RenderCompiler,
      Renderer;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      RegExpWrapper = $__m.RegExpWrapper;
    }, function($__m) {
      Map = $__m.Map;
      MapWrapper = $__m.MapWrapper;
    }],
    execute: function() {
      EventBinding = (function() {
        function EventBinding(fullName, source) {
          this.fullName = fullName;
          this.source = source;
        }
        return ($traceurRuntime.createClass)(EventBinding, {}, {});
      }());
      $__export("EventBinding", EventBinding);
      $__export("PropertyBindingType", PropertyBindingType);
      (function(PropertyBindingType) {
        PropertyBindingType[PropertyBindingType["PROPERTY"] = 0] = "PROPERTY";
        PropertyBindingType[PropertyBindingType["ATTRIBUTE"] = 1] = "ATTRIBUTE";
        PropertyBindingType[PropertyBindingType["CLASS"] = 2] = "CLASS";
        PropertyBindingType[PropertyBindingType["STYLE"] = 3] = "STYLE";
      })(PropertyBindingType || ($__export("PropertyBindingType", PropertyBindingType = {})));
      ElementPropertyBinding = (function() {
        function ElementPropertyBinding(type, astWithSource, property) {
          var unit = arguments[3] !== (void 0) ? arguments[3] : null;
          this.type = type;
          this.astWithSource = astWithSource;
          this.property = property;
          this.unit = unit;
        }
        return ($traceurRuntime.createClass)(ElementPropertyBinding, {}, {});
      }());
      $__export("ElementPropertyBinding", ElementPropertyBinding);
      ElementBinder = (function() {
        function ElementBinder() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              index = $__1.index,
              parentIndex = $__1.parentIndex,
              distanceToParent = $__1.distanceToParent,
              directives = $__1.directives,
              nestedProtoView = $__1.nestedProtoView,
              propertyBindings = $__1.propertyBindings,
              variableBindings = $__1.variableBindings,
              eventBindings = $__1.eventBindings,
              textBindings = $__1.textBindings,
              readAttributes = $__1.readAttributes;
          this.index = index;
          this.parentIndex = parentIndex;
          this.distanceToParent = distanceToParent;
          this.directives = directives;
          this.nestedProtoView = nestedProtoView;
          this.propertyBindings = propertyBindings;
          this.variableBindings = variableBindings;
          this.eventBindings = eventBindings;
          this.textBindings = textBindings;
          this.readAttributes = readAttributes;
        }
        return ($traceurRuntime.createClass)(ElementBinder, {}, {});
      }());
      $__export("ElementBinder", ElementBinder);
      DirectiveBinder = (function() {
        function DirectiveBinder($__1) {
          var $__2 = $__1,
              directiveIndex = $__2.directiveIndex,
              propertyBindings = $__2.propertyBindings,
              eventBindings = $__2.eventBindings,
              hostPropertyBindings = $__2.hostPropertyBindings;
          this.directiveIndex = directiveIndex;
          this.propertyBindings = propertyBindings;
          this.eventBindings = eventBindings;
          this.hostPropertyBindings = hostPropertyBindings;
        }
        return ($traceurRuntime.createClass)(DirectiveBinder, {}, {});
      }());
      $__export("DirectiveBinder", DirectiveBinder);
      $__export("ViewType", ViewType);
      (function(ViewType) {
        ViewType[ViewType["HOST"] = 0] = "HOST";
        ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
        ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
      })(ViewType || ($__export("ViewType", ViewType = {})));
      ProtoViewDto = (function() {
        function ProtoViewDto($__1) {
          var $__2 = $__1,
              render = $__2.render,
              elementBinders = $__2.elementBinders,
              variableBindings = $__2.variableBindings,
              type = $__2.type;
          this.render = render;
          this.elementBinders = elementBinders;
          this.variableBindings = variableBindings;
          this.type = type;
        }
        return ($traceurRuntime.createClass)(ProtoViewDto, {}, {});
      }());
      $__export("ProtoViewDto", ProtoViewDto);
      hostRegExp = RegExpWrapper.create('^(?:(?:\\[([^\\]]+)\\])|(?:\\(([^\\)]+)\\))|(?:@(.+)))$');
      DirectiveMetadata = (function() {
        function DirectiveMetadata($__1) {
          var $__2 = $__1,
              id = $__2.id,
              selector = $__2.selector,
              compileChildren = $__2.compileChildren,
              events = $__2.events,
              hostListeners = $__2.hostListeners,
              hostProperties = $__2.hostProperties,
              hostAttributes = $__2.hostAttributes,
              hostActions = $__2.hostActions,
              properties = $__2.properties,
              readAttributes = $__2.readAttributes,
              type = $__2.type,
              callOnDestroy = $__2.callOnDestroy,
              callOnChange = $__2.callOnChange,
              callOnCheck = $__2.callOnCheck,
              callOnInit = $__2.callOnInit,
              callOnAllChangesDone = $__2.callOnAllChangesDone,
              changeDetection = $__2.changeDetection,
              exportAs = $__2.exportAs;
          this.id = id;
          this.selector = selector;
          this.compileChildren = isPresent(compileChildren) ? compileChildren : true;
          this.events = events;
          this.hostListeners = hostListeners;
          this.hostAttributes = hostAttributes;
          this.hostProperties = hostProperties;
          this.hostActions = hostActions;
          this.properties = properties;
          this.readAttributes = readAttributes;
          this.type = type;
          this.callOnDestroy = callOnDestroy;
          this.callOnChange = callOnChange;
          this.callOnCheck = callOnCheck;
          this.callOnInit = callOnInit;
          this.callOnAllChangesDone = callOnAllChangesDone;
          this.changeDetection = changeDetection;
          this.exportAs = exportAs;
        }
        return ($traceurRuntime.createClass)(DirectiveMetadata, {}, {
          get DIRECTIVE_TYPE() {
            return 0;
          },
          get COMPONENT_TYPE() {
            return 1;
          },
          create: function($__1) {
            var $__2 = $__1,
                id = $__2.id,
                selector = $__2.selector,
                compileChildren = $__2.compileChildren,
                events = $__2.events,
                host = $__2.host,
                properties = $__2.properties,
                readAttributes = $__2.readAttributes,
                type = $__2.type,
                callOnDestroy = $__2.callOnDestroy,
                callOnChange = $__2.callOnChange,
                callOnCheck = $__2.callOnCheck,
                callOnInit = $__2.callOnInit,
                callOnAllChangesDone = $__2.callOnAllChangesDone,
                changeDetection = $__2.changeDetection,
                exportAs = $__2.exportAs;
            var hostListeners = new Map();
            var hostProperties = new Map();
            var hostAttributes = new Map();
            var hostActions = new Map();
            if (isPresent(host)) {
              MapWrapper.forEach(host, (function(value, key) {
                var matches = RegExpWrapper.firstMatch(hostRegExp, key);
                if (isBlank(matches)) {
                  hostAttributes.set(key, value);
                } else if (isPresent(matches[1])) {
                  hostProperties.set(matches[1], value);
                } else if (isPresent(matches[2])) {
                  hostListeners.set(matches[2], value);
                } else if (isPresent(matches[3])) {
                  hostActions.set(matches[3], value);
                }
              }));
            }
            return new DirectiveMetadata({
              id: id,
              selector: selector,
              compileChildren: compileChildren,
              events: events,
              hostListeners: hostListeners,
              hostProperties: hostProperties,
              hostAttributes: hostAttributes,
              hostActions: hostActions,
              properties: properties,
              readAttributes: readAttributes,
              type: type,
              callOnDestroy: callOnDestroy,
              callOnChange: callOnChange,
              callOnCheck: callOnCheck,
              callOnInit: callOnInit,
              callOnAllChangesDone: callOnAllChangesDone,
              changeDetection: changeDetection,
              exportAs: exportAs
            });
          }
        });
      }());
      $__export("DirectiveMetadata", DirectiveMetadata);
      RenderProtoViewRef = (function() {
        function RenderProtoViewRef() {}
        return ($traceurRuntime.createClass)(RenderProtoViewRef, {}, {});
      }());
      $__export("RenderProtoViewRef", RenderProtoViewRef);
      RenderViewRef = (function() {
        function RenderViewRef() {}
        return ($traceurRuntime.createClass)(RenderViewRef, {}, {});
      }());
      $__export("RenderViewRef", RenderViewRef);
      ViewDefinition = (function() {
        function ViewDefinition($__1) {
          var $__2 = $__1,
              componentId = $__2.componentId,
              templateAbsUrl = $__2.templateAbsUrl,
              template = $__2.template,
              styleAbsUrls = $__2.styleAbsUrls,
              styles = $__2.styles,
              directives = $__2.directives;
          this.componentId = componentId;
          this.templateAbsUrl = templateAbsUrl;
          this.template = template;
          this.styleAbsUrls = styleAbsUrls;
          this.styles = styles;
          this.directives = directives;
        }
        return ($traceurRuntime.createClass)(ViewDefinition, {}, {});
      }());
      $__export("ViewDefinition", ViewDefinition);
      RenderCompiler = (function() {
        function RenderCompiler() {}
        return ($traceurRuntime.createClass)(RenderCompiler, {
          compileHost: function(directiveMetadata) {
            return null;
          },
          compile: function(view) {
            return null;
          }
        }, {});
      }());
      $__export("RenderCompiler", RenderCompiler);
      Renderer = (function() {
        function Renderer() {}
        return ($traceurRuntime.createClass)(Renderer, {
          createRootHostView: function(hostProtoViewRef, hostElementSelector) {
            return null;
          },
          createView: function(protoViewRef) {
            return null;
          },
          destroyView: function(viewRef) {},
          attachComponentView: function(location, componentViewRef) {},
          detachComponentView: function(location, componentViewRef) {},
          attachViewInContainer: function(location, atIndex, viewRef) {},
          detachViewInContainer: function(location, atIndex, viewRef) {},
          hydrateView: function(viewRef) {},
          dehydrateView: function(viewRef) {},
          getNativeElementSync: function(location) {
            return null;
          },
          setElementProperty: function(location, propertyName, propertyValue) {},
          setElementAttribute: function(location, attributeName, attributeValue) {},
          setElementClass: function(location, className, isAdd) {},
          setElementStyle: function(location, styleName, styleValue) {},
          invokeElementMethod: function(location, methodName, args) {},
          setText: function(viewRef, textNodeIndex, text) {},
          setEventDispatcher: function(viewRef, dispatcher) {}
        }, {});
      }());
      $__export("Renderer", Renderer);
    }
  };
});

System.register("angular2/src/core/compiler/element_binder", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/element_binder";
  var isBlank,
      isPresent,
      BaseException,
      ElementBinder;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      ElementBinder = (function() {
        function ElementBinder(index, parent, distanceToParent, protoElementInjector, componentDirective) {
          this.index = index;
          this.parent = parent;
          this.distanceToParent = distanceToParent;
          this.protoElementInjector = protoElementInjector;
          this.componentDirective = componentDirective;
          this.nestedProtoView = null;
          this.hostListeners = null;
          if (isBlank(index)) {
            throw new BaseException('null index not allowed.');
          }
        }
        return ($traceurRuntime.createClass)(ElementBinder, {
          hasStaticComponent: function() {
            return isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
          },
          hasEmbeddedProtoView: function() {
            return !isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
          }
        }, {});
      }());
      $__export("ElementBinder", ElementBinder);
    }
  };
});

System.register("angular2/src/core/compiler/element_ref", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/element_ref";
  var BaseException,
      ElementRef;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      ElementRef = (function() {
        function ElementRef(parentView, boundElementIndex, _renderer) {
          this.parentView = parentView;
          this.boundElementIndex = boundElementIndex;
          this._renderer = _renderer;
        }
        return ($traceurRuntime.createClass)(ElementRef, {
          get renderView() {
            return this.parentView.render;
          },
          set renderView(viewRef) {
            throw new BaseException('Abstract setter');
          },
          get nativeElement() {
            return this._renderer.getNativeElementSync(this);
          }
        }, {});
      }());
      $__export("ElementRef", ElementRef);
    }
  };
});

System.register("angular2/src/core/compiler/view_pool", ["angular2/di", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_pool";
  var __decorate,
      __metadata,
      __param,
      Inject,
      Injectable,
      OpaqueToken,
      ListWrapper,
      Map,
      isPresent,
      isBlank,
      CONST_EXPR,
      APP_VIEW_POOL_CAPACITY,
      AppViewPool;
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      OpaqueToken = $__m.OpaqueToken;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      Map = $__m.Map;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      CONST_EXPR = $__m.CONST_EXPR;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      APP_VIEW_POOL_CAPACITY = CONST_EXPR(new OpaqueToken('AppViewPool.viewPoolCapacity'));
      $__export("APP_VIEW_POOL_CAPACITY", APP_VIEW_POOL_CAPACITY);
      AppViewPool = (($traceurRuntime.createClass)(function(poolCapacityPerProtoView) {
        this._pooledViewsPerProtoView = new Map();
        this._poolCapacityPerProtoView = poolCapacityPerProtoView;
      }, {
        getView: function(protoView) {
          var pooledViews = this._pooledViewsPerProtoView.get(protoView);
          if (isPresent(pooledViews) && pooledViews.length > 0) {
            return ListWrapper.removeLast(pooledViews);
          }
          return null;
        },
        returnView: function(view) {
          var protoView = view.proto;
          var pooledViews = this._pooledViewsPerProtoView.get(protoView);
          if (isBlank(pooledViews)) {
            pooledViews = [];
            this._pooledViewsPerProtoView.set(protoView, pooledViews);
          }
          var haveRemainingCapacity = pooledViews.length < this._poolCapacityPerProtoView;
          if (haveRemainingCapacity) {
            pooledViews.push(view);
          }
          return haveRemainingCapacity;
        }
      }, {}));
      $__export("AppViewPool", AppViewPool);
      $__export("AppViewPool", AppViewPool = __decorate([Injectable(), __param(0, Inject(APP_VIEW_POOL_CAPACITY)), __metadata('design:paramtypes', [Object])], AppViewPool));
    }
  };
});

System.register("angular2/src/core/compiler/view_listener", ["angular2/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_listener";
  var __decorate,
      __metadata,
      Injectable,
      AppViewListener;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      AppViewListener = (($traceurRuntime.createClass)(function() {}, {
        viewCreated: function(view) {},
        viewDestroyed: function(view) {}
      }, {}));
      $__export("AppViewListener", AppViewListener);
      $__export("AppViewListener", AppViewListener = __decorate([Injectable(), __metadata('design:paramtypes', [])], AppViewListener));
    }
  };
});

System.register("angular2/src/core/compiler/view_container_ref", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/compiler/view_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_container_ref";
  var ListWrapper,
      isPresent,
      internalView,
      ViewContainerRef;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      internalView = $__m.internalView;
    }],
    execute: function() {
      ViewContainerRef = (function() {
        function ViewContainerRef(viewManager, element) {
          this.viewManager = viewManager;
          this.element = element;
        }
        return ($traceurRuntime.createClass)(ViewContainerRef, {
          _getViews: function() {
            var vc = internalView(this.element.parentView).viewContainers[this.element.boundElementIndex];
            return isPresent(vc) ? vc.views : [];
          },
          clear: function() {
            for (var i = this.length - 1; i >= 0; i--) {
              this.remove(i);
            }
          },
          get: function(index) {
            return this._getViews()[index].ref;
          },
          get length() {
            return this._getViews().length;
          },
          create: function() {
            var protoViewRef = arguments[0] !== (void 0) ? arguments[0] : null;
            var atIndex = arguments[1] !== (void 0) ? arguments[1] : -1;
            var context = arguments[2] !== (void 0) ? arguments[2] : null;
            var bindings = arguments[3] !== (void 0) ? arguments[3] : null;
            if (atIndex == -1)
              atIndex = this.length;
            return this.viewManager.createViewInContainer(this.element, atIndex, protoViewRef, context, bindings);
          },
          insert: function(viewRef) {
            var atIndex = arguments[1] !== (void 0) ? arguments[1] : -1;
            if (atIndex == -1)
              atIndex = this.length;
            return this.viewManager.attachViewInContainer(this.element, atIndex, viewRef);
          },
          indexOf: function(viewRef) {
            return ListWrapper.indexOf(this._getViews(), internalView(viewRef));
          },
          remove: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this.length - 1;
            this.viewManager.destroyViewInContainer(this.element, atIndex);
          },
          detach: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this.length - 1;
            return this.viewManager.detachViewInContainer(this.element, atIndex);
          }
        }, {});
      }());
      $__export("ViewContainerRef", ViewContainerRef);
    }
  };
});

System.register("angular2/src/core/compiler/directive_lifecycle_reflector", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/directive_lifecycle_reflector";
  var Type,
      isPresent;
  function hasLifecycleHook(e, type, annotation) {
    if (isPresent(annotation.lifecycle)) {
      return annotation.lifecycle.indexOf(e) !== -1;
    } else {
      if (!(type instanceof Type))
        return false;
      return e.name in type.prototype;
    }
  }
  $__export("hasLifecycleHook", hasLifecycleHook);
  return {
    setters: [function($__m) {
      Type = $__m.Type;
      isPresent = $__m.isPresent;
    }],
    execute: function() {
    }
  };
});

System.register("angular2/src/core/compiler/base_query_list", ["angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/base_query_list";
  var ListWrapper,
      BaseQueryList;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      BaseQueryList = (function() {
        var $__1;
        function BaseQueryList() {
          this._results = [];
          this._callbacks = [];
          this._dirty = false;
        }
        return ($traceurRuntime.createClass)(BaseQueryList, ($__1 = {}, Object.defineProperty($__1, Symbol.iterator, {
          value: function() {
            return this._results[Symbol.iterator]();
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "reset", {
          value: function(newList) {
            this._results = newList;
            this._dirty = true;
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "add", {
          value: function(obj) {
            this._results.push(obj);
            this._dirty = true;
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "fireCallbacks", {
          value: function() {
            if (this._dirty) {
              ListWrapper.forEach(this._callbacks, (function(c) {
                return c();
              }));
              this._dirty = false;
            }
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "onChange", {
          value: function(callback) {
            this._callbacks.push(callback);
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "removeCallback", {
          value: function(callback) {
            ListWrapper.remove(this._callbacks, callback);
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "length", {
          get: function() {
            return this._results.length;
          },
          configurable: true,
          enumerable: true
        }), Object.defineProperty($__1, "first", {
          get: function() {
            return ListWrapper.first(this._results);
          },
          configurable: true,
          enumerable: true
        }), Object.defineProperty($__1, "last", {
          get: function() {
            return ListWrapper.last(this._results);
          },
          configurable: true,
          enumerable: true
        }), $__1), {});
      }());
      $__export("BaseQueryList", BaseQueryList);
    }
  };
});

System.register("angular2/src/core/compiler/view_resolver", ["angular2/di", "angular2/src/core/annotations_impl/view", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/reflection/reflection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_resolver";
  var __decorate,
      __metadata,
      Injectable,
      View,
      stringify,
      isBlank,
      BaseException,
      Map,
      reflector,
      ViewResolver;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      View = $__m.View;
    }, function($__m) {
      stringify = $__m.stringify;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      Map = $__m.Map;
    }, function($__m) {
      reflector = $__m.reflector;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ViewResolver = (($traceurRuntime.createClass)(function() {
        this._cache = new Map();
      }, {
        resolve: function(component) {
          var view = this._cache.get(component);
          if (isBlank(view)) {
            view = this._resolve(component);
            this._cache.set(component, view);
          }
          return view;
        },
        _resolve: function(component) {
          var annotations = reflector.annotations(component);
          for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof View) {
              return annotation;
            }
          }
          throw new BaseException(("No View annotation found on component " + stringify(component)));
        }
      }, {}));
      $__export("ViewResolver", ViewResolver);
      $__export("ViewResolver", ViewResolver = __decorate([Injectable(), __metadata('design:paramtypes', [])], ViewResolver));
    }
  };
});

System.register("angular2/src/core/compiler/component_url_mapper", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/component_url_mapper";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      Map,
      ComponentUrlMapper,
      RuntimeComponentUrlMapper;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      Map = $__m.Map;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ComponentUrlMapper = (($traceurRuntime.createClass)(function() {}, {getUrl: function(component) {
          return './';
        }}, {}));
      $__export("ComponentUrlMapper", ComponentUrlMapper);
      $__export("ComponentUrlMapper", ComponentUrlMapper = __decorate([Injectable(), __metadata('design:paramtypes', [])], ComponentUrlMapper));
      RuntimeComponentUrlMapper = (function($__super) {
        function RuntimeComponentUrlMapper() {
          $traceurRuntime.superConstructor(RuntimeComponentUrlMapper).call(this);
          this._componentUrls = new Map();
        }
        return ($traceurRuntime.createClass)(RuntimeComponentUrlMapper, {
          setComponentUrl: function(component, url) {
            this._componentUrls.set(component, url);
          },
          getUrl: function(component) {
            var url = this._componentUrls.get(component);
            if (isPresent(url))
              return url;
            return $traceurRuntime.superGet(this, RuntimeComponentUrlMapper.prototype, "getUrl").call(this, component);
          }
        }, {}, $__super);
      }(ComponentUrlMapper));
      $__export("RuntimeComponentUrlMapper", RuntimeComponentUrlMapper);
    }
  };
});

System.register("angular2/src/core/compiler/proto_view_factory", ["angular2/di", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/reflection/reflection", "angular2/change_detection", "angular2/src/render/api", "angular2/src/core/compiler/view", "angular2/src/core/compiler/element_injector"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/proto_view_factory";
  var __decorate,
      __metadata,
      Injectable,
      ListWrapper,
      MapWrapper,
      isPresent,
      isBlank,
      BaseException,
      reflector,
      ChangeDetection,
      DirectiveIndex,
      BindingRecord,
      DirectiveRecord,
      DEFAULT,
      ChangeDetectorDefinition,
      renderApi,
      AppProtoView,
      ProtoElementInjector,
      BindingRecordsCreator,
      ProtoViewFactory,
      RenderProtoViewWithIndex,
      ParentProtoElementInjectorWithDistance;
  function getChangeDetectorDefinitions(hostComponentMetadata, rootRenderProtoView, allRenderDirectiveMetadata) {
    var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
    var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);
    return _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata);
  }
  function _collectNestedProtoViews(renderProtoView) {
    var parentIndex = arguments[1] !== (void 0) ? arguments[1] : null;
    var boundElementIndex = arguments[2] !== (void 0) ? arguments[2] : null;
    var result = arguments[3] !== (void 0) ? arguments[3] : null;
    if (isBlank(result)) {
      result = [];
    }
    result.push(new RenderProtoViewWithIndex(renderProtoView, result.length, parentIndex, boundElementIndex));
    var currentIndex = result.length - 1;
    var childBoundElementIndex = 0;
    ListWrapper.forEach(renderProtoView.elementBinders, (function(elementBinder) {
      if (isPresent(elementBinder.nestedProtoView)) {
        _collectNestedProtoViews(elementBinder.nestedProtoView, currentIndex, childBoundElementIndex, result);
      }
      childBoundElementIndex++;
    }));
    return result;
  }
  function _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata) {
    return ListWrapper.map(nestedPvsWithIndex, (function(pvWithIndex) {
      var elementBinders = pvWithIndex.renderProtoView.elementBinders;
      var bindingRecordsCreator = new BindingRecordsCreator();
      var bindingRecords = bindingRecordsCreator.getBindingRecords(elementBinders, allRenderDirectiveMetadata);
      var directiveRecords = bindingRecordsCreator.getDirectiveRecords(elementBinders, allRenderDirectiveMetadata);
      var strategyName = DEFAULT;
      var typeString;
      if (pvWithIndex.renderProtoView.type === renderApi.ViewType.COMPONENT) {
        strategyName = hostComponentMetadata.changeDetection;
        typeString = 'comp';
      } else if (pvWithIndex.renderProtoView.type === renderApi.ViewType.HOST) {
        typeString = 'host';
      } else {
        typeString = 'embedded';
      }
      var id = (hostComponentMetadata.id + "_" + typeString + "_" + pvWithIndex.index);
      var variableNames = nestedPvVariableNames[pvWithIndex.index];
      return new ChangeDetectorDefinition(id, strategyName, variableNames, bindingRecords, directiveRecords);
    }));
  }
  function _createAppProtoView(renderProtoView, protoChangeDetector, variableBindings, allDirectives) {
    var elementBinders = renderProtoView.elementBinders;
    var protoView = new AppProtoView(renderProtoView.render, protoChangeDetector, variableBindings, createVariableLocations(elementBinders));
    _createElementBinders(protoView, elementBinders, allDirectives);
    _bindDirectiveEvents(protoView, elementBinders);
    return protoView;
  }
  function _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex) {
    return ListWrapper.map(nestedPvsWithIndex, (function(pvWithIndex) {
      return _createVariableBindings(pvWithIndex.renderProtoView);
    }));
  }
  function _createVariableBindings(renderProtoView) {
    var variableBindings = new Map();
    MapWrapper.forEach(renderProtoView.variableBindings, (function(mappedName, varName) {
      variableBindings.set(varName, mappedName);
    }));
    return variableBindings;
  }
  function _collectNestedProtoViewsVariableNames(nestedPvsWithIndex) {
    var nestedPvVariableNames = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
    ListWrapper.forEach(nestedPvsWithIndex, (function(pvWithIndex) {
      var parentVariableNames = isPresent(pvWithIndex.parentIndex) ? nestedPvVariableNames[pvWithIndex.parentIndex] : null;
      nestedPvVariableNames[pvWithIndex.index] = _createVariableNames(parentVariableNames, pvWithIndex.renderProtoView);
    }));
    return nestedPvVariableNames;
  }
  function _createVariableNames(parentVariableNames, renderProtoView) {
    var res = isBlank(parentVariableNames) ? [] : ListWrapper.clone(parentVariableNames);
    MapWrapper.forEach(renderProtoView.variableBindings, (function(mappedName, varName) {
      res.push(mappedName);
    }));
    ListWrapper.forEach(renderProtoView.elementBinders, (function(binder) {
      MapWrapper.forEach(binder.variableBindings, (function(mappedName, varName) {
        res.push(mappedName);
      }));
    }));
    return res;
  }
  function createVariableLocations(elementBinders) {
    var variableLocations = new Map();
    for (var i = 0; i < elementBinders.length; i++) {
      var binder = elementBinders[i];
      MapWrapper.forEach(binder.variableBindings, (function(mappedName, varName) {
        variableLocations.set(mappedName, i);
      }));
    }
    return variableLocations;
  }
  function _createElementBinders(protoView, elementBinders, allDirectiveBindings) {
    for (var i = 0; i < elementBinders.length; i++) {
      var renderElementBinder = elementBinders[i];
      var dirs = elementBinders[i].directives;
      var parentPeiWithDistance = _findParentProtoElementInjectorWithDistance(i, protoView.elementBinders, elementBinders);
      var directiveBindings = ListWrapper.map(dirs, (function(dir) {
        return allDirectiveBindings[dir.directiveIndex];
      }));
      var componentDirectiveBinding = null;
      if (directiveBindings.length > 0) {
        if (directiveBindings[0].metadata.type === renderApi.DirectiveMetadata.COMPONENT_TYPE) {
          componentDirectiveBinding = directiveBindings[0];
        }
      }
      var protoElementInjector = _createProtoElementInjector(i, parentPeiWithDistance, renderElementBinder, componentDirectiveBinding, directiveBindings);
      _createElementBinder(protoView, i, renderElementBinder, protoElementInjector, componentDirectiveBinding, directiveBindings);
    }
  }
  function _findParentProtoElementInjectorWithDistance(binderIndex, elementBinders, renderElementBinders) {
    var distance = 0;
    do {
      var renderElementBinder = renderElementBinders[binderIndex];
      binderIndex = renderElementBinder.parentIndex;
      if (binderIndex !== -1) {
        distance += renderElementBinder.distanceToParent;
        var elementBinder = elementBinders[binderIndex];
        if (isPresent(elementBinder.protoElementInjector)) {
          return new ParentProtoElementInjectorWithDistance(elementBinder.protoElementInjector, distance);
        }
      }
    } while (binderIndex !== -1);
    return new ParentProtoElementInjectorWithDistance(null, 0);
  }
  function _createProtoElementInjector(binderIndex, parentPeiWithDistance, renderElementBinder, componentDirectiveBinding, directiveBindings) {
    var protoElementInjector = null;
    var hasVariables = MapWrapper.size(renderElementBinder.variableBindings) > 0;
    if (directiveBindings.length > 0 || hasVariables) {
      var directiveVariableBindings = createDirectiveVariableBindings(renderElementBinder, directiveBindings);
      protoElementInjector = ProtoElementInjector.create(parentPeiWithDistance.protoElementInjector, binderIndex, directiveBindings, isPresent(componentDirectiveBinding), parentPeiWithDistance.distance, directiveVariableBindings);
      protoElementInjector.attributes = renderElementBinder.readAttributes;
    }
    return protoElementInjector;
  }
  function _createElementBinder(protoView, boundElementIndex, renderElementBinder, protoElementInjector, componentDirectiveBinding, directiveBindings) {
    var parent = null;
    if (renderElementBinder.parentIndex !== -1) {
      parent = protoView.elementBinders[renderElementBinder.parentIndex];
    }
    var elBinder = protoView.bindElement(parent, renderElementBinder.distanceToParent, protoElementInjector, componentDirectiveBinding);
    protoView.bindEvent(renderElementBinder.eventBindings, boundElementIndex, -1);
    MapWrapper.forEach(renderElementBinder.variableBindings, (function(mappedName, varName) {
      protoView.protoLocals.set(mappedName, null);
    }));
    return elBinder;
  }
  function createDirectiveVariableBindings(renderElementBinder, directiveBindings) {
    var directiveVariableBindings = new Map();
    MapWrapper.forEach(renderElementBinder.variableBindings, (function(templateName, exportAs) {
      var dirIndex = _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs);
      directiveVariableBindings.set(templateName, dirIndex);
    }));
    return directiveVariableBindings;
  }
  function _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs) {
    var matchedDirectiveIndex = null;
    var matchedDirective;
    for (var i = 0; i < directiveBindings.length; ++i) {
      var directive = directiveBindings[i];
      if (_directiveExportAs(directive) == exportAs) {
        if (isPresent(matchedDirective)) {
          throw new BaseException(("More than one directive have exportAs = '" + exportAs + "'. Directives: [" + matchedDirective.displayName + ", " + directive.displayName + "]"));
        }
        matchedDirectiveIndex = i;
        matchedDirective = directive;
      }
    }
    if (isBlank(matchedDirective) && exportAs !== "$implicit") {
      throw new BaseException(("Cannot find directive with exportAs = '" + exportAs + "'"));
    }
    return matchedDirectiveIndex;
  }
  function _directiveExportAs(directive) {
    var directiveExportAs = directive.metadata.exportAs;
    if (isBlank(directiveExportAs) && directive.metadata.type === renderApi.DirectiveMetadata.COMPONENT_TYPE) {
      return "$implicit";
    } else {
      return directiveExportAs;
    }
  }
  function _bindDirectiveEvents(protoView, elementBinders) {
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; ++boundElementIndex) {
      var dirs = elementBinders[boundElementIndex].directives;
      for (var i = 0; i < dirs.length; i++) {
        var directiveBinder = dirs[i];
        protoView.bindEvent(directiveBinder.eventBindings, boundElementIndex, i);
      }
    }
  }
  $__export("getChangeDetectorDefinitions", getChangeDetectorDefinitions);
  $__export("createVariableLocations", createVariableLocations);
  $__export("createDirectiveVariableBindings", createDirectiveVariableBindings);
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      ChangeDetection = $__m.ChangeDetection;
      DirectiveIndex = $__m.DirectiveIndex;
      BindingRecord = $__m.BindingRecord;
      DirectiveRecord = $__m.DirectiveRecord;
      DEFAULT = $__m.DEFAULT;
      ChangeDetectorDefinition = $__m.ChangeDetectorDefinition;
    }, function($__m) {
      renderApi = $__m;
    }, function($__m) {
      AppProtoView = $__m.AppProtoView;
    }, function($__m) {
      ProtoElementInjector = $__m.ProtoElementInjector;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      BindingRecordsCreator = (function() {
        function BindingRecordsCreator() {
          this._directiveRecordsMap = new Map();
          this._textNodeIndex = 0;
        }
        return ($traceurRuntime.createClass)(BindingRecordsCreator, {
          getBindingRecords: function(elementBinders, allDirectiveMetadatas) {
            var bindings = [];
            for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; boundElementIndex++) {
              var renderElementBinder = elementBinders[boundElementIndex];
              this._createTextNodeRecords(bindings, renderElementBinder);
              this._createElementPropertyRecords(bindings, boundElementIndex, renderElementBinder);
              this._createDirectiveRecords(bindings, boundElementIndex, renderElementBinder.directives, allDirectiveMetadatas);
            }
            return bindings;
          },
          getDirectiveRecords: function(elementBinders, allDirectiveMetadatas) {
            var directiveRecords = [];
            for (var elementIndex = 0; elementIndex < elementBinders.length; ++elementIndex) {
              var dirs = elementBinders[elementIndex].directives;
              for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
                directiveRecords.push(this._getDirectiveRecord(elementIndex, dirIndex, allDirectiveMetadatas[dirs[dirIndex].directiveIndex]));
              }
            }
            return directiveRecords;
          },
          _createTextNodeRecords: function(bindings, renderElementBinder) {
            var $__0 = this;
            if (isBlank(renderElementBinder.textBindings))
              return ;
            ListWrapper.forEach(renderElementBinder.textBindings, (function(b) {
              bindings.push(BindingRecord.createForTextNode(b, $__0._textNodeIndex++));
            }));
          },
          _createElementPropertyRecords: function(bindings, boundElementIndex, renderElementBinder) {
            ListWrapper.forEach(renderElementBinder.propertyBindings, (function(binding) {
              if (binding.type === renderApi.PropertyBindingType.PROPERTY) {
                bindings.push(BindingRecord.createForElementProperty(binding.astWithSource, boundElementIndex, binding.property));
              } else if (binding.type === renderApi.PropertyBindingType.ATTRIBUTE) {
                bindings.push(BindingRecord.createForElementAttribute(binding.astWithSource, boundElementIndex, binding.property));
              } else if (binding.type === renderApi.PropertyBindingType.CLASS) {
                bindings.push(BindingRecord.createForElementClass(binding.astWithSource, boundElementIndex, binding.property));
              } else if (binding.type === renderApi.PropertyBindingType.STYLE) {
                bindings.push(BindingRecord.createForElementStyle(binding.astWithSource, boundElementIndex, binding.property, binding.unit));
              }
            }));
          },
          _createDirectiveRecords: function(bindings, boundElementIndex, directiveBinders, allDirectiveMetadatas) {
            for (var i = 0; i < directiveBinders.length; i++) {
              var directiveBinder = directiveBinders[i];
              var directiveMetadata = allDirectiveMetadatas[directiveBinder.directiveIndex];
              var directiveRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);
              MapWrapper.forEach(directiveBinder.propertyBindings, (function(astWithSource, propertyName) {
                var setter = reflector.setter(propertyName);
                bindings.push(BindingRecord.createForDirective(astWithSource, propertyName, setter, directiveRecord));
              }));
              if (directiveRecord.callOnChange) {
                bindings.push(BindingRecord.createDirectiveOnChange(directiveRecord));
              }
              if (directiveRecord.callOnInit) {
                bindings.push(BindingRecord.createDirectiveOnInit(directiveRecord));
              }
              if (directiveRecord.callOnCheck) {
                bindings.push(BindingRecord.createDirectiveOnCheck(directiveRecord));
              }
            }
            for (var i = 0; i < directiveBinders.length; i++) {
              var directiveBinder = directiveBinders[i];
              ListWrapper.forEach(directiveBinder.hostPropertyBindings, (function(binding) {
                var dirIndex = new DirectiveIndex(boundElementIndex, i);
                if (binding.type === renderApi.PropertyBindingType.PROPERTY) {
                  bindings.push(BindingRecord.createForHostProperty(dirIndex, binding.astWithSource, binding.property));
                } else if (binding.type === renderApi.PropertyBindingType.ATTRIBUTE) {
                  bindings.push(BindingRecord.createForHostAttribute(dirIndex, binding.astWithSource, binding.property));
                } else if (binding.type === renderApi.PropertyBindingType.CLASS) {
                  bindings.push(BindingRecord.createForHostClass(dirIndex, binding.astWithSource, binding.property));
                } else if (binding.type === renderApi.PropertyBindingType.STYLE) {
                  bindings.push(BindingRecord.createForHostStyle(dirIndex, binding.astWithSource, binding.property, binding.unit));
                }
              }));
            }
          },
          _getDirectiveRecord: function(boundElementIndex, directiveIndex, directiveMetadata) {
            var id = boundElementIndex * 100 + directiveIndex;
            if (!this._directiveRecordsMap.has(id)) {
              this._directiveRecordsMap.set(id, new DirectiveRecord({
                directiveIndex: new DirectiveIndex(boundElementIndex, directiveIndex),
                callOnAllChangesDone: directiveMetadata.callOnAllChangesDone,
                callOnChange: directiveMetadata.callOnChange,
                callOnCheck: directiveMetadata.callOnCheck,
                callOnInit: directiveMetadata.callOnInit,
                changeDetection: directiveMetadata.changeDetection
              }));
            }
            return this._directiveRecordsMap.get(id);
          }
        }, {});
      }());
      ProtoViewFactory = (($traceurRuntime.createClass)(function(_changeDetection) {
        this._changeDetection = _changeDetection;
      }, {createAppProtoViews: function(hostComponentBinding, rootRenderProtoView, allDirectives) {
          var $__0 = this;
          var allRenderDirectiveMetadata = ListWrapper.map(allDirectives, (function(directiveBinding) {
            return directiveBinding.metadata;
          }));
          var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
          var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
          var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);
          var changeDetectorDefs = _getChangeDetectorDefinitions(hostComponentBinding.metadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata);
          var protoChangeDetectors = ListWrapper.map(changeDetectorDefs, (function(changeDetectorDef) {
            return $__0._changeDetection.createProtoChangeDetector(changeDetectorDef);
          }));
          var appProtoViews = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
          ListWrapper.forEach(nestedPvsWithIndex, (function(pvWithIndex) {
            var appProtoView = _createAppProtoView(pvWithIndex.renderProtoView, protoChangeDetectors[pvWithIndex.index], nestedPvVariableBindings[pvWithIndex.index], allDirectives);
            if (isPresent(pvWithIndex.parentIndex)) {
              var parentView = appProtoViews[pvWithIndex.parentIndex];
              parentView.elementBinders[pvWithIndex.boundElementIndex].nestedProtoView = appProtoView;
            }
            appProtoViews[pvWithIndex.index] = appProtoView;
          }));
          return appProtoViews;
        }}, {}));
      $__export("ProtoViewFactory", ProtoViewFactory);
      $__export("ProtoViewFactory", ProtoViewFactory = __decorate([Injectable(), __metadata('design:paramtypes', [ChangeDetection])], ProtoViewFactory));
      RenderProtoViewWithIndex = (function() {
        function RenderProtoViewWithIndex(renderProtoView, index, parentIndex, boundElementIndex) {
          this.renderProtoView = renderProtoView;
          this.index = index;
          this.parentIndex = parentIndex;
          this.boundElementIndex = boundElementIndex;
        }
        return ($traceurRuntime.createClass)(RenderProtoViewWithIndex, {}, {});
      }());
      ParentProtoElementInjectorWithDistance = (function() {
        function ParentProtoElementInjectorWithDistance(protoElementInjector, distance) {
          this.protoElementInjector = protoElementInjector;
          this.distance = distance;
        }
        return ($traceurRuntime.createClass)(ParentProtoElementInjectorWithDistance, {}, {});
      }());
    }
  };
});

System.register("angular2/src/services/url_resolver", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/services/url_resolver";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      isBlank,
      RegExpWrapper,
      ListWrapper,
      UrlResolver,
      _splitRe,
      _ComponentIndex;
  function _buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (isPresent(opt_scheme)) {
      out.push(opt_scheme + ':');
    }
    if (isPresent(opt_domain)) {
      out.push('//');
      if (isPresent(opt_userInfo)) {
        out.push(opt_userInfo + '@');
      }
      out.push(opt_domain);
      if (isPresent(opt_port)) {
        out.push(':' + opt_port);
      }
    }
    if (isPresent(opt_path)) {
      out.push(opt_path);
    }
    if (isPresent(opt_queryData)) {
      out.push('?' + opt_queryData);
    }
    if (isPresent(opt_fragment)) {
      out.push('#' + opt_fragment);
    }
    return out.join('');
  }
  function _split(uri) {
    return RegExpWrapper.firstMatch(_splitRe, uri);
  }
  function _removeDotSegments(path) {
    if (path == '/')
      return '/';
    var leadingSlash = path[0] == '/' ? '/' : '';
    var trailingSlash = path[path.length - 1] === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length > 0) {
            ListWrapper.removeAt(out, out.length - 1);
          } else {
            up++;
          }
          break;
        default:
          out.push(segment);
      }
    }
    if (leadingSlash == '') {
      while (up-- > 0) {
        ListWrapper.insert(out, 0, '..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function _joinAndCanonicalizePath(parts) {
    var path = parts[_ComponentIndex.PATH];
    path = isBlank(path) ? '' : _removeDotSegments(path);
    parts[_ComponentIndex.PATH] = path;
    return _buildFromEncodedParts(parts[_ComponentIndex.SCHEME], parts[_ComponentIndex.USER_INFO], parts[_ComponentIndex.DOMAIN], parts[_ComponentIndex.PORT], path, parts[_ComponentIndex.QUERY_DATA], parts[_ComponentIndex.FRAGMENT]);
  }
  function _resolveUrl(base, url) {
    var parts = _split(url);
    var baseParts = _split(base);
    if (isPresent(parts[_ComponentIndex.SCHEME])) {
      return _joinAndCanonicalizePath(parts);
    } else {
      parts[_ComponentIndex.SCHEME] = baseParts[_ComponentIndex.SCHEME];
    }
    for (var i = _ComponentIndex.SCHEME; i <= _ComponentIndex.PORT; i++) {
      if (isBlank(parts[i])) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[_ComponentIndex.PATH][0] == '/') {
      return _joinAndCanonicalizePath(parts);
    }
    var path = baseParts[_ComponentIndex.PATH];
    if (isBlank(path))
      path = '/';
    var index = path.lastIndexOf('/');
    path = path.substring(0, index + 1) + parts[_ComponentIndex.PATH];
    parts[_ComponentIndex.PATH] = path;
    return _joinAndCanonicalizePath(parts);
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      RegExpWrapper = $__m.RegExpWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      UrlResolver = (($traceurRuntime.createClass)(function() {}, {resolve: function(baseUrl, url) {
          return _resolveUrl(baseUrl, url);
        }}, {}));
      $__export("UrlResolver", UrlResolver);
      $__export("UrlResolver", UrlResolver = __decorate([Injectable(), __metadata('design:paramtypes', [])], UrlResolver));
      _splitRe = RegExpWrapper.create('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
      (function(_ComponentIndex) {
        _ComponentIndex[_ComponentIndex["SCHEME"] = 1] = "SCHEME";
        _ComponentIndex[_ComponentIndex["USER_INFO"] = 2] = "USER_INFO";
        _ComponentIndex[_ComponentIndex["DOMAIN"] = 3] = "DOMAIN";
        _ComponentIndex[_ComponentIndex["PORT"] = 4] = "PORT";
        _ComponentIndex[_ComponentIndex["PATH"] = 5] = "PATH";
        _ComponentIndex[_ComponentIndex["QUERY_DATA"] = 6] = "QUERY_DATA";
        _ComponentIndex[_ComponentIndex["FRAGMENT"] = 7] = "FRAGMENT";
      })(_ComponentIndex || (_ComponentIndex = {}));
    }
  };
});

System.register("angular2/src/services/app_root_url", ["angular2/di", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/services/app_root_url";
  var __decorate,
      __metadata,
      Injectable,
      isBlank,
      DOM,
      AppRootUrl;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      AppRootUrl = (($traceurRuntime.createClass)(function() {}, {get value() {
          if (isBlank(this._value)) {
            var a = DOM.createElement('a');
            DOM.resolveAndSetHref(a, './', null);
            this._value = DOM.getHref(a);
          }
          return this._value;
        }}, {}));
      $__export("AppRootUrl", AppRootUrl);
      $__export("AppRootUrl", AppRootUrl = __decorate([Injectable(), __metadata('design:paramtypes', [])], AppRootUrl));
    }
  };
});

System.register("angular2/src/core/exception_handler", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/exception_handler";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      ListWrapper,
      isListLikeIterable,
      DOM,
      ExceptionHandler;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      isListLikeIterable = $__m.isListLikeIterable;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ExceptionHandler = (($traceurRuntime.createClass)(function() {}, {call: function(error) {
          var stackTrace = arguments[1] !== (void 0) ? arguments[1] : null;
          var reason = arguments[2] !== (void 0) ? arguments[2] : null;
          var longStackTrace = isListLikeIterable(stackTrace) ? ListWrapper.join(stackTrace, "\n\n") : stackTrace;
          var reasonStr = isPresent(reason) ? ("\n" + reason) : '';
          DOM.logError(("" + error + reasonStr + "\nSTACKTRACE:\n" + longStackTrace));
        }}, {}));
      $__export("ExceptionHandler", ExceptionHandler);
      $__export("ExceptionHandler", ExceptionHandler = __decorate([Injectable(), __metadata('design:paramtypes', [])], ExceptionHandler));
    }
  };
});

System.register("angular2/src/render/xhr", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/xhr";
  var XHR;
  return {
    setters: [],
    execute: function() {
      XHR = (function() {
        function XHR() {}
        return ($traceurRuntime.createClass)(XHR, {get: function(url) {
            return null;
          }}, {});
      }());
      $__export("XHR", XHR);
    }
  };
});

System.register("angular2/src/render/dom/compiler/style_url_resolver", ["angular2/di", "angular2/src/facade/lang", "angular2/src/services/url_resolver"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/style_url_resolver";
  var __decorate,
      __metadata,
      Injectable,
      RegExpWrapper,
      StringWrapper,
      UrlResolver,
      StyleUrlResolver,
      _cssUrlRe,
      _cssImportRe,
      _quoteRe;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      RegExpWrapper = $__m.RegExpWrapper;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      StyleUrlResolver = (($traceurRuntime.createClass)(function(_resolver) {
        this._resolver = _resolver;
      }, {
        resolveUrls: function(cssText, baseUrl) {
          cssText = this._replaceUrls(cssText, _cssUrlRe, baseUrl);
          cssText = this._replaceUrls(cssText, _cssImportRe, baseUrl);
          return cssText;
        },
        _replaceUrls: function(cssText, re, baseUrl) {
          var $__0 = this;
          return StringWrapper.replaceAllMapped(cssText, re, (function(m) {
            var pre = m[1];
            var url = StringWrapper.replaceAll(m[2], _quoteRe, '');
            var post = m[3];
            var resolvedUrl = $__0._resolver.resolve(baseUrl, url);
            return pre + "'" + resolvedUrl + "'" + post;
          }));
        }
      }, {}));
      $__export("StyleUrlResolver", StyleUrlResolver);
      $__export("StyleUrlResolver", StyleUrlResolver = __decorate([Injectable(), __metadata('design:paramtypes', [UrlResolver])], StyleUrlResolver));
      _cssUrlRe = RegExpWrapper.create('(url\\()([^)]*)(\\))');
      _cssImportRe = RegExpWrapper.create('(@import[\\s]+(?!url\\())[\'"]([^\'"]*)[\'"](.*;)');
      _quoteRe = RegExpWrapper.create('[\'"]');
    }
  };
});

System.register("angular2/src/core/zone/ng_zone", ["angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/zone/ng_zone";
  var StringMapWrapper,
      normalizeBlank,
      isPresent,
      global,
      NgZone;
  return {
    setters: [function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      normalizeBlank = $__m.normalizeBlank;
      isPresent = $__m.isPresent;
      global = $__m.global;
    }],
    execute: function() {
      NgZone = (function() {
        function NgZone($__1) {
          var enableLongStackTrace = $__1.enableLongStackTrace;
          this._inVmTurnDone = false;
          this._onTurnStart = null;
          this._onTurnDone = null;
          this._onErrorHandler = null;
          this._pendingMicrotasks = 0;
          this._hasExecutedCodeInInnerZone = false;
          this._nestedRun = 0;
          if (global.zone) {
            this._disabled = false;
            this._mountZone = global.zone;
            this._innerZone = this._createInnerZone(this._mountZone, enableLongStackTrace);
          } else {
            this._disabled = true;
            this._mountZone = null;
          }
        }
        return ($traceurRuntime.createClass)(NgZone, {
          initCallbacks: function() {
            var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
                onTurnStart = $__1.onTurnStart,
                onTurnDone = $__1.onTurnDone,
                onErrorHandler = $__1.onErrorHandler;
            this._onTurnStart = normalizeBlank(onTurnStart);
            this._onTurnDone = normalizeBlank(onTurnDone);
            this._onErrorHandler = normalizeBlank(onErrorHandler);
          },
          run: function(fn) {
            if (this._disabled) {
              return fn();
            } else {
              return this._innerZone.run(fn);
            }
          },
          runOutsideAngular: function(fn) {
            if (this._disabled) {
              return fn();
            } else {
              return this._mountZone.run(fn);
            }
          },
          _createInnerZone: function(zone, enableLongStackTrace) {
            var ngZone = this;
            var errorHandling;
            if (enableLongStackTrace) {
              errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, {onError: function(e) {
                  ngZone._onError(this, e);
                }});
            } else {
              errorHandling = {onError: function(e) {
                  ngZone._onError(this, e);
                }};
            }
            return zone.fork(errorHandling).fork({
              '$run': function(parentRun) {
                return function() {
                  try {
                    ngZone._nestedRun++;
                    if (!ngZone._hasExecutedCodeInInnerZone) {
                      ngZone._hasExecutedCodeInInnerZone = true;
                      if (ngZone._onTurnStart) {
                        parentRun.call(ngZone._innerZone, ngZone._onTurnStart);
                      }
                    }
                    return parentRun.apply(this, arguments);
                  } finally {
                    ngZone._nestedRun--;
                    if (ngZone._pendingMicrotasks == 0 && ngZone._nestedRun == 0 && !this._inVmTurnDone) {
                      if (ngZone._onTurnDone && ngZone._hasExecutedCodeInInnerZone) {
                        try {
                          this._inVmTurnDone = true;
                          parentRun.call(ngZone._innerZone, ngZone._onTurnDone);
                        } finally {
                          this._inVmTurnDone = false;
                          ngZone._hasExecutedCodeInInnerZone = false;
                        }
                      }
                    }
                  }
                };
              },
              '$scheduleMicrotask': function(parentScheduleMicrotask) {
                return function(fn) {
                  ngZone._pendingMicrotasks++;
                  var microtask = function() {
                    try {
                      fn();
                    } finally {
                      ngZone._pendingMicrotasks--;
                    }
                  };
                  parentScheduleMicrotask.call(this, microtask);
                };
              },
              _innerZone: true
            });
          },
          _onError: function(zone, e) {
            if (isPresent(this._onErrorHandler)) {
              var trace = [normalizeBlank(e.stack)];
              while (zone && zone.constructedAtException) {
                trace.push(zone.constructedAtException.get());
                zone = zone.parent;
              }
              this._onErrorHandler(e, trace);
            } else {
              console.log('## _onError ##');
              console.log(e.stack);
              throw e;
            }
          }
        }, {});
      }());
      $__export("NgZone", NgZone);
    }
  };
});

System.register("angular2/src/core/life_cycle/life_cycle", ["angular2/di", "angular2/src/core/exception_handler", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/life_cycle/life_cycle";
  var __decorate,
      __metadata,
      Injectable,
      ExceptionHandler,
      isPresent,
      BaseException,
      LifeCycle;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ExceptionHandler = $__m.ExceptionHandler;
    }, function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      LifeCycle = (($traceurRuntime.createClass)(function(exceptionHandler) {
        var changeDetector = arguments[1] !== (void 0) ? arguments[1] : null;
        var enforceNoNewChanges = arguments[2] !== (void 0) ? arguments[2] : false;
        this._runningTick = false;
        this._errorHandler = (function(exception, stackTrace) {
          exceptionHandler.call(exception, stackTrace);
          throw exception;
        });
        this._changeDetector = changeDetector;
        this._enforceNoNewChanges = enforceNoNewChanges;
      }, {
        registerWith: function(zone) {
          var changeDetector = arguments[1] !== (void 0) ? arguments[1] : null;
          var $__0 = this;
          if (isPresent(changeDetector)) {
            this._changeDetector = changeDetector;
          }
          zone.initCallbacks({
            onErrorHandler: this._errorHandler,
            onTurnDone: (function() {
              return $__0.tick();
            })
          });
        },
        tick: function() {
          if (this._runningTick) {
            throw new BaseException("LifeCycle.tick is called recursively");
          }
          try {
            this._runningTick = true;
            this._changeDetector.detectChanges();
            if (this._enforceNoNewChanges) {
              this._changeDetector.checkNoChanges();
            }
          } finally {
            this._runningTick = false;
          }
        }
      }, {}));
      $__export("LifeCycle", LifeCycle);
      $__export("LifeCycle", LifeCycle = __decorate([Injectable(), __metadata('design:paramtypes', [ExceptionHandler, Object, Boolean])], LifeCycle));
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/shadow_dom_strategy", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/shadow_dom_strategy";
  var ShadowDomStrategy;
  return {
    setters: [],
    execute: function() {
      ShadowDomStrategy = (function() {
        function ShadowDomStrategy() {}
        return ($traceurRuntime.createClass)(ShadowDomStrategy, {
          hasNativeContentElement: function() {
            return true;
          },
          prepareShadowRoot: function(el) {
            return null;
          },
          constructLightDom: function(lightDomView, el) {
            return null;
          },
          processStyleElement: function(hostComponentId, templateUrl, styleElement) {},
          processElement: function(hostComponentId, elementComponentId, element) {}
        }, {});
      }());
      $__export("ShadowDomStrategy", ShadowDomStrategy);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/light_dom", ["angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/light_dom";
  var DOM,
      ListWrapper,
      isPresent,
      DestinationLightDom,
      _Root,
      LightDom;
  function redistributeNodes(contents, nodes) {
    for (var i = 0; i < contents.length; ++i) {
      var content = contents[i];
      var select = content.select;
      if (select.length === 0) {
        content.insert(ListWrapper.clone(nodes));
        ListWrapper.clear(nodes);
      } else {
        var matchSelector = (function(n) {
          return DOM.elementMatches(n, select);
        });
        var matchingNodes = ListWrapper.filter(nodes, matchSelector);
        content.insert(matchingNodes);
        ListWrapper.removeAll(nodes, matchingNodes);
      }
    }
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (isPresent(node.parentNode)) {
        DOM.remove(nodes[i]);
      }
    }
  }
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      DestinationLightDom = (function() {
        function DestinationLightDom() {}
        return ($traceurRuntime.createClass)(DestinationLightDom, {}, {});
      }());
      $__export("DestinationLightDom", DestinationLightDom);
      _Root = (function() {
        function _Root(node, boundElement) {
          this.node = node;
          this.boundElement = boundElement;
        }
        return ($traceurRuntime.createClass)(_Root, {}, {});
      }());
      LightDom = (function() {
        function LightDom(lightDomView, element) {
          this.shadowDomView = null;
          this._roots = null;
          this.lightDomView = lightDomView;
          this.nodes = DOM.childNodesAsList(element);
        }
        return ($traceurRuntime.createClass)(LightDom, {
          attachShadowDomView: function(shadowDomView) {
            this.shadowDomView = shadowDomView;
          },
          detachShadowDomView: function() {
            this.shadowDomView = null;
          },
          redistribute: function() {
            redistributeNodes(this.contentTags(), this.expandedDomNodes());
          },
          contentTags: function() {
            if (isPresent(this.shadowDomView)) {
              return this._collectAllContentTags(this.shadowDomView, []);
            } else {
              return [];
            }
          },
          _collectAllContentTags: function(view, acc) {
            var $__0 = this;
            if (view.proto.transitiveContentTagCount === 0) {
              return acc;
            }
            var els = view.boundElements;
            for (var i = 0; i < els.length; i++) {
              var el = els[i];
              if (isPresent(el.contentTag)) {
                acc.push(el.contentTag);
              }
              if (isPresent(el.viewContainer)) {
                ListWrapper.forEach(el.viewContainer.contentTagContainers(), (function(view) {
                  $__0._collectAllContentTags(view, acc);
                }));
              }
            }
            return acc;
          },
          expandedDomNodes: function() {
            var res = [];
            var roots = this._findRoots();
            for (var i = 0; i < roots.length; ++i) {
              var root = roots[i];
              if (isPresent(root.boundElement)) {
                var vc = root.boundElement.viewContainer;
                var content = root.boundElement.contentTag;
                if (isPresent(vc)) {
                  res = ListWrapper.concat(res, vc.nodes());
                } else if (isPresent(content)) {
                  res = ListWrapper.concat(res, content.nodes());
                } else {
                  res.push(root.node);
                }
              } else {
                res.push(root.node);
              }
            }
            return res;
          },
          _findRoots: function() {
            if (isPresent(this._roots))
              return this._roots;
            var boundElements = this.lightDomView.boundElements;
            this._roots = ListWrapper.map(this.nodes, (function(n) {
              var boundElement = null;
              for (var i = 0; i < boundElements.length; i++) {
                var boundEl = boundElements[i];
                if (isPresent(boundEl) && boundEl.element === n) {
                  boundElement = boundEl;
                  break;
                }
              }
              return new _Root(n, boundElement);
            }));
            return this._roots;
          }
        }, {});
      }());
      $__export("LightDom", LightDom);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/shadow_css", ["angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/shadow_css";
  var DOM,
      ListWrapper,
      StringWrapper,
      RegExpWrapper,
      RegExpMatcherWrapper,
      isPresent,
      isBlank,
      ShadowCss,
      _cssContentNextSelectorRe,
      _cssContentRuleRe,
      _cssContentUnscopedRuleRe,
      _polyfillHost,
      _polyfillHostContext,
      _parenSuffix,
      _cssColonHostRe,
      _cssColonHostContextRe,
      _polyfillHostNoCombinator,
      _shadowDOMSelectorsRe,
      _selectorReSuffix,
      _polyfillHostRe,
      _colonHostRe,
      _colonHostContextRe;
  function _cssToRules(cssText) {
    return DOM.cssToRules(cssText);
  }
  function _withCssRules(cssText, callback) {
    if (isBlank(callback))
      return ;
    var rules = _cssToRules(cssText);
    callback(rules);
  }
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      StringWrapper = $__m.StringWrapper;
      RegExpWrapper = $__m.RegExpWrapper;
      RegExpMatcherWrapper = $__m.RegExpMatcherWrapper;
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      ShadowCss = (function() {
        function ShadowCss() {
          this.strictStyling = true;
        }
        return ($traceurRuntime.createClass)(ShadowCss, {
          shimStyle: function(style, selector) {
            var hostSelector = arguments[2] !== (void 0) ? arguments[2] : '';
            var cssText = DOM.getText(style);
            return this.shimCssText(cssText, selector, hostSelector);
          },
          shimCssText: function(cssText, selector) {
            var hostSelector = arguments[2] !== (void 0) ? arguments[2] : '';
            cssText = this._insertDirectives(cssText);
            return this._scopeCssText(cssText, selector, hostSelector);
          },
          _insertDirectives: function(cssText) {
            cssText = this._insertPolyfillDirectivesInCssText(cssText);
            return this._insertPolyfillRulesInCssText(cssText);
          },
          _insertPolyfillDirectivesInCssText: function(cssText) {
            return StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe, function(m) {
              return m[1] + '{';
            });
          },
          _insertPolyfillRulesInCssText: function(cssText) {
            return StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function(m) {
              var rule = m[0];
              rule = StringWrapper.replace(rule, m[1], '');
              rule = StringWrapper.replace(rule, m[2], '');
              return m[3] + rule;
            });
          },
          _scopeCssText: function(cssText, scopeSelector, hostSelector) {
            var $__0 = this;
            var unscoped = this._extractUnscopedRulesFromCssText(cssText);
            cssText = this._insertPolyfillHostInCssText(cssText);
            cssText = this._convertColonHost(cssText);
            cssText = this._convertColonHostContext(cssText);
            cssText = this._convertShadowDOMSelectors(cssText);
            if (isPresent(scopeSelector)) {
              _withCssRules(cssText, (function(rules) {
                cssText = $__0._scopeRules(rules, scopeSelector, hostSelector);
              }));
            }
            cssText = cssText + '\n' + unscoped;
            return cssText.trim();
          },
          _extractUnscopedRulesFromCssText: function(cssText) {
            var r = '',
                m;
            var matcher = RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
            while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
              var rule = m[0];
              rule = StringWrapper.replace(rule, m[2], '');
              rule = StringWrapper.replace(rule, m[1], m[3]);
              r = rule + '\n\n';
            }
            return r;
          },
          _convertColonHost: function(cssText) {
            return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
          },
          _convertColonHostContext: function(cssText) {
            return this._convertColonRule(cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
          },
          _convertColonRule: function(cssText, regExp, partReplacer) {
            return StringWrapper.replaceAllMapped(cssText, regExp, function(m) {
              if (isPresent(m[2])) {
                var parts = m[2].split(','),
                    r = [];
                for (var i = 0; i < parts.length; i++) {
                  var p = parts[i];
                  if (isBlank(p))
                    break;
                  p = p.trim();
                  r.push(partReplacer(_polyfillHostNoCombinator, p, m[3]));
                }
                return r.join(',');
              } else {
                return _polyfillHostNoCombinator + m[3];
              }
            });
          },
          _colonHostContextPartReplacer: function(host, part, suffix) {
            if (StringWrapper.contains(part, _polyfillHost)) {
              return this._colonHostPartReplacer(host, part, suffix);
            } else {
              return host + part + suffix + ', ' + part + ' ' + host + suffix;
            }
          },
          _colonHostPartReplacer: function(host, part, suffix) {
            return host + StringWrapper.replace(part, _polyfillHost, '') + suffix;
          },
          _convertShadowDOMSelectors: function(cssText) {
            for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
              cssText = StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
            }
            return cssText;
          },
          _scopeRules: function(cssRules, scopeSelector, hostSelector) {
            var cssText = '';
            if (isPresent(cssRules)) {
              for (var i = 0; i < cssRules.length; i++) {
                var rule = cssRules[i];
                if (DOM.isStyleRule(rule) || DOM.isPageRule(rule)) {
                  cssText += this._scopeSelector(rule.selectorText, scopeSelector, hostSelector, this.strictStyling) + ' {\n';
                  cssText += this._propertiesFromRule(rule) + '\n}\n\n';
                } else if (DOM.isMediaRule(rule)) {
                  cssText += '@media ' + rule.media.mediaText + ' {\n';
                  cssText += this._scopeRules(rule.cssRules, scopeSelector, hostSelector);
                  cssText += '\n}\n\n';
                } else {
                  try {
                    if (isPresent(rule.cssText)) {
                      cssText += rule.cssText + '\n\n';
                    }
                  } catch (x) {
                    if (DOM.isKeyframesRule(rule) && isPresent(rule.cssRules)) {
                      cssText += this._ieSafeCssTextFromKeyFrameRule(rule);
                    }
                  }
                }
              }
            }
            return cssText;
          },
          _ieSafeCssTextFromKeyFrameRule: function(rule) {
            var cssText = '@keyframes ' + rule.name + ' {';
            for (var i = 0; i < rule.cssRules.length; i++) {
              var r = rule.cssRules[i];
              cssText += ' ' + r.keyText + ' {' + r.style.cssText + '}';
            }
            cssText += ' }';
            return cssText;
          },
          _scopeSelector: function(selector, scopeSelector, hostSelector, strict) {
            var r = [],
                parts = selector.split(',');
            for (var i = 0; i < parts.length; i++) {
              var p = parts[i];
              p = p.trim();
              if (this._selectorNeedsScoping(p, scopeSelector)) {
                p = strict && !StringWrapper.contains(p, _polyfillHostNoCombinator) ? this._applyStrictSelectorScope(p, scopeSelector) : this._applySelectorScope(p, scopeSelector, hostSelector);
              }
              r.push(p);
            }
            return r.join(', ');
          },
          _selectorNeedsScoping: function(selector, scopeSelector) {
            var re = this._makeScopeMatcher(scopeSelector);
            return !isPresent(RegExpWrapper.firstMatch(re, selector));
          },
          _makeScopeMatcher: function(scopeSelector) {
            var lre = RegExpWrapper.create('\\[');
            var rre = RegExpWrapper.create('\\]');
            scopeSelector = StringWrapper.replaceAll(scopeSelector, lre, '\\[');
            scopeSelector = StringWrapper.replaceAll(scopeSelector, rre, '\\]');
            return RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
          },
          _applySelectorScope: function(selector, scopeSelector, hostSelector) {
            return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
          },
          _applySimpleSelectorScope: function(selector, scopeSelector, hostSelector) {
            if (isPresent(RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
              var replaceBy = this.strictStyling ? ("[" + hostSelector + "]") : scopeSelector;
              selector = StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
              return StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
            } else {
              return scopeSelector + ' ' + selector;
            }
          },
          _applyStrictSelectorScope: function(selector, scopeSelector) {
            var isRe = RegExpWrapper.create('\\[is=([^\\]]*)\\]');
            scopeSelector = StringWrapper.replaceAllMapped(scopeSelector, isRe, (function(m) {
              return m[1];
            }));
            var splits = [' ', '>', '+', '~'],
                scoped = selector,
                attrName = '[' + scopeSelector + ']';
            for (var i = 0; i < splits.length; i++) {
              var sep = splits[i];
              var parts = scoped.split(sep);
              scoped = ListWrapper.map(parts, function(p) {
                var t = StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
                if (t.length > 0 && !ListWrapper.contains(splits, t) && !StringWrapper.contains(t, attrName)) {
                  var re = RegExpWrapper.create('([^:]*)(:*)(.*)');
                  var m = RegExpWrapper.firstMatch(re, t);
                  if (isPresent(m)) {
                    p = m[1] + attrName + m[2] + m[3];
                  }
                }
                return p;
              }).join(sep);
            }
            return scoped;
          },
          _insertPolyfillHostInCssText: function(selector) {
            selector = StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
            selector = StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
            return selector;
          },
          _propertiesFromRule: function(rule) {
            var cssText = rule.style.cssText;
            var attrRe = RegExpWrapper.create('[\'"]+|attr');
            if (rule.style.content.length > 0 && !isPresent(RegExpWrapper.firstMatch(attrRe, rule.style.content))) {
              var contentRe = RegExpWrapper.create('content:[^;]*;');
              cssText = StringWrapper.replaceAll(cssText, contentRe, 'content: \'' + rule.style.content + '\';');
            }
            return cssText;
          }
        }, {});
      }());
      $__export("ShadowCss", ShadowCss);
      _cssContentNextSelectorRe = RegExpWrapper.create('polyfill-next-selector[^}]*content:[\\s]*?[\'"](.*?)[\'"][;\\s]*}([^{]*?){', 'im');
      _cssContentRuleRe = RegExpWrapper.create('(polyfill-rule)[^}]*(content:[\\s]*[\'"](.*?)[\'"])[;\\s]*[^}]*}', 'im');
      _cssContentUnscopedRuleRe = RegExpWrapper.create('(polyfill-unscoped-rule)[^}]*(content:[\\s]*[\'"](.*?)[\'"])[;\\s]*[^}]*}', 'im');
      _polyfillHost = '-shadowcsshost';
      _polyfillHostContext = '-shadowcsscontext';
      _parenSuffix = ')(?:\\((' + '(?:\\([^)(]*\\)|[^)(]*)+?' + ')\\))?([^,{]*)';
      _cssColonHostRe = RegExpWrapper.create('(' + _polyfillHost + _parenSuffix, 'im');
      _cssColonHostContextRe = RegExpWrapper.create('(' + _polyfillHostContext + _parenSuffix, 'im');
      _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
      _shadowDOMSelectorsRe = [RegExpWrapper.create('>>>'), RegExpWrapper.create('::shadow'), RegExpWrapper.create('::content'), RegExpWrapper.create('/deep/'), RegExpWrapper.create('/shadow-deep/'), RegExpWrapper.create('/shadow/')];
      _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
      _polyfillHostRe = RegExpWrapper.create(_polyfillHost, 'im');
      _colonHostRe = RegExpWrapper.create(':host', 'im');
      _colonHostContextRe = RegExpWrapper.create(':host-context', 'im');
    }
  };
});

System.register("angular2/src/render/xhr_impl", ["angular2/di", "angular2/src/facade/async", "angular2/src/render/xhr"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/xhr_impl";
  var __decorate,
      __metadata,
      Injectable,
      PromiseWrapper,
      XHR,
      XHRImpl;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      XHR = $__m.XHR;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      XHRImpl = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)($__0, {get: function(url) {
            var completer = PromiseWrapper.completer();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'text';
            xhr.onload = function() {
              var response = ('response' in xhr) ? xhr.response : xhr.responseText;
              var status = xhr.status === 1223 ? 204 : xhr.status;
              if (status === 0) {
                status = response ? 200 : 0;
              }
              if (200 <= status && status <= 300) {
                completer.resolve(response);
              } else {
                completer.reject(("Failed to load " + url), null);
              }
            };
            xhr.onerror = function() {
              completer.reject(("Failed to load " + url), null);
            };
            xhr.send();
            return completer.promise;
          }}, {}, $__super);
      }(XHR));
      $__export("XHRImpl", XHRImpl);
      $__export("XHRImpl", XHRImpl = __decorate([Injectable(), __metadata('design:paramtypes', [])], XHRImpl));
    }
  };
});

System.register("angular2/src/render/dom/events/event_manager", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/event_manager";
  var BaseException,
      StringWrapper,
      DOM,
      BUBBLE_SYMBOL,
      EventManager,
      EventManagerPlugin,
      DomEventsPlugin;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      BUBBLE_SYMBOL = '^';
      EventManager = (function() {
        function EventManager(_plugins, _zone) {
          this._plugins = _plugins;
          this._zone = _zone;
          for (var i = 0; i < _plugins.length; i++) {
            _plugins[i].manager = this;
          }
        }
        return ($traceurRuntime.createClass)(EventManager, {
          addEventListener: function(element, eventName, handler) {
            var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
            var plugin = this._findPluginFor(withoutBubbleSymbol);
            plugin.addEventListener(element, withoutBubbleSymbol, handler, withoutBubbleSymbol != eventName);
          },
          addGlobalEventListener: function(target, eventName, handler) {
            var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
            var plugin = this._findPluginFor(withoutBubbleSymbol);
            return plugin.addGlobalEventListener(target, withoutBubbleSymbol, handler, withoutBubbleSymbol != eventName);
          },
          getZone: function() {
            return this._zone;
          },
          _findPluginFor: function(eventName) {
            var plugins = this._plugins;
            for (var i = 0; i < plugins.length; i++) {
              var plugin = plugins[i];
              if (plugin.supports(eventName)) {
                return plugin;
              }
            }
            throw new BaseException(("No event manager plugin found for event " + eventName));
          },
          _removeBubbleSymbol: function(eventName) {
            return eventName[0] == BUBBLE_SYMBOL ? StringWrapper.substring(eventName, 1) : eventName;
          }
        }, {});
      }());
      $__export("EventManager", EventManager);
      EventManagerPlugin = (function() {
        function EventManagerPlugin() {}
        return ($traceurRuntime.createClass)(EventManagerPlugin, {
          supports: function(eventName) {
            return false;
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            throw "not implemented";
          },
          addGlobalEventListener: function(element, eventName, handler, shouldSupportBubble) {
            throw "not implemented";
          }
        }, {});
      }());
      $__export("EventManagerPlugin", EventManagerPlugin);
      DomEventsPlugin = (function($__super) {
        function DomEventsPlugin() {
          $traceurRuntime.superConstructor(DomEventsPlugin).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(DomEventsPlugin, {
          supports: function(eventName) {
            return true;
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            var outsideHandler = this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
            this.manager._zone.runOutsideAngular((function() {
              DOM.on(element, eventName, outsideHandler);
            }));
          },
          addGlobalEventListener: function(target, eventName, handler, shouldSupportBubble) {
            var element = DOM.getGlobalEventTarget(target);
            var outsideHandler = this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
            return this.manager._zone.runOutsideAngular((function() {
              return DOM.onAndCancel(element, eventName, outsideHandler);
            }));
          },
          _getOutsideHandler: function(shouldSupportBubble, element, handler, zone) {
            return shouldSupportBubble ? DomEventsPlugin.bubbleCallback(element, handler, zone) : DomEventsPlugin.sameElementCallback(element, handler, zone);
          }
        }, {
          sameElementCallback: function(element, handler, zone) {
            return (function(event) {
              if (event.target === element) {
                zone.run((function() {
                  return handler(event);
                }));
              }
            });
          },
          bubbleCallback: function(element, handler, zone) {
            return (function(event) {
              return zone.run((function() {
                return handler(event);
              }));
            });
          }
        }, $__super);
      }(EventManagerPlugin));
      $__export("DomEventsPlugin", DomEventsPlugin);
    }
  };
});

System.register("angular2/src/render/dom/events/key_events", ["angular2/src/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/render/dom/events/event_manager"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/key_events";
  var DOM,
      isPresent,
      StringWrapper,
      StringMapWrapper,
      ListWrapper,
      EventManagerPlugin,
      modifierKeys,
      modifierKeyGetters,
      KeyEventsPlugin;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      isPresent = $__m.isPresent;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      EventManagerPlugin = $__m.EventManagerPlugin;
    }],
    execute: function() {
      modifierKeys = ['alt', 'control', 'meta', 'shift'];
      modifierKeyGetters = {
        'alt': (function(event) {
          return event.altKey;
        }),
        'control': (function(event) {
          return event.ctrlKey;
        }),
        'meta': (function(event) {
          return event.metaKey;
        }),
        'shift': (function(event) {
          return event.shiftKey;
        })
      };
      KeyEventsPlugin = (function($__super) {
        function KeyEventsPlugin() {
          $traceurRuntime.superConstructor(KeyEventsPlugin).call(this);
        }
        return ($traceurRuntime.createClass)(KeyEventsPlugin, {
          supports: function(eventName) {
            return isPresent(KeyEventsPlugin.parseEventName(eventName));
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
            var outsideHandler = KeyEventsPlugin.eventCallback(element, shouldSupportBubble, StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
            this.manager.getZone().runOutsideAngular((function() {
              DOM.on(element, StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
            }));
          }
        }, {
          parseEventName: function(eventName) {
            var parts = eventName.toLowerCase().split('.');
            var domEventName = ListWrapper.removeAt(parts, 0);
            if ((parts.length === 0) || !(StringWrapper.equals(domEventName, 'keydown') || StringWrapper.equals(domEventName, 'keyup'))) {
              return null;
            }
            var key = KeyEventsPlugin._normalizeKey(ListWrapper.removeLast(parts));
            var fullKey = '';
            ListWrapper.forEach(modifierKeys, (function(modifierName) {
              if (ListWrapper.contains(parts, modifierName)) {
                ListWrapper.remove(parts, modifierName);
                fullKey += modifierName + '.';
              }
            }));
            fullKey += key;
            if (parts.length != 0 || key.length === 0) {
              return null;
            }
            var result = StringMapWrapper.create();
            StringMapWrapper.set(result, 'domEventName', domEventName);
            StringMapWrapper.set(result, 'fullKey', fullKey);
            return result;
          },
          getEventFullKey: function(event) {
            var fullKey = '';
            var key = DOM.getEventKey(event);
            key = key.toLowerCase();
            if (StringWrapper.equals(key, ' ')) {
              key = 'space';
            } else if (StringWrapper.equals(key, '.')) {
              key = 'dot';
            }
            ListWrapper.forEach(modifierKeys, (function(modifierName) {
              if (modifierName != key) {
                var modifierGetter = StringMapWrapper.get(modifierKeyGetters, modifierName);
                if (modifierGetter(event)) {
                  fullKey += modifierName + '.';
                }
              }
            }));
            fullKey += key;
            return fullKey;
          },
          eventCallback: function(element, shouldSupportBubble, fullKey, handler, zone) {
            return (function(event) {
              var correctElement = shouldSupportBubble || event.target === element;
              if (correctElement && StringWrapper.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
                zone.run((function() {
                  return handler(event);
                }));
              }
            });
          },
          _normalizeKey: function(keyName) {
            switch (keyName) {
              case 'esc':
                return 'escape';
              default:
                return keyName;
            }
          }
        }, $__super);
      }(EventManagerPlugin));
      $__export("KeyEventsPlugin", KeyEventsPlugin);
    }
  };
});

System.register("angular2/src/render/dom/events/hammer_common", ["angular2/src/render/dom/events/event_manager", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/hammer_common";
  var EventManagerPlugin,
      StringMapWrapper,
      _eventNames,
      HammerGesturesPluginCommon;
  return {
    setters: [function($__m) {
      EventManagerPlugin = $__m.EventManagerPlugin;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      _eventNames = {
        'pan': true,
        'panstart': true,
        'panmove': true,
        'panend': true,
        'pancancel': true,
        'panleft': true,
        'panright': true,
        'panup': true,
        'pandown': true,
        'pinch': true,
        'pinchstart': true,
        'pinchmove': true,
        'pinchend': true,
        'pinchcancel': true,
        'pinchin': true,
        'pinchout': true,
        'press': true,
        'pressup': true,
        'rotate': true,
        'rotatestart': true,
        'rotatemove': true,
        'rotateend': true,
        'rotatecancel': true,
        'swipe': true,
        'swipeleft': true,
        'swiperight': true,
        'swipeup': true,
        'swipedown': true,
        'tap': true
      };
      HammerGesturesPluginCommon = (function($__super) {
        function HammerGesturesPluginCommon() {
          $traceurRuntime.superConstructor(HammerGesturesPluginCommon).call(this);
        }
        return ($traceurRuntime.createClass)(HammerGesturesPluginCommon, {supports: function(eventName) {
            eventName = eventName.toLowerCase();
            return StringMapWrapper.contains(_eventNames, eventName);
          }}, {}, $__super);
      }(EventManagerPlugin));
      $__export("HammerGesturesPluginCommon", HammerGesturesPluginCommon);
    }
  };
});

System.register("angular2/src/core/compiler/dynamic_component_loader", ["angular2/di", "angular2/src/core/compiler/compiler", "angular2/src/core/compiler/view_manager"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/dynamic_component_loader";
  var __decorate,
      __metadata,
      Injectable,
      Compiler,
      AppViewManager,
      ComponentRef,
      DynamicComponentLoader;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      Compiler = $__m.Compiler;
    }, function($__m) {
      AppViewManager = $__m.AppViewManager;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ComponentRef = (function() {
        function ComponentRef(location, instance, dispose) {
          this.location = location;
          this.instance = instance;
          this.dispose = dispose;
        }
        return ($traceurRuntime.createClass)(ComponentRef, {get hostView() {
            return this.location.parentView;
          }}, {});
      }());
      $__export("ComponentRef", ComponentRef);
      DynamicComponentLoader = (($traceurRuntime.createClass)(function(_compiler, _viewManager) {
        this._compiler = _compiler;
        this._viewManager = _viewManager;
      }, {
        loadAsRoot: function(typeOrBinding, overrideSelector, injector) {
          var $__0 = this;
          return this._compiler.compileInHost(typeOrBinding).then((function(hostProtoViewRef) {
            var hostViewRef = $__0._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
            var newLocation = $__0._viewManager.getHostElement(hostViewRef);
            var component = $__0._viewManager.getComponent(newLocation);
            var dispose = (function() {
              $__0._viewManager.destroyRootHostView(hostViewRef);
            });
            return new ComponentRef(newLocation, component, dispose);
          }));
        },
        loadIntoLocation: function(typeOrBinding, hostLocation, anchorName) {
          var bindings = arguments[3] !== (void 0) ? arguments[3] : null;
          return this.loadNextToLocation(typeOrBinding, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName), bindings);
        },
        loadNextToLocation: function(typeOrBinding, location) {
          var bindings = arguments[2] !== (void 0) ? arguments[2] : null;
          var $__0 = this;
          return this._compiler.compileInHost(typeOrBinding).then((function(hostProtoViewRef) {
            var viewContainer = $__0._viewManager.getViewContainer(location);
            var hostViewRef = viewContainer.create(hostProtoViewRef, viewContainer.length, null, bindings);
            var newLocation = $__0._viewManager.getHostElement(hostViewRef);
            var component = $__0._viewManager.getComponent(newLocation);
            var dispose = (function() {
              var index = viewContainer.indexOf(hostViewRef);
              if (index !== -1) {
                viewContainer.remove(index);
              }
            });
            return new ComponentRef(newLocation, component, dispose);
          }));
        }
      }, {}));
      $__export("DynamicComponentLoader", DynamicComponentLoader);
      $__export("DynamicComponentLoader", DynamicComponentLoader = __decorate([Injectable(), __metadata('design:paramtypes', [Compiler, AppViewManager])], DynamicComponentLoader));
    }
  };
});

System.register("angular2/src/core/testability/get_testability", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/testability/get_testability";
  var global,
      PublicTestability,
      GetTestability;
  return {
    setters: [function($__m) {
      global = $__m.global;
    }],
    execute: function() {
      PublicTestability = (function() {
        function PublicTestability(testability) {
          this._testability = testability;
        }
        return ($traceurRuntime.createClass)(PublicTestability, {
          whenStable: function(callback) {
            this._testability.whenStable(callback);
          },
          findBindings: function(using, binding, exactMatch) {
            return this._testability.findBindings(using, binding, exactMatch);
          }
        }, {});
      }());
      GetTestability = (function() {
        function GetTestability() {}
        return ($traceurRuntime.createClass)(GetTestability, {}, {addToWindow: function(registry) {
            global.getAngularTestability = function(elem) {
              var testability = registry.findTestabilityInTree(elem);
              if (testability == null) {
                throw new Error('Could not find testability for element.');
              }
              return new PublicTestability(testability);
            };
          }});
      }());
      $__export("GetTestability", GetTestability);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/content_tag", ["angular2/src/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/content_tag";
  var DOM,
      isPresent,
      ListWrapper,
      ContentStrategy,
      RenderedContent,
      IntermediateContent,
      Content;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      ContentStrategy = (function() {
        function ContentStrategy() {}
        return ($traceurRuntime.createClass)(ContentStrategy, {insert: function(nodes) {}}, {});
      }());
      RenderedContent = (function($__super) {
        function RenderedContent(contentEl) {
          $traceurRuntime.superConstructor(RenderedContent).call(this);
          this.beginScript = contentEl;
          this.endScript = DOM.nextSibling(this.beginScript);
          this.nodes = [];
        }
        return ($traceurRuntime.createClass)(RenderedContent, {
          insert: function(nodes) {
            this.nodes = nodes;
            DOM.insertAllBefore(this.endScript, nodes);
            this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
          },
          _removeNodesUntil: function(node) {
            var p = DOM.parentElement(this.beginScript);
            for (var next = DOM.nextSibling(this.beginScript); next !== node; next = DOM.nextSibling(this.beginScript)) {
              DOM.removeChild(p, next);
            }
          }
        }, {}, $__super);
      }(ContentStrategy));
      IntermediateContent = (function($__super) {
        function IntermediateContent(destinationLightDom) {
          $traceurRuntime.superConstructor(IntermediateContent).call(this);
          this.destinationLightDom = destinationLightDom;
          this.nodes = [];
        }
        return ($traceurRuntime.createClass)(IntermediateContent, {insert: function(nodes) {
            this.nodes = nodes;
            this.destinationLightDom.redistribute();
          }}, {}, $__super);
      }(ContentStrategy));
      Content = (function() {
        function Content(contentStartElement, select) {
          this.contentStartElement = contentStartElement;
          this.select = select;
          this._strategy = null;
        }
        return ($traceurRuntime.createClass)(Content, {
          init: function(destinationLightDom) {
            this._strategy = isPresent(destinationLightDom) ? new IntermediateContent(destinationLightDom) : new RenderedContent(this.contentStartElement);
          },
          nodes: function() {
            return this._strategy.nodes;
          },
          insert: function(nodes) {
            this._strategy.insert(nodes);
          }
        }, {});
      }());
      $__export("Content", Content);
    }
  };
});

System.register("angular2/src/render/dom/util", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/util";
  var StringWrapper,
      RegExpWrapper,
      NG_BINDING_CLASS_SELECTOR,
      NG_BINDING_CLASS,
      EVENT_TARGET_SEPARATOR,
      CAMEL_CASE_REGEXP,
      DASH_CASE_REGEXP;
  function camelCaseToDashCase(input) {
    return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (function(m) {
      return '-' + m[1].toLowerCase();
    }));
  }
  function dashCaseToCamelCase(input) {
    return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (function(m) {
      return m[1].toUpperCase();
    }));
  }
  $__export("camelCaseToDashCase", camelCaseToDashCase);
  $__export("dashCaseToCamelCase", dashCaseToCamelCase);
  return {
    setters: [function($__m) {
      StringWrapper = $__m.StringWrapper;
      RegExpWrapper = $__m.RegExpWrapper;
    }],
    execute: function() {
      NG_BINDING_CLASS_SELECTOR = '.ng-binding';
      $__export("NG_BINDING_CLASS_SELECTOR", NG_BINDING_CLASS_SELECTOR);
      NG_BINDING_CLASS = 'ng-binding';
      $__export("NG_BINDING_CLASS", NG_BINDING_CLASS);
      EVENT_TARGET_SEPARATOR = ':';
      $__export("EVENT_TARGET_SEPARATOR", EVENT_TARGET_SEPARATOR);
      CAMEL_CASE_REGEXP = RegExpWrapper.create('([A-Z])');
      DASH_CASE_REGEXP = RegExpWrapper.create('-([a-z])');
    }
  };
});

System.register("angular2/src/render/dom/view/view", ["angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/render/api", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/view";
  var DOM,
      Map,
      isPresent,
      stringify,
      RenderViewRef,
      camelCaseToDashCase,
      DomViewRef,
      DomView;
  function resolveInternalDomView(viewRef) {
    return viewRef._view;
  }
  $__export("resolveInternalDomView", resolveInternalDomView);
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      Map = $__m.Map;
    }, function($__m) {
      isPresent = $__m.isPresent;
      stringify = $__m.stringify;
    }, function($__m) {
      RenderViewRef = $__m.RenderViewRef;
    }, function($__m) {
      camelCaseToDashCase = $__m.camelCaseToDashCase;
    }],
    execute: function() {
      DomViewRef = (function($__super) {
        function DomViewRef(_view) {
          $traceurRuntime.superConstructor(DomViewRef).call(this);
          this._view = _view;
        }
        return ($traceurRuntime.createClass)(DomViewRef, {}, {}, $__super);
      }(RenderViewRef));
      $__export("DomViewRef", DomViewRef);
      DomView = (function() {
        function DomView(proto, rootNodes, boundTextNodes, boundElements) {
          this.proto = proto;
          this.rootNodes = rootNodes;
          this.boundTextNodes = boundTextNodes;
          this.boundElements = boundElements;
          this.hostLightDom = null;
          this.shadowRoot = null;
          this.hydrated = false;
          this.eventDispatcher = null;
          this.eventHandlerRemovers = [];
        }
        return ($traceurRuntime.createClass)(DomView, {
          getDirectParentElement: function(boundElementIndex) {
            var binder = this.proto.elementBinders[boundElementIndex];
            var parent = null;
            if (binder.parentIndex !== -1 && binder.distanceToParent === 1) {
              parent = this.boundElements[binder.parentIndex];
            }
            return parent;
          },
          setElementProperty: function(elementIndex, propertyName, value) {
            DOM.setProperty(this.boundElements[elementIndex].element, propertyName, value);
          },
          setElementAttribute: function(elementIndex, attributeName, value) {
            var element = this.boundElements[elementIndex].element;
            var dashCasedAttributeName = camelCaseToDashCase(attributeName);
            if (isPresent(value)) {
              DOM.setAttribute(element, dashCasedAttributeName, stringify(value));
            } else {
              DOM.removeAttribute(element, dashCasedAttributeName);
            }
          },
          setElementClass: function(elementIndex, className, isAdd) {
            var element = this.boundElements[elementIndex].element;
            var dashCasedClassName = camelCaseToDashCase(className);
            if (isAdd) {
              DOM.addClass(element, dashCasedClassName);
            } else {
              DOM.removeClass(element, dashCasedClassName);
            }
          },
          setElementStyle: function(elementIndex, styleName, value) {
            var element = this.boundElements[elementIndex].element;
            var dashCasedStyleName = camelCaseToDashCase(styleName);
            if (isPresent(value)) {
              DOM.setStyle(element, dashCasedStyleName, stringify(value));
            } else {
              DOM.removeStyle(element, dashCasedStyleName);
            }
          },
          invokeElementMethod: function(elementIndex, methodName, args) {
            var element = this.boundElements[elementIndex].element;
            DOM.invoke(element, methodName, args);
          },
          setText: function(textIndex, value) {
            DOM.setText(this.boundTextNodes[textIndex], value);
          },
          dispatchEvent: function(elementIndex, eventName, event) {
            var allowDefaultBehavior = true;
            if (isPresent(this.eventDispatcher)) {
              var evalLocals = new Map();
              evalLocals.set('$event', event);
              allowDefaultBehavior = this.eventDispatcher.dispatchEvent(elementIndex, eventName, evalLocals);
              if (!allowDefaultBehavior) {
                event.preventDefault();
              }
            }
            return allowDefaultBehavior;
          }
        }, {});
      }());
      $__export("DomView", DomView);
    }
  };
});

System.register("angular2/src/render/dom/view/element", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/element";
  var DomElement;
  return {
    setters: [],
    execute: function() {
      DomElement = (function() {
        function DomElement(proto, element, contentTag) {
          this.proto = proto;
          this.element = element;
          this.contentTag = contentTag;
        }
        return ($traceurRuntime.createClass)(DomElement, {}, {});
      }());
      $__export("DomElement", DomElement);
    }
  };
});

System.register("angular2/src/render/dom/view/view_container", ["angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/view_container";
  var ListWrapper,
      DomViewContainer;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      DomViewContainer = (function() {
        function DomViewContainer() {
          this.views = [];
        }
        return ($traceurRuntime.createClass)(DomViewContainer, {
          contentTagContainers: function() {
            return this.views;
          },
          nodes: function() {
            var r = [];
            for (var i = 0; i < this.views.length; ++i) {
              r = ListWrapper.concat(r, this.views[i].rootNodes);
            }
            return r;
          }
        }, {});
      }());
      $__export("DomViewContainer", DomViewContainer);
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_element", ["angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_element";
  var MapWrapper,
      DOM,
      isBlank,
      isPresent,
      StringJoiner,
      assertionsEnabled,
      CompileElement;
  function getElementDescription(domElement) {
    var buf = new StringJoiner();
    var atts = DOM.attributeMap(domElement);
    buf.add("<");
    buf.add(DOM.tagName(domElement).toLowerCase());
    addDescriptionAttribute(buf, "id", atts.get("id"));
    addDescriptionAttribute(buf, "class", atts.get("class"));
    MapWrapper.forEach(atts, (function(attValue, attName) {
      if (attName !== "id" && attName !== "class") {
        addDescriptionAttribute(buf, attName, attValue);
      }
    }));
    buf.add(">");
    return buf.toString();
  }
  function addDescriptionAttribute(buffer, attName, attValue) {
    if (isPresent(attValue)) {
      if (attValue.length === 0) {
        buffer.add(' ' + attName);
      } else {
        buffer.add(' ' + attName + '="' + attValue + '"');
      }
    }
  }
  return {
    setters: [function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      StringJoiner = $__m.StringJoiner;
      assertionsEnabled = $__m.assertionsEnabled;
    }],
    execute: function() {
      CompileElement = (function() {
        function CompileElement(element) {
          var compilationUnit = arguments[1] !== (void 0) ? arguments[1] : '';
          this.element = element;
          this._attrs = null;
          this._classList = null;
          this.isViewRoot = false;
          this.inheritedProtoView = null;
          this.distanceToInheritedBinder = 0;
          this.inheritedElementBinder = null;
          this.compileChildren = true;
          var tplDesc = assertionsEnabled() ? getElementDescription(element) : null;
          if (compilationUnit !== '') {
            this.elementDescription = compilationUnit;
            if (isPresent(tplDesc))
              this.elementDescription += ": " + tplDesc;
          } else {
            this.elementDescription = tplDesc;
          }
        }
        return ($traceurRuntime.createClass)(CompileElement, {
          isBound: function() {
            return isPresent(this.inheritedElementBinder) && this.distanceToInheritedBinder === 0;
          },
          bindElement: function() {
            if (!this.isBound()) {
              var parentBinder = this.inheritedElementBinder;
              this.inheritedElementBinder = this.inheritedProtoView.bindElement(this.element, this.elementDescription);
              if (isPresent(parentBinder)) {
                this.inheritedElementBinder.setParent(parentBinder, this.distanceToInheritedBinder);
              }
              this.distanceToInheritedBinder = 0;
            }
            return this.inheritedElementBinder;
          },
          refreshAttrs: function() {
            this._attrs = null;
          },
          attrs: function() {
            if (isBlank(this._attrs)) {
              this._attrs = DOM.attributeMap(this.element);
            }
            return this._attrs;
          },
          refreshClassList: function() {
            this._classList = null;
          },
          classList: function() {
            if (isBlank(this._classList)) {
              this._classList = [];
              var elClassList = DOM.classList(this.element);
              for (var i = 0; i < elClassList.length; i++) {
                this._classList.push(elClassList[i]);
              }
            }
            return this._classList;
          }
        }, {});
      }());
      $__export("CompileElement", CompileElement);
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_control", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_control";
  var isBlank,
      CompileControl;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      CompileControl = (function() {
        function CompileControl(_steps) {
          this._steps = _steps;
          this._currentStepIndex = 0;
          this._parent = null;
          this._results = null;
          this._additionalChildren = null;
        }
        return ($traceurRuntime.createClass)(CompileControl, {
          internalProcess: function(results, startStepIndex, parent, current) {
            this._results = results;
            var previousStepIndex = this._currentStepIndex;
            var previousParent = this._parent;
            this._ignoreCurrentElement = false;
            for (var i = startStepIndex; i < this._steps.length && !this._ignoreCurrentElement; i++) {
              var step = this._steps[i];
              this._parent = parent;
              this._currentStepIndex = i;
              step.process(parent, current, this);
              parent = this._parent;
            }
            if (!this._ignoreCurrentElement) {
              results.push(current);
            }
            this._currentStepIndex = previousStepIndex;
            this._parent = previousParent;
            var localAdditionalChildren = this._additionalChildren;
            this._additionalChildren = null;
            return localAdditionalChildren;
          },
          addParent: function(newElement) {
            this.internalProcess(this._results, this._currentStepIndex + 1, this._parent, newElement);
            this._parent = newElement;
          },
          addChild: function(element) {
            if (isBlank(this._additionalChildren)) {
              this._additionalChildren = [];
            }
            this._additionalChildren.push(element);
          },
          ignoreCurrentElement: function() {
            this._ignoreCurrentElement = true;
          }
        }, {});
      }());
      $__export("CompileControl", CompileControl);
    }
  };
});

System.register("angular2/src/render/dom/view/element_binder", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/element_binder";
  var ElementBinder,
      Event,
      HostAction;
  return {
    setters: [],
    execute: function() {
      ElementBinder = (function() {
        function ElementBinder() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              textNodeIndices = $__1.textNodeIndices,
              contentTagSelector = $__1.contentTagSelector,
              nestedProtoView = $__1.nestedProtoView,
              componentId = $__1.componentId,
              eventLocals = $__1.eventLocals,
              localEvents = $__1.localEvents,
              globalEvents = $__1.globalEvents,
              parentIndex = $__1.parentIndex,
              distanceToParent = $__1.distanceToParent,
              elementIsEmpty = $__1.elementIsEmpty;
          this.textNodeIndices = textNodeIndices;
          this.contentTagSelector = contentTagSelector;
          this.nestedProtoView = nestedProtoView;
          this.componentId = componentId;
          this.eventLocals = eventLocals;
          this.localEvents = localEvents;
          this.globalEvents = globalEvents;
          this.parentIndex = parentIndex;
          this.distanceToParent = distanceToParent;
          this.elementIsEmpty = elementIsEmpty;
        }
        return ($traceurRuntime.createClass)(ElementBinder, {}, {});
      }());
      $__export("ElementBinder", ElementBinder);
      Event = (function() {
        function Event(name, target, fullName) {
          this.name = name;
          this.target = target;
          this.fullName = fullName;
        }
        return ($traceurRuntime.createClass)(Event, {}, {});
      }());
      $__export("Event", Event);
      HostAction = (function() {
        function HostAction(actionName, actionExpression, expression) {
          this.actionName = actionName;
          this.actionExpression = actionExpression;
          this.expression = expression;
        }
        return ($traceurRuntime.createClass)(HostAction, {}, {});
      }());
      $__export("HostAction", HostAction);
    }
  };
});

System.register("angular2/src/render/dom/compiler/property_binding_parser", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/property_binding_parser";
  var isPresent,
      RegExpWrapper,
      MapWrapper,
      dashCaseToCamelCase,
      BIND_NAME_REGEXP,
      PropertyBindingParser;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      RegExpWrapper = $__m.RegExpWrapper;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      dashCaseToCamelCase = $__m.dashCaseToCamelCase;
    }],
    execute: function() {
      BIND_NAME_REGEXP = RegExpWrapper.create('^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\\[\\(([^\\)]+)\\)\\]|\\[([^\\]]+)\\]|\\(([^\\)]+)\\))$');
      PropertyBindingParser = (function() {
        function PropertyBindingParser(_parser) {
          this._parser = _parser;
        }
        return ($traceurRuntime.createClass)(PropertyBindingParser, {
          process: function(parent, current, control) {
            var $__0 = this;
            var attrs = current.attrs();
            var newAttrs = new Map();
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
              if (isPresent(bindParts)) {
                if (isPresent(bindParts[1])) {
                  $__0._bindProperty(bindParts[5], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[2])) {
                  var identifier = bindParts[5];
                  var value = attrValue == '' ? '\$implicit' : attrValue;
                  $__0._bindVariable(identifier, value, current, newAttrs);
                } else if (isPresent(bindParts[3])) {
                  $__0._bindEvent(bindParts[5], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[4])) {
                  $__0._bindProperty(bindParts[5], attrValue, current, newAttrs);
                  $__0._bindAssignmentEvent(bindParts[5], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[6])) {
                  $__0._bindProperty(bindParts[6], attrValue, current, newAttrs);
                  $__0._bindAssignmentEvent(bindParts[6], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[7])) {
                  $__0._bindProperty(bindParts[7], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[8])) {
                  $__0._bindEvent(bindParts[8], attrValue, current, newAttrs);
                }
              } else {
                var expr = $__0._parser.parseInterpolation(attrValue, current.elementDescription);
                if (isPresent(expr)) {
                  $__0._bindPropertyAst(attrName, expr, current, newAttrs);
                }
              }
            }));
            MapWrapper.forEach(newAttrs, (function(attrValue, attrName) {
              attrs.set(attrName, attrValue);
            }));
          },
          _bindVariable: function(identifier, value, current, newAttrs) {
            current.bindElement().bindVariable(dashCaseToCamelCase(identifier), value);
            newAttrs.set(identifier, value);
          },
          _bindProperty: function(name, expression, current, newAttrs) {
            this._bindPropertyAst(name, this._parser.parseBinding(expression, current.elementDescription), current, newAttrs);
          },
          _bindPropertyAst: function(name, ast, current, newAttrs) {
            var binder = current.bindElement();
            binder.bindProperty(dashCaseToCamelCase(name), ast);
            newAttrs.set(name, ast.source);
          },
          _bindAssignmentEvent: function(name, expression, current, newAttrs) {
            this._bindEvent(name, (expression + "=$event"), current, newAttrs);
          },
          _bindEvent: function(name, expression, current, newAttrs) {
            current.bindElement().bindEvent(dashCaseToCamelCase(name), this._parser.parseAction(expression, current.elementDescription));
          }
        }, {});
      }());
      $__export("PropertyBindingParser", PropertyBindingParser);
    }
  };
});

System.register("angular2/src/render/dom/compiler/text_interpolation_parser", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/text_interpolation_parser";
  var isPresent,
      DOM,
      TextInterpolationParser;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      TextInterpolationParser = (function() {
        function TextInterpolationParser(_parser) {
          this._parser = _parser;
        }
        return ($traceurRuntime.createClass)(TextInterpolationParser, {process: function(parent, current, control) {
            if (!current.compileChildren) {
              return ;
            }
            var element = current.element;
            var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
            for (var i = 0; i < childNodes.length; i++) {
              var node = childNodes[i];
              if (DOM.isTextNode(node)) {
                var text = DOM.nodeValue(node);
                var expr = this._parser.parseInterpolation(text, current.elementDescription);
                if (isPresent(expr)) {
                  DOM.setText(node, ' ');
                  current.bindElement().bindText(node, expr);
                }
              }
            }
          }}, {});
      }());
      $__export("TextInterpolationParser", TextInterpolationParser);
    }
  };
});

System.register("angular2/src/render/dom/compiler/selector", ["angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/selector";
  var Map,
      ListWrapper,
      isPresent,
      isBlank,
      RegExpWrapper,
      RegExpMatcherWrapper,
      StringWrapper,
      BaseException,
      _EMPTY_ATTR_VALUE,
      _SELECTOR_REGEXP,
      CssSelector,
      SelectorMatcher,
      SelectorListContext,
      SelectorContext;
  return {
    setters: [function($__m) {
      Map = $__m.Map;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      RegExpWrapper = $__m.RegExpWrapper;
      RegExpMatcherWrapper = $__m.RegExpMatcherWrapper;
      StringWrapper = $__m.StringWrapper;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      _EMPTY_ATTR_VALUE = '';
      _SELECTOR_REGEXP = RegExpWrapper.create('(\\:not\\()|' + '([-\\w]+)|' + '(?:\\.([-\\w]+))|' + '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|' + '(\\))|' + '(\\s*,\\s*)');
      CssSelector = (function() {
        function CssSelector() {
          this.element = null;
          this.classNames = [];
          this.attrs = [];
          this.notSelectors = [];
        }
        return ($traceurRuntime.createClass)(CssSelector, {
          isElementSelector: function() {
            return isPresent(this.element) && ListWrapper.isEmpty(this.classNames) && ListWrapper.isEmpty(this.attrs) && this.notSelectors.length === 0;
          },
          setElement: function() {
            var element = arguments[0] !== (void 0) ? arguments[0] : null;
            if (isPresent(element)) {
              element = element.toLowerCase();
            }
            this.element = element;
          },
          addAttribute: function(name) {
            var value = arguments[1] !== (void 0) ? arguments[1] : _EMPTY_ATTR_VALUE;
            this.attrs.push(name.toLowerCase());
            if (isPresent(value)) {
              value = value.toLowerCase();
            } else {
              value = _EMPTY_ATTR_VALUE;
            }
            this.attrs.push(value);
          },
          addClassName: function(name) {
            this.classNames.push(name.toLowerCase());
          },
          toString: function() {
            var res = '';
            if (isPresent(this.element)) {
              res += this.element;
            }
            if (isPresent(this.classNames)) {
              for (var i = 0; i < this.classNames.length; i++) {
                res += '.' + this.classNames[i];
              }
            }
            if (isPresent(this.attrs)) {
              for (var i = 0; i < this.attrs.length; ) {
                var attrName = this.attrs[i++];
                var attrValue = this.attrs[i++];
                res += '[' + attrName;
                if (attrValue.length > 0) {
                  res += '=' + attrValue;
                }
                res += ']';
              }
            }
            ListWrapper.forEach(this.notSelectors, (function(notSelector) {
              res += ":not(" + notSelector.toString() + ")";
            }));
            return res;
          }
        }, {parse: function(selector) {
            var results = [];
            var _addResult = (function(res, cssSel) {
              if (cssSel.notSelectors.length > 0 && isBlank(cssSel.element) && ListWrapper.isEmpty(cssSel.classNames) && ListWrapper.isEmpty(cssSel.attrs)) {
                cssSel.element = "*";
              }
              res.push(cssSel);
            });
            var cssSelector = new CssSelector();
            var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
            var match;
            var current = cssSelector;
            var inNot = false;
            while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
              if (isPresent(match[1])) {
                if (inNot) {
                  throw new BaseException('Nesting :not is not allowed in a selector');
                }
                inNot = true;
                current = new CssSelector();
                cssSelector.notSelectors.push(current);
              }
              if (isPresent(match[2])) {
                current.setElement(match[2]);
              }
              if (isPresent(match[3])) {
                current.addClassName(match[3]);
              }
              if (isPresent(match[4])) {
                current.addAttribute(match[4], match[5]);
              }
              if (isPresent(match[6])) {
                inNot = false;
                current = cssSelector;
              }
              if (isPresent(match[7])) {
                if (inNot) {
                  throw new BaseException('Multiple selectors in :not are not supported');
                }
                _addResult(results, cssSelector);
                cssSelector = current = new CssSelector();
              }
            }
            _addResult(results, cssSelector);
            return results;
          }});
      }());
      $__export("CssSelector", CssSelector);
      SelectorMatcher = (function() {
        function SelectorMatcher() {
          this._elementMap = new Map();
          this._elementPartialMap = new Map();
          this._classMap = new Map();
          this._classPartialMap = new Map();
          this._attrValueMap = new Map();
          this._attrValuePartialMap = new Map();
          this._listContexts = [];
        }
        return ($traceurRuntime.createClass)(SelectorMatcher, {
          addSelectables: function(cssSelectors, callbackCtxt) {
            var listContext = null;
            if (cssSelectors.length > 1) {
              listContext = new SelectorListContext(cssSelectors);
              this._listContexts.push(listContext);
            }
            for (var i = 0; i < cssSelectors.length; i++) {
              this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
            }
          },
          _addSelectable: function(cssSelector, callbackCtxt, listContext) {
            var matcher = this;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            var selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);
            if (isPresent(element)) {
              var isTerminal = attrs.length === 0 && classNames.length === 0;
              if (isTerminal) {
                this._addTerminal(matcher._elementMap, element, selectable);
              } else {
                matcher = this._addPartial(matcher._elementPartialMap, element);
              }
            }
            if (isPresent(classNames)) {
              for (var index = 0; index < classNames.length; index++) {
                var isTerminal = attrs.length === 0 && index === classNames.length - 1;
                var className = classNames[index];
                if (isTerminal) {
                  this._addTerminal(matcher._classMap, className, selectable);
                } else {
                  matcher = this._addPartial(matcher._classPartialMap, className);
                }
              }
            }
            if (isPresent(attrs)) {
              for (var index = 0; index < attrs.length; ) {
                var isTerminal = index === attrs.length - 2;
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                if (isTerminal) {
                  var terminalMap = matcher._attrValueMap;
                  var terminalValuesMap = terminalMap.get(attrName);
                  if (isBlank(terminalValuesMap)) {
                    terminalValuesMap = new Map();
                    terminalMap.set(attrName, terminalValuesMap);
                  }
                  this._addTerminal(terminalValuesMap, attrValue, selectable);
                } else {
                  var parttialMap = matcher._attrValuePartialMap;
                  var partialValuesMap = parttialMap.get(attrName);
                  if (isBlank(partialValuesMap)) {
                    partialValuesMap = new Map();
                    parttialMap.set(attrName, partialValuesMap);
                  }
                  matcher = this._addPartial(partialValuesMap, attrValue);
                }
              }
            }
          },
          _addTerminal: function(map, name, selectable) {
            var terminalList = map.get(name);
            if (isBlank(terminalList)) {
              terminalList = [];
              map.set(name, terminalList);
            }
            terminalList.push(selectable);
          },
          _addPartial: function(map, name) {
            var matcher = map.get(name);
            if (isBlank(matcher)) {
              matcher = new SelectorMatcher();
              map.set(name, matcher);
            }
            return matcher;
          },
          match: function(cssSelector, matchedCallback) {
            var result = false;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            for (var i = 0; i < this._listContexts.length; i++) {
              this._listContexts[i].alreadyMatched = false;
            }
            result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
            result = this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) || result;
            if (isPresent(classNames)) {
              for (var index = 0; index < classNames.length; index++) {
                var className = classNames[index];
                result = this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
                result = this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) || result;
              }
            }
            if (isPresent(attrs)) {
              for (var index = 0; index < attrs.length; ) {
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                var terminalValuesMap = this._attrValueMap.get(attrName);
                if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                  result = this._matchTerminal(terminalValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) || result;
                }
                result = this._matchTerminal(terminalValuesMap, attrValue, cssSelector, matchedCallback) || result;
                var partialValuesMap = this._attrValuePartialMap.get(attrName);
                if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                  result = this._matchPartial(partialValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) || result;
                }
                result = this._matchPartial(partialValuesMap, attrValue, cssSelector, matchedCallback) || result;
              }
            }
            return result;
          },
          _matchTerminal: function(map, name, cssSelector, matchedCallback) {
            if (isBlank(map) || isBlank(name)) {
              return false;
            }
            var selectables = map.get(name);
            var starSelectables = map.get("*");
            if (isPresent(starSelectables)) {
              selectables = ListWrapper.concat(selectables, starSelectables);
            }
            if (isBlank(selectables)) {
              return false;
            }
            var selectable;
            var result = false;
            for (var index = 0; index < selectables.length; index++) {
              selectable = selectables[index];
              result = selectable.finalize(cssSelector, matchedCallback) || result;
            }
            return result;
          },
          _matchPartial: function(map, name, cssSelector, matchedCallback) {
            if (isBlank(map) || isBlank(name)) {
              return false;
            }
            var nestedSelector = map.get(name);
            if (isBlank(nestedSelector)) {
              return false;
            }
            return nestedSelector.match(cssSelector, matchedCallback);
          }
        }, {createNotMatcher: function(notSelectors) {
            var notMatcher = new SelectorMatcher();
            notMatcher.addSelectables(notSelectors, null);
            return notMatcher;
          }});
      }());
      $__export("SelectorMatcher", SelectorMatcher);
      SelectorListContext = (function() {
        function SelectorListContext(selectors) {
          this.selectors = selectors;
          this.alreadyMatched = false;
        }
        return ($traceurRuntime.createClass)(SelectorListContext, {}, {});
      }());
      SelectorContext = (function() {
        function SelectorContext(selector, cbContext, listContext) {
          this.selector = selector;
          this.cbContext = cbContext;
          this.listContext = listContext;
          this.notSelectors = selector.notSelectors;
        }
        return ($traceurRuntime.createClass)(SelectorContext, {finalize: function(cssSelector, callback) {
            var result = true;
            if (this.notSelectors.length > 0 && (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
              var notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
              result = !notMatcher.match(cssSelector, null);
            }
            if (result && isPresent(callback) && (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
              if (isPresent(this.listContext)) {
                this.listContext.alreadyMatched = true;
              }
              callback(this.selector, this.cbContext);
            }
            return result;
          }}, {});
      }());
    }
  };
});

System.register("angular2/src/render/dom/compiler/view_splitter", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/render/dom/compiler/compile_element", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/view_splitter";
  var isPresent,
      BaseException,
      StringWrapper,
      DOM,
      MapWrapper,
      CompileElement,
      dashCaseToCamelCase,
      ViewSplitter;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      CompileElement = $__m.CompileElement;
    }, function($__m) {
      dashCaseToCamelCase = $__m.dashCaseToCamelCase;
    }],
    execute: function() {
      ViewSplitter = (function() {
        function ViewSplitter(_parser) {
          this._parser = _parser;
        }
        return ($traceurRuntime.createClass)(ViewSplitter, {
          process: function(parent, current, control) {
            var attrs = current.attrs();
            var templateBindings = attrs.get('template');
            var hasTemplateBinding = isPresent(templateBindings);
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              if (StringWrapper.startsWith(attrName, '*')) {
                var key = StringWrapper.substring(attrName, 1);
                if (hasTemplateBinding) {
                  throw new BaseException("Only one template directive per element is allowed: " + (templateBindings + " and " + key + " cannot be used simultaneously ") + ("in " + current.elementDescription));
                } else {
                  templateBindings = (attrValue.length == 0) ? key : key + ' ' + attrValue;
                  hasTemplateBinding = true;
                }
              }
            }));
            if (isPresent(parent)) {
              if (DOM.isTemplateElement(current.element)) {
                if (!current.isViewRoot) {
                  var viewRoot = new CompileElement(DOM.createTemplate(''));
                  viewRoot.inheritedProtoView = current.bindElement().bindNestedProtoView(viewRoot.element);
                  viewRoot.elementDescription = current.elementDescription;
                  viewRoot.isViewRoot = true;
                  this._moveChildNodes(DOM.content(current.element), DOM.content(viewRoot.element));
                  control.addChild(viewRoot);
                }
              }
              if (hasTemplateBinding) {
                var newParent = new CompileElement(DOM.createTemplate(''));
                newParent.inheritedProtoView = current.inheritedProtoView;
                newParent.inheritedElementBinder = current.inheritedElementBinder;
                newParent.distanceToInheritedBinder = current.distanceToInheritedBinder;
                newParent.elementDescription = current.elementDescription;
                current.inheritedProtoView = newParent.bindElement().bindNestedProtoView(current.element);
                current.inheritedElementBinder = null;
                current.distanceToInheritedBinder = 0;
                current.isViewRoot = true;
                this._parseTemplateBindings(templateBindings, newParent);
                this._addParentElement(current.element, newParent.element);
                control.addParent(newParent);
                DOM.remove(current.element);
              }
            }
          },
          _moveChildNodes: function(source, target) {
            var next = DOM.firstChild(source);
            while (isPresent(next)) {
              DOM.appendChild(target, next);
              next = DOM.firstChild(source);
            }
          },
          _addParentElement: function(currentElement, newParentElement) {
            DOM.insertBefore(currentElement, newParentElement);
            DOM.appendChild(newParentElement, currentElement);
          },
          _parseTemplateBindings: function(templateBindings, compileElement) {
            var bindings = this._parser.parseTemplateBindings(templateBindings, compileElement.elementDescription);
            for (var i = 0; i < bindings.length; i++) {
              var binding = bindings[i];
              if (binding.keyIsVar) {
                compileElement.bindElement().bindVariable(dashCaseToCamelCase(binding.key), binding.name);
                compileElement.attrs().set(binding.key, binding.name);
              } else if (isPresent(binding.expression)) {
                compileElement.bindElement().bindProperty(dashCaseToCamelCase(binding.key), binding.expression);
                compileElement.attrs().set(binding.key, binding.expression.source);
              } else {
                DOM.setAttribute(compileElement.element, binding.key, '');
              }
            }
          }
        }, {});
      }());
      $__export("ViewSplitter", ViewSplitter);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/shadow_dom_compile_step", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/shadow_dom_compile_step";
  var isPresent,
      assertionsEnabled,
      DOM,
      ShadowDomCompileStep;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      assertionsEnabled = $__m.assertionsEnabled;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      ShadowDomCompileStep = (function() {
        function ShadowDomCompileStep(_shadowDomStrategy, _view) {
          this._shadowDomStrategy = _shadowDomStrategy;
          this._view = _view;
        }
        return ($traceurRuntime.createClass)(ShadowDomCompileStep, {
          process: function(parent, current, control) {
            var tagName = DOM.tagName(current.element).toUpperCase();
            if (tagName == 'STYLE') {
              this._processStyleElement(current, control);
            } else if (tagName == 'CONTENT') {
              this._processContentElement(current);
            } else {
              var componentId = current.isBound() ? current.inheritedElementBinder.componentId : null;
              this._shadowDomStrategy.processElement(this._view.componentId, componentId, current.element);
            }
          },
          _processStyleElement: function(current, control) {
            this._shadowDomStrategy.processStyleElement(this._view.componentId, this._view.templateAbsUrl, current.element);
            control.ignoreCurrentElement();
          },
          _processContentElement: function(current) {
            if (this._shadowDomStrategy.hasNativeContentElement()) {
              return ;
            }
            var attrs = current.attrs();
            var selector = attrs.get('select');
            selector = isPresent(selector) ? selector : '';
            var contentStart = DOM.createScriptTag('type', 'ng/contentStart');
            if (assertionsEnabled()) {
              DOM.setAttribute(contentStart, 'select', selector);
            }
            var contentEnd = DOM.createScriptTag('type', 'ng/contentEnd');
            DOM.insertBefore(current.element, contentStart);
            DOM.insertBefore(current.element, contentEnd);
            DOM.remove(current.element);
            current.element = contentStart;
            current.bindElement().setContentTagSelector(selector);
          }
        }, {});
      }());
      $__export("ShadowDomCompileStep", ShadowDomCompileStep);
    }
  };
});

System.register("angular2/src/core/application_tokens", ["angular2/di", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/application_tokens";
  var OpaqueToken,
      CONST_EXPR,
      appComponentRefToken,
      appComponentTypeToken;
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }, function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }],
    execute: function() {
      appComponentRefToken = CONST_EXPR(new OpaqueToken('ComponentRef'));
      $__export("appComponentRefToken", appComponentRefToken);
      appComponentTypeToken = CONST_EXPR(new OpaqueToken('RootComponent'));
      $__export("appComponentTypeToken", appComponentTypeToken);
    }
  };
});

System.register("angular2/src/core/annotations/di", ["angular2/src/core/annotations_impl/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/di";
  return {
    setters: [function($__m) {
      $__export("QueryAnnotation", $__m.Query);
      $__export("AttributeAnnotation", $__m.Attribute);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/compiler/interfaces", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/interfaces";
  var global,
      __ignore_me;
  return {
    setters: [function($__m) {
      global = $__m.global;
    }],
    execute: function() {
      __ignore_me = global;
    }
  };
});

System.register("angular2/src/core/annotations/annotations", ["angular2/src/core/annotations_impl/annotations"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/annotations";
  return {
    setters: [function($__m) {
      $__export("ComponentAnnotation", $__m.Component);
      $__export("DirectiveAnnotation", $__m.Directive);
      $__export("onDestroy", $__m.onDestroy);
      $__export("onChange", $__m.onChange);
      $__export("onCheck", $__m.onCheck);
      $__export("onInit", $__m.onInit);
      $__export("onAllChangesDone", $__m.onAllChangesDone);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/annotations/decorators", ["angular2/src/core/annotations/annotations", "angular2/src/core/annotations/view", "angular2/src/core/annotations/di", "angular2/src/util/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/decorators";
  var ComponentAnnotation,
      DirectiveAnnotation,
      ViewAnnotation,
      AttributeAnnotation,
      QueryAnnotation,
      makeDecorator,
      makeParamDecorator,
      Component,
      Directive,
      View,
      Attribute,
      Query;
  return {
    setters: [function($__m) {
      ComponentAnnotation = $__m.ComponentAnnotation;
      DirectiveAnnotation = $__m.DirectiveAnnotation;
    }, function($__m) {
      ViewAnnotation = $__m.ViewAnnotation;
    }, function($__m) {
      AttributeAnnotation = $__m.AttributeAnnotation;
      QueryAnnotation = $__m.QueryAnnotation;
    }, function($__m) {
      makeDecorator = $__m.makeDecorator;
      makeParamDecorator = $__m.makeParamDecorator;
    }],
    execute: function() {
      Component = makeDecorator(ComponentAnnotation, (function(fn) {
        return fn.View = View;
      }));
      $__export("Component", Component);
      Directive = makeDecorator(DirectiveAnnotation);
      $__export("Directive", Directive);
      View = makeDecorator(ViewAnnotation, (function(fn) {
        return fn.View = View;
      }));
      $__export("View", View);
      Attribute = makeParamDecorator(AttributeAnnotation);
      $__export("Attribute", Attribute);
      Query = makeParamDecorator(QueryAnnotation);
      $__export("Query", Query);
    }
  };
});

System.register("angular2/src/directives/ng_for", ["angular2/annotations", "angular2/angular2", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_for";
  var __decorate,
      __metadata,
      Directive,
      ViewContainerRef,
      ProtoViewRef,
      PipeRegistry,
      onCheck,
      isPresent,
      isBlank,
      NgFor,
      RecordViewTuple;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
      ProtoViewRef = $__m.ProtoViewRef;
      PipeRegistry = $__m.PipeRegistry;
      onCheck = $__m.onCheck;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgFor = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef, pipes) {
        this.viewContainer = viewContainer;
        this.protoViewRef = protoViewRef;
        this.pipes = pipes;
      }, {
        set ngForOf(value) {
          this._ngForOf = value;
          this._pipe = this.pipes.get("iterableDiff", value, null, this._pipe);
        },
        onCheck: function() {
          var diff = this._pipe.transform(this._ngForOf, null);
          if (isPresent(diff))
            this._applyChanges(diff.wrapped);
        },
        _applyChanges: function(changes) {
          if (isBlank(changes)) {
            this.viewContainer.clear();
            return ;
          }
          var recordViewTuples = [];
          changes.forEachRemovedItem((function(removedRecord) {
            return recordViewTuples.push(new RecordViewTuple(removedRecord, null));
          }));
          changes.forEachMovedItem((function(movedRecord) {
            return recordViewTuples.push(new RecordViewTuple(movedRecord, null));
          }));
          var insertTuples = NgFor.bulkRemove(recordViewTuples, this.viewContainer);
          changes.forEachAddedItem((function(addedRecord) {
            return insertTuples.push(new RecordViewTuple(addedRecord, null));
          }));
          NgFor.bulkInsert(insertTuples, this.viewContainer, this.protoViewRef);
          for (var i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
          }
        },
        _perViewChange: function(view, record) {
          view.setLocal('\$implicit', record.item);
          view.setLocal('index', record.currentIndex);
        }
      }, {
        bulkRemove: function(tuples, viewContainer) {
          tuples.sort((function(a, b) {
            return a.record.previousIndex - b.record.previousIndex;
          }));
          var movedTuples = [];
          for (var i = tuples.length - 1; i >= 0; i--) {
            var tuple = tuples[i];
            if (isPresent(tuple.record.currentIndex)) {
              tuple.view = viewContainer.detach(tuple.record.previousIndex);
              movedTuples.push(tuple);
            } else {
              viewContainer.remove(tuple.record.previousIndex);
            }
          }
          return movedTuples;
        },
        bulkInsert: function(tuples, viewContainer, protoViewRef) {
          tuples.sort((function(a, b) {
            return a.record.currentIndex - b.record.currentIndex;
          }));
          for (var i = 0; i < tuples.length; i++) {
            var tuple = tuples[i];
            if (isPresent(tuple.view)) {
              viewContainer.insert(tuple.view, tuple.record.currentIndex);
            } else {
              tuple.view = viewContainer.create(protoViewRef, tuple.record.currentIndex);
            }
          }
          return tuples;
        }
      }));
      $__export("NgFor", NgFor);
      $__export("NgFor", NgFor = __decorate([Directive({
        selector: '[ng-for][ng-for-of]',
        properties: ['ngForOf'],
        lifecycle: [onCheck]
      }), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef, PipeRegistry])], NgFor));
      RecordViewTuple = (function() {
        function RecordViewTuple(record, view) {
          this.record = record;
          this.view = view;
        }
        return ($traceurRuntime.createClass)(RecordViewTuple, {}, {});
      }());
    }
  };
});

System.register("angular2/src/directives/ng_if", ["angular2/annotations", "angular2/core", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_if";
  var __decorate,
      __metadata,
      Directive,
      ViewContainerRef,
      ProtoViewRef,
      isBlank,
      NgIf;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgIf = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef) {
        this.viewContainer = viewContainer;
        this.prevCondition = null;
        this.protoViewRef = protoViewRef;
      }, {set ngIf(newCondition) {
          if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
            this.prevCondition = true;
            this.viewContainer.create(this.protoViewRef);
          } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
            this.prevCondition = false;
            this.viewContainer.clear();
          }
        }}, {}));
      $__export("NgIf", NgIf);
      $__export("NgIf", NgIf = __decorate([Directive({
        selector: '[ng-if]',
        properties: ['ngIf']
      }), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef])], NgIf));
    }
  };
});

System.register("angular2/src/directives/ng_non_bindable", ["angular2/annotations"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_non_bindable";
  var __decorate,
      __metadata,
      Directive,
      NgNonBindable;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgNonBindable = (($traceurRuntime.createClass)(function() {}, {}, {}));
      $__export("NgNonBindable", NgNonBindable);
      $__export("NgNonBindable", NgNonBindable = __decorate([Directive({
        selector: '[ng-non-bindable]',
        compileChildren: false
      }), __metadata('design:paramtypes', [])], NgNonBindable));
    }
  };
});

System.register("angular2/src/directives/ng_switch", ["angular2/annotations", "angular2/di", "angular2/core", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_switch";
  var __decorate,
      __metadata,
      __param,
      Directive,
      Parent,
      ViewContainerRef,
      ProtoViewRef,
      isPresent,
      isBlank,
      normalizeBlank,
      ListWrapper,
      MapWrapper,
      Map,
      SwitchView,
      NgSwitch,
      NgSwitchWhen,
      NgSwitchDefault,
      _whenDefault;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      Parent = $__m.Parent;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      normalizeBlank = $__m.normalizeBlank;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
      Map = $__m.Map;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      SwitchView = (function() {
        function SwitchView(viewContainerRef, protoViewRef) {
          this._protoViewRef = protoViewRef;
          this._viewContainerRef = viewContainerRef;
        }
        return ($traceurRuntime.createClass)(SwitchView, {
          create: function() {
            this._viewContainerRef.create(this._protoViewRef);
          },
          destroy: function() {
            this._viewContainerRef.clear();
          }
        }, {});
      }());
      $__export("SwitchView", SwitchView);
      NgSwitch = (($traceurRuntime.createClass)(function() {
        this._valueViews = new Map();
        this._activeViews = [];
        this._useDefault = false;
      }, {
        set ngSwitch(value) {
          this._emptyAllActiveViews();
          this._useDefault = false;
          var views = this._valueViews.get(value);
          if (isBlank(views)) {
            this._useDefault = true;
            views = normalizeBlank(this._valueViews.get(_whenDefault));
          }
          this._activateViews(views);
          this._switchValue = value;
        },
        _onWhenValueChanged: function(oldWhen, newWhen, view) {
          this._deregisterView(oldWhen, view);
          this._registerView(newWhen, view);
          if (oldWhen === this._switchValue) {
            view.destroy();
            ListWrapper.remove(this._activeViews, view);
          } else if (newWhen === this._switchValue) {
            if (this._useDefault) {
              this._useDefault = false;
              this._emptyAllActiveViews();
            }
            view.create();
            this._activeViews.push(view);
          }
          if (this._activeViews.length === 0 && !this._useDefault) {
            this._useDefault = true;
            this._activateViews(this._valueViews.get(_whenDefault));
          }
        },
        _emptyAllActiveViews: function() {
          var activeContainers = this._activeViews;
          for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
          }
          this._activeViews = [];
        },
        _activateViews: function(views) {
          if (isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
              views[i].create();
            }
            this._activeViews = views;
          }
        },
        _registerView: function(value, view) {
          var views = this._valueViews.get(value);
          if (isBlank(views)) {
            views = [];
            this._valueViews.set(value, views);
          }
          views.push(view);
        },
        _deregisterView: function(value, view) {
          if (value == _whenDefault)
            return ;
          var views = this._valueViews.get(value);
          if (views.length == 1) {
            MapWrapper.delete(this._valueViews, value);
          } else {
            ListWrapper.remove(views, view);
          }
        }
      }, {}));
      $__export("NgSwitch", NgSwitch);
      $__export("NgSwitch", NgSwitch = __decorate([Directive({
        selector: '[ng-switch]',
        properties: ['ngSwitch']
      }), __metadata('design:paramtypes', [])], NgSwitch));
      NgSwitchWhen = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef, sswitch) {
        this._value = _whenDefault;
        this._switch = sswitch;
        this._view = new SwitchView(viewContainer, protoViewRef);
      }, {
        onDestroy: function() {
          this._switch;
        },
        set ngSwitchWhen(value) {
          this._switch._onWhenValueChanged(this._value, value, this._view);
          this._value = value;
        }
      }, {}));
      $__export("NgSwitchWhen", NgSwitchWhen);
      $__export("NgSwitchWhen", NgSwitchWhen = __decorate([Directive({
        selector: '[ng-switch-when]',
        properties: ['ngSwitchWhen']
      }), __param(2, Parent()), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef, NgSwitch])], NgSwitchWhen));
      NgSwitchDefault = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef, sswitch) {
        sswitch._registerView(_whenDefault, new SwitchView(viewContainer, protoViewRef));
      }, {}, {}));
      $__export("NgSwitchDefault", NgSwitchDefault);
      $__export("NgSwitchDefault", NgSwitchDefault = __decorate([Directive({selector: '[ng-switch-default]'}), __param(2, Parent()), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef, NgSwitch])], NgSwitchDefault));
      _whenDefault = new Object();
    }
  };
});

System.register("angular2/src/directives/class", ["angular2/annotations", "angular2/core", "angular2/src/change_detection/pipes/pipe_registry", "angular2/src/render/api", "angular2/src/change_detection/pipes/iterable_changes", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/class";
  var __decorate,
      __metadata,
      Directive,
      onCheck,
      ElementRef,
      PipeRegistry,
      Renderer,
      IterableChanges,
      isPresent,
      isString,
      ListWrapper,
      StringMapWrapper,
      isListLikeIterable,
      CSSClass;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      onCheck = $__m.onCheck;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      PipeRegistry = $__m.PipeRegistry;
    }, function($__m) {
      Renderer = $__m.Renderer;
    }, function($__m) {
      IterableChanges = $__m.IterableChanges;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isString = $__m.isString;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
      isListLikeIterable = $__m.isListLikeIterable;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      CSSClass = (($traceurRuntime.createClass)(function(_pipeRegistry, _ngEl, _renderer) {
        this._pipeRegistry = _pipeRegistry;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
      }, {
        set rawClass(v) {
          this._cleanupClasses(this._rawClass);
          if (isString(v)) {
            v = v.split(' ');
          }
          this._rawClass = v;
          this._pipe = this._pipeRegistry.get(isListLikeIterable(v) ? 'iterableDiff' : 'keyValDiff', v);
        },
        onCheck: function() {
          var diff = this._pipe.transform(this._rawClass, null);
          if (isPresent(diff) && isPresent(diff.wrapped)) {
            if (diff.wrapped instanceof IterableChanges) {
              this._applyArrayChanges(diff.wrapped);
            } else {
              this._applyObjectChanges(diff.wrapped);
            }
          }
        },
        _cleanupClasses: function(rawClassVal) {
          var $__0 = this;
          if (isPresent(rawClassVal)) {
            if (isListLikeIterable(rawClassVal)) {
              ListWrapper.forEach(rawClassVal, (function(className) {
                $__0._toggleClass(className, false);
              }));
            } else {
              StringMapWrapper.forEach(rawClassVal, (function(expVal, className) {
                if (expVal)
                  $__0._toggleClass(className, false);
              }));
            }
          }
        },
        _applyObjectChanges: function(diff) {
          var $__0 = this;
          diff.forEachAddedItem((function(record) {
            $__0._toggleClass(record.key, record.currentValue);
          }));
          diff.forEachChangedItem((function(record) {
            $__0._toggleClass(record.key, record.currentValue);
          }));
          diff.forEachRemovedItem((function(record) {
            if (record.previousValue) {
              $__0._toggleClass(record.key, false);
            }
          }));
        },
        _applyArrayChanges: function(diff) {
          var $__0 = this;
          diff.forEachAddedItem((function(record) {
            $__0._toggleClass(record.item, true);
          }));
          diff.forEachRemovedItem((function(record) {
            $__0._toggleClass(record.item, false);
          }));
        },
        _toggleClass: function(className, enabled) {
          this._renderer.setElementClass(this._ngEl, className, enabled);
        }
      }, {}));
      $__export("CSSClass", CSSClass);
      $__export("CSSClass", CSSClass = __decorate([Directive({
        selector: '[class]',
        lifecycle: [onCheck],
        properties: ['rawClass: class']
      }), __metadata('design:paramtypes', [PipeRegistry, ElementRef, Renderer])], CSSClass));
    }
  };
});

System.register("angular2/src/forms/validators", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/validators";
  var isBlank,
      isPresent,
      ListWrapper,
      StringMapWrapper,
      Validators;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      Validators = (function() {
        function Validators() {}
        return ($traceurRuntime.createClass)(Validators, {}, {
          required: function(c) {
            return isBlank(c.value) || c.value == "" ? {"required": true} : null;
          },
          nullValidator: function(c) {
            return null;
          },
          compose: function(validators) {
            return function(c) {
              var res = ListWrapper.reduce(validators, (function(res, validator) {
                var errors = validator(c);
                return isPresent(errors) ? StringMapWrapper.merge(res, errors) : res;
              }), {});
              return StringMapWrapper.isEmpty(res) ? null : res;
            };
          },
          group: function(c) {
            var res = {};
            StringMapWrapper.forEach(c.controls, (function(control, name) {
              if (c.contains(name) && isPresent(control.errors)) {
                Validators._mergeErrors(control, res);
              }
            }));
            return StringMapWrapper.isEmpty(res) ? null : res;
          },
          array: function(c) {
            var res = {};
            ListWrapper.forEach(c.controls, (function(control) {
              if (isPresent(control.errors)) {
                Validators._mergeErrors(control, res);
              }
            }));
            return StringMapWrapper.isEmpty(res) ? null : res;
          },
          _mergeErrors: function(control, res) {
            StringMapWrapper.forEach(control.errors, (function(value, error) {
              if (!StringMapWrapper.contains(res, error)) {
                res[error] = [];
              }
              var current = res[error];
              current.push(control);
            }));
          }
        });
      }());
      $__export("Validators", Validators);
    }
  };
});

System.register("angular2/src/forms/directives/control_container", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/control_container";
  var ControlContainer;
  return {
    setters: [],
    execute: function() {
      ControlContainer = (function() {
        function ControlContainer() {}
        return ($traceurRuntime.createClass)(ControlContainer, {
          get formDirective() {
            return null;
          },
          get path() {
            return null;
          }
        }, {});
      }());
      $__export("ControlContainer", ControlContainer);
    }
  };
});

System.register("angular2/src/forms/directives/ng_control", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_control";
  var NgControl;
  return {
    setters: [],
    execute: function() {
      NgControl = (function() {
        function NgControl() {
          this.name = null;
          this.valueAccessor = null;
        }
        return ($traceurRuntime.createClass)(NgControl, {
          get validator() {
            return null;
          },
          get path() {
            return null;
          },
          get control() {
            return null;
          },
          viewToModelUpdate: function(newValue) {}
        }, {});
      }());
      $__export("NgControl", NgControl);
    }
  };
});

System.register("angular2/src/forms/directives/validators", ["angular2/di", "angular2/src/facade/lang", "angular2/angular2", "angular2/src/forms/validators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/validators";
  var __decorate,
      __metadata,
      forwardRef,
      Binding,
      CONST_EXPR,
      Directive,
      Validators,
      NgValidator,
      requiredValidatorBinding,
      NgRequiredValidator;
  return {
    setters: [function($__m) {
      forwardRef = $__m.forwardRef;
      Binding = $__m.Binding;
    }, function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      Validators = $__m.Validators;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgValidator = (function() {
        function NgValidator() {}
        return ($traceurRuntime.createClass)(NgValidator, {get validator() {
            throw "Is not implemented";
          }}, {});
      }());
      $__export("NgValidator", NgValidator);
      requiredValidatorBinding = CONST_EXPR(new Binding(NgValidator, {toAlias: forwardRef((function() {
          return NgRequiredValidator;
        }))}));
      NgRequiredValidator = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)($__0, {get validator() {
            return Validators.required;
          }}, {}, $__super);
      }(NgValidator));
      $__export("NgRequiredValidator", NgRequiredValidator);
      $__export("NgRequiredValidator", NgRequiredValidator = __decorate([Directive({
        selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
        hostInjector: [requiredValidatorBinding]
      }), __metadata('design:paramtypes', [])], NgRequiredValidator));
    }
  };
});

System.register("angular2/src/forms/directives/shared", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/forms/validators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/shared";
  var ListWrapper,
      iterableToList,
      isBlank,
      BaseException,
      Validators;
  function controlPath(name, parent) {
    var p = ListWrapper.clone(parent.path);
    p.push(name);
    return p;
  }
  function setUpControl(c, dir) {
    if (isBlank(c))
      _throwError(dir, "Cannot find control");
    if (isBlank(dir.valueAccessor))
      _throwError(dir, "No value accessor for");
    c.validator = Validators.compose([c.validator, dir.validator]);
    dir.valueAccessor.writeValue(c.value);
    dir.valueAccessor.registerOnChange((function(newValue) {
      dir.viewToModelUpdate(newValue);
      c.updateValue(newValue);
      c.markAsDirty();
    }));
    c.registerOnChange((function(newValue) {
      return dir.valueAccessor.writeValue(newValue);
    }));
    dir.valueAccessor.registerOnTouched((function() {
      return c.markAsTouched();
    }));
  }
  function composeNgValidator(ngValidators) {
    if (isBlank(ngValidators))
      return Validators.nullValidator;
    return Validators.compose(iterableToList(ngValidators).map((function(v) {
      return v.validator;
    })));
  }
  function _throwError(dir, message) {
    var path = ListWrapper.join(dir.path, " -> ");
    throw new BaseException((message + " '" + path + "'"));
  }
  function setProperty(renderer, elementRef, propName, propValue) {
    renderer.setElementProperty(elementRef, propName, propValue);
  }
  $__export("controlPath", controlPath);
  $__export("setUpControl", setUpControl);
  $__export("composeNgValidator", composeNgValidator);
  $__export("setProperty", setProperty);
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
      iterableToList = $__m.iterableToList;
    }, function($__m) {
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      Validators = $__m.Validators;
    }],
    execute: function() {
    }
  };
});

System.register("angular2/src/forms/directives/ng_form_control", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/angular2", "angular2/di", "angular2/src/forms/directives/ng_control", "angular2/src/forms/directives/validators", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_form_control";
  var __decorate,
      __metadata,
      __param,
      CONST_EXPR,
      StringMapWrapper,
      EventEmitter,
      ObservableWrapper,
      Directive,
      onChange,
      Query,
      QueryList,
      forwardRef,
      Binding,
      NgControl,
      NgValidator,
      setUpControl,
      composeNgValidator,
      formControlBinding,
      NgFormControl;
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      EventEmitter = $__m.EventEmitter;
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      Directive = $__m.Directive;
      onChange = $__m.onChange;
      Query = $__m.Query;
      QueryList = $__m.QueryList;
    }, function($__m) {
      forwardRef = $__m.forwardRef;
      Binding = $__m.Binding;
    }, function($__m) {
      NgControl = $__m.NgControl;
    }, function($__m) {
      NgValidator = $__m.NgValidator;
    }, function($__m) {
      setUpControl = $__m.setUpControl;
      composeNgValidator = $__m.composeNgValidator;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      formControlBinding = CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef((function() {
          return NgFormControl;
        }))}));
      NgFormControl = (function($__super) {
        function $__0(ngValidators) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.update = new EventEmitter();
          this._added = false;
          this.ngValidators = ngValidators;
        }
        return ($traceurRuntime.createClass)($__0, {
          onChange: function(c) {
            if (!this._added) {
              setUpControl(this.form, this);
              this.form.updateValidity();
              this._added = true;
            }
            if (StringMapWrapper.contains(c, "model")) {
              this.form.updateValue(this.model);
            }
          },
          get path() {
            return [];
          },
          get control() {
            return this.form;
          },
          get validator() {
            return composeNgValidator(this.ngValidators);
          },
          viewToModelUpdate: function(newValue) {
            ObservableWrapper.callNext(this.update, newValue);
          }
        }, {}, $__super);
      }(NgControl));
      $__export("NgFormControl", NgFormControl);
      $__export("NgFormControl", NgFormControl = __decorate([Directive({
        selector: '[ng-form-control]',
        hostInjector: [formControlBinding],
        properties: ['form: ngFormControl', 'model: ngModel'],
        events: ['update: ngModel'],
        lifecycle: [onChange],
        exportAs: 'form'
      }), __param(0, Query(NgValidator)), __metadata('design:paramtypes', [QueryList])], NgFormControl));
    }
  };
});

System.register("angular2/src/forms/directives/ng_model", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/angular2", "angular2/di", "angular2/src/forms/directives/ng_control", "angular2/src/forms/model", "angular2/src/forms/directives/validators", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_model";
  var __decorate,
      __metadata,
      __param,
      CONST_EXPR,
      EventEmitter,
      ObservableWrapper,
      StringMapWrapper,
      Directive,
      onChange,
      QueryList,
      Query,
      forwardRef,
      Binding,
      NgControl,
      Control,
      NgValidator,
      setUpControl,
      composeNgValidator,
      formControlBinding,
      NgModel;
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      EventEmitter = $__m.EventEmitter;
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      Directive = $__m.Directive;
      onChange = $__m.onChange;
      QueryList = $__m.QueryList;
      Query = $__m.Query;
    }, function($__m) {
      forwardRef = $__m.forwardRef;
      Binding = $__m.Binding;
    }, function($__m) {
      NgControl = $__m.NgControl;
    }, function($__m) {
      Control = $__m.Control;
    }, function($__m) {
      NgValidator = $__m.NgValidator;
    }, function($__m) {
      setUpControl = $__m.setUpControl;
      composeNgValidator = $__m.composeNgValidator;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      formControlBinding = CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef((function() {
          return NgModel;
        }))}));
      NgModel = (function($__super) {
        function $__0(ngValidators) {
          $traceurRuntime.superConstructor($__0).call(this);
          this._control = new Control("");
          this._added = false;
          this.update = new EventEmitter();
          this.ngValidators = ngValidators;
        }
        return ($traceurRuntime.createClass)($__0, {
          onChange: function(c) {
            if (!this._added) {
              setUpControl(this._control, this);
              this._control.updateValidity();
              this._added = true;
            }
            if (StringMapWrapper.contains(c, "model")) {
              this._control.updateValue(this.model);
            }
          },
          get control() {
            return this._control;
          },
          get path() {
            return [];
          },
          get validator() {
            return composeNgValidator(this.ngValidators);
          },
          viewToModelUpdate: function(newValue) {
            ObservableWrapper.callNext(this.update, newValue);
          }
        }, {}, $__super);
      }(NgControl));
      $__export("NgModel", NgModel);
      $__export("NgModel", NgModel = __decorate([Directive({
        selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
        hostInjector: [formControlBinding],
        properties: ['model: ngModel'],
        events: ['update: ngModel'],
        lifecycle: [onChange],
        exportAs: 'form'
      }), __param(0, Query(NgValidator)), __metadata('design:paramtypes', [QueryList])], NgModel));
    }
  };
});

System.register("angular2/src/forms/directives/ng_control_group", ["angular2/angular2", "angular2/di", "angular2/src/facade/lang", "angular2/src/forms/directives/control_container", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_control_group";
  var __decorate,
      __metadata,
      __param,
      Directive,
      onDestroy,
      onInit,
      Ancestor,
      forwardRef,
      Binding,
      CONST_EXPR,
      ControlContainer,
      controlPath,
      controlGroupBinding,
      NgControlGroup;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      onDestroy = $__m.onDestroy;
      onInit = $__m.onInit;
    }, function($__m) {
      Ancestor = $__m.Ancestor;
      forwardRef = $__m.forwardRef;
      Binding = $__m.Binding;
    }, function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      ControlContainer = $__m.ControlContainer;
    }, function($__m) {
      controlPath = $__m.controlPath;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      controlGroupBinding = CONST_EXPR(new Binding(ControlContainer, {toAlias: forwardRef((function() {
          return NgControlGroup;
        }))}));
      NgControlGroup = (function($__super) {
        function $__0(_parent) {
          $traceurRuntime.superConstructor($__0).call(this);
          this._parent = _parent;
        }
        return ($traceurRuntime.createClass)($__0, {
          onInit: function() {
            this.formDirective.addControlGroup(this);
          },
          onDestroy: function() {
            this.formDirective.removeControlGroup(this);
          },
          get path() {
            return controlPath(this.name, this._parent);
          },
          get formDirective() {
            return this._parent.formDirective;
          }
        }, {}, $__super);
      }(ControlContainer));
      $__export("NgControlGroup", NgControlGroup);
      $__export("NgControlGroup", NgControlGroup = __decorate([Directive({
        selector: '[ng-control-group]',
        hostInjector: [controlGroupBinding],
        properties: ['name: ng-control-group'],
        lifecycle: [onInit, onDestroy],
        exportAs: 'form'
      }), __param(0, Ancestor()), __metadata('design:paramtypes', [ControlContainer])], NgControlGroup));
    }
  };
});

System.register("angular2/src/forms/directives/ng_form_model", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/angular2", "angular2/di", "angular2/src/forms/directives/control_container", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_form_model";
  var __decorate,
      __metadata,
      CONST_EXPR,
      ListWrapper,
      ObservableWrapper,
      EventEmitter,
      Directive,
      onChange,
      forwardRef,
      Binding,
      ControlContainer,
      setUpControl,
      formDirectiveBinding,
      NgFormModel;
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ObservableWrapper = $__m.ObservableWrapper;
      EventEmitter = $__m.EventEmitter;
    }, function($__m) {
      Directive = $__m.Directive;
      onChange = $__m.onChange;
    }, function($__m) {
      forwardRef = $__m.forwardRef;
      Binding = $__m.Binding;
    }, function($__m) {
      ControlContainer = $__m.ControlContainer;
    }, function($__m) {
      setUpControl = $__m.setUpControl;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      formDirectiveBinding = CONST_EXPR(new Binding(ControlContainer, {toAlias: forwardRef((function() {
          return NgFormModel;
        }))}));
      NgFormModel = (function($__super) {
        function $__1() {
          var $__4;
          for (var args = [],
              $__3 = 0; $__3 < arguments.length; $__3++)
            args[$__3] = arguments[$__3];
          ($__4 = $traceurRuntime.superConstructor($__1)).call.apply($__4, $traceurRuntime.spread([this], args));
          this.form = null;
          this.directives = [];
          this.ngSubmit = new EventEmitter();
        }
        return ($traceurRuntime.createClass)($__1, {
          onChange: function(_) {
            this._updateDomValue();
          },
          get formDirective() {
            return this;
          },
          get path() {
            return [];
          },
          addControl: function(dir) {
            var c = this.form.find(dir.path);
            setUpControl(c, dir);
            c.updateValidity();
            this.directives.push(dir);
          },
          getControl: function(dir) {
            return this.form.find(dir.path);
          },
          removeControl: function(dir) {
            ListWrapper.remove(this.directives, dir);
          },
          addControlGroup: function(dir) {},
          removeControlGroup: function(dir) {},
          updateModel: function(dir, value) {
            var c = this.form.find(dir.path);
            c.updateValue(value);
          },
          onSubmit: function() {
            ObservableWrapper.callNext(this.ngSubmit, null);
            return false;
          },
          _updateDomValue: function() {
            var $__0 = this;
            ListWrapper.forEach(this.directives, (function(dir) {
              var c = $__0.form.find(dir.path);
              dir.valueAccessor.writeValue(c.value);
            }));
          }
        }, {}, $__super);
      }(ControlContainer));
      $__export("NgFormModel", NgFormModel);
      $__export("NgFormModel", NgFormModel = __decorate([Directive({
        selector: '[ng-form-model]',
        hostInjector: [formDirectiveBinding],
        properties: ['form: ng-form-model'],
        lifecycle: [onChange],
        host: {'(submit)': 'onSubmit()'},
        events: ['ngSubmit'],
        exportAs: 'form'
      }), __metadata('design:paramtypes', [])], NgFormModel));
    }
  };
});

System.register("angular2/src/forms/directives/ng_form", ["angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/annotations/decorators", "angular2/di", "angular2/src/forms/directives/control_container", "angular2/src/forms/model", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_form";
  var __decorate,
      __metadata,
      PromiseWrapper,
      ObservableWrapper,
      EventEmitter,
      ListWrapper,
      isPresent,
      CONST_EXPR,
      Directive,
      forwardRef,
      Binding,
      ControlContainer,
      ControlGroup,
      Control,
      setUpControl,
      formDirectiveBinding,
      NgForm;
  return {
    setters: [function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
      ObservableWrapper = $__m.ObservableWrapper;
      EventEmitter = $__m.EventEmitter;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      forwardRef = $__m.forwardRef;
      Binding = $__m.Binding;
    }, function($__m) {
      ControlContainer = $__m.ControlContainer;
    }, function($__m) {
      ControlGroup = $__m.ControlGroup;
      Control = $__m.Control;
    }, function($__m) {
      setUpControl = $__m.setUpControl;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      formDirectiveBinding = CONST_EXPR(new Binding(ControlContainer, {toAlias: forwardRef((function() {
          return NgForm;
        }))}));
      NgForm = (function($__super) {
        function $__1() {
          $traceurRuntime.superConstructor($__1).call(this);
          this.ngSubmit = new EventEmitter();
          this.form = new ControlGroup({});
        }
        return ($traceurRuntime.createClass)($__1, {
          get formDirective() {
            return this;
          },
          get path() {
            return [];
          },
          get controls() {
            return this.form.controls;
          },
          get value() {
            return this.form.value;
          },
          get errors() {
            return this.form.errors;
          },
          addControl: function(dir) {
            var $__0 = this;
            this._later((function(_) {
              var container = $__0._findContainer(dir.path);
              var c = new Control("");
              setUpControl(c, dir);
              container.addControl(dir.name, c);
              c.updateValidity();
            }));
          },
          getControl: function(dir) {
            return this.form.find(dir.path);
          },
          removeControl: function(dir) {
            var $__0 = this;
            this._later((function(_) {
              var container = $__0._findContainer(dir.path);
              if (isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValidity();
              }
            }));
          },
          addControlGroup: function(dir) {
            var $__0 = this;
            this._later((function(_) {
              var container = $__0._findContainer(dir.path);
              var c = new ControlGroup({});
              container.addControl(dir.name, c);
              c.updateValidity();
            }));
          },
          removeControlGroup: function(dir) {
            var $__0 = this;
            this._later((function(_) {
              var container = $__0._findContainer(dir.path);
              if (isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValidity();
              }
            }));
          },
          updateModel: function(dir, value) {
            var $__0 = this;
            this._later((function(_) {
              var c = $__0.form.find(dir.path);
              c.updateValue(value);
            }));
          },
          onSubmit: function() {
            ObservableWrapper.callNext(this.ngSubmit, null);
            return false;
          },
          _findContainer: function(path) {
            ListWrapper.removeLast(path);
            return ListWrapper.isEmpty(path) ? this.form : this.form.find(path);
          },
          _later: function(fn) {
            var c = PromiseWrapper.completer();
            PromiseWrapper.then(c.promise, fn, (function(_) {}));
            c.resolve(null);
          }
        }, {}, $__super);
      }(ControlContainer));
      $__export("NgForm", NgForm);
      $__export("NgForm", NgForm = __decorate([Directive({
        selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
        hostInjector: [formDirectiveBinding],
        host: {'(submit)': 'onSubmit()'},
        events: ['ngSubmit'],
        exportAs: 'form'
      }), __metadata('design:paramtypes', [])], NgForm));
    }
  };
});

System.register("angular2/src/forms/directives/default_value_accessor", ["angular2/angular2", "angular2/src/forms/directives/ng_control", "angular2/src/facade/lang", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/default_value_accessor";
  var __decorate,
      __metadata,
      Directive,
      Renderer,
      ElementRef,
      NgControl,
      isBlank,
      isPresent,
      setProperty,
      DefaultValueAccessor;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Renderer = $__m.Renderer;
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      NgControl = $__m.NgControl;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      setProperty = $__m.setProperty;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      DefaultValueAccessor = (($traceurRuntime.createClass)(function(cd, renderer, elementRef) {
        this.cd = cd;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.value = null;
        this.onChange = (function(_) {});
        this.onTouched = (function() {});
        cd.valueAccessor = this;
      }, {
        writeValue: function(value) {
          this.value = isBlank(value) ? '' : value;
          setProperty(this.renderer, this.elementRef, 'value', this.value);
        },
        get ngClassUntouched() {
          return isPresent(this.cd.control) ? this.cd.control.untouched : false;
        },
        get ngClassTouched() {
          return isPresent(this.cd.control) ? this.cd.control.touched : false;
        },
        get ngClassPristine() {
          return isPresent(this.cd.control) ? this.cd.control.pristine : false;
        },
        get ngClassDirty() {
          return isPresent(this.cd.control) ? this.cd.control.dirty : false;
        },
        get ngClassValid() {
          return isPresent(this.cd.control) ? this.cd.control.valid : false;
        },
        get ngClassInvalid() {
          return isPresent(this.cd.control) ? !this.cd.control.valid : false;
        },
        registerOnChange: function(fn) {
          this.onChange = fn;
        },
        registerOnTouched: function(fn) {
          this.onTouched = fn;
        }
      }, {}));
      $__export("DefaultValueAccessor", DefaultValueAccessor);
      $__export("DefaultValueAccessor", DefaultValueAccessor = __decorate([Directive({
        selector: 'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model]',
        host: {
          '(change)': 'onChange($event.target.value)',
          '(input)': 'onChange($event.target.value)',
          '(blur)': 'onTouched()',
          '[value]': 'value',
          '[class.ng-untouched]': 'ngClassUntouched',
          '[class.ng-touched]': 'ngClassTouched',
          '[class.ng-pristine]': 'ngClassPristine',
          '[class.ng-dirty]': 'ngClassDirty',
          '[class.ng-valid]': 'ngClassValid',
          '[class.ng-invalid]': 'ngClassInvalid'
        }
      }), __metadata('design:paramtypes', [NgControl, Renderer, ElementRef])], DefaultValueAccessor));
    }
  };
});

System.register("angular2/src/forms/directives/checkbox_value_accessor", ["angular2/angular2", "angular2/src/forms/directives/ng_control", "angular2/src/facade/lang", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/checkbox_value_accessor";
  var __decorate,
      __metadata,
      Directive,
      Renderer,
      ElementRef,
      NgControl,
      isPresent,
      setProperty,
      CheckboxControlValueAccessor;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Renderer = $__m.Renderer;
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      NgControl = $__m.NgControl;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      setProperty = $__m.setProperty;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      CheckboxControlValueAccessor = (($traceurRuntime.createClass)(function(cd, renderer, elementRef) {
        this.cd = cd;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.onChange = (function(_) {});
        this.onTouched = (function() {});
        cd.valueAccessor = this;
      }, {
        writeValue: function(value) {
          this.checked = value;
          setProperty(this.renderer, this.elementRef, "checked", value);
        },
        get ngClassUntouched() {
          return isPresent(this.cd.control) ? this.cd.control.untouched : false;
        },
        get ngClassTouched() {
          return isPresent(this.cd.control) ? this.cd.control.touched : false;
        },
        get ngClassPristine() {
          return isPresent(this.cd.control) ? this.cd.control.pristine : false;
        },
        get ngClassDirty() {
          return isPresent(this.cd.control) ? this.cd.control.dirty : false;
        },
        get ngClassValid() {
          return isPresent(this.cd.control) ? this.cd.control.valid : false;
        },
        get ngClassInvalid() {
          return isPresent(this.cd.control) ? !this.cd.control.valid : false;
        },
        registerOnChange: function(fn) {
          this.onChange = fn;
        },
        registerOnTouched: function(fn) {
          this.onTouched = fn;
        }
      }, {}));
      $__export("CheckboxControlValueAccessor", CheckboxControlValueAccessor);
      $__export("CheckboxControlValueAccessor", CheckboxControlValueAccessor = __decorate([Directive({
        selector: 'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
        host: {
          '(change)': 'onChange($event.target.checked)',
          '(blur)': 'onTouched()',
          '[checked]': 'checked',
          '[class.ng-untouched]': 'ngClassUntouched',
          '[class.ng-touched]': 'ngClassTouched',
          '[class.ng-pristine]': 'ngClassPristine',
          '[class.ng-dirty]': 'ngClassDirty',
          '[class.ng-valid]': 'ngClassValid',
          '[class.ng-invalid]': 'ngClassInvalid'
        }
      }), __metadata('design:paramtypes', [NgControl, Renderer, ElementRef])], CheckboxControlValueAccessor));
    }
  };
});

System.register("angular2/src/forms/directives/select_control_value_accessor", ["angular2/angular2", "angular2/src/forms/directives/ng_control", "angular2/src/facade/lang", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/select_control_value_accessor";
  var __decorate,
      __metadata,
      __param,
      Directive,
      Query,
      QueryList,
      Renderer,
      ElementRef,
      NgControl,
      isPresent,
      setProperty,
      NgSelectOption,
      SelectControlValueAccessor;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Query = $__m.Query;
      QueryList = $__m.QueryList;
      Renderer = $__m.Renderer;
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      NgControl = $__m.NgControl;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      setProperty = $__m.setProperty;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      NgSelectOption = (($traceurRuntime.createClass)(function() {}, {}, {}));
      $__export("NgSelectOption", NgSelectOption);
      $__export("NgSelectOption", NgSelectOption = __decorate([Directive({selector: 'option'}), __metadata('design:paramtypes', [])], NgSelectOption));
      SelectControlValueAccessor = (($traceurRuntime.createClass)(function(cd, renderer, elementRef, query) {
        this.cd = cd;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.value = '';
        this.onChange = (function(_) {});
        this.onTouched = (function() {});
        cd.valueAccessor = this;
        this._updateValueWhenListOfOptionsChanges(query);
      }, {
        writeValue: function(value) {
          this.value = value;
          setProperty(this.renderer, this.elementRef, "value", value);
        },
        get ngClassUntouched() {
          return isPresent(this.cd.control) ? this.cd.control.untouched : false;
        },
        get ngClassTouched() {
          return isPresent(this.cd.control) ? this.cd.control.touched : false;
        },
        get ngClassPristine() {
          return isPresent(this.cd.control) ? this.cd.control.pristine : false;
        },
        get ngClassDirty() {
          return isPresent(this.cd.control) ? this.cd.control.dirty : false;
        },
        get ngClassValid() {
          return isPresent(this.cd.control) ? this.cd.control.valid : false;
        },
        get ngClassInvalid() {
          return isPresent(this.cd.control) ? !this.cd.control.valid : false;
        },
        registerOnChange: function(fn) {
          this.onChange = fn;
        },
        registerOnTouched: function(fn) {
          this.onTouched = fn;
        },
        _updateValueWhenListOfOptionsChanges: function(query) {
          var $__0 = this;
          query.onChange((function() {
            return $__0.writeValue($__0.value);
          }));
        }
      }, {}));
      $__export("SelectControlValueAccessor", SelectControlValueAccessor);
      $__export("SelectControlValueAccessor", SelectControlValueAccessor = __decorate([Directive({
        selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
        host: {
          '(change)': 'onChange($event.target.value)',
          '(input)': 'onChange($event.target.value)',
          '(blur)': 'onTouched()',
          '[value]': 'value',
          '[class.ng-untouched]': 'ngClassUntouched',
          '[class.ng-touched]': 'ngClassTouched',
          '[class.ng-pristine]': 'ngClassPristine',
          '[class.ng-dirty]': 'ngClassDirty',
          '[class.ng-valid]': 'ngClassValid',
          '[class.ng-invalid]': 'ngClassInvalid'
        }
      }), __param(3, Query(NgSelectOption, {descendants: true})), __metadata('design:paramtypes', [NgControl, Renderer, ElementRef, QueryList])], SelectControlValueAccessor));
    }
  };
});

System.register("angular2/src/forms/directives", ["angular2/src/facade/lang", "angular2/src/forms/directives/ng_control_name", "angular2/src/forms/directives/ng_form_control", "angular2/src/forms/directives/ng_model", "angular2/src/forms/directives/ng_control_group", "angular2/src/forms/directives/ng_form_model", "angular2/src/forms/directives/ng_form", "angular2/src/forms/directives/default_value_accessor", "angular2/src/forms/directives/checkbox_value_accessor", "angular2/src/forms/directives/select_control_value_accessor", "angular2/src/forms/directives/validators", "angular2/src/forms/directives/ng_control"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives";
  var CONST_EXPR,
      NgControlName,
      NgFormControl,
      NgModel,
      NgControlGroup,
      NgFormModel,
      NgForm,
      DefaultValueAccessor,
      CheckboxControlValueAccessor,
      SelectControlValueAccessor,
      NgSelectOption,
      NgRequiredValidator,
      formDirectives;
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      NgControlName = $__m.NgControlName;
      $__export("NgControlName", $__m.NgControlName);
    }, function($__m) {
      NgFormControl = $__m.NgFormControl;
      $__export("NgFormControl", $__m.NgFormControl);
    }, function($__m) {
      NgModel = $__m.NgModel;
      $__export("NgModel", $__m.NgModel);
    }, function($__m) {
      NgControlGroup = $__m.NgControlGroup;
      $__export("NgControlGroup", $__m.NgControlGroup);
    }, function($__m) {
      NgFormModel = $__m.NgFormModel;
      $__export("NgFormModel", $__m.NgFormModel);
    }, function($__m) {
      NgForm = $__m.NgForm;
      $__export("NgForm", $__m.NgForm);
    }, function($__m) {
      DefaultValueAccessor = $__m.DefaultValueAccessor;
      $__export("DefaultValueAccessor", $__m.DefaultValueAccessor);
    }, function($__m) {
      CheckboxControlValueAccessor = $__m.CheckboxControlValueAccessor;
      $__export("CheckboxControlValueAccessor", $__m.CheckboxControlValueAccessor);
    }, function($__m) {
      SelectControlValueAccessor = $__m.SelectControlValueAccessor;
      NgSelectOption = $__m.NgSelectOption;
      $__export("SelectControlValueAccessor", $__m.SelectControlValueAccessor);
    }, function($__m) {
      NgRequiredValidator = $__m.NgRequiredValidator;
      $__export("NgValidator", $__m.NgValidator);
      $__export("NgRequiredValidator", $__m.NgRequiredValidator);
    }, function($__m) {
      $__export("NgControl", $__m.NgControl);
    }],
    execute: function() {
      formDirectives = CONST_EXPR([NgControlName, NgControlGroup, NgFormControl, NgModel, NgFormModel, NgForm, NgSelectOption, DefaultValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgRequiredValidator]);
      $__export("formDirectives", formDirectives);
    }
  };
});

System.register("angular2/src/forms/form_builder", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/forms/model"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/form_builder";
  var StringMapWrapper,
      ListWrapper,
      isPresent,
      isArray,
      modelModule,
      FormBuilder;
  return {
    setters: [function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isArray = $__m.isArray;
    }, function($__m) {
      modelModule = $__m;
    }],
    execute: function() {
      FormBuilder = (function() {
        function FormBuilder() {}
        return ($traceurRuntime.createClass)(FormBuilder, {
          group: function(controlsConfig) {
            var extra = arguments[1] !== (void 0) ? arguments[1] : null;
            var controls = this._reduceControls(controlsConfig);
            var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
            var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;
            if (isPresent(validator)) {
              return new modelModule.ControlGroup(controls, optionals, validator);
            } else {
              return new modelModule.ControlGroup(controls, optionals);
            }
          },
          control: function(value) {
            var validator = arguments[1] !== (void 0) ? arguments[1] : null;
            if (isPresent(validator)) {
              return new modelModule.Control(value, validator);
            } else {
              return new modelModule.Control(value);
            }
          },
          array: function(controlsConfig) {
            var validator = arguments[1] !== (void 0) ? arguments[1] : null;
            var $__0 = this;
            var controls = ListWrapper.map(controlsConfig, (function(c) {
              return $__0._createControl(c);
            }));
            if (isPresent(validator)) {
              return new modelModule.ControlArray(controls, validator);
            } else {
              return new modelModule.ControlArray(controls);
            }
          },
          _reduceControls: function(controlsConfig) {
            var $__0 = this;
            var controls = {};
            StringMapWrapper.forEach(controlsConfig, (function(controlConfig, controlName) {
              controls[controlName] = $__0._createControl(controlConfig);
            }));
            return controls;
          },
          _createControl: function(controlConfig) {
            if (controlConfig instanceof modelModule.Control || controlConfig instanceof modelModule.ControlGroup || controlConfig instanceof modelModule.ControlArray) {
              return controlConfig;
            } else if (isArray(controlConfig)) {
              var value = ListWrapper.get(controlConfig, 0);
              var validator = controlConfig.length > 1 ? controlConfig[1] : null;
              return this.control(value, validator);
            } else {
              return this.control(controlConfig);
            }
          }
        }, {});
      }());
      $__export("FormBuilder", FormBuilder);
    }
  };
});

System.register("angular2/src/http/interfaces", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/interfaces";
  var BaseException,
      ConnectionBackend,
      Connection;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      ConnectionBackend = (function() {
        function ConnectionBackend() {}
        return ($traceurRuntime.createClass)(ConnectionBackend, {createConnection: function(request) {
            throw new BaseException('Abstract!');
          }}, {});
      }());
      $__export("ConnectionBackend", ConnectionBackend);
      Connection = (function() {
        function Connection() {}
        return ($traceurRuntime.createClass)(Connection, {dispose: function() {
            throw new BaseException('Abstract!');
          }}, {});
      }());
      $__export("Connection", Connection);
    }
  };
});

System.register("angular2/src/http/headers", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/headers";
  var isBlank,
      BaseException,
      isListLikeIterable,
      Map,
      MapWrapper,
      ListWrapper,
      StringMap,
      Headers;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      isListLikeIterable = $__m.isListLikeIterable;
      Map = $__m.Map;
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
      StringMap = $__m.StringMap;
    }],
    execute: function() {
      Headers = (function() {
        function Headers(headers) {
          var $__0 = this;
          if (isBlank(headers)) {
            this._headersMap = new Map();
            return ;
          }
          if (headers instanceof Headers) {
            this._headersMap = headers._headersMap;
          } else if (headers instanceof StringMap) {
            this._headersMap = MapWrapper.createFromStringMap(headers);
            MapWrapper.forEach(this._headersMap, (function(v, k) {
              if (!isListLikeIterable(v)) {
                var list = [];
                list.push(v);
                $__0._headersMap.set(k, list);
              }
            }));
          }
        }
        return ($traceurRuntime.createClass)(Headers, {
          append: function(name, value) {
            var mapName = this._headersMap.get(name);
            var list = isListLikeIterable(mapName) ? mapName : [];
            list.push(value);
            this._headersMap.set(name, list);
          },
          delete: function(name) {
            MapWrapper.delete(this._headersMap, name);
          },
          forEach: function(fn) {
            MapWrapper.forEach(this._headersMap, fn);
          },
          get: function(header) {
            return ListWrapper.first(this._headersMap.get(header));
          },
          has: function(header) {
            return this._headersMap.has(header);
          },
          keys: function() {
            return MapWrapper.keys(this._headersMap);
          },
          set: function(header, value) {
            var list = [];
            if (isListLikeIterable(value)) {
              var pushValue = value.join(',');
              list.push(pushValue);
            } else {
              list.push(value);
            }
            this._headersMap.set(header, list);
          },
          values: function() {
            return MapWrapper.values(this._headersMap);
          },
          getAll: function(header) {
            var headers = this._headersMap.get(header);
            return isListLikeIterable(headers) ? headers : [];
          },
          entries: function() {
            throw new BaseException('"entries" method is not implemented on Headers class');
          }
        }, {});
      }());
      $__export("Headers", Headers);
    }
  };
});

System.register("angular2/src/http/enums", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/enums";
  var RequestModesOpts,
      RequestCacheOpts,
      RequestCredentialsOpts,
      RequestMethods,
      RequestMethodsMap,
      ReadyStates,
      ResponseTypes;
  return {
    setters: [],
    execute: function() {
      $__export("RequestModesOpts", RequestModesOpts);
      (function(RequestModesOpts) {
        RequestModesOpts[RequestModesOpts["Cors"] = 0] = "Cors";
        RequestModesOpts[RequestModesOpts["NoCors"] = 1] = "NoCors";
        RequestModesOpts[RequestModesOpts["SameOrigin"] = 2] = "SameOrigin";
      })(RequestModesOpts || ($__export("RequestModesOpts", RequestModesOpts = {})));
      $__export("RequestCacheOpts", RequestCacheOpts);
      (function(RequestCacheOpts) {
        RequestCacheOpts[RequestCacheOpts["Default"] = 0] = "Default";
        RequestCacheOpts[RequestCacheOpts["NoStore"] = 1] = "NoStore";
        RequestCacheOpts[RequestCacheOpts["Reload"] = 2] = "Reload";
        RequestCacheOpts[RequestCacheOpts["NoCache"] = 3] = "NoCache";
        RequestCacheOpts[RequestCacheOpts["ForceCache"] = 4] = "ForceCache";
        RequestCacheOpts[RequestCacheOpts["OnlyIfCached"] = 5] = "OnlyIfCached";
      })(RequestCacheOpts || ($__export("RequestCacheOpts", RequestCacheOpts = {})));
      $__export("RequestCredentialsOpts", RequestCredentialsOpts);
      (function(RequestCredentialsOpts) {
        RequestCredentialsOpts[RequestCredentialsOpts["Omit"] = 0] = "Omit";
        RequestCredentialsOpts[RequestCredentialsOpts["SameOrigin"] = 1] = "SameOrigin";
        RequestCredentialsOpts[RequestCredentialsOpts["Include"] = 2] = "Include";
      })(RequestCredentialsOpts || ($__export("RequestCredentialsOpts", RequestCredentialsOpts = {})));
      $__export("RequestMethods", RequestMethods);
      (function(RequestMethods) {
        RequestMethods[RequestMethods["GET"] = 0] = "GET";
        RequestMethods[RequestMethods["POST"] = 1] = "POST";
        RequestMethods[RequestMethods["PUT"] = 2] = "PUT";
        RequestMethods[RequestMethods["DELETE"] = 3] = "DELETE";
        RequestMethods[RequestMethods["OPTIONS"] = 4] = "OPTIONS";
        RequestMethods[RequestMethods["HEAD"] = 5] = "HEAD";
        RequestMethods[RequestMethods["PATCH"] = 6] = "PATCH";
      })(RequestMethods || ($__export("RequestMethods", RequestMethods = {})));
      RequestMethodsMap = (function() {
        function RequestMethodsMap() {
          this._methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'];
        }
        return ($traceurRuntime.createClass)(RequestMethodsMap, {getMethod: function(method) {
            return this._methods[method];
          }}, {});
      }());
      $__export("RequestMethodsMap", RequestMethodsMap);
      $__export("ReadyStates", ReadyStates);
      (function(ReadyStates) {
        ReadyStates[ReadyStates["UNSENT"] = 0] = "UNSENT";
        ReadyStates[ReadyStates["OPEN"] = 1] = "OPEN";
        ReadyStates[ReadyStates["HEADERS_RECEIVED"] = 2] = "HEADERS_RECEIVED";
        ReadyStates[ReadyStates["LOADING"] = 3] = "LOADING";
        ReadyStates[ReadyStates["DONE"] = 4] = "DONE";
        ReadyStates[ReadyStates["CANCELLED"] = 5] = "CANCELLED";
      })(ReadyStates || ($__export("ReadyStates", ReadyStates = {})));
      $__export("ResponseTypes", ResponseTypes);
      (function(ResponseTypes) {
        ResponseTypes[ResponseTypes["Basic"] = 0] = "Basic";
        ResponseTypes[ResponseTypes["Cors"] = 1] = "Cors";
        ResponseTypes[ResponseTypes["Default"] = 2] = "Default";
        ResponseTypes[ResponseTypes["Error"] = 3] = "Error";
        ResponseTypes[ResponseTypes["Opaque"] = 4] = "Opaque";
      })(ResponseTypes || ($__export("ResponseTypes", ResponseTypes = {})));
    }
  };
});

System.register("angular2/src/http/static_response", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/static_response";
  var BaseException,
      isJsObject,
      isString,
      Json,
      Response;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      isJsObject = $__m.isJsObject;
      isString = $__m.isString;
      Json = $__m.Json;
    }],
    execute: function() {
      Response = (function() {
        function Response(responseOptions) {
          this._body = responseOptions.body;
          this.status = responseOptions.status;
          this.statusText = responseOptions.statusText;
          this.headers = responseOptions.headers;
          this.type = responseOptions.type;
          this.url = responseOptions.url;
        }
        return ($traceurRuntime.createClass)(Response, {
          blob: function() {
            throw new BaseException('"blob()" method not implemented on Response superclass');
          },
          json: function() {
            var jsonResponse;
            if (isJsObject(this._body)) {
              jsonResponse = this._body;
            } else if (isString(this._body)) {
              jsonResponse = Json.parse(this._body);
            }
            return jsonResponse;
          },
          text: function() {
            return this._body.toString();
          },
          arrayBuffer: function() {
            throw new BaseException('"arrayBuffer()" method not implemented on Response superclass');
          }
        }, {});
      }());
      $__export("Response", Response);
    }
  };
});

System.register("angular2/src/http/base_response_options", ["angular2/di", "angular2/src/facade/lang", "angular2/src/http/headers", "angular2/src/http/enums"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/base_response_options";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      Headers,
      ResponseTypes,
      ResponseOptions,
      BaseResponseOptions;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      Headers = $__m.Headers;
    }, function($__m) {
      ResponseTypes = $__m.ResponseTypes;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ResponseOptions = (function() {
        function ResponseOptions() {
          var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
              body = $__2.body,
              status = $__2.status,
              headers = $__2.headers,
              statusText = $__2.statusText,
              type = $__2.type,
              url = $__2.url;
          this.body = isPresent(body) ? body : null;
          this.status = isPresent(status) ? status : null;
          this.headers = isPresent(headers) ? headers : null;
          this.statusText = isPresent(statusText) ? statusText : null;
          this.type = isPresent(type) ? type : null;
          this.url = isPresent(url) ? url : null;
        }
        return ($traceurRuntime.createClass)(ResponseOptions, {merge: function(options) {
            return new ResponseOptions({
              body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
              status: isPresent(options) && isPresent(options.status) ? options.status : this.status,
              headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
              statusText: isPresent(options) && isPresent(options.statusText) ? options.statusText : this.statusText,
              type: isPresent(options) && isPresent(options.type) ? options.type : this.type,
              url: isPresent(options) && isPresent(options.url) ? options.url : this.url
            });
          }}, {});
      }());
      $__export("ResponseOptions", ResponseOptions);
      BaseResponseOptions = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, {
            status: 200,
            statusText: 'Ok',
            type: ResponseTypes.Default,
            headers: new Headers()
          });
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(ResponseOptions));
      $__export("BaseResponseOptions", BaseResponseOptions);
      $__export("BaseResponseOptions", BaseResponseOptions = __decorate([Injectable(), __metadata('design:paramtypes', [])], BaseResponseOptions));
    }
  };
});

System.register("angular2/src/http/backends/browser_xhr", ["angular2/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/backends/browser_xhr";
  var __decorate,
      __metadata,
      Injectable,
      BrowserXhr;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      BrowserXhr = (($traceurRuntime.createClass)(function() {}, {build: function() {
          return (new XMLHttpRequest());
        }}, {}));
      $__export("BrowserXhr", BrowserXhr);
      $__export("BrowserXhr", BrowserXhr = __decorate([Injectable(), __metadata('design:paramtypes', [])], BrowserXhr));
    }
  };
});

System.register("angular2/src/http/backends/mock_backend", ["angular2/di", "angular2/src/http/static_request", "angular2/src/http/enums", "angular2/src/http/interfaces", "angular2/src/facade/async", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/backends/mock_backend";
  var __decorate,
      __metadata,
      Injectable,
      Request,
      ReadyStates,
      Connection,
      ConnectionBackend,
      ObservableWrapper,
      EventEmitter,
      isPresent,
      IMPLEMENTS,
      BaseException,
      MockConnection,
      MockBackend;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      Request = $__m.Request;
    }, function($__m) {
      ReadyStates = $__m.ReadyStates;
    }, function($__m) {
      Connection = $__m.Connection;
      ConnectionBackend = $__m.ConnectionBackend;
    }, function($__m) {
      ObservableWrapper = $__m.ObservableWrapper;
      EventEmitter = $__m.EventEmitter;
    }, function($__m) {
      isPresent = $__m.isPresent;
      IMPLEMENTS = $__m.IMPLEMENTS;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      MockConnection = (($traceurRuntime.createClass)(function(req) {
        this.response = new EventEmitter();
        this.readyState = ReadyStates.OPEN;
        this.request = req;
      }, {
        dispose: function() {
          if (this.readyState !== ReadyStates.DONE) {
            this.readyState = ReadyStates.CANCELLED;
          }
        },
        mockRespond: function(res) {
          if (this.readyState === ReadyStates.DONE || this.readyState === ReadyStates.CANCELLED) {
            throw new BaseException('Connection has already been resolved');
          }
          this.readyState = ReadyStates.DONE;
          ObservableWrapper.callNext(this.response, res);
          ObservableWrapper.callReturn(this.response);
        },
        mockDownload: function(res) {},
        mockError: function(err) {
          this.readyState = ReadyStates.DONE;
          ObservableWrapper.callThrow(this.response, err);
          ObservableWrapper.callReturn(this.response);
        }
      }, {}));
      $__export("MockConnection", MockConnection);
      $__export("MockConnection", MockConnection = __decorate([IMPLEMENTS(Connection), __metadata('design:paramtypes', [Request])], MockConnection));
      MockBackend = (($traceurRuntime.createClass)(function() {
        var $__0 = this;
        this.connectionsArray = [];
        this.connections = new EventEmitter();
        ObservableWrapper.subscribe(this.connections, (function(connection) {
          return $__0.connectionsArray.push(connection);
        }));
        this.pendingConnections = new EventEmitter();
      }, {
        verifyNoPendingRequests: function() {
          var pending = 0;
          ObservableWrapper.subscribe(this.pendingConnections, (function(c) {
            return pending++;
          }));
          if (pending > 0)
            throw new BaseException((pending + " pending connections to be resolved"));
        },
        resolveAllConnections: function() {
          ObservableWrapper.subscribe(this.connections, (function(c) {
            return c.readyState = 4;
          }));
        },
        createConnection: function(req) {
          if (!isPresent(req) || !(req instanceof Request)) {
            throw new BaseException(("createConnection requires an instance of Request, got " + req));
          }
          var connection = new MockConnection(req);
          ObservableWrapper.callNext(this.connections, connection);
          return connection;
        }
      }, {}));
      $__export("MockBackend", MockBackend);
      $__export("MockBackend", MockBackend = __decorate([Injectable(), IMPLEMENTS(ConnectionBackend), __metadata('design:paramtypes', [])], MockBackend));
    }
  };
});

System.register("angular2/src/http/url_search_params", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/url_search_params";
  var isPresent,
      StringWrapper,
      Map,
      MapWrapper,
      ListWrapper,
      isListLikeIterable,
      URLSearchParams;
  function paramParser(rawParams) {
    var map = new Map();
    var params = StringWrapper.split(rawParams, new RegExp('&'));
    ListWrapper.forEach(params, (function(param) {
      var split = StringWrapper.split(param, new RegExp('='));
      var key = ListWrapper.get(split, 0);
      var val = ListWrapper.get(split, 1);
      var list = isPresent(map.get(key)) ? map.get(key) : [];
      list.push(val);
      map.set(key, list);
    }));
    return map;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      Map = $__m.Map;
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
      isListLikeIterable = $__m.isListLikeIterable;
    }],
    execute: function() {
      URLSearchParams = (function() {
        function URLSearchParams(rawParams) {
          this.rawParams = rawParams;
          this.paramsMap = paramParser(rawParams);
        }
        return ($traceurRuntime.createClass)(URLSearchParams, {
          has: function(param) {
            return this.paramsMap.has(param);
          },
          get: function(param) {
            var storedParam = this.paramsMap.get(param);
            if (isListLikeIterable(storedParam)) {
              return ListWrapper.first(storedParam);
            } else {
              return null;
            }
          },
          getAll: function(param) {
            var mapParam = this.paramsMap.get(param);
            return isPresent(mapParam) ? mapParam : [];
          },
          append: function(param, val) {
            var mapParam = this.paramsMap.get(param);
            var list = isPresent(mapParam) ? mapParam : [];
            list.push(val);
            this.paramsMap.set(param, list);
          },
          toString: function() {
            var paramsList = [];
            MapWrapper.forEach(this.paramsMap, (function(values, k) {
              ListWrapper.forEach(values, (function(v) {
                paramsList.push(k + '=' + v);
              }));
            }));
            return ListWrapper.join(paramsList, '&');
          },
          delete: function(param) {
            MapWrapper.delete(this.paramsMap, param);
          }
        }, {});
      }());
      $__export("URLSearchParams", URLSearchParams);
    }
  };
});

System.register("angular2/src/change_detection/parser/ast", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/ast";
  var isBlank,
      isPresent,
      FunctionWrapper,
      BaseException,
      ListWrapper,
      StringMapWrapper,
      AST,
      EmptyExpr,
      ImplicitReceiver,
      Chain,
      Conditional,
      If,
      AccessMember,
      SafeAccessMember,
      KeyedAccess,
      BindingPipe,
      LiteralPrimitive,
      LiteralArray,
      LiteralMap,
      Interpolation,
      Binary,
      PrefixNot,
      Assignment,
      MethodCall,
      SafeMethodCall,
      FunctionCall,
      ASTWithSource,
      TemplateBinding,
      AstTransformer,
      _evalListCache;
  function evalList(context, locals, exps) {
    var length = exps.length;
    if (length > 10) {
      throw new BaseException("Cannot have more than 10 argument");
    }
    var result = _evalListCache[length];
    for (var i = 0; i < length; i++) {
      result[i] = exps[i].eval(context, locals);
    }
    return result;
  }
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      FunctionWrapper = $__m.FunctionWrapper;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      AST = (function() {
        function AST() {}
        return ($traceurRuntime.createClass)(AST, {
          eval: function(context, locals) {
            throw new BaseException("Not supported");
          },
          get isAssignable() {
            return false;
          },
          assign: function(context, locals, value) {
            throw new BaseException("Not supported");
          },
          visit: function(visitor) {
            return null;
          },
          toString: function() {
            return "AST";
          }
        }, {});
      }());
      $__export("AST", AST);
      EmptyExpr = (function($__super) {
        function EmptyExpr() {
          $traceurRuntime.superConstructor(EmptyExpr).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(EmptyExpr, {
          eval: function(context, locals) {
            return null;
          },
          visit: function(visitor) {}
        }, {}, $__super);
      }(AST));
      $__export("EmptyExpr", EmptyExpr);
      ImplicitReceiver = (function($__super) {
        function ImplicitReceiver() {
          $traceurRuntime.superConstructor(ImplicitReceiver).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(ImplicitReceiver, {
          eval: function(context, locals) {
            return context;
          },
          visit: function(visitor) {
            return visitor.visitImplicitReceiver(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("ImplicitReceiver", ImplicitReceiver);
      Chain = (function($__super) {
        function Chain(expressions) {
          $traceurRuntime.superConstructor(Chain).call(this);
          this.expressions = expressions;
        }
        return ($traceurRuntime.createClass)(Chain, {
          eval: function(context, locals) {
            var result;
            for (var i = 0; i < this.expressions.length; i++) {
              var last = this.expressions[i].eval(context, locals);
              if (isPresent(last))
                result = last;
            }
            return result;
          },
          visit: function(visitor) {
            return visitor.visitChain(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Chain", Chain);
      Conditional = (function($__super) {
        function Conditional(condition, trueExp, falseExp) {
          $traceurRuntime.superConstructor(Conditional).call(this);
          this.condition = condition;
          this.trueExp = trueExp;
          this.falseExp = falseExp;
        }
        return ($traceurRuntime.createClass)(Conditional, {
          eval: function(context, locals) {
            if (this.condition.eval(context, locals)) {
              return this.trueExp.eval(context, locals);
            } else {
              return this.falseExp.eval(context, locals);
            }
          },
          visit: function(visitor) {
            return visitor.visitConditional(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Conditional", Conditional);
      If = (function($__super) {
        function If(condition, trueExp, falseExp) {
          $traceurRuntime.superConstructor(If).call(this);
          this.condition = condition;
          this.trueExp = trueExp;
          this.falseExp = falseExp;
        }
        return ($traceurRuntime.createClass)(If, {
          eval: function(context, locals) {
            if (this.condition.eval(context, locals)) {
              this.trueExp.eval(context, locals);
            } else if (isPresent(this.falseExp)) {
              this.falseExp.eval(context, locals);
            }
          },
          visit: function(visitor) {
            return visitor.visitIf(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("If", If);
      AccessMember = (function($__super) {
        function AccessMember(receiver, name, getter, setter) {
          $traceurRuntime.superConstructor(AccessMember).call(this);
          this.receiver = receiver;
          this.name = name;
          this.getter = getter;
          this.setter = setter;
        }
        return ($traceurRuntime.createClass)(AccessMember, {
          eval: function(context, locals) {
            if (this.receiver instanceof ImplicitReceiver && isPresent(locals) && locals.contains(this.name)) {
              return locals.get(this.name);
            } else {
              var evaluatedReceiver = this.receiver.eval(context, locals);
              return this.getter(evaluatedReceiver);
            }
          },
          get isAssignable() {
            return true;
          },
          assign: function(context, locals, value) {
            var evaluatedContext = this.receiver.eval(context, locals);
            if (this.receiver instanceof ImplicitReceiver && isPresent(locals) && locals.contains(this.name)) {
              throw new BaseException(("Cannot reassign a variable binding " + this.name));
            } else {
              return this.setter(evaluatedContext, value);
            }
          },
          visit: function(visitor) {
            return visitor.visitAccessMember(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("AccessMember", AccessMember);
      SafeAccessMember = (function($__super) {
        function SafeAccessMember(receiver, name, getter, setter) {
          $traceurRuntime.superConstructor(SafeAccessMember).call(this);
          this.receiver = receiver;
          this.name = name;
          this.getter = getter;
          this.setter = setter;
        }
        return ($traceurRuntime.createClass)(SafeAccessMember, {
          eval: function(context, locals) {
            var evaluatedReceiver = this.receiver.eval(context, locals);
            return isBlank(evaluatedReceiver) ? null : this.getter(evaluatedReceiver);
          },
          visit: function(visitor) {
            return visitor.visitSafeAccessMember(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("SafeAccessMember", SafeAccessMember);
      KeyedAccess = (function($__super) {
        function KeyedAccess(obj, key) {
          $traceurRuntime.superConstructor(KeyedAccess).call(this);
          this.obj = obj;
          this.key = key;
        }
        return ($traceurRuntime.createClass)(KeyedAccess, {
          eval: function(context, locals) {
            var obj = this.obj.eval(context, locals);
            var key = this.key.eval(context, locals);
            return obj[key];
          },
          get isAssignable() {
            return true;
          },
          assign: function(context, locals, value) {
            var obj = this.obj.eval(context, locals);
            var key = this.key.eval(context, locals);
            obj[key] = value;
            return value;
          },
          visit: function(visitor) {
            return visitor.visitKeyedAccess(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("KeyedAccess", KeyedAccess);
      BindingPipe = (function($__super) {
        function BindingPipe(exp, name, args) {
          $traceurRuntime.superConstructor(BindingPipe).call(this);
          this.exp = exp;
          this.name = name;
          this.args = args;
        }
        return ($traceurRuntime.createClass)(BindingPipe, {visit: function(visitor) {
            return visitor.visitPipe(this);
          }}, {}, $__super);
      }(AST));
      $__export("BindingPipe", BindingPipe);
      LiteralPrimitive = (function($__super) {
        function LiteralPrimitive(value) {
          $traceurRuntime.superConstructor(LiteralPrimitive).call(this);
          this.value = value;
        }
        return ($traceurRuntime.createClass)(LiteralPrimitive, {
          eval: function(context, locals) {
            return this.value;
          },
          visit: function(visitor) {
            return visitor.visitLiteralPrimitive(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("LiteralPrimitive", LiteralPrimitive);
      LiteralArray = (function($__super) {
        function LiteralArray(expressions) {
          $traceurRuntime.superConstructor(LiteralArray).call(this);
          this.expressions = expressions;
        }
        return ($traceurRuntime.createClass)(LiteralArray, {
          eval: function(context, locals) {
            return ListWrapper.map(this.expressions, (function(e) {
              return e.eval(context, locals);
            }));
          },
          visit: function(visitor) {
            return visitor.visitLiteralArray(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("LiteralArray", LiteralArray);
      LiteralMap = (function($__super) {
        function LiteralMap(keys, values) {
          $traceurRuntime.superConstructor(LiteralMap).call(this);
          this.keys = keys;
          this.values = values;
        }
        return ($traceurRuntime.createClass)(LiteralMap, {
          eval: function(context, locals) {
            var res = StringMapWrapper.create();
            for (var i = 0; i < this.keys.length; ++i) {
              StringMapWrapper.set(res, this.keys[i], this.values[i].eval(context, locals));
            }
            return res;
          },
          visit: function(visitor) {
            return visitor.visitLiteralMap(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("LiteralMap", LiteralMap);
      Interpolation = (function($__super) {
        function Interpolation(strings, expressions) {
          $traceurRuntime.superConstructor(Interpolation).call(this);
          this.strings = strings;
          this.expressions = expressions;
        }
        return ($traceurRuntime.createClass)(Interpolation, {
          eval: function(context, locals) {
            throw new BaseException("evaluating an Interpolation is not supported");
          },
          visit: function(visitor) {
            visitor.visitInterpolation(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Interpolation", Interpolation);
      Binary = (function($__super) {
        function Binary(operation, left, right) {
          $traceurRuntime.superConstructor(Binary).call(this);
          this.operation = operation;
          this.left = left;
          this.right = right;
        }
        return ($traceurRuntime.createClass)(Binary, {
          eval: function(context, locals) {
            var left = this.left.eval(context, locals);
            switch (this.operation) {
              case '&&':
                return left && this.right.eval(context, locals);
              case '||':
                return left || this.right.eval(context, locals);
            }
            var right = this.right.eval(context, locals);
            switch (this.operation) {
              case '+':
                return left + right;
              case '-':
                return left - right;
              case '*':
                return left * right;
              case '/':
                return left / right;
              case '%':
                return left % right;
              case '==':
                return left == right;
              case '!=':
                return left != right;
              case '===':
                return left === right;
              case '!==':
                return left !== right;
              case '<':
                return left < right;
              case '>':
                return left > right;
              case '<=':
                return left <= right;
              case '>=':
                return left >= right;
              case '^':
                return left ^ right;
              case '&':
                return left & right;
            }
            throw 'Internal error [$operation] not handled';
          },
          visit: function(visitor) {
            return visitor.visitBinary(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Binary", Binary);
      PrefixNot = (function($__super) {
        function PrefixNot(expression) {
          $traceurRuntime.superConstructor(PrefixNot).call(this);
          this.expression = expression;
        }
        return ($traceurRuntime.createClass)(PrefixNot, {
          eval: function(context, locals) {
            return !this.expression.eval(context, locals);
          },
          visit: function(visitor) {
            return visitor.visitPrefixNot(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("PrefixNot", PrefixNot);
      Assignment = (function($__super) {
        function Assignment(target, value) {
          $traceurRuntime.superConstructor(Assignment).call(this);
          this.target = target;
          this.value = value;
        }
        return ($traceurRuntime.createClass)(Assignment, {
          eval: function(context, locals) {
            return this.target.assign(context, locals, this.value.eval(context, locals));
          },
          visit: function(visitor) {
            return visitor.visitAssignment(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Assignment", Assignment);
      MethodCall = (function($__super) {
        function MethodCall(receiver, name, fn, args) {
          $traceurRuntime.superConstructor(MethodCall).call(this);
          this.receiver = receiver;
          this.name = name;
          this.fn = fn;
          this.args = args;
        }
        return ($traceurRuntime.createClass)(MethodCall, {
          eval: function(context, locals) {
            var evaluatedArgs = evalList(context, locals, this.args);
            if (this.receiver instanceof ImplicitReceiver && isPresent(locals) && locals.contains(this.name)) {
              var fn = locals.get(this.name);
              return FunctionWrapper.apply(fn, evaluatedArgs);
            } else {
              var evaluatedReceiver = this.receiver.eval(context, locals);
              return this.fn(evaluatedReceiver, evaluatedArgs);
            }
          },
          visit: function(visitor) {
            return visitor.visitMethodCall(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("MethodCall", MethodCall);
      SafeMethodCall = (function($__super) {
        function SafeMethodCall(receiver, name, fn, args) {
          $traceurRuntime.superConstructor(SafeMethodCall).call(this);
          this.receiver = receiver;
          this.name = name;
          this.fn = fn;
          this.args = args;
        }
        return ($traceurRuntime.createClass)(SafeMethodCall, {
          eval: function(context, locals) {
            var evaluatedReceiver = this.receiver.eval(context, locals);
            if (isBlank(evaluatedReceiver))
              return null;
            var evaluatedArgs = evalList(context, locals, this.args);
            return this.fn(evaluatedReceiver, evaluatedArgs);
          },
          visit: function(visitor) {
            return visitor.visitSafeMethodCall(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("SafeMethodCall", SafeMethodCall);
      FunctionCall = (function($__super) {
        function FunctionCall(target, args) {
          $traceurRuntime.superConstructor(FunctionCall).call(this);
          this.target = target;
          this.args = args;
        }
        return ($traceurRuntime.createClass)(FunctionCall, {
          eval: function(context, locals) {
            var obj = this.target.eval(context, locals);
            if (!(obj instanceof Function)) {
              throw new BaseException((obj + " is not a function"));
            }
            return FunctionWrapper.apply(obj, evalList(context, locals, this.args));
          },
          visit: function(visitor) {
            return visitor.visitFunctionCall(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("FunctionCall", FunctionCall);
      ASTWithSource = (function($__super) {
        function ASTWithSource(ast, source, location) {
          $traceurRuntime.superConstructor(ASTWithSource).call(this);
          this.ast = ast;
          this.source = source;
          this.location = location;
        }
        return ($traceurRuntime.createClass)(ASTWithSource, {
          eval: function(context, locals) {
            return this.ast.eval(context, locals);
          },
          get isAssignable() {
            return this.ast.isAssignable;
          },
          assign: function(context, locals, value) {
            return this.ast.assign(context, locals, value);
          },
          visit: function(visitor) {
            return this.ast.visit(visitor);
          },
          toString: function() {
            return (this.source + " in " + this.location);
          }
        }, {}, $__super);
      }(AST));
      $__export("ASTWithSource", ASTWithSource);
      TemplateBinding = (function() {
        function TemplateBinding(key, keyIsVar, name, expression) {
          this.key = key;
          this.keyIsVar = keyIsVar;
          this.name = name;
          this.expression = expression;
        }
        return ($traceurRuntime.createClass)(TemplateBinding, {}, {});
      }());
      $__export("TemplateBinding", TemplateBinding);
      AstTransformer = (function() {
        function AstTransformer() {}
        return ($traceurRuntime.createClass)(AstTransformer, {
          visitImplicitReceiver: function(ast) {
            return ast;
          },
          visitInterpolation: function(ast) {
            return new Interpolation(ast.strings, this.visitAll(ast.expressions));
          },
          visitLiteralPrimitive: function(ast) {
            return new LiteralPrimitive(ast.value);
          },
          visitAccessMember: function(ast) {
            return new AccessMember(ast.receiver.visit(this), ast.name, ast.getter, ast.setter);
          },
          visitSafeAccessMember: function(ast) {
            return new SafeAccessMember(ast.receiver.visit(this), ast.name, ast.getter, ast.setter);
          },
          visitMethodCall: function(ast) {
            return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
          },
          visitSafeMethodCall: function(ast) {
            return new SafeMethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
          },
          visitFunctionCall: function(ast) {
            return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
          },
          visitLiteralArray: function(ast) {
            return new LiteralArray(this.visitAll(ast.expressions));
          },
          visitLiteralMap: function(ast) {
            return new LiteralMap(ast.keys, this.visitAll(ast.values));
          },
          visitBinary: function(ast) {
            return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
          },
          visitPrefixNot: function(ast) {
            return new PrefixNot(ast.expression.visit(this));
          },
          visitConditional: function(ast) {
            return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
          },
          visitPipe: function(ast) {
            return new BindingPipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args));
          },
          visitKeyedAccess: function(ast) {
            return new KeyedAccess(ast.obj.visit(this), ast.key.visit(this));
          },
          visitAll: function(asts) {
            var res = ListWrapper.createFixedSize(asts.length);
            for (var i = 0; i < asts.length; ++i) {
              res[i] = asts[i].visit(this);
            }
            return res;
          },
          visitChain: function(ast) {
            return new Chain(this.visitAll(ast.expressions));
          },
          visitAssignment: function(ast) {
            return new Assignment(ast.target.visit(this), ast.value.visit(this));
          },
          visitIf: function(ast) {
            var falseExp = isPresent(ast.falseExp) ? ast.falseExp.visit(this) : null;
            return new If(ast.condition.visit(this), ast.trueExp.visit(this), falseExp);
          }
        }, {});
      }());
      $__export("AstTransformer", AstTransformer);
      _evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    }
  };
});

System.register("angular2/src/di/annotations", ["angular2/src/di/annotations_impl"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/annotations";
  return {
    setters: [function($__m) {
      $__export("InjectAnnotation", $__m.Inject);
      $__export("OptionalAnnotation", $__m.Optional);
      $__export("InjectableAnnotation", $__m.Injectable);
      $__export("VisibilityAnnotation", $__m.Visibility);
      $__export("SelfAnnotation", $__m.Self);
      $__export("ParentAnnotation", $__m.Parent);
      $__export("AncestorAnnotation", $__m.Ancestor);
      $__export("UnboundedAnnotation", $__m.Unbounded);
      $__export("DependencyAnnotation", $__m.DependencyAnnotation);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/reflection/reflection", ["angular2/src/reflection/reflector", "angular2/src/reflection/reflection_capabilities"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/reflection";
  var Reflector,
      ReflectionCapabilities,
      reflector;
  return {
    setters: [function($__m) {
      Reflector = $__m.Reflector;
      $__export("Reflector", $__m.Reflector);
    }, function($__m) {
      ReflectionCapabilities = $__m.ReflectionCapabilities;
    }],
    execute: function() {
      reflector = new Reflector(new ReflectionCapabilities());
      $__export("reflector", reflector);
    }
  };
});

System.register("angular2/src/change_detection/change_detection_util", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/exceptions", "angular2/src/change_detection/pipes/pipe", "angular2/src/change_detection/constants"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detection_util";
  var isBlank,
      BaseException,
      StringMapWrapper,
      DehydratedException,
      ExpressionChangedAfterItHasBeenChecked,
      WrappedValue,
      CHECK_ALWAYS,
      CHECK_ONCE,
      ON_PUSH,
      uninitialized,
      SimpleChange,
      _simpleChangesIndex,
      _simpleChanges,
      ChangeDetectionUtil;
  function _simpleChange(previousValue, currentValue) {
    var index = _simpleChangesIndex++ % 20;
    var s = _simpleChanges[index];
    s.previousValue = previousValue;
    s.currentValue = currentValue;
    return s;
  }
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      DehydratedException = $__m.DehydratedException;
      ExpressionChangedAfterItHasBeenChecked = $__m.ExpressionChangedAfterItHasBeenChecked;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
    }, function($__m) {
      CHECK_ALWAYS = $__m.CHECK_ALWAYS;
      CHECK_ONCE = $__m.CHECK_ONCE;
      ON_PUSH = $__m.ON_PUSH;
    }],
    execute: function() {
      uninitialized = new Object();
      $__export("uninitialized", uninitialized);
      SimpleChange = (function() {
        function SimpleChange(previousValue, currentValue) {
          this.previousValue = previousValue;
          this.currentValue = currentValue;
        }
        return ($traceurRuntime.createClass)(SimpleChange, {}, {});
      }());
      $__export("SimpleChange", SimpleChange);
      _simpleChangesIndex = 0;
      _simpleChanges = [new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null)];
      ChangeDetectionUtil = (function() {
        function ChangeDetectionUtil() {}
        return ($traceurRuntime.createClass)(ChangeDetectionUtil, {}, {
          uninitialized: function() {
            return uninitialized;
          },
          arrayFn0: function() {
            return [];
          },
          arrayFn1: function(a1) {
            return [a1];
          },
          arrayFn2: function(a1, a2) {
            return [a1, a2];
          },
          arrayFn3: function(a1, a2, a3) {
            return [a1, a2, a3];
          },
          arrayFn4: function(a1, a2, a3, a4) {
            return [a1, a2, a3, a4];
          },
          arrayFn5: function(a1, a2, a3, a4, a5) {
            return [a1, a2, a3, a4, a5];
          },
          arrayFn6: function(a1, a2, a3, a4, a5, a6) {
            return [a1, a2, a3, a4, a5, a6];
          },
          arrayFn7: function(a1, a2, a3, a4, a5, a6, a7) {
            return [a1, a2, a3, a4, a5, a6, a7];
          },
          arrayFn8: function(a1, a2, a3, a4, a5, a6, a7, a8) {
            return [a1, a2, a3, a4, a5, a6, a7, a8];
          },
          arrayFn9: function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
            return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
          },
          operation_negate: function(value) {
            return !value;
          },
          operation_add: function(left, right) {
            return left + right;
          },
          operation_subtract: function(left, right) {
            return left - right;
          },
          operation_multiply: function(left, right) {
            return left * right;
          },
          operation_divide: function(left, right) {
            return left / right;
          },
          operation_remainder: function(left, right) {
            return left % right;
          },
          operation_equals: function(left, right) {
            return left == right;
          },
          operation_not_equals: function(left, right) {
            return left != right;
          },
          operation_identical: function(left, right) {
            return left === right;
          },
          operation_not_identical: function(left, right) {
            return left !== right;
          },
          operation_less_then: function(left, right) {
            return left < right;
          },
          operation_greater_then: function(left, right) {
            return left > right;
          },
          operation_less_or_equals_then: function(left, right) {
            return left <= right;
          },
          operation_greater_or_equals_then: function(left, right) {
            return left >= right;
          },
          operation_logical_and: function(left, right) {
            return left && right;
          },
          operation_logical_or: function(left, right) {
            return left || right;
          },
          cond: function(cond, trueVal, falseVal) {
            return cond ? trueVal : falseVal;
          },
          mapFn: function(keys) {
            function buildMap(values) {
              var res = StringMapWrapper.create();
              for (var i = 0; i < keys.length; ++i) {
                StringMapWrapper.set(res, keys[i], values[i]);
              }
              return res;
            }
            switch (keys.length) {
              case 0:
                return (function() {
                  return [];
                });
              case 1:
                return (function(a1) {
                  return buildMap([a1]);
                });
              case 2:
                return (function(a1, a2) {
                  return buildMap([a1, a2]);
                });
              case 3:
                return (function(a1, a2, a3) {
                  return buildMap([a1, a2, a3]);
                });
              case 4:
                return (function(a1, a2, a3, a4) {
                  return buildMap([a1, a2, a3, a4]);
                });
              case 5:
                return (function(a1, a2, a3, a4, a5) {
                  return buildMap([a1, a2, a3, a4, a5]);
                });
              case 6:
                return (function(a1, a2, a3, a4, a5, a6) {
                  return buildMap([a1, a2, a3, a4, a5, a6]);
                });
              case 7:
                return (function(a1, a2, a3, a4, a5, a6, a7) {
                  return buildMap([a1, a2, a3, a4, a5, a6, a7]);
                });
              case 8:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
                  return buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
                });
              case 9:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                  return buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
                });
              default:
                throw new BaseException("Does not support literal maps with more than 9 elements");
            }
          },
          keyedAccess: function(obj, args) {
            return obj[args[0]];
          },
          unwrapValue: function(value) {
            if (value instanceof WrappedValue) {
              return value.wrapped;
            } else {
              return value;
            }
          },
          throwOnChange: function(proto, change) {
            throw new ExpressionChangedAfterItHasBeenChecked(proto, change);
          },
          throwDehydrated: function() {
            throw new DehydratedException();
          },
          changeDetectionMode: function(strategy) {
            return strategy == ON_PUSH ? CHECK_ONCE : CHECK_ALWAYS;
          },
          simpleChange: function(previousValue, currentValue) {
            return _simpleChange(previousValue, currentValue);
          },
          addChange: function(changes, propertyName, change) {
            if (isBlank(changes)) {
              changes = {};
            }
            changes[propertyName] = change;
            return changes;
          },
          isValueBlank: function(value) {
            return isBlank(value);
          }
        });
      }());
      $__export("ChangeDetectionUtil", ChangeDetectionUtil);
    }
  };
});

System.register("angular2/src/change_detection/abstract_change_detector", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/change_detector_ref", "angular2/src/change_detection/constants"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/abstract_change_detector";
  var isPresent,
      ListWrapper,
      ChangeDetectorRef,
      CHECK_ONCE,
      CHECKED,
      DETACHED,
      AbstractChangeDetector;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
    }, function($__m) {
      CHECK_ONCE = $__m.CHECK_ONCE;
      CHECKED = $__m.CHECKED;
      DETACHED = $__m.DETACHED;
    }],
    execute: function() {
      AbstractChangeDetector = (function() {
        function AbstractChangeDetector(id) {
          this.id = id;
          this.lightDomChildren = [];
          this.shadowDomChildren = [];
          this.mode = null;
          this.ref = new ChangeDetectorRef(this);
        }
        return ($traceurRuntime.createClass)(AbstractChangeDetector, {
          addChild: function(cd) {
            this.lightDomChildren.push(cd);
            cd.parent = this;
          },
          removeChild: function(cd) {
            ListWrapper.remove(this.lightDomChildren, cd);
          },
          addShadowDomChild: function(cd) {
            this.shadowDomChildren.push(cd);
            cd.parent = this;
          },
          removeShadowDomChild: function(cd) {
            ListWrapper.remove(this.shadowDomChildren, cd);
          },
          remove: function() {
            this.parent.removeChild(this);
          },
          detectChanges: function() {
            this._detectChanges(false);
          },
          checkNoChanges: function() {
            this._detectChanges(true);
          },
          _detectChanges: function(throwOnChange) {
            if (this.mode === DETACHED || this.mode === CHECKED)
              return ;
            this.detectChangesInRecords(throwOnChange);
            this._detectChangesInLightDomChildren(throwOnChange);
            if (throwOnChange === false)
              this.callOnAllChangesDone();
            this._detectChangesInShadowDomChildren(throwOnChange);
            if (this.mode === CHECK_ONCE)
              this.mode = CHECKED;
          },
          detectChangesInRecords: function(throwOnChange) {},
          hydrate: function(context, locals, directives) {},
          dehydrate: function() {},
          callOnAllChangesDone: function() {},
          _detectChangesInLightDomChildren: function(throwOnChange) {
            var c = this.lightDomChildren;
            for (var i = 0; i < c.length; ++i) {
              c[i]._detectChanges(throwOnChange);
            }
          },
          _detectChangesInShadowDomChildren: function(throwOnChange) {
            var c = this.shadowDomChildren;
            for (var i = 0; i < c.length; ++i) {
              c[i]._detectChanges(throwOnChange);
            }
          },
          markAsCheckOnce: function() {
            this.mode = CHECK_ONCE;
          },
          markPathToRootAsCheckOnce: function() {
            var c = this;
            while (isPresent(c) && c.mode != DETACHED) {
              if (c.mode === CHECKED)
                c.mode = CHECK_ONCE;
              c = c.parent;
            }
          }
        }, {});
      }());
      $__export("AbstractChangeDetector", AbstractChangeDetector);
    }
  };
});

System.register("angular2/src/change_detection/jit_proto_change_detector", ["angular2/src/facade/collection", "angular2/src/change_detection/change_detection_jit_generator", "angular2/src/change_detection/coalesce", "angular2/src/change_detection/proto_change_detector"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/jit_proto_change_detector";
  var ListWrapper,
      ChangeDetectorJITGenerator,
      coalesce,
      ProtoRecordBuilder,
      JitProtoChangeDetector;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ChangeDetectorJITGenerator = $__m.ChangeDetectorJITGenerator;
    }, function($__m) {
      coalesce = $__m.coalesce;
    }, function($__m) {
      ProtoRecordBuilder = $__m.ProtoRecordBuilder;
    }],
    execute: function() {
      JitProtoChangeDetector = (function() {
        function JitProtoChangeDetector(_pipeRegistry, definition) {
          this._pipeRegistry = _pipeRegistry;
          this.definition = definition;
          this._factory = this._createFactory(definition);
        }
        return ($traceurRuntime.createClass)(JitProtoChangeDetector, {
          instantiate: function(dispatcher) {
            return this._factory(dispatcher, this._pipeRegistry);
          },
          _createFactory: function(definition) {
            var recordBuilder = new ProtoRecordBuilder();
            ListWrapper.forEach(definition.bindingRecords, (function(b) {
              recordBuilder.add(b, definition.variableNames);
            }));
            var records = coalesce(recordBuilder.records);
            return new ChangeDetectorJITGenerator(definition.id, definition.strategy, records, this.definition.directiveRecords).generate();
          }
        }, {isSupported: function() {
            return true;
          }});
      }());
      $__export("JitProtoChangeDetector", JitProtoChangeDetector);
    }
  };
});

System.register("angular2/src/facade/async", ["angular2/src/facade/lang", "rx"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/async";
  var global,
      Rx,
      Promise,
      PromiseWrapper,
      TimerWrapper,
      ObservableWrapper,
      Observable,
      EventEmitter;
  return {
    setters: [function($__m) {
      global = $__m.global;
    }, function($__m) {
      Rx = $__m;
    }],
    execute: function() {
      Promise = global.Promise;
      $__export("Promise", Promise);
      PromiseWrapper = (function() {
        function PromiseWrapper() {}
        return ($traceurRuntime.createClass)(PromiseWrapper, {}, {
          resolve: function(obj) {
            return Promise.resolve(obj);
          },
          reject: function(obj, _) {
            return Promise.reject(obj);
          },
          catchError: function(promise, onError) {
            if (typeof(promise)==='undefined')
              return null;

            return promise.catch(onError);
          },
          all: function(promises) {
            if (promises.length == 0)
              return Promise.resolve([]);
            return Promise.all(promises);
          },
          then: function(promise, success, rejection) {
            return promise.then(success, rejection);
          },
          wrap: function(computation) {
            return new Promise((function(res, rej) {
              try {
                res(computation());
              } catch (e) {
                rej(e);
              }
            }));
          },
          completer: function() {
            var resolve;
            var reject;
            var p = new Promise(function(res, rej) {
              resolve = res;
              reject = rej;
            });
            return {
              promise: p,
              resolve: resolve,
              reject: reject
            };
          }
        });
      }());
      $__export("PromiseWrapper", PromiseWrapper);
      TimerWrapper = (function() {
        function TimerWrapper() {}
        return ($traceurRuntime.createClass)(TimerWrapper, {}, {
          setTimeout: function(fn, millis) {
            return global.setTimeout(fn, millis);
          },
          clearTimeout: function(id) {
            global.clearTimeout(id);
          },
          setInterval: function(fn, millis) {
            return global.setInterval(fn, millis);
          },
          clearInterval: function(id) {
            global.clearInterval(id);
          }
        });
      }());
      $__export("TimerWrapper", TimerWrapper);
      ObservableWrapper = (function() {
        function ObservableWrapper() {}
        return ($traceurRuntime.createClass)(ObservableWrapper, {}, {
          subscribe: function(emitter, onNext) {
            var onThrow = arguments[2] !== (void 0) ? arguments[2] : null;
            var onReturn = arguments[3] !== (void 0) ? arguments[3] : null;
            return emitter.observer({
              next: onNext,
              throw: onThrow,
              return: onReturn
            });
          },
          isObservable: function(obs) {
            return obs instanceof Observable;
          },
          dispose: function(subscription) {
            subscription.dispose();
          },
          callNext: function(emitter, value) {
            emitter.next(value);
          },
          callThrow: function(emitter, error) {
            emitter.throw(error);
          },
          callReturn: function(emitter) {
            emitter.return(null);
          }
        });
      }());
      $__export("ObservableWrapper", ObservableWrapper);
      Observable = (function() {
        function Observable() {}
        return ($traceurRuntime.createClass)(Observable, {observer: function(generator) {
            return null;
          }}, {});
      }());
      $__export("Observable", Observable);
      EventEmitter = (function($__super) {
        function EventEmitter() {
          $traceurRuntime.superConstructor(EventEmitter).call(this);
          if (Rx.hasOwnProperty('default')) {
            this._subject = new Rx.default.Rx.Subject();
            this._immediateScheduler = Rx.default.Rx.Scheduler.immediate;
          } else {
            this._subject = new Rx.Subject();
            this._immediateScheduler = Rx.Scheduler.immediate;
          }
        }
        return ($traceurRuntime.createClass)(EventEmitter, {
          observer: function(generator) {
            return this._subject.observeOn(this._immediateScheduler).subscribe((function(value) {
              setTimeout((function() {
                return generator.next(value);
              }));
            }), (function(error) {
              return generator.throw ? generator.throw(error) : null;
            }), (function() {
              return generator.return ? generator.return() : null;
            }));
          },
          toRx: function() {
            return this._subject;
          },
          next: function(value) {
            this._subject.onNext(value);
          },
          throw: function(error) {
            this._subject.onError(error);
          },
          return: function(value) {
            this._subject.onCompleted();
          }
        }, {}, $__super);
      }(Observable));
      $__export("EventEmitter", EventEmitter);
    }
  };
});

System.register("angular2/src/change_detection/pipes/limit_to_pipe", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/math"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/limit_to_pipe";
  var __decorate,
      __metadata,
      isBlank,
      isString,
      isArray,
      StringWrapper,
      BaseException,
      CONST,
      ListWrapper,
      Math,
      LimitToPipe,
      LimitToPipeFactory;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isString = $__m.isString;
      isArray = $__m.isArray;
      StringWrapper = $__m.StringWrapper;
      BaseException = $__m.BaseException;
      CONST = $__m.CONST;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      Math = $__m.Math;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      LimitToPipe = (function() {
        function LimitToPipe() {}
        return ($traceurRuntime.createClass)(LimitToPipe, {
          supports: function(obj) {
            return LimitToPipe.supportsObj(obj);
          },
          transform: function(value) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (isBlank(args) || args.length == 0) {
              throw new BaseException('limitTo pipe requires one argument');
            }
            var limit = args[0];
            var left = 0,
                right = Math.min(limit, value.length);
            if (limit < 0) {
              left = Math.max(0, value.length + limit);
              right = value.length;
            }
            if (isString(value)) {
              return StringWrapper.substring(value, left, right);
            }
            return ListWrapper.slice(value, left, right);
          },
          onDestroy: function() {}
        }, {supportsObj: function(obj) {
            return isString(obj) || isArray(obj);
          }});
      }());
      $__export("LimitToPipe", LimitToPipe);
      LimitToPipeFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obj) {
          return LimitToPipe.supportsObj(obj);
        },
        create: function(cdRef) {
          return new LimitToPipe();
        }
      }, {}));
      $__export("LimitToPipeFactory", LimitToPipeFactory);
      $__export("LimitToPipeFactory", LimitToPipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], LimitToPipeFactory));
    }
  };
});

System.register("angular2/src/di/key", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/di/type_literal", "angular2/src/di/forward_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/key";
  var MapWrapper,
      stringify,
      isBlank,
      BaseException,
      TypeLiteral,
      resolveForwardRef,
      Key,
      KeyRegistry,
      _globalKeyRegistry;
  return {
    setters: [function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      stringify = $__m.stringify;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      TypeLiteral = $__m.TypeLiteral;
      $__export("TypeLiteral", $__m.TypeLiteral);
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      Key = (function() {
        function Key(token, id) {
          this.token = token;
          this.id = id;
          if (isBlank(token)) {
            throw new BaseException('Token must be defined!');
          }
        }
        return ($traceurRuntime.createClass)(Key, {get displayName() {
            return stringify(this.token);
          }}, {
          get: function(token) {
            return _globalKeyRegistry.get(resolveForwardRef(token));
          },
          get numberOfKeys() {
            return _globalKeyRegistry.numberOfKeys;
          }
        });
      }());
      $__export("Key", Key);
      KeyRegistry = (function() {
        function KeyRegistry() {
          this._allKeys = new Map();
        }
        return ($traceurRuntime.createClass)(KeyRegistry, {
          get: function(token) {
            if (token instanceof Key)
              return token;
            var theToken = token;
            if (token instanceof TypeLiteral) {
              theToken = token.type;
            }
            token = theToken;
            if (this._allKeys.has(token)) {
              return this._allKeys.get(token);
            }
            var newKey = new Key(token, Key.numberOfKeys);
            this._allKeys.set(token, newKey);
            return newKey;
          },
          get numberOfKeys() {
            return MapWrapper.size(this._allKeys);
          }
        }, {});
      }());
      $__export("KeyRegistry", KeyRegistry);
      _globalKeyRegistry = new KeyRegistry();
    }
  };
});

System.register("angular2/src/core/annotations/view", ["angular2/src/core/annotations_impl/view"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/view";
  return {
    setters: [function($__m) {
      $__export("ViewAnnotation", $__m.View);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/dom/browser_adapter", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/dom/generic_browser_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/dom/browser_adapter";
  var ListWrapper,
      isBlank,
      isPresent,
      global,
      setRootDomAdapter,
      GenericBrowserDomAdapter,
      _attrToPropMap,
      DOM_KEY_LOCATION_NUMPAD,
      _keyMap,
      _chromeNumKeyPadMap,
      BrowserDomAdapter,
      urlParsingNode;
  function relativePath(url) {
    if (isBlank(urlParsingNode)) {
      urlParsingNode = document.createElement("a");
    }
    urlParsingNode.setAttribute('href', url);
    return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname;
  }
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      global = $__m.global;
    }, function($__m) {
      setRootDomAdapter = $__m.setRootDomAdapter;
    }, function($__m) {
      GenericBrowserDomAdapter = $__m.GenericBrowserDomAdapter;
    }],
    execute: function() {
      _attrToPropMap = {
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex'
      };
      DOM_KEY_LOCATION_NUMPAD = 3;
      _keyMap = {
        '\b': 'Backspace',
        '\t': 'Tab',
        '\x7F': 'Delete',
        '\x1B': 'Escape',
        'Del': 'Delete',
        'Esc': 'Escape',
        'Left': 'ArrowLeft',
        'Right': 'ArrowRight',
        'Up': 'ArrowUp',
        'Down': 'ArrowDown',
        'Menu': 'ContextMenu',
        'Scroll': 'ScrollLock',
        'Win': 'OS'
      };
      _chromeNumKeyPadMap = {
        'A': '1',
        'B': '2',
        'C': '3',
        'D': '4',
        'E': '5',
        'F': '6',
        'G': '7',
        'H': '8',
        'I': '9',
        'J': '*',
        'K': '+',
        'M': '-',
        'N': '.',
        'O': '/',
        '\x60': '0',
        '\x90': 'NumLock'
      };
      BrowserDomAdapter = (function($__super) {
        function BrowserDomAdapter() {
          $traceurRuntime.superConstructor(BrowserDomAdapter).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(BrowserDomAdapter, {
          hasProperty: function(element, name) {
            return name in element;
          },
          setProperty: function(el, name, value) {
            el[name] = value;
          },
          getProperty: function(el, name) {
            return el[name];
          },
          invoke: function(el, methodName, args) {
            el[methodName].apply(el, args);
          },
          logError: function(error) {
            window.console.error(error);
          },
          get attrToPropMap() {
            return _attrToPropMap;
          },
          query: function(selector) {
            return document.querySelector(selector);
          },
          querySelector: function(el, selector) {
            return el.querySelector(selector);
          },
          querySelectorAll: function(el, selector) {
            return el.querySelectorAll(selector);
          },
          on: function(el, evt, listener) {
            el.addEventListener(evt, listener, false);
          },
          onAndCancel: function(el, evt, listener) {
            el.addEventListener(evt, listener, false);
            return (function() {
              el.removeEventListener(evt, listener, false);
            });
          },
          dispatchEvent: function(el, evt) {
            el.dispatchEvent(evt);
          },
          createMouseEvent: function(eventType) {
            var evt = document.createEvent('MouseEvent');
            evt.initEvent(eventType, true, true);
            return evt;
          },
          createEvent: function(eventType) {
            var evt = document.createEvent('Event');
            evt.initEvent(eventType, true, true);
            return evt;
          },
          preventDefault: function(evt) {
            evt.preventDefault();
            evt.returnValue = false;
          },
          getInnerHTML: function(el) {
            return el.innerHTML;
          },
          getOuterHTML: function(el) {
            return el.outerHTML;
          },
          nodeName: function(node) {
            return node.nodeName;
          },
          nodeValue: function(node) {
            return node.nodeValue;
          },
          type: function(node) {
            return node.type;
          },
          content: function(node) {
            if (this.hasProperty(node, "content")) {
              return node.content;
            } else {
              return node;
            }
          },
          firstChild: function(el) {
            return el.firstChild;
          },
          nextSibling: function(el) {
            return el.nextSibling;
          },
          parentElement: function(el) {
            return el.parentElement;
          },
          childNodes: function(el) {
            return el.childNodes;
          },
          childNodesAsList: function(el) {
            var childNodes = el.childNodes;
            var res = ListWrapper.createFixedSize(childNodes.length);
            for (var i = 0; i < childNodes.length; i++) {
              res[i] = childNodes[i];
            }
            return res;
          },
          clearNodes: function(el) {
            for (var i = 0; i < el.childNodes.length; i++) {
              this.remove(el.childNodes[i]);
            }
          },
          appendChild: function(el, node) {
            el.appendChild(node);
          },
          removeChild: function(el, node) {
            el.removeChild(node);
          },
          replaceChild: function(el, newChild, oldChild) {
            el.replaceChild(newChild, oldChild);
          },
          remove: function(el) {
            var parent = el.parentNode;
            parent.removeChild(el);
            return el;
          },
          insertBefore: function(el, node) {
            el.parentNode.insertBefore(node, el);
          },
          insertAllBefore: function(el, nodes) {
            ListWrapper.forEach(nodes, (function(n) {
              el.parentNode.insertBefore(n, el);
            }));
          },
          insertAfter: function(el, node) {
            el.parentNode.insertBefore(node, el.nextSibling);
          },
          setInnerHTML: function(el, value) {
            el.innerHTML = value;
          },
          getText: function(el) {
            return el.textContent;
          },
          setText: function(el, value) {
            el.textContent = value;
          },
          getValue: function(el) {
            return el.value;
          },
          setValue: function(el, value) {
            el.value = value;
          },
          getChecked: function(el) {
            return el.checked;
          },
          setChecked: function(el, value) {
            el.checked = value;
          },
          createTemplate: function(html) {
            var t = document.createElement('template');
            t.innerHTML = html;
            return t;
          },
          createElement: function(tagName) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            return doc.createElement(tagName);
          },
          createTextNode: function(text) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            return doc.createTextNode(text);
          },
          createScriptTag: function(attrName, attrValue) {
            var doc = arguments[2] !== (void 0) ? arguments[2] : document;
            var el = doc.createElement('SCRIPT');
            el.setAttribute(attrName, attrValue);
            return el;
          },
          createStyleElement: function(css) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            var style = doc.createElement('style');
            this.appendChild(style, this.createTextNode(css));
            return style;
          },
          createShadowRoot: function(el) {
            return el.createShadowRoot();
          },
          getShadowRoot: function(el) {
            return el.shadowRoot;
          },
          getHost: function(el) {
            return el.host;
          },
          clone: function(node) {
            return node.cloneNode(true);
          },
          getElementsByClassName: function(element, name) {
            return element.getElementsByClassName(name);
          },
          getElementsByTagName: function(element, name) {
            return element.getElementsByTagName(name);
          },
          classList: function(element) {
            return Array.prototype.slice.call(element.classList, 0);
          },
          addClass: function(element, classname) {
            element.classList.add(classname);
          },
          removeClass: function(element, classname) {
            element.classList.remove(classname);
          },
          hasClass: function(element, classname) {
            return element.classList.contains(classname);
          },
          setStyle: function(element, stylename, stylevalue) {
            element.style[stylename] = stylevalue;
          },
          removeStyle: function(element, stylename) {
            element.style[stylename] = null;
          },
          getStyle: function(element, stylename) {
            return element.style[stylename];
          },
          tagName: function(element) {
            return element.tagName;
          },
          attributeMap: function(element) {
            var res = new Map();
            var elAttrs = element.attributes;
            for (var i = 0; i < elAttrs.length; i++) {
              var attrib = elAttrs[i];
              res.set(attrib.name, attrib.value);
            }
            return res;
          },
          hasAttribute: function(element, attribute) {
            return element.hasAttribute(attribute);
          },
          getAttribute: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          setAttribute: function(element, name, value) {
            element.setAttribute(name, value);
          },
          removeAttribute: function(element, attribute) {
            element.removeAttribute(attribute);
          },
          templateAwareRoot: function(el) {
            return this.isTemplateElement(el) ? this.content(el) : el;
          },
          createHtmlDocument: function() {
            return document.implementation.createHTMLDocument('fakeTitle');
          },
          defaultDoc: function() {
            return document;
          },
          getBoundingClientRect: function(el) {
            try {
              return el.getBoundingClientRect();
            } catch (e) {
              return {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: 0,
                height: 0
              };
            }
          },
          getTitle: function() {
            return document.title;
          },
          setTitle: function(newTitle) {
            document.title = newTitle || '';
          },
          elementMatches: function(n, selector) {
            return n instanceof HTMLElement && n.matches ? n.matches(selector) : n.msMatchesSelector(selector);
          },
          isTemplateElement: function(el) {
            return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
          },
          isTextNode: function(node) {
            return node.nodeType === Node.TEXT_NODE;
          },
          isCommentNode: function(node) {
            return node.nodeType === Node.COMMENT_NODE;
          },
          isElementNode: function(node) {
            return node.nodeType === Node.ELEMENT_NODE;
          },
          hasShadowRoot: function(node) {
            return node instanceof HTMLElement && isPresent(node.shadowRoot);
          },
          isShadowRoot: function(node) {
            return node instanceof DocumentFragment;
          },
          importIntoDoc: function(node) {
            var toImport = node;
            if (this.isTemplateElement(node)) {
              toImport = this.content(node);
            }
            return document.importNode(toImport, true);
          },
          isPageRule: function(rule) {
            return rule.type === CSSRule.PAGE_RULE;
          },
          isStyleRule: function(rule) {
            return rule.type === CSSRule.STYLE_RULE;
          },
          isMediaRule: function(rule) {
            return rule.type === CSSRule.MEDIA_RULE;
          },
          isKeyframesRule: function(rule) {
            return rule.type === CSSRule.KEYFRAMES_RULE;
          },
          getHref: function(el) {
            return el.href;
          },
          getEventKey: function(event) {
            var key = event.key;
            if (isBlank(key)) {
              key = event.keyIdentifier;
              if (isBlank(key)) {
                return 'Unidentified';
              }
              if (key.startsWith('U+')) {
                key = String.fromCharCode(parseInt(key.substring(2), 16));
                if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
                  key = _chromeNumKeyPadMap[key];
                }
              }
            }
            if (_keyMap.hasOwnProperty(key)) {
              key = _keyMap[key];
            }
            return key;
          },
          getGlobalEventTarget: function(target) {
            if (target == "window") {
              return window;
            } else if (target == "document") {
              return document;
            } else if (target == "body") {
              return document.body;
            }
          },
          getHistory: function() {
            return window.history;
          },
          getLocation: function() {
            return window.location;
          },
          getBaseHref: function() {
            return relativePath(document.baseURI);
          },
          getUserAgent: function() {
            return window.navigator.userAgent;
          },
          setData: function(element, name, value) {
            element.dataset[name] = value;
          },
          getData: function(element, name) {
            return element.dataset[name];
          },
          setGlobalVar: function(name, value) {
            global[name] = value;
          }
        }, {makeCurrent: function() {
            setRootDomAdapter(new BrowserDomAdapter());
          }}, $__super);
      }(GenericBrowserDomAdapter));
      $__export("BrowserDomAdapter", BrowserDomAdapter);
      urlParsingNode = null;
    }
  };
});

System.register("angular2/src/core/compiler/directive_resolver", ["angular2/di", "angular2/src/facade/lang", "angular2/src/core/annotations_impl/annotations", "angular2/src/reflection/reflection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/directive_resolver";
  var __decorate,
      __metadata,
      resolveForwardRef,
      Injectable,
      isPresent,
      BaseException,
      stringify,
      Directive,
      reflector,
      DirectiveResolver;
  return {
    setters: [function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      stringify = $__m.stringify;
    }, function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      reflector = $__m.reflector;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      DirectiveResolver = (($traceurRuntime.createClass)(function() {}, {resolve: function(type) {
          var annotations = reflector.annotations(resolveForwardRef(type));
          if (isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
              var annotation = annotations[i];
              if (annotation instanceof Directive) {
                return annotation;
              }
            }
          }
          throw new BaseException(("No Directive annotation found on " + stringify(type)));
        }}, {}));
      $__export("DirectiveResolver", DirectiveResolver);
      $__export("DirectiveResolver", DirectiveResolver = __decorate([Injectable(), __metadata('design:paramtypes', [])], DirectiveResolver));
    }
  };
});

System.register("angular2/src/core/compiler/view", ["angular2/src/facade/collection", "angular2/change_detection", "angular2/src/core/compiler/element_binder", "angular2/src/facade/lang", "angular2/src/core/compiler/view_ref", "angular2/src/core/compiler/element_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view";
  var ListWrapper,
      MapWrapper,
      Map,
      StringMapWrapper,
      Locals,
      ElementBinder,
      isPresent,
      isBlank,
      BaseException,
      ViewRef,
      ElementRef,
      AppViewContainer,
      AppView,
      AppProtoView;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
      Map = $__m.Map;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      Locals = $__m.Locals;
    }, function($__m) {
      ElementBinder = $__m.ElementBinder;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ViewRef = $__m.ViewRef;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }],
    execute: function() {
      AppViewContainer = (function() {
        function AppViewContainer() {
          this.views = [];
        }
        return ($traceurRuntime.createClass)(AppViewContainer, {}, {});
      }());
      $__export("AppViewContainer", AppViewContainer);
      AppView = (function() {
        function AppView(renderer, proto, protoLocals) {
          this.renderer = renderer;
          this.proto = proto;
          this.render = null;
          this.elementInjectors = null;
          this.changeDetector = null;
          this.componentChildViews = null;
          this.preBuiltObjects = null;
          this.context = null;
          this.viewContainers = ListWrapper.createFixedSize(this.proto.elementBinders.length);
          this.elementRefs = ListWrapper.createFixedSize(this.proto.elementBinders.length);
          this.ref = new ViewRef(this);
          for (var i = 0; i < this.elementRefs.length; i++) {
            this.elementRefs[i] = new ElementRef(this.ref, i, renderer);
          }
          this.locals = new Locals(null, MapWrapper.clone(protoLocals));
        }
        return ($traceurRuntime.createClass)(AppView, {
          init: function(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, componentChildViews) {
            this.changeDetector = changeDetector;
            this.elementInjectors = elementInjectors;
            this.rootElementInjectors = rootElementInjectors;
            this.preBuiltObjects = preBuiltObjects;
            this.componentChildViews = componentChildViews;
          },
          setLocal: function(contextName, value) {
            if (!this.hydrated())
              throw new BaseException('Cannot set locals on dehydrated view.');
            if (!this.proto.variableBindings.has(contextName)) {
              return ;
            }
            var templateName = this.proto.variableBindings.get(contextName);
            this.locals.set(templateName, value);
          },
          hydrated: function() {
            return isPresent(this.context);
          },
          triggerEventHandlers: function(eventName, eventObj, binderIndex) {
            var locals = new Map();
            locals.set('$event', eventObj);
            this.dispatchEvent(binderIndex, eventName, locals);
          },
          notifyOnBinding: function(b, currentValue) {
            if (b.isElementProperty()) {
              this.renderer.setElementProperty(this.elementRefs[b.elementIndex], b.propertyName, currentValue);
            } else if (b.isElementAttribute()) {
              this.renderer.setElementAttribute(this.elementRefs[b.elementIndex], b.propertyName, currentValue);
            } else if (b.isElementClass()) {
              this.renderer.setElementClass(this.elementRefs[b.elementIndex], b.propertyName, currentValue);
            } else if (b.isElementStyle()) {
              var unit = isPresent(b.propertyUnit) ? b.propertyUnit : '';
              this.renderer.setElementStyle(this.elementRefs[b.elementIndex], b.propertyName, ("" + currentValue + unit));
            } else if (b.isTextNode()) {
              this.renderer.setText(this.render, b.elementIndex, currentValue);
            } else {
              throw new BaseException('Unsupported directive record');
            }
          },
          notifyOnAllChangesDone: function() {
            var ei = this.elementInjectors;
            for (var i = ei.length - 1; i >= 0; i--) {
              if (isPresent(ei[i]))
                ei[i].onAllChangesDone();
            }
          },
          getDirectiveFor: function(directive) {
            var elementInjector = this.elementInjectors[directive.elementIndex];
            return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
          },
          getDetectorFor: function(directive) {
            var childView = this.componentChildViews[directive.elementIndex];
            return isPresent(childView) ? childView.changeDetector : null;
          },
          invokeElementMethod: function(elementIndex, methodName, args) {
            this.renderer.invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
          },
          dispatchEvent: function(elementIndex, eventName, locals) {
            var $__0 = this;
            var allowDefaultBehavior = true;
            if (this.hydrated()) {
              var elBinder = this.proto.elementBinders[elementIndex];
              if (isBlank(elBinder.hostListeners))
                return allowDefaultBehavior;
              var eventMap = elBinder.hostListeners[eventName];
              if (isBlank(eventMap))
                return allowDefaultBehavior;
              MapWrapper.forEach(eventMap, (function(expr, directiveIndex) {
                var context;
                if (directiveIndex === -1) {
                  context = $__0.context;
                } else {
                  context = $__0.elementInjectors[elementIndex].getDirectiveAtIndex(directiveIndex);
                }
                var result = expr.eval(context, new Locals($__0.locals, locals));
                if (isPresent(result)) {
                  allowDefaultBehavior = allowDefaultBehavior && result == true;
                }
              }));
            }
            return allowDefaultBehavior;
          }
        }, {});
      }());
      $__export("AppView", AppView);
      AppProtoView = (function() {
        function AppProtoView(render, protoChangeDetector, variableBindings, variableLocations) {
          var $__0 = this;
          this.render = render;
          this.protoChangeDetector = protoChangeDetector;
          this.variableBindings = variableBindings;
          this.variableLocations = variableLocations;
          this.elementBinders = [];
          this.protoLocals = new Map();
          if (isPresent(variableBindings)) {
            MapWrapper.forEach(variableBindings, (function(templateName, _) {
              $__0.protoLocals.set(templateName, null);
            }));
          }
        }
        return ($traceurRuntime.createClass)(AppProtoView, {
          bindElement: function(parent, distanceToParent, protoElementInjector) {
            var componentDirective = arguments[3] !== (void 0) ? arguments[3] : null;
            var elBinder = new ElementBinder(this.elementBinders.length, parent, distanceToParent, protoElementInjector, componentDirective);
            this.elementBinders.push(elBinder);
            return elBinder;
          },
          bindEvent: function(eventBindings, boundElementIndex) {
            var directiveIndex = arguments[2] !== (void 0) ? arguments[2] : -1;
            var elBinder = this.elementBinders[boundElementIndex];
            var events = elBinder.hostListeners;
            if (isBlank(events)) {
              events = StringMapWrapper.create();
              elBinder.hostListeners = events;
            }
            for (var i = 0; i < eventBindings.length; i++) {
              var eventBinding = eventBindings[i];
              var eventName = eventBinding.fullName;
              var event = StringMapWrapper.get(events, eventName);
              if (isBlank(event)) {
                event = new Map();
                StringMapWrapper.set(events, eventName, event);
              }
              event.set(directiveIndex, eventBinding.source);
            }
          }
        }, {});
      }());
      $__export("AppProtoView", AppProtoView);
    }
  };
});

System.register("angular2/src/core/compiler/query_list", ["angular2/src/core/compiler/base_query_list"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/query_list";
  var BaseQueryList,
      QueryList;
  return {
    setters: [function($__m) {
      BaseQueryList = $__m.BaseQueryList;
    }],
    execute: function() {
      QueryList = (function($__super) {
        function QueryList() {
          $traceurRuntime.superConstructor(QueryList).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(QueryList, {
          onChange: function(callback) {
            $traceurRuntime.superGet(this, QueryList.prototype, "onChange").call(this, callback);
          },
          removeCallback: function(callback) {
            $traceurRuntime.superGet(this, QueryList.prototype, "removeCallback").call(this, callback);
          }
        }, {}, $__super);
      }(BaseQueryList));
      $__export("QueryList", QueryList);
    }
  };
});

System.register("angular2/src/render/dom/compiler/style_inliner", ["angular2/di", "angular2/src/render/xhr", "angular2/src/facade/collection", "angular2/src/services/url_resolver", "angular2/src/render/dom/compiler/style_url_resolver", "angular2/src/facade/lang", "angular2/src/facade/async"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/style_inliner";
  var __decorate,
      __metadata,
      Injectable,
      XHR,
      ListWrapper,
      UrlResolver,
      StyleUrlResolver,
      isBlank,
      isPresent,
      RegExpWrapper,
      StringWrapper,
      isPromise,
      PromiseWrapper,
      StyleInliner,
      _importRe,
      _urlRe,
      _mediaQueryRe;
  function _extractUrl(importRule) {
    var match = RegExpWrapper.firstMatch(_urlRe, importRule);
    if (isBlank(match))
      return null;
    return isPresent(match[1]) ? match[1] : match[2];
  }
  function _extractMediaQuery(importRule) {
    var match = RegExpWrapper.firstMatch(_mediaQueryRe, importRule);
    if (isBlank(match))
      return null;
    var mediaQuery = match[1].trim();
    return (mediaQuery.length > 0) ? mediaQuery : null;
  }
  function _wrapInMediaRule(css, query) {
    return (isBlank(query)) ? css : ("@media " + query + " {\n" + css + "\n}");
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      XHR = $__m.XHR;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }, function($__m) {
      StyleUrlResolver = $__m.StyleUrlResolver;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      RegExpWrapper = $__m.RegExpWrapper;
      StringWrapper = $__m.StringWrapper;
      isPromise = $__m.isPromise;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      StyleInliner = (($traceurRuntime.createClass)(function(_xhr, _styleUrlResolver, _urlResolver) {
        this._xhr = _xhr;
        this._styleUrlResolver = _styleUrlResolver;
        this._urlResolver = _urlResolver;
      }, {
        inlineImports: function(cssText, baseUrl) {
          return this._inlineImports(cssText, baseUrl, []);
        },
        _inlineImports: function(cssText, baseUrl, inlinedUrls) {
          var $__0 = this;
          var partIndex = 0;
          var parts = StringWrapper.split(cssText, _importRe);
          if (parts.length === 1) {
            return cssText;
          }
          var promises = [];
          while (partIndex < parts.length - 1) {
            var prefix = parts[partIndex];
            var rule = parts[partIndex + 1];
            var url = _extractUrl(rule);
            if (isPresent(url)) {
              url = this._urlResolver.resolve(baseUrl, url);
            }
            var mediaQuery = _extractMediaQuery(rule);
            var promise = void 0;
            if (isBlank(url)) {
              promise = PromiseWrapper.resolve(("/* Invalid import rule: \"@import " + rule + ";\" */"));
            } else if (ListWrapper.contains(inlinedUrls, url)) {
              promise = PromiseWrapper.resolve(prefix);
            } else {
              inlinedUrls.push(url);
              promise = PromiseWrapper.then(this._xhr.get(url), (function(rawCss) {
                var inlinedCss = $__0._inlineImports(rawCss, url, inlinedUrls);
                if (isPromise(inlinedCss)) {
                  return inlinedCss.then((function(css) {
                    return prefix + $__0._transformImportedCss(css, mediaQuery, url) + '\n';
                  }));
                } else {
                  return prefix + $__0._transformImportedCss(inlinedCss, mediaQuery, url) + '\n';
                }
              }), (function(error) {
                return ("/* failed to import " + url + " */\n");
              }));
            }
            promises.push(promise);
            partIndex += 2;
          }
          return PromiseWrapper.all(promises).then(function(cssParts) {
            var cssText = cssParts.join('');
            if (partIndex < parts.length) {
              cssText += parts[partIndex];
            }
            return cssText;
          });
        },
        _transformImportedCss: function(css, mediaQuery, url) {
          css = this._styleUrlResolver.resolveUrls(css, url);
          return _wrapInMediaRule(css, mediaQuery);
        }
      }, {}));
      $__export("StyleInliner", StyleInliner);
      $__export("StyleInliner", StyleInliner = __decorate([Injectable(), __metadata('design:paramtypes', [XHR, StyleUrlResolver, UrlResolver])], StyleInliner));
      _importRe = RegExpWrapper.create('@import\\s+([^;]+);');
      _urlRe = RegExpWrapper.create('url\\(\\s*?[\'"]?([^\'")]+)[\'"]?|' + '[\'"]([^\'")]+)[\'"]');
      _mediaQueryRe = RegExpWrapper.create('[\'"][^\'"]+[\'"]\\s*\\)?\\s*(.*)');
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/util", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/shadow_css"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/util";
  var isBlank,
      isPresent,
      Map,
      DOM,
      ShadowCss,
      _componentUIDs,
      _nextComponentUID,
      _sharedStyleTexts,
      _lastInsertedStyleEl;
  function getComponentId(componentStringId) {
    var id = _componentUIDs.get(componentStringId);
    if (isBlank(id)) {
      id = _nextComponentUID++;
      _componentUIDs.set(componentStringId, id);
    }
    return id;
  }
  function insertSharedStyleText(cssText, styleHost, styleEl) {
    if (!_sharedStyleTexts.has(cssText)) {
      _sharedStyleTexts.set(cssText, true);
      insertStyleElement(styleHost, styleEl);
    }
  }
  function insertStyleElement(host, styleEl) {
    if (isBlank(_lastInsertedStyleEl)) {
      var firstChild = DOM.firstChild(host);
      if (isPresent(firstChild)) {
        DOM.insertBefore(firstChild, styleEl);
      } else {
        DOM.appendChild(host, styleEl);
      }
    } else {
      DOM.insertAfter(_lastInsertedStyleEl, styleEl);
    }
    _lastInsertedStyleEl = styleEl;
  }
  function getHostAttribute(id) {
    return ("_nghost-" + id);
  }
  function getContentAttribute(id) {
    return ("_ngcontent-" + id);
  }
  function shimCssForComponent(cssText, componentId) {
    var id = getComponentId(componentId);
    var shadowCss = new ShadowCss();
    return shadowCss.shimCssText(cssText, getContentAttribute(id), getHostAttribute(id));
  }
  function resetShadowDomCache() {
    _componentUIDs.clear();
    _nextComponentUID = 0;
    _sharedStyleTexts.clear();
    _lastInsertedStyleEl = null;
  }
  $__export("getComponentId", getComponentId);
  $__export("insertSharedStyleText", insertSharedStyleText);
  $__export("insertStyleElement", insertStyleElement);
  $__export("getHostAttribute", getHostAttribute);
  $__export("getContentAttribute", getContentAttribute);
  $__export("shimCssForComponent", shimCssForComponent);
  $__export("resetShadowDomCache", resetShadowDomCache);
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      Map = $__m.Map;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ShadowCss = $__m.ShadowCss;
    }],
    execute: function() {
      _componentUIDs = new Map();
      _nextComponentUID = 0;
      _sharedStyleTexts = new Map();
    }
  };
});

System.register("angular2/src/render/dom/events/hammer_gestures", ["angular2/src/render/dom/events/hammer_common", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/hammer_gestures";
  var HammerGesturesPluginCommon,
      isPresent,
      BaseException,
      HammerGesturesPlugin;
  return {
    setters: [function($__m) {
      HammerGesturesPluginCommon = $__m.HammerGesturesPluginCommon;
    }, function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      HammerGesturesPlugin = (function($__super) {
        function HammerGesturesPlugin() {
          $traceurRuntime.superConstructor(HammerGesturesPlugin).call(this);
        }
        return ($traceurRuntime.createClass)(HammerGesturesPlugin, {
          supports: function(eventName) {
            if (!$traceurRuntime.superGet(this, HammerGesturesPlugin.prototype, "supports").call(this, eventName))
              return false;
            if (!isPresent(window['Hammer'])) {
              throw new BaseException(("Hammer.js is not loaded, can not bind " + eventName + " event"));
            }
            return true;
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            if (shouldSupportBubble)
              throw new BaseException('Hammer.js plugin does not support bubbling gestures.');
            var zone = this.manager.getZone();
            eventName = eventName.toLowerCase();
            zone.runOutsideAngular(function() {
              var mc = new Hammer(element);
              mc.get('pinch').set({enable: true});
              mc.get('rotate').set({enable: true});
              mc.on(eventName, function(eventObj) {
                zone.run(function() {
                  handler(eventObj);
                });
              });
            });
          }
        }, {}, $__super);
      }(HammerGesturesPluginCommon));
      $__export("HammerGesturesPlugin", HammerGesturesPlugin);
    }
  };
});

System.register("angular2/src/core/testability/testability", ["angular2/di", "angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/testability/get_testability"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/testability/testability";
  var __decorate,
      __metadata,
      Injectable,
      DOM,
      Map,
      ListWrapper,
      BaseException,
      getTestabilityModule,
      Testability,
      TestabilityRegistry;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      Map = $__m.Map;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      getTestabilityModule = $__m;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Testability = (($traceurRuntime.createClass)(function() {
        this._pendingCount = 0;
        this._callbacks = [];
      }, {
        increaseCount: function() {
          var delta = arguments[0] !== (void 0) ? arguments[0] : 1;
          this._pendingCount += delta;
          if (this._pendingCount < 0) {
            throw new BaseException('pending async requests below zero');
          } else if (this._pendingCount == 0) {
            this._runCallbacks();
          }
          return this._pendingCount;
        },
        _runCallbacks: function() {
          while (this._callbacks.length !== 0) {
            ListWrapper.removeLast(this._callbacks)();
          }
        },
        whenStable: function(callback) {
          this._callbacks.push(callback);
          if (this._pendingCount === 0) {
            this._runCallbacks();
          }
        },
        getPendingCount: function() {
          return this._pendingCount;
        },
        findBindings: function(using, binding, exactMatch) {
          return [];
        }
      }, {}));
      $__export("Testability", Testability);
      $__export("Testability", Testability = __decorate([Injectable(), __metadata('design:paramtypes', [])], Testability));
      TestabilityRegistry = (($traceurRuntime.createClass)(function() {
        this._applications = new Map();
        getTestabilityModule.GetTestability.addToWindow(this);
      }, {
        registerApplication: function(token, testability) {
          this._applications.set(token, testability);
        },
        findTestabilityInTree: function(elem) {
          if (elem == null) {
            return null;
          }
          if (this._applications.has(elem)) {
            return this._applications.get(elem);
          }
          if (DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(DOM.getHost(elem));
          }
          return this.findTestabilityInTree(DOM.parentElement(elem));
        }
      }, {}));
      $__export("TestabilityRegistry", TestabilityRegistry);
      $__export("TestabilityRegistry", TestabilityRegistry = __decorate([Injectable(), __metadata('design:paramtypes', [])], TestabilityRegistry));
    }
  };
});

System.register("angular2/src/render/dom/view/proto_view", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/util", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/proto_view";
  var isPresent,
      DOM,
      NG_BINDING_CLASS,
      RenderProtoViewRef,
      DomProtoViewRef,
      DomProtoView;
  function resolveInternalDomProtoView(protoViewRef) {
    return protoViewRef._protoView;
  }
  $__export("resolveInternalDomProtoView", resolveInternalDomProtoView);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      NG_BINDING_CLASS = $__m.NG_BINDING_CLASS;
    }, function($__m) {
      RenderProtoViewRef = $__m.RenderProtoViewRef;
    }],
    execute: function() {
      DomProtoViewRef = (function($__super) {
        function DomProtoViewRef(_protoView) {
          $traceurRuntime.superConstructor(DomProtoViewRef).call(this);
          this._protoView = _protoView;
        }
        return ($traceurRuntime.createClass)(DomProtoViewRef, {}, {}, $__super);
      }(RenderProtoViewRef));
      $__export("DomProtoViewRef", DomProtoViewRef);
      DomProtoView = (function() {
        function DomProtoView($__1) {
          var $__2 = $__1,
              elementBinders = $__2.elementBinders,
              element = $__2.element,
              transitiveContentTagCount = $__2.transitiveContentTagCount,
              boundTextNodeCount = $__2.boundTextNodeCount;
          this.element = element;
          this.elementBinders = elementBinders;
          this.transitiveContentTagCount = transitiveContentTagCount;
          this.isTemplateElement = DOM.isTemplateElement(this.element);
          this.rootBindingOffset = (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) ? 1 : 0;
          this.boundTextNodeCount = boundTextNodeCount;
          this.rootNodeCount = this.isTemplateElement ? DOM.childNodes(DOM.content(this.element)).length : 1;
        }
        return ($traceurRuntime.createClass)(DomProtoView, {}, {});
      }());
      $__export("DomProtoView", DomProtoView);
    }
  };
});

System.register("angular2/src/render/dom/view/proto_view_builder", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/change_detection", "angular2/src/render/dom/view/proto_view", "angular2/src/render/dom/view/element_binder", "angular2/src/render/api", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/proto_view_builder";
  var isPresent,
      isBlank,
      BaseException,
      StringWrapper,
      ListWrapper,
      MapWrapper,
      Set,
      SetWrapper,
      StringMapWrapper,
      DOM,
      ASTWithSource,
      AstTransformer,
      AccessMember,
      LiteralArray,
      ImplicitReceiver,
      DomProtoView,
      DomProtoViewRef,
      resolveInternalDomProtoView,
      ElementBinder,
      Event,
      api,
      NG_BINDING_CLASS,
      EVENT_TARGET_SEPARATOR,
      ProtoViewBuilder,
      _ChildNodesInfo,
      ElementBinderBuilder,
      DirectiveBuilder,
      EventBuilder,
      PROPERTY_PARTS_SEPARATOR,
      ATTRIBUTE_PREFIX,
      CLASS_PREFIX,
      STYLE_PREFIX;
  function buildElementPropertyBindings(protoElement, isNgComponent, bindingsInTemplate, directiveTempaltePropertyNames) {
    var propertyBindings = [];
    MapWrapper.forEach(bindingsInTemplate, (function(ast, propertyNameInTemplate) {
      var propertyBinding = createElementPropertyBinding(ast, propertyNameInTemplate);
      if (isValidElementPropertyBinding(protoElement, isNgComponent, propertyBinding)) {
        propertyBindings.push(propertyBinding);
      } else if (!SetWrapper.has(directiveTempaltePropertyNames, propertyNameInTemplate)) {
        throw new BaseException(("Can't bind to '" + propertyNameInTemplate + "' since it isn't a know property of the '" + DOM.tagName(protoElement).toLowerCase() + "' element and there are no matching directives with a corresponding property"));
      }
    }));
    return propertyBindings;
  }
  function isValidElementPropertyBinding(protoElement, isNgComponent, binding) {
    if (binding.type === api.PropertyBindingType.PROPERTY) {
      var tagName = DOM.tagName(protoElement);
      var possibleCustomElement = tagName.indexOf('-') !== -1;
      if (possibleCustomElement && !isNgComponent) {
        return true;
      } else {
        return DOM.hasProperty(protoElement, binding.property);
      }
    }
    return true;
  }
  function createElementPropertyBinding(ast, propertyNameInTemplate) {
    var parts = StringWrapper.split(propertyNameInTemplate, PROPERTY_PARTS_SEPARATOR);
    if (parts.length === 1) {
      var propName = parts[0];
      var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, propName);
      propName = isPresent(mappedPropName) ? mappedPropName : propName;
      return new api.ElementPropertyBinding(api.PropertyBindingType.PROPERTY, ast, propName);
    } else if (parts[0] == ATTRIBUTE_PREFIX) {
      return new api.ElementPropertyBinding(api.PropertyBindingType.ATTRIBUTE, ast, parts[1]);
    } else if (parts[0] == CLASS_PREFIX) {
      return new api.ElementPropertyBinding(api.PropertyBindingType.CLASS, ast, parts[1]);
    } else if (parts[0] == STYLE_PREFIX) {
      var unit = parts.length > 2 ? parts[2] : null;
      return new api.ElementPropertyBinding(api.PropertyBindingType.STYLE, ast, parts[1], unit);
    } else {
      throw new BaseException(("Invalid property name " + propertyNameInTemplate));
    }
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
      Set = $__m.Set;
      SetWrapper = $__m.SetWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ASTWithSource = $__m.ASTWithSource;
      AstTransformer = $__m.AstTransformer;
      AccessMember = $__m.AccessMember;
      LiteralArray = $__m.LiteralArray;
      ImplicitReceiver = $__m.ImplicitReceiver;
    }, function($__m) {
      DomProtoView = $__m.DomProtoView;
      DomProtoViewRef = $__m.DomProtoViewRef;
      resolveInternalDomProtoView = $__m.resolveInternalDomProtoView;
    }, function($__m) {
      ElementBinder = $__m.ElementBinder;
      Event = $__m.Event;
    }, function($__m) {
      api = $__m;
    }, function($__m) {
      NG_BINDING_CLASS = $__m.NG_BINDING_CLASS;
      EVENT_TARGET_SEPARATOR = $__m.EVENT_TARGET_SEPARATOR;
    }],
    execute: function() {
      ProtoViewBuilder = (function() {
        function ProtoViewBuilder(rootElement, type) {
          this.rootElement = rootElement;
          this.type = type;
          this.variableBindings = new Map();
          this.elements = [];
        }
        return ($traceurRuntime.createClass)(ProtoViewBuilder, {
          bindElement: function(element) {
            var description = arguments[1] !== (void 0) ? arguments[1] : null;
            var builder = new ElementBinderBuilder(this.elements.length, element, description);
            this.elements.push(builder);
            DOM.addClass(element, NG_BINDING_CLASS);
            return builder;
          },
          bindVariable: function(name, value) {
            this.variableBindings.set(value, name);
          },
          build: function() {
            var $__0 = this;
            var renderElementBinders = [];
            var apiElementBinders = [];
            var transitiveContentTagCount = 0;
            var boundTextNodeCount = 0;
            ListWrapper.forEach(this.elements, (function(ebb) {
              var directiveTemplatePropertyNames = new Set();
              var apiDirectiveBinders = ListWrapper.map(ebb.directives, (function(dbb) {
                ebb.eventBuilder.merge(dbb.eventBuilder);
                ListWrapper.forEach(dbb.templatePropertyNames, (function(name) {
                  return directiveTemplatePropertyNames.add(name);
                }));
                return new api.DirectiveBinder({
                  directiveIndex: dbb.directiveIndex,
                  propertyBindings: dbb.propertyBindings,
                  eventBindings: dbb.eventBindings,
                  hostPropertyBindings: buildElementPropertyBindings(ebb.element, isPresent(ebb.componentId), dbb.hostPropertyBindings, directiveTemplatePropertyNames)
                });
              }));
              var nestedProtoView = isPresent(ebb.nestedProtoView) ? ebb.nestedProtoView.build() : null;
              var nestedRenderProtoView = isPresent(nestedProtoView) ? resolveInternalDomProtoView(nestedProtoView.render) : null;
              if (isPresent(nestedRenderProtoView)) {
                transitiveContentTagCount += nestedRenderProtoView.transitiveContentTagCount;
              }
              if (isPresent(ebb.contentTagSelector)) {
                transitiveContentTagCount++;
              }
              var parentIndex = isPresent(ebb.parent) ? ebb.parent.index : -1;
              apiElementBinders.push(new api.ElementBinder({
                index: ebb.index,
                parentIndex: parentIndex,
                distanceToParent: ebb.distanceToParent,
                directives: apiDirectiveBinders,
                nestedProtoView: nestedProtoView,
                propertyBindings: buildElementPropertyBindings(ebb.element, isPresent(ebb.componentId), ebb.propertyBindings, directiveTemplatePropertyNames),
                variableBindings: ebb.variableBindings,
                eventBindings: ebb.eventBindings,
                textBindings: ebb.textBindings,
                readAttributes: ebb.readAttributes
              }));
              var childNodeInfo = $__0._analyzeChildNodes(ebb.element, ebb.textBindingNodes);
              boundTextNodeCount += ebb.textBindingNodes.length;
              renderElementBinders.push(new ElementBinder({
                textNodeIndices: childNodeInfo.boundTextNodeIndices,
                contentTagSelector: ebb.contentTagSelector,
                parentIndex: parentIndex,
                distanceToParent: ebb.distanceToParent,
                nestedProtoView: isPresent(nestedProtoView) ? resolveInternalDomProtoView(nestedProtoView.render) : null,
                componentId: ebb.componentId,
                eventLocals: new LiteralArray(ebb.eventBuilder.buildEventLocals()),
                localEvents: ebb.eventBuilder.buildLocalEvents(),
                globalEvents: ebb.eventBuilder.buildGlobalEvents(),
                elementIsEmpty: childNodeInfo.elementIsEmpty
              }));
            }));
            return new api.ProtoViewDto({
              render: new DomProtoViewRef(new DomProtoView({
                element: this.rootElement,
                elementBinders: renderElementBinders,
                transitiveContentTagCount: transitiveContentTagCount,
                boundTextNodeCount: boundTextNodeCount
              })),
              type: this.type,
              elementBinders: apiElementBinders,
              variableBindings: this.variableBindings
            });
          },
          _analyzeChildNodes: function(parentElement, boundTextNodes) {
            var childNodes = DOM.childNodes(DOM.templateAwareRoot(parentElement));
            var boundTextNodeIndices = [];
            var indexInBoundTextNodes = 0;
            var elementIsEmpty = true;
            for (var i = 0; i < childNodes.length; i++) {
              var node = childNodes[i];
              if (indexInBoundTextNodes < boundTextNodes.length && node === boundTextNodes[indexInBoundTextNodes]) {
                boundTextNodeIndices.push(i);
                indexInBoundTextNodes++;
                elementIsEmpty = false;
              } else if ((DOM.isTextNode(node) && DOM.getText(node).trim().length > 0) || (DOM.isElementNode(node))) {
                elementIsEmpty = false;
              }
            }
            return new _ChildNodesInfo(boundTextNodeIndices, elementIsEmpty);
          }
        }, {});
      }());
      $__export("ProtoViewBuilder", ProtoViewBuilder);
      _ChildNodesInfo = (function() {
        function _ChildNodesInfo(boundTextNodeIndices, elementIsEmpty) {
          this.boundTextNodeIndices = boundTextNodeIndices;
          this.elementIsEmpty = elementIsEmpty;
        }
        return ($traceurRuntime.createClass)(_ChildNodesInfo, {}, {});
      }());
      ElementBinderBuilder = (function() {
        function ElementBinderBuilder(index, element, description) {
          this.index = index;
          this.element = element;
          this.parent = null;
          this.distanceToParent = 0;
          this.directives = [];
          this.nestedProtoView = null;
          this.propertyBindings = new Map();
          this.variableBindings = new Map();
          this.propertyBindingsToDirectives = new Set();
          this.eventBindings = [];
          this.eventBuilder = new EventBuilder();
          this.textBindingNodes = [];
          this.textBindings = [];
          this.contentTagSelector = null;
          this.readAttributes = new Map();
          this.componentId = null;
        }
        return ($traceurRuntime.createClass)(ElementBinderBuilder, {
          setParent: function(parent, distanceToParent) {
            this.parent = parent;
            if (isPresent(parent)) {
              this.distanceToParent = distanceToParent;
            }
            return this;
          },
          readAttribute: function(attrName) {
            if (isBlank(this.readAttributes.get(attrName))) {
              this.readAttributes.set(attrName, DOM.getAttribute(this.element, attrName));
            }
          },
          bindDirective: function(directiveIndex) {
            var directive = new DirectiveBuilder(directiveIndex);
            this.directives.push(directive);
            return directive;
          },
          bindNestedProtoView: function(rootElement) {
            if (isPresent(this.nestedProtoView)) {
              throw new BaseException('Only one nested view per element is allowed');
            }
            this.nestedProtoView = new ProtoViewBuilder(rootElement, api.ViewType.EMBEDDED);
            return this.nestedProtoView;
          },
          bindProperty: function(name, expression) {
            this.propertyBindings.set(name, expression);
          },
          bindPropertyToDirective: function(name) {
            this.propertyBindingsToDirectives.add(name);
          },
          bindVariable: function(name, value) {
            if (isPresent(this.nestedProtoView)) {
              this.nestedProtoView.bindVariable(name, value);
            } else {
              this.variableBindings.set(value, name);
            }
          },
          bindEvent: function(name, expression) {
            var target = arguments[2] !== (void 0) ? arguments[2] : null;
            this.eventBindings.push(this.eventBuilder.add(name, expression, target));
          },
          bindText: function(textNode, expression) {
            this.textBindingNodes.push(textNode);
            this.textBindings.push(expression);
          },
          setContentTagSelector: function(value) {
            this.contentTagSelector = value;
          },
          setComponentId: function(componentId) {
            this.componentId = componentId;
          }
        }, {});
      }());
      $__export("ElementBinderBuilder", ElementBinderBuilder);
      DirectiveBuilder = (function() {
        function DirectiveBuilder(directiveIndex) {
          this.directiveIndex = directiveIndex;
          this.propertyBindings = new Map();
          this.templatePropertyNames = [];
          this.hostPropertyBindings = new Map();
          this.eventBindings = [];
          this.eventBuilder = new EventBuilder();
        }
        return ($traceurRuntime.createClass)(DirectiveBuilder, {
          bindProperty: function(name, expression, elProp) {
            this.propertyBindings.set(name, expression);
            if (isPresent(elProp)) {
              this.templatePropertyNames.push(elProp);
            }
          },
          bindHostProperty: function(name, expression) {
            this.hostPropertyBindings.set(name, expression);
          },
          bindEvent: function(name, expression) {
            var target = arguments[2] !== (void 0) ? arguments[2] : null;
            this.eventBindings.push(this.eventBuilder.add(name, expression, target));
          }
        }, {});
      }());
      $__export("DirectiveBuilder", DirectiveBuilder);
      EventBuilder = (function($__super) {
        function EventBuilder() {
          $traceurRuntime.superConstructor(EventBuilder).call(this);
          this.locals = [];
          this.localEvents = [];
          this.globalEvents = [];
          this._implicitReceiver = new ImplicitReceiver();
        }
        return ($traceurRuntime.createClass)(EventBuilder, {
          add: function(name, source, target) {
            var adjustedAst = source.ast;
            var fullName = isPresent(target) ? target + EVENT_TARGET_SEPARATOR + name : name;
            var result = new api.EventBinding(fullName, new ASTWithSource(adjustedAst, source.source, source.location));
            var event = new Event(name, target, fullName);
            if (isBlank(target)) {
              this.localEvents.push(event);
            } else {
              this.globalEvents.push(event);
            }
            return result;
          },
          visitAccessMember: function(ast) {
            var isEventAccess = false;
            var current = ast;
            while (!isEventAccess && (current instanceof AccessMember)) {
              var am = current;
              if (am.name == '$event') {
                isEventAccess = true;
              }
              current = am.receiver;
            }
            if (isEventAccess) {
              this.locals.push(ast);
              var index = this.locals.length - 1;
              return new AccessMember(this._implicitReceiver, ("" + index), (function(arr) {
                return arr[index];
              }), null);
            } else {
              return ast;
            }
          },
          buildEventLocals: function() {
            return this.locals;
          },
          buildLocalEvents: function() {
            return this.localEvents;
          },
          buildGlobalEvents: function() {
            return this.globalEvents;
          },
          merge: function(eventBuilder) {
            this._merge(this.localEvents, eventBuilder.localEvents);
            this._merge(this.globalEvents, eventBuilder.globalEvents);
            ListWrapper.concat(this.locals, eventBuilder.locals);
          },
          _merge: function(host, tobeAdded) {
            var names = [];
            for (var i = 0; i < host.length; i++) {
              names.push(host[i].fullName);
            }
            for (var j = 0; j < tobeAdded.length; j++) {
              if (!ListWrapper.contains(names, tobeAdded[j].fullName)) {
                host.push(tobeAdded[j]);
              }
            }
          }
        }, {}, $__super);
      }(AstTransformer));
      $__export("EventBuilder", EventBuilder);
      PROPERTY_PARTS_SEPARATOR = new RegExp('\\.');
      ATTRIBUTE_PREFIX = 'attr';
      CLASS_PREFIX = 'class';
      STYLE_PREFIX = 'style';
    }
  };
});

System.register("angular2/src/render/dom/compiler/directive_parser", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/compiler/selector", "angular2/src/render/api", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/directive_parser";
  var isPresent,
      isBlank,
      BaseException,
      StringWrapper,
      MapWrapper,
      ListWrapper,
      DOM,
      SelectorMatcher,
      CssSelector,
      DirectiveMetadata,
      dashCaseToCamelCase,
      camelCaseToDashCase,
      EVENT_TARGET_SEPARATOR,
      DirectiveParser;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      SelectorMatcher = $__m.SelectorMatcher;
      CssSelector = $__m.CssSelector;
    }, function($__m) {
      DirectiveMetadata = $__m.DirectiveMetadata;
    }, function($__m) {
      dashCaseToCamelCase = $__m.dashCaseToCamelCase;
      camelCaseToDashCase = $__m.camelCaseToDashCase;
      EVENT_TARGET_SEPARATOR = $__m.EVENT_TARGET_SEPARATOR;
    }],
    execute: function() {
      DirectiveParser = (function() {
        function DirectiveParser(_parser, _directives) {
          this._parser = _parser;
          this._directives = _directives;
          this._selectorMatcher = new SelectorMatcher();
          for (var i = 0; i < _directives.length; i++) {
            var directive = _directives[i];
            var selector = CssSelector.parse(directive.selector);
            this._ensureComponentOnlyHasElementSelector(selector, directive);
            this._selectorMatcher.addSelectables(selector, i);
          }
        }
        return ($traceurRuntime.createClass)(DirectiveParser, {
          _ensureComponentOnlyHasElementSelector: function(selector, directive) {
            var isElementSelector = selector.length === 1 && selector[0].isElementSelector();
            if (!isElementSelector && directive.type === DirectiveMetadata.COMPONENT_TYPE) {
              throw new BaseException(("Component '" + directive.id + "' can only have an element selector, but had '" + directive.selector + "'"));
            }
          },
          process: function(parent, current, control) {
            var $__0 = this;
            var attrs = current.attrs();
            var classList = current.classList();
            var cssSelector = new CssSelector();
            var nodeName = DOM.nodeName(current.element);
            cssSelector.setElement(nodeName);
            for (var i = 0; i < classList.length; i++) {
              cssSelector.addClassName(classList[i]);
            }
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              cssSelector.addAttribute(attrName, attrValue);
            }));
            var componentDirective;
            var foundDirectiveIndices = [];
            var elementBinder = null;
            this._selectorMatcher.match(cssSelector, (function(selector, directiveIndex) {
              elementBinder = current.bindElement();
              var directive = $__0._directives[directiveIndex];
              if (directive.type === DirectiveMetadata.COMPONENT_TYPE) {
                ListWrapper.insert(foundDirectiveIndices, 0, directiveIndex);
                if (isPresent(componentDirective)) {
                  throw new BaseException(("Only one component directive is allowed per element - check " + current.elementDescription));
                }
                componentDirective = directive;
                elementBinder.setComponentId(directive.id);
              } else {
                foundDirectiveIndices.push(directiveIndex);
              }
            }));
            ListWrapper.forEach(foundDirectiveIndices, (function(directiveIndex) {
              var dirMetadata = $__0._directives[directiveIndex];
              var directiveBinderBuilder = elementBinder.bindDirective(directiveIndex);
              current.compileChildren = current.compileChildren && dirMetadata.compileChildren;
              if (isPresent(dirMetadata.properties)) {
                ListWrapper.forEach(dirMetadata.properties, (function(bindConfig) {
                  $__0._bindDirectiveProperty(bindConfig, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(dirMetadata.hostListeners)) {
                MapWrapper.forEach(dirMetadata.hostListeners, (function(action, eventName) {
                  $__0._bindDirectiveEvent(eventName, action, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(dirMetadata.hostProperties)) {
                MapWrapper.forEach(dirMetadata.hostProperties, (function(expression, hostPropertyName) {
                  $__0._bindHostProperty(hostPropertyName, expression, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(dirMetadata.hostAttributes)) {
                MapWrapper.forEach(dirMetadata.hostAttributes, (function(hostAttrValue, hostAttrName) {
                  $__0._addHostAttribute(hostAttrName, hostAttrValue, current);
                }));
              }
              if (isPresent(dirMetadata.readAttributes)) {
                ListWrapper.forEach(dirMetadata.readAttributes, (function(attrName) {
                  elementBinder.readAttribute(attrName);
                }));
              }
            }));
          },
          _bindDirectiveProperty: function(bindConfig, compileElement, directiveBinderBuilder) {
            var dirProperty;
            var elProp;
            var pipes;
            var assignIndex = bindConfig.indexOf(':');
            if (assignIndex > -1) {
              dirProperty = StringWrapper.substring(bindConfig, 0, assignIndex).trim();
              pipes = this._splitBindConfig(StringWrapper.substring(bindConfig, assignIndex + 1));
              elProp = ListWrapper.removeAt(pipes, 0);
            } else {
              dirProperty = bindConfig;
              elProp = bindConfig;
              pipes = [];
            }
            elProp = dashCaseToCamelCase(elProp);
            var bindingAst = compileElement.bindElement().propertyBindings.get(elProp);
            if (isBlank(bindingAst)) {
              var attributeValue = compileElement.attrs().get(camelCaseToDashCase(elProp));
              if (isPresent(attributeValue)) {
                bindingAst = this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
              }
            }
            if (isPresent(bindingAst)) {
              directiveBinderBuilder.bindProperty(dirProperty, bindingAst, elProp);
            }
          },
          _bindDirectiveEvent: function(eventName, action, compileElement, directiveBinderBuilder) {
            var ast = this._parser.parseAction(action, compileElement.elementDescription);
            if (StringWrapper.contains(eventName, EVENT_TARGET_SEPARATOR)) {
              var parts = eventName.split(EVENT_TARGET_SEPARATOR);
              directiveBinderBuilder.bindEvent(parts[1], ast, parts[0]);
            } else {
              directiveBinderBuilder.bindEvent(eventName, ast);
            }
          },
          _bindHostProperty: function(hostPropertyName, expression, compileElement, directiveBinderBuilder) {
            var ast = this._parser.parseSimpleBinding(expression, ("hostProperties of " + compileElement.elementDescription));
            directiveBinderBuilder.bindHostProperty(hostPropertyName, ast);
          },
          _addHostAttribute: function(attrName, attrValue, compileElement) {
            if (StringWrapper.equals(attrName, 'class')) {
              ListWrapper.forEach(attrValue.split(' '), (function(className) {
                DOM.addClass(compileElement.element, className);
              }));
            } else if (!DOM.hasAttribute(compileElement.element, attrName)) {
              DOM.setAttribute(compileElement.element, attrName, attrValue);
            }
          },
          _splitBindConfig: function(bindConfig) {
            return ListWrapper.map(bindConfig.split('|'), (function(s) {
              return s.trim();
            }));
          }
        }, {});
      }());
      $__export("DirectiveParser", DirectiveParser);
    }
  };
});

System.register("angular2/annotations", ["angular2/src/core/annotations/annotations", "angular2/src/core/annotations/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/annotations";
  var $__exportNames = {};
  var $__exportNames = {};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }],
    execute: function() {}
  };
});

System.register("angular2/directives", ["angular2/src/facade/lang", "angular2/src/directives/ng_for", "angular2/src/directives/ng_if", "angular2/src/directives/ng_non_bindable", "angular2/src/directives/ng_switch", "angular2/src/directives/class"], function($__export) {
  "use strict";
  var __moduleName = "angular2/directives";
  var CONST_EXPR,
      NgFor,
      NgIf,
      NgNonBindable,
      NgSwitch,
      NgSwitchWhen,
      NgSwitchDefault,
      coreDirectives;
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      NgFor = $__m.NgFor;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      NgIf = $__m.NgIf;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      NgNonBindable = $__m.NgNonBindable;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      NgSwitch = $__m.NgSwitch;
      NgSwitchWhen = $__m.NgSwitchWhen;
      NgSwitchDefault = $__m.NgSwitchDefault;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }],
    execute: function() {
      coreDirectives = CONST_EXPR([NgFor, NgIf, NgNonBindable, NgSwitch, NgSwitchWhen, NgSwitchDefault]);
      $__export("coreDirectives", coreDirectives);
    }
  };
});

System.register("angular2/src/forms/model", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/forms/validators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/model";
  var StringWrapper,
      isPresent,
      isBlank,
      EventEmitter,
      ObservableWrapper,
      StringMapWrapper,
      ListWrapper,
      List,
      Validators,
      VALID,
      INVALID,
      AbstractControl,
      Control,
      ControlGroup,
      ControlArray;
  function isControl(c) {
    return c instanceof AbstractControl;
  }
  function _find(c, path) {
    if (isBlank(path))
      return null;
    if (!(path instanceof List)) {
      path = StringWrapper.split(path, new RegExp("/"));
    }
    if (ListWrapper.isEmpty(path))
      return null;
    return ListWrapper.reduce(path, (function(v, name) {
      if (v instanceof ControlGroup) {
        return isPresent(v.controls[name]) ? v.controls[name] : null;
      } else if (v instanceof ControlArray) {
        var index = name;
        return isPresent(v.at(index)) ? v.at(index) : null;
      } else {
        return null;
      }
    }), c);
  }
  $__export("isControl", isControl);
  return {
    setters: [function($__m) {
      StringWrapper = $__m.StringWrapper;
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      EventEmitter = $__m.EventEmitter;
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
      ListWrapper = $__m.ListWrapper;
      List = $__m.List;
    }, function($__m) {
      Validators = $__m.Validators;
    }],
    execute: function() {
      VALID = "VALID";
      $__export("VALID", VALID);
      INVALID = "INVALID";
      $__export("INVALID", INVALID);
      AbstractControl = (function() {
        function AbstractControl(validator) {
          this.validator = validator;
          this._pristine = true;
          this._touched = false;
        }
        return ($traceurRuntime.createClass)(AbstractControl, {
          get value() {
            return this._value;
          },
          get status() {
            return this._status;
          },
          get valid() {
            return this._status === VALID;
          },
          get errors() {
            return this._errors;
          },
          get pristine() {
            return this._pristine;
          },
          get dirty() {
            return !this.pristine;
          },
          get touched() {
            return this._touched;
          },
          get untouched() {
            return !this._touched;
          },
          get valueChanges() {
            return this._valueChanges;
          },
          markAsTouched: function() {
            this._touched = true;
          },
          markAsDirty: function() {
            var onlySelf = (arguments[0] !== (void 0) ? arguments[0] : {}).onlySelf;
            onlySelf = isPresent(onlySelf) ? onlySelf : false;
            this._pristine = false;
            if (isPresent(this._parent) && !onlySelf) {
              this._parent.markAsDirty({onlySelf: onlySelf});
            }
          },
          setParent: function(parent) {
            this._parent = parent;
          },
          updateValidity: function() {
            var onlySelf = (arguments[0] !== (void 0) ? arguments[0] : {}).onlySelf;
            onlySelf = isPresent(onlySelf) ? onlySelf : false;
            this._errors = this.validator(this);
            this._status = isPresent(this._errors) ? INVALID : VALID;
            if (isPresent(this._parent) && !onlySelf) {
              this._parent.updateValidity({onlySelf: onlySelf});
            }
          },
          updateValueAndValidity: function() {
            var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
                onlySelf = $__2.onlySelf,
                emitEvent = $__2.emitEvent;
            onlySelf = isPresent(onlySelf) ? onlySelf : false;
            emitEvent = isPresent(emitEvent) ? emitEvent : true;
            this._updateValue();
            if (emitEvent) {
              ObservableWrapper.callNext(this._valueChanges, this._value);
            }
            this._errors = this.validator(this);
            this._status = isPresent(this._errors) ? INVALID : VALID;
            if (isPresent(this._parent) && !onlySelf) {
              this._parent.updateValueAndValidity({
                onlySelf: onlySelf,
                emitEvent: emitEvent
              });
            }
          },
          find: function(path) {
            return _find(this, path);
          },
          getError: function(errorCode) {
            var path = arguments[1] !== (void 0) ? arguments[1] : null;
            var c = isPresent(path) && !ListWrapper.isEmpty(path) ? this.find(path) : this;
            if (isPresent(c) && isPresent(c._errors)) {
              return StringMapWrapper.get(c._errors, errorCode);
            } else {
              return null;
            }
          },
          hasError: function(errorCode) {
            var path = arguments[1] !== (void 0) ? arguments[1] : null;
            return isPresent(this.getError(errorCode, path));
          },
          _updateValue: function() {}
        }, {});
      }());
      $__export("AbstractControl", AbstractControl);
      Control = (function($__super) {
        function Control(value) {
          var validator = arguments[1] !== (void 0) ? arguments[1] : Validators.nullValidator;
          $traceurRuntime.superConstructor(Control).call(this, validator);
          this._value = value;
          this.updateValidity({onlySelf: true});
          this._valueChanges = new EventEmitter();
        }
        return ($traceurRuntime.createClass)(Control, {
          updateValue: function(value) {
            var $__2 = arguments[1] !== (void 0) ? arguments[1] : {},
                onlySelf = $__2.onlySelf,
                emitEvent = $__2.emitEvent;
            this._value = value;
            if (isPresent(this._onChange))
              this._onChange(this._value);
            this.updateValueAndValidity({
              onlySelf: onlySelf,
              emitEvent: emitEvent
            });
          },
          registerOnChange: function(fn) {
            this._onChange = fn;
          }
        }, {}, $__super);
      }(AbstractControl));
      $__export("Control", Control);
      ControlGroup = (function($__super) {
        function ControlGroup(controls) {
          var optionals = arguments[1] !== (void 0) ? arguments[1] : null;
          var validator = arguments[2] !== (void 0) ? arguments[2] : Validators.group;
          $traceurRuntime.superConstructor(ControlGroup).call(this, validator);
          this.controls = controls;
          this._optionals = isPresent(optionals) ? optionals : {};
          this._valueChanges = new EventEmitter();
          this._setParentForControls();
          this._value = this._reduceValue();
          this.updateValidity({onlySelf: true});
        }
        return ($traceurRuntime.createClass)(ControlGroup, {
          addControl: function(name, c) {
            this.controls[name] = c;
            c.setParent(this);
          },
          removeControl: function(name) {
            StringMapWrapper.delete(this.controls, name);
          },
          include: function(controlName) {
            StringMapWrapper.set(this._optionals, controlName, true);
            this.updateValueAndValidity();
          },
          exclude: function(controlName) {
            StringMapWrapper.set(this._optionals, controlName, false);
            this.updateValueAndValidity();
          },
          contains: function(controlName) {
            var c = StringMapWrapper.contains(this.controls, controlName);
            return c && this._included(controlName);
          },
          _setParentForControls: function() {
            var $__0 = this;
            StringMapWrapper.forEach(this.controls, (function(control, name) {
              control.setParent($__0);
            }));
          },
          _updateValue: function() {
            this._value = this._reduceValue();
          },
          _reduceValue: function() {
            return this._reduceChildren({}, (function(acc, control, name) {
              acc[name] = control.value;
              return acc;
            }));
          },
          _reduceChildren: function(initValue, fn) {
            var $__0 = this;
            var res = initValue;
            StringMapWrapper.forEach(this.controls, (function(control, name) {
              if ($__0._included(name)) {
                res = fn(res, control, name);
              }
            }));
            return res;
          },
          _included: function(controlName) {
            var isOptional = StringMapWrapper.contains(this._optionals, controlName);
            return !isOptional || StringMapWrapper.get(this._optionals, controlName);
          }
        }, {}, $__super);
      }(AbstractControl));
      $__export("ControlGroup", ControlGroup);
      ControlArray = (function($__super) {
        function ControlArray(controls) {
          var validator = arguments[1] !== (void 0) ? arguments[1] : Validators.array;
          $traceurRuntime.superConstructor(ControlArray).call(this, validator);
          this.controls = controls;
          this._valueChanges = new EventEmitter();
          this._setParentForControls();
          this._updateValue();
          this.updateValidity({onlySelf: true});
        }
        return ($traceurRuntime.createClass)(ControlArray, {
          at: function(index) {
            return this.controls[index];
          },
          push: function(control) {
            this.controls.push(control);
            control.setParent(this);
            this.updateValueAndValidity();
          },
          insert: function(index, control) {
            ListWrapper.insert(this.controls, index, control);
            control.setParent(this);
            this.updateValueAndValidity();
          },
          removeAt: function(index) {
            ListWrapper.removeAt(this.controls, index);
            this.updateValueAndValidity();
          },
          get length() {
            return this.controls.length;
          },
          _updateValue: function() {
            this._value = ListWrapper.map(this.controls, (function(c) {
              return c.value;
            }));
          },
          _setParentForControls: function() {
            var $__0 = this;
            ListWrapper.forEach(this.controls, (function(control) {
              control.setParent($__0);
            }));
          }
        }, {}, $__super);
      }(AbstractControl));
      $__export("ControlArray", ControlArray);
    }
  };
});

System.register("angular2/src/forms/directives/ng_control_name", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/angular2", "angular2/di", "angular2/src/forms/directives/control_container", "angular2/src/forms/directives/ng_control", "angular2/src/forms/directives/validators", "angular2/src/forms/directives/shared"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives/ng_control_name";
  var __decorate,
      __metadata,
      __param,
      CONST_EXPR,
      EventEmitter,
      ObservableWrapper,
      StringMapWrapper,
      Directive,
      onDestroy,
      onChange,
      Query,
      QueryList,
      forwardRef,
      Ancestor,
      Binding,
      ControlContainer,
      NgControl,
      NgValidator,
      controlPath,
      composeNgValidator,
      controlNameBinding,
      NgControlName;
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      EventEmitter = $__m.EventEmitter;
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      Directive = $__m.Directive;
      onDestroy = $__m.onDestroy;
      onChange = $__m.onChange;
      Query = $__m.Query;
      QueryList = $__m.QueryList;
    }, function($__m) {
      forwardRef = $__m.forwardRef;
      Ancestor = $__m.Ancestor;
      Binding = $__m.Binding;
    }, function($__m) {
      ControlContainer = $__m.ControlContainer;
    }, function($__m) {
      NgControl = $__m.NgControl;
    }, function($__m) {
      NgValidator = $__m.NgValidator;
    }, function($__m) {
      controlPath = $__m.controlPath;
      composeNgValidator = $__m.composeNgValidator;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      controlNameBinding = CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef((function() {
          return NgControlName;
        }))}));
      NgControlName = (function($__super) {
        function $__0(parent, ngValidators) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.update = new EventEmitter();
          this._added = false;
          this._parent = parent;
          this.ngValidators = ngValidators;
        }
        return ($traceurRuntime.createClass)($__0, {
          onChange: function(c) {
            if (!this._added) {
              this.formDirective.addControl(this);
              this._added = true;
            }
            if (StringMapWrapper.contains(c, "model")) {
              this.formDirective.updateModel(this, this.model);
            }
          },
          onDestroy: function() {
            this.formDirective.removeControl(this);
          },
          viewToModelUpdate: function(newValue) {
            ObservableWrapper.callNext(this.update, newValue);
          },
          get path() {
            return controlPath(this.name, this._parent);
          },
          get formDirective() {
            return this._parent.formDirective;
          },
          get control() {
            return this.formDirective.getControl(this);
          },
          get validator() {
            return composeNgValidator(this.ngValidators);
          }
        }, {}, $__super);
      }(NgControl));
      $__export("NgControlName", NgControlName);
      $__export("NgControlName", NgControlName = __decorate([Directive({
        selector: '[ng-control]',
        hostInjector: [controlNameBinding],
        properties: ['name: ngControl', 'model: ngModel'],
        events: ['update: ngModel'],
        lifecycle: [onDestroy, onChange],
        exportAs: 'form'
      }), __param(0, Ancestor()), __param(1, Query(NgValidator)), __metadata('design:paramtypes', [ControlContainer, QueryList])], NgControlName));
    }
  };
});

System.register("angular2/src/http/static_request", ["angular2/src/http/headers", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/static_request";
  var Headers,
      isPresent,
      Request;
  return {
    setters: [function($__m) {
      Headers = $__m.Headers;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      Request = (function() {
        function Request(requestOptions) {
          this.url = requestOptions.url;
          this._body = requestOptions.body;
          this.method = requestOptions.method;
          this.mode = requestOptions.mode;
          this.credentials = requestOptions.credentials;
          this.headers = new Headers(requestOptions.headers);
          this.cache = requestOptions.cache;
        }
        return ($traceurRuntime.createClass)(Request, {text: function() {
            return isPresent(this._body) ? this._body.toString() : '';
          }}, {});
      }());
      $__export("Request", Request);
    }
  };
});

System.register("angular2/src/http/base_request_options", ["angular2/src/facade/lang", "angular2/src/http/headers", "angular2/src/http/enums", "angular2/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/base_request_options";
  var __decorate,
      __metadata,
      isPresent,
      Headers,
      RequestModesOpts,
      RequestMethods,
      Injectable,
      RequestOptions,
      BaseRequestOptions;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      Headers = $__m.Headers;
    }, function($__m) {
      RequestModesOpts = $__m.RequestModesOpts;
      RequestMethods = $__m.RequestMethods;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      RequestOptions = (function() {
        function RequestOptions() {
          var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
              method = $__2.method,
              headers = $__2.headers,
              body = $__2.body,
              mode = $__2.mode,
              credentials = $__2.credentials,
              cache = $__2.cache,
              url = $__2.url;
          this.method = isPresent(method) ? method : null;
          this.headers = isPresent(headers) ? headers : null;
          this.body = isPresent(body) ? body : null;
          this.mode = isPresent(mode) ? mode : null;
          this.credentials = isPresent(credentials) ? credentials : null;
          this.cache = isPresent(cache) ? cache : null;
          this.url = isPresent(url) ? url : null;
        }
        return ($traceurRuntime.createClass)(RequestOptions, {merge: function(options) {
            return new RequestOptions({
              method: isPresent(options) && isPresent(options.method) ? options.method : this.method,
              headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
              body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
              mode: isPresent(options) && isPresent(options.mode) ? options.mode : this.mode,
              credentials: isPresent(options) && isPresent(options.credentials) ? options.credentials : this.credentials,
              cache: isPresent(options) && isPresent(options.cache) ? options.cache : this.cache,
              url: isPresent(options) && isPresent(options.url) ? options.url : this.url
            });
          }}, {});
      }());
      $__export("RequestOptions", RequestOptions);
      BaseRequestOptions = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, {
            method: RequestMethods.GET,
            headers: new Headers(),
            mode: RequestModesOpts.Cors
          });
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(RequestOptions));
      $__export("BaseRequestOptions", BaseRequestOptions);
      $__export("BaseRequestOptions", BaseRequestOptions = __decorate([Injectable(), __metadata('design:paramtypes', [])], BaseRequestOptions));
    }
  };
});

System.register("angular2/src/http/backends/xhr_backend", ["angular2/src/http/enums", "angular2/src/http/static_response", "angular2/src/http/base_response_options", "angular2/di", "angular2/src/http/backends/browser_xhr", "angular2/src/facade/async", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/backends/xhr_backend";
  var __decorate,
      __metadata,
      RequestMethodsMap,
      Response,
      ResponseOptions,
      Injectable,
      BrowserXhr,
      EventEmitter,
      ObservableWrapper,
      isPresent,
      ENUM_INDEX,
      XHRConnection,
      XHRBackend;
  return {
    setters: [function($__m) {
      RequestMethodsMap = $__m.RequestMethodsMap;
    }, function($__m) {
      Response = $__m.Response;
    }, function($__m) {
      ResponseOptions = $__m.ResponseOptions;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      BrowserXhr = $__m.BrowserXhr;
    }, function($__m) {
      EventEmitter = $__m.EventEmitter;
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      ENUM_INDEX = $__m.ENUM_INDEX;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      XHRConnection = (function() {
        function XHRConnection(req, browserXHR, baseResponseOptions) {
          var $__0 = this;
          var requestMethodsMap = new RequestMethodsMap();
          this.request = req;
          this.response = new EventEmitter();
          this._xhr = browserXHR.build();
          this._xhr.open(requestMethodsMap.getMethod(ENUM_INDEX(req.method)), req.url);
          this._xhr.addEventListener('load', (function(_) {
            var responseOptions = new ResponseOptions({body: isPresent($__0._xhr.response) ? $__0._xhr.response : $__0._xhr.responseText});
            if (isPresent(baseResponseOptions)) {
              responseOptions = baseResponseOptions.merge(responseOptions);
            }
            ObservableWrapper.callNext($__0.response, new Response(responseOptions));
          }));
          this._xhr.send(this.request.text());
        }
        return ($traceurRuntime.createClass)(XHRConnection, {dispose: function() {
            this._xhr.abort();
          }}, {});
      }());
      $__export("XHRConnection", XHRConnection);
      XHRBackend = (($traceurRuntime.createClass)(function(_browserXHR, _baseResponseOptions) {
        this._browserXHR = _browserXHR;
        this._baseResponseOptions = _baseResponseOptions;
      }, {createConnection: function(request) {
          return new XHRConnection(request, this._browserXHR, this._baseResponseOptions);
        }}, {}));
      $__export("XHRBackend", XHRBackend);
      $__export("XHRBackend", XHRBackend = __decorate([Injectable(), __metadata('design:paramtypes', [BrowserXhr, ResponseOptions])], XHRBackend));
    }
  };
});

System.register("angular2/src/di/decorators", ["angular2/src/di/annotations", "angular2/src/util/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/decorators";
  var InjectAnnotation,
      OptionalAnnotation,
      InjectableAnnotation,
      VisibilityAnnotation,
      SelfAnnotation,
      ParentAnnotation,
      AncestorAnnotation,
      UnboundedAnnotation,
      makeDecorator,
      makeParamDecorator,
      Inject,
      Optional,
      Injectable,
      Visibility,
      Self,
      Parent,
      Ancestor,
      Unbounded;
  return {
    setters: [function($__m) {
      InjectAnnotation = $__m.InjectAnnotation;
      OptionalAnnotation = $__m.OptionalAnnotation;
      InjectableAnnotation = $__m.InjectableAnnotation;
      VisibilityAnnotation = $__m.VisibilityAnnotation;
      SelfAnnotation = $__m.SelfAnnotation;
      ParentAnnotation = $__m.ParentAnnotation;
      AncestorAnnotation = $__m.AncestorAnnotation;
      UnboundedAnnotation = $__m.UnboundedAnnotation;
    }, function($__m) {
      makeDecorator = $__m.makeDecorator;
      makeParamDecorator = $__m.makeParamDecorator;
    }],
    execute: function() {
      Inject = makeParamDecorator(InjectAnnotation);
      $__export("Inject", Inject);
      Optional = makeParamDecorator(OptionalAnnotation);
      $__export("Optional", Optional);
      Injectable = makeDecorator(InjectableAnnotation);
      $__export("Injectable", Injectable);
      Visibility = makeParamDecorator(VisibilityAnnotation);
      $__export("Visibility", Visibility);
      Self = makeParamDecorator(SelfAnnotation);
      $__export("Self", Self);
      Parent = makeParamDecorator(ParentAnnotation);
      $__export("Parent", Parent);
      Ancestor = makeParamDecorator(AncestorAnnotation);
      $__export("Ancestor", Ancestor);
      Unbounded = makeParamDecorator(UnboundedAnnotation);
      $__export("Unbounded", Unbounded);
    }
  };
});

System.register("angular2/src/change_detection/parser/parser", ["angular2/src/di/decorators", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/parser/lexer", "angular2/src/reflection/reflection", "angular2/src/change_detection/parser/ast"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/parser";
  var __decorate,
      __metadata,
      Injectable,
      isBlank,
      isPresent,
      BaseException,
      StringWrapper,
      RegExpWrapper,
      ListWrapper,
      Lexer,
      EOF,
      $PERIOD,
      $COLON,
      $SEMICOLON,
      $LBRACKET,
      $RBRACKET,
      $COMMA,
      $LBRACE,
      $RBRACE,
      $LPAREN,
      $RPAREN,
      reflector,
      Reflector,
      EmptyExpr,
      ImplicitReceiver,
      AccessMember,
      SafeAccessMember,
      LiteralPrimitive,
      Binary,
      PrefixNot,
      Conditional,
      If,
      BindingPipe,
      Assignment,
      Chain,
      KeyedAccess,
      LiteralArray,
      LiteralMap,
      Interpolation,
      MethodCall,
      SafeMethodCall,
      FunctionCall,
      TemplateBinding,
      ASTWithSource,
      _implicitReceiver,
      INTERPOLATION_REGEXP,
      Parser,
      _ParseAST,
      SimpleExpressionChecker;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
      RegExpWrapper = $__m.RegExpWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      Lexer = $__m.Lexer;
      EOF = $__m.EOF;
      $PERIOD = $__m.$PERIOD;
      $COLON = $__m.$COLON;
      $SEMICOLON = $__m.$SEMICOLON;
      $LBRACKET = $__m.$LBRACKET;
      $RBRACKET = $__m.$RBRACKET;
      $COMMA = $__m.$COMMA;
      $LBRACE = $__m.$LBRACE;
      $RBRACE = $__m.$RBRACE;
      $LPAREN = $__m.$LPAREN;
      $RPAREN = $__m.$RPAREN;
    }, function($__m) {
      reflector = $__m.reflector;
      Reflector = $__m.Reflector;
    }, function($__m) {
      EmptyExpr = $__m.EmptyExpr;
      ImplicitReceiver = $__m.ImplicitReceiver;
      AccessMember = $__m.AccessMember;
      SafeAccessMember = $__m.SafeAccessMember;
      LiteralPrimitive = $__m.LiteralPrimitive;
      Binary = $__m.Binary;
      PrefixNot = $__m.PrefixNot;
      Conditional = $__m.Conditional;
      If = $__m.If;
      BindingPipe = $__m.BindingPipe;
      Assignment = $__m.Assignment;
      Chain = $__m.Chain;
      KeyedAccess = $__m.KeyedAccess;
      LiteralArray = $__m.LiteralArray;
      LiteralMap = $__m.LiteralMap;
      Interpolation = $__m.Interpolation;
      MethodCall = $__m.MethodCall;
      SafeMethodCall = $__m.SafeMethodCall;
      FunctionCall = $__m.FunctionCall;
      TemplateBinding = $__m.TemplateBinding;
      ASTWithSource = $__m.ASTWithSource;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      _implicitReceiver = new ImplicitReceiver();
      INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');
      Parser = (($traceurRuntime.createClass)(function(_lexer) {
        var providedReflector = arguments[1] !== (void 0) ? arguments[1] : null;
        this._lexer = _lexer;
        this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
      }, {
        parseAction: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
          return new ASTWithSource(ast, input, location);
        },
        parseBinding: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
          return new ASTWithSource(ast, input, location);
        },
        parseSimpleBinding: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseSimpleBinding();
          return new ASTWithSource(ast, input, location);
        },
        parseTemplateBindings: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          return new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings();
        },
        parseInterpolation: function(input, location) {
          var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
          if (parts.length <= 1) {
            return null;
          }
          var strings = [];
          var expressions = [];
          for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (i % 2 === 0) {
              strings.push(part);
            } else {
              var tokens = this._lexer.tokenize(part);
              var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
              expressions.push(ast);
            }
          }
          return new ASTWithSource(new Interpolation(strings, expressions), input, location);
        },
        wrapLiteralPrimitive: function(input, location) {
          return new ASTWithSource(new LiteralPrimitive(input), input, location);
        }
      }, {}));
      $__export("Parser", Parser);
      $__export("Parser", Parser = __decorate([Injectable(), __metadata('design:paramtypes', [Lexer, Reflector])], Parser));
      _ParseAST = (function() {
        function _ParseAST(input, location, tokens, reflector, parseAction) {
          this.input = input;
          this.location = location;
          this.tokens = tokens;
          this.reflector = reflector;
          this.parseAction = parseAction;
          this.index = 0;
        }
        return ($traceurRuntime.createClass)(_ParseAST, {
          peek: function(offset) {
            var i = this.index + offset;
            return i < this.tokens.length ? this.tokens[i] : EOF;
          },
          get next() {
            return this.peek(0);
          },
          get inputIndex() {
            return (this.index < this.tokens.length) ? this.next.index : this.input.length;
          },
          advance: function() {
            this.index++;
          },
          optionalCharacter: function(code) {
            if (this.next.isCharacter(code)) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          optionalKeywordVar: function() {
            if (this.peekKeywordVar()) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          peekKeywordVar: function() {
            return this.next.isKeywordVar() || this.next.isOperator('#');
          },
          expectCharacter: function(code) {
            if (this.optionalCharacter(code))
              return ;
            this.error(("Missing expected " + StringWrapper.fromCharCode(code)));
          },
          optionalOperator: function(op) {
            if (this.next.isOperator(op)) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          expectOperator: function(operator) {
            if (this.optionalOperator(operator))
              return ;
            this.error(("Missing expected operator " + operator));
          },
          expectIdentifierOrKeyword: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword()) {
              this.error(("Unexpected token " + n + ", expected identifier or keyword"));
            }
            this.advance();
            return n.toString();
          },
          expectIdentifierOrKeywordOrString: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
              this.error(("Unexpected token " + n + ", expected identifier, keyword, or string"));
            }
            this.advance();
            return n.toString();
          },
          parseChain: function() {
            var exprs = [];
            while (this.index < this.tokens.length) {
              var expr = this.parsePipe();
              exprs.push(expr);
              if (this.optionalCharacter($SEMICOLON)) {
                if (!this.parseAction) {
                  this.error("Binding expression cannot contain chained expression");
                }
                while (this.optionalCharacter($SEMICOLON)) {}
              } else if (this.index < this.tokens.length) {
                this.error(("Unexpected token '" + this.next + "'"));
              }
            }
            if (exprs.length == 0)
              return new EmptyExpr();
            if (exprs.length == 1)
              return exprs[0];
            return new Chain(exprs);
          },
          parseSimpleBinding: function() {
            var ast = this.parseChain();
            if (!SimpleExpressionChecker.check(ast)) {
              this.error("Simple binding expression can only contain field access and constants'");
            }
            return ast;
          },
          parsePipe: function() {
            var result = this.parseExpression();
            if (this.optionalOperator("|")) {
              if (this.parseAction) {
                this.error("Cannot have a pipe in an action expression");
              }
              do {
                var name = this.expectIdentifierOrKeyword();
                var args = [];
                while (this.optionalCharacter($COLON)) {
                  args.push(this.parsePipe());
                }
                result = new BindingPipe(result, name, args);
              } while (this.optionalOperator("|"));
            }
            return result;
          },
          parseExpression: function() {
            var start = this.inputIndex;
            var result = this.parseConditional();
            while (this.next.isOperator('=')) {
              if (!result.isAssignable) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(("Expression " + expression + " is not assignable"));
              }
              if (!this.parseAction) {
                this.error("Binding expression cannot contain assignments");
              }
              this.expectOperator('=');
              result = new Assignment(result, this.parseConditional());
            }
            return result;
          },
          parseConditional: function() {
            var start = this.inputIndex;
            var result = this.parseLogicalOr();
            if (this.optionalOperator('?')) {
              var yes = this.parsePipe();
              if (!this.optionalCharacter($COLON)) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(("Conditional expression " + expression + " requires all 3 expressions"));
              }
              var no = this.parsePipe();
              return new Conditional(result, yes, no);
            } else {
              return result;
            }
          },
          parseLogicalOr: function() {
            var result = this.parseLogicalAnd();
            while (this.optionalOperator('||')) {
              result = new Binary('||', result, this.parseLogicalAnd());
            }
            return result;
          },
          parseLogicalAnd: function() {
            var result = this.parseEquality();
            while (this.optionalOperator('&&')) {
              result = new Binary('&&', result, this.parseEquality());
            }
            return result;
          },
          parseEquality: function() {
            var result = this.parseRelational();
            while (true) {
              if (this.optionalOperator('==')) {
                result = new Binary('==', result, this.parseRelational());
              } else if (this.optionalOperator('===')) {
                result = new Binary('===', result, this.parseRelational());
              } else if (this.optionalOperator('!=')) {
                result = new Binary('!=', result, this.parseRelational());
              } else if (this.optionalOperator('!==')) {
                result = new Binary('!==', result, this.parseRelational());
              } else {
                return result;
              }
            }
          },
          parseRelational: function() {
            var result = this.parseAdditive();
            while (true) {
              if (this.optionalOperator('<')) {
                result = new Binary('<', result, this.parseAdditive());
              } else if (this.optionalOperator('>')) {
                result = new Binary('>', result, this.parseAdditive());
              } else if (this.optionalOperator('<=')) {
                result = new Binary('<=', result, this.parseAdditive());
              } else if (this.optionalOperator('>=')) {
                result = new Binary('>=', result, this.parseAdditive());
              } else {
                return result;
              }
            }
          },
          parseAdditive: function() {
            var result = this.parseMultiplicative();
            while (true) {
              if (this.optionalOperator('+')) {
                result = new Binary('+', result, this.parseMultiplicative());
              } else if (this.optionalOperator('-')) {
                result = new Binary('-', result, this.parseMultiplicative());
              } else {
                return result;
              }
            }
          },
          parseMultiplicative: function() {
            var result = this.parsePrefix();
            while (true) {
              if (this.optionalOperator('*')) {
                result = new Binary('*', result, this.parsePrefix());
              } else if (this.optionalOperator('%')) {
                result = new Binary('%', result, this.parsePrefix());
              } else if (this.optionalOperator('/')) {
                result = new Binary('/', result, this.parsePrefix());
              } else {
                return result;
              }
            }
          },
          parsePrefix: function() {
            if (this.optionalOperator('+')) {
              return this.parsePrefix();
            } else if (this.optionalOperator('-')) {
              return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
            } else if (this.optionalOperator('!')) {
              return new PrefixNot(this.parsePrefix());
            } else {
              return this.parseCallChain();
            }
          },
          parseCallChain: function() {
            var result = this.parsePrimary();
            while (true) {
              if (this.optionalCharacter($PERIOD)) {
                result = this.parseAccessMemberOrMethodCall(result, false);
              } else if (this.optionalOperator('?.')) {
                result = this.parseAccessMemberOrMethodCall(result, true);
              } else if (this.optionalCharacter($LBRACKET)) {
                var key = this.parsePipe();
                this.expectCharacter($RBRACKET);
                result = new KeyedAccess(result, key);
              } else if (this.optionalCharacter($LPAREN)) {
                var args = this.parseCallArguments();
                this.expectCharacter($RPAREN);
                result = new FunctionCall(result, args);
              } else {
                return result;
              }
            }
          },
          parsePrimary: function() {
            if (this.optionalCharacter($LPAREN)) {
              var result = this.parsePipe();
              this.expectCharacter($RPAREN);
              return result;
            } else if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
              this.advance();
              return new LiteralPrimitive(null);
            } else if (this.next.isKeywordTrue()) {
              this.advance();
              return new LiteralPrimitive(true);
            } else if (this.next.isKeywordFalse()) {
              this.advance();
              return new LiteralPrimitive(false);
            } else if (this.parseAction && this.next.isKeywordIf()) {
              this.advance();
              this.expectCharacter($LPAREN);
              var condition = this.parseExpression();
              this.expectCharacter($RPAREN);
              var ifExp = this.parseExpressionOrBlock();
              var elseExp;
              if (this.next.isKeywordElse()) {
                this.advance();
                elseExp = this.parseExpressionOrBlock();
              }
              return new If(condition, ifExp, elseExp);
            } else if (this.optionalCharacter($LBRACKET)) {
              var elements = this.parseExpressionList($RBRACKET);
              this.expectCharacter($RBRACKET);
              return new LiteralArray(elements);
            } else if (this.next.isCharacter($LBRACE)) {
              return this.parseLiteralMap();
            } else if (this.next.isIdentifier()) {
              return this.parseAccessMemberOrMethodCall(_implicitReceiver, false);
            } else if (this.next.isNumber()) {
              var value = this.next.toNumber();
              this.advance();
              return new LiteralPrimitive(value);
            } else if (this.next.isString()) {
              var literalValue = this.next.toString();
              this.advance();
              return new LiteralPrimitive(literalValue);
            } else if (this.index >= this.tokens.length) {
              this.error(("Unexpected end of expression: " + this.input));
            } else {
              this.error(("Unexpected token " + this.next));
            }
            throw new BaseException("Fell through all cases in parsePrimary");
          },
          parseExpressionList: function(terminator) {
            var result = [];
            if (!this.next.isCharacter(terminator)) {
              do {
                result.push(this.parsePipe());
              } while (this.optionalCharacter($COMMA));
            }
            return result;
          },
          parseLiteralMap: function() {
            var keys = [];
            var values = [];
            this.expectCharacter($LBRACE);
            if (!this.optionalCharacter($RBRACE)) {
              do {
                var key = this.expectIdentifierOrKeywordOrString();
                keys.push(key);
                this.expectCharacter($COLON);
                values.push(this.parsePipe());
              } while (this.optionalCharacter($COMMA));
              this.expectCharacter($RBRACE);
            }
            return new LiteralMap(keys, values);
          },
          parseAccessMemberOrMethodCall: function(receiver) {
            var isSafe = arguments[1] !== (void 0) ? arguments[1] : false;
            var id = this.expectIdentifierOrKeyword();
            if (this.optionalCharacter($LPAREN)) {
              var args = this.parseCallArguments();
              this.expectCharacter($RPAREN);
              var fn = this.reflector.method(id);
              return isSafe ? new SafeMethodCall(receiver, id, fn, args) : new MethodCall(receiver, id, fn, args);
            } else {
              var getter = this.reflector.getter(id);
              var setter = this.reflector.setter(id);
              return isSafe ? new SafeAccessMember(receiver, id, getter, setter) : new AccessMember(receiver, id, getter, setter);
            }
          },
          parseCallArguments: function() {
            if (this.next.isCharacter($RPAREN))
              return [];
            var positionals = [];
            do {
              positionals.push(this.parsePipe());
            } while (this.optionalCharacter($COMMA));
            return positionals;
          },
          parseExpressionOrBlock: function() {
            if (this.optionalCharacter($LBRACE)) {
              var block = this.parseBlockContent();
              this.expectCharacter($RBRACE);
              return block;
            }
            return this.parseExpression();
          },
          parseBlockContent: function() {
            if (!this.parseAction) {
              this.error("Binding expression cannot contain chained expression");
            }
            var exprs = [];
            while (this.index < this.tokens.length && !this.next.isCharacter($RBRACE)) {
              var expr = this.parseExpression();
              exprs.push(expr);
              if (this.optionalCharacter($SEMICOLON)) {
                while (this.optionalCharacter($SEMICOLON)) {}
              }
            }
            if (exprs.length == 0)
              return new EmptyExpr();
            if (exprs.length == 1)
              return exprs[0];
            return new Chain(exprs);
          },
          expectTemplateBindingKey: function() {
            var result = '';
            var operatorFound = false;
            do {
              result += this.expectIdentifierOrKeywordOrString();
              operatorFound = this.optionalOperator('-');
              if (operatorFound) {
                result += '-';
              }
            } while (operatorFound);
            return result.toString();
          },
          parseTemplateBindings: function() {
            var bindings = [];
            var prefix = null;
            while (this.index < this.tokens.length) {
              var keyIsVar = this.optionalKeywordVar();
              var key = this.expectTemplateBindingKey();
              if (!keyIsVar) {
                if (prefix == null) {
                  prefix = key;
                } else {
                  key = prefix + '-' + key;
                }
              }
              this.optionalCharacter($COLON);
              var name = null;
              var expression = null;
              if (keyIsVar) {
                if (this.optionalOperator("=")) {
                  name = this.expectTemplateBindingKey();
                } else {
                  name = '\$implicit';
                }
              } else if (this.next !== EOF && !this.peekKeywordVar()) {
                var start = this.inputIndex;
                var ast = this.parsePipe();
                var source = this.input.substring(start, this.inputIndex);
                expression = new ASTWithSource(ast, source, this.location);
              }
              bindings.push(new TemplateBinding(key, keyIsVar, name, expression));
              if (!this.optionalCharacter($SEMICOLON)) {
                this.optionalCharacter($COMMA);
              }
            }
            return bindings;
          },
          error: function(message) {
            var index = arguments[1] !== (void 0) ? arguments[1] : null;
            if (isBlank(index))
              index = this.index;
            var location = (index < this.tokens.length) ? ("at column " + (this.tokens[index].index + 1) + " in") : "at the end of the expression";
            throw new BaseException(("Parser Error: " + message + " " + location + " [" + this.input + "] in " + this.location));
          }
        }, {});
      }());
      SimpleExpressionChecker = (function() {
        function SimpleExpressionChecker() {
          this.simple = true;
        }
        return ($traceurRuntime.createClass)(SimpleExpressionChecker, {
          visitImplicitReceiver: function(ast) {},
          visitInterpolation: function(ast) {
            this.simple = false;
          },
          visitLiteralPrimitive: function(ast) {},
          visitAccessMember: function(ast) {},
          visitSafeAccessMember: function(ast) {
            this.simple = false;
          },
          visitMethodCall: function(ast) {
            this.simple = false;
          },
          visitSafeMethodCall: function(ast) {
            this.simple = false;
          },
          visitFunctionCall: function(ast) {
            this.simple = false;
          },
          visitLiteralArray: function(ast) {
            this.visitAll(ast.expressions);
          },
          visitLiteralMap: function(ast) {
            this.visitAll(ast.values);
          },
          visitBinary: function(ast) {
            this.simple = false;
          },
          visitPrefixNot: function(ast) {
            this.simple = false;
          },
          visitConditional: function(ast) {
            this.simple = false;
          },
          visitPipe: function(ast) {
            this.simple = false;
          },
          visitKeyedAccess: function(ast) {
            this.simple = false;
          },
          visitAll: function(asts) {
            var res = ListWrapper.createFixedSize(asts.length);
            for (var i = 0; i < asts.length; ++i) {
              res[i] = asts[i].visit(this);
            }
            return res;
          },
          visitChain: function(ast) {
            this.simple = false;
          },
          visitAssignment: function(ast) {
            this.simple = false;
          },
          visitIf: function(ast) {
            this.simple = false;
          }
        }, {check: function(ast) {
            var s = new SimpleExpressionChecker();
            ast.visit(s);
            return s.simple;
          }});
      }());
    }
  };
});

System.register("angular2/src/change_detection/dynamic_change_detector", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/abstract_change_detector", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/proto_record", "angular2/src/change_detection/exceptions"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/dynamic_change_detector";
  var isPresent,
      isBlank,
      BaseException,
      FunctionWrapper,
      ListWrapper,
      AbstractChangeDetector,
      ChangeDetectionUtil,
      uninitialized,
      RecordType,
      ChangeDetectionError,
      DynamicChangeDetector;
  function isSame(a, b) {
    if (a === b)
      return true;
    if (a instanceof String && b instanceof String && a == b)
      return true;
    if ((a !== a) && (b !== b))
      return true;
    return false;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      FunctionWrapper = $__m.FunctionWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      AbstractChangeDetector = $__m.AbstractChangeDetector;
    }, function($__m) {
      ChangeDetectionUtil = $__m.ChangeDetectionUtil;
      uninitialized = $__m.uninitialized;
    }, function($__m) {
      RecordType = $__m.RecordType;
    }, function($__m) {
      ChangeDetectionError = $__m.ChangeDetectionError;
    }],
    execute: function() {
      DynamicChangeDetector = (function($__super) {
        function DynamicChangeDetector(id, changeControlStrategy, dispatcher, pipeRegistry, protos, directiveRecords) {
          $traceurRuntime.superConstructor(DynamicChangeDetector).call(this, id);
          this.changeControlStrategy = changeControlStrategy;
          this.dispatcher = dispatcher;
          this.pipeRegistry = pipeRegistry;
          this.protos = protos;
          this.directiveRecords = directiveRecords;
          this.locals = null;
          this.directives = null;
          this.alreadyChecked = false;
          this.values = ListWrapper.createFixedSize(protos.length + 1);
          this.pipes = ListWrapper.createFixedSize(protos.length + 1);
          this.prevContexts = ListWrapper.createFixedSize(protos.length + 1);
          this.changes = ListWrapper.createFixedSize(protos.length + 1);
          this.values[0] = null;
          ListWrapper.fill(this.values, uninitialized, 1);
          ListWrapper.fill(this.pipes, null);
          ListWrapper.fill(this.prevContexts, uninitialized);
          ListWrapper.fill(this.changes, false);
        }
        return ($traceurRuntime.createClass)(DynamicChangeDetector, {
          hydrate: function(context, locals, directives) {
            this.mode = ChangeDetectionUtil.changeDetectionMode(this.changeControlStrategy);
            this.values[0] = context;
            this.locals = locals;
            this.directives = directives;
            this.alreadyChecked = false;
          },
          dehydrate: function() {
            this._destroyPipes();
            this.values[0] = null;
            ListWrapper.fill(this.values, uninitialized, 1);
            ListWrapper.fill(this.changes, false);
            ListWrapper.fill(this.pipes, null);
            ListWrapper.fill(this.prevContexts, uninitialized);
            this.locals = null;
          },
          _destroyPipes: function() {
            for (var i = 0; i < this.pipes.length; ++i) {
              if (isPresent(this.pipes[i])) {
                this.pipes[i].onDestroy();
              }
            }
          },
          hydrated: function() {
            return this.values[0] !== null;
          },
          detectChangesInRecords: function(throwOnChange) {
            if (!this.hydrated()) {
              ChangeDetectionUtil.throwDehydrated();
            }
            var protos = this.protos;
            var changes = null;
            var isChanged = false;
            for (var i = 0; i < protos.length; ++i) {
              var proto = protos[i];
              var bindingRecord = proto.bindingRecord;
              var directiveRecord = bindingRecord.directiveRecord;
              if (proto.isLifeCycleRecord()) {
                if (proto.name === "onCheck" && !throwOnChange) {
                  this._getDirectiveFor(directiveRecord.directiveIndex).onCheck();
                } else if (proto.name === "onInit" && !throwOnChange && !this.alreadyChecked) {
                  this._getDirectiveFor(directiveRecord.directiveIndex).onInit();
                } else if (proto.name === "onChange" && isPresent(changes) && !throwOnChange) {
                  this._getDirectiveFor(directiveRecord.directiveIndex).onChange(changes);
                }
              } else {
                var change = this._check(proto, throwOnChange);
                if (isPresent(change)) {
                  this._updateDirectiveOrElement(change, bindingRecord);
                  isChanged = true;
                  changes = this._addChange(bindingRecord, change, changes);
                }
              }
              if (proto.lastInDirective) {
                changes = null;
                if (isChanged && bindingRecord.isOnPushChangeDetection()) {
                  this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
                }
                isChanged = false;
              }
            }
            this.alreadyChecked = true;
          },
          callOnAllChangesDone: function() {
            this.dispatcher.notifyOnAllChangesDone();
            var dirs = this.directiveRecords;
            for (var i = dirs.length - 1; i >= 0; --i) {
              var dir = dirs[i];
              if (dir.callOnAllChangesDone) {
                this._getDirectiveFor(dir.directiveIndex).onAllChangesDone();
              }
            }
          },
          _updateDirectiveOrElement: function(change, bindingRecord) {
            if (isBlank(bindingRecord.directiveRecord)) {
              this.dispatcher.notifyOnBinding(bindingRecord, change.currentValue);
            } else {
              var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
              bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
            }
          },
          _addChange: function(bindingRecord, change, changes) {
            if (bindingRecord.callOnChange()) {
              return ChangeDetectionUtil.addChange(changes, bindingRecord.propertyName, change);
            } else {
              return changes;
            }
          },
          _getDirectiveFor: function(directiveIndex) {
            return this.directives.getDirectiveFor(directiveIndex);
          },
          _getDetectorFor: function(directiveIndex) {
            return this.directives.getDetectorFor(directiveIndex);
          },
          _check: function(proto, throwOnChange) {
            try {
              if (proto.isPipeRecord()) {
                return this._pipeCheck(proto, throwOnChange);
              } else {
                return this._referenceCheck(proto, throwOnChange);
              }
            } catch (e) {
              throw new ChangeDetectionError(proto, e);
            }
          },
          _referenceCheck: function(proto, throwOnChange) {
            if (this._pureFuncAndArgsDidNotChange(proto)) {
              this._setChanged(proto, false);
              return null;
            }
            var prevValue = this._readSelf(proto);
            var currValue = this._calculateCurrValue(proto);
            if (!isSame(prevValue, currValue)) {
              if (proto.lastInBinding) {
                var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
                if (throwOnChange)
                  ChangeDetectionUtil.throwOnChange(proto, change);
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return change;
              } else {
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return null;
              }
            } else {
              this._setChanged(proto, false);
              return null;
            }
          },
          _calculateCurrValue: function(proto) {
            switch (proto.mode) {
              case RecordType.SELF:
                return this._readContext(proto);
              case RecordType.CONST:
                return proto.funcOrValue;
              case RecordType.PROPERTY:
                var context = this._readContext(proto);
                return proto.funcOrValue(context);
              case RecordType.SAFE_PROPERTY:
                var context = this._readContext(proto);
                return isBlank(context) ? null : proto.funcOrValue(context);
              case RecordType.LOCAL:
                return this.locals.get(proto.name);
              case RecordType.INVOKE_METHOD:
                var context = this._readContext(proto);
                var args = this._readArgs(proto);
                return proto.funcOrValue(context, args);
              case RecordType.SAFE_INVOKE_METHOD:
                var context = this._readContext(proto);
                if (isBlank(context)) {
                  return null;
                }
                var args = this._readArgs(proto);
                return proto.funcOrValue(context, args);
              case RecordType.KEYED_ACCESS:
                var arg = this._readArgs(proto)[0];
                return this._readContext(proto)[arg];
              case RecordType.INVOKE_CLOSURE:
                return FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));
              case RecordType.INTERPOLATE:
              case RecordType.PRIMITIVE_OP:
                return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto));
              default:
                throw new BaseException(("Unknown operation " + proto.mode));
            }
          },
          _pipeCheck: function(proto, throwOnChange) {
            var context = this._readContext(proto);
            var args = this._readArgs(proto);
            var pipe = this._pipeFor(proto, context);
            var prevValue = this._readSelf(proto);
            var currValue = pipe.transform(context, args);
            if (!isSame(prevValue, currValue)) {
              currValue = ChangeDetectionUtil.unwrapValue(currValue);
              if (proto.lastInBinding) {
                var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
                if (throwOnChange)
                  ChangeDetectionUtil.throwOnChange(proto, change);
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return change;
              } else {
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return null;
              }
            } else {
              this._setChanged(proto, false);
              return null;
            }
          },
          _pipeFor: function(proto, context) {
            var storedPipe = this._readPipe(proto);
            if (isPresent(storedPipe) && storedPipe.supports(context)) {
              return storedPipe;
            }
            if (isPresent(storedPipe)) {
              storedPipe.onDestroy();
            }
            var pipe = this.pipeRegistry.get(proto.name, context, this.ref);
            this._writePipe(proto, pipe);
            return pipe;
          },
          _readContext: function(proto) {
            if (proto.contextIndex == -1) {
              return this._getDirectiveFor(proto.directiveIndex);
            } else {
              return this.values[proto.contextIndex];
            }
            return this.values[proto.contextIndex];
          },
          _readSelf: function(proto) {
            return this.values[proto.selfIndex];
          },
          _writeSelf: function(proto, value) {
            this.values[proto.selfIndex] = value;
          },
          _readPipe: function(proto) {
            return this.pipes[proto.selfIndex];
          },
          _writePipe: function(proto, value) {
            this.pipes[proto.selfIndex] = value;
          },
          _setChanged: function(proto, value) {
            this.changes[proto.selfIndex] = value;
          },
          _pureFuncAndArgsDidNotChange: function(proto) {
            return proto.isPureFunction() && !this._argsChanged(proto);
          },
          _argsChanged: function(proto) {
            var args = proto.args;
            for (var i = 0; i < args.length; ++i) {
              if (this.changes[args[i]]) {
                return true;
              }
            }
            return false;
          },
          _readArgs: function(proto) {
            var res = ListWrapper.createFixedSize(proto.args.length);
            var args = proto.args;
            for (var i = 0; i < args.length; ++i) {
              res[i] = this.values[args[i]];
            }
            return res;
          }
        }, {}, $__super);
      }(AbstractChangeDetector));
      $__export("DynamicChangeDetector", DynamicChangeDetector);
    }
  };
});

System.register("angular2/src/change_detection/pipes/observable_pipe", ["angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/observable_pipe";
  var __decorate,
      __metadata,
      ObservableWrapper,
      isBlank,
      isPresent,
      CONST,
      WrappedValue,
      ObservablePipe,
      ObservablePipeFactory;
  return {
    setters: [function($__m) {
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      CONST = $__m.CONST;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ObservablePipe = (function() {
        function ObservablePipe(_ref) {
          this._ref = _ref;
          this._latestValue = null;
          this._latestReturnedValue = null;
          this._subscription = null;
          this._observable = null;
        }
        return ($traceurRuntime.createClass)(ObservablePipe, {
          supports: function(obs) {
            return ObservableWrapper.isObservable(obs);
          },
          onDestroy: function() {
            if (isPresent(this._subscription)) {
              this._dispose();
            }
          },
          transform: function(obs) {
            var args = arguments[1] !== (void 0) ? arguments[1] : null;
            if (isBlank(this._subscription)) {
              this._subscribe(obs);
              return null;
            }
            if (obs !== this._observable) {
              this._dispose();
              return this.transform(obs);
            }
            if (this._latestValue === this._latestReturnedValue) {
              return this._latestReturnedValue;
            } else {
              this._latestReturnedValue = this._latestValue;
              return WrappedValue.wrap(this._latestValue);
            }
          },
          _subscribe: function(obs) {
            var $__0 = this;
            this._observable = obs;
            this._subscription = ObservableWrapper.subscribe(obs, (function(value) {
              $__0._updateLatestValue(value);
            }), (function(e) {
              throw e;
            }));
          },
          _dispose: function() {
            ObservableWrapper.dispose(this._subscription);
            this._latestValue = null;
            this._latestReturnedValue = null;
            this._subscription = null;
            this._observable = null;
          },
          _updateLatestValue: function(value) {
            this._latestValue = value;
            this._ref.requestCheck();
          }
        }, {});
      }());
      $__export("ObservablePipe", ObservablePipe);
      ObservablePipeFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obs) {
          return ObservableWrapper.isObservable(obs);
        },
        create: function(cdRef) {
          return new ObservablePipe(cdRef);
        }
      }, {}));
      $__export("ObservablePipeFactory", ObservablePipeFactory);
      $__export("ObservablePipeFactory", ObservablePipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], ObservablePipeFactory));
    }
  };
});

System.register("angular2/src/di/binding", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/reflection/reflection", "angular2/src/di/key", "angular2/src/di/annotations_impl", "angular2/src/di/exceptions", "angular2/src/di/forward_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/binding";
  var __decorate,
      __metadata,
      Type,
      isBlank,
      isPresent,
      CONST,
      CONST_EXPR,
      BaseException,
      stringify,
      isArray,
      ListWrapper,
      reflector,
      Key,
      Inject,
      Injectable,
      Visibility,
      Optional,
      unbounded,
      DependencyAnnotation,
      NoAnnotationError,
      resolveForwardRef,
      Dependency,
      _EMPTY_LIST,
      Binding,
      ResolvedBinding,
      BindingBuilder;
  function bind(token) {
    return new BindingBuilder(token);
  }
  function _constructDependencies(factoryFunction, dependencies) {
    if (isBlank(dependencies)) {
      return _dependenciesFor(factoryFunction);
    } else {
      var params = ListWrapper.map(dependencies, (function(t) {
        return [t];
      }));
      return ListWrapper.map(dependencies, (function(t) {
        return _extractToken(factoryFunction, t, params);
      }));
    }
  }
  function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (isBlank(params))
      return [];
    if (ListWrapper.any(params, (function(p) {
      return isBlank(p);
    }))) {
      throw new NoAnnotationError(typeOrFunc, params);
    }
    return ListWrapper.map(params, (function(p) {
      return _extractToken(typeOrFunc, p, params);
    }));
  }
  function _extractToken(typeOrFunc, annotations, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!isArray(annotations)) {
      return _createDependency(annotations, optional, _defaulVisiblity(annotations), depProps);
    }
    var visibility = null;
    var defaultVisibility = unbounded;
    for (var i = 0; i < annotations.length; ++i) {
      var paramAnnotation = annotations[i];
      if (paramAnnotation instanceof Type) {
        token = paramAnnotation;
        defaultVisibility = _defaulVisiblity(token);
      } else if (paramAnnotation instanceof Inject) {
        token = paramAnnotation.token;
      } else if (paramAnnotation instanceof Optional) {
        optional = true;
      } else if (paramAnnotation instanceof Visibility) {
        visibility = paramAnnotation;
      } else if (paramAnnotation instanceof DependencyAnnotation) {
        if (isPresent(paramAnnotation.token)) {
          token = paramAnnotation.token;
        }
        depProps.push(paramAnnotation);
      }
    }
    if (isBlank(visibility)) {
      visibility = defaultVisibility;
    }
    token = resolveForwardRef(token);
    if (isPresent(token)) {
      return _createDependency(token, optional, visibility, depProps);
    } else {
      throw new NoAnnotationError(typeOrFunc, params);
    }
  }
  function _defaulVisiblity(typeOrFunc) {
    try {
      if (!(typeOrFunc instanceof Type))
        return unbounded;
      var f = ListWrapper.filter(reflector.annotations(typeOrFunc), (function(s) {
        return s instanceof Injectable;
      }));
      return f.length === 0 ? unbounded : f[0].visibility;
    } catch (e) {
      return unbounded;
    }
  }
  function _createDependency(token, optional, visibility, depProps) {
    return new Dependency(Key.get(token), optional, visibility, depProps);
  }
  $__export("bind", bind);
  return {
    setters: [function($__m) {
      Type = $__m.Type;
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      CONST = $__m.CONST;
      CONST_EXPR = $__m.CONST_EXPR;
      BaseException = $__m.BaseException;
      stringify = $__m.stringify;
      isArray = $__m.isArray;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      Key = $__m.Key;
    }, function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      Visibility = $__m.Visibility;
      Optional = $__m.Optional;
      unbounded = $__m.unbounded;
      DependencyAnnotation = $__m.DependencyAnnotation;
    }, function($__m) {
      NoAnnotationError = $__m.NoAnnotationError;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Dependency = (function() {
        function Dependency(key, optional, visibility, properties) {
          this.key = key;
          this.optional = optional;
          this.visibility = visibility;
          this.properties = properties;
        }
        return ($traceurRuntime.createClass)(Dependency, {}, {fromKey: function(key) {
            return new Dependency(key, false, _defaulVisiblity(key.token), []);
          }});
      }());
      $__export("Dependency", Dependency);
      _EMPTY_LIST = CONST_EXPR([]);
      Binding = (($traceurRuntime.createClass)(function(token, $__3) {
        var $__4 = $__3,
            toClass = $__4.toClass,
            toValue = $__4.toValue,
            toAlias = $__4.toAlias,
            toFactory = $__4.toFactory,
            deps = $__4.deps;
        this.token = token;
        this.toClass = toClass;
        this.toValue = toValue;
        this.toAlias = toAlias;
        this.toFactory = toFactory;
        this.dependencies = deps;
      }, {resolve: function() {
          var $__0 = this;
          var factoryFn;
          var resolvedDeps;
          if (isPresent(this.toClass)) {
            var toClass = resolveForwardRef(this.toClass);
            factoryFn = reflector.factory(toClass);
            resolvedDeps = _dependenciesFor(toClass);
          } else if (isPresent(this.toAlias)) {
            factoryFn = (function(aliasInstance) {
              return aliasInstance;
            });
            resolvedDeps = [Dependency.fromKey(Key.get(this.toAlias))];
          } else if (isPresent(this.toFactory)) {
            factoryFn = this.toFactory;
            resolvedDeps = _constructDependencies(this.toFactory, this.dependencies);
          } else {
            factoryFn = (function() {
              return $__0.toValue;
            });
            resolvedDeps = _EMPTY_LIST;
          }
          return new ResolvedBinding(Key.get(this.token), factoryFn, resolvedDeps);
        }}, {}));
      $__export("Binding", Binding);
      $__export("Binding", Binding = __decorate([CONST(), __metadata('design:paramtypes', [Object, Object])], Binding));
      ResolvedBinding = (function() {
        function ResolvedBinding(key, factory, dependencies) {
          this.key = key;
          this.factory = factory;
          this.dependencies = dependencies;
        }
        return ($traceurRuntime.createClass)(ResolvedBinding, {}, {});
      }());
      $__export("ResolvedBinding", ResolvedBinding);
      BindingBuilder = (function() {
        function BindingBuilder(token) {
          this.token = token;
        }
        return ($traceurRuntime.createClass)(BindingBuilder, {
          toClass: function(type) {
            return new Binding(this.token, {toClass: type});
          },
          toValue: function(value) {
            return new Binding(this.token, {toValue: value});
          },
          toAlias: function(aliasToken) {
            if (isBlank(aliasToken)) {
              throw new BaseException(("Can not alias " + stringify(this.token) + " to a blank value!"));
            }
            return new Binding(this.token, {toAlias: aliasToken});
          },
          toFactory: function(factoryFunction, dependencies) {
            return new Binding(this.token, {
              toFactory: factoryFunction,
              deps: dependencies
            });
          }
        }, {});
      }());
      $__export("BindingBuilder", BindingBuilder);
    }
  };
});

System.register("angular2/src/core/compiler/view_manager_utils", ["angular2/di", "angular2/src/facade/collection", "angular2/src/core/compiler/element_injector", "angular2/src/facade/lang", "angular2/src/core/compiler/view"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_manager_utils";
  var __decorate,
      __metadata,
      Injector,
      Injectable,
      ListWrapper,
      MapWrapper,
      eli,
      isPresent,
      isBlank,
      viewModule,
      AppViewManagerUtils;
  return {
    setters: [function($__m) {
      Injector = $__m.Injector;
      Injectable = $__m.Injectable;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      eli = $__m;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      viewModule = $__m;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      AppViewManagerUtils = (($traceurRuntime.createClass)(function() {}, {
        getComponentInstance: function(parentView, boundElementIndex) {
          var eli = parentView.elementInjectors[boundElementIndex];
          return eli.getComponent();
        },
        createView: function(protoView, renderView, viewManager, renderer) {
          var view = new viewModule.AppView(renderer, protoView, protoView.protoLocals);
          view.render = renderView;
          var changeDetector = protoView.protoChangeDetector.instantiate(view);
          var binders = protoView.elementBinders;
          var elementInjectors = ListWrapper.createFixedSize(binders.length);
          var rootElementInjectors = [];
          var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
          var componentChildViews = ListWrapper.createFixedSize(binders.length);
          for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
            var binder = binders[binderIdx];
            var elementInjector = null;
            var protoElementInjector = binder.protoElementInjector;
            if (isPresent(protoElementInjector)) {
              if (isPresent(protoElementInjector.parent)) {
                var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
                elementInjector = protoElementInjector.instantiate(parentElementInjector);
              } else {
                elementInjector = protoElementInjector.instantiate(null);
                rootElementInjectors.push(elementInjector);
              }
            }
            elementInjectors[binderIdx] = elementInjector;
            if (isPresent(elementInjector)) {
              var embeddedProtoView = binder.hasEmbeddedProtoView() ? binder.nestedProtoView : null;
              preBuiltObjects[binderIdx] = new eli.PreBuiltObjects(viewManager, view, embeddedProtoView);
            }
          }
          view.init(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, componentChildViews);
          return view;
        },
        attachComponentView: function(hostView, boundElementIndex, componentView) {
          var childChangeDetector = componentView.changeDetector;
          hostView.changeDetector.addShadowDomChild(childChangeDetector);
          hostView.componentChildViews[boundElementIndex] = componentView;
        },
        detachComponentView: function(hostView, boundElementIndex) {
          var componentView = hostView.componentChildViews[boundElementIndex];
          hostView.changeDetector.removeShadowDomChild(componentView.changeDetector);
          hostView.componentChildViews[boundElementIndex] = null;
        },
        hydrateComponentView: function(hostView, boundElementIndex) {
          var elementInjector = hostView.elementInjectors[boundElementIndex];
          var componentView = hostView.componentChildViews[boundElementIndex];
          var component = this.getComponentInstance(hostView, boundElementIndex);
          this._hydrateView(componentView, null, elementInjector, component, null);
        },
        hydrateRootHostView: function(hostView, injector) {
          this._hydrateView(hostView, injector, null, new Object(), null);
        },
        attachViewInContainer: function(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, view) {
          if (isBlank(contextView)) {
            contextView = parentView;
            contextBoundElementIndex = boundElementIndex;
          }
          parentView.changeDetector.addChild(view.changeDetector);
          var viewContainer = this._getOrCreateViewContainer(parentView, boundElementIndex);
          ListWrapper.insert(viewContainer.views, atIndex, view);
          var sibling;
          if (atIndex == 0) {
            sibling = null;
          } else {
            sibling = ListWrapper.last(viewContainer.views[atIndex - 1].rootElementInjectors);
          }
          var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
          for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
            if (isPresent(elementInjector.parent)) {
              view.rootElementInjectors[i].linkAfter(elementInjector.parent, sibling);
            } else {
              contextView.rootElementInjectors.push(view.rootElementInjectors[i]);
            }
          }
        },
        detachViewInContainer: function(parentView, boundElementIndex, atIndex) {
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          view.changeDetector.remove();
          ListWrapper.removeAt(viewContainer.views, atIndex);
          for (var i = 0; i < view.rootElementInjectors.length; ++i) {
            var inj = view.rootElementInjectors[i];
            if (isPresent(inj.parent)) {
              inj.unlink();
            } else {
              var removeIdx = ListWrapper.indexOf(parentView.rootElementInjectors, inj);
              ListWrapper.removeAt(parentView.rootElementInjectors, removeIdx);
            }
          }
        },
        hydrateViewInContainer: function(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, bindings) {
          if (isBlank(contextView)) {
            contextView = parentView;
            contextBoundElementIndex = boundElementIndex;
          }
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
          var injector = isPresent(bindings) ? Injector.fromResolvedBindings(bindings) : null;
          this._hydrateView(view, injector, elementInjector.getHost(), contextView.context, contextView.locals);
        },
        _hydrateView: function(view, injector, hostElementInjector, context, parentLocals) {
          view.context = context;
          view.locals.parent = parentLocals;
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; ++i) {
            var elementInjector = view.elementInjectors[i];
            if (isPresent(elementInjector)) {
              elementInjector.hydrate(injector, hostElementInjector, view.preBuiltObjects[i]);
              this._populateViewLocals(view, elementInjector);
              this._setUpEventEmitters(view, elementInjector, i);
              this._setUpHostActions(view, elementInjector, i);
            }
          }
          view.changeDetector.hydrate(view.context, view.locals, view);
        },
        _populateViewLocals: function(view, elementInjector) {
          if (isPresent(elementInjector.getDirectiveVariableBindings())) {
            MapWrapper.forEach(elementInjector.getDirectiveVariableBindings(), (function(directiveIndex, name) {
              if (isBlank(directiveIndex)) {
                view.locals.set(name, elementInjector.getElementRef().nativeElement);
              } else {
                view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
              }
            }));
          }
        },
        _getOrCreateViewContainer: function(parentView, boundElementIndex) {
          var viewContainer = parentView.viewContainers[boundElementIndex];
          if (isBlank(viewContainer)) {
            viewContainer = new viewModule.AppViewContainer();
            parentView.viewContainers[boundElementIndex] = viewContainer;
          }
          return viewContainer;
        },
        _setUpEventEmitters: function(view, elementInjector, boundElementIndex) {
          var emitters = elementInjector.getEventEmitterAccessors();
          for (var directiveIndex = 0; directiveIndex < emitters.length; ++directiveIndex) {
            var directiveEmitters = emitters[directiveIndex];
            var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
            for (var eventIndex = 0; eventIndex < directiveEmitters.length; ++eventIndex) {
              var eventEmitterAccessor = directiveEmitters[eventIndex];
              eventEmitterAccessor.subscribe(view, boundElementIndex, directive);
            }
          }
        },
        _setUpHostActions: function(view, elementInjector, boundElementIndex) {
          var hostActions = elementInjector.getHostActionAccessors();
          for (var directiveIndex = 0; directiveIndex < hostActions.length; ++directiveIndex) {
            var directiveHostActions = hostActions[directiveIndex];
            var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
            for (var index = 0; index < directiveHostActions.length; ++index) {
              var hostActionAccessor = directiveHostActions[index];
              hostActionAccessor.subscribe(view, boundElementIndex, directive);
            }
          }
        },
        dehydrateView: function(view) {
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; ++i) {
            var elementInjector = view.elementInjectors[i];
            if (isPresent(elementInjector)) {
              elementInjector.dehydrate();
            }
          }
          if (isPresent(view.locals)) {
            view.locals.clearValues();
          }
          view.context = null;
          view.changeDetector.dehydrate();
        }
      }, {}));
      $__export("AppViewManagerUtils", AppViewManagerUtils);
      $__export("AppViewManagerUtils", AppViewManagerUtils = __decorate([Injectable(), __metadata('design:paramtypes', [])], AppViewManagerUtils));
    }
  };
});

System.register("angular2/src/render/dom/compiler/view_loader", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/dom/dom_adapter", "angular2/src/render/xhr", "angular2/src/render/dom/compiler/style_inliner", "angular2/src/render/dom/compiler/style_url_resolver"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/view_loader";
  var __decorate,
      __metadata,
      Injectable,
      isBlank,
      isPresent,
      BaseException,
      isPromise,
      Map,
      ListWrapper,
      PromiseWrapper,
      DOM,
      XHR,
      StyleInliner,
      StyleUrlResolver,
      ViewLoader;
  function _insertCssTexts(element, cssTexts) {
    if (cssTexts.length == 0)
      return ;
    var insertBefore = DOM.firstChild(element);
    for (var i = cssTexts.length - 1; i >= 0; i--) {
      var styleEl = DOM.createStyleElement(cssTexts[i]);
      if (isPresent(insertBefore)) {
        DOM.insertBefore(insertBefore, styleEl);
      } else {
        DOM.appendChild(element, styleEl);
      }
      insertBefore = styleEl;
    }
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      isPromise = $__m.isPromise;
    }, function($__m) {
      Map = $__m.Map;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      XHR = $__m.XHR;
    }, function($__m) {
      StyleInliner = $__m.StyleInliner;
    }, function($__m) {
      StyleUrlResolver = $__m.StyleUrlResolver;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ViewLoader = (($traceurRuntime.createClass)(function(_xhr, _styleInliner, _styleUrlResolver) {
        this._xhr = _xhr;
        this._styleInliner = _styleInliner;
        this._styleUrlResolver = _styleUrlResolver;
        this._cache = new Map();
      }, {
        load: function(view) {
          var $__0 = this;
          var tplElAndStyles = [this._loadHtml(view)];
          if (isPresent(view.styles)) {
            view.styles.forEach((function(cssText) {
              var textOrPromise = $__0._resolveAndInlineCssText(cssText, view.templateAbsUrl);
              tplElAndStyles.push(textOrPromise);
            }));
          }
          if (isPresent(view.styleAbsUrls)) {
            view.styleAbsUrls.forEach((function(url) {
              var promise = $__0._loadText(url).then((function(cssText) {
                return $__0._resolveAndInlineCssText(cssText, view.templateAbsUrl);
              }));
              tplElAndStyles.push(promise);
            }));
          }
          return PromiseWrapper.all(tplElAndStyles).then((function(res) {
            var tplEl = res[0];
            var cssTexts = ListWrapper.slice(res, 1);
            _insertCssTexts(DOM.content(tplEl), cssTexts);
            return tplEl;
          }));
        },
        _loadText: function(url) {
          var response = this._cache.get(url);
          if (isBlank(response)) {
            response = PromiseWrapper.catchError(this._xhr.get(url), (function(_) {
              return PromiseWrapper.reject(new BaseException(("Failed to fetch url \"" + url + "\"")), null);
            }));
            this._cache.set(url, response);
          }
          return response;
        },
        _loadHtml: function(view) {
          var $__0 = this;
          var html;
          if (isPresent(view.template)) {
            html = PromiseWrapper.resolve(view.template);
          } else if (isPresent(view.templateAbsUrl)) {
            html = this._loadText(view.templateAbsUrl);
          } else {
            throw new BaseException('View should have either the templateUrl or template property set');
          }
          return html.then((function(html) {
            var tplEl = DOM.createTemplate(html);
            var styleEls = DOM.querySelectorAll(DOM.content(tplEl), 'STYLE');
            var promises = [];
            for (var i = 0; i < styleEls.length; i++) {
              var promise = $__0._resolveAndInlineElement(styleEls[i], view.templateAbsUrl);
              if (isPromise(promise)) {
                promises.push(promise);
              }
            }
            return promises.length > 0 ? PromiseWrapper.all(promises).then((function(_) {
              return tplEl;
            })) : tplEl;
          }));
        },
        _resolveAndInlineElement: function(styleEl, baseUrl) {
          var textOrPromise = this._resolveAndInlineCssText(DOM.getText(styleEl), baseUrl);
          if (isPromise(textOrPromise)) {
            return textOrPromise.then((function(css) {
              DOM.setText(styleEl, css);
            }));
          } else {
            DOM.setText(styleEl, textOrPromise);
            return null;
          }
        },
        _resolveAndInlineCssText: function(cssText, baseUrl) {
          cssText = this._styleUrlResolver.resolveUrls(cssText, baseUrl);
          return this._styleInliner.inlineImports(cssText, baseUrl);
        }
      }, {}));
      $__export("ViewLoader", ViewLoader);
      $__export("ViewLoader", ViewLoader = __decorate([Injectable(), __metadata('design:paramtypes', [XHR, StyleInliner, StyleUrlResolver])], ViewLoader));
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy", ["angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/light_dom", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy";
  var DOM,
      LightDom,
      ShadowDomStrategy,
      insertSharedStyleText,
      EmulatedUnscopedShadowDomStrategy;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      LightDom = $__m.LightDom;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }, function($__m) {
      insertSharedStyleText = $__m.insertSharedStyleText;
    }],
    execute: function() {
      EmulatedUnscopedShadowDomStrategy = (function($__super) {
        function EmulatedUnscopedShadowDomStrategy(styleHost) {
          $traceurRuntime.superConstructor(EmulatedUnscopedShadowDomStrategy).call(this);
          this.styleHost = styleHost;
        }
        return ($traceurRuntime.createClass)(EmulatedUnscopedShadowDomStrategy, {
          hasNativeContentElement: function() {
            return false;
          },
          prepareShadowRoot: function(el) {
            return el;
          },
          constructLightDom: function(lightDomView, el) {
            return new LightDom(lightDomView, el);
          },
          processStyleElement: function(hostComponentId, templateUrl, styleEl) {
            var cssText = DOM.getText(styleEl);
            insertSharedStyleText(cssText, this.styleHost, styleEl);
          }
        }, {}, $__super);
      }(ShadowDomStrategy));
      $__export("EmulatedUnscopedShadowDomStrategy", EmulatedUnscopedShadowDomStrategy);
    }
  };
});

System.register("angular2/src/render/dom/dom_renderer", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/content_tag", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/events/event_manager", "angular2/src/render/dom/view/proto_view", "angular2/src/render/dom/view/view", "angular2/src/render/dom/view/element", "angular2/src/render/dom/view/view_container", "angular2/src/render/dom/util", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/dom_renderer";
  var __decorate,
      __metadata,
      __param,
      Inject,
      Injectable,
      OpaqueToken,
      isPresent,
      isBlank,
      BaseException,
      CONST_EXPR,
      ListWrapper,
      DOM,
      Content,
      ShadowDomStrategy,
      EventManager,
      resolveInternalDomProtoView,
      DomView,
      DomViewRef,
      resolveInternalDomView,
      DomElement,
      DomViewContainer,
      NG_BINDING_CLASS_SELECTOR,
      NG_BINDING_CLASS,
      Renderer,
      DOCUMENT_TOKEN,
      DomRenderer;
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      OpaqueToken = $__m.OpaqueToken;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      Content = $__m.Content;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }, function($__m) {
      EventManager = $__m.EventManager;
    }, function($__m) {
      resolveInternalDomProtoView = $__m.resolveInternalDomProtoView;
    }, function($__m) {
      DomView = $__m.DomView;
      DomViewRef = $__m.DomViewRef;
      resolveInternalDomView = $__m.resolveInternalDomView;
    }, function($__m) {
      DomElement = $__m.DomElement;
    }, function($__m) {
      DomViewContainer = $__m.DomViewContainer;
    }, function($__m) {
      NG_BINDING_CLASS_SELECTOR = $__m.NG_BINDING_CLASS_SELECTOR;
      NG_BINDING_CLASS = $__m.NG_BINDING_CLASS;
    }, function($__m) {
      Renderer = $__m.Renderer;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      DOCUMENT_TOKEN = CONST_EXPR(new OpaqueToken('DocumentToken'));
      $__export("DOCUMENT_TOKEN", DOCUMENT_TOKEN);
      DomRenderer = (function($__super) {
        function $__0(_eventManager, _shadowDomStrategy, document) {
          $traceurRuntime.superConstructor($__0).call(this);
          this._eventManager = _eventManager;
          this._shadowDomStrategy = _shadowDomStrategy;
          this._document = document;
        }
        return ($traceurRuntime.createClass)($__0, {
          createRootHostView: function(hostProtoViewRef, hostElementSelector) {
            var hostProtoView = resolveInternalDomProtoView(hostProtoViewRef);
            var element = DOM.querySelector(this._document, hostElementSelector);
            if (isBlank(element)) {
              throw new BaseException(("The selector \"" + hostElementSelector + "\" did not match any elements"));
            }
            return new DomViewRef(this._createView(hostProtoView, element));
          },
          createView: function(protoViewRef) {
            var protoView = resolveInternalDomProtoView(protoViewRef);
            return new DomViewRef(this._createView(protoView, null));
          },
          destroyView: function(view) {},
          getNativeElementSync: function(location) {
            return resolveInternalDomView(location.renderView).boundElements[location.boundElementIndex].element;
          },
          attachComponentView: function(location, componentViewRef) {
            var hostView = resolveInternalDomView(location.renderView);
            var componentView = resolveInternalDomView(componentViewRef);
            var element = hostView.boundElements[location.boundElementIndex].element;
            var lightDom = hostView.boundElements[location.boundElementIndex].lightDom;
            if (isPresent(lightDom)) {
              lightDom.attachShadowDomView(componentView);
            }
            var shadowRoot = this._shadowDomStrategy.prepareShadowRoot(element);
            this._moveViewNodesIntoParent(shadowRoot, componentView);
            componentView.hostLightDom = lightDom;
            componentView.shadowRoot = shadowRoot;
          },
          setComponentViewRootNodes: function(componentViewRef, rootNodes) {
            var componentView = resolveInternalDomView(componentViewRef);
            this._removeViewNodes(componentView);
            componentView.rootNodes = rootNodes;
            this._moveViewNodesIntoParent(componentView.shadowRoot, componentView);
          },
          getRootNodes: function(viewRef) {
            return resolveInternalDomView(viewRef).rootNodes;
          },
          detachComponentView: function(location, componentViewRef) {
            var hostView = resolveInternalDomView(location.renderView);
            var componentView = resolveInternalDomView(componentViewRef);
            this._removeViewNodes(componentView);
            var lightDom = hostView.boundElements[location.boundElementIndex].lightDom;
            if (isPresent(lightDom)) {
              lightDom.detachShadowDomView();
            }
            componentView.hostLightDom = null;
            componentView.shadowRoot = null;
          },
          attachViewInContainer: function(location, atIndex, viewRef) {
            var parentView = resolveInternalDomView(location.renderView);
            var view = resolveInternalDomView(viewRef);
            var viewContainer = this._getOrCreateViewContainer(parentView, location.boundElementIndex);
            ListWrapper.insert(viewContainer.views, atIndex, view);
            view.hostLightDom = parentView.hostLightDom;
            var directParentLightDom = this._directParentLightDom(parentView, location.boundElementIndex);
            if (isBlank(directParentLightDom)) {
              var siblingToInsertAfter;
              if (atIndex == 0) {
                siblingToInsertAfter = parentView.boundElements[location.boundElementIndex].element;
              } else {
                siblingToInsertAfter = ListWrapper.last(viewContainer.views[atIndex - 1].rootNodes);
              }
              this._moveViewNodesAfterSibling(siblingToInsertAfter, view);
            } else {
              directParentLightDom.redistribute();
            }
            if (isPresent(parentView.hostLightDom)) {
              parentView.hostLightDom.redistribute();
            }
          },
          detachViewInContainer: function(location, atIndex, viewRef) {
            var parentView = resolveInternalDomView(location.renderView);
            var view = resolveInternalDomView(viewRef);
            var viewContainer = parentView.boundElements[location.boundElementIndex].viewContainer;
            var detachedView = viewContainer.views[atIndex];
            ListWrapper.removeAt(viewContainer.views, atIndex);
            var directParentLightDom = this._directParentLightDom(parentView, location.boundElementIndex);
            if (isBlank(directParentLightDom)) {
              this._removeViewNodes(detachedView);
            } else {
              directParentLightDom.redistribute();
            }
            view.hostLightDom = null;
            if (isPresent(parentView.hostLightDom)) {
              parentView.hostLightDom.redistribute();
            }
          },
          hydrateView: function(viewRef) {
            var view = resolveInternalDomView(viewRef);
            if (view.hydrated)
              throw new BaseException('The view is already hydrated.');
            view.hydrated = true;
            for (var i = 0; i < view.boundElements.length; ++i) {
              var lightDom = view.boundElements[i].lightDom;
              if (isPresent(lightDom)) {
                lightDom.redistribute();
              }
            }
            view.eventHandlerRemovers = [];
            var binders = view.proto.elementBinders;
            for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
              var binder = binders[binderIdx];
              if (isPresent(binder.globalEvents)) {
                for (var i = 0; i < binder.globalEvents.length; i++) {
                  var globalEvent = binder.globalEvents[i];
                  var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name, globalEvent.target, globalEvent.fullName);
                  view.eventHandlerRemovers.push(remover);
                }
              }
            }
            if (isPresent(view.hostLightDom)) {
              view.hostLightDom.redistribute();
            }
          },
          dehydrateView: function(viewRef) {
            var view = resolveInternalDomView(viewRef);
            for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
              view.eventHandlerRemovers[i]();
            }
            view.eventHandlerRemovers = null;
            view.hydrated = false;
          },
          setElementProperty: function(location, propertyName, propertyValue) {
            var view = resolveInternalDomView(location.renderView);
            view.setElementProperty(location.boundElementIndex, propertyName, propertyValue);
          },
          setElementAttribute: function(location, attributeName, attributeValue) {
            var view = resolveInternalDomView(location.renderView);
            view.setElementAttribute(location.boundElementIndex, attributeName, attributeValue);
          },
          setElementClass: function(location, className, isAdd) {
            var view = resolveInternalDomView(location.renderView);
            view.setElementClass(location.boundElementIndex, className, isAdd);
          },
          setElementStyle: function(location, styleName, styleValue) {
            var view = resolveInternalDomView(location.renderView);
            view.setElementStyle(location.boundElementIndex, styleName, styleValue);
          },
          invokeElementMethod: function(location, methodName, args) {
            var view = resolveInternalDomView(location.renderView);
            view.invokeElementMethod(location.boundElementIndex, methodName, args);
          },
          setText: function(viewRef, textNodeIndex, text) {
            var view = resolveInternalDomView(viewRef);
            DOM.setText(view.boundTextNodes[textNodeIndex], text);
          },
          setEventDispatcher: function(viewRef, dispatcher) {
            var view = resolveInternalDomView(viewRef);
            view.eventDispatcher = dispatcher;
          },
          _createView: function(protoView, inplaceElement) {
            var rootElementClone;
            var elementsWithBindingsDynamic;
            var viewRootNodes;
            if (isPresent(inplaceElement)) {
              rootElementClone = inplaceElement;
              elementsWithBindingsDynamic = [];
              viewRootNodes = [inplaceElement];
            } else if (protoView.isTemplateElement) {
              rootElementClone = DOM.importIntoDoc(DOM.content(protoView.element));
              elementsWithBindingsDynamic = DOM.querySelectorAll(rootElementClone, NG_BINDING_CLASS_SELECTOR);
              viewRootNodes = ListWrapper.createFixedSize(protoView.rootNodeCount);
              var childNode = DOM.firstChild(rootElementClone);
              for (var i = 0; i < protoView.rootNodeCount; i++, childNode = DOM.nextSibling(childNode)) {
                viewRootNodes[i] = childNode;
              }
            } else {
              rootElementClone = DOM.importIntoDoc(protoView.element);
              elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
              viewRootNodes = [rootElementClone];
            }
            var binders = protoView.elementBinders;
            var boundTextNodes = ListWrapper.createFixedSize(protoView.boundTextNodeCount);
            var boundElements = ListWrapper.createFixedSize(binders.length);
            var boundTextNodeIdx = 0;
            for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
              var binder = binders[binderIdx];
              var element = void 0;
              var childNodes = void 0;
              if (binderIdx === 0 && protoView.rootBindingOffset === 1) {
                element = protoView.isTemplateElement ? null : rootElementClone;
                childNodes = DOM.childNodes(rootElementClone);
              } else {
                element = elementsWithBindingsDynamic[binderIdx - protoView.rootBindingOffset];
                childNodes = DOM.childNodes(element);
              }
              var textNodeIndices = binder.textNodeIndices;
              for (var i = 0; i < textNodeIndices.length; i++) {
                boundTextNodes[boundTextNodeIdx++] = childNodes[textNodeIndices[i]];
              }
              var contentTag = null;
              if (isPresent(binder.contentTagSelector)) {
                contentTag = new Content(element, binder.contentTagSelector);
              }
              boundElements[binderIdx] = new DomElement(binder, element, contentTag);
            }
            var view = new DomView(protoView, viewRootNodes, boundTextNodes, boundElements);
            for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
              var binder = binders[binderIdx];
              var element = boundElements[binderIdx];
              var domEl = element.element;
              var lightDom = null;
              if (isPresent(binder.componentId) && (!binder.elementIsEmpty || isPresent(inplaceElement))) {
                lightDom = this._shadowDomStrategy.constructLightDom(view, domEl);
              }
              element.lightDom = lightDom;
              var contentTag = element.contentTag;
              if (isPresent(contentTag)) {
                var directParentLightDom = this._directParentLightDom(view, binderIdx);
                contentTag.init(directParentLightDom);
              }
              if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
                for (var i = 0; i < binder.localEvents.length; i++) {
                  this._createEventListener(view, domEl, binderIdx, binder.localEvents[i].name, binder.eventLocals);
                }
              }
            }
            return view;
          },
          _createEventListener: function(view, element, elementIndex, eventName, eventLocals) {
            this._eventManager.addEventListener(element, eventName, (function(event) {
              view.dispatchEvent(elementIndex, eventName, event);
            }));
          },
          _moveViewNodesAfterSibling: function(sibling, view) {
            for (var i = view.rootNodes.length - 1; i >= 0; --i) {
              DOM.insertAfter(sibling, view.rootNodes[i]);
            }
          },
          _moveViewNodesIntoParent: function(parent, view) {
            for (var i = 0; i < view.rootNodes.length; ++i) {
              DOM.appendChild(parent, view.rootNodes[i]);
            }
          },
          _removeViewNodes: function(view) {
            var len = view.rootNodes.length;
            if (len == 0)
              return ;
            var parent = view.rootNodes[0].parentNode;
            for (var i = len - 1; i >= 0; --i) {
              DOM.removeChild(parent, view.rootNodes[i]);
            }
          },
          _getOrCreateViewContainer: function(parentView, boundElementIndex) {
            var el = parentView.boundElements[boundElementIndex];
            var vc = el.viewContainer;
            if (isBlank(vc)) {
              vc = new DomViewContainer();
              el.viewContainer = vc;
            }
            return vc;
          },
          _directParentLightDom: function(view, boundElementIndex) {
            var directParentEl = view.getDirectParentElement(boundElementIndex);
            return isPresent(directParentEl) ? directParentEl.lightDom : null;
          },
          _createGlobalEventListener: function(view, elementIndex, eventName, eventTarget, fullName) {
            return this._eventManager.addGlobalEventListener(eventTarget, eventName, (function(event) {
              view.dispatchEvent(elementIndex, fullName, event);
            }));
          }
        }, {}, $__super);
      }(Renderer));
      $__export("DomRenderer", DomRenderer);
      $__export("DomRenderer", DomRenderer = __decorate([Injectable(), __param(2, Inject(DOCUMENT_TOKEN)), __metadata('design:paramtypes', [EventManager, ShadowDomStrategy, Object])], DomRenderer));
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_pipeline", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/compiler/compile_element", "angular2/src/render/dom/compiler/compile_control", "angular2/src/render/dom/view/proto_view_builder", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_pipeline";
  var isPresent,
      isBlank,
      DOM,
      CompileElement,
      CompileControl,
      ProtoViewBuilder,
      ViewType,
      CompilePipeline;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      CompileElement = $__m.CompileElement;
    }, function($__m) {
      CompileControl = $__m.CompileControl;
    }, function($__m) {
      ProtoViewBuilder = $__m.ProtoViewBuilder;
    }, function($__m) {
      ViewType = $__m.ViewType;
    }],
    execute: function() {
      CompilePipeline = (function() {
        function CompilePipeline(steps) {
          this._control = new CompileControl(steps);
        }
        return ($traceurRuntime.createClass)(CompilePipeline, {
          process: function(rootElement) {
            var protoViewType = arguments[1] !== (void 0) ? arguments[1] : null;
            var compilationCtxtDescription = arguments[2] !== (void 0) ? arguments[2] : '';
            if (isBlank(protoViewType)) {
              protoViewType = ViewType.COMPONENT;
            }
            var results = [];
            var rootCompileElement = new CompileElement(rootElement, compilationCtxtDescription);
            rootCompileElement.inheritedProtoView = new ProtoViewBuilder(rootElement, protoViewType);
            rootCompileElement.isViewRoot = true;
            this._process(results, null, rootCompileElement, compilationCtxtDescription);
            return results;
          },
          _process: function(results, parent, current) {
            var compilationCtxtDescription = arguments[3] !== (void 0) ? arguments[3] : '';
            var additionalChildren = this._control.internalProcess(results, 0, parent, current);
            if (current.compileChildren) {
              var node = DOM.firstChild(DOM.templateAwareRoot(current.element));
              while (isPresent(node)) {
                var nextNode = DOM.nextSibling(node);
                if (DOM.isElementNode(node)) {
                  var childCompileElement = new CompileElement(node, compilationCtxtDescription);
                  childCompileElement.inheritedProtoView = current.inheritedProtoView;
                  childCompileElement.inheritedElementBinder = current.inheritedElementBinder;
                  childCompileElement.distanceToInheritedBinder = current.distanceToInheritedBinder + 1;
                  this._process(results, current, childCompileElement);
                }
                node = nextNode;
              }
            }
            if (isPresent(additionalChildren)) {
              for (var i = 0; i < additionalChildren.length; i++) {
                this._process(results, current, additionalChildren[i]);
              }
            }
          }
        }, {});
      }());
      $__export("CompilePipeline", CompilePipeline);
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_step_factory", ["angular2/src/render/dom/compiler/property_binding_parser", "angular2/src/render/dom/compiler/text_interpolation_parser", "angular2/src/render/dom/compiler/directive_parser", "angular2/src/render/dom/compiler/view_splitter", "angular2/src/render/dom/shadow_dom/shadow_dom_compile_step"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_step_factory";
  var PropertyBindingParser,
      TextInterpolationParser,
      DirectiveParser,
      ViewSplitter,
      ShadowDomCompileStep,
      CompileStepFactory,
      DefaultStepFactory;
  return {
    setters: [function($__m) {
      PropertyBindingParser = $__m.PropertyBindingParser;
    }, function($__m) {
      TextInterpolationParser = $__m.TextInterpolationParser;
    }, function($__m) {
      DirectiveParser = $__m.DirectiveParser;
    }, function($__m) {
      ViewSplitter = $__m.ViewSplitter;
    }, function($__m) {
      ShadowDomCompileStep = $__m.ShadowDomCompileStep;
    }],
    execute: function() {
      CompileStepFactory = (function() {
        function CompileStepFactory() {}
        return ($traceurRuntime.createClass)(CompileStepFactory, {createSteps: function(view) {
            return null;
          }}, {});
      }());
      $__export("CompileStepFactory", CompileStepFactory);
      DefaultStepFactory = (function($__super) {
        function DefaultStepFactory(_parser, _shadowDomStrategy) {
          $traceurRuntime.superConstructor(DefaultStepFactory).call(this);
          this._parser = _parser;
          this._shadowDomStrategy = _shadowDomStrategy;
        }
        return ($traceurRuntime.createClass)(DefaultStepFactory, {createSteps: function(view) {
            return [new ViewSplitter(this._parser), new PropertyBindingParser(this._parser), new DirectiveParser(this._parser, view.directives), new TextInterpolationParser(this._parser), new ShadowDomCompileStep(this._shadowDomStrategy, view)];
          }}, {}, $__super);
      }(CompileStepFactory));
      $__export("DefaultStepFactory", DefaultStepFactory);
    }
  };
});

System.register("angular2/forms", ["angular2/src/forms/model", "angular2/src/forms/directives/ng_control_name", "angular2/src/forms/directives/ng_form_control", "angular2/src/forms/directives/ng_model", "angular2/src/forms/directives/ng_control", "angular2/src/forms/directives/ng_control_group", "angular2/src/forms/directives/ng_form_model", "angular2/src/forms/directives/ng_form", "angular2/src/forms/directives/default_value_accessor", "angular2/src/forms/directives/checkbox_value_accessor", "angular2/src/forms/directives/select_control_value_accessor", "angular2/src/forms/directives", "angular2/src/forms/validators", "angular2/src/forms/directives/validators", "angular2/src/forms/form_builder", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/forms";
  var FormBuilder,
      CONST_EXPR,
      formInjectables;
  return {
    setters: [function($__m) {
      $__export("AbstractControl", $__m.AbstractControl);
      $__export("Control", $__m.Control);
      $__export("ControlGroup", $__m.ControlGroup);
      $__export("ControlArray", $__m.ControlArray);
    }, function($__m) {
      $__export("NgControlName", $__m.NgControlName);
    }, function($__m) {
      $__export("NgFormControl", $__m.NgFormControl);
    }, function($__m) {
      $__export("NgModel", $__m.NgModel);
    }, function($__m) {
      $__export("NgControl", $__m.NgControl);
    }, function($__m) {
      $__export("NgControlGroup", $__m.NgControlGroup);
    }, function($__m) {
      $__export("NgFormModel", $__m.NgFormModel);
    }, function($__m) {
      $__export("NgForm", $__m.NgForm);
    }, function($__m) {
      $__export("DefaultValueAccessor", $__m.DefaultValueAccessor);
    }, function($__m) {
      $__export("CheckboxControlValueAccessor", $__m.CheckboxControlValueAccessor);
    }, function($__m) {
      $__export("SelectControlValueAccessor", $__m.SelectControlValueAccessor);
    }, function($__m) {
      $__export("formDirectives", $__m.formDirectives);
    }, function($__m) {
      $__export("Validators", $__m.Validators);
    }, function($__m) {
      $__export("NgValidator", $__m.NgValidator);
      $__export("NgRequiredValidator", $__m.NgRequiredValidator);
    }, function($__m) {
      FormBuilder = $__m.FormBuilder;
      $__export("FormBuilder", $__m.FormBuilder);
    }, function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }],
    execute: function() {
      formInjectables = CONST_EXPR([FormBuilder]);
      $__export("formInjectables", formInjectables);
    }
  };
});

System.register("angular2/src/http/http", ["angular2/src/facade/lang", "angular2/src/di/decorators", "angular2/src/http/interfaces", "angular2/src/http/static_request", "angular2/src/http/base_request_options", "angular2/src/http/enums"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/http/http";
  var __decorate,
      __metadata,
      isString,
      isPresent,
      Injectable,
      ConnectionBackend,
      Request,
      RequestOptions,
      RequestMethods,
      Http;
  function httpRequest(backend, request) {
    return backend.createConnection(request).response;
  }
  function mergeOptions(defaultOpts, providedOpts, method, url) {
    var newOptions = defaultOpts;
    if (isPresent(providedOpts)) {
      newOptions = newOptions.merge(new RequestOptions({
        method: providedOpts.method,
        url: providedOpts.url,
        headers: providedOpts.headers,
        body: providedOpts.body,
        mode: providedOpts.mode,
        credentials: providedOpts.credentials,
        cache: providedOpts.cache
      }));
    }
    if (isPresent(method)) {
      return newOptions.merge(new RequestOptions({
        method: method,
        url: url
      }));
    } else {
      return newOptions.merge(new RequestOptions({url: url}));
    }
  }
  return {
    setters: [function($__m) {
      isString = $__m.isString;
      isPresent = $__m.isPresent;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ConnectionBackend = $__m.ConnectionBackend;
    }, function($__m) {
      Request = $__m.Request;
    }, function($__m) {
      RequestOptions = $__m.RequestOptions;
    }, function($__m) {
      RequestMethods = $__m.RequestMethods;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Http = (($traceurRuntime.createClass)(function(_backend, _defaultOptions) {
        this._backend = _backend;
        this._defaultOptions = _defaultOptions;
      }, {
        request: function(url, options) {
          var responseObservable;
          if (isString(url)) {
            responseObservable = httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.GET, url)));
          } else if (url instanceof Request) {
            responseObservable = httpRequest(this._backend, url);
          }
          return responseObservable;
        },
        get: function(url, options) {
          return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.GET, url)));
        },
        post: function(url, body, options) {
          return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({body: body})), options, RequestMethods.POST, url)));
        },
        put: function(url, body, options) {
          return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({body: body})), options, RequestMethods.PUT, url)));
        },
        delete: function(url, options) {
          return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.DELETE, url)));
        },
        patch: function(url, body, options) {
          return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({body: body})), options, RequestMethods.PATCH, url)));
        },
        head: function(url, options) {
          return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethods.HEAD, url)));
        }
      }, {}));
      $__export("Http", Http);
      $__export("Http", Http = __decorate([Injectable(), __metadata('design:paramtypes', [ConnectionBackend, RequestOptions])], Http));
    }
  };
});

System.register("angular2/src/change_detection/parser/lexer", ["angular2/src/di/decorators", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/lexer";
  var __decorate,
      __metadata,
      Injectable,
      SetWrapper,
      NumberWrapper,
      StringJoiner,
      StringWrapper,
      BaseException,
      isPresent,
      TokenType,
      Lexer,
      Token,
      EOF,
      $EOF,
      $TAB,
      $LF,
      $VTAB,
      $FF,
      $CR,
      $SPACE,
      $BANG,
      $DQ,
      $HASH,
      $$,
      $PERCENT,
      $AMPERSAND,
      $SQ,
      $LPAREN,
      $RPAREN,
      $STAR,
      $PLUS,
      $COMMA,
      $MINUS,
      $PERIOD,
      $SLASH,
      $COLON,
      $SEMICOLON,
      $LT,
      $EQ,
      $GT,
      $QUESTION,
      $0,
      $9,
      $A,
      $E,
      $Z,
      $LBRACKET,
      $BACKSLASH,
      $RBRACKET,
      $CARET,
      $_,
      $a,
      $e,
      $f,
      $n,
      $r,
      $t,
      $u,
      $v,
      $z,
      $LBRACE,
      $BAR,
      $RBRACE,
      $NBSP,
      ScannerError,
      _Scanner,
      OPERATORS,
      KEYWORDS;
  function newCharacterToken(index, code) {
    return new Token(index, TokenType.CHARACTER, code, StringWrapper.fromCharCode(code));
  }
  function newIdentifierToken(index, text) {
    return new Token(index, TokenType.IDENTIFIER, 0, text);
  }
  function newKeywordToken(index, text) {
    return new Token(index, TokenType.KEYWORD, 0, text);
  }
  function newOperatorToken(index, text) {
    return new Token(index, TokenType.OPERATOR, 0, text);
  }
  function newStringToken(index, text) {
    return new Token(index, TokenType.STRING, 0, text);
  }
  function newNumberToken(index, n) {
    return new Token(index, TokenType.NUMBER, n, "");
  }
  function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
  }
  function isIdentifierStart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == $$);
  }
  function isIdentifierPart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) || (code == $_) || (code == $$);
  }
  function isDigit(code) {
    return $0 <= code && code <= $9;
  }
  function isExponentStart(code) {
    return code == $e || code == $E;
  }
  function isExponentSign(code) {
    return code == $MINUS || code == $PLUS;
  }
  function unescape(code) {
    switch (code) {
      case $n:
        return $LF;
      case $f:
        return $FF;
      case $r:
        return $CR;
      case $t:
        return $TAB;
      case $v:
        return $VTAB;
      default:
        return code;
    }
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      SetWrapper = $__m.SetWrapper;
    }, function($__m) {
      NumberWrapper = $__m.NumberWrapper;
      StringJoiner = $__m.StringJoiner;
      StringWrapper = $__m.StringWrapper;
      BaseException = $__m.BaseException;
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      (function(TokenType) {
        TokenType[TokenType["CHARACTER"] = 0] = "CHARACTER";
        TokenType[TokenType["IDENTIFIER"] = 1] = "IDENTIFIER";
        TokenType[TokenType["KEYWORD"] = 2] = "KEYWORD";
        TokenType[TokenType["STRING"] = 3] = "STRING";
        TokenType[TokenType["OPERATOR"] = 4] = "OPERATOR";
        TokenType[TokenType["NUMBER"] = 5] = "NUMBER";
      })(TokenType || (TokenType = {}));
      Lexer = (($traceurRuntime.createClass)(function() {}, {tokenize: function(text) {
          var scanner = new _Scanner(text);
          var tokens = [];
          var token = scanner.scanToken();
          while (token != null) {
            tokens.push(token);
            token = scanner.scanToken();
          }
          return tokens;
        }}, {}));
      $__export("Lexer", Lexer);
      $__export("Lexer", Lexer = __decorate([Injectable(), __metadata('design:paramtypes', [])], Lexer));
      Token = (function() {
        function Token(index, type, numValue, strValue) {
          this.index = index;
          this.type = type;
          this.numValue = numValue;
          this.strValue = strValue;
        }
        return ($traceurRuntime.createClass)(Token, {
          isCharacter: function(code) {
            return (this.type == TokenType.CHARACTER && this.numValue == code);
          },
          isNumber: function() {
            return (this.type == TokenType.NUMBER);
          },
          isString: function() {
            return (this.type == TokenType.STRING);
          },
          isOperator: function(operater) {
            return (this.type == TokenType.OPERATOR && this.strValue == operater);
          },
          isIdentifier: function() {
            return (this.type == TokenType.IDENTIFIER);
          },
          isKeyword: function() {
            return (this.type == TokenType.KEYWORD);
          },
          isKeywordVar: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "var");
          },
          isKeywordNull: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "null");
          },
          isKeywordUndefined: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "undefined");
          },
          isKeywordTrue: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "true");
          },
          isKeywordIf: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "if");
          },
          isKeywordElse: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "else");
          },
          isKeywordFalse: function() {
            return (this.type == TokenType.KEYWORD && this.strValue == "false");
          },
          toNumber: function() {
            return (this.type == TokenType.NUMBER) ? this.numValue : -1;
          },
          toString: function() {
            switch (this.type) {
              case TokenType.CHARACTER:
              case TokenType.STRING:
              case TokenType.IDENTIFIER:
              case TokenType.KEYWORD:
                return this.strValue;
              case TokenType.NUMBER:
                return this.numValue.toString();
              default:
                return null;
            }
          }
        }, {});
      }());
      $__export("Token", Token);
      EOF = new Token(-1, TokenType.CHARACTER, 0, "");
      $__export("EOF", EOF);
      $EOF = 0;
      $__export("$EOF", $EOF);
      $TAB = 9;
      $__export("$TAB", $TAB);
      $LF = 10;
      $__export("$LF", $LF);
      $VTAB = 11;
      $__export("$VTAB", $VTAB);
      $FF = 12;
      $__export("$FF", $FF);
      $CR = 13;
      $__export("$CR", $CR);
      $SPACE = 32;
      $__export("$SPACE", $SPACE);
      $BANG = 33;
      $__export("$BANG", $BANG);
      $DQ = 34;
      $__export("$DQ", $DQ);
      $HASH = 35;
      $__export("$HASH", $HASH);
      $$ = 36;
      $__export("$$", $$);
      $PERCENT = 37;
      $__export("$PERCENT", $PERCENT);
      $AMPERSAND = 38;
      $__export("$AMPERSAND", $AMPERSAND);
      $SQ = 39;
      $__export("$SQ", $SQ);
      $LPAREN = 40;
      $__export("$LPAREN", $LPAREN);
      $RPAREN = 41;
      $__export("$RPAREN", $RPAREN);
      $STAR = 42;
      $__export("$STAR", $STAR);
      $PLUS = 43;
      $__export("$PLUS", $PLUS);
      $COMMA = 44;
      $__export("$COMMA", $COMMA);
      $MINUS = 45;
      $__export("$MINUS", $MINUS);
      $PERIOD = 46;
      $__export("$PERIOD", $PERIOD);
      $SLASH = 47;
      $__export("$SLASH", $SLASH);
      $COLON = 58;
      $__export("$COLON", $COLON);
      $SEMICOLON = 59;
      $__export("$SEMICOLON", $SEMICOLON);
      $LT = 60;
      $__export("$LT", $LT);
      $EQ = 61;
      $__export("$EQ", $EQ);
      $GT = 62;
      $__export("$GT", $GT);
      $QUESTION = 63;
      $__export("$QUESTION", $QUESTION);
      $0 = 48;
      $9 = 57;
      $A = 65, $E = 69, $Z = 90;
      $LBRACKET = 91;
      $__export("$LBRACKET", $LBRACKET);
      $BACKSLASH = 92;
      $__export("$BACKSLASH", $BACKSLASH);
      $RBRACKET = 93;
      $__export("$RBRACKET", $RBRACKET);
      $CARET = 94;
      $_ = 95;
      $a = 97, $e = 101, $f = 102, $n = 110, $r = 114, $t = 116, $u = 117, $v = 118, $z = 122;
      $LBRACE = 123;
      $__export("$LBRACE", $LBRACE);
      $BAR = 124;
      $__export("$BAR", $BAR);
      $RBRACE = 125;
      $__export("$RBRACE", $RBRACE);
      $NBSP = 160;
      ScannerError = (function($__super) {
        function ScannerError(message) {
          $traceurRuntime.superConstructor(ScannerError).call(this);
          this.message = message;
        }
        return ($traceurRuntime.createClass)(ScannerError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("ScannerError", ScannerError);
      _Scanner = (function() {
        function _Scanner(input) {
          this.input = input;
          this.peek = 0;
          this.index = -1;
          this.length = input.length;
          this.advance();
        }
        return ($traceurRuntime.createClass)(_Scanner, {
          advance: function() {
            this.peek = ++this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
          },
          scanToken: function() {
            var input = this.input,
                length = this.length,
                peek = this.peek,
                index = this.index;
            while (peek <= $SPACE) {
              if (++index >= length) {
                peek = $EOF;
                break;
              } else {
                peek = StringWrapper.charCodeAt(input, index);
              }
            }
            this.peek = peek;
            this.index = index;
            if (index >= length) {
              return null;
            }
            if (isIdentifierStart(peek))
              return this.scanIdentifier();
            if (isDigit(peek))
              return this.scanNumber(index);
            var start = index;
            switch (peek) {
              case $PERIOD:
                this.advance();
                return isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, $PERIOD);
              case $LPAREN:
              case $RPAREN:
              case $LBRACE:
              case $RBRACE:
              case $LBRACKET:
              case $RBRACKET:
              case $COMMA:
              case $COLON:
              case $SEMICOLON:
                return this.scanCharacter(start, peek);
              case $SQ:
              case $DQ:
                return this.scanString();
              case $HASH:
              case $PLUS:
              case $MINUS:
              case $STAR:
              case $SLASH:
              case $PERCENT:
              case $CARET:
                return this.scanOperator(start, StringWrapper.fromCharCode(peek));
              case $QUESTION:
                return this.scanComplexOperator(start, '?', $PERIOD, '.');
              case $LT:
              case $GT:
                return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), $EQ, '=');
              case $BANG:
              case $EQ:
                return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), $EQ, '=', $EQ, '=');
              case $AMPERSAND:
                return this.scanComplexOperator(start, '&', $AMPERSAND, '&');
              case $BAR:
                return this.scanComplexOperator(start, '|', $BAR, '|');
              case $NBSP:
                while (isWhitespace(this.peek))
                  this.advance();
                return this.scanToken();
            }
            this.error(("Unexpected character [" + StringWrapper.fromCharCode(peek) + "]"), 0);
            return null;
          },
          scanCharacter: function(start, code) {
            assert(this.peek == code);
            this.advance();
            return newCharacterToken(start, code);
          },
          scanOperator: function(start, str) {
            assert(this.peek == StringWrapper.charCodeAt(str, 0));
            assert(SetWrapper.has(OPERATORS, str));
            this.advance();
            return newOperatorToken(start, str);
          },
          scanComplexOperator: function(start, one, twoCode, two, threeCode, three) {
            assert(this.peek == StringWrapper.charCodeAt(one, 0));
            this.advance();
            var str = one;
            if (this.peek == twoCode) {
              this.advance();
              str += two;
            }
            if (isPresent(threeCode) && this.peek == threeCode) {
              this.advance();
              str += three;
            }
            assert(SetWrapper.has(OPERATORS, str));
            return newOperatorToken(start, str);
          },
          scanIdentifier: function() {
            assert(isIdentifierStart(this.peek));
            var start = this.index;
            this.advance();
            while (isIdentifierPart(this.peek))
              this.advance();
            var str = this.input.substring(start, this.index);
            if (SetWrapper.has(KEYWORDS, str)) {
              return newKeywordToken(start, str);
            } else {
              return newIdentifierToken(start, str);
            }
          },
          scanNumber: function(start) {
            assert(isDigit(this.peek));
            var simple = (this.index === start);
            this.advance();
            while (true) {
              if (isDigit(this.peek)) {} else if (this.peek == $PERIOD) {
                simple = false;
              } else if (isExponentStart(this.peek)) {
                this.advance();
                if (isExponentSign(this.peek))
                  this.advance();
                if (!isDigit(this.peek))
                  this.error('Invalid exponent', -1);
                simple = false;
              } else {
                break;
              }
              this.advance();
            }
            var str = this.input.substring(start, this.index);
            var value = simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseFloat(str);
            return newNumberToken(start, value);
          },
          scanString: function() {
            assert(this.peek == $SQ || this.peek == $DQ);
            var start = this.index;
            var quote = this.peek;
            this.advance();
            var buffer;
            var marker = this.index;
            var input = this.input;
            while (this.peek != quote) {
              if (this.peek == $BACKSLASH) {
                if (buffer == null)
                  buffer = new StringJoiner();
                buffer.add(input.substring(marker, this.index));
                this.advance();
                var unescapedCode = void 0;
                if (this.peek == $u) {
                  var hex = input.substring(this.index + 1, this.index + 5);
                  try {
                    unescapedCode = NumberWrapper.parseInt(hex, 16);
                  } catch (e) {
                    this.error(("Invalid unicode escape [\\u" + hex + "]"), 0);
                  }
                  for (var i = 0; i < 5; i++) {
                    this.advance();
                  }
                } else {
                  unescapedCode = unescape(this.peek);
                  this.advance();
                }
                buffer.add(StringWrapper.fromCharCode(unescapedCode));
                marker = this.index;
              } else if (this.peek == $EOF) {
                this.error('Unterminated quote', 0);
              } else {
                this.advance();
              }
            }
            var last = input.substring(marker, this.index);
            this.advance();
            var unescaped = last;
            if (buffer != null) {
              buffer.add(last);
              unescaped = buffer.toString();
            }
            return newStringToken(start, unescaped);
          },
          error: function(message, offset) {
            var position = this.index + offset;
            throw new ScannerError(("Lexer Error: " + message + " at column " + position + " in expression [" + this.input + "]"));
          }
        }, {});
      }());
      OPERATORS = SetWrapper.createFromList(['+', '-', '*', '/', '%', '^', '=', '==', '!=', '===', '!==', '<', '>', '<=', '>=', '&&', '||', '&', '|', '!', '?', '#', '?.']);
      KEYWORDS = SetWrapper.createFromList(['var', 'null', 'undefined', 'true', 'false', 'if', 'else']);
    }
  };
});

System.register("angular2/src/change_detection/proto_change_detector", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/parser/ast", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/dynamic_change_detector", "angular2/src/change_detection/directive_record", "angular2/src/change_detection/coalesce", "angular2/src/change_detection/proto_record"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/proto_change_detector";
  var BaseException,
      isPresent,
      isString,
      ListWrapper,
      ImplicitReceiver,
      ChangeDetectionUtil,
      DynamicChangeDetector,
      DirectiveIndex,
      coalesce,
      ProtoRecord,
      RecordType,
      DynamicProtoChangeDetector,
      ProtoRecordBuilder,
      _ConvertAstIntoProtoRecords;
  function _arrayFn(length) {
    switch (length) {
      case 0:
        return ChangeDetectionUtil.arrayFn0;
      case 1:
        return ChangeDetectionUtil.arrayFn1;
      case 2:
        return ChangeDetectionUtil.arrayFn2;
      case 3:
        return ChangeDetectionUtil.arrayFn3;
      case 4:
        return ChangeDetectionUtil.arrayFn4;
      case 5:
        return ChangeDetectionUtil.arrayFn5;
      case 6:
        return ChangeDetectionUtil.arrayFn6;
      case 7:
        return ChangeDetectionUtil.arrayFn7;
      case 8:
        return ChangeDetectionUtil.arrayFn8;
      case 9:
        return ChangeDetectionUtil.arrayFn9;
      default:
        throw new BaseException("Does not support literal maps with more than 9 elements");
    }
  }
  function _mapPrimitiveName(keys) {
    var stringifiedKeys = ListWrapper.join(ListWrapper.map(keys, (function(k) {
      return isString(k) ? ("\"" + k + "\"") : ("" + k);
    })), ", ");
    return ("mapFn([" + stringifiedKeys + "])");
  }
  function _operationToPrimitiveName(operation) {
    switch (operation) {
      case '+':
        return "operation_add";
      case '-':
        return "operation_subtract";
      case '*':
        return "operation_multiply";
      case '/':
        return "operation_divide";
      case '%':
        return "operation_remainder";
      case '==':
        return "operation_equals";
      case '!=':
        return "operation_not_equals";
      case '===':
        return "operation_identical";
      case '!==':
        return "operation_not_identical";
      case '<':
        return "operation_less_then";
      case '>':
        return "operation_greater_then";
      case '<=':
        return "operation_less_or_equals_then";
      case '>=':
        return "operation_greater_or_equals_then";
      case '&&':
        return "operation_logical_and";
      case '||':
        return "operation_logical_or";
      default:
        throw new BaseException(("Unsupported operation " + operation));
    }
  }
  function _operationToFunction(operation) {
    switch (operation) {
      case '+':
        return ChangeDetectionUtil.operation_add;
      case '-':
        return ChangeDetectionUtil.operation_subtract;
      case '*':
        return ChangeDetectionUtil.operation_multiply;
      case '/':
        return ChangeDetectionUtil.operation_divide;
      case '%':
        return ChangeDetectionUtil.operation_remainder;
      case '==':
        return ChangeDetectionUtil.operation_equals;
      case '!=':
        return ChangeDetectionUtil.operation_not_equals;
      case '===':
        return ChangeDetectionUtil.operation_identical;
      case '!==':
        return ChangeDetectionUtil.operation_not_identical;
      case '<':
        return ChangeDetectionUtil.operation_less_then;
      case '>':
        return ChangeDetectionUtil.operation_greater_then;
      case '<=':
        return ChangeDetectionUtil.operation_less_or_equals_then;
      case '>=':
        return ChangeDetectionUtil.operation_greater_or_equals_then;
      case '&&':
        return ChangeDetectionUtil.operation_logical_and;
      case '||':
        return ChangeDetectionUtil.operation_logical_or;
      default:
        throw new BaseException(("Unsupported operation " + operation));
    }
  }
  function s(v) {
    return isPresent(v) ? ("" + v) : '';
  }
  function _interpolationFn(strings) {
    var length = strings.length;
    var c0 = length > 0 ? strings[0] : null;
    var c1 = length > 1 ? strings[1] : null;
    var c2 = length > 2 ? strings[2] : null;
    var c3 = length > 3 ? strings[3] : null;
    var c4 = length > 4 ? strings[4] : null;
    var c5 = length > 5 ? strings[5] : null;
    var c6 = length > 6 ? strings[6] : null;
    var c7 = length > 7 ? strings[7] : null;
    var c8 = length > 8 ? strings[8] : null;
    var c9 = length > 9 ? strings[9] : null;
    switch (length - 1) {
      case 1:
        return (function(a1) {
          return c0 + s(a1) + c1;
        });
      case 2:
        return (function(a1, a2) {
          return c0 + s(a1) + c1 + s(a2) + c2;
        });
      case 3:
        return (function(a1, a2, a3) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3;
        });
      case 4:
        return (function(a1, a2, a3, a4) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4;
        });
      case 5:
        return (function(a1, a2, a3, a4, a5) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
        });
      case 6:
        return (function(a1, a2, a3, a4, a5, a6) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6;
        });
      case 7:
        return (function(a1, a2, a3, a4, a5, a6, a7) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7;
        });
      case 8:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8;
        });
      case 9:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8 + s(a9) + c9;
        });
      default:
        throw new BaseException("Does not support more than 9 expressions");
    }
  }
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      isPresent = $__m.isPresent;
      isString = $__m.isString;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ImplicitReceiver = $__m.ImplicitReceiver;
    }, function($__m) {
      ChangeDetectionUtil = $__m.ChangeDetectionUtil;
    }, function($__m) {
      DynamicChangeDetector = $__m.DynamicChangeDetector;
    }, function($__m) {
      DirectiveIndex = $__m.DirectiveIndex;
    }, function($__m) {
      coalesce = $__m.coalesce;
    }, function($__m) {
      ProtoRecord = $__m.ProtoRecord;
      RecordType = $__m.RecordType;
    }],
    execute: function() {
      DynamicProtoChangeDetector = (function() {
        function DynamicProtoChangeDetector(_pipeRegistry, definition) {
          this._pipeRegistry = _pipeRegistry;
          this.definition = definition;
          this._records = this._createRecords(definition);
        }
        return ($traceurRuntime.createClass)(DynamicProtoChangeDetector, {
          instantiate: function(dispatcher) {
            return new DynamicChangeDetector(this.definition.id, this.definition.strategy, dispatcher, this._pipeRegistry, this._records, this.definition.directiveRecords);
          },
          _createRecords: function(definition) {
            var recordBuilder = new ProtoRecordBuilder();
            ListWrapper.forEach(definition.bindingRecords, (function(b) {
              recordBuilder.add(b, definition.variableNames);
            }));
            return coalesce(recordBuilder.records);
          }
        }, {});
      }());
      $__export("DynamicProtoChangeDetector", DynamicProtoChangeDetector);
      ProtoRecordBuilder = (function() {
        function ProtoRecordBuilder() {
          this.records = [];
        }
        return ($traceurRuntime.createClass)(ProtoRecordBuilder, {
          add: function(b) {
            var variableNames = arguments[1] !== (void 0) ? arguments[1] : null;
            var oldLast = ListWrapper.last(this.records);
            if (isPresent(oldLast) && oldLast.bindingRecord.directiveRecord == b.directiveRecord) {
              oldLast.lastInDirective = false;
            }
            this._appendRecords(b, variableNames);
            var newLast = ListWrapper.last(this.records);
            if (isPresent(newLast) && newLast !== oldLast) {
              newLast.lastInBinding = true;
              newLast.lastInDirective = true;
            }
          },
          _appendRecords: function(b, variableNames) {
            if (b.isDirectiveLifecycle()) {
              this.records.push(new ProtoRecord(RecordType.DIRECTIVE_LIFECYCLE, b.lifecycleEvent, null, [], [], -1, null, this.records.length + 1, b, null, false, false));
            } else {
              _ConvertAstIntoProtoRecords.append(this.records, b, variableNames);
            }
          }
        }, {});
      }());
      $__export("ProtoRecordBuilder", ProtoRecordBuilder);
      _ConvertAstIntoProtoRecords = (function() {
        function _ConvertAstIntoProtoRecords(_records, _bindingRecord, _expressionAsString, _variableNames) {
          this._records = _records;
          this._bindingRecord = _bindingRecord;
          this._expressionAsString = _expressionAsString;
          this._variableNames = _variableNames;
        }
        return ($traceurRuntime.createClass)(_ConvertAstIntoProtoRecords, {
          visitImplicitReceiver: function(ast) {
            return this._bindingRecord.implicitReceiver;
          },
          visitInterpolation: function(ast) {
            var args = this._visitAll(ast.expressions);
            return this._addRecord(RecordType.INTERPOLATE, "interpolate", _interpolationFn(ast.strings), args, ast.strings, 0);
          },
          visitLiteralPrimitive: function(ast) {
            return this._addRecord(RecordType.CONST, "literal", ast.value, [], null, 0);
          },
          visitAccessMember: function(ast) {
            var receiver = ast.receiver.visit(this);
            if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name) && ast.receiver instanceof ImplicitReceiver) {
              return this._addRecord(RecordType.LOCAL, ast.name, ast.name, [], null, receiver);
            } else {
              return this._addRecord(RecordType.PROPERTY, ast.name, ast.getter, [], null, receiver);
            }
          },
          visitSafeAccessMember: function(ast) {
            var receiver = ast.receiver.visit(this);
            return this._addRecord(RecordType.SAFE_PROPERTY, ast.name, ast.getter, [], null, receiver);
          },
          visitMethodCall: function(ast) {
            var receiver = ast.receiver.visit(this);
            var args = this._visitAll(ast.args);
            if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name)) {
              var target = this._addRecord(RecordType.LOCAL, ast.name, ast.name, [], null, receiver);
              return this._addRecord(RecordType.INVOKE_CLOSURE, "closure", null, args, null, target);
            } else {
              return this._addRecord(RecordType.INVOKE_METHOD, ast.name, ast.fn, args, null, receiver);
            }
          },
          visitSafeMethodCall: function(ast) {
            var receiver = ast.receiver.visit(this);
            var args = this._visitAll(ast.args);
            return this._addRecord(RecordType.SAFE_INVOKE_METHOD, ast.name, ast.fn, args, null, receiver);
          },
          visitFunctionCall: function(ast) {
            var target = ast.target.visit(this);
            var args = this._visitAll(ast.args);
            return this._addRecord(RecordType.INVOKE_CLOSURE, "closure", null, args, null, target);
          },
          visitLiteralArray: function(ast) {
            var primitiveName = ("arrayFn" + ast.expressions.length);
            return this._addRecord(RecordType.PRIMITIVE_OP, primitiveName, _arrayFn(ast.expressions.length), this._visitAll(ast.expressions), null, 0);
          },
          visitLiteralMap: function(ast) {
            return this._addRecord(RecordType.PRIMITIVE_OP, _mapPrimitiveName(ast.keys), ChangeDetectionUtil.mapFn(ast.keys), this._visitAll(ast.values), null, 0);
          },
          visitBinary: function(ast) {
            var left = ast.left.visit(this);
            var right = ast.right.visit(this);
            return this._addRecord(RecordType.PRIMITIVE_OP, _operationToPrimitiveName(ast.operation), _operationToFunction(ast.operation), [left, right], null, 0);
          },
          visitPrefixNot: function(ast) {
            var exp = ast.expression.visit(this);
            return this._addRecord(RecordType.PRIMITIVE_OP, "operation_negate", ChangeDetectionUtil.operation_negate, [exp], null, 0);
          },
          visitConditional: function(ast) {
            var c = ast.condition.visit(this);
            var t = ast.trueExp.visit(this);
            var f = ast.falseExp.visit(this);
            return this._addRecord(RecordType.PRIMITIVE_OP, "cond", ChangeDetectionUtil.cond, [c, t, f], null, 0);
          },
          visitPipe: function(ast) {
            var value = ast.exp.visit(this);
            var args = this._visitAll(ast.args);
            return this._addRecord(RecordType.PIPE, ast.name, ast.name, args, null, value);
          },
          visitKeyedAccess: function(ast) {
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            return this._addRecord(RecordType.KEYED_ACCESS, "keyedAccess", ChangeDetectionUtil.keyedAccess, [key], null, obj);
          },
          visitAssignment: function(ast) {
            throw new BaseException('Not supported');
          },
          visitChain: function(ast) {
            throw new BaseException('Not supported');
          },
          visitIf: function(ast) {
            throw new BaseException('Not supported');
          },
          _visitAll: function(asts) {
            var res = ListWrapper.createFixedSize(asts.length);
            for (var i = 0; i < asts.length; ++i) {
              res[i] = asts[i].visit(this);
            }
            return res;
          },
          _addRecord: function(type, name, funcOrValue, args, fixedArgs, context) {
            var selfIndex = this._records.length + 1;
            if (context instanceof DirectiveIndex) {
              this._records.push(new ProtoRecord(type, name, funcOrValue, args, fixedArgs, -1, context, selfIndex, this._bindingRecord, this._expressionAsString, false, false));
            } else {
              this._records.push(new ProtoRecord(type, name, funcOrValue, args, fixedArgs, context, null, selfIndex, this._bindingRecord, this._expressionAsString, false, false));
            }
            return selfIndex;
          }
        }, {append: function(records, b, variableNames) {
            var c = new _ConvertAstIntoProtoRecords(records, b, b.ast.toString(), variableNames);
            b.ast.visit(c);
          }});
      }());
    }
  };
});

System.register("angular2/src/di/injector", ["angular2/src/facade/collection", "angular2/src/di/binding", "angular2/src/di/exceptions", "angular2/src/facade/lang", "angular2/src/di/key", "angular2/src/di/forward_ref", "angular2/src/di/annotations_impl"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/injector";
  var Map,
      List,
      MapWrapper,
      ListWrapper,
      ResolvedBinding,
      Binding,
      BindingBuilder,
      bind,
      AbstractBindingError,
      NoBindingError,
      CyclicDependencyError,
      InstantiationError,
      InvalidBindingError,
      OutOfBoundsError,
      Type,
      isPresent,
      isBlank,
      CONST_EXPR,
      Key,
      resolveForwardRef,
      unbounded,
      _constructing,
      _notFound,
      _MAX_CONSTRUCTION_COUNTER,
      undefinedValue,
      PUBLIC,
      PRIVATE,
      PUBLIC_AND_PRIVATE,
      ProtoInjectorInlineStrategy,
      ProtoInjectorDynamicStrategy,
      ProtoInjector,
      InjectorInlineStrategy,
      InjectorDynamicStrategy,
      BindingWithVisibility,
      Injector;
  function resolveBindings(bindings) {
    var resolvedList = ListWrapper.createFixedSize(bindings.length);
    for (var i = 0; i < bindings.length; i++) {
      var unresolved = resolveForwardRef(bindings[i]);
      var resolved = void 0;
      if (unresolved instanceof ResolvedBinding) {
        resolved = unresolved;
      } else if (unresolved instanceof Type) {
        resolved = bind(unresolved).toClass(unresolved).resolve();
      } else if (unresolved instanceof Binding) {
        resolved = unresolved.resolve();
      } else if (unresolved instanceof List) {
        resolved = resolveBindings(unresolved);
      } else if (unresolved instanceof BindingBuilder) {
        throw new InvalidBindingError(unresolved.token);
      } else {
        throw new InvalidBindingError(unresolved);
      }
      resolvedList[i] = resolved;
    }
    return resolvedList;
  }
  function _createListOfBindings(flattenedBindings) {
    return MapWrapper.values(flattenedBindings);
  }
  function _flattenBindings(bindings, res) {
    ListWrapper.forEach(bindings, function(b) {
      if (b instanceof ResolvedBinding) {
        res.set(b.key.id, b);
      } else if (b instanceof List) {
        _flattenBindings(b, res);
      }
    });
    return res;
  }
  $__export("resolveBindings", resolveBindings);
  return {
    setters: [function($__m) {
      Map = $__m.Map;
      List = $__m.List;
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ResolvedBinding = $__m.ResolvedBinding;
      Binding = $__m.Binding;
      BindingBuilder = $__m.BindingBuilder;
      bind = $__m.bind;
    }, function($__m) {
      AbstractBindingError = $__m.AbstractBindingError;
      NoBindingError = $__m.NoBindingError;
      CyclicDependencyError = $__m.CyclicDependencyError;
      InstantiationError = $__m.InstantiationError;
      InvalidBindingError = $__m.InvalidBindingError;
      OutOfBoundsError = $__m.OutOfBoundsError;
    }, function($__m) {
      Type = $__m.Type;
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      Key = $__m.Key;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }, function($__m) {
      unbounded = $__m.unbounded;
    }],
    execute: function() {
      _constructing = CONST_EXPR(new Object());
      _notFound = CONST_EXPR(new Object());
      _MAX_CONSTRUCTION_COUNTER = 10;
      undefinedValue = CONST_EXPR(new Object());
      $__export("undefinedValue", undefinedValue);
      PUBLIC = 1;
      $__export("PUBLIC", PUBLIC);
      PRIVATE = 2;
      $__export("PRIVATE", PRIVATE);
      PUBLIC_AND_PRIVATE = 3;
      $__export("PUBLIC_AND_PRIVATE", PUBLIC_AND_PRIVATE);
      ProtoInjectorInlineStrategy = (function() {
        function ProtoInjectorInlineStrategy(protoEI, bwv) {
          this.binding0 = null;
          this.binding1 = null;
          this.binding2 = null;
          this.binding3 = null;
          this.binding4 = null;
          this.binding5 = null;
          this.binding6 = null;
          this.binding7 = null;
          this.binding8 = null;
          this.binding9 = null;
          this.keyId0 = null;
          this.keyId1 = null;
          this.keyId2 = null;
          this.keyId3 = null;
          this.keyId4 = null;
          this.keyId5 = null;
          this.keyId6 = null;
          this.keyId7 = null;
          this.keyId8 = null;
          this.keyId9 = null;
          this.visibility0 = null;
          this.visibility1 = null;
          this.visibility2 = null;
          this.visibility3 = null;
          this.visibility4 = null;
          this.visibility5 = null;
          this.visibility6 = null;
          this.visibility7 = null;
          this.visibility8 = null;
          this.visibility9 = null;
          var length = bwv.length;
          if (length > 0) {
            this.binding0 = bwv[0].binding;
            this.keyId0 = bwv[0].getKeyId();
            this.visibility0 = bwv[0].visibility;
          }
          if (length > 1) {
            this.binding1 = bwv[1].binding;
            this.keyId1 = bwv[1].getKeyId();
            this.visibility1 = bwv[1].visibility;
          }
          if (length > 2) {
            this.binding2 = bwv[2].binding;
            this.keyId2 = bwv[2].getKeyId();
            this.visibility2 = bwv[2].visibility;
          }
          if (length > 3) {
            this.binding3 = bwv[3].binding;
            this.keyId3 = bwv[3].getKeyId();
            this.visibility3 = bwv[3].visibility;
          }
          if (length > 4) {
            this.binding4 = bwv[4].binding;
            this.keyId4 = bwv[4].getKeyId();
            this.visibility4 = bwv[4].visibility;
          }
          if (length > 5) {
            this.binding5 = bwv[5].binding;
            this.keyId5 = bwv[5].getKeyId();
            this.visibility5 = bwv[5].visibility;
          }
          if (length > 6) {
            this.binding6 = bwv[6].binding;
            this.keyId6 = bwv[6].getKeyId();
            this.visibility6 = bwv[6].visibility;
          }
          if (length > 7) {
            this.binding7 = bwv[7].binding;
            this.keyId7 = bwv[7].getKeyId();
            this.visibility7 = bwv[7].visibility;
          }
          if (length > 8) {
            this.binding8 = bwv[8].binding;
            this.keyId8 = bwv[8].getKeyId();
            this.visibility8 = bwv[8].visibility;
          }
          if (length > 9) {
            this.binding9 = bwv[9].binding;
            this.keyId9 = bwv[9].getKeyId();
            this.visibility9 = bwv[9].visibility;
          }
        }
        return ($traceurRuntime.createClass)(ProtoInjectorInlineStrategy, {
          getBindingAtIndex: function(index) {
            if (index == 0)
              return this.binding0;
            if (index == 1)
              return this.binding1;
            if (index == 2)
              return this.binding2;
            if (index == 3)
              return this.binding3;
            if (index == 4)
              return this.binding4;
            if (index == 5)
              return this.binding5;
            if (index == 6)
              return this.binding6;
            if (index == 7)
              return this.binding7;
            if (index == 8)
              return this.binding8;
            if (index == 9)
              return this.binding9;
            throw new OutOfBoundsError(index);
          },
          createInjectorStrategy: function(injector) {
            return new InjectorInlineStrategy(injector, this);
          }
        }, {});
      }());
      $__export("ProtoInjectorInlineStrategy", ProtoInjectorInlineStrategy);
      ProtoInjectorDynamicStrategy = (function() {
        function ProtoInjectorDynamicStrategy(protoInj, bwv) {
          var len = bwv.length;
          this.bindings = ListWrapper.createFixedSize(len);
          this.keyIds = ListWrapper.createFixedSize(len);
          this.visibilities = ListWrapper.createFixedSize(len);
          for (var i = 0; i < len; i++) {
            this.bindings[i] = bwv[i].binding;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
          }
        }
        return ($traceurRuntime.createClass)(ProtoInjectorDynamicStrategy, {
          getBindingAtIndex: function(index) {
            if (index < 0 || index >= this.bindings.length) {
              throw new OutOfBoundsError(index);
            }
            return this.bindings[index];
          },
          createInjectorStrategy: function(ei) {
            return new InjectorDynamicStrategy(this, ei);
          }
        }, {});
      }());
      $__export("ProtoInjectorDynamicStrategy", ProtoInjectorDynamicStrategy);
      ProtoInjector = (function() {
        function ProtoInjector(bwv, distanceToParent) {
          this.distanceToParent = distanceToParent;
          this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ? new ProtoInjectorDynamicStrategy(this, bwv) : new ProtoInjectorInlineStrategy(this, bwv);
        }
        return ($traceurRuntime.createClass)(ProtoInjector, {getBindingAtIndex: function(index) {
            return this._strategy.getBindingAtIndex(index);
          }}, {});
      }());
      $__export("ProtoInjector", ProtoInjector);
      InjectorInlineStrategy = (function() {
        function InjectorInlineStrategy(injector, protoStrategy) {
          this.injector = injector;
          this.protoStrategy = protoStrategy;
          this.obj0 = null;
          this.obj1 = null;
          this.obj2 = null;
          this.obj3 = null;
          this.obj4 = null;
          this.obj5 = null;
          this.obj6 = null;
          this.obj7 = null;
          this.obj8 = null;
          this.obj9 = null;
        }
        return ($traceurRuntime.createClass)(InjectorInlineStrategy, {
          hydrate: function() {
            var p = this.protoStrategy;
            var inj = this.injector;
            inj._constructionCounter = 0;
            if (isPresent(p.keyId0) && isBlank(this.obj0))
              this.obj0 = inj._new(p.binding0, p.visibility0);
            if (isPresent(p.keyId1) && isBlank(this.obj1))
              this.obj1 = inj._new(p.binding1, p.visibility1);
            if (isPresent(p.keyId2) && isBlank(this.obj2))
              this.obj2 = inj._new(p.binding2, p.visibility2);
            if (isPresent(p.keyId3) && isBlank(this.obj3))
              this.obj3 = inj._new(p.binding3, p.visibility3);
            if (isPresent(p.keyId4) && isBlank(this.obj4))
              this.obj4 = inj._new(p.binding4, p.visibility4);
            if (isPresent(p.keyId5) && isBlank(this.obj5))
              this.obj5 = inj._new(p.binding5, p.visibility5);
            if (isPresent(p.keyId6) && isBlank(this.obj6))
              this.obj6 = inj._new(p.binding6, p.visibility6);
            if (isPresent(p.keyId7) && isBlank(this.obj7))
              this.obj7 = inj._new(p.binding7, p.visibility7);
            if (isPresent(p.keyId8) && isBlank(this.obj8))
              this.obj8 = inj._new(p.binding8, p.visibility8);
            if (isPresent(p.keyId9) && isBlank(this.obj9))
              this.obj9 = inj._new(p.binding9, p.visibility9);
          },
          attach: function(parent, isBoundary) {
            var inj = this.injector;
            inj._parent = parent;
            inj._isBoundary = isBoundary;
          },
          dehydrate: function() {
            this.obj0 = null;
            this.obj1 = null;
            this.obj2 = null;
            this.obj3 = null;
            this.obj4 = null;
            this.obj5 = null;
            this.obj6 = null;
            this.obj7 = null;
            this.obj8 = null;
            this.obj9 = null;
          },
          getObjByKeyId: function(keyId, visibility) {
            var p = this.protoStrategy;
            var inj = this.injector;
            if (p.keyId0 === keyId && (p.visibility0 & visibility) > 0) {
              if (isBlank(this.obj0)) {
                this.obj0 = inj._new(p.binding0, p.visibility0);
              }
              return this.obj0;
            }
            if (p.keyId1 === keyId && (p.visibility1 & visibility) > 0) {
              if (isBlank(this.obj1)) {
                this.obj1 = inj._new(p.binding1, p.visibility1);
              }
              return this.obj1;
            }
            if (p.keyId2 === keyId && (p.visibility2 & visibility) > 0) {
              if (isBlank(this.obj2)) {
                this.obj2 = inj._new(p.binding2, p.visibility2);
              }
              return this.obj2;
            }
            if (p.keyId3 === keyId && (p.visibility3 & visibility) > 0) {
              if (isBlank(this.obj3)) {
                this.obj3 = inj._new(p.binding3, p.visibility3);
              }
              return this.obj3;
            }
            if (p.keyId4 === keyId && (p.visibility4 & visibility) > 0) {
              if (isBlank(this.obj4)) {
                this.obj4 = inj._new(p.binding4, p.visibility4);
              }
              return this.obj4;
            }
            if (p.keyId5 === keyId && (p.visibility5 & visibility) > 0) {
              if (isBlank(this.obj5)) {
                this.obj5 = inj._new(p.binding5, p.visibility5);
              }
              return this.obj5;
            }
            if (p.keyId6 === keyId && (p.visibility6 & visibility) > 0) {
              if (isBlank(this.obj6)) {
                this.obj6 = inj._new(p.binding6, p.visibility6);
              }
              return this.obj6;
            }
            if (p.keyId7 === keyId && (p.visibility7 & visibility) > 0) {
              if (isBlank(this.obj7)) {
                this.obj7 = inj._new(p.binding7, p.visibility7);
              }
              return this.obj7;
            }
            if (p.keyId8 === keyId && (p.visibility8 & visibility) > 0) {
              if (isBlank(this.obj8)) {
                this.obj8 = inj._new(p.binding8, p.visibility8);
              }
              return this.obj8;
            }
            if (p.keyId9 === keyId && (p.visibility9 & visibility) > 0) {
              if (isBlank(this.obj9)) {
                this.obj9 = inj._new(p.binding9, p.visibility9);
              }
              return this.obj9;
            }
            return undefinedValue;
          },
          getObjAtIndex: function(index) {
            if (index == 0)
              return this.obj0;
            if (index == 1)
              return this.obj1;
            if (index == 2)
              return this.obj2;
            if (index == 3)
              return this.obj3;
            if (index == 4)
              return this.obj4;
            if (index == 5)
              return this.obj5;
            if (index == 6)
              return this.obj6;
            if (index == 7)
              return this.obj7;
            if (index == 8)
              return this.obj8;
            if (index == 9)
              return this.obj9;
            throw new OutOfBoundsError(index);
          },
          getMaxNumberOfObjects: function() {
            return _MAX_CONSTRUCTION_COUNTER;
          }
        }, {});
      }());
      $__export("InjectorInlineStrategy", InjectorInlineStrategy);
      InjectorDynamicStrategy = (function() {
        function InjectorDynamicStrategy(protoStrategy, injector) {
          this.protoStrategy = protoStrategy;
          this.injector = injector;
          this.objs = ListWrapper.createFixedSize(protoStrategy.bindings.length);
        }
        return ($traceurRuntime.createClass)(InjectorDynamicStrategy, {
          hydrate: function() {
            var p = this.protoStrategy;
            for (var i = 0; i < p.keyIds.length; i++) {
              if (isPresent(p.keyIds[i]) && isBlank(this.objs[i])) {
                this.objs[i] = this.injector._new(p.bindings[i], p.visibilities[i]);
              }
            }
          },
          attach: function(parent, isBoundary) {
            var inj = this.injector;
            inj._parent = parent;
            inj._isBoundary = isBoundary;
          },
          dehydrate: function() {
            ListWrapper.fill(this.objs, null);
          },
          getObjByKeyId: function(keyId, visibility) {
            var p = this.protoStrategy;
            for (var i = 0; i < p.keyIds.length; i++) {
              if (p.keyIds[i] === keyId && (p.visibilities[i] & visibility) > 0) {
                if (isBlank(this.objs[i])) {
                  this.objs[i] = this.injector._new(p.bindings[i], p.visibilities[i]);
                }
                return this.objs[i];
              }
            }
            return undefinedValue;
          },
          getObjAtIndex: function(index) {
            if (index < 0 || index >= this.objs.length) {
              throw new OutOfBoundsError(index);
            }
            return this.objs[index];
          },
          getMaxNumberOfObjects: function() {
            return this.objs.length;
          }
        }, {});
      }());
      $__export("InjectorDynamicStrategy", InjectorDynamicStrategy);
      BindingWithVisibility = (function() {
        function BindingWithVisibility(binding, visibility) {
          this.binding = binding;
          this.visibility = visibility;
        }
        return ($traceurRuntime.createClass)(BindingWithVisibility, {getKeyId: function() {
            return this.binding.key.id;
          }}, {});
      }());
      $__export("BindingWithVisibility", BindingWithVisibility);
      Injector = (function() {
        function Injector(_proto) {
          var _parent = arguments[1] !== (void 0) ? arguments[1] : null;
          this._proto = _proto;
          this._parent = _parent;
          this._isBoundary = false;
          this._constructionCounter = 0;
          this._strategy = _proto._strategy.createInjectorStrategy(this);
        }
        return ($traceurRuntime.createClass)(Injector, {
          get: function(token) {
            return this._getByKey(Key.get(token), unbounded, false, PUBLIC_AND_PRIVATE);
          },
          getOptional: function(token) {
            return this._getByKey(Key.get(token), unbounded, true, PUBLIC_AND_PRIVATE);
          },
          getAt: function(index) {
            return this._strategy.getObjAtIndex(index);
          },
          get parent() {
            return this._parent;
          },
          get internalStrategy() {
            return this._strategy;
          },
          resolveAndCreateChild: function(bindings) {
            var resovledBindings = Injector.resolve(bindings);
            return this.createChildFromResolved(resovledBindings);
          },
          createChildFromResolved: function(bindings) {
            var bd = bindings.map((function(b) {
              return new BindingWithVisibility(b, PUBLIC);
            }));
            var proto = new ProtoInjector(bd, 1);
            var inj = new Injector(proto);
            inj._parent = this;
            return inj;
          },
          _new: function(binding, visibility) {
            if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
              throw new CyclicDependencyError(binding.key);
            }
            var factory = binding.factory;
            var deps = binding.dependencies;
            var length = deps.length;
            var d0,
                d1,
                d2,
                d3,
                d4,
                d5,
                d6,
                d7,
                d8,
                d9,
                d10,
                d11,
                d12,
                d13,
                d14,
                d15,
                d16,
                d17,
                d18,
                d19;
            try {
              d0 = length > 0 ? this._getByDependency(deps[0], visibility) : null;
              d1 = length > 1 ? this._getByDependency(deps[1], visibility) : null;
              d2 = length > 2 ? this._getByDependency(deps[2], visibility) : null;
              d3 = length > 3 ? this._getByDependency(deps[3], visibility) : null;
              d4 = length > 4 ? this._getByDependency(deps[4], visibility) : null;
              d5 = length > 5 ? this._getByDependency(deps[5], visibility) : null;
              d6 = length > 6 ? this._getByDependency(deps[6], visibility) : null;
              d7 = length > 7 ? this._getByDependency(deps[7], visibility) : null;
              d8 = length > 8 ? this._getByDependency(deps[8], visibility) : null;
              d9 = length > 9 ? this._getByDependency(deps[9], visibility) : null;
              d10 = length > 10 ? this._getByDependency(deps[10], visibility) : null;
              d11 = length > 11 ? this._getByDependency(deps[11], visibility) : null;
              d12 = length > 12 ? this._getByDependency(deps[12], visibility) : null;
              d13 = length > 13 ? this._getByDependency(deps[13], visibility) : null;
              d14 = length > 14 ? this._getByDependency(deps[14], visibility) : null;
              d15 = length > 15 ? this._getByDependency(deps[15], visibility) : null;
              d16 = length > 16 ? this._getByDependency(deps[16], visibility) : null;
              d17 = length > 17 ? this._getByDependency(deps[17], visibility) : null;
              d18 = length > 18 ? this._getByDependency(deps[18], visibility) : null;
              d19 = length > 19 ? this._getByDependency(deps[19], visibility) : null;
            } catch (e) {
              if (e instanceof AbstractBindingError)
                e.addKey(binding.key);
              throw e;
            }
            var obj;
            try {
              switch (length) {
                case 0:
                  obj = factory();
                  break;
                case 1:
                  obj = factory(d0);
                  break;
                case 2:
                  obj = factory(d0, d1);
                  break;
                case 3:
                  obj = factory(d0, d1, d2);
                  break;
                case 4:
                  obj = factory(d0, d1, d2, d3);
                  break;
                case 5:
                  obj = factory(d0, d1, d2, d3, d4);
                  break;
                case 6:
                  obj = factory(d0, d1, d2, d3, d4, d5);
                  break;
                case 7:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6);
                  break;
                case 8:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                  break;
                case 9:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                  break;
                case 10:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                  break;
                case 11:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                  break;
                case 12:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                  break;
                case 13:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                  break;
                case 14:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                  break;
                case 15:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                  break;
                case 16:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                  break;
                case 17:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                  break;
                case 18:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                  break;
                case 19:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                  break;
                case 20:
                  obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                  break;
              }
            } catch (e) {
              throw new InstantiationError(e, e.stack, binding.key);
            }
            return obj;
          },
          _getByDependency: function(dep, bindingVisibility) {
            var special = isPresent(this.ei) ? this.ei.getDependency(dep) : undefinedValue;
            if (special !== undefinedValue) {
              return special;
            } else {
              return this._getByKey(dep.key, dep.visibility, dep.optional, bindingVisibility);
            }
          },
          _getByKey: function(key, depVisibility, optional, bindingVisibility) {
            if (key.token === Injector) {
              return this;
            }
            var inj = this;
            var lastInjector = false;
            var depth = depVisibility.depth;
            if (!depVisibility.includeSelf) {
              depth -= inj._proto.distanceToParent;
              if (inj._isBoundary) {
                if (depVisibility.crossBoundaries) {
                  bindingVisibility = PUBLIC_AND_PRIVATE;
                } else {
                  bindingVisibility = PRIVATE;
                  lastInjector = true;
                }
              }
              inj = inj._parent;
            }
            while (inj != null && depth >= 0) {
              var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
              if (obj !== undefinedValue)
                return obj;
              depth -= inj._proto.distanceToParent;
              if (lastInjector)
                break;
              if (inj._isBoundary) {
                if (depVisibility.crossBoundaries) {
                  bindingVisibility = PUBLIC_AND_PRIVATE;
                } else {
                  bindingVisibility = PRIVATE;
                  lastInjector = true;
                }
              }
              inj = inj._parent;
            }
            if (optional) {
              return null;
            } else {
              throw new NoBindingError(key);
            }
          }
        }, {
          resolve: function(bindings) {
            var resolvedBindings = resolveBindings(bindings);
            var flatten = _flattenBindings(resolvedBindings, new Map());
            return _createListOfBindings(flatten);
          },
          resolveAndCreate: function(bindings) {
            var resolvedBindings = Injector.resolve(bindings);
            return Injector.fromResolvedBindings(resolvedBindings);
          },
          fromResolvedBindings: function(bindings) {
            var bd = bindings.map((function(b) {
              return new BindingWithVisibility(b, PUBLIC);
            }));
            var proto = new ProtoInjector(bd, 0);
            var inj = new Injector(proto);
            return inj;
          }
        });
      }());
      $__export("Injector", Injector);
    }
  };
});

System.register("angular2/src/core/compiler/view_manager", ["angular2/di", "angular2/src/facade/lang", "angular2/src/core/compiler/view_ref", "angular2/src/render/api", "angular2/src/core/compiler/view_manager_utils", "angular2/src/core/compiler/view_pool", "angular2/src/core/compiler/view_listener"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_manager";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      isBlank,
      BaseException,
      internalView,
      internalProtoView,
      Renderer,
      AppViewManagerUtils,
      AppViewPool,
      AppViewListener,
      AppViewManager;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      internalView = $__m.internalView;
      internalProtoView = $__m.internalProtoView;
    }, function($__m) {
      Renderer = $__m.Renderer;
    }, function($__m) {
      AppViewManagerUtils = $__m.AppViewManagerUtils;
    }, function($__m) {
      AppViewPool = $__m.AppViewPool;
    }, function($__m) {
      AppViewListener = $__m.AppViewListener;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      AppViewManager = (($traceurRuntime.createClass)(function(_viewPool, _viewListener, _utils, _renderer) {
        this._viewPool = _viewPool;
        this._viewListener = _viewListener;
        this._utils = _utils;
        this._renderer = _renderer;
      }, {
        getComponentView: function(hostLocation) {
          var hostView = internalView(hostLocation.parentView);
          var boundElementIndex = hostLocation.boundElementIndex;
          return hostView.componentChildViews[boundElementIndex].ref;
        },
        getViewContainer: function(location) {
          var hostView = internalView(location.parentView);
          return hostView.elementInjectors[location.boundElementIndex].getViewContainerRef();
        },
        getHostElement: function(hostViewRef) {
          return internalView(hostViewRef).elementRefs[0];
        },
        getNamedElementInComponentView: function(hostLocation, variableName) {
          var hostView = internalView(hostLocation.parentView);
          var boundElementIndex = hostLocation.boundElementIndex;
          var componentView = hostView.componentChildViews[boundElementIndex];
          if (isBlank(componentView)) {
            throw new BaseException(("There is no component directive at element " + boundElementIndex));
          }
          var elementIndex = componentView.proto.variableLocations.get(variableName);
          if (isBlank(elementIndex)) {
            throw new BaseException(("Could not find variable " + variableName));
          }
          return componentView.elementRefs[elementIndex];
        },
        getComponent: function(hostLocation) {
          var hostView = internalView(hostLocation.parentView);
          var boundElementIndex = hostLocation.boundElementIndex;
          return this._utils.getComponentInstance(hostView, boundElementIndex);
        },
        createRootHostView: function(hostProtoViewRef, overrideSelector, injector) {
          var hostProtoView = internalProtoView(hostProtoViewRef);
          var hostElementSelector = overrideSelector;
          if (isBlank(hostElementSelector)) {
            hostElementSelector = hostProtoView.elementBinders[0].componentDirective.metadata.selector;
          }
          var renderView = this._renderer.createRootHostView(hostProtoView.render, hostElementSelector);
          var hostView = this._utils.createView(hostProtoView, renderView, this, this._renderer);
          this._renderer.setEventDispatcher(hostView.render, hostView);
          this._createViewRecurse(hostView);
          this._viewListener.viewCreated(hostView);
          this._utils.hydrateRootHostView(hostView, injector);
          this._viewHydrateRecurse(hostView);
          return hostView.ref;
        },
        destroyRootHostView: function(hostViewRef) {
          var hostView = internalView(hostViewRef);
          this._viewDehydrateRecurse(hostView, true);
          this._renderer.destroyView(hostView.render);
          this._viewListener.viewDestroyed(hostView);
        },
        createViewInContainer: function(viewContainerLocation, atIndex, protoViewRef) {
          var context = arguments[3] !== (void 0) ? arguments[3] : null;
          var bindings = arguments[4] !== (void 0) ? arguments[4] : null;
          var protoView = internalProtoView(protoViewRef);
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          var contextView = null;
          var contextBoundElementIndex = null;
          if (isPresent(context)) {
            contextView = internalView(context.parentView);
            contextBoundElementIndex = context.boundElementIndex;
          }
          var view = this._createPooledView(protoView);
          this._renderer.attachViewInContainer(viewContainerLocation, atIndex, view.render);
          this._utils.attachViewInContainer(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, view);
          this._utils.hydrateViewInContainer(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, bindings);
          this._viewHydrateRecurse(view);
          return view.ref;
        },
        destroyViewInContainer: function(viewContainerLocation, atIndex) {
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          this._destroyViewInContainer(parentView, boundElementIndex, atIndex);
        },
        attachViewInContainer: function(viewContainerLocation, atIndex, viewRef) {
          var view = internalView(viewRef);
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          this._utils.attachViewInContainer(parentView, boundElementIndex, null, null, atIndex, view);
          this._renderer.attachViewInContainer(viewContainerLocation, atIndex, view.render);
          return viewRef;
        },
        detachViewInContainer: function(viewContainerLocation, atIndex) {
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
          this._renderer.detachViewInContainer(viewContainerLocation, atIndex, view.render);
          return view.ref;
        },
        _createPooledView: function(protoView) {
          var view = this._viewPool.getView(protoView);
          if (isBlank(view)) {
            view = this._utils.createView(protoView, this._renderer.createView(protoView.render), this, this._renderer);
            this._renderer.setEventDispatcher(view.render, view);
            this._createViewRecurse(view);
            this._viewListener.viewCreated(view);
          }
          return view;
        },
        _createViewRecurse: function(view) {
          var binders = view.proto.elementBinders;
          for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
            var binder = binders[binderIdx];
            if (binder.hasStaticComponent()) {
              var childView = this._createPooledView(binder.nestedProtoView);
              this._renderer.attachComponentView(view.elementRefs[binderIdx], childView.render);
              this._utils.attachComponentView(view, binderIdx, childView);
            }
          }
        },
        _destroyPooledView: function(view) {
          var wasReturned = this._viewPool.returnView(view);
          if (!wasReturned) {
            this._renderer.destroyView(view.render);
            this._viewListener.viewDestroyed(view);
          }
        },
        _destroyViewInContainer: function(parentView, boundElementIndex, atIndex) {
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          this._viewDehydrateRecurse(view, false);
          this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
          this._renderer.detachViewInContainer(parentView.elementRefs[boundElementIndex], atIndex, view.render);
          this._destroyPooledView(view);
        },
        _destroyComponentView: function(hostView, boundElementIndex, componentView) {
          this._viewDehydrateRecurse(componentView, false);
          this._renderer.detachComponentView(hostView.elementRefs[boundElementIndex], componentView.render);
          this._utils.detachComponentView(hostView, boundElementIndex);
          this._destroyPooledView(componentView);
        },
        _viewHydrateRecurse: function(view) {
          this._renderer.hydrateView(view.render);
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; ++i) {
            if (binders[i].hasStaticComponent()) {
              this._utils.hydrateComponentView(view, i);
              this._viewHydrateRecurse(view.componentChildViews[i]);
            }
          }
        },
        _viewDehydrateRecurse: function(view, forceDestroyComponents) {
          this._utils.dehydrateView(view);
          this._renderer.dehydrateView(view.render);
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; i++) {
            var componentView = view.componentChildViews[i];
            if (isPresent(componentView)) {
              if (forceDestroyComponents) {
                this._destroyComponentView(view, i, componentView);
              } else {
                this._viewDehydrateRecurse(componentView, false);
              }
            }
            var vc = view.viewContainers[i];
            if (isPresent(vc)) {
              for (var j = vc.views.length - 1; j >= 0; j--) {
                this._destroyViewInContainer(view, i, j);
              }
            }
          }
        }
      }, {}));
      $__export("AppViewManager", AppViewManager);
      $__export("AppViewManager", AppViewManager = __decorate([Injectable(), __metadata('design:paramtypes', [AppViewPool, AppViewListener, AppViewManagerUtils, Renderer])], AppViewManager));
    }
  };
});

System.register("angular2/src/render/dom/compiler/compiler", ["angular2/di", "angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/render/api", "angular2/src/render/dom/compiler/compile_pipeline", "angular2/src/render/dom/compiler/view_loader", "angular2/src/render/dom/compiler/compile_step_factory", "angular2/change_detection", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compiler";
  var __decorate,
      __metadata,
      Injectable,
      PromiseWrapper,
      BaseException,
      DOM,
      ViewDefinition,
      ViewType,
      RenderCompiler,
      CompilePipeline,
      ViewLoader,
      DefaultStepFactory,
      Parser,
      ShadowDomStrategy,
      DomCompiler,
      DefaultDomCompiler;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ViewDefinition = $__m.ViewDefinition;
      ViewType = $__m.ViewType;
      RenderCompiler = $__m.RenderCompiler;
    }, function($__m) {
      CompilePipeline = $__m.CompilePipeline;
    }, function($__m) {
      ViewLoader = $__m.ViewLoader;
    }, function($__m) {
      DefaultStepFactory = $__m.DefaultStepFactory;
    }, function($__m) {
      Parser = $__m.Parser;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      DomCompiler = (function($__super) {
        function DomCompiler(_stepFactory, _viewLoader) {
          $traceurRuntime.superConstructor(DomCompiler).call(this);
          this._stepFactory = _stepFactory;
          this._viewLoader = _viewLoader;
        }
        return ($traceurRuntime.createClass)(DomCompiler, {
          compile: function(view) {
            var $__0 = this;
            var tplPromise = this._viewLoader.load(view);
            return PromiseWrapper.then(tplPromise, (function(el) {
              return $__0._compileTemplate(view, el, ViewType.COMPONENT);
            }), (function(e) {
              throw new BaseException(("Failed to load the template for \"" + view.componentId + "\" : " + e));
            }));
          },
          compileHost: function(directiveMetadata) {
            var hostViewDef = new ViewDefinition({
              componentId: directiveMetadata.id,
              templateAbsUrl: null,
              template: null,
              styles: null,
              styleAbsUrls: null,
              directives: [directiveMetadata]
            });
            var element = DOM.createElement(directiveMetadata.selector);
            return this._compileTemplate(hostViewDef, element, ViewType.HOST);
          },
          _compileTemplate: function(viewDef, tplElement, protoViewType) {
            var pipeline = new CompilePipeline(this._stepFactory.createSteps(viewDef));
            var compileElements = pipeline.process(tplElement, protoViewType, viewDef.componentId);
            return PromiseWrapper.resolve(compileElements[0].inheritedProtoView.build());
          }
        }, {}, $__super);
      }(RenderCompiler));
      $__export("DomCompiler", DomCompiler);
      DefaultDomCompiler = (function($__super) {
        function $__1(parser, shadowDomStrategy, viewLoader) {
          $traceurRuntime.superConstructor($__1).call(this, new DefaultStepFactory(parser, shadowDomStrategy), viewLoader);
        }
        return ($traceurRuntime.createClass)($__1, {}, {}, $__super);
      }(DomCompiler));
      $__export("DefaultDomCompiler", DefaultDomCompiler);
      $__export("DefaultDomCompiler", DefaultDomCompiler = __decorate([Injectable(), __metadata('design:paramtypes', [Parser, ShadowDomStrategy, ViewLoader])], DefaultDomCompiler));
    }
  };
});

System.register("angular2/http", ["angular2/di", "angular2/src/http/http", "angular2/src/http/backends/xhr_backend", "angular2/src/http/backends/browser_xhr", "angular2/src/http/base_request_options", "angular2/src/http/interfaces", "angular2/src/http/backends/mock_backend", "angular2/src/http/static_request", "angular2/src/http/static_response", "angular2/src/http/base_response_options", "angular2/src/http/headers", "angular2/src/http/enums", "angular2/src/http/url_search_params"], function($__export) {
  "use strict";
  var __moduleName = "angular2/http";
  var bind,
      Http,
      XHRBackend,
      BrowserXhr,
      BaseRequestOptions,
      RequestOptions,
      ConnectionBackend,
      BaseResponseOptions,
      ResponseOptions,
      httpInjectables;
  return {
    setters: [function($__m) {
      bind = $__m.bind;
    }, function($__m) {
      Http = $__m.Http;
      $__export("Http", $__m.Http);
    }, function($__m) {
      XHRBackend = $__m.XHRBackend;
      $__export("XHRBackend", $__m.XHRBackend);
      $__export("XHRConnection", $__m.XHRConnection);
    }, function($__m) {
      BrowserXhr = $__m.BrowserXhr;
    }, function($__m) {
      BaseRequestOptions = $__m.BaseRequestOptions;
      RequestOptions = $__m.RequestOptions;
      $__export("BaseRequestOptions", $__m.BaseRequestOptions);
      $__export("RequestOptions", $__m.RequestOptions);
    }, function($__m) {
      ConnectionBackend = $__m.ConnectionBackend;
      $__export("Connection", $__m.Connection);
      $__export("ConnectionBackend", $__m.ConnectionBackend);
    }, function($__m) {
      $__export("MockConnection", $__m.MockConnection);
      $__export("MockBackend", $__m.MockBackend);
    }, function($__m) {
      $__export("Request", $__m.Request);
    }, function($__m) {
      $__export("Response", $__m.Response);
    }, function($__m) {
      BaseResponseOptions = $__m.BaseResponseOptions;
      ResponseOptions = $__m.ResponseOptions;
      $__export("BaseResponseOptions", $__m.BaseResponseOptions);
      $__export("ResponseOptions", $__m.ResponseOptions);
    }, function($__m) {
      $__export("Headers", $__m.Headers);
    }, function($__m) {
      $__export("ResponseTypes", $__m.ResponseTypes);
      $__export("ReadyStates", $__m.ReadyStates);
      $__export("RequestMethods", $__m.RequestMethods);
      $__export("RequestCredentialsOpts", $__m.RequestCredentialsOpts);
      $__export("RequestCacheOpts", $__m.RequestCacheOpts);
      $__export("RequestModesOpts", $__m.RequestModesOpts);
    }, function($__m) {
      $__export("URLSearchParams", $__m.URLSearchParams);
    }],
    execute: function() {
      httpInjectables = [bind(ConnectionBackend).toClass(XHRBackend), BrowserXhr, bind(RequestOptions).toClass(BaseRequestOptions), bind(ResponseOptions).toClass(BaseResponseOptions), Http];
      $__export("httpInjectables", httpInjectables);
    }
  };
});

System.register("angular2/di", ["angular2/src/di/annotations", "angular2/src/di/decorators", "angular2/src/di/annotations_impl", "angular2/src/di/forward_ref", "angular2/src/di/injector", "angular2/src/di/binding", "angular2/src/di/key", "angular2/src/di/exceptions", "angular2/src/di/opaque_token"], function($__export) {
  "use strict";
  var __moduleName = "angular2/di";
  return {
    setters: [function($__m) {
      $__export("InjectAnnotation", $__m.InjectAnnotation);
      $__export("OptionalAnnotation", $__m.OptionalAnnotation);
      $__export("InjectableAnnotation", $__m.InjectableAnnotation);
      $__export("DependencyAnnotation", $__m.DependencyAnnotation);
      $__export("VisibilityAnnotation", $__m.VisibilityAnnotation);
      $__export("SelfAnnotation", $__m.SelfAnnotation);
      $__export("ParentAnnotation", $__m.ParentAnnotation);
      $__export("AncestorAnnotation", $__m.AncestorAnnotation);
      $__export("UnboundedAnnotation", $__m.UnboundedAnnotation);
    }, function($__m) {
      $__export("Inject", $__m.Inject);
      $__export("Optional", $__m.Optional);
      $__export("Injectable", $__m.Injectable);
      $__export("Visibility", $__m.Visibility);
      $__export("Self", $__m.Self);
      $__export("Parent", $__m.Parent);
      $__export("Ancestor", $__m.Ancestor);
      $__export("Unbounded", $__m.Unbounded);
    }, function($__m) {
      $__export("self", $__m.self);
    }, function($__m) {
      $__export("forwardRef", $__m.forwardRef);
      $__export("resolveForwardRef", $__m.resolveForwardRef);
    }, function($__m) {
      $__export("resolveBindings", $__m.resolveBindings);
      $__export("Injector", $__m.Injector);
      $__export("ProtoInjector", $__m.ProtoInjector);
      $__export("PUBLIC_AND_PRIVATE", $__m.PUBLIC_AND_PRIVATE);
      $__export("PUBLIC", $__m.PUBLIC);
      $__export("PRIVATE", $__m.PRIVATE);
      $__export("undefinedValue", $__m.undefinedValue);
    }, function($__m) {
      $__export("Binding", $__m.Binding);
      $__export("BindingBuilder", $__m.BindingBuilder);
      $__export("ResolvedBinding", $__m.ResolvedBinding);
      $__export("Dependency", $__m.Dependency);
      $__export("bind", $__m.bind);
    }, function($__m) {
      $__export("Key", $__m.Key);
      $__export("KeyRegistry", $__m.KeyRegistry);
      $__export("TypeLiteral", $__m.TypeLiteral);
    }, function($__m) {
      $__export("NoBindingError", $__m.NoBindingError);
      $__export("AbstractBindingError", $__m.AbstractBindingError);
      $__export("AsyncBindingError", $__m.AsyncBindingError);
      $__export("CyclicDependencyError", $__m.CyclicDependencyError);
      $__export("InstantiationError", $__m.InstantiationError);
      $__export("InvalidBindingError", $__m.InvalidBindingError);
      $__export("NoAnnotationError", $__m.NoAnnotationError);
      $__export("OutOfBoundsError", $__m.OutOfBoundsError);
    }, function($__m) {
      $__export("OpaqueToken", $__m.OpaqueToken);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/compiler/element_injector", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/di", "angular2/src/di/injector", "angular2/src/core/annotations_impl/di", "angular2/src/core/compiler/view_manager", "angular2/src/core/compiler/view_container_ref", "angular2/src/core/compiler/element_ref", "angular2/src/core/compiler/view_ref", "angular2/src/core/annotations_impl/annotations", "angular2/src/core/compiler/directive_lifecycle_reflector", "angular2/change_detection", "angular2/src/core/compiler/query_list", "angular2/src/reflection/reflection", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/element_injector";
  var isPresent,
      isBlank,
      BaseException,
      stringify,
      StringWrapper,
      ObservableWrapper,
      ListWrapper,
      MapWrapper,
      Injector,
      ProtoInjector,
      PUBLIC_AND_PRIVATE,
      PUBLIC,
      PRIVATE,
      undefinedValue,
      Key,
      Dependency,
      Binding,
      ResolvedBinding,
      NoBindingError,
      resolveBindings,
      InjectorInlineStrategy,
      BindingWithVisibility,
      Attribute,
      Query,
      avmModule,
      ViewContainerRef,
      ElementRef,
      ProtoViewRef,
      Directive,
      Component,
      onChange,
      onDestroy,
      onCheck,
      onInit,
      onAllChangesDone,
      hasLifecycleHook,
      ChangeDetectorRef,
      QueryList,
      reflector,
      DirectiveMetadata,
      _staticKeys,
      StaticKeys,
      TreeNode,
      DirectiveDependency,
      DirectiveBinding,
      PreBuiltObjects,
      EventEmitterAccessor,
      HostActionAccessor,
      ProtoElementInjector,
      ElementInjector,
      ElementInjectorInlineStrategy,
      ElementInjectorDynamicStrategy,
      QueryError,
      QueryRef;
  function _createEventEmitterAccessors(bwv) {
    var binding = bwv.binding;
    if (!(binding instanceof DirectiveBinding))
      return [];
    var db = binding;
    return ListWrapper.map(db.eventEmitters, (function(eventConfig) {
      var fieldName;
      var eventName;
      var colonIdx = eventConfig.indexOf(':');
      if (colonIdx > -1) {
        fieldName = StringWrapper.substring(eventConfig, 0, colonIdx).trim();
        eventName = StringWrapper.substring(eventConfig, colonIdx + 1).trim();
      } else {
        fieldName = eventName = eventConfig;
      }
      return new EventEmitterAccessor(eventName, reflector.getter(fieldName));
    }));
  }
  function _createHostActionAccessors(bwv) {
    var binding = bwv.binding;
    if (!(binding instanceof DirectiveBinding))
      return [];
    var res = [];
    var db = binding;
    MapWrapper.forEach(db.hostActions, (function(actionExpression, actionName) {
      res.push(new HostActionAccessor(actionExpression, reflector.getter(actionName)));
    }));
    return res;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      stringify = $__m.stringify;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      Injector = $__m.Injector;
      ProtoInjector = $__m.ProtoInjector;
      PUBLIC_AND_PRIVATE = $__m.PUBLIC_AND_PRIVATE;
      PUBLIC = $__m.PUBLIC;
      PRIVATE = $__m.PRIVATE;
      undefinedValue = $__m.undefinedValue;
      Key = $__m.Key;
      Dependency = $__m.Dependency;
      Binding = $__m.Binding;
      ResolvedBinding = $__m.ResolvedBinding;
      NoBindingError = $__m.NoBindingError;
      resolveBindings = $__m.resolveBindings;
    }, function($__m) {
      InjectorInlineStrategy = $__m.InjectorInlineStrategy;
      BindingWithVisibility = $__m.BindingWithVisibility;
    }, function($__m) {
      Attribute = $__m.Attribute;
      Query = $__m.Query;
    }, function($__m) {
      avmModule = $__m;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      Directive = $__m.Directive;
      Component = $__m.Component;
      onChange = $__m.onChange;
      onDestroy = $__m.onDestroy;
      onCheck = $__m.onCheck;
      onInit = $__m.onInit;
      onAllChangesDone = $__m.onAllChangesDone;
    }, function($__m) {
      hasLifecycleHook = $__m.hasLifecycleHook;
    }, function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
    }, function($__m) {
      QueryList = $__m.QueryList;
    }, function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      DirectiveMetadata = $__m.DirectiveMetadata;
    }],
    execute: function() {
      StaticKeys = (function() {
        function StaticKeys() {
          this.viewManagerId = Key.get(avmModule.AppViewManager).id;
          this.protoViewId = Key.get(ProtoViewRef).id;
          this.viewContainerId = Key.get(ViewContainerRef).id;
          this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
          this.elementRefId = Key.get(ElementRef).id;
        }
        return ($traceurRuntime.createClass)(StaticKeys, {}, {instance: function() {
            if (isBlank(_staticKeys))
              _staticKeys = new StaticKeys();
            return _staticKeys;
          }});
      }());
      TreeNode = (function() {
        function TreeNode(parent) {
          this._head = null;
          this._tail = null;
          this._next = null;
          if (isPresent(parent))
            parent.addChild(this);
        }
        return ($traceurRuntime.createClass)(TreeNode, {
          addChild: function(child) {
            if (isPresent(this._tail)) {
              this._tail._next = child;
              this._tail = child;
            } else {
              this._tail = this._head = child;
            }
            child._next = null;
            child._parent = this;
          },
          addChildAfter: function(child, prevSibling) {
            if (isBlank(prevSibling)) {
              var prevHead = this._head;
              this._head = child;
              child._next = prevHead;
              if (isBlank(this._tail))
                this._tail = child;
            } else if (isBlank(prevSibling._next)) {
              this.addChild(child);
              return ;
            } else {
              child._next = prevSibling._next;
              prevSibling._next = child;
            }
            child._parent = this;
          },
          remove: function() {
            if (isBlank(this.parent))
              return ;
            var nextSibling = this._next;
            var prevSibling = this._findPrev();
            if (isBlank(prevSibling)) {
              this.parent._head = this._next;
            } else {
              prevSibling._next = this._next;
            }
            if (isBlank(nextSibling)) {
              this._parent._tail = prevSibling;
            }
            this._parent = null;
            this._next = null;
          },
          _findPrev: function() {
            var node = this.parent._head;
            if (node == this)
              return null;
            while (node._next !== this)
              node = node._next;
            return node;
          },
          get parent() {
            return this._parent;
          },
          get children() {
            var res = [];
            var child = this._head;
            while (child != null) {
              res.push(child);
              child = child._next;
            }
            return res;
          }
        }, {});
      }());
      $__export("TreeNode", TreeNode);
      DirectiveDependency = (function($__super) {
        function DirectiveDependency(key, optional, visibility, properties, attributeName, queryDecorator) {
          $traceurRuntime.superConstructor(DirectiveDependency).call(this, key, optional, visibility, properties);
          this.attributeName = attributeName;
          this.queryDecorator = queryDecorator;
          this._verify();
        }
        return ($traceurRuntime.createClass)(DirectiveDependency, {_verify: function() {
            var count = 0;
            if (isPresent(this.queryDecorator))
              count++;
            if (isPresent(this.attributeName))
              count++;
            if (count > 1)
              throw new BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
          }}, {
          createFrom: function(d) {
            return new DirectiveDependency(d.key, d.optional, d.visibility, d.properties, DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
          },
          _attributeName: function(properties) {
            var p = ListWrapper.find(properties, (function(p) {
              return p instanceof Attribute;
            }));
            return isPresent(p) ? p.attributeName : null;
          },
          _query: function(properties) {
            return ListWrapper.find(properties, (function(p) {
              return p instanceof Query;
            }));
          }
        }, $__super);
      }(Dependency));
      $__export("DirectiveDependency", DirectiveDependency);
      DirectiveBinding = (function($__super) {
        function DirectiveBinding(key, factory, dependencies, resolvedHostInjectables, resolvedViewInjectables, metadata) {
          $traceurRuntime.superConstructor(DirectiveBinding).call(this, key, factory, dependencies);
          this.resolvedHostInjectables = resolvedHostInjectables;
          this.resolvedViewInjectables = resolvedViewInjectables;
          this.metadata = metadata;
        }
        return ($traceurRuntime.createClass)(DirectiveBinding, {
          get callOnDestroy() {
            return this.metadata.callOnDestroy;
          },
          get callOnChange() {
            return this.metadata.callOnChange;
          },
          get callOnAllChangesDone() {
            return this.metadata.callOnAllChangesDone;
          },
          get displayName() {
            return this.key.displayName;
          },
          get eventEmitters() {
            return isPresent(this.metadata) && isPresent(this.metadata.events) ? this.metadata.events : [];
          },
          get hostActions() {
            return isPresent(this.metadata) && isPresent(this.metadata.hostActions) ? this.metadata.hostActions : new Map();
          },
          get changeDetection() {
            return this.metadata.changeDetection;
          }
        }, {
          createFromBinding: function(binding, ann) {
            if (isBlank(ann)) {
              ann = new Directive();
            }
            var rb = binding.resolve();
            var deps = ListWrapper.map(rb.dependencies, DirectiveDependency.createFrom);
            var resolvedHostInjectables = isPresent(ann.hostInjector) ? resolveBindings(ann.hostInjector) : [];
            var resolvedViewInjectables = ann instanceof Component && isPresent(ann.viewInjector) ? resolveBindings(ann.viewInjector) : [];
            var metadata = DirectiveMetadata.create({
              id: stringify(rb.key.token),
              type: ann instanceof Component ? DirectiveMetadata.COMPONENT_TYPE : DirectiveMetadata.DIRECTIVE_TYPE,
              selector: ann.selector,
              compileChildren: ann.compileChildren,
              events: ann.events,
              host: isPresent(ann.host) ? MapWrapper.createFromStringMap(ann.host) : null,
              properties: ann.properties,
              readAttributes: DirectiveBinding._readAttributes(deps),
              callOnDestroy: hasLifecycleHook(onDestroy, rb.key.token, ann),
              callOnChange: hasLifecycleHook(onChange, rb.key.token, ann),
              callOnCheck: hasLifecycleHook(onCheck, rb.key.token, ann),
              callOnInit: hasLifecycleHook(onInit, rb.key.token, ann),
              callOnAllChangesDone: hasLifecycleHook(onAllChangesDone, rb.key.token, ann),
              changeDetection: ann instanceof Component ? ann.changeDetection : null,
              exportAs: ann.exportAs
            });
            return new DirectiveBinding(rb.key, rb.factory, deps, resolvedHostInjectables, resolvedViewInjectables, metadata);
          },
          _readAttributes: function(deps) {
            var readAttributes = [];
            ListWrapper.forEach(deps, (function(dep) {
              if (isPresent(dep.attributeName)) {
                readAttributes.push(dep.attributeName);
              }
            }));
            return readAttributes;
          },
          createFromType: function(type, annotation) {
            var binding = new Binding(type, {toClass: type});
            return DirectiveBinding.createFromBinding(binding, annotation);
          }
        }, $__super);
      }(ResolvedBinding));
      $__export("DirectiveBinding", DirectiveBinding);
      PreBuiltObjects = (function() {
        function PreBuiltObjects(viewManager, view, protoView) {
          this.viewManager = viewManager;
          this.view = view;
          this.protoView = protoView;
        }
        return ($traceurRuntime.createClass)(PreBuiltObjects, {}, {});
      }());
      $__export("PreBuiltObjects", PreBuiltObjects);
      EventEmitterAccessor = (function() {
        function EventEmitterAccessor(eventName, getter) {
          this.eventName = eventName;
          this.getter = getter;
        }
        return ($traceurRuntime.createClass)(EventEmitterAccessor, {subscribe: function(view, boundElementIndex, directive) {
            var $__0 = this;
            var eventEmitter = this.getter(directive);
            return ObservableWrapper.subscribe(eventEmitter, (function(eventObj) {
              return view.triggerEventHandlers($__0.eventName, eventObj, boundElementIndex);
            }));
          }}, {});
      }());
      $__export("EventEmitterAccessor", EventEmitterAccessor);
      HostActionAccessor = (function() {
        function HostActionAccessor(methodName, getter) {
          this.methodName = methodName;
          this.getter = getter;
        }
        return ($traceurRuntime.createClass)(HostActionAccessor, {subscribe: function(view, boundElementIndex, directive) {
            var $__0 = this;
            var eventEmitter = this.getter(directive);
            return ObservableWrapper.subscribe(eventEmitter, (function(actionArgs) {
              return view.invokeElementMethod(boundElementIndex, $__0.methodName, actionArgs);
            }));
          }}, {});
      }());
      $__export("HostActionAccessor", HostActionAccessor);
      ProtoElementInjector = (function() {
        function ProtoElementInjector(parent, index, bwv, distanceToParent, _firstBindingIsComponent, directiveVariableBindings) {
          this.parent = parent;
          this.index = index;
          this.distanceToParent = distanceToParent;
          this._firstBindingIsComponent = _firstBindingIsComponent;
          this.directiveVariableBindings = directiveVariableBindings;
          var length = bwv.length;
          this.protoInjector = new ProtoInjector(bwv, distanceToParent);
          this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
          this.hostActionAccessors = ListWrapper.createFixedSize(length);
          for (var i = 0; i < length; ++i) {
            this.eventEmitterAccessors[i] = _createEventEmitterAccessors(bwv[i]);
            this.hostActionAccessors[i] = _createHostActionAccessors(bwv[i]);
          }
        }
        return ($traceurRuntime.createClass)(ProtoElementInjector, {
          instantiate: function(parent) {
            return new ElementInjector(this, parent);
          },
          directParent: function() {
            return this.distanceToParent < 2 ? this.parent : null;
          },
          get hasBindings() {
            return this.eventEmitterAccessors.length > 0;
          },
          getBindingAtIndex: function(index) {
            return this.protoInjector.getBindingAtIndex(index);
          }
        }, {
          create: function(parent, index, bindings, firstBindingIsComponent, distanceToParent, directiveVariableBindings) {
            var bd = [];
            ProtoElementInjector._createDirectiveBindingWithVisibility(bindings, bd, firstBindingIsComponent);
            if (firstBindingIsComponent) {
              ProtoElementInjector._createViewInjectorBindingWithVisibility(bindings, bd);
            }
            ProtoElementInjector._createHostInjectorBindingWithVisibility(bindings, bd, firstBindingIsComponent);
            return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent, directiveVariableBindings);
          },
          _createDirectiveBindingWithVisibility: function(dirBindings, bd, firstBindingIsComponent) {
            ListWrapper.forEach(dirBindings, (function(dirBinding) {
              bd.push(ProtoElementInjector._createBindingWithVisibility(firstBindingIsComponent, dirBinding, dirBindings, dirBinding));
            }));
          },
          _createHostInjectorBindingWithVisibility: function(dirBindings, bd, firstBindingIsComponent) {
            ListWrapper.forEach(dirBindings, (function(dirBinding) {
              ListWrapper.forEach(dirBinding.resolvedHostInjectables, (function(b) {
                bd.push(ProtoElementInjector._createBindingWithVisibility(firstBindingIsComponent, dirBinding, dirBindings, b));
              }));
            }));
          },
          _createBindingWithVisibility: function(firstBindingIsComponent, dirBinding, dirBindings, binding) {
            var isComponent = firstBindingIsComponent && dirBindings[0] === dirBinding;
            return new BindingWithVisibility(binding, isComponent ? PUBLIC_AND_PRIVATE : PUBLIC);
          },
          _createViewInjectorBindingWithVisibility: function(bindings, bd) {
            var db = bindings[0];
            ListWrapper.forEach(db.resolvedViewInjectables, (function(b) {
              return bd.push(new BindingWithVisibility(b, PRIVATE));
            }));
          }
        });
      }());
      $__export("ProtoElementInjector", ProtoElementInjector);
      ElementInjector = (function($__super) {
        function ElementInjector(_proto, parent) {
          $traceurRuntime.superConstructor(ElementInjector).call(this, parent);
          this._proto = _proto;
          this._preBuiltObjects = null;
          this._injector = new Injector(this._proto.protoInjector);
          this._injector.ei = this;
          var injectorStrategy = this._injector.internalStrategy;
          this._strategy = injectorStrategy instanceof InjectorInlineStrategy ? new ElementInjectorInlineStrategy(injectorStrategy, this) : new ElementInjectorDynamicStrategy(injectorStrategy, this);
          this.hydrated = false;
          this._buildQueries();
          this._addParentQueries();
        }
        return ($traceurRuntime.createClass)(ElementInjector, {
          dehydrate: function() {
            this.hydrated = false;
            this._host = null;
            this._preBuiltObjects = null;
            this._strategy.callOnDestroy();
            this._injector.internalStrategy.dehydrate();
          },
          onAllChangesDone: function() {
            if (isPresent(this._query0) && this._query0.originator === this) {
              this._query0.list.fireCallbacks();
            }
            if (isPresent(this._query1) && this._query1.originator === this) {
              this._query1.list.fireCallbacks();
            }
            if (isPresent(this._query2) && this._query2.originator === this) {
              this._query2.list.fireCallbacks();
            }
          },
          hydrate: function(imperativelyCreatedInjector, host, preBuiltObjects) {
            this._host = host;
            this._preBuiltObjects = preBuiltObjects;
            this._hydrateInjector(imperativelyCreatedInjector, host);
            this._addDirectivesToQueries();
            this._addVarBindingsToQueries();
            this.hydrated = true;
          },
          _hydrateInjector: function(imperativelyCreatedInjector, host) {
            if (isPresent(this._parent)) {
              this._reattachInjector(this._injector, this._parent._injector, false);
            } else {
              if (isPresent(imperativelyCreatedInjector) && isPresent(host)) {
                this._reattachInjector(imperativelyCreatedInjector, host._injector, true);
              }
              var parent = this._getParentInjector(imperativelyCreatedInjector, host);
              this._reattachInjector(this._injector, parent, true);
            }
          },
          _getParentInjector: function(injector, host) {
            if (isPresent(injector)) {
              return injector;
            } else if (isPresent(host)) {
              return host._injector;
            } else {
              return null;
            }
          },
          _reattachInjector: function(injector, parentInjector, isBoundary) {
            injector.internalStrategy.attach(parentInjector, isBoundary);
            injector.internalStrategy.hydrate();
          },
          hasVariableBinding: function(name) {
            var vb = this._proto.directiveVariableBindings;
            return isPresent(vb) && vb.has(name);
          },
          getVariableBinding: function(name) {
            var index = this._proto.directiveVariableBindings.get(name);
            return isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
          },
          get: function(token) {
            return this._injector.get(token);
          },
          hasDirective: function(type) {
            return isPresent(this._injector.getOptional(type));
          },
          getEventEmitterAccessors: function() {
            return this._proto.eventEmitterAccessors;
          },
          getHostActionAccessors: function() {
            return this._proto.hostActionAccessors;
          },
          getDirectiveVariableBindings: function() {
            return this._proto.directiveVariableBindings;
          },
          getComponent: function() {
            return this._strategy.getComponent();
          },
          getElementRef: function() {
            return this._preBuiltObjects.view.elementRefs[this._proto.index];
          },
          getViewContainerRef: function() {
            return new ViewContainerRef(this._preBuiltObjects.viewManager, this.getElementRef());
          },
          directParent: function() {
            return this._proto.distanceToParent < 2 ? this.parent : null;
          },
          isComponentKey: function(key) {
            return this._strategy.isComponentKey(key);
          },
          getDependency: function(dep) {
            var key = dep.key;
            if (!(dep instanceof DirectiveDependency))
              return undefinedValue;
            var dirDep = dep;
            var staticKeys = StaticKeys.instance();
            if (key.id === staticKeys.viewManagerId)
              return this._preBuiltObjects.viewManager;
            if (isPresent(dirDep.attributeName))
              return this._buildAttribute(dirDep);
            if (isPresent(dirDep.queryDecorator))
              return this._findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
              var componentView = this._preBuiltObjects.view.componentChildViews[this._proto.index];
              return componentView.changeDetector.ref;
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
              return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
              return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().protoViewId) {
              if (isBlank(this._preBuiltObjects.protoView)) {
                if (dirDep.optional) {
                  return null;
                }
                throw new NoBindingError(dirDep.key);
              }
              return new ProtoViewRef(this._preBuiltObjects.protoView);
            }
            return undefinedValue;
          },
          _buildAttribute: function(dep) {
            var attributes = this._proto.attributes;
            if (isPresent(attributes) && attributes.has(dep.attributeName)) {
              return attributes.get(dep.attributeName);
            } else {
              return null;
            }
          },
          _buildQueriesForDeps: function(deps) {
            for (var i = 0; i < deps.length; i++) {
              var dep = deps[i];
              if (isPresent(dep.queryDecorator)) {
                this._createQueryRef(dep.queryDecorator);
              }
            }
          },
          _addVarBindingsToQueries: function() {
            this._addVarBindingsToQuery(this._query0);
            this._addVarBindingsToQuery(this._query1);
            this._addVarBindingsToQuery(this._query2);
          },
          _addDirectivesToQueries: function() {
            this._addDirectivesToQuery(this._query0);
            this._addDirectivesToQuery(this._query1);
            this._addDirectivesToQuery(this._query2);
          },
          _addVarBindingsToQuery: function(queryRef) {
            if (isBlank(queryRef) || !queryRef.query.isVarBindingQuery)
              return ;
            var vb = queryRef.query.varBindings;
            for (var i = 0; i < vb.length; ++i) {
              if (this.hasVariableBinding(vb[i])) {
                queryRef.list.add(this.getVariableBinding(vb[i]));
              }
            }
          },
          _addDirectivesToQuery: function(queryRef) {
            if (isBlank(queryRef) || queryRef.query.isVarBindingQuery)
              return ;
            var matched = [];
            this.addDirectivesMatchingQuery(queryRef.query, matched);
            matched.forEach((function(s) {
              return queryRef.list.add(s);
            }));
          },
          _createQueryRef: function(query) {
            var queryList = new QueryList();
            if (isBlank(this._query0)) {
              this._query0 = new QueryRef(query, queryList, this);
            } else if (isBlank(this._query1)) {
              this._query1 = new QueryRef(query, queryList, this);
            } else if (isBlank(this._query2)) {
              this._query2 = new QueryRef(query, queryList, this);
            } else {
              throw new QueryError();
            }
          },
          addDirectivesMatchingQuery: function(query, list) {
            this._strategy.addDirectivesMatchingQuery(query, list);
          },
          _buildQueries: function() {
            if (isPresent(this._proto)) {
              this._strategy.buildQueries();
            }
          },
          _findQuery: function(query) {
            if (isPresent(this._query0) && this._query0.query === query) {
              return this._query0;
            }
            if (isPresent(this._query1) && this._query1.query === query) {
              return this._query1;
            }
            if (isPresent(this._query2) && this._query2.query === query) {
              return this._query2;
            }
            throw new BaseException(("Cannot find query for directive " + query + "."));
          },
          _hasQuery: function(query) {
            return this._query0 == query || this._query1 == query || this._query2 == query;
          },
          link: function(parent) {
            parent.addChild(this);
            this._addParentQueries();
          },
          linkAfter: function(parent, prevSibling) {
            parent.addChildAfter(this, prevSibling);
            this._addParentQueries();
          },
          _addParentQueries: function() {
            if (isBlank(this.parent))
              return ;
            if (isPresent(this.parent._query0)) {
              this._addQueryToTree(this.parent._query0);
              if (this.hydrated)
                this.parent._query0.update();
            }
            if (isPresent(this.parent._query1)) {
              this._addQueryToTree(this.parent._query1);
              if (this.hydrated)
                this.parent._query1.update();
            }
            if (isPresent(this.parent._query2)) {
              this._addQueryToTree(this.parent._query2);
              if (this.hydrated)
                this.parent._query2.update();
            }
          },
          unlink: function() {
            var queriesToUpdate = [];
            if (isPresent(this.parent._query0)) {
              this._pruneQueryFromTree(this.parent._query0);
              queriesToUpdate.push(this.parent._query0);
            }
            if (isPresent(this.parent._query1)) {
              this._pruneQueryFromTree(this.parent._query1);
              queriesToUpdate.push(this.parent._query1);
            }
            if (isPresent(this.parent._query2)) {
              this._pruneQueryFromTree(this.parent._query2);
              queriesToUpdate.push(this.parent._query2);
            }
            this.remove();
            ListWrapper.forEach(queriesToUpdate, (function(q) {
              return q.update();
            }));
          },
          _pruneQueryFromTree: function(query) {
            this._removeQueryRef(query);
            var child = this._head;
            while (isPresent(child)) {
              child._pruneQueryFromTree(query);
              child = child._next;
            }
          },
          _addQueryToTree: function(queryRef) {
            if (queryRef.query.descendants == false) {
              if (this == queryRef.originator) {
                this._addQueryToTreeSelfAndRecurse(queryRef);
              } else if (this.parent == queryRef.originator) {
                this._assignQueryRef(queryRef);
              }
            } else {
              this._addQueryToTreeSelfAndRecurse(queryRef);
            }
          },
          _addQueryToTreeSelfAndRecurse: function(queryRef) {
            this._assignQueryRef(queryRef);
            var child = this._head;
            while (isPresent(child)) {
              child._addQueryToTree(queryRef);
              child = child._next;
            }
          },
          _assignQueryRef: function(query) {
            if (isBlank(this._query0)) {
              this._query0 = query;
              return ;
            } else if (isBlank(this._query1)) {
              this._query1 = query;
              return ;
            } else if (isBlank(this._query2)) {
              this._query2 = query;
              return ;
            }
            throw new QueryError();
          },
          _removeQueryRef: function(query) {
            if (this._query0 == query)
              this._query0 = null;
            if (this._query1 == query)
              this._query1 = null;
            if (this._query2 == query)
              this._query2 = null;
          },
          getDirectiveAtIndex: function(index) {
            return this._injector.getAt(index);
          },
          hasInstances: function() {
            return this._proto.hasBindings && this.hydrated;
          },
          getHost: function() {
            return this._host;
          },
          getBoundElementIndex: function() {
            return this._proto.index;
          }
        }, {}, $__super);
      }(TreeNode));
      $__export("ElementInjector", ElementInjector);
      ElementInjectorInlineStrategy = (function() {
        function ElementInjectorInlineStrategy(injectorStrategy, _ei) {
          this.injectorStrategy = injectorStrategy;
          this._ei = _ei;
        }
        return ($traceurRuntime.createClass)(ElementInjectorInlineStrategy, {
          callOnDestroy: function() {
            var i = this.injectorStrategy;
            var p = i.protoStrategy;
            if (p.binding0 instanceof DirectiveBinding && p.binding0.callOnDestroy) {
              i.obj0.onDestroy();
            }
            if (p.binding1 instanceof DirectiveBinding && p.binding1.callOnDestroy) {
              i.obj1.onDestroy();
            }
            if (p.binding2 instanceof DirectiveBinding && p.binding2.callOnDestroy) {
              i.obj2.onDestroy();
            }
            if (p.binding3 instanceof DirectiveBinding && p.binding3.callOnDestroy) {
              i.obj3.onDestroy();
            }
            if (p.binding4 instanceof DirectiveBinding && p.binding4.callOnDestroy) {
              i.obj4.onDestroy();
            }
            if (p.binding5 instanceof DirectiveBinding && p.binding5.callOnDestroy) {
              i.obj5.onDestroy();
            }
            if (p.binding6 instanceof DirectiveBinding && p.binding6.callOnDestroy) {
              i.obj6.onDestroy();
            }
            if (p.binding7 instanceof DirectiveBinding && p.binding7.callOnDestroy) {
              i.obj7.onDestroy();
            }
            if (p.binding8 instanceof DirectiveBinding && p.binding8.callOnDestroy) {
              i.obj8.onDestroy();
            }
            if (p.binding9 instanceof DirectiveBinding && p.binding9.callOnDestroy) {
              i.obj9.onDestroy();
            }
          },
          getComponent: function() {
            return this.injectorStrategy.obj0;
          },
          isComponentKey: function(key) {
            return this._ei._proto._firstBindingIsComponent && isPresent(key) && key.id === this.injectorStrategy.protoStrategy.keyId0;
          },
          buildQueries: function() {
            var p = this.injectorStrategy.protoStrategy;
            if (p.binding0 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding0.dependencies);
            }
            if (p.binding1 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding1.dependencies);
            }
            if (p.binding2 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding2.dependencies);
            }
            if (p.binding3 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding3.dependencies);
            }
            if (p.binding4 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding4.dependencies);
            }
            if (p.binding5 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding5.dependencies);
            }
            if (p.binding6 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding6.dependencies);
            }
            if (p.binding7 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding7.dependencies);
            }
            if (p.binding8 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding8.dependencies);
            }
            if (p.binding9 instanceof DirectiveBinding) {
              this._ei._buildQueriesForDeps(p.binding9.dependencies);
            }
          },
          addDirectivesMatchingQuery: function(query, list) {
            var i = this.injectorStrategy;
            var p = i.protoStrategy;
            if (isPresent(p.binding0) && p.binding0.key.token === query.selector)
              list.push(i.obj0);
            if (isPresent(p.binding1) && p.binding1.key.token === query.selector)
              list.push(i.obj1);
            if (isPresent(p.binding2) && p.binding2.key.token === query.selector)
              list.push(i.obj2);
            if (isPresent(p.binding3) && p.binding3.key.token === query.selector)
              list.push(i.obj3);
            if (isPresent(p.binding4) && p.binding4.key.token === query.selector)
              list.push(i.obj4);
            if (isPresent(p.binding5) && p.binding5.key.token === query.selector)
              list.push(i.obj5);
            if (isPresent(p.binding6) && p.binding6.key.token === query.selector)
              list.push(i.obj6);
            if (isPresent(p.binding7) && p.binding7.key.token === query.selector)
              list.push(i.obj7);
            if (isPresent(p.binding8) && p.binding8.key.token === query.selector)
              list.push(i.obj8);
            if (isPresent(p.binding9) && p.binding9.key.token === query.selector)
              list.push(i.obj9);
          },
          getComponentBinding: function() {
            var p = this.injectorStrategy.protoStrategy;
            return p.binding0;
          }
        }, {});
      }());
      ElementInjectorDynamicStrategy = (function() {
        function ElementInjectorDynamicStrategy(injectorStrategy, _ei) {
          this.injectorStrategy = injectorStrategy;
          this._ei = _ei;
        }
        return ($traceurRuntime.createClass)(ElementInjectorDynamicStrategy, {
          callOnDestroy: function() {
            var ist = this.injectorStrategy;
            var p = ist.protoStrategy;
            for (var i = 0; i < p.bindings.length; i++) {
              if (p.bindings[i] instanceof DirectiveBinding && p.bindings[i].callOnDestroy) {
                ist.objs[i].onDestroy();
              }
            }
          },
          getComponent: function() {
            return this.injectorStrategy.objs[0];
          },
          isComponentKey: function(key) {
            var p = this.injectorStrategy.protoStrategy;
            return this._ei._proto._firstBindingIsComponent && isPresent(key) && key.id === p.keyIds[0];
          },
          buildQueries: function() {
            var p = this.injectorStrategy.protoStrategy;
            for (var i = 0; i < p.bindings.length; i++) {
              if (p.bindings[i] instanceof DirectiveBinding) {
                this._ei._buildQueriesForDeps(p.bindings[i].dependencies);
              }
            }
          },
          addDirectivesMatchingQuery: function(query, list) {
            var ist = this.injectorStrategy;
            var p = ist.protoStrategy;
            for (var i = 0; i < p.bindings.length; i++) {
              if (p.bindings[i].key.token === query.selector)
                list.push(ist.objs[i]);
            }
          },
          getComponentBinding: function() {
            var p = this.injectorStrategy.protoStrategy;
            return p.bindings[0];
          }
        }, {});
      }());
      QueryError = (function($__super) {
        function QueryError() {
          $traceurRuntime.superConstructor(QueryError).call(this);
          this.message = 'Only 3 queries can be concurrently active in a template.';
        }
        return ($traceurRuntime.createClass)(QueryError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("QueryError", QueryError);
      QueryRef = (function() {
        function QueryRef(query, list, originator) {
          this.query = query;
          this.list = list;
          this.originator = originator;
        }
        return ($traceurRuntime.createClass)(QueryRef, {
          update: function() {
            var aggregator = [];
            this.visit(this.originator, aggregator);
            this.list.reset(aggregator);
          },
          visit: function(inj, aggregator) {
            if (isBlank(inj) || !inj._hasQuery(this))
              return ;
            if (this.query.isVarBindingQuery) {
              this._aggregateVariableBindings(inj, aggregator);
            } else {
              this._aggregateDirective(inj, aggregator);
            }
            var child = inj._head;
            while (isPresent(child)) {
              this.visit(child, aggregator);
              child = child._next;
            }
          },
          _aggregateVariableBindings: function(inj, aggregator) {
            var vb = this.query.varBindings;
            for (var i = 0; i < vb.length; ++i) {
              if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
              }
            }
          },
          _aggregateDirective: function(inj, aggregator) {
            inj.addDirectivesMatchingQuery(this.query, aggregator);
          }
        }, {});
      }());
      $__export("QueryRef", QueryRef);
    }
  };
});

System.register("angular2/src/change_detection/change_detection", ["angular2/src/change_detection/jit_proto_change_detector", "angular2/src/change_detection/pregen_proto_change_detector", "angular2/src/change_detection/proto_change_detector", "angular2/src/change_detection/pipes/pipe_registry", "angular2/src/change_detection/pipes/iterable_changes", "angular2/src/change_detection/pipes/keyvalue_changes", "angular2/src/change_detection/pipes/observable_pipe", "angular2/src/change_detection/pipes/promise_pipe", "angular2/src/change_detection/pipes/uppercase_pipe", "angular2/src/change_detection/pipes/lowercase_pipe", "angular2/src/change_detection/pipes/json_pipe", "angular2/src/change_detection/pipes/limit_to_pipe", "angular2/src/change_detection/pipes/null_pipe", "angular2/src/change_detection/interfaces", "angular2/di", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detection";
  var __decorate,
      __metadata,
      __param,
      JitProtoChangeDetector,
      PregenProtoChangeDetector,
      DynamicProtoChangeDetector,
      PipeRegistry,
      IterableChangesFactory,
      KeyValueChangesFactory,
      ObservablePipeFactory,
      PromisePipeFactory,
      UpperCaseFactory,
      LowerCaseFactory,
      JsonPipe,
      LimitToPipeFactory,
      NullPipeFactory,
      ChangeDetection,
      Inject,
      Injectable,
      OpaqueToken,
      Optional,
      StringMapWrapper,
      CONST,
      CONST_EXPR,
      isPresent,
      keyValDiff,
      iterableDiff,
      async,
      uppercase,
      lowercase,
      json,
      limitTo,
      defaultPipes,
      preGeneratedProtoDetectors,
      PROTO_CHANGE_DETECTOR_KEY,
      PreGeneratedChangeDetection,
      DynamicChangeDetection,
      JitChangeDetection,
      defaultPipeRegistry;
  return {
    setters: [function($__m) {
      JitProtoChangeDetector = $__m.JitProtoChangeDetector;
    }, function($__m) {
      PregenProtoChangeDetector = $__m.PregenProtoChangeDetector;
    }, function($__m) {
      DynamicProtoChangeDetector = $__m.DynamicProtoChangeDetector;
    }, function($__m) {
      PipeRegistry = $__m.PipeRegistry;
    }, function($__m) {
      IterableChangesFactory = $__m.IterableChangesFactory;
    }, function($__m) {
      KeyValueChangesFactory = $__m.KeyValueChangesFactory;
    }, function($__m) {
      ObservablePipeFactory = $__m.ObservablePipeFactory;
    }, function($__m) {
      PromisePipeFactory = $__m.PromisePipeFactory;
    }, function($__m) {
      UpperCaseFactory = $__m.UpperCaseFactory;
    }, function($__m) {
      LowerCaseFactory = $__m.LowerCaseFactory;
    }, function($__m) {
      JsonPipe = $__m.JsonPipe;
    }, function($__m) {
      LimitToPipeFactory = $__m.LimitToPipeFactory;
    }, function($__m) {
      NullPipeFactory = $__m.NullPipeFactory;
    }, function($__m) {
      ChangeDetection = $__m.ChangeDetection;
    }, function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      OpaqueToken = $__m.OpaqueToken;
      Optional = $__m.Optional;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      CONST = $__m.CONST;
      CONST_EXPR = $__m.CONST_EXPR;
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      keyValDiff = CONST_EXPR([CONST_EXPR(new KeyValueChangesFactory()), CONST_EXPR(new NullPipeFactory())]);
      $__export("keyValDiff", keyValDiff);
      iterableDiff = CONST_EXPR([CONST_EXPR(new IterableChangesFactory()), CONST_EXPR(new NullPipeFactory())]);
      $__export("iterableDiff", iterableDiff);
      async = CONST_EXPR([CONST_EXPR(new ObservablePipeFactory()), CONST_EXPR(new PromisePipeFactory()), CONST_EXPR(new NullPipeFactory())]);
      $__export("async", async);
      uppercase = CONST_EXPR([CONST_EXPR(new UpperCaseFactory()), CONST_EXPR(new NullPipeFactory())]);
      $__export("uppercase", uppercase);
      lowercase = CONST_EXPR([CONST_EXPR(new LowerCaseFactory()), CONST_EXPR(new NullPipeFactory())]);
      $__export("lowercase", lowercase);
      json = CONST_EXPR([CONST_EXPR(new JsonPipe()), CONST_EXPR(new NullPipeFactory())]);
      $__export("json", json);
      limitTo = CONST_EXPR([CONST_EXPR(new LimitToPipeFactory()), CONST_EXPR(new NullPipeFactory())]);
      $__export("limitTo", limitTo);
      defaultPipes = CONST_EXPR({
        "iterableDiff": iterableDiff,
        "keyValDiff": keyValDiff,
        "async": async,
        "uppercase": uppercase,
        "lowercase": lowercase,
        "json": json,
        "limitTo": limitTo
      });
      $__export("defaultPipes", defaultPipes);
      preGeneratedProtoDetectors = {};
      $__export("preGeneratedProtoDetectors", preGeneratedProtoDetectors);
      PROTO_CHANGE_DETECTOR_KEY = CONST_EXPR(new OpaqueToken('ProtoChangeDetectors'));
      $__export("PROTO_CHANGE_DETECTOR_KEY", PROTO_CHANGE_DETECTOR_KEY);
      PreGeneratedChangeDetection = (function($__super) {
        function $__0(registry, protoChangeDetectorsForTest) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.registry = registry;
          this._dynamicChangeDetection = new DynamicChangeDetection(registry);
          this._protoChangeDetectorFactories = isPresent(protoChangeDetectorsForTest) ? protoChangeDetectorsForTest : preGeneratedProtoDetectors;
        }
        return ($traceurRuntime.createClass)($__0, {createProtoChangeDetector: function(definition) {
            var id = definition.id;
            if (StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
              return StringMapWrapper.get(this._protoChangeDetectorFactories, id)(this.registry, definition);
            }
            return this._dynamicChangeDetection.createProtoChangeDetector(definition);
          }}, {isSupported: function() {
            return PregenProtoChangeDetector.isSupported();
          }}, $__super);
      }(ChangeDetection));
      $__export("PreGeneratedChangeDetection", PreGeneratedChangeDetection);
      $__export("PreGeneratedChangeDetection", PreGeneratedChangeDetection = __decorate([Injectable(), __param(1, Inject(PROTO_CHANGE_DETECTOR_KEY)), __param(1, Optional()), __metadata('design:paramtypes', [PipeRegistry, Object])], PreGeneratedChangeDetection));
      DynamicChangeDetection = (function($__super) {
        function $__0(registry) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.registry = registry;
        }
        return ($traceurRuntime.createClass)($__0, {createProtoChangeDetector: function(definition) {
            return new DynamicProtoChangeDetector(this.registry, definition);
          }}, {}, $__super);
      }(ChangeDetection));
      $__export("DynamicChangeDetection", DynamicChangeDetection);
      $__export("DynamicChangeDetection", DynamicChangeDetection = __decorate([Injectable(), __metadata('design:paramtypes', [PipeRegistry])], DynamicChangeDetection));
      JitChangeDetection = (function($__super) {
        function $__0(registry) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.registry = registry;
        }
        return ($traceurRuntime.createClass)($__0, {createProtoChangeDetector: function(definition) {
            return new JitProtoChangeDetector(this.registry, definition);
          }}, {isSupported: function() {
            return JitProtoChangeDetector.isSupported();
          }}, $__super);
      }(ChangeDetection));
      $__export("JitChangeDetection", JitChangeDetection);
      $__export("JitChangeDetection", JitChangeDetection = __decorate([Injectable(), CONST(), __metadata('design:paramtypes', [PipeRegistry])], JitChangeDetection));
      defaultPipeRegistry = CONST_EXPR(new PipeRegistry(defaultPipes));
      $__export("defaultPipeRegistry", defaultPipeRegistry);
    }
  };
});

System.register("angular2/src/core/compiler/compiler", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/core/compiler/directive_resolver", "angular2/src/core/compiler/view_ref", "angular2/src/core/compiler/element_injector", "angular2/src/core/compiler/view_resolver", "angular2/src/core/compiler/component_url_mapper", "angular2/src/core/compiler/proto_view_factory", "angular2/src/services/url_resolver", "angular2/src/services/app_root_url", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/compiler";
  var __decorate,
      __metadata,
      Binding,
      resolveForwardRef,
      Injectable,
      Type,
      isBlank,
      isType,
      isPresent,
      BaseException,
      normalizeBlank,
      stringify,
      isArray,
      isPromise,
      PromiseWrapper,
      ListWrapper,
      Map,
      MapWrapper,
      DirectiveResolver,
      ProtoViewRef,
      DirectiveBinding,
      ViewResolver,
      ComponentUrlMapper,
      ProtoViewFactory,
      UrlResolver,
      AppRootUrl,
      renderApi,
      CompilerCache,
      Compiler;
  return {
    setters: [function($__m) {
      Binding = $__m.Binding;
      resolveForwardRef = $__m.resolveForwardRef;
      Injectable = $__m.Injectable;
    }, function($__m) {
      Type = $__m.Type;
      isBlank = $__m.isBlank;
      isType = $__m.isType;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      normalizeBlank = $__m.normalizeBlank;
      stringify = $__m.stringify;
      isArray = $__m.isArray;
      isPromise = $__m.isPromise;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      Map = $__m.Map;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      DirectiveResolver = $__m.DirectiveResolver;
    }, function($__m) {
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      DirectiveBinding = $__m.DirectiveBinding;
    }, function($__m) {
      ViewResolver = $__m.ViewResolver;
    }, function($__m) {
      ComponentUrlMapper = $__m.ComponentUrlMapper;
    }, function($__m) {
      ProtoViewFactory = $__m.ProtoViewFactory;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }, function($__m) {
      AppRootUrl = $__m.AppRootUrl;
    }, function($__m) {
      renderApi = $__m;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      CompilerCache = (($traceurRuntime.createClass)(function() {
        this._cache = new Map();
        this._hostCache = new Map();
      }, {
        set: function(component, protoView) {
          this._cache.set(component, protoView);
        },
        get: function(component) {
          var result = this._cache.get(component);
          return normalizeBlank(result);
        },
        setHost: function(component, protoView) {
          this._hostCache.set(component, protoView);
        },
        getHost: function(component) {
          var result = this._hostCache.get(component);
          return normalizeBlank(result);
        },
        clear: function() {
          this._cache.clear();
          this._hostCache.clear();
        }
      }, {}));
      $__export("CompilerCache", CompilerCache);
      $__export("CompilerCache", CompilerCache = __decorate([Injectable(), __metadata('design:paramtypes', [])], CompilerCache));
      Compiler = (($traceurRuntime.createClass)(function(reader, cache, viewResolver, componentUrlMapper, urlResolver, render, protoViewFactory, appUrl) {
        this._reader = reader;
        this._compilerCache = cache;
        this._compiling = new Map();
        this._viewResolver = viewResolver;
        this._componentUrlMapper = componentUrlMapper;
        this._urlResolver = urlResolver;
        this._appUrl = appUrl.value;
        this._render = render;
        this._protoViewFactory = protoViewFactory;
      }, {
        _bindDirective: function(directiveTypeOrBinding) {
          if (directiveTypeOrBinding instanceof DirectiveBinding) {
            return directiveTypeOrBinding;
          } else if (directiveTypeOrBinding instanceof Binding) {
            var annotation = this._reader.resolve(directiveTypeOrBinding.token);
            return DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
          } else {
            var annotation$__3 = this._reader.resolve(directiveTypeOrBinding);
            return DirectiveBinding.createFromType(directiveTypeOrBinding, annotation$__3);
          }
        },
        compileInHost: function(componentTypeOrBinding) {
          var $__0 = this;
          var componentType = isType(componentTypeOrBinding) ? componentTypeOrBinding : componentTypeOrBinding.token;
          var hostAppProtoView = this._compilerCache.getHost(componentType);
          var hostPvPromise;
          if (isPresent(hostAppProtoView)) {
            hostPvPromise = PromiseWrapper.resolve(hostAppProtoView);
          } else {
            var componentBinding = this._bindDirective(componentTypeOrBinding);
            Compiler._assertTypeIsComponent(componentBinding);
            var directiveMetadata = componentBinding.metadata;
            hostPvPromise = this._render.compileHost(directiveMetadata).then((function(hostRenderPv) {
              return $__0._compileNestedProtoViews(componentBinding, hostRenderPv, [componentBinding]);
            }));
          }
          return hostPvPromise.then((function(hostAppProtoView) {
            return new ProtoViewRef(hostAppProtoView);
          }));
        },
        _compile: function(componentBinding) {
          var $__0 = this;
          var component = componentBinding.key.token;
          var protoView = this._compilerCache.get(component);
          if (isPresent(protoView)) {
            return protoView;
          }
          var pvPromise = this._compiling.get(component);
          if (isPresent(pvPromise)) {
            return pvPromise;
          }
          var view = this._viewResolver.resolve(component);
          var directives = this._flattenDirectives(view);
          for (var i = 0; i < directives.length; i++) {
            if (!Compiler._isValidDirective(directives[i])) {
              throw new BaseException(("Unexpected directive value '" + stringify(directives[i]) + "' on the View of component '" + stringify(component) + "'"));
            }
          }
          var boundDirectives = this._removeDuplicatedDirectives(ListWrapper.map(directives, (function(directive) {
            return $__0._bindDirective(directive);
          })));
          var renderTemplate = this._buildRenderTemplate(component, view, boundDirectives);
          pvPromise = this._render.compile(renderTemplate).then((function(renderPv) {
            return $__0._compileNestedProtoViews(componentBinding, renderPv, boundDirectives);
          }));
          this._compiling.set(component, pvPromise);
          return pvPromise;
        },
        _removeDuplicatedDirectives: function(directives) {
          var directivesMap = new Map();
          directives.forEach((function(dirBinding) {
            directivesMap.set(dirBinding.key.id, dirBinding);
          }));
          return MapWrapper.values(directivesMap);
        },
        _compileNestedProtoViews: function(componentBinding, renderPv, directives) {
          var $__0 = this;
          var protoViews = this._protoViewFactory.createAppProtoViews(componentBinding, renderPv, directives);
          var protoView = protoViews[0];
          if (isPresent(componentBinding)) {
            var component = componentBinding.key.token;
            if (renderPv.type === renderApi.ViewType.COMPONENT) {
              this._compilerCache.set(component, protoView);
              MapWrapper.delete(this._compiling, component);
            } else {
              this._compilerCache.setHost(component, protoView);
            }
          }
          var nestedPVPromises = [];
          ListWrapper.forEach(this._collectComponentElementBinders(protoViews), (function(elementBinder) {
            var nestedComponent = elementBinder.componentDirective;
            var elementBinderDone = (function(nestedPv) {
              elementBinder.nestedProtoView = nestedPv;
            });
            var nestedCall = $__0._compile(nestedComponent);
            if (isPromise(nestedCall)) {
              nestedPVPromises.push(nestedCall.then(elementBinderDone));
            } else {
              elementBinderDone(nestedCall);
            }
          }));
          if (nestedPVPromises.length > 0) {
            return PromiseWrapper.all(nestedPVPromises).then((function(_) {
              return protoView;
            }));
          } else {
            return protoView;
          }
        },
        _collectComponentElementBinders: function(protoViews) {
          var componentElementBinders = [];
          ListWrapper.forEach(protoViews, (function(protoView) {
            ListWrapper.forEach(protoView.elementBinders, (function(elementBinder) {
              if (isPresent(elementBinder.componentDirective)) {
                componentElementBinders.push(elementBinder);
              }
            }));
          }));
          return componentElementBinders;
        },
        _buildRenderTemplate: function(component, view, directives) {
          var $__0 = this;
          var componentUrl = this._urlResolver.resolve(this._appUrl, this._componentUrlMapper.getUrl(component));
          var templateAbsUrl = null;
          var styleAbsUrls = null;
          if (isPresent(view.templateUrl)) {
            templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
          } else if (isPresent(view.template)) {
            templateAbsUrl = componentUrl;
          }
          if (isPresent(view.styleUrls)) {
            styleAbsUrls = ListWrapper.map(view.styleUrls, (function(url) {
              return $__0._urlResolver.resolve(componentUrl, url);
            }));
          }
          return new renderApi.ViewDefinition({
            componentId: stringify(component),
            templateAbsUrl: templateAbsUrl,
            template: view.template,
            styleAbsUrls: styleAbsUrls,
            styles: view.styles,
            directives: ListWrapper.map(directives, (function(directiveBinding) {
              return directiveBinding.metadata;
            }))
          });
        },
        _flattenDirectives: function(template) {
          if (isBlank(template.directives))
            return [];
          var directives = [];
          this._flattenList(template.directives, directives);
          return directives;
        },
        _flattenList: function(tree, out) {
          for (var i = 0; i < tree.length; i++) {
            var item = resolveForwardRef(tree[i]);
            if (isArray(item)) {
              this._flattenList(item, out);
            } else {
              out.push(item);
            }
          }
        }
      }, {
        _isValidDirective: function(value) {
          return isPresent(value) && (value instanceof Type || value instanceof Binding);
        },
        _assertTypeIsComponent: function(directiveBinding) {
          if (directiveBinding.metadata.type !== renderApi.DirectiveMetadata.COMPONENT_TYPE) {
            throw new BaseException(("Could not load '" + stringify(directiveBinding.key.token) + "' because it is not a component."));
          }
        }
      }));
      $__export("Compiler", Compiler);
      $__export("Compiler", Compiler = __decorate([Injectable(), __metadata('design:paramtypes', [DirectiveResolver, CompilerCache, ViewResolver, ComponentUrlMapper, UrlResolver, renderApi.RenderCompiler, ProtoViewFactory, AppRootUrl])], Compiler));
    }
  };
});

System.register("angular2/change_detection", ["angular2/src/change_detection/parser/ast", "angular2/src/change_detection/parser/lexer", "angular2/src/change_detection/parser/parser", "angular2/src/change_detection/parser/locals", "angular2/src/change_detection/exceptions", "angular2/src/change_detection/interfaces", "angular2/src/change_detection/constants", "angular2/src/change_detection/proto_change_detector", "angular2/src/change_detection/binding_record", "angular2/src/change_detection/directive_record", "angular2/src/change_detection/dynamic_change_detector", "angular2/src/change_detection/change_detector_ref", "angular2/src/change_detection/pipes/pipe_registry", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/pipes/pipe", "angular2/src/change_detection/pipes/null_pipe", "angular2/src/change_detection/change_detection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/change_detection";
  return {
    setters: [function($__m) {
      $__export("ASTWithSource", $__m.ASTWithSource);
      $__export("AST", $__m.AST);
      $__export("AstTransformer", $__m.AstTransformer);
      $__export("AccessMember", $__m.AccessMember);
      $__export("LiteralArray", $__m.LiteralArray);
      $__export("ImplicitReceiver", $__m.ImplicitReceiver);
    }, function($__m) {
      $__export("Lexer", $__m.Lexer);
    }, function($__m) {
      $__export("Parser", $__m.Parser);
    }, function($__m) {
      $__export("Locals", $__m.Locals);
    }, function($__m) {
      $__export("DehydratedException", $__m.DehydratedException);
      $__export("ExpressionChangedAfterItHasBeenChecked", $__m.ExpressionChangedAfterItHasBeenChecked);
      $__export("ChangeDetectionError", $__m.ChangeDetectionError);
    }, function($__m) {
      $__export("ChangeDetection", $__m.ChangeDetection);
      $__export("ChangeDetectorDefinition", $__m.ChangeDetectorDefinition);
    }, function($__m) {
      $__export("CHECK_ONCE", $__m.CHECK_ONCE);
      $__export("CHECK_ALWAYS", $__m.CHECK_ALWAYS);
      $__export("DETACHED", $__m.DETACHED);
      $__export("CHECKED", $__m.CHECKED);
      $__export("ON_PUSH", $__m.ON_PUSH);
      $__export("DEFAULT", $__m.DEFAULT);
    }, function($__m) {
      $__export("DynamicProtoChangeDetector", $__m.DynamicProtoChangeDetector);
    }, function($__m) {
      $__export("BindingRecord", $__m.BindingRecord);
    }, function($__m) {
      $__export("DirectiveIndex", $__m.DirectiveIndex);
      $__export("DirectiveRecord", $__m.DirectiveRecord);
    }, function($__m) {
      $__export("DynamicChangeDetector", $__m.DynamicChangeDetector);
    }, function($__m) {
      $__export("ChangeDetectorRef", $__m.ChangeDetectorRef);
    }, function($__m) {
      $__export("PipeRegistry", $__m.PipeRegistry);
    }, function($__m) {
      $__export("uninitialized", $__m.uninitialized);
    }, function($__m) {
      $__export("WrappedValue", $__m.WrappedValue);
      $__export("BasePipe", $__m.BasePipe);
    }, function($__m) {
      $__export("NullPipe", $__m.NullPipe);
      $__export("NullPipeFactory", $__m.NullPipeFactory);
    }, function($__m) {
      $__export("defaultPipes", $__m.defaultPipes);
      $__export("DynamicChangeDetection", $__m.DynamicChangeDetection);
      $__export("JitChangeDetection", $__m.JitChangeDetection);
      $__export("PreGeneratedChangeDetection", $__m.PreGeneratedChangeDetection);
      $__export("preGeneratedProtoDetectors", $__m.preGeneratedProtoDetectors);
      $__export("defaultPipeRegistry", $__m.defaultPipeRegistry);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/application", ["angular2/di", "angular2/src/facade/lang", "angular2/src/dom/browser_adapter", "angular2/src/dom/dom_adapter", "angular2/src/core/compiler/compiler", "angular2/src/reflection/reflection", "angular2/change_detection", "angular2/src/core/exception_handler", "angular2/src/render/dom/compiler/view_loader", "angular2/src/render/dom/compiler/style_url_resolver", "angular2/src/render/dom/compiler/style_inliner", "angular2/src/core/compiler/view_resolver", "angular2/src/core/compiler/directive_resolver", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/core/zone/ng_zone", "angular2/src/core/life_cycle/life_cycle", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy", "angular2/src/render/xhr", "angular2/src/render/xhr_impl", "angular2/src/render/dom/events/event_manager", "angular2/src/render/dom/events/key_events", "angular2/src/render/dom/events/hammer_gestures", "angular2/src/core/compiler/component_url_mapper", "angular2/src/services/url_resolver", "angular2/src/services/app_root_url", "angular2/src/core/compiler/dynamic_component_loader", "angular2/src/core/testability/testability", "angular2/src/core/compiler/view_pool", "angular2/src/core/compiler/view_manager", "angular2/src/core/compiler/view_manager_utils", "angular2/src/core/compiler/view_listener", "angular2/src/core/compiler/proto_view_factory", "angular2/src/render/api", "angular2/src/render/dom/dom_renderer", "angular2/src/render/dom/compiler/compiler", "angular2/src/core/compiler/view_ref", "angular2/src/core/application_tokens"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/application";
  var Injector,
      bind,
      isBlank,
      isPresent,
      assertionsEnabled,
      BrowserDomAdapter,
      DOM,
      Compiler,
      CompilerCache,
      Reflector,
      reflector,
      Parser,
      Lexer,
      ChangeDetection,
      DynamicChangeDetection,
      JitChangeDetection,
      PreGeneratedChangeDetection,
      PipeRegistry,
      defaultPipeRegistry,
      ExceptionHandler,
      ViewLoader,
      StyleUrlResolver,
      StyleInliner,
      ViewResolver,
      DirectiveResolver,
      ListWrapper,
      PromiseWrapper,
      NgZone,
      LifeCycle,
      ShadowDomStrategy,
      EmulatedUnscopedShadowDomStrategy,
      XHR,
      XHRImpl,
      EventManager,
      DomEventsPlugin,
      KeyEventsPlugin,
      HammerGesturesPlugin,
      ComponentUrlMapper,
      UrlResolver,
      AppRootUrl,
      DynamicComponentLoader,
      TestabilityRegistry,
      Testability,
      AppViewPool,
      APP_VIEW_POOL_CAPACITY,
      AppViewManager,
      AppViewManagerUtils,
      AppViewListener,
      ProtoViewFactory,
      Renderer,
      RenderCompiler,
      DomRenderer,
      DOCUMENT_TOKEN,
      DefaultDomCompiler,
      internalView,
      appComponentRefToken,
      appComponentTypeToken,
      _rootInjector,
      _rootBindings,
      ApplicationRef;
  function _injectorBindings(appComponentType) {
    var bestChangeDetection = DynamicChangeDetection;
    if (PreGeneratedChangeDetection.isSupported()) {
      bestChangeDetection = PreGeneratedChangeDetection;
    } else if (JitChangeDetection.isSupported()) {
      bestChangeDetection = JitChangeDetection;
    }
    return [bind(DOCUMENT_TOKEN).toValue(DOM.defaultDoc()), bind(appComponentTypeToken).toValue(appComponentType), bind(appComponentRefToken).toFactory((function(dynamicComponentLoader, injector, testability, registry) {
      return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector).then((function(componentRef) {
        registry.registerApplication(componentRef.location.nativeElement, testability);
        return componentRef;
      }));
    }), [DynamicComponentLoader, Injector, Testability, TestabilityRegistry]), bind(appComponentType).toFactory((function(p) {
      return p.then((function(ref) {
        return ref.instance;
      }));
    }), [appComponentRefToken]), bind(LifeCycle).toFactory((function(exceptionHandler) {
      return new LifeCycle(exceptionHandler, null, assertionsEnabled());
    }), [ExceptionHandler]), bind(EventManager).toFactory((function(ngZone) {
      var plugins = [new HammerGesturesPlugin(), new KeyEventsPlugin(), new DomEventsPlugin()];
      return new EventManager(plugins, ngZone);
    }), [NgZone]), bind(ShadowDomStrategy).toFactory((function(doc) {
      return new EmulatedUnscopedShadowDomStrategy(doc.head);
    }), [DOCUMENT_TOKEN]), DomRenderer, DefaultDomCompiler, bind(Renderer).toAlias(DomRenderer), bind(RenderCompiler).toAlias(DefaultDomCompiler), ProtoViewFactory, AppViewPool, bind(APP_VIEW_POOL_CAPACITY).toValue(10000), AppViewManager, AppViewManagerUtils, AppViewListener, Compiler, CompilerCache, ViewResolver, bind(PipeRegistry).toValue(defaultPipeRegistry), bind(ChangeDetection).toClass(bestChangeDetection), ViewLoader, DirectiveResolver, Parser, Lexer, ExceptionHandler, bind(XHR).toValue(new XHRImpl()), ComponentUrlMapper, UrlResolver, StyleUrlResolver, StyleInliner, DynamicComponentLoader, Testability, AppRootUrl];
  }
  function _createNgZone(givenReporter) {
    var defaultErrorReporter = (function(exception, stackTrace) {
      var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
      DOM.logError((exception + "\n\n" + longStackTrace));
      throw exception;
    });
    var reporter = isPresent(givenReporter) ? givenReporter : defaultErrorReporter;
    var zone = new NgZone({enableLongStackTrace: assertionsEnabled()});
    zone.initCallbacks({onErrorHandler: reporter});
    return zone;
  }
  function bootstrap(appComponentType) {
    var componentInjectableBindings = arguments[1] !== (void 0) ? arguments[1] : null;
    var errorReporter = arguments[2] !== (void 0) ? arguments[2] : null;
    BrowserDomAdapter.makeCurrent();
    var bootstrapProcess = PromiseWrapper.completer();
    var zone = _createNgZone(errorReporter);
    zone.run((function() {
      var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);
      var compRefToken = PromiseWrapper.wrap((function() {
        return appInjector.get(appComponentRefToken);
      }));
      var tick = (function(componentRef) {
        var appChangeDetector = internalView(componentRef.hostView).changeDetector;
        var lc = appInjector.get(LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick();
        bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
      });
      PromiseWrapper.then(compRefToken, tick, (function(err, stackTrace) {
        bootstrapProcess.reject(err, stackTrace);
      }));
    }));
    return bootstrapProcess.promise;
  }
  function _createAppInjector(appComponentType, bindings, zone) {
    if (isBlank(_rootInjector))
      _rootInjector = Injector.resolveAndCreate(_rootBindings);
    var mergedBindings = isPresent(bindings) ? ListWrapper.concat(_injectorBindings(appComponentType), bindings) : _injectorBindings(appComponentType);
    mergedBindings.push(bind(NgZone).toValue(zone));
    return _rootInjector.resolveAndCreateChild(mergedBindings);
  }
  $__export("bootstrap", bootstrap);
  return {
    setters: [function($__m) {
      Injector = $__m.Injector;
      bind = $__m.bind;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      assertionsEnabled = $__m.assertionsEnabled;
    }, function($__m) {
      BrowserDomAdapter = $__m.BrowserDomAdapter;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      Compiler = $__m.Compiler;
      CompilerCache = $__m.CompilerCache;
    }, function($__m) {
      Reflector = $__m.Reflector;
      reflector = $__m.reflector;
    }, function($__m) {
      Parser = $__m.Parser;
      Lexer = $__m.Lexer;
      ChangeDetection = $__m.ChangeDetection;
      DynamicChangeDetection = $__m.DynamicChangeDetection;
      JitChangeDetection = $__m.JitChangeDetection;
      PreGeneratedChangeDetection = $__m.PreGeneratedChangeDetection;
      PipeRegistry = $__m.PipeRegistry;
      defaultPipeRegistry = $__m.defaultPipeRegistry;
    }, function($__m) {
      ExceptionHandler = $__m.ExceptionHandler;
    }, function($__m) {
      ViewLoader = $__m.ViewLoader;
    }, function($__m) {
      StyleUrlResolver = $__m.StyleUrlResolver;
    }, function($__m) {
      StyleInliner = $__m.StyleInliner;
    }, function($__m) {
      ViewResolver = $__m.ViewResolver;
    }, function($__m) {
      DirectiveResolver = $__m.DirectiveResolver;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      NgZone = $__m.NgZone;
    }, function($__m) {
      LifeCycle = $__m.LifeCycle;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }, function($__m) {
      EmulatedUnscopedShadowDomStrategy = $__m.EmulatedUnscopedShadowDomStrategy;
    }, function($__m) {
      XHR = $__m.XHR;
    }, function($__m) {
      XHRImpl = $__m.XHRImpl;
    }, function($__m) {
      EventManager = $__m.EventManager;
      DomEventsPlugin = $__m.DomEventsPlugin;
    }, function($__m) {
      KeyEventsPlugin = $__m.KeyEventsPlugin;
    }, function($__m) {
      HammerGesturesPlugin = $__m.HammerGesturesPlugin;
    }, function($__m) {
      ComponentUrlMapper = $__m.ComponentUrlMapper;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }, function($__m) {
      AppRootUrl = $__m.AppRootUrl;
    }, function($__m) {
      DynamicComponentLoader = $__m.DynamicComponentLoader;
    }, function($__m) {
      TestabilityRegistry = $__m.TestabilityRegistry;
      Testability = $__m.Testability;
    }, function($__m) {
      AppViewPool = $__m.AppViewPool;
      APP_VIEW_POOL_CAPACITY = $__m.APP_VIEW_POOL_CAPACITY;
    }, function($__m) {
      AppViewManager = $__m.AppViewManager;
    }, function($__m) {
      AppViewManagerUtils = $__m.AppViewManagerUtils;
    }, function($__m) {
      AppViewListener = $__m.AppViewListener;
    }, function($__m) {
      ProtoViewFactory = $__m.ProtoViewFactory;
    }, function($__m) {
      Renderer = $__m.Renderer;
      RenderCompiler = $__m.RenderCompiler;
    }, function($__m) {
      DomRenderer = $__m.DomRenderer;
      DOCUMENT_TOKEN = $__m.DOCUMENT_TOKEN;
    }, function($__m) {
      DefaultDomCompiler = $__m.DefaultDomCompiler;
    }, function($__m) {
      internalView = $__m.internalView;
    }, function($__m) {
      appComponentRefToken = $__m.appComponentRefToken;
      appComponentTypeToken = $__m.appComponentTypeToken;
    }],
    execute: function() {
      _rootBindings = [bind(Reflector).toValue(reflector), TestabilityRegistry];
      ApplicationRef = (function() {
        function ApplicationRef(hostComponent, hostComponentType, injector) {
          this._hostComponent = hostComponent;
          this._injector = injector;
          this._hostComponentType = hostComponentType;
        }
        return ($traceurRuntime.createClass)(ApplicationRef, {
          get hostComponentType() {
            return this._hostComponentType;
          },
          get hostComponent() {
            return this._hostComponent.instance;
          },
          dispose: function() {
            this._hostComponent.dispose();
          },
          get injector() {
            return this._injector;
          }
        }, {});
      }());
      $__export("ApplicationRef", ApplicationRef);
    }
  };
});

System.register("angular2/core", ["angular2/src/core/annotations/view", "angular2/src/core/application", "angular2/src/core/application_tokens", "angular2/src/core/annotations/di", "angular2/src/core/compiler/compiler", "angular2/src/core/compiler/interfaces", "angular2/src/core/compiler/query_list", "angular2/src/core/compiler/directive_resolver", "angular2/src/core/compiler/dynamic_component_loader", "angular2/src/core/compiler/view_ref", "angular2/src/core/compiler/view_container_ref", "angular2/src/core/compiler/element_ref", "angular2/src/facade/async", "angular2/src/core/zone/ng_zone"], function($__export) {
  "use strict";
  var __moduleName = "angular2/core";
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("ViewRef", $__m.ViewRef);
      $__export("ProtoViewRef", $__m.ProtoViewRef);
    }, function($__m) {
      $__export("ViewContainerRef", $__m.ViewContainerRef);
    }, function($__m) {
      $__export("ElementRef", $__m.ElementRef);
    }, function($__m) {
      $__export("EventEmitter", $__m.EventEmitter);
    }, function($__m) {
      $__export("NgZone", $__m.NgZone);
    }],
    execute: function() {}
  };
});

System.register("angular2/angular2", ["angular2/change_detection", "angular2/di", "angular2/core", "angular2/annotations", "angular2/directives", "angular2/forms", "angular2/http", "angular2/src/facade/async", "angular2/src/render/api", "angular2/src/render/dom/dom_renderer"], function($__export) {
  "use strict";
  var __moduleName = "angular2/angular2";
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  return {
    setters: [function($__m) {
      $__export("DehydratedException", $__m.DehydratedException);
      $__export("ExpressionChangedAfterItHasBeenChecked", $__m.ExpressionChangedAfterItHasBeenChecked);
      $__export("ChangeDetectionError", $__m.ChangeDetectionError);
      $__export("ChangeDetection", $__m.ChangeDetection);
      $__export("ON_PUSH", $__m.ON_PUSH);
      $__export("DEFAULT", $__m.DEFAULT);
      $__export("ChangeDetectorRef", $__m.ChangeDetectorRef);
      $__export("PipeRegistry", $__m.PipeRegistry);
      $__export("WrappedValue", $__m.WrappedValue);
      $__export("NullPipe", $__m.NullPipe);
      $__export("NullPipeFactory", $__m.NullPipeFactory);
      $__export("defaultPipes", $__m.defaultPipes);
      $__export("DynamicChangeDetection", $__m.DynamicChangeDetection);
      $__export("JitChangeDetection", $__m.JitChangeDetection);
      $__export("PreGeneratedChangeDetection", $__m.PreGeneratedChangeDetection);
      $__export("preGeneratedProtoDetectors", $__m.preGeneratedProtoDetectors);
      $__export("defaultPipeRegistry", $__m.defaultPipeRegistry);
      $__export("DirectiveIndex", $__m.DirectiveIndex);
      $__export("BindingRecord", $__m.BindingRecord);
      $__export("Locals", $__m.Locals);
      $__export("ChangeDetectorDefinition", $__m.ChangeDetectorDefinition);
      $__export("BasePipe", $__m.BasePipe);
      $__export("DirectiveRecord", $__m.DirectiveRecord);
    }, function($__m) {
      $__export("Inject", $__m.Inject);
      $__export("Optional", $__m.Optional);
      $__export("Injectable", $__m.Injectable);
      $__export("forwardRef", $__m.forwardRef);
      $__export("resolveForwardRef", $__m.resolveForwardRef);
      $__export("Injector", $__m.Injector);
      $__export("ProtoInjector", $__m.ProtoInjector);
      $__export("Binding", $__m.Binding);
      $__export("bind", $__m.bind);
      $__export("Key", $__m.Key);
      $__export("NoBindingError", $__m.NoBindingError);
      $__export("AbstractBindingError", $__m.AbstractBindingError);
      $__export("AsyncBindingError", $__m.AsyncBindingError);
      $__export("CyclicDependencyError", $__m.CyclicDependencyError);
      $__export("InstantiationError", $__m.InstantiationError);
      $__export("InvalidBindingError", $__m.InvalidBindingError);
      $__export("NoAnnotationError", $__m.NoAnnotationError);
      $__export("OpaqueToken", $__m.OpaqueToken);
      $__export("ResolvedBinding", $__m.ResolvedBinding);
      $__export("BindingBuilder", $__m.BindingBuilder);
      $__export("Dependency", $__m.Dependency);
      $__export("Visibility", $__m.Visibility);
      $__export("Self", $__m.Self);
      $__export("Parent", $__m.Parent);
      $__export("Ancestor", $__m.Ancestor);
      $__export("Unbounded", $__m.Unbounded);
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("AbstractControl", $__m.AbstractControl);
      $__export("Control", $__m.Control);
      $__export("ControlGroup", $__m.ControlGroup);
      $__export("ControlArray", $__m.ControlArray);
      $__export("NgControlName", $__m.NgControlName);
      $__export("NgFormControl", $__m.NgFormControl);
      $__export("NgModel", $__m.NgModel);
      $__export("NgControl", $__m.NgControl);
      $__export("NgControlGroup", $__m.NgControlGroup);
      $__export("NgFormModel", $__m.NgFormModel);
      $__export("NgForm", $__m.NgForm);
      $__export("DefaultValueAccessor", $__m.DefaultValueAccessor);
      $__export("CheckboxControlValueAccessor", $__m.CheckboxControlValueAccessor);
      $__export("SelectControlValueAccessor", $__m.SelectControlValueAccessor);
      $__export("formDirectives", $__m.formDirectives);
      $__export("Validators", $__m.Validators);
      $__export("NgValidator", $__m.NgValidator);
      $__export("NgRequiredValidator", $__m.NgRequiredValidator);
      $__export("FormBuilder", $__m.FormBuilder);
      $__export("formInjectables", $__m.formInjectables);
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("Observable", $__m.Observable);
      $__export("EventEmitter", $__m.EventEmitter);
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("DomRenderer", $__m.DomRenderer);
      $__export("DOCUMENT_TOKEN", $__m.DOCUMENT_TOKEN);
    }],
    execute: function() {}
  };
});
