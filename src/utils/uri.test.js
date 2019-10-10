import { qsStringify, makeURI } from './uri';

describe('qsStringify', () => {
    it('returns the empty string with an empty argument', () => {
        expect(qsStringify({})).toBe('');
    });

    it('encodes one parameter correctly', () => {
        expect(qsStringify({ foo: 'bar' })).toBe('foo=bar');
    });

    it('encodes several parameters correctly', () => {
        expect(qsStringify({ a: 'wow', b: 'shazam' })).toBe('a=wow&b=shazam');
    });

    it('encodes specal characters correctly', () => {
        expect(qsStringify({
            reserved: ';,/?:@&=+$#',
            unescaped: "-_.!~*'()",
        })).toBe('reserved=%3B%2C%2F%3F%3A%40%26%3D%2B%24%23&unescaped=-_.!~*\'()');
    });

    it('encodes various datatypes correctly', () => {
        expect(qsStringify({
            a: 'wow',
            b: 1,
            c: true,
            d: undefined,
            e: null,
        })).toBe('a=wow&b=1&c=true&d=undefined&e=null');
    });
});

describe(makeURI, () => {
    it('works', () => {
        expect(makeURI('domain', { a: 1, b: 2 })).toBe('domain?a=1&b=2')
    });
});
