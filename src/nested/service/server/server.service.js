(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcServer', NstSvcServer);

  /** @ngInject */
  function NstSvcServer($websocket, $q, $log,
                        NST_CONFIG, NST_SRV_MESSAGE_TYPE, NST_SRV_PUSH_TYPE, NST_SRV_RESPONSE_STATUS, NST_SRV_EVENT, NST_SRV_MESSAGES, NST_AUTH_COMMANDS,
                        NstSvcRandomize,
                        NstObservableObject, NstRequest) {
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
                  this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.MESSAGE, { detail: data.data.msg }));
                }
                break;

              case NST_SRV_RESPONSE_STATUS.ERROR:
                break;
            }
            break;

          case NST_SRV_MESSAGE_TYPE.PUSH:
            switch (data.data.type) {
              case NST_SRV_PUSH_TYPE.TIMELINE_EVENT:
                this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.TIMELINE, { detail: data.data }));
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
                    this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.MANUAL_AUTH, {
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

        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.UNINITIALIZE));
        this.stream.reconnect();
      }.bind(this));

      this.stream.onError(function (event) {
        $log.debug('WebSocket Error:', event, this);
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.ERROR));
      }.bind(this));

      this.addEventListener(NST_SRV_EVENT.MESSAGE, function (event) {
        switch (event.detail) {
          case NST_SRV_MESSAGES.INITIALIZE:
            $log.debug('WebSocket Initialized:', event, this);
            this.initialized = true;
            this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.INITIALIZE));
            break;
        }
      }.bind(this));

      this.addEventListener(NST_SRV_EVENT.MANUAL_AUTH, function (event) {
        $log.debug('Dispatching Auth Event', event.detail);
        this.authorized = true;
        this.sesSecret = event.detail.response.data._ss;
        this.sesKey = event.detail.response.data._sk.$oid;
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.AUTHORIZE));
      });
    }

    Server.prototype = new NstObservableObject();
    Server.prototype.constructor = Server;

    Server.prototype.request = function (action, data, timeout) {
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
    };

    Server.prototype.genRequestId = function (action, data, timeout) {
      return 'REQ/' + action.toUpperCase() + '/' + NstSvcRandomize.genUniqId();
    };

    Server.prototype.isInitialized = function () {
      return this.initialized;
    };

    Server.prototype.isAuthorized = function () {
      return this.authorized;
    };

    Server.prototype.unauthorize = function () {
      if (this.authorized) {
        // Currently just called on auth service logout
        // When stream is closed it will became unauthorized automatically
        this.stream.close();
      }
    };

    Server.prototype.getSessionKey = function () {
      return this.sesKey;
    };

    Server.prototype.getSessionSecret = function () {
      return this.sesSecret;
    };

    return new Server(NST_CONFIG.WEBSOCKET.URL, {
      app_id: NST_CONFIG.APP_ID
    });
  }
})();
