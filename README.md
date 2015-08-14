# Plasmidjs
[![Build Status](https://travis-ci.org/theideasmith/plasmidjs.svg?m)](https://travis-ci.org/theideasmith/plasmidjs)

[![NPM](https://nodei.co/npm-dl/plasmidjs.png?months=1)](https://nodei.co/npm/<plasmidjs>/)
[![NPM](https://nodei.co/npm/plasmidjs.png?months=1)](https://nodei.co/npm/plasmidjs/)

Plasmidjs allows you to treat an object as a cell and each of its methods as genes allowing you to control which methods/genes are switched on, and what happens if an *switched-off* method is called.

This is the child of synthetic biology and nodejs and was inspired by the author's experience at Cooper Union's Summer STEM iGem track as well as by [conduitjs](https://github.com/ifandelse/ConduitJS).

Some modules that make for excellent integrations with plasmidjs are:

+ **machina.js** finite state machine
+ **is.js** check if a string is X (a url, an email, a date, etc.)
+ **conduit.js** wrap pre and post invocation functions around a function
+ **joi.js** validate object against JSON schema

`npm install plasmidjs`

## Background

Synthetic biology is defined as:
> an interdisciplinary branch of biology, combining disciplines such as biotechnology, evolutionary biology, molecular biology, systems biology, biophysics, computer engineering, and is in many ways related to genetic engineering.

Synthetic biologists study the construction of new biological mechanisms and ways to optimize their design and development. More specifically, synthetic biologists can design custom DNA and insert it into a cell to engineer organisms to their liking and solve many of the world's problems.

Usually, the type of DNA used is a plasmid – hence the name *Plasmidjs* . After DNA insertion, the cell begins to express whichever functions are encoded by the genes in this DNA. Sometimes, it is necessary that only certain genes be activated at a time. This feat is accomplished by the use of a special part of DNA called a promoter which can switch genes on and off.

Very simply, the promoter is either induced or repressed. If it is repressed, the gene it controls is not expressed. If it is induced, the gene it controls is expressed.

## So what?

Concepts from synthetic biology provide the perfect metaphor for a javascript library that enables you to switch on and off object functions.

```javascript
var plasmid = require('plasmidjs')

var organism = {
    height: 50,
    grow: function(){
        this.height+=3
        return this.height
    },

    ideas: [
        "never let your schooling interfere with your eduction",
        "you dont get what you don't ask for",
        "be persistent",
        "take advantage of the fact you exist",
        "automate things"
    ],
    think: function(){
        return this.ideas.pop() || "I'm all out of ideas"
    },

    position: {x: 0, y: 0},
    walk: function(x, y){
        this.position.x = x
        this.position.y = y
        return this.position
    }
}

/*
 * Create our plasmid
 *
 */
var cell = plasmid.assemble( organism )


```
Start simple

```javascript
cell.think() //=> "never let your schooling interfere with your eduction"

/*
 * Turn a gene off
 */
cell.think.repress()() //=> undefined

/*
 * Turn a gene on
 */
cell.think.induce()()//=> "you dont get what you don't ask for"

```

Let's get complicated

```javascript

/*
 * Only one gene is on.
 */
cell.only('grow').think()//=> undefined
cell.induced()//=> ['grow']
cell.repressed()//=> ['think','walk']
cell.grow()//=> 53

/*
 * Turning all genes on
 */
cell.all(true).think()//=> "be persistent"

/*
 * All genes except walk
 */
cell.except('grow').grow()//=> undefined
cell.walk(20,15)//=> {x: 20, y:15}
```

Hopefully you're impressed.

## Docs

The module is broken into two parts: `Plasmid`, which wraps an entire object, and `Gene` which wraps each function of the newly created plasmid object. Methods can be repressed and induced. When induced, genes perform as expected i.e, mimicking the behavior of the function they wrap. When repressed, genes do nothing at all or perform whichever behavior is specified by their failure function.

+ Plasmid
  + `var obj = new plasmid.Plasmid( old_obj, [options])`
  + `var obj = plasmid.assemble(old_obj, [options])`
  + `obj.fail( failure_func )`
  + `obj.all( state )`
  + `obj.only( method, ... `)
  + `obj.except( method, ... )`
  + `obj.induced()`
  + `obj.repressed()`

+ Gene
  + `var gene = new plasmid.Gene( function, [options])`
  + `gene.connect( matcher, responder)`
  + `gene.induce()`
  + `gene.repress()`
  + `gene.fail( failure_func )`
  + `gene.induced()`
  + `gene.repressed()`
  + `gene.destroy()`

## Plasmid
### var obj = new plasmid.Plasmid( target, [options])

Creates a new plasmid that wraps `target`. Note: creating a new plasmid will not modify the original object. Instead, the module creates a new object with the plasmid instance functions as well as the wrapped object's own functions, that when called execute with the `this` context of the wrapped object.

`old_obj`: the object to wrap
`options`: an optional options object with the following (all optional) fields:
```javascript
    {
        exposed: ["method", [ "another method"]],
        induced: <true | false>
    }
```
`options.exposed`: and array containing the names of the functions of the target that should be wrapped.
`options.induced`: whether the wrapped methods should start induced. Otherwise, they are repressed. Defaults to true.

### var obj = plasmid.assemble(old_obj, [options])

Creates a new plasmid just like `new plasmid.Plasmid` but without the need for the `new` keyword. This method was created for the sake of language, allowing you to write such elaborate code as `var recombinant_dna = plasmid.assemble( insert )`. If you are familiar with synthetic biology, you should be really excited.

### obj.fail( failure_func )

Pass a failure function to be called when any repressed method is called. Under the hood, it uses `gene.failure`

```javascript
cell.fail( function(method_name, args{
   /*----( Your code here )----*/
})

```

### obj.all( true | false )
Set the state of all genes
`true`: induced
`false`: repressed
**Returns** the plasmid object, for chaining

### obj.only( method, ... )

Induce the genes specified by their name
**Returns** the plasmid object, for chaining

### obj.except( method, ... )

Turn every gene on except for those specified by their name
**Returns** the plasmid object, for chaining

### obj.induced()

Returns an array of induced genes

### obj.repressed()

Returns an array of repressed genes

##Gene

Genes wrap regular functions in `Gene` instances that can be switched on and off with ease.

### var gene = new plasmid.Gene( function, [options])

Wraps a function in a gene instance function, allowing you to add meta-functionality to the original function.

Options:

```javascript
{
  context: object,
  name: the name of the gene,
  induced: < true | false >,

}
```

`context` the object in whose context to run the wrapped function,
`name`: the name of the gene, used to identify it as well as when failure functions are called
`induced`: whether the gene should start as being induced.

### gene.connect( matcher, responder)

SConnects a matcher function to a specific responder, allowing you to very easily determine which function should handle a specific instance of arguments. Note: the responder will be called instead of the regular gene function.

```javascript

function matchStr(a){
  return typeof a === 'string'
}

var insert = {

    mirror: function(arg){
        // args = Array.prototype.slice.call(arguments, 0)
        // return args
        return arg
    }
}

var recombinant = plasmid.assemble(insert)
var string = "old eagles only order out"
var integer = 42

recombinant.mirror.connect(matchStr, function(a){
  console.log("Handling string: ", string)
  return "mirrored STRING"
})

recombinant.mirror.connect(matchNum, function(a){
    console.log("Handling number: ", a)
    return "mirrored INTEGER"
})

/*
 * Look below
 */
 recombinant.mirror("Hello")//=>"Hello"
recombinant.mirror(string)//=>  "mirrored STRING"
recombinant.mirror(integer)//=> "mirrored INTEGER"

```

### gene.induce()

Turn the gene one

### gene.repress()

Turn the gene off

### gene.fail( function )

Called when the gene function is invoked while simultaneously being repressed. Whatever the failure function returns will be returned when the repressed gene is invoked.

```javascript

function hello(thing){
  return "Hello, " + thing
}

var hi = new plasmid.Gene(hello, {name: "hello"})
hi('world')//=> "Hello, world"

hi.fail(function(function_name, arguments){

  return "Function " + function_name + "failed with: " + arguments.toString()

})

hi.repress()('bob')//=> "Function hello failed with: 'bob'"

```

### gene.induced()

**Returns** whether the gene is induced

### gene.repressed()

**Returns** whether the gene is repressed

### gene.destroy()

Prevent the gene from ever being used again!

## Contributions

Yes! Contribute!

On a more serious note, I would like to see plasmidjs become the de-facto module for meta - functions. I'd like to add the ability to create waterfalls of async and sync functions, add pre and post gene invocation functions, typecheckers, more complex state management capablities, etc.

If you have any ideas, please submit a pull request or file an issue explaining your idea and I'll do my best to add it.




-------------

## License

The MIT License (MIT)

Copyright (c) 2015 Akiva Lipshitz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
