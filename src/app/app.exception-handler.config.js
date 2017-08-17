(function() {

  var app = angular.module('ronak.nested.web');

  app.config(function($provide) {
    window._logs = [];

    $provide.decorator("$exceptionHandler", function($delegate, $injector) {
      return function(exception, cause) {
        var $state = $injector.get('$state');
        var NstSvcServer = $injector.get('NstSvcServer');

        window._logs.push({
          type: 'webapp_error',
          values: {
            "time" : new Date().getTime(),
            "message" : exception,
            "reason" : cause,
            "session_key" : NstSvcServer.getSessionKey()
          },
          tags: {
            "state" : $state.current.name,
            "version" : window.nested ? window.nested.version : '-'
          }
        });

        $delegate(exception, cause);
      };
    });

  });
})();
