const { cyrb53 } = require('./utils');

// Important note: I have a feeling that I was not supposed to even try to solve
// ultra hard puzzles. I.e. if the puzzle contains no cells with only one possible
// value, immediately evident from examination of their respective rows, columns
// and regions, then I should assume it is unsolvable. That seems to be the case
// with example implementation at https://sudoku-solver.freecodecamp.rocks, which
// gives up when confronted with any ultra hard puzzle.
//
// However, I went that extra mile and implemented proper backtracking, which,
// combined with forward checking and MCV heuristic, allows to solve even the
// hardest puzzles quite efficiently. More extra credit for me, I guess.

class SudokuSolver {

    /**
     * @param {string} puzzleString
     * @returns {true|{error: string}}
     */
    validate(puzzleString) {
        const regex = /^[1-9.]{81}$/;

        if (puzzleString.length !== 81)
            return { error: 'Expected puzzle to be 81 characters long' };

        if (!regex.test(puzzleString))
            return { error: 'Invalid characters in puzzle' };

        return true;
    }

    /**
     * @param {string} puzzleString
     * @param {number} row
     * @param {number} column
     * @param {number} value
     * @returns {boolean}
     */
    checkRowPlacement(puzzleString, row, column, value) {
        return new SudokuGrid(puzzleString).canPlaceRow(column, row, value, true);
    }

    /**
     * @param {string} puzzleString
     * @param {number} row
     * @param {number} column
     * @param {number} value
     * @returns {boolean}
     */
    checkColPlacement(puzzleString, row, column, value) {
        return new SudokuGrid(puzzleString).canPlaceColumn(column, row, value, true);
    }

    /**
     * @param {string} puzzleString
     * @param {number} row
     * @param {number} column
     * @param {number} value
     * @returns {boolean}
     */
    checkRegionPlacement(puzzleString, row, column, value) {
        return new SudokuGrid(puzzleString).canPlaceRegion(column, row, value, true);
    }

    /**
     * @param {string} puzzleString
     * @returns {string}
     * @throws {Error} if solution doesn't exist or cannot be found
     */
    solve(puzzleString) {
        const grid = new SudokuGrid(puzzleString);
        const machine = new SudokuMachine(grid);

        return machine.solve().toCompactString();
    }
}

class SudokuGrid {

    /**
     * @param {string} puzzleString
     */
    constructor(puzzleString) {
        this.grid = this.emptyGrid();

        if (puzzleString)
            for (let i = 0; i < 81; i++) {
                const x = i % 9;
                const y = Math.floor(i / 9);

                let number = -1;

                if (puzzleString[i] !== '.') {
                    number = parseInt(puzzleString[i]);
                }

                this.grid[y][x] = number;
            }
    }

