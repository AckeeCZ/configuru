import { isObject } from 'util';
import { LoadedValue } from './loader';

type LoadedToValue<X> = X extends LoadedValue<any, any> ? X['value'] : X;

type Values<C> = C extends object
    ? { [K in keyof C]: C[K] extends LoadedValue<any, any> ? LoadedToValue<C[K]> : Values<C[K]> }
    : C;

const isLoadedValue = (x: any) => Object.keys(x || {}).includes('__CONFIGURU_LEAF');

export const values = <T extends Record<any, any>>(config: T) =>
    Object.keys(config).reduce((res: any, key) => {
        const val = config[key];
        if (isLoadedValue(val)) {
            res[key] = val.value;
        } else if (isObject(val)) {
            res[key] = values(val);
        } else {
            res[key] = val;
        }
        return res;
    }, {}) as Values<T>;
