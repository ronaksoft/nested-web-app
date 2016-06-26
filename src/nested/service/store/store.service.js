(function() {
  'use strict';

  angular
    .module('nested')
    .constant('UPLOAD_TYPE', {
      FILE: 'upload/file',
      PLACE_PICTURE: 'upload/place_pic',
      PROFILE_PICTURE: 'upload/profile_pic'
    }).factory('StoreService', NestedStore);

  /** @ngInject */
  function NestedStore($window, $rootScope, $q, $http, $sce, $log, WsService, WS_RESPONSE_STATUS, WS_ERROR, UPLOAD_TYPE, NestedStore) {
    function StoreService(stores) {
      this.stores = {};
      this.defaultStore = new NestedStore();

      if (angular.isArray(stores) || angular.isObject(stores)) {
        for (var k in stores) {
          this.stores[stores[k].id] = new NestedStore(stores[k]);
        }
      }
    }

    StoreService.prototype = {
      toUrl: function (uid, token) {
        return this.getStoreByUid(uid).then(function (store) {
          return store.getDownloadUrl(uid, token).then(function (url) {
            this.change();

            return $q(function (res) {
              res(url);
            });
          }.bind(this));
        }.bind(this));
      },

      getStore: function (sid) {
        if (!this.stores.hasOwnProperty(sid)) {
          this.stores[sid] = (new NestedStore()).setData(sid).then(function (store) {
            this.stores[store.id] = store;
            this.change();

            return $q(function (res) {
              res(store);
            })
          }.bind(this));
        }

        if (this.stores[sid] instanceof Promise) {
          return this.stores[sid];
        }

        return $q(function (res) {
          res.call(this, this.stores[sid]);
        }.bind(this));
      },

      getStoreByUid: function (uid) {
        return this.getStore(uid.substr(0, 7));
      },

      update: function () {
        return WsService.request('store/get_store').then(function (data) {
          var storeIds = angular.isArray(data.store_id) ? data.store_id : [data.store_id];
          var response = {
            resolve: function () {},
            reject: function () {}
          };
          var counter = 0;
          for (var k in storeIds) {
            var sid = storeIds[k];
            counter++;

            this.getStore(sid).then(function (store) {
              this.defaultStore.id || this.defaultStore.setData(store);

              if (0 === --counter) {
                response.resolve(this.stores);
              }
            }.bind(this));
          }

          return $q(function (res, rej) {
            response.resolve = res || response.resolve;
            response.reject = rej || response.reject;
          });
        }.bind(this));
      },

      change: function () {
        if(!$rootScope.$$phase) {
          $rootScope.$digest()
        }
      },

      upload: function (file, type, id, onUploadStart) {
        type = type || UPLOAD_TYPE.FILE;

        var q = {
          'file': file instanceof File, // file is File object
          'type': (Object.keys(UPLOAD_TYPE).map(function(k) { return UPLOAD_TYPE[k]; })).indexOf(type) > -1 // type is valid UPLOAD_TYPE
        };
        var issues = [];
        for (var k in q) {
          q[k] || issues.push(k);
        }

        if (issues.length > 0) {
          return $q(function (res, rej) {
            rej({
              err_code: WS_ERROR.INVALID,
              items: issues
            });
          });
        }

        return this.defaultStore.getUploadToken().then(function (token) {
          var formData = new FormData();
          formData.append('cmd', type);
          formData.append('_sk', WsService.getSessionKey());
          formData.append('token', token);
          formData.append('fn', 'attachment');
          formData.append('attachment', file);
          formData.append('_reqid', id || null);

          var canceler = $q.defer();

          if (onUploadStart instanceof Function) {
            onUploadStart(canceler);
          }

          return $http({
            method: 'POST',
            url: this.defaultStore.url,
            data: formData,
            headers: {
              'Content-Type': undefined
            },
            timeout: canceler.promise
          }).then(function (response) {
            var data = response.data.data;

            return $q(function (res, rej) {
              switch (data.status) {
                case WS_RESPONSE_STATUS.SUCCESS:
                  res(data);
                  break;
                default:
                  rej(data);
                  break;

              }
            });
          });

        }.bind(this));
      },

      uploadWithProgress: function (settings) {
        var defer = $q.defer;

        var defaultSettings = {
          file : null,
          req_id : null,
          token : null,
          _sk : WsService.getSessionKey(),
          fn : 'attachment',
          cmd : UPLOAD_TYPE.FILE,
          onStart : null,
          onProgress : null,
          onError : null,
          onUploaded : null,
          onAborted : null,
        };

        settings = _.defaults(settings, defaultSettings);

        var q = {
          'file': settings.file instanceof File,
          'type': (Object.keys(UPLOAD_TYPE).map(function(k) { return UPLOAD_TYPE[k]; })).indexOf(settings.cmd) > -1
        };
        var items = [];
        for (var k in q) {
          q[k] || items.push(k);
        }

        if (items.length > 0) {
          return {
            result : $q(function (res, rej) {
              rej({
                err_code: WS_ERROR.INVALID,
                items: items
              });
            })
          };
        }

        return this.defaultStore.getUploadToken().then(function (token) {
          settings.token = token;

          var formData = new FormData();
          formData.append('cmd', settings.cmd);
          formData.append('_sk', settings._sk);
          formData.append('token', settings.token);
          formData.append('fn', settings.fn);
          formData.append('attachment', settings.file);
          formData.append('_reqid', settings._reqid);

          var defer = $q.defer();

          var xhr = createCORSRequest('POST');

          if (!xhr) {
            return {
              result : defer.reject('CORS is not supported!')
            };
          }

          xhr.open('POST',  this.defaultStore.url, true);

          xhr.setRequestHeader("Cache-Control", "no-cache");
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.setRequestHeader("X-File-Size", settings.file.size);
          xhr.setRequestHeader("X-File-Type", settings.file.type);

          xhr.upload.onloadstart = settings.onStart;
          xhr.upload.onprogress = settings.onProgress;

          xhr.upload.onerror = function (e) {
            defer.reject(e);
            if (settings.onError){
              settings.onError(e);
            }
          };

          xhr.onload = function (e) {
            if (e.target.status === 200){
              var data = JSON.parse(e.target.response);
              defer.resolve(data);
              if (settings.onUploaded) {
                settings.onUploaded(data);
              }
            }
          };

          xhr.upload.onabort = function (e) {
            defer.reject(e);
            if (settings.onAborted){
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
            result : defer.promise,
            start : startUpload,
            abort : abortUpload,
          };

        }.bind(this));
      }
    };

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

    var stores = $window.sessionStorage.getItem('stores');
    var service = new StoreService(stores ? angular.fromJson(stores) : undefined);
    service.update().then(function (data) {
      $window.sessionStorage.setItem('stores', angular.toJson(service.stores));
    });

    return service;
  }

})();
