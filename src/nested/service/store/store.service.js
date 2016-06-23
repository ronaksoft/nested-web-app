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
  function NestedStore($window, $rootScope, $q, $http, $sce, WsService, WS_RESPONSE_STATUS, WS_ERROR, UPLOAD_TYPE, NestedStore) {
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

      upload2: function (file, type, id, onUploadStart) {
        type = type || UPLOAD_TYPE.FILE;

        var q = {
          'file': file instanceof File,
          'type': (Object.keys(UPLOAD_TYPE).map(function(k) { return UPLOAD_TYPE[k]; })).indexOf(type) > -1
        };
        var items = [];
        for (var k in q) {
          q[k] || items.push(k);
        }

        if (items.length > 0) {
          return $q(function (res, rej) {
            rej({
              err_code: WS_ERROR.INVALID,
              items: items
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

          onUploadStart(canceler);

          var defer = $q.defer();

          makeCorsRequest(this.defaultStore.url, formData, file);

          return defer.promise;

        }.bind(this));
      }
    };

    // Create the XHR object.
    function createCORSRequest(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        // xhr.open(method, url, true);
      } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        // xhr.open(method, url);
      } else {
        // CORS not supported.
        xhr = null;
      }
      return xhr;
    }

    // Make the actual CORS request.
    function makeCorsRequest(url, form, file) {

      var xhr = createCORSRequest('POST', url);
      if (!xhr) {
        alert('CORS not supported');
        return;
      }


      // Response handlers.
      // xhr.onload = function() {
      //   console.log('response', xhr.responseText);
      // };

      // if (xhr.upload) {
        xhr.upload.onprogress = function (progressEvent) {
          if (progressEvent.lengthComputable) {
            var percentComplete = progressEvent.loaded / progressEvent.total;
            console.log(percentComplete);
          } else {
            console.log('unable to compute');
            // Unable to compute progress information since the total size is unknown
          }
        }
      // }

      xhr.onerror = function() {
        console.log('Woops, there was an error making the request.');
      };

      xhr.open('POST', url, true);

      xhr.upload.onprogress = function (progressEvent) {
        if (progressEvent.lengthComputable) {
          var percentComplete = progressEvent.loaded / progressEvent.total;
          console.log(percentComplete);
        } else {
          console.log('unable to compute');
          // Unable to compute progress information since the total size is unknown
        }
      }

      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("X-File-Size", file.size);
      xhr.setRequestHeader("X-File-Type", file.type);
      xhr.setRequestHeader("Content-Type", "multipart/form-data");

      xhr.send(form);
    }

    var stores = $window.sessionStorage.getItem('stores');
    var service = new StoreService(stores ? angular.fromJson(stores) : undefined);
    service.update().then(function (data) {
      $window.sessionStorage.setItem('stores', angular.toJson(service.stores));
    });

    return service;
  }

})();
