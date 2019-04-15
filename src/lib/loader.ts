import { readFileSync } from 'fs';

// helpers
const parseBool = (x: any) => (x === 'false' || x === '0' ? false : Boolean(x));
const fromPairs = (pairs: Array<[keyof any, any]>) => Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
const { keys } = Object;
const identity = <T>(x: T) => x;

export const loader = () => ({});

export const { configLoader, anonymizedConfigLoader } = (() => {
    const defaultConfig = {}; // JSON.parse(readFileSync('.env.json', 'utf-8'));
    const CONFIG_PATH = process.env.CFG_JSON_PATH;
    const userConfig = CONFIG_PATH ? JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) : {};
    const envConfig = fromPairs(keys(defaultConfig).map(k => [k, process.env[k]]));
    const configStorage = { ...defaultConfig, ...userConfig, ...envConfig };
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
})();

export type ConfigLoader = typeof configLoader;
