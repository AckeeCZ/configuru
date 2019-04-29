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
            expect(stringLoader('number')).toMatchInlineSnapshot(`
                                Object {
                                  "hidden": false,
                                  "nullable": false,
                                  "rawValue": 42,
                                  "value": "42",
                                }
                        `);
        });
        test('nullable', () => {
            // empty throws on default
            expect(() => stringLoader('null')).toThrow(/missing/i);
            expect(() => stringLoader('undefined')).toThrow(/missing/i);
            // empty valid on nullable
            expect(stringLoader.nullable('null')).toMatchInlineSnapshot(`
                                Object {
                                  "hidden": false,
                                  "nullable": true,
                                  "rawValue": null,
                                  "value": null,
                                }
                        `);
            expect(stringLoader.nullable('undefined')).toMatchInlineSnapshot(`
                                Object {
                                  "hidden": false,
                                  "nullable": true,
                                  "rawValue": undefined,
                                  "value": null,
                                }
                        `);
        });
        test('nullable & hidden', () => {
            // empty throws on hidden
            expect(() => stringLoader.hidden('null')).toThrow(/missing/i);
            expect(() => stringLoader.hidden('undefined')).toThrow(/missing/i);
            // empty valid on nullable
            expect(stringLoader.hidden.nullable('null')).toMatchInlineSnapshot(`
                                Object {
                                  "hidden": true,
                                  "nullable": true,
                                  "rawValue": null,
                                  "value": null,
                                }
                        `);
            expect(stringLoader.hidden.nullable('undefined')).toMatchInlineSnapshot(`
                                Object {
                                  "hidden": true,
                                  "nullable": true,
                                  "rawValue": undefined,
                                  "value": null,
                                }
                        `);
        });
        test('hidden', () => {
            expect(stringLoader.hidden('string')).toMatchInlineSnapshot(`
                Object {
                  "hidden": true,
                  "nullable": false,
                  "rawValue": "string",
                  "value": "string",
                }
            `);
        });
    });
});
