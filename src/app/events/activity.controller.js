(function () {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .controller('ActivityController', ActivityController);

  /** @ngInject */
  function ActivityController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal, $state, $timeout,
    toastr, _, moment,
    NST_SRV_EVENT, NST_EVENT_ACTION, NST_SRV_ERROR, NST_STORAGE_TYPE, NST_ACTIVITY_FILTER, NST_DEFAULT, NST_ACTIVITY_FACTORY_EVENT,
    NstSvcActivityMap,
    NstSvcActivitySettingStorage,
    NstSvcAuth, NstSvcLoader, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcInvitationFactory, NstSvcServer,
    NstActivity, NstPlace, NstInvitation) {

    var vm = this;

    vm.activities = [];
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
    vm.loading = false;


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
        loadActivities();
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
        $state.go('app.place-activity-filtered', {
          placeId: vm.activitySettings.placeId,
          filter: filter
        }, { notify : false });
      } else {
        $state.go('app.activity-filtered', {
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

    function loadAfter(date) {
      vm.loading = true;
      vm.tryAgainToLoadMore = false;

      NstSvcActivityFactory.getAfter({
        placeId : vm.activitySettings.placeId,
        date : date,
        limit : vm.activitySettings.limit
      }).then(function(activities) {
        putInActivities(activities);
        vm.loading = false;
        vm.tryAgainToLoadMore = false;

      }).catch(function(error) {
        vm.loading = false;
        vm.tryAgainToLoadMore = true;
        $log.debug(error);
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
            vm.showPlaceId = !_.includes([ 'off', 'internal' ], place.privacy.receptive);
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
      if (vm.loading) {
        return false;
      }

      vm.loading = true;
      vm.tryAgainToLoadMore = false;

      NstSvcActivityFactory.get(vm.activitySettings).then(function(activities) {
        if (activities.length === 0 && !vm.activities.length === 0) {
          vm.reachedTheEnd = false;
          vm.noActivity = true;
        } else if (activities.length === 0 && vm.activities.length > 0) {
          vm.reachedTheEnd = true;
        } else {
          vm.reachedTheEnd = false;
          setLastActivityDate(activities);
          mergeWithActivities(activities);
        }
        vm.loading = false;
        vm.tryAgainToLoadMore = false;

      }).catch(function(error) {
        vm.loading = false;
        vm.tryAgainToLoadMore = true;
        $log.debug(error);
      });

    }

    function mergeWithActivities(activities) {
      var activityGroups = mapActivities(activities);
      _.forEach(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(vm.activities, { date : targetGroup.date });
        if (sourceGroup) { // merge
          sourceGroup.items.push.apply(sourceGroup.items, targetGroup.items);
        } else { // add
          vm.activities.push(targetGroup);
        }
      });
    }

    function putInActivities(activities) {
      var activityGroups = mapActivities(activities);
      _.forEachRight(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(vm.activities, { date : targetGroup.date });
        if (sourceGroup) { // merge
          _.forEach(targetGroup.items, function (item) {
            if (!_.some(sourceGroup.items, { id : item.id })) {
              sourceGroup.items.unshift(item);
            }
          });
        } else { // add
          vm.activities.unshift(targetGroup);
        }
      });
    }

    function setLastActivityDate(activities) {
      var last = _.last(activities);
      if (!last) {
        vm.activitySettings.date = moment().valueOf();
      } else if (moment.isMoment(last.date)) {
        vm.activitySettings.date = last.date.valueOf();
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
          all: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.ALL }),
          messages: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.MESSAGES }),
          comments: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.COMMENTS }),
          logs: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.LOGS })
        };
      } else {
        vm.urls.filters = {
          all: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.ALL }),
          messages: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.MESSAGES }),
          comments: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.COMMENTS }),
          logs: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.LOGS })
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

    NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
      loadAfter(getRecentActivityTime());
    });

    function getRecentActivityTime() {
      var date = moment().subtract(10, 'minute');

      if (vm.activities.length > 0) {
        var latestActivity = _.head(vm.activities[0].items);
        if (latestActivity) {
          date = latestActivity.date;
        }
      }

      return date.valueOf();
    }

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
      var today = _.find(vm.activities, { date : 'Today' });
      if (!today) {
        today = {
          date : 'Today',
          items : []
        };

        vm.activities.unshift(today);
      }

      if (!_.some(today.items, { id : activity.id })) {
        today.items.unshift(activity);
      }
    }

  }
})();
