/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const app = express()
const minimist = require('minimist')

const handler = require('./handler.js');

var args = minimist(process.argv.slice(2))

if(args.server == true){
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
}else{
    var req = args.d 
    handler(req)
}

app.get('/', function (req, res) {
    handler(req, res)
});