    /**
     * @returns {Array<Array<number|null>>} grid
     */
    emptyGrid() {
        return [
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],

            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],

            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null]
        ];
    }

    /**
     * @returns {Array<Array<number>>} grid
     */
    getArray() {
        return this.grid;
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    isFilled(x, y) {
        return this.grid[y][x] !== -1;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    place(x, y, value) {
        this.grid[y][x] = value;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    canPlace(x, y, value, allowOverwrite = false) {
        if (!allowOverwrite && this.isFilled(x, y))
            return false;

        return this.canPlaceRow(x, y, value, true)
            && this.canPlaceColumn(x, y, value, true)
            && this.canPlaceRegion(x, y, value, true);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    canPlaceRow(x, y, value, allowOverwrite = false) {
        if (!allowOverwrite && this.isFilled(x, y))
            return false;

        for (let iX = 0; iX < 9; iX++) {
            if (iX !== x && this.grid[y][iX] === value) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    canPlaceColumn(x, y, value, allowOverwrite = false) {
        if (!allowOverwrite && this.isFilled(x, y))
            return false;

        for (let iY = 0; iY < 9; iY++) {
            if (iY !== y && this.grid[iY][x] === value) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    canPlaceRegion(x, y, value, allowOverwrite = false) {
        if (!allowOverwrite && this.isFilled(x, y))
            return false;

        const regionX = Math.floor(x / 3);
        const regionY = Math.floor(y / 3);

        for (let iY = regionY * 3; iY < regionY * 3 + 3; iY++) {
            for (let iX = regionX * 3; iX < regionX * 3 + 3; iX++) {
                if (!(iY == y && iX == x) && this.grid[iY][iX] === value) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    getValidValues(x, y) {
        if (this.isFilled(x, y))
            return null;

        const values = [];

        for (let num = 1; num <= 9; num++) {
            if (this.canPlace(x, y, num)) {
                values.push(num);
            }
        }

        return values;
    }

    isConsistent() {
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (!this.isFilled(x, y)) {
                    const values = this.getValidValues(x, y);

                    if (values.length === 0)
                        return false;
                } else {
                    const value = this.grid[y][x];

                    this.grid[y][x] = -1;

                    const canPlace = this.canPlace(x, y, value);

                    this.grid[y][x] = value;

                    if (!canPlace)
                        return false;
                }
            }
        }

        return true;
    }

    isComplete() {
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (!this.isFilled(x, y)) {
                    return false;
                }
            }
        }

        return true;
    }

    copy() {
        const grid = new SudokuGrid();

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                grid.grid[y][x] = this.grid[y][x];
            }
        }

        return grid;
    }

    matchFilled(other) {
        if (!(other instanceof SudokuGrid))
            return false;

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (this.isFilled(x, y) && other.isFilled(x, y) && this.grid[y][x] !== other.grid[y][x])
                    return false;
            }
        }

        return true;
    }

    toString() {
        let str = '';

        for (let y = 0; y < 9; y++) {
            if (y % 3 === 0) {
                str += '-------------------------\n';
            }

            for (let x = 0; x < 9; x++) {
                if (x % 3 === 0) {
                    str += '| ';
                }

                if (this.isFilled(x, y)) {
                    str += this.grid[y][x] + ' ';
                } else {
                    str += '- ';
                }
            }

            str += '|\n';
        }

        str += '-------------------------\n';

        return str;
    }

    toCompactString() {
        let str = '';

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++)
                if (this.isFilled(x, y)) {
                    str += this.grid[y][x];
                } else {
                    str += '.';
                }
        }

        return str;
    }
}

class SudokuMachine {

    /**
     * Some puzzles require considerably more than 5,000 iterations to solve,
     * but even on my machine 5000 iterations take ~170 ms.
     * @param {SudokuGrid} grid
     */
    constructor(grid, iterationLimit = 5_000) {
        if (!grid.isConsistent())
            throw new Error('Grid is not consistent');

        this.grid = grid;
        this.iterationLimit = iterationLimit;

        this.constraints = null;
        this.iterations = null;
        this.path = null;
    }

