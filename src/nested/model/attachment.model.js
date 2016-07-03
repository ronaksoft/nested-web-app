(function() {
  'use strict';

  angular
    .module('nested')
    .constant('ATTACHMENT_STATUS', {
      UPLOADING: 'uploading',
      ATTACHED: 'attached',
      ABORTED: 'aborted'
    })
    .factory('NestedAttachment', function ($rootScope, $q, $log, _, WsService, NestedPlace, NestedUser, StoreItem, ATTACHMENT_STATUS) {
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
        this.download = new StoreItem(); // StoreItem

        if (data) {
          this.setData(data);
        }
      }

      Attachment.prototype = {
        setData: function(data, post) {
          if (angular.isString(data)) {
            return this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            this.id = data._id;
            this.download = new StoreItem();

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
            this.setData(data.info);
          }

          return $q(function (res) {
            res(this);
          }.bind(this));
        },

        getDownloadUrl: function (view, token) {
          if (!this.download.uid) {
            this.download = new StoreItem(this.id);
          }

          var tkPromise = token ? $q(function (res) { res(this); }.bind(token)) : this.download.store.getDownloadToken(this.post.id, this.id);

          return tkPromise.then(function (newToken) {
            return this.download.getUrl(newToken, view).then(function (url) {
              this.change();

              return $q(function (res) {
                res(url);
              }.bind(this));
            }.bind(this));
          }.bind(this));
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        // make sure is it right to change the status here or not
        setStatus: function (status) {
          this.status = status;
          this.change();
        }.bind(this),

        getClientId: function () {
          if (!this.clientId) {
            this.clientId = _.uniqueId('compose_attach_');
          }
          return this.clientId;
        },

        setUploadCanceler: function(canceler){
          this.canceler = canceler;
        },

        cancelUpload: function(){
          if (this.canceler) {
            this.canceler();
            this.status = ATTACHMENT_STATUS.ABORTED;
            this.change();
          }
        },

        load: function(id) {
          this.id = id || this.id;

          return WsService.request('attachment/get_info', { attachment_id: this.id }).then(this.setData.bind(this));
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
