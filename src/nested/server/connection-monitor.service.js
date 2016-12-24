(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .service('NstSvcConnectionMonitor', NstSvcConnectionMonitor);

  /**@Inject */
  function NstSvcConnectionMonitor($timeout, NstSvcLogger, NstUtility, NstSvcWS, NstSvcPingPong, NST_WEBSOCKET_STATE) {

    var defaultRetryStartTime = 0;

    function ConnectionMonitor() {
      this.ws = null;
      this.isConnected = false;
      this.onReadyHandler = null;
      this.onBreakHandler = null;
      this.nextRetryTime = defaultRetryStartTime;
      this.connectorPlug = null;
      this.onReconnecting = null;
    }

    ConnectionMonitor.prototype.constructor = ConnectionMonitor;

    ConnectionMonitor.prototype.start = function (url, protocol) {
      var that = this;

      // Open a new WebSocket
      this.ws = new NstSvcWS(url, protocol);

      this.ws.onOpen(function (event) {
        that.isConnected = true;

        unplugConnector(that.connectorPlug);
        that.nextRetryTime = defaultRetryStartTime;

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

        prepareToConnect.bind(that)();
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

          prepareToConnect.bind(that)();
        }
      });

      return this.ws;
    }

    ConnectionMonitor.prototype.isReady = function () {
      if (!this.ws) {
        throw Error("The service has not been started yet!");
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
      this.nextRetryTime = 0;
      prepareToConnect.bind(this)();
    }

    function unplugConnector(connector) {
      $timeout.cancel(connector);
    }

    function prepareToConnect() {
      var that = this;

      unplugConnector(that.connectorPlug);


      that.connectorPlug = $timeout(function () {

        NstSvcLogger.debug(NstUtility.string.format("Preparing to reconnect after {0} sec.", that.nextRetryTime / 1000));
        that.ws.reconnect();

      }, that.nextRetryTime);

      if (_.isFunction(that.onReconnecting)) {
        that.onReconnecting({
          time : that.nextRetryTime
        });
      }
      that.nextRetryTime = getNextRetryTime(that.nextRetryTime);
    }

    function getNextRetryTime(current) {
      if (current < 90000) { // 4 min
        return current + 2000;
      } else {
        return 90000;
      }
    }

    return new ConnectionMonitor();
  }

})();
