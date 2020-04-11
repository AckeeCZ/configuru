import { createConfigStorage } from 'lib/storage';
import { resolve } from 'path';

describe('storage', () => {
    test('Empty', () => {
        expect(createConfigStorage({})).toEqual({});
    });
    test('Default', () => {
        expect(createConfigStorage({ defaultConfigPath: resolve(__dirname, './sandbox/default.json') }))
            .toMatchInlineSnapshot(`
            Object {
              "bar": 1,
              "baz": 2,
              "defaultConfig": true,
              "foo": "default",
            }
        `);
    });
    test('Default (jsonc)', () => {
        expect(createConfigStorage({ defaultConfigPath: resolve(__dirname, './sandbox/default.jsonc') }))
            .toMatchInlineSnapshot(`
            Object {
              "bar": 1,
              "baz": 2,
              "defaultConfig": true,
              "foo": "default",
            }
        `);
    });
    test('Default & user', () => {
        expect(
            createConfigStorage({
                defaultConfigPath: resolve(__dirname, './sandbox/default.json'),
                userConfigPath: resolve(__dirname, './sandbox/user.json'),
            })
        ).toMatchInlineSnapshot(`
            Object {
              "bar": 1,
              "baz": 2,
              "defaultConfig": true,
              "foo": "user",
              "quix": false,
              "userConfig": true,
            }
        `);
    });
    test('Default & user & env', () => {
        process.env.foo = 'env';
        process.env.bar = '3';
        expect(
            createConfigStorage({
                defaultConfigPath: resolve(__dirname, './sandbox/default.json'),
                userConfigPath: resolve(__dirname, './sandbox/user.json'),
                envMode: 'default',
            })
        ).toMatchInlineSnapshot(`
                Object {
                  "bar": "3",
                  "baz": 2,
                  "defaultConfig": true,
                  "foo": "env",
                  "quix": false,
                  "userConfig": true,
                }
            `);
    });
});
