"use strict";

const { SudokuSolver } = require("../controllers/sudoku-solver.js");

module.exports = function (app) {

    const solver = new SudokuSolver();
    const rowMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8 };

    app.route("/api/check")
        .post((req, res) => {
            const puzzle = req.body.puzzle;
            const coordinateStr = req.body.coordinate;
            const valueStr = req.body.value;

            if (!puzzle || !coordinateStr || !valueStr)
                return res.status(200).send({ error: "Required field(s) missing" });

            const validation = solver.validate(puzzle);

            if (validation !== true)
                return res.status(200).send(validation);

            if (!coordinateStr.match(/^[A-I][1-9]$/))
                return res.status(200).send({ error: "Invalid coordinate" });

            if (!valueStr.match(/^[1-9]$/))
                return res.status(200).send({ error: "Invalid value" });

            const row = rowMap[coordinateStr[0]];
            const col = parseInt(coordinateStr[1]) - 1;
            const value = parseInt(valueStr);

            const conflict = [];

            if (!solver.checkRowPlacement(puzzle, row, col, value))
                conflict.push("row");

            if (!solver.checkColPlacement(puzzle, row, col, value))
                conflict.push("column");

            if (!solver.checkRegionPlacement(puzzle, row, col, value))
                conflict.push("region");

            if (conflict.length === 0)
                return res.status(200).send({ valid: true });
            else
                return res.status(200).send({ valid: false, conflict });
        });

    app.route("/api/solve")
        .post((req, res) => {
            const puzzle = req.body.puzzle;

            if (!puzzle)
                return res.status(200).send({ error: "Required field missing" });

            const validation = solver.validate(puzzle);

            if (validation !== true)
                return res.status(200).send(validation);

            try {
                const solution = solver.solve(puzzle);
                return res.status(200).send({ solution });
            } catch (err) {
                return res.status(200).send({ error: "Puzzle cannot be solved" });
            }
        });
};
