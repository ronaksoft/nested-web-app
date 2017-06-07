(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarController', SidebarController);

  /** @ngInject */
  function SidebarController($q, $scope, $state, $stateParams, $uibModal, $window, $rootScope, $timeout,
                             _,
                             NST_DEFAULT, NST_AUTH_EVENT, NST_INVITATION_FACTORY_EVENT, NST_PLACE_FACTORY_EVENT, NST_CONFIG,
                             NST_EVENT_ACTION, NST_USER_FACTORY_EVENT, NST_POST_FACTORY_EVENT, NST_NOTIFICATION_FACTORY_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_TYPE,
                             NstSvcAuth, NstSvcServer, NstSvcLogger, NstSvcNotification, NstSvcTranslation,
                             NstSvcPostFactory, NstSvcPlaceFactory, NstSvcInvitationFactory, NstUtility, NstSvcUserFactory, NstSvcSidebar, NstSvcNotificationFactory,
                             NstSvcNotificationSync, NstSvcSync,
                             NstVmPlace, NstVmInvitation) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.APP_VERSION = NST_CONFIG.APP_VERSION;
    vm.user = NstSvcUserFactory.currentUser;
    vm.stateParams = $stateParams;
    vm.invitation = {};
    vm.places = [];
    vm.onPlaceClick = onPlaceClick;
    vm.togglePlace = togglePlace;
    vm.isOpen = false;
    vm.createGrandPlaceLimit = 0;
    vm.mentionOpen = vm.profileOpen = false;
    vm.openCreatePlaceModal = openCreatePlaceModal;
    vm.mapLimits = mapLimits;


    //fixme:: read from config
    vm.admin_area = NST_CONFIG.ADMIN_DOMAIN + (NST_CONFIG.ADMIN_PORT ? ':' + NST_CONFIG.ADMIN_PORT : '');
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

    vm.compose = function ($event) {
      $event.preventDefault();
      $state.go('app.compose', {}, {notify: false});
    };

    vm.isUnread = function () {
      vm.isUnreadMode = $state.current.name == 'app.place-messages-unread';
    };

    vm.isUnread();
    mapLimits();

    vm.invitation.accept = function (id) {
      return NstSvcInvitationFactory.accept(id);
    };

    vm.invitation.decline = function (id) {
      return NstSvcInvitationFactory.decline(id);
    };

    vm.invitation.showModal = function (id, openOtherInvitations) {
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
              var vmPlace = _.find(vm.places, {id: invitation.place.id});

              if (!vmPlace) {
                vmPlace = mapPlace(invitation.place);
                // TODO: Highlight Newly Added Place
                vm.places.push(vmPlace);
                mapPlacesUrl(vm.places);
              }
              if (openOtherInvitations) {
                var checkDisplayInvitationModal = true;
                vm.invitations.map(function (invite) {
                  if (checkDisplayInvitationModal && NstSvcInvitationFactory.storeDisplayedInvitations(invite.id)) {
                    checkDisplayInvitationModal = false;
                    vm.invitation.showModal(invite.id, true);
                  } else {
                    setTimeout(function () {
                      $state.go(getPlaceFilteredState(), {placeId: vmPlace.id});
                    }, 100)
                  }
                });

              }
            });
          } else { // Decline the Invitation
            return vm.invitation.decline(id);
          }
          if (openOtherInvitations) {
            var checkDisplayInvitationModal = true;
            vm.invitations.map(function (invite) {
              if (checkDisplayInvitationModal && NstSvcInvitationFactory.storeDisplayedInvitations(invite.id)) {
                checkDisplayInvitationModal = false;
                vm.invitation.showModal(invite.id, true);
              }
            });
          }
        }).catch(function () {
          if (openOtherInvitations) {
            var checkDisplayInvitationModal = true;
            vm.invitations.map(function (invite) {
              if (checkDisplayInvitationModal && NstSvcInvitationFactory.storeDisplayedInvitations(invite.id)) {
                checkDisplayInvitationModal = false;
                vm.invitation.showModal(invite.id, true);
              }
            });
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

    function openCreatePlaceModal() {
      if( vm.createGrandPlaceLimit > 0 ) {
        $state.go('app.place-create', {}, {notify: false});
      } else {
        $uibModal.open({
          animation: false,
          size: 'sm',
          templateUrl: 'app/place/create/modals/create-place-no-access.html'
        });
      }
    }

    $scope.$on('close-mention', function () {
      vm.mentionOpen = false;
    });

    vm.closeProfile = function () {
      vm.profileOpen = false;
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    if (vm.stateParams.placeId) {
      if (NST_DEFAULT.STATE_PARAM != vm.stateParams.placeId) {
        vm.stateParams.placeIdSplitted = vm.stateParams.placeId.split('.');
      }
    }

    getUser().then(function (user) {
      vm.user = user;
    }).catch(function () {
      throw 'SIDEBAR | user can not parse'
    });

    getMyPlaces().then(function (places) {
      //fixme :: use a better solution to filter grand places
      vm.places = mapPlaces(places).filter(function (obj) {
        return obj.id.split('.').length === 1;
      });

      fillPlacesNotifCountObject(vm.places);
      getGrandPlaceUnreadCounts();
      fixUrls();

      if ($stateParams.placeId) {
        vm.selectedGrandPlace = _.find(vm.places, function (place) {
          return place.id === $stateParams.placeId.split('.')[0];
        });

      }

    }).catch(function (error) {
      throw 'SIDEBAR | places can not init'
    });

    getInvitations().then(function (invitation) {
      if (invitation.length > 0) {
        vm.invitations = mapInvitations(invitation);
        var checkDisplayInvitationModal = true;
        vm.invitations.map(function (invite) {
          if (checkDisplayInvitationModal && NstSvcInvitationFactory.storeDisplayedInvitations(invite.id)) {
            checkDisplayInvitationModal = false;
            vm.invitation.showModal(invite.id, true);
          }
        });

      }
    }).catch(function (error) {
      throw 'SIDEBAR | invitation can not init'
    });


    if (NstSvcAuth.user.unreadNotificationsCount) {
      vm.notificationsCount = NstSvcAuth.user.unreadNotificationsCount;
    } else {
      getNotificationsCount();
    }


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
      vm.isUnread();
    });


    function fixUrls() {

      vm.urls = {
        unfiltered: $state.href(getUnfilteredState()),
        compose: $state.href(getComposeState(), {placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM}),
        // bookmarks: $state.href(getBookmarksState()),
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
          var group = $state.current.options && $state.current.options.group ? $state.current.options.group : null;
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
      var state = 'app.messages-favorites';
      // switch ($state.current.options.group) {
      //   case 'activity':
      //     state = 'app.activity';
      //     break;
      // }

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
      // if ($state.current.params && $state.current.params.placeId) {
      //   return 'app.place-compose';
      // }

      return 'app.compose';
    }

    function getBookmarksState() {
      var state = 'app.messages-favorites';

      switch ($state.current.options.group) {
        case 'activity':
          //todo: favorite activities ( if someday API created ) should start from here ...
          state = 'app.messages-favorites';
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
      return $q(function (res) {
        if (NstSvcAuth.isAuthorized()) {
          res(NstSvcAuth.user);
        } else {
          NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function () {
            res(NstSvcAuth.user);
          });
        }
      });
    }

    function getMyPlaces() {
      return NstSvcPlaceFactory.getMyTinyPlaces();
    }

    function getInvitation(id) {
      return NstSvcInvitationFactory.get(id);
    }

    function getInvitations() {
      return NstSvcInvitationFactory.getAll();
    }

    function getNotificationsCount() {
      NstSvcNotificationFactory.getNotificationsCount().then(function (count) {
        vm.notificationsCount = count;
      });
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/


    function mapLimits() {
      NstSvcUserFactory.get(vm.user.id,true).then(function(person){
        vm.createGrandPlaceLimit = person.limits.grand_places;
      });
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
        if (vm.stateParams.placeId) {
          if (vm.stateParams.placeId.indexOf(place.id + '.') === 0)
            place.isCollapsed = vm.stateParams.placeId.indexOf(place.id + '.') !== 0;
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
      var totalUnread = 0;
      _.each(places, function (place) {
        if (place) {
          vm.placesNotifCountObject[place.id] = place.unreadPosts;
          totalUnread += place.unreadPosts;
        }
      });
      vm.totalUnreadPosts = totalUnread;
      $rootScope.$emit('unseen-activity-notify', totalUnread);
    }

    function getGrandPlaceUnreadCounts() {
      var placeIds = _.keys(vm.placesNotifCountObject);
      if (placeIds.length > 0) {
        NstSvcPlaceFactory.getPlacesUnreadPostsCount(placeIds, true)
          .then(function (places) {
            var totalUnread = 0;
            _.each(places, function (obj) {
              vm.placesNotifCountObject[obj.place_id] = obj.count;
              totalUnread += obj.count;
            });
            vm.totalUnreadPosts = totalUnread;
            vm.insertItems();
            $rootScope.$emit('unseen-activity-notify', totalUnread);
            $rootScope.$broadcast('init-controls-sidebar');
          });

      }
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
      $rootScope.$emit('init-controls-sidebar');
    });

    NstSvcInvitationFactory.addEventListener(NST_INVITATION_FACTORY_EVENT.ACCEPT, function (event) {
      var invitation = event.detail.invitation;

      for (var k in vm.invitations) {
        if (invitation.id == vm.invitations[k].id) {
          vm.invitations.splice(k, 1);
          return;
        }
      }
      $rootScope.$emit('init-controls-sidebar');
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.ROOT_ADD, function (event) {
      var place = mapPlace(event.detail.place);
      if (place.id === $stateParams.placeId) {
        vm.selectedGrandPlace = mapPlace(event.detail.place);
      }
      vm.places.push(place);
      vm.placesNotifCountObject[place.id] = 0;
      vm.mapLimits();
      $rootScope.$emit('init-controls-sidebar');
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.SUB_ADD, function (event) {
      NstSvcPlaceFactory.addPlaceToTree(vm.places, mapPlace(event.detail.place));
    });

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, function (event) {
      vm.user = event.detail;
      var place = _.find(vm.places, {id: NstSvcAuth.user.id});
      if (place && place.id) {
        if (event.detail.hasPicture()) {
          vm.user.avatar = place.avatar = event.detail.picture.getUrl("x64");
        } else {
          vm.user.avatar = place.avatar = '/assets/icons/absents_place.svg';
        }
      }
    });


    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.UPDATE, function (event) {
      NstSvcPlaceFactory.updatePlaceInTree(vm.places, mapPlace(event.detail.place));
      var place = mapPlace(event.detail.place);
      if ($stateParams.placeId && place.id === $stateParams.placeId.split('.')[0]) {
        vm.selectedGrandPlace = place;
      }
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.PICTURE_CHANGE, function (event) {
      NstSvcPlaceFactory.updatePlaceInTree(vm.places, mapPlace(event.detail.place));
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.REMOVE, function (event) {
      NstSvcPlaceFactory.removePlaceFromTree(vm.places, event.detail);
      $rootScope.$emit('init-controls-sidebar');
      vm.mapLimits();
    });


    NstSvcSync.addEventListener(NST_EVENT_ACTION.POST_ADD, function (e) {
      getGrandPlaceUnreadCounts();
    });

    NstSvcSync.addEventListener(NST_EVENT_ACTION.POST_REMOVE, function (e) {
      getGrandPlaceUnreadCounts();
    });


    NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.READ, function (e) {
      getGrandPlaceUnreadCounts();
    });


    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.READ_ALL_POST, function (e) {
      getGrandPlaceUnreadCounts();
    });


    NstSvcNotificationFactory.addEventListener(NST_NOTIFICATION_FACTORY_EVENT.UPDATE, function (event) {
      vm.notificationsCount = event.detail;
    });

    NstSvcNotificationFactory.addEventListener(NST_NOTIFICATION_FACTORY_EVENT.NEW_NOTIFICATION, function (event) {
      vm.notificationsCount += 1;
    });


    NstSvcNotificationFactory.addEventListener(NST_NOTIFICATION_FACTORY_EVENT.OPEN_INVITATION_MODAL, function (event) {
      vm.invitation.showModal(event.detail.id)
    });

    NstSvcNotificationSync.addEventListener(NST_NOTIFICATION_TYPE.INVITE, function (event) {
      getInvitations().then(function (invitations) {
        //FIXME:: Check last invitation

        var invitations = mapInvitations(invitations);
        var lastInvitation = _.pullAllBy(invitations, vm.invitation, 'id')[0];


        if (!lastInvitation) return;

        vm.invitations = invitations;


        // var lastInvitation = _.find(invitations, function (inv) {
        //   return inv.id === event.detail.invite_id
        // });

        NstSvcNotification.push(
          NstUtility.string.format(
            NstSvcTranslation.get("Invitation to {0} by {1}."),
            lastInvitation.place.name,
            lastInvitation.inviter.name),
          function () {
            vm.invitation.showModal(lastInvitation.id)
          })
      }).catch(function (error) {
        throw 'SIDEBAR | invitation push can not init'
      });
    });


    NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
      NstSvcLogger.debug('Retrieving mentions count right after reconnecting.');
      getNotificationsCount();
      NstSvcLogger.debug('Retrieving the grand place unreads count right after reconnecting.');
      getGrandPlaceUnreadCounts();
      NstSvcLogger.debug('Retrieving invitations right after reconnecting.');
      getInvitations().then(function (result) {
        vm.invitations = mapInvitations(result);
      });

    });

    $rootScope.$on('reload-counters', function () {
      NstSvcLogger.debug('Retrieving mentions count right after focus.');
      getNotificationsCount();
      NstSvcLogger.debug('Retrieving the grand place unreads count right after focus.');
      getGrandPlaceUnreadCounts();
    });
  }
})();
