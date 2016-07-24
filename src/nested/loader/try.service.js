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

    Try.prototype.do = function (method, delay, max, tries) {
      var service = this;
      delay = delay || 0;
      max = max || -1;
      tries = tries || 0;

      return method.call(null).catch(function () {
        var reasons = arguments;

        return $timeout(delay).then(function () {
          return (-1 == max || tries < max) ? service.do(method, delay, max, tries + 1) : $q.reject.apply(null, reasons);
        });
      });
    };

    return new Try();
  }
})();
