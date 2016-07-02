(function() {
  'use strict';
  angular
    .module('nested')
    .service('PostFactoryService', PostFactoryService);

  /** @ngInject */
  function PostFactoryService($q, $log, _, PostStorageService, WsService,
    NstFactoryError, NstFactoryQuery, NstPost, NstComment) {

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      get: get,
      remove: remove,
      retrieveComments: retrieveComments,
      addComment: addComment,
      removeComment: removeComment,
      getWithComments: getWithComments,
    };

    return service;

    /**
     * anonymous function - retrieve a post by id and store in the related cache storage
     *
     * @param  {int}      id  a post id
     * @return {Promise}      the post
     */
    function get(id) {
      var query = new NstFactoryQuery(id);

      return $q(function(resolve, reject) {
        var post = PostStorageService.get(this.query.id);
        if (post) {
          resolve(post);
        } else {
          WsService.request('post/get', {
            post_id: id
          }).then(function(data) {
            post = new NstPost().create(data.post);
            PostStorageService.set(this.query.id, post);
            resolve(post);
          }.bind({
            query: this.query
          })).catch(function(error) {
            // TODO: Handle error by type
            reject(new NstFactoryError(this.query, error.message, error.err_code));
          }.bind({
            query: this.query
          }));
        }
      }.bind({
        query: query
      }));
    }

    /**
     * anonymous function - remove the post from the place and update the related cache storage
     *
     * @param  {int} id      the post id
     * @param  {int} placeId the place id
     * @return {Promise}     the removed post
     */
    function remove(id, placeId) {
      var query = new NstFactoryQuery(id, {
        placeId: placeId
      });

      return $q(function(resolve, reject) {
        WsService.request('post/remove', {
          post_id: this.query.id,
          place_id: this.query.data.placeId
        }).then(function(data) { //remove the object from storage and return the id
          //TODO : First remove the place from post's places
          //TODO : If the place was the last one, remove the post object
          var post = PostStorageService.get(this.query.id);
          removePlaceFromPost(post, this.query.data.placeId);
          if (post.places.length === 0) { //the last place was removed
            PostStorageService.remove(this.query.id);
          }
          resolve(post);
        }.bind({
          query: this.query
        })).catch(function(error) {
          // TODO: Handle error by type
          reject(new NstFactoryError(this.query, error.message, error.err_code));
        }.bind({
          query: this.query
        }));
      }.bind({
        query: query
      }));
    }

    /**
     * anonymous function - add a comment
     *
     * @param  {NstPost}   post      the post
     * @param  {string}    content   comment body
     * @return {Promise}             the comment
     */
    function addComment(post, content) {
      // var query = new NstFactoryQuery(postId, { txt : content });
      var defer = $q.defer();

      WsService.request('post/add_comment', {
        post_id: post.id,
        txt: content
      }).then(function(data) {
        // FIXME: data must have enough properties to build an instance of NstCommnet
        var comment = new NstComment().create(post, data);
        post.addComments([comment]);
        defer.resolve(post);

      }).catch(function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }

    /**
     * anonymous function - load a bunch of comments according to the provided skip and limit values in settings
     *
     * @param  {int}      id        the post id
     * @param  {object}   settings  all the parameters that will be used to build query for retriving comments
     * @return {Promise}            the comments list
     */
    function retrieveComments(post, settings) {
      var query = new NstFactoryQuery(post.id, {
        skip: settings.skip,
        limit: settings.limit
      });

      // I'm not sure is it correct to store and retrieve an entity like comment
      return $q(function(resolve, reject) {
        WsService.request('post/get_comments', {
          post_id: post.id,
          skip: settings.skip,
          limit: settings.limit
        }).then(function(data) {
          var allCommnets = _.map(data.comments, function (comment) {
            return new NstComment().create(post, comment);
          });
          var comments = _.filter(allCommnets, { 'removed': false });
          post.addComments(comments);

          settings.skip = settings.skip + allCommnets.length;

          resolve(post);
        }.bind({
          query: this.query
        })).catch(function(error) {
          // TODO: Handle error by type
          reject(new NstFactoryError(this.query, error.message, error.err_code));
        }.bind({
          query: this.query
        }));
      }.bind({
        query: query
      }));
    }

    /**
     * anonymous function - remove the comment from list of a post comments
     *
     * @param  {int} id         post id
     * @param  {int} commentId  comment id
     * @return {Promise}        the removed comment
     */
    function removeComment(post, comment) {
      var query = new NstFactoryQuery(post.id, {
        commentId: comment.id
      });

      return $q(function(resolve, reject) {
        WsService.request('post/remove_comment', {
          post_id: post.id,
          comment_id: comment.id
        }).then(function(data) {
          post.removeComment(comment);
          resolve(post);
        }.bind({
          query: this.query
        })).catch(function(error) {
          // TODO: Handle error by type
          reject(new NstFactoryError(this.query, error.message, error.err_code));
        }.bind({
          query: this.query
        }));
      }.bind({
        query: query
      }));
    }

    function getWithComments(postId, commentSettings) {
      var defer = $q.defer();

      get(postId).then(function (post) {
        if (post && post.id){
          retrieveComments(post, commentSettings).then(defer.resolve).catch(defer.reject);
        }
        else {
          defer.reject('could not find a post with provided id.');
        }
      }).catch(defer.reject);

      return defer.promise;
    }


    function removePlaceFromPost(post, placeId) {
      var index = _.indexOf(post.places, {
        'id': placeId
      });
      post.places.splice(index, 1);

      return post;
    }
  }

})();
