/**
 * @file src/nested/server/ws.service.js
 * @author Soroush Torkzadeh <sorousht@nested.com>
 * @desc A custom Socket built on top of browser WebSocket
 * Documented by:           Soroush Torkzadeh
 * Date of documentation:   2017-08-9
 * Reviewed by:             -
 * Date of review:          -
 */

(function () {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .factory('NstSvcWS', NstSvcWS);

  /**@Inject */
  /**
   * Initializes a socket-connection using the provided configurations
   *
   * @param {any} _
   * @param {any} NstSvcLogger
   * @param {any} NstUtility
   * @param {any} NST_WEBSOCKET_STATE
   * @param {any} moment
   * @param {any} NstSvcDate
   * @returns
   */
  function NstSvcWS(_, NstSvcLogger, NstUtility, NST_WEBSOCKET_STATE, moment, NstSvcDate) {

    /**
     * Creates a new instance of browser web-socket. This service only wraps the browser
     * native socket and exposes the required events
     *
     * @param {any} url
     * @param {any} protocol
     */
    function WS(url, protocol) {

      this.url = url;
      this.protocol = protocol;
      // We allocated an array for every event
      // to be able to register multiple handlers
      this.onOpenQueue = [];
      this.onCloseQueue = [];
      this.onErrorQueue = [];
      this.onMessageQueue = [];

      this.initialize(this.url, this.protocol);
    }

    WS.prototype.constructor = WS;

    /**
     * Registers a listener for open event
     *
     * @param {any} action
     */
    WS.prototype.onOpen = function (action) {
      this.onOpenQueue.push(action);
    };

    /**
     * Registers a listener for message event
     *
     * @param {any} action
     */
    WS.prototype.onMessage = function (action) {
      this.onMessageQueue.push(action);
    };

    /**
     * Registers a listener for close event
     *
     * @param {any} action
     */
    WS.prototype.onClose = function (action) {
      this.onCloseQueue.push(action);
    };

    /**
     * Registers a listener for error event
     *
     * @param {any} action
     */
    WS.prototype.onError = function (action) {
      this.onErrorQueue.push(action);
    };

    /**
     * Sends the data through the socket connection
     *
     * @param {any} data
     */
    WS.prototype.send = function (data) {
      if (this.getState() === 1) {
        this.socket.send(data);
      }
    };

    /**
     * Closes the socket connection
     *
     */
    WS.prototype.close = function () {
      if (this.getState() === NST_WEBSOCKET_STATE.CLOSING) {
        NstSvcLogger.debug("The socket is being closed.");
      } else if (this.getState() === NST_WEBSOCKET_STATE.CLOSED) {
        NstSvcLogger.debug("The socket has already been closed.");
      } else {
        this.socket.close(1000, "The socked has ben closed intentionally.");
      }
    };

    /**
     * Returns the socket state
     *
     * @returns
     */
    WS.prototype.getState = function () {
      return this.socket.readyState
    }

    /**
     * Opens a new socket connection, but first closes the previous connection
     *
     */
    WS.prototype.reconnect = function () {
      if (this.socket.readyState === NST_WEBSOCKET_STATE.CONNECTING || this.socket.readyState === NST_WEBSOCKET_STATE.OPEN) {
        NstSvcLogger.debug("Trying to drop the open connection before reconnecting.");
        this.close();
      }
      NstSvcLogger.debug(NstUtility.string.format("Setting to establish a new connection to {0}.", this.url));
      this.initialize(this.url, this.protocol);
    };

    /**
     * Establishes a new socket connection using the given url and protocol
     *
     * @param {any} url
     * @param {any} protocol
     */
    WS.prototype.initialize = function (url, protocol) {
      var that = this;

      this.socket = new WebSocket(url, protocol);
      NstSvcLogger.debug(NstUtility.string.format("Establishing a new connection to {0}", url));

      /**
       * Fires all listeners of open event
       *
       * @param {any} event
       */
      this.socket.onopen = function (event) {
        NstSvcLogger.debug("The connection has been established successfully.");
        _.forEach(that.onOpenQueue, function (action) {
          action(event);
        });
      };

      /**
       * Fires all listeners of close event
       *
       * @param {any} event
       */
      this.socket.onclose = function (event) {
        NstSvcLogger.debug(NstUtility.string.format("The connection has been closed (code : {0}).", event.code));
        _.forEach(that.onCloseQueue, function (action) {
          action(event);
        });
      };

      /**
       * Fires all listeners of error event
       *
       * @param {any} event
       */
      this.socket.onerror = function (event) {
        NstSvcLogger.debug("An error occured in socket connection.", event.error);
        _.forEach(that.onErrorQueue, function (action) {
          action(event);
        });
      };

      /**
       * Fires all listeners of message event
       *
       * @param {any} event
       */
      this.socket.onmessage = function (event) {
        _.forEach(that.onMessageQueue, function (action) {
          action(event);
        });
      };

    }

    return WS;
  }

})();
