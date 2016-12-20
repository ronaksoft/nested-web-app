(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .factory('NstSvcWS', NstSvcWS);

  /**@Inject */
  function NstSvcWS(NstSvcLogger) {

    function WS(url, protocol) {

      this.url = url;
      this.protocol = protocol;

      this.onOpenQueue = [];
      this.onCloseQueue = [];
      this.onErrorQueue = [];
      this.onMessageQueue = [];

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
      this.socket.send(data);
    };

    WS.prototype.close = function () {
      this.socket.close();
    };

    WS.prototype.reconnect = function () {
      if (this.socket.readyState === 0 || this.socket.readyState === 1) { // Connecting or Open
        this.socket.close();
        this.initialize(this.url, this.protocol);
      }
    };

    WS.prototype.initialize = function(url, protocol) {
      var that = this;

      this.socket = new WebSocket(url, protocol);
      this.socket.onopen = function (event) {
        _.forEach(that.onOpenQueue, function (action) {
          action(event);
        });
      };

      this.socket.onclose = function (event) {
        _.forEach(that.onCloseQueue, function (action) {
          action(event);
        });
      };

      this.socket.onerror = function (event) {
        _.forEach(that.onErrorQueue, function (action) {
          action(event);
        });
      };

      this.socket.onmessage = function (event) {
        _.forEach(that.onMessageQueue, function (action) {
          action(event);
        });
      };

    }

    return WS;
  }

})();
