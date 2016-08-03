(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q,
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
      getSentMessages: getSentMessages,
      getMessages: getMessages,
      getPlaceMessages: getPlaceMessages,
      parsePost: parsePost,
      parseMessage : parseMessage,
      getMessage : getMessage
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
      var defer = $q.defer();

      var query = new NstFactoryQuery(id);

      if (!query.id) {
        defer.resolve(null);
      } else {
        var post = NstSvcPostStorage.get(query.id);
        if (post && !post.bodyIsTrivial) {
          defer.resolve(post);
        } else {
          NstSvcServer.request('post/get', {
            post_id: query.id
          }).then(function(data) {
            parsePost(data.post).then(function (post) {
              NstSvcPostStorage.set(query.id, post);
              defer.resolve(post);
            }).catch(function (error) {
              defer.reject(new NstFactoryError(query, undefined, undefined, error));
            });
          }).catch(function(error) {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }
      }

      return defer.promise;
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

      if (post.getForwardFrom()) {
        params.forwarded_from = post.getForwardFrom().getId();
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

        post.setId(data._id.$oid);
        post.setSubject(data.subject);
        post.setContentType(data.content_type);
        post.setBody(data.body);

        post.setInternal(data.internal);

        post.setDate(new Date(data['timestamp']));
        post.setUpdated(new Date(data['last_update']));

        post.setMonitored(data.monitored);
        post.setSpam(data.spam);

        post.setCounters(data.counters || post.counters);
        post.setMoreComments(false);
        if (post.counters) {
          post.setMoreComments(post.counters.comments > -1 ? post.counters.comments > post.comments.length : true);
        }

        if (data.sender) {
          var parsedSender = NstSvcUserFactory.parseTinyUser(data.sender);
          var imperfect = !NstSvcUserFactory.set(parsedSender);
          promises.push(NstSvcUserFactory.getTiny(data.sender._id).catch(function (error) {
            return $q(function (res) {
              res(parsedSender);
            });
          }).then(function (tinyUser) {
            post.setSender(tinyUser);

            return $q(function (res) {
              res(tinyUser);
            });
          }));
        }

        if (data.post_places) {
          for (var k in data.post_places) {
            promises.push((function(index) {
              var deferred = $q.defer();
              var id = data.post_places[index]._id;

              var parsedPlace = NstSvcPlaceFactory.parseTinyPlace({
                _id : id,
                name : data.post_places[index].name,
                picture : data.post_places[index].picture
              });
              var imperfect = !NstSvcPlaceFactory.set(parsedPlace);

              // TODO: Put it to retry structure
              NstSvcPlaceFactory.getTiny(id).catch(function (error) {
                return $q(function (res) {
                  res(parsedPlace);
                });
              }).then(function(tinyPlace) {
                // TODO: Use NstPost.addPlace()
                post.places[index] = tinyPlace;

                deferred.resolve(tinyPlace);
              });

              return deferred.promise;
            })(k));
          }
        }

        if (data.place_access) {
          _.forEach(post.places, function(place) {
            place.access = _.find(data.place_access, {
              '_id': place.id
            }).access;
            NstSvcPlaceFactory.setAccessOnPlace(place.id, place.access);
          });
        }

        if (data.post_attachments) {
          _.forEach(data.post_attachments, function (data) {
            promises.push(NstSvcAttachmentFactory.parseAttachment(data, post).then(function (attachment) {
              post.addAttachment(attachment);

              return $q(function (res) {
                res(attachment);
              });
            }));
          });
        }

        if (data.recipients) {
          for (var k in data.recipients) {
            post.recipients[k] = new NstRecipient({
              id: data.recipients[k],
              name: data.recipients[k],
              email: data.recipients[k]
            });
          }
        }

        // TODO: Use ReplyToId instead
        if (data.reply_to) {
          promises.push(get(data.reply_to.$oid).catch(function (error) {
            return parsePost({
              _id: {
                $oid: data.reply_to.$oid
              }
            });
          }).then(function (relPost) {
            post.setReplyTo(relPost);

            return $q(function (res) {
              res(relPost);
            });
          }));
        }

        // TODO: Use ForwardFromId instead
        if (data.forward_from) {
          promises.push(get(data.forward_from.$oid).catch(function (error) {
            return parsePost({
              _id: {
                $oid: data.forward_from.$oid
              }
            });
          }).then(function (relPost) {
            post.setForwardFrom(relPost);

            return $q(function (res) {
              res(relPost);
            });
          }));
        }

        $q.all(promises).then(function() { defer.resolve(post); }).catch(defer.reject);
      }

      return defer.promise;
    }

    function parseMessage(data) {
      var defer = $q.defer();

      var message = createPostModel();
      if (!data) {
        defer.resolve(message);
      } else {
        var promises = [];

        message.setId(data._id.$oid);
        message.setSubject(data.subject);
        // A message body is trivial
        message.setBodyIsTrivial(true);
        message.setBody(data.body);
        message.setContentType(data.content_type);
        message.removed = data._removed;
        message.setCounters(data.counters || message.counters);
        message.setInternal(data.internal);
        message.setUpdated(new Date(data.last_update));
        message.setDate(new Date(data.timestamp));

        // TODO: What about Counters and More Comments?

        if (data.sender) {
          var parsedSender = NstSvcUserFactory.parseTinyUser(data.sender);
          var imperfect = !NstSvcUserFactory.set(parsedSender);
          promises.push(NstSvcUserFactory.getTiny(data.sender._id).catch(function (error) {
            return $q(function (res) {
              res(parsedSender);
            });
          }).then(function (tinyUser) {
            message.setSender(tinyUser);

            return $q(function (res) {
              res(tinyUser);
            });
          }));
        }

        if (data.post_places) {
          for (var k in data.post_places) {
            promises.push((function(index) {
              var deferred = $q.defer();
              var id = data.post_places[index]._id;

              var parsedPlace = NstSvcPlaceFactory.parseTinyPlace({
                _id : id,
                name : data.post_places[index].name,
                picture : data.post_places[index].picture
              });
              var imperfect = !NstSvcPlaceFactory.set(parsedPlace);

              // TODO: Put it to retry structure
              NstSvcPlaceFactory.getTiny(id).catch(function (error) {
                return $q(function (res) {
                  res(parsedPlace);
                });
              }).then(function(tinyPlace) {
                // TODO: Use NstPost.addPlace()
                message.places[index] = tinyPlace;

                deferred.resolve(tinyPlace);
              });

              return deferred.promise;
            })(k));
          }
        }

        if (data.post_attachments) {
          _.forEach(data.post_attachments, function (data) {
            promises.push(NstSvcAttachmentFactory.parseAttachment(data, message).then(function (attachment) {
              message.addAttachment(attachment);

              return $q(function (res) {
                res(attachment);
              });
            }));
          });
        }

        if (data['last-comments']) {
          _.forEach(data['last-comments'], function (data) {
            promises.push(NstSvcCommentFactory.parseMessageComment(data).then(function (comment) {
              message.addComment(comment);

              return $q(function (res) {
                res(comment);
              });
            }));
          });
        }

        // TODO: Use ReplyToId instead
        if (data.reply_to) {
          promises.push(get(data.reply_to.$oid).catch(function (error) {
            return parsePost({
              _id: {
                $oid: data.reply_to.$oid
              }
            });
          }).then(function (relPost) {
            message.setReplyTo(relPost);

            return $q(function (res) {
              res(relPost);
            });
          }));
        }

        // TODO: Use ForwardFromId instead
        if (data.forward_from) {
          promises.push(get(data.forward_from.$oid).catch(function (error) {
            return parsePost({
              _id: {
                $oid: data.forward_from.$oid
              }
            });
          }).then(function (relPost) {
            message.setForwardFrom(relPost);

            return $q(function (res) {
              res(relPost);
            });
          }));
        }

        $q.all(promises).then(function () { defer.resolve(message); }).catch(defer.reject);
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
        }).catch(defer.reject);
      }).catch(function(error) {
        // TODO: format the error and throw it
        defer.reject(error);
      });

      return defer.promise;
    }

    function getSentMessages(setting) {
      var defer = $q.defer();

      var options = {
        limit: setting.limit,
        before : setting.date
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY){
        options.by_update = true;
      }

      NstSvcServer.request('account/get_sent_posts', options).then(function(data) {
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

    function getMessage(id) {
      var defer = $q.defer();

      NstSvcServer.request('post/get', {
        post_id : id
      }).then(function(data) {
        var message = parsePost(data.post);

        defer.resolve(message);
      }).catch(defer.reject);

      return defer.promise;
    }
  }
})();
