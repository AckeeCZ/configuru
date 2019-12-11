import * as jsonParser from 'jsonc-parser';

export const anonymize = (val: any) => {
    const str = String(val);
    const show = Math.min(str.length / 6, 10);
    return [str.slice(0, show), '***', str.slice(str.length + 1 - show, str.length)].join('');
};

export const parseBool = (x: any) => (x === 'false' || x === '0' ? false : Boolean(x));
export const identity = <T>(x: T) => x;

export const isObject = (x: any) => typeof x === 'object' && Object.prototype.toString.call(x) === '[object Object]';

export const JSONC = {
    parse: (text: string) => {
        const errors: jsonParser.ParseError[] = [];
        const parsed = jsonParser.parse(text, errors);
        if (errors.length) {
            throw new SyntaxError(`${jsonParser.printParseErrorCode(errors[0].error)} at position ${errors[0].offset}`);
        }
        return parsed;
    },
};
