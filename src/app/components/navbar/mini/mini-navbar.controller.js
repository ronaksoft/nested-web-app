(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .controller('MiniNavbarController', MiniNavbarController);

  /** @ngInject */
  function MiniNavbarController($q, $state, $stateParams, $uibModal, $scope,
                                NST_AUTH_EVENT, NST_DEFAULT,
                                NstSvcLoader, NstSvcAuth, NstSvcPlaceFactory, NstSvcInvitationFactory,
                                NstVmUser, NstVmPlace, NstVmInvitation) {
    var vm = this;
    // $scope.$watch('place', function (newValue, oldValue) {
    //   // if (oldValue !== newValue) {
    //   //   vm.place = newValue;
    //   // }
    // });

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.stateParams = $stateParams;
    vm.invitation = {};
    vm.urls = {
      unfiltered: $state.href(getUnfilteredState()),
      compose: $state.href(getComposeState(), { placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM }),
      bookmarks: $state.href(getBookmarksState()),
      sent: $state.href(getSentState()),
      placeAdd: $state.href(getPlaceAddState(), { placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM })
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

    vm.getPlaceName = function () {
      if (vm.hasPlace()){
        return $scope.place.name;
      } else {
        return 'All Places';
      }
    };

    vm.getPlaceId = function () {
      if (vm.hasPlace()){
        return $scope.place.id;
      } else {
        return '';
      }
    };

    vm.getPlacePicture = function () {
      if (vm.hasPlace()){
        return $scope.place.picture.thumbnails.x64.url.view;
      } else {
        return '';
      }
    };

    vm.hasPlace = function () {
      return $scope.place && $scope.place.id;
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    $q.all([getUser(), getMyPlaces(), getInvitations()]).then(function (resolvedSet) {
      vm.user = mapUser(resolvedSet[0]);
      vm.places = mapPlaces(resolvedSet[1]);
      vm.invitations = mapInvitations(resolvedSet[2]);
      fixUrls();
    });

    /*****************************
     *****    State Methods   ****
     *****************************/

    function getUnfilteredState() {
      var state = 'app.messages';
      switch ($state.current.name) {
        case 'app.activity':
        case 'app.activity-favorites':
        case 'app.activity-favorites-filtered':
        case 'app.activity-filtered':
        case 'app.place-activity':
        case 'app.place-activity-filtered':
          state = 'app.activity';
          break;
      }

      return state;
    }

    function openCreatePlaceModal($event) {
      $event.preventDefault();
      $state.go('app.place-create', {  } , { notify : false });
    }

    function getComposeState() {
      var state = 'app.compose';
      switch ($state.current.name) {
        case 'app.place-activity':
        case 'app.place-activity-sorted':
        case 'app.place-messages':
        case 'app.place-messages-filtered':
          state = 'app.place-compose';
          break;
      }

      return state;
    }

    function getBookmarksState() {
      var state = 'app.messages-favorites';
      switch ($state.current.name) {
        case 'app.activity':
        case 'app.activity-favorites':
        case 'app.activity-favorites-filtered':
        case 'app.activity-filtered':
        case 'app.place-activity':
        case 'app.place-activity-filtered':
          state = 'app.activity-favorites';
          break;
      }

      return state;
    }

    function getSentState() {
      var state = 'app.messages-sent';
      switch ($state.current.name) {
        case 'app.messages-sorted':
        case 'app.messages-sent-sorted':
        case 'app.messages-favorites-sorted':
        case 'app.place-messages-sorted':
          state = 'app.messages-sent-sorted';
          break;
      }

      return state;
    }

    function getPlaceAddState() {
      return 'app.place-add';
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
     *****    Change urls   ****
     *****************************/

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (toState.options && toState.options.primary) {
        fixUrls();
      }
    });


    function fixUrls() {

      vm.urls = {
        unfiltered: $state.href(getUnfilteredState()),
        compose: $state.href(getComposeState(), {placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM}),
        bookmarks: $state.href(getBookmarksState()),
        sent: $state.href(getSentState()),
        subplaceAdd: $state.href(getPlaceAddState(), {placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM})
      };

      mapPlacesUrl(vm.places);
    }

    function mapPlacesUrl(places) {

      places.map(function (place) {

        if ($state.current.params && $state.current.params.placeId) {
          place.href = $state.href($state.current.name, Object.assign({}, $stateParams, {placeId: place.id}));
        } else {
          switch ($state.current.options.group) {
            case 'file':
              place.href = $state.href('app.place-files', {placeId: place.id});
              break;
            case 'activity':
              place.href = $state.href('app.place-activity', {placeId: place.id});
              break;
            case 'settings':
              place.href = $state.href('app.place-settings', {placeId: place.id});
              break;
            case 'compose':
              place.href = $state.href('app.place-compose', {placeId: place.id});
              break;
            default:
              place.href = $state.href('app.place-messages', {placeId: place.id});
              break;
          }
        }

        if (place.children) mapPlacesUrl(place.children);

        return place;
      })
    }

    /*****************************
     *****    Other Methods   ****
     *****************************/
  }
})();
