//@author: Brandon Espana
//@version: March 30, 2015

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
		console.log("Going to survey as: "+name);
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

	saveAnswer(theirName, answer, app.locals.currentPage, function(error){
		if (error){
			//used for GPA question, error is a validation error from db
			//reload the page to answer again
			response.render("questionPage.ejs", {theAnswer: "invalid"});
		}
		else{
			//Increment or decrement page number for previous and next buttons
			if(goTo == 'Next'){
				app.locals.currentPage += 1;
			}
			else if (goTo == 'Previous'){
				app.locals.currentPage -= 1;
			}
			
			//Check survey progress. redirect to next question, or main page if done
			if (app.locals.currentPage < app.locals.survey.length){
				getAnswer(theirName, app.locals.currentPage, function(result){
					response.render("questionPage.ejs", {theAnswer: result});
				});
			}
			else{
				app.locals.currentPage = 0;
				response.render("surveyComplete.html");
			}
		}
	});
});

app.get('/match', function (request, response){
	var name = app.locals.username;
	var matches = [];//saves like this: [{"name":"aName", "matchCount":aNumber},{"name":"aName", "matchCount":aNumber},etc]
	var userFound = false;
	var user;
	
	Models.UsersModel.find(function(error, users){
		//Find the current user:
		for (var i = 0; i < users.length; i++){
			if (users[i].name === name){
				userFound = true;
				user = users[i];
				break;
			}
		}
		
		if (userFound){
			//Go through everyone's answers:
			for (var i = 0; i < users.length; i ++){
				var currentUser = users[i];
				var matchCount = 0;
				
				if(name !== currentUser.name){//to not match self
					//Check GPA answer:
					if(user.lastAnswer === currentUser.lastAnswer){
						matchCount += 1;
					}
					//Check other answers:
					for (var j = 0; j < currentUser.answers.length; j++){
						if(user.answers[j] === currentUser.answers[j]){
							matchCount += 1;
						}
					}
				matches.push({"name":currentUser.name, "matchCount":matchCount});
				}
			}
		}
		sortMatches(matches, function(sortedMatches){
			response.render("matchPage.ejs",{matches:sortedMatches});
		});
	});
});

//Sorts by REMOVING the biggest value from the input array and ADDING it into 
//a new 'sorted' array. Repeats until there is nothing left in the input array
function sortMatches(matches, callback){
	var sorted = [];
	var initialLength = matches.length;
	var loopIndex = 0;
	
	while (loopIndex < initialLength){
		var biggest = 0;
		var biggestMatch;
		var indexToRemove = -1; 
		//console.log("matches length is now: "+matches.length);
		for(var i = 0; i < matches.length; i++){
			if (matches[i].matchCount >= biggest){
				biggest = matches[i].matchCount;
				biggestMatch = matches[i];
				indexToRemove = i;
			}
		}
		sorted.push(biggestMatch);
		matches.splice(indexToRemove, 1);
		loopIndex++;
	}
	callback(sorted);
}

//Saves the answer if there was one selected (radio) or one typed in (non empty text input for GPA question)
//Creates a new document for a user if the user is new
function saveAnswer(username, answer, position, callback){
	var lastQuestion = false;

	if (position == (app.locals.survey.length - 1)){ 
		lastQuestion = true;
	}
	if (answer === ""){
		callback();
	}
	if(typeof answer != 'undefined'){
		//Look for the user
		Models.UsersModel.findOne({name:username}, function (error, result){
			if(error){
				console.log("Error ocurred. "+ error);
			}
			//User not found, create a new document for this user, the position will alway be 0 for a new user
			else if(!result){ 
				console.log("User not found, adding new user");
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
						callback(error);
					});
				}
				else{
					var setModifier = { $set: {} };
					setModifier.$set['answers.' + position] = answer;
					
					Models.UsersModel.update({name:username},setModifier, function(error, affected, responds){
						callback(error);
						if(error){console.log(error);}
					});
				}
			}
		});
	}
	else{
		callback();
	}
}

//getAnswer will pass to the callback either the actual found answer to prepopulate the selection for returning users
//or the word 'None' if it's the user's first time taking survey
function getAnswer(username, questionNumber, callback){
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
				//console.log("THIS IS A TOTALLY NEW USER or A TOALLY NEW QUESTION FOR THIS USER");
			}
			else{
				answer = result.answers[questionNumber];;
			}
			callback(answer);
		}
	});
}
