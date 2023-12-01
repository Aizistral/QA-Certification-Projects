/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    /*
    * ----[EXAMPLE TEST]----
    * Each test should completely test the response of the API end-point including response status code!
    */
    test('#example Test GET /api/books', function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/books')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'response should be an array');
                assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
                assert.property(res.body[0], 'title', 'Books in array should contain title');
                assert.property(res.body[0], '_id', 'Books in array should contain _id');
                done();
            });
    });
    /*
    * ----[END of EXAMPLE TEST]----
    */

    const testBook = {
        title: 'Test Book #' + Math.floor(Math.random() * 1000)
    };

    suite('Routing tests', function () {


        suite('POST /api/books with title => create book object/expect book object', function () {

            test('Test POST /api/books with title', function (done) {
                chai.request(server)
                    .keepOpen()
                    .post('/api/books')
                    .send({ title: testBook.title })
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.body.title, testBook.title, 'title should exist and be equal to ' + testBook.title);
                        assert.isString(res.body._id, '_id should exist and be a string');

                        testBook._id = res.body._id; // Save the _id for later tests
                        done();
                    });
            });

            test('Test POST /api/books with no title given', function (done) {
                chai.request(server)
                    .keepOpen()
                    .post('/api/books')
                    .send({})
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.text, 'missing required field title');
                        done();
                    });
            });

        });


        suite('GET /api/books => array of books', function () {

            test('Test GET /api/books', function (done) {
                chai.request(server)
                    .keepOpen()
                    .get('/api/books')
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.isArray(res.body, 'response should be an array');

                        for (const book of res.body) {
                            assert.isString(book._id, '_id should exist and be a string');
                            assert.isString(book.title, 'title should exist and be a string');
                            assert.isNumber(book.commentcount, 'commentcount should exist and be a number');
                        }

                        done();
                    });
            });

        });


        suite('GET /api/books/[id] => book object with [id]', function () {

            test('Test GET /api/books/[id] with id not in db', function (done) {
                chai.request(server)
                    .keepOpen()
                    .get('/api/books/3hWNXz8CNOqO6iutuQW0Llr8')
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.text, 'no book exists');
                        done();
                    });
            });

            test('Test GET /api/books/[id] with valid id in db', function (done) {
                const expectedBook = Object.assign({}, testBook, { comments: [] });

                chai.request(server)
                    .keepOpen()
                    .get('/api/books/' + testBook._id)
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.deepEqual(res.body, expectedBook, 'response should be equal to ' + JSON.stringify(expectedBook));
                        done();
                    });
            });

        });


        suite('POST /api/books/[id] => add comment/expect book object with id', function () {

            test('Test POST /api/books/[id] with comment', function (done) {
                const comment = 'Test comment #' + Math.floor(Math.random() * 1000);
                const expectedBook = Object.assign({}, testBook, { comments: [comment] });

                chai.request(server)
                    .keepOpen()
                    .post('/api/books/' + testBook._id)
                    .send({ comment })
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.deepEqual(res.body, expectedBook, 'response should be equal to ' + JSON.stringify(expectedBook));
                        done();
                    });
            });

            test('Test POST /api/books/[id] without comment field', function (done) {
                chai.request(server)
                    .keepOpen()
                    .post('/api/books/' + testBook._id)
                    .send({})
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.text, 'missing required field comment');
                        done();
                    });
            });

            test('Test POST /api/books/[id] with comment, id not in db', function (done) {
                const comment = 'Test comment #' + Math.floor(Math.random() * 1000);

                chai.request(server)
                    .keepOpen()
                    .post('/api/books/oevUNmWoE5OBS2jV8tkysGCf')
                    .send({ comment })
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.text, 'no book exists');
                        done();
                    });
            });

        });

        suite('DELETE /api/books/[id] => delete book object id', function () {

            test('Test DELETE /api/books/[id] with valid id in db', function (done) {
                chai.request(server)
                    .keepOpen()
                    .delete('/api/books/' + testBook._id)
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.text, 'delete successful');
                        done();
                    });
            });

            test('Test DELETE /api/books/[id] with  id not in db', function (done) {
                chai.request(server)
                    .keepOpen()
                    .delete('/api/books/7ocJGa37cWiSi57b0JzX1GwN')
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 200);
                        assert.strictEqual(res.text, 'no book exists');
                        done();
                    });
            });

        });

    });

});
