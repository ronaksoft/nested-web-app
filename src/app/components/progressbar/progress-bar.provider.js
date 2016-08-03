(function() {
  'use strict';

  angular
    .module('nested')
    .provider('progressBar', function () {
      var self = this;

      self.$get = function ($window) {
        return $window.ProgressBar;
      };

      return self;
    });
})();
