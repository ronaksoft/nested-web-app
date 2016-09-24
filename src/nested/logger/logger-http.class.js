(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstLoggerHttp', NstLoggerHttp);

  /** @ngInject */
  function NstLoggerHttp(NstHttp, NstLoggerBasic) {
    function LoggerHttp(options) {
      var defOptions = {
        METHOD: "POST",
        URL: ""
      };

      this.options = _.defaults(options, defOptions);

      this.gateway = new NstHttp(this.options.URL);
      this.gatewayFn = this.gateway.post;

      switch (this.options.METHOD.toUpperCase()) {
        case 'GET':
          this.gatewayFn = this.gateway.get;
          break;
      }
    }

    LoggerHttp.prototype = new NstLoggerBasic();
    LoggerHttp.prototype.constructor = LoggerHttp;

    LoggerHttp.prototype.write = function () {
      var args = Array.prototype.slice.call(arguments);
      var type = args.shift();

      var data = {
        date: (new Date()).toISOString(),
        type: type,
        data: args
      };
      this.gatewayFn(data);
    };

    return LoggerHttp;
  }
})();
