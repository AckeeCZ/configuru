import { parseBool } from '../lib/helpers';

describe('Helpers', () => {
    describe('parseBool', () => {
        it.each([
            [true, true],
            ['true', true],
            ['1', true],
            [1, true],
            [false, false],
            ['false', false],
            ['0', false],
            [0, false],
        ])('%p -> %p', (input, result) => {
            expect(parseBool(input)).toBe(result);
        });
    });
});
