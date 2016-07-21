(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, $scope, $state, $stateParams, $location,
                                               NST_AUTH_EVENT,
                                               NstSvcLoader, NstSvcAuth, NstSvcPlaceFactory, NstSvcInvitationFactory) {
      var vm = this;

      /*****************************
       *** Controller Properties ***
       *****************************/

      vm.stateParams = $stateParams;

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

      vm['invitations'] = {};

      vm.invitations.accept = function (id) {
        return NstSvcInvitationFactory.accept(id);
      };

      vm.invitations.decline = function (id) {
        return NstSvcInvitationFactory.decline(id);
      };

      if ($stateParams.placeId) {
        if ('_' == $stateParams.placeId) {
          $state.go(getUnfilteredState());
        } else {
          vm.stateParams.placeIdSplitted = $stateParams.placeId.split('.');
        }
      }

      // TODO: Here is what we need to build the sidebar
      //    1. User Places
      //    2. User Invitations
      //    3. User Profile

      $q.all([getUser(), getMyPlaces(), getInvitations()]).then(function (resolvedSet) {
        vm.urls = {
          unfiltered: $state.href(getUnfilteredState()),
          bookmarks: $state.href(getBookmarksState()),
          sent: $state.href(getSentState())
        };

        vm.user = mapUser(resolvedSet[0]);
        vm.places = mapPlaces(resolvedSet[1]);
        vm.invitations = mapInvitations(resolvedSet[2]);
      });

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

      function getPlaceFilteredState() {
        var state = 'place-messages';
        switch ($state.current.name) {
          case 'activity':
          case 'place-activity':
            state = 'place-activity';
            break;
        }

        return state;
      }

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
       *****     Map Methods    ****
       *****************************/

      function mapUser(userModel) {
        var user = {
          id : userModel.getId(),
          avatar : userModel.getPicture().getThumbnail(32).getUrl().view,
          name : userModel.getFullName()
        };

        return user;
      }

      function mapPlaces(placeModels, depth) {
        depth = depth || 0;

        var placesClone = Object.keys(placeModels).filter(function (k) { return 'length' !== k; }).map(function (k, i, arr) {
          var placeModel = placeModels[k];
          var place = {};
          place.depth = depth;
          place.id = placeModel.getId();
          place.name = placeModel.getName();
          place.url = $state.href(getPlaceFilteredState(), { placeId: placeModel.getId() });
          place.avatar = placeModel.getPicture().getId() ? placeModel.getPicture().getThumbnail(32).getUrl().view : '/assets/icons/absents_place.svg';
          place.isCollapsed = true;
          if (vm.stateParams.placeIdSplitted) {
            place.isCollapsed = place.id != vm.stateParams.placeIdSplitted.slice(0, place.id.split('.').length).join('.');
          }
          place.isFirstChild = 0 == i;
          place.isLastChild = (arr.length - 1) == i;
          place.children = mapPlaces(placeModel.children, depth + 1);

          return place;
        });

        return placesClone;
      }

      function mapInvitations(invitations) {
        return invitations;
      }

      /*****************************
       *****    Other Methods   ****
       *****************************/

      // // Invitations
      // $scope.invitations = {
      //   length: 0,
      //   invites: {}
      // };
      // LoaderService.inject(WsService.request('account/get_invitations').then(function (data) {
      //   for (var k in data.invitations) {
      //     if (data.invitations[k].place._id) {
      //       var invitation = new NestedInvitation(data.invitations[k]);
      //       $scope.invitations.invites[invitation.id] = invitation;
      //       $scope.invitations.length++;
      //     }
      //   }
      //
      //   return $q(function (res) {
      //     res();
      //   });
      // }));
      // $scope.decideInvite = function (invitation, accept) {
      //   return invitation.update(accept).then(function (invitation) {
      //     $scope.invitations.length--;
      //     delete $scope.invitations.invites[invitation.id];
      //   });
      // };
      //
      // $scope.inviteModal = function () {
      //
      //   $uibModal.open({
      //     animation: false,
      //     templateUrl: 'app/events/partials/invitation.html',
      //     controller: 'InvitationController',
      //     size: 'sm',
      //     scope: $scope
      //   }).result.then(function () {
      //     return $location.path('/').replace();
      //   });
      // };

    })
    .directive('nestedSidebar', nestedSidebar);


  /** @ngInject */
  function nestedSidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'ctlSidebar',
      bindToController: true
    };
  }
})();
