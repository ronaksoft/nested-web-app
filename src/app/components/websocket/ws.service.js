(function() {
  'use strict';

  angular
    .module('nested')
    .constant('MESSAGE_TYPE', {
      quest: 'q',
      response: 'r',
      event: 'tl_event'
    })
    .constant('RESPONSE_STATUS', {
      success: 'ok',
      error: 'err'
    })
    .service('WsService', NestedWs);

  function NestedWsRequest(stream, data) {
    this.data = data;
    this.resolve = function () {};
    this.reject = function () {};
    this.promise = function (resolve, reject) {
      if (angular.isFunction(resolve)) {
        this.resolve = resolve;
      }

      if (angular.isFunction(reject)) {
        this.reject = reject;
      }

      stream.send(angular.toJson(this.data));
    }.bind(this);
  }

  /** @ngInject */
  function NestedWs($websocket, MESSAGE_TYPE, RESPONSE_STATUS, $log) {
    this.requests = {};
    this.stream = $websocket('wss://ws001.ws.nested.me:443');

    this.dispatcher = function (ws) {
      var data = angular.fromJson(ws.data);
      var reqId = data._reqid;

      $log.debug(data);
      if (this.requests.hasOwnProperty(reqId)) {
        switch (data.type) {
          case MESSAGE_TYPE.response:
            switch (data.data.status) {
              case RESPONSE_STATUS.success:
                this.requests[reqId].resolve(data.data);
                break;

              case RESPONSE_STATUS.error:
                this.requests[reqId].reject(data.data);
                break;
            }
            break;

          case MESSAGE_TYPE.event:
            // TODO: Iterate on Event Listeners
            break;
        }
      }
    };

    this.stream.onMessage(this.dispatcher.bind(this));

    this.request = function (action, data) {
      // TODO: Make these configurable
      var reqId = "REQ" + (new Date()).getTime();
      var appId = 'APP_WEB_237400002374';
      var appSecret = '030c8a3c14bcef61d6adab5cac34cede';

      var payload = angular.extend(null == data ? {} : data, {
        _appid: appId,
        _as: appSecret,
        cmd: action
      });

      var rawData = {
        type: 'q',
        _reqid: reqId,
        data: payload
      };

      this.requests[reqId] = new NestedWsRequest(this.stream, rawData);

      return new Promise(this.requests[reqId].promise);
    };

    this.addEventListener = function (name, callback) {

    };
  }
})();
