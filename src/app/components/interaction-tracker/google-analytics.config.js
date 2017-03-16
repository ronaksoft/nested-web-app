(function() {

  var app = angular.module('ronak.nested.web');

  app.config(['AnalyticsProvider', 'NST_CONFIG', function (AnalyticsProvider, NST_CONFIG) {
     AnalyticsProvider.setAccount(NST_CONFIG.GOOGLE_ANALYTICS_TOKEN);
  }]).run(['Analytics', function(Analytics) {

  }]);

})();
