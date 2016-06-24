// A simple factory for sockets.io.
// Based on https://github.com/btford/angular-socket-io-im/blob/master/public/js/services.js
app.factory('socket', function ($rootScope) {
  var socket = io.connect(); // Default constructor should be fine in this case

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function() {  
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

// Get a list of existing questions
app.factory('currentServerState', ['$http', function($http) {
  return {
    get: function() {
      return $http.get('/questions');
    }
  }
}]);
