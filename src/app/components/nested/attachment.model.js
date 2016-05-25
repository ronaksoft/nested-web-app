(function() {
  'use strict';

  angular
    .module('nested')
    .constant('ATTACHMENT_STATUS', {
      ATTACHED: 'attached'
    })
    .factory('NestedAttachment', function ($rootScope, $q, $log, WsService, NestedPlace, NestedUser, StoreItem) {
      function Attachment(data, post, full) {
        this.full = full || false;

        this.id = null;
        this.post = post || null;
        this.storeId = null;
        this.downloads = -1;
        this.size = 0;
        this.status = null;
        this.mimeType = null;
        this.filename = null;
        this.uploadTime = null;
        this.owners = []; // [<Place>]
        this.uploader = null; // <User>
        this.thumbs = {
          x32: new StoreItem(),
          x64: new StoreItem(),
          x128: new StoreItem()
        };
        this.download = null; // StoreItem

        if (data) {
          this.setData(data);
        }
      }

      Attachment.prototype = {
        setData: function(data, post) {
          if (angular.isString(data)) {
            this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);
          } else if (data.hasOwnProperty('_id')) {
            $log.debug('Attachment Data:', data);
            this.id = data._id;
            this.download = null;

            this.downloads = data.downloads;
            this.filename = data.filename;
            this.mimeType = data.mimetype;
            this.size = data.size;
            this.status = data.status;
            this.storeId = data.store_id;
            this.uploadTime = new Date(data.upload_time * 1e3);
            this.uploader = new NestedUser({ username: data.uploader });
            if (data.thumbs) {
              this.thumbs = {
                x32: new StoreItem(data.thumbs.x32),
                x64: new StoreItem(data.thumbs.x64),
                x128: new StoreItem(data.thumbs.x128)
              };
            }

            this.owners = [];
            if (angular.isArray(data.owners)) {
              for (var k in data.owners) {
                this.owners[k] = new NestedPlace(this.full ? data.owners[k] : { id: data.owners[k] });
              }
            }

            if (this.full) {
              this.getDownloadUrl();
            }

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info)
          }
        },

        getDownloadUrl: function () {
          if (this.download) {
            return $q(function (resolve) {
              resolve(this);
            }.bind(this));
          }

          return WsService.request('store/get_download_token', {
            post_id: this.post && this.post.id,
            universal_id: this.id
          }).then(function (data) {
            this.download = new StoreItem(this.id, data.token);
            this.download.getUrl().then(this.change);

            return this;
          }.bind(this));
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id) {
          this.id = id || this.id;

          WsService.request('attachment/get_info', {
            attachment_id: this.id
          }).then(function (data) {
            this.setData(data);
          }.bind(this));
        },

        delete: function() {
          return WsService.request('attachment/remove', {
            post_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('attachment/update', {
            post_id: this.id
          });
        }
      };

      return Attachment;
    });
})();
