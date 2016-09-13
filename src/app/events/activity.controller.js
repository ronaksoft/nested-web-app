(function () {
  'use strict';

  angular
    .module('nested')
    .controller('ActivityController', ActivityController);

  /** @ngInject */
  function ActivityController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal, $state, $timeout,
                              toastr, _, moment,
                              NST_SRV_EVENT, NST_EVENT_ACTION, NST_SRV_ERROR, NST_STORAGE_TYPE, NST_ACTIVITY_FILTER, NST_DEFAULT, NST_ACTIVITY_FACTORY_EVENT,
                              NstSvcActivityMap,
                              NstSvcActivitySettingStorage,
                              NstSvcAuth, NstSvcLoader, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcInvitationFactory,
                              NstActivity, NstPlace, NstInvitation) {

    var vm = this;

    // TODO it needs to connect with cache
    // where we bind activities view-model for view
    vm.acts = {};
    // where we keep NstActivities and will be mapped to view-model
    vm.cache = [];
    vm.currentPlace = null;
    vm.noActivity = false;

    vm.loadMore = loadMore;
    vm.acceptInvitation = acceptInvitation;
    vm.declineInvitation = declineInvitation;
    vm.applyFilter = applyFilter;
    vm.toggleViewMode = toggleViewMode;
    vm.viewPost = viewPost;

    vm.expanded = true;

    vm.activitySettings = {
      limit: 24,
      filter: NST_ACTIVITY_FILTER.ALL,
      placeId: null,
      date: null,
    };

    vm.filterDictionary = {};

    vm.urls = {
      filters: {
        all: '',
        messages: '',
        comments: '',
        logs: ''
      }
    };


    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.loading = true;


    /******************
     ** Initializing **
     ******************/

    (function () {
      vm.filterDictionary[NST_ACTIVITY_FILTER.ALL] = 'All';
      vm.filterDictionary[NST_ACTIVITY_FILTER.MESSAGES] = 'Messages';
      vm.filterDictionary[NST_ACTIVITY_FILTER.COMMENTS] = 'Comments';
      vm.filterDictionary[NST_ACTIVITY_FILTER.LOGS] = 'Logs';

      if (placeIdParamIsValid($stateParams.placeId)) {
        vm.activitySettings.placeId = $stateParams.placeId;
      } else {
        vm.activitySettings.placeId = null;
      }

      // first check url to match a filter
      if (!$stateParams.filter || $stateParams.filter === NST_DEFAULT.STATE_PARAM) {
        vm.activitySettings.filter = NstSvcActivitySettingStorage.get('filter') || NST_ACTIVITY_FILTER.ALL;
      } else {
        if (filterIsValid($stateParams.filter)) {
          vm.activitySettings.filter = $stateParams.filter;
          NstSvcActivitySettingStorage.set('filter', vm.activitySettings.filter);
        } else {
          vm.activitySettings.filter = NST_ACTIVITY_FILTER.ALL;
        }
      }

      vm.expanded = !NstSvcActivitySettingStorage.get('collapsed');

      generateUrls();

      if (vm.activitySettings.placeId) {
        setPlace(vm.activitySettings.placeId).then(function (place) {
          if (place) {
            return loadActivities();
          }
        }).catch(function (error) {
          $log.debug(error);
        });
      } else {
        vm.currentPlaceLoaded = true;
        loadActivities().catch(function (error) {
          $log.debug(error);
        });
      }

    })();


    /********************
     ** Main Functions **
     ********************/

    function loadMore() {
      loadActivities();
    }

    function acceptInvitation(invitation) {
      NstSvcInvitationFactory.accept(invitation).then(function (result) {

      }).catch(function (result) {

      });
    }

    function declineInvitation(invitation) {
      NstSvcInvitationFactory.decline(invitation).then(function (result) {

      }).catch(function (result) {

      });
    }

    function applyFilter(filter) {
      if (vm.activitySettings.placeId) {
        $state.go('place-activity-filtered', {
          placeId: vm.activitySettings.placeId,
          filter: filter
        }, { notify : false });
      } else {
        $state.go('activity-filtered', {
          filter: filter
        }, { notify : false });
      }
    }

    function toggleViewMode() {
      vm.expanded = !vm.expanded;
      NstSvcActivitySettingStorage.set('collapsed', !vm.expanded);
    }

    function viewPost(postId) {
      NstSvcPostFactory.getWithComments(postId).then(function (post) {
        // TODO: open a modal and show the post
      }).catch(function (error) {

      });
    }

    /**********************
     ** Helper Functions **
     **********************/

    function setPlace(id) {
      var defer = $q.defer();
      if (!id) {
        defer.resolve(null);
      } else {
        NstSvcPlaceFactory.get(id).then(function (place) {
          if (place && place.id) {
            vm.currentPlace = place;
            vm.currentPlaceLoaded = true;
          } else {
            vm.currentPlace = null;
          }
          defer.resolve(vm.currentPlace);
        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function mapActivities(activities) {
      return NstSvcActivityMap.toActivityItems(activities);
    }

    function loadActivities() {
      vm.loading = true;
      vm.tryAgainToLoadMore = false;
      return $q(function (resolve, reject) {

        NstSvcActivityFactory.get(vm.activitySettings).then(function (activities) {
          if (activities.length === 0 && !vm.acts.hasAnyItem) {
            vm.reachedTheEnd = false;
            vm.noActivity = true;
          }else if (activities.length === 0 && vm.acts.length > 0) {
            vm.reachedTheEnd = true;
          } else {
            vm.reachedTheEnd = false;
            setLastActivityDate(activities);
            mergeWithOtherActivities(activities);
          }
          vm.loading = false;
          vm.tryAgainToLoadMore = false;

          resolve(vm.acts);
        }).catch(function(error) {
          vm.loading = false;
          vm.tryAgainToLoadMore = true;
          reject(error);
        });

      });
    }

    function mergeWithOtherActivities(activities) {
      var activityItems = mapActivities(activities);
      _.mergeWith(vm.acts, activityItems, function (objValue, srcValue, key, object, source, stack) {
        if (_.isArray(objValue) && key === 'items') {
          return objValue.concat(srcValue);
        }
      });
    }

    function setLastActivityDate(activities) {
      var last = _.last(activities);
      if (!last) {
        vm.activitySettings.date = moment().format('x');
      } else if (moment.isMoment(last.date)) {
        vm.activitySettings.date = last.date.format('x');
      } else {
        vm.activitySettings.date = last.date.getTime();
      }
    }

    function loadInvitations() {
      return $q(function (resolve, reject) {
        NstSvcInvitationFactory.get().then(function (invitations) {

          vm.invitations = invitations;
          resolve(vm.invitations);

        }).catch(reject);
      });
    }

    function filterIsValid(value) {
      return _.includes(_.values(NST_ACTIVITY_FILTER), value);
    }

    function placeIdParamIsValid(value) {
      return !!$stateParams.placeId && $stateParams.placeId !== NST_DEFAULT.STATE_PARAM;
    }

    function generateUrls() {
      if (vm.activitySettings.placeId) {
        vm.urls.filters = {
          all: $state.href('place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: 'all'}),
          messages: $state.href('place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: 'messages'}),
          comments: $state.href('place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: 'comments'}),
          logs: $state.href('place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: 'log'})
        };
      } else {
        vm.urls.filters = {
          all: $state.href('activity-filtered', {filter: 'all'}),
          messages: $state.href('activity-filtered', {filter: 'messages'}),
          comments: $state.href('activity-filtered', {filter: 'comments'}),
          logs: $state.href('activity-filtered', {filter: 'log'})
        };
      }
    }

    NstSvcActivityFactory.addEventListener(NST_ACTIVITY_FACTORY_EVENT.ADD, function (e) {
      if (activityBelongsToPlace(e.detail)){
        var activityItem = NstSvcActivityMap.toActivityItem(e.detail);
        activityItem.isHot = true;
        addNewActivity(activityItem);
      }
    });

    function activityBelongsToPlace(activity) {
      if (!vm.activitySettings.placeId) {
        return true;
      } else if (activity.place) {
        return activity.place.id === vm.activitySettings.placeId;
      } else if (activity.post) {
        return _.some(activity.post.places, function (place) {
          return place.id === vm.activitySettings.placeId;
        });
      }

      return false;
    }

    function addNewActivity(activity) {
      if (!_.some(vm.acts.thisYear.thisMonth.today.items, { id : activity.id })){
        vm.acts.thisYear.thisMonth.today.items.unshift(activity);
        vm.acts.thisYear.thisMonth.today.hasAnyItem = true;
      }
    }

    console.log($scope);

  }
})();
