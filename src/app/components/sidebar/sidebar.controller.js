(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', SidebarController);

  /** @ngInject */
  function SidebarController($q,$scope, $state, $stateParams, $uibModal, $log,
                             _,
                             NST_DEFAULT, NST_AUTH_EVENT, NST_INVITATION_FACTORY_EVENT, NST_PLACE_FACTORY_EVENT, NST_DELIMITERS,
                             NstSvcLoader, NstSvcTry, NstSvcAuth, NstSvcPlaceFactory, NstSvcInvitationFactory,
                             NstVmUser, NstVmPlace, NstVmInvitation) {
    var vm = this;
    $log.debug(vm.stat);

    /*****************************
     *** Controller Properties ***
     *****************************/


    vm.stateParams = $stateParams;
    vm.invitation = {};
    vm.places = [];


    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.range = function (num) {
      var seq = [];
      for (var i = 0; i < num; i++) {
        seq.push(i);
      }

      return seq;
    };

    vm.invitation.accept = function (id) {
      return NstSvcLoader.inject(NstSvcInvitationFactory.accept(id));
    };

    vm.invitation.decline = function (id) {
      return NstSvcLoader.inject(NstSvcInvitationFactory.decline(id));
    };

    vm.invitation.showModal = function (id) {
      NstSvcInvitationFactory.get(id).then(function (invitation) {
        // Show User the invitation Decide Modal
        $uibModal.open({
          animation: false,
          size: 'sm',
          templateUrl: 'app/components/sidebar/invitation/decide-modal.html',
          controller: 'InvitationController',
          controllerAs: 'ctrlInvitation',
          resolve: {
            argv: {
              invitation: invitation
            }
          }
        }).result.then(function (result) {
          for (var k in vm.invitations) {
            if (id == vm.invitations[k].id) {
              vm.invitations.splice(k, 1);
            }
          }

          if (result) { // Accept the Invitation
            return vm.invitation.accept(id).then(function (invitation) {
              var vmPlace = _.find(vm.places, { id: invitation.getPlace().getId() });

              if (!vmPlace) {
                vmPlace = mapPlace(invitation.getPlace());
                // TODO: Highlight Newly Added Place
                vm.places.push(vmPlace);
              }

              $state.go(getPlaceFilteredState(), { placeId: vmPlace.id });
            });
          } else { // Decline the Invitation
            return vm.invitation.decline(id);
          }
        });
      });
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    if (vm.stateParams.placeId) {
      if (NST_DEFAULT.STATE_PARAM != vm.stateParams.placeId) {
        vm.stateParams.placeIdSplitted = vm.stateParams.placeId.split('.');
      }
    }

    $q.all([getUser(), getMyPlaces(), getInvitations()]).then(function (resolvedSet) {
      vm.user = mapUser(resolvedSet[0]);
      vm.places = mapPlaces(resolvedSet[1]);
      vm.invitations = mapInvitations(resolvedSet[2]);
      fixPlaceUrl();
    });

    /*****************************
     *****    Change urls   ****
     *****************************/

    $scope.$watch(function () {
      return $state.current.name;
    },function () {
      fixPlaceUrl();
    });


    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      fixPlaceUrl();
    });


    function fixPlaceUrl() {

      vm.urls = {
        unfiltered: $state.href(getUnfilteredState()),
        compose: $state.href(getComposeState(), { placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM }),
        bookmarks: $state.href(getBookmarksState()),
        sent: $state.href(getSentState()),
        placeAdd: $state.href(getPlaceAddState(), { placeId: NST_DEFAULT.STATE_PARAM }),
        subplaceAdd: $state.href(getPlaceAddState(), { placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM })
      };
      mapPlacesUrl(vm.places);
    };

    function mapPlacesUrl(places) {
      var currentPlace = $state.current;
      places.map(function (place) {

        if ($state.current.params && $state.current.params.placeId) {
          place.href = $state.href(currentPlace.name, Object.assign({}, $stateParams, {placeId: place.id}));
        }else{
          place.href = place.url;
        }

        if (place.children) mapPlacesUrl(place.children);

        return place;
      })
    }

    /*****************************
     *****    State Methods   ****
     *****************************/

    // TODO: Move these to Common Service

    function getUnfilteredState() {
      var state = 'messages';
      switch ($state.current.name) {
        case 'activity':
        case 'activity-bookmarks':
        case 'activity-bookmarks-filtered':
        case 'activity-filtered':
        case 'place-activity':
        case 'place-activity-filtered':
          state = 'activity';
          break;
      }

      return state;
    }

    function getPlaceFilteredState() {
      var state = 'place-messages';

      if ($state.current.name.indexOf('activity') > -1) {
        state = 'place-activity';
      } else if ($state.current.name.indexOf('compose') > -1) {
        state = 'place-compose';
      } else if ($state.current.name.indexOf('settings') > -1) {
        state = 'place-settings';
      }

      return state;
    }

    function getComposeState() {
      var state = 'compose';
      switch ($state.current.name) {
        case 'place-activity':
        case 'place-activity-sorted':
        case 'place-messages':
        case 'place-messages-filtered':
          state = 'place-compose';
          break;
      }

      return state;
    }

    function getBookmarksState() {
      var state = 'messages-bookmarks';
      switch ($state.current.name) {
        case 'activity':
        case 'activity-bookmarks':
        case 'activity-bookmarks-filtered':
        case 'activity-filtered':
        case 'place-activity':
        case 'place-activity-filtered':
          state = 'activity-bookmarks';
          break;
      }

      return state;
    }

    function getSentState() {
      var state = 'messages-sent';
      switch ($state.current.name) {
        case 'messages-sorted':
        case 'messages-sent-sorted':
        case 'messages-bookmarks-sorted':
        case 'place-messages-sorted':
          state = 'messages-sent-sorted';
          break;
      }

      return state;
    }

    function getPlaceAddState() {
      return 'place-add';
    }

    /*****************************
     *****    Fetch Methods   ****
     *****************************/

    function getUser() {
      return NstSvcLoader.inject($q(function (res) {
        if (NstSvcAuth.isAuthorized()) {
          res(NstSvcAuth.getUser());
        } else {
          NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function () {
            res(NstSvcAuth.getUser());
          });
        }
      }));
    }

    function getMyPlaces() {
      return NstSvcLoader.inject(NstSvcTry.do(function () { return NstSvcPlaceFactory.getMyTinyPlaces(); }));
    }

    function getInvitation(id) {
      return NstSvcLoader.inject(NstSvcTry.do(function () { return NstSvcInvitationFactory.get(id); }));
    }

    function getInvitations() {
      return NstSvcLoader.inject(NstSvcTry.do(function () { return NstSvcInvitationFactory.getAll(); }));
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    function mapUser(userModel) {
      return new NstVmUser(userModel);
    }

    function mapPlace(placeModel, depth) {
      return new NstVmPlace(placeModel, depth);
    }

    function mapInvitation(invitationModel) {
      return new NstVmInvitation(invitationModel);
    }

    function mapPlaces(placeModels, depth) {
      depth = depth || 0;

      return Object.keys(placeModels).filter(function (k) { return 'length' !== k; }).map(function (k, i, arr) {
        var placeModel = placeModels[k];
        var place = mapPlace(placeModel, depth);
        place.isCollapsed = true;
        place.isActive = false;
        if (vm.stateParams.placeIdSplitted) {
          place.isCollapsed = place.id != vm.stateParams.placeIdSplitted.slice(0, place.id.split('.').length).join('.');
          place.isActive = vm.stateParams.placeId == place.id;
        }

        place.isFirstChild = 0 == i;
        place.isLastChild = (arr.length - 1) == i;
        place.children = mapPlaces(placeModel.children, depth + 1);
        return place;
      });
    }

    function mapInvitations(invitationModels) {
      return invitationModels.map(mapInvitation);
    }

    /*****************************
     *****    Push Methods    ****
     *****************************/

    function pushInvitation(invitationModel) {
      vm.invitations.push(mapInvitation(invitationModel));
    }

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    NstSvcInvitationFactory.addEventListener(NST_INVITATION_FACTORY_EVENT.ADD, function (event) {
      pushInvitation(event.detail.invitation);
    });

    NstSvcInvitationFactory.addEventListener(NST_INVITATION_FACTORY_EVENT.ACCEPT, function (event) {
      var invitation = event.detail.invitation;

      for (var k in vm.invitations) {
        if (invitation.getId() == vm.invitations[k].id) {
          vm.invitations.splice(k, 1);
          return;
        }
      }
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.ROOT_ADD, function (event) {
      var vmPlace = _.find(vm.places, { id: event.detail.id });

      if (!vmPlace) {
        // TODO: Highlight Newly Added Place
        vm.places.push(mapPlace(event.detail.place));
      }
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.SUB_ADD, function (event) {
      var place = event.detail.place;
      var parentPlace = event.detail.parentPlace;
      var parentPlacesIds = String(parentPlace.getId()).split(NST_DELIMITERS.PLACE_ID);
      var collection = vm.places;
      var lastVisibleVmPlace = undefined;

      for (var k in parentPlacesIds) {
        var ptrVmPlaceId = parentPlacesIds.slice(0, k + 1);
        var ptrVmPlace = _.find(collection, { id: ptrVmPlaceId });
        if (ptrVmPlace) {
          if (!lastVisibleVmPlace) {
            lastVisibleVmPlace = ptrVmPlace;
          } else {
            // TODO: ??
          }

          if (ptrVmPlaceId == parentPlace.id) {
            // TODO: Highlight last not-collapsed ancestor: lastVisibleVmPlace
            ptrVmPlace.children.push(mapPlace(place));
            break;
          }

          collection = ptrVmPlace.children;
        } else {
          return;
        }
      }
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.REMOVE, function (event) {

    });

  }
})();
