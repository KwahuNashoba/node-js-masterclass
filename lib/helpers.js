/*
* Helpers
*
*/

// Dependencies
var crypto = require("crypto");
var config = require("../config");

var helpers = {};


helpers.hash = function(str) {
    if(typeof(str) == "string" && str.length > 0) {
        return crypto.createHmac("sha256", config.hashingSecret).update(str).digest("hex");
    } else {
        return false;
    }
};

helpers.parseJSONToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};



module.exports = helpers;