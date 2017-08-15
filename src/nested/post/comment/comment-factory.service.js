(function () {
  'use strict';
  angular
    .module('ronak.nested.web.comment')
    .service('NstSvcCommentFactory', NstSvcCommentFactory);

  /** @ngInject */
  function NstSvcCommentFactory($q,
                                _,
                                NST_COMMENT_EVENT,
                                NstSvcServer, NstCollector, NstSvcUserFactory, NstPicture, NstUtility,
                                NstComment, NstTinyUser, NstBaseFactory) {

    function CommentFactory() {
      this.collector = new NstCollector('post', this.getManyComment);
    }

    CommentFactory.prototype = new NstBaseFactory();
    CommentFactory.prototype.constructor = CommentFactory;

    CommentFactory.prototype.getComment = getComment;
    CommentFactory.prototype.getManyComment = getManyComment;
    CommentFactory.prototype.addComment = addComment;
    CommentFactory.prototype.removeComment = removeComment;
    CommentFactory.prototype.retrieveComments = retrieveComments;
    CommentFactory.prototype.createCommentModel = createCommentModel;
    CommentFactory.prototype.parseComment = parseComment;
    CommentFactory.prototype.parseMessageComment = parseMessageComment;
    CommentFactory.prototype.getCommentsAfter = getCommentsAfter;

    var factory = new CommentFactory();
    return factory;

    /*********************
     *  Implementations  *
     *********************/

    function getComment(commentId) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        if (!commentId) {
          deferred.reject(new Error('commentIds is not provided'))
        } else {

          factory.collector.add(commentId).then(function (data) {
            return parseComment(data);
          }).then(function (comment) {
            deferred.resolve(comment);
          }).catch(deferred.reject);
        }

        return deferred.promise;
      }, "getComment", commentId);
    }


    function getManyComment(commentIds) {
      var joinedIds = commentIds.join(',');
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        if (!joinedIds) {
          deferred.reject(new Error('commentIds is not provided'))
        } else {
          NstSvcServer.request('post/get_many_comments', {
            comment_id: joinedIds
          }).then(function (data) {
            deferred.resolve({
              idKey: '_id',
              resolves: data.comments,
              rejects: data.no_access
            });
          }).catch(deferred.reject);
        }

        return deferred.promise;
      }, "getManyComment", joinedIds);
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
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        if (!postId) {
          deferred.reject(new Error('post is not provided'));
        } else {
          NstSvcServer.request('post/add_comment', {
            post_id: postId,
            txt: content
          }).then(function (data) {
            var commentId = data.comment_id;
            return getComment(commentId, postId);
          }).then(function (comment) {
            deferred.resolve(comment);
          }).catch(deferred.reject);
        }

        return deferred.promise;
      }, "addComment", NstUtility.date.toUnix(new Date()));
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
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        if (!postId) {
          deferred.reject(new Error('post is not provided'));
        } else {
          NstSvcServer.request('post/get_comments', {
            post_id: postId,
            before: settings.date,
            limit: settings.limit
          }).then(function (data) {
            var allCommnets = _.map(data.comments, function (comment) {
              return parseComment(comment, postId);
            });

            $q.all(allCommnets).then(function (commentItems) {
              deferred.resolve(commentItems);
            });
          }).catch(deferred.reject);
        }

        return deferred.promise;
      }, 'retrieveComments', postId);
    }

    function getCommentsAfter(postId, settings) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        if (!postId) {
          deferred.reject(new Error('post is not provided'));
        } else {
          NstSvcServer.request('post/get_comments', {
            post_id: postId,
            after: settings.date,
            limit: settings.limit
          }).then(function (data) {
            var allCommnets = _.map(data.comments, function (comment) {
              return parseComment(comment, postId);
            });

            $q.all(allCommnets).then(function (commentItems) {
              deferred.resolve(commentItems);
            });
          }).catch(deferred.reject);
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
    function removeComment(postId, comment) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        if (!postId) {
          deferred.reject(new Error('postId is not provided'));
        } else if (!(comment && comment.id)) {
          deferred.reject(new Error('comment is not provided'));
        } else {
          NstSvcServer.request('post/remove_comment', {
            post_id: postId,
            comment_id: comment.id
          }).then(function () {
            deferred.resolve(comment);
          }).catch(deferred.reject);
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
      if (!data || !data._id) {
        defer.resolve(comment);
      } else {

        var promises = [];

        comment.id = data._id;
        comment.postId = postId;
        comment.sender = NstSvcUserFactory.parseTinyUser(data.sender);

        comment.body = data.text;
        comment.timestamp = data.timestamp;

        comment.removedById = data.removed_by;

        if (comment.removedById) {
          promises.push(NstSvcUserFactory.getTiny(comment.removedById));
        }

        if (_.size(promises) === 0) {
          defer.resolve(comment);
        } else {
          $q.all(promises).then(function (resolvedSet) {
            comment.removedBy = resolvedSet[0];

            defer.resolve(comment);
          }).catch(defer.reject);
        }

      }

      return defer.promise;
    }

    function parseMessageComment(data) {
      var defer = $q.defer(),
        comment = new NstComment(),
        promises = [];

      comment.id = data._id;
      comment.body = data.text;
      comment.timestamp = data.timestamp;
      comment.removed = data._removed;
      comment.removedById = data.removed_by;

      promises.push(NstSvcUserFactory.get(data.sender_id));
      if (comment.removed) {
        promises.push(NstSvcUserFactory.get(data.removed_by));
      }

      $q.all(promises).then(function (results) {
        comment.sender = results[0];
        comment.removedBy = results[1];

        defer.resolve(comment);
      }).catch(defer.reject);

      return defer.promise;
    }

  }

})();
