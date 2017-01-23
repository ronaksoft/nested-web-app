(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .factory('NstSvcWS', NstSvcWS);

  /**@Inject */
  function NstSvcWS(_, NstSvcLogger, NstUtility, NST_WEBSOCKET_STATE, moment) {

    function WS(url, protocol) {

      this.url = url;
      this.protocol = protocol;
      // We allocated an array for every event
      // to be able to register multiple handlers
      this.onOpenQueue = [];
      this.onCloseQueue = [];
      this.onErrorQueue = [];
      this.onMessageQueue = [];

      this.openTime = null;
      this.lastSendTime = null;
      this.lastReceiveTime = null;
      this.lastCloseTime = null;

      this.initialize(this.url, this.protocol);
    }

    WS.prototype.constructor = WS;

    WS.prototype.onOpen = function (action) {
      this.onOpenQueue.push(action);
    };

    WS.prototype.onMessage = function (action) {
      this.onMessageQueue.push(action);
    };

    WS.prototype.onClose = function (action) {
      this.onCloseQueue.push(action);
    };

    WS.prototype.onError = function (action) {
      this.onErrorQueue.push(action);
    };

    WS.prototype.send = function (data) {
      if (this.getState() === 1) {
        this.lastSendTime = Date.now();
        this.socket.send(data);
      }
    };

    WS.prototype.close = function () {
      if (this.getState() === NST_WEBSOCKET_STATE.CLOSING) {
        NstSvcLogger.debug("The socket is being closed.");
      } else if (this.getState() === NST_WEBSOCKET_STATE.CLOSED) {
        NstSvcLogger.debug("The socket has already been closed.");
      } else {
        this.socket.close(1000, "The socked has ben closed intentially.");
      }
    };

    WS.prototype.getState = function () {
      return this.socket.readyState
    }

    WS.prototype.reconnect = function () {
      if (this.socket.readyState === NST_WEBSOCKET_STATE.CONNECTING || this.socket.readyState === NST_WEBSOCKET_STATE.OPEN) {
        NstSvcLogger.debug("Trying to drop the open connection before reconnecting.");
        this.close();
      }
      var lastClose = this.lastCloseTime ? moment().diff(moment(this.lastCloseTime), "seconds") : "unknown";
      NstSvcLogger.debug(NstUtility.string.format("Setting to establish a new connection to {0} after {1} sec.", this.url, lastClose));
      this.initialize(this.url, this.protocol);
    };

    WS.prototype.initialize = function(url, protocol) {
      var that = this;


      this.socket = new WebSocket(url, protocol);
      NstSvcLogger.debug(NstUtility.string.format("Establishing a new connection to {0}", url));

      this.socket.onopen = function (event) {
        that.openTime = Date.now();
        NstSvcLogger.debug("The connection has been established successfully.");
        _.forEach(that.onOpenQueue, function (action) {
          action(event);
        });
      };

      this.socket.onclose = function (event) {
        that.lastCloseTime = Date.now();
        var lastReceive = that.lastReceiveTime ? moment().diff(moment(that.lastReceiveTime), "seconds") : "unknown";
        NstSvcLogger.debug(NstUtility.string.format("The connection has been closed (code : {0}, last receive : {1} sec).", event.code, lastReceive));
        _.forEach(that.onCloseQueue, function (action) {
          action(event);
        });
      };

      this.socket.onerror = function (event) {
        NstSvcLogger.debug("An error occured in socket connection.", event.error);
        _.forEach(that.onErrorQueue, function (action) {
          action(event);
        });
      };

      this.socket.onmessage = function (event) {
        that.lastReceiveTime = Date.now();
        _.forEach(that.onMessageQueue, function (action) {
          action(event);
        });
      };

    }

    return WS;
  }

})();
