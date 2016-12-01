(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstUtility', NstUtility);

  /** @ngInject */
  function NstUtility(NstUtilString, NstUtilCollection, NstUtilDate) {
    function Utility() {

    }

    Utility.prototype = {};
    Utility.prototype.constructor = Utility;

    Utility.prototype.string = NstUtilString;
    Utility.prototype.collection = NstUtilCollection;
    Utility.prototype.date = NstUtilDate;


    return new Utility();
  }
})();
