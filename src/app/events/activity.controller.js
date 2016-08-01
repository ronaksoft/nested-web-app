  (function() {
    'use strict';

    angular
      .module('nested')
      .controller('ActivityController', ActivityController);

    /** @ngInject */
    function ActivityController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal, $state, $timeout,
      toastr, _, moment,
      NST_SRV_EVENT, NST_EVENT_ACTION, NST_SRV_ERROR, NST_STORAGE_TYPE, NST_ACTIVITY_FILTER, NST_DEFAULT,
      NstSvcActivityMap,
      NstSvcAuth, NstSvcServer, NstSvcLoader, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcInvitationFactory,
      NstActivity, NstPlace, NstInvitation) {

      var vm = this;

      // TODO it needs to connect with cache
      vm.extended = true;
      // where we bind activities view-model for view
      vm.acts = [];
      // where we keep NstActivities and will be mapped to view-model
      vm.cache = [];
      vm.currentPlace = null;

      vm.loadMore = loadMore;
      vm.acceptInvitation = acceptInvitation;
      vm.declineInvitation = declineInvitation;
      vm.applyFilter = applyFilter;
      vm.viewPost = viewPost;
      vm.scroll = scroll;

      vm.activitySettings = {
        limit : 24,
        filter : NST_ACTIVITY_FILTER.ALL,
        placeId : null,
        date : null,
      };
      vm.urls = {
        filters : {
          all : '',
          messages : '',
          comments : '',
          logs : ''
        }
      };


      /******************
       ** Initializing **
       ******************/

      (function() {
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

        setPlace(vm.activitySettings.placeId).then(function(placeFound) {
          // return $q.all([loadActivities(), loadInvitations()]);
          return $q.all([loadActivities()]);
        }).then(function(values) {

        }).catch(function(error) {
          $log.debug(error);
        })
      })();


      /********************
       ** Main Functions **
       ********************/

      function loadMore() {
        loadActivities().then(function() {});
      }

      function acceptInvitation(invitation) {
        NstSvcInvitationFactory.accept(invitation).then(function(result) {

        }).catch(function(result) {

        });
      }

      function declineInvitation(invitation) {
        NstSvcInvitationFactory.decline(invitation).then(function(result) {

        }).catch(function(result) {

        });
      }

      function applyFilter(filter) {
        if (vm.activitySettings.placeId) {
          $state.go('place-activity-filtered', {
            placeId : vm.activitySettings.placeId,
            filter : filter
          });
        } else {
          $state.go('activity-filtered', {
            filter : filter
          });
        }
      }

      function viewPost(postId) {
        NstSvcPostFactory.getWithComments(postId).then(function(post) {
          // TODO: open a modal and show the post
        }).catch(function(error) {

        });
      }

      function scroll(event) {
        var element = event.currentTarget;
        if (element.scrollTop + element.clientHeight === element.scrollHeight) {
          $log.debug("load more");
          loadMore();
        }
      }


      /**********************
       ** Helper Functions **
       **********************/

      function setPlace(id) {
        var defer = $q.defer();
        if (!id) {
          defer.resolve(false);
        } else {
          return NstSvcPlaceFactory.get(id).then(function(place) {
            if (place && place.id) {
              vm.currentPlace = place;
              defer.resolve(true);
            } else {
              vm.currentPlace = null;
              defer.resolve(false);
            }
          }).catch(defer.reject);
        }

        return defer.promise;
      }

      function mapActivities(activities) {
        return NstSvcActivityMap.toActivityItems(activities);
      }

      function loadActivities() {
        return $q(function(resolve, reject) {
          vm.activitySettings.date = getLastActivityTime();
          NstSvcActivityFactory.get(vm.activitySettings).then(function(activities) {
            vm.cache = _.concat(vm.cache, activities);
            vm.acts = mapActivities(vm.cache);
            $log.debug('Activity | Activities: ', vm.acts);
            resolve(vm.acts);

          }).catch(reject);
        });
      }

      function getLastActivityTime() {
        var last = _.last(_.orderBy(vm.cache, 'date', 'desc'));
        if (!last) {
          return moment().format('x');
        }
        if (moment.isMoment(last.date)) {
          return last.date.format('x');
        }

        return last.date.getTime();
      }

      function loadInvitations() {
        return $q(function(resolve, reject) {
          NstSvcInvitationFactory.get().then(function(invitations) {

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
        if (vm.activitySettings.placeId){
          vm.urls.filters = {
            all : $state.href('place-activity-filtered', { placeId : vm.activitySettings.placeId, filter : 'all' }),
            messages : $state.href('place-activity-filtered', { placeId : vm.activitySettings.placeId, filter : 'messages' }),
            comments : $state.href('place-activity-filtered', { placeId : vm.activitySettings.placeId, filter : 'comments' }),
            logs : $state.href('place-activity-filtered', { placeId : vm.activitySettings.placeId, filter : 'log' })
          };
        } else {
          vm.urls.filters = {
            all : $state.href('activity-filtered', { filter : 'all' }),
            messages : $state.href('activity-filtered', { filter : 'messages' }),
            comments : $state.href('activity-filtered', { filter : 'comments' }),
            logs : $state.href('activity-filtered', { filter : 'log' })
          };
        }
      }

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (e) {
        // console.log(e);
        // var activity = NstSvcActivityFactory.parseActivityEvent(e.detail.timeline_data).then(function (activity) {
        //   console.log(activity);
        // }).catch(function (error) {
        //   $log.debug(error);
        // });
        // $log.debug(e);
        // var action = e.detail.timeline_data.action;
        // var filter = vm.filters[vm.filter].filter;

        // if (shouldPushToEvents(filter, action)) {
        //     $scope.events.pushEvent(event, true);
        // }
      });

      // FIXME: NEEDS REWRITE COMPLETELY
      vm.scroll = {
        axis: 'xy',
        callbacks: {
          whileScrolling:function(){
            var t = -this.mcs.top;
            $timeout(function () { $rootScope.navView = t > 55; });

            //$('.nst-navbar').toggleClass('tiny', t > 55);

            if ( t > 0) {
              $("#content-plus").stop().css({
                marginTop: t
              });
            } else if(t == 0){
              $("#content-plus").stop().css({
                marginTop: 0
              });
            }
          },
          onTotalScroll:function () {
            vm.loadMore();
          },
          onTotalScrollOffset:10,
          alwaysTriggerOffsets:false
        }
      };
    }
  })();
