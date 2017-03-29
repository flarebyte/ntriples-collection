import test from 'tape';
import ntriplesCollection from '../src';

test('ntriplesCollection', (t) => {
  t.plan(1);
  t.equal(true, ntriplesCollection(), 'return true');
});
