(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MessageChainController', MessageChainController);

  /** @ngInject */
  function MessageChainController($rootScope, $scope, $q, $stateParams, $log, $state,
    moment,
    NST_DEFAULT,
    NstSvcPostFactory, NstSvcLoader, NstSvcTry, NstUtility, NstSvcAuth, NstSvcPlaceFactory,
    NstSvcPostMap) {
    var vm = this;

    (function() {
      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        vm.currentPlaceId = null;
      } else {
        vm.currentPlaceId = $stateParams.placeId;
      }

      if (!$stateParams.postId || $stateParams.postId === NST_DEFAULT.STATE_PARAM) {
        vm.currentPlaceId = null;
      } else {
        vm.postId = $stateParams.postId;
      }

      if (vm.currentPlaceId) {
        setPlace(vm.currentPlaceId).then(function(place) {
          if (place) {
            loadMessages();
          }
        }).catch(function(error) {
          $log.debug(error);
        });
      } else {
        loadMessages();
      }
    })();

    function loadMessages() {
      NstSvcPostFactory.getChainMessages($stateParams.postId).then(function(messages) {
        vm.messages = mapMessages(messages);
      }).catch(function(error) {
        $log.debug(error);
      });

    }

    function mapMessage(post) {
      var firstId = vm.currentPlaceId ? vm.currentPlaceId : NstSvcAuth.user.id;
      return NstSvcPostMap.toMessage(post, firstId, vm.myPlaceIds);
    }

    function mapMessages(messages) {
      return _.map(messages, mapMessage);
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


  }

})();
