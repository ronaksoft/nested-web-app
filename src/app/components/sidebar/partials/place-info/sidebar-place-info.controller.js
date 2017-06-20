(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarPlaceInfoController', SidebarPlaceInfoController);

  /** @ngInject */
  function SidebarPlaceInfoController($rootScope, $q, $scope, $state, $stateParams, $window, _,
                                      NstSvcLogger,
                                      NstSvcPostFactory, NstSvcPlaceFactory, NstSvcPlaceMap, NstUtility, NstSvcSync,
                                      NST_PLACE_FACTORY_EVENT, NST_DEFAULT, NstVmPlace, NstSvcServer, NST_SRV_EVENT, NST_EVENT_ACTION) {
    var vm = this;
    var eventReferences = [];

    vm.loading = false;
    vm.currentPlaceId = $stateParams.placeId;
    vm.hasNotUnreadPostInChildren = hasNotUnreadPostInChildren;

    vm.range = function (num) {
      var seq = [];
      for (var i = 0; i < num; i++) {
        seq.push(i);
      }

      return seq;
    };


    function Initializing() {

      vm.loading = true;
      vm.children = [];


      if ($stateParams.placeId) {
        var grandPlaceId = $stateParams.placeId.split('.')[0];

        NstSvcPlaceFactory.getFavoritesPlaces()
          .then(function (list) {
            list.map(function (obj) {
              vm.placesFavoritesObject[obj] = true;
            })
          });

        getGrandPlaceChildren(grandPlaceId).then(function (places) {
          vm.children = places;
        }).catch(function (error) {
          NstSvcLogger.error(error);
        }).finally(function () {
          vm.loading = false;
        });
      }

    }


    $scope.$watch(function () {
      return $stateParams.placeId;
    }, function () {
      vm.currentPlaceId = $stateParams.placeId;
    });

    Initializing();

    $scope.$watch(function () {
      if ($stateParams.placeId) {
        return $stateParams.placeId.split('.')[0];
      } else {
        return false
      }
    }, function () {
      if ($stateParams.placeId) {
        Initializing();
      }
    });


    function getGrandPlaceChildren(grandPlaceId) {
      var deferred = $q.defer();
      NstSvcPlaceFactory.getGrandPlaceChildren(grandPlaceId).then(function (places) {

        var placesList = _.map(places, function (place) {
          var model = new NstVmPlace(place);
          model.isStarred = place.isStarred;
          model.href = $state.href('app.place-messages', {placeId: place.id});
          return model;
        });


        fillPlacesNotifCountObject(placesList);
        getPlaceUnreadCounts();

        deferred.resolve(NstSvcPlaceMap.toTree(placesList, $stateParams.placeId));

      }).catch(deferred.reject);

      return deferred.promise;
    }


    /*****************************
     *****   Notifs Counters  ****
     *****************************/


    function fillPlacesNotifCountObject(places) {
      vm.placesNotifCountObject = {};
      _.each(places, function (place) {
        if (place)
          vm.placesNotifCountObject[place.id] = place.unreadPosts || 0;
      });
      if (vm.grandPlace) {
        vm.placesNotifCountObject[vm.grandPlace.id] = 0;
      }
    }

    function getPlaceUnreadCounts() {
      var placeIds = _.keys(vm.placesNotifCountObject);
      if (placeIds.length > 0)
        NstSvcPlaceFactory.getPlacesUnreadPostsCount(placeIds)
          .then(function (places) {
            _.each(places, function (obj) {
              vm.placesNotifCountObject[obj.place_id] = obj.count;
            });
          });
    }

    function hasNotUnreadPostInChildren(placeId) {
      var hasUnread = false;
      if (vm.placesNotifCountObject)
        for (var key in vm.placesNotifCountObject) {
          if (key.indexOf(placeId + '.') === 0 && vm.placesNotifCountObject[key] > 0) {
            hasUnread = true;
          }
        }
      return !hasUnread;
    }


    /*****************************
     *****   Handel Bookmark  ****
     *****************************/
    vm.placesFavoritesObject = {};


    function clearPlace(placeId) {
      if (placeId) {
        if (_.has(vm.placesNotifCountObject, placeId)) {
          delete vm.placesNotifCountObject[placeId];
        }
        if (_.has(vm.placesFavoritesObject, placeId)) {
          delete vm.placesFavoritesObject[placeId];
        }
        var grandSonId = NstUtility.place.getGrandParentId(placeId, 2);
        NstSvcPlaceFactory.removePlaceFromTree(vm.children, placeId, grandSonId);
      }
    }

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.SUB_ADD, function () {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.addPlaceToTree(vm.children, mapPlace(event.detail.place));
      Initializing();
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.UPDATE, function () {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.updatePlaceInTree(vm.children, mapPlace(event.detail.place));

      Initializing();
    });


    NstSvcSync.addEventListener(NST_EVENT_ACTION.POST_ADD, function () {
      getPlaceUnreadCounts();
    });


    eventReferences.push($rootScope.$on('post-read', function (event, data) {
      getPlaceUnreadCounts();
    }));

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.READ_ALL_POST, function () {
      getPlaceUnreadCounts();
    });

    eventReferences.push($rootScope.$on('place-bookmark', function (e, data) {
      vm.placesFavoritesObject[data.placeId] = data.bookmak;
    }));

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.READ_ALL_POST, function () {
      getPlaceUnreadCounts();
    });

    NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
      NstSvcLogger.debug('Retrieving sub-places count right after reconnecting.');
      getPlaceUnreadCounts();
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.REMOVE, function (event) {
      clearPlace(event.detail);
    });


    $rootScope.$on('reload-counters', function () {
      NstSvcLogger.debug('Retrieving the sub-place unreads count right after focus.');
      getPlaceUnreadCounts();
    });

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
