import { Utilities } from '../utils';
import { BowlingScoreCalculator } from '../../src/services';
import { ThrowTally, ScoreCard, FrameScore } from '../../src/models';
import { InvalidPinCombinationError } from '../../src/shared';
/**
 * Performs unit tests on the BowlingScoreCalculator service
 * 
 * API Tests
 * 
 * @group api
 */

class BowlingScoreCalculatorTest {
    private static instance: BowlingScoreCalculatorTest;

    private constructor (
        private scoreCalculator = new BowlingScoreCalculator()
    ) {

    }

    public static getInstance(): BowlingScoreCalculatorTest {
        if (!this.instance) {
            this.instance = new BowlingScoreCalculatorTest();
        }

        return this.instance;
    }

    public testFinalScore(throwValues: number[], expectedFinalScore: number) {
        const throwTally = new ThrowTally();

        for (let i: number = 0; i < throwValues.length; i++) {
            throwTally.setThrow(i, throwValues[i]);
        }

        const scoreCard: ScoreCard = this.scoreCalculator.computeScoreCard(throwTally);

        expect(scoreCard.finalScore).toEqual(expectedFinalScore);
    }

    public testForError(throwValues: number[]) {
        const throwTally = new ThrowTally();
        let exception!: Error;

        for (let i: number = 0; i < throwValues.length; i++) {
            throwTally.setThrow(i, throwValues[i]);
        }

        try {
            const scoreCard: ScoreCard = this.scoreCalculator.computeScoreCard(throwTally);
        }
        catch (err) {
            exception = err;
        }

        expect(exception instanceof InvalidPinCombinationError).toBeTruthy();
    }
}


describe('Basic game with only 1 throw', () => {
    test('Test for a correct score after only 1 throw', () => {
        BowlingScoreCalculatorTest.getInstance().testFinalScore([ 6 ], 6);
    });
});

describe('Basic game with no spares or strikes', () => {

    test('Test for a correct frame score with 2 throws', () => {
        BowlingScoreCalculatorTest.getInstance().testFinalScore([ 6, 3 ], (6 + 3));
    });

    test('Test for a correct frame score with all throws the same', () => {
        BowlingScoreCalculatorTest.getInstance().testFinalScore(new Array<number>(10 * 2).fill(2), 2 * 2 * 10);
    });
});


describe('Test for the spare case', () => {
    const scoreCalculator: BowlingScoreCalculator = new BowlingScoreCalculator();

    test('Test for correct frame scores with 1 spare and 1 more throw', () => {
        BowlingScoreCalculatorTest.getInstance().testFinalScore([ 5, 5, 1 ], (5 + 5 + 1) + 1);
    });

    test('Test for correct frame scores with 2 spares and 2 more throws', () => {
        const throwValues: number[] = [ 5, 5, 5, 5, 1, 2 ];
        const expectedFinalScore = (5 + 5 + 5) + (5 + 5 + 1) + (1 + 2);

        BowlingScoreCalculatorTest.getInstance().testFinalScore(throwValues, expectedFinalScore);
    });

    test('Test for correct frame scores with all 5s', () => {
        const throwValues: number[] = new Array(ThrowTally.MAX_THROWS).fill(5);
        const expectedFinalScore = (5 + 5 + 5) * 9 + (5 + 5 + 5);

        BowlingScoreCalculatorTest.getInstance().testFinalScore(throwValues, expectedFinalScore);
    });
});

describe('Test for the strike case', () => {
    const scoreCalculator: BowlingScoreCalculator = new BowlingScoreCalculator();

    test('Test for correct frame scores with 1 strike and 2 more throws', () => {
        BowlingScoreCalculatorTest.getInstance().testFinalScore([ 10, 0, 1, 2 ], (10 + 1 + 2) + (1 + 2));
    });

    test('Test for correct frame scores with 2 strikes and 2 more throws', () => {
        const throwValues: number[] = [ 10, 0, 10, 0, 1, 2 ];
        const expectedFinalScore = (10 + 10 + 1) + (10 + 1 + 2) + (1 + 2);

        BowlingScoreCalculatorTest.getInstance().testFinalScore(throwValues, expectedFinalScore);
    });
});

describe('Test for a mix of strikes and spares', () => {
    const scoreCalculator: BowlingScoreCalculator = new BowlingScoreCalculator();

    test('Test for correct score with alternating strikes and spares', () => {
        const throwValues: number[] = [ 10, 0, 5, 5, 10, 0, 5, 5, 10, 0, 5, 5, 10, 0, 5, 5, 10, 0, 0, 0 ];
        const expectedFinalScore = 170;

        BowlingScoreCalculatorTest.getInstance().testFinalScore(throwValues, expectedFinalScore);
    });

    test('Test for correct score with repeated spares', () => {
        const throwValues: number[] = [ 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9 ];
        const expectedFinalScore = 190;

        BowlingScoreCalculatorTest.getInstance().testFinalScore(throwValues, expectedFinalScore);
    });

    test('Test for correct score with perfect game', () => {
        const throwValues: number[] = [ 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 10, 10 ];
        const expectedFinalScore = 300;

        BowlingScoreCalculatorTest.getInstance().testFinalScore(throwValues, expectedFinalScore);
    });
});

describe('Test for special case scenarios on the final frame', () => {
    const scoreCalculator: BowlingScoreCalculator = new BowlingScoreCalculator();

    test('Test for an invalid number of pins on the second throw of the final frame', () => {
        const throwValues: number[] = [ 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0,    5, 10 ];

        BowlingScoreCalculatorTest.getInstance().testForError(throwValues);
    });

    test('Test for an invalid 3rd throw in the final frame if there is no prior spare or strike', () => {
        const throwValues: number[] = [ 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0,    5, 3, 3 ];

        BowlingScoreCalculatorTest.getInstance().testForError(throwValues);
    });

    test('Test for an invalid number of pins on the final throw of the final frame', () => {
        const throwValues: number[] = [ 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0,    10, 3, 10 ];

        BowlingScoreCalculatorTest.getInstance().testForError(throwValues);
    });

    test('Test for an invalid number of total pins in the final frame', () => {
        const throwValues: number[] = [ 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0,    16, 23, 5 ];

        BowlingScoreCalculatorTest.getInstance().testForError(throwValues);
    });
});