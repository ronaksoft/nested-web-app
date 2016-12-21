(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .service('NstSvcConnectionMonitor', NstSvcConnectionMonitor);

  /**@Inject */
  function NstSvcConnectionMonitor($timeout, NstSvcLogger, NstUtility, NstSvcWS, NstSvcPingPong, NST_WEBSOCKET_STATE) {

    function ConnectionMonitor() {
      var that = this;

      this.ws = null;
      this.isConnected = false;
      this.onReadyHandler = null;
      this.onBreakHandler = null;
    }

    ConnectionMonitor.prototype.constructor = ConnectionMonitor;

    ConnectionMonitor.prototype.start = function (url, protocol) {
      var that = this;

      this.ws = new NstSvcWS(url, protocol);

      this.nextRetryTime = 1000;

      this.ws.onOpen(function (event) {
        that.isConnected = true;
        if (_.isFunction(that.onReadyHandler)) {
          that.onReadyHandler(event);
        }
      });

      this.ws.onClose(function (event) {
        that.isConnected = false;

        if (_.isFunction(that.onBreakHandler)) {
          that.onBreakHandler(event);
        }

        that.reconnect();
      });

      this.pingPong = new NstSvcPingPong(this.ws);

      this.pingPong.start();

      this.pingPong.onDisconnected(function () {
        if (that.isConnected) {

          that.isConnected = false;
          if (_.isFunction(that.onBreakHandler)) {
            that.onBreakHandler(event);
          }

          that.reconnect();
        }
      });

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
      that.onReadyHandler = action;
    }

    ConnectionMonitor.prototype.onBreak = function (action) {
      var that = this;
      that.onBreakHandler = action;
    }

    ConnectionMonitor.prototype.reconnect = function () {
      var that = this;
      this.nextRetryTime = this.nextRetryTime * 2;
      $timeout(function () {
        NstSvcLogger.debug(NstUtility.string.format("Preparing to reconnect after {0} sec.", that.nextRetryTime / 1000));
        that.ws.reconnect();
      }, this.nextRetryTime);
    }

    return new ConnectionMonitor();
  }

})();
