(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.log')
    .factory('NstLoggerBasic', NstLoggerBasic);

  /** @ngInject */
  function NstLoggerBasic() {
    function LoggerBasic() {
    }

    LoggerBasic.prototype = {};
    LoggerBasic.prototype.constructor = LoggerBasic;

    LoggerBasic.prototype.write = function () {
      return true;
    };

    return LoggerBasic;
  }
})();
