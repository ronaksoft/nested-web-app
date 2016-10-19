(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceCreateController', PlaceCreateController);

  /** @ngInject */
  function PlaceCreateController($q, $stateParams) {

    var vm = this;
    vm.hasGrandPlace = undefined;
    vm.place = {
      id: null,
      name: null,
      parentId: null,
      privacy: {
        email: null,
        locked: null,
        receptive: null,
        search: null
      },
      policy: {
        add_member: null,
        add_place: null,
      },
      favorite : null,
      notification: null
    };
    vm.placeIdIsAvailable = null;
    vm.placeIdChecking = null;
    vm.isOpenPlace = null;
    vm.isClosedPlace = null;
    vm.setPlaceOpen = setPlaceOpen;
    vm.setPlaceClosed = setPlaceClosed;
    vm.setId = setId;

    (function () {
      if (stateParamIsProvided($stateParams.placeId)) {
        vm.hasGrandPlace = true;
        vm.place.parentId = $stateParams.placeId;
      } else {
        vm.hasGrandPlace = false;
        vm.place.parentId = null;
      }

      vm.isCreateTeamMode = !vm.hasGrandPlace;
    })();


    function setPlaceOpen() {
      vm.place.privacy.locked = false;
      vm.isOpenPlace = true;
      vm.isClosedPlace = false;
    }

    function setPlaceClosed() {
      vm.place.privacy.locked = true;
      vm.isClosedPlace = true;
      vm.isOpenPlace = false;
    }

    function setReceivingOff(addPost) {
      vm.receivingMode = 'off';

      vm.place.privacy.receptive = false;
      vm.place.privacy.search = false;
      vm.place.privacy.addPost = addPost;
    }

    function setReceivingMembers(search) {
      vm.receivingMode = 'members';

      vm.place.privacy.receptive = 'internal';
      vm.place.privacy.search = search;
      vm.place.privacy.addPost = 'everyone';
    }

    function setReceivingEveryone(search) {
      vm.receivingMode = 'everyone';

      vm.place.privacy.receptive = 'external';
      vm.place.privacy.search = search;
      vm.place.privacy.addPost = 'everyone';
    }

    function setPolicyAddMember(value) {
      vm.place.policy.addMember = value;
    }

    function setPolicyAddPlace(value) {
      vm.place.policy.addPlace = value;
    }

    function stateParamIsProvided(parameter) {
      return !!parameter && parameter !== NST_DEFAULT.STATE_PARAM;
    }

    function checkIdAvailability(id) {
      // return NstSvcPlaceFactory.idIsAvailable(id);
      return $q.resolve(true);
    }

    function setId(name) {
      var id = _.kebabCase(name);
      vm.placeIdChecking = true;
      checkIdAvailability(id).then(function (result) {
        vm.place.id = id;
        vm.placeIdIsAvailable = true;
      }).catch(function (error) {
        vm.placeIdIsAvailable = false;
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.placeIdChecking = false;
      });
    }

    function save() {
      if (vm.hasGrandPlace) {
        hasAccessToAdd(vm.place.parentId).then(function (result) {
          createPlace(vm.place);
        }).catch(function (error) {
          NstSvcLogger.error(error);
        });
      } else {
        createPlace(vm.place);
      }
    }

    function createPlace(model) {
      NstSvcPlaceFactory.save(place).then(function (result) {
        continueToPlaceSettings(place.id);
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });
    }

    function hasAccessToAdd(grandPlaceId) {
      return NstSvcPlaceFactory.hasAccess(grandPlaceId, NST_PLACE_ACCESS.ADD_PLACE);
    }

    function continueToPlaceSettings(placeId) {
      $state.go('app.place-settings', { placeId : placeId });
    }
  }
})();
