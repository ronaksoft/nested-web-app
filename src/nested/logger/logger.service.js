(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcLogger', NstSvcLogger);

  /** @ngInject */
  function NstSvcLogger(_, NST_CONFIG, NST_LOGGER_GATEWAY, NstLoggerBasic, NstLoggerConsole, NstLoggerHttp) {
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
    
    Logger.prototype.log = function () {
      var args = arguments;
      var type = args.shift();
      var level = args.shift();
      
      if (level <= this.config.LEVEL) {
        args.unshift(level);
        args.unshift(type);
        
        this.logger.write.apply(null, args);
      }
    };

    return new Logger(NST_CONFIG.LOG);
  }
})();
