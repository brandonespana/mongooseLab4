var mongoose = require('mongoose');
var schemas = require('./lab4schema.js');
var userSchema = schemas.userSchema;
var surveySchema = schemas.surveySchema;

var UsersModel = mongoose.model('UsersModel', userSchema);
var SurveyModel = mongoose.model('SurveyModel', surveySchema);

exports.initializeSurvey = function(callback){
	var question1 = new SurveyModel({question: 'What is your name?', options:['Lancelot', 'Arthur', 'Guinevere']});
	var question2 = new SurveyModel({question: 'What is your quest?', options:['To find the grail', 'To slay the rabbit', 'To find the Knights who say Ni!']});
	var question3 = new SurveyModel({question: 'What is your favorite color?', options:['Red', 'Blue', "I don't know"]});
	var question4 = new SurveyModel({question: 'What GPA do you want in your partner?'});

	question1.save(function(error){
		console.log("saved 1");
		question2.save(function(){
			console.log("saved 2");
				question3.save(function(){
					console.log("saved 3");
						question4.save(function(){
							console.log("saved 4");
							callback();
							
							});
					});			
			});	
	});

	//~ question1.save(function (error){
		//~ if(error){console.log(error)}
		//~ else{
				//~ console.log("saved 1");}
		//~ });
	//~ question2.save(function (error){
		//~ if(error){console.log(error)}
		//~ else{console.log("saved 2");}
		//~ });
	//~ question3.save(function (error){
		//~ if(error){console.log(error)}
		//~ else{console.log("saved 3");}
		//~ });
	//~ question4.save(function (error){
		//~ if(error){console.log(error)}
		//~ else{console.log("saved 4");}
		//~ });
		//~ 
		//~ callback();
}

exports.SurveyModel = SurveyModel;
exports.UsersModel = UsersModel;
