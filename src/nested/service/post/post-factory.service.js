(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log,
    _,
    NstSvcPostStorage, NstSvcServer, NstSvcPlaceFactory,
    NstFactoryError, NstFactoryQuery ,NstPost, NstComment, NstUser, NestedAttachment) { // TODO: It should not inject any model, ask the factory to create the model

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      get: get,
      remove: remove,
      addComment: addComment,
      removeComment: removeComment,
      createPostModel: createPostModel,
      getWithComments: getWithComments,
      retrieveComments: retrieveComments,
      reateCommentModel: createCommentModel,
      getMessages: getMessages,
      getPlaceMessages: getPlaceMessages,
      parsePost: parsePost,
      parseComment: parseComment
    };

    return service;

    /**
     * anonymous function - retrieve a post by id and store in the related cache storage
     *
     * @param  {int}      id  a post id
     *
     * @returns {Promise}      the post
     */
    function get(id) {
      var query = new NstFactoryQuery(id);

      return $q(function(resolve, reject) {
        var post = NstSvcPostStorage.get(this.query.id);
        if (post) {
          resolve(post);
        } else {
          NstSvcServer.request('post/get', {
            post_id: id
          }).then(function(data) {
            post = parsePost(data.post);
            NstSvcPostStorage.set(this.query.id, post);
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
     *
     * @returns {Promise}     the removed post
     */
    function remove(id, placeId) {
      var query = new NstFactoryQuery(id, {
        placeId: placeId
      });

      return $q(function(resolve, reject) {
        NstSvcServer.request('post/remove', {
          post_id: this.query.id,
          place_id: this.query.data.placeId
        }).then(function(data) { //remove the object from storage and return the id
          //TODO : First remove the place from post's places
          //TODO : If the place was the last one, remove the post object
          var post = NstSvcPostStorage.get(this.query.id);
          removePlaceFromPost(post, this.query.data.placeId);
          if (post.places.length === 0) { //the last place was removed
            NstSvcPostStorage.remove(this.query.id);
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
     * @param  {String}    content   comment body
     *
     * @returns {Promise}             the comment
     */
    function addComment(post, user, content) {
      // var query = new NstFactoryQuery(postId, { txt : content });
      var defer = $q.defer();

      NstSvcServer.request('post/add_comment', {
        post_id: post.id,
        txt: content
      }).then(function(data) {
        var comment = createCommentModel({
          id: data.comment_id.$oid,
          post: post,
          body: content,
          sender: user,
          date: Date.now()
        });
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
            return parseComment(post, comment);
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

      get(postId).then(function(post) {
        if (post && post.id) {
          retrieveComments(post, commentSettings).then(defer.resolve).catch(defer.reject);
        } else {
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

    function createPostModel(model) {
      return new NstPost(model);
    }

    function createCommentModel(model) {
      return new NstComment(model);
    }

    function parsePost(data) {
      var defer = $q.defer();

      var post = createPostModel();

      if (!data) {
        defer.resolve(post);
      } else {
        var promises = [];

        console.log(data);

        post.id = data._id.$oid;
        post.sender = new NstUser(data.sender);
        post.subject = data.subject;
        post.contentType = data.content_type;
        post.body = data.body;
        post.internal = data.internal;
        post.date = new Date(data['timestamp'] * 1e3);
        post.updated = new Date(data['last_update'] * 1e3);
        post.counters = data.counters || post.counters;
        post.moreComments = false;
        if (post.counters) {
          post.moreComments = post.counters.comments > -1 ? post.counters.comments > post.comments.length : true;
        }

        post.monitored = data.monitored;
        post.spam = data.spam;

        post.places = [];
        for (var k in data.post_places) {
          promises.push((function(index) {
            var id = data.post_places[index]._id;

            return NstSvcPlaceFactory.set(NstSvcPlaceFactory.parseTinyPlace({
              _id: id,
              name: data.post_places[index].name
            })).getTiny(id).then(function(tinyPlace) {
              post.places[index] = tinyPlace;
            });
          })(k));
        }

        if (data.place_access) {
          _.forEach(post.places, function(place) {
            place.access = _.find(data.place_access, {
              '_id': place.id
            }).access;
          });
        }

        post.attachments = [];
        post.attachmentPreview = false;
        for (var k in data.post_attachments) {
          post.attachments[k] = new NestedAttachment(data.post_attachments[k], post);
          post.attachmentPreview = post.attachmentPreview || !!post.attachments[k].thumbs.x128.uid;
        }

        post.recipients = []; // TODO: ?
        for (var k in data.recipients) {
          post.recipients[k] = new NestedRecipient(data.recipients[k]);
        }

        if (post.full) {
          post.commentLimit = post.counters.comments || 100 * post.commentLimit;
          post.loadComments();
        }

        $q.all(promises.concat([parsePost(data.replyTo), parsePost(data.forwarded)])).then(function(values) {

          post.replyTo = values[0];
          post.forwarded = values[1];

          defer.resolve(post);

        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function parseComment(post, data) {
      var comment = new NstComment();

      var defer = $q.defer();

      if (!data) {
        defer.resolve(comment);
      } else {

        comment.id = data._id.$oid;
        comment.attach = data.attach;
        comment.post = post;
        comment.sender = new NstUser({
          _id: data.sender_id,
          fname: data.sender_fname,
          lname: data.sender_lname,
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
        comment.date = new Date(data.timestap);
        comment.removed = data._removed;
        comment.sender = new NstTinyUser(data.sender);

        // TODO: Ask the factory to get the user
        // NstSvcUserFactory.get(data.sender_id.$oid).then(function (sender) {
        //   comment.sender = sender;
        //
        //   defer.resolve(comment);
        // }).catch(defer.reject);
      }

      return defer.promise;
    }

    function parseMessage(data) {
      var defer = $q.defer();

      var message = createPostModel();
      if (!data) {
        defer.resolve(message);
      } else {


        message.id = data._id.$oid;
        message.subject = data.subject;
        message.body = data.body;
        message.removed = data._removed;
        message.content_type = data.content_type;
        message.counters = data.counters;
        message.internal = data.internal;
        message.lastUpdate = data.last_update;
        message.timestap = new Date(data.timestamp);

        // var senderPromise = NstSvcUserFactory.parseUser(data.sender);
        var senderPromise = new $q(function (resolve, reject) {
          resolve(new NstUser(data.sender));
        });


        var replayToPromise = get(data.reply_to ? data.reply_to.$oid : undefined);
        var forwardedFromPromise = get(data.forwarded_from ? data.forwarded_from.$oid : undefined);
        var placePromises = _.map(data.post_places, NstSvcPlaceFactory.parseTinyPlace);
        var attachmentPromises = _.map(data.post_attachments, NstSvcAttachmentFactory.parseAttachment);
        var commentPromises = _.map(data['last-comments'], parseMessageComment);

        var promises = _.concat(senderPromise, replyToPromise, forwardedFromPromise);

        $q.all(promises).then(function(values) {
          message.seder = values[0];
          message.replyTo = values[1];
          message.forwardedFrom = values[2];

          return $q.all(placePromises);
        }).then(function(places) {
          message.places = places;

          return $q.all(attachmentPromises);
        }).then(function(attachments) {
          message.attachments = attachments;

          return $q.all(commentPromises);
        }).then(function(comments) {
          message.comments = comments;

          defer.resolve(message);
        }).catch(defer.reject);

      }

      return defer.promise;

    }

    function getMessages(setting) {
      var defer = $q.defer();
      NstSvcServer.request('account/get_posts', {
        skip: setting.skip,
        limit: setting.limit
      }).then(function(data) {
        var items = _.map(data.posts.posts, parseMessage);
        $q.all(items).then(defer.resolve);
      }).catch(function(error) {
        // TODO: format the error and throw it
        defer.reject(error);
      });

      return defer.promise;
    }

    function getPlaceMessages(setting, placeId) {

      var defer = $q.defer();
      NstSvcServer.request('place/get_posts', {
        skip: setting.skip,
        limit: setting.limit,
        place_id: placeId
      }).then(function(data) {
        var items = _.map(data.posts.posts, parseMessage);
        $q.all(items).then(defer.resolve);
      }).catch(function(error) {
        // TODO: format the error and throw it
        defer.reject(error);
      });

      return defer.promise;
    }
  }
})();
