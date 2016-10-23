(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceCreateController', PlaceCreateController);

  /** @ngInject */
  function PlaceCreateController($scope, $q, $stateParams, $state, NST_DEFAULT, NstSvcPlaceFactory, NstUtility, $uibModal, NST_PLACE_ACCESS, NstSvcLogger) {

    var vm = this;

    var placeIdRegex = /^[A-Za-z][A-Za-z0-9-]*$/;

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
    vm.setId = setId;
    vm.setReceivingOff = setReceivingOff;
    vm.setReceivingMembers = setReceivingMembers;
    vm.setReceivingEveryone = setReceivingEveryone;
    vm.save = save;
    vm.changeId = changeId;

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

    function changeId(placeId) {
      vm.place.tempId = vm.place.id;
      // change place ID
      $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'app/place/create/change-id.html',
        scope: $scope
      }).result.then(function (result) {
        if(result == 'ok')
          vm.place.id = vm.place.tempId;
      }).catch(function (reason) {
        console.log(reason)
      });
    };

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

    function setId(name) {
      var newId = generateId(name, vm.place.id);
      if (newId !== vm.place.id) {
        vm.place.id = newId;
      }

      checkIdAvailabilityLazily(vm.place.id);
    }

    var checkIdAvailabilityLazily = _.debounce(checkIdAvailability, 640);

    function checkIdAvailability(id, deferred) {
      var deferred = deferred || $q.defer();

      vm.placeIdChecking = true;
      NstSvcPlaceFactory.isIdAvailable(id).then(function (available) {
        if (available) {
          vm.place.id = id;
          vm.placeIdIsAvailable = true;
        } else {
          checkIdAvailability(generateUinqueId(id), deferred);
        }
      }).catch(function (error) {

        NstSvcLogger.error(error);
      }).finally(function () {
        vm.placeIdIsAvailable = false;
        vm.placeIdChecking = false;
      });

      return deferred.promise;
    }

    function generateId(name, previousId) {
      var camelCaseName = _.camelCase(name);

      // only accepts en numbers and alphabets
      if (placeIdRegex.test(camelCaseName)) {
        return _.kebabCase(name.substr(0,36));
      } else if (!vm.place.id) {
        return _.random(99999,999999).toString();
      }

      return previousId;
    }

    function generateUinqueId(id) {
      return NstUtility.string.format("{0}-{1}", id, _.random(1,9999));
    }

    function save(isValid) {
      vm.submitted = true;

      if (!isValid) {
        return;
      }

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
      NstSvcPlaceFactory.create(model).then(function (place) {
        console.log(place);
        continueToPlaceSettings(place.id);
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });
    }

    function hasAccessToAdd(grandPlaceId) {
      return NstSvcPlaceFactory.hasAccess(grandPlaceId, NST_PLACE_ACCESS.ADD_PLACE);
    }

    function continueToPlaceSettings(placeId) {
      console.log(placeId);
      $state.go('app.place-settings', { placeId : placeId });
    }
  }
})();
