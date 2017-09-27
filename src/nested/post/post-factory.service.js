(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $rootScope,
    _, md5,
    NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory,
    NstSvcCommentFactory, NstUtility, NstSvcGlobalCache,
    NstPost, NstBaseFactory, NstCollector,
    NST_MESSAGES_SORT_OPTION, NST_SRV_ERROR, NST_CONFIG, NST_POST_EVENT, NstSvcLabelFactory) {

    function PostFactory() {
      this.collector = new NstCollector('post', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('post');
    }

    PostFactory.prototype = new NstBaseFactory();
    PostFactory.prototype.constructor = PostFactory;

    PostFactory.prototype.get = get;
    PostFactory.prototype.getMany = getMany;
    PostFactory.prototype.read = read;
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
    PostFactory.prototype.search = search;
    PostFactory.prototype.newSearch = newSearch;
    PostFactory.prototype.advancedSearch = advancedSearch;
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

    /**
     * anonymous function - retrieve a post by id and store in the related cache storage
     *
     * @param  {int}      id  a post id
     *
     * @returns {Promise}      the post
     */
    function get(id, fullBody) {
      var factory = this;

      var cachedPlace = this.getCachedSync(id);
      if (cachedPlace) {
        // If a post with full body was requested, then the post ellipsis should be false
        if (!fullBody || (fullBody && !cachedPlace.ellipsis)) {
          return $q.resolve(cachedPlace);
        }
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
      return NstSvcServer.request('post/mark_as_read', {
        post_id: id
      }).then(function () {
        factory.cache.remove(id);
        $rootScope.$broadcast(NST_POST_EVENT.READ, { postId: id });
        $q.resolve();
      });
    }

    function getCachedSync(id) {
      return this.parseCachedModel(this.cache.get(id));
    }

    function set(data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data));
      } else {
        // console.error('The data is not valid to be cached!', data);
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
      post.attachments = _.map(data.post_attachments, NstSvcAttachmentFactory.parseAttachment);
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
      if (data.sender) {
        post.sender = NstSvcUserFactory.getCachedSync(data.sender);
        // Make sure the post sender was found successfully
        if (!post.sender) {
          this.cache.remove(data._id);
          return null;
        }
      } else if (data.email_sender) {
        // Email sender object is serialized within the post because it does not change
        post.sender = NstSvcUserFactory.parseTinyUser(data.email_sender);
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
      if (data.post_labels.length > 0 && !_.every(post.labels)) {
        this.cache.remove(data._id);
        return null;
      }
      post.body = data.body;
      post.comments = _.map(data.post_comments, function (comment) {
        return NstSvcCommentFactory.parseComment(comment);
      });

      return post;
    }

    function transformToCacheModel(post) {
      var copy = _.clone(post);
      copy.sender = post.sender ? post.sender._id : null;
      copy.post_places = _.map(post.post_places, '_id');
      copy.post_labels = _.map(post.post_labels, '_id');

      return copy;
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
      return NstSvcServer.request('post/remove', {
        post_id: id,
        place_id: placeId
      }).then(function () {
        factory.cache.remove(id);
        $rootScope.$broadcast(NST_POST_EVENT.REMOVE, { postId: id });
        return $q.resolve();
      });
    }

    function retract(id) {
      return NstSvcServer.request('post/wipe', {
        post_id: id
      }).then(function () {
        factory.cache.remove(id);
        return $q.resolve(true);
      });
    }

    function pin(id) {
      NstSvcServer.request('post/pin', {
        post_id: id
      }).then(function () {
        factory.cache.remove(id);
        $rootScope.$broadcast(NST_POST_EVENT.BOOKMARKED, { postId: id });
        $q.resolve();
      }).catch(function () {
        $q.reject();
      });
    }

    function unpin(id) {
      NstSvcServer.request('post/unpin', {
        post_id: id
      }).then(function () {
        factory.cache.remove(id);
        $rootScope.$broadcast(NST_POST_EVENT.UNBOOKMARKED, { postId: id });
        $q.resolve();
      }).catch(function () {
        $q.reject();
      });
    }

    function parsePost(data) {
      if (!(data && data._id)) {
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
      post.attachments = _.map(data.post_attachments, NstSvcAttachmentFactory.parseAttachment);
      post.places = _.map(data.post_places, function(place) {
        NstSvcPlaceFactory.set(place);
        return NstSvcPlaceFactory.parseTinyPlace(place);
      });
      post.read = data.post_read;
      post.recipients = (data.post_recipients === null? []: data.post_recipients);
      post.replyToId = data.reply_to;
      if (data.sender) {
        NstSvcUserFactory.set(data.sender);
      }
      post.sender = NstSvcUserFactory.parseTinyUser(data.internal ? data.sender : data.email_sender);
      if (data.sender) {
        NstSvcUserFactory.set(data.sender);
      }
      if (data.email_sender) {
        NstSvcUserFactory.set(data.email_sender);
      }
      post.subject = data.subject;
      post.timestamp = data.timestamp;
      post.type = data.type;
      post.wipeAccess = data.wipe_access;
      post.ellipsis = data.ellipsis;
      post.noComment = data.no_comment;
      post.watched = data.watched;
      post.isTrusted = data.is_trusted;
      post.labels = _.map(data.post_labels, function (item) {
        NstSvcLabelFactory.set(item);
        return NstSvcLabelFactory.parse(item);
      });


      var resources = {};
      var imgRegex = new RegExp('<img(.*?)src=[\'|"](.*?)[\'|"](.*?)>', 'g');
      var body = '';
      if (data.body !== undefined) {
        body = data.body.replace(imgRegex, function (m, p1, p2, p3) {
          if (p2.indexOf(NST_CONFIG.STORE.URL) === 0) return m;
          var hash = md5.createHash(p2);
          resources[hash] = p2;
          return "<img" + p1 + "source='" + hash + "' " + p3 + "/>"
        });
      }

      post.body = body;
      post.resources = resources;

      post.comments = _.map(data.post_comments, function(comment) {
        return NstSvcCommentFactory.parseComment(comment);
      });

      return post;
    }

    function handleCachedResponse(cacheHandler, cachedResponse) {
      if (cachedResponse && _.isFunction(cacheHandler)) {
        var cachedPosts = _.map(cachedResponse.posts, function (post) {
          return factory.getCachedSync(post._id);
        });
        cacheHandler(_.compact(cachedPosts));
      }
    }

    function getMessages(setting, cacheHandler) {

      var options = {
        limit: setting.limit,
        before: setting.before
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }
      return NstSvcServer.request('account/get_posts', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
        var posts = _.map(data.posts, function (post) {
          factory.set(post);
          return factory.parsePost(post);
        });

        return posts;
      });
    }

    function getBookmarkedMessages(setting, cacheHandler) {

      var options = {
        limit: setting.limit,
        skip: setting.skip
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      return NstSvcServer.request('account/get_pinned_posts', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
        var posts = _.map(data.posts, function (post) {
          factory.set(post);
          return factory.parsePost(post);
        });

        return posts;
      });
    }

    function getSentMessages(setting, cacheHandler) {
      var options = {
        limit: setting.limit,
        before: setting.before
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      return NstSvcServer.request('account/get_sent_posts', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
        var posts = _.map(data.posts, function (post) {
          factory.set(post);
          return factory.parsePost(post);
        });

        return posts;
      });
    }

    function getPlaceMessages(setting, placeId, cacheHandler) {
      var options = {
        limit: setting.limit,
        before: setting.before,
        place_id: placeId
      };

      if (setting.after) {
        options.after = setting.after;
      }

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      return NstSvcServer.request('place/get_posts', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
        var posts = _.map(data.posts, function (post) {
          factory.set(post);
          return factory.parsePost(post);
        });

        return posts;
      });
    }

    function getFavoriteMessages(setting, bookmarkId, cacheHandler) {
      bookmarkId = bookmarkId || "_starred";

      var options = {
        limit: setting.limit,
        before: setting.before,
        bookmark_id: bookmarkId
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      return NstSvcServer.request('account/get_favorite_posts', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
        var posts = _.map(data.posts, function (post) {
          factory.set(post);
          return factory.parsePost(post);
        });

        return posts;
      });
    }

    function getUnreadMessages(setting, places, cacheHandler) {

      if (!_.isArray(places))
        throw "Places must be an Array.";

      var options = {
        limit: setting.limit,
        before: setting.before,
        place_id: places.join(",")
      };

      if (setting.sort === NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY) {
        options.by_update = true;
      }

      return NstSvcServer.request('place/get_unread_posts', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
        var posts = _.map(data.posts, function (post) {
          factory.set(post);
          return factory.parsePost(post);
        });

        return posts;
      });
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

    function advancedSearch(parameters, limit, skip) {
      var params = {
        advanced: true,
        place_id: parameters.places,
        sender_id: parameters.users,
        label_title: parameters.labels,
        keyword: parameters.keywords,
        subject: parameters.subject,
        has_attachment: parameters.hasAttachment,
        limit: limit || 8,
        skip: skip || 0
      };

      if (parameters.hasOwnProperty('before') && parameters.hasOwnProperty('after')) {
        _.merge(params, {
          before: parameters.before,
          after: parameters.after
        });
      }

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

    function getChainMessages(id, limit, cacheHandler) {
      return NstSvcServer.request('post/get_chain', {
        post_id: id,
        limit: limit || 8
      }, function(cachedResponse) {
        if (cachedResponse && _.isFunction(cacheHandler)) {
          var cachedPosts = _.map(cachedResponse.posts, function(post) {
            return factory.getCachedSync(post._id);
          });

          if (_.size(cachedPosts) > 0 && _.every(cachedPosts)) {
            cacheHandler(cachedPosts);
          }
        }
      }).then(function (data) {
        return _.map(data.posts, function (post) {
          return parsePost(post);
        });
      });
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
          $rootScope.$broadcast(NST_POST_EVENT.MOVE, { postId: postId });
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
