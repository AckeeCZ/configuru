import { parseBool } from './helpers';
import { createConfigStorage } from './storage';

export interface ConfigLoaderOptions {
    defaultConfigPath?: string;
    userConfigPath?: string;
    envMode?: 'all' | 'default' | 'merged' | 'none';
}

const defaultOpts: ConfigLoaderOptions = {
    defaultConfigPath: '.env.json',
    userConfigPath: process.env.CFG_JSON_PATH,
    envMode: 'default',
};

export interface LoadedValue<T, N extends boolean, R = N extends false ? T : T | null> {
    rawValue: any;
    value: R;
    hidden: boolean;
    nullable: boolean;
    __CONFIGURU_LEAF: true;
}

export const createAtomLoaderFactory = (storage: Record<any, any>) => {
    const load = <T, N extends boolean>(transform: (x: any) => T, hidden: boolean, nullable: boolean) => (
        key: string
    ): LoadedValue<T, N> => {
        const value = storage[key];
        const missing = value === undefined || value === null;
        if (!nullable && missing) {
            throw new Error(`Missing required value ${key}`);
        }
        return {
            hidden,
            nullable,
            rawValue: value,
            value: missing ? null : (transform(value) as any),
            __CONFIGURU_LEAF: true,
        };
    };
    return <T>(transform: (x: any) => T) =>
        Object.assign(load<T, false>(transform, false, false), {
            hidden: Object.assign(load<T, false>(transform, true, false), {
                nullable: load<T, true>(transform, true, true),
            }),
            nullable: Object.assign(load<T, true>(transform, false, true), {
                hidden: load<T, true>(transform, true, true),
            }),
        });
};

export const createLoader = (opts: ConfigLoaderOptions = defaultOpts) => {
    const configStorage = createConfigStorage(opts);
    const atomLoader = createAtomLoaderFactory(configStorage);
    return {
        number: atomLoader(Number),
        string: atomLoader(String),
        bool: atomLoader(parseBool),
        json: atomLoader(JSON.parse),
    };
};
