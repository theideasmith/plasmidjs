(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node, or CommonJS-Like environments
    module.exports = factory(root)
  } else if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory(root))
  } else {
    // Browser globals
    root.Promoter = factory(root)
  }
}(this, function(global) {

  Object.filter = function(obj, predicate) {
    var result = {},
      key
      // ---------------^---- as noted by @CMS,
      //      always declare variables with the "var" keyword

    for (key in obj) {
      if (obj.hasOwnProperty(key) &&
        !predicate(obj[key])) {

        result[key] = obj[key]
      }
    }

    return result

  }


  function Promoter() {

  }

  function Operon() {
    var pipeline = {
      pre: [],
      actual: [],
      post: [],
      all: []
    }

    function genPipeline() {

      pipeline
        .all = pipeline
        .pre
        .concat(pipeline.actual)
        .concat(pipeline.post)

      pipeline.all = pipeline.actual
    }
    genPipeline()

    function syncNext() {

    }

    function asyncNext() {


    }

    function next() {
      if (index === pipeline.all.length) return

    }

  }

  function Gene(func, options) {

    if (typeof func !== 'function')
      throw new TypeError("Gene@Gene Can only make" +
        "genes out of functions")

    var options = {}

    var _options = {
      sync: options.sync || true,
      context: options.context || func,
      induced: options.induced,
      name: options.name || null
    }

    var _executing = false
    var _index = 0
    var _dispatchers = []
    var _induced = _options.induced
    var _destroyed = false
    var _failure_func

    function fail() {
      if (!_failure_func) return
      if (!_failure_func.func) return
      var args = arrArr(arguments)
      return _failure_func.func.apply(
        _failure_func.context || _options.context, args)

    }

    function arrArr(args) {
      if (args && typeof args === 'object')
        return Array.prototype.slice.call(args, 0)
    }

    var _default_dispatcher = {
      func: func,
      context: _options.context
    }

    function addDispatcher(dispatcher) {
      if (!(dispatcher.matcher &&
          typeof dispatcher.matcher === 'function')) {

        throw new TypeError(
          "Error while adding dispatcher " +
          "Can only add functions as matcher")
      }

      if (!(dispatcher.func &&
          typeof dispatcher.func === 'function')) {

        throw new TypeError(
          "Error while adding dispatcher" +
          "Can only add functions to dispatch to")

      }
      if (!dispatcher.context) {
        dispatcher.context = _options.context
      }
      _dispatchers.unshift(dispatcher)
    }

    function dispatch() {

      var args = Array
                  .prototype
                  .slice
                  .call(arguments, 0)

      var hit_valid_matcher = false
      var res
      var i = 0
      while (!hit_valid_matcher && (i < _dispatchers.length)) {

        var dispatcher = _dispatchers[i]

        if (dispatcher
          .matcher
          .apply(dispatcher.context, args)) {

          res = dispatcher
            .func
            .apply(dispatcher.context, args)
          hit_valid_matcher = true

        }
        i++
      }

      if (!hit_valid_matcher) {
        res = _default_dispatcher
          .func
          .apply(_default_dispatcher
            .context, args)
      }
      return res
    }

    function gene() {

      _executing = true
      if ((_induced === false) || (_destroyed === true)) {
        return fail.apply(this, [_options.name, arrArr(arguments)])

      }

      var args = arrArr(arguments)
      var r = dispatch.apply(this, args)
      _executing = false
      return r


    }

    gene.connect = function(matcherfunc, func, context) {
      // if(_executing === true) return
      if (typeof func !== 'function') {

        throw new TypeError("plasmid.gene@connect " +
          "can only connect to functions, not " + typeof func)

      }
      if (typeof matcherfunc !== 'function') {

        throw new TypeError("plasmid.gene@connect " +
          "can only match using function, not " +
          typeof matcherfunc)

      }

      var dispatcherfuncs = {
        matcher: matcherfunc,
        func: func,
        context: context || _default_dispatcher.context
      }

      addDispatcher(dispatcherfuncs)
      return this
    }

    gene.induce = function() {
      _induced = true
      return this
    }

    gene.repress = function() {
      _induced = false
      return this
    }

    gene.fail = function(func, context) {
      if (func && typeof func === 'function' && _executing === false) {
        _failure_func = {
          func: func,
          context: context
        }
      } else {
        throw new TypeError(
          "Invalid type", " ", typeof func, " passed for failure function", " only type 'function' valid")
      }
      return this
    }

    gene.induced = function() {
      return _induced
    }

    gene.repressed = function() {
      return !_induced
    }
    gene.destroy = function(){
      _destroyed = true
      return this
    }
    gene.name = _options.name

    return gene

  }



  function Plasmid(target, options) {
    options = options || {}
    target = target || {}
    if (typeof target !== "object") {
      throw new TypeError("You can only operate on objects")
    }

    var _exposed_functions =
      options.exposed ||
      Object.keys(target).filter(function(e){return target[e] !== null})

    var _start_induced = true
    if (options.induced !== undefined) {
      _start_induced = options.induced
    }

    var _funcs = {}
    var _plasmid = {}


    function write(name, to) {
      if (typeof to === 'boolean' && _funcs[name]) {
        to === true ? _funcs[name].induce() : _funcs[name].repress()
      }
    }

    function fill(names, value) {
      names.forEach(function(name) {
        write(name, value)
      })

    }

    /**
     *
     * Adds a new method to the plasmid object
     * allowing you to recombinate multiple genes
     * from different organisms into one
     * and each time a gene is called,
     * it runs in the same context as the original organism.
     *
     * "biology is beautiful
     *      ...so is source code"
     *
     */

    _plasmid.recombinate = function(promoter, func, context) {
      if (typeof func !== 'function'){
        this[promoter] = func
        return this
      }

      if (context && (typeof context !== 'object'))
        throw new TypeError("plasmid@recombinate type " + typeof context + "invalid. Can only call method", "in context of 'object'")

      var gene = new Gene(func, {
        context: context || target,
        induced: _start_induced,
        name: promoter
      })
      this[promoter] = _funcs[promoter] = gene
      return this
    }

    _plasmid.all = function(val) {
      fill(Object.keys(_funcs), val)
      return _plasmid
    }

    _plasmid.only = function() {
      args = Array.prototype.slice.call(arguments, 0)

      fill(Object.keys(_funcs), false)
      fill(args, true)
      return _plasmid
    }

    _plasmid.except = function() {
      args = Array.prototype.slice.call(arguments, 0)
      fill(Object.keys(_funcs), true)
      fill(args, false)
      return _plasmid
    }

    /**
     * Information functions
     */

    _plasmid.induced = function() {
      Object.filter(Object.keys(_induced), function(promoter) {
        return _plasmid[promoter].induced === true
      })
    }

    _plasmid.repressed = function() {
      Object.filter(Object.keys(_induced), function(promoter) {
        return _plasmid[promoter].induced === false
      })
    }

    _plasmid.fail = function(failure_func, context) {
      if (typeof failure_func !== 'function' &&
        (_failure_func === null)) {
        throw new TypeError("plasmid@fail invalid type ", typeof failure_func, " not of type function")

      }
      for (f in _funcs) {
        var func = _funcs[f]
        func.fail(failure_func, context)
      }
    }

    /**
     *
     * Adding all the passed object's methods
     * to the newly created plasmid instance
     *
     */
    _exposed_functions.forEach(function(func_name) {
      _plasmid.recombinate(func_name, target[func_name], target)
    })

    return _plasmid
  }
  return {
    assemble: function(object, options) {
      return new Plasmid(object, options)
    },
    Plasmid: function(object, options) {
      return Plasmid.call(this, object, options)
    },
    Gene: function() {
      return Gene.call(this, arguments[0], arguments[1])
    }
  }
}))
