import { createAtomLoaderFactory } from 'lib/loader';

const config = {
    string: 'string',
    number: 42,
    boolean: false,
    null: null,
};

const stringLoader = createAtomLoaderFactory(config)(x => String(x));

describe('atomLoader', () => {
    describe('string loader', () => {
        test('number', () => {
            expect(stringLoader('number')).toBe('42');
        });
        test('nullable', () => {
            // empty throws on default
            expect(() => stringLoader('null')).toThrow(/missing/i);
            expect(() => stringLoader('undefined')).toThrow(/missing/i);
            // empty valid on nullable
            expect(stringLoader.nullable('null')).toBe(null);
            expect(stringLoader.nullable('undefined')).toBe(undefined);
        });
        test('nullable & hidden', () => {
            // empty throws on hidden
            expect(() => stringLoader.hidden('null')).toThrow(/missing/i);
            expect(() => stringLoader.hidden('undefined')).toThrow(/missing/i);
            // empty valid on nullable
            expect(stringLoader.hidden.nullable('null')).toBe(null);
            expect(stringLoader.hidden.nullable('undefined')).toBe(undefined);
        });
        test.skip('hidden', () => {
            expect(stringLoader.hidden('number')).toBe('***');
            expect(stringLoader.hidden('string')).toBe('***');
            expect(stringLoader.hidden('boolean')).toBe('***');
        });
    });
});
