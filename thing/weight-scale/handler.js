/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const request = require('request')

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')

function handle(req) {
    var data = {}
    if(req == undefined || req == null){
        data.status= "error1"
        data.message = "Request (req) undefined or null"
        console.info(JSON.stringify(data))
        return
    }

    var reqFunc
    var reqData

    try{
        req = JSON.parse(req)
        reqFunc  = req.func;
        reqData = req.data

        for(var i = 0; i < funcsConfig.length; i++) {
            if(reqFunc == funcsConfig[i].name){
                func = funcsConfig[i]
                break
            }

            if(i == funcsConfig.length - 1)
                throw new Error("function not found")
        }
    }catch (err) {
        data.status= "error"
        data.message = "" + err
        console.info(JSON.stringify(data))
        return 
    }
}

module.exports = (req,res) => {
    handle(req,res)
}
