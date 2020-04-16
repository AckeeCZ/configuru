import * as jsonParser from 'jsonc-parser';

export const anonymize = (val: any) => (val === '' ? val : '[redacted]');

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
