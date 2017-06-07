(function() {
  'use strict';

  angular
    .module('ronak.nested.web.file')
    .service('NstSvcStore', NstSvcStore);

  function NstSvcStore($q, $http, $log,
                       _,
                       NST_RES_STATUS, NST_REQ_STATUS, NST_SRV_ERROR, NST_CONFIG, NST_STORE_ROUTE, NST_STORE_ROUTE_PATTERN, NST_STORE_UPLOAD_TYPE, NST_SRV_RESPONSE_STATUS,
                       NstSvcServer, NstSvcDownloadTokenStorage, NstSvcUploadTokenStorage, NstSvcRandomize,
                       NstObservableObject, NstStoreToken, NstRequest, NstResponse, NstHttp) {
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
      if (!token) {
        throw Error("Token is not provided.");
      }
      var routeKey = Object.keys(NST_STORE_ROUTE).filter(function (k) { return route == NST_STORE_ROUTE[k]; }).pop();
      if (!(routeKey && universalId)) {
        return undefined;
      }

      var pattern = NST_STORE_ROUTE_PATTERN[routeKey];
      var replace = {
        BASE_URL: this.url,
        SESSION_KEY: NstSvcServer.getSessionKey(),
        UNIVERSAL_ID: universalId,
        TOKEN: token.string || ''
      };

      for (var k in replace) {
        pattern = pattern.replace('{{' + k + '}}', replace[k]);
      }
      // TODO: Public and private resources must have different url patterns,
      // because the public one does not require a token
      // here, the trailing / will be removed for public resources
      return _.trimEnd(pattern, "/");
    };

    Store.prototype.getViewUrl = function (universalId) {
      if (!universalId) {
        throw Error('universalId is not provided');
      }

      var viewUrl = NST_STORE_ROUTE_PATTERN.VIEW
        .replace("{{BASE_URL}}", this.url)
        .replace("{{SESSION_KEY}}", NstSvcServer.getSessionKey())
        .replace("{{UNIVERSAL_ID}}", universalId)
        .replace("{{TOKEN}}", "");

      return _.trimEnd(viewUrl, '/');
    }

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
        'type': _.values(NST_STORE_UPLOAD_TYPE).indexOf(type) > -1 // type is valid NST_STORE_UPLOAD_TYPE
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

        formData.append('request', JSON.stringify({
          type: 'q',
          cmd: type,
          _sk: NstSvcServer.getSessionKey(),
          data: {
            token: token.string,
            fn: 'attachment'
          }
        }));

        formData.append('attachment', file);

        var ajax = $http({
          method: 'POST',
          url: service.getUrl() + "/upload",
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

    Store.prototype.uploadWithProgress = function (file, onProgress, type, sessionKey) {
      type = type || NST_STORE_UPLOAD_TYPE.FILE;

      var service = this;
      var action = 'upload/' + type;
      var request = new NstRequest(action, {
        file: file,
        type: type
      });

      var q = {
        'file': file instanceof File, // file is File object
        'type': _.values(NST_STORE_UPLOAD_TYPE).indexOf(type) > -1 // type is valid NST_STORE_UPLOAD_TYPE
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

        formData.append('file', file);

        var deferred = $q.defer();

        var xhr = NstHttp.createCORSRequest('POST');

        if (xhr) {
          var url = '{storeUrl}/upload/{type}/{sk}/{token}'
            .replace('{storeUrl}', service.getUrl())
            .replace('{type}', type)
            .replace('{sk}', sessionKey)
            .replace('{token}', token.string);

          xhr.open('POST', url, true);

          xhr.setRequestHeader("Cache-Control", "no-cache");
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.setRequestHeader("X-File-Size", file.size);
          xhr.setRequestHeader("X-File-Type", file.type);

          xhr.upload.onloadstart = function () {
            request.setStatus(NST_REQ_STATUS.SENT);
          };

          if (onProgress) {
            xhr.upload.onprogress = onProgress;
          }

          xhr.upload.onerror = function (event) {
            request.setStatus(NST_REQ_STATUS.CANCELLED);
            deferred.reject(new NstResponse(NST_RES_STATUS.FAILURE, event));
          };

          xhr.onload = function (event) {
            if (200 == event.target.status) {
              var httpData = JSON.parse(event.target.response);
              var data = httpData.data;
              var response = new NstResponse(NST_RES_STATUS.SUCCESS, data);

              switch (httpData.status) {
                case "ok":
                  response.setStatus(NST_RES_STATUS.SUCCESS);
                  deferred.resolve(response);
                  break;

                default:
                  response.setStatus(NST_RES_STATUS.FAILURE);
                  deferred.reject(response);
                  break;
              }
            } else {
              // TODO: Catch here
            }
          };

          xhr.upload.onabort = function (event) {
            request.setStatus(NST_REQ_STATUS.CANCELLED);
            deferred.reject(new NstResponse(NST_RES_STATUS.FAILURE, event));
          };

          request.cancelled().then(function () {
            xhr.abort();
          });

          xhr.send(formData);
        } else {
          deferred.reject(new NstResponse(NST_RES_STATUS.FAILURE, 'CORS is not supported!'));
        }

        return deferred.promise;
      }).then(function (response) {
        request.finish(response);
      }).catch(function (response) {
        request.finish(response);
      });

      return request;
    };

    Store.prototype.cancelUpload = function (request, response) {
      request.setStatus(NST_REQ_STATUS.CANCELLED);
      request.finish(response || new NstResponse());
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

      NstSvcServer.request('file/get_upload_token').then(function(data) {
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

    return new Store(NST_CONFIG.STORE.URL);
  }
})();
