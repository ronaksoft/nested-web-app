(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log,
    _,
    NstSvcPostStorage, NstSvcAuth, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentFactory, NstFactoryEventData,
    NstFactoryError, NstFactoryQuery, NstPost, NstTinyPost, NstComment, NstTinyComment, NstUser, NstTinyUser, NstPicture, NstObservableObject,
    NST_MESSAGES_SORT_OPTION, NST_POST_FACTORY_EVENT, NST_SRV_EVENT, NST_EVENT_ACTION) {

    function PostFactory() {

      var factory = this;

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (e) {
        switch (e.detail.timeline_data.action) {
          case NST_EVENT_ACTION.POST_ADD:
            var postId = e.detail.timeline_data.post_id.$oid;
            getMessage(postId).then(function (post) {
              if (post.sender.id !== NstSvcAuth.user.id) {
                factory.dispatchEvent(new CustomEvent(
                  NST_POST_FACTORY_EVENT.ADD,
                  new NstFactoryEventData(post)
                ));
              }
            }).catch(function (error) {
              $log.debug(error);
            });
            break;

          case NST_EVENT_ACTION.POST_REMOVE:
            var postId = e.detail.timeline_data.post_id.$oid;
            factory.dispatchEvent(new CustomEvent(
              NST_POST_FACTORY_EVENT.REMOVE,
              new NstFactoryEventData(postId)
            ));
            break;
        }
      });
    }

    PostFactory.prototype = new NstObservableObject();
    PostFactory.prototype.constructor = PostFactory;

    PostFactory.prototype.has = has;
    PostFactory.prototype.get = get;
    PostFactory.prototype.set = set;
    PostFactory.prototype.send = send;
    PostFactory.prototype.remove = remove;
    PostFactory.prototype.createPostModel = createPostModel;
    PostFactory.prototype.getWithComments = getWithComments;
    PostFactory.prototype.getSentMessages = getSentMessages;
    PostFactory.prototype.getMessages = getMessages;
    PostFactory.prototype.getPlaceMessages = getPlaceMessages;
    PostFactory.prototype.getBookmarksMessages = getBookmarksMessages;
    PostFactory.prototype.parsePost = parsePost;
    PostFactory.prototype.parseMessage = parseMessage;
    PostFactory.prototype.getMessage = getMessage;
    PostFactory.prototype.search = search;
    PostFactory.prototype.getChainMessages = getChainMessages;

    return new PostFactory();

    function has(id) {
      return !!NstSvcPostStorage.get(id);
    }

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
            parsePost(data.post).then(function(post) {
              NstSvcPostStorage.set(query.id, post);
              defer.resolve(post);
            }).catch(function(error) {
              defer.reject(new NstFactoryError(query, undefined, undefined, error));
            });
          }).catch(function(error) {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }
      }

      return defer.promise;
    }

    function set(post) {
      if (post instanceof NstPost) {
        if (has(post.getId())) {
          NstSvcPostStorage.merge(post.getId(), post);
        } else {
          NstSvcPostStorage.set(post.getId(), post);
        }
      } else if (post instanceof NstTinyPost) {
        // if (hasTiny(post.getId())) {
        //   NstSvcTinyPostStorage.merge(post.getId(), post);
        // } else {
        //   NstSvcTinyPostStorage.set(post.getId(), post);
        // }
      }

      return this;
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
        function(place) {
          return place.getId();
        }
      ).concat(post.getRecipients().map(
        function(recipient) {
          return recipient.getId();
        }
      )).join(',');

      if (post.getReplyTo()) {
        params.reply_to = post.getReplyTo().getId();
      }

      if (post.getForwardFrom()) {
        params.forward_from = post.getForwardFrom().getId();
      }

      if (post.getAttachments()) {
        params.attaches = post.getAttachments().map(
          function(attachment) {
            return attachment.getId();
          }
        ).join(',');
      }

      NstSvcServer.request('post/add', params).then(function(response) {
        post.setId(response.post_id.$oid);

        deferred.resolve({post : post ,noPermitPlaces : response.no_permit_places},response.no_permit_places);
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

        if (data['last_update']) {
          post.setUpdatedDate(new Date(data['last_update']));
        } else {
          post.setUpdatedDate(post.getDate());
        }

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
          promises.push(NstSvcUserFactory.getTiny(data.sender._id).catch(function(error) {
            return $q(function(res) {
              res(parsedSender);
            });
          }).then(function(tinyUser) {
            post.setSender(tinyUser);

            return $q(function(res) {
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
                _id: id,
                name: data.post_places[index].name,
                picture: data.post_places[index].picture
              });
              var imperfect = !NstSvcPlaceFactory.set(parsedPlace);

              // TODO: Put it to retry structure
              NstSvcPlaceFactory.getTiny(id).catch(function(error) {
                return $q(function(res) {
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
          _.forEach(data.post_places, function(place) {
            var accesses = _.find(data.place_access, {
              '_id': place._id
            }).access;

            NstSvcPlaceFactory.setAccessOnPlace(place._id, accesses);
          });
        }

        if (data.post_attachments) {
          _.forEach(data.post_attachments, function(data) {
            promises.push(NstSvcAttachmentFactory.parseAttachment(data, post).then(function(attachment) {
              post.addAttachment(attachment);

              return $q(function(res) {
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
          promises.push(get(data.reply_to.$oid).catch(function(error) {
            return parsePost({
              _id: {
                $oid: data.reply_to.$oid
              }
            });
          }).then(function(relPost) {
            post.setReplyTo(relPost);

            return $q(function(res) {
              res(relPost);
            });
          }));
        }

        // TODO: Use ForwardFromId instead
        if (data.forward_from) {
          promises.push(get(data.forward_from.$oid).catch(function(error) {
            return parsePost({
              _id: {
                $oid: data.forward_from.$oid
              }
            });
          }).then(function(relPost) {
            post.setForwardFrom(relPost);

            return $q(function(res) {
              res(relPost);
            });
          }));
        }

        $q.all(promises).then(function() {
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
        message.setDate(new Date(data.timestamp));

        if (data.last_update) {
          message.setUpdatedDate(new Date(data.last_update));
        } else {
          message.setUpdatedDate(message.getDate());
        }

        // TODO: What about Counters and More Comments?

        if (data.sender) {
          var parsedSender = NstSvcUserFactory.parseTinyUser(data.sender);
          var imperfect = !NstSvcUserFactory.set(parsedSender);
          promises.push(NstSvcUserFactory.getTiny(data.sender._id).catch(function(error) {
            return $q(function(res) {
              res(parsedSender);
            });
          }).then(function(tinyUser) {
            message.setSender(tinyUser);

            return $q(function(res) {
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
                _id: id,
                name: data.post_places[index].name,
                picture: data.post_places[index].picture
              });
              var imperfect = !NstSvcPlaceFactory.set(parsedPlace);

              // TODO: Put it to retry structure
              NstSvcPlaceFactory.getTiny(id).catch(function(error) {
                return $q(function(res) {
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
          _.forEach(data.post_attachments, function(data) {
            promises.push(NstSvcAttachmentFactory.parseAttachment(data, message).then(function(attachment) {
              message.addAttachment(attachment);

              return $q(function(res) {
                res(attachment);
              });
            }));
          });
        }

        if (data['last-comments']) {
          var commentPromises = _.map(data['last-comments'], function (comment) {
            return NstSvcCommentFactory.parseMessageComment(comment)
          });

          var allComments = $q.all(commentPromises).then(function (comments) {
            message.addComments(comments);
          });

          promises.push(allComments);
        }

        message.setReplyToId(data.reply_to ? data.reply_to.$oid : null);
        message.setForwardFromId(data.forward_from ? data.forward_from.$oid : null);

        $q.all(promises).then(function() {
          defer.resolve(message);
        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function getMessages(setting) {
      var defer = $q.defer();

      var options = {
        limit: setting.limit,
        before: setting.date
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('account/get_posts', options).then(function(data) {
        var messagePromises = _.map(data.posts.posts, parseMessage);
        $q.all(messagePromises).then(function(messages) {
          _.forEach(messages, function(item) {
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
        before: setting.date
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('account/get_sent_posts', options).then(function(data) {
        var messagePromises = _.map(data.posts.posts, parseMessage);
        $q.all(messagePromises).then(function(messages) {
          _.forEach(messages, function(item) {
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
        before: setting.date,
        place_id: placeId
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('place/get_posts', options).then(function(data) {
        var messagePromises = _.map(data.posts.posts, parseMessage);
        $q.all(messagePromises).then(function(messages) {
          _.forEach(messages, function(item) {
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

    function getBookmarksMessages(setting, bookmarkId) {

      var defer = $q.defer();

      bookmarkId = bookmarkId || "_starred";

      var options = {
        limit: setting.limit,
        before: setting.date,
        bookmark_id: bookmarkId
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('account/get_bookmarked_posts', options).then(function(data) {
        var messagePromises = _.map(data.posts.posts, parseMessage);
        $q.all(messagePromises).then(function(messages) {
          _.forEach(messages, function(item) {
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
        post_id: id
      }).then(function(data) {
        var message = parsePost(data.post);

        defer.resolve(message);
      }).catch(defer.reject);

      return defer.promise;
    }

    function search(queryString, limit, skip) {
      var defer = $q.defer();
      var query = new NstFactoryQuery(null, {
        query : queryString,
        limit : limit,
        skip : skip
      });

      NstSvcServer.request('post/search', {
        keywords : queryString,
        limit : limit || 8,
        skip : skip || 0,
      }).then(function (result) {
        var postPromises = _.map(result.posts.posts, parseMessage);
        $q.all(postPromises).then(defer.resolve).catch(defer.reject);
      }).catch(function (error) {
        defer.reject(new NstFactoryError(query, '', error.getCode(), error));
      });

      return defer.promise;
    }

    function getChainMessages(id) {
      var query = new NstFactoryQuery(id);
      var deferred = $q.defer();

      NstSvcServer.request('post/get_chain', {
        post_id : id
      }).then(function (data) {
        var messagePromises = _.map(data.posts, function (post) {
          if (_.isObject(post) && post._id) {
            return parseMessage(post);
          } else if (_.isString(post) && post === "NO ACCESS TO POST") {
            return $q.resolve({
              id : null,
            });
          }
        });
        $q.all(messagePromises).then(function (messages) {
          console.log('foo', messages);
          deferred.resolve(messages);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    }
  }
})();
