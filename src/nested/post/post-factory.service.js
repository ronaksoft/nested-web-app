(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log,
    _,
    NstSvcPostStorage, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory,NstSvcStore, NstSvcCommentFactory,
    NstFactoryError, NstFactoryQuery ,NstPost, NstComment, NstTinyComment, NstUser, NstTinyUser, NstPicture, NST_MESSAGES_SORT_OPTION) { // TODO: It should not inject any model, ask the factory to create the model

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      get: get,
      send: send,
      remove: remove,
      createPostModel: createPostModel,
      getWithComments: getWithComments,
      getMessages: getMessages,
      getPlaceMessages: getPlaceMessages,
      parsePost: parsePost
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
        if (!query.id){
          resolve(null);
        } else {
          var post = NstSvcPostStorage.get(query.id);
          if (post) {
            resolve(post);
          } else {
            NstSvcServer.request('post/get', {
              post_id : query.id
            }).then(function(data) {
              post = parsePost(data.post);
              NstSvcPostStorage.set(query.id, post);
              resolve(post);
            }).catch(function(error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        }
      });
    }

    function send(post) {
      var deferred = $q.defer();

      var params = {
        targets: '',
        content_type: post.getContentType(),
        subject: post.getSubject(),
        body: post.getBody()
      };

      params.targets = post.getPlaces().map(
        function (place) { return place.getId(); }
      ).concat(post.getRecipients().map(
        function (recipient) { return recipient.getId(); }
      )).join(',');

      if (post.getReplyTo()) {
        params.reply_to = post.getReplyTo().getId();
      }

      if (post.getForwarded()) {
        params.forwarded_from = post.getForwarded().getId();
      }

      if (post.getAttachments()) {
        params.attaches = post.getAttachments().map(
          function (attachment) { return attachment.getId(); }
        ).join(',');
      }

      NstSvcServer.request('post/add', params).then(function (response) {
        post.setId(response.post_id.$oid);

        deferred.resolve(post);
      }).catch(deferred.reject);

      return deferred.promise;
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
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        }.bind({
          query: this.query
        }));
      }.bind({
        query: query
      }));
    }

    /**
     * getWithComments - Retrieves a post with its comments
     *
     * @param  {String}   postId          The post id
     * @param  {Object}   commentSettings Some settings like skip and limit
     * @return {Promise}                  A promise that resolves a NstPost
     */
    function getWithComments(postId, commentSettings) {
      var defer = $q.defer();

      get(postId).then(function(post) {
        if (post && post.id) {
          NstSvcCommentFactory.retrieveComments(post, commentSettings).then(defer.resolve).catch(defer.reject);
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

    function parsePost(data) {
      var defer = $q.defer();
      var post = createPostModel();

      if (!data) {
        defer.resolve(post);
      } else {
        var promises = [];

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
        // TODO: write some promises for attachments
        if (data.post_attachments) {
          for (var k in data.post_attachments) {
            post.attachments[k] = NstSvcAttachmentFactory.createAttachmentModel(data.post_attachments[k], post);
          }
        }

        post.recipients = []; // TODO: ?
        for (var k in data.recipients) {
          post.recipients[k] = new NstRecipient({
            id: data.recipients[k],
            name: data.recipients[k],
            email: data.recipients[k]
          });
        }

        if (post.full) {
          post.commentLimit = post.counters.comments || 100 * post.commentLimit;
          post.loadComments();
        }

        $q.all(promises.concat([parsePost(data.replyTo), parsePost(data.forward_from)])).then(function(values) {

          post.replyTo = values[0];
          post.forwardFrom = values[1];

          defer.resolve(post);

        }).catch(defer.reject);
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
        message.date = new Date(data.timestamp);
        message.replyTo = data.reply_to ? data.reply_to.$oid : undefined;
        message.forwardFrom = data.forward_from ? data.forward_from.$oid : undefined;

        var senderPromise = NstSvcUserFactory.get(data.sender._id);
        // var replyToPromise = get(data.reply_to ? data.reply_to.$oid : undefined);
        // var forwardFromPromise = get(data.forward_from ? data.forward_from.$oid : undefined);
        var placePromises = _.map(data.post_places, function (place) {
          return NstSvcPlaceFactory.parseTinyPlace(place);
        });

        var attachmentPromises = _.map(data.post_attachments, function (attachment) {
          return NstSvcAttachmentFactory.parseAttachment(attachment, message);
        });

        var commentPromises = _.map(data['last-comments'], function (comment) {
          return NstSvcCommentFactory.parseMessageComment(comment);
        });

        // var promises = _.concat(senderPromise, replyToPromise, forwardFromPromise);

        senderPromise.then(function (sender) {
          message.sender = sender;

        //   return replyToPromise;
        // }).then(function (replyTo) {
        //   message.replyTo = replyTo;
        //
        //   return forwardFromPromise;
        // }).then(function (forwardFrom) {
        //   message.forwardFrom = forwardFrom;

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

      var options = {
        limit: setting.limit,
        before : setting.date
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY){
        options.by_update = true;
      }

      NstSvcServer.request('account/get_posts', options).then(function(data) {
        var messagePromises = _.map(data.posts.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        });
      }).catch(function(error) {
        // TODO: format the error and throw it
        defer.reject(error);
      });

      return defer.promise;
    }

    function getPlaceMessages(setting, placeId) {

      var defer = $q.defer();

      var options = {
        limit: setting.limit,
        before : setting.date,
        place_id: placeId
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY){
        options.by_update = true;
      }

      NstSvcServer.request('place/get_posts', options).then(function(data) {
        var messagePromises = _.map(data.posts.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        });
      }).catch(function(error) {
        // TODO: format the error and throw it
        defer.reject(error);
      });

      return defer.promise;
    }
  }
})();
