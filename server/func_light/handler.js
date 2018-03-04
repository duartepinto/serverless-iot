/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const app = express()

function handle(req) {
    var value = req.value;

    if(value == true)
        console.log("The light is ON")
    else
        console.log("The light is OFF")
}

module.exports = (req) => {
    handle(req)
}
