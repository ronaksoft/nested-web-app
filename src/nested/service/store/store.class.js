(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NestedStore', function ($rootScope, $q, NstSvcServer, $log) {
      function Store(data, full) {
        this.full = full || false;

        this.id = null;
        this.name = null;
        this.url = null;
        this.capacity = -1;

        this.uploadTokens = [];

        if (data) {
          this.setData(data);
        }
      }

      Store.prototype = {
        setData: function(data) {
          if (angular.isString(data)) {
            return this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            this.id = data._id;
            this.name = data.name;
            this.url = data.url;
            this.capacity = data.capacity;

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.store_info);
          }

          return $q(function (res) {
            res(this);
          }.bind(this));
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id) {
          this.id = id || this.id;

          return NstSvcServer.request('store/get_store_info', { store_id: this.id }).then(this.setData.bind(this));
        },

        getUploadToken: function () {
          return NstSvcServer.request('store/get_upload_token').then(function (data) {
            return $q(function (res) {
              res(data.token);
            });
          });
        },

        getDownloadToken: function (pid, uid) {
          return NstSvcServer.request('store/get_download_token', {
            post_id: pid,
            universal_id: uid
          }).then(function (data) {
            return $q(function (res) {
              res(data.token);
            });
          });
        },

        getDownloadUrl: function (uid, token) {
          var url = this.url + '/download/' + NstSvcServer.getSessionKey() + '/' + uid + (token ? ('/' + token) : '');

          return $q(function (res) {
            res(url);
          });
        },

        toString: function () {
          return this.url;
        }
      };

      return Store;
    });

})();
