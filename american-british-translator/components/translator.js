const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const britishToAmericanSpelling = reverseMap(americanToBritishSpelling);
const britishToAmericanTitles = reverseMap(americanToBritishTitles);

const capitalizedAmericanToBritishTitles = capitalizeValues(americanToBritishTitles);
const capitalizedBritishToAmericanTitles = capitalizeValues(britishToAmericanTitles);

// This moves the "chip shop" entry to the top of the object, so that it is
// matched before the "chippy" entry. This is necessary because my implementation
// detects the end of the "chippy" translation as the input of the "chip shop"
// translation.
// I have verified that this is the only case where this happens.
const britistOnlyFixed = Object.assign({
    "chip shop": britishOnly["chip shop"],
}, britishOnly);

/**
 * @private
 * @param {object} map
 * @returns {object}
 */
function reverseMap(map) {
    const reversedMap = {};

    for (const key in map) {
        reversedMap[map[key]] = key;
    }

    return reversedMap;
}

/**
 * @private
 * @param {object} map
 * @returns {object}
 */
function capitalizeValues(map) {
    const capitalizedMap = {};

    for (const key in map) {
        capitalizedMap[key] = map[key].charAt(0).toUpperCase() + map[key].slice(1);
    }

    return capitalizedMap;
}

/**
 * @param {string} text
 */
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

class Translator {

    /**
     * @param {string} text
     * @param {string} targetLanguage
     */
    translate(text, targetLanguage) {
        const { only, spelling, titles, time } = this.getTargetMaps(targetLanguage);

        let translatedHTML = text;

        for (const map of [only, spelling, titles]) {
            for (const key of Object.keys(map)) {
                let expression = `\\b${escapeRegExp(key)}`;

                if (!key.endsWith('.')) {
                    expression += '\\b';
                }

                const regex = new RegExp(expression, 'gi');
                const replacement = map[key];

                // performance-wise this is garbage, but it's the most straightforward
                // way to do it, and this project is not rated on performance anyway
                translatedHTML = this.htmlReplace(translatedHTML, regex, replacement);
            }
        }

        translatedHTML = this.htmlReplace(translatedHTML, time.regex, time.replacement);
        translatedHTML = this.capitalizeFirstLetter(translatedHTML);

        const translatedNoHTML = translatedHTML.replace(/<[^>]*>/g, '');

        return {
            html: translatedHTML,
            text: translatedNoHTML,
        };
    }

    /**
     * @private
     * @param {string} text
     * @param {RegExp} regex
     * @param {string} replacement
     */
    htmlReplace(text, regex, replacement) {
        return text.replace(regex, `<span class="highlight">${replacement}</span>`);
    }

    /**
     * @private
     * @param {string} text
     */
    capitalizeFirstLetter(text) {
        if (!text) return text;

        const spanPrefix = '<span class="highlight">';

        if (text.startsWith(spanPrefix)) {
            if (text.length === spanPrefix.length)
                return text;
            else
                return spanPrefix + text[spanPrefix.length].toUpperCase() + text.slice(spanPrefix.length + 1);
        } else {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }
    }

    /**
     * @private
     * @param {string} targetLanguage
     * @returns {object}
     */
    getTargetMaps(targetLanguage) {
        switch (targetLanguage) {
            case 'british':
                return {
                    spelling: americanToBritishSpelling,
                    titles: capitalizedAmericanToBritishTitles,
                    only: americanOnly,
                    time: {
                        regex: /([0-9]{1,2}):([0-9]{1,2})/g,
                        replacement: '$1.$2'
                    }
                };
            case 'american':
                return {
                    spelling: britishToAmericanSpelling,
                    titles: capitalizedBritishToAmericanTitles,
                    only: britistOnlyFixed,
                    time: {
                        regex: /([0-9]{1,2}).([0-9]{1,2})/g,
                        replacement: '$1:$2'
                    }
                };
        }
    }

}

module.exports = Translator;

// const text = 'No Mr. Bond, I expect you to die.';
// const translation = 'No Mr Bond, I expect you to die.';
// const target = 'british';

// const translator = new Translator();

// console.log(translator.translate(text, target).text);