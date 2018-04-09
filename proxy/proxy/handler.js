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
        data.status= "error"
        data.message = "" + err
        console.info(JSON.stringify(data))
        return 
    }
    var url
    var isLocal = functionDeployed(func)

    isLocal.then((result) =>{
        if(result){
            makeLocalRequest(func.address, reqData)
        }else{
            makeCloudRequest(func, reqData)
        }
    }, (err) => {
        var body = {}
        body.status = "error"
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

function functionDeployed(func){
    return new Promise((resolve, reject) => {
        if(func.cloudOnly === true || 
            (func.requestOptions !== undefined && func.requestOptions.forceCloud === true ))
            return resolve(false)

        request.post({function: func.name}, (error, response, body) => {
            body = JSON.parse(body)
            if(error || body.status != "success") {
                return reject(error)
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
