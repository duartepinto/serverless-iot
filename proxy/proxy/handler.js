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

    request.post({url,json: reqData}, ( function(err,resp,body){
        responseCloud(err,resp, body, functionAddress, reqData)
    }))
}

function responseLocal(err,resp, body){
    console.info(JSON.stringify(body))
}

function responseCloud(err, resp, body, functionAddress , reqData){
    if(err === undefined){
        console.info(JSON.stringify(body))
        return
    }else{
        makeLocalRequest(functionAddress, reqData)
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
