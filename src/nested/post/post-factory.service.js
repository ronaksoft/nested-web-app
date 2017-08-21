(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log, $rootScope,
    _, md5,
    NstSvcPostStorage, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore,
    NstSvcCommentFactory, NstUtility, NstSvcCacheProvider,
    NstPost, NstBaseFactory, NstCollector,
    NST_MESSAGES_SORT_OPTION, NST_SRV_EVENT, NST_CONFIG, NST_POST_EVENT, NstSvcLabelFactory) {

    function PostFactory() {
      this.collector = new NstCollector('post', this.getMany);
      this.cache = new NstSvcCacheProvider('post');
    }

    PostFactory.prototype = new NstBaseFactory();
    PostFactory.prototype.constructor = PostFactory;

    PostFactory.prototype.has = has;
    PostFactory.prototype.get = get;
    PostFactory.prototype.getMany = getMany;
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
    PostFactory.prototype.newSearch = newSearch;
    PostFactory.prototype.pin = pin;
    PostFactory.prototype.unpin = unpin;
    PostFactory.prototype.getChainMessages = getChainMessages;
    PostFactory.prototype.conversation = conversation;
    PostFactory.prototype.movePlace = movePlace;
    PostFactory.prototype.attachPlaces = attachPlaces;
    PostFactory.prototype.whoRead = whoRead;
    PostFactory.prototype.getCounters = getCounters;
    PostFactory.prototype.setNotification = setNotification;
    PostFactory.prototype.addLabel = addLabel;
    PostFactory.prototype.removeLabel = removeLabel;
    PostFactory.prototype.getCachedSync = getCachedSync;
    PostFactory.prototype.set = set;
    PostFactory.prototype.transformToCacheModel = transformToCacheModel;
    PostFactory.prototype.parseCachedModel = parseCachedModel;

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
    function get(id) {
      var factory = this;

      var cachedPlace = this.getCachedSync(id);
      if (cachedPlace) {
        return $q.resolve(cachedPlace);
      }

      var deferred = $q.defer();
      this.collector.add(id).then(function (data) {
        factory.set(data);
        deferred.resolve(parsePost(data));
      }).catch(function(error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            factory.cache.remove(id);
            break;
        }

        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getMany(ids) {

      var defer = $q.defer();

      var joinedIds = ids.join(',');

      if (!joinedIds) {
        defer.resolve(null);
      } else {
        NstSvcServer.request('post/get_many', {
          post_id: joinedIds
        }).then(function (dataObj) {
          defer.resolve({
            idKey: '_id',
            resolves: dataObj.posts,
            rejects: dataObj.no_access
          });
        }).catch(defer.reject);
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
      var defer = $q.defer();

      if (!id) {
        throw "Post id is not define!";
      }

      if (!id) {
        defer.resolve(null);
      } else {
        NstSvcServer.request('post/mark_as_read', {
          post_id: id
        }).then(function () {
          var post = NstSvcPostStorage.get(id);

          if (post) {
            post.read = true;
            NstSvcPostStorage.set(id, post);
          }
          $rootScope.$broadcast(NST_POST_EVENT.READ, { postId: id });

          defer.resolve(true);

        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function getCachedSync(id) {
      return this.parseCachedModel(this.cache.get(id));
    }

    function removeCachedModel(id) {
      return this.cache.remove(id);
    }

    function set(data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data));
      } else {
        console.error('The data is not valid to be cached!', data);
      }
    }

    function parseCachedModel(data) {
      if (!data) {
        return null;
      }

      var post = new NstPost();

      post.id = data._id;
      post.contentType = data.content_type;
      post.counters = data.counters;
      post.forwardFromId = data.forward_from;
      post.internal = data.internal;
      post.lastUpdate = data.last_update;
      post.pinned = data.pinned;
      post.attachments = data.post_attachments;
      post.places = _.map(data.post_places, function (placeId) {
        return NstSvcPlaceFactory.getCachedSync(placeId);
      });
      // Make sure the post places were found successfully
      if (!_.every(post.places)) {
        this.cache.remove(data._id);
        return null;
      }
      post.read = data.post_read;
      post.recipients = data.post_recipients;
      post.replyToId = data.reply_to;
      post.sender = NstSvcUserFactory.getCachedSync(data.sender);
      // Make sure the post sender was found successfully
      if (data.sender && !post.sender) {
        this.cache.remove(data._id);
        return null;
      }
      post.subject = data.subject;
      post.timestamp = data.timestamp;
      post.type = data.type;
      post.wipeAccess = data.wipe_access;
      post.ellipsis = data.ellipsis;
      post.noComment = data.no_comment;
      post.watched = data.watched;
      post.isTrusted = data.is_trusted;
      post.labels = _.map(data.post_labels, function (labelId) {
        return NstSvcLabelFactory.getCachedSync(labelId);
      });
      // Make sure all post labels were found successfully
      if (!_.every(post.labels)) {
        this.cache.remove(data._id);
        return null;
      }
      post.body = data.body;
      post.comments = data.recent_comments;

      return post;
    }

    function transformToCacheModel(place) {
      return {
        _id: data._id,
        content_type: data.content_type,
        counters: data.counters,
        internal: data.internal,
        last_update: data.last_update,
        pinned: data.pinned,
        post_attachments: data.post_attachments,
        post_places: _.map(data.post_places, '_id'),
        post_read: data.post_read,
        sender: data.sender ? data.sender._id : null,
        email_sender: data.email_sender ? data.email_sender._id : null,
        subject: data.subject,
        timestamp: data.timestamp,
        body: data.body,
        post_recipients: data.post_recipients,
        reply_to: data.reply_to,
        type: data.type,
        wipe_access: data.wipe_access,
        ellipsis: data.ellipsis,
        no_comment: data.no_comment,
        watched: data.watched,
        is_trusted: data.is_trusted,
        post_labels: _.map(data.post_labels, 'id'),
        body: data.body,
        recent_comments: data.recent_comments,
      };
    }

    function send(post) {
      var deferred = $q.defer();

      var params = {
        targets: '',
        content_type: post.contentType,
        subject: post.subject,
        body: post.body,
        label_id: post.labels,
        no_comment : post.noComment
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
      return $q(function (resolve, reject) {
        NstSvcServer.request('post/remove', {
          post_id: id,
          place_id: placeId
        }).then(function () { //remove the object from storage and return the id
          var post = NstSvcPostStorage.get(id);

          if (post) {
            NstUtility.collection.dropById(post.places, placeId);
            if (post.places.length === 0) { //the last place was removed
              NstSvcPostStorage.remove(id);
            } else {
              NstSvcPostStorage.set(id, post);
            }
          }

          resolve(post);
        }).catch(reject);
      });
    }

    function retract(id) {
      var factory = this;
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('post/wipe', {
          post_id: id
        }).then(function () {
          NstSvcPostStorage.remove(id);
          return $q.resolve(true);
        });
      }, "retract", id);
    }

    function pin(id) {
      return $q(function (resolve, reject) {
        NstSvcServer.request('post/pin', {
          post_id: id
        }).then(function () { //remove the object from storage and return the id
          var post = NstSvcPostStorage.get(id);

          if (post) {
            post.pinned = true;
            NstSvcPostStorage.set(id, post);
          }
          $rootScope.$broadcast(NST_POST_EVENT.BOOKMARKED, { postId: id });

          resolve(post);
        }).catch(reject);
      });
    }

    function unpin(id) {
      return $q(function (resolve, reject) {
        NstSvcServer.request('post/unpin', {
          post_id: id
        }).then(function () { //remove the object from storage and return the id
          var post = NstSvcPostStorage.get(id);

          if (post) {
            post.pinned = false;
            NstSvcPostStorage.set(id, post);
          }

          $rootScope.$broadcast(NST_POST_EVENT.UNBOOKMARKED, { postId: id });

          resolve(post);
        }).catch(reject);
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
      post.places = _.map(data.post_places, function(place) {
        NstSvcPlaceFactory.set(place);
        return NstSvcPlaceFactory.parseTinyPlace(place);
      });
      post.read = data.post_read;
      post.recipients = data.post_recipients;
      post.replyToId = data.reply_to;
      if (data.sender) {
        NstSvcUserFactory.set(data.sender);
      }
      post.sender = NstSvcUserFactory.parseTinyUser(data.internal ? data.sender : data.email_sender);
      post.subject = data.subject;
      post.timestamp = data.timestamp;
      post.type = data.type;
      post.wipeAccess = data.wipe_access;
      post.ellipsis = data.ellipsis;
      post.noComment = data.no_comment;
      post.watched = data.watched;
      post.isTrusted = data.is_trusted;
      post.labels = _.map(data.post_labels, function (item) {
        return NstSvcLabelFactory.parse(item);
      });


      var resources = {};
      var imgRegex = new RegExp('<img(.*?)src=[\'|"](.*?)[\'|"](.*?)>', 'g');
      var body = data.body.replace(imgRegex, function (m, p1, p2, p3) {
        if (p2.indexOf(NST_CONFIG.STORE.URL) === 0) return m;
        var hash = md5.createHash(p2);
        resources[hash] = p2;
        return "<img" + p1 + "source='" + hash + "' " + p3 + "/>"
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

    function parseCacheModel(data) {
      var model = _.clone(data);

      model.post_attachments = _.map(data.post_attachments, NstSvcAttachmentFactory.getCachedSync);
      model.post_places = _.map(data.post_places, NstSvcPlaceFactory.getCachedSync);
      model.post_labels = _.map(data.post_labels, NstSvcLabelFactory.getCachedSync);
      model.recent_comments = _.map(data.recent_comments, NstSvcCommentFactory.getCachedSync);
      model.sender = data.sender ? NstSvcUserFactory.getCachedSync(data.sender) : null;
      model.email_sender = data.email_sender ? NstSvcUserFactory.getCachedSync(data.email_sender) : null;
      
      return model;
    }

    function transformToCacheModel(user) {
      var clonedUser = _.clone(user);

      clonedUser.post_attachments = _.map(user.post_attachments, '_id');
      clonedUser.post_places = _.map(user.post_places, '_id');
      clonedUser.post_labels = _.map(user.post_labels, '_id');
      clonedUser.recent_comments = _.map(user.recent_comments, '_id');
      clonedUser.sender = user.sender ? user.sender._id : null;
      clonedUser.email_sender = user.email_sender ? user.email_sender._id : null;

      return clonedUser;
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
      return factory.sentinel.watch(function () {
        NstSvcServer.request('search/posts', {
          keywords: queryString,
          limit: limit || 8,
          skip: skip || 0
        }).then(function (result) {
          var postPromises = _.map(result.posts, parsePost);
          $q.all(postPromises).then(defer.resolve).catch(defer.reject);
        }).catch(defer.reject);

        return defer.promise;
      }, 'searchPost', 'old');
    }

    function newSearch(places, users, labels, keywords, limit, skip) {
      var params = {
        advanced: true,
        place_id: places,
        sender_id: users,
        label_title: labels,
        keyword: keywords,
        limit: limit || 8,
        skip: skip || 0
      };
      var defer = $q.defer();
      return factory.sentinel.watch(function () {
        NstSvcServer.request('search/posts', params).then(function (result) {
          var postPromises = _.map(result.posts, parsePost);
          $q.all(postPromises).then(defer.resolve).catch(defer.reject);
        }).catch(defer.reject);
        return defer.promise;
      }, 'searchPost', 'new');
    }

    function conversation(accountId, queryString, limit, skip) {
      var defer = $q.defer();
      NstSvcServer.request('search/posts_conversation', {
        account_id: accountId,
        keywords: queryString,
        limit: limit || 8,
        skip: skip || 0
      }).then(function (result) {
        var postPromises = _.map(result.posts, parsePost);
        $q.all(postPromises).then(defer.resolve).catch(defer.reject);
      }).catch(defer.reject);

      return defer.promise;
    }

    function getChainMessages(id, limit) {
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
        }).catch(deferred.reject);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function attachPlaces(postId, placeIds) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('post/attach_place', {
          post_id: postId,
          place_id: _.join(placeIds, ",")
        }).then(function (data) {
          var result = {
            allAttached: false,
            noneAttached: false,
            notAttachedPlaces: []
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
          post_id: postId,
          old_place_id: oldPlaceId,
          new_place_id: newPlaceId
        }).then(function(){
          deferred.resolve({postId : postId})
        }).catch(deferred.reject);

        return deferred.promise;
      }, "movePlace", watchKey);

    }

    function whoRead(postId, skip, limit) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('post/who_read', {
          post_id: postId,
          skip: skip,
          limit: limit
        }).then(function (data) {
          var readers = [];
          _.map(data.post_reads, function (reader) {
            readers.push({
              user: NstSvcUserFactory.parseTinyUser(reader.account),
              timestamp: reader.read_on,
              placeId: reader.place_id
            })
          });
          deferred.resolve(readers);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "movePlace", 'who-read-' + postId);

    }

    function getCounters(postId) {
      return this.sentinel.watch(function () {
        return $q(function (resolve, reject) {
          NstSvcServer.request('post/get_counters', {
            post_id: postId
          }).then(function (data) {
            resolve(data.counters);
          }).catch(reject);
        });
      },'getCounters' + postId);
    }

    function setNotification(postId, state) {
      return this.sentinel.watch(function () {
        return $q(function (resolve, reject) {
          NstSvcServer.request('post/set_notification', {
            post_id: postId,
            state: state
          }).then(function (data) {
            resolve(data);
          }).catch(reject);
        });
      });
    }

    function addLabel(postId, labelId) {
      var watchKey = NstUtility.string.format("{0}-{1}", postId, labelId);
      return this.sentinel.watch(function () {
        return NstSvcServer.request('post/add_label', {
          post_id: postId,
          label_id: labelId
        });
      }, "addLabel", watchKey);
    }

    function removeLabel(postId, labelId) {
      var watchKey = NstUtility.string.format("{0}-{1}", postId, labelId);
      return this.sentinel.watch(function () {
        return NstSvcServer.request('post/remove_label', {
          post_id: postId,
          label_id: labelId
        });
      }, "removeLabel", watchKey);
    }
  }
})
();
