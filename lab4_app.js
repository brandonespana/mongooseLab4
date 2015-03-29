//@author: Brandon Espana
//@version: March 27, 2015

var express = require('express');
var http = require('http');
var ejs = require('ejs');
var url = require('url');

var mongoose = require('mongoose');
var Models = require('./lab4init.js');

var app = express();
app.set('views','./views');
app.set('view engine','ejs');
app.engine('html', ejs.renderFile);

app.locals.username;
app.locals.survey ;
app.locals.currentPage = 0; 

http.createServer(app).listen(8008);

//Connect to database 'lab4'
mongoose.connect('mongodb://localhost/lab4test');
var db = mongoose.connection;

db.once('open', function(){
	Models.initializeSurvey(function(){
		console.log("Survey has been initialized. Loading it locally...");
		Models.SurveyModel.find(function(error, result){
				app.locals.survey = result;
				// EJS survey page will access survey like this: 
				// survey[currentPage].question
				// survey[currentPage].options[optionIndex]
				// currentPage is the index to the question
			});
		});
});


app.get("/", function (request, response){
	response.render("landingPage.html");
});

//Direct the user to the survey or match pages
app.get("/controller", function (request, response){
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query; 
	var name = query.userName;
	var action = query.action;
	
	app.locals.username = name;

	if(action=='Survey'){
		console.log("going to survey as: "+name);
		response.redirect('/survey');
	}
	else if (action='Match'){
		response.redirect('/match');
	}
	else{
		response.redirect('/');
	}
});


//Display the survey
//TODO: when saving the GPA answer, render the same page if the answer failed validation
app.get("/survey", function(request, response){
	
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query; 
	
	var theirName = app.locals.username;
	var goTo = query.moveDirection;
	var answer = query.answer;
	var currentPageSnapshot = app.locals.currentPage;
	
	console.log("Answer from query is this: >"+answer+"<");
	
	//~ if (app.locals.currentPage == (app.locals.survey.length - 1)){
		//~ saveLastAnswer(theirName, answer, function(error){
			//~ if(error){
			//~ response.render("questionPage.ejs")
			//~ }
		//~ });
	//~ }
	//Save the answer if one has been selected
	//else 
//	if(typeof answer!= 'undefined'){
		//console.log("SELECTED AN ANSWER "+answer);
		saveAnswer(theirName, answer, app.locals.currentPage, function(error){

			if (error){
				console.log("Point 0");
				response.render("questionPage.ejs", {theAnswer: "invalid"});
				//reload the page to answer again
			}
			else{
				console.log("Point 1");
				//do everything normally
				//Increment or decrement page number for previous and next buttons
				if(goTo == 'Next'){
					console.log("Point 2: Next");
					app.locals.currentPage += 1;
				}
				else if (goTo == 'Previous'){
					console.log("Point 3: Previous");
					app.locals.currentPage -= 1;
				}
				
				//Check survey progress. redirect to next question, or main page if done
				if (app.locals.currentPage < app.locals.survey.length){
					console.log("Point 4: getting answer");
					getAnswer(theirName, app.locals.currentPage, function(result){
						console.log("Point 5: got answer, about to render");
						response.render("questionPage.ejs", {theAnswer: result});
					});
				}
				else{
					console.log("Point 5: going back home");
					app.locals.currentPage = 0;
					response.render("surveyComplete.html");
				}
			}
			//console.log("SAVE ANSWER CALL BACK ERROR IS THIS IS THIS: " + error);
		});
	
	
	//Increment or decrement page number for previous and next buttons
	//~ if(goTo == 'Next'){
		//~ app.locals.currentPage += 1;
	//~ }
	//~ else if (goTo == 'Previous'){
		//~ app.locals.currentPage -= 1;
	//~ }
	//~ 
	//~ //Check survey progress. redirect to next question, or main page if done
	//~ if (app.locals.currentPage < app.locals.survey.length){
		//~ getAnswer(theirName, app.locals.currentPage, function(result){
			//~ response.render("questionPage.ejs", {theAnswer: result});
		//~ });
	//~ }
	//~ else{
		//~ app.locals.currentPage = 0;
		//~ response.render("surveyComplete.html");
	//~ }
	

});

function saveLastAnswer(username, answer, callback){
	Models.UsersModel.findOne({name:username}, function(error, user){
		user.lastAnswer = answer;
		user.save(function (error){
			console.log(error);
			callback(error);
		});
	});
	
}


//TODO: Find a way to use model.update() to both update and create a new user, and validate the last answer if needed
function saveAnswer(username, answer, position, callback){
	var lastQuestion = false;

	if (position == (app.locals.survey.length - 1)){ 
		lastQuestion = true;
	}
	if (answer === ""){
		callback();
	}
	if(typeof answer != 'undefined'){
		console.log("Point 6: answer is not undefined");
		//Look for the user
		Models.UsersModel.findOne({name:username}, function (error, result){
			if(error){
				console.log("Error ocurred. "+ error);
			}
			//User not found, create a new document for this user, the position will alway be 0 for a new user
			else if(!result){ 
				console.log("Not found");
				var newUser = new Models.UsersModel({name:username, answers:[answer]});
				newUser.save(function(error, newest){
					if(!error){
						console.log("Saved new user "+newest.name);
						callback();
					}
				});
			}
			//User found, update their answer
			else{
				if (lastQuestion){
					result.lastAnswer = answer;
					result.save(function (error){
						
						if(error){
							console.log('SAVE ERROR FOR THE LAST QUESTION SAVE ERROR FOR LAST QUESTION '+error);
							//callback(error);
						}
						else{
							console.log('NO ERROR NO ERROR  ERROR FOR THE LAST QUESTION NO ERROR FOR LAST QUESTION '+error);
							//callback(error);
						}
						callback(error);
					});
				}
				else{
					var setModifier = { $set: {} };
					setModifier.$set['answers.' + position] = answer;
					
					Models.UsersModel.update({name:username},setModifier, function(error, affected, responds){
						callback(error);
						if(error){console.log(error);}
					});//end update call
				}
			}
		});
	}
	else{
		console.log("Point 7: answer is undefined or an empty string");
		callback();
	}
}

//getAnswer will pass to the callback either the actual found answer
//or the word 'None' if it's the user's first time taking survey
function getAnswer(username, questionNumber, callback){
	//console.log("Getting answer for: "+username);
	var lastQuestion = false;
	if (questionNumber == (app.locals.survey.length -1)){
			lastQuestion = true;
	}
	Models.UsersModel.findOne({name:username}, function(error, result){
		var answer = 'None';
		if(!error){
			if (lastQuestion){
				answer = result.lastAnswer;
			}
			else if (result == null || (typeof result.answers[questionNumber] == 'undefined')){
				console.log("THIS IS A TOTALLY NEW USER or A TOALLY NEW QUESTION FOR THIS USER");
			}
			else{
				console.log("RESULT RESULT RESULT OF GETANSWER FINDONE IS" + (typeof result));
				console.log("QUESTION INDEX IS: "+ questionNumber);
				answer = result.answers[questionNumber];
				console.log("Previous answer is " +answer);
			}
			callback(answer);
			
		}
	});
}
