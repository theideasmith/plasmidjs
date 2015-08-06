var path = require('path');
var mocha = require('mocha');
var should = require('should');
var SRC = './'
var plasmid = require('./plasmid.js');

describe("Am-Plasmid", function(){

    var insert = {
        sulA: function(){
            return "SulA gene was expressed";
        },
        lexA: function(){
            return "I repressed sulA";
        },
        mirror: function(arg){
            // args = Array.prototype.slice.call(arguments, 0);
            // return args;
            return arg;
        }
    };
    var sulA = insert.sulA();
    var lexA = insert.lexA();
    var mirror = insert.mirror("What the heck is a riboswitch?");

    var recombinant;

    beforeEach(function(){
        recombinant = plasmid.Promote(insert);
    })

    it("should exist", function(){
        var plasmid_exists = !(plasmid == null);
        should(plasmid_exists).equal(true);
    });

    it("should wrap an object in a plasmid object", function(){
        should(recombinant!=null).equal(true);
    });

    it("should include the same methods as wrapped object", function(){
        Object.keys(insert).forEach(function(method){
            should(recombinant[method]).not.equal(null);
        })
    });
    it("wrapped object functions should behave as normal when not repressed", function(){
        should(recombinant.sulA()).equal(sulA);
        should(recombinant.lexA()).equal(lexA);
        should(recombinant.mirror("What the heck is a riboswitch?")).equal(mirror);
    });

    it("if alloff passed, functions should return undefined", function(){
        var rec = plasmid.Promote(insert, {start: false});
        should(rec.sulA()).equal(undefined);
        should(rec.lexA()).equal(undefined);
        should(rec.mirror()).equal(undefined);
    });

    it("repressed functions should return undefined", function(){
        recombinant.all(false);
        should(recombinant.sulA()).equal(undefined);
        should(recombinant.lexA()).equal(undefined);
        should(recombinant.mirror()).equal(undefined);
    });

    it("when except called, everything but the 'except's should work", function(){
        recombinant.except('mirror','lexA');
        should(recombinant.sulA()).equal(sulA);
        should(recombinant.lexA()).equal(undefined);
        should(recombinant.mirror()).equal(undefined);
    });

    it("when only called, only the 'only's should work ", function(){
        recombinant.only('mirror','lexA');
        res = {
            lexA: recombinant.lexA(),
            sulA: recombinant.sulA(),
            mirror: recombinant.mirror(mirror)
        };

        should(res.sulA).equal(undefined);
        should(res.lexA).equal(lexA);
        should(res.mirror).equal(mirror);
    });

})
