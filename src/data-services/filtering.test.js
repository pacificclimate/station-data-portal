import {
  filterExpressionsParser,
  filterPredicate,
} from './filtering';
import every from 'lodash/fp/every';
import flow from 'lodash/fp/flow';
import zipAll from 'lodash/fp/zipAll';
import isMatch from 'lodash/fp/isMatch';


describe('stationFilterExpressionsParser', () => {
  it.each([
    ['x=foo', [{ path: 'x', op: '=', value: 'foo' }]],
    ['x.y=foo', [{ path: 'x.y', op: '=', value: 'foo' }]],
    ['x[0].y=foo', [{ path: 'x[0].y', op: '=', value: 'foo' }]],
    [
      'x=foo;y=bar',
      [
        { path: 'x', op: '=', value: 'foo' },
        { path: 'y', op: '=', value: 'bar' },
      ]
    ],
    ['x=foo;blork', [{ path: 'x', op: '=', value: 'foo' }]],
    ['x=foo;y<17', [{ path: 'x', op: '=', value: 'foo' }]],
  ])('works for %s', (string, expected) => {
    const expressions = filterExpressionsParser(string);
    expect(expressions.length === expected.length);
    expect(
      flow(
        zipAll,
        every(([e, x]) => isMatch(e, x)),
      )([expressions, expected])
    ).toBe(true);
  });
});


describe('stationFilterPredicate', () => {
  describe.each([
    [
      // expressions
      [{ path: 'x', op: '=', value: 'foo' }],
      // trials
      [
        [{ x: 'foo' }, true],
        [{ x: 'foo', y: 'bar' }, true],
        [{ x: 'yow' }, false],
        [{ y: 'foo' }, false],
      ],
    ],

    [
      // expressions
      [{ path: 'x.a', op: '=', value: 'foo' }],
      // trials
      [
        [{ x: 'foo' }, false],
        [{ x: { a: 'foo' } }, true],
        [{ x: { a: 'foo' }, y: 'bar' }, true],
        [{ x: { a: 'yow' }  }, false],
        [{ y: { a: 'foo' }  }, false],
      ],
    ],

    [
      // expressions
      [{ path: 'x[0].a', op: '=', value: 'foo' }],
      // trials
      [
        [{ x: 'foo' }, false],
        [{ x: [{ a: 'foo' }] }, true],
        [{ x: [{ a: 'foo' }], y: 'bar' }, true],
        [{ x: [{ a: 'yow' }]  }, false],
        [{ y: [{ a: 'foo' }]  }, false],
      ],
    ],

    [
      // expressions
      [
        { path: 'x', op: '=', value: 'foo' },
        { path: 'y', op: '=', value: 'bar' }
      ],
      // trials
      [
        [{ x: 'foo' }, false],
        [{ x: 'foo', y: 'bar' }, true],
        [{ x: 'foo', y: 'baz' }, false],
        [{ x: 'baz', y: 'bar' }, false],
      ],
    ],

  ])('for expressions %p', (expressions, trials) => {
    const predicate = filterPredicate(expressions);
    it.each(trials)('works for %p', (station, expected) => {
      expect(predicate(station)).toBe(expected);
    });
  });
});
