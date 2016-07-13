(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstRequest', NstRequest);

  function NstRequest($q, $log, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_SRV_EVENT, NST_AUTH_COMMANDS) {
    function Request(service, data, timeout) {
      this.service = service;
      this.data = data;
      this.resolve = $q(function (res) { res(); });
      this.reject = $q(function (res, rej) { rej(); });
      this.timeout = timeout;
      this.timeout_id = -1;

      this.send = function () {
        if (this.timeout > 0) {
          this.timeout_id = setTimeout(
            function () {
              this.reject({
                status: NST_SRV_RESPONSE_STATUS.ERROR,
                err_code: NST_SRV_ERROR.TIMEOUT
              });
            }.bind(this),
            this.timeout
          );
        }

        this.data.data['_sk'] = this.data.data['_sk'] || this.service.getSessionKey();
        this.data.data['_ss'] = this.data.data['_ss'] || this.service.getSessionSecret();

        $log.debug('Sending:', this.data);
        this.service.stream.send(angular.toJson(this.data));
      }.bind(this);

      this.promise = function (resolve, reject) {
        if (angular.isFunction(resolve)) {
          this.resolve = resolve;
        }

        if (angular.isFunction(reject)) {
          this.reject = reject;
        }

        if (this.service.isAuthorized() || NST_AUTH_COMMANDS.indexOf(this.data.data.cmd) > -1) {
          if (this.service.isInitialized()) {
            this.send();
          } else {
            this.service.addEventListener(NST_SRV_EVENT.INITIALIZE, this.send, true);
          }
        } else {
          this.service.addEventListener(NST_SRV_EVENT.AUTHORIZE, this.send, true);
        }

      }.bind(this);
    }

    return Request;
  }
})();
