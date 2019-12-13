import { readFileSync } from 'fs';
import * as path from 'path';
import { JSONC } from './helpers';
import { ConfigLoaderOptions } from './loader';

const fromPairs = (pairs: Array<[keyof any, any]>) => Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
const { keys } = Object;

const loadFile = (filePath?: string) => {
    try {
        return filePath ? JSONC.parse(readFileSync(filePath, 'utf-8')) : {};
    } catch (error) {
        throw new Error(`Missing or invalid config file \`${filePath}\` at ${path.join(path.resolve('.'), filePath!)}`);
    }
};

export const createConfigStorage = (
    opts: Pick<ConfigLoaderOptions, 'defaultConfigPath' | 'userConfigPath' | 'envMode'>
): Record<any, any> => {
    const defaultConfig = loadFile(opts.defaultConfigPath);
    const userConfig = loadFile(opts.userConfigPath);
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
