const units = ["gal", "L", "lbs", "kg", "mi", "km"];

// I wish I could use typescript... 🌈🌟

function ConvertHandler() {

    /**
     * @param {string} input
     * @returns {string}
     */
    this.retrieveUnit = function (input) {
        let unit = "";

        for (let i = 0; i < input.length; i++) {
            const iChar = input.charAt(i);

            if (/^[a-zA-Z]$/.test(iChar)) {
                unit = input.substring(i);
                break;
            }
        }

        if (unit === "l" || unit === "L")
            return "L";
        else
            return unit.toLocaleLowerCase();
    };

    /**
     * @param {string} input
     * @returns {string}
     */
    this.retrieveNumber = function (input) {
        const unit = this.retrieveUnit(input);
        return input.substring(0, input.length - unit.length);
    };

    /**
     * @param {string} input
     * @returns {number}
     * @throws {Error}
     */
    this.getNum = function (input) {
        const numStr = this.retrieveNumber(input);
        let numEval = null;

        if (numStr.length < 1)
            return 1;

        try {
            if (numStr.includes("/")) {
                const numStrSplit = numStr.split("/");

                if (numStrSplit.length > 2)
                    throw new Error("More than one '/' in the fraction");

                const numerator = parseFloat(numStrSplit[0]);
                const denominator = parseFloat(numStrSplit[1]);

                if (numerator < 0 || denominator <= 0)
                    throw new Error("Invalid numerator and/or denominator");

                numEval = parseFloat(numerator) / parseFloat(denominator);
            } else {
                numEval = parseFloat(numStr);

                if (numEval < 0)
                    throw new Error("Number can't be negative");
            }
        } catch (Error) {
            throw new Error(`Invalid number: ${numStr}, for input: ${input}`);
        }

        return numEval;
    };

    /**
     * @param {string} input
     * @returns {string}
     * @throws {Error}
     */
    this.getUnit = function (input) {
        const unit = this.retrieveUnit(input);

        if (units.indexOf(unit) < 0)
            throw new Error(`Invalid unit: ${unit}, for input: ${input}`);

        return unit;
    };

    /**
     * @param {string} initUnit
     * @returns {string}
     * @throws {Error}
     */
    this.getReturnUnit = function (initUnit) {
        const unitIndex = units.indexOf(initUnit);

        if (unitIndex < 0)
            throw new Error(`Invalid unit: ${initUnit}`);

        if (unitIndex % 2 == 0) {
            return units[unitIndex + 1];
        } else {
            return units[unitIndex - 1];
        }
    };

    /**
     * @param {string} unit
     * @returns {string}
     * @throws {Error}
     */
    this.spellOutUnit = function (unit) {
        switch (unit) {
            case "gal":
                return "gallons";
            case "L":
                return "liters";
            case "lbs":
                return "pounds";
            case "kg":
                return "kilograms";
            case "mi":
                return "miles";
            case "km":
                return "kilometers";
            default:
                throw new Error(`Invalid unit: ${unit}`);
        }
    };

    /**
     * @param {number} number
     * @param {number} decimalPlaces
     * @returns {string}
     * @throws {Error}
     */
    this.roundToDecimal = function (number, decimalPlaces) {
        if (isNaN(number) || isNaN(decimalPlaces) || decimalPlaces < 0)
            throw new Error('Invalid input');

        // fun fact, this can be used to show why x ^ 0 = 1
        const multiplier = 10 ** decimalPlaces;

        return Math.round(number * multiplier) / multiplier;
    };

    /**
     * @param {number} initNum
     * @param {string} initUnit
     * @throws {Error}
     */
    this.convert = function (initNum, initUnit) {
        const galToL = 3.78541;
        const lbsToKg = 0.453592;
        const miToKm = 1.60934;

        const outUnit = this.getReturnUnit(initUnit);
        let outNum = null;

        // This isn't particularly DRY, but I'm given these constants as
        // individual variables so 🤷‍♀️
        switch (initUnit) {
            case "gal":
                outNum = initNum * galToL;
                break;
            case "L":
                outNum = initNum / galToL;
                break;
            case "lbs":
                outNum = initNum * lbsToKg;
                break;
            case "kg":
                outNum = initNum / lbsToKg;
                break;
            case "mi":
                outNum = initNum * miToKm;
                break;
            case "km":
                outNum = initNum / miToKm;
                break;
            default:
                throw new Error(`Invalid unit: ${initUnit}`);
        }

        outNum = this.roundToDecimal(outNum, 5);

        return { outNum, outUnit };
    };

    /**
     * @param {number} initNum
     * @param {string} initUnit
     * @param {number} returnNum
     * @param {string} returnUnit
     * @returns {string}
     * @throws {Error}
     */
    this.getString = function (initNum, initUnit, returnNum, returnUnit) {
        const strInput = `${initNum} ${this.spellOutUnit(initUnit)}`;
        const strOutput = `${this.roundToDecimal(returnNum, 5)} ${this.spellOutUnit(returnUnit)}`;

        return `${strInput} converts to ${strOutput}`;
    };

}

module.exports = ConvertHandler;
