/*
	ALL DB FUNCTIONS
	For db we are using mysql and so mysql node modules
	https://github.com/felixge/node-mysql/
*/

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : ''
});

exports.getUserList = function( callback )
{
	
	connection.connect();
	connection.query('SELECT * FROM Users', function(err, rows, fields) {
	  	if (!err){
	  		callback(rows);
	  	}
		else
		{
			console.log(err);
		}
	});
	connection.end();
}

exports.getUserListByUser = function( user,callback )
{
	
	connection.connect();
	connection.query('SELECT * FROM Users WHERE User=' + user, function(err, rows, fields) {
	  	if (!err){
	  		callback(rows);
	  	}
		else
		{
			console.log(err);
		}
	});
	connection.end();
}