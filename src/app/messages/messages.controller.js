(function() {
    'use strict';

    angular
      .module('nested')
      .controller('MessagesController', MessagesController);

    /** @ngInject */
    function MessagesController($rootScope, $scope, $location, $q, $stateParams, $log, $timeout, $state,
      NST_MESSAGES_SORT_OPTION, NST_STORAGE_EVENT, NST_COMMENT_FACTORY_EVENT, NST_MESSAGES_VIEW_SETTING, NST_DEFAULT, NST_SRV_EVENT, NST_EVENT_ACTION,
      NstSvcPostFactory, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcCommentFactory, NstSvcServer,
      NstSvcMessagesSettingStorage, NstSvcPostStorage,
      NstSvcPostMap, NstSvcActivityMap) {

      var vm = this;
      vm.messages = [];
      vm.cache = [];
      var DEFAULT_MESSAGES_COUNT = 8;
      var defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
        defaultViewSetting = {
          content: true,
          attachments: true,
          comments: true,
          quickMessage: true,
        },
        sortOptionStorageKey = 'sort-option';

      vm.loadMore = loadMore;

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

      (function() {
        if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
          vm.currentPlaceId = null;
        } else {
          vm.currentPlaceId = $stateParams.placeId;
        }

        if (!$stateParams.sort || $stateParams.sort === NST_DEFAULT.STATE_PARAM) {
          vm.messagesSetting.sort = NstSvcMessagesSettingStorage.get(sortOptionStorageKey);
        } else {
          vm.messagesSetting.sort = $stateParams.sort;
          NstSvcMessagesSettingStorage.set(sortOptionStorageKey, vm.messagesSetting.sort);
        }

        generateUrls();

        setPlace(vm.currentPlaceId).then(function(placeFound) {

          return $q.all([loadViewSetting(), loadRecentActivities(), loadMessages()]);
        }).then(function(values) {
            
        }).catch(function(error) {
          $log.debug(error)
        });

      })();

      function getMessages() {
        if (!vm.currentPlace) {
          return NstSvcPostFactory.getMessages(vm.messagesSetting);
        } else {
          return NstSvcPostFactory.getPlaceMessages(vm.messagesSetting, vm.currentPlace.id);
        }
      }

      function loadViewSetting() {
        return $q(function(resolve, reject) {
          var setting = {
            content: readSettingItem(NST_MESSAGES_VIEW_SETTING.CONTENT),
            attachments: readSettingItem(NST_MESSAGES_VIEW_SETTING.ATTACHMENTS),
            comments: readSettingItem(NST_MESSAGES_VIEW_SETTING.COMMENTS),
            quickMessage: readSettingItem(NST_MESSAGES_VIEW_SETTING.QUICK_MESSAGE),
          };
          vm.viewSetting = _.defaults(setting, vm.defaultViewSetting);
          resolve(vm.viewSetting);
        });
      }

      function loadSortOption() {
        return $q(function(resolve, reject) {
          var option = NstSvcMessagesSettingStorage.get(sortOptionStorageKey, defaultSortOption);
          resolve(option);
        });
      }

      function loadMessages() {
        var defer = $q.defer();

        vm.messagesSetting.date = getLastMessageTime();

        getMessages().then(function(messages) {
          vm.cache = _.concat(vm.cache, messages);
          vm.messages = mapMessages(vm.cache);
          defer.resolve(vm.messages);
        }).catch(defer.reject);

        return defer.promise;
      }

      function loadMore() {
        vm.messagesSetting.limit = DEFAULT_MESSAGES_COUNT;
        loadMessages().then(function() {});
      }

      function getLastMessageTime() {

        var last = _.last(_.orderBy(vm.cache, 'date', 'desc'));
        if (!last) {

          return moment().format('x');
        }
        if (moment.isMoment(last.date)) {
          return last.date.format('x');
        }

        return last.date.getTime();
      }

      function loadRecentActivities() {
        var defer = $q.defer();

        var settings = {
          limit: 10,
          placeId: null
        };

        if (vm.currentPlace) {
          settings.placeId = vm.currentPlace.id;
        }

        NstSvcActivityFactory.getRecent(settings).then(function(activities) {
          vm.activities = mapActivities(activities);
          defer.resolve(vm.activities);
        }).catch(defer.reject);

        return defer.promise;
      }

      function mapMessage(post) {
        return NstSvcPostMap.toMessage(post);
      }

      function mapMessages(messages) {
        return _.map(messages, mapMessage);
      }

      function mapActivities(activities) {
        return _.map(activities, NstSvcActivityMap.toRecentActivity);
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
        if (!id) {
          defer.resolve(false);
        } else {
          return NstSvcPlaceFactory.get(id).then(function(place) {
            if (place && place.id) {
              vm.currentPlace = place;
              defer.resolve(true);
            } else {
              vm.currentPlace = null;
              defer.resolve(false);
            }
          }).catch(defer.reject);
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

      vm.scroll = function(event) {
        var element = event.currentTarget;
        if (element.scrollTop + element.clientHeight === element.scrollHeight) {
          $log.debug("load more");
          vm.loadMore();
        }
      };

      function readSettingItem(key) {
        var value = NstSvcMessagesSettingStorage.get(key);

        if (value === 'hide') {
          return false;
        }

        return true;
      }

      function setSettingItem(key, bool) {
        NstSvcMessagesSettingStorage.set(key, bool ? 'show' : 'hide');
      }

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function(e) {
          switch (e.detail.timeline_data.action) {
            case NST_EVENT_ACTION.POST_ADD:
              var postId = e.detail.timeline_data.post_id.$oid;
              NstSvcPostFactory.getMessage(postId).then(function (post) {
                  if (!vm.currentPlaceId || post.belongsToPlace(vm.currentPlaceId)) {
                      vm.cache.splice(0, 1, post);
                      vm.messages.splice(0, 1, mapMessage(post));
                  }
              }).catch(function (error) {
                 $log.debug(error);
              });
              break;
            case NST_EVENT_ACTION.POST_REMOVE:
              var postId = e.detail.timeline_data.post_id.$oid;
              var messageIndex = _.findIndex(vm.messages, {
                'id': postId
              });
              if (messageIndex !== -1) {
                vm.messages.splice(messageIndex, 1);
              }
              break;
          }
      });

      //FIXE some times it got a problem ( delta causes )
      vm.preventParentScroll = function (event) {
        var element = event.currentTarget;
        var delta = event.wheelDelta;
        // console.log('element.scrollHeight', element.scrollHeight, 'element.clientHeight', element.clientHeight, 'delta', delta, 'element.scrollTop', element.scrollTop);
        (element.scrollTop === (element.scrollHeight - element.clientHeight) && delta > 0) && console.log('To Bottom - Delta > 0', delta);
        (element.scrollTop === 0 && delta < 0) && console.log('To Top - Delta < 0', delta);
        if ((element.scrollTop === (element.scrollHeight - element.clientHeight) && delta < 0) || (element.scrollTop === 0 && delta > 0)) {
          event.preventDefault();
        }
      }
    }

})();
