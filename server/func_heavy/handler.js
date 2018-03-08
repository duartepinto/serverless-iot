/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const app = express()

function handle(req) {
    var data = {}
    if(req == undefined || req == null){
        data.status= "error"
        console.info(JSON.stringify(data))
    }

    var request
    var value 

    try{
        request = JSON.parse(req)
        value = request.value;
    }catch (err) {
        data.status= "error"
        console.info(JSON.stringify(data))
        return 
    }

    data.message = "I was able to achieve this result using HEAVY calculations"

    if(value == true){
        data.status = "The light is ON"
    }else{
        data.status = "The light is OFF"
    }

    console.log(JSON.stringify(data))
    return
}

module.exports = (req,res) => {
    handle(req,res)
}
