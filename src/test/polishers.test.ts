import { createAtomLoaderFactory } from 'lib/loader';
import { values } from 'lib/polishers';

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
    });
});
