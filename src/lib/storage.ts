import { readFileSync } from 'fs';
import { ConfigLoaderOptions } from './loader';
const fromPairs = (pairs: Array<[keyof any, any]>) => Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
const { keys } = Object;

export const createConfigStorage = (opts: Pick<ConfigLoaderOptions, 'defaultConfigPath'|'userConfigPath'|'envMode'>): Record<any, any> => {
    const defaultConfig = opts.defaultConfigPath ? JSON.parse(readFileSync(opts.defaultConfigPath, 'utf-8')) : {};
    const userConfig = opts.userConfigPath ? JSON.parse(readFileSync(opts.userConfigPath, 'utf-8')) : {};
    const envConfig = opts.envMode ? fromPairs(keys(defaultConfig).map(k => [k, process.env[k]])) : {};
    const configStorage = { ...defaultConfig, ...userConfig, ...envConfig };
    return configStorage;
};
