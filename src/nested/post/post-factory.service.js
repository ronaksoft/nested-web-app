(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log,
                             _, md5,
                             NstSvcPostStorage, NstSvcAuth, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentFactory, NstFactoryEventData, NstUtility,
                             NstFactoryError, NstFactoryQuery, NstPost, NstBaseFactory, NstRecipient,
                             NST_MESSAGES_SORT_OPTION, NST_SRV_EVENT, NST_CONFIG, NST_POST_FACTORY_EVENT) {

    function PostFactory() {
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
    PostFactory.prototype.getSentMessages = getSentMessages;
    PostFactory.prototype.getBookmarkedMessages = getBookmarkedMessages;
    PostFactory.prototype.getMessages = getMessages;
    PostFactory.prototype.getPlaceMessages = getPlaceMessages;
    PostFactory.prototype.getFavoriteMessages = getFavoriteMessages;
    PostFactory.prototype.getUnreadMessages = getUnreadMessages;
    PostFactory.prototype.parsePost = parsePost;
    PostFactory.prototype.getMessage = getMessage;
    PostFactory.prototype.search = search;
    PostFactory.prototype.bookmarkPost = bookmarkPost;
    PostFactory.prototype.unBookmarkPost = unBookmarkPost;
    PostFactory.prototype.getChainMessages = getChainMessages;
    PostFactory.prototype.conversation = conversation;
    PostFactory.prototype.movePlace = movePlace;
    PostFactory.prototype.attachPlaces = attachPlaces;

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
            mark_read: markAsRead ? markAsRead : false
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
      } else {
        ids = id;
      }
      if (_.isArray(id) && id.length === 0) {
        throw "Post id is not define!";
      } else {
        ids = id.join(",")
      }


      if (!query.id) {
        defer.resolve(null);
      } else {
        NstSvcServer.request('post/mark_as_read', {
          post_id: ids
        }).then(function () {

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
        content_type: post.contentType,
        subject: post.subject,
        body: post.body
      };

      params.targets = post.places.map(
        function (place) {
          return place.id;
        }
      ).concat(post.recipients.map(
        function (recipient) {
          return recipient.id;
        }
      )).join(',');

      if (post.replyTo) {
        params.reply_to = post.replyTo.id;
      }

      if (post.forwardFrom) {
        params.forward_from = post.forwardFrom.id;
      }

      if (post.attachments) {
        params.attaches = post.attachments.map(
          function (attachment) {
            return attachment.id;
          }
        ).join(',');
      }

      NstSvcServer.request('post/add', params).then(function (response) {
        post.id = response.post_id;

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
        }).then(function () { //remove the object from storage and return the id
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
              post_id: id
            }).then(function () {
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

    function bookmarkPost(id) {
      var query = new NstFactoryQuery(id, {
        id: id
      });

      return $q(function (resolve, reject) {
        NstSvcServer.request('post/pin', {
          post_id: query.id
        }).then(function () { //remove the object from storage and return the id
          var post = NstSvcPostStorage.get(query.id);
          post.setBookmarked(true);
          NstSvcPostStorage.set(query.id, post);

          factory.dispatchEvent(new CustomEvent(
            NST_POST_FACTORY_EVENT.BOOKMARKED,
            new NstFactoryEventData(id)
          ));

          resolve(post);
        }).catch(function (error) {
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });
      });
    }

    function unBookmarkPost(id) {
      var query = new NstFactoryQuery(id, {
        id: id
      });

      return $q(function (resolve, reject) {
        NstSvcServer.request('post/unpin', {
          post_id: query.id
        }).then(function () { //remove the object from storage and return the id
          var post = NstSvcPostStorage.get(query.id);
          post.setBookmarked(false);
          NstSvcPostStorage.set(query.id, post);

          factory.dispatchEvent(new CustomEvent(
            NST_POST_FACTORY_EVENT.UNBOOKMARKED,
            new NstFactoryEventData(id)
          ));

          resolve(post);
        }).catch(function (error) {
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });
      });
    }

    function parsePost(data) {
      var deferred = $q.defer();

      var post = new NstPost();

      post.id = data._id;
      post.contentType = data.content_type;
      post.counters = data.counters;
      post.forwardFromId = data.forward_from;
      post.internal = data.internal;
      post.lastUpdate = data.last_update;
      post.pinned = data.pinned;
      post.attachments = _.map(data.post_attachments, NstSvcAttachmentFactory.parseAttachment);
      post.places = _.map(data.post_places, NstSvcPlaceFactory.parseTinyPlace);
      post.read = data.post_read;
      post.recipients = data.post_recipients;
      post.replyToId = data.reply_to;
      post.sender = NstSvcUserFactory.parseTinyUser(data.internal ? data.sender : data.email_sender);
      post.subject = data.subject;
      post.timestamp = data.timestamp;
      post.type = data.type;
      post.wipeAccess = data.wipeAccess;
      post.ellipsis = data.ellipsis;


      var resources = {};
      var imgRegex = new RegExp('<img(.*?)src=[\'|"](.*?)[\'|"](.*?)>','g');
      var body = data.body.replace(imgRegex,function (m, p1, p2, p3) {
        if (p2.indexOf(NST_CONFIG.STORE.URL) === 0) return m;
        var hash = md5.createHash(p2);
        resources[hash] = p2;
        return "<img" +  p1 + "source='" + hash + "' " + p3 +"/>"
      });

      post.body = body;
      post.resources = resources;

      var recentCommentPromises = _.map(data.recent_comments, NstSvcCommentFactory.parseMessageComment);

      $q.all(recentCommentPromises).then(function (results) {
        post.comments = results;

        deferred.resolve(post);
      }).catch(deferred.reject);

      return deferred.promise;
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
        var messagePromises = _.map(data.posts, parsePost);
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

    function getBookmarkedMessages(setting) {
      var defer = $q.defer();

      var options = {
        limit: setting.limit,
        skip: setting.skip
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('account/get_pinned_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parsePost);
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
        var messagePromises = _.map(data.posts, parsePost);
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
        before: setting.after ? null : setting.date,
        place_id: placeId
      };

      if (setting.after) {
        options.after = setting.after;
      }

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('place/get_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parsePost);
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

    function getFavoriteMessages(setting, bookmarkId) {

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
        var messagePromises = _.map(data.posts, parsePost);
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

    function getUnreadMessages(setting, places) {

      if (!_.isArray(places))
        throw "Places must be an Array.";

      var defer = $q.defer();

      var options = {
        limit: setting.limit,
        before: setting.date,
        place_id: places.join(",")
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      NstSvcServer.request('place/get_unread_posts', options).then(function (data) {
        var messagePromises = _.map(data.posts, parsePost);
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
        skip: skip || 0
      }).then(function (result) {
        var postPromises = _.map(result.posts, parsePost);
        $q.all(postPromises).then(defer.resolve).catch(defer.reject);
      }).catch(function (error) {
        defer.reject(new NstFactoryError(query, '', error.getCode(), error));
      });

      return defer.promise;
    }

    function conversation(accountId, queryString, limit, skip) {
      var defer = $q.defer();
      var query = new NstFactoryQuery(null, {
        account_id: accountId,
        query: queryString,
        limit: limit,
        skip: skip
      });

      NstSvcServer.request('search/posts_conversation', {
        account_id: accountId,
        keywords: queryString,
        limit: limit || 8,
        skip: skip || 0
      }).then(function (result) {
        var postPromises = _.map(result.posts, parsePost);
        $q.all(postPromises).then(defer.resolve).catch(defer.reject);
      }).catch(function (error) {
        defer.reject(new NstFactoryError(query, '', error.getCode(), error));
      });

      return defer.promise;
    }

    function getChainMessages(id, limit) {
      var query = new NstFactoryQuery(id);
      var deferred = $q.defer();

      NstSvcServer.request('post/get_chain', {
        post_id: id,
        limit: limit || 8
      }).then(function (data) {
        var messagePromises = _.map(data.posts, function (post) {
          return parsePost(post);
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

    function attachPlaces(postId, placeIds) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('post/attach_place', {
          post_id : postId,
          place_id : _.join(placeIds, ",")
        }).then(function (data) {
          var result = {
            allAttached : false,
            noneAttached : false,
            notAttachedPlaces : []
          };

          result.allAttached = _.size(_.difference(data.attached, placeIds)) === 0 && _.size(data.not_attached) === 0;
          result.noneAttached = _.size(data.attached) === 0 && _.size(data.not_attached) > 0;
          result.notAttachedPlaces = data.not_attached;
          result.attachedPlaces = data.attached;
          deferred.resolve(result);

        }).catch(deferred.reject);

        return deferred.promise;
      }, "attachPlaces", postId);
    }

    function movePlace(postId, oldPlaceId, newPlaceId) {
      var watchKey = NstUtility.string.format("{0}-{1}-{2}", postId, oldPlaceId, newPlaceId);

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('post/replace', {
          post_id : postId,
          old_place_id : oldPlaceId,
          new_place_id : newPlaceId
        }).then(deferred.resolve).catch(deferred.reject);

        return deferred.promise;
      }, "movePlace", watchKey);

    }
  }
})();
