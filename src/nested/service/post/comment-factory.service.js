(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcCommentFactory', NstSvcCommentFactory);

  /** @ngInject */
  function NstSvcCommentFactory($q, $log,
    _,
    NstSvcPostStorage, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentStorage, NstObservableObject, NstFactoryEventData,
    NstFactoryError, NstFactoryQuery, NstPost, NstComment, NstTinyComment, NstUser, NstTinyUser, NstPicture, NST_COMMENT_FACTORY_EVENT) { // TODO: It should not inject any model, ask the factory to create the model

    function CommentFactory() {

    }

    CommentFactory.prototype = new NstObservableObject();
    CommentFactory.prototype.constructor = CommentFactory;

    CommentFactory.prototype.getComment = getComment;
    CommentFactory.prototype.addComment = addComment;
    CommentFactory.prototype.removeComment = removeComment;
    CommentFactory.prototype.retrieveComments = retrieveComments;
    CommentFactory.prototype.createCommentModel = createCommentModel;
    CommentFactory.prototype.parseComment = parseComment;
    CommentFactory.prototype.parseMessageComment = parseMessageComment;

    return new CommentFactory();

    /*********************
     *  Implementations  *
     *********************/

    function getComment(commentId, PostId) {
      var query = new NstFactoryQuery(commentId, {
        postId: PostId
      });

      var defer = $q.defer();

      if (!query.id) {
        defer.resolve(null);
      } else {

        // var comment = NstSvcCommentStorage.get(query.id, query.postId);
        // if (comment) {
        //   defer.resolve(comment);
        // } else {
          NstSvcServer.request('post/get_comment', {
            comment_id: query.id,
            post_id: query.data.postId
          }).then(function(data) {
            return parseComment(data.comment);
          }).then(function(comment) {
            // NstSvcCommentStorage.set(query.id, comment);
            defer.resolve(comment);
          }).catch(function(error) {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        // }
      }

      return defer.promise;
    }

    /**
     * anonymous function - add a comment
     *
     * @param  {NstPost}   post      the post
     * @param  {String}    content   comment body
     *
     * @returns {Promise}             the comment
     */
    function addComment(post, content) {
      var defer = $q.defer();

      NstSvcServer.request('post/add_comment', {
        post_id: post.id,
        txt: content
      }).then(function(data) {
        var commentId = data.comment_id.$oid;
        return getComment(commentId, post.id);
      }).then(function (comment) {
        post.addComment(comment);
        NstSvcPostStorage.set(post.id, post);
        defer.resolve(post);
        // dispatchEvent(new CustomEvent(NST_COMMENT_FACTORY_EVENT.COMMENT_ADDED, new NstFactoryEventData(post)));
      }).catch(defer.reject);

      return defer.promise;
    }

    /**
     * anonymous function - load a bunch of comments according to the provided skip and limit values in settings
     *
     * @param  {int}  id        the post id
     * @param  {{}}   settings  all the parameters that will be used to build query for retrieving comments
     *
     * @returns {Promise}            the comments list
     */
    function retrieveComments(post, settings) {
      var query = new NstFactoryQuery(post.id, {
        skip: settings.skip,
        limit: settings.limit
      });

      // I'm not sure is it correct to store and retrieve an entity like comment
      return $q(function(resolve, reject) {
        NstSvcServer.request('post/get_comments', {
          post_id: post.id,
          skip: settings.skip,
          limit: settings.limit
        }).then(function(data) {
          var allCommnets = _.map(data.comments, function(comment) {
            return parseComment(comment, post);
          });
          var comments = _.filter(allCommnets, {
            'removed': false
          });
          post.addComments(comments);

          settings.skip = settings.skip + allCommnets.length;

          resolve(post);
        }.bind({
          query: this.query
        })).catch(function(error) {
          // TODO: Handle error by type
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
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
     *
     * @return {Promise}        the removed comment
     */
    function removeComment(post, comment) {
      var query = new NstFactoryQuery(post.id, {
        commentId: comment.id
      });

      return $q(function(resolve, reject) {
        NstSvcServer.request('post/remove_comment', {
          post_id: post.id,
          comment_id: comment.id
        }).then(function(data) {
          post.removeComment(comment);
          resolve(post);
        }.bind({
          query: this.query
        })).catch(function(error) {
          // TODO: Handle error by type
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        }.bind({
          query: this.query
        }));
      }.bind({
        query: query
      }));
    }

    function createCommentModel(model) {
      return new NstComment(model);
    }

    function parseComment(data, post) {
      var comment = new NstComment();

      var defer = $q.defer();

      if (!data) {
        defer.resolve(comment);
      } else {

        comment.id = data._id.$oid;
        comment.attach = data.attach;
        comment.post = post;
        comment.sender = new NstTinyUser({
          id: data.sender_id,
          firstName: data.sender_fname,
          lastName: data.sender_lname,
          picture: data.sender_picture
        });
        comment.body = data.text;
        comment.date = new Date(data['timestamp']);
        comment.removed = data._removed;
        defer.resolve(comment);

      }

      return defer.promise;
    }

    function parseMessageComment(data) {
      var defer = $q.defer();
      var comment = createCommentModel();
      if (!data) {
        defer.resolve(comment);
      } else {
        comment.id = data.comment_id.$oid;
        comment.body = data.text;
        comment.date = new Date(data.timestamp);
        comment.removed = data._removed;

        NstSvcUserFactory.get(data.sender_id).then(function(sender) {
          comment.sender = sender;

          defer.resolve(comment);
        }).catch(defer.reject);
      }

      return defer.promise;
    }

  }

})();
