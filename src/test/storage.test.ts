import { createConfigStorage } from 'lib/storage';
import { resolve } from 'path';

describe('storage', () => {
    test('Empty', () => {
        expect(createConfigStorage({})).toEqual({});
    });
    test('Default', () => {
        expect(
            createConfigStorage({ defaultConfigPath: resolve(__dirname, './sandbox/default.json') })
        ).toMatchSnapshot();
    });
    test('Default (jsonc)', () => {
        expect(
            createConfigStorage({ defaultConfigPath: resolve(__dirname, './sandbox/default.jsonc') })
        ).toMatchSnapshot();
    });
    test('Default & user', () => {
        expect(
            createConfigStorage({
                defaultConfigPath: resolve(__dirname, './sandbox/default.json'),
                userConfigPath: resolve(__dirname, './sandbox/user.json'),
            })
        ).toMatchSnapshot();
    });
    test('Default & user & env', () => {
        (process.env.foo = 'env'),
            (process.env.bar = '3'),
            expect(
                createConfigStorage({
                    defaultConfigPath: resolve(__dirname, './sandbox/default.json'),
                    userConfigPath: resolve(__dirname, './sandbox/user.json'),
                    envMode: 'default',
                })
            ).toMatchSnapshot();
    });
});
