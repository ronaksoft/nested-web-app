(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('SidebarController', SidebarController);

    /** @ngInject */
    function SidebarController($q, $scope, $state, $stateParams, $uibModal, $rootScope,
                               _, toastr,
                               NST_DEFAULT, NST_AUTH_EVENT, NST_CONFIG, NST_KEY, deviceDetector, NST_PLACE_ACCESS, NST_SRV_ERROR,
                               NST_PLACE_EVENT_ACTION, NST_USER_EVENT, NST_NOTIFICATION_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_TYPE, NST_PLACE_EVENT, NST_POST_EVENT,
                               NstSvcAuth, NstSvcServer, NstSvcLogger, NstSvcNotification, NstSvcTranslation,
                               NstSvcNotificationSync, NstSvcPlaceFactory, NstUtility, NstSvcUserFactory, NstSvcSidebar,
                               NstSvcKeyFactory, NstSvcPostDraft, NstSvcGlobalCache) {
      var vm = this;
      var eventReferences = [];
      var myPlaceOrders = {};
      var ABSENT_PLACE_PICTURE_URL = '/assets/icons/absents_place.svg';
      var myPlaceIds = [];

      /*****************************
       *** Controller Properties ***
       *****************************/
      vm.user = NstSvcAuth.user;
      vm.stateParams = $stateParams;
      vm.places = [];
      vm.onPlaceClick = onPlaceClick;
      vm.openCreatePlaceModal = openCreatePlaceModal;
      vm.openCreateSubplaceModal = openCreateSubplaceModal;
      vm.updateExpanded = updateExpanded;
      vm.expandedPlaces = [];
      vm.hasDraft = false;
      vm.myPlacesUnreadPosts = {};
      vm.myPlacesHasUnseenChildren = [];
      vm.isChildrenUnseen = isChildrenUnseen;
      vm.canCreateClosedPlace = false;
      vm.canCreateOpenPlace = false;
      vm.canCreateGrandPlace = false;
      vm.noAccessCreatingMessage = '';
      vm.selectedPlaceName = '';

      var storedExpandedPlacesService = [];
      var storedExpandedPlacesKey = '_savedExpandedPlaces';

      initialize();

      /*****************************
       ***** Controller Methods ****
       *****************************/

      function initialize() {
        storedExpandedPlacesService = NstSvcGlobalCache.createProvider('sidebar_expanded_places');
        var expandedPlacesData = storedExpandedPlacesService.get(storedExpandedPlacesKey);
        if (expandedPlacesData !== null && _.isObject(expandedPlacesData)) {
          for(var key in expandedPlacesData) {
            if (key !== '__exp') {
              vm.expandedPlaces.push(expandedPlacesData[key]);
            }
          }
        }
        $q.all([getMyPlacesOrder(), getMyPlaces()]).then(function(results) {
          myPlaceOrders = results[0];
          vm.places = createTree(results[1], myPlaceOrders, vm.expandedPlaces, vm.selectedPlaceId);
          loadMyPlacesUnreadPostsCount();
        });

        loadCurrentUser();

        vm.hasDraft = NstSvcPostDraft.has();
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

      /**
       * return the current place id
       * @returns string
       */
      function getPlaceId() {
        return vm.selectedPlaceId;
      }

      function rebuildMyPlacesTree(placeId) {
        $q.all([getMyPlacesOrder(), getMyPlaces(true)]).then(function(results) {
          myPlaceOrders = results[0];
          vm.places = createTree(results[1], myPlaceOrders, vm.expandedPlaces, placeId || vm.selectedPlaceId);
          loadMyPlacesUnreadPostsCount();
        });
      }

      function loadCurrentUser() {
        vm.canCreateGrandPlace = false;
        vm.canCreateOpenPlace = false;
        vm.canCreateClosedPlace = false;

        vm.selectedPlaceId = $stateParams.placeId;

        if (vm.selectedPlaceId) {
          $q.all([
            NstSvcPlaceFactory.get(vm.selectedPlaceId, true),
            NstSvcUserFactory.getCurrent(true)
          ]).then(function (results) {
            if (_.size(results) === 2 && _.every(results)) {
              vm.selectedPlaceName = results[0].name;
              var hasAddPlaceAccess = results[0].hasAccess(NST_PLACE_ACCESS.ADD_PLACE);
              var canAddMore = results[0].canAddSubPlace();
              if (!hasAddPlaceAccess) {
                vm.noAccessCreatingMessage = NstSvcTranslation.get('You have no access create sub Places here.');
              }
              if (!canAddMore) {
                vm.noAccessCreatingMessage = NstSvcTranslation.get('You have reached the creation limit.');
              }
              if (!results[0].privacy.locked && !NstUtility.place.isGrand(results[0].id)) {
                vm.noAccessCreatingMessage = NstSvcTranslation.get('You just can create sub Places only in closed Places');
              }

              vm.canCreateClosedPlace = hasAddPlaceAccess
                && results[0].privacy.locked
                && canAddMore;
              vm.canCreateOpenPlace = hasAddPlaceAccess
                && results[0].privacy.locked
                && canAddMore
                && NstUtility.place.isGrand(results[0].id)
                && results[0].id !== results[1].id;
              vm.canCreateGrandPlace = results[1].limits.grand_places > 0;
              // vm.canCreateGrandPlace = currentUser.limits.grand_places > 0;

              vm.user = results[1];
              // vm.notificationsCount = results[1].unreadNotificationsCount;
            }
          });
        } else {
            NstSvcUserFactory.getCurrent(true).then(function (user) {
              vm.canCreateGrandPlace = user.limits.grand_places > 0;
              vm.user = user;
          });
        }
      }

      function loadMyPlacesUnreadPostsCount() {
        if (myPlaceIds.length === 0) {
          return;
        }
        var list = _.cloneDeep(myPlaceIds);
        var parts = [];
        var partLen = 90;
        for (var i = 0; i < Math.ceil(list.length / partLen); i++) {
          parts[i] = list.slice(i * partLen, (i + 1) * partLen);
        }

        var promises = [];
        for (var i = 0; i < parts.length; i++) {
          promises.push(NstSvcPlaceFactory.getPlacesUnreadPostsCount(parts[i], false));
        }

        $q.all(promises).then(function(arrResult) {
          var places = [];
          for (var i = 0; i < arrResult.length; i++) {
            places = places.concat(arrResult[i]);
          }
          var total = 0;
          vm.myPlacesUnreadPosts = {};

          _.forEach(places, function(item) {
            vm.myPlacesUnreadPosts[item.place_id] = item.count;
            total += item.count;
          });

          updateUnseenParents();

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
       * open places manager with full controll on them
       * @returns
       */
      vm.openPlaces = function () {
          $uibModal.open({
            animation: false,
            size: '960',
            templateUrl: 'app/pages/places/places.html',
            controller: 'PlacesModalController',
            controllerAs: 'ctrl'
          }).result.then(function () {
          }).catch(function () {
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
        $state.go('app.place-create', {}, {notify: false});
      }


      /*****************************
       *****    Change urls   ****
       *****************************/

      eventReferences.push($rootScope.$on('$stateChangeSuccess', function () {
        vm.selectedPlaceId = $stateParams.placeId;
        loadCurrentUser();
      }));


      /*****************************
       *****    Place's Order   ****
       *****************************/

      /**
       * @function
       * Gets the grand places order from server
       * @returns {object}
       */
      function getMyPlacesOrder() {
        return NstSvcKeyFactory.get(NST_KEY.GENERAL_NEW_SETTING_PLACE_ORDER).then(function (result) {
          if (result) {
            return JSON.parse(result);
          }

          return {};
        });
      }


      function scrollTop() {
        if (_.isFunction($scope.scrollToTop)) {
          $scope.scrollToTop();
        }
      }

      // /**
      //  * @function
      //  * Sets the grand places order in server
      //  * @returns {Promise}
      //  */
      // function setMyPlacesOrder(order) {
      //   return NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_PLACE_ORDER, JSON.stringify(order));
      // }


      vm.range = function(num) {
        var seq = [];
        for (var i = 0; i < num; i++) {
          seq.push(i);
        }

        return seq;
      };

      /*****************************
       *****  Event Listeners   ****
       *****************************/

      function dispatchTopbarEvent() {
        $rootScope.$emit('topbar-notification-changed');
      }

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.ROOT_ADDED, function (e, data) {
        rebuildMyPlacesTree(data.place.id);
        dispatchTopbarEvent();
        scrollTop();
      }));

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.SUB_ADDED, function (e, data) {
        rebuildMyPlacesTree(data.place.id);
        dispatchTopbarEvent();
        scrollTop();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.UPDATED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.UPDATED, function () {
        rebuildMyPlacesTree();
        dispatchTopbarEvent();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.PICTURE_CHANGED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.PICTURE_CHANGED, function () {
        rebuildMyPlacesTree();
        dispatchTopbarEvent();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT.REMOVED`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT.REMOVED, function () {
        rebuildMyPlacesTree();
        dispatchTopbarEvent();
        scrollTop();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT_ACTION.POST_ADD`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT_ACTION.POST_ADD, function () {
        loadMyPlacesUnreadPostsCount();
        dispatchTopbarEvent();
      }));

      /**
       * Event listener for `NST_PLACE_EVENT_ACTION.POST_REMOVE`
       */
      eventReferences.push($rootScope.$on(NST_PLACE_EVENT_ACTION.POST_REMOVE, function () {
        loadMyPlacesUnreadPostsCount();
        dispatchTopbarEvent();
      }));

      eventReferences.push($rootScope.$on(NST_POST_EVENT.REMOVE, function () {
        loadMyPlacesUnreadPostsCount();
        dispatchTopbarEvent();
      }));

      eventReferences.push($rootScope.$on(NST_POST_EVENT.MOVE, function () {
        loadMyPlacesUnreadPostsCount();
        dispatchTopbarEvent();
      }));

      /**
       * Event listener for `NST_POST_EVENT.READ`
       */
      eventReferences.push($rootScope.$on(NST_POST_EVENT.READ, function () {
        loadMyPlacesUnreadPostsCount();
        dispatchTopbarEvent();
      }));

      /**
       * Event listener for `post-read-all`
       */
      eventReferences.push($rootScope.$on('post-read-all', function () {
        loadMyPlacesUnreadPostsCount();
      }));

      eventReferences.push($rootScope.$on('places-sorting-updated', function () {
        rebuildMyPlacesTree();
      }));

      /**
       * Event listener for `NST_SRV_EVENT.RECONNECT`
       */
      NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
        NstSvcLogger.debug('Retrieving mentions count right after reconnecting.');
        NstSvcLogger.debug('Retrieving the grand place unreads count right after reconnecting.');

      });

      /**
       * Event listener for `reload-counters`
       */
      eventReferences.push($rootScope.$on('reload-counters', function () {
        NstSvcLogger.debug('Retrieving mentions count right after focus.');
        NstSvcLogger.debug('Retrieving the grand place unreads count right after focus.');
        loadMyPlacesUnreadPostsCount();
      }));

      /**
       * Event listener for `draft-change`
       */
      eventReferences.push($rootScope.$on('draft-change', function () {
        vm.hasDraft = NstSvcPostDraft.has();
      }));

      eventReferences.push($scope.$on('$destroy', function () {
        _.forEach(eventReferences, function (canceler) {
          if (_.isFunction(canceler)) {
            canceler();
          }
        });
      }));

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
       * @param {any} orders
       * @returns
       */
      function getChildren(place, places, expandedPlaces, selectedId, depth, orders) {
        var chain = _.chain(places).sortBy(['id']).reduce(function (stack, item) {
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

          var isActive = (item.id === selectedId);
          var isExpanded = isItemExpanded(item, expandedPlaces, selectedId);
          var children = getChildren(item, places, expandedPlaces, selectedId, depth + 1, getOrder(orders, item.id));

          stack.push(createTreeItem(item, children, isExpanded, isActive, depth));

          return stack;
        }, []);

        if (orders !== null) {
          return chain.sortBy(function (place) {
            return orders[place.id]? orders[place.id].o: 1;
          }).value();
        } else {
          return chain.sortBy(['name']).value();
        }
      }

      function getOrder(order, id) {
        if (order && order[id] && order[id].s) {
          return order[id].s;
        } else {
          return null;
        }
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
          var isActive = (place.id === selectedId);
          var isExpanded = isItemExpanded(place, expandedPlaces, selectedId);
          // finds the place children
          var children = getChildren(place, places, expandedPlaces, selectedId, 1, getOrder(orders, place.id));

          return createTreeItem(place, children, isExpanded, isActive, 0, getOrder(orders, place.id));
        }).sortBy(function(place) {
          return orders[place.id]? orders[place.id].o: 1;
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
          depth: depth
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
      function anyChildrenHasUnseen(place, children) {
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

      /**
       * Updates expanded places
       *
       * @param {any} placeId
       * @param {any} expanded
       */
      function updateExpanded(placeId, expanded) {
        var index = vm.expandedPlaces.indexOf(placeId);
        if (expanded && index === -1) {
          vm.expandedPlaces.push(placeId);
        } else if (!expanded && index !== -1) {
          vm.expandedPlaces.splice(index, 1);
        }
        storeExpandedPlaces(vm.expandedPlaces);
      }

      function storeExpandedPlaces(expandedPlaces) {
        storedExpandedPlacesService.set(storedExpandedPlacesKey, expandedPlaces, {
          expiration: new Date().setFullYear(new Date().getFullYear() + 1)
        });
      }

      function removeLastChildFromPlace(id) {
        var parts = id.split('.');
        parts.pop();
        return parts.join('.');
      }

      function appendChildToParent(items, index, list) {
        if (index < 2) {
          return;
        }
        _.forEach(items[index], function (item) {
          if (items[index - 1] === undefined) {
            items[index - 1] = [];
          }
          var parent = removeLastChildFromPlace(item);
          list.push(parent);
          items[index - 1].push(parent);
        });
      }

      function updateUnseenParents() {
        var list = [];
        _.forEach(vm.myPlacesUnreadPosts, function (item, key) {
          if (item > 0) {
            var parts = key.split('.');
            if (list[parts.length] === undefined) {
              list[parts.length] = [];
            }
            list[parts.length].push(key);
          }
        });
        // list.reverse();
        var hasUnseenChildrenList = [];
        _.forEachRight(list, function (item, key) {
          appendChildToParent(list, key, hasUnseenChildrenList);
        });
        hasUnseenChildrenList = _.union(hasUnseenChildrenList);
        vm.myPlacesHasUnseenChildren = hasUnseenChildrenList;
      }

      function isChildrenUnseen(id) {
        return vm.myPlacesHasUnseenChildren.indexOf(id) > -1;
      }

    }
  })();
