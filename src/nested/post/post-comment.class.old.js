/**
 * Created by pouyan on 4/23/16.
 */
(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedComment', function ($rootScope, $q, $log, WsService, NestedUser, NestedPlace, NestedPost) {
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
            return this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            this.id = data._id.$oid;
            this.attach = data.attach;
            this.post = post || (this.post instanceof NestedPost ? this.post : (data.post_id ? new NestedPost(this.full ? data.post_id : { id: data.post_id }) : null));
            this.sender = new NestedUser({
              _id: data.sender_id,
              fname: data.sender_fname,
              lname: data.sender_lname,
              picture: data.sender_picture
            });
            this.body = data.text;
            this.date = new Date(data.time * 1e3);

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.comment);
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

        load: function(id, postId) {
          return WsService.request('post/get_comment', {
            post_id: postId || this.post.id,
            comment_id: id || this.id
          }).then(this.setData.bind(this));
        },

        delete: function() {
          if (Date.now() - this.date.getTime() < 20 * 60 * 1e3) {
            return WsService.request('post/remove_comment', {
              post_id: this.post.id,
              comment_id: this.id
            }).then(function () {
              this.post.deleteComment(this);
            }.bind(this));
          }
        },

        update: function() {
          if (this.id) {
            // TODO: Check API
          }
        }
      };

      return Comment;
    });
})();
