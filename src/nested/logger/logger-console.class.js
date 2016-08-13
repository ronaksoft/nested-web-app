(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstLoggerConsole', NstLoggerConsole);

  /** @ngInject */
  function NstLoggerConsole($log, NST_LOG_TYPE, NstLoggerBasic) {
    function LoggerConsole() {
    }

    LoggerConsole.prototype = new NstLoggerBasic();
    LoggerConsole.prototype.constructor = LoggerConsole;

    LoggerConsole.prototype.write = function () {
      var args = Array.prototype.slice.call(arguments);
      var type = args.shift();

      args.unshift((new Date()).toISOString() + ', ');

      var method = $log.log;
      switch (type) {
        case NST_LOG_TYPE.INFO:
          method = $log.info;
          break;

        case NST_LOG_TYPE.DEBUG:
          method = $log.debug;
          break;

        case NST_LOG_TYPE.WARNING:
          method = $log.warn;
          break;

        case NST_LOG_TYPE.ERROR:
          method = $log.error;
          break;
      }

      method.apply(null, args);
    };

    return LoggerConsole;
  }
})();
