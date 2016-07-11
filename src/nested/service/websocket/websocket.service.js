(function() {
  'use strict';

  angular
    .module('nested')
    .factory('WsRequest', NestedWsRequest)
    .service('WsService', NestedWsService);

  function NestedWsRequest($log,
                           NST_WS_RESPONSE_STATUS, NST_WS_ERROR, NST_WS_EVENT, AUTH_COMMANDS) {
    function Request(service, data, timeout) {
      this.service = service;
      this.data = data;
      this.resolve = function () { return Promise.resolve(); };
      this.reject = function () { return Promise.reject(); };
      this.timeout = timeout;
      this.timeout_id = -1;

      this.send = function () {
        if (this.timeout > 0) {
          this.timeout_id = setTimeout(
            function () {
              this.reject({
                status: NST_WS_RESPONSE_STATUS.ERROR,
                err_code: NST_WS_ERROR.TIMEOUT
              });
            }.bind(this),
            this.timeout
          );
        }

        this.data.data['_sk'] = this.data.data['_sk'] || this.service.getSessionKey();
        this.data.data['_ss'] = this.data.data['_ss'] || this.service.getSessionSecret();

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

        if (this.service.isAuthorized() || AUTH_COMMANDS.indexOf(this.data.data.cmd) > -1) {
          if (this.service.isInitialized()) {
            this.send();
          } else {
            this.service.addEventListener(NST_WS_EVENT.INITIALIZE, this.send, true);
          }
        } else {
          this.service.addEventListener(NST_WS_EVENT.AUTHORIZE, this.send, true);
        }

      }.bind(this);
    }

    return Request;
  }

  /** @ngInject */
  function NestedWsService($websocket, $q, NST_WS_MESSAGE_TYPE, NST_WS_PUSH_TYPE, NST_WS_RESPONSE_STATUS, NST_WS_EVENT, NST_WS_MESSAGES, APP, NST_AUTH_COMMANDS, WsRequest, $log) {
    function WsService(appId, appSecret, url) {
      // TODO: Make these configurable
      this.appId = appId;
      this.appSecret = appSecret;
      this.sesKey = '';
      this.sesSecret = '';

      this.initialized = false;
      this.authorized = false;
      this.requests = {};
      this.listeners = {};
      this.stream = $websocket(url);
      this.stream.maxTimeout = 500;
      this.stream.reconnectIfNotNormalClose = true;

      this.stream.onOpen(function (event) {
        $log.debug('WebSocket Opened:', event, this);
      }.bind(this));

      // Orphan Router
      this.stream.onMessage(function(ws) {
        if (!ws.data) {
          $log.debug('Empty Orphan Message:', ws);

          return;
        }

        var data = angular.fromJson(ws.data);
        $log.debug('Message:', data);

        switch (data.type) {
          case WS_MESSAGE_TYPE.RESPONSE:
            switch (data.data.status) {
              case WS_RESPONSE_STATUS.SUCCESS:
                if (data.data.hasOwnProperty('msg')) {
                  this.dispatchEvent(new CustomEvent(NST_WS_EVENT.MESSAGE, { detail: data.data.msg }));
                }
                break;

              case WS_RESPONSE_STATUS.ERROR:
                break;
            }
            break;

          case WS_MESSAGE_TYPE.PUSH:
            switch (data.data.type) {
              case WS_PUSH_TYPE.TIMELINE_EVENT:
                this.dispatchEvent(new CustomEvent(NST_WS_EVENT.TIMELINE, { detail: data.data }));
                break;
            }
            break;
        }
      }.bind(this));

      // Response Router
      this.stream.onMessage(function(ws) {
        if (!ws.data) {
          $log.debug('Empty Will Be Routed Message:', ws);

          return;
        }

        var data = angular.fromJson(ws.data);

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

                  if (AUTH_COMMANDS.indexOf(this.requests[reqId].data.data.cmd) > -1) {
                    this.dispatchEvent(new CustomEvent(NST_WS_EVENT.MANUAL_AUTH, {
                      detail: {
                        response: data,
                        request: this.requests[reqId].data
                      }
                    }));
                  }
                  break;

                case WS_RESPONSE_STATUS.ERROR:
                  $log.debug('Error:', data.data.err_code, 'Sent:', this.requests[reqId].data, 'Received:', data);
                  this.requests[reqId].reject(data.data);
                  break;
              }
              break;
          }
        }
      }.bind(this));

      this.stream.onClose(function(event) {
        $log.debug('WebSocket Closed:', event, this);

        this.authorized = false;
        this.initialized = false;
        this.dispatchEvent(new CustomEvent(NST_WS_EVENT.UNINITIALIZE));

        this.stream.reconnect();
      }.bind(this));

      this.stream.onError(function (event) {
        $log.debug('WebSocket Error:', event, this);
        this.dispatchEvent(new CustomEvent(NST_WS_EVENT.ERROR));
      }.bind(this));

      this.addEventListener(NST_WS_EVENT.MESSAGE, function (event) {
        switch (event.detail) {
          case WS_MESSAGES.INITIALIZE:
            $log.debug('WebSocket Initialized:', event, this);
            this.initialized = true;
            this.dispatchEvent(new CustomEvent(NST_WS_EVENT.INITIALIZE));
            break;
        }
      }.bind(this));

      this.addEventListener(NST_WS_EVENT.MANUAL_AUTH, function (event) {
        $log.debug('Dispatching Auth Event', event.detail);
        this.authorized = true;
        this.sesSecret = event.detail.response.data._ss;
        this.sesKey = event.detail.response.data._sk.$oid;
        this.dispatchEvent(new CustomEvent(NST_WS_EVENT.AUTHORIZE));
      });
    }

    WsService.prototype = {
      request: function (action, data, timeout) {
        var reqId = this.genRequestId(action, data, timeout);

        var payload = angular.extend(data || {}, {
          cmd: action
        });

        var rawData = {
          type: 'q',
          _reqid: reqId,
          data: payload
        };

        this.requests[reqId] = new WsRequest(this, rawData, !angular.isNumber(timeout) || timeout < 0 ? 5000 : timeout);

        return $q(this.requests[reqId].promise);
      },

      sync: function (action, data, timeout) {
        var channel = {
          data: null,
          locked: true
        };

        this.request(action, data, timeout).catch(function (data) {
          this.data = data;
          this.locked = false;

          $log.debug(this, Date.now());
        }.bind(channel));

        var start = Date.now();
        while (channel.locked && (Date.now() - start) < (10 * timeout));
        $log.debug(channel, Date.now());

        return channel.data;
      },

      genRequestId: function (action, data, timeout) {
        return 'REQ/' + action.toUpperCase() + '/' +
          Math.round(Math.random() * 10000).toString() + (new Date()).getTime().toString();
      },

      isInitialized: function () {
        return this.initialized;
      },

      isAuthorized: function () {
        return this.authorized;
      },

      unauthorize: function () {
        if (this.authorized) {
          // Currently just called on auth service logout
          // When stream is closed it will became unauthorized automatically
          this.stream.close();
        }
      },

      getSessionKey: function () {
        return this.sesKey;
      },

      getSessionSecret: function () {
        return this.sesSecret;
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
