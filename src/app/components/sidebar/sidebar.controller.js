(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', SidebarController);

  /** @ngInject */
  function SidebarController($q, $state, $stateParams, $uibModal,
                             NST_AUTH_EVENT, NST_SRV_EVENT, NST_EVENT_ACTION,
                             NstSvcLoader, NstSvcTry, NstSvcServer, NstSvcAuth, NstSvcPlaceFactory, NstSvcInvitationFactory,
                             NstVmUser, NstVmPlace, NstVmInvitation) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.stateParams = $stateParams;
    vm.invitation = {};
    vm.urls = {
      unfiltered: $state.href(getUnfilteredState()),
      compose: $state.href(getComposeState(), { placeId: vm.stateParams.placeId || '_' }),
      bookmarks: $state.href(getBookmarksState()),
      sent: $state.href(getSentState()),
      placeAdd: $state.href(getPlaceAddState(), { placeId: vm.stateParams.placeId || '_' })
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

    vm.invitation.accept = function (id) {
      return NstSvcLoader.inject(NstSvcInvitationFactory.accept(id));
    };

    vm.invitation.decline = function (id) {
      return NstSvcLoader.inject(NstSvcInvitationFactory.decline(id));
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
          for (var k in vm.invitations) {
            if (id == vm.invitations[k].id) {
              vm.invitations.splice(k, 1);
            }
          }

          if (result) {
            return vm.invitation.accept(id).then(function () {
              // TODO: Add to my-place-ids storage (Not directly. Do it via Factory)
            });
          } else {
            return vm.invitation.decline(id);
          }
        });
      });
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    if (vm.stateParams.placeId) {
      if ('_' == vm.stateParams.placeId) {
        $state.go(getUnfilteredState());
      } else {
        vm.stateParams.placeIdSplitted = vm.stateParams.placeId.split('.');
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
        if (vm.stateParams.placeIdSplitted) {
          place.isCollapsed = place.id != vm.stateParams.placeIdSplitted.slice(0, place.id.split('.').length).join('.');
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
     *****    Other Methods   ****
     *****************************/

    NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (event) {
      switch (event.detail.timeline_data.action) {
        case NST_EVENT_ACTION.MEMBER_INVITE:
          getInvitation(event.detail.timeline_data.invite_id.$oid).then(pushInvitation);
          break;

        case NST_EVENT_ACTION.MEMBER_REMOVE:
          break;

        case NST_EVENT_ACTION.PLACE_ADD:
          break;

        case NST_EVENT_ACTION.PLACE_REMOVE:
          break;

        case NST_EVENT_ACTION.PLACE_PICTURE:
          break;
      }
    });
  }
})();
