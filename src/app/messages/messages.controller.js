(function () {
  'use strict';

  angular
    .module('nested')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $q, $stateParams, $log, $timeout, $state,
                              NST_MESSAGES_SORT_OPTION, NST_MESSAGES_VIEW_SETTING, NST_DEFAULT, NST_SRV_EVENT, NST_EVENT_ACTION, NST_POST_FACTORY_EVENT,NST_PLACE_ACCESS,
                              NstSvcPostFactory, NstSvcPlaceFactory, NstSvcServer, NstSvcLoader, NstSvcTry, NstUtility,
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
    vm.newMessages = [];
    vm.hotMessages = [];
    vm.cache = [];
    vm.hasNewMessages = false;

    vm.loadMore = loadMore;
    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.noMessages = false;
    vm.loading = false;
    vm.loadMessageError = false;
    vm.getNewMessagesCount = getNewMessagesCount;
    vm.showNewMessages = showNewMessages;

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
          if (place) {
            return NstSvcLoader.inject($q.all([loadViewSetting(), loadMessages()])).catch(function (error) {
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
        NstSvcLoader.inject($q.all([loadViewSetting(), loadMessages()])).catch(function (error) {
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
            _.intersectionWith(vm.bookmarkedPlaces, newMessage.getPlaces(), function (a, b) {
              return a == b.getId()
            }).length > 0){
              var item = mapMessage(newMessage);
              item.isHot = true;
              vm.newMessages.unshift(item);
              vm.hasNewMessages = true;
          }
          return;
        }

        if (!vm.currentPlaceId || newMessage.belongsToPlace(vm.currentPlaceId)) {
          if (!_.some(vm.messages, { id : newMessage.id })){
            var item = mapMessage(newMessage);
            item.isHot = true;
            vm.newMessages.unshift(item);
            vm.hasNewMessages = true;
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
        case 'place-messages':
        case 'place-messages-sorted':
          return NstSvcPostFactory.getPlaceMessages(vm.messagesSetting, vm.currentPlace.id);

        case 'messages-sent':
        case 'messages-sent-sorted':
          return NstSvcPostFactory.getSentMessages(vm.messagesSetting);

        case 'messages-bookmarks':
        case 'messages-bookmarks-sorted':
          return NstSvcPostFactory.getBookmarksMessages(vm.messagesSetting);

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
      return NstSvcPostMap.toMessage(post);
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
        vm.urls.latestActivity = $state.href('place-messages-sorted', {
          placeId: vm.currentPlaceId,
          sort: NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY
        });
        vm.urls.latestMessages = $state.href('place-messages-sorted', {
          placeId: vm.currentPlaceId,
          sort: NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES
        });
      } else {
        vm.urls.latestActivity = $state.href('messages-sorted', {
          sort: NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY
        });
        vm.urls.latestMessages = $state.href('messages-sorted', {
          sort: NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES
        });
      }

    }

    function getNewMessagesCount() {
      return vm.newMessages.length;
    }

    function readSettingItem(key) {
      var value = NstSvcMessagesSettingStorage.get(key);

      return 'hide' !== value;
    }

    function setSettingItem(key, bool) {
      NstSvcMessagesSettingStorage.set(key, bool ? 'show' : 'hide');
    }

    function showNewMessages(ans,wrapper) {
      if (ans == "yes") {
        //clear hot items
        _.forEachRight(vm.hotMessages, function (item) {
          insertMessage(vm.messages, item);
        });

        vm.hotMessages.length = 0;
        //push newMessages to hotMessages
        _.forEachRight(vm.newMessages, function (item) {
          insertMessage(vm.hotMessages, item);
        });

        vm.newMessages.length = 0;

        $('#wrapper').mCustomScrollbar("scrollTo","top",{
          scrollEasing:"easeOut"
        });
      }

      vm.hasNewMessages = false;
    }

    function insertMessage(list, item) {
      if (!_.some(list, { id : item.id })) {
        list.unshift(item);
      }
    }

    function isBookMark() {
      if ($state.current.name == 'messages-bookmarks' ||
        $state.current.name == 'messages-bookmarks-sorted'){
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
    }

    vm.preventParentScroll = function (event) {
      var element = event.currentTarget;
      var delta = event.wheelDelta;
      if ((element.scrollTop === (element.scrollHeight - element.clientHeight) && delta < 0) || (element.scrollTop === 0 && delta > 0)) {
        event.preventDefault();
      }
    };


    // FIXME: NEEDS REWRITE COMPLETELY
    vm.swipeLeft = function () {
      $state.go('activity')
    };
    vm.swipeBotton = function () {
      $rootScope.navView = false
    };
    var tl = new TimelineLite({});
    var cp = document.getElementById("cp1");
    var nav = document.getElementsByTagName("nst-navbar")[0];
    $timeout(function () {
      $rootScope.navView = false
    });
    vm.bodyScrollConf = {
      axis: 'y',
      scrollInertia: 500,
      //autoDraggerLength: true,
      //keyboard:{ enable: true },
      //contentTouchScroll: 1,
      //documentTouchScroll: true,
      //scrollEasing:"easeOut",
      advanced: {
        updateOnContentResize: true
      },
      scrollButtons: {
        scrollAmount: 'auto', // scroll amount when button pressed
        enable: true // enable scrolling buttons by default
      },
      callbacks: {
        whileScrolling: function () {
          var t = -this.mcs.top;
          //$timeout(function () { $rootScope.navView = t > 55; });
          //console.log(tl);
          // tl.kill({
          //   y: true
          // }, cp);
          // TweenLite.to(cp, 0.5, {
          //   y: 140,
          //   ease: Power2.easeOut,
          //   force3D: true
          // });
          if (t > 55 && !$rootScope.navView) {
            //$('#content-plus').clone().prop('id', 'cpmirror').appendTo("#mCSB_3_container");
            //var z = $('#content-plus').offset().left + 127;
            //console.log(z);
            //$('#cpmirror').css({'opacity':0});
            //$('#content-plus').css({position: 'fixed',marginLeft: 356});
            //tl.kill({minHeight:true,maxHeight:true}, nav);
            // TweenLite.to(nav, 0.1, {
            //   minHeight: 96,
            //   maxHeight: 96,
            //   height: 96,
            //   ease: Power1.easeOut
            // });
            $timeout(function () {
              $rootScope.navView = t > 55;
            });
          } else if (t < 55 && $rootScope.navView) {
            // TweenLite.to(nav, 0.1, {
            //   minHeight: 183,
            //   maxHeight: 183,
            //   height: 183,
            //   ease: Power1.easeOut
            // });
            $timeout(function () {
              $rootScope.navView = t > 55;
            });
          }

          //tl.lagSmoothing(200, 20);
          tl.play();
          // $("#content-plus").stop().animate(
          //   {marginTop:t}, {duration:1});
          // TweenMax.to("#cp1", .001, {
          //   y: t, ease:SlowMo.ease.config(0.7, 0.7, true)
          // });
          //TweenMax.lagSmoothing(500, 33);


          //   var func = function () {
          //     console.log(t);
          //     $("#content-plus").animate(
          //       {marginTop:t}, {duration:1, easing:"easeOutStrong"});
          //   };
          //   var debounced = _.debounce(func, 250, { 'maxWait': 1000 });
          //   if ( t > 0) {
          //     debounced();
          //   } else if(t == 0){
          //   $("#content-plus").stop().css({
          //     marginTop: 0
          //   });
          // }
        },
        onTotalScroll: function () {
          vm.loadMore();
        },
        onTotalScrollOffset: 10,
        alwaysTriggerOffsets: false
      }
    };
  }

})();
