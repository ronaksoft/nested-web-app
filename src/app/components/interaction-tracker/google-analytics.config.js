(function() {

  var app = angular.module('ronak.nested.web');

  app.config(['AnalyticsProvider', function (AnalyticsProvider) {

     AnalyticsProvider.setAccount('UA-92612481-1');
  }]).run(['Analytics', function(Analytics) {

  }]);

})();
