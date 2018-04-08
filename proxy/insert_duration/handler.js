/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
'use strict';


const MongoClient = require('mongodb').MongoClient 
const assert = require('assert')

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')

var statsDB;  // Cached connection-pool for further requests.

function handle(req, res) {
    var data = {}
    if(req.body === undefined || req === null){
        data.status= "error1"
        data.message = "Body undefined or null"
        return res.fail(JSON.stringify(data))
    }

    var duration
    var functionName

    var func
    var body = req.body
    try{
        functionName = body.func;
        duration = body.duration

        for(var i = 0; i < funcsConfig.length; i++) {
            if(functionName == funcsConfig[i].name){
                func = funcsConfig[i]
                break
            }

            if(i == funcsConfig.length - 1)
                throw new Error("function not found")
        }
    }catch (err) {
        data.status= "error"
        data.message = "" + err
        return res.fail(JSON.stringify(data))
    }   

    prepareDB()
    .then((stats) => {
        const record = {"function": func.name, "duration": duration};

        stats.collection("stats").insertOne(record, (insertErr) => {
            if(insertErr) {
                return res.fail(insertErr.toString());
            }

            const result =  {
                status: "Insert done of: " + JSON.stringify(req.body)
            };
    
            res 
                .status(200)
                .succeed(result);
        });
    })
    .catch(err => {
        res.fail(err.toString());
    });
}

const prepareDB = () => {
    //const url = "mongodb://" + process.env.mongo + ":27017/stats"
    const url = "mongodb://" + rigConfigs.mongo + ":27017/stats"

    return new Promise((resolve, reject) => {
        if(statsDB) {
            console.error("DB already connected.");
            return resolve(statsDB);
        }

        console.error("DB connecting");

        MongoClient.connect(url, (err, database) => {
            if(err) {
                return reject(err)
            }
    
            statsDB = database.db("stats");
            return resolve(statsDB)
        });
    });
}

module.exports = (req,res) => {
    handle(req,res)
}
