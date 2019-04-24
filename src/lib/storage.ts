import { readFileSync } from 'fs';
import { ConfigLoaderOptions } from './loader';
const fromPairs = (pairs: Array<[keyof any, any]>) => Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
const { keys } = Object;

export const createConfigStorage = (
    opts: Pick<ConfigLoaderOptions, 'defaultConfigPath' | 'userConfigPath' | 'envMode'>
): Record<any, any> => {
    const defaultConfig = opts.defaultConfigPath ? JSON.parse(readFileSync(opts.defaultConfigPath, 'utf-8')) : {};
    const userConfig = opts.userConfigPath ? JSON.parse(readFileSync(opts.userConfigPath, 'utf-8')) : {};
    let envConfig: any = {};
    if (opts.envMode === 'default' || opts.envMode === 'merged') {
        const configKeys = [...keys(defaultConfig), ...(opts.envMode === 'merged' ? keys(userConfig) : [])];
        envConfig = fromPairs(
            configKeys.map(k => [k, process.env[k]] as [string, any]).filter(x => x[1] !== undefined)
        );
    } else if (opts.envMode === 'all') {
        envConfig = process.env;
    }
    const configStorage = { ...defaultConfig, ...userConfig, ...envConfig };
    return configStorage;
};
