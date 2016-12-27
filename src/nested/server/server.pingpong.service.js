(function () {
  'use strict';

  angular
    .module('ronak.nested.web.data')
    .service('NstSvcPingPong', NstSvcPingPong);

  /** @ngInject */
  function NstSvcPingPong($timeout, $interval,
                          NST_SRV_EVENT, NST_SRV_PING_PONG,
                          NstSvcLogger,
                          NstObservableObject) {

    function PingPong(stream) {

      var service = this;

      this.stream = stream;
      this.onConnectedHandler = null;
      this.onDisconnectedHandler = null;

      this.pingStack = [];
      this.pongStack = [];
      this.pingPongInterval = {};
      this.pingPongStatus = false;
      this.lastPing = Date.now();
      this.lastObserve = Date.now();

      NstObservableObject.call(this);

      $interval(function () {

        if (Date.now() - service.lastObserve > NST_SRV_PING_PONG.INTERVAL_TIME) {
          NstSvcLogger.debug2("WS PINGPONG | timeout ");
          service.setPingPongStatus(false);
          service.checkStatus(true);
        }
        service.lastObserve = Date.now();

      }, 2000);

    }

    PingPong.prototype = new NstObservableObject();
    PingPong.prototype.constructor = PingPong;

    PingPong.prototype.start = function () {
      if (this.getPingPongStatus() && this.getPingPongInterval()) return;

      callConected.bind(this)();
      this.setPingPongStatus(true);
      var service = this;

      service.lastPing = Date.now();

      var interval = $interval(function () {
        service.lastPing = Date.now();
        NstSvcLogger.debug2('WS | PING:', Date.now());
        var time = Date.now();
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

    };

    PingPong.prototype.getPong = function (pong) {

      this.pongStack.push({
        cmd: pong,
        pingTime: pong.split("/")[1],
        pongTime: Date.now()
      });

      NstSvcLogger.debug2("WS PINGPONG | delay : " + (Date.now() - parseInt(pong.split("/")[1])));

      callConected.bind(this)();
      if (!this.pingPongStatus) {
        // callDisconnected.bind(this)();
      }

      this.setPingPongStatus(true);
      this.pingStack = [];
      this.checkStatus();
    };

    PingPong.prototype.checkStatus = function (force) {
      if ((this.pingStack.length >= NST_SRV_PING_PONG.MAX_FAILED_PING) || force) {
        console.log("disconnect")
        this.pingPongStatus= false;
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
