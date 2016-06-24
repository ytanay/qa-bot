var bot = require('../server/bot');

// Tests the answer consolidator

function testVariations(test, expectedResult, variations){
  variations.forEach(function(variation){
    test.strictEqual(bot.consolidate(variation), expectedResult);
  });
}

exports.punctuationRemoval = function(test){
  testVariations(test, 'what is love', ['what is love?', 'what is love?!', '!!what, is. love?']);
  test.done();
}

exports.collapseSpaces = function(test){
  testVariations(test, 'what is love', [' what is love ', 'what    is love']);
  test.done();
}

exports.replaceContractions = function(test){
  testVariations(test, 'what is love', ['whats love', 'What\'s love']);
  testVariations(test, 'how is love', ['hows love', 'How\'s love']);
  test.done();
}