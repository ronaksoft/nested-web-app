(function() {
  'use strict';

  var lodashModule = angular.module('lodash', []);
  lodashModule.factory('_', function($window) {
    if ($window._) {
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty._ = $window._;
      // FIXME: remove _ from $window
      // try {
      //   delete $window._;
      // } catch (e) {
      //   $window._ = undefined;
      // }
    }
    var lodash = $window._thirdParty._;

    return lodash;
  });

})();
