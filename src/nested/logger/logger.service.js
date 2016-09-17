(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.log')
    .service('NstSvcLogger', NstSvcLogger);

  /** @ngInject */
  function NstSvcLogger(_, NST_CONFIG, NST_LOG_TYPE, NST_LOGGER_GATEWAY, NstLoggerBasic, NstLoggerConsole, NstLoggerHttp) {
    function Logger(config) {
      var defConfig = {
        LEVEL: 1,
        GATEWAY: {
          TYPE: NST_LOGGER_GATEWAY.BASIC,
          OPTIONS: {}
        }
      };

      this.config = _.defaults(config, defConfig);
      this.logger = new NstLoggerBasic(this.config.GATEWAY.OPTIONS);

      switch (this.config.GATEWAY.TYPE) {
        case NST_LOGGER_GATEWAY.HTTP:
          this.logger = new NstLoggerHttp(this.config.GATEWAY.OPTIONS);
          break;

        case NST_LOGGER_GATEWAY.CONSOLE:
          this.logger = new NstLoggerConsole(this.config.GATEWAY.OPTIONS);
          break;
      }
    }

    Logger.prototype = {};
    Logger.prototype.constructor = Logger;

    /**
     * @param {NST_LOG_TYPE}  type  Log Type
     * @param {Number}        level Log Level
     *
     */
    Logger.prototype.log = function () {
      var args = Array.prototype.slice.call(arguments);
      var type = args.shift();
      var level = Number(args.shift());

      if (level <= this.config.LEVEL) {
        args.unshift(type);

        this.logger.write.apply(null, args);
      }
    };

    Logger.prototype.warn = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(1);
      args.unshift(NST_LOG_TYPE.WARNING);

      return this.log.apply(this, args);
    };

    Logger.prototype.error = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(1);
      args.unshift(NST_LOG_TYPE.ERROR);

      return this.log.apply(this, args);
    };

    Logger.prototype.info = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(1);
      args.unshift(NST_LOG_TYPE.INFO);

      return this.log.apply(this, args);
    };

    Logger.prototype.debug = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(1);
      args.unshift(NST_LOG_TYPE.DEBUG);

      return this.log.apply(this, args);
    };

    Logger.prototype.debug2 = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(2);
      args.unshift(NST_LOG_TYPE.DEBUG);

      return this.log.apply(this, args);
    };

    Logger.prototype.debug3 = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(3);
      args.unshift(NST_LOG_TYPE.DEBUG);

      return this.log.apply(this, args);
    };

    return new Logger(NST_CONFIG.LOG);
  }
})();
