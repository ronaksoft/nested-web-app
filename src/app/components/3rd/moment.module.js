(function() {
  'use strict';

  angular.module('momentjs',[])
    // And on the momentjs module, declare the moment service that we want
    // available as an injectable
    .factory('moment', function($window) {
      if ($window.moment) {
        // Delete moment from window so it's not globally accessible.
        // We can still get at it through _thirdParty however, more on why later
        $window._thirdParty = $window._thirdParty || {};
        $window._thirdParty.moment = $window.moment;
        try {
          delete $window.moment;
        } catch (e) {
          /*<IE8 doesn't do delete of window vars, make undefined if delete error*/
          $window.moment = undefined;
        }
      }
      var moment = $window._thirdParty.moment;

      return moment;
    });

})();
