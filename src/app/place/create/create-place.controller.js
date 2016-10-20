(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceCreateController', PlaceCreateController);

  /** @ngInject */
  function PlaceCreateController($q, $stateParams, $state, NST_DEFAULT, NstSvcPlaceFactory, NstUtility, $uibModal) {

    var vm = this;
    vm.hasGrandPlace = undefined;
    vm.memberOptions = [
      { key : 'creator', name : 'Master Keyholders Only' },
      { key : 'everyone', name : 'All Keyholders' }
    ];
    vm.place = {
      id: null,
      name: null,
      parentId: null,
      privacy: {
        email: true,
        locked: null,
        receptive: null,
        search: false,
        addPost: vm.memberOptions[0].key
      },
      policy: {
        addMember: vm.memberOptions[0].key,
        addPlace: vm.memberOptions[0].key,
      },
      favorite : true,
      notification: false
    };
    vm.placeIdIsAvailable = null;
    vm.placeIdChecking = null;
    vm.isOpenPlace = null;
    vm.isClosedPlace = null;
    vm.setPlaceOpen = setPlaceOpen;
    vm.setPlaceClosed = setPlaceClosed;
    vm.setId = _.debounce(setId, 1024);
    vm.setReceivingOff = setReceivingOff;
    vm.setReceivingMembers = setReceivingMembers;
    vm.setReceivingEveryone = setReceivingEveryone;

    vm.changeID = function (placeId) {
      console.log(placeId);
      // change place ID
      $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'app/place/create/change-id.html',
        resolve: {

        }
      }).result.then(function (result) {

      });
    };

    (function () {
      if (stateParamIsProvided($stateParams.placeId)) {
        vm.hasGrandPlace = true;
        vm.place.parentId = $stateParams.placeId;
      } else {
        vm.hasGrandPlace = false;
        vm.place.parentId = null;
      }
      vm.isCreateGrandPlaceMode = !vm.hasGrandPlace;
      vm.receivingMode = 'everyone';

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

    function setReceivingOff() {
      vm.receivingMode = 'off';

      vm.place.privacy.receptive = false;
      vm.place.privacy.search = false;
    }

    function setReceivingMembers() {
      vm.receivingMode = 'members';

      vm.place.privacy.receptive = 'internal';
      vm.place.privacy.addPost = 'everyone';
    }

    function setReceivingEveryone() {
      vm.receivingMode = 'everyone';

      vm.place.privacy.receptive = 'external';
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
      return NstSvcPlaceFactory.isIdAvailable(id);
      // return $q.resolve(true);
    }

    function setId(name) {
      var id = _.kebabCase(name.substr(0,36));
      vm.placeIdChecking = true;
      checkIdAvailability(id).then(function (available) {
        if (available) {
          vm.place.id = id;
          vm.placeIdIsAvailable = true;
        } else {
          setId(NstUtility.string.format("{0}-{1}", name, _.random(1,9999)));
        }
      }).catch(function (error) {

        NstSvcLogger.error(error);
      }).finally(function () {
        vm.placeIdIsAvailable = false;
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
