/*
This was adapted and repurposed from a public file on Github that made use of a simple Alexa skill using slot types
*/

//set up the file input stream
var fs = require('fs');

//set up the Alexa object courtesy of the new alexa sdk
var Alexa = require('alexa-sdk');

//call the main function
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
	alexa.registerHandlers(handlers);
	alexa.execute();
};

//handles the intents
var handlers = {
	//this function is called when the invocation name is called
	'LaunchRequest': function () {
        this.emit('TellMeSymptoms');
    },

	//called when user does not include ingredinets themselves
    'TellMeSymptoms': function () {
		this.emit(':ask', 'Hello! What kind of symptoms are you having?', 'Im sorry. Tell me again?');
    },

	//called when user lists symptoms
	//DecideRecipe
	'DecideRecipe': function () {
		//get the ingredient data from users voice using AMAZON.ingredients slot
		var ingredientStr = this.event.request.intent.slots.Ingredients.value;
		var ingredientList = ingredientStr.split("and");
		
		//load the conditions.json file through file sync. This is the only time we use the json database file.
		    //recipeList
		var conditionList = JSON.parse(fs.readFileSync("conditions.json", 'utf8'));
		   //recipes
		var conditions = conditionList.conditions;
		
		
		var suggestedCondition = null;	//will hold the name of the Doctor's suggestion
		var points = 0;			//counts the number of times the users symptom matches a symptom from the database
		var scores = [];		//an array that holds
		
		
		for (var i = 0; i < conditions.length; ++i) {
			for (var j = 0; j < conditions[i].symptoms.length; ++j) {
				var realIngred = conditions[i].symptoms[j];
				
				//compares individual recipe ingredients(realIngred) with all ingredients given by user(ingredientList)
				for (var k = 0; k < ingredientList.length; ++k) {
					if (ingredientList[k] == realIngred)
						++points;
				}
			}
			
			scores[i] = points;
			points = 0;
		}
		
		
		var bestRecipe = 0;
		var maxscore = 0;
		var temp = null;
		for (var i = 0; i < scores; ++i) 
		{
			if (scores[i] > maxscore) 
			{
				maxscore = scores[i];
				bestRecipe = i;
				suggestedCondition = conditions[bestRecipe].name;
			}
			else if(scores[i] == maxscore)
			{
				temp = conditions[bestRecipe].name.concat(" or ");
				suggestedCondition = temp.concat(conditions[i].name);
				bestRecipe = i;
			}
		}
		

		//print results
		this.emit(':tell', 'Based off the symptoms you described, you could have ' + suggestedCondition);
    },
	
	//read a new recipe from the top list
	'Next': function () {
        this.emit(':tell', 'The next instant was called. cool');
    },

	//standard intents
	'AMAZON.HelpIntent': function () {
	    this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
	    this.attributes['repromptSpeech'] = this.t("HELP_REPROMT");
	    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
	},

	'AMAZON.RepeatIntent': function () {
	    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
	},

	'AMAZON.StopIntent': function () {
	    this.emit('SessionEndedRequest');
	},

	'AMAZON.CancelIntent': function () {
	    this.emit('SessionEndedRequest');
	},

	'SessionEndedRequest': function () {
	   this.emit(':tell', this.t("STOP_MESSAGE"));
	}
};

var languageStrings = {
	"en-US": {
		"translation": {
			"SKILL_NAME": "Vocal Doc",
			"WELCOME_MESSAGE": "Welcome to %s. List your symptoms.",
			"WELCOME_REPROMT": "List your symptoms, or ask for help by saying: help.",
			"DISPLAY_CARD_TITLE": "%s  - Symptoms using %s.",
			"HELP_MESSAGE": "List your symptoms, and I can help you find recipes using those ingredients, or say exit. List your ingredients.",
			"HELP_REPROMT": "I can find illnesses and diseases using the symptoms you say to me. Tell me your symptoms!",
			"STOP_MESSAGE": "See you later!"
		}
	}
};
