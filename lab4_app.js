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
app.locals.savedAnswers;  //TODO: Replace with model? 

http.createServer(app).listen(8008);


// Initialize Database:
// database: 'lab4' 
// collections:'userAnswers' and 'survey'
// adds 4 documents to 'survey' collection
// documents are unique, duplicates not added if running this app multiple times
// Retrieves survey questions so app has local access
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

//Direct user to the survey or match pages
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
app.get("/survey", function(request, response){
	
	// setTimeout(function(){
		// response.render('landingPage.html');
	
	// },3000);
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query; 
	
	var theirName = app.locals.username;
	var goTo = query.moveDirection;
	var answer = query.answer;
	var showPreviousAnswer = false;
	var previousAnswer;

	//console.log("Name is: "+theirName);
	//console.log("going to: "+goTo);
	//console.log("answer selected: "+answer);

	if(goTo =='Next'){
		console.log("Going to the next page");
		saveAnswer(theirName,answer,app.locals.currentPage);
		app.locals.currentPage +=1;
	}
	else if (goTo =='Previous'){
		showPreviousAnswer = true;
		previousAnswer = getAnswer(theirName, (app.locals.currentPage-1));
		app.locals.currentPage -= 1;
	}
	if (app.locals.currentPage < app.locals.survey.length){
		if(showPreviousAnswer){
			showPreviousAnswer = false;
			response.render("questionPage.ejs", {previousPressed:previousAnswer});
		}
		else{
			response.render('questionPage.ejs');
		}
	}
	else {//survey is complete
		app.locals.currentPage=0;
		response.render('surveyComplete.html');
	}
});


//TODO: Find a way to use model.update() to both update and create a new user
function saveAnswer(username, answer, position){
		console.log("Saving answer for: "+username);
		console.log("Looking for: "+username);
		//Look for the user
		Models.UsersModel.findOne({name:username}, function (error, result){
				if(error){
					console.log("Error ocurred. "+error);
				}
				else if(!result){//User not found, create a new document for this user, the position will alway be 0 for a new user
					console.log("Not found");
					var newUser = new Models.UsersModel({name:username, answers:[answer]});
					newUser.save(function(error, newest){
						if(!error){
							console.log("Saved new user "+newest.name);
						}
					});
				}
				else{//User found, update their answer
					console.log("Found this: "+ result.name);
					var setModifier = { $set: {} };
					setModifier.$set['answers.' + position] = answer;
					
					Models.UsersModel.update({name:username},setModifier, function(error, affectedNumber, result){
						if (error){console.log(error);}
						else{
							console.log("Updated this many: "+affectedNumber);
							console.log("Response: "+ result);
						}
						
					});
					
				}
			});
}

function getAnswer(username, questionNumber){
	console.log("Getting answer for: "+username);

}
