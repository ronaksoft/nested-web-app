(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .service('NstSvcConnectionMonitor', NstSvcConnectionMonitor);

  /**@Inject */
  function NstSvcConnectionMonitor($timeout, NstSvcLogger, NstUtility, NstSvcWS, NstSvcPingPong, NST_WEBSOCKET_STATE) {

    function ConnectionMonitor() {
      this.ws = null;
      this.isConnected = false;
      this.onReadyHandler = null;
      this.onBreakHandler = null;
      // TODO : Reset retry time after connecting again
      this.nextRetryTime = 1000;
    }

    ConnectionMonitor.prototype.constructor = ConnectionMonitor;

    ConnectionMonitor.prototype.start = function (url, protocol) {
      var that = this;

      // Open a new WebSocket
      this.ws = new NstSvcWS(url, protocol);

      this.ws.onOpen(function (event) {
        that.isConnected = true;
        this.nextRetryTime = 1000;

        if (_.isFunction(that.onReadyHandler)) {
          that.onReadyHandler(event);
        }
      });

      // To figure out a connection is no longer alive, We have to consider both
      // WebSocket close event and PingPong service disconnect event.
      this.ws.onClose(function (event) {
        that.isConnected = false;

        if (_.isFunction(that.onBreakHandler)) {
          that.onBreakHandler(event);
        }

        that.reconnect();
      });

      // Create a PingPong service to keep the connection alive
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
      this.onReadyHandler = action;
    }

    ConnectionMonitor.prototype.onBreak = function (action) {
      this.onBreakHandler = action;
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
