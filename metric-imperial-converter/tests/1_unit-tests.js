const chai = require('chai');
const assert = chai.assert;
const ConvertHandler = require('../controllers/convertHandler.js');

const convertHandler = new ConvertHandler();
const units = ["gal", "L", "lbs", "kg", "mi", "km"];
const unitMap = {
    "gal": "L",
    "L": "gal",
    "lbs": "kg",
    "kg": "lbs",
    "mi": "km",
    "km": "mi"
};

suite('Unit Tests', function () {
    test("#1 Read integer number", function () {
        assert.strictEqual(convertHandler.getNum("12kg"), 12);
    });

    test("#2 Read decimal number", function () {
        assert.strictEqual(convertHandler.getNum("3.75mi"), 3.75);
    });

    test("#3 Read fractional number", function () {
        assert.strictEqual(convertHandler.getNum("4/8lbs"), 0.5);
    });

    test("#4 Read decimal fractional number", function () {
        assert.strictEqual(convertHandler.getNum("6.5/0.5lbs"), 13);
    });

    test("#5 Fail to read double-fraction", function () {
        const input = "1/2/2mi";
        let error = null;

        try {
            convertHandler.getNum(input);
        } catch (err) {
            error = err;
        }

        assert.ok(error, "Should throw an error reading double-fraction " + input);
    });

    test("#6 Return 1 when no number is provided", function () {
        assert.strictEqual(convertHandler.getNum("kg"), 1);
    });

    test("#7 Read all valid units", function () {
        for (const unit of units) {
            assert.strictEqual(convertHandler.getUnit(13.2 + unit), unit);
        }
    });

    test("#8 Fail to read invalid units", function () {
        const invalidUnits = ["godzillaton", "BIG", "bozos", "heck"];

        for (const unit of invalidUnits) {
            const input = 4.35 + unit;
            let error = null;

            try {
                convertHandler.getUnit(input);
            } catch (err) {
                error = err;
            }

            assert.ok(error, "Should throw an error reading " + input);
        }
    });

    test("#9 Produce correct return units", function () {
        for (const unit in unitMap) {
            assert.strictEqual(convertHandler.getReturnUnit(unit), unitMap[unit]);
        }
    });

    test("#10 Spell correct strings", function () {
        const inputNum = 13.2;
        const outputNum = 271.25;

        for (const inputUnit in unitMap) {
            const outputUnit = unitMap[inputUnit];
            const spelledInputUnit = convertHandler.spellOutUnit(inputUnit);
            const spelledOutputUnit = convertHandler.spellOutUnit(outputUnit);
            const expectedString = `${inputNum} ${spelledInputUnit} converts to ${outputNum} ${spelledOutputUnit}`;

            assert.strictEqual(convertHandler.getString(inputNum, inputUnit, outputNum, outputUnit), expectedString);
        }
    });

    test("#11 Convert gallons to liters", function () {
        assert.deepEqual(convertHandler.convert(12, "gal"), { outNum: 45.42492, outUnit: "L" });
    });

    test("#12 Convert liters to gallons", function () {
        assert.deepEqual(convertHandler.convert(45, "L"), { outNum: 11.88775, outUnit: "gal" });
    });

    test("#13 Convert miles to kilometers", function () {
        assert.deepEqual(convertHandler.convert(1.75, "mi"), { outNum: 2.81635, outUnit: "km" });
    });

    test("#14 Convert kilometers to miles", function () {
        assert.deepEqual(convertHandler.convert(7, "km"), { outNum: 4.34961, outUnit: "mi" });
    });

    test("#15 Convert pounds to kilograms", function () {
        assert.deepEqual(convertHandler.convert(15, "lbs"), { outNum: 6.80388, outUnit: "kg" });
    });

    test("#16 Convert kilograms to pounds", function () {
        assert.deepEqual(convertHandler.convert(2.5, "kg"), { outNum: 5.51156, outUnit: "lbs" });
    });
});