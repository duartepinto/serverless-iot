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
    var reqOptions
    var func  

    try{
        req = JSON.parse(req)
        reqFunc  = req.func;
        reqData = req.data
        reqOptions = req.options

        for(var i = 0; i < funcsConfig.length; i++) {
            if(reqFunc == funcsConfig[i].name){
                func = funcsConfig[i]
                func.requestOptions = reqOptions
                break
            }

            if(i == funcsConfig.length - 1)
                throw new Error("function not found")
        }
    }catch (err) {
        data.status= "error2"
        data.message = "" + err
        console.info(JSON.stringify(data))
        return 
    }
    var url
    var isLocalPromise = functionDeployed(func)

    isLocalPromise.then((result) =>{
        if(result){
            makeLocalRequest(func.address, reqData)
        }else{
            makeCloudRequest(func, reqData)
        }
    }, (err) => {
        var body = {}
        body.status = "error3"
        body.message = err
        console.info(JSON.stringify(body))
    }) 
    
}

function makeLocalRequest(functionAddress, reqData){
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort
    url += "/" + functionAddress
    request.post({url,json: reqData}, responseLocal)
}

function makeCloudRequest(func, reqData){
    var url = rigConfigs.serverUrl + ":" + rigConfigs.serverPort
    var initTime = process.hrtime()
    url += "/" + func.address 

    request.post({url,json: reqData}, ( function(err,resp,body){
        responseCloud(err,resp, body, func, reqData, initTime)
    }))
}

function responseLocal(err,resp, body){
    console.info(JSON.stringify(body))
}

function responseCloud(err, resp, body, func , reqData, initTime){
    if(err){
        if(!func.cloudOnly)
            return makeLocalRequest(func.address, reqData)
        else{
            var data = {}
            data.status = "error"
            data.message = "Could not reach the server" + 
                rigConfigs.serverUrl + ":" + rigConfigs.serverPort + "and execute the cloudOnly request"
        }

    }
    var timeElapsed = getTimeElapsed(initTime)
    
    console.info(JSON.stringify(body))

    sendCloudFunctionTimeElapsed(func,timeElapsed)
    return 
}

function sendCloudFunctionTimeElapsed(func, timeElapsed){
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort + "/function/insert_duration"
    var durationReqbody = {func: func.name, duration: timeElapsed}
    return request.post({url, json: durationReqbody})
}

function getTimeElapsed(initTime){
    const NS_PER_SEC = 1e9

    var diff = process.hrtime(initTime) 
    var timeElapsed = diff[0] * NS_PER_SEC + diff[1]
    return timeElapsed/ NS_PER_SEC
}

function cloudDeployConfiguration(func){
return func.cloudOnly === true && 
        (func.requestOptions === undefined || func.requestOptions.forceLocal === false) || 
            (func.requestOptions !== undefined && func.requestOptions.forceCloud === true)
}

function localDeployConfiguration(func){
return func.localOnly === true && 
        (func.requestOptions === undefined || func.requestOptions.forceCloud === false) || 
            (func.requestOptions !== undefined && func.requestOptions.forceLocal === false )
}

function functionDeployed(func){

    var reqBody = { func: func.name, query:"average_duration_seconds" }
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort + "/function/weight_scale"

    return new Promise((resolve, reject) => {
        if(cloudDeployConfiguration(func))
            return resolve(false)
        if(localDeployConfiguration(func))
            return resolve(true)
        request.post({url, json: reqBody}, (error, response, body) => {
            if(error || body.status !== "success") {
                return reject(error)
            }

            // If one of the weights is null it will random the execution
            if(body.cloudWeight === null || body.localWeight === null){
                var rnd = Math.floor(Math.random() * Math.floor(2))

                if(rnd === 0){
                    return resolve(true)
                }else{
                    return resolve(false)
                }
            }
            
            if(body.cloudWeight > body.localWeight){
                return resolve(true)
            }else{
                return resolve(false)
            }
        })

    })
}

module.exports = (req,res) => {
    handle(req,res)
}
