var mongoose = require('mongoose');
var schemas = require('./lab4schema.js');
var userSchema = schemas.userSchema;
var surveySchema = schemas.surveySchema;

var UsersModel = mongoose.model('UsersModel', userSchema);
var SurveyModel = mongoose.model('SurveyModel', surveySchema);






exports.initializeSurvey = function(){
	var question1 = new SurveyModel({question: 'What is your name?', options:['Lancelot', 'Arthur', 'Guinevere']});
	var question2 = new SurveyModel({question: 'What is your quest?', options:['To find the grail', 'To slay the rabbit', 'To find the Knights who say Ni!']});
	var question3 = new SurveyModel({question: 'What is your favorite color?', options:['Red', 'Blue', "I don't know"]});
	var question4 = new SurveyModel({question: 'What GPA do you want in your partner?'});

	question1.save(function (error){
		if(error){console.log(error)}
		});
	question2.save(function (error){
		if(error){console.log(error)}
		});
	question3.save(function (error){
		if(error){console.log(error)}
		});
	question4.save(function (error){
		if(error){console.log(error)}
		});
}

exports.SurveyModel = SurveyModel;
exports.UsersModel = UsersModel;
