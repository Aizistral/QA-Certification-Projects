'use strict';

const expect = require('chai').expect;
const ConvertHandler = require('../controllers/convertHandler.js');

module.exports = function (app) {
    const convertHandler = new ConvertHandler();

    app.route("/api/convert").get((req, res) => {
        const input = req.query.input;

        if (typeof input !== "string")
            return res.status(200).send("invalid input");

        let inputNum = null;
        let inputUnit = null;

        try {
            inputNum = convertHandler.getNum(input);
        } catch (err) {
            // NO-OP
        }

        try {
            inputUnit = convertHandler.getUnit(input);
        } catch (err) {
            // NO-OP
        }

        if (!inputNum && !inputUnit) {
            return res.status(200).send("invalid number and unit");
        } else if (!inputNum) {
            return res.status(200).send("invalid number");
        } else if (!inputUnit) {
            return res.status(200).send("invalid unit");
        }

        const conversion = convertHandler.convert(inputNum, inputUnit);
        const desc = convertHandler.getString(inputNum, inputUnit, conversion.outNum, conversion.outUnit);

        return res.status(200).send({
            initNum: inputNum,
            initUnit: inputUnit,
            returnNum: conversion.outNum,
            returnUnit: conversion.outUnit,
            string: desc
        });
    });
};
