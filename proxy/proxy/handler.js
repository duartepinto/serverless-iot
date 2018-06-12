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
                func.requestOptions = reqOptions || {}

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

    isLocalPromise.then((environment) =>{
        if(environment === "local"){
            makeLocalRequest(func, reqData)
        }else{
            makeCloudRequest(func, reqData, environment)
        }
    }, (err) => {
        var body = {}
        body.status = "error3"
        body.message = err
        console.info(JSON.stringify(body))
    }) 
    
}

function makeLocalRequest(func, reqData){
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort
    var initTime = process.hrtime()
    url += "/" + func.address
    request.post({url,json: reqData}, (err,resp,body) => {
        responseLocal(err,resp,body,func,initTime)
    })
}

function makeCloudRequest(func, reqData, server){
    var url = server.url + ":" + server.port
    var initTime = process.hrtime()
    url += "/" + func.address 

    console.log("making cloud request")

    request.post({url,json: reqData}, ( function(err,resp,body){
        responseCloud(err,resp, body, func, reqData, server, initTime)
    }))
}

function responseLocal(err,resp, body,func, initTime){
    var timeElapsed = getTimeElapsed(initTime)
    console.info(JSON.stringify(body))
    sendLocalFunctionTimeElapsed(func, timeElapsed)
    return 
}

function responseCloud(err, resp, body, func , reqData, server, initTime){
    if(err){
        if(!func.cloudOnly)
            return makeLocalRequest(func, reqData)
        else{
            var data = {}
            data.status = "error"
            data.message = "Could not reach the server" + 
                server.url + ":" + server.port + "and execute the cloudOnly request"
        }

    }
    var timeElapsed = getTimeElapsed(initTime)
    
    console.info(JSON.stringify(body))

    sendCloudFunctionTimeElapsed(func,timeElapsed, server)
    return 
}

function sendCloudFunctionTimeElapsed(func, timeElapsed, server){
    sendTimeElasped(func,timeElapsed,server.name)
}

function sendLocalFunctionTimeElapsed(func, timeElapsed){
    sendTimeElasped(func,timeElapsed,"local")
}

function sendTimeElasped(func, timeElapsed, environment){
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort + "/function/insert_duration"
    var durationReqbody = {func: func.name, environment: environment,duration: timeElapsed}
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
        func.requestOptions.forceLocal == false || func.requestOptions.forceCloud === true
}

function localDeployConfiguration(func){

return func.localOnly === true && 
        func.requestOptions.forceCloud == false || func.requestOptions.forceLocal === true
}

function functionDeployed(func){

    var reqBody = { func: func.name, query: func.requestOptions.weightAlgorithm || "ucb1" }
    var url = rigConfigs.localUrl + ":" + rigConfigs.localPort + "/function/weight_scale"


    return new Promise((resolve, reject) => {
        if(cloudDeployConfiguration(func))
            return resolve(rigConfigs.servers[0])
        if(localDeployConfiguration(func))
            return resolve("local")
        request.post({url, json: reqBody}, (error, response, body) => {
            if(error || body.status !== "success") {
                return reject(error||body.message)
            }

            console.log(reqBody)
            console.log(body)

            // If one of the weights is null it will random the execution
            var oneNull = false
            var bodyNumKeys = 0;

            Object.keys(body).map(function(objectKey, index) {
                bodyNumKeys++
                if(body[objectKey] === null){
                    oneNull = true

                }
            })

            if(oneNull){
                    var rnd = Math.floor(Math.random() * Math.floor(rigConfigs.servers.length +1))
                    if(rnd > 0){
                        return resolve(rigConfigs.servers[rnd-1])
                    }else{
                        return resolve("local")
                    }

                }
            
            var minimumKey = Object.keys(body).reduce((a,b) => body[a] < body[b] ? a : b)

            if(minimumKey === 'local')
                    return resolve("local")

            rigConfigs.servers.forEach(function(server){
                if(server.name === minimumKey){
                    return resolve(server)
                }
            })

            return resolve(false,rigConfigs.servers[0])
            
        })

    })
}

module.exports = (req,res) => {
    handle(req,res)
}
