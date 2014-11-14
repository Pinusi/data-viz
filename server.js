#!/usr/bin/env node

//Declare MODULES
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug');

//APP declaration
var app = express();

//OPENSHIFT in player-webapp is in www
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 5000);
var server = app.listen(app.get('port'), server_ip_address, function () {
  console.log( "Listening" );
});
//end OPENSHIFT

//APP module settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession(
    {    
        secret: 'data-graphs-supersecret', 
        saveUninitialized: true,
        resave: true
    }));

//ROUTER
var router = require('./routes/router')(app);

//TEMPLATE ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

//ERRORS
// catch 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
