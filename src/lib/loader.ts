import { createConfigStorage } from './storage';

// helpers
const parseBool = (x: any) => (x === 'false' || x === '0' ? false : Boolean(x));
const identity = <T>(x: T) => x;

export interface ConfigLoaderOptions {
    defaultConfigPath?: string;
    userConfigPath?: string;
    envMode?: boolean;
}

const defaultOpts = {
    defaultConfigPath: '.env.json',
    userConfigPath: process.env.CFG_JSON_PATH,
    envMode: true,
};

export const createLoaders = (opts: ConfigLoaderOptions = defaultOpts) => {
    const configStorage = createConfigStorage(opts);
    const load = <T, N extends boolean, R = N extends false ? T : T | null>(
        transform: (x: any) => T,
        anonymize: (x: any) => any,
        hidden: boolean,
        nullable: boolean
    ) => (key: string): R => {
        const value = configStorage[key];
        if (nullable && value === null) {
            return value;
        }
        if (value === undefined) {
            throw new Error(`Missing required value ${key}`);
        }
        if (hidden) {
            return anonymize(value);
        }
        return (transform(value) as any) as R;
    };
    const atomLoader = <T>(transform: (x: any) => T, anonymize: (x: any) => any = identity) =>
        Object.assign(load<T, false>(transform, anonymize, false, false), {
            hidden: Object.assign(load<T, false>(transform, anonymize, true, false), {
                nullable: load<T, true>(transform, anonymize, true, true),
            }),
            nullable: Object.assign(load<T, true>(transform, anonymize, false, true), {
                hidden: load<T, true>(transform, anonymize, true, true),
            }),
        });
    const anonymize = (val: any) => {
        const str = String(val);
        const show = str.length / 6;
        return [str.slice(0, show), '***', str.slice(str.length + 1 - show, str.length)].join('');
    };
    return {
        configLoader: {
            number: atomLoader(Number),
            string: atomLoader(String),
            bool: atomLoader(parseBool),
            json: atomLoader(JSON.parse),
        },
        anonymizedConfigLoader: {
            number: atomLoader(Number, anonymize),
            string: atomLoader(String, anonymize),
            bool: atomLoader(parseBool, anonymize),
            json: atomLoader(JSON.parse, anonymize),
        },
    };
};

export type ConfigLoader = ReturnType<typeof createLoaders>['configLoader'];
