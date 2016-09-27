(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MessageChainController', MessageChainController);

  /** @ngInject */
  function MessageChainController($rootScope, $scope, $q, $stateParams, $log, $state,
    moment,
    NST_DEFAULT, NST_MESSAGES_VIEW_SETTING,
    NstSvcPostFactory, NstSvcLoader, NstSvcTry, NstUtility, NstSvcAuth, NstSvcPlaceFactory,
    NstSvcPostMap, NstSvcMessagesSettingStorage) {
    var vm = this;

    var defaultViewSetting = {
      content: true,
      attachments: true,
      comments: true,
      quickMessage: true
    };
    vm.messages = [];
    vm.myPlaceIds = [];
    vm.loading = false;
    vm.selectedPostId = null;
    vm.currentPlaceId = null;

    (function() {
      vm.loading = true;
      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        vm.currentPlaceId = null;
      } else {
        vm.currentPlaceId = $stateParams.placeId;
      }

      if (!$stateParams.postId || $stateParams.postId === NST_DEFAULT.STATE_PARAM) {
        vm.selectedPostId = null;
        return false;
      } else {
        vm.selectedPostId = $stateParams.postId;
      }

      if (vm.currentPlaceId) {
        setPlace(vm.currentPlaceId).then(function(place) {
          if (place) {
            $q.all([loadViewSetting(), loadMessages()]).then(function () {
              vm.loading = false;
            }).catch(function () {
              vm.loading = false;
              $log.debug(error);
            });
          }
        }).catch(function(error) {
          $log.debug(error);
        });
      } else {
        $q.all([loadViewSetting(), loadMessages()]).then(function () {
          vm.loading = false;
        }).catch(function (error) {
          vm.loading = false;
          $log.debug(error);
        });
      }
    })();

    function loadMessages() {
      return $q(function (resolve, reject) {
        NstSvcPostFactory.getChainMessages(vm.selectedPostId).then(function(messages) {
          vm.messages = mapMessages(messages);
          resolve(vm.messages);
        }).catch(reject);
      });
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

    function mapMessage(post) {
      var firstId = vm.currentPlaceId ? vm.currentPlaceId : NstSvcAuth.user.id;
      return NstSvcPostMap.toMessage(post, firstId, vm.myPlaceIds);
    }

    function mapMessages(messages) {
      return _.reduce(messages, function (memo, message, number, array) {
        if (message.id) {
          memo.push(mapMessage(message));
        } else {
          var previous = array[number - 1];
          if (previous && previous.id) {
            memo.push({
                id : _.uniqueId('forbidden_'),
                forbidden : true
            });
          }
        }

        return memo;
      }, []);
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

    function readSettingItem(key) {
      var value = NstSvcMessagesSettingStorage.get(key);

      return 'hide' !== value;
    }

    function setSettingItem(key, bool) {
      NstSvcMessagesSettingStorage.set(key, bool ? 'show' : 'hide');
    }


  }

})();
