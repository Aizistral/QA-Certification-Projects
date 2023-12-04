const chai = require('chai');
const { SudokuSolver } = require('../controllers/sudoku-solver.js');

const assert = chai.assert;
const solver = new SudokuSolver();

suite('Unit Tests', () => {

    test('Validate a correct puzzle', () => {
        const puzzle = '1.....3.8.6.4..............2.3.1...........958.........5.6...7.....8.2...4.......';
        assert.strictEqual(solver.validate(puzzle), true);
    });

    test('Validate a puzzle with invalid characters', () => {
        const puzzle = '15.3....c.7..4.2....4.7a.....8.........0..1.8.1..8.79..-...38......q....6....7423';
        assert.deepStrictEqual(solver.validate(puzzle), { error: 'Invalid characters in puzzle' });
    });

    test('Validate a puzzle with incorrect length', () => {
        const puzzle = '..1.....7.9....2....';
        assert.deepStrictEqual(solver.validate(puzzle), { error: 'Expected puzzle to be 81 characters long' });
    });

    test('Test correct row placement', () => {
        const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
        const row = 4;
        const column = 4;
        const value = 3;
        assert.strictEqual(solver.checkRowPlacement(puzzle, row, column, value), true);
    });

    test('Test incorrect row placement', () => {
        const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
        const row = 1;
        const column = 3;
        const value = 8;
        assert.strictEqual(solver.checkRowPlacement(puzzle, row, column, value), false);
    });

    test('Test correct column placement', () => {
        const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
        const row = 4;
        const column = 5;
        const value = 2;
        assert.strictEqual(solver.checkColPlacement(puzzle, row, column, value), true);
    });

    test('Test incorrect column placement', () => {
        const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
        const row = 4;
        const column = 0;
        const value = 4;
        assert.strictEqual(solver.checkColPlacement(puzzle, row, column, value), false);
    });

    test('Test correct 3x3 region placement', () => {
        const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
        const row = 1;
        const column = 1;
        const value = 4;
        assert.strictEqual(solver.checkRegionPlacement(puzzle, row, column, value), true);
    });

    test('Test incorrect 3x3 region placement', () => {
        const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
        const row = 3;
        const column = 5;
        const value = 5;
        assert.strictEqual(solver.checkRegionPlacement(puzzle, row, column, value), false);
    });

    test('Test valid puzzle strings', () => {
        const puzzles = [
            '..8.9.1...6.5...2......6....3.1.7.5.........9..4...3...5....2...7...3.8.2..7....4',
            '.52..68.......7.2.......6....48..9..2..41......1.....8..61..38.....9...63..6..1.9',
            '..5..8..18......9.......78....4.....64....9......53..2.6.........138..5....9.714.'
        ];

        puzzles.forEach(puzzle => assert.strictEqual(solver.validate(puzzle), true));
    });

    test('Test invalid puzzle strings', () => {
        const puzzles = [
            '...8.9.1...6.5...2......6........1.7.5.........9..4...3...5....2...7...3.8.2..7....4',
            'HAhrc1AzJf3fSWRsbMrLhsx7yIjrF92oMte8dj5Y4z6DqmUWu1SUgCLO4Mc3ta2dejpCfrkoSDq711VeS',
            '..8..534.2..9.......2......58...6.3.4...1....'
        ];

        puzzles.forEach(puzzle => assert.notStrictEqual(solver.validate(puzzle), true));
    });

    test('Test solver returns the expected solution for an incomplete puzzle', () => {
        // ultra hard btw
        const puzzle = '1.....3.8.7.4..............2.3.1...........958.........5.6...7.....8.2...4.......';
        const solution = '129576348376428519584391627293815764417263895865749132958632471731984256642157983';

        assert.strictEqual(solver.solve(puzzle), solution);
    });

});