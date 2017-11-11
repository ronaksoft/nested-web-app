(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstUtility', NstUtility);

  /** @ngInject */
  function NstUtility(NstUtilString, NstUtilCollection, NstUtilDate, NstUtilPlace) {
    function Utility() {

    }

    Utility.prototype = {};
    Utility.prototype.constructor = Utility;

    Utility.prototype.string = NstUtilString;
    Utility.prototype.collection = NstUtilCollection;
    Utility.prototype.date = NstUtilDate;
    Utility.prototype.place = NstUtilPlace;

    Utility.prototype.hexToDec = function (hex) {
      var result = 0, digitValue;
      hex = hex.toLowerCase();
      for (var i = 0; i < hex.length; i++) {
        digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
        result = result * 16 + digitValue;
      }
      return result;
    };

    return new Utility();
  }
})();
