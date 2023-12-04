const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);

const Translator = require('../components/translator.js');

suite('Functional Tests', () => {

    test('Translation with text and locale fields: POST request to /api/translate', (done) => {
        const text = 'The car boot sale at Boxted Airfield was called off.';
        const translation = 'The <span class="highlight">swap meet</span> at Boxted Airfield was called off.';
        const locale = 'british-to-american';

        chai.request(server)
            .post('/api/translate')
            .send({ text, locale })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.strictEqual(res.body.text, text);
                assert.strictEqual(res.body.translation, translation);
                done();
            });
    });

    test('Translation with text and invalid locale field: POST request to /api/translate', (done) => {
        const text = 'I had a bicky then went to the chippy.';
        const locale = 'invalid';

        chai.request(server)
            .post('/api/translate')
            .send({ text, locale })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Invalid value for locale field' });
                done();
            });
    });

    test('Translation with missing text field: POST request to /api/translate', (done) => {
        const locale = 'british-to-american';

        chai.request(server)
            .post('/api/translate')
            .send({ locale })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Required field(s) missing' });
                done();
            });
    });

    test('Translation with missing locale field: POST request to /api/translate', (done) => {
        const text = 'I had a bicky then went to the chippy.';

        chai.request(server)
            .post('/api/translate')
            .send({ text })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'Required field(s) missing' });
                done();
            });
    });

    test('Translation with empty text: POST request to /api/translate', (done) => {
        const text = '';
        const locale = 'british-to-american';

        chai.request(server)
            .post('/api/translate')
            .send({ text, locale })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.deepStrictEqual(res.body, { error: 'No text to translate' });
                done();
            });
    });

    test('Translation with text that needs no translation: POST request to /api/translate', (done) => {
        const text = 'It be what it do and it do what it be.';
        const translation = 'Everything looks good to me!';
        const locale = 'american-to-british';

        chai.request(server)
            .post('/api/translate')
            .send({ text, locale })
            .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.strictEqual(res.body.text, text);
                assert.strictEqual(res.body.translation, translation);
                done();
            });
    });


});
