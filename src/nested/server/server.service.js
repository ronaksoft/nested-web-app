(function () {
  'use strict';

  angular
    .module('ronak.nested.web.data')
    .service('NstSvcServer', NstSvcServer);

  /** @ngInject */
  function NstSvcServer(_, $q, $timeout, $cookies, $rootScope,
                        NST_CONFIG, NST_AUTH_COMMAND, NST_REQ_STATUS, NST_RES_STATUS, NST_AUTH_EVENT,
                        NST_SRV_MESSAGE_TYPE, NST_SRV_PUSH_CMD, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR,
                        NST_SRV_EVENT, NST_SRV_MESSAGE,
                        NstSvcRandomize, NstSvcLogger, NstSvcTry, NstSvcConnectionMonitor, NstHttp, NstSvcClient,
                        NstObservableObject, NstServerError, NstServerQuery, NstRequest, NstResponse, NstSvcRequestCacheFactory) {

    var NST_SERVER_DOMAIN = 'nested.server.domain';

    function Server(url, configs) {
      this.defaultConfigs = {
        streamTimeout: 500000,
        requestTimeout: 300000,
        maxRetries: 16,
        meta: {},
        WEBSOCKET_URL: NST_CONFIG.WEBSOCKET.URL,
        REGISTER_URL: NST_CONFIG.REGISTER.AJAX.URL,
        STORE_URL: NST_CONFIG.STORE.URL,
        ADMIN_DOMAIN: NST_CONFIG.ADMIN_DOMAIN,
        ADMIN_PORT: NST_CONFIG.ADMIN_PORT,
        DOMAIN: NST_CONFIG.DOMAIN
      };

      var server = this;

      server.configs = angular.extend(server.defaultConfigs, configs);
      server.sesKey = '';
      server.sesSecret = $cookies.get('nss') || '';
      server.clientIdHash = null;
      server.initialized = false;
      server.authorized = false;
      server.remoteMode = false;
      server.remoteDomain = null;
      server.domain = null;
      server.queue = {};
      NstObservableObject.call(server);


      this.init = function (webSocketUrl) {
        if (server.stream) {
          server.stream.close();
        }
        if (!webSocketUrl) {
          server.revertConfigs();
        }
        server.stream = NstSvcConnectionMonitor.start(webSocketUrl ? webSocketUrl : url);
        server.stream.maxTimeout = server.configs.streamTimeout;
        server.stream.reconnectIfNotNormalClose = true;

        // NstSvcConnectionMonitor.onReady(function (event) {
        //   NstSvcLogger.debug2('WS | Opened:', event, this);
        //
        //   // TODO:: Uncomment me after ping handled by server
        // }.bind(this));

        // Orphan Router
        server.stream.onMessage(function (ws) {
          if (!ws.data) {
            NstSvcLogger.debug2('WS | Empty Orphan Message:', ws);

            return;
          }

          if (_.startsWith(ws.data, "PONG!")) {
            return;
          }
          // // Checking for pong message
          // if (ws.data.indexOf(NST_SRV_PING_PONG.RESPONSE) === 0){
          //   server.pingPong.getPong(ws.data);
          //   return false;
          // }

          var message = angular.fromJson(ws.data);
          NstSvcLogger.debug2('WS | Message:', message);
          switch (message.type) {
            case NST_SRV_MESSAGE_TYPE.RESPONSE:
              var status = message.status || (message.data ? message.data.status : '');
              switch (status) {
                case NST_SRV_RESPONSE_STATUS.SUCCESS:
                  if (message.data && message.data.hasOwnProperty('msg')) {
                    server.dispatchEvent(new CustomEvent(NST_SRV_EVENT.MESSAGE, {detail: message.data.msg}));
                  }
                  break;

                case NST_SRV_RESPONSE_STATUS.ERROR:
                  break;
              }
              break;

            case NST_SRV_MESSAGE_TYPE.PUSH:
              switch (message.cmd) {
                case NST_SRV_PUSH_CMD.SYNC_ACTIVITY:
                  server.dispatchEvent(new CustomEvent(NST_SRV_PUSH_CMD.SYNC_ACTIVITY, {detail: message.data}));
                  break;
                case NST_SRV_PUSH_CMD.SYNC_NOTIFICATION:
                  server.dispatchEvent(new CustomEvent(NST_SRV_PUSH_CMD.SYNC_NOTIFICATION, {detail: message.data}));
                  break;
                case NST_SRV_PUSH_CMD.SYNC_TASK_ACTIVITY:
                  server.dispatchEvent(new CustomEvent(NST_SRV_PUSH_CMD.SYNC_TASK_ACTIVITY, {detail: message.data}));
                  break;
              }
              break;

            default :
              throw "SERVER | Undefined response WS type";
          }
        }.bind(server));

        // Response Router
        server.stream.onMessage(function (ws) {
          if (!ws.data) {
            NstSvcLogger.debug2('WS | Empty Will Be Routed Message:', ws);

            return;
          }


          if (_.startsWith(ws.data, "PONG!")) {
            return;
          }

          var data = angular.fromJson(ws.data);

          var reqId = data.hasOwnProperty('_reqid') ? data._reqid : 'invalid';
          var qItem = server.queue[reqId];

          if (qItem && !qItem.request.isFinished()) {
            if (qItem.timeoutPromise) {
              $timeout.cancel(qItem.timeoutPromise);
            }
            delete server.queue[reqId];

            switch (data.type) {
              case NST_SRV_MESSAGE_TYPE.RESPONSE:
                var response = new NstResponse(NST_RES_STATUS.UNKNOWN, data.data);
                var status = data.status || data.data.status;
                switch (status) {
                  case NST_SRV_RESPONSE_STATUS.SUCCESS:
                    response.setStatus(NST_RES_STATUS.SUCCESS);
                    qItem.request.finish(response);

                    if (NST_AUTH_COMMAND.indexOf(qItem.request.getMethod()) > -1) {
                      server.dispatchEvent(new CustomEvent(NST_SRV_EVENT.MANUAL_AUTH, {
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
        }.bind(server));

        NstSvcConnectionMonitor.onBreak(function (event) {
          NstSvcLogger.debug2('WS | Closed:', event, this);

          server.authorized = false;
          server.initialized = false;

          server.dispatchEvent(new CustomEvent(NST_SRV_EVENT.UNINITIALIZE));
          // server.stream.reconnect();
        }.bind(server));

        server.stream.onError(function (event) {
          NstSvcLogger.debug2('WS | Error:', event, server);
          server.dispatchEvent(new CustomEvent(NST_SRV_EVENT.ERROR));
        }.bind(server));

        server.addEventListener(NST_SRV_EVENT.MESSAGE, function (event) {
          switch (event.detail) {
            case NST_SRV_MESSAGE.INITIALIZE:
              NstSvcLogger.debug2('WS | Initialized:', event, server);
              server.setInitialized(true);
              server.dispatchEvent(new CustomEvent(NST_SRV_EVENT.INITIALIZE));
              break;
          }
        }.bind(server));

        server.addEventListener(NST_SRV_EVENT.MANUAL_AUTH, function (event) {
          NstSvcLogger.debug2('WS | Dispatching Auth Event', event.detail);
          server.setAuthorized(true);
          server.setSesSecret(event.detail.response.getData()._ss);
          server.setSesKey(event.detail.response.getData()._sk);
          server.dispatchEvent(new CustomEvent(NST_SRV_EVENT.AUTHORIZE));
        });

      }.bind(server);

      var domainName = localStorage.getItem(NST_SERVER_DOMAIN);
      if (domainName) {
        server.remoteDomain = domainName;
        server.remoteMode = true;
      }

      loadConfigFromRemote(domainName ? domainName : NST_CONFIG.DOMAIN)
        .then(function (remoteConfig) {
          var configs = parseConfigFromRemote(remoteConfig);

          NST_CONFIG.WEBSOCKET.URL = configs.websocket;
          NST_CONFIG.REGISTER.URL = configs.register;
          NST_CONFIG.STORE.URL = configs.store;

          server.domain = domainName || NST_CONFIG.DOMAIN;

          server.init(NST_CONFIG.WEBSOCKET.URL);
        })
        .catch(function () {
          loadConfigFromRemote(domainName ? domainName : NST_CONFIG.DOMAIN, true)
            .then(function (remoteConfig) {
              var configs = parseConfigFromRemote(remoteConfig);

              NST_CONFIG.WEBSOCKET.URL = configs.websocket;
              NST_CONFIG.REGISTER.URL = configs.register;
              NST_CONFIG.STORE.URL = configs.store;

              server.domain = domainName || NST_CONFIG.DOMAIN;

              server.init(NST_CONFIG.WEBSOCKET.URL);
            }).catch(function () {
            server.revertConfigs();
            server.init();
          });
        });

    }

    Server.prototype = new NstObservableObject();

    Server.prototype.reinit = function (domain) {
      var server = this;
      var deferred = $q.defer();
      var domainName;

      if (domain) {
        domainName = domain;
        server.remoteDomain = domain;
        server.remoteMode = true;
      } else {
        domainName = server.defaultConfigs.DOMAIN;
        server.revertConfigs();
        server.remoteDomain = domain;
        server.remoteMode = false;
      }

      loadConfigFromRemote(domainName)
        .then(function (remoteConfig) {
            var configs = parseConfigFromRemote(remoteConfig);

            NST_CONFIG.WEBSOCKET.URL = configs.websocket;
            NST_CONFIG.REGISTER.URL = configs.register;
            NST_CONFIG.STORE.URL = configs.store;

            if (domainName === server.domain) {
              deferred.resolve();
            } else {
              server.init(NST_CONFIG.WEBSOCKET.URL);
              server.domain = domainName;
              setTimeout(function () {
                localStorage.setItem(NST_SERVER_DOMAIN, domain ? domain : NST_CONFIG.DOMAIN);
                deferred.resolve();
              }, 500);
            }
          }
        )
        .catch(function () {
          loadConfigFromRemote(domainName, true)
            .then(function (remoteConfig) {
              var configs = parseConfigFromRemote(remoteConfig);

              NST_CONFIG.WEBSOCKET.URL = configs.websocket;
              NST_CONFIG.REGISTER.URL = configs.register;
              NST_CONFIG.STORE.URL = configs.store;

              if (domainName === server.domain) {
                deferred.resolve();
              } else {
                server.init(NST_CONFIG.WEBSOCKET.URL);
                server.domain = domainName;
                setTimeout(function () {
                  localStorage.setItem(NST_SERVER_DOMAIN, domain ? domain : NST_CONFIG.DOMAIN);
                  deferred.resolve();
                }, 500);
              }
            }).catch(function () {
              server.init(server.defaultConfigs.WEBSOCKET_URL);
              server.domain = domainName;
              setTimeout(function () {
                localStorage.setItem(NST_SERVER_DOMAIN, domain ? domain : NST_CONFIG.DOMAIN);
                deferred.resolve();
              }, 500);
          });
        });

      return deferred.promise;
    };

    function parseConfigFromRemote(data) {
      var cyrus = [];
      var xerxes = [];
      var admin = [];
      _.forEach(data, function (configs) {
        var config = configs.split(';');
        _.forEach(config, function (item) {
          if (_.startsWith(item, 'cyrus:')) {
            cyrus.push(item);
          } else if (_.startsWith(item, 'xerxes:')) {
            xerxes.push(item);
          }
          if (_.startsWith(item, 'admin:')) {
            admin.push(item);
          }
        });
      });
      var cyrusHttpUrl = '';
      var cyrusWsUrl = '';
      var xerxesUrl;
      var adminUrl = '';
      var config = {};
      _.forEach(cyrus, function (item) {
        config = parseConfigData(item);
        if (config.protocol === 'http' || config.protocol === 'https') {
          cyrusHttpUrl = getCompleteUrl(config);
        } else if (config.protocol === 'ws' || config.protocol === 'wss') {
          cyrusWsUrl = getCompleteUrl(config);
        }
      });
      xerxesUrl = getCompleteUrl(parseConfigData(xerxes[0]));
      return {
        websocket: cyrusWsUrl + '/api',
        register: cyrusHttpUrl,
        store: cyrusHttpUrl + '/file', //xerxesUrl,
        admin: adminUrl
      }
    }

    function parseConfigData(data) {
      var items = data.split(':');
      return {
        name: items[0],
        protocol: items[1],
        port: items[2],
        url: items[3]
      };
    }

    function getCompleteUrl(config) {
      return config.protocol + '://' + config.url + ':' + config.port;
    }

    Server.prototype.constructor = Server;

    Server.prototype.request = function (action, data, timeout) {
      var service = this;
      var payload = angular.extend(data || {}, {});

      var argCallback = arguments[arguments.length - 1];
      if (_.isFunction(argCallback)) {
        var cacheResult = NstSvcRequestCacheFactory.observeRequest(action, payload);
        argCallback(cacheResult);
      }

      var retryablePromise = NstSvcTry.do(function () {

        var reqId = service.genQueueId(action, data);

        var rawData = {
          _cver: parseInt(NST_CONFIG.APP_VERSION.split('.').join('')),
          _cid: NstSvcClient.getCid(),
          cmd: action,
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
        NstSvcRequestCacheFactory.updateResponse(action, payload, response.getData());
        return $q.resolve(response.getData());
      }).catch(function (response) {
        NstSvcLogger.debug2('WS | Response: ', response);
        // TODO: retry here by creating a new request

        if (response.data.err_code === NST_SRV_ERROR.SESSION_EXPIRE) {
          $rootScope.$broadcast(NST_AUTH_EVENT.SESSION_EXPIRE, {detail: {reason: NST_SRV_ERROR.SESSION_EXPIRE}});
        }

        if (response.data.err_code === NST_SRV_ERROR.ACCESS_DENIED &&
          response.data.items && response.data.items[0] === 'password_change') {
          $rootScope.$broadcast(NST_AUTH_EVENT.CHANGE_PASSWORD, {detail: {reason: NST_SRV_ERROR.ACCESS_DENIED}});
        }


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
            qItem.listenerId = this.addEventListener(NST_SRV_EVENT.INITIALIZE, function () {
              service.sendQueueItem(reqId, timeout);
            }, true);
          }
        } else {
          qItem.listenerId = this.addEventListener(NST_SRV_EVENT.AUTHORIZE, function () {
            service.sendQueueItem(reqId, timeout);
          }, true);
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
            $timeout.cancel(qItem.timeoutPromise);
            delete this.queue[reqId];
            break;

          case NST_REQ_STATUS.CANCELLED:
          case NST_REQ_STATUS.RESPONDED:
            return false;
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
        data['cmd'] = request.method;
        data['_sk'] = this.getSessionKey();
        data['_ss'] = this.getSessionSecret();
        data.data = angular.extend(data.data, this.configs.meta);
        request.setData(data);
      }

      return this.stream.send(angular.toJson(request.getData()));
    };

    Server.prototype.genQueueId = function (action) {
      return 'REQ/' + action.toUpperCase() + '/' + NstSvcRandomize.genUniqId();
    };

    Server.prototype.isInitialized = function () {
      return this.getInitialized();
    };

    Server.prototype.isAuthorized = function () {
      return this.getAuthorized();
    };

    Server.prototype.unauthorize = function () {
      this.setSesKey('');
      this.setSesKey('');
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

    Server.prototype.revertConfigs = function () {

      NST_CONFIG.WEBSOCKET.URL = this.defaultConfigs.WEBSOCKET_URL;
      NST_CONFIG.STORE.URL = this.defaultConfigs.STORE_URL;
      NST_CONFIG.REGISTER.AJAX.URL = this.defaultConfigs.REGISTER_URL;
      NST_CONFIG.ADMIN_DOMAIN = this.defaultConfigs.ADMIN_DOMAIN;
      NST_CONFIG.ADMIN_PORT = this.defaultConfigs.ADMIN_PORT;
      NST_CONFIG.DOMAIN = this.defaultConfigs.DOMAIN;
    };

    function loadConfigFromRemote(domainName, planB) {
      NST_CONFIG.DOMAIN = domainName;
      var ajax;
      if (planB) {
        ajax = new NstHttp(location.protocol + "//" + location.host + '/getConfig/' + domainName);
      } else {
        ajax = new NstHttp('https://npc.nested.me/dns/discover/' + domainName);
      }
      // var ajax = new NstHttp('https://npc.nested.me/dns/discover/nested.me');
      return ajax.get();
    }

    return new Server(NST_CONFIG.WEBSOCKET.URL, {
      requestTimeout: NST_CONFIG.WEBSOCKET.TIMEOUT,
      maxRetries: NST_CONFIG.WEBSOCKET.REQUEST_MAX_RETRY_TIMES,
      meta: {}
    });
  }
})
();
