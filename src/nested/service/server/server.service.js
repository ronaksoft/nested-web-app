(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_SRV_MESSAGE_TYPE', {
      QUEST: 'q',
      RESPONSE: 'r',
      PUSH: 'p'
    })
    .constant('NST_SRV_PUSH_TYPE', {
      TIMELINE_EVENT: 'tl_event'
    })
    .constant('NST_SRV_ERROR', {
      UNKNOWN: 0,
      ACCESS_DENIED: 1,
      UNAVAILABLE: 2,
      INVALID: 3,
      INCOMPLETE: 4,
      DUPLICATE: 5,
      LIMIT_REACHED: 6,
      TIMEOUT: 1000
    })
    .constant('NST_SRV_RESPONSE_STATUS', {
      UNDEFINED: 'not defined',
      SUCCESS: 'ok',
      ERROR: 'err',
      FATAL_ERROR: 'fatal error',
      WARNING: 'warning',
      NOTICE: 'notice'
    })
    .constant('NST_SRV_MESSAGES', {
      INITIALIZE: 'hi'
    })
    .constant('NST_SRV_EVENTS', {
      MESSAGE: '__message',
      INITIALIZE: '__initialize',
      AUTHORIZE: '__authorize',
      MANUAL_AUTH: '__mauthorize',
      UNINITIALIZE: '__uninitialize',
      ERROR: '__error',

      TIMELINE: '__timeline'
    })
    .constant('NST_AUTH_COMMANDS', ['session/register', 'session/recall'])
    .service('NstSvcServer', NstSvcServer);

  /** @ngInject */
  function NstSvcServer($websocket, $q, $log,
                        NST_CONFIG, NST_SRV_MESSAGE_TYPE, NST_SRV_PUSH_TYPE, NST_SRV_RESPONSE_STATUS, NST_SRV_EVENTS, NST_SRV_MESSAGES, NST_AUTH_COMMANDS,
                        NstSvcRandomize,
                        NstRequest) {
    function Server(url, meta) {
      this.meta = meta || {};
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
          case NST_SRV_MESSAGE_TYPE.RESPONSE:
            switch (data.data.status) {
              case NST_SRV_RESPONSE_STATUS.SUCCESS:
                if (data.data.hasOwnProperty('msg')) {
                  this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.MESSAGE, { detail: data.data.msg }));
                }
                break;

              case NST_SRV_RESPONSE_STATUS.ERROR:
                break;
            }
            break;

          case NST_SRV_MESSAGE_TYPE.PUSH:
            switch (data.data.type) {
              case NST_SRV_PUSH_TYPE.TIMELINE_EVENT:
                this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.TIMELINE, { detail: data.data }));
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
            case NST_SRV_MESSAGE_TYPE.RESPONSE:
              switch (data.data.status) {
                case NST_SRV_RESPONSE_STATUS.SUCCESS:
                  this.requests[reqId].resolve(data.data);

                  if (NST_AUTH_COMMANDS.indexOf(this.requests[reqId].data.data.cmd) > -1) {
                    this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.MANUAL_AUTH, {
                      detail: {
                        response: data,
                        request: this.requests[reqId].data
                      }
                    }));
                  }
                  break;

                case NST_SRV_RESPONSE_STATUS.ERROR:
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

        this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.UNINITIALIZE));
        this.stream.reconnect();
      }.bind(this));

      this.stream.onError(function (event) {
        $log.debug('WebSocket Error:', event, this);
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.ERROR));
      }.bind(this));

      this.addEventListener(NST_SRV_EVENTS.MESSAGE, function (event) {
        switch (event.detail) {
          case NST_SRV_MESSAGES.INITIALIZE:
            $log.debug('WebSocket Initialized:', event, this);
            this.initialized = true;
            this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.INITIALIZE));
            break;
        }
      }.bind(this));

      this.addEventListener(NST_SRV_EVENTS.MANUAL_AUTH, function (event) {
        $log.debug('Dispatching Auth Event', event.detail);
        this.authorized = true;
        this.sesSecret = event.detail.response.data._ss;
        this.sesKey = event.detail.response.data._sk.$oid;
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENTS.AUTHORIZE));
      });
    }

    Server.prototype = {
      request: function (action, data, timeout) {
        var reqId = this.genRequestId(action, data, timeout);

        var payload = angular.extend(data || {}, {
          cmd: action
        });

        var rawData = {
          type: 'q',
          _reqid: reqId,
          data: payload,
          meta: this.meta
        };

        this.requests[reqId] = new NstRequest(this, rawData, !angular.isNumber(timeout) || timeout < 0 ? 5000 : timeout);

        return $q(this.requests[reqId].promise);
      },

      genRequestId: function (action, data, timeout) {
        return 'REQ/' + action.toUpperCase() + '/' + NstSvcRandomize.genUniqId();
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

    return new Server(NST_CONFIG.WEBSOCKET.URL, {
      app_id: NST_CONFIG.APP_ID
    });
  }
})();
