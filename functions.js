// functions.js
// Handle setup of Passport configuration and user authentication

var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js');

// MongoDB connection information
var mongodbUrl = 'mongodb://' + config.mongodbHost + ':27017/users';
var MongoClient = require('mongodb').MongoClient

// Register a new user, failing if that user already exists.
exports.localReg = function (username, password) {
  var deferred = Q.defer();
  
  MongoClient.connect(mongodbUrl, function (err, db) {
    var collection = db.collection('localUsers');

    collection.findOne({'username' : username})
      .then(function (result) {
        if (null != result) {
          console.log("USERNAME ALREADY EXISTS:", result.username);
          deferred.resolve(false); // username exists
        }
        else  {
          var hash = bcrypt.hashSync(password, 8);
          var user = {
            "username": username,
            "password": hash,
            "note": "Created by CenturyLink Cloud test application"
          }

          console.log("CREATING USER:", username);
        
          collection.insert(user)
            .then(function () {
              db.close();
              deferred.resolve(user);
            });
        }
      });
  });

  return deferred.promise;
};

// Check for the existence of a username.
// Use bcrypt.compareSync to check encrypted password.
exports.localAuth = function (username, password) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function (err, db) {
    var collection = db.collection('localUsers');

    collection.findOne({'username' : username})
      .then(function (result) {
        if (null == result) {
          console.log("USERNAME NOT FOUND:", username);

          deferred.resolve(false);
        }
        else {
          var hash = result.password;

          console.log("FOUND USER: " + result.username);

          if (bcrypt.compareSync(password, hash)) {
            deferred.resolve(result);
          } else {
            console.log("AUTHENTICATION FAILED");
            deferred.resolve(false);
          }
        }

        db.close();
      });
  });

  return deferred.promise;
};

// End functions.js
