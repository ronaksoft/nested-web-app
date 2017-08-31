(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('SidebarController', SidebarController);

    /** @ngInject */
    function SidebarController($q, $scope, $state, $stateParams, $uibModal, $rootScope,
                               _,
                               NST_DEFAULT, NST_AUTH_EVENT, NST_INVITATION_EVENT, NST_CONFIG,NST_KEY, deviceDetector,
                               NST_EVENT_ACTION, NST_USER_EVENT, NST_NOTIFICATION_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_TYPE, NST_PLACE_EVENT, NST_POST_EVENT,
                               NstSvcAuth, NstSvcServer, NstSvcLogger, NstSvcNotification, NstSvcTranslation,
                                NstSvcPlaceFactory, NstSvcInvitationFactory, NstUtility, NstSvcUserFactory, NstSvcSidebar, NstSvcNotificationFactory,
                                NstSvcKeyFactory, NstSvcPostDraft,
                               NstVmPlace) {
      var vm = this;
      var eventReferences = [];
      var myPlaceOrders = {};

      /*****************************
       *** Controller Properties ***
       *****************************/
      vm.APP_VERSION = NST_CONFIG.APP_VERSION;
      vm.user = NstSvcAuth.user;
      vm.stateParams = $stateParams;
      vm.invitation = {};
      vm.places = [];
      vm.onPlaceClick = onPlaceClick;
      vm.canAddGrandPlace = null;
      vm.mentionOpen = vm.profileOpen = false;
      vm.openCreatePlaceModal = openCreatePlaceModal;
      vm.hasDraft = false;
      vm.myPlacesUnreadPosts = {};

      initialize();

      /*****************************
       ***** Controller Methods ****
       *****************************/

      function initialize() {
        $q.all([getMyPlacesOrder(), getMyPlaces()]).then(function(results) {
          myPlaceOrders = results[0];
          vm.places = createTree(results[1], myPlaceOrders, [], vm.selectedPlaceId);
          
          console.log(vm.places);
          loadMyPlacesUnreadPostsCount();
        });

        loadCurrentUser();
        loadInvitations();

        vm.hasDraft = NstSvcPostDraft.has();
        vm.admin_area = NST_CONFIG.ADMIN_DOMAIN + (NST_CONFIG.ADMIN_PORT ? ':' + NST_CONFIG.ADMIN_PORT : '');
      }

      function rebuildMyPlacesTree() {
        getMyPlaces(force).then(function(places) {
          vm.places = createTree(places, myPlaceOrders, [], vm.selectedPlaceId);

          loadMyPlacesUnreadPostsCount();
        });
      }

      function loadCurrentUser() {
        NstSvcUserFactory.getCurrent().then(function (user) {
          vm.user = user;
          vm.notificationsCount = user.unreadNotificationsCount;
          vm.canAddGrandPlace = user.limits.grand_places > 0;
        });
      }

      function loadMyPlacesUnreadPostsCount(grandPlaceIds) {
        var grandPlaceIds = _.map(vm.places.map(function (place) {
          return place.id;
        }));
        return NstSvcPlaceFactory.getPlacesUnreadPostsCount(grandPlaceIds, true).then(function(places) {
          var total = 0;
          vm.myPlacesUnreadPosts = {};

          _.forEach(places, function(item) {
            vm.myPlacesUnreadPosts[item.place_id] = item.count;
            total += item.count;
          });

          $rootScope.$emit('unseen-activity-notify', total);
        });
      }

      function getMyPlaces(force) {
        return NstSvcPlaceFactory.getMyPlaces(force);
      }

      /**
       * @function compose
       * Opens the compose modal
       * @param {any} $event
       */
      vm.compose = function ($event) {
        $event.preventDefault();
        $state.go('app.compose', {}, {notify: false});
      };



      /**
       * @function
       * Represents the invitation prompt modal
       * @param {any} id
       * @param {boolean} openOtherInvitations
       * @returns
       */
      vm.invitation.showModal = function (id, openOtherInvitations) {
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

            if (result) { // Accept the Invitation
              return NstSvcInvitationFactory.accept(id).then(function (invitation) {
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
              return NstSvcInvitationFactory.decline(id);
            }
            // if (openOtherInvitations) {
            //   var checkDisplayInvitationModal = true;
            //   vm.invitations.map(function (invite) {
            //     if (checkDisplayInvitationModal && NstSvcInvitationFactory.storeDisplayedInvitations(invite.id)) {
            //       checkDisplayInvitationModal = false;
            //       vm.invitation.showModal(invite.id, true);
            //     }
            //   });
            // }
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

      /**
       * Triggers on clicking place clicking
       * @param {any} event
       * @param {any} place
       */
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

      /**
       * Represents the create place modal modal also shows a
       * warning modal if the user reached the create place limit
       */
      function openCreatePlaceModal() {
        if (vm.createGrandPlaceLimit > 0) {
          $state.go('app.place-create', {}, {notify: false});
        } else {
          $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'app/place/create/modals/create-place-no-access.html'
          });
        }
      }

      /**
       * Listen to closing notification popover event
       */
      $scope.$on('close-mention', function () {
        vm.mentionOpen = false;
      });

      /**
       * Close the profile popover
       */
      vm.closeProfile = function () {
        vm.profileOpen = false;
      };

      function loadInvitations() {
        NstSvcInvitationFactory.getAll().then(function (invitations) {
          if (invitations.length > 0) {
            vm.invitations = invitations;
            var checkDisplayInvitationModal = true;
            vm.invitations.map(function (invite) {
              if (checkDisplayInvitationModal && NstSvcInvitationFactory.storeDisplayedInvitations(invite.id)) {
                checkDisplayInvitationModal = false;
                vm.invitation.showModal(invite.id, true);
              }
            });
          }
        }).catch(function () {
          throw 'SIDEBAR | invitation can not init'
        });
      }

      /*****************************
       *****    Change urls   ****
       *****************************/

      $scope.$on('$stateChangeSuccess', function (event, toState) {
        vm.selectedPlaceId = $stateParams.placeId;
      });


      /*****************************
       *****    Place's Order   ****
       *****************************/

      /**
       * @function
       * Gets the grand places order from server
       * @returns {object}
       */
      function getMyPlacesOrder() {
        return NstSvcKeyFactory.get(NST_KEY.GENERAL_SETTING_PLACE_ORDER).then(function (result) {
          if (result) {
            return JSON.parse(result);
          }

          return {};
        });
      }

      /**
       * @function
       * Sets the grand places order in server
       * @returns {Promise}
       */
      function setMyPlacesOrder(order) {
        return NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_PLACE_ORDER, JSON.stringify(order));
      }

      
      vm.range = function (num) {
        var seq = [];
        for (var i = 0; i < num; i++) {
          seq.push(i);
        }

        return seq;
      };

      /*****************************
       *****    Fetch Methods   ****
       *****************************/

      /**
       * @function getInvitations
       * Gets invitations
       * @returns {Promise}
       */
      
      function loadNotificationsCount() {
        NstSvcNotificationFactory.getNotificationsCount().then(function (count) {
          vm.notificationsCount = count;
        });
      }

      /*****************************
       *****  Event Listeners   ****
       *****************************/

      eventReferences.push($rootScope.$on(NST_INVITATION_EVENT.ADD, function (e, data) {
        loadInvitations();
      }));

      eventReferences.push($rootScope.$on(NST_INVITATION_EVENT.ACCEPT, function (e, data) {
        loadInvitations();
      }));

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.ROOT_ADDED, function (e, data) {
        rebuildMyPlacesTree();
      }));

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.SUB_ADDED, function (e, data) {
        rebuildMyPlacesTree();
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PROFILE_UPDATED, function (e, data) {
        loadCurrentUser();
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_UPDATED, function (e, data) {
        loadCurrentUser();
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_REMOVED, function (e, data) {
        loadCurrentUser();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.UPDATED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.UPDATED, function (e, data) {
        rebuildMyPlacesTree();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.PICTURE_CHANGED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.PICTURE_CHANGED, function (e, data) {
        rebuildMyPlacesTree();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.REMOVED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.REMOVED, function (e, data) {
        rebuildMyPlacesTree();
      }));

      /**
       * Event listener for `NST_EVENT_ACTION.POST_ADD`
       */
      eventReferences.push($rootScope.$on(NST_EVENT_ACTION.POST_ADD, function () {
        loadMyPlacesUnreadPostsCount();
      }));

      /**
       * Event listener for `NST_EVENT_ACTION.POST_REMOVE`
       */
      eventReferences.push($rootScope.$on(NST_EVENT_ACTION.POST_REMOVE, function () {
        loadMyPlacesUnreadPostsCount();
      }));

      /**
       * Event listener for `NST_POST_EVENT.READ`
       */
      eventReferences.push($rootScope.$on(NST_POST_EVENT.READ, function () {
        loadMyPlacesUnreadPostsCount();
      }));

      /**
       * Event listener for `post-read-all`
       */
      eventReferences.push($rootScope.$on('post-read-all', function () {
        loadMyPlacesUnreadPostsCount();
      }));

      /**
       * Event listener for `NST_NOTIFICATION_EVENT.UPDATE`
       */
      eventReferences.push($rootScope.$on(NST_NOTIFICATION_EVENT.UPDATE, function (e, data) {
        vm.notificationsCount = data.count;
      }));

      /**
       * Event listener for `NST_NOTIFICATION_EVENT.OPEN_INVITATION_MODAL`
       */
      eventReferences.push($rootScope.$on(NST_NOTIFICATION_EVENT.OPEN_INVITATION_MODAL, function (e, data) {
        vm.invitation.showModal(data.notificationId);
      }));

      /**
       * Event listener for `NST_NOTIFICATION_TYPE.INVITE`
       */
      eventReferences.push($rootScope.$on(NST_NOTIFICATION_TYPE.INVITE, function () {
        getInvitations().then(function (invitations) {
          //FIXME:: Check last invitation

          var lastInvitation = _.pullAllBy(invitations, vm.invitation, 'id')[0];


          if (!lastInvitation) return;

          NstSvcNotification.push(
            NstUtility.string.format(
              NstSvcTranslation.get("Invitation to {0} by {1}."),
              lastInvitation.place.name,
              lastInvitation.inviter.name),
            function () {
              vm.invitation.showModal(lastInvitation.id)
            })
        }).catch(function () {
          throw 'SIDEBAR | invitation push can not init'
        });
      }));

      /**
       * Event listener for `NST_SRV_EVENT.RECONNECT`
       */
      NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
        NstSvcLogger.debug('Retrieving mentions count right after reconnecting.');
        getNotificationsCount();
        NstSvcLogger.debug('Retrieving the grand place unreads count right after reconnecting.');
        getGrandPlaceUnreadCounts();
        NstSvcLogger.debug('Retrieving invitations right after reconnecting.');
        getInvitations().then(function (result) {
          vm.invitations = result;
        });

      });

      /**
       * Event listener for `reload-counters`
       */
      $rootScope.$on('reload-counters', function () {
        NstSvcLogger.debug('Retrieving mentions count right after focus.');
        loadNotificationsCount();
        NstSvcLogger.debug('Retrieving the grand place unreads count right after focus.');
        loadMyPlacesUnreadPostsCount();
      });

      /**
       * Event listener for `draft-change`
       */
      $scope.$on('draft-change', function () {
        vm.hasDraft = NstSvcPostDraft.has();
      });

      $scope.$on('$destroy', function () {
        _.forEach(eventReferences, function (canceler) {
          if (_.isFunction(canceler)) {
            canceler();
          }
        });
      });

      function isItemExpanded(place, expandedPlaces, selectedId) {
        // In this case the the selected Place ID is exactly the same with current place ID or
        // the current Place ID is a subset of selected Place ID. Take a look at the examples:
        // |#  |Conditions         |Current             |Selected
        // |1  |both are the same  |company.marketing   |company.marketing
        // |2  |parent-child       |company             |company.marketing
        if (selectedId && _.startsWith(selectedId, place.id)) {
          return true;
        }
        // The place exists in expanded places list
        if (_.includes(expandedPlaces, place.id)) {
          return true;
        }

        return false;
      }

      function getChildren(place, places, expandedPlaces, selectedId, depth) {
        return _.chain(places).filter(function (child) {
          return child && child.id && child.id.indexOf(place.id + '.') === 0;
        }).map(function (place) {
          var isActive = place.id === selectedId;
          var isExpanded = isItemExpanded(place, expandedPlaces, selectedId);
          var children = getChildren(place, places, expandedPlaces, selectedId, depth + 1);

          return createTreeItem(place, children, isExpanded, isExpanded, depth);
        }).sortBy(['name']).value();
      }

      function createTree(places, orders, expandedPlaces, selectedId) {
        return _.chain(places).filter(function (place) {
          return place.id && place.id.indexOf('.') === -1;
        }).map(function(place) {
          var isActive = place.id === selectedId;
          var isExpanded = isItemExpanded(place, expandedPlaces, selectedId);
          var children = getChildren(place, places, expandedPlaces, selectedId, 1);

          return createTreeItem(place, children, isExpanded, isActive, 0);
        }).sortBy(function(place) {
          return orders[place.id];
        }).value();
      }

      function createTreeItem(place, children, isExpanded, isActive, depth) {
        var picture = place.hasPicture() ? place.picture.getUrl('x32') : null;
        var canCreateClosedPlace = place.privacy.locked && place.canAddSubPlace();
        var canCreateOpenPlace = !place.privacy.locked && place.canAddSubPlace();
        return {
          id: place.id,
          name: place.name,
          picture: picture,
          children: children,
          hasChildren: children && children.length > 0,
          hasUnseen: hasUnseen(place, vm.myPlacesUnreadPosts),
          childrenHasUnseen: anyChildrenHasUnseen(place, children, vm.myPlacesUnreadPosts),
          isExpanded: isExpanded,
          isActive: isActive,
          depth: depth,
          canCreateOpenPlace: canCreateOpenPlace,
          canCreateClosedPlace: canCreateClosedPlace,
        };
      }

      function anyChildrenHasUnseen(place, children, myPlacesUnreadPosts) {
        if (!place || _.size(children) === 0) {
          return false;
        }

        return _.some(children, function(child) {
          return child.hasUnseen;
        });
      }

      function hasUnseen(place, myPlacesUnreadPosts) {
        console.log('====================================');
        console.log('hasUnseen', place);
        console.log('====================================');
        return place.unreadPosts > 0 || myPlacesUnreadPosts[place.id] > 0;
      }

    }
  })();
