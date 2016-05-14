(function() {
  'use strict';

  angular
    .module('nested')
    .constant('UPLOAD_TYPE', {
      FILE: 'upload/file',
      PLACE_PICTURE: 'upload/file',
      PROFILE_PICTURE: 'upload/file'
    })
    .factory('StoreService', NestedStore);

  /** @ngInject */
  function NestedStore($window, $rootScope, $q, $http, WsService, WS_RESPONSE_STATUS, WS_ERROR, UPLOAD_TYPE, NestedStore) {
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
        var sid = uid.substr(0, 7);

        return this.getStore(sid).then(function (store) {
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

      upload: function (file, type) {
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
          console.log('File', file);
          var formData = new FormData();
          formData.append('cmd', type);
          formData.append('_sk', WsService.getSessionKey());
          formData.append('token', token);
          formData.append('fn', 'attachment');
          formData.append('attachment', file);

          return $http.post(this.defaultStore.url, formData, {
            headers: {'Content-Type': undefined}
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
      }
    };

    var stores = $window.sessionStorage.getItem('stores');
    var service = new StoreService(stores ? angular.fromJson(stores) : undefined);
    service.update().then(function (data) {
      $window.sessionStorage.setItem('stores', angular.toJson(service.stores));
    });

    return service;
  }

})();
