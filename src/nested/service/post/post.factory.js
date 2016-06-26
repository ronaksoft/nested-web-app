(function() {
  'use strict';
  angular.module('nested').service('PostFactory', PostFactory);

  function PostFactory(PostStorageService, CommentStorageService, WsService, NestedPost) {

  }

  PostFactory.prototype = {
    get: function (id) {
      return $q(function (resolve, reject) {
        var post = PostStorageService.get(id);
        if (post) {
          resolve(post);
        } else {
          WsService.request('post/get', { post_id: id }).then(function (response) {
            post = new NestedPost(response.data);
            PostStorageService.add(post);
            resolve(post);
          }).catch(function (error) {
            // TODO: Nested Error
            reject(error);
          });
        }
      });
    },
    remove: function (id, placeId) {
      return $q(function (resolve, reject) {
        WsService.request('post/remove', {
          post_id: postId,
          place_id: placeId
        }).then(function (response) { //remove the object from storage and return the id
          //TODO : First remove the place from post's places
          //TODO : If the place was the last one, remove the post object
          var post = PostStorageService.get(id);
          removePlaceFromPost(post, placeId);
          if (post.places.length === 0){ //the last place was removed
            PostStorageService.remove(id);
          }
          resolve(post);
        }).catch(function (error) {
          // TODO : Nested Error
          reject(error);
        });
      });
    },
    getComments: function (id, skip, limit) {
      // I'm not sure is it correct to store and retrieve an entity like comment
      return $q(function (resolve, reject) {
        WsService.request('post/get_comments', {
          post_id: id,
          skip: skip,
          limit: limit
        }).then(function (response) {
          var comments = _.map(_.filter(response.data, { 'removed' : false }), function (comment) {
            return new NestedComment(comment);
          });
          resolve(comments);
        }).catch(function (error) {
          // TODO: NestedError
          reject(error);
        });
      });
    },
    removeComment: function (id, commentId) {
      return $q(function (resolve,reject) {
        WsService.request('post/remove_comment', {
          post_id: id,
          comment_id: commentId
        }).then(function (response) {
          resolve(true);
        }).catch(function (error) {
          // TODO: NestedError
          reject(error);
        });
      });
    }
  };

  function removePlaceFromPost(post, placeId) {
    var index = _.indexOf(post.places, { 'id' : placeId });
    post.places.splice(index, 1);

    return post;
  }

})();
