(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .service('NstSvcConnectionMonitor', NstSvcConnectionMonitor);

  /**@Inject */
  function NstSvcConnectionMonitor(NstSvcLogger, NstUtility, NstSvcWS, NST_WEBSOCKET_STATE) {

    function ConnectionMonitor() {
      var that = this;

      this.ws = null;
      this.isConnected = false;
    }

    ConnectionMonitor.prototype.constructor = ConnectionMonitor;

    ConnectionMonitor.prototype.start = function (url, protocol) {
      this.ws = new NstSvcWS(url, protocol);

      return this.ws;
    }

    ConnectionMonitor.prototype.isReady = function () {
      if (!this.ws) {
        throw Error("The service has not been started!");
      }

      return this.ws.getState() === NST_WEBSOCKET_STATE.OPEN && this.isConnected;
    }

    ConnectionMonitor.prototype.onReady = function (action) {
      var that = this;
      this.ws.onOpen(function (event) {
        that.isConnected = true;
        action(event);
      });
    }

    ConnectionMonitor.prototype.onLost = function (action) {
      var that = this;
      this.ws.onClose(function (event) {
        that.isConnected = false;
        action(event);
        that.ws.reconnect();
      });
    }

    return new ConnectionMonitor();
  }

})();
