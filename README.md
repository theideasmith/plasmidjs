# Plasmidjs

Plasmidjs allows you to treat an object as cell and each of its methods as genes; allowing you to control which methods/genes are switched on, and what happens if an *switched-off* method is called.

This is the child of synthetic biology and nodejs and was inspired by the author's experience at Cooper Union's Summer STEM iGem track as well as by [conduitjs](https://github.com/ifandelse/ConduitJS).

## Background

Synthetic biology is defined as:
> an interdisciplinary branch of biology, combining disciplines such as biotechnology, evolutionary biology, molecular biology, systems biology, biophysics, computer engineering, and is in many ways related to genetic engineering.

Synthetic biologists study the construction of new biological mechanisms and ways to optimize their design and development. More specifically, synthetic biologists can design custom DNA and insert it into a cell to engineer organisms to their liking and solve many of the world's problems.

Usually, the type of DNA used is a plasmid – hence the name *Plasmidjs* . After DNA insertion, the cell begins to express whichever functions are encoded by the genes in this DNA. Sometimes, it is necessary that only certain genes be activated at a time. This feat is accomplished by the use of a special part of DNA called a promoter which can switch genes on and off.

Very simply, the promoter is either induced or repressed. If it is repressed, the gene it controls is not expressed. If it is induced, the gene it controls is expressed.

## So what?

Concepts from synthetic biology provide the perfect metaphor for a javascript library that enables you to switch on and off object functions.

```javascript
var plasmid = require('plasmidjs');

var organism = {
    height: 50,
    grow: function(){
        this.height+=3;
        return this.height;
    },

    ideas: [
        "never let your schooling interfere with your eduction", 
        "you dont get what you don't ask for", 
        "be persistent", 
        "take advantage of the fact you exist",
        "automate things"
    ],
    think: function(){
        return this.ideas.pop() || "I'm all out of ideas";
    },

    position: {x: 0, y: 0},
    walk: function(x, y){
        this.position.x = x;
        this.position.y = y;
        return this.position;
    }
};

/*
 * Create our plasmid
 */
var cell = plasmid.Promote( organism );


```
Start simple

```javascript
cell.think(); //=> "never let your schooling interfere with your eduction"

/*
 * Turn a gene off
 */
cell.repress('think')
    .think(); //=> undefined

/*
 * Turn a gene on
 */
cell.induce('think')
    .think();//=> "you dont get what you don't ask for"

```

Let's get complicated

```javascript

/*
 * Only one gene is on.
 */
cell.only('grow').think();//=> undefined;
cell.grow()//=> 53

/*
 * Turning all genes on
 */
cell.all(true).think();//=> "be persistent"

/*
 * All genes except walk
 */
cell.except('walk').grow()//=> undefined
cell.walk(20,15);//=> {x: 20, y:15}
```

Hopefully you're impressed.

## Docs

+ `var new_obj = plasmid.Promote( old_obj[,options])`
+ `new_obj.induce( method )`
+ `new_obj.repress( method )`
+ `new_obj.fail( failure_func )`
+ `new_obj.all( state )`
+ `new_obj.only( method, ... `)
+ `new_obj.except( method, ... )`
+ `new_obj.induced()`
+ `new_obj.repressed()`

### var new_obj = plasmid.Promote( old_obj[,options])

Creates a new plasmid that wraps `new_obj`. Note: creating a new plasmid will not modify the original object. Instead, the library creates a new object with the plasmid instance functions as well as the wrapped object's own functions, that when called execute with the `this` context of the wrapped object.

`old_obj`: the object to wrap
`options`: an optional options object with the following (all optional) fields:
```
    {
        exposed: ["method"[, "more methods"]]
        default: <true | false>,
    }
```
`options.exposed`: which of the passed objetc's method to wrap. Defaults to every method of the passed object.
`options.default`: starting state of the wrapped methods: either induced(`true`) or repressed(`false`). Defaults to true.

### new_obj.induce( method, ... )

Turn passed methods on

### new_obj.repress( method, ... )

Turn passed methods off

### new_obj.fail( failure_func )

### new_obj.all( true | false )
Set the state of all methods
`true`: on
`false`: off

### new_obj.only( method, ... )

Induce only the methods passed.

### new_obj.except( method, ... )

Turn every method on except for the passed methods

### new_obj.induced()

Returns an array of induced methods

### new_obj.repressed()

Returns an array of repressed methods
