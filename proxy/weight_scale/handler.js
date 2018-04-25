/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const request = require('request')

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')
const queryList = {
    average_duration_seconds :{
        query : "gateway_functions_seconds_sum/gateway_functions_seconds_count"
    },
    mab_duration_seconds : {
        querySecondsSum : "gateway_functions_seconds_sum",
        queryCount : "gateway_functions_seconds_count",
    }
}

function handle(req) {
    var data = {}
    if(req == undefined || req == null){
        data.status= "error1"
        data.message = "Request (req) undefined or null"
        console.info(JSON.stringify(data))
        return
    }

    var reqFunc
    var reqQuery

    var func
    var query
    
    try{
        req = JSON.parse(req)
        reqFunc  = req.func;
        reqQuery = req.query

        for(var i = 0; i < funcsConfig.length; i++) {
            if(reqFunc == funcsConfig[i].name){
                func = funcsConfig[i]
                break
            }

            if(i == funcsConfig.length - 1)
                throw new Error("function not found")
        }

        if(queryList[reqQuery] === undefined)
            throw new Error("query not found")
        else
            query = queryList[reqQuery]
    }catch (err) {
        data.status= "error"
        data.message = "" + err
        console.info(JSON.stringify(data))
        return 
    }

    var localPromise = getLocalWeight(reqFunc, query)
    var cloudPromise = getCloudWeight(reqFunc, query)
    
    Promise.all([localPromise, cloudPromise])
        .then((results) =>{ 
            switch(query){
                case queryList.mab_duration_seconds:
                    data.status = "success"
                    data.result = results

                    return console.info(JSON.stringify(data))
                    break

                case queryList.average_duration_seconds:
                    returnWeights(results)
                    break
                default:
                    data.status = "error"
                    data.result = results
                    return console.info(JSON.stringify(data))

            }
        })
        .catch( (err) => {
            data.status= "error"
            data.message = "" + err
            return console.info(JSON.stringify(data))
        })
}

function returnWeights(results) {
    var body = {}
    body.status = "success"
    body.localWeight = results[0]
    body.cloudWeight = results[1]
    console.info(JSON.stringify(body))
}

function getLocalWeight(functionName, query){
    var host = rigConfigs.localUrl + ":" +  rigConfigs.prometheusPort
    var path = "/api/v1/query"

    return new Promise(function(resolve, reject){

        switch(query){

            case queryList.mab_duration_seconds:
                var parameters1 = "?query=" + query.queryCount + '{function_name="'+functionName + '"}'
                var parameters2 = "?query=" + query.querySecondsSum + '{function_name="'+functionName + '"}'
                var urlCount = host + path + parameters1
                var urlSecondsSum = host + path + parameters2

                var promiseCount = new Promise( (countResolve, countReject) => {
                    request.get(urlCount, function(err, resp, body) {
                        if (err) {
                            return reject(err);
                        } else {
                            body = JSON.parse(body)
                            if(body.status === "success" && body.data.result[0] != undefined){
                                return countResolve(body.data.result[0].value[1])
                            }
                            countResolve(null)
                        }
                    })

                })

                var promiseSum = new Promise( (sumResolve, sumReject) => {
                    request.get(urlSecondsSum, function(err, resp, body) {
                        if (err) {
                            return sumReject(err);
                        } else {
                            body = JSON.parse(body)
                            if(body.status === "success" && body.data.result[0] != undefined){
                                return sumResolve(body.data.result[0].value[1])
                            }
                            sumResolve(null)
                        }
                    })
                })
                Promise.all([promiseCount, promiseSum])
                    .then(results =>{ 
                        resolve(results)
                    }).catch((err) => {
                        reject(err)
                    })

                break

            case queryList.average_duration_weight:
                var parameters = "?query=" + query.query + '{function_name="'+functionName + '"}'

                var url = host + path + parameters

                request.get(url, function(err, resp, body) {
                    if (err) {
                        return reject(err);
                    } else {
                        body = JSON.parse(body)
                        if(body.status === "success" && body.data.result[0] != undefined){
                            return resolve(body.data.result[0].value[1])
                        }
                        
                        resolve(null)
                    }
                })
                break
            default:
                resolve(null)
        }
        
    })
}

function getCloudWeight(functionName, query){
    var host = rigConfigs.localUrl + ":" +  rigConfigs.localPort
    var path = "/function/get_duration"

    var url = host + path 
    var body = {func: functionName}

    return new Promise(function(resolve, reject){
        switch(query){
            case queryList.mab_duration_seconds: 
                request.post({url, json: body}, function(err, resp, body) {
                    if (err) {
                        reject(err);
                        resolve(null)
                    } else {
                        if(body.status === "success" && body.items.length > 0){
                            return resolve(body.items)
                        }
                        
                        return resolve(null)
                    }
                })

                break
            case queryList.average_duration_seconds:

                request.post({url, json: body}, function(err, resp, body) {
                    if (err) {
                        reject(err);
                        resolve(null)
                    } else {
                        if(body.status === "success" && body.items.length > 0){
                            var avgDuration = getAvgDuration(body.items)
                            return resolve(avgDuration)
                        }
                        
                        return resolve(null)
                    }
                })

                break
            default:
                return resolve(null)
        }
    })
}

function getAvgDuration(items){
    var sum = 0;
    var length = items.length
    for (var i = 0; i < length; i++){
        sum += items[i].duration;
    }
    return sum/length
}

module.exports = (req,res) => {
    handle(req,res)
}
