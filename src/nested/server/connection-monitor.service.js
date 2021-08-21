/**
 * @file nested/server/connection-monitor.service.js
 * @author Soroush Torkzadeh <sorousht@nested.com>
 * @desc Responsible for creating a connection and keep it alive while the application is working
 * Documented by:           Soroush Torkzadeh
 * Date of documentation:   2017-08-9
 * Reviewed by:             -
 * Date of review:          -
 */
(function () {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .service('NstSvcConnectionMonitor', NstSvcConnectionMonitor);

  /**@Inject */
  /**
   * Monitors the socket connection and tries to keep it alive by running
   * the embedded ping-pong and auto-reconnect services
   *
   * @param {any} $timeout
   * @param {any} _
   * @param {any} NstSvcLogger
   * @param {any} NstUtility
   * @param {any} NstSvcWS
   * @param {any} NstSvcPingPong
   * @param {any} NST_WEBSOCKET_STATE
   * @returns
   */
  function NstSvcConnectionMonitor($timeout, _,
                                   NstSvcLogger, NstUtility, NstSvcWS, NstSvcPingPong,
                                   NST_WEBSOCKET_STATE) {

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

    /**
     * Creates a new instance of NstSvcWS service and listens to its events.
     * Sets auto-reconnect and starts ping-pong service
     *
     * @param {any} url
     * @param {any} protocol
     * @returns
     */
    ConnectionMonitor.prototype.start = function (url, protocol) {
      var that = this;

      url = url.replace('/api', '/ws');

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

      if (this.pingPong){
        this.pingPong.stop();
      }

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

    /**
     * Returns tru if the connection is healthy
     *
     * @returns
     */
    ConnectionMonitor.prototype.isReady = function () {
      if (!this.ws) {
        throw Error("The service has not been started yet!");
      }

      return this.ws.getState() === NST_WEBSOCKET_STATE.OPEN && this.isConnected;
    }

    /**
     * Registers a handler for ready event
     *
     * @param {any} action
     */
    ConnectionMonitor.prototype.onReady = function (action) {
      this.onReadyHandler = action;
    }

    /**
     * Registers a handler for break event
     *
     * @param {any} action
     */
    ConnectionMonitor.prototype.onBreak = function (action) {
      this.onBreakHandler = action;
    }

    /**
     * Establishes a new socket connection
     *
     */
    ConnectionMonitor.prototype.reconnect = function () {
      this.nextRetryTime = 0;
      prepareToConnect.bind(this)();
    }

    /**
     * Stops the timeout which is responsible for establishing a new connection
     *
     * @param {any} connector
     */
    function unplugConnector(connector) {
      $timeout.cancel(connector);
    }

    /**
     * Stops the previous reconnect timeout and prepares to connect again on the next interval
     *
     */
    function prepareToConnect() {
      var that = this;

      unplugConnector(that.connectorPlug);


      that.connectorPlug = $timeout(function () {

        NstSvcLogger.debug(NstUtility.string.format("Preparing to reconnect after {0} sec.", that.nextRetryTime / 1000));
        that.ws.reconnect();

      }, that.nextRetryTime);

      if (_.isFunction(that.onReconnecting)) {
        that.onReconnecting({
          time: that.nextRetryTime
        });
      }
      that.nextRetryTime = getNextRetryTime(that.nextRetryTime);
    }

    /**
     * Calculates the next retry time based on the previous value
     *
     * @param {any} current
     * @returns
     */
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
