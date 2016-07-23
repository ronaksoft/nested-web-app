  (function() {
    'use strict';

    angular
      .module('nested')
      .controller('ActivityController', ActivityController);

    /** @ngInject */
    function ActivityController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal,
      toastr, _, moment,
      NST_SRV_EVENT, NST_EVENT_ACTION, NST_SRV_ERROR, NST_STORAGE_TYPE, NST_ACTIVITY_FILTER,
      NstSvcActivityMap,
      NstSvcAuth, NstSvcServer, NstSvcLoader, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcInvitationFactory,
      NstActivity, NstPlace, NstInvitation) {
      var vm = this;

      //TODO it needs to connect with cache
      vm.extended = true;

      vm.activities = [];
      vm.loadMore = loadMore;
      vm.acceptInvitation = acceptInvitation;
      vm.declineInvitation = declineInvitation;
      vm.applyFilter = applyFilter;
      vm.viewPost = viewPost;
      vm.readyToScroll = true;
      vm.scroll = scroll;
      vm.filters = {
        '!$all': {
          filter: 'all',
          name: 'All'
        },
        '!$messages': {
          filter: 'messages',
          name: 'Messages'
        },
        '!$comments': {
          filter: 'comments',
          name: 'Comments'
        },
        '!$log': {
          filter: 'log',
          name: 'Log'
        }
      };
      vm.activitySettings = {
        skip: 0,
        limit: 25,
        filter: NST_ACTIVITY_FILTER.ALL
      };

      if (!$stateParams.placeId || $stateParams.placeId === '_'){
        vm.currentPlaceId = null;
      } else {
        vm.currentPlaceId = $stateParams.placeId;
      }

      if (!NstSvcAuth.isInAuthorization()) {
        $location.search({
          back: $location.path()
        });
        $location.path('/signin').replace();
      }

      (function() {
        setPlace(vm.currentPlaceId).then(function(placeFound) {
          // return $q.all([loadActivities(), loadInvitations()]);
          return $q.all([loadActivities()]);
        }).then(function(values) {
          $log.debug(values[0]);
        }).catch(function(error) {
          $log.debug(error);
        })
      })();

      function loadActivities() {
        return $q(function(resolve, reject) {
          NstSvcActivityFactory.load(vm.activitySettings).then(function(activities) {
            vm.acts = mapActivities(activities);
            resolve(vm.acts);

          }).catch(reject);
        });
      };

      function loadInvitations() {
        return $q(function(resolve, reject) {
          NstSvcInvitationFactory.get().then(function(invitations) {

            vm.invitations = invitations;
            resolve(vm.invitations);

          }).catch(reject);
        });
      }

      function loadMore() {
        return loadActivities();
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
        vm.activitySettings.filter = vm.filters[filter].filter;
        loadActivities().then(function() {}).catch(function(error) {
          $log.debug(error);
        });
      }

      function viewPost(postId) {
        NstSvcPostFactory.getWithComments(postId).then(function(post) {
          // TODO: open a modal and show the post
        }).catch(function(error) {

        });
      }

      function scroll(event) {
        var element = event.currentTarget;
        if (element.scrollTop + element.clientHeight + 10 > element.scrollHeight && this.moreEvents) {

          if (vm.readyToLoad) {
            vm.readyToLoad = false;
            load();
          }
        }
      }


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

    }

  })();