    /**
     * Fill in all cells that have only one possible value.
     * When there are no more such cells, return collected constraints.
     * @param {SudokuGrid} grid
     */
    preprocess(grid) {
        const constraints = grid.emptyGrid();
        let filled = false;

        do {
            filled = false;

            cycle:
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    const values = grid.getValidValues(x, y);

                    if (!grid.isFilled(x, y)) {
                        if (values.length === 1) {
                            grid.place(x, y, values[0]);
                            filled = true;
                            break cycle;
                        }
                    }

                    constraints[y][x] = values;
                }
            }
        } while (filled);

        return constraints;
    }

    updateConstraints() {
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                this.constraints[y][x] = this.grid.getValidValues(x, y);
            }
        }
    }

    findMCV() {
        let mcv = null;
        let mcvConstraints = null;
        let mcvCount = 10;

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {

                if (!this.grid.isFilled(x, y)) {
                    const values = this.constraints[y][x];

                    if (values.length < mcvCount) {
                        mcv = { x, y };
                        mcvConstraints = values;
                        mcvCount = values.length;
                    }
                }
            }
        }

        if (mcv === null)
            return null;
        else
            return new CellConstraints(mcv.x, mcv.y, mcvConstraints);
    }

    /**
     * @returns {SolutionStep}
     */
    getLastStep() {
        if (this.path.length === 0)
            return null;
        else
            return this.path[this.path.length - 1];
    }

    /**
     * @throws {Error} if path is empty
     * @returns {SolutionStep}
     */
    popLastStep() {
        if (this.path.length === 0)
            throw new Error('Path is empty');
        else
            return this.path.pop();
    }

    getPathHash() {
        return cyrb53(this.path.map(step => step.toString()).join(''));
    }

    getPathString() {
        return this.path.map(step => step.toString()).join(' -> ');
    }

    /**
     * This will attempt to find a solution using backtracking.
     * The idea is to start with most contrained variable (MCV) and try to place a value.
     * Forward checking is used to reduce the domain of other variables, which is what
     * the constraints array is used for.
     * @throws {Error} if no solution exists, or if iteration limit is reached
     * @returns {SudokuGrid}
     */
    solve() {
        console.log('Solving grid:', this.grid.toCompactString());

        this.constraints = this.preprocess(this.grid);
        this.iterations = 0;
        this.path = [];

        const time = Date.now();
        const explored = new Set();

        while (true) {
            if (this.iterations > this.iterationLimit) {
                console.log("Failed to solve, iteration limit reached. Iterations:", this.iterations);
                throw new Error('Iteration limit reached');
            }

            const mcv = this.findMCV();

            if (!mcv) // no more empty cells
                break;

            if (mcv.getValueCount() === 0) { // dead end, need to backtrack
                while (this.getLastStep() && !this.getLastStep().hasAlternatives())
                    this.popLastStep().undo(this.grid);

                if (!this.getLastStep()) {
                    console.log("Failed to solve, no solution exists. Iterations:", this.iterations);
                    throw new Error('No solution exists, iterations: ' + this.iterations);
                }

                this.path.push(this.popLastStep().toAlternate());
            } else {
                this.path.push(new SolutionStep(mcv.x, mcv.y, mcv.values[0], mcv.values.slice(1)));
            }

            this.getLastStep().apply(this.grid);
            this.updateConstraints();

            if (explored.has(this.getPathHash())) {
                console.log("Failed to solve, unexpected loop detected. Iterations:", this.iterations);
                throw new Error('Unexpected loop detected, iterations: ' + this.iterations);
            }

            explored.add(this.getPathHash());
            this.iterations++;
        }

        if (!this.grid.isConsistent()) {
            console.log("Failed to solve, unexpected grid inconsitency. Iterations:", this.iterations);
            throw new Error('Unexpected inconsistency, iterations: ' + this.iterations);
        }

        console.log('Solved in', this.iterations, 'iterations. Time:', Date.now() - time, 'ms');

        return this.grid;
    }
}

class SolutionStep {

    /**
    * @param {number} x
    * @param {number} y
    * @param {number} value
    * @param {Array<number>} alternatives
    */
    constructor(x, y, value, alternatives = []) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.alternatives = alternatives;
    }

    /**
     * @param {SudokuGrid} grid
     */
    apply(grid) {
        grid.place(this.x, this.y, this.value);
        return grid;
    }

    /**
     * @param {SudokuGrid} grid
     */
    undo(grid) {
        grid.place(this.x, this.y, -1);
        return grid;
    }

    hasAlternatives() {
        return this.alternatives.length > 0;
    }

    toAlternate() {
        return new SolutionStep(this.x, this.y, this.alternatives[0], this.alternatives.slice(1));
    }

    toString() {
        return `(${this.x}, ${this.y}) = ${this.value}`;
    }
}

class CellConstraints {

    /**
    * @param {number} x
    * @param {number} y
    * @param {Array<number>} values
    */
    constructor(x, y, values) {
        this.x = x;
        this.y = y;
        this.values = values;
    }

    getValueCount() {
        return this.values.length;
    }

}

module.exports = { SudokuSolver, SudokuGrid, SudokuMachine };

// console.log('Sudoku Solver');

// const testPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
// // const hardPuzzle = '7..39......3........9.4..6..75.....6.8......7......349.....65.....7...2.21...5...';
// const hardPuzzle = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......';
// const testGrid = new SudokuGrid(testPuzzle);
// const hardGrid = new SudokuGrid(hardPuzzle);

// console.log(testGrid.toString());
// console.log(testGrid.getValidValues(1, 0));

// const testMachine = new SudokuMachine(testGrid);

// console.log(testMachine.solve().toString());

// const hardMachine = new SudokuMachine(hardGrid);

// const hardSolved = hardMachine.solve();

// console.log(hardSolved.isConsistent());
// console.log(hardSolved.toString());