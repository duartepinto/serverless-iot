/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const request = require('request')
const app = express()

const rigConfig = require('./my_rig_config.json')

var data = {}
var value 

function handle(req) {
    if(req == undefined || req == null){
        data.status= "error"
        console.info(JSON.stringify(data))
    }

    try{
        req = JSON.parse(req)
        value = req.value;
    }catch (err) {
        data.status= err
        console.info(JSON.stringify(data))
        return 
    }


    request(rigConfig.localUrl+":"+rigConfig.localPort+"/function/func_nodeinfo", uponNodeInfoReq)

    return
}

function uponNodeInfoReq(err, response, body){
    data.nodeInfo = body
    data.message = "I was able to achieve this result using SUPER HEAVY calculations"
    data.status = assertValue(value)
    console.log(JSON.stringify(data))
}

function assertValue(value){
    if(value == true){
        return "The light is ON"
    }else{
        return "The light is OFF"
    }
}

module.exports = (req,res) => {
    handle(req,res)
}
