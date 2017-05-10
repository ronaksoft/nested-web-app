(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .provider('progressBar', function () {
      var self = this;

      self.$get = function ($window) {
        return $window.ProgressBar;
      };

      return self;
    });
})();
