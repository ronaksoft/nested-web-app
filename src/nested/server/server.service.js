(function() {
  'use strict';

  angular
    .module('ronak.nested.web.data')
    .service('NstSvcServer', NstSvcServer);

  /** @ngInject */
  function NstSvcServer($q, $timeout, $interval,
                        NST_CONFIG, NST_AUTH_COMMAND, NST_REQ_STATUS, NST_RES_STATUS,
                        NST_SRV_MESSAGE_TYPE, NST_SRV_PUSH_TYPE, NST_SRV_RESPONSE_STATUS,  NST_SRV_ERROR,
                        NST_SRV_EVENT, NST_SRV_MESSAGE, NST_SRV_PING_PONG,
                        NstSvcRandomize, NstSvcLogger, NstSvcTry, NstSvcPingPong, NstSvcConnectionMonitor,
                        NstObservableObject, NstServerError, NstServerQuery, NstRequest, NstResponse) {
    function Server(url, configs) {
      this.defaultConfigs = {
        streamTimeout: 500,
        requestTimeout: 1000,
        maxRetries : 16,
        meta: {}
      };

      this.configs = angular.extend(this.defaultConfigs, configs);

      this.sesKey = '';
      this.sesSecret = '';

      this.initialized = false;
      this.authorized = false;
      this.queue = {};


      this.stream = NstSvcConnectionMonitor.start(url);
      this.stream.maxTimeout = this.configs.streamTimeout;
      this.stream.reconnectIfNotNormalClose = true;

      NstObservableObject.call(this);

      this.pingPong = new NstSvcPingPong(this.stream, this);

      NstSvcConnectionMonitor.onReady(function (event) {
        NstSvcLogger.debug2('WS | Opened:', event, this);

        // TODO:: Uncomment me after ping handled by server
        this.pingPong.start();
      }.bind(this));

      // Orphan Router
      this.stream.onMessage(function(ws) {
        if (!ws.data) {
          NstSvcLogger.debug2('WS | Empty Orphan Message:', ws);

          return;
        }


        // Checking for pong message
        if (ws.data.indexOf(NST_SRV_PING_PONG.RESPONSE) === 0){
          this.pingPong.getPong(ws.data);
          return false;
        }

        var data = angular.fromJson(ws.data);
        NstSvcLogger.debug2('WS | Message:', data);

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
              case NST_SRV_PUSH_TYPE.MENTION:
                this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.MENTION, { detail: data.data }));
                break;
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
          NstSvcLogger.debug2('WS | Empty Will Be Routed Message:', ws);

          return;
        }


        //Checking for pong message
        if (ws.data.indexOf(NST_SRV_PING_PONG.RESPONSE) === 0){
          this.pingPong.getPong(ws.data);
          return false;
        }


        var data = angular.fromJson(ws.data);

        var reqId = data.hasOwnProperty('_reqid') ? data._reqid : 'invalid';
        var qItem = this.queue[reqId];

        if (qItem && !qItem.request.isFinished()) {
          if (qItem.timeoutPromise) {
            $timeout.cancel(qItem.timeoutPromise);
          }
          delete this.queue[reqId];

          switch (data.type) {
            case NST_SRV_MESSAGE_TYPE.RESPONSE:
              var response = new NstResponse(NST_RES_STATUS.UNKNOWN, data.data);
              switch (data.data.status) {
                case NST_SRV_RESPONSE_STATUS.SUCCESS:
                  response.setStatus(NST_RES_STATUS.SUCCESS);
                  qItem.request.finish(response);

                  if (NST_AUTH_COMMAND.indexOf(qItem.request.getMethod()) > -1) {
                    this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.MANUAL_AUTH, {
                      detail: {
                        response: response,
                        request: qItem.request
                      }
                    }));
                  }
                  break;

                case NST_SRV_RESPONSE_STATUS.ERROR:
                  response.setStatus(NST_RES_STATUS.FAILURE);
                  NstSvcLogger.debug2('WS | Error:', response.getData().err_code, 'Sent:', qItem.request, 'Received:', response.getData());

                  qItem.request.finish(response);
                  break;
              }
              break;
          }
        }
      }.bind(this));

      NstSvcConnectionMonitor.onLost(function(event) {
        NstSvcLogger.debug2('WS | Closed:', event, this);

        this.authorized = false;
        this.initialized = false;

        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.UNINITIALIZE));
        // this.stream.reconnect();
      }.bind(this));

      this.stream.onError(function (event) {
        NstSvcLogger.debug2('WS | Error:', event, this);
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.ERROR));
      }.bind(this));

      this.addEventListener(NST_SRV_EVENT.MESSAGE, function (event) {
        switch (event.detail) {
          case NST_SRV_MESSAGE.INITIALIZE:
            NstSvcLogger.debug2('WS | Initialized:', event, this);
            this.setInitialized(true);
            this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.INITIALIZE));
            break;
        }
      }.bind(this));

      this.addEventListener(NST_SRV_EVENT.MANUAL_AUTH, function (event) {
        NstSvcLogger.debug2('WS | Dispatching Auth Event', event.detail);
        this.setAuthorized(true);
        this.setSesSecret(event.detail.response.getData()._ss);
        this.setSesKey(event.detail.response.getData()._sk.$oid);
        this.dispatchEvent(new CustomEvent(NST_SRV_EVENT.AUTHORIZE));
      });


    }

    Server.prototype = new NstObservableObject();
    Server.prototype.constructor = Server;

    Server.prototype.request = function () {
      var service = this;
    };

    Server.prototype.request = function (action, data, timeout) {
      var service = this;
      var payload = angular.extend(data || {}, {
        cmd: action
      });
      var retryablePromise = NstSvcTry.do(function () {

        var reqId = service.genQueueId(action, data);
        var rawData = {
          type: 'q',
          _reqid: reqId,
          data: payload
        };
        var request = new NstRequest(action, rawData);
        service.queue[reqId] = {
          request: request,
          timeoutPromise: undefined,
          listenerId: undefined
        };

        timeout = angular.isNumber(timeout) ? timeout : service.getConfigs().requestTimeout;

        return service.enqueueToSend(reqId, timeout).getPromise();
      }, shouldStopTrying, service.getConfigs().maxRetries);


      // TODO: Return the request itself
      return retryablePromise.then(function (response) {
        // TODO: Resolve with response itself
        return $q.resolve(response.getData());
      }).catch(function (response) {
        NstSvcLogger.debug2('WS | Response: ', response);
        // TODO: retry here by creating a new request
        return $q.reject(new NstServerError(
          new NstServerQuery(action, data),
          response.getData().items,
          response.getData().err_code,
          response.getData()
        ));
      });
    };

    function shouldStopTrying(response) {
      var errorCode = response.data.err_code;

      return errorCode !== NST_SRV_ERROR.TIMEOUT;
    }

    Server.prototype.enqueueToSend = function (reqId, timeout) {
      var qItem = this.queue[reqId];

      if (qItem && !qItem.request.isFinished()) {
        var service = this;
        qItem.request.setStatus(NST_REQ_STATUS.QUEUED);

        if (this.isAuthorized() || NST_AUTH_COMMAND.indexOf(qItem.request.getMethod()) > -1) {
          if (this.isInitialized()) {
            service.sendQueueItem(reqId, timeout);
          } else {
            qItem.listenerId = this.addEventListener(NST_SRV_EVENT.INITIALIZE, function () { service.sendQueueItem(reqId, timeout); }, true);
          }
        } else {
          qItem.listenerId = this.addEventListener(NST_SRV_EVENT.AUTHORIZE, function () { service.sendQueueItem(reqId, timeout); }, true);
        }

        return qItem.request;
      }

      return new NstRequest();
    };

    Server.prototype.cancelQueueItem = function (reqId, response) {
      var qItem = this.queue[reqId];

      if (qItem && !qItem.request.isFinished()) {
        switch (qItem.request.getStatus()) {
          case NST_REQ_STATUS.NOT_SENT:
          case NST_REQ_STATUS.SENT:
            delete this.queue[reqId];
            break;

          case NST_REQ_STATUS.QUEUED:
            if (qItem.timeoutPromise instanceof Promise) {
              $timeout.cancel(qItem.timeoutPromise);
              delete this.queue[reqId];
            }
            break;

          case NST_REQ_STATUS.CANCELLED:
          case NST_REQ_STATUS.RESPONDED:
            return false;
            break;
        }

        NstSvcLogger.debug2('WS | Cancelled: ', reqId, qItem.request);
        qItem.request.setStatus(NST_REQ_STATUS.CANCELLED);
        qItem.request.finish(response || new NstResponse());
      }

      return false;
    };

    Server.prototype.sendQueueItem = function (reqId, timeout) {
      var service = this;
      var qItem = this.queue[reqId];

      if (qItem && !qItem.request.isFinished()) {
        if (timeout > 0) {
          qItem.timeoutPromise = $timeout(function () {
            NstSvcLogger.debug2('WS | Timeout: ', reqId, qItem.request, ' After: ', timeout);
            service.cancelQueueItem(reqId, new NstResponse(NST_RES_STATUS.FAILURE, {
              err_code: NST_SRV_ERROR.TIMEOUT,
              message: 'Request Timeout'
            }));
          }, timeout);
        }

        var result = this.send(qItem.request);
        qItem.request.setStatus(NST_REQ_STATUS.SENT);

        return result;
      }

      return $q.reject();
    };

    Server.prototype.send = function (request) {
      NstSvcLogger.debug2('WS | Sending', request.getData());

      if (this.isAuthorized()) {
        var data = request.getData();
        data.data['_sk'] = this.getSessionKey();
        data.data['_ss'] = this.getSessionSecret();
        data.data = angular.extend(data.data, this.configs.meta);
        request.setData(data);
      }

      return this.stream.send(angular.toJson(request.getData()));
    };

    Server.prototype.genQueueId = function (action, data) {
      return 'REQ/' + action.toUpperCase() + '/' + NstSvcRandomize.genUniqId();
    };

    Server.prototype.isInitialized = function () {
      return this.getInitialized();
    };

    Server.prototype.isAuthorized = function () {
      return this.getAuthorized();
    };

    Server.prototype.unauthorize = function () {
      if (this.authorized) {
        // Currently just called on auth service logout
        // When stream is closed it will became unauthorized automatically
        this.stream.close();
      }
    };

    Server.prototype.getSessionKey = function () {
      return this.getSesKey();
    };

    Server.prototype.getSessionSecret = function () {
      return this.getSesSecret();
    };

    return new Server(NST_CONFIG.WEBSOCKET.URL, {
      requestTimeout: NST_CONFIG.WEBSOCKET.TIMEOUT,
      maxRetries : NST_CONFIG.WEBSOCKET.REQUEST_MAX_RETRY_TIMES,
      meta: {
        app_id: NST_CONFIG.APP_ID
      }
    });
  }
})();
