(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($location, $scope, $stateParams, $q, $uibModal, $log,
    NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory,
    NstPlace, NstPicture) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.members = {};
    vm.options = {
      notification : null
    };
    vm.hasRemoveAccess = null;
    vm.hasAddPlaceAccess = null;
    vm.hasControlAccess = null;
    vm.hasAddMembersAccess = null;
    vm.hasSeeMembersAccess = null;

    vm.updatePrivacy = updatePrivacy;
    vm.setNotification = setNotification;
    vm.update = update;
    vm.addMember = addMember;
    vm.inviteParticipant = inviteParticipant;
    vm.loadImage = loadImage;

    (function() {
      vm.place = {};
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;
      NstSvcPlaceFactory.get(vm.placeId).then(function(place) {
        vm.place = place;

        return $q.all([
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.REMOVE_PLACE),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_PLACE),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.CONTROL),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_MEMBERS),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.SEE_MEMBERS),
          NstSvcPlaceFactory.getNotificationOption(vm.placeId)
        ]);
      }).then(function(values) {

        vm.hasRemoveAccess = values[0];
        vm.hasAddPlaceAccess = values[1];
        vm.hasControlAccess = values[2];
        vm.hasAddMembersAccess = values[3];
        vm.hasSeeMembersAccess = values[4];
        vm.options.notification = values[5];

        return vm.hasSeeMembersAccess ? NstSvcPlaceFactory.getMembers(vm.placeId)
                                      : $q(function (resolve) {
                                        resolve([]);
                                      });
      }).then(function (members) {

          vm.members.creators = members.creators;
          vm.members.keyHolders = members.keyHolders;
          vm.members.knownGuests = members.knownGuests;


        return vm.hasSeeMembersAccess ? NstSvcPlaceFactory.getPendings(vm.placeId)
                                      : $q(function (resolve) {
                                        resolve([]);
                                      });
      }).then(function (pendings) {

        vm.members.pendingKeyHolders = pendings.pendingKeyHolders;
        vm.members.pendingKnownGuests = pendings.pendingKnownGuests;

        vm.hasAnyGuest = _.some(vm.members.knownGuests) ||
                         _.some(vm.members.pendingKnownGuests);

        vm.hasAnyTeamate = _.some(vm.members.creators) ||
                           _.some(vm.members.keyHolders) ||
                           _.some(vm.members.pendingKeyHolders);
      }).catch(function(error) {
        $log.debug(error);
      });

    })();

    vm.actions = {
      'leave': {
        name: 'Leave',
        fn: function() {
          vm.leaveModal();
        }
      }
    };

    vm.imgToUri = function(event) {
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function(event) {
          $scope.place.picture.org.url = event.target.result;
          $scope.place.picture.x32.url = $scope.place.picture.org.url;
          $scope.place.picture.x64.url = $scope.place.picture.org.url;
          $scope.place.picture.x128.url = $scope.place.picture.org.url;

          return NstSvcStore.upload($scope.logo, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE).then(function(response) {
            $scope.place.picture.org.uid = response.universal_id;
            $scope.logo = null;

            return $scope.place.setPicture(response.universal_id);
          });
        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.updatePlace = function(name, value) {
      var data = {};
      data[name] = value;

      return $scope.place.update(data);
    };


    $scope.checkplace = function(PlaceId) {
      if (PlaceId == $scope.place.id) {
        $scope.deleteValidated = true;
      } else {
        $scope.deleteValidated = false;
      }
    };

    function showAddModal(role) {

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/add_member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'addMemberCtrl',
        size: 'sm',
        resolve : {
          chosenRole : function () {
            return role;
          },
          currentPlace : function () {
            return vm.place;
          }
        },
      });

      modal.result.then(function (selectedUsers) {
        $q.all(_.map(selectedUsers, function (user) {
          return $q(function (resolve, reject) {
            return NstSvcPlaceFactory.addUser(vm.place, role, user).then(function (inviteId) {
              resolve({
                userId : user.id,
                inviteId : inviteId
              });
            }).catch(function (error) {
              if (error.err_code === NST_SRV_ERROR.DUPLICATE){
                resolve({
                  userId : user.id,
                  inviteId : null,
                  duplicate : true
                });
              } else {
                reject(error);
              }
            });
          });
        })).then(function (values) {

        }).catch(function (error) {
          $log.debug(error);
        });
      });
    };

    function addMember() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
    }

    function inviteParticipant() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KNOWN_GUEST);
    }

    vm.showLockModal = function(event) {
      event.preventDefault();
      event.stopPropagation();

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/warning.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function() {
        var data = {};
        data['privacy.locked'] = $scope.place.privacy.locked;

        return $scope.place.update(data);
      }).catch(function() {
        $scope.place.privacy.locked = !$scope.place.privacy.locked;
      });

      return false;
    };

    vm.showDeleteModal = function() {

      $scope.deleteValidated = false;
      $scope.nextStep = false;

      var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/places/option/delete.html',
          controller: 'WarningController',
          size: 'sm',
          scope: $scope
        })
        .result.then(
          function() {
            if ($scope.deleteValidated == true) {
              $scope.place.delete();
              return $q(function(res) {
                res($scope.place.id);
                $location.path('/places').replace();
              })
            }
          },
          function() {
            console.log("canceled")
          }
        );

    };

    vm.leaveModal = function() {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/leave.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function() {
        return $scope.place.removeMember(NstSvcAuth.user.username).then(function() {
          $location.path('/places').replace();

          return $q(function(res) {
            res();
          });
        });
      });
    };

    function remove() {
      var defer = $q.defer();

      return NstSvcPlaceFactory.remove(vm.place.id).then(function() {
        defer.resolve(true);
      }).catch(function(error) {
        $log.debug(error);
        defer.reject(false);
      });

      return defer.promise;
    }

    function removeMember(username) {
      var defer = $q.defer();

      return NstSvcPlaceFactory.removeMember(vm.place.id, username).then(function() {
        defer.resolve(true);
      }).catch(function(error) {
        $log.debug(error);
        defer.reject(false);
      });

      return defer.promise;
    }

    function updatePrivacy(name, value) {
      if (name && value){
        vm.place.privacy[name] = value;
      }
      update('privacy', vm.place.privacy).then(function (result) {
        if (result) {
        }
      }).catch(function (error) {

      });
    }

    function update(property, value) {
      var defer = $q.defer();

      if (property && value) {
        vm.place[property] = value;
      }

      NstSvcPlaceFactory.save(vm.place).then(function(result) {
        defer.resolve(true);
      }).catch(function(error) {
        $log.debug(error);
        defer.reject(false);
      });

      return defer.promise;
    }

    function setNotification() {
      NstSvcPlaceFactory.setNotificationOption(vm.placeId).then(function (result) {
        console.log('yeah baby!');
      }).catch(function (error) {

      });
    }

    function loadImage(event) {
      var file = event.currentTarget.files[0];

      if (file) {
        vm.logoFile = file;
        vm.logoUrl = '';

        var reader = new FileReader();
        reader.onload = function(readEvent) {
          vm.logoUrl = readEvent.target.result;

          // upload the picture
          var request = NstSvcStore.uploadWithProgress(vm.logoFile, logoUploadProgress, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE);

          request.getPromise().then(function (result) {
            vm.place.getPicture().setId(result.data.universal_id);
            vm.place.getPicture().setThumbnail(32, vm.place.getPicture().getOrg());
            vm.place.getPicture().setThumbnail(64, vm.place.getPicture().getOrg());
            vm.place.getPicture().setThumbnail(128, vm.place.getPicture().getOrg());
            // update();
            console.log('hoora');
          });
        };

        reader.readAsDataURL(vm.logoFile);

      }

    }

    function logoUploadProgress(event) {
      vm.logoUploadedSize = event.loaded;
      vm.logoUploadedRatio = Number(event.loaded / event.total).toFixed(4);
      console.log(vm.logoUploadedRatio);
    }
  }
})();
