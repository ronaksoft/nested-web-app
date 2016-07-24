;
(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $scope, $location, $q, $stateParams, $log, $timeout,
    NST_MESSAGES_SORT_OPTION, NST_STORAGE_EVENT, NST_COMMENT_FACTORY_EVENT,
    NstSvcPostFactory, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcCommentFactory,
    NstSvcMessageSettingStorage, NstSvcPostStorage,
    NstSvcPostMap, NstSvcActivityMap) {

    var vm = this;
    vm.messages = [];
    vm.cache = [];
    var DEFAULT_MESSAGES_COUNT = 8;
    var FILTER_ALL = '!$all';
    var defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
      defaultViewSetting = {
        content: true,
        attachments: true,
        comments: true,
        quickMessage: true,
      },
      sortOptionStorageKey = 'sort-option',
      viewSettingStorageKey = 'view-setting';

    if (!$stateParams.placeId || $stateParams.placeId === '_') {
      vm.currentPlaceId = null;
    } else {
      vm.currentPlaceId = $stateParams.placeId;
    }

    vm.filter = $stateParams.filter || FILTER_ALL;
    vm.loadMore = loadMore;
    vm.sort = sort;

    vm.messagesSetting = {
      limit : DEFAULT_MESSAGES_COUNT,
      skip : 0,
      sort : defaultSortOption,
      date : null
    };

    vm.toggleContentPreview = toggleContentPreview;
    vm.toggleAttachmentPreview = toggleAttachmentPreview;
    vm.toggleCommentsPreview = toggleCommentsPreview;
    vm.toggleQuickMessagePreview = toggleQuickMessagePreview;

    (function() {
      setPlace(vm.currentPlaceId).then(function(placeFound) {

        return $q.all([loadViewSetting(), loadSortOption(), loadRecentActivities(), loadMessages()]);
      }).then(function(values) {
        if (values) {
          vm.ViewSetting = _.defaults(vm.defaultViewSetting, values[0]);
          vm.messagesSetting.sort = values[1] || vm.defaultSortOption;
          vm.activities = mapActivities(values[2]);
        }

        $log.debug(vm);
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
        // var setting = NstSvcMessageSettingStorage.get(viewSettingStorageKey, defaultViewSetting);
        // resolve(setting);
        resolve(defaultViewSetting)
      });
    }

    function loadSortOption() {
      return $q(function(resolve, reject) {
        // var option = NstSvcMessageSettingStorage.get(sortOptionStorageKey, defaultSortOption);
        // resolve(option);
        resolve(defaultSortOption);
      });
    }

    function sort(option) {
      vm.messagesSetting.sort = option;
      var cacheSize = vm.cache.length;
      vm.cache = [];
      vm.messagesSetting.date = null;
      vm.messagesSetting.limit = cacheSize;
      loadMessages();
    }

    function loadMessages() {
      var defer = $q.defer();

      vm.messagesSetting.date = getLastMessageTime();
      getMessages().then(function(messages) {
        vm.cache = _.concat(vm.cache, messages);
        vm.messages = mapMessages(vm.cache);
        console.log(vm.messages);
        defer.resolve(vm.messages);
      }).catch(defer.reject);

      return defer.promise;
    }

    function loadMore() {
      vm.messagesSetting.limit = DEFAULT_MESSAGES_COUNT;
      loadMessages().then(function () {
      });
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
        defer.resolve(activities);
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
      vm.messagesSetting.contentPreview = !vm.messagesSetting.contentPreview;
    }

    function toggleCommentsPreview() {
      vm.messagesSetting.commentsPreview = !vm.messagesSetting.commentsPreview;
    }

    function toggleAttachmentPreview() {
      vm.messagesSetting.attachmentPreview = !vm.messagesSetting.attachmentPreview;
    }

    function toggleQuickMessagePreview() {
      vm.messagesSetting.quickMessagePreview = !vm.messagesSetting.quickMessagePreview;
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



    // FIXME: NEEDS REWRITE COMPLETELY
    vm.scroll = {
      callbacks: {
        whileScrolling:function(){
          var t = -this.mcs.top;
          console.log(t);
          $timeout(function () { $rootScope.navView = t > 55; });

          //$('.nst-navbar').toggleClass('tiny', t > 55);

          if ( t > 0) {
            $("#content-plus").stop().css({
              marginTop: t
            });
          } else if(t == 0){
            $("#content-plus").stop().css({
              marginTop: 0
            });
          }


        },
        onTotalScroll:function () {
          vm.loadMore();
        },
        onTotalScrollOffset:10,
        alwaysTriggerOffsets:false
      }
    };

  }

})();
