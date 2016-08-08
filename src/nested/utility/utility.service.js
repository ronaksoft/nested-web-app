(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstUtility', NstUtility);

  /** @ngInject */
  function NstUtility(NstUtilString) {
    function Utility() {

    }

    Utility.prototype = {};
    Utility.prototype.constructor = Utility;

    Utility.prototype.string = NstUtilString;

    return new Utility();
  }
})();
