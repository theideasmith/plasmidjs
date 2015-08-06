(function(root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory(root);
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory(root));
    } else {
        // Browser globals
        root.Promoter = factory(root);
    }
}(this, function(global) {

    Object.filter = function( obj, predicate) {
        var result = {}, key;
        // ---------------^---- as noted by @CMS,
        //      always declare variables with the "var" keyword

        for (key in obj) {
            if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
                result[key] = obj[key];
            }
        }

        return result;
    };


    function Plasmid(target, options) {
        options = options || {};
        if (typeof target !== "object") {
            throw new Error("You can only operate on objects");
        }
        var _induced = {};
        var _exposed_functions = options.exposed || Object.keys(target);
        var _default = true;
        if (options.start !== undefined) _default = options.start;


        var _failure_func = null;

        function fail(){
            if(_failure_func) _failure_func();
        }

        function write(p, value){

            if ((_induced[p]!==null) && (typeof p === 'string')){
                _induced[p] = value;
            } else {
                throw new Error("invalid type ", typeof p, "passed. Cannot change state of invalid method");
            }
        }

        function repress(p){
            args = Array.prototype.slice.call(arguments, 0);
            args.forEach(function(arg){
                write(arg,false);
            });
        }

        function induce(p){
            args = Array.prototype.slice.call(arguments, 0);
            args.forEach(function(arg){
                write(arg,true);
            });
        }

        function fill(value, predicate){
            for (promoter in _induced){
                write(promoter, predicate ? predicate(promoter) : value);
            }

        }
        var _plasmid = {};
        _plasmid.ligate = function(promoter, gene/*function*/){
            write(promoter, _default);
            if ((!this[promoter])&&(typeof gene === 'function')){
                this[promoter] = function(){
                    args = Array.prototype.slice.call(arguments, 0);
                    if (_induced[promoter] === true) {
                        return gene.apply(target, args);
                    } else {
                        return fail(promoter, new Error("attemped to call repressed method " + promoter));
                    }
                };
            } else {
                throw new Error("plasmid@ligate invalid type ", typeof gene, "not of type function");
            }
        };

        _plasmid.induce = function(){
            args = Array.prototype.slice.call(arguments,0);
            induce.apply(this, args);
            return _plasmid;
        };

        _plasmid.repress = function(){
            args = Array.prototype.slice.call(arguments,0);
            induce.apply(this,args);
            return _plasmid;
        };

        _plasmid.all = function(val){
            fill(val);
            return _plasmid;
        };

        _plasmid.only = function(){
            fill(false);
            args = Array.prototype.slice.call(arguments,0);
            induce.apply(this,args);
            return _plasmid;
        };

        _plasmid.except = function(){
            fill(true);
            args = Array.prototype.slice.call(arguments,0);
            repress.apply(this, args);
            return _plasmid;
        };

        _plasmid.induced = function(){
            Object.filter(Object.keys(_induced), function(promoter){
                return _induced[promoter] == true;
            });
        };

        _plasmid.repressed = function(){
            Object.filter(Object.keys(_induced), function(promoter){
                return _induced[promoter] == false;
            });
        };

        _plasmid.fail = function( failure_func ){
            if ( typeof failure_func !== 'function' && (_failure_func===null)) throw new Error("plasmid@fail invalid type ", typeof failure_func, " not of type function");
            _failure_func = failure_func;
        };
        var self = this;
        _exposed_functions
        .forEach(function(func_name){
            _plasmid.ligate(func_name, target[func_name]);
        });

        return _plasmid;
    };
    return {
        Promote: function(object, options){
            return new Plasmid(object, options);
        }
    };
}));
