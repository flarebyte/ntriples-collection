import test from 'tape';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import { readNTriplesFile,
   writeNTriplesFile,
   findObjectByPredicate,
   findLocalizedObjectByPredicate,
   findObjectsByPredicate,
  } from '../src';

const fixturesDir = path.resolve(__dirname, 'fixtures');
const tmpDir = path.resolve(__dirname, 'tmp');

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

test('ntriplesCollection should read n-triples file', (t) => {
  t.plan(9);
  const expected = [
    { object: '"Publisher Alpha"', predicate: 'http://purl.org/dc/elements/1.1/publisher', subject: 'http://www.site.org/version/123/' },
    { object: '"Creator Alpha"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/123/' },
    { object: '"Publisher Beta"', predicate: 'http://purl.org/dc/elements/1.1/publisher', subject: 'http://www.site.org/version/124/' },
    { object: '"Creator Beta"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/124/' },
    { object: '"Dave Beckett"@fr-be', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/125/' },
    { object: '"Art Barstow"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/125/' },
    { object: 'http://www.w3.org/', predicate: 'http://purl.org/dc/elements/1.1/publisher', subject: 'http://www.site.org/version/125/' },
  ];
  readNTriplesFile(`${fixturesDir}/reference.nt`, (err, data) => {
    t.equal(err, null, 'no error');
    t.equal(_.size(data), 7, 'size of array');
    t.deepEqual(data[0], expected[0], 'Publisher Alpha');
    t.deepEqual(data[1], expected[1], 'Creator Alpha');
    t.deepEqual(data[2], expected[2], 'Publisher Beta');
    t.deepEqual(data[3], expected[3], 'Creator Beta');
    t.deepEqual(data[4], expected[4], 'Dave Beckett');
    t.deepEqual(data[5], expected[5], 'Art Barstow');
    t.deepEqual(data[6], expected[6], 'http://www.w3.org/');
  });
});

test('ntriplesCollection should write n-triples file', (t) => {
  t.plan(3);
  const expected = fs.readFileSync(`${fixturesDir}/write-reference.nt`, 'utf8');
  const graph = '/only-for-quad';
  const triples = [
    { graph, object: '"Publisher Alpha"', predicate: 'http://purl.org/dc/elements/1.1/publisher', subject: 'http://www.site.org/version/123/' },
    { graph, object: '"Creator Alpha"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/123/' },
    { graph, object: '"Publisher Beta"', predicate: 'http://purl.org/dc/elements/1.1/publisher', subject: 'http://www.site.org/version/124/' },
    { graph, object: '"Creator Beta"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/124/' },
    { graph, object: '"Dave Beckett"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/125/' },
    { graph, object: '"Art Barstow"', predicate: 'http://purl.org/dc/elements/1.1/creator', subject: 'http://www.site.org/version/125/' },
    { graph, object: 'http://www.w3.org/', predicate: 'http://purl.org/dc/elements/1.1/publisher', subject: 'http://www.site.org/version/125/' },
  ];
  writeNTriplesFile(`${tmpDir}/write-example.nt`, triples, (err, results) => {
    t.equal(err, null, 'no error');
    t.equal(results.count, 7, 'count of triples');
    const actual = fs.readFileSync(`${tmpDir}/write-example.nt`, 'utf8');
    t.deepEqual(actual, expected, 'same n-triples');
  });
});

test('ntriplesCollection should find object by predicate', (t) => {
  t.plan(11);
  const graph = '/only-for-quad';
  const subject = 'http://www.site.org/subject/123/';
  const triples = [
    { object: '"A"', predicate: 'http://w.org/a', subject, graph },
    { object: '"B"', predicate: 'http://w.org/b', subject, graph },
    { object: '"C"', predicate: 'http://w.org/c', subject },
    { object: '"D"@en', predicate: 'http://w.org/d', subject, graph },
    { object: '"D2"', predicate: 'http://w.org/d', subject, graph },
    { object: '"E"', predicate: 'http://w.org/e', subject },
    { object: '"D3"', predicate: 'http://w.org/d', subject, graph },
    { object: '"3"^^http://www.w3.org/2001/XMLSchema#integer', predicate: 'http://w.org/g', subject },
    { object: '"3.2"^^http://www.w3.org/2001/XMLSchema#float', predicate: 'http://w.org/h', subject, graph },
    { object: '"true"^^http://www.w3.org/2001/XMLSchema#boolean', predicate: 'http://w.org/i', subject },
    { object: '"2017-04-01T10:45:54Z"^^http://www.w3.org/2001/XMLSchema#dateTime', predicate: 'http://w.org/j', subject, graph },
    { object: '"2017-03-01"^^http://www.w3.org/2001/XMLSchema#date', predicate: 'http://w.org/k', subject },
  ];
  const actualB = findObjectByPredicate(triples, 'http://w.org/b');
  const actualC = findObjectByPredicate(triples, 'http://w.org/c');
  const actualD = findObjectByPredicate(triples, 'http://w.org/d');
  const actualE = findObjectByPredicate(triples, 'http://w.org/e');
  const actualG = findObjectByPredicate(triples, 'http://w.org/g');
  const actualH = findObjectByPredicate(triples, 'http://w.org/h');
  const actualI = findObjectByPredicate(triples, 'http://w.org/i');
  const actualJ = findObjectByPredicate(triples, 'http://w.org/j');
  const actualK = findObjectByPredicate(triples, 'http://w.org/k');
  const actualUnknown = findObjectByPredicate(triples, 'http://w.org/none');
  const actualUnknownDef = findObjectByPredicate(triples, 'http://w.org/none', 'NULL');

  t.equal(actualUnknown, null, 'Unknown');
  t.equal(actualUnknownDef, 'NULL', 'Unknown with default');
  t.equal(actualB, 'B', 'B');
  t.equal(actualC, 'C', 'C');
  t.equal(actualD, 'D', 'D');
  t.equal(actualE, 'E', 'E');
  t.equal(actualG, 3, 'Integer');
  t.equal(actualH, 3.2, 'Float');
  t.ok(actualI, 'boolean');
  t.equal(actualJ.format('YYYY/mm'), '2017/45', 'DateTime');
  t.equal(actualK.format('YYYY/MM'), '2017/03', 'Date');
});

test('ntriplesCollection should find localized object by predicate', (t) => {
  t.plan(10);
  const graph = '/only-for-quad';
  const subject = 'http://www.site.org/subject/123/';
  const triples = [
    { object: '"A"', predicate: 'http://w.org/a', subject },
    { object: '"A-en"@en', predicate: 'http://w.org/a', subject, graph },
    { object: '"A-fr"@fr', predicate: 'http://w.org/a', subject },
    { object: '"A-es"@es', predicate: 'http://w.org/a', subject, graph },
    { object: '"B"', predicate: 'http://w.org/b', subject },
  ];

  const find = (lang, langs, defval) => findLocalizedObjectByPredicate(triples, 'http://w.org/a', lang, langs, defval);

  t.equal(find('fr'), 'A-fr', 'fr');
  t.equal(find(''), 'A', 'no lang');
  t.equal(find('de'), null, 'de');
  t.equal(find('de', [], 'NULL'), 'NULL', 'de NULL');
  t.equal(find('de', ['en']), 'A-en', 'de then en');
  t.equal(find('de', ['jp', '']), 'A', 'de then jp then no localised');
  t.equal(find('de', ['jp']), null, 'de then jp');
  t.equal(find('de', ['jp'], 'NULL'), 'NULL', 'de then jp NULL');
  t.equal(find('de', ['jp', 'it']), null, 'de then jp then it');
  t.equal(find('de', ['jp', 'it'], 'NULL'), 'NULL', 'de then jp then it NULL');
});

test('ntriplesCollection should find localized object by predicate', (t) => {
  t.plan(2);
  const graph = '/only-for-quad';
  const subject = 'http://www.site.org/subject/123/';
  const triples = [
    { object: '"A"', predicate: 'http://w.org/a', subject, graph },
    { object: '"A-en"@en', predicate: 'http://w.org/a', subject },
    { object: '"A-fr"@fr', predicate: 'http://w.org/a', subject, graph },
    { object: '"A-es"@es', predicate: 'http://w.org/a', subject },
    { object: '"B"', predicate: 'http://w.org/b', subject, graph },
  ];

  const actual = findObjectsByPredicate(triples, 'http://w.org/a');
  const expected = ['A', 'A-en', 'A-fr', 'A-es'];
  t.deepEqual(actual, expected, 'a list of A');
  t.deepEqual(findObjectsByPredicate(triples, 'http://w.org/z'), [], 'unknown');
});
