/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';

const request = require('request')
const jStat = require('jStat').jStat;

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')
const queryList = {
    average_duration_seconds :{
        query : "gateway_functions_seconds_sum/gateway_functions_seconds_count"
    },
    ucb1 : {
        querySecondsSum : "gateway_functions_seconds_sum",
        queryCount : "gateway_functions_seconds_count",
    },
    bayesian_ucb: {
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
        data.status= "error1"
        data.message = "" + err
        console.info(JSON.stringify(data))
        return 
    }

    var weightPromise = getDurations(reqFunc, query)

    weightPromise 
        .then((results) =>{ 
            switch(query){
                case queryList.bayesian_ucb:
                    data.status = "success"

                    var key 
                    var list
                    var expectedValue
                    var weight

                    rigConfigs.servers.forEach((server) => {
                        key = server.name
                        list = results[server.name]
                        if(list === undefined){
                            data[key] = null
                            return
                        }

                        expectedValue = getValueBayesianUCB(list)
                        weight = 1 / expectedValue
                        data[key] = weight
                    })

                    key = "local"
                    list = results[key]
                    expectedValue = getValueBayesianUCB(list)
                    weight = 1 / expectedValue
                    data[key] = weight

                    return console.info(JSON.stringify(data))
                    break;
                case queryList.ucb1:
                    data.status = "success"

                    let t = 0;

                    Object.keys(results).forEach((key) => {
                        t += results[key].length
                    })
                    
                    rigConfigs.servers.forEach((server) => {
                        key = server.name
                        list = results[server.name]
                        if(list === undefined){
                            data[key] = null
                            return
                        }

                        expectedValue = getValueUCB1(t, list)
                        weight = 1 / expectedValue
                        data[key] = weight
                    })


                    key = "local"
                    list = results[key]
                    expectedValue = getValueUCB1(t, list)
                    weight = 1 / expectedValue
                    data[key] = weight

                    return console.info(JSON.stringify(data))
                    break

                case queryList.average_duration_seconds:
                    data.status = "success"
                    Object.keys(rigConfigs.servers).forEach((key) => {
                        data[key] = jStat.mean(results[key])
                    })

                    console.info(JSON.stringify(data))
                    break
                default:
                    data.status = "error 4"
                    data.result = results
                    return console.info(JSON.stringify(data))

            }
        })
        .catch( (err) => {
            data.status= "error 5"
            data.message = "" + err
            return console.info(JSON.stringify(data))
        })
}

function getDurations(functionName, query){
    var host = rigConfigs.localUrl + ":" +  rigConfigs.localPort
    var path = "/function/get_duration"

    var url = host + path 
    var body = {func: functionName}

    return new Promise(function(resolve, reject){
        switch(query){
            case queryList.ucb1: 
            case queryList.bayesian_ucb:
            case queryList.average_duration_seconds:
                request.post({url, json: body}, function(err, resp, body) {
                    if (err) {
                        reject(err);
                        resolve(null)
                    } else {
                        if(body.status === "success"){
                            var durationsList = {}

                            var list
                            rigConfigs.servers.forEach((server) => {
                                list = body.items.
                                    filter( a => a.environment == server.name).
                                    map(a => a.duration)

                                durationsList[server.name] = list
                            })

                            list = body.items.
                                filter( a => a.environment == "local").
                                map(a => a.duration)
                            durationsList.local = list

                            return resolve(durationsList)
                        }
                        
                        return reject(err)
                    }
                })

                break
            default:
                return reject("Bad query 1")
        }
    })
}

function getValueBayesianUCB(list){
    const c = 3
    return jStat.median(list) + c*jStat.stdev(list)/ Math.sqrt(list.length)
}

function getValueUCB1(t, rewardList){
    return getExpectedReward(rewardList) + getUpperBoundUCB1(t, rewardList.length)
}

function getUpperBoundUCB1(t, nTrialsOption){
    return Math.sqrt(2*Math.log(t)/nTrialsOption)
}

function getExpectedReward(rewardList){
    return 1/(rewardList.length) * jStat.sum(Array.from(rewardList, x => getMabReward(x)))
}

function getMabReward(duration){
    return 1/(duration)
}

module.exports = (req,res) => {
    handle(req,res)
}
