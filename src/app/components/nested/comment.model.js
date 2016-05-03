/**
 * Created by pouyan on 4/23/16.
 */

(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedComment', function (WsService, NestedUser, NestedPlace, NestedPost, $rootScope, $log) {
      function Comment(post, data, full) {
        this.full = full || false;

        this.post = post ? (post instanceof NestedPost ? post : { id: post }) : null;
        this.id = null;
        this.body = null;
        this.date = null;
        this.attach = null;
        this.contentType = "text/plain";
        this.sender = null;

        if (data) {
          this.setData(data);
        }
      }

      Comment.prototype = {
        setData: function(data, post) {
          if (angular.isString(data)) {
            this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            $log.debug("Comment Data:", data);

            this.id = data._id.$oid;
            this.attach = data.attach;
            this.post = post || (this.post instanceof NestedPost ? this.post : (data.post_id ? new NestedPost(this.full ? data.post_id : { id: data.post_id }) : null));
            this.sender = new NestedUser(data.sender_id);
            this.body = data.text;
            this.date = new Date(data.time * 1e3);

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.comment);
          }
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id, postId) {
          WsService.request('post/get_comment', {
            post_id: postId || this.post.id,
            comment_id: id || this.id
          }).then(this.setData.bind(this));
        },

        delete: function() {
          return WsService.request('post/remove_comment', {
            comment_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('post/update_comment', {
            comment_id: this.id
          });
        }
      };

      return Comment;
    });
})();
