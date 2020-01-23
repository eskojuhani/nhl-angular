var express    = require("express");
var bodyParser = require("body-parser");
var path       = require('path');
const util = require('util');

var app = express();
app.use(bodyParser.json());

//
app.use(function (req, res, next) {
    origin = req.headers.origin;
    if (!origin)
      origin = "*";

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'auth_provider,access_token,Content-Type,Request header,Authorization,metadata,table,where,order'); //,Origin,X-Requested-With,Content-Type,Accept,content-type,application/json
    res.setHeader('Access-Control-Expose-Headers', 'auth_provider,access_token,Content-Type,Authorization,metadata,table,where,order');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method == "OPTIONS") {
      res.status(200);
      res.send();
    }
    else{
      next();
    }
});

// Initialize the app.
var server = app.listen(process.env.PORT || 5000, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}
