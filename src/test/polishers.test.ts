import { inspectWithPreamble } from 'intspector';
import { createAtomLoaderFactory } from 'lib/loader';
import { values } from 'lib/polishers';

const typeTest = inspectWithPreamble(`
import { createAtomLoaderFactory } from 'lib/loader';
import { values } from 'lib/polishers';

const string = createAtomLoaderFactory({
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 'baz',
})(String);

const config1 = values({
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
})
`);

const string = createAtomLoaderFactory({
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 'baz',
})(String);

describe('polishers', () => {
    describe('values', () => {
        test('integration', () => {
            expect(
                values({
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
                })
            ).toMatchSnapshot();
        });
        test('types', () => {
            expect(typeTest('typeof config1')).toMatchInlineSnapshot(
                '"{ my: { deep: { poem: string; }; }; bar: string; withConstant: { baz: string; ans: number; }; }"'
            );
        });
    });
});
