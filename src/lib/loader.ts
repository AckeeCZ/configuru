import { createConfigStorage } from './storage';
import { anonymize, identity, parseBool } from './helpers';

export interface ConfigLoaderOptions {
    defaultConfigPath?: string;
    userConfigPath?: string;
    envMode?: 'all'|'default'|'merged'|'none';
}

const defaultOpts: ConfigLoaderOptions = {
    defaultConfigPath: '.env.json',
    userConfigPath: process.env.CFG_JSON_PATH,
    envMode: 'default',
};

export const createAtomLoaderFactory = (storage: Record<any, any>, anonymize: (x: any) => any = identity) => {
    const load = <T, N extends boolean, R = N extends false ? T : T | null>(
        transform: (x: any) => T,
        anonymize: (x: any) => any,
        hidden: boolean,
        nullable: boolean
    ) => (key: string): R => {
        const value = storage[key];
        if (value === undefined || value === null) {
            if (nullable) {
                return value;
            }
            throw new Error(`Missing required value ${key}`);
        }
        if (hidden) {
            return anonymize(value);
        }
        return (transform(value) as any) as R;
    };
    return <T>(transform: (x: any) => T) =>
        Object.assign(load<T, false>(transform, anonymize, false, false), {
            hidden: Object.assign(load<T, false>(transform, anonymize, true, false), {
                nullable: load<T, true>(transform, anonymize, true, true),
            }),
            nullable: Object.assign(load<T, true>(transform, anonymize, false, true), {
                hidden: load<T, true>(transform, anonymize, true, true),
            }),
        });
};

export const createLoaders = (opts: ConfigLoaderOptions = defaultOpts) => {
    const configStorage = createConfigStorage(opts);
    const atomLoader = createAtomLoaderFactory(configStorage);
    const anonymousAtomLoader = createAtomLoaderFactory(configStorage, anonymize);
    return {
        configLoader: {
            number: atomLoader(Number),
            string: atomLoader(String),
            bool: atomLoader(parseBool),
            json: atomLoader(JSON.parse),
        },
        anonymizedConfigLoader: {
            number: anonymousAtomLoader(Number),
            string: anonymousAtomLoader(String),
            bool: anonymousAtomLoader(parseBool),
            json: anonymousAtomLoader(JSON.parse),
        },
    };
};

export type ConfigLoader = ReturnType<typeof createLoaders>['configLoader'];
