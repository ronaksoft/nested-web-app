(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceCreateController', PlaceCreateController);

  /** @ngInject */
  function PlaceCreateController($scope, $q, $stateParams, $state, toastr, NST_DEFAULT, NST_SRV_ERROR, NST_PLACE_ADD_TYPES,
                                 NstSvcAuth, NstSvcPlaceFactory,
                                 NstUtility, $uibModal, $uibModalInstance, NST_PLACE_ACCESS, NstSvcLogger, NstSvcTranslation) {

    var vm = this;

    var placeIdRegex = /^[A-Za-z][A-Za-z0-9-]*$/;

    vm.hasParentPlace = null;
    vm.step = 1;
    vm.hasGrandParent = null;
    vm.placeIdIsFullAvailable = true;
    vm.memberOptions = [
      {key: 'creators', name: 'Managers Only'},
      {key: 'everyone', name: 'All Members'}
    ];
    vm.place = {
      id: null,
      name: null,
      parentId: null,
      privacy: {
        email: true,
        locked: null,
        receptive: null,
        search: false
      },
      policy: {
        addPost: vm.memberOptions[0].key,
        addMember: vm.memberOptions[0].key,
        addPlace: vm.memberOptions[0].key,
      },
      favorite: true,
      notification: true,
      fillMembers: 'none'
    };
    vm.placeIdIsAvailable = null;
    vm.hasRandomId = null;
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
      vm.isPersonalPlace = $stateParams.placeId.split('.')[0] === NstSvcAuth.user.id;

      if (stateParamIsProvided($stateParams.placeId)) {
        vm.hasParentPlace = true;
        vm.place.parentId = $stateParams.placeId;
        vm.placesParts = $stateParams.placeId.split('.');
        loadParentPlace(vm.placesParts).catch(function (error) {
          toastr.error(NstSvcTranslation.get("There seems to be an error in reaching information from the highest-ranking Place."));
        });
      } else {
        vm.hasParentPlace = false;
        vm.place.parentId = null;
      }
      vm.isCreateGrandPlaceMode = !vm.hasParentPlace;
      setReceivingEveryone();

      if ($stateParams.isOpenPlace) {
        vm.isOpenPlace = true;
        vm.isClosedPlace = false;
        setPlaceOpen();
      } else {
        vm.isOpenPlace = false;
        vm.isClosedPlace = true;
      }

      if (vm.isClosedPlace) {

        vm.place.privacy.locked = true;
        vm.isClosedPlace = true;
        vm.isOpenPlace = false;
      }
      if (vm.isSubPersonalPlace) {
        vm.isOpenPlace = false;
        vm.isClosedPlace = true;
      }


    })();

    function loadParentPlace(parentIds) {
      var deferred = $q.defer();

      vm.parentLoadProgress = true;
      NstSvcPlaceFactory.get(parentIds.join('.')).then(function (place) {
        if (parentIds.length === 1) {
          vm.hasGrandParent = true;
          vm.grandPlace = place;
          deferred.resolve(true);
        } else {
          vm.parentPlace = place;
          vm.hasParentPlace = true;
          NstSvcPlaceFactory.get(parentIds[0]).then(function (grandPlace) {
            vm.hasGrandParent = true;
            vm.grandPlace = grandPlace;
            deferred.resolve(true);
          }).catch(deferred.reject);
        }
      }).catch(deferred.reject).finally(function () {
        vm.parentLoadProgress = false;
      });

      return deferred.promise;
    }

    function changeId(placeId) {
      vm.place.tempId = vm.place.id;
      // change place ID
      $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'app/place/create/change-id.html',
        scope: $scope
      }).result.then(function (result) {
        if (result == 'ok')
          vm.place.id = vm.place.tempId;
      }).catch(function (reason) {
        NstSvcLogger.error(reason)
      });
    }

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
      vm.place.policy.addPost = 'everyone';
    }

    function setReceivingEveryone() {
      vm.receivingMode = 'everyone';

      vm.place.privacy.receptive = 'external';
      vm.place.policy.addPost = 'everyone';
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
        vm.placeIdIsAvailable = false;
        checkIdAvailabilityLazily(vm.place.id);
      }
    }

    var checkIdAvailabilityLazily = _.debounce(checkIdAvailability, 640);

    function checkIdAvailability(id, deferred) {
      var deferred = deferred || $q.defer();

      vm.placeIdChecking = true;
      vm.placeIdIsFullAvailable = true;
      NstSvcPlaceFactory.isIdAvailable(vm.place.parentId ? vm.place.parentId + '.' + id : id).then(function (available) {
        if (available) {
          vm.place.id = id;
          vm.placeIdIsAvailable = true;
          vm.placeIdIsFullAvailable = true;
        } else {
          checkIdAvailability(generateUinqueId(id), deferred);
        }
      }).catch(function (error) {
        vm.placeIdIsFullAvailable = false;
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
        vm.hasRandomId = false;
        return _.kebabCase(name.substr(0, 36));
      } else if (!vm.hasRandomId) {
        vm.hasRandomId = true;
        return generateUinqueId("place");
      }

      return previousId;
    }

    function generateUinqueId(id) {
      return NstUtility.string.format("{0}-{1}", id, _.padStart(_.random(99, 9999), 4, "0"));
    }

    function save(isValid) {
      vm.submitted = true;

      if (!isValid) {
        return;
      }

      if (vm.hasParentPlace) {
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
      var placetype = undefined;

      if (vm.isCreateGrandPlaceMode) {
        placetype = NST_PLACE_ADD_TYPES.ADD_GRAND_PLACE
      } else if (vm.isOpenPlace) {
        placetype = NST_PLACE_ADD_TYPES.ADD_UNLOCKED_PLACE
      } else {
        placetype = NST_PLACE_ADD_TYPES.ADD_LOCKED_PLACE
      }

      NstSvcPlaceFactory.create(model, placetype).then(function (place) {
        setFavorite(place.id, vm.place.favorite).then(function (result) {

          return setNotification(place.id, vm.place.notification);
        }).then(function (result) {
          continueToPlaceMessages(place.id);
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get('Sorry, An error has occured while configuring the place.'));
        });
      }).catch(function (error) {
        NstSvcLogger.error(error);

        if (error.message[0] === "place_id") {
          toastr.error(NstSvcTranslation.get("You can not use this 'Place ID'."));
        } else if (error.code === NST_SRV_ERROR.LIMIT_REACHED) {
          toastr.error(NstSvcTranslation.get("You can't create any additional Places."));
        } else {
          toastr.error(NstSvcTranslation.get('Sorry, An error has occured while creating the place.'));
        }
      });
    }

    function hasAccessToAdd(grandPlaceId) {
      return $q.resolve(vm.grandPlace.hasAccess(NST_PLACE_ACCESS.ADD_PLACE));
    }

    function continueToPlaceMessages(placeId) {
      $uibModalInstance.close();
      $state.go('app.place-messages', {placeId: placeId});
    }

    function setFavorite(placeId, favorite) {
      if (favorite) {
        return NstSvcPlaceFactory.setBookmarkOption(placeId, null, true);
      } else {
        return $q.resolve(favorite);
      }
    }

    function setNotification(placeId, notification) {
      if (notification) {
        return NstSvcPlaceFactory.setNotificationOption(placeId, true);
      } else {
        return $q.resolve(notification);
      }
    }

  }
})();
