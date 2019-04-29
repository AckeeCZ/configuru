import { isObject } from 'util';
import { anonymize } from './helpers';
import { LoadedValue } from './loader';

type LoadedToValue<X> = X extends LoadedValue<any, any> ? X['value'] : X;

type Values<C> = C extends object
    ? { [K in keyof C]: C[K] extends LoadedValue<any, any> ? LoadedToValue<C[K]> : Values<C[K]> }
    : C;

type AnonymousValues<C> = C extends object
    ? { [K in keyof C]: C[K] extends LoadedValue<any, any> ? string : AnonymousValues<C[K]> }
    : C;

const isLoadedValue = (x: any) => Object.keys(x || {}).includes('__CONFIGURU_LEAF');

const mapConfig = (fn: (v: LoadedValue<any, any>) => any) => <T extends Record<any, any>>(config: T) =>
    Object.keys(config).reduce((res: any, key) => {
        const val = config[key];
        if (isLoadedValue(val)) {
            res[key] = fn(val);
        } else if (isObject(val)) {
            res[key] = mapConfig(fn)(val);
        } else {
            res[key] = val;
        }
        return res;
    }, {});

export const values = mapConfig(x => x.value) as <T extends Record<any, any>>(config: T) => Values<T>;
export const safeValues = mapConfig(x => (x.hidden ? anonymize(x.rawValue) : x.value)) as <T extends Record<any, any>>(
    config: T
) => AnonymousValues<T>;
