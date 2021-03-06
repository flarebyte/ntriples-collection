interface Triple {
    subject: string,
    predicate: string,
    object: string,
}

interface SemanticValue {
    value: string,
    literalValue: any,
    literalType: string,
    literalLanguage: string
}

/**
 * Convert a string to an array of triples
 * @param {string} content - the n-triples as content
 * @returns {array} array of triples
 * @example
 * stringToNTriples(content);
 */
export declare function stringToNTriples(content: string): ReadonlyArray<Triple>;
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
export declare function readNTriplesFile(filename: string, callback: Function): void;
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
export declare function writeNTriplesFile(filename: string, triples: ReadonlyArray<Triple>, callback: Function): void;
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
export declare function findObjectByPredicate(triples: ReadonlyArray<Triple>, predicate: string, defaultValue?: any): any;

/**
 * Finds the first string value based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @param {object} defaultValue - the object/string to return if null
 * @example
 * // returns Amadeus
 * findObjectByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {string} the string representing the literal value
 */
export declare function findStringByPredicate(triples: ReadonlyArray<Triple>, predicate: string, defaultValue?: string): string | null;

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
export declare function findLocalizedObjectByPredicate(triples: ReadonlyArray<Triple>, predicate: string, language: string, altLangs: ReadonlyArray<string>, defaultValue?: any): any;

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
export declare function findLocalizedStringByPredicate(triples: ReadonlyArray<Triple>, predicate: string, language: string, altLangs: ReadonlyArray<string>, defaultValue?: string): string | null;

/**
 * Finds all object values based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @example
 * // returns [Amadeus, Bach]
 * findObjectsByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {array} of string, integer, float, boolean, moment representing the literal values
 */
export declare function findObjectsByPredicate(triples: ReadonlyArray<Triple>, predicate: string): ReadonlyArray<any>;

/**
 * Finds all object values based on the predicate
 * @param {array} triples - an array of triples objects (subject is ignored)
 * @param {string} predicate - the uri representing the predicate
 * @example
 * // returns [Amadeus, Bach]
 * findObjectsByPredicate(triples, 'http://purl.org/dc/elements/1.1/creator')
 * @return {array} of string representing the literal values
 */
export declare function findStringsByPredicate(triples: ReadonlyArray<Triple>, predicate: string): ReadonlyArray<string>;

/**
 * Convert an array of triples to a string
 * @param {array} array of triples
 * @return {string} content - the n-triples as content
 * @example
 * nTriplesToString(triples);
 */
export declare function nTriplesToString(triples: ReadonlyArray<Triple>): string;

/**
 * Extracts the different parts of an object value
 * @param {string} value - a string such as "A"@en
 * @returns {object} the literal value, the literal type and language
 */
export declare function asSemanticValue(value: string): SemanticValue;

/**
 * Extracts an array of semantic values
 * @param {array} values - a array of string such as ["A"@en]
 * @returns {array} an array of objects describing the literal value, the literal type and language
 */
export declare function asSemanticValues(value: ReadonlyArray<string>): ReadonlyArray<SemanticValue>;

