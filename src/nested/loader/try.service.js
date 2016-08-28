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

    Try.prototype.do = function (method, cutoff, tries, delay) {
      var service = this;

      delay = delay || 0;
      tries = angular.isNumber(tries) ? tries : -1 ;
      cutoff = cutoff || function () { return false; };

      return method().then(function (result) {
        return $q.resolve(result);
      }).catch(function (error) {
        if (cutoff(error) || tries === 0) {
          return $q.reject(error);
        } else {
          return $timeout(function () {
            return service.do(method, cutoff, tries - 1, delay);
          }, delay);
        }

      });
    };

    return new Try();
  }
})();
