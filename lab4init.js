//@author: Brandon Espana
//@version: March 30, 2015

var mongoose = require('mongoose');
var schemas = require('./lab4schema.js');
var userSchema = schemas.userSchema;
var surveySchema = schemas.surveySchema;

var UsersModel = mongoose.model('UsersModel', userSchema);
var SurveyModel = mongoose.model('SurveyModel', surveySchema);

exports.initializeSurvey = function(callback){
	var question1 = new SurveyModel({question: 'What is your name?', options:['Lancelot', 'Arthur', 'Guinevere']});
	var question2 = new SurveyModel({question: 'What is your quest?', options:['To find the grail', 'To slay the rabbit', 'To find the Knights who say Ni!']});
	var question3 = new SurveyModel({question: 'What is your favorite color?', options:['Red', 'Blue', "I don’t know"]});
	var question4 = new SurveyModel({question: 'What GPA do you want in your partner? Enter a value in this exact format #.## between 0.00 and 4.50'});

	question1.save(function(error){
		question2.save(function(){
				question3.save(function(){
						question4.save(function(){
							callback();
							
							});
					});			
			});	
	});
}

exports.SurveyModel = SurveyModel;
exports.UsersModel = UsersModel;
