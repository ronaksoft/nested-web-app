(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, $rootScope, $scope, $log, $stateParams, $q, $uibModal, $timeout, StoreService, UPLOAD_TYPE, AuthService, WsService, NestedPlace, PLACE_ACCESS, EVENT_ACTIONS, WS_EVENTS) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.logo = null;
    $scope.place = new NestedPlace();

    vm.actions = {
      'leave': {
        name: 'Leave',
        fn: function () {
          vm.leaveModal();
        }
      }
    };

    function load(id) {
      $scope.place.load(id).then(function (place) {
        if (place.haveAccess(PLACE_ACCESS.REMOVE_PLACE)) {
          $scope.place_option.actions['delete'] = {
            name: 'Delete',
            fn: function () {
              vm.showDeleteModal()
            }
          };
        }

        if (place.haveAccess(PLACE_ACCESS.ADD_PLACE)) {
          $scope.place_option.actions['add'] = {
            name: 'Create Subplace',
            url: '#/create_place/' + place.id
          };
        }
      });
      $scope.place.loadAllMembers();
      console.log($scope.place);
    }

    if ($stateParams.hasOwnProperty('placeId')) {
      load($stateParams.placeId);
    } else {
      $location.path('/places').replace();
    }
    $scope.showUploadProgress = false;
    vm.imgToUri = function (event) {
      vm.loadedSize = 0;
      $scope.showUploadProgress = true;
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.place.picture.org.url = event.target.result;
          $scope.place.picture.x32.url = $scope.place.picture.org.url;
          $scope.place.picture.x64.url = $scope.place.picture.org.url;
          $scope.place.picture.x128.url = $scope.place.picture.org.url;

          var uploadSettings = {
            file : $scope.logo,
            cmd : UPLOAD_TYPE.PLACE_PICTURE,
            // progress is invoked at most once per every second
            onProgress : _.throttle(function (e) {
              if (e.lengthComputable) {
                vm.loadedSize = (e.loaded/e.total)*100;
                $timeout(function () {
                  $scope.totalProgress = vm.loadedSize.toFixed(0);
                });
              }
            }.bind(),100),
            onStart : function (e) {
              $scope.showUploadProgress = true;
            }
          };

          return StoreService.uploadWithProgress(uploadSettings).then(function (handler) {
            $scope.place.picture.org.uid = handler.universal_id;
            $scope.logo = null;
            handler.start().then(function (response) {
              $scope.showUploadProgress = false;
              return $scope.place.setPicture(response.data.universal_id);
            }).catch(function (result) {
              $log.debug(result);
            });
          }).catch(function (error) {
            $log.debug(error);
          });

        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.updatePrivacy = function (event) {
      var element = event.currentTarget;
      var data = {};
      data['privacy.' + element.name] = element.checked;

      return $scope.place.update(data);
    };

    vm.updatePlace = function (name, value) {
      var data = {};
      data[name] = value;

      return $scope.place.update(data);
    };


    $scope.checkplace = function (PlaceId) {
      if (PlaceId == $scope.place.id){
        $scope.deleteValidated = true;
      }else {
        $scope.deleteValidated = false;
      }
    };

    vm.showAddModal = function (role) {
      $scope.role = role;
      $scope['add_' + role] = true;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/add_member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'place_add_member',
        size: 'sm',
        scope: $scope
      });


      $scope.closeModal = modal.close;

      modal.closed.then(function () {
        delete $scope['add_' + role];
        delete $scope.role;
        delete $scope.closeModal;
      });
    };
    vm.showLockModal = function (event) {
      event.preventDefault();
      event.stopPropagation();

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/warning.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        var data = {};
        data['privacy.locked'] = $scope.place.privacy.locked;

        return $scope.place.update(data);
      }).catch(function () {
        $scope.place.privacy.locked = !$scope.place.privacy.locked;
      });

      return false;
    };
    vm.showDeleteModal = function () {

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
          function () {
            if($scope.deleteValidated == true){
              $scope.place.delete().then(function (data) {
                $rootScope.$emit('place-removed', $scope.place);
              });
              return $q(function (res) {res($scope.place.id);$location.path('/places').replace();})
            }
          },
          function () {
            console.log("canceled")
          }
        );

    };

    vm.removeMember = function (user) {
      $scope.member = user;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/places/context_menu/remove.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        return $scope.place.removeMember($scope.member.username);
      });
    };

    vm.leaveModal = function () {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/leave.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        return $scope.place.removeMember(AuthService.user.username).then(function () {
          $location.path('/places').replace();

          return $q(function (res) {
            res();
          });
        });
      });
    };

    WsService.addEventListener(WS_EVENTS.TIMELINE, function (e) {
      var action = e.detail.timeline_data.action;


      /**
       * if - if the notification is about accepting an invitation
       */
      if (action === EVENT_ACTIONS.MEMBER_JOIN){
        var username = e.detail.timeline_data.actor;
        $scope.$apply(function () {

          if (e.detail.timeline_data.member_type === 'known_guest') {

            /**
             * if the member is turned into a known guest,
             * then find the member in pendingKnownGuests and
             * move it to the list of knownGuests
             */
            var guest = _.find($scope.place.members.pendingKnownGuests.users, { username : username });
            var index = _.indexOf($scope.place.members.pendingKnownGuests.users, guest);
            $scope.place.members.pendingKnownGuests.users.splice(index, 1);
            $scope.place.members.knownGuests.users.push(guest);

          } else if (e.detail.timeline_data.member_type === 'key_holder') {

            /**
             * if the member is turned into a keyholder,
             * then find the member in pendingKeyHolders and
             * move it to the list of knownKeyHolders
             */
            var keyholder = _.find($scope.place.members.pendingKeyHolders.users, { username : username });
            var index = _.indexOf($scope.place.members.pendingKeyHolders.users, keyholder);
            $scope.place.members.pendingKeyHolders.users.splice(index, 1);
            $scope.place.members.keyHolders.users.push(keyholder);

          }
        });
      }
    });

  }
})();
