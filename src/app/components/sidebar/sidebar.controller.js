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
                               NstVmPlace, NstVmInvitation) {
      var vm = this;
      var eventReferences = [];

      isBookMark();
      isSent();
      isFeed();
      /*****************************
       *** Controller Properties ***
       *****************************/
      vm.APP_VERSION = NST_CONFIG.APP_VERSION;
      vm.user = NstSvcAuth.user;
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
      vm.hasDraft = NstSvcPostDraft.has();

      vm.admin_area = NST_CONFIG.ADMIN_DOMAIN + (NST_CONFIG.ADMIN_PORT ? ':' + NST_CONFIG.ADMIN_PORT : '');

      /*****************************
       ***** Controller Methods ****
       *****************************/

      /**
       * Generates an array of numbers with length of given parameter
       * @param {any} num
       * @returns
       */
      vm.range = function (num) {
        var seq = [];
        for (var i = 0; i < num; i++) {
          seq.push(i);
        }

        return seq;
      };

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
       * @function goLabelRoute
       * Opens the label manager modal
       * @param {any} $event
       */
      vm.goLabelRoute = function ($event) {
        $event.preventDefault();
        $uibModal.open({
          animation: false,
          size: 'lg-white',
          templateUrl: 'app/label/manage-label.html',
          controller: 'manageLabelController',
          controllerAs: 'ctrl'
        })
      };

      /**
       * Checks the current state is `unreads` page or not
       */
      vm.isUnread = function () {
        vm.isUnreadMode = $state.current.name == 'app.place-messages-unread';
      };

      vm.isUnread();
      mapLimits();

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

      /*****************************
       *****  Controller Logic  ****
       *****************************/

      if (vm.stateParams.placeId) {
        if (NST_DEFAULT.STATE_PARAM != vm.stateParams.placeId) {
          vm.stateParams.placeIdSplitted = vm.stateParams.placeId.split('.');
        }
      }

      /**
       * Assign the Auth user to the controller view model
       */
      getUser().then(function (user) {
        vm.user = user;
      }).catch(function () {
        throw 'SIDEBAR | user can not parse'
      });

      getMyPlaces().then(function (places) {

        getPlaceOrder()
          .then(function (order) {

            vm.places = mapPlaces(places).filter(function (obj) {
              return obj.id.split('.').length === 1;
            });

            var outOfOrder = 1000;
            for (var i = 0; i < vm.places.length; i++) {
              if (order[vm.places[i].id]) {
                vm.places[i].order = order[vm.places[i].id];
              } else {
                vm.places[i].order = outOfOrder;
                outOfOrder++;
              }
            }

            vm.places = _.sortBy(vm.places,'order');

            fillPlacesNotifCountObject(vm.places);
            getGrandPlaceUnreadCounts();

            fixUrls();

            if ($stateParams.placeId) {
              vm.selectedGrandPlace = _.find(vm.places, function (place) {
                return place.id === $stateParams.placeId.split('.')[0];
              });
            }
          });

      }).catch(function () {
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
      }).catch(function () {
        throw 'SIDEBAR | invitation can not init'
      });


      if (NstSvcAuth.user.unreadNotificationsCount) {
        vm.notificationsCount = NstSvcAuth.user.unreadNotificationsCount;
      } else {
        getNotificationsCount();
      }

      function togglePlace(status) {
        vm.showPlaces = status;
      }

      /*****************************
       *****    Change urls   ****
       *****************************/

      $scope.$on('$stateChangeSuccess', function (event, toState) {
        vm.isBookmarkMode = false;
        vm.isFeed = false;
        vm.isSentMode = false;
        isBookMark();
        isSent();
        isFeed();
        vm.admin_area = NST_CONFIG.ADMIN_DOMAIN + (NST_CONFIG.ADMIN_PORT ? ':' + NST_CONFIG.ADMIN_PORT : '');

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
        if (toState.options && toState.options.primary) {
          fixUrls();
        }
        vm.isUnread();
      });


      /**
       * regenerate the Urls to ensures they are correct
       */
      function fixUrls() {

        vm.urls = {
          unfiltered: $state.href(getUnfilteredState()),
          compose: $state.href(getComposeState(), {placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM}),
          sent: $state.href(getSentState()),
          subplaceAdd: $state.href(getPlaceAddState(), {placeId: vm.stateParams.placeId || NST_DEFAULT.STATE_PARAM})
        };

        mapPlacesUrl(vm.places);
      }

      /**
       * fill the `href` Property of all places and children
       * based on current state
       * @param {any} places
       */
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

      /**
       * determine `placeUnFiltered` states
       * @returns {string}
       * @static
       * @function
       */
      function getUnfilteredState() {
        var state = 'app.messages-favorites';
        return state;
      }

      /**
       * determine `placeFiltered` states
       * @returns {string}
       * @static
       * @function
       */
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

      /**
       * determine `compose` state
       * @returns {string}
       * @static
       * @function
       */
      function getComposeState() {

        return 'app.compose';
      }

      /**
       * determine `Sent` state
       * @returns {string}
       * @static
       * @function
       */
      function getSentState() {
        return 'app.messages-sent';
      }

      /**
       * determine `place-add` state
       * @returns {string}
       * @static
       * @function
       */
      function getPlaceAddState() {
        return 'app.place-add';
      }


      /*****************************
       *****    Place's Order   ****
       *****************************/

      vm.setOrder = {
        accept: function () {
          return true;
        },
        itemMoved: function () {
        },
        orderChanged: function (event) {
          fillOrder(event.source, event.dest);
        },
        clone: false,
        allowDuplicates: false
      };

      function fillOrder() {
        var newOrder = {};
        vm.places.forEach(function (place,i) {
          newOrder[place.id] = i + 1;
        });
        setPlaceOrder(newOrder);
      }

      /**
       * @function
       * Gets the grand places order from server
       * @returns {object}
       */
      function getPlaceOrder() {
         return NstSvcKeyFactory.get(NST_KEY.GENERAL_SETTING_PLACE_ORDER)
           .then(function (result) {
             if (result){
               return JSON.parse(result);
             }else{
               return {};
             }
           });
      }

      /**
       * @function
       * Sets the grand places order in server
       * @returns {Promise}
       */
      function setPlaceOrder(order) {
        return NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_PLACE_ORDER, JSON.stringify(order));
      }

      /*****************************
       *****    Fetch Methods   ****
       *****************************/

      /**
       * Gets logged in user data
       * @returns {object}
       */
      function getUser() {
        return $q(function (res) {
          if (NstSvcAuth.isAuthorized()) {
            res(NstSvcAuth.user);
          } else {
            eventReferences.push($rootScope.$on(NST_AUTH_EVENT.AUTHORIZE, function () {
              res(NstSvcAuth.user);
            }));
          }
        });
      }

      /**
       * Gets user all places
       * @returns
       */
      function getMyPlaces() {
        return NstSvcPlaceFactory.getMyTinyPlaces();
      }

      /**
       * @function getInvitations
       * Gets invitations
       * @returns {Promise}
       */
      function getInvitations() {
        return NstSvcInvitationFactory.getAll();
      }

      /**
       * @function getNotificationsCount
       * Gets notifications count
       */
      function getNotificationsCount() {
        NstSvcNotificationFactory.getNotificationsCount().then(function (count) {
          vm.notificationsCount = count;
        });
      }

      /*****************************
       *****     Map Methods    ****
       *****************************/


      /**
       * Get user limits for creations or any from Api
       */
      function mapLimits() {
        NstSvcUserFactory.get(vm.user.id, true).then(function (person) {
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
              if ( deviceDetector.isDesktop() ) vm.insertItems();
              $rootScope.$emit('unseen-activity-notify', totalUnread);
              $rootScope.$broadcast('init-controls-sidebar');
            });

        }
      }


      /*****************************
       *****    Push Methods    ****
       *****************************/

      /**
       * Create a required object from invitation item and pushes to invitations array
       * @param {any} invitationModel
       */
      function pushInvitation(invitationModel) {
        vm.invitations.push(mapInvitation(invitationModel));
      }

      /*****************************
       *****  Event Listeners   ****
       *****************************/

      eventReferences.push($rootScope.$on(NST_INVITATION_EVENT.ADD, function (e, data) {
        pushInvitation(data.invitation);
        $rootScope.$emit('init-controls-sidebar');
      }));

      eventReferences.push($rootScope.$on(NST_INVITATION_EVENT.ACCEPT, function (e, data) {
        for (var k in vm.invitations) {
          if (data.invitationId === vm.invitations[k].id) {
            vm.invitations.splice(k, 1);
            return;
          }
        }

        $rootScope.$emit('init-controls-sidebar');
      }));

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.ROOT_ADDED, function (e, data) {
        var place = mapPlace(data.place);
        if (place.id === $stateParams.placeId) {
          vm.selectedGrandPlace = place;
        }
        vm.places.push(place);
        vm.placesNotifCountObject[place.id] = 0;
        vm.mapLimits();
        $rootScope.$emit('init-controls-sidebar');
      }));

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.SUB_ADDED, function (e, data) {
        NstSvcPlaceFactory.addPlaceToTree(vm.places, mapPlace(data.place));
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PROFILE_UPDATED, function (e, data) {
        updateUser(data.user);
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_UPDATED, function (e, data) {
        updateUser(data.user);
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_REMOVED, function (e, data) {
        updateUser(data.user);
      }));

      /**
       * Updates the user place data
       * the user place data changes from profile settings
       * @param {object} user
       */
      function updatePersonalPlace(user) {
          var place = _.find(vm.places, {id: user.id});
          if (place && place.id) {
            if (user.hasPicture()) {
              vm.user.avatar = place.avatar = user.picture.getUrl("x64");
            } else {
              vm.user.avatar = place.avatar = '/assets/icons/absents_place.svg';
            }

            place.name = user.getFullName();
          }
      }

      /**
       * Updates the user data
       * the user data changes from profile settings
       * @param {object} user
       */
      function updateUser(user) {
        vm.user = user;
        updatePersonalPlace(user);
      }

      /**
       * Event listener for `NST_PLACE_EVENT.UPDATED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.UPDATED, function (e, data) {
        NstSvcPlaceFactory.updatePlaceInTree(vm.places, mapPlace(data.place));
        var place = mapPlace(data.place);
        if ($stateParams.placeId && place.id === $stateParams.placeId.split('.')[0]) {
          vm.selectedGrandPlace = place;
        }
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.PICTURE_CHANGED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.PICTURE_CHANGED, function (e, data) {
        NstSvcPlaceFactory.updatePlaceInTree(vm.places, mapPlace(data.place));
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.REMOVED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.REMOVED, function (e, data) {
        NstSvcPlaceFactory.removePlaceFromTree(vm.places, data.placeId);
        $rootScope.$emit('init-controls-sidebar');
        vm.mapLimits();
      }));

      /**
       * Event listener for `NST_EVENT_ACTION.POST_ADD`
       */
      eventReferences.push($rootScope.$on(NST_EVENT_ACTION.POST_ADD, function () {
        getGrandPlaceUnreadCounts();
      }));

      /**
       * Event listener for `NST_EVENT_ACTION.POST_REMOVE`
       */
      eventReferences.push($rootScope.$on(NST_EVENT_ACTION.POST_REMOVE, function () {
        getGrandPlaceUnreadCounts();
      }));

      /**
       * Event listener for `NST_POST_EVENT.READ`
       */
      eventReferences.push($rootScope.$on(NST_POST_EVENT.READ, function () {
        getGrandPlaceUnreadCounts();
      }));

      /**
       * Event listener for `post-read-all`
       */
      eventReferences.push($rootScope.$on('post-read-all', function () {
        getGrandPlaceUnreadCounts();
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
          vm.invitations = mapInvitations(result);
        });

      });

      /**
       * Event listener for `reload-counters`
       */
      $rootScope.$on('reload-counters', function () {
        NstSvcLogger.debug('Retrieving mentions count right after focus.');
        getNotificationsCount();
        NstSvcLogger.debug('Retrieving the grand place unreads count right after focus.');
        getGrandPlaceUnreadCounts();
      });

      /**
       * Event listener for `draft-change`
       */
      $scope.$on('draft-change', function () {
        vm.hasDraft = NstSvcPostDraft.has();
      });

      $scope.$on('$destroy', function () {
        _.forEach(eventReferences, function (cenceler) {
          if (_.isFunction(cenceler)) {
            cenceler();
          }
        });
      });

    /**
     * Checks the current state is `Feed` page or not
     * @returns {boolean}
     */
      function isFeed() {
        if ($state.current.name == 'app.messages-favorites' ||
          $state.current.name == 'app.messages-favorites-sorted') {
          vm.isFeed = true;
          return true;
        }
        return false;
      }

    /**
     * Checks the current state is `Bookmark` page or not
     * @returns {boolean}
     */
      function isBookMark() {
        if ($state.current.name == 'app.messages-bookmarked' ||
          $state.current.name == 'app.messages-bookmarked-sort') {
          vm.isBookmarkMode = true;
          return true;
        }
        return false;
      }

    /**
     * Checks the current state is `Sent` page or not
     * @returns {boolean}
     */
      function isSent() {
        if ($state.current.name == 'app.messages-sent' ||
          $state.current.name == 'app.messages-sent-sorted') {
          vm.isSentMode = true;
          return true;
        }
        return false;
      }

    }
  })();
