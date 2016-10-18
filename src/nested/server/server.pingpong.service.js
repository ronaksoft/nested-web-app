(function() {
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

      this.stream = stream;

      this.pingStack = [];
      this.pongStack = [];
      this.pingPongInterval = {};
      this.pingPongStatus = false;

      NstObservableObject.call(this);

    }

    PingPong.prototype = new NstObservableObject();
    PingPong.prototype.constructor = PingPong;

    PingPong.prototype.start = function () {
      if (this.getPingPongStatus() && this.getPingPongInterval()) return;

      this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.CONNECT));
      this.setPingPongStatus(true);
      var service = this;

      var interval = $interval(function () {

        NstSvcLogger.debug2('WS | PING:', Date.now());
        var time = Date.now();
        service.stream.send(NST_SRV_PING_PONG.COMMAND + '/' + time);
        service.pingStack.push({
          cmd : NST_SRV_PING_PONG.COMMAND + '/' + time,
          time : time,
          timeout : $timeout(function () {
            service.checkStatus();
          },NST_SRV_PING_PONG.INTERVAL_TIMEOUT)
        });


      },NST_SRV_PING_PONG.INTERVAL_TIME);

      this.setPingPongInterval(interval);

    };


    PingPong.prototype.stop = function () {

    };

    PingPong.prototype.getPong = function (pong) {
      this.pongStack.push({
        cmd : pong,
        pingTime : pong.split("/")[1],
        pongTime : Date.now()
      });

      if(!this.getPingPongStatus()){
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.RECONNECT));
      }
      this.setPingPongStatus(true);
      this.pingStack = [];
      this.checkStatus();
    };

    PingPong.prototype.checkStatus = function () {
      if (this.pingStack.length > NST_SRV_PING_PONG.MAX_FAILED_PING){
        console.log("disconnect")
        this.setPingPongStatus(false);
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.DISCONNECT));
        return false;
      }
    };

    return PingPong;

  }
})();
