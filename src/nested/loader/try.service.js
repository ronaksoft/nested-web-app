(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcTry', NstSvcTry);

  /** @ngInject */
  function NstSvcTry($q, $timeout, NST_TRY_EVENT, NstObservableObject) {
    function Try() {
    }

    Try.prototype = new NstObservableObject();
    Try.prototype.constructor = Try;

    Try.prototype.for = function (method, tries, cutoff, delay) {
      var service = this;
      console.log('trying', tries);

      delay = delay || 0;
      tries = tries || 0;
      cutoff = cutoff || function () { return false; };

      return method.apply(arguments).then(function () {
        return $q.resolve.apply(null, arguments);
      }).catch(function () {
        var reasons = arguments;

        if (cutoff.apply(null, reasons) || (tries < 1)) {
          return $q.reject.apply(null, reasons);
        } else {

          return $timeout(function () {
            return service.for(method, tries - 1, cutoff, delay);
          }, delay);
        }

      });
    };

    return new Try();
  }
})();
