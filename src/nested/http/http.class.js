(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstHttp', NstHttp);

  function NstHttp($q, $http,
                   _,
                   NST_SRV_ERROR, NST_CONFIG, NST_REQ_STATUS, NST_RES_STATUS,
                   NstSvcRandomize,
                   NstObservableObject, NstRequest, NstResponse) {
    function HTTP(route, data, settings) {
      this.route = (0 == route.indexOf('http://')) ? route : (NST_CONFIG.REGISTER.AJAX.URL + route);
      this.data = data;
      this.status = NST_REQ_STATUS.NOT_SENT;
      this.response = new NstResponse();

      this.settings = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      };
      if (angular.isObject(settings)) {
        this.settings = _.defaults(this.settings, settings);
      }

      NstObservableObject.call(this);


      this.finish = function (response) {
        this.setResponse(response);

        if (!this.isFinished()) {
          if (NST_RES_STATUS.UNKNOWN != response.getStatus()) {
            this.setStatus(NST_REQ_STATUS.RESPONDED);
          }

          if (NST_RES_STATUS.SUCCESS == response.getStatus()) {
            deferred.resolve(response);
          } else {
            deferred.reject(response);
          }
        }
      };
    }

    HTTP.prototype = new NstObservableObject();
    HTTP.prototype.constructor = HTTP;

    HTTP.prototype.get = function (data) {
      var me = this;
      var deferred = $q.defer();
      var options = this.settings;
      options.params = data || this.data;

      $http.get(this.route, options).success(function (data, status, header, config) {
        me.setStatus(NST_RES_STATUS.SUCCESS);
        deferred.resolve(data.data);
      }).error(function (error) {
        me.setStatus(NST_RES_STATUS.FAILURE);
        deferred.reject(error);
      });

      return deferred.promise;
    };


    HTTP.prototype.post = function (data) {
      var me = this;
      var deferred = $q.defer();

      $http({
        method: 'POST',
        url: this.route,
        data: data || this.data,
        headers: {
          'Content-Type': undefined
        }
      }).then(function (data) {
        me.setStatus(NST_RES_STATUS.SUCCESS);
        deferred.resolve(data.data);
      }).catch(function (error) {
        me.setStatus(NST_RES_STATUS.FAILURE);
        deferred.reject(error);
      });

      return deferred.promise;
    };


    HTTP.prototype.postJquery = function () {

      var me = this;
      var deferred = $q.defer();

      $.post(
        this.route,
        this.data,
        function (data) {
          me.setStatus(NST_RES_STATUS.SUCCESS);
          deferred.resolve(data.data);
        },
        function (error) {
          me.setStatus(NST_RES_STATUS.FAILURE);
          deferred.reject(error);
        }
      );

      return deferred.promise;
    };

    /*****************************
     *****      Download      ****
     *****************************/

    HTTP.prototype.download = function () {
      var service = this;
      var request = new NstRequest(service.getRoute());

      // Conditions
      var q = {};
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

      var reqId = generateReqId('download/file', service.getRoute());
      request.setStatus(NST_REQ_STATUS.QUEUED);
      request.setData(angular.extend(request.getData() || {}, { reqId: reqId }));

      (function () {
        var ajax = $http({
          method: 'GET',
          responseType: "arraybuffer",
          url: service.getRoute(),
          timeout: request.cancelled()
        }).then(function (httpData) {
          var deferred = $q.defer();

          var data = httpData.data;
          var response = new NstResponse(NST_RES_STATUS.SUCCESS, data);
          deferred.resolve(response);

          return deferred.promise;
        });

        request.setStatus(NST_REQ_STATUS.SENT);

        return ajax;
      })().then(function (response) {
        request.finish(response);
      }).catch(function (response) {
        request.finish(response);
      });

      return request;
    };

    HTTP.prototype.downloadWithProgress = function (onProgress) {
      var service = this;
      var request = new NstRequest(service.getRoute());

      // Conditions
      var q = {};
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

      var reqId = generateReqId('download/file', service.getRoute());
      request.setStatus(NST_REQ_STATUS.QUEUED);
      request.setData(angular.extend(request.getData() || {}, { reqId: reqId }));

      (function () {
        var deferred = $q.defer();

        var xhr = HTTP.createCORSRequest('GET');

        if (xhr) {
          xhr.open('GET', service.getRoute(), true);

          // TODO: Make browser to cache
          // xhr.setRequestHeader("Cache-Control", "max-age=3600");
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.responseType = "arraybuffer";

          xhr.onloadstart = function () {
            request.setStatus(NST_REQ_STATUS.SENT);
          };

          if (onProgress) {
            xhr.onprogress = onProgress;
          }

          xhr.onerror = function (event) {
            request.setStatus(NST_REQ_STATUS.CANCELLED);
            deferred.reject(new NstResponse(NST_RES_STATUS.FAILURE, event));
          };

          xhr.onload = function (event) {
            if (200 == event.target.status) {
              var data = event.target.response;
              var response = new NstResponse(NST_RES_STATUS.SUCCESS, data);
              deferred.resolve(response);
            } else {
              // TODO: Catch here
            }
          };

          xhr.onabort = function (event) {
            request.setStatus(NST_REQ_STATUS.CANCELLED);
            deferred.reject(new NstResponse(NST_RES_STATUS.FAILURE, event));
          };

          request.cancelled().then(function () {
            xhr.abort();
          });

          xhr.send();
        } else {
          deferred.reject(new NstResponse(NST_RES_STATUS.FAILURE, 'CORS is not supported!'));
        }

        return deferred.promise;
      })().then(function (response) {
        request.finish(response);
      }).catch(function (response) {
        request.finish(response);
      });

      return request;
    };

    HTTP.prototype.cancelDownload = function (request, response) {
      request.setStatus(NST_REQ_STATUS.CANCELLED);
      request.finish(response || new NstResponse());
    };

    HTTP.createCORSRequest = function (method) {
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
    };

    function generateReqId(action, name) {
      return 'REQ/' + action.toUpperCase() + '/' + name.toUpperCase() + '/' + NstSvcRandomize.genUniqId();
    }

    return HTTP;
  }
})();
