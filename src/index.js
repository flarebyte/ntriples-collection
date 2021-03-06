import _ from 'lodash';
import lines from 'underscore.string/lines';
import include from 'underscore.string/include';
import toBoolean from 'underscore.string/toBoolean';
import toNumber from 'underscore.string/toNumber';
import moment from 'moment';
import fs from 'fs';
import { Util, Parser, Writer } from 'n3';

const isTriple = str => include(str, '<');

const omitGraph = t => _.pick(t, ['subject', 'predicate', 'object']);
const withoutGraph = triples => _.map(triples, omitGraph);

const normalizeValue = (value, defaultValue) => {
  if (_.isNil(value)) {
    return defaultValue;
  }
  if (Util.isLiteral(value)) {
    const litType = Util.getLiteralType(value);
    const litValue = Util.getLiteralValue(value);
    switch (litType) {
      case 'http://www.w3.org/2001/XMLSchema#string': return litValue;
      case 'http://www.w3.org/2001/XMLSchema#anyURI': return litValue;
      case 'http://www.w3.org/2001/XMLSchema#integer': return toNumber(litValue);
      case 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger': return toNumber(litValue);
      case 'http://www.w3.org/2001/XMLSchema#negativeInteger': return toNumber(litValue);
      case 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger': return toNumber(litValue);
      case 'http://www.w3.org/2001/XMLSchema#positiveInteger': return toNumber(litValue);
      case 'http://www.w3.org/2001/XMLSchema#float': return toNumber(litValue, 6);
      case 'http://www.w3.org/2001/XMLSchema#boolean': return toBoolean(litValue);
      case 'http://www.w3.org/2001/XMLSchema#dateTime': return moment(litValue, moment.ISO_8601);
      case 'http://www.w3.org/2001/XMLSchema#date': return moment(litValue, moment.ISO_8601);
      case 'http://www.w3.org/2001/XMLSchema#time': return litValue;
      default: return litValue;
    }
  }
  if (Util.isIRI(value)) {
    return value;
  }
  return value;
};

const normalizeValues = (values, defaultValue) =>
  _.map(values, v => normalizeValue(v, defaultValue));

/**
 * Extracts the different parts of an object value
 * @param {string} value - a string such as "A"@en
 * @returns {object} the literal value, the literal type and language
 */
const asSemanticValue = (value) => {
  const literalValue = normalizeValue(value, null);
  const literalType = Util.getLiteralType(value);
  const literalLanguage = Util.getLiteralLanguage(value);
  return { value, literalValue, literalType, literalLanguage };
};

/**
 * Extracts an array of semantic values
 * @param {array} values - a array of string such as ["A"@en]
 * @returns {array} an array of objects describing the literal value, the literal type and language
 */
const asSemanticValues = values => _.map(values, asSemanticValue);

export { asSemanticValue, asSemanticValues };

/**
 * Convert a string to an array of triples
 * @param {string} content - the n-triples as content
 * @returns {array} array of triples
 * @example
 * stringToNTriples(content);
 */
export function stringToNTriples(content) {
  const n3parser = new Parser();
  const n3parse = str => _.head(n3parser.parse(str));

  const n3lines = _.filter(lines(content), isTriple);
  const triples = _.map(n3lines, n3parse);
  return withoutGraph(triples);
}

/**
 * Reads a n-triples file and converts it to an array of triples
 * @param {string} filename - the n-triples filename
 * @param {callback} function - callback
 * @example
 * // [
 * { graph: "",
 * object: '"Flower corp"@en',
 * predicate: 'http://purl.org/dc/elements/1.1/publisher',
 * subject: 'http://www.site.org/version/123/'
 * },
 * ]
 * readNTriplesFile('flowers.nt', (err, triples) => {
 *  console.log(triples);
 * });
 */
export function readNTriplesFile(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, stringToNTriples(data));
    }
  });
}

/** Borrowed and adpated from N3.js library */

// Matches a literal as represented in memory by the N3 library
const N3LiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([-a-z]+))?$/i;

// Characters in literals that require escaping
const escape = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/;
const escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g;
const escapeReplacements = {
  '\\': '\\\\',
  '"': '\\"',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\b': '\\b',
  '\f': '\\f',
};

// Replaces a character by its escaped version
const characterReplacer = (character) => {
  // Replace a single character by its escaped version
  let result = escapeReplacements[character];
  if (result === undefined) {
    // Replace a single character with its 4-bit unicode escape sequence
    if (character.length === 1) {
      result = character.charCodeAt(0).toString(16);
      result = '\\u0000'.substr(0, 6 - result.length) + result;
    } else {
      // Replace a surrogate pair with its 8-bit unicode escape sequence
      const first = (character.charCodeAt(0) - 0xD800) * 0x400;
      result = (first + character.charCodeAt(1) + 0x2400).toString(16);
      result = '\\U00000000'.substr(0, 10 - result.length) + result;
    }
  }
  return result;
};

const encodeIri = (iriEntity) => {
    // Escape special characters
  const entity = escape.test(iriEntity) ?
   iriEntity.replace(escapeAll, characterReplacer) : iriEntity;
  return `<${entity}>`;
};

