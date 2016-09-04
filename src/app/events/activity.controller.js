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
                              NstSvcAuth, NstSvcLoader, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcInvitationFactory,
                              NstActivity, NstPlace, NstInvitation) {

    var vm = this;

    // TODO it needs to connect with cache
    vm.extended = true;
    // where we bind activities view-model for view
    vm.acts = {};
    // where we keep NstActivities and will be mapped to view-model
    vm.cache = [];
    vm.currentPlace = null;
    vm.noMessages = false;

    vm.loadMore = loadMore;
    vm.acceptInvitation = acceptInvitation;
    vm.declineInvitation = declineInvitation;
    vm.applyFilter = applyFilter;
    vm.viewPost = viewPost;

    vm.activitySettings = {
      limit: 24,
      filter: NST_ACTIVITY_FILTER.ALL,
      placeId: null,
      date: null,
    };
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
      if (placeIdParamIsValid($stateParams.placeId)) {
        vm.activitySettings.placeId = $stateParams.placeId;
      } else {
        vm.activitySettings.placeId = null;
      }

      if (filterIsValid($stateParams.filter)) {
        vm.activitySettings.filter = $stateParams.filter;
      } else {
        vm.activitySettings.filter = NST_ACTIVITY_FILTER.ALL;
      }

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
        });
      } else {
        $state.go('activity-filtered', {
          filter: filter
        });
      }
    }

    function viewPost(postId) {
      NstSvcPostFactory.getWithComments(postId).then(function (post) {
        // TODO: open a modal and show the post
      }).catch(function (error) {

      });
    }

    $(window).scroll(function (event) {
      var element = event.currentTarget;
      if (element.pageYOffset + element.innerHeight === $('body').height()) {
        $log.debug("load more");
        vm.loadMore();
      }
    });


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
          if (activities.length === 0) {
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
        addNewActivity(NstSvcActivityMap.toActivityItem(e.detail));
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
      vm.acts.thisYear.thisMonth.today.items.unshift(activity);
      vm.acts.thisYear.thisMonth.today.hasAnyItem = true;
    }


    // FIXME: NEEDS REWRITE COMPLETELY
    var nav = document.getElementsByTagName("nst-navbar")[0];
    var nst = document.getElementsByClassName("nst-content");
    //TweenLite.to(nav, 0.1, {minHeight: 183, maxHeight: 183, height: 183, ease: Linear.easeNone});
    $timeout(function () {
      $rootScope.navView = false
    });
    vm.bodyScrollConf = {
      axis: 'y',
      callbacks: {
        whileScrolling: function () {
          var t = -this.mcs.top;
          if (t > 55 && !$rootScope.navView) {
            TweenLite.to(nav, 0.1, {minHeight: 96, maxHeight: 96, height: 96, ease: Linear.easeNone});
            $timeout(function () {
              $rootScope.navView = t > 55;
            });
          } else if (t < 55 && $rootScope.navView) {
            TweenLite.to(nav, 0.1, {minHeight: 183, maxHeight: 183, height: 183, ease: Linear.easeNone});
            $timeout(function () {
              $rootScope.navView = t > 55;
            });
          }
        },
        onTotalScroll: function () {
          vm.loadMore();
        },
        onTotalScrollOffset: 10,
        alwaysTriggerOffsets: false
      }
    };
  }
})();
