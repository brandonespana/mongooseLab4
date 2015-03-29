var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function gpaValidator(gpaInput){
	console.log("The input of "+gpaInput +" is of type: "+ typeof gpaInput);
	
	//var stringNumber = "11.100";
	var valid = true;
	console.log("The string input is this: >"+gpaInput+"<");
	var toNumber = Number(gpaInput);
	console.log("Type of toNumber is "+typeof toNumber);
	if (isNaN(toNumber)){
		console.log("Not a number ");
		valid = false;
	}
	else if(gpaInput === ""){
		valid = false;
	}
	else{
		console.log("Yes a number");
		var splitString = gpaInput.split(".");
		var wholeNumber = parseInt(splitString[0]);
		var fractionNumber = parseInt(splitString[1]);
		var fractionString = splitString[1];

		console.log("wholeNumber: "+wholeNumber);
		console.log("fractionNumber: "+fractionNumber);
		console.log("fractionString: "+fractionString);
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
	lastAnswer: {type:String, validate: gpaValidator}// min:0, max:4.50
	
},{collection: "userAnswers"});
		
exports.userSchema = userSchema;

var surveySchema = new Schema({
	question:{type: String, required: true, unique:true},
	options:[String]
	
}, {collection: "survey"});

exports.surveySchema = surveySchema;