const encodeLiteral = (litValue, type, language) => {
  // Escape special characters
  const value = escape.test(litValue) ? litValue.replace(escapeAll, characterReplacer) : litValue;
  if (language) {
    return `"${value}"@${language}`;
  } else if (type) { return `"${value}"^^${encodeIri(type)}`; }
  return `"${value}"`;
};

const encodeObject = (object) => {
  // Represent an IRI or blank node
  if (object[0] !== '"') {
    return encodeIri(object);
  }
  // Represent a literal
  const match = N3LiteralMatcher.exec(object);
  if (!match) throw new Error(`Invalid literal: ${object}`);
  return encodeLiteral(match[1], match[2], match[3]);
};

const tripleToString = triple =>
  `${encodeIri(triple.subject)} ${encodeIri(triple.predicate)} ${encodeObject(triple.object)}.`;


/**
 * Convert an array of triples to a string
 * @param {array} array of triples
 * @return {string} content - the n-triples as content
 * @example
 * nTriplesToString(triples);
 */
export function nTriplesToString(triples) {
  return _.join(_.map(withoutGraph(triples), tripleToString), '\n');
}

/**
 * Saves an array of triples in a n-triples file
 * @param {string} filename - the n-triples filename
 * @param {array} triples - an array of triples objects
 * @param {callback} function - callback
 * @example
 * // {count: 1}
 *  const triples = [
 * { graph: "",
 * object: '"Flower corp"@en',
 * predicate: 'http://purl.org/dc/elements/1.1/publisher',
 * subject: 'http://www.site.org/version/123/'
 * },
 * ]
 * writeNTriplesFile('flowers.nt', triples, (err, triples) => {
 *  console.log(triples);
 * });
 */
export function writeNTriplesFile(filename, triples, callback) {
  const fstream = fs.createWriteStream(filename);
  const n3writer = new Writer(fstream, { format: 'N-Triples' });
  n3writer.addTriples(withoutGraph(triples));
  n3writer.end((error) => {
    const count = _.size(triples);
    const e = _.isNil(error) ? null : { error, filename };
    callback(e, { count });
  });
}

/**
 * Finds the first object value based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @param {object} defaultValue - the object/string to return if null
 * @example
 * // returns Amadeus
 * findObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {string} the string, integer, float, boolean, moment representing the literal value
 */
export function findObjectByPredicate(triples, predicate, defaultValue = null) {
  const value = _.get(_.find(triples, { predicate }), 'object');
  return normalizeValue(value, defaultValue);
}

/**
 * Finds the first object value based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @param {object} defaultValue - the string to return if null
 * @example
 * // returns Amadeus
 * findObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {string} the string representing the literal value
 */
export function findStringByPredicate(triples, predicate, defaultValue = null) {
  const value = findObjectByPredicate(triples, predicate, defaultValue);
  return _.isNil(value) ? null : _.toString(value);
}

/**
 * Finds the first object value based on the predicate and the language
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @param {string} language - the requested language
 * @param {array} altLangs - an array of alternative languages (max 2)
 * @param {object} defaultValue - the object/string to return if null
 * @example
 * // returns Amadeus
 * findLocalizedObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator', 'fr', ['en'])
 * @return {string} the string, integer, float, boolean, moment representing the literal value
 */
export function findLocalizedObjectByPredicate(triples, predicate, language, altLangs,
  defaultValue = null) {
  const values = _.map(_.filter(triples, { predicate }), 'object');
  if (_.isEmpty(values)) {
    return defaultValue;
  }

  const semanticValues = asSemanticValues(values);
  const altLang = _.nth(altLangs);
  const altLang2 = _.nth(altLangs, 1);
  const value = _.find(semanticValues, { literalLanguage: language });
  if (_.isNil(altLang) || !_.isNil(value)) {
    return _.get(value, 'literalValue', defaultValue);
  }
  const altValue = _.find(semanticValues, { literalLanguage: altLang });
  if (_.isNil(altLang2) || !_.isNil(altValue)) {
    return _.get(altValue, 'literalValue', defaultValue);
  }
  const altValue2 = _.find(semanticValues, { literalLanguage: altLang2 });
  return _.get(altValue2, 'literalValue', defaultValue);
}

/**
 * Finds the first string value based on the predicate and the language
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @param {string} language - the requested language
 * @param {array} altLangs - an array of alternative languages (max 2)
 * @param {object} defaultValue - the object/string to return if null
 * @example
 * // returns Amadeus
 * findLocalizedObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator', 'fr', ['en'])
 * @return {string} the string epresenting the literal value
 */
export function findLocalizedStringByPredicate(triples, predicate, language, altLangs,
  defaultValue = null) {
  const value = findLocalizedObjectByPredicate(triples, predicate, language, altLangs,
    defaultValue);
  return _.isNil(value) ? null : _.toString(value);
}


/**
 * Finds all object values based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @example
 * // returns [Amadeus, Bach]
 * findObjectsByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {array} of string, integer, float, boolean, moment representing the literal values
 */
export function findObjectsByPredicate(triples, predicate) {
  const values = _.map(_.filter(triples, { predicate }), 'object');
  return normalizeValues(values);
}

/**
 * Finds all object values based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @example
 * // returns [Amadeus, Bach]
 * findObjectsByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {array} of string representing the literal values
 */
export function findStringsByPredicate(triples, predicate) {
  const values = findObjectsByPredicate(triples, predicate);
  const strings = _.map(values, _.toString);
  return strings;
}
