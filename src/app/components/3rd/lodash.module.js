(function() {
  'use strict';

  angular.module('lodash', [])
    .factory('_', function($window) {
      if ($window._) {
        $window._thirdParty = $window._thirdParty || {};
        $window._thirdParty._ = $window._;
        try {
          delete $window._;
        } catch (e) {
          $window._ = undefined;
        }
      }
      var lodash = $window._thirdParty._;

      return lodash;
    });

})();
