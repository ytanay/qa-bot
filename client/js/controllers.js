
// App Controller
app.controller('appController', ['$scope', 'socket', function AppController($scope, socket) {

  /** Socket setup */
  $scope.connectionStatus = 'Getting ready...';

  socket.on('connect_error', function(error){ // Setting a connection error disabled submissions automatically.
    $scope.connectionStatus = error;
  });

  socket.on('reconnect', function(error){ // Resets the connection status upon a sucessful connection
    $scope.connectionStatus = null;
  });

  socket.on('submit:question', function(question) { // When a question is submitted
    $scope.questions[question.id] = question;
  });

  socket.on('submit:answer', function(data) { // When an answer is submitted
    $scope.questions[data.questionId].answers.push(data.answer);
  });

  socket.on('state:current', function(data){ // Once we connect, the server should immediately emit its current state
    $scope.questions = data; // Map of {body: String, answers: [{body: String, author: optional String}]}
    $scope.connectionStatus = null;
  });


  // Handles question submissions
  $scope.submitQuestion = function() {
    var questionText = $scope.questionText;

    if(!questionText)
      return;

    var question = {
      body: questionText,
      author: $scope.nickname
    };

    socket.emit('submit:question', question); // Submit the question.

    // We can't add the question directly to our local scope as,
    // without authentication, only the server can generate authorative 
    // global IDs for each question without risk of collision.
    // In this case, it is more elgant to send the question to the server,
    // have it generate an ID and forward it all sockets (incl. this one),
    // where it will be added to the list as usual.

    $scope.questionText = ''; // Clear question field
  };

}]);


// Question Controller
app.controller('questionController', ['$scope','socket', function QuestionController($scope, socket) {

  // Hanndle answer submission
  $scope.submitAnswer = function() {
    var answerText = $scope.answerText;

    if(!answerText)
      return;

    socket.emit('submit:answer', { // Submit the answer
      questionId: $scope.questionId,
      answer: {
        body: answerText
      }
    });

    // We don't care about the ordering answers so we don't assign them global IDs,
    // and as such we can simply push it into the local list (the server won't rebroadcast it to us)
    $scope.question.answers.push({
      body: answerText,
      timestamp: Date.now()
    }); 

    $scope.answerText = ''; // Clear the answer field
  };
}]);