(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarPlaceInfoController', SidebarPlaceInfoController);

  /** @ngInject */
  function SidebarPlaceInfoController($q, $scope, $state, $stateParams, NstSvcLogger, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcPlaceMap,
                                      NST_POST_FACTORY_EVENT, NST_PLACE_FACTORY_EVENT, NST_DEFAULT, NstVmPlace) {
    var vm = this;
    vm.loading = false;
    vm.currentPlaceId = $stateParams.placeId;

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

      var grandPlaceId = vm.grandPlace.id;
      getGrandPlaceChildren(grandPlaceId).then(function (places) {
        vm.children = places;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.loading = false;
      });
    }


    $scope.$watch(function () {
      return $stateParams.placeId;
    },function () {
      vm.currentPlaceId = $stateParams.placeId;
    });


    $scope.$watch(function () {
      if (vm.grandPlace) {
        return vm.grandPlace.id;
      }else{
        return false
      }
    },function () {
      if (vm.grandPlace) {
        Initializing();
      }
    });

    function findGrandPlaceId(placeId) {
      return _.first(_.split(placeId, "."));
    }

    function stateParamIsProvided(parameter) {
      return !!parameter && parameter !== NST_DEFAULT.STATE_PARAM;
    }

    function getSubplaceInfo(grandPlaceId){
      var deferred = $q.defer();

      NstSvcPlaceFactory.get(grandPlaceId).then(function (place) {
        deferred.resolve(new NstVmPlace(place))
      }).catch(deferred.reject);

      return deferred.promise;

    }

    function getGrandPlaceChildren(grandPlaceId) {
      var deferred = $q.defer();
      NstSvcPlaceFactory.getGrandPlaceChildren(grandPlaceId).then(function (places) {

        var placesList =_.map(places, function (place) {
          var model = new NstVmPlace(place);
          model.isStarred = place.isStarred;
          model.href = $state.href('app.place-messages', { placeId : place.id });
          return model;
        });

        fillPlacesBookmarkObject(placesList);
        fillPlacesNotifCountObject(placesList);
        getPlaceUnreadCounts();

        deferred.resolve(NstSvcPlaceMap.toTree(placesList, $stateParams.placeId));

      }).catch(deferred.reject);

      return deferred.promise;
    }


    /*****************************
     *****   Notifs Counters  ****
     *****************************/
    vm.placesNotifCountObject = {};

    function fillPlacesNotifCountObject(places) {
      _.each(places, function (place) {
        if (place)
          vm.placesNotifCountObject[place.id] = place.unreadPosts || 0;
      });
      vm.placesNotifCountObject[vm.grandPlace.id] = 0;
    }

    function getPlaceUnreadCounts() {
      var placeIds = _.keys(vm.placesNotifCountObject);
      if (placeIds.length > 0)
        NstSvcPlaceFactory.getPlacesUnreadPostsCount(placeIds)
          .then(function(places){
            _.each(places, function (value, placeId) {
              vm.placesNotifCountObject[placeId] = value;
            })
          });
    }


    /*****************************
     *****   Handel Bookmark  ****
     *****************************/
    vm.placesBookmarkObject = {};

    function fillPlacesBookmarkObject(places) {
      _.each(places, function (place) {
        if (place)
          vm.placesBookmarkObject[place.id] = place.isStarred || false;
      });
    }


    /*****************************
     *****  Event Listeners   ****
     *****************************/

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.SUB_ADD, function (event) {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.addPlaceToTree(vm.children, mapPlace(event.detail.place));
      Initializing();
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.UPDATE, function (event) {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.updatePlaceInTree(vm.children, mapPlace(event.detail.place));

      Initializing();
    });


    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.REMOVE, function (event) {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.removePlaceInTree(vm.children, mapPlace(event.detail.place));
      Initializing();
    });



    NstSvcPlaceFactory.addEventListener(NST_POST_FACTORY_EVENT.ADD, function (e) {
      getPlaceUnreadCounts();
    });


    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.BOOKMARK_ADD, function (e) {
      vm.placesBookmarkObject[e.detail.id] = true;
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.BOOKMARK_REMOVE, function (e) {
      vm.placesBookmarkObject[e.detail.id] = false;
    });



    NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.READ, function (e) {
      getPlaceUnreadCounts();
    });

  }
})();
