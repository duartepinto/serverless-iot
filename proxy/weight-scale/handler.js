/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const request = require('request')

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')
const queryList = {
    duration_seconds : {
        query : "gateway_functions_seconds_sum"
    },
    invocation_count : {
        query : "gateway_functions_invocation_total"
    },
    average_duration_seconds :{
        query : "gateway_functions_seconds_sum/gateway_functions_seconds_count"
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

    var localPromise = getLocalWeight(reqFunc, query.query)
    var cloudPromise = getCloudWeight(reqFunc, query.query)
    
    //Promise.all([localPromise, cloudPromise]).then(returnWeights)
    Promise.all([localPromise]).then(returnWeights)

}

function returnWeights(results) {
    var body = {}
    body.status = "success"
    body.localWeight = results[0]
    //body.cloudWeight = results[1]
    console.info(JSON.stringify(body))
}

function getLocalWeight(functionName, query){
    var host = rigConfigs.localUrl + ":" +  rigConfigs.prometheusPort
    var path = "/api/v1/query"
    var parameters = "?query=" + query + '{function_name="'+functionName + '"}'

    var url = host + path + parameters
    console.log("url", url)

    return new Promise(function(resolve, reject){
        request.get(url, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                body = JSON.parse(body)
                if(body.status === "success" && body.data.result[0] != undefined){
                    resolve(body.data.result[0].value[1])
                    return
                }
                
                resolve(undefined)
            }
        })
    })
}

function getCloudWeight(functionName, query){
    //TODO
}

module.exports = (req,res) => {
    handle(req,res)
}
