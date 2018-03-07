/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const app = express()

import funcsConfig from './my_functions.json'
import rigConfigs from './my_rig_config.json'

const serverUrl = 'http://'
const localUrl = 'http://127.0.0.1'

function handle(req) {
    var data = {}
    if(req == undefined || req == null){
        data.status= "error1"
        data.message = "Request (req) undefined or null"
        console.info(JSON.stringify(data))
        return
    }

    var request
    var reqFunc
    var reqData

    var func  
    try{
        request = JSON.parse(req)
        reqFunc  = request.func;
        reqData = request.data

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

    console.log(functionDeployed(func))
}

// This function needs to be atomic (or at least guarantee consistency)
function functionDeployed(func){
    var currentLoad = getCurrentLoad()
    if(currentLoad + func.weight < rigConfigs.maxCapacity && increaseCurrentLoad(func.weight)){
        return true
    }else{
        return false
    }
}

//TODO IMPLEMENT
function getCurrentLoad(){
    return 0
}

//TODO IMPLEMENT
function increaseCurrentLoad(weight){
    return true
}



module.exports = (req,res) => {
    handle(req,res)
}
