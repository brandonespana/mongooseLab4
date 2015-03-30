//@author: Brandon Espana
//@version: March 30, 2015

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function gpaValidator(gpaInput){
	var valid = true;
	var toNumber = Number(gpaInput);
	if (isNaN(toNumber)){
		console.log("Not a number ");
		valid = false;
	}
	else if(gpaInput === ""){
		valid = false;
	}
	else{
		console.log("Input: yes a number");
		var splitString = gpaInput.split(".");
		var wholeNumber = parseInt(splitString[0]);
		var fractionNumber = parseInt(splitString[1]);
		var fractionString = splitString[1];

		if (toNumber < 0){
			console.log("Wrong sign (no negatives allowed)");
			valid = false;
		}
		else if((wholeNumber < 0) || (wholeNumber > 4)){
			console.log("Out of range 0 to 4");
			valid = false;
		}
		else if (fractionString.length != 2){
			console.log("Wrong fraction length");			
			valid = false;
		}
		else if ((wholeNumber == 4) && (fractionNumber > 50)){
			console.log("Wrong fraction value for integer of 4");
			valid = false;
		}
		console.log("valid?: "+valid);
	}
	return valid;
	
}

var userSchema = new Schema({
	name: {type: String, required:true, unique: true},
	answers: [String],
	lastAnswer: {type:String, validate: gpaValidator}
	
},{collection: "userAnswers"});
		
exports.userSchema = userSchema;

var surveySchema = new Schema({
	question:{type: String, required: true, unique:true},
	options:[String]
	
}, {collection: "survey"});

exports.surveySchema = surveySchema;

