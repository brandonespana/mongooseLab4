var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
		name: {type: String, required:true, unique: true},
		answers: [String],
		lastAnswer: {type:Number, min:0, max:4.50}
		
	},{collection: "userAnswers"});
		
exports.userSchema = userSchema;

var surveySchema = new Schema({
		question:{type: String, required: true},
		options:[String]
	}, {collection: "survey"});

exports.surveySchema = surveySchema;
