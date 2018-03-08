/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const express = require('express')
const request = require('request')
const app = express()

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')

var reqFunc
var reqData
var func  

function handle(req) {
    var data = {}
    if(req == undefined || req == null){
        data.status= "error1"
        data.message = "Request (req) undefined or null"
        console.info(JSON.stringify(data))
        return
    }


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
    var url
    var isLocal = functionDeployed(func)

    //If it is a server, then automatically make cloud request. 
    //This 'if' should be unnecessary because this function should not be deployed to the server swarm.
    //Should only be deployed in the local swarm
    if(!rigConfigs.thing){
        makeCloudRequest(func.address, reqData)
        return
    }

    if(functionDeployed(func)){
        makeLocalRequest(func.address, reqData)
    }else{
        makeCloudRequest(func.address, reqData)
    }

}

function makeLocalRequest(functionAddress, reqData){
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort
    url += "/" + functionAddress
    request.post({url,json: reqData}, responseLocal)
}

function makeCloudRequest(functionAddress, reqData){
    var url = rigConfigs.serverUrl + ":" + rigConfigs.serverPort
    url += "/" + functionAddress
    
    //TODO REMOVE THIS
    var data = {}
    data.status = "This ran on the server. Hurray?"
    console.info(JSON.stringify(data))
    return

    request.post({url,json: reqData}, responseCloud)
     
}

function responseLocal(err,httpResponse, body){
    console.info(body)
}

function responseCloud(err,httpResponse, body){
    if(err != undefined){
        console.info(body)
        return
    }else{
        makeLocalRequest(func.address, reqData)
    }
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
