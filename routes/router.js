var express = require('express');

//SESSION
//session.user

module.exports = function(app) {
	
	//LOGIN page
	app.get('/', function(req, res){

		//clear session in case
		req.session.user = null;
		res.render('index');
	});
}