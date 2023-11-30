const chaiHttp = require('chai-http');
const chai = require('chai');
let assert = chai.assert;
const server = require('../server');
const { JSON } = require("mocha/lib/reporters");

chai.use(chaiHttp);

suite('Functional Tests', function () {
    this.timeout(5000);

    test('Valid GET at /api/convert', function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/convert?input=2/3kg')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                    "initNum": 0.6666666666666666,
                    "initUnit": "kg",
                    "returnNum": 1.46975,
                    "returnUnit": "lbs",
                    "string": "0.6666666666666666 kilograms converts to 1.46975 pounds"
                });
                done();
            });
    });

    test('Invalid unit GET at /api/convert', function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/convert?input=32g')
            .end(function (err, res) {
                assert.equal(res.status, 400);
                assert.deepEqual(res.text, "invalid unit");
                done();
            });
    });

    test('Invalid number GET at /api/convert', function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/convert?input=3/0L')
            .end(function (err, res) {
                assert.equal(res.status, 400);
                assert.deepEqual(res.text, "invalid number");
                done();
            });
    });

    test('Invalid number and unit GET at /api/convert', function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/convert?input=5/7/2.5godzillaton')
            .end(function (err, res) {
                assert.equal(res.status, 400);
                assert.deepEqual(res.text, "invalid number and unit");
                done();
            });
    });

    test('Unit with no number GET at /api/convert', function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/convert?input=kg')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                    "initNum": 1,
                    "initUnit": "kg",
                    "returnNum": 2.20462,
                    "returnUnit": "lbs",
                    "string": "1 kilograms converts to 2.20462 pounds"
                });
                done();
            });
    });
});
