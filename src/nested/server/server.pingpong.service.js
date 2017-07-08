(function () {
  'use strict';

  angular
    .module('ronak.nested.web.data')
    .service('NstSvcPingPong', NstSvcPingPong);

  /** @ngInject */
  function NstSvcPingPong($timeout, $interval, _,
                          NST_SRV_EVENT, NST_SRV_PING_PONG,
                          NstSvcLogger, NstSvcDate,
                          NstObservableObject) {

    function PingPong(stream) {

      var service = this;

      this.stream = stream;
      this.onConnectedHandler = null;
      this.onDisconnectedHandler = null;
      this.pingStack = [];
      this.pongStack = [];
      this.pingPongInterval = null;
      this.pingPongStatus = false;
      this.lastPing = NstSvcDate.now();
      this.lastObserve = NstSvcDate.now();

      NstObservableObject.call(this);

    }

    PingPong.prototype = new NstObservableObject();
    PingPong.prototype.constructor = PingPong;

    PingPong.prototype.start = function () {
      if (this.getPingPongStatus() && this.getPingPongInterval()) return;

      callConected.bind(this)();
      this.setPingPongStatus(true);
      var service = this;

      service.lastPing = NstSvcDate.now();
      this.pingStack = [];
      this.pongStack = [];
      var interval = $interval(function () {
        service.lastPing = NstSvcDate.now();
        NstSvcLogger.debug2('WS | PING:', NstSvcDate.now());
        var time = NstSvcDate.now();
        service.stream.send(NST_SRV_PING_PONG.COMMAND + '/' + time);
        service.pingStack.push({
          cmd: NST_SRV_PING_PONG.COMMAND + '/' + time,
          time: time,
          timeout: $timeout(function () {
            service.checkStatus();
          }, NST_SRV_PING_PONG.INTERVAL_TIMEOUT)
        });


      }, NST_SRV_PING_PONG.INTERVAL_TIME);

      this.setPingPongInterval(interval);

      this.stream.onMessage(function (message) {
        if (_.startsWith(message.data, "PONG!")) {
          service.getPong(message.data);
        }
      });

    };


    PingPong.prototype.stop = function () {
      $interval.cancel(this.pingPongInterval);
      this.pingPongInterval = null;

    };

    PingPong.prototype.getPong = function (pong) {

      this.pongStack.push({
        cmd: pong,
        pingTime: pong.split("/")[1],
        pongTime: NstSvcDate.now()
      });

      NstSvcLogger.debug2("WS PINGPONG | delay : " + (NstSvcDate.now() - parseInt(pong.split("/")[1])));

      callConected.bind(this)();
      if (!this.pingPongStatus) {
        // callDisconnected.bind(this)();
      }

      this.setPingPongStatus(true);
      this.pingStack = [];
      this.pongStack = [];
      this.checkStatus();
    };

    PingPong.prototype.checkStatus = function (force) {
      if ((this.pingStack.length >= NST_SRV_PING_PONG.MAX_FAILED_PING) || force) {
        NstSvcLogger.debug("disconnected");
        this.pingPongStatus = false;
        callDisconnected.bind(this)();
        return false;
      }
    };

    PingPong.prototype.onConnected = function (action) {
      this.onConnectedHandler = action;
    }

    PingPong.prototype.onDisconnected = function (action) {
      this.onDisconnectedHandler = action;
    }

    return PingPong;

    function callConected() {
      if (_.isFunction(this.onConnectedHandler)) {
        this.onConnectedHandler();
      }
    }

    function callDisconnected() {
      if (_.isFunction(this.onDisconnectedHandler)) {
        this.onDisconnectedHandler();
      }
    }

  }
})();
