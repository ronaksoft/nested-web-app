(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarController', SidebarController);

  /** @ngInject */
  function SidebarController($q,$scope, $state, $stateParams, $uibModal, $log, $rootScope,
                             _,
                             NST_DEFAULT, NST_AUTH_EVENT, NST_INVITATION_FACTORY_EVENT, NST_PLACE_FACTORY_EVENT, NST_DELIMITERS, NST_USER_FACTORY_EVENT, NST_POST_FACTORY_EVENT, NST_MENTION_FACTORY_EVENT,
                             NstSvcLoader, NstSvcAuth,
                             NstSvcPostFactory, NstSvcPlaceFactory, NstSvcInvitationFactory, NstUtility, NstSvcUserFactory, NstSvcSidebar, NstSvcMentionFactory,
                             NstVmUser, NstVmPlace, NstVmInvitation) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.stateParams = $stateParams;
    vm.invitation = {};
    vm.places = [];
    vm.onPlaceClick = onPlaceClick;
    vm.togglePlace = togglePlace;
    vm.isOpen = false;
    vm.openCreatePlaceModal = openCreatePlaceModal;

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
              var vmPlace = _.find(vm.places, {id: invitation.getPlace().getId()});

              if (!vmPlace) {
                vmPlace = mapPlace(invitation.getPlace());
                // TODO: Highlight Newly Added Place
                vm.places.push(vmPlace);
              }

              $state.go(getPlaceFilteredState(), {placeId: vmPlace.id});
            });
          } else { // Decline the Invitation
            return vm.invitation.decline(id);
          }
        });
      });
    };

    function onPlaceClick(event, place) {
      if (NstSvcSidebar.onItemClick) {
        event.preventDefault();
        NstSvcSidebar.onItemClick({
          id: place.id,
          name: place.name
        });
      } else {
        vm.selectedGrandPlace = place;
      }
    }

    function openCreatePlaceModal($event) {
      $event.preventDefault();
      $state.go('app.place-create', {  } , { notify : false });
    }
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
      fillPlacesNotifCountObject(vm.places);

      vm.invitations = mapInvitations(resolvedSet[2]);

      if (NstSvcAuth.user.unreadMentionsCount) {
        vm.mentionsCount = NstSvcAuth.user.unreadMentionsCount;
      }else{
        getMentionsCount();
      }

      if ($stateParams.placeId) {
        vm.selectedGrandPlace = _.find(vm.places, function (place) {
          return place.id === $stateParams.placeId.split('.')[0];
        });
      }

      fixUrls();
    });

    $rootScope.$on('$stateChangeSuccess', function () {
      if ($stateParams.placeId) {
        if (vm.selectedGrandPlace && $stateParams.placeId.split('.')[0] !== vm.selectedGrandPlace.id) {
          vm.selectedGrandPlace = _.find(vm.places, function (place) {
            return place.id === $stateParams.placeId.split('.')[0];
          });
        } else {
          vm.selectedGrandPlace = _.find(vm.places, function (place) {
            return place.id === $stateParams.placeId.split('.')[0];
          });
        }
      } else {
        if (vm.selectedGrandPlace) {
          vm.selectedGrandPlace = null;
        }
      }
    });

    function togglePlace(status) {
      vm.showPlaces = status;
    };

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
    };

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
     *****    State Methods   ****
     *****************************/

    // TODO: Move these to Common Service

    function getUnfilteredState() {
      var state = 'app.messages';
      switch ($state.current.options.group) {
        case 'activity':
          state = 'app.activity';
          break;
      }

      return state;
    }

    function getPlaceFilteredState() {
      var state = 'app.place-messages';

      switch ($state.current.options.group) {
        case 'activity':
          state = 'app.place-activity';
          break;
        case 'settings':
          state = 'app.place-settings';
          break;
        case 'compose':
          state = 'app.place-compose';
          break;
      }

      return state;
    }

    function getComposeState() {
      if ($state.current.params && $state.current.params.placeId) {
        return 'app.place-compose';
      }

      return 'app.compose';
    }

    function getBookmarksState() {
      var state = 'app.messages-bookmarks';

      switch ($state.current.options.group) {
        case 'activity':
          state = 'app.activity-bookmarks';
          break;
      }

      return state;
    }

    function getSentState() {
      return 'app.messages-sent';
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

    function getInvitation(id) {
      return NstSvcLoader.inject(NstSvcInvitationFactory.get(id));
    }

    function getInvitations() {
      return NstSvcLoader.inject(NstSvcInvitationFactory.getAll());
    }

    function getMentionsCount() {
      NstSvcLoader.inject(NstSvcMentionFactory.getMentionsCount()).then(function (count) {
        vm.mentionsCount = count;
      })
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

      return Object.keys(placeModels).filter(function (k) {
        return 'length' !== k;
      }).map(function (k, i, arr) {
        var placeModel = placeModels[k];
        var place = mapPlace(placeModel, depth);

        if (vm.getSideItemLink) {
          place.href = vm.getSideItemLink(place.id);
        }

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

    function mapMentions(mentions) {
      var currentUserId = NstSvcAuth.user.id;
      return _.map(mentions, function (item) {
        return new NstVmMention(item, currentUserId);
      });
    }
    /*****************************
     *****   Notifs Counters  ****
     *****************************/
    vm.placesNotifCountObject = {};

    function fillPlacesNotifCountObject(places) {
      _.each(places, function (place) {
        if (place)
          vm.placesNotifCountObject[place.id] = place.unreadPosts;
      });
    }

    function getGrandPlaceUnreadCounts() {
      var placeIds = _.keys(vm.placesNotifCountObject);
      if (placeIds.length > 0)
        NstSvcPlaceFactory.getPlacesUnreadPostsCount(placeIds,true)
          .then(function(places){
            var totalUnread = 0;
            _.each(places, function (value, placeId) {
              vm.placesNotifCountObject[placeId] = value;
              totalUnread += value;
            });
            $rootScope.$emit('unseen-activity-notify', totalUnread);
          });
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
      var place = mapPlace(event.detail.place);
      if (place.id === $stateParams.placeId) {
        vm.selectedGrandPlace = mapPlace(event.detail.place);
      }
      NstSvcPlaceFactory.addPlaceToTree(vm.places, place);
      vm.placesNotifCountObject[place.id] = 0;

    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.SUB_ADD, function (event) {
      NstSvcPlaceFactory.addPlaceToTree(vm.places, mapPlace(event.detail.place));
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.UPDATE, function (event) {
      NstSvcPlaceFactory.updatePlaceInTree(vm.places, mapPlace(event.detail.place));
      var place = mapPlace(event.detail.place);
      if (place.id === $stateParams.placeId) {
        vm.selectedGrandPlace = mapPlace(event.detail.place);
      }
    });

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, function (event) {
      vm.user = mapUser(event.detail);
    });

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PICTURE_UPDATED, function (event) {
      vm.user.avatar = event.detail.getPicture().getThumbnail(64).getUrl().view;

      var place = _.find(vm.places, {id: NstSvcAuth.user.id});
      if (place) {
        place.avatar = event.detail.getPicture().getThumbnail(64).getUrl().view;
      }
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.PICTURE_CHANGE, function (event) {
      NstSvcPlaceFactory.updatePlaceInTree(vm.places, mapPlace(event.detail.place));
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.REMOVE, function (event) {
      NstSvcPlaceFactory.removePlaceFromTree(vm.places, event.detail, null);
    });


    NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.ADD, function (e) {
      getGrandPlaceUnreadCounts();
    });


    NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.READ, function (e) {
      getGrandPlaceUnreadCounts();
    });

    NstSvcMentionFactory.addEventListener(NST_MENTION_FACTORY_EVENT.UPDATE, function (event) {
      if(event.detail) {
        vm.mentionsCount = event.detail;
      }
    });

    NstSvcMentionFactory.addEventListener(NST_MENTION_FACTORY_EVENT.NEW_MENTION, function (event) {
      vm.mentionsCount += 1;
    });

  }
})();
