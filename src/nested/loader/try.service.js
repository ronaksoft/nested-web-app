(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcTry', NstSvcTry);

  /** @ngInject */
  function NstSvcTry($q, $timeout, NstObservableObject) {
    function Try() {
    }

    Try.prototype = new NstObservableObject();
    Try.prototype.constructor = Try;

    /**
     * anonymous function - Retries a function
     *
     * @param  {Function}   method    A function to be executed
     * @param  {Function}   cutoff    Stops retrying if the callback returns true
     * @param  {Number}     tries     Number of maximum chances for retry
     * @param  {Number}     delay     Milliseconds between every retry
     * @return {Promise}              The result of retrying the function
     */
    Try.prototype.do = function (method, cutoff, tries, delay) {
      var service = this;

      delay = delay || 0;
      tries = angular.isNumber(tries) ? tries : -1 ;
      cutoff = cutoff || function () { return false; };

      return method().then(function (result) {
        // do not try anymore
        return $q.resolve(result);
      }).catch(function (error) {
        if (cutoff(error) || tries === 0) {
          //
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
