export const anonymize = (val: any) => {
    const str = String(val);
    const show = str.length / 6;
    return [str.slice(0, show), '***', str.slice(str.length + 1 - show, str.length)].join('');
};

export const parseBool = (x: any) => (x === 'false' || x === '0' ? false : Boolean(x));
export const identity = <T>(x: T) => x;
