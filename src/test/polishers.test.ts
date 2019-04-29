import { inspectWithPreamble } from 'intspector';
import { createAtomLoaderFactory } from 'lib/loader';
import { safeValues, values } from 'lib/polishers';

const typeTest = inspectWithPreamble(`
import { createAtomLoaderFactory } from 'lib/loader';
import { values, safeValues } from 'lib/polishers';

const string = createAtomLoaderFactory({
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 'baz',
})(String);

const config1 = {
    my: {
        deep: {
            poem: string('FOO'),
        },
    },
    bar: string('BAR'),
    withConstant: {
        baz: string('BAZ'),
        ans: 42,
    },
};
const config1Values = values(config1);
const config1SafeValues = values(config1);
`);

const string = createAtomLoaderFactory({
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 'baz',
})(String);

const config1 = {
    my: {
        deep: {
            poem: string('FOO'),
        },
    },
    bar: string('BAR'),
    withConstant: {
        baz: string('BAZ'),
        ans: 42,
    },
};

describe('polishers', () => {
    describe('values', () => {
        test('integration', () => {
            expect(values(config1)).toMatchSnapshot();
        });
        test('types', () => {
            expect(typeTest('typeof config1Values')).toMatchInlineSnapshot(
                '"{ my: { deep: { poem: string; }; }; bar: string; withConstant: { baz: string; ans: number; }; }"'
            );
        });
    });
    describe('safeValues', () => {
        test('integration', () => {
            expect(safeValues(config1)).toMatchSnapshot();
        });
        test('types', () => {
            expect(typeTest('typeof config1SafeValues')).toMatchInlineSnapshot(
                '"{ my: { deep: { poem: string; }; }; bar: string; withConstant: { baz: string; ans: number; }; }"'
            );
        });
    });
});
