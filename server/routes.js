var bot = require('./bot');

module.exports = function(app, io) {
  
  var questionId = 0; // A counter for question IDs
  var questions = {}; // A map of original questions (as opposed to the bot's map of consolidated questions)

  // Sends the index page
	app.get('/', function(req, res) {
		res.sendFile('./public/index.html');
	});

  // Send a JSON representation of original questions held in memory
  app.get('/questions', function(req, res) {
    res.json(questions);
  });

  // Send a JSON representation of the bot's current knowledge map
  // Useful for debugging
  app.get('/knowledge', function(req, res) {
    res.json(bot.state());
  });

  // On client connection
  io.on('connection', function(socket) {

    // Send the questions we have in memory
    socket.emit('state:current', questions);

    // On question submission
    socket.on('submit:question', function(question) {
      if(!question.body) // Sanity check
        return;

      var id = question.id = (questionId++).toString(); // Assign an ID to the submitted question
      question.answers = bot.processQuestion(question); // If we don't have answers, processQuestion will return an empty array
      question.timestamp = Date.now();

      questions[id] = question;

      io.emit('submit:question', question); // Broadcast the question too all clients
    });

    // On answer submission
    socket.on('submit:answer', function(data) {
      if(!data.answer || !questions[data.questionId]) // Sanity check
        return;

      bot.learnAnswer(data);
      data.answer.timestamp = Date.now();
      questions[data.questionId].answers.push(data.answer);
      socket.broadcast.emit('submit:answer', data); // Broadcast the answer to all clients barring the submitter
    });
  });

};