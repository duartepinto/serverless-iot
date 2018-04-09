/*jshint esversion: 6 */
/*global require, module,  __dirname */
/*jshint node: true */
/*jshint asi: true */
"use strict"

module.exports = (event, context) => {
    let err;
    const result =             {
        status: "You said: " + JSON.stringify(event.body)
    };

    context
        .status(200)
        .succeed(result);
}
