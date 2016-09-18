(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .service('NstUtility', NstUtility);

  /** @ngInject */
  function NstUtility(NstUtilString, NstUtilCollection) {
    function Utility() {

    }

    Utility.prototype = {};
    Utility.prototype.constructor = Utility;

    Utility.prototype.string = NstUtilString;
    Utility.prototype.collection = NstUtilCollection;

    return new Utility();
  }
})();
