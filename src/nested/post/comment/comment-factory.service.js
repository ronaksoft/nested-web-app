(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcCommentFactory', NstSvcCommentFactory);

  /** @ngInject */
  // TODO: It should not inject any model, ask the factory to create the model
  function NstSvcCommentFactory($q, $log,
                                _,
                                NST_COMMENT_EVENT, NST_SRV_EVENT, NST_EVENT_ACTION,
                                NstSvcPostStorage, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentStorage, NstObservableObject, NstFactoryEventData,
                                NstFactoryError, NstFactoryQuery, NstPost, NstComment, NstTinyComment, NstUser, NstTinyUser) {

    function CommentFactory() {
      var factory = this;

      this.requests = {
        get: {}
      };

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (event) {
        var tlData = event.detail.timeline_data;

        switch (tlData.action) {
          case NST_EVENT_ACTION.COMMENT_ADD:
            var postId = tlData.post_id.$oid;
            var commentId = tlData.comment_id.$oid;

            factory.getComment(commentId, postId).then(function (comment) {
              factory.dispatchEvent(new CustomEvent(
                NST_COMMENT_EVENT.ADD,
                { detail: { id: commentId, postId: postId, comment: comment, internal: false } }
              ));
            });
            break;

          case NST_EVENT_ACTION.COMMENT_REMOVE:
            var postId = tlData.post_id.$oid;
            var commentId = tlData.comment_id.$oid;

            factory.dispatchEvent(new CustomEvent(
              NST_COMMENT_EVENT.REMOVE,
              { detail: { id: commentId, postId: postId, internal: false } }
            ));
            break;
        }
      });
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

    var factory = new CommentFactory();

    return factory;

    /*********************
     *  Implementations  *
     *********************/

    function getComment(commentId, postId) {
      var query = new NstFactoryQuery(commentId, {
        postId: postId
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
      }).then(function(comment) {
        defer.resolve(comment);

        factory.dispatchEvent(new CustomEvent(
          NST_COMMENT_EVENT.ADD,
          { detail: { id: comment.id, postId: post.id, comment: comment, internal: true } }
        ));
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
        date: settings.date,
        limit: settings.limit
      });

      var defer = $q.defer();

      NstSvcServer.request('post/get_comments', {
        post_id: post.id,
        before : settings.date,
        limit: settings.limit
      }).then(function(data) {
        var allCommnets = _.map(data.comments, function(comment) {
          return parseComment(comment, post);
        });

        $q.all(allCommnets).then(function(commentItems) {
            var comments = _.filter(commentItems, {
              'removed': false
            });
            post.addComments(comments);
            defer.resolve(comments);
          });
      }).catch(function(error) {
        defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return defer.promise;
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
