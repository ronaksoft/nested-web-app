(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $q, $stateParams, $log, $timeout, $state, $interval, $scope,
                              moment,
                              NST_MESSAGES_SORT_OPTION, NST_MESSAGES_VIEW_SETTING, NST_DEFAULT, NST_SRV_EVENT, NST_EVENT_ACTION, NST_POST_FACTORY_EVENT,NST_PLACE_ACCESS,
                              NstSvcPostFactory, NstSvcPlaceFactory, NstSvcServer, NstSvcLoader, NstSvcTry, NstUtility, NstSvcAuth,
                              NstSvcMessagesSettingStorage,
                              NstSvcPostMap) {

    var vm = this;

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

    vm.loadMore = loadMore;
    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.noMessages = false;
    vm.loading = false;
    vm.loadMessageError = false;
    // Reveals hot message when user wants to show new messages
    vm.revealHotMessage = false;
    vm.showNewMessages = showNewMessages;
    vm.dismissNewMessage = dismissNewMessage;

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


    (function () {
      isUnread();
      vm.isSentMode = 'messages-sent' === $state.current.name;

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        vm.currentPlaceId = null;
      } else {
        vm.currentPlaceId = $stateParams.placeId;
      }

      if (!$stateParams.sort || $stateParams.sort === NST_DEFAULT.STATE_PARAM) {
        vm.messagesSetting.sort = NstSvcMessagesSettingStorage.get(sortOptionStorageKey, defaultSortOption);
      } else {
        vm.messagesSetting.sort = $stateParams.sort;
        NstSvcMessagesSettingStorage.set(sortOptionStorageKey, vm.messagesSetting.sort);
      }

      generateUrls();

      if (vm.currentPlaceId) {
        setPlace(vm.currentPlaceId).then(function (place) {
          console.log(place);
          if (place) {
            return NstSvcLoader.inject($q.all([loadViewSetting(), loadMessages(), loadMyPlaces()])).catch(function (error) {
              $log.debug(error);
              vm.loadMessageError = true;
            });
          }
        }).catch(function (error) {
          vm.errorInInitialLoading = true;
          $log.debug(error);
        });
      } else {
        vm.currentPlaceLoaded = true;
        NstSvcLoader.inject($q.all([loadViewSetting(), loadMessages(), loadMyPlaces()])).catch(function (error) {
          $log.debug(error);
          vm.loadMessageError = true;
        });
      }

      if (isBookMark()){

        NstSvcPlaceFactory.getBookmarkedPlaces('_starred')
          .then(function (data) {
            vm.bookmarkedPlaces = data;
        });
      }

      NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.ADD, function (e) {
        var newMessage = e.detail;

        if (isBookMark()){
          if (!_.some(vm.messages, { id : newMessage.id }) &&
            _.intersectionWith(vm.bookmarkedPlaces, newMessage.places , function (a, b) {
              return a == b
            }).length > 0){
              vm.hotMessageStorage.unshift(newMessage);
              vm.hasNewMessages = true;
              $rootScope.$emit('unseen-activity-notify', vm.hotMessageStorage.length);
          }
          return;
        }


        if (!vm.currentPlaceId  || _.includes(newMessage.places, vm.currentPlaceId)) {
          if (!_.some(vm.messages, { id : newMessage.id })){
            vm.hotMessageStorage.unshift(newMessage);
            vm.hasNewMessages = true;
            $rootScope.$emit('unseen-activity-notify', vm.hotMessageStorage.length);
          }
        }

      });

      NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.REMOVE, function (e) {
        //TODO:: Handel me
      });

      $rootScope.$on('post-removed', function (event, data) {
        if (_.some(vm.messages, { id : data.postId })) {
          var message = _.find(vm.messages, { id : data.postId });
          // remove the place from the post's places
          NstUtility.collection.dropById(message.allPlaces, data.placeId);

          // remove the post if the user has not access to see it any more
          NstSvcPlaceFactory.filterPlacesByReadPostAccess(message.allPlaces).then(function (places) {
            if (_.isArray(places)) {
              if (places.length === 0 || (vm.currentPlaceId && data.placeId == vm.currentPlaceId )) {
                NstUtility.collection.dropById(vm.messages, data.postId);
                return;
              }
            }

          }).catch(function (error) {
            $log.debug(error);
          });
        }

      });

      setNavbarProperties();

      if ($stateParams.postId) {
        $state.go('app.message', { postId : $stateParams.postId } , { notify : false });
      }
    })();

    function setNavbarProperties() {
      vm.navTitle = 'All Places';
      vm.navIconClass = 'icon-nav icon-all-places';


      if (isBookMark()) {
        vm.navTitle = 'Bookmarks';
        vm.navIconClass = 'icon-nav icon-top-bookmarks';
      }

      if (vm.isSentMode){
        vm.navTitle = 'Sent';
        vm.navIconClass = 'icon-nav icon-top-sent';
      }

    }

    function getMessages() {
      switch ($state.current.name) {
        case 'app.place-messages':
        case 'app.place-messages-sorted':
          return NstSvcPostFactory.getPlaceMessages(vm.messagesSetting, vm.currentPlace.id);

        case 'app.messages-sent':
        case 'app.messages-sent-sorted':
          return NstSvcPostFactory.getSentMessages(vm.messagesSetting);

        case 'app.messages-bookmarks':
        case 'app.messages-bookmarks-sorted':
          return NstSvcPostFactory.getBookmarksMessages(vm.messagesSetting);

        case 'app.place-messages-unread':
        case 'app.place-messages-unread':
          return NstSvcPostFactory.getUnreadMessages(vm.messagesSetting, [vm.currentPlace.id.split(".")[0]], true);


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

    function loadMessages(force) {
      if (vm.loading || ((vm.noMessages || vm.reachedTheEnd || vm.errorInInitialLoading) && !force)) {
        return $q.resolve(vm.messages);
      }

      var defer = $q.defer();
      vm.tryAgainToLoadMore = false;
      vm.loading = true;

      if (vm.currentPlaceId){
        return NstSvcPlaceFactory.hasAccess(vm.currentPlaceId, NST_PLACE_ACCESS.READ).then(function (has) {
          if (has){
            return getAccessableMessages();
          } else {
            vm.noMessages = true;
            return defer.resolve(vm.messages);
          }
        })
      } else {
        return getAccessableMessages();
      }

      return defer.promise;
    }

    function getAccessableMessages() {
      var defer = $q.defer();
      vm.messagesSetting.date = getLastMessageTime();

      getMessages().then(function (messages) {
        vm.cache = _.concat(vm.cache, messages);

        if (0 == vm.cache.length) {
          vm.noMessages = true;
        }

        if (messages.length < vm.messagesSetting.limit) {
          $log.debug('Messages | Reached the end because of less results: ', messages);
          vm.reachedTheEnd = true;
        }

        if (messages.length > 0) {
          var lastMessageVersion = vm.messages.slice();

          for (var i = 0; i < messages.length; i++) {
            var hasData = lastMessageVersion.filter(function (obj) {
              return (obj.id === messages[i].id);
            });

            if (hasData.length === 0) {
                vm.messages.push(mapMessage(messages[i]));
            } else {
              // Todo :: remove this line after fixed by server
              $log.debug('Messages | Reached the end because of duplication: ', hasData);
              vm.reachedTheEnd = true;
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

      return NstSvcLoader.inject(loadMessages(force)).catch(function (error) {
          var deferred = $q.defer();

          $log.debug('Messages | Load More Error: ', error);
          deferred.reject.apply(null, arguments);

          return deferred.promise;
        });
    }

    function getLastMessageTime() {

      var last = _.last(vm.cache);

      if (!last) {
        return moment().format('x');
      }

      var lastDate = NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY == vm.messagesSetting.sort ? last.updatedDate : last.date;
      if (moment.isMoment(lastDate)) {
        return lastDate.format('x');
      }

      return lastDate.getTime();
    }

    function mapMessage(post) {
      var firstId = vm.currentPlaceId ? vm.currentPlaceId : NstSvcAuth.user.id;
      return NstSvcPostMap.toMessage(post, firstId, vm.myPlaceIds);
    }

    function mapMessages(messages) {
      return _.map(messages, mapMessage);
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

    function setPlace(id) {
      var defer = $q.defer();
      vm.currentPlace = null;
      if (!id) {
        defer.reject(new Error('Could not find a place without Id.'));
      } else {
        NstSvcPlaceFactory.get(id).then(function (place) {
          if (place && place.id) {
            vm.currentPlace = place;
            vm.currentPlaceLoaded = true;
          }
          defer.resolve(vm.currentPlace);
        }).catch(function (error) {
          defer.reject(error);
        });
      }

      return defer.promise;
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
      if (!_.some(list, { id : item.id })) {
        list.unshift(item);
      }
    }

    function isBookMark() {
      if ($state.current.name == 'app.messages-bookmarks' ||
        $state.current.name == 'app.messages-bookmarks-sorted'){
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
    }

    function isUnread() {
      if ($state.current.name == 'app.place-messages-unread' ||
        $state.current.name == 'app.place-messages-unread-sorted'){
        vm.isUnreadMode = true;
        return true;
      }
      return false;
    }


    function fillPlaceIds(container, list) {
      if (_.isObject(container) && _.keys(container).length > 1) {
        _.forIn(container, function (item) {
          if (_.isObject(item) && item.id){
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

  }

})();
