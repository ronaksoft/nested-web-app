(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstLoggerConsole', NstLoggerConsole);

  /** @ngInject */
  function NstLoggerConsole($log, NST_LOG_TYPE, LoggerBasic) {
    function LoggerConsole() {
    }

    LoggerConsole.prototype = new LoggerBasic();
    LoggerConsole.prototype.constructor = LoggerConsole;

    LoggerConsole.prototype.write = function () {
      var args = arguments;
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
