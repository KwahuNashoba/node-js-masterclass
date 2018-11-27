/*
 * Request handlers
 *
 */

//  Dependencies
var _data = require("./data");
var helpers = require("./helpers");

var handlers = {};

handlers.users = function(data, callback) {
    var acceptableMethods = ["post", "get", "put", "delete"];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._users = {};

handlers._users.post = function(data, callback) {
    var firstName = data.payload.firstName;
    firstName = typeof(firstName) == "string" && firstName.trim().length > 0 ? firstName.trim() : false;
    var lastName = data.payload.lastName;
    lastName = typeof(lastName) == "string" && lastName.trim().length > 0 ? lastName.trim() : false;
    var phone = data.payload.phone;
    phone = typeof(phone) == "string" && phone.trim().length >= 9 ? phone.trim() : false;
    var password = data.payload.password;
    password = typeof(password) == "string" && password.trim().length > 0 ? password.trim() : false;
    var tosAgreement = data.payload.tosAgreement;
    tosAgreement = typeof(tosAgreement) == "boolean" && tosAgreement;
    if(firstName && lastName && phone && password && tosAgreement) {
        _data.read("users", phone, function(err, data){
            if(err) {
                var hashedPassword = helpers.hash(password);

                if(hashedPassword){
                    var userObject = {
                        "firstName" : firstName,
                        "lastName" : lastName,
                        "phone" : phone,
                        "hashedPassword" : hashedPassword,
                        "tosAgreement" : true
                    };
    
                    _data.create("users", phone, userObject, function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {"Error" : "Could not create new user"});
                        }
                    });
                } else {
                    callback(500, "Error hashing user\'s password");
                }
            } else {
                callback(400, {"Error" : "A user with that phone number already exists"});
            }
        });
    } else {
        callback(400, {"Error" : "Missing required fields"});
    }
}

handlers._users.get = function(data, callback) {
    var phone = data.queryStringObject.phone;
    phone = typeof(phone) == "string" && phone.trim().length > 0 ? phone : false;
    if(phone) {
        _data.read("users", phone, function(err, userData) {
            if(!err && userData) {
                delete(userData.hashedPassword);
                callback(200, userData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {"Error" : "Missing required field"});
    }
}

handlers._users.put = function(data, callback) {
    var phone = data.payload.phone;
    phone = typeof(phone) == "string" && phone.trim().length > 0 ? phone : false;
    if(phone) {
        var firstName = data.payload.firstName;
        firstName = typeof(firstName) == "string" && firstName.trim().length > 0 ? firstName.trim() : false;
        var lastName = data.payload.lastName;
        lastName = typeof(lastName) == "string" && lastName.trim().length > 0 ? lastName.trim() : false;
        var password = data.payload.password;
        password = typeof(password) == "string" && password.trim().length > 0 ? password.trim() : false;
        
        if(firstName || lastName || password) {
            _data.read("users", phone, function(err, userData) {
                if(!err) {
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    _data.update("users", phone, userData, function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {"Error" : "Error updating user data"});
                        }
                    });
                } else {
                    callback(400, {"Error" : "User does not exists"});
                }
            });
        } else {
            callback(400, {"Error" : "Missing required field"});
        }
    } else {
        callback(400, {"Error" : "Missing required field"});
    }
}

handlers._users.delete = function(data, callback) {
    var phone = data.queryStringObject.phone;
    phone = typeof(phone) == "string" && phone.trim().length > 0 ? phone : false;
    if(phone) {
        _data.read("users", phone, function(err, userData) {
            if(!err && userData) {
                _data.delete("users", phone, function(err){
                    if(!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500, {"Error": "Error deleting specified user"})
                    }
                });
            } else {
                callback(400, {"Error" : "Could not find the specified user"});
            }
        });
    } else {
        callback(400, {"Error" : "Missing required field"});
    }
}

// Ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

module.exports = handlers;