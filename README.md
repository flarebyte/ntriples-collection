# ntriples-collection

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> Utility methods for filtering n-triples

Assumptions:
* You are using [node.js n3](https://github.com/RubenVerborgh/N3.js)
* You are filtering small arrays of triples.
* You are mostly interested in the object value.

## Install

```sh
npm i -D ntriples-collection
```

## Usage

```js
import { readNTriplesFile,
   writeNTriplesFile,
   findObjectByPredicate,
   findLocalizedObjectByPredicate,
   findObjectsByPredicate,
  } from "ntriples-collection"
```
### Functions

<dl>
<dt><a href="#readNTriplesFile">readNTriplesFile(filename, function)</a></dt>
<dd><p>Reads a n-triples file and converts it to an array of triples</p>
</dd>
<dt><a href="#writeNTriplesFile">writeNTriplesFile(filename, triples, function)</a></dt>
<dd><p>Saves an array of triples in a n-triples file</p>
</dd>
<dt><a href="#findObjectByPredicate">findObjectByPredicate(triples, predicate, defaultValue)</a> ⇒ <code>string</code></dt>
<dd><p>Finds the first object value based on the predicate</p>
</dd>
<dt><a href="#findLocalizedObjectByPredicate">findLocalizedObjectByPredicate(triples, predicate, language, altLangs, defaultValue)</a> ⇒ <code>string</code></dt>
<dd><p>Finds the first object value based on the predicate and the language</p>
</dd>
<dt><a href="#findObjectsByPredicate">findObjectsByPredicate(triples, predicate)</a> ⇒ <code>array</code></dt>
<dd><p>Finds all object values based on the predicate</p>
</dd>
</dl>

<a name="readNTriplesFile"></a>

### readNTriplesFile(filename, function)
Reads a n-triples file and converts it to an array of triples

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | the n-triples filename |
| function | <code>callback</code> | callback |

**Example**  
```js
// [
{ graph: "",
object: '"Flower corp"@en',
predicate: 'http://purl.org/dc/elements/1.1/publisher',
subject: 'http://www.site.org/version/123/'
},
]
readNTriplesFile('flowers.nt', (err, triples) => {
 console.log(triples);
});
```
<a name="writeNTriplesFile"></a>

### writeNTriplesFile(filename, triples, function)
Saves an array of triples in a n-triples file

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | the n-triples filename |
| triples | <code>array</code> | an array of triples objects |
| function | <code>callback</code> | callback |

**Example**  
```js
// {count: 1}
 const triples = [
{ graph: "",
object: '"Flower corp"@en',
predicate: 'http://purl.org/dc/elements/1.1/publisher',
subject: 'http://www.site.org/version/123/'
},
]
writeNTriplesFile('flowers.nt', triples, (err, triples) => {
 console.log(triples);
});
```
<a name="findObjectByPredicate"></a>

### findObjectByPredicate(triples, predicate, defaultValue) ⇒ <code>string</code>
Finds the first object value based on the predicate

**Kind**: global function  
**Returns**: <code>string</code> - the string, integer, float, boolean, moment representing the literal value  

| Param | Type | Description |
| --- | --- | --- |
| triples | <code>array</code> | an array of triples objects (subject is ignored) |
| predicate | <code>string</code> | the uri representing the predicate |
| defaultValue | <code>object</code> | the object/string to return if null |

**Example**  
```js
// returns Amadeus
findObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
```
<a name="findLocalizedObjectByPredicate"></a>

### findLocalizedObjectByPredicate(triples, predicate, language, altLangs, defaultValue) ⇒ <code>string</code>
Finds the first object value based on the predicate and the language

**Kind**: global function  
**Returns**: <code>string</code> - the string, integer, float, boolean, moment representing the literal value  

| Param | Type | Description |
| --- | --- | --- |
| triples | <code>array</code> | an array of triples objects (subject is ignored) |
| predicate | <code>string</code> | the uri representing the predicate |
| language | <code>string</code> | the requested language |
| altLangs | <code>array</code> | an array of alternative languages (max 2) |
| defaultValue | <code>object</code> | the object/string to return if null |

**Example**  
```js
// returns Amadeus
findLocalizedObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator', 'fr', ['en'])
```
<a name="findObjectsByPredicate"></a>

### findObjectsByPredicate(triples, predicate) ⇒ <code>array</code>
Finds all object values based on the predicate

**Kind**: global function  
**Returns**: <code>array</code> - of string, integer, float, boolean, moment representing the literal values  

| Param | Type | Description |
| --- | --- | --- |
| triples | <code>array</code> | an array of triples objects (subject is ignored) |
| predicate | <code>string</code> | the uri representing the predicate |

**Example**  
```js
// returns [Amadeus, Bach]
findObjectsByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
```


## License

MIT © [Olivier Huin](http://github.com/flarebyte)

[npm-url]: https://npmjs.org/package/ntriples-collection
[npm-image]: https://img.shields.io/npm/v/ntriples-collection.svg?style=flat-square

[travis-url]: https://travis-ci.org/flarebyte/ntriples-collection
[travis-image]: https://img.shields.io/travis/flarebyte/ntriples-collection.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/flarebyte/ntriples-collection
[coveralls-image]: https://img.shields.io/coveralls/flarebyte/ntriples-collection.svg?style=flat-square

[depstat-url]: https://david-dm.org/flarebyte/ntriples-collection
[depstat-image]: https://david-dm.org/flarebyte/ntriples-collection.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/ntriples-collection.svg?style=flat-square
