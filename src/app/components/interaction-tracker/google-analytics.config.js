(function() {

  var app = angular.module('ronak.nested.web');

  app.config(['AnalyticsProvider', function (AnalyticsProvider) {

     AnalyticsProvider.setAccount('UA-92612481-1')
      .useDisplayFeatures(true)
      .logAllCalls(true)
      .enterDebugMode(true);
  }]).run(['Analytics', function(Analytics) {

  }]);

})();
