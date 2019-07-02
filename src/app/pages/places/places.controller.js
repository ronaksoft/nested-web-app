(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('PlacesModalController', PlacesModalController);

  /** @ngInject */
  function PlacesModalController($q, $scope, $state, $stateParams, $uibModal, $rootScope, $timeout, _, toastr,
                                 NST_KEY, NST_PLACE_ACCESS, NST_SRV_ERROR, NST_PLACE_EVENT,
                                 NstSvcAuth, NstSvcTranslation, NST_PLACE_MEMBER_TYPE, NstSvcPlaceFactory, NstUtility,
                                 NstSvcUserFactory, NstSvcSidebar, NstSvcKeyFactory) {
    var vm = this;
    var eventReferences = [];
    var myPlaceOrders = {};
    var ABSENT_PLACE_PICTURE_URL = '/assets/icons/absents_place.svg';
    var myPlaceIds = [];
    vm.isLoading = true;
    vm.goToPlace = goToPlace;
    vm.showLoading = showLoading;
    vm.toggleSelectPlace = toggleSelectPlace;
    vm.unselectAll = unselectAll;
    vm.selectedPlaces = [];
    vm.keyword = '';
    vm.openSettingsModal = openSettingsModal;
    vm.openAddMemberModal = openAddMemberModal;
    vm.toggleNotification = toggleNotification;
    vm.toggleShowInFeed = toggleShowInFeed;
    vm.confirmToRemoveMulti = confirmToRemoveMulti;
    vm.confirmToLeave = confirmToLeave;
    vm.leaveMulti = leaveMulti;
    vm.isGrandPlace = isGrandPlace;
    vm.isPersonal = isPersonal;
    vm.isSubPersonal = isSubPersonal;
    vm.addMemberMulti = addMemberMulti;
    vm.placesLength = 0;
    vm.managerInPlaces = 0;
    vm.searchResult = 0;
    vm.placesSetting = {
      relationView: true,
      filter: null
    };

    vm.grandSelectable = true;
    vm.subSelectable = true;

    eventReferences.push($scope.$watch(function () {
      return vm.placesSetting;
    }, function () {
      showLoading();
    }, true));

    vm.sortUpdateHandler = sortUpdateHandler;

    var sortingUpdated = false;

    function print(data, depth) {
      _.forEach(data, function (item, key) {
        var strDepth = '';
        for (var i = 0; i < depth; i++) {
          strDepth += '___ ';
        }
        if (item.s) {
          print(item.s, depth + 1);
        }
      });
    }

    function sortUpdateHandler() {
      setMyPlacesOrder(JSON.stringify(createSortedList(vm.places))).then(function () {
        sortingUpdated = true;
        toastr.success(NstSvcTranslation.get('Places sorting updated'));
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Something went wrong!'));
      });
    }

    function mapWithKey(items) {
      var list = {};
      for (var i in items) {
        for (var key in items[i]) {
          list[key] = items[i][key];
        }
      }
      return list;
    }

    function createSortedList(places) {
      var order = 0;
      return mapWithKey(_.map(places, function (item) {
        order++;
        return getSortedInfo(item, order);
      }));
    }

    function getSortedInfo(subPlace, order) {
      var subOrder = 0;
      var output = {};
      output[subPlace.id] = {};
      output[subPlace.id].o = order;
      if (subPlace.children && subPlace.children.length > 0) {
        output[subPlace.id].s = mapWithKey(_.map(subPlace.children, function (item) {
          subOrder++;
          return getSortedInfo(item, subOrder);
        }));
      }
      return output
    }

    showLoading();

    vm.sortableOptions = {
      // connectWith: ".place-ul",
      containment: "parent",
      // 'ui-floating': true,
      axis: 'y',
      handle: '> a > .dragger'
      // It is suggested to use the most specific cssselector you can,
      // after analyzing the DOM elements generated by the transclusion directive
      // eg: items: '> .transclusionLvl1 > .transclusionLvl2 > .sortable-item'
    };

    function showLoading() {
      vm.isLoading = true;
      $timeout(function () {
        vm.isLoading = false;
      }, 512)
    }

    function removeFromTemp(array, placeId) {
      var itemIndex = null;
      var isBanned = vm[array].find(function (i, index) {
        if (i.id === placeId) {
          itemIndex = index;
          return true;
        } else {
          return false;
        }
      });
      if (isBanned) {
        vm[array].splice(itemIndex, 1)
      }
    }

    function selectPlace(place) {
      vm.selectedPlaces.push(place);
      if (!place.permitions.allowedToAddMember) {
        vm.forbiddenAddPlaces.push({
          id: place.id,
          name: place.name
        })
      }
      if (vm.isPersonal(place.id) || vm.isSubPersonal(place.id)) {
        vm.forbiddenLeavePlaces.push({
          id: place.id,
          name: place.name
        })
      }
      if (!place.permitions.allowedToRemovePlace) {
        vm.forbiddenDeletePlaces.push({
          id: place.id,
          name: place.name
        });
      }
    }

    function toggleSelectPlace(place) {
      if((place.isGrandPlace && !vm.grandSelectable) || (!place.isGrandPlace && !vm.subSelectable)){
        return;
      }
      place.isSelected = !place.isSelected;
      var placeIndex = vm.selectedPlaces.indexOf(place);
      if (placeIndex > -1) {
        if(vm.selectedPlaces.length === 1) {
          vm.grandSelectable = true;
          vm.subSelectable = true;
        }
        vm.selectedPlaces.splice(placeIndex, 1);
        removeFromTemp('forbiddenAddPlaces', place.id);
        removeFromTemp('forbiddenLeavePlaces', place.id);
        removeFromTemp('forbiddenDeletePlaces', place.id);
      } else {
        if(vm.selectedPlaces.length === 0) {
          if(isGrandPlace(place.id)) {
            vm.grandSelectable = true;
            vm.subSelectable = false;
          } else {
            vm.grandSelectable = false;
            vm.subSelectable = true;
          }
        }
        selectPlace(place);
      }
    }

    function unselectAll() {
      vm.selectedPlaces.forEach(function (place) {
        place.isSelected = false;
      });
      vm.selectedPlaces = [];
      vm.forbiddenAddPlaces = [];
      vm.forbiddenDeletePlaces = [];
      vm.forbiddenLeavePlaces = [];
      vm.grandSelectable = true;
      vm.subSelectable = true;
    }

    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.user = NstSvcAuth.user;
    vm.stateParams = $stateParams;
    var absolutePlaces = [];
    vm.places = [];
    vm.forbiddenAddPlaces = [];
    vm.forbiddenDeletePlaces = [];
    vm.forbiddenLeavePlaces = [];
    vm.onPlaceClick = onPlaceClick;
    vm.openCreatePlaceModal = openCreatePlaceModal;
    vm.openCreateSubplaceModal = openCreateSubplaceModal;
    vm.expandedPlaces = [];
    vm.myPlacesUnreadPosts = {};
    vm.myPlacesHasUnseenChildren = [];
    vm.noAccessCreatingMessage = '';
    vm.selectedPlaceName = '';
    vm.visiblePlaces = [];
    vm.search = search;
    var searchDebounce = _.throttle(search, 16);
    vm.searchKeydown = searchKeydown;
    vm.escapeDot = escapeDot;

    function escapeDot(text) {
      return text.split('.').join('_');
    }

    function searchKeydown() {
      searchDebounce(vm.keyword);
    }

    function search(keyword, filter) {
      vm.searchResult = 0;
      if(vm.placesSetting.relationView) {
        vm.showLoading();
      }
      var hasKeyword = !(keyword === undefined);
      var hasFilter = !(filter === undefined);
      keyword = _.trim(keyword);
      keyword = keyword.toLowerCase();
      unselectAll();
      _.forEach(absolutePlaces, function (item) {
        var visible;
        vm.placesSetting.filter = null;
        if (hasFilter) {
          visible = false;
          vm.placesSetting.filter = filter;
          if (
            (filter === 'grand' && item.isGrandPlace) ||
            (filter === 'private' && !item.isGrandPlace && item.isPrivatePlace) ||
            (filter === 'common' && !item.isGrandPlace && !item.isPrivatePlace) ||
            (filter === 'email' && item.isEmailReceptive) ||
            (filter === 'manager' && item.isManager)
          ) {
            visible = true;
          }
        } else if (keyword.length === 0) {
          visible = true;
        } else {
          visible = true;
          vm.searchResult++;
          if (hasKeyword && !(item.name.includes(keyword) || item.sId.includes(keyword))) {
            vm.searchResult--;
            visible = false;
          }
        }
        vm.visiblePlaces[item.id] = visible;
      });
      vm.placesSetting.relationView = false;
    }

    initialize();

    /*****************************
     ***** Controller Methods ****
     *****************************/

    function initialize() {
      vm.expandedPlaces = [];
      loadPlaces();

      loadCurrentUser();

    }

    /**
     * Represents the create place modal
     * @param {event} $event
     * @param {sting} style - common place or private place
     */
    function openCreateSubplaceModal($event, style, id) {
      if (style === 'open') {
        $state.go('app.place-create', {
          placeId:id,
          isOpenPlace: true
        }, {
          notify: false
        });
      } else {
        $state.go('app.place-create', {
          placeId: id,
          isClosePlace: true
        }, {
          notify: false
        });
      }
      $event.preventDefault();
    }

    // /**
    //  * return the current place id
    //  * @returns string
    //  */
    // function getPlaceId() {
    //   return vm.selectedPlaceId;
    // }


    /**
     * Represents add member to place modal
     * @param {any} $event
     */
    function openAddMemberModal(placeId) {
      NstSvcPlaceFactory.get(placeId).then(function (place) {
        vm.placeModal = place;
        var role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/pages/places/settings/place-add-member.html',
          controller: 'PlaceAddMemberController',
          controllerAs: 'addMemberCtrl',
          size: 'sm',
          resolve: {
            chosenRole: function () {
              return role;
            },
            currentPlace: function () {
              return vm.placeModal;
            },
            newPlace: false,
            mode: function () {
              return false
            },
            isForGrandPlace: function () {
              return vm.isGrandPlace(placeId);
            }
          }
        });

        modal.result.then();
      });

    }

    function loadCurrentUser() {
      vm.selectedPlaceId = null;
      NstSvcUserFactory.getCurrent(true).then(function (user) {
        vm.canCreateGrandPlace = user.limits.grand_places > 0;
        vm.user = user;
      });
    }

    function getMyPlaces(force) {
      return NstSvcPlaceFactory.getMyPlaces(force);
    }


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
      $state.go('app.place-create', {}, {
        notify: false
      });
    }

    /**
     * Represents the create place modal modal also shows a
     * warning modal if the user reached the create place limit
     */
    function goToPlace(placeId) {
      $scope.$dismiss();
      $state.go('app.place-messages', {placeId: placeId});
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
      return NstSvcKeyFactory.get(NST_KEY.GENERAL_NEW_SETTING_PLACE_ORDER, true).then(function (result) {
        if (result) {
          return JSON.parse(result);
        }
        return {};
      });
    }

    function setMyPlacesOrder(data) {
      return NstSvcKeyFactory.set(NST_KEY.GENERAL_NEW_SETTING_PLACE_ORDER, data);
    }

    vm.range = function (num) {
      var seq = [];
      for (var i = 0; i < num; i++) {
        seq.push(i);
      }

      return seq;
    };

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
     * Checks the current place is personal place or not
     * @returns {boolean}
     */
    function isPersonal(id) {
      return NstSvcAuth.user.id == id
    }

    /**
     * Checks the current place is subplace of personal place or not
     * @returns {boolean}
     */
    function isSubPersonal(id) {
      return NstSvcAuth.user.id == id.split('.')[0];
    }

    /**
     * @function
     * add members to multi places
     */
    function addMemberMulti() {
      if (vm.forbiddenAddPlaces.length > 0) {
        return;
      }
      var selectedIds = vm.selectedPlaces.map(function (place) {
        return place.id
      });
      var role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-add-member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'addMemberCtrl',
        size: 'sm',
        resolve: {
          chosenRole: function () {
            return role;
          },
          currentPlace: function () {
            return selectedIds;
          },
          newPlace: false,
          mode: function () {
            return false
          },
          isForGrandPlace: function () {
            return undefined
          }
        }
      });

      modal.result.then();
      // angular.forEach(vm.selectedPlaces, function (id) {})

    }


    /**
     * Represents the prompt modal for leaving place action
     */
    function confirmToLeave(id) {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-leave-confirm.html',
        size: 'sm',
        controller: 'PlaceLeaveConfirmController',
        controllerAs: 'leaveCtrl',
        resolve: {
          selectedPlace: function () {
            return id;
          }
        }
      }).result.then(function () {
        leavePlace(id);
      });
    }

    /**
     * @function
     * leave the place with showing results
     */
    function leaveMulti() {
      if (vm.forbiddenLeavePlaces.length > 0) {
        return;
      }
      angular.forEach(vm.selectedPlaces, function (place) {
        leavePlace(place.id);
      })

    }

    function leavePlace(id) {
      NstSvcPlaceFactory.leave(id).then(function () {
        toastr.success(NstUtility.string.format(NstSvcTranslation.get("Left from {0} successfully."), id));
        loadPlacesDebounce();
      }).catch(function (error) {
        if (error.code === NST_SRV_ERROR.ACCESS_DENIED) {
          switch (error.message[0]) {
            case 'you_are_not_member':
              toastr.error(NstSvcTranslation.get('You are not member of this Place!'));
              loadPlacesDebounce();
              break;
            case 'last_creator':
              toastr.error(NstSvcTranslation.get('You are the only one left!'));
              break;
            case 'parent_creator':
              toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to leave the Place because you are the creator of its highest-ranking Place ({0}).'), vm.place.parent.name));
              break;
            case 'cannot_leave_some_subplaces':
              toastr.error(NstSvcTranslation.get('You can not leave here, because you are the manager of one of its sub-places.'));
              break;
            default:
              toastr.error(NstSvcTranslation.get("An error has happened before leaving this place"));
              break;
          }

          return;
        }
        if (error.code === NST_SRV_ERROR.INVALID) {
          switch (error.message[0]) {
            case 'you_are_not_member':
              toastr.error(NstUtility.string.format(NstSvcTranslation.get("You are not member of {0}. sometimes it happens because of leaving open Places which is not allowed."), error.query.data.place_id));
              loadPlacesDebounce();
              break;
            default:
              toastr.error(NstSvcTranslation.get("An error has happened before leaving this place"));
              break;
          }

          return;
        }

        toastr.error(NstSvcTranslation.get("An error has happened before leaving this place"));
      });
    }

    function loadPlaces() {
      $q.all([getMyPlacesOrder(), getMyPlaces(true)]).then(function (results) {
        myPlaceOrders = results[0];
        // print(myPlaceOrders, 0);
        vm.placesLength = results[1].length;
        vm.places = createTree(results[1], myPlaceOrders, vm.expandedPlaces, vm.selectedPlaceId);
        _.forEach(results[1], function (item) {
          vm.visiblePlaces[item.id] = true;
          absolutePlaces.push({
            id: item.id,
            name: item.name.toLowerCase(),
            sId: item.id.toLowerCase(),
            isGrandPlace: isGrandPlace(item.id),
            isPrivatePlace: item.privacy.locked,
            isEmailReceptive: item.privacy.receptive === "external",
            isManager: item.accesses.indexOf('C') > -1
          });
        });
      });
    }

    var loadPlacesDebounce = _.debounce(loadPlaces, 128);

    /**
     * Represents the prompt modal for deleting place
     */
    function confirmToRemoveMulti() {
      if (vm.forbiddenDeletePlaces.length > 0) {
        return;
      }
      $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-delete.html',
        controller: 'PlaceRemoveConfirmController',
        controllerAs: 'removeCtrl',
        size: 'sm',
        resolve: {
          selectedPlace: function () {
            return null;
          },
          selectedPlaces: function () {
            return vm.selectedPlaces;
          }
        }
      }).result.then(function () {
        //handle children parent remove order
        var places = vm.selectedPlaces.slice(0);
        places.sort(function (a, b) {
          return (a.id.split('.').length > b.id.split('.').length ? -1 : 1);
        });
        removeMulti(places, 0);
        vm.unselectAll();

      });

    }

    function removeMulti(places, index){
      var place = places[index];
      remove(place.id).then(function(){
        if(index < places.length - 1) {
          removeMulti(places, index + 1)
        }
      });
    }

    /**
     * deletes the place also shows the results of the api
     */
    function remove(id) {
      var deferred = $q.defer();

      NstSvcPlaceFactory.remove(id).then(function () {
        toastr.success(NstUtility.string.format(NstSvcTranslation.get("Place {0} was removed successfully."), id));
        loadPlacesDebounce();
        deferred.resolve()
      }).catch(function (error) {
        if (error.code === NST_SRV_ERROR.ACCESS_DENIED && error.message[0] === "remove_children_first") {
          toastr.error(NstSvcTranslation.get("You have to delete all the sub-Places within, before removing this Place."));
        } else {
          toastr.error(NstSvcTranslation.get("An error has occurred in removing this Place."));
        }
        deferred.reject()
      });
      return deferred.promise;
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


    function openSettingsModal($event, id) {
      $event.preventDefault();
      $state.go('app.place-settings', {
        placeId: id
      }, {
        notify: false
      });
    }

    /**
     * Checks the current place is personal place or not
     * @returns {boolean}
     */
    function isGrandPlace(id) {
      return id.split('.').length === 1;
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

        stack.push(createTreeItem(item, false, children, isExpanded, isActive, depth));

        return stack;
      }, []);

      if (orders !== null) {
        return chain.sortBy(function (place) {
          return orders[place.id] ? orders[place.id].o : 1;
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
     * Toggles the notification property of place
     * @returns {boolean}
     */
    function toggleNotification(place) {
      place.notificationStatus = !place.notificationStatus;
      NstSvcPlaceFactory.setNotificationOption(place.id, place.notificationStatus).catch(function () {
        place.notificationStatus = !place.notificationStatus;
      });
    }

    /**
     * Toggles the notification property of place
     * @returns {boolean}
     */
    function toggleShowInFeed(place) {
      if (place.id === vm.user.id) {
        return;
      }
      place.favorite = !place.favorite;
      NstSvcPlaceFactory.setBookmarkOption(place.id, place.favorite).catch(function () {
        place.favorite = !place.favorite;
      });
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
      // console.log(places);
      return _.chain(places).filter(function (place) {
        myPlaceIds.push(place.id);
        return place.id && place.id.indexOf('.') === -1;
      }).map(function (place) {
        var isActive = (place.id === selectedId);
        var isExpanded = isItemExpanded(place, expandedPlaces, selectedId);
        var children = getChildren(place, places, expandedPlaces, selectedId, 1, getOrder(orders, place.id));
        return createTreeItem(place, true, children, isExpanded, isActive, 0);
      }).sortBy(function (place) {
        return orders[place.id] ? orders[place.id].o : 1;
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
    function createTreeItem(place, isGrandPlace, children, isExpanded, isActive, depth) {
      var picture = place.hasPicture() ? place.picture.getUrl('x32') : ABSENT_PLACE_PICTURE_URL;
      var isManager = place.accesses.indexOf('C') > -1;
      if (isManager) {
        vm.managerInPlaces++;
      }
      var placeModel = {
        id: place.id,
        name: place.name,
        picture: picture,
        privacy: place.privacy,
        accesses: place.accesses,
        isGrandPlace: isGrandPlace,
        isManager: isManager,
        isSelected: false,
        notificationStatus: place.notification,
        favorite: place.favorite, //TODO
        policy: place.policy,
        children: children,
        hasChildren: children && children.length > 0,
        hasUnseen: hasUnseen(place, vm.myPlacesUnreadPosts),
        childrenHasUnseen: anyChildrenHasUnseen(place, children, vm.myPlacesUnreadPosts),
        isExpanded: isExpanded,
        isActive: isActive,
        depth: depth,
        permitions: {
          allowedToAddMember: place.accesses.indexOf(NST_PLACE_ACCESS.ADD_MEMBERS) > -1,
          allowedToCreatePlace: place.accesses.indexOf(NST_PLACE_ACCESS.ADD_PLACE) > -1,
          allowedToRemovePlace: place.accesses.indexOf(NST_PLACE_ACCESS.REMOVE_PLACE) > -1
        }
      };
      return placeModel;
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

      return _.some(children, function (child) {
        return child.hasUnseen;
      });
    }

    eventReferences.push($rootScope.$on(NST_PLACE_EVENT.ROOT_ADDED, function () {
      loadPlacesDebounce();
    }));

    eventReferences.push($rootScope.$on(NST_PLACE_EVENT.SUB_ADDED, function () {
      loadPlacesDebounce();
    }));

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

    $scope.$on('$destroy', function () {
      if (sortingUpdated) {
        $rootScope.$broadcast('places-sorting-updated');
      }
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
