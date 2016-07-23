(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', SidebarController);

  /** @ngInject */
  function SidebarController($q, $state, $stateParams, $uibModal,
                             NST_AUTH_EVENT,
                             NstSvcLoader, NstSvcAuth, NstSvcPlaceFactory, NstSvcInvitationFactory,
                             NstVmUser, NstVmPlace, NstVmInvitation) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.stateParams = $stateParams;
    vm.urls = {
      unfiltered: $state.href(getUnfilteredState()),
      bookmarks: $state.href(getBookmarksState()),
      sent: $state.href(getSentState())
    };

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

    vm['invitation'] = {};

    vm.invitation.accept = function (id) {
      return NstSvcInvitationFactory.accept(id);
    };

    vm.invitation.decline = function (id) {
      return NstSvcInvitationFactory.decline(id);
    };

    vm.invitation.showModal = function (id) {
      NstSvcInvitationFactory.get(id).then(function (invitation) {
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
          if (result) {
            return vm.invitation.accept(id);
          } else {
            return vm.invitation.decline(id);
          }
        });
      });
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    if ($stateParams.placeId) {
      if ('_' == $stateParams.placeId) {
        $state.go(getUnfilteredState());
      } else {
        vm.stateParams.placeIdSplitted = $stateParams.placeId.split('.');
      }
    }

    $q.all([getUser(), getMyPlaces(), getInvitations()]).then(function (resolvedSet) {
      vm.user = mapUser(resolvedSet[0]);
      vm.places = mapPlaces(resolvedSet[1]);
      vm.invitations = mapInvitations(resolvedSet[2]);
    });

    /*****************************
     *****    State Methods   ****
     *****************************/

    function getUnfilteredState() {
      var state = 'messages';
      switch ($state.current.name) {
        case 'activity':
        case 'place-activity':
          state = 'activity';
          break;
      }

      return state;
    }

    function getBookmarksState() {
      var state = 'messages-bookmarks';
      switch ($state.current.name) {
        case 'activity':
        case 'place-activity':
          state = 'activity-bookmarks';
          break;
      }

      return state;
    }

    function getSentState() {
      var state = 'messages-sent';
      switch ($state.current.name) {
        case 'activity':
        case 'place-activity':
          break;
      }

      return state;
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
      return NstSvcLoader.inject(NstSvcPlaceFactory.getMyTinyPlaces());
    }

    function getInvitations() {
      return NstSvcLoader.inject(NstSvcInvitationFactory.getAll());
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

      var places = Object.keys(placeModels).filter(function (k) { return 'length' !== k; }).map(function (k, i, arr) {
        var placeModel = placeModels[k];
        var place = mapPlace(placeModel, depth);
        place.isCollapsed = true;
        if (vm.stateParams.placeIdSplitted) {
          place.isCollapsed = place.id != vm.stateParams.placeIdSplitted.slice(0, place.id.split('.').length).join('.');
        }

        place.isFirstChild = 0 == i;
        place.isLastChild = (arr.length - 1) == i;
        place.children = mapPlaces(placeModel.children, depth + 1);

        return place;
      });

      return places;
    }

    function mapInvitations(invitationModels) {
      return invitationModels.map(mapInvitation);
    }

    /*****************************
     *****    Other Methods   ****
     *****************************/
  }
})();
