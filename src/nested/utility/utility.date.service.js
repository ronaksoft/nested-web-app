(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstUtilDate', NstUtilDate);

  /** @ngInject */
  function NstUtilDate(moment) {
    function DateUtility() {

    }

    DateUtility.prototype = {};
    DateUtility.prototype.constructor = DateUtility;

    DateUtility.prototype.toUnix = function (date) {
      if (moment.isMoment(date)) {
        return date.valueOf();
      }

      return date.getTime();
    }

    return new DateUtility();
  }
})();
