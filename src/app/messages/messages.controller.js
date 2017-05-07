(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $q, $stateParams, $log, $state, $window, $scope,
                              moment,
                              NST_MESSAGES_SORT_OPTION, NST_MESSAGES_VIEW_SETTING, NST_DEFAULT, NST_PLACE_FACTORY_EVENT, NST_EVENT_ACTION, NST_POST_FACTORY_EVENT, NST_PLACE_ACCESS,
                              NstSvcPostFactory, NstSvcPlaceFactory, NstSvcServer, NstUtility, NstSvcAuth, NstSvcSync, NstSvcWait, NstVmFile,
                              NstSvcMessagesSettingStorage, NstSvcTranslation, NstSvcInteractionTracker,
                              NstSvcPlaceAccess, NstSvcModal) {

    var vm = this;

    $rootScope.topNavOpen = false;
    isConversation();

    var DEFAULT_MESSAGES_COUNT = 8,
      defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
      defaultViewSetting = {
        content: true,
        attachments: true,
        comments: true,
        quickMessage: true
      },
      sortOptionStorageKey = 'sort-option';
    vm.messages = [];
    vm.hotMessageStorage = [];
    vm.hotMessages = [];
    vm.cache = [];
    vm.hasNewMessages = false;
    vm.myPlaceIds = [];
    vm.loadMoreCounter = 0;

    vm.loadMore = loadMore;
    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.noMessages = false;
    vm.loading = false;
    vm.loadMessageError = false;
    // Reveals hot message when user wants to show new messages
    vm.revealHotMessage = false;
    vm.markAllAsRead = markAllAsRead;
    vm.showNewMessages = showNewMessages;
    vm.dismissNewMessage = dismissNewMessage;
    vm.openContacts = openContacts;

    vm.messagesSetting = {
      limit: DEFAULT_MESSAGES_COUNT,
      skip: 0,
      sort: defaultSortOption,
      date: null
    };

    vm.toggleContentPreview = toggleContentPreview;
    vm.toggleAttachmentsPreview = toggleAttachmentsPreview;
    vm.toggleCommentsPreview = toggleCommentsPreview;
    vm.toggleQuickMessagePreview = toggleQuickMessagePreview;
    vm.isBookMark = isBookMark();
    vm.isSubPersonal = isSubPersonal;

    vm.quickMessageAccess = false;
    // Listen for when the dnd has been configured.
    var eventReferences = [];
    (function () {
      isUnread();
      vm.isSentMode = 'messages-sent' === $state.current.name;
      vm.isbookmarkedsMode = 'app.messages-bookmarked' === $state.current.name;

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        vm.syncId = NstSvcSync.openAllChannel();
        vm.currentPlaceId = null;
      } else {
        vm.syncId = NstSvcSync.openChannel($stateParams.placeId);
        vm.currentPlaceId = $stateParams.placeId;
      }

      if (!$stateParams.sort || $stateParams.sort === NST_DEFAULT.STATE_PARAM) {
        vm.messagesSetting.sort = NstSvcMessagesSettingStorage.get(sortOptionStorageKey, defaultSortOption);
      } else {
        vm.messagesSetting.sort = $stateParams.sort;
        NstSvcMessagesSettingStorage.set(sortOptionStorageKey, vm.messagesSetting.sort);
      }

      generateUrls();
      getUnreadsCount();

      if (vm.currentPlaceId) {
        NstSvcPlaceAccess.getIfhasAccessToRead(vm.currentPlaceId).then(function (place) {
          if (place) {
            vm.currentPlace = place;
            vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);
            vm.currentPlaceLoaded = true;
            vm.showPlaceId = !_.includes(['off', 'internal'], vm.currentPlace.privacy.receptive);

            $q.all([loadViewSetting(), loadMessages(), loadMyPlaces(), getQuickMessageAccess(), loadRemovePostAccess()]).catch(function (error) {
              $log.debug(error);
            }).finally(function () {
              eventReferences.push(NstSvcWait.emit('main-done'));
            });
          } else {
            NstSvcModal.error(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place.")).finally(function () {
              $state.go(NST_DEFAULT.STATE);
            });
          }
        }).catch(function (error) {
          vm.errorInInitialLoading = true;
          $log.debug(error);
        });
      } else {
        vm.currentPlaceLoaded = true;
        $q.all([loadViewSetting(), loadMessages(), loadMyPlaces()]).catch(function (error) {
          $log.debug(error);
        }).finally(function () {
          eventReferences.push(NstSvcWait.emit('main-done'));
        });
      }

      if (isBookMark()) {

        NstSvcPlaceFactory.getFavoritesPlaces()
          .then(function (data) {
            vm.bookmarkedPlaces = data;
          });
      }

      NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.READ, function (e) {
        getUnreadsCount();
      });

      NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.READ_ALL_POST, function (e) {
        getUnreadsCount();
      });

      function postMustBeShown(post) {
        if (post.sender.id !== NstSvcAuth.user.id) {
          return false;
        }

        // Is in sent page
        if (isSent()) {
          return true;
        }

        // The message was sent to the current place
        if (_.some(post.places, {id: vm.currentPlaceId})) {
          return true;
        }

        // The message
        if (!vm.currentPlaceId && _.intersection(_.map(post.places, 'id'), vm.bookmarkedPlaces).length > 0) {
          return true;
        }

        return false;
      }

      function mustBeAddedToHotPosts(post) {
        if (post.sender.id === NstSvcAuth.user.id) {
          return false;
        }

        // The message was sent to the current place
        if (_.some(post.places, {id: vm.currentPlaceId})) {
          return true;
        }

        // The message
        if (!vm.currentPlaceId && _.intersection(_.map(post.places, 'id'), vm.bookmarkedPlaces).length > 0) {
          return true;
        }

        return false;
      }

      NstSvcSync.addEventListener(NST_EVENT_ACTION.POST_ADD, function (e) {
        if (postMustBeShown(e.detail.post)) {
          // The current user is the sender
          e.detail.post.attachments = _.map(e.detail.post.attachments, function (item) {
            return new NstVmFile(item);
          });
          vm.messages.unshift(e.detail.post);

        } else if (mustBeAddedToHotPosts(e.detail.post)) {
          // someone else sent the post
          vm.hotMessageStorage.unshift(e.detail.post);
          vm.hasNewMessages = true;
        }
      });

      NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.REMOVE, function (e) {
        //TODO:: Handel me
      });


      NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.UNBOOKMARKED, function (e) {
        if ($state.current.name === 'app.messages-bookmarked' ||
          $state.current.name === 'app.messages-bookmarked-sorted') {
          var message = _.find(vm.messages, {
            id: e.detail
          });

          if (message) {
            NstUtility.collection.dropById(vm.messages, message.id);
          }
        }
      });

      $rootScope.$on('post-removed', function (event, data) {

        var message = _.find(vm.messages, {
          id: data.postId
        });

        if (message) {

          if (vm.messages.length === 1) {
            loadMessages(true);
            getUnreadsCount();
          }

          if (data.placeId) { // remove the post from the place
            // remove the place from the post's places
            NstUtility.collection.dropById(message.places, data.placeId);

            // remove the post if the user has not access to see it any more
            var places = NstSvcPlaceFactory.filterPlacesByReadPostAccess(message.places);
            if ((_.isArray(places) && places.length === 0) || (vm.currentPlaceId && data.placeId == vm.currentPlaceId)) {
              NstUtility.collection.dropById(vm.messages, data.postId);
              return;
            }

          } else { //retract it
            NstUtility.collection.dropById(vm.messages, message.id);
          }
        }






      });

      $scope.$on('post-moved', function (event, data) {
        // there are tow conditions that a moved post should be removed from messages list
        // 1. The moved place is the one that you see its messages list (DONE)
        // 2. You moved a place to another one and none of the post new places
        //    are not marked to be shown in feeds page
        // TODO: Implement the second condition

        if ($stateParams.placeId === data.fromPlace.id) {

          if (vm.messages.length === 1) {
            loadMessages(true);
            getUnreadsCount();
          }


          NstUtility.collection.dropById(vm.messages, data.postId);
          return;
        }
      });

      setNavbarProperties();

    })();

    function getUnreadsCount() {
      return $q(function (resolve) {
        NstSvcPlaceFactory.getPlacesUnreadPostsCount([vm.currentPlaceId])
          .then(function (places) {
            _.each(places, function (obj) {
              vm.unreadCount = obj.count;
            });
            resolve();
          });
      });
    }

    function setNavbarProperties() {
      vm.navTitle = 'Feed';
      vm.navIconClass = 'all-places';


      if (isBookMark()) {
        vm.navTitle = 'Favorite Feed';
        vm.navIconClass = 'bookmarks';
      }

      if (isSent()) {
        vm.navTitle = 'Sent';
        vm.navIconClass = 'sent';
      }

    }

    function openContacts($event) {
      $state.go('app.contacts', {}, {notify: false});
      $event.preventDefault();
    };

    function getMessages() {
      vm.messagesSetting.skip = null;
      switch ($state.current.name) {
        case 'app.place-messages':
        case 'app.place-messages-sorted':
          return NstSvcPostFactory.getPlaceMessages(vm.messagesSetting, vm.currentPlaceId);

        case 'app.messages-bookmarked':
        case 'app.messages-bookmarked-sorted':
          vm.messagesSetting.skip = _.size(vm.messages);
          return NstSvcPostFactory.getBookmarkedMessages(vm.messagesSetting);

        case 'app.messages-sent':
        case 'app.messages-sent-sorted':
          return NstSvcPostFactory.getSentMessages(vm.messagesSetting);

        case 'app.messages-favorites':
        case 'app.messages-favorites-sorted':
          return NstSvcPostFactory.getFavoriteMessages(vm.messagesSetting);

        case 'app.place-messages-unread':
        case 'app.place-messages-unread':
          return NstSvcPostFactory.getUnreadMessages(vm.messagesSetting, [vm.currentPlaceId], false);


        default:
          return NstSvcPostFactory.getMessages(vm.messagesSetting);
      }
    }

    function loadViewSetting() {
      return $q(function (resolve, reject) {
        var setting = {
          content: readSettingItem(NST_MESSAGES_VIEW_SETTING.CONTENT),
          attachments: readSettingItem(NST_MESSAGES_VIEW_SETTING.ATTACHMENTS),
          comments: readSettingItem(NST_MESSAGES_VIEW_SETTING.COMMENTS),
          quickMessage: readSettingItem(NST_MESSAGES_VIEW_SETTING.QUICK_MESSAGE)
        };
        vm.viewSetting = _.defaults(setting, defaultViewSetting);
        resolve(vm.viewSetting);
      });
    }

    function loadMessages(force, after) {
      if (vm.loading || ((vm.noMessages || vm.reachedTheEnd || vm.errorInInitialLoading) && !force)) {
        return $q.resolve(vm.messages);
      }

      vm.tryAgainToLoadMore = false;
      vm.loading = true;

      return getAccessableMessages(after);
    }

    function getAccessableMessages(after) {
      var defer = $q.defer();

      if (after) {
        vm.messagesSetting.after = getFirstMessageTime();
      } else {
        vm.messagesSetting.date = getLastMessageTime();
        vm.messagesSetting.after = null;
      }


      getMessages().then(function (messages) {
        vm.cache = _.concat(vm.cache, messages);

        if (0 == vm.cache.length && !after) {
          vm.noMessages = true;
        }

        if (messages.length < vm.messagesSetting.limit && !after) {
          $log.debug('Messages | Reached the end because of less results: ', messages, after);
          vm.reachedTheEnd = true;
        }

        if (messages.length > 0) {
          var lastMessageVersion = vm.messages.slice();
          for (var i = 0; i < messages.length; i++) {
            var hasData = lastMessageVersion.filter(function (obj) {
              return (obj.id === messages[i].id);
            });
            messages[i].attachments = _.map(messages[i].attachments, function (item) {
              return new NstVmFile(item);
            });

            if (hasData.length === 0) {
              if (after) {
                vm.messages.unshift(messages[i]);
              } else {
                vm.messages.push(messages[i]);
              }

            }
          }
        }
        vm.tryAgainToLoadMore = false;
        vm.loading = false;
        defer.resolve(vm.messages);

      })
        .catch(function (error) {
          vm.loading = false;
          vm.tryAgainToLoadMore = true;
          defer.reject(error);
        });

      return defer.promise;
    }

    function loadMore(force) {
      vm.messagesSetting.limit = DEFAULT_MESSAGES_COUNT;
      vm.loadMoreCounter++;
      NstSvcInteractionTracker.trackEvent('posts', 'load more', vm.loadMoreCounter);

      return loadMessages(force).catch(function (error) {
        var deferred = $q.defer();

        $log.debug('Messages | Load More Error: ', error);
        deferred.reject.apply(null, arguments);

        return deferred.promise;
      });
    }

    function loadRemovePostAccess() {
      vm.placeRemoveAccess = vm.currentPlace.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
      return $q.resolve(vm.placeRemoveAccess);
    }


    // $rootScope.$on('post-quick', function (event, data) {
    //   // if (_.find(data.places, {id: vm.currentPlaceId}) || !vm.currentPlaceId) {
    //     loadMessages(true, true);
    //   // }
    // });

    function getFirstMessageTime() {

      var fists = _.first(vm.messages);

      if (!fists) {
        return moment().format('x');
      }
      var lastDate = NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY == vm.messagesSetting.sort ? fists.lastUpdate : fists.timestamp;
      if (moment.isMoment(lastDate)) {
        return lastDate.format('x');
      }

      return lastDate;
    }


    function getLastMessageTime() {

      var last = _.last(vm.messages);

      if (!last) {
        return moment().format('x');
      }
      var lastDate = !isSent() && NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY == vm.messagesSetting.sort ? last.lastUpdate : last.timestamp;
      if (moment.isMoment(lastDate)) {
        return lastDate.format('x');
      }

      return lastDate;
    }

    function toggleContentPreview() {
      vm.viewSetting.content = !vm.viewSetting.content;
      setSettingItem(NST_MESSAGES_VIEW_SETTING.CONTENT, vm.viewSetting.content);
    }

    function toggleCommentsPreview() {
      vm.viewSetting.comments = !vm.viewSetting.comments;
      setSettingItem(NST_MESSAGES_VIEW_SETTING.COMMENTS, vm.viewSetting.comments);
    }

    function toggleAttachmentsPreview() {
      vm.viewSetting.attachments = !vm.viewSetting.attachments;
      setSettingItem(NST_MESSAGES_VIEW_SETTING.ATTACHMENTS, vm.viewSetting.attachments);
    }

    function toggleQuickMessagePreview() {
      vm.viewSetting.quickMessage = !vm.viewSetting.quickMessage;
      setSettingItem(NST_MESSAGES_VIEW_SETTING.QUICK_MESSAGE, vm.viewSetting.quickMessage);
    }

    function generateUrls() {
      vm.urls = {
        latestActivity: '',
        latestMessages: ''
      };

      if (vm.currentPlaceId) {
        vm.urls.latestActivity = $state.href('app.place-messages-sorted', {
          placeId: vm.currentPlaceId,
          sort: NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY
        });
        vm.urls.latestMessages = $state.href('app.place-messages-sorted', {
          placeId: vm.currentPlaceId,
          sort: NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES
        });
      } else {
        vm.urls.latestActivity = $state.href('app.messages-sorted', {
          sort: NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY
        });
        vm.urls.latestMessages = $state.href('app.messages-sorted', {
          sort: NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES
        });
      }

    }

    function readSettingItem(key) {
      var value = NstSvcMessagesSettingStorage.get(key);

      return 'hide' !== value;
    }

    function setSettingItem(key, bool) {
      NstSvcMessagesSettingStorage.set(key, bool ? 'show' : 'hide');
    }

    function showNewMessages() {
      vm.cache = [];
      vm.messages = [];
      vm.revealHotMessage = true;
      vm.loading = true;
      getAccessableMessages().then(function () {
        vm.hotMessages = [];
        vm.hotMessageStorage = [];
        vm.hasNewMessages = false;
      }).catch(function () {
        vm.hasNewMessages = true;
      });


      $rootScope.$emit('unseen-activity-clear');
    }

    function dismissNewMessage() {
      vm.hasNewMessages = false;
      vm.revealHotMessage = false;
    }

    function insertMessage(list, item) {
      if (!_.some(list, {id: item.id})) {
        list.unshift(item);
      }
    }

    function isBookMark() {
      if ($state.current.name == 'app.messages-favorites' ||
        $state.current.name == 'app.messages-favorites-sorted') {
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
    }

    function isSubPersonal() {
      if (vm.currentPlaceId)
        return NstSvcAuth.user.id == vm.currentPlaceId.split('.')[0];
    }

    function isSent() {
      if ($state.current.name == 'app.messages-sent' ||
        $state.current.name == 'app.messages-sent-sorted') {
        vm.isSentMode = true;
        return true;
      }
      return false;
    }

    function isUnread() {
      if ($state.current.name == 'app.place-messages-unread' ||
        $state.current.name == 'app.place-messages-unread-sorted') {
        vm.isUnreadMode = true;
        return true;
      }
      return false;
    }

    function isConversation() {
      if ($state.current.name == 'app.conversation' ||
        $state.current.name == 'app.conversation-keyword') {
        return vm.isConvMode = true;
      }
      return vm.isConvMode = false;
    }

    function isFeed() {
      return _.includes([
        'app.'
      ])
    }

    function fillPlaceIds(container, list) {
      if (_.isObject(container) && _.keys(container).length > 1) {
        _.forIn(container, function (item) {
          if (_.isObject(item) && item.id) {
            list.push(item.id);

            fillPlaceIds(item.children, list);
          }
        });
      }
    };

    function loadMyPlaces() {
      var defer = $q.defer();

      NstSvcPlaceFactory.getMyTinyPlaces().then(function (myPlaces) {
        var flatPlaceIds = [];
        fillPlaceIds(myPlaces, flatPlaceIds);
        vm.myPlaceIds = flatPlaceIds;
        defer.resolve(flatPlaceIds);
      }).catch(defer.reject);

      return defer.promise;
    }


    function markAllAsRead() {
      NstSvcPlaceFactory.markAllPostAsRead($stateParams.placeId)
        .then(function (result) {

        });
    }

    function getQuickMessageAccess() {
      var defer = $q.defer();

      if (!vm.currentPlace.id || vm.isSentMode || vm.isUnreadMode) {
        vm.quickMessageAccess = false;
        defer.resolve(false);
      } else {
        vm.quickMessageAccess = vm.currentPlace.hasAccess(NST_PLACE_ACCESS.WRITE_POST);
      }

      return $q.resolve(vm.quickMessageAccess);
    }


    $scope.$on('$destroy', function () {
      NstSvcSync.closeChannel(vm.syncId);

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

    $rootScope.$on('reload-counters', function () {
      getUnreadsCount();
    });

  }

})();
