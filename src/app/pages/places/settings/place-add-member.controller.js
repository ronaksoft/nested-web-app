(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($scope, $log, $rootScope,
                                    NST_USER_SEARCH_AREA,
                                    NstSvcUserFactory, NstSvcTranslation, NstUtility,
                                    NST_PLACE_MEMBER_TYPE, NstSvcPlaceFactory, toastr,
                                    _, currentPlace, mode, isForGrandPlace, newPlace) {
    var vm = this;
    var defaultSearchResultCount = 9;
    var eventReferences = [];

    vm.isTeammateMode = true;
    vm.selectedUsers = [];
    vm.users = [];
    vm.search = _.debounce(search, 512);
    vm.add = add;
    vm.invite = invite;
    vm.query = '';

    checkUserLimitPlace();
    search();


    if (isForGrandPlace === true) {
      vm.isGrandPlace = true;
    } else if (isForGrandPlace === false) {
      vm.isGrandPlace = false;
    } else {
      if (currentPlace.id.split('.').length > 1) {
        vm.isGrandPlace = false;
      } else {
        vm.isGrandPlace = true;
      }
    }


    if (vm.isGrandPlace) {
      vm.searchPlaceholder = NstSvcTranslation.get("Name, email or phone number...");
    } else {
      vm.searchPlaceholder = NstSvcTranslation.get("Name or ID...");
    }

    function search(query) {

      var settings = {
        query: query,
        // role is no longer supported
        // role: chosenRole,
        placeId: currentPlace.id,
        limit: calculateSearchLimit()
      };

      if (mode === 'offline-mode' && isForGrandPlace) {
        delete  settings.placeId;
      }

      var newPlaceFlag = false;
      if (newPlace !== undefined && newPlace === true) {
        newPlaceFlag = true;
      }

      NstSvcUserFactory.search(settings, (newPlaceFlag? NST_USER_SEARCH_AREA.ACCOUNTS: (vm.isGrandPlace || isForGrandPlace) ? NST_USER_SEARCH_AREA.INVITE : NST_USER_SEARCH_AREA.ADD))
        .then(function (users) {
          users = _.unionBy(users, 'id');
          vm.users = _.differenceBy(users, vm.selectedUsers, 'id');
          if (_.isString(query)
            && _.size(query) >= 4
            && _.indexOf(query, " ") === -1
            && !_.some(vm.users, { id : query })) {

            if (vm.isGrandPlace || isForGrandPlace) {
              var initProfile = NstSvcUserFactory.parseTinyUser({
                _id: settings.query,
                fname: settings.query
              });
              vm.users.push(initProfile);
            }

          }
          vm.query = query;
        })
        .catch(function (error) {
          $log.debug(error);
        });
    }

    function add() {
      if (newPlace !== undefined && newPlace === true) {
        $scope.$close(vm.selectedUsers);
      } else {
        addUser(currentPlace, vm.selectedUsers);
      }
    }

    function invite() {
      if (newPlace !== undefined && newPlace === true) {
        $scope.$close(vm.selectedUsers);
      } else {
        inviteUsers(currentPlace, vm.selectedUsers)
      }
    }

    /**
     * Emits 'member-added' event with the given place and user
     *
     * @param {any} place
     * @param {any} user
     */
    function dispatchUserAdded(place, user) {
      eventReferences.push($rootScope.$emit(
        'member-added',
        {
          place: place,
          member: user
        }
      ));
    }

    /**
     * Invite members to grand place
     * and displays the error and successful toastr
     * @param {object} place
     * @param {array[object]} users
     */
    function inviteUsers(place, users) {
      NstSvcPlaceFactory.inviteUser(place, users).then(function (result) {
        
        // dispatch the required events
        NstSvcPlaceFactory.get(place.id, true).then(function (newPlace) {
          var dispatcher = _.partial(dispatchUserAdded, newPlace);
          _.forEach(result.addedUsers, dispatcher);
        });
        // notify the user about the result of adding
        if (_.size(result.rejectedUsers) === 0
          && _.size(result.addedUsers) > 0) {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get('All selected users have been invited to place {0} successfully.'), place.name));
        } else {
          var names = null;
          var message = null;

          // there are users that we were not able to invite them
          if (_.size(result.rejectedUsers) > 0) {
            names = _(result.rejectedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            message = NstSvcTranslation.get('We are not able to invite these users to the place:');
            toastr.warning(message + '<br/>' + names);
          }

          //there are some users that were invited successfully
          if (_.size(result.addedUsers) > 0) {
            names = _(result.addedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            message = NstSvcTranslation.get('These users have been invited:');
            toastr.success(message + '<br/>' + names);
          }
        }
        $scope.$close(result.addedUsers);
      }).catch(function () {
        toastr.warning(NstSvcTranslation.get('An error has occured while inviting the user(s) to the place!'));
        $scope.$close([]);
      });
    }

    function addUser(place, users) {
      NstSvcPlaceFactory.addUser(place, users).then(function (result) {
        NstSvcPlaceFactory.get(place.id, true).then(function (newPlace) {
          var dispatcher = _.partial(dispatchUserAdded, newPlace);
          _.forEach(result.addedUsers, dispatcher);
        });
        // notify the user about the result of adding
        if (_.size(result.rejectedUsers) === 0
          && _.size(result.addedUsers) > 0) {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get('All selected users have been added to place {0} successfully.'), place.name));
        } else {
          var names = null;
          var message = null;

          // there are users that we were not able to add them
          if (_.size(result.rejectedUsers) > 0) {
            names = _(result.rejectedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            message = NstSvcTranslation.get('We are not able to add these users to the place:');
            toastr.warning(message + '<br/>' + names);
          }

          //there are some users that were added successfully
          if (_.size(result.addedUsers) > 0) {
            names = _(result.addedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            message = NstSvcTranslation.get('These users have been added:');
            toastr.success(message + '<br/>' + names);
          }
        }
        $scope.$close(result.addedUsers);
      }).catch(function () {
        toastr.warning(NstSvcTranslation.get('An error has occured while adding the user(s) to the place!'));
        $scope.$close([]);
      });
    }

    function calculateSearchLimit() {
      return defaultSearchResultCount + vm.selectedUsers.length;
    }

    function checkUserLimitPlace() {
      var previousUsers = mode === 'offline-mode' ? 0 : currentPlace.counters.creators + currentPlace.counters.key_holders;

      // fixme :: read limit from config
      vm.limit = 10000 - previousUsers;
    }
  }
})();
