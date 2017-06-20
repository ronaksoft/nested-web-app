(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .controller('FullNavbarController', FullNavbarController);

  /** @ngInject */
  function FullNavbarController($scope, $rootScope, $uibModal, $state, $q,
                                toastr, NstUtility,
                                NstSvcAuth, NstSvcLogger,
                                NstSearchQuery, NstSvcPlaceFactory, NstSvcTranslation,
                                NST_CONFIG, NST_DEFAULT, NST_PLACE_FACTORY_EVENT, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE,
                                NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError, NstManagerOfSubPlaceError) {
    var vm = this;
    var eventReferences = [];
    /*****************************
     *** Controller Properties ***
     *****************************/

    isBookMark();
    isSent();
    isUnread();
    isConversation();
    isSearch();
    vm.user = NstSvcAuth.user;
    vm.hasPlace = hasPlace;
    vm.getPlaceId = getPlaceId;
    vm.getMessagesUrl = getMessagesUrl;
    vm.getActivityUrl = getActivityUrl;
    vm.getFilesUrl = getFilesUrl;
    vm.getSettingsUrl = getSettingsUrl;
    vm.search = search;
    vm.rollUpward = rollUpward;
    vm.rollToTop = false;
    vm.place = null;
    vm.toggleBookmark = toggleBookmark;
    vm.toggleNotification = toggleNotification;
    vm.openCreateSubplaceModal = openCreateSubplaceModal;
    vm.openAddMemberModal = openAddMemberModal;
    vm.openSettingsModal = openSettingsModal;
    vm.confirmToRemove = confirmToRemove;
    vm.isPersonal = isPersonal;
    vm.isSubPersonal = isSubPersonal;
    vm.confirmToLeave = confirmToLeave;
    vm.isFeed = $state.current.options.feed;
    vm.isFavPlaces = $state.current.options.favoritePlace;
    vm.searchKeyPressed = searchKeyPressed;
    vm.goBack = goBack;
    function isUnread() {
      if ($state.current.name == 'app.place-messages-unread' ||
        $state.current.name == 'app.place-messages-unread-sorted') {
        return vm.isUnreadMode = true;
      }
      return vm.isUnreadMode = false;
    }

    function isConversation() {
      if ($state.current.name == 'app.conversation' ||
        $state.current.name == 'app.conversation-keyword') {
        return vm.isConvMode = true;
      }
      return vm.isConvMode = false;
    }

    function isSearch() {
      if ($state.current.name == 'app.search') {
        return vm.isSearchMode = true;
      }
      return vm.isSearchMode = false;
    }

    function openCreateSubplaceModal($event, style) {
      if (style == 'open') {
        $state.go('app.place-create', {placeId: getPlaceId(), isOpenPlace: true}, {notify: false});
      } else {
        $state.go('app.place-create', {placeId: getPlaceId(), isClosePlace: true}, {notify: false});
      }
      $event.preventDefault();
    };

    function openAddMemberModal($event) {
      $event.preventDefault();
      NstSvcPlaceFactory.get(vm.getPlaceId()).then(function (place) {
        vm.place = place;
        var role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
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
              return false
            },
            isForGrandPlace: function () {
              return undefined
            }
          }
        });

        modal.result.then(function (selectedUsers) {
          if (NstUtility.place.isGrand(vm.place.id)) {
            invite(vm.place, selectedUsers);
          } else {
            add(vm.place, selectedUsers);
          }
        });
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });

    }


    function add(place, users) {
      NstSvcPlaceFactory.addUser(place, users).then(function (result) {
        $rootScope.$emit(
          'member-added',
          {
            place: place,
            member: users
          }
        );
        // notify the user about the result of adding
        if (_.size(result.rejectedUsers) === 0
          && _.size(result.addedUsers) > 0) {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get('All selected users have been added to place {0} successfully.'), place.name));
        } else {

          // there are users that we were not able to add them
          if (_.size(result.rejectedUsers) > 0) {
            var names = _(result.rejectedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('We are not able to add these users to the place:');
            toastr.warning(message + '<br/>' + names);
          }

          //there are some users that were added successfully
          if (_.size(result.addedUsers) > 0) {
            var names = _(result.addedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('These users have been added:');
            toastr.success(message + '<br/>' + names);
          }
        }
      }).catch(function (error) {
        toastr.warning(NstSvcTranslation.get('An error has occured while adding the user(s) to the place!'));
      });
    }

    function invite(place, users) {
      NstSvcPlaceFactory.inviteUser(place, users).then(function (result) {
        // notify the user about the result of adding
        if (_.size(result.rejectedUsers) === 0
          && _.size(result.addedUsers) > 0) {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get('All selected users have been invited to place {0} successfully.'), place.name));
        } else {

          // there are users that we were not able to invite them
          if (_.size(result.rejectedUsers) > 0) {
            var names = _(result.rejectedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('We are not able to invite these users to the place:');
            toastr.warning(message + '<br/>' + names);
          }

          //there are some users that were invited successfully
          if (_.size(result.addedUsers) > 0) {
            var names = _(result.addedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('These users have been invited:');
            toastr.success(message + '<br/>' + names);
          }
        }
      }).catch(function (error) {
        toastr.warning(NstSvcTranslation.get('An error has occured while inviting the user(s) to the place!'));
      });
    }

    function joinUser(place, role, user) {
      if (place.isGrandPlace()) {
        return NstSvcPlaceFactory.inviteUser(place, role, user);
      } else {
        return NstSvcPlaceFactory.addUser(place, role, user);
      }
    }

    function getPlaceId() {
      return vm.placeId;
    }

    function hasPlace() {
      return !!vm.placeId;
    }

    function getMessagesUrl() {
      if (hasPlace()) {
        return $state.href('app.place-messages', {placeId: vm.getPlaceId()});
      } else {
        return $state.href('app.messages-favorites');
      }
    }

    function getFilesUrl() {
      if (hasPlace()) {
        return $state.href('app.place-files', {placeId: vm.getPlaceId()});
      } else {
        return '';
      }
    }

    function getActivityUrl() {
      if (hasPlace()) {
        return $state.href('app.place-activity', {placeId: vm.getPlaceId()});
      } else {
        return $state.href('app.activity');
      }
    }

    function getSettingsUrl() {
      if (hasPlace()) {
        return $state.href('app.place-settings', {placeId: vm.getPlaceId()});
      } else {
        return '';
      }
    }

    function rollUpward(group) {
      if (group === $state.current.options.group) {
        vm.rollToTop = true;
      }
    }

    function isBookMark() {
      if ($state.current.name == 'app.messages-favorites' ||
        $state.current.name == 'app.messages-favorites-sorted') {
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
    }

    function isSent() {
      if ($state.current.name == 'app.messages-sent' ||
        $state.current.name == 'app.messages-sent-sorted') {
        vm.isSentMode = true;
        return true;
      }
      return false;
    }

    function toggleBookmark() {
      vm.isBookmarked = !vm.isBookmarked;
      NstSvcPlaceFactory.setBookmarkOption(vm.placeId, vm.isBookmarked).then(function (result) {

      }).catch(function (error) {
        vm.isBookmarked = !vm.isBookmarked;
      });
    }

    function toggleNotification() {
      vm.notificationStatus = !vm.notificationStatus;
      NstSvcPlaceFactory.setNotificationOption(vm.placeId, vm.notificationStatus).then(function (result) {

      }).catch(function (error) {
        vm.notificationStatus = !vm.notificationStatus;
      });
    }

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    function search(query, event) {

      var element = angular.element(event.target);
      if (!sendKeyIsPressed(event) || !query || element.attr("mention") === "true") {
        return;
      }
      var searchQury = new NstSearchQuery(query);

      if (hasPlace()) {
        searchQury.addPlace(getPlaceId());
      }

      $state.go('app.search', {search: NstSearchQuery.encode(searchQury.toString())});
    }


    $scope.$watch(
      function () {
        return vm.placeId
      },
      function () {
        if (vm.placeId) {
          vm.domain = NST_CONFIG.DOMAIN;
          vm.isGrandPlace = vm.placeId.split('.').length === 1;
          NstSvcPlaceFactory.getFavoritesPlaces()
            .then(function (bookmaks) {
              if (bookmaks.indexOf(vm.placeId) >= 0) vm.isBookmarked = true;
            });

          NstSvcPlaceFactory.getNotificationOption(vm.placeId)
            .then(function (status) {
              vm.notificationStatus = status;
            });


          if (vm.hasPlace && !vm.place) {
            NstSvcPlaceFactory.get(vm.placeId).then(function (place) {
              vm.place = place;

              vm.allowedToAddMember = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
              vm.allowedToAddPlace = place.hasAccess(NST_PLACE_ACCESS.ADD_PLACE);
              vm.allowedToRemovePlace = place.hasAccess(NST_PLACE_ACCESS.REMOVE_PLACE);
            });
          }

          if (vm.hasPlace) {
            NstSvcPlaceFactory.get(vm.placeId.split('.')[0]).then(function (place) {
              vm.grandPlace = place;
            });
          }
        }
      }
    );

    function searchKeyPressed($event, text) {
      if (vm.searchOnKeypress) {
        vm.searchOnKeypress($event, text);
      }
    }

    function confirmToLeave() {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-leave-confirm.html',
        size: 'sm',
        controller: 'PlaceLeaveConfirmController',
        controllerAs: 'leaveCtrl',
        resolve: {
          selectedPlace: function () {
            return vm.title;
          }
        }
      }).result.then(function () {
        leave();
      });
    }

    function isPersonal() {
      return NstSvcAuth.user.id == vm.getPlaceId()
    }

    function isSubPersonal() {
      return NstSvcAuth.user.id == vm.getPlaceId().split('.')[0];
    }

    function leave() {
      NstSvcPlaceFactory.leave(vm.getPlaceId()).then(function (result) {
        if (_.indexOf(vm.place.id, '.') > -1) {
          $state.go('app.place-messages', {placeId: vm.place.grandParentId});
        } else {
          $state.go(NST_DEFAULT.STATE);
        }
      }).catch(function (error) {
        if (error instanceof NstPlaceOneCreatorLeftError) {
          toastr.error(NstSvcTranslation.get('You are the only one left!'));
        } else if (error instanceof NstPlaceCreatorOfParentError) {
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to leave the Place because you are the creator of its highest-ranking Place ({0}).'), vm.place.parent.name));
        } else if (error instanceof NstManagerOfSubPlaceError) {
          toastr.error(NstSvcTranslation.get('You can not leave here, because you are the manager of one of its sub-places.'));
        } else {
          toastr.error(NstSvcTranslation.get("An error has happened before leaving this place"));
        }
      });

    }

    function openSettingsModal($event) {
      $event.preventDefault();
      $state.go('app.place-settings', {placeId: getPlaceId()}, {notify: false});
    }

    function confirmToRemove() {

      $scope.deleteValidated = false;
      $scope.nextStep = false;

      NstSvcPlaceFactory.get(vm.getPlaceId()).then(function (place) {
        vm.place = place;
        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/pages/places/settings/place-delete.html',
          controller: 'PlaceRemoveConfirmController',
          controllerAs: 'removeCtrl',
          size: 'sm',
          resolve: {
            selectedPlace: function () {
              return vm.place;
            }
          }
        }).result.then(function (confirmResult) {
          remove();
        });
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });


    }

    function remove() {
      NstSvcPlaceFactory.remove(vm.place.id).then(function (removeResult) {
        toastr.success(NstUtility.string.format(NstSvcTranslation.get("Place {0} was removed successfully."), vm.place.name));
        if (_.indexOf(vm.place.id, '.') > -1) {
          $state.go('app.place-messages', {placeId: vm.place.grandParentId});
        } else {
          $state.go(NST_DEFAULT.STATE);
        }
      }).catch(function (error) {
        if (error.code === 1 && error.message[0] === "remove_children_first") {
          toastr.warning(NstSvcTranslation.get("You have to delete all the sub-Places within, before removing this Place."));
        } else {
          toastr.error(NstSvcTranslation.get("An error has occurred in removing this Place."));
        }
      });
    }

    function goBack() {
      $rootScope.goToLastState();
    }

    eventReferences.push($rootScope.$on('place-bookmark', function (e, data) {
      if (data.placeId === vm.placeId) vm.isBookmarked = data.bookmark;
    }));

    eventReferences.push($rootScope.$on('place-notification', function (e, data) {
      // TODO: Remove me
      console.log('place-notification', data);
      if (data.placeId === vm.placeId) vm.notificationStatus = data.notification;
    }));

    eventReferences.push($rootScope.$on('place-updated', function (e, data) {
      if (getPlaceId() === data.placeId) {
        NstSvcPlaceFactory.get(data.placeId).then(function (place) {
          vm.place = place;
        });
      }
    }));

    eventReferences.push($rootScope.$on('place-picture-changed', function (e, data) {
      NstSvcPlaceFactory.get(data.placeId).then(function (place) {
        vm.place = data.place;
      });
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
