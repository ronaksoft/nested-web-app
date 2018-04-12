/**
 * @file src/app/place/partials/teammates/place-teammates.controller.js
 * @author Sina Hosseini <sinaa@nested.me>
 * @description Displays a place members list and the user is able to add/invite others
 * if he/she has required permissions to do that
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('placeTeammatesController', placeTeammatesController);

  /** @ngInject */
  /**
   * Retrieves a Place key-holders and creators. The user is able to add/invite others
   *
   */
  function placeTeammatesController($scope, $q, $state, $stateParams, $uibModal, toastr, _, $rootScope,
                                    NstSvcPlaceFactory, NstUtility, NstSvcUserFactory, NstSvcTranslation,
                                    NstVmMemberItem, NST_NOTIFICATION_TYPE, NstEntityTracker,
                                    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE) {
    var vm = this;
    // to keep track of added users
    var removedMembersTracker = new NstEntityTracker(),
      addedMembersTracker = new NstEntityTracker(),
      eventReferences = [],
      addMemberListenerKey = null;

    vm.hasAddMembersAccess = false;
    vm.hasSeeMembersAccess = false;
    vm.openMemberModal = openMemberModal;
    vm.loading = false;
    vm.teammates = [];

    vm.placeId = $stateParams.placeId;
    vm.teammatesSettings = {
      skip: 0,
      limit: 15,
      creatorsCount: 0,
      keyHoldersCount: 0,
      pendingsCount: 0
    };


    // Listens to 'member-removed' event and reloads the place members
    eventReferences.push($rootScope.$on('member-removed', function (event, data) {

      if (vm.placeId === data.place.id) {
        if (removedMembersTracker.isTracked(data.member.id)) {
          return;
        }
        vm.place = data.place;
        load();
        removedMembersTracker.track(data.member.id);
      }
    }));

    // Listens to 'member-added' event and reloads the place members
    eventReferences.push($rootScope.$on('member-added', function (event, data) {
      if (vm.placeId === data.place.id) {
        if (addedMembersTracker.isTracked(data.member.id)) {
          return;
        }

        vm.place = data.place;
        load();
        addedMembersTracker.track(data.member.id);
      }
    }));

    // Demotes the member to key-holder
    eventReferences.push($rootScope.$on('member-demoted', function (event, data) {
      var member = vm.teammates.filter(function (m) {
        return m.id === data.member.id
      });
      if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
    }));

    // Promotes the member to creator
    eventReferences.push($rootScope.$on('member-promoted', function (event, data) {
      var member = vm.teammates.filter(function (m) {
        return m.id === data.member.id
      });
      if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.CREATOR;
    }));


    initialize();

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.addMember = addMember;

    // Sets the flag value to true if the selected place is a grand-place.
    // We use it to choose between add or invite function
    vm.isGrand = !NstUtility.place.hasParent(vm.placeId);

    /**
     * Gets the places and loads the place members if the user has the required permissions
     *
     * @returns
     */
    function initialize() {
      if (!vm.placeId) {
        return;
      }

      vm.loading = true;


      NstSvcPlaceFactory.get(vm.placeId, true).then(function (place) {
        if (place) {
          vm.place = place;

          vm.hasAddMembersAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
          vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);

          load();
        }
      }).finally(function () {
        vm.loading = false;
      });
    }

    /**
     * Opens place-settings page and shows members tab by default
     *
     */
    function openMemberModal() {
      $state.go('app.place-settings', { placeId : vm.placeId, tab : 'members' }, { notify : false });
    }

    /**
     * Opens a modals to select members and adds/invites the selected members
     *
     * @param {any} role
     */
    function showAddModal(role) {

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
          newPlace: false,
          mode: function () {
            return false
          },
          isForGrandPlace: function () {
            return undefined
          }
        }
      });

      modal.result.then();
    }

    /**
     * Just shows the add/invite modal
     *
     */
    function addMember() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
    }

    /**
     * Loads both creators and key-holders by requesting for two different APIs
     *
     * @param {any} placeId
     * @param {any} hasSeeMembersAccess
     * @returns
     */
    function loadTeammates(placeId, hasSeeMembersAccess, cacheHandler) {
      var deferred = $q.defer();
      var teammates = [];
      getCreators(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, hasSeeMembersAccess, cacheHandler).then(function (creators) {
        teammates.push.apply(teammates, creators);
        return getKeyholders(placeId, vm.teammatesSettings.limit - creators.length - ( vm.hasAddMembersAccess ? 1 : 0 ), vm.teammatesSettings.skip, hasSeeMembersAccess, cacheHandler);
      }).then(function (keyHolders) {
        teammates.push.apply(teammates, keyHolders);

        deferred.resolve(teammates);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    /**
     * Loads the place members if the user has the requires permissions
     *
     */
    function load() {

      if (vm.hasSeeMembersAccess) {
        loadTeammates(vm.placeId, vm.hasSeeMembersAccess, function(teammates) {
          vm.teammates = teammates;
        }).then(function (teammates) {
          vm.teammates = teammates;
        }).finally(function () {
          readyAffix();
          vm.loading = false;
        });
      } else {
        vm.teammates = [];
      }
    }

    /**
     * Retrieves the place creators using the given skip and limit
     *
     * @param {any} placeId
     * @param {any} limit
     * @param {any} skip
     * @param {any} hasAccess
     * @returns
     */
    function getCreators(placeId, limit, skip, hasAccess, cacheHandler) {
      var deferred = $q.defer();

      if (hasAccess && vm.teammatesSettings.creatorsCount < vm.place.counters.creators) {

        NstSvcPlaceFactory.getCreators(placeId, limit, skip, function(cachedCreators) {
          cacheHandler(_.map(cachedCreators, function (item) {
            return new NstVmMemberItem(item, 'creator');
          }));
        }).then(function (data) {
          var creatorItems = _.map(data.creators, function (item) {
            return new NstVmMemberItem(item, 'creator');
          });

          deferred.resolve(creatorItems);
        }).catch(deferred.reject);

      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }

    /**
     * Retrieves the place key-holders with the given limit and skip
     *
     * @param {any} placeId
     * @param {any} limit
     * @param {any} skip
     * @param {any} hasAccess
     * @returns
     */
    function getKeyholders(placeId, limit, skip, hasAccess, cacheHandler) {
      var deferred = $q.defer();

      if (limit > 0 && hasAccess /*&& vm.teammatesSettings.keyHoldersCount < vm.place.counters.key_holders*/) {
        NstSvcPlaceFactory.getKeyholders(placeId, limit, skip, function(cachedKeyHolders) {
          cacheHandler(_.map(cachedKeyHolders, function (item) {
            return new NstVmMemberItem(item, 'key_holder');
          }));
        }).then(function (data) {
          var keyHolderItems = _.map(data.keyHolders, function (item) {
            return new NstVmMemberItem(item, 'key_holder');
          });
          deferred.resolve(keyHolderItems);
        }).catch(deferred.reject);
      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }

    function readyAffix() {
      $rootScope.$emit('affixCheck');
    }

    $scope.$on('$destroy', function () {
      if (addMemberListenerKey) {
        NstSvcPlaceFactory.removeEventListener(addMemberListenerKey);
      }

      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

  }
})();
