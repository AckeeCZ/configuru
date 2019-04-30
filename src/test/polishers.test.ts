import { inspectWithPreamble } from 'intspector';
import { createAtomLoaderFactory } from 'lib/loader';
import { safeValues, values } from 'lib/polishers';

const typeTest = inspectWithPreamble(`
import { createAtomLoaderFactory } from 'lib/loader';
import { values, safeValues } from 'lib/polishers';

const storage = {
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 123,
    QUIX: 'abcdefghijklmnopqrstuvwxyz',
};
const string = createAtomLoaderFactory(storage)(String);
const number = createAtomLoaderFactory(storage)(Number);

const config1 = {
    my: {
        deep: {
            poem: string('FOO'),
        },
    },
    bar: string('BAR'),
    withConstant: {
        baz: number.hidden('BAZ'),
        ans: 42,
        quix: string.hidden('QUIX'),
    },
};
const config1Values = values(config1);
const config1SafeValues = safeValues(config1);
`);

const storage = {
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 123,
    QUIX: 'abcdefghijklmnopqrstuvwxyz',
};
const string = createAtomLoaderFactory(storage)(String);
const number = createAtomLoaderFactory(storage)(Number);

const config1 = {
    my: {
        deep: {
            poem: string('FOO'),
        },
    },
    bar: string('BAR'),
    withConstant: {
        baz: number.hidden('BAZ'),
        ans: 42,
        quix: string.hidden('QUIX'),
    },
};

describe('polishers', () => {
    describe('values', () => {
        test('integration', () => {
            expect(values(config1)).toMatchSnapshot();
        });
        test('types', () => {
            expect(typeTest('typeof config1Values')).toMatchInlineSnapshot(
                '"{ my: { deep: { poem: string; }; }; bar: string; withConstant: { baz: number; ans: number; quix: string; }; }"'
            );
        });
    });
    describe('safeValues', () => {
        test('integration', () => {
            expect(safeValues(config1)).toMatchSnapshot();
        });
        test('types', () => {
            expect(typeTest('typeof config1SafeValues')).toMatchInlineSnapshot(
                '"{ my: { deep: { poem: string; }; }; bar: string; withConstant: { baz: string; ans: number; quix: string; }; }"'
            );
        });
    });
});
