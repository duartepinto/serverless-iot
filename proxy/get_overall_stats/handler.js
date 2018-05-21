/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
"use strict"

const MongoClient = require('mongodb').MongoClient 
const assert = require('assert')

const funcsConfig = require('./my_functions.json')
const rigConfigs = require('./my_rig_config.json')

var statsDB;  // Cached connection-pool for further requests.

function handle(event, context){
    var data = {}

    prepareDB()
    .then((stats) => {
        const query = [
            {
                $group : {
                    _id : { function: "$function", environment: "$environment" },
                    averageDuration : {$avg: "$duration"},
                    count: { $sum: 1 }
                }
            }
        ]

        stats.collection("stats").aggregate(query).toArray((err, items) => {
            if(err) {
                return context.fail(err.toString());
            }

            const result =  {
                status: "success",
                items
            };
    
            context 
                .status(200)
                .succeed(result);
        });
    })
    .catch(err => {
        context.fail(err.toString());
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

module.exports = (event, context) => {
    handle(event, context)
}
