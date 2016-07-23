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
      limit: 10,
      skip: 0,
      sort: defaultSortOption
    };

    vm.toggleContentPreview = toggleContentPreview;
    vm.toggleAttachmentPreview = toggleAttachmentPreview;
    vm.toggleCommentsPreview = toggleCommentsPreview;
    vm.toggleQuickMessagePreview = toggleQuickMessagePreview;

    (function() {
      setPlace(vm.currentPlaceId).then(function(placeFound) {

        return $q.all([loadViewSetting(), loadSortOption(), loadRecentActivities(), getMessages()]);
      }).then(function(values) {
        if (values) {
          vm.ViewSetting = _.defaults(vm.defaultViewSetting, values[0]);
          vm.messagesSetting.sort = values[1] || vm.defaultSortOption;
          vm.activities = mapActivities(values[2]);
          vm.messages = mapMessages(values[3]);
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
      if (!_.includes([
          NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
          NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY
        ], option)) {
        throw 'The provided sort option key is not valid';
      }


      vm.messagesSetting.sort = option;
      loadMessages();
    }

    function loadMessages() {
      getMessages().then(function(messages) {
        vm.messages = mapMessages(messages);
      }).catch(function(error) {
        // TODO:  handle the error
      });
    }

    function loadMore() {
      vm.messagesSetting.skip += vm.messagesSetting.limit;
      loadMessages();
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

    NstSvcCommentFactory.addEventListener(NST_COMMENT_FACTORY_EVENT.COMMENT_ADDED, function(event) {
      // event.detail.object.then(function(message) {
      //   console.log(message);
      //   console.log('woohoo');
      //   console.log(event);
      //   // replaceMessage(message);
      // });
    });

    function replaceMessage(message) {
      var messageIndex = _.findIndex(vm.messages, function(item) {
        return item.id === message.id;
      });

      vm.messages.splice(messageIndex, 1, mapMessage(message));
    }

  }

})();
