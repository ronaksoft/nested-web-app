(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('SidebarController', SidebarController);

    /** @ngInject */
    function SidebarController($q, $scope, $state, $stateParams, $uibModal, $rootScope,
                               _,
                               NST_DEFAULT, NST_AUTH_EVENT, NST_INVITATION_EVENT, NST_CONFIG, NST_KEY, deviceDetector, NST_PLACE_ACCESS,
                               NST_EVENT_ACTION, NST_USER_EVENT, NST_NOTIFICATION_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_TYPE, NST_PLACE_EVENT, NST_POST_EVENT,
                               NstSvcAuth, NstSvcServer, NstSvcLogger, NstSvcNotification, NstSvcTranslation,
                                NstSvcPlaceFactory, NstSvcInvitationFactory, NstUtility, NstSvcUserFactory, NstSvcSidebar, NstSvcNotificationFactory,
                                NstSvcKeyFactory, NstSvcPostDraft,
                               NstVmPlace) {
      var vm = this;
      var eventReferences = [];
      var myPlaceOrders = {};
      var ABSENT_PLACE_PICTURE_URL = '/assets/icons/absents_place.svg';
      var myPlaceIds = [];

      /*****************************
       *** Controller Properties ***
       *****************************/
      vm.APP_VERSION = NST_CONFIG.APP_VERSION;
      vm.user = NstSvcAuth.user;
      vm.stateParams = $stateParams;
      vm.invitation = {};
      vm.places = [];
      vm.onPlaceClick = onPlaceClick;
      vm.mentionOpen = vm.profileOpen = false;
      vm.openCreatePlaceModal = openCreatePlaceModal;
      vm.openCreateSubplaceModal = openCreateSubplaceModal;
      vm.hasDraft = false;
      vm.myPlacesUnreadPosts = {};
      vm.canCreateClosedPlace = false;
      vm.canCreateOpenPlace = false;
      vm.canCreateGrandPlace = false;

      initialize();

      /*****************************
       ***** Controller Methods ****
       *****************************/

      function initialize() {
        $q.all([getMyPlacesOrder(), getMyPlaces()]).then(function(results) {
          myPlaceOrders = results[0];
          vm.places = createTree(results[1], myPlaceOrders, [], vm.selectedPlaceId);
          
          loadMyPlacesUnreadPostsCount();
        });

        loadCurrentUser();
        loadInvitations();
        setCreatePlaceAccesses();

        vm.hasDraft = NstSvcPostDraft.has();
        vm.admin_area = NST_CONFIG.ADMIN_DOMAIN + (NST_CONFIG.ADMIN_PORT ? ':' + NST_CONFIG.ADMIN_PORT : '');
      }

      /**
       * Represents the create place modal
       * @param {event} $event
       * @param {sting} style - common place or private place
       */
      function openCreateSubplaceModal($event, style) {
        if (style === 'open') {
          $state.go('app.place-create', {placeId: getPlaceId(), isOpenPlace: true}, {notify: false});
        } else {
          $state.go('app.place-create', {placeId: getPlaceId(), isClosePlace: true}, {notify: false});
        }
        $event.preventDefault();
      }

      function rebuildMyPlacesTree(placeId) {
        getMyPlaces(true).then(function(places) {
          vm.places = createTree(places, myPlaceOrders, [], placeId);

          loadMyPlacesUnreadPostsCount();
        });
      }

      function loadCurrentUser() {
        vm.canCreateGrandPlace = false;
        vm.canCreateOpenPlace = false;
        vm.canCreateClosedPlace = false;

        vm.selectedPlaceId = $stateParams.placeId;

        $q.all([
          NstSvcPlaceFactory.get(vm.selectedPlaceId, true),
          NstSvcUserFactory.getCurrent(),
        ]).then(function (results) {
          if (_.size(results) === 2 && _.every(results)) {
            var hasAddPlaceAccess = results[0].hasAccess(NST_PLACE_ACCESS.ADD_PLACE);
            var canAddMore = results[0].canAddSubPlace();

            vm.canCreateClosedPlace = hasAddPlaceAccess
              && results[0].privacy.locked
              && canAddMore;
            vm.canCreateOpenPlace = hasAddPlaceAccess
              && results[0].privacy.locked
              && canAddMore
              && NstUtility.place.isGrand(results[0].id);

            vm.canCreateGrandPlace = results[1].limits.grand_places > 0;

            vm.user = results[1];
            vm.notificationsCount = results[1].unreadNotificationsCount;
          }
        });
      }

      function loadMyPlacesUnreadPostsCount() {
        
        return NstSvcPlaceFactory.getPlacesUnreadPostsCount(myPlaceIds, true).then(function(places) {
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

      eventReferences.push($rootScope.$on('$stateChangeSuccess', function () {
        vm.selectedPlaceId = $stateParams.placeId;
        loadCurrentUser();
      }));

      function setCreatePlaceAccesses() {
        vm.canCreateGrandPlace = false;
        vm.canCreateOpenPlace = false;
        vm.canCreateClosedPlace = false;

        if (vm.selectedPlaceId) {
          $q.all([
            NstSvcPlaceFactory.get(vm.selectedPlaceId, true),
            NstSvcUserFactory.getCurrent(),
          ]).then(function(results) {
            if (_.size(results) === 2 && _.every(results)) {
              var selectedPlace = results[0];
              var currentUser = results[1];

              var hasAddPlaceAccess = selectedPlace.hasAccess(NST_PLACE_ACCESS.ADD_PLACE);
              var canAddMore = selectedPlace.canAddSubPlace();

              vm.canCreateClosedPlace = hasAddPlaceAccess 
                && selectedPlace.privacy.locked 
                && canAddMore;
              vm.canCreateOpenPlace = hasAddPlaceAccess 
                && selectedPlace.privacy.locked
                && canAddMore 
                && NstUtility.place.isGrand(selectedPlace.id)
                && selectedPlace.id !== currentUser.id;

              vm.canCreateGrandPlace = currentUser.limits.grand_places > 0;
            }
          });
        } else {
          // Just check that user is able to create grand-Place
          NstSvcUserFactory.getCurrent().then(function (user) {
            vm.canCreateGrandPlace = user.limits.grand_places > 0;
          });
        }

      }


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
        rebuildMyPlacesTree(data.place.id);
      }));

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.SUB_ADDED, function (e, data) {
        rebuildMyPlacesTree(data.place.id);
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

      /**
       * Returns true if the given Place is a child of the provided parent Place ID
       * 
       * @param {any} parentId 
       * @param {any} place 
       * @returns 
       */
      function isChild(parentId, place) {
        return place && place.id && place.id.indexOf(parentId + '.') === 0;
      }

      /**
       * Returns true if the item should be expanded in Places tree
       * 
       * @param {any} place 
       * @param {any} expandedPlaces A list of places that were expanded before.
       * @param {any} selectedId
       * @returns 
       */
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

      /**
       * Filters the place children
       * 
       * @param {any} place 
       * @param {any} places
       * @param {any} expandedPlaces 
       * @param {any} selectedId 
       * @param {any} depth 
       * @returns 
       */
      function getChildren(place, places, expandedPlaces, selectedId, depth) {
        return _.chain(places).sortBy(['id']).reduce(function (stack, item) {
          // The child does not belong to the Place
          if (!isChild(place.id, item)) {
            return stack;
          }

          var previous = _.last(stack);
          // The place is a child of the previous item. Take a look at the following example:
          // Imagine a user Place tree is ordered in this way:
          // |A
          // |  A.X
          // |    A.X.K
          // |B
          // |  B.Y.J
          // Then a place's child goes right after its parent if we sort the list by ID
          if (previous && isChild(previous.id, item)) {
            return stack;
          }

          var isActive = item.id === selectedId;
          var isExpanded = isItemExpanded(item, expandedPlaces, selectedId);
          var children = getChildren(item, places, expandedPlaces, selectedId, depth + 1);

          stack.push(createTreeItem(item, children, isExpanded, isActive, depth));

          return stack;
        }, []).sortBy(['name']).value();
      }

      /**
       * Creates the user Places tree
       * 
       * @param {any} places 
       * @param {any} orders The order of grand Places. A user is allowed to reorder her grand Places
       * and we keep the order as a global setting between all user devices
       * @param {any} expandedPlaces 
       * @param {any} selectedId 
       * @returns 
       */
      function createTree(places, orders, expandedPlaces, selectedId) {
        myPlaceIds = [];
        return _.chain(places).filter(function (place) {
          // An array of the user places ID (just for getting unread posts count).
          myPlaceIds.push(place.id);
          // This condition filters all grand Places
          return place.id && place.id.indexOf('.') === -1;
        }).map(function(place) {
          var isActive = place.id === selectedId;
          var isExpanded = isItemExpanded(place, expandedPlaces, selectedId);
          // finds the place children
          var children = getChildren(place, places, expandedPlaces, selectedId, 1);

          return createTreeItem(place, children, isExpanded, isActive, 0);
        }).sortBy(function(place) {
          return orders[place.id];
        }).value();
      }

      /**
       * Creates an instance of tree item
       * 
       * @param {any} place 
       * @param {any} children 
       * @param {any} isExpanded 
       * @param {any} isActive 
       * @param {any} depth 
       * @returns 
       */
      function createTreeItem(place, children, isExpanded, isActive, depth) {
        var picture = place.hasPicture() ? place.picture.getUrl('x32') : ABSENT_PLACE_PICTURE_URL;
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
        };
      }

      /**
       * Iterates over the Place children and returns true if any child has unseen post
       * 
       * @param {any} place 
       * @param {any} children 
       * @param {any} myPlacesUnreadPosts 
       * @returns 
       */
      function anyChildrenHasUnseen(place, children, myPlacesUnreadPosts) {
        if (!place || _.size(children) === 0) {
          return false;
        }

        return _.some(children, function(child) {
          return child.hasUnseen;
        });
      }

      /**
       * Checks both the Place model and myPlacesUnreadPosts to find whether the Place has unseen posts or not
       * 
       * @param {any} place 
       * @param {any} myPlacesUnreadPosts 
       * @returns 
       */
      function hasUnseen(place, myPlacesUnreadPosts) {
        return place.unreadPosts > 0 || myPlacesUnreadPosts[place.id] > 0;
      }

    }
  })();
