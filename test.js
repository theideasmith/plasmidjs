var path = require('path');
var mocha = require('mocha');
var should = require('should');
var plasmid = require('./plasmid');

describe("Am-Plasmid", function(){

  var insert = {
      sulA: function(){
          return "SulA gene was expressed"
      },
      lexA: function(){
          return "I repressed sulA"
      },
      mirror: function(arg){
          // args = Array.prototype.slice.call(arguments, 0)
          // return args
          return arg
      }
  }



  var sulA = insert.sulA()
  var lexA = insert.lexA()
  var mirror = insert
        .mirror("What the heck is a riboswitch?")

  var recombinant

  beforeEach(function(){
      recombinant = plasmid.assemble(insert)
      should.exist(recombinant)
  })

  it("should exist", function(){
      var plasmid_exists = !(plasmid == null)
      should(plasmid_exists).equal(true)
  })

  it("should wrap an object in a plasmid object", function(){
      should(recombinant!=null).equal(true)
  })

  it("should include the same methods "+
     " as wrapped object", function(){

      Object.keys(insert).forEach(function(method){
          should(recombinant[method]).not.equal(null)
      })

  })
  it("wrapped object functions should behave " +
      "as normal when not repressed", function(){

      should(recombinant.sulA()).equal(sulA)
      should(recombinant.lexA()).equal(lexA)
      should(recombinant.mirror(mirror)).equal(mirror)
  })

  it("if alloff passed, "+
  " functions should return undefined", function(){

      var rec = plasmid.assemble(insert, {induced: false})
      should(rec.sulA()).equal(undefined)
      should(rec.lexA()).equal(undefined)
      should(rec.mirror()).equal(undefined)
  })

  it("repressed functions should return undefined", function(){

      recombinant.all(false)
      should(recombinant.sulA()).equal(undefined)
      should(recombinant.lexA()).equal(undefined)
      should(recombinant.mirror()).equal(undefined)
  })

  it("when except called, everything " +
  " but the 'except's should work", function(){

      recombinant.except('mirror','lexA')
      should(recombinant.sulA()).equal(sulA)
      should(recombinant.lexA()).equal(undefined)
      should(recombinant.mirror()).equal(undefined)
  })

  it("when only called,"+
  " only the 'only's should work ", function(){

      recombinant.only('mirror','lexA')
      res = {
          lexA: recombinant.lexA(),
          sulA: recombinant.sulA(),
          mirror: recombinant.mirror(mirror)
      }

      should(res.sulA).equal(undefined)
      should(res.lexA).equal(lexA)
      should(res.mirror).equal(mirror)
  })

  describe("Gene", function(){

    function matchStr(a){
      return typeof a === 'string'
    }

    function matchNum(n){
      return typeof n === 'number'
    }

    it("when a wrapped function is induced," +
    " it should work."+
    " When represed, it shouldn't", function(){

      recombinant.all(false)
      recombinant.sulA.induce()().should.equal(sulA)
      should(recombinant.sulA.repress()()).equal(undefined)

    })

    it("should bind the appropriate matcher functions"+
      " to appropriate response functions", function(){

        var string = "old eagles only order out"
        var integer = 42
        var func = function(){}

        recombinant.mirror.connect(matchStr, function(a){
          console.log("Handling string: ", string)
          return "STRING"
        })

        recombinant.mirror.connect(matchNum, function(a){
            console.log("Handling number: ", a)
            return "INTEGER"
        })

        recombinant.mirror(func).should.equal(func)
        recombinant.mirror(string).should.equal("STRING")
        recombinant.mirror(integer).should.equal("INTEGER")

    })

    it("should call a failure function"+
    " when a turned off method is called", function(){
      function hello(thing){
        return "Hello, " + thing
      }

      var hi = new plasmid.Gene(hello, {name: "hello"})
      hi('world')//=> "Hello, world"

      hi.fail(function(function_name, arguments){

        return "Function " + function_name + " failed with: " + arguments.toString()

      })

      hi.repress()('bob').should.equal("Function hello failed with: bob")

    })

    it("should match to the second matcher function "+
      "when two are passed that both match", function() {
        recombinant.mirror.connect(matchStr, function(){
          return "first"
        })

        recombinant.mirror.connect(matchStr, function(){
          return "second"
        })

        recombinant.mirror("string").should.equal("second")
    })
  })
})
