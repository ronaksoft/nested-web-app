(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedPost', function (WsService, NestedUser, NestedPlace, NestedAttachment, NestedRecipient, $injector, $rootScope, $log) {
      function Post(data, full) {
        this.full = full || false;

        this.id = null;
        this.subject = null;
        this.body = null;
        this.contentType = "text/plain";
        this.sender = null; // <NestedUser>
        this.replyTo = null;
        this.date = null;
        this.updated = null;
        this.attachments = []; // [<NestedAttachment>]
        this.attachmentPreview = false;
        this.comments = []; // [<NestedComment>]
        this.places = []; // [<NestedPlace>]
        this.recipients = []; // [<NestedRecipients>]
        this.spam = 0;
        this.monitored = false;
        this.internal = false;
        this.forwarded = null;
        this.counters = {
          attaches: 0,
          comments: 0,
          replied: 0,
          forwarded: 0,
          size: 0
        };

        if (data) {
          this.setData(data);
        }
      }

      Post.prototype = {
        last_comments: [], // <Comment>

        setData: function(data) {
          if (angular.isString(data)) {
            this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            $log.debug("Post Data:", data);

            this.id = data._id.$oid;
            this.sender = new NestedUser(this.full ? data.sender._id : data.sender);
            this.replyTo = data.replyTo ? new Post(this.full ? data.replyTo : { id: data.replyTo }) : null;
            this.subject = data.subject;
            this.contentType = data.content_type;
            this.body = data.body;
            this.internal = data.internal;
            this.date = new Date(data['time-stamp'] * 1e3);
            this.updated = new Date(data['last-update'] * 1e3);
            this.counters = data.counters;
            this.monitored = data.monitored;
            this.forwarded = data.forwarded ? new Post(this.full ? data.forwarded : { id: data.forwarded }) : null;
            this.spam = data.spam;

            this.places = [];
            for (var k in data.post_places) {
              this.places[k] = new NestedPlace(this.full ? data.post_places[k]._id : { id: data.post_places[k]._id, name: data.post_places[k].name });
            }

            this.attachments = [];
            this.attachmentPreview = false;
            for (var k in data.post_attachments) {
              this.attachments[k] = new NestedAttachment(data.post_attachments[k], this);
              this.attachmentPreview = this.attachmentPreview || !!this.attachments[k].thumbs.x128.uid;
            }

            this.recipients = []; // TODO: ?
            for (var k in data.recipients) {
              this.recipients[k] = new NestedRecipient(data.recipients[k]._id);
            }

            if (this.full) {
              this.loadComments();
            }

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.post);
          }
        },

        loadComments: function (reload) {
          if (this.comments.length > 0 && !reload) {
            return $q(function (resolve) {
              resolve(this.comments);
            }.bind(this));
          }

          return WsService.request('post/get_comments', {
            post_id: this.id
          }).then(function (data) {
            var NestedComment = $injector.get('NestedComment');

            this.comments = [];
            for (var k in data.comments) {
              this.comments.push(new NestedComment(this, data.comments[k]));
            }

            this.change();

            return this.comments;
          }.bind(this));
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id) {
          this.id = id || this.id;

          WsService.request('post/get', { post_id: this.id }).then(this.setData.bind(this));
        },

        delete: function() {
          return WsService.request('post/remove', {
            post_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('post/update', {
            post_id: this.id
          });
        }
      };

      return Post;
    });
})();
