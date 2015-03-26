var mongoose = require('mongoose');
var Initializer = require('./lab4init.js');

mongoose.connect('mongodb://localhost/lab4test');
var db = mongoose.connection;

db.once('open', function(){
	Initializer.initializeSurvey();
});
