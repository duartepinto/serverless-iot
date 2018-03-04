/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const app = express()

function handle(callback, context) {
    var data = {}
    if(callback == undefined || callback == null){
        data.status= "error"
        console.info(JSON.stringify(data))
        //callback(undefined, data)
    }

    var request = JSON.parse(callback)
    var value = request.value;

    if(value == true){
        data.status = "The light is ON"
        console.log(JSON.stringify(data))
        //callback(undefined, data)
    }
    else{
        data.status = "The light is OFF"
        console.log(JSON.stringify(data))
        //callback(undefined, data)
    }
    return
}

module.exports = (callback, context) => {
    handle(callback, context)
}
