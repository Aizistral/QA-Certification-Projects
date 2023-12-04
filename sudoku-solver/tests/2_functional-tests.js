const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
        const puzzle = '..247..58..............1.4.....2...9528.9.4....9...1.........3.3....75..685..2...';

        chai.request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, {
                    solution: '132479658847563291956281347413725869528196473769348125271854936394617582685932714'
                });
                done();
            });
    });

    test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
        chai.request(server)
            .keepOpen()
            .post('/api/solve')
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Required field missing' });
                done();
            });
    });

    test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
        const puzzle = 'jaG1ZoslMT78axLV8MUJjjqkKXyON05vsg0Pfas1aAv5x1S7VU8snsIpNYd78ZYwjsNHfHH9BK5LCrYwU';

        chai.request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Invalid characters in puzzle' });
                done();
            });
    });

    test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
        const puzzle = '.....7.95.....1...86..2.....2..73..85......6...3..49..3.5...41724........1.5.3.1.21.2..';

        chai.request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
                done();
            });
    });

    test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
        const puzzle = '11...6.8..64..........4...7....9.6...7.4..5..5...7.1...5....32.3....8...4........';

        chai.request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Puzzle cannot be solved' });
                done();
            });
    });

    test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';
        const coordinate = 'A2';
        const value = '5';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { valid: true });
                done();
            });
    });

    test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';
        const coordinate = 'A2';
        const value = '6';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { valid: false, conflict: ['column'] });
                done();
            });
    });

    test('Check a puzzle placement with 2 placement conflicts: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';
        const coordinate = 'B3';
        const value = '2';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { valid: false, conflict: ['row', 'column'] });
                done();
            });
    });

    test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';
        const coordinate = 'B7';
        const value = '7';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { valid: false, conflict: ['row', 'column', 'region'] });
                done();
            });
    });

    test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Required field(s) missing' });
                done();
            });
    });

    test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..H.....C...7..1..6.3....X..5.6..0..2...-.....8..53...7.7.2....46';
        const coordinate = 'C2';
        const value = '2';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Invalid characters in puzzle' });
                done();
            });
    });

    test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.......';
        const coordinate = 'B6';
        const value = '8';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
                done();
            });
    });

    test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';
        const coordinate = 'I0';
        const value = '8';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Invalid coordinate' });
                done();
            });
    });

    test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
        const puzzle = '1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46';
        const coordinate = 'D6';
        const value = '0';

        chai.request(server)
            .keepOpen()
            .post('/api/check')
            .send({ puzzle, coordinate, value })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Invalid value' });
                done();
            });
    });

});