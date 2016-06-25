/**
 * A simple chat bot. 
 * Recieves questions & answers, consolidates their format, and returns previous answers when it can.
 */

// Generic interjections to append before a bot's answer
var INTERJECTIONS = require('./interjections')

// A list of regexes and strings and their appropriate replacement string - used for question consolidation
var REPLACEMENTS = [
  // Remove punctuation - generally this would change conveyed meaning
  [/[\.,\/#!$%\^&\*;:{}=\-_`'"~()\?]/g, ''],

  // Collapse adjacent spaces
  [/\s{2,}/g, ' '],

  // Replace standard English contractions (we've previously removed apostrophes)
  [/whats/g, 'what is'],
  [/hows/g, 'how is'],
  [/whys/, 'why is']
]
  
// Return a random element from an array
function sampleFromArray(array){
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = {

  questions: {}, // Maps IDs to consolidated questions. Allows effeicent lookups of a question by its ID as consolidation may be expensive.
  knowledge: {}, // Maps consolidated questions to answers.
  
  // Called for every submitted question
  processQuestion: function(question){
    var body = this.consolidate(question.body); // Consolidate the question body

    this.questions[question.id] = body; // Map the question's id to the consolidated representation

    if(this.knowledge[body]) // Return known answers if we have any
      return this.injectAttitude(this.knowledge[body]);

    this.knowledge[body] = []; // Otherwise, prepare to get new answers
    return []; // No answers yet so return an empty array
  },

  // Called for every submitted answer
  learnAnswer: function(data){
    var body = this.questions[data.questionId]; // Grab the previously consolidated question by its id
    this.knowledge[body].push(data.answer.body); // Add the answer
  },

  // Consolidate a question by removing case, punctuation, whitespace, contractions and such.
  // This allows the bot to recognize subtly different questions such as:
  //   What is love?
  //   what's love??!
  consolidate: function(question){
    question = question.toLowerCase().trim();
    REPLACEMENTS.forEach(function(replacement){
      question = question.replace(replacement[0], replacement[1]);
    });
    return question;
  },

  // Given a (possibly empty) list of answers, prepare the bot's response and inject attitude.
  injectAttitude: function(answers){
    if(!answers.length)
      return [];

    return [{
      origin: 'bot',
      timestamp: Date.now(),
      body: 'Bot: ' + sampleFromArray(INTERJECTIONS) + '\n' + answers.reduce(function(memo, answer, index){
        return memo + (index+1) + '. ' + answer + '\n'
      }, '')
    }];
  },

  // Useful for conversion to JSON
  state: function(){
    return {
      knowledge: this.knowledge,
      questions: this.questions
    }
  }

}