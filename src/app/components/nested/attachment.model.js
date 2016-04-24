(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedAttachment', function (WsService, NestedPlace, NestedUser) {
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
          x32: null,
          x64: null,
          x128: null
        };
        this.url = null;

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
            this.id = data._id;
            this.downloads = data.downloads;
            this.filename = data.filename;
            this.mimeType = data.mimetype;
            this.size = data.size;
            this.status = data.status;
            this.storeId = data.store_id;
            this.thumbs = data.thumbs;
            this.uploadTime = new Date(data.upload_time * 1e3);
            this.uploader = new NestedUser(data.uploader);

            this.owners = [];
            if (angular.isArray(data.owners)) {
              if (this.full) {
                for (var k in data.owners) {
                  this.owners[k] = new NestedPlace(data.owners[k]);
                }
              } else {
                this.owners = data.owners;
              }
            }
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info)
          }
        },

        load: function(id) {
          id = id || this.id;

          WsService.request('attachment/get_info', {
            attachment_id: id
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
