(function() {
  'use strict';
  angular
    .module('ronak.nested.web.comment')
    .service('NstSvcCommentFactory', NstSvcCommentFactory);

  /** @ngInject */
  function NstSvcCommentFactory($q, $log,
    _,
    NST_COMMENT_EVENT, NST_SRV_EVENT, NST_EVENT_ACTION,
    NstSvcPostStorage, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentStorage,
    NstFactoryEventData, NstFactoryError, NstFactoryQuery, NstPost, NstComment, NstTinyComment, NstUser, NstTinyUser, NstBaseFactory) {

    function CommentFactory() {
      var factory = this;

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function(event) {
        var tlData = event.detail.timeline_data;

        switch (tlData.action) {
          case NST_EVENT_ACTION.COMMENT_ADD:
            var postId = tlData.post_id.$oid;
            var commentId = tlData.comment_id.$oid;

            factory.getComment(commentId, postId).then(function(comment) {
              factory.dispatchEvent(new CustomEvent(
                NST_COMMENT_EVENT.ADD, {
                  detail: {
                    id: commentId,
                    postId: postId,
                    comment: comment,
                    internal: false
                  }
                }
              ));
            });
            break;

          case NST_EVENT_ACTION.COMMENT_REMOVE:
            var postId = tlData.post_id.$oid;
            var commentId = tlData.comment_id.$oid;

            factory.dispatchEvent(new CustomEvent(
              NST_COMMENT_EVENT.REMOVE, {
                detail: {
                  id: commentId,
                  postId: postId,
                  internal: false
                }
              }
            ));
            break;
        }
      });
    }

    CommentFactory.prototype = new NstBaseFactory();
    CommentFactory.prototype.constructor = CommentFactory;

    CommentFactory.prototype.getComment = getComment;
    CommentFactory.prototype.addComment = addComment;
    CommentFactory.prototype.removeComment = removeComment;
    CommentFactory.prototype.retrieveComments = retrieveComments;
    CommentFactory.prototype.createCommentModel = createCommentModel;
    CommentFactory.prototype.parseComment = parseComment;
    CommentFactory.prototype.parseMessageComment = parseMessageComment;

    var factory = new CommentFactory();
    return factory;

    /*********************
     *  Implementations  *
     *********************/

    function getComment(commentId, postId) {
      return factory.sentinel.watch(function() {
        var deferred = $q.defer();
        if (!commentId) {
          deferred.reject(new Error('commentId is not provided'))
        } else if (!postId) {
          deferred.reject(new Error('postId is not provided'))
        } else {
          var query = new NstFactoryQuery(commentId, {
            postId: postId
          });

          NstSvcServer.request('post/get_comment', {
            comment_id: query.id,
            post_id: query.data.postId
          }).then(function(data) {
            return parseComment(data.comment);
          }).then(function(comment) {
            deferred.resolve(comment);
          }).catch(function(error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }

        return deferred.promise;
      }, "getComment", commentId);
    }

    /**
     * anonymous function - add a comment
     *
     * @param  {NstPost}   post      the post
     * @param  {String}    content   comment body
     *
     * @returns {Promise}             the comment
     */
    function addComment(postId, content) {
      return factory.sentinel.watch(function() {
        var deferred = $q.defer();

        if (!postId) {
          deferred.reject(new Error('post is not provided'));
        } else {
          NstSvcServer.request('post/add_comment', {
            post_id: postId,
            txt: content
          }).then(function(data) {
            var commentId = data.comment_id.$oid;
            return getComment(commentId, postId);
          }).then(function(comment) {
            // post.addComment(comment);
            deferred.resolve(comment);

            factory.dispatchEvent(new CustomEvent(
              NST_COMMENT_EVENT.ADD, {
                detail: {
                  id: comment.id,
                  postId: postId,
                  comment: comment,
                  internal: true
                }
              }
            ));
          }).catch(deferred.reject);
        }

        return deferred.promise;
      }, "addComment", new Date().valueOf());
    }

    /**
     * anonymous function - load a bunch of comments according to the provided skip and limit values in settings
     *
     * @param  {int}  id        the post id
     * @param  {{}}   settings  all the parameters that will be used to build query for retrieving comments
     *
     * @returns {Promise}            the comments list
     */
    function retrieveComments(postId, settings) {
      return factory.sentinel.watch(function() {
        var deferred = $q.defer();
        if (!postId) {
          deferred.reject(new Error('post is not provided'));
        } else {
          var query = new NstFactoryQuery(postId, {
            date: settings.date,
            limit: settings.limit
          });

          NstSvcServer.request('post/get_comments', {
            post_id: query.id,
            before: settings.date,
            limit: settings.limit
          }).then(function(data) {
            var allCommnets = _.map(data.comments, function(comment) {
              return parseComment(comment, postId);
            });

            $q.all(allCommnets).then(function(commentItems) {
              var comments = _.filter(commentItems, {
                'removed': false
              });
              // post.addComments(comments);
              deferred.resolve(comments);
            });
          }).catch(function(error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }

        return deferred.promise;
      }, 'retrieveComments', postId);
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
      return factory.sentinel.watch(function() {
        var deferred = $q.defer();

        if (!(post && post.id)) {
          deferred.reject(new Error('post is not provided'));
        } else if (!(comment && comment.id)) {
          deferred.reject(new Error('comment is not provided'));
        } else {
          var query = new NstFactoryQuery(comment.id, {
            postId: post.id
          });

          NstSvcServer.request('post/remove_comment', {
            post_id: query.postId,
            comment_id: query.id
          }).then(function(data) {
            post.removeComment(comment);
            deferred.resolve(post);
          }).catch(function(error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }

        return deferred.promise;
      }, 'removeComment', comment.id);
    }

    function createCommentModel(model) {
      return new NstComment(model);
    }

    function parseComment(data, postId) {
      var comment = new NstComment();

      var defer = $q.defer();

      if (!data) {
        defer.resolve(comment);
      } else {

        comment.id = data._id.$oid;
        comment.attach = data.attach;
        comment.postId = postId;
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
