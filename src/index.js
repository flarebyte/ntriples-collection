import _ from 'lodash';
import _S from 'string';
import moment from 'moment';
import fs from 'fs';
import { Util, Parser, Writer } from 'n3';

const isTriple = str => _S(str).contains('<');

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
      case 'http://www.w3.org/2001/XMLSchema#integer': return _S(litValue).toInt();
      case 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger': return _S(litValue).toInt();
      case 'http://www.w3.org/2001/XMLSchema#negativeInteger': return _S(litValue).toInt();
      case 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger': return _S(litValue).toInt();
      case 'http://www.w3.org/2001/XMLSchema#positiveInteger': return _S(litValue).toInt();
      case 'http://www.w3.org/2001/XMLSchema#float': return _S(litValue).toFloat();
      case 'http://www.w3.org/2001/XMLSchema#boolean': return _S(litValue).toBool();
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

const asSemanticValue = (value) => {
  const literalValue = normalizeValue(value, null);
  const literalType = Util.getLiteralType(value);
  const literalLanguage = Util.getLiteralLanguage(value);
  return { value, literalValue, literalType, literalLanguage };
};

const asSemanticValues = values => _.map(values, asSemanticValue);

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
  const n3parser = new Parser();
  const n3parse = str => _.head(n3parser.parse(str));

  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      const lines = _.filter(_S(data).lines(), isTriple);
      const triples = _.map(lines, n3parse);
      callback(null, withoutGraph(triples));
    }
  });
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
