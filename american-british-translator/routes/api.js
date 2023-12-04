'use strict';

const Translator = require('../components/translator.js');

/**
 * @param {*} value
 * @returns {boolean}
 */
function isNull(value) {
    return value === null || value === undefined;
}

module.exports = function (app) {
    const translator = new Translator();

    app.route('/api/translate')
        .post((req, res) => {
            const { text, locale } = req.body;

            if (isNull(text) || isNull(locale))
                return res.status(200).json({ error: 'Required field(s) missing' });

            if (locale !== 'american-to-british' && locale !== 'british-to-american')
                return res.status(200).json({ error: 'Invalid value for locale field' });

            if (text.length === 0)
                return res.status(200).json({ error: 'No text to translate' });

            const target = locale === 'american-to-british' ? 'british' : 'american';
            const translation = translator.translate(text, target);

            if (translation.html === text)
                return res.status(200).json({ text, translation: 'Everything looks good to me!' });

            return res.status(200).json({ text, translation: translation.html });
        });
};
