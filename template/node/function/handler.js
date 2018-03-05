/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const app = express()

function handle(req) {
    console.log('Hello! You said:', req)
}

module.exports = (req,res) => {
    handle(req,res)
}
