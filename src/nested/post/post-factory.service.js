(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostFactory', NstSvcPostFactory);

  /** @ngInject */
  function NstSvcPostFactory($q, $log, $rootScope,
                             _, md5,
                             NstSvcPostStorage, NstCollector, NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcStore, NstSvcCommentFactory, NstUtility,
                             NstPost, NstBaseFactory,
                             NST_MESSAGES_SORT_OPTION, NST_SRV_EVENT, NST_CONFIG, NST_POST_EVENT, NstSvcLabelFactory) {

    function PostFactory() {
      this.collector = new NstCollector('post', this.getMany);
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

      if (!id) {
        defer.resolve(null);
      } else {
        var post = NstSvcPostStorage.get(id);
        if (post && !post.bodyIsTrivial) {
          defer.resolve(post);
        } else {

          if (markAsRead) {

            NstSvcServer.request('post/get', {
              post_id: id,
              mark_read: markAsRead ? markAsRead : false
            }).then(function (data) {
              var post = parsePost(data);
              post.bodyIsTrivial = false;
              NstSvcPostStorage.set(post.id, post);
              defer.resolve(post);
            }).catch(defer.reject);

          } else {

            this.collector.add(id).then(function (data) {
                var post = parsePost(data);
                post.bodyIsTrivial = false;
                NstSvcPostStorage.set(post.id, post);
                defer.resolve(post);
              }).catch(defer.reject);
          }
        }
      }

      return defer.promise;
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
      post.places = _.map(data.post_places, NstSvcPlaceFactory.parseTinyPlace);
      post.read = data.post_read;
      post.recipients = data.post_recipients;
      post.replyToId = data.reply_to;
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
