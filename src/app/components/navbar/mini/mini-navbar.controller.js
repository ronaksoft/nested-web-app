(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .controller('MiniNavbarController', MiniNavbarController);

  /** @ngInject */
  function MiniNavbarController($q, $state, $stateParams, $rootScope, $scope,
                                NST_AUTH_EVENT, NST_DEFAULT,
                                NstSvcAuth, NstSvcPlaceFactory,
                                NstVmUser, NstVmPlace, _) {
    var vm = this;
    var eventReferences = [];
    vm.mentionOpen = false;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.stateParams = $stateParams;
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
    vm.compose = function ($event) {
      $event.preventDefault();
      $state.go('app.compose', {}, {notify: false});
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
        return $scope.place.picture.thumbnails.x128.url.view;
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

    $q.all([getUser(), getMyPlaces()]).then(function (resolvedSet) {
      vm.user = mapUser(resolvedSet[0]);
      vm.places = mapPlaces(resolvedSet[1]);
      fixUrls();
    });

    /*****************************
     *****    State Methods   ****
     *****************************/

    function getUnfilteredState() {
      var state = 'app.messages-favorites';
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

    function getMyPlaces() {
      return NstSvcPlaceFactory.getMyTinyPlaces();
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



    /*****************************
     *****    Change urls   ****
     *****************************/

    $scope.$on('$stateChangeSuccess', function (event, toState) {
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

      if (vm.places)
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

     $scope.$on('$destroy', function () {
       _.forEach(eventReferences, function (canceler) {
         if (_.isFunction(canceler)) {
           canceler();
         }
       });
     });

  }
})();
