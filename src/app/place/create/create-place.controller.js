(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceCreateController', PlaceCreateController);

  /** @ngInject */
  function PlaceCreateController($scope, $q, $stateParams, $state, toastr, $rootScope, $uibModalStack,
                                 NST_DEFAULT, NST_SRV_ERROR, NST_PLACE_ADD_TYPES, NST_PLACE_MEMBER_TYPE, NST_PLACE_POLICY_OPTION,
                                 NST_PLACE_TYPE, NST_PLACE_ACCESS,
                                 NST_STORE_UPLOAD_TYPE,
                                 NstSvcAuth, NstSvcPlaceFactory, NstSvcStore, NstVmMemberItem, NstSvcUserFactory,
                                 NstUtility, $uibModal, $uibModalInstance, NstSvcLogger, NstSvcTranslation) {

    $scope.NST_PLACE_POLICY_OPTION = NST_PLACE_POLICY_OPTION;
    $scope.NST_PLACE_TYPE = NST_PLACE_TYPE;
    var vm = this;


    var placeIdRegex = /^[A-Za-z][A-Za-z0-9-]*$/;

    vm.hasParentPlace = null;
    vm.step = 1;
    vm.postPolicy = 0;
    vm.loadImage = loadImage;
    vm.reciveLevel = 'l1';
    vm.memberLevel = 'l1';
    vm.createLevel = 'l1';
    vm.hasGrandParent = null;
    vm.placeIdIsFullAvailable = true;
    vm.memberOptions = [
      {key: 'creators', name: 'Managers Only'},
      {key: 'everyone', name: 'All Members'}
    ];
    vm.teammates = [];
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
        addPost: NST_PLACE_POLICY_OPTION.MANAGERS,
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
    vm.showAddOrInviteMember = showAddOrInviteMember;
    vm.setAddPostPolicy = setAddPostPolicy;
    vm.updateSearchPrivacy = updateSearchPrivacy;
    vm.getPlaceType = getPlaceType;
    vm.updateAddMemberPolicy = updateAddMemberPolicy;
    vm.updateAddPlacePolicy = updateAddPlacePolicy;
    vm.uploadCreatedPlaceMoreOption = uploadCreatedPlaceMoreOption;
    (function () {
      vm.isPersonalPlace = $stateParams.placeId.split('.')[0] === NstSvcAuth.user.id;

      if (stateParamIsProvided($stateParams.placeId)) {
        vm.hasParentPlace = true;
        vm.place.parentId = $stateParams.placeId;
        vm.placesParts = $stateParams.placeId.split('.');
        if ($stateParams.placeId !== NST_DEFAULT.STATE) {
          loadParentPlace(vm.placesParts).catch(function (error) {
            toastr.error(NstSvcTranslation.get("There seems to be an error in reaching information from the highest-ranking Place."));
          });
        }
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


      vm.addPostLevel = NST_PLACE_POLICY_OPTION.MANAGERS;
      vm.addPlaceLevel = NST_PLACE_POLICY_OPTION.MANAGERS;
      vm.addMemberLevel = NST_PLACE_POLICY_OPTION.MANAGERS;

      vm.teammates.push(new NstVmMemberItem(NstSvcUserFactory.currentUser, NST_PLACE_MEMBER_TYPE.KEY_HOLDER));

      $rootScope.$on('member-removed', function (event, data) {
        NstUtility.collection.dropById(vm.teammates, data.member.id);
      });
      $rootScope.$on('member-demoted', function (event, data) {
        var member = vm.teammates.filter(function (m) {
          return m.id === data.member.id
        });
        if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
      });
      $rootScope.$on('member-promoted', function (event, data) {
        var member = vm.teammates.filter(function (m) {
          return m.id === data.member.id
        });
        if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.CREATOR;
      });

    })();


    function loadImage(event) {
      var file = event.currentTarget.files[0];


      $uibModal.open({
        animation: false,
        size: 'no-miss crop',
        templateUrl: 'app/settings/profile/crop/change-pic.modal.html',
        controller: 'CropController',
        resolve: {
          argv: {
            file: file,
            type: 'square'
          }
        },
        controllerAs: 'ctlCrop'
      }).result.then(function (croppedFile) {
        vm.logoFile = croppedFile;
        vm.logoUrl = '';

        var reader = new FileReader();
        reader.onload = function (readEvent) {
          NstSvcLogger.info('The picture is loaded locally and going to be sent to server.');
          vm.logoUrl = readEvent.target.result;

        };

        reader.readAsDataURL(vm.logoFile);
      }).catch(function () {
        event.target.value = '';
      });

    }


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

    function changeId(isValid, placeId, $close) {
      var deferred = $q.defer();

      if (!isValid) {
        deferred.reject();
      }

      return checkIdAvailability(placeId.replace(vm.place.parentId + '.', ''), deferred, true)
        .then(function (res) {
          if (res) {
            vm.placeIdIsFullAvailable = true;
            $close()
          }
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

    function checkIdAvailability(id, deferred, dontGenerate) {
      var deferred = deferred || $q.defer();

      vm.placeIdChecking = true;
      vm.placeIdIsFullAvailable = true;
      NstSvcPlaceFactory.isIdAvailable(vm.place.parentId ? vm.place.parentId + '.' + id : id)
        .then(function (available) {
          if (available) {
            vm.place.id = vm.place.parentId ? vm.place.parentId + '.' + id : id;
            vm.placeIdIsAvailable = true;
            vm.placeIdIsFullAvailable = true;
            deferred.resolve(true);
          } else {
            if (!dontGenerate) {
              checkIdAvailability(generateUinqueId(id), deferred);
            } else {
              deferred.resolve(false);
            }
            vm.placeIdIsAvailable = false;
          }
        }).catch(function (error) {
        deferred.reject(error);
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

      NstSvcPlaceFactory.create(model, placetype)
        .then(function (place) {
          vm.createdPlace = place;
          return setFavorite(place.id, true);
        })
        .then(function (result) {
          return addOrInviteMembers(vm.createdPlace);
        })
        .then(function (result) {
          return uploadPlacePicture()
        })
        .then(function (result) {
          NstSvcPlaceFactory.get(vm.createdPlace.id, true).then(function (createdPlace) {
            vm.createdPlace = createdPlace;
            vm.step = 3;
          })
        })
        .catch(function (error) {
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

    function showAddOrInviteMember(role) {
      var role = role || NST_PLACE_MEMBER_TYPE.KEY_HOLDER;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-add-member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'addMemberCtrl',
        size: 'sm',
        resolve: {
          chosenRole: function () {
            return role;
          },
          currentPlace: function () {
            return vm.place;
          },
          mode: function () {
            return "offline-mode"
          },
          isForGrandPlace: function () {
            return $stateParams.placeId === NST_DEFAULT.STATE_PARAM ? true : false
          }
        }
      });

      modal.result.then(function (selectedUsers) {
        vm.teammates = vm.teammates.concat(_.map(selectedUsers, function (item) {
          return new NstVmMemberItem(item, NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
        }));

      });
    }

    function updateSearchPrivacy(result) {
      var deferred = $q.defer();
      vm.place.privacy.search = result;
      deferred.resolve();
      return deferred.promise;
    }

    function uploadPlacePicture() {
      var deferred = $q.defer();
      var request = NstSvcStore.uploadWithProgress(vm.logoFile, logoUploadProgress, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE);

      request.getPromise().then(function (result) {

        NstSvcPlaceFactory.updatePicture(vm.place.id, result.data.universal_id).then(function (result) {
          NstSvcLogger.info(NstUtility.string.format('Place {0} picture updated successfully.', vm.place.id));
          deferred.resolve();
        }).catch(function (error) {
          NstSvcLogger.error(error);
          toastr.warning(NstSvcTranslation.get("Your place created successfully but an error has occurred in uploading the Place photo."));
          deferred.resolve()
        });


      });

    }

    function logoUploadProgress(event) {
      vm.logoUploadedSize = event.loaded;
      vm.logoUploadedRatio = Number(event.loaded / event.total).toFixed(4);

      NstSvcLogger.error(NstUtility.string.format('Upload progress : {0}%', vm.logoUploadedRatio));
    }

    function addOrInviteMembers(place) {

      var successRes = [];
      var failedRes = [];

      return $q.all(_.map(vm.teammates, function (user) {
        return $q(function (resolve, reject) {
          var command = vm.isCreateGrandPlaceMode ? 'inviteUser' : 'addUser';
          NstSvcPlaceFactory[command](place, user.role, user).then(function (invitationId) {
            successRes.push(user.id);
            NstSvcLogger.info(NstUtility.string.format('User "{0}" has been invited to Place "{1}" successfully.', user.id, place.id));

            resolve({
              user: user,
              role: user.role,
              invitationId: vm.isCreateGrandPlaceMode ? invitationId : -1,
            });
          }).catch(function (error) {
            failedRes.push(user.id);

            // FIXME: Why cannot catch the error!
            if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
              NstSvcLogger.warn(NstUtility.string.format('User "{0}" has been previously invited to Place "{1}".', user.id, place.id));
              resolve({
                user: user,
                role: user.role,
                invitationId: null,
                duplicate: true
              });
            } else {
              reject(error);
            }
          });
        });

      }))
        .catch(function (error) {
          NstSvcLogger.error(error);
        });

    }

    function setAddPostPolicy(value) {
      vm.postPolicy = value;
      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
          vm.place.privacy.receptive = 'off';
          vm.place.policy.addPost = 'creators';
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          vm.place.privacy.receptive = 'off';
          vm.place.policy.add_post = 'everyone';
          break;
        case NST_PLACE_POLICY_OPTION.TEAMMATES:
          vm.place.privacy.receptive = 'internal';
          vm.place.policy.add_post = 'everyone';
          break;
        case NST_PLACE_POLICY_OPTION.EVERYONE:
          vm.place.privacy.receptive = 'external';
          vm.place.policy.add_post = 'everyone';
          break;
        default:
          return $q.reject(Error("Policy add_post is not valid : " + value));
      }
      return $q.resolve();
    }

    function getPlaceType(place) {
      if (NstUtility.place.isGrand(place.id)) {

        return NST_PLACE_TYPE.GRAND;
      } else if (place.privacy.locked) {

        return NST_PLACE_TYPE.PRIVATE;
      } else if (!place.privacy.locked) {

        return NST_PLACE_TYPE.COMMON;
      } else if (place.id === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.PERSONAL;
      } else if (NstUtility.place.getGrandId(place.id) === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.SUB_PERSONAL;
      } else {

        throw Error("Could not figure out place type");
      }
    }

    function updateAddMemberPolicy(result) {
      var deferred = $q.defer();
      vm.addMemberPolicy = result;
      deferred.resolve();
      return deferred.promise;
    };

    function updateAddPlacePolicy(result) {
      var deferred = $q.defer();
      vm.addPlacePolicy = result;
      deferred.resolve();
      return deferred.promise;
    };

    function uploadCreatedPlaceMoreOption() {
      if (!vm.addMemberPolicy && !vm.addPlacePolicy) {
        $uibModalStack.dismissAll();
        setTimeout(function () {
          $state.go('app.place-messages', {placeId: vm.createdPlace.id});
        },200);
        return;
      }

      var addMember = getAddMemberPolicy(vm.addMemberPolicy);
      var addPlace = getAddPlacePolicy(vm.addPlacePolicy);

      update({'policy.add_place': addPlace, 'policy.add_member': addMember}).then(function () {
        toastr.success(NstSvcTranslation.get('Your settings saved.'));
        $uibModalStack.dismissAll();
        setTimeout(function () {
          $state.go('app.place-messages', {placeId: vm.createdPlace.id});
        },200);
      })
    }

    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcPlaceFactory.update(vm.place.id, params).then(function () {
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error has occured while trying to update the place settings.'));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    function getAddMemberPolicy(value) {
      var newValue = null;

      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
          newValue = "creators";
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          newValue = "everyone";
          break;
        default:
          return $q.reject(Error("Policy add_member is not valid : " + value));
      }

      return newValue;
    }

    function getAddPlacePolicy(value) {
      var newValue = null;

      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
          newValue = "creators";
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          newValue = "everyone";
          break;
        default:
          return $q.reject(Error("Policy add_place is not valid : " + value));
      }

      return newValue;
    }

  }
})
();
