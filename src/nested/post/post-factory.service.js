(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log,
                             _,
                             NstSvcPostStorage, NstSvcAuth, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentFactory, NstFactoryEventData, NstUtility,
                             NstFactoryError, NstFactoryQuery, NstPost, NstTinyPost, NstComment, NstTinyComment, NstUser, NstTinyUser, NstPicture, NstBaseFactory,
                             NST_MESSAGES_SORT_OPTION, NST_POST_FACTORY_EVENT, NST_SRV_EVENT, NST_EVENT_ACTION) {

    function PostFactory() {

      var factory = this;

      NstSvcServer.addEventListener(NST_EVENT_ACTION.POST_ADD, function(event) {
        var tlData = event.detail;

        if (tlData.actor !== NstSvcAuth.user.id) {

          var post = new NstTinyPost();
          post.setId(tlData.post_id);
          post.setPlaces(tlData.place_id);

          factory.get(post.getId(),false)
            .then(function (postData) {
              factory.dispatchEvent(new CustomEvent(
                NST_POST_FACTORY_EVENT.ADD,
                new NstFactoryEventData(postData)
              ));
            });


        }
      });

      NstSvcServer.addEventListener(NST_EVENT_ACTION.POST_REMOVE, function(event) {
        var tlData = event.detail;

        var postId = tlData.post_id;
        factory.dispatchEvent(new CustomEvent(
          NST_POST_FACTORY_EVENT.REMOVE,
          new NstFactoryEventData(postId)
        ));

      });

    }

    PostFactory.prototype = new NstBaseFactory();
    PostFactory.prototype.constructor = PostFactory;

    PostFactory.prototype.has = has;
    PostFactory.prototype.get = get;
    PostFactory.prototype.read = read;
    PostFactory.prototype.set = set;
    PostFactory.prototype.send = send;
    PostFactory.prototype.remove = remove;
    PostFactory.prototype.retract = retract;
    PostFactory.prototype.createPostModel = createPostModel;
    PostFactory.prototype.getWithComments = getWithComments;
    PostFactory.prototype.getSentMessages = getSentMessages;
    PostFactory.prototype.getMessages = getMessages;
    PostFactory.prototype.getPlaceMessages = getPlaceMessages;
    PostFactory.prototype.getBookmarksMessages = getBookmarksMessages;
    PostFactory.prototype.getUnreadMessages = getUnreadMessages ;
    PostFactory.prototype.parsePost = parsePost;
    PostFactory.prototype.parseMessage = parseMessage;
    PostFactory.prototype.getMessage = getMessage;
    PostFactory.prototype.search = search;
    PostFactory.prototype.getChainMessages = getChainMessages;

    var factory = new PostFactory();
    return factory;

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
    function get(id, markAsRead) {
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
            post_id: query.id,
            mark_read : markAsRead ? markAsRead : false
          }).then(function (data) {
            var post = parsePost(data);
            NstSvcPostStorage.set(post.id, post);
            defer.resolve(post);
          }).catch(function (error) {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }
      }

      return defer.promise;
    }


    /**
     * anonymous function - retrieve a post by id and store in the related cache storage
     *
     * @param  {int}      id  a post id
     *
     * @returns {Promise}      the post
     */
    function read(id) {

      var factory = this;
      var defer = $q.defer();

      var query = new NstFactoryQuery(id);
      var ids;

      if (!id) {
        throw "Post id is not define!";
      }else{
        ids = id;
      }
      if (_.isArray(id) && id.length === 0) {
        throw "Post id is not define!";
      }else {
        ids = id.join(",")
      }


      if (!query.id) {
        defer.resolve(null);
      } else {
        NstSvcServer.request('post/mark_as_read', {
          post_id: ids,
        }).then(function (data) {

            factory.dispatchEvent(new CustomEvent(
              NST_POST_FACTORY_EVENT.READ,
              new NstFactoryEventData(id)
            ));

          defer.resolve(true);

        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

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
        function (place) {
          return place.getId();
        }
      ).concat(post.getRecipients().map(
        function (recipient) {
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
          function (attachment) {
            return attachment.getId();
          }
        ).join(',');
      }

      NstSvcServer.request('post/add', params).then(function (response) {
        post.setId(response.post_id);

        deferred.resolve({post: post, noPermitPlaces: response.no_permit_places}, response.no_permit_places);
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

      return $q(function (resolve, reject) {
        NstSvcServer.request('post/remove', {
          post_id: query.id,
          place_id: query.data.placeId
        }).then(function (data) { //remove the object from storage and return the id
          var post = NstSvcPostStorage.get(query.id);
          NstUtility.collection.dropById(post.places, query.data.placeId);
          if (post.places.length === 0) { //the last place was removed
            NstSvcPostStorage.remove(query.id);
          } else {
            NstSvcPostStorage.set(query.id, post);
          }
          resolve(post);
        }).catch(function (error) {
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });
      });
    }

    function retract(id) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        get(query.id).then(function (post) {
          if (post.wipeAccess) {

            NstSvcServer.request('post/wipe', {
              post_id : id
            }).then(function (data) {
              NstSvcPostStorage.remove(id);
              deferred.resolve(true);
            }).catch(function (error) {
              deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });

          } else {
            deferred.reject(deferred.reject(new NstFactoryError(query, "NoWipeAccess")));
          }
        }).catch(deferred.reject);


        return deferred.promise;
      }, "retract", id);
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

      get(postId).then(function (post) {
        if (post && post.id) {
          NstSvcCommentFactory.retrieveComments(post, commentSettings).then(defer.resolve).catch(defer.reject);
        } else {
          defer.reject('could not find a post with provided id.');
        }
      }).catch(defer.reject);

      return defer.promise;
    }

    function createPostModel(model) {
      return new NstPost(model);
    }

    function parsePost(data) {
      var defer = $q.defer();
      var post = createPostModel();

      if (!data) {
        defer.reject(Error("The post data is not provided"))
        return defer.promise;
      }

      if (!data._id) {
        defer.reject(Error("The post data does not contain _id property"))
        return defer.promise;
      }

      post.setId(data._id);
      post.setSubject(data.subject);
      post.setContentType(data.content_type);
      post.setBody(data.body);

      post.setInternal(data.internal);

      post.setDate(new Date(data.timestamp));
      post.setUpdatedDate(new Date(data.last_update));

      post.setCounters(data.counters || post.counters);
      post.setSender(NstSvcUserFactory.parseTinyUser(data.sender));

      var places = _.map(data.post_places, function (place) {
        return NstSvcPlaceFactory.parseMicroPlace(place);
      });
      post.setPlaces(places);

      var attachments = _.map(data.post_attachments, function (attachment) {
        return NstSvcAttachmentFactory.parseAttachment(attachment);
      });
      post.setAttachments(attachments);

      // TODO: Fix parsing recipients
      if (data.recipients) {
        for (var k in data.recipients) {
          post.recipients[k] = new NstRecipient({
            id: data.recipients[k],
            name: data.recipients[k],
            email: data.recipients[k]
          });
        }
      }

      post.setReplyToId(data.reply_to);
      post.setForwardFromId(data.forward_from);
      post.setWipeAccess(data.wipe_access);

      return post;
    }

    function parseMessage(data) {
      if (!_.isObject(data)) {
        throw Error("Could not create a NstPost model with invalid data");
      }

      if (!data._id) {
        throw Error("Could not create a NstPost model without _id");
      }
      var defer = $q.defer(),
          promises = [],
          message = new NstPost();

      message.setId(data._id);
      message.setSubject(data.subject);
      // A message body is trivial
      message.setBodyIsTrivial(true);
      message.setBody(data.body);
      message.setContentType(data.content_type);
      message.setCounters(data.counters || message.counters);
      message.setInternal(data.internal);
      message.setDate(new Date(data.timestamp));
      message.setIsRead(_.isUndefined(data.post_read) ? true : data.post_read);
      message.setReplyToId(data.reply_to || null);
      message.setForwardFromId(data.forward_from || null);

      if (data.last_update) {
        message.setUpdatedDate(new Date(data.last_update));
      } else {
        message.setUpdatedDate(message.getDate());
      }

      var sender = NstSvcUserFactory.parseTinyUser(data.sender);
      NstSvcUserFactory.set(sender);
      message.setSender(sender);

      var places = _.map(data.post_places, function (data) {
        return NstSvcPlaceFactory.parseMicroPlace(data);
      });
      message.setPlaces(places);

      var attachments = _.map(data.post_attachments, function (data) {
        return NstSvcAttachmentFactory.parseAttachment(data);
      });
      message.setAttachments(attachments);

      var commentPromises = _.map(data.recent_comments, function (comment) {
        return NstSvcCommentFactory.parseMessageComment(comment)
      });

      var allComments = $q.all(commentPromises).then(function (comments) {
        message.setComments(comments);
      });

      promises.push(allComments);


      $q.all(promises).then(function () {
        defer.resolve(message);
      }).catch(defer.reject);


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

      NstSvcServer.request('account/get_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        }).catch(defer.reject);
      }).catch(function (error) {
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

      NstSvcServer.request('account/get_sent_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        });
      }).catch(function (error) {
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

      NstSvcServer.request('place/get_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        });
      }).catch(function (error) {
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

      NstSvcServer.request('account/get_favorite_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        });
      }).catch(function (error) {
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

        NstSvcServer.request('account/get_favorite_posts', options).then(function (data) {
          var messagePromises = _.map(data.posts, parseMessage);
          $q.all(messagePromises).then(function (messages) {
            _.forEach(messages, function (item) {
              NstSvcPostStorage.set(item.id, item);
            });
            defer.resolve(messages);
          });
        }).catch(function (error) {
          // TODO: format the error and throw it
          defer.reject(error);
        });

        return defer.promise;
      }


    function getUnreadMessages(setting, places, subs) {

      if (!_.isArray(places))
        throw "Places must be an Array.";

      var defer = $q.defer();

      var options = {
        limit: setting.limit,
        before: setting.date,
        place_id: places.join(","),
        subs : subs ? subs : false
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('place/get_unread_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parseMessage);
        $q.all(messagePromises).then(function (messages) {
          _.forEach(messages, function (item) {
            NstSvcPostStorage.set(item.id, item);
          });
          defer.resolve(messages);
        });
      }).catch(function (error) {
        // TODO: format the error and throw it
        defer.reject(error);
      });

      return defer.promise;
    }


    function getMessage(id) {
      var defer = $q.defer();

      NstSvcServer.request('post/get', {
        post_id: id
      }).then(function (data) {
        var message = parsePost(data.post);

        defer.resolve(message);
      }).catch(defer.reject);

      return defer.promise;
    }

    function search(queryString, limit, skip) {
      var defer = $q.defer();
      var query = new NstFactoryQuery(null, {
        query: queryString,
        limit: limit,
        skip: skip
      });

      NstSvcServer.request('search/posts', {
        keywords: queryString,
        limit: limit || 8,
        skip: skip || 0,
      }).then(function (result) {
        var postPromises = _.map(result.posts, parseMessage);
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
        post_id: id
      }).then(function (data) {
        var messagePromises = _.map(data.posts, function (post) {
          if (_.isObject(post) && post._id) {
            return parseMessage(post);
          } else if (_.isString(post) && post === "NO ACCESS TO POST") {
            return $q.resolve({
              id: null,
            });
          }
        });
        $q.all(messagePromises).then(function (messages) {
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
