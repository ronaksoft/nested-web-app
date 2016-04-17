(function() {
  'use strict';

  angular
    .module('nested')
    .constant('APP', {
      ID: 'APP_WEB_237400002374',
      SECRET: '030c8a3c14bcef61d6adab5cac34cede'
    })
    .constant('WS_MESSAGE_TYPE', {
      QUEST: 'q',
      RESPONSE: 'r',
      EVENT: 'tl_event'
    })
    .constant('WS_RESPONSE_STATUS', {
      SUCCESS: 'ok',
      ERROR: 'err'
    })
    .constant('WS_MESSAGES', {
      INITIALIZE: 'hi'
    })
    .constant('WS_EVENTS', {
      MESSAGE: '__message',
      INITIALIZE: '__initialize',
      AUTHORIZE: '__authorize',
      UNINITIALIZE: '__uninitialize'
    })
    .factory('WsRequest', NestedWsRequest)
    .service('WsService', NestedWsService);

  function NestedWsRequest(WS_RESPONSE_STATUS, WS_EVENTS, $log) {
    function Request(service, data, timeout) {
      this.service = service;
      this.data = data;
      this.resolve = function () { return Promise.resolve(); };
      this.reject = function () { return Promise.reject(); };
      this.timeout = timeout;
      this.timeout_id = -1;

      this.send = function () {
        $log.debug('Sending:', this.data);
        this.service.stream.send(angular.toJson(this.data));
      }.bind(this);

      this.promise = function (resolve, reject) {
        if (angular.isFunction(resolve)) {
          this.resolve = resolve;
        }

        if (angular.isFunction(reject)) {
          this.reject = reject;
        }

        if (this.timeout > 0) {
          this.timeout_id = setTimeout(
            function () {
              this.reject({
                status: WS_RESPONSE_STATUS.ERROR,
                err_code: 5
              });
            }.bind(this),
            this.timeout
          );
        }

        $log.debug('Gonna Send:', this.data);
        if (this.service.isAuthorized() || ['login', 'auth'].indexOf(this.data.data.cmd) > -1) {
          if (this.service.isInitialized()) {
            this.send();
          } else {
            this.service.addEventListener(WS_EVENTS.INITIALIZE, this.send, true);
          }
        } else {
          this.service.addEventListener(WS_EVENTS.AUTHORIZE, this.send, true);
        }

      }.bind(this);
    }

    return Request;
  }

  /** @ngInject */
  function NestedWsService($websocket, WS_MESSAGE_TYPE, WS_RESPONSE_STATUS, WS_EVENTS, WS_MESSAGES, APP, WsRequest, $log) {
    function WsService(appId, appSecret, url) {
      // TODO: Make these configurable
      this.appId = appId;
      this.appSecret = appSecret;
      this.authFn = function () { return Promise.resolve(); };

      this.initialized = false;
      this.authorized = false;
      this.requests = {};
      this.listeners = {};
      this.stream = $websocket(url);

      this.stream.onOpen(function (event) {
        $log.debug('WebSocket Opened:', event, this);
      }.bind(this));

      // Orphan Router
      this.stream.onMessage(function(ws) {
        var data = angular.fromJson(ws.data);

        switch (data.type) {
          case WS_MESSAGE_TYPE.RESPONSE:
            switch (data.data.status) {
              case WS_RESPONSE_STATUS.SUCCESS:
                if (data.data.hasOwnProperty('msg')) {
                  this.dispatchEvent(new CustomEvent(WS_EVENTS.MESSAGE, { detail: data.data.msg }));
                }
                break;

              case WS_RESPONSE_STATUS.ERROR:
                break;
            }
            break;

          case WS_MESSAGE_TYPE.EVENT:
            if (data.data.hasOwnProperty('name')) {
              this.dispatchEvent(new CustomEvent(data.data.name));
            }
            break;
        }
      }.bind(this));

      // Response Router
      this.stream.onMessage(function(ws) {
        var data = angular.fromJson(ws.data);

        $log.debug(data);

        var reqId = data.hasOwnProperty('_reqid') ? data._reqid : 'invalid';

        if (this.requests.hasOwnProperty(reqId)) {
          if (this.requests[reqId].timeout_id > 0) {
            clearTimeout(this.requests[reqId].timeout_id);
          }
          delete this.requests.reqId;

          switch (data.type) {
            case WS_MESSAGE_TYPE.RESPONSE:
              switch (data.data.status) {
                case WS_RESPONSE_STATUS.SUCCESS:
                  this.requests[reqId].resolve(data.data);
                  break;

                case WS_RESPONSE_STATUS.ERROR:
                  this.requests[reqId].reject(data.data);
                  break;
              }
              break;
          }
        }
      }.bind(this));

      this.stream.onClose(function(event) {
        $log.debug('WebSocket Closed:', event, this);

        $log.debug('WebSocket Uninitialized');
        this.initialized = false;
        this.dispatchEvent(new CustomEvent(WS_EVENTS.UNINITIALIZE));

        this.stream.reconnect();
      }.bind(this));

      this.stream.onError(function (event) {
        $log.debug('WebSocket Error:', event, this);
      });

      this.addEventListener(WS_EVENTS.MESSAGE, function (event) {
        switch (event.detail) {
          case WS_MESSAGES.INITIALIZE:
            $log.debug('WebSocket Initialized:', event, this);
            this.initialized = true;
            this.dispatchEvent(new CustomEvent(WS_EVENTS.INITIALIZE));
            break;
        }
      }.bind(this));

      this.addEventListener(WS_EVENTS.INITIALIZE, function (event) {
        var authorize = function () {
          this.authorized = true;
          this.dispatchEvent(new CustomEvent(WS_EVENTS.AUTHORIZE));
        }.bind(this);

        if (angular.isFunction(this.authFn)) {
          this.authFn.call(this).then(authorize);
        }
      }.bind(this));
    }

    WsService.prototype = {
      request: function (action, data, timeout) {
        var reqId = this.genRequestId(action, data, timeout);

        var payload = angular.extend(null == data ? {} : data, {
          _appid: this.appId,
          _as: this.appSecret,
          cmd: action
        });

        var rawData = {
          type: 'q',
          _reqid: reqId,
          data: payload
        };

        this.requests[reqId] = new WsRequest(this, rawData, !angular.isNumber(timeout) || timeout < 0 ? 5000 : timeout);

        return new Promise(this.requests[reqId].promise);
      },

      sync: function (action, data, timeout) {
        var channel = {
          data: null,
          locked: true
        };

        this.request(action, data, timeout).catch(function (data) {
          this.data = data;
          this.locked = false;

          console.log(this, Date.now());
        }.bind(channel));

        var start = Date.now();
        while (channel.locked && (Date.now() - start) < (10 * timeout));
        console.log(channel, Date.now());

        return channel.data;
      },

      genRequestId: function (action, data, timeout) {
        return 'REQ/' + action.toUpperCase() + '/' +
          Math.round(Math.random() * 10000).toString() + (new Date()).getTime().toString();
      },

      isInitialized: function () {
        return this.initialized;
      },

      /**
       * Registers a function which is called on web-socket initialization
       *
       * @param promiseFn Function which should return promise. If promise resolves then socket will be authorized
       */
      registerAuthorizeFn: function (promiseFn) {
        this.authFn = promiseFn;
      },

      isAuthorized: function () {
        return this.authorized;
      },

      addEventListener: function (type, callback, oneTime) {
        if (!(type in this.listeners)) {
          this.listeners[type] = [];
        }

        this.listeners[type].push({
          flush: oneTime || false,
          fn: callback
        });
      },

      removeEventListener: function (type, callback) {
        if (!(type in this.listeners)) {
          return;
        }

        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
          if (stack[i].fn === callback) {
            stack.splice(i, 1);

            return this.removeEventListener(type, callback);
          }
        }
      },

      dispatchEvent: function (event) {
        if (!(event.type in this.listeners)) {
          return;
        }

        var stack = this.listeners[event.type];
        // event.target = this;
        var flushTank = [];
        for (var i = 0, l = stack.length; i < l; i++) {
          stack[i].fn.call(this, event);
          stack[i].flush && flushTank.push(stack[i]);
        }

        for (var key in flushTank) {
          this.removeEventListener(event.type, flushTank[key].fn);
        }
      }
    };

    return new WsService(APP.ID, APP.SECRET, 'wss://ws001.ws.nested.me:443');
  }
})();
