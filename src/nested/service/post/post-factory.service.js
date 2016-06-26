(function() {
  'use strict';
  angular
    .module('nested')
    .service('PostFactoryService', PostFactoryService);

  /** @ngInject */
  function PostFactoryService($q, _,
                              PostStorageService, WsService,
                              NstFactoryError, NstFactoryQuery, NestedPost) {
    function PostFactory() {

    }

    function removePlaceFromPost(post, placeId) {
      var index = _.indexOf(post.places, { 'id' : placeId });
      post.places.splice(index, 1);

      return post;
    }

    PostFactory.prototype = {
      get: function (id) {
        var query = new NstFactoryQuery(id);

        return $q(function (resolve, reject) {
          var post = PostStorageService.get(this.query.id);
          if (post) {
            resolve(post);
          } else {
            WsService.request('post/get', { post_id: id }).then(function (response) {
              post = new NestedPost(response.data);
              PostStorageService.set(this.query.id, post);
              resolve(post);
            }.bind({ query: this.query })).catch(function (error) {
              // TODO: Handle error by type
              reject(new NstFactoryError(this.query, error.message, error.err_code));
            }.bind({ query: this.query }));
          }
        }.bind({ query: query }));
      },

      remove: function (id, placeId) {
        var query = new NstFactoryQuery(id, { placeId: placeId });

        return $q(function (resolve, reject) {
          WsService.request('post/remove', {
            post_id: this.query.id,
            place_id: this.query.data.placeId
          }).then(function (response) { //remove the object from storage and return the id
            //TODO : First remove the place from post's places
            //TODO : If the place was the last one, remove the post object
            var post = PostStorageService.get(this.query.id);
            removePlaceFromPost(post, this.query.data.placeId);
            if (post.places.length === 0) { //the last place was removed
              PostStorageService.remove(this.query.id);
            }
            resolve(post);
          }.bind({ query: this.query })).catch(function (error) {
            // TODO: Handle error by type
            reject(new NstFactoryError(this.query, error.message, error.err_code));
          }.bind({ query: this.query }));
        }.bind({ query: query }));
      },

      getComments: function (id, skip, limit) {
        var query = new NstFactoryQuery(id, { skip: skip, limit: limit });

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
          }.bind({ query: this.query })).catch(function (error) {
            // TODO: Handle error by type
            reject(new NstFactoryError(this.query, error.message, error.err_code));
          }.bind({ query: this.query }));
        }.bind({ query: query }));
      },

      removeComment: function (id, commentId) {
        var query = new NstFactoryQuery(id, { commentId: commentId });

        return $q(function (resolve,reject) {
          WsService.request('post/remove_comment', {
            post_id: id,
            comment_id: commentId
          }).then(function (response) {
            resolve(true);
          }.bind({ query: this.query })).catch(function (error) {
            // TODO: Handle error by type
            reject(new NstFactoryError(this.query, error.message, error.err_code));
          }.bind({ query: this.query }));
        }.bind({ query: query }));
      }
    };

    return new PostFactory();
  }
})();
