/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const request = require('request')
const syncRequest = require('sync-request')

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
    var func  

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
    //if(!rigConfigs.thing){
        //makeLocalRequest(func.address, reqData)
        //return
    //}


    if(isLocal){
        makeLocalRequest(func.address, reqData)
    }else{
        makeCloudRequest(func, reqData)
    }
}

function makeLocalRequest(functionAddress, reqData){
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort
    url += "/" + functionAddress
    request.post({url,json: reqData}, responseLocal)
}

function makeCloudRequest(func, reqData){
    var url = rigConfigs.serverUrl + ":" + rigConfigs.serverPort
    var initTime = process.hrtime()[0]
    url += "/" + func.address 

    request.post({url,json: reqData}, ( function(err,resp,body){
        responseCloud(err,resp, body, func, reqData, initTime)
    }))
}

function responseLocal(err,resp, body){
    console.info(JSON.stringify(body))
}

function responseCloud(err, resp, body, func , reqData, initTime){
    if(err === undefined){
        var duration = process.hrtime()[0] - initTime
        console.info(JSON.stringify(body))
        var url = rigConfigs.localUrl + ":" + rigConfigs.localPort + "/function/insert_duration"
        var durationReqbody = {func: func.name, duration: duration}
        request.post({url, json: durationReqbody})
        return
    }else{
        makeLocalRequest(func.address, reqData)
    }
}

// This function needs to be atomic (or at least guarantee consistency)
function functionDeployed(func){
    if(func.cloudOnly === true)
        return true

    var functionWeights = getFunctionWeights(func);

    functionWeights.then(function(result){
        if(functionWeights.cloudWeight > functionWeights.localWeight){
            return true
        }else{
            return false
        }
    })
    
}

//TODO IMPLEMENT
function getFunctionWeights(){

}

module.exports = (req,res) => {
    handle(req,res)
}
