(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcStore', NstSvcStore);

  function NstSvcStore($q, $http, $log,
                       _,
                       NST_RES_STATUS, NST_REQ_STATUS, NST_SRV_ERROR, NST_CONFIG, NST_STORE_ROUTE, NST_STORE_ROUTE_PATTERN, NST_STORE_UPLOAD_TYPE, NST_SRV_RESPONSE_STATUS,
                       NstSvcServer, NstSvcDownloadTokenStorage, NstSvcUploadTokenStorage, NstSvcRandomize,
                       NstObservableObject, NstStoreToken, NstRequest, NstResponse) {
    /**
     * Creates an instance of NstSvcStore
     *
     * @param {String} url Store's url
     *
     * @constructor
     */
    function Store(url) {
      /**
       * Store's url
       *
       * @type {String}
       */
      this.url = url;

      NstObservableObject.call(this);
    }

    Store.prototype = new NstObservableObject();
    Store.prototype.constructor = Store;

    Store.prototype.resolveUrl = function (route, universalId, token) {
      var routeKey = Object.keys(NST_STORE_ROUTE).filter(function (k) { return route == NST_STORE_ROUTE[k]; }).pop();
      if (!(routeKey && universalId)) {
        return undefined;
      }

      var pattern = NST_STORE_ROUTE_PATTERN[routeKey];
      var replace = {
        BASE_URL: this.url,
        SESSION_KEY: NstSvcServer.getSessionKey(),
        UNIVERSAL_ID: universalId,
        TOKEN: token.getString() || ''
      };

      for (var k in replace) {
        pattern = pattern.replace('{{' + k + '}}', replace[k]);
      }

      return pattern;
    };

    Store.prototype.upload = function(file, type) {
      type = type || NST_STORE_UPLOAD_TYPE.FILE;

      var service = this;
      var action = 'upload/' + type;
      var request = new NstRequest(action, {
        file: file,
        type: type
      });

      var q = {
        'file': file instanceof File, // file is File object
        'type': Object.values(NST_STORE_UPLOAD_TYPE).indexOf(type) > -1 // type is valid NST_STORE_UPLOAD_TYPE
      };
      var issues = [];
      for (var k in q) {
        q[k] || issues.push(k);
      }

      if (issues.length > 0) {
        request.setStatus(NST_REQ_STATUS.CANCELLED);
        request.finish(new NstResponse(NST_RES_STATUS.FAILURE, {
          err_code: NST_SRV_ERROR.INVALID,
          items: issues
        }));

        return request;
      }

      var reqId = generateReqId('upload/' + type, file.name);
      request.setStatus(NST_REQ_STATUS.QUEUED);
      request.setData(angular.extend(request.getData(), { reqId: reqId }));

      getUploadToken().catch(function (error) {
        var deferred = $q.defer();
        // TODO: Check for what to be passed as response data
        var response = new NstResponse(NST_RES_STATUS.FAILURE, error);
        deferred.reject(response);

        return deferred.promise;
      }).then(function (token) {
        var formData = new FormData();
        formData.append('cmd', type);
        formData.append('_sk', NstSvcServer.getSessionKey());
        formData.append('token', token.getString());
        formData.append('fn', 'attachment');
        formData.append('attachment', file);
        formData.append('_reqid', reqId);

        var ajax = $http({
          method: 'POST',
          url: service.getUrl(),
          data: formData,
          headers: {
            'Content-Type': undefined
          },
          timeout: request.cancelled()
        }).then(function (httpData) {
          var deferred = $q.defer();
          var data = httpData.data.data;
          var response = new NstResponse(NST_RES_STATUS.UNKNOWN, data);

          switch (data.status) {
            case NST_SRV_RESPONSE_STATUS.SUCCESS:
              response.setStatus(NST_RES_STATUS.SUCCESS);
              deferred.resolve(response);
              break;

            default:
              response.setStatus(NST_RES_STATUS.FAILURE);
              deferred.reject(response);
              break;
          }

          return deferred.promise;
        });

        request.setStatus(NST_REQ_STATUS.SENT);

        return ajax;
      }).then(function (response) {
        request.finish(response);
      }).catch(function (response) {
        request.finish(response);
      });

      return request;
    };

    Store.prototype.uploadWithProgress = function (file, onProgress, type) {

    };

    Store.prototype.uploadWithProgressOld = function(settings) {
      var defer = $q.defer;

      var defaultSettings = {
        file: null,
        req_id: null,
        token: null,
        _sk: NstSvcServer.getSessionKey(),
        fn: 'attachment',
        cmd: NST_STORE_UPLOAD_TYPE.FILE,
        onStart: null,
        onProgress: null,
        onError: null,
        onUploaded: null,
        onAborted: null,
      };

      settings = _.defaults(settings, defaultSettings);

      var q = {
        'file': settings.file instanceof File,
        'type': (Object.keys(NST_STORE_UPLOAD_TYPE).map(function (k) {
          return NST_STORE_UPLOAD_TYPE[k];
        })).indexOf(settings.cmd) > -1
      };
      var items = [];
      for (var k in q) {
        q[k] || items.push(k);
      }

      if (items.length > 0) {
        return {
          result: $q(function (res, rej) {
            rej({
              err_code: NST_SRV_ERROR.INVALID,
              items: items
            });
          })
        };
      }

      return this.getUploadToken().then(function (token) {
        settings.token = token;

        var formData = new FormData();
        formData.append('cmd', settings.cmd);
        formData.append('_sk', settings._sk);
        formData.append('token', settings.token.getString());
        formData.append('fn', settings.fn);
        formData.append('attachment', settings.file);
        formData.append('_reqid', settings._reqid);

        var defer = $q.defer();

        var xhr = createCORSRequest('POST');

        if (!xhr) {
          return {
            result: defer.reject('CORS is not supported!')
          };
        }

        xhr.open('POST', this.url, true);

        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("X-File-Size", settings.file.size);
        xhr.setRequestHeader("X-File-Type", settings.file.type);

        xhr.upload.onloadstart = settings.onStart;
        xhr.upload.onprogress = settings.onProgress;

        xhr.upload.onerror = function (e) {
          defer.reject(e);
          if (settings.onError) {
            settings.onError(e);
          }
        };

        xhr.onload = function (e) {
          if (e.target.status === 200) {
            var data = JSON.parse(e.target.response);
            defer.resolve(data);
            if (settings.onUploaded) {
              settings.onUploaded(data);
            }
          }
        };

        xhr.upload.onabort = function (e) {
          defer.reject(e);
          if (settings.onAborted) {
            settings.onAborted(e);
          }
        };

        function startUpload() {
          xhr.send(formData);
          return defer.promise;
        }

        function abortUpload() {
          xhr.abort();
        }

        return {
          result: defer.promise,
          start: startUpload,
          abort: abortUpload
        };

      }.bind(this));
    };

    Store.prototype.cancelUpload = function (request, response) {

    };

    function getUploadToken() {
      var defer = $q.defer();
      var tokenKey = 'default-upload-token';

      var token = NstSvcUploadTokenStorage.get(tokenKey);
      if (!token || token.isExpired()) {
        NstSvcUploadTokenStorage.remove(tokenKey);
        requestNewUploadToken(tokenKey).then(defer.resolve).catch(defer.reject);
      } else {
        defer.resolve(token);
      }

      return defer.promise;
    }

    function requestNewUploadToken(storageKey) {
      var deferred = $q.defer();

      NstSvcServer.request('store/get_upload_token').then(function(data) {
        var token = createToken(data.token);
        NstSvcDownloadTokenStorage.set(storageKey, token);
        deferred.resolve(token);
      }).catch(function(error) {
        // TODO: Reject with StoreError(StoreQuery) Object
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function createToken(rawToken) {
      // TODO: Read expiration date from token itself
      return new NstStoreToken(rawToken, new Date(Date.now() + 3600));
    }

    function generateReqId(action, name) {
      return 'REQ/' + action.toUpperCase() + '/' + name.toUpperCase() + '/' + NstSvcRandomize.genUniqId();
    }

    function createCORSRequest(method) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
      } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
      } else {
        // CORS not supported.
        xhr = null;
      }
      return xhr;
    }

    return new Store(NST_CONFIG.STORE.URL);
  }
})();
