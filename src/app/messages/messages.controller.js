(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $stateParams, $state, $scope, $uibModal, _, $timeout, $log, $q,
                              moment, toastr, SvcScrollSaver, $location, NstSvcActivityMap, NstSvcDate, NstSvcCompactViewStorage,
                              NST_MESSAGES_SORT_OPTION, NST_DEFAULT, NST_PLACE_EVENT_ACTION, NST_PLACE_ACCESS, NST_POST_EVENT,
                              NstSvcPostFactory, NstSvcPlaceFactory, NstUtility, NstSvcAuth, NstSvcSync, NstSvcModal,
                              NstSvcTranslation, SvcCardCtrlAffix, NstSvcUserFactory, NST_SRV_ERROR) {

    var vm = this;

    var DEFAULT_MESSAGES_COUNT = 8,
      defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES;
    // Consistently Interactive Time Handler
    var CITHandler = null;
    vm.messages = [];
    vm.dateArrays = [];
    var timeGroups = [];
    var now = NstSvcDate.now();
    vm.pinnedPosts = [];
    vm.pinnedPostsIds = [];
    vm.hotMessagesCount = 0;
    vm.selectedPosts = [];
    // First Interactive Time
    vm.FIT = true;

    vm.loadMore = loadMore;
    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.noMessages = false;
    vm.loading = false;
    vm.error = false;
    // Reveals hot message when user wants to show new messages
    vm.revealHotMessage = false;
    vm.markAllAsRead = markAllAsRead;
    vm.markAsSeenGroup = markAsSeenGroup;
    vm.showNewMessages = showNewMessages;
    vm.dismissNewMessage = dismissNewMessage;
    vm.openContacts = openContacts;
    vm.openApps = openApps;
    vm.removeMulti = removeMulti;
    vm.moveMulti = moveMulti;
    vm.markMulti = markMulti;
    vm.readMulti = readMulti;
    vm.goUnreadMode = goUnreadMode;
    vm.unselectAll = unselectAll;
    vm.selectAll = selectAll;
    vm.toggleCompactView = toggleCompactView;
    vm.exitUnseenMode = exitUnseenMode;
    vm.currentUser = NstSvcAuth.user;
    vm.hasScrollHistory = false;
    vm.restoreScroll = restoreScroll;
    vm.dismissScrollHistoryMessage = dismissScrollHistoryMessage;

    // Some flags that help us find where we are
    vm.isFeed = false;
    vm.isBookmark = false;
    vm.isPlaceMessage = false;
    vm.isSent = false;
    vm.isUnreadMode = false;
    vm.isPersonal = false;

    vm.messagesSetting = {
      limit: DEFAULT_MESSAGES_COUNT,
      skip: 0,
      sort: defaultSortOption,
      before: null
    };

    vm.quickMessageAccess = false;

    vm.scrollChange = scrollChange;
    // Listen for when the dnd has been configured.
    var eventReferences = [];
    (function () {

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        vm.syncId = NstSvcSync.openAllChannel();
        vm.currentPlaceId = null;
      } else {
        vm.syncId = NstSvcSync.openChannel($stateParams.placeId);
        vm.currentPlaceId = $stateParams.placeId;
      }

      vm.messagesSetting.sort = $stateParams.sort || defaultSortOption;

      setLocationFlag();
      configureNavbar();

      vm.compactView = (!vm.isFeed && NstSvcCompactViewStorage.getByPlace(vm.currentPlaceId)) || false;

      if (vm.compactView) {
        vm.messagesSetting.limit = 30;
      }

      if (vm.currentPlaceId) {
        loadPlace().then(load);
      } else {
        load();
      }

      loadUnreadPostsCount();

    })();

    function postMustBeShown(activity) {
      if (activity.actor.id !== NstSvcAuth.user.id) {
        return false;
      }

      // Is in sent page
      if (vm.isSent) {
        return true;
      }

      // The message was sent to the current place
      if (_.includes(activity.places, vm.currentPlaceId)) {
        return true;
      }

      if (activity.place && activity.place.id === vm.currentPlaceId) {
        return true;
      }

      // The message
      if (!vm.currentPlaceId && _.intersection(_.map(activity.places, 'id'), vm.bookmarkedPlaces).length > 0) {
        return true;
      }

      return false;
    }

    function mustBeAddedToHotPosts(activity) {
      // if (post.read) {
      //   return false;
      // }

      if (activity.actor.id === NstSvcAuth.user.id) {
        return false;
      }

      // The message was sent to the current place
      if (_.includes(activity.places, vm.currentPlaceId)) {
        return true;
      }

      if (activity.place && activity.place.id === vm.currentPlaceId) {
        return true;
      }

      // The message
      if (!vm.currentPlaceId && _.intersection(_.map(activity.places, 'id'), vm.bookmarkedPlaces).length > 0) {
        return true;
      }

      return false;
    }

    function loadUnreadPostsCount() {
      NstSvcPlaceFactory.getPlacesUnreadPostsCount([vm.currentPlaceId]).then(function (places) {
        vm.unreadCount = _.reduce(places, function (sum, place) {
          return sum + place.count;
        }, 0);
      });
    }

    function handleCachedPosts(cachedPosts) {
      cachedPosts.forEach(function(post){
        window.requestAnimationFrame(function(){
          vm.messages.push(post)
        });
      });
      
      vm.loading = false;
      CITHandler = $timeout(function () {
        $scope.$apply(function () {
          vm.FIT = false;
        });
      }, 500);
    }

    function applyChanges(oldPost, newPost) {
      if (oldPost.lastUpdate >= newPost.lastUpdate) {
        // The post has not been changed
        return;
      }

      oldPost.labels = newPost.labels;
      oldPost.comments = newPost.comments;
      oldPost.places = newPost.places;
    }

    function makeGroupMessage() {
      vm.messagesGrouped = NstSvcActivityMap.mergeGroup(vm.messages, posts);
    }

    function mergePosts(posts) {
      var newItems = _.differenceBy(posts, vm.messages, 'id');
      var removedItems = _.differenceBy(vm.messages, posts, 'id');

      // first omit the removed items; The items that are no longer exist in fresh posts
      _.forEach(removedItems, function (item) {
        var index = _.findIndex(vm.messages, {
          'id': item.id
        });
        if (index > -1) {
          vm.messages.splice(index, 1);
        }
      });

      // add new items; The items that do not exist in cached items, but was found in fresh posts
      vm.messages.unshift.apply(vm.messages, newItems);

      // re-arrange posts
      _.forEach(posts, function (post, index) {
        var oldPostIndex = _.findIndex(vm.messages, {
          id: post.id
        });
        if (oldPostIndex === -1) {
          return;
        }

        // The post is in the right position
        if (oldPostIndex === index) {
          // Just update places, labels and comments of the post to make sure everything is up to date
          applyChanges(vm.messages[oldPostIndex], post);
          return;
        }

        // change the post position
        vm.messages.splice(oldPostIndex, 1);
        vm.messages.splice(index, 0, post);
      });
      // return vm.messages = NstSvcActivityMap.mergeGroup(vm.messages, posts);
    }

    function appendPosts(oldPosts) {
      // return vm.messages = NstSvcActivityMap.appendGroup(vm.messages, oldPosts);
      var items = _.differenceBy(oldPosts, vm.messages, 'id');
      //to make sure pinned post doesn't duplicate
      items = _.differenceBy(items, _.map(vm.pinnedPostsIds, function (item) {
        return {id: item};
      }), 'id');
      vm.messages.push.apply(vm.messages, items);
    }

    function replacePosts(newPosts) {
      vm.messages = newPosts;
      // vm.messages = NstSvcActivityMap.groupByTime(posts);
    }

    function goUnreadMode() {
      vm.isUnreadMode = true;
      vm.messagesSetting.limit = vm.messages.length + 30 > 100 ? 100 : vm.messages.length + 30;
      vm.messagesSetting.before = null;
      load();
    }

    function exitUnseenMode() {
      if (vm.isUnreadMode) {
        vm.isUnreadMode = false;
        load();
      }
    }

    function load() {
      return getMessages(vm.messagesSetting, handleCachedPosts).then(function (posts) {
        if (CITHandler) {
          $timeout.cancel(CITHandler);
        }
        vm.FIT = false;
        mergePosts(posts);
        if ($state.current.options && $state.current.options.alias === 'savescroll') {
          $timeout(function () {
            vm.hasScrollHistory = SvcScrollSaver.hasHistory($location.$$url);
            $timeout(function () {
              vm.hasScrollHistory = false;
            }, 5000);
          }, 1);
        }
      }).catch(function (error) {
        if (error.code === NST_SRV_ERROR.ACCESS_DENIED && error.message && error.message[0] === 'password_change') {
          return;
        }
        NstSvcModal.error(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place.")).finally(function () {
          if ($state.current.name !== NST_DEFAULT.STATE) {
            $state.go(NST_DEFAULT.STATE);
          } else {
            $state.reload(NST_DEFAULT.STATE);
          }
        });
      });
    }

    function loadMore() {
      if (vm.loading || vm.reachedTheEnd || vm.noMessages) {
        return;
      }
      vm.loading = true;
      vm.messagesSetting.before = getLastMessageTime();
      return getMessages(vm.messagesSetting).then(function (posts) {
        $timeout(function () {
          appendPosts(posts);
        }, 1000);
        vm.tryAgainToLoadMore = false;
      }).catch(function () {
        vm.tryAgainToLoadMore = true;
      });
    }

    function reload() {
      vm.messagesSetting.skip = 0;
      vm.messagesSetting.before = null;

      return getMessages(vm.messagesSetting).then(function (posts) {
        replacePosts(posts);
      });
    }

    eventReferences.push($scope.$on('scroll-reached-bottom', function () {
      vm.loadMore()
    }));

    eventReferences.push($scope.$on('post-select', function (event, data) {
      if (vm.tempBanPlaces) {
        vm.tempBanPlaces = [];
      }
      if (data.isChecked) {
        vm.selectedPosts.push(data.postId);
      } else {
        var index = vm.selectedPosts.indexOf(data.postId);
        if (index > -1) vm.selectedPosts.splice(index, 1);
      }
      $scope.$broadcast('selected-length-change', {
        selectedPosts: vm.selectedPosts
      });
    }));

    function configureNavbar() {
      if (vm.isBookmark) {
        vm.navTitle = NstSvcTranslation.get('Bookmarked Posts');
        vm.navIconClass = 'bookmarks';
      } else if (vm.isSent) {
        vm.navTitle = NstSvcTranslation.get('Shared by me');
        vm.navIconClass = 'sent';
      } else {
        vm.navTitle = NstSvcTranslation.get('Feed');
        vm.navIconClass = 'all-places';
      }
    }

    function openContacts($event) {
      $state.go('app.contacts', {}, {
        notify: false
      });
      $event.preventDefault();
    }

    function openApps($event) {
      $state.go('app.applications', {}, {
        notify: false
      });
      $event.preventDefault();
    }

    function confirmforRemoveMulti(posts, place) {
      return $uibModal.open({
        animation: false,
        // backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/remove-multi-from-confirm.html',
        controller: 'RemoveFromConfirmController',
        controllerAs: 'ctrl',
        resolve: {
          post: function () {
            return posts;
          },
          place: function () {
            return place;
          }
        }
      }).result;
    }

    function removeMulti($event) {
      $event.preventDefault();
      confirmforRemoveMulti(vm.selectedPosts.length, vm.currentPlace).then(function (agree) {
        if (!agree) {
          return;
        }
        var allCount = vm.selectedPosts.length;
        var successCount = 0;
        var failedCount = 0;
        // var get = true;
        vm.selectedPosts.forEach(function (item, i) {
          NstSvcPostFactory.get(item).then(function (post) {
            NstSvcPostFactory.remove(post.id, vm.currentPlaceId).then(function () {
              ++successCount;
              NstUtility.collection.dropById(post.places, vm.currentPlaceId);
              $rootScope.$broadcast('post-removed', {
                postId: post.id,
                placeId: vm.currentPlaceId
              });
              vm.selectedPosts.splice(0, 1);

              // TODO increase decrease on other ways
              --vm.currentPlace.counters.posts;
              $scope.$broadcast('selected-length-change', {
                selectedPosts: vm.selectedPosts
              });
              if (successCount + failedCount === allCount) {
                toastr.success(NstUtility.string.format(NstSvcTranslation.get("The {0} posts has been removed from this Place."), successCount));
                if (allCount !== successCount) {
                  toastr.warning(NstUtility.string.format(NstSvcTranslation.get("The {0} posts has been not removed from this Place."), failedCount));
                }
                NstSvcPlaceFactory.get(vm.currentPlaceId, true).then(function (p) {
                  vm.currentPlace.counters.posts = p.counters.posts;
                });
              }
            }).catch(function () {
              ++failedCount;
              if (i === allCount - 1) {
                toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
                if (allCount !== failedCount) {
                  NstSvcPlaceFactory.get(vm.currentPlaceId, true).then(function (p) {
                    vm.currentPlace.counters.posts = p.counters.posts;
                  });
                }
              }
            });
          });
        });
      });
    }

    function moveMulti($event) {
      $event.preventDefault();
      $uibModal.open({
        animation: false,
        // backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/move.html',
        controller: 'MovePlaceController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.selectedPosts;
          },
          selectedPlace: function () {
            return vm.currentPlace;
          },
          postPlaces: function () {
            return vm.tempBanPlaces ? vm.tempBanPlaces : [];
          },
          multi: true
        }
      }).result.then(function (result) {
        // vm.selectedPosts = [];
        // $scope.$broadcast('selected-length-change',{selectedPosts : vm.selectedPosts.length});
        for (var i = 0; i < result.success.length; i++) {
          $scope.$emit('post-moved', {
            postId: result.success[i],
            toPlace: result.toPlace,
            fromPlace: result.fromPlace
          });

          // Remove item fram staged posts
          var index = vm.selectedPosts.indexOf(result.success[i]);
          vm.selectedPosts.splice(index, 1);
          --vm.currentPlace.counters.posts;
          // what is this ?  and TODO : optimise for multi   :
          // NstUtility.collection.replaceById(vm.post.places, result.fromPlace.id, result.toPlace);
        }

        if (result.failed.length > 0) {
          vm.tempBanPlaces = [];
          vm.tempBanPlaces.push(result.toPlace);
        }
        $scope.$broadcast('selected-length-change', {
          selectedPosts: vm.selectedPosts
        });
        NstSvcPlaceFactory.getFresh(vm.currentPlaceId).then(function (p) {
          vm.currentPlace.counters.posts = p.counters.posts;
        });
        NstSvcPlaceFactory.getFresh(result.toPlace.id);
      });
    }

    function markMulti($event) {
      $event.preventDefault();
      for (var i = 0; i < vm.selectedPosts.length; i++) {
        NstSvcPostFactory.pin(vm.selectedPosts[i]);
      }
      unselectAll();
    }

    function unselectAll() {
      if (vm.selectedPosts.length > 0) {
        vm.selectedPosts = [];
        $scope.$broadcast('selected-length-change', {
          selectedPosts: vm.selectedPosts
        });
      }
    }

    function selectAll() {
      vm.selectedPosts = vm.messages.map(function (msg) {
        return msg.id
      });
      $scope.$broadcast('selected-length-change', {
        selectedPosts: vm.selectedPosts,
        selectAll: true
      });
    }

    function readMulti($event) {
      $event.preventDefault();
      for (var i = 0; i < vm.selectedPosts.length; i++) {
        NstSvcPostFactory.read(vm.selectedPosts[i]);
      }
      // FIXME : this block after all responses
      unselectAll()
    }

    function getMessages(settings, cacheHandler) {
      vm.loading = true;
      vm.error = false;

      var promise = null;
      if (vm.isUnreadMode) {
        promise = NstSvcPostFactory.getUnreadMessages(settings, [vm.currentPlaceId], cacheHandler);
      } else if (vm.isBookmark) {
        promise = NstSvcPostFactory.getBookmarkedMessages(settings, cacheHandler);
      } else if (vm.isSent) {
        promise = NstSvcPostFactory.getSentMessages(settings, cacheHandler);
      } else if (vm.isFeed) {
        promise = NstSvcPostFactory.getFavoriteMessages(settings, null, cacheHandler);
      } else {
        promise = NstSvcPostFactory.getPlaceMessages(settings, vm.currentPlaceId, cacheHandler);
      }

      promise.then(function (posts) {
        vm.reachedTheEnd = posts.length < settings.limit;
        vm.noMessages = vm.messages.length === 0 && posts.length === 0;
        checkHeavyPerformance();
      }).catch(function () {
        vm.error = true;
      }).finally(function () {
        $timeout(function () {
          vm.loading = false;
        }, 1000);
      });

      return promise;
    }

    function getLastMessageTime() {

      var last = _.last(vm.messages);

      if (!last) {
        return null;
      }
      var lastDate = !vm.isSent && NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY === vm.messagesSetting.sort ? last.lastUpdate : last.timestamp;
      if (moment.isMoment(lastDate)) {
        return lastDate.format('x');
      }

      return lastDate;
    }

    function showNewMessages() {
      reload().then(function () {
        vm.hotMessagesCount = 0;
      });

      $rootScope.$emit('unseen-activity-clear');
    }

    function dismissNewMessage() {
      vm.revealHotMessage = false;
    }

    function markAllAsRead() {
      NstSvcPlaceFactory.markAllPostAsRead($stateParams.placeId);
    }

    function markAsSeenGroup(index) {
      vm.dateArrays[index];
      if (!vm.messages[index].read) {
        NstSvcPostFactory.read(vm.messages[index].id).catch(function (err) {
          $log.debug('MARK AS READ :' + err);
        });
      }
      if (vm.dateArrays[index + 1] === null && vm.messages[index + 1]) {
        markAsSeenGroup(index + 1);
      }
    }

    function loadPlace() {
      if (!vm.currentPlaceId) {
        return;
      }
      var isResolved = false;
      var deferred = $q.defer();

      NstSvcPlaceFactory.get(vm.currentPlaceId).then(function (place) {
        vm.quickMessageAccess = place.hasAccess(NST_PLACE_ACCESS.WRITE_POST);
        deferred.resolve();
      });
      NstSvcPlaceFactory.getWithNoCache(vm.currentPlaceId).then(function (place) {
        vm.currentPlace = place;
        vm.quickMessageAccess = place.hasAccess(NST_PLACE_ACCESS.WRITE_POST);
        vm.placeRemoveAccess = place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
        vm.pinnedPostsIds = place.pinnedPosts;
        initPinnedPost();
        if (!isResolved) {
          deferred.resolve();
        }
        try {
          vm.sholocawPlaceId = !_.includes(['off', 'internal'], place.privacy.receptive);
        } catch (e) {
          vm.showPlaceId = true
        }
      });
      return deferred.promise;
    }

    function initPinnedPost() {
      if (vm.pinnedPostsIds.length > 0) {
        NstSvcPostFactory.getMany(vm.pinnedPostsIds).then(function (respose) {
          var posts = respose.resolves;
          posts = _.map(posts, function (post) {
            return NstSvcPostFactory.parsePost(post);
          });
          // todo init groups
          var newItems = _.differenceBy(posts, vm.messages, 'id');
          var pinnedPosts = [];
          _.forEachRight(vm.messages, function (post, index) {
            if (vm.pinnedPostsIds.indexOf(post.id) > -1) {
              post.pinned = true;
              pinnedPosts.push(post);
              vm.messages.splice(index, 1);
            }
          });
          _.forEach(newItems, function (post) {
            post.pinned = true;
          });
          vm.pinnedPosts = pinnedPosts.concat(newItems);
        });
      }
    }

    function reloadPlace() {
      if (!vm.currentPlaceId) {
        return;
      }

      NstSvcPlaceFactory.getFresh(vm.currentPlaceId).then(function (place) {
        vm.currentPlace = place;
        vm.quickMessageAccess = place.hasAccess(NST_PLACE_ACCESS.WRITE_POST);
        vm.placeRemoveAccess = place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
        try {
          vm.sholocawPlaceId = !_.includes(['off', 'internal'], place.privacy.receptive);
        } catch (e) {
          vm.showPlaceId = true
        }
      });
    }

    function setLocationFlag() {
      switch ($state.current.name) {
        case 'app.messages-favorites':
        case 'app.messages-favorites-sorted':
          vm.isFeed = true;
          break;

        case 'app.messages-bookmarked':
          vm.isBookmark = true;
          break;

        case 'app.messages-sent':
        case 'app.messages-sent-sorted':
          vm.isSent = true;
          break;

        case 'app.place-messages-unread':
        case 'app.place-messages-unread-sorted':
          vm.isUnreadMode = true;
          break;

        default:
          if (NstSvcAuth.user && NstSvcAuth.user.id === vm.currentPlaceId.split('.')[0]) {
            vm.isPersonal = true;
          } else {
            NstSvcUserFactory.getCurrent().then(function (data) {
              if (data.id === vm.currentPlaceId.split('.')[0]) {
                vm.isPersonal = true;
              }
            });
          }
          vm.isPlaceMessage = true;
          break;
      }
    }

    // $scope.$watch(function () {
    //   return vm.unreadCount
    // }, function () {
    //   if (vm.unreadCount === 0) {
    //     vm.exitUnseenMode();
    //     vm.isUnreadMode = false;
    //   }
    // });

    eventReferences.push($scope.$watch(function () {
      return vm.messages.length
    }, function () {
      if (vm.compactView) {
        getDateGroups();
      }
    }));

    eventReferences.push($rootScope.$on('reload-counters', function () {
      loadUnreadPostsCount();
    }));

    function scrollChange() {
      // console.log(window.scrollY);
    }

    function saveScroll() {
      // if ($state.current.options && $state.current.options.alias === 'savescroll') {
      SvcScrollSaver.store();
      // }
    }

    function restoreScroll() {
      dismissScrollHistoryMessage();
      SvcScrollSaver.restore($location.$$url)
    }

    function dismissScrollHistoryMessage() {
      vm.hasScrollHistory = false;
    }

    var checkHeavyPerformanceEnable = false;
    var postRang = 20;

    eventReferences.push($rootScope.$on('post-scroll-to-top', function () {
      for (var i = 0; i < postRang / 2 && i < vm.messages.length; i++) {
        vm.messages[i].visible = true;
      }
    }));

    function checkHeavyPerformance() {
      if (!checkHeavyPerformanceEnable && !vm.compactView && vm.messages.length > 50) {
        checkHeavyPerformanceEnable = true;
        eventReferences.push($scope.$watch(function () {
          return $rootScope.inViewPost;
        }, function (item) {
          hideOutboundPost(item);
        }));
      }
    }

    function hideOutboundPost(item) {
      var index = _.findIndex(vm.messages, {id: item.id});
      var bottomBound;
      var topBound;
      bottomBound = index - (postRang / 2);
      if (bottomBound < 0) {
        bottomBound = 0;
      }
      topBound = index + (postRang / 2);
      if (topBound > vm.messages.length - 1) {
        topBound = vm.messages.length - 1;
      }
      for (var i = 0; i < bottomBound; i++) {
        SvcCardCtrlAffix.remove(vm.messages[i].id);
        vm.messages[i].visible = false;
      }
      for (var i = topBound + 1; i < vm.messages.length; i++) {
        SvcCardCtrlAffix.remove(vm.messages[i].id);
        vm.messages[i].visible = false;
      }
      for (var i = bottomBound; i < topBound; i++) {
        vm.messages[i].visible = true;
      }
    }


    function toggleCompactView(value) {
      vm.FIT = true;
      if (value === true) {
        vm.compactView = value;
        if (vm.messages.length < 30) {
          loadMore();
        }
      } else if (value === false) {
        _.forEach(vm.messages, function (msg, index) {
          if (msg && index > 7) {
            SvcCardCtrlAffix.remove(msg.id);
          }
        });
        vm.messages = vm.messages.splice(0, 8);
        vm.compactView = value;
      } else {
        vm.compactView = !vm.compactView;
      }
      NstSvcCompactViewStorage.setByPlace(vm.currentPlaceId, value);
      getDateGroups();
      $timeout(function () {
        vm.FIT = false;
      }, 64)
    }

    function getDateGroups() {
      timeGroups = [];
      vm.dateArrays = _.map(vm.messages, mapMessageDates);
    }

    function mapMessageDates(msg) {
      var date = moment(msg.date || msg.timestamp);

      var thisMonthStart = moment(now).startOf('month');
      var dateDayStart = date.clone().startOf('day').unix();
      if (date.isSameOrAfter(thisMonthStart)) {
        if (timeGroups.indexOf(dateDayStart) === -1) {
          timeGroups.push(dateDayStart);
          return dateDayStart;
        } else {
          return null;
        }
      }

      var thisYearStart = moment(now).startOf('year');
      var dateMonthStart = date.clone().startOf('month').unix();
      if (date.isSameOrAfter(thisYearStart)) {
        if (timeGroups.indexOf(dateMonthStart) === -1) {
          timeGroups.push(dateMonthStart);
          return dateMonthStart;
        } else {
          return null;
        }
      }

      var dateYearStart = date.clone().startOf('year').unix();
      if (timeGroups.indexOf(dateYearStart) === -1) {
        timeGroups.push(dateYearStart);
        return dateYearStart;
      }

      return null;
    }

    // $timeout(function () {
    //   SvcCardCtrlAffix.remove(vm.messages[1].id);
    //   SvcCardCtrlAffix.remove(vm.messages[2].id);
    //   vm.messages[1].visible = false;
    //   vm.messages[2].visible = false;
    //
    //   // $timeout(function () {
    //   //   vm.messages[1].visible = true;
    //   //   vm.messages[2].visible = true;
    //   // }, 3000);
    // }, 3000);
    

    eventReferences.push($rootScope.$on(NST_POST_EVENT.READ, function () {
      loadUnreadPostsCount();
      if (vm.isUnreadMode) {
        if (!_.some(vm.messages, {read: false})) {
          vm.isUnreadMode = false;
        }
      }
    }));

    eventReferences.push($rootScope.$on('post-read-all', function () {
      loadUnreadPostsCount();
    }));

    eventReferences.push($rootScope.$on('pin-to-place-toggled', function (event, data) {
      if (data.pinned) {
        vm.pinnedPostsIds.push(data.id);
        if (vm.pinnedPostsIds.length > 1) {
          vm.pinnedPostsIds.splice(0, 1);
        }
      } else {
        var index = _.indexOf(vm.pinnedPostsIds, data.id);
        vm.pinnedPostsIds.splice(index, 1);
      }
      initPinnedPost();
    }));

    eventReferences.push($rootScope.$on(NST_PLACE_EVENT_ACTION.POST_ADD, function (e, data) {
      // TODO : is feed ?!
      if (vm.isFeed) {
        load();
      }
      if (postMustBeShown(data.activity)) {
        // The current user is the sender
        NstSvcPostFactory.get(data.activity.post.id).then(function (message) {
          vm.messages.unshift(message);
        });
      } else if (mustBeAddedToHotPosts(data.activity)) {
        // someone else sent the post
        if ($rootScope.inViewPost && $rootScope.inViewPost.index === 0) {
          NstSvcPostFactory.get(data.activity.post.id).then(function (message) {
            vm.messages.unshift(message);
          });
        } else {
          vm.hotMessagesCount = vm.hotMessagesCount + 1;
        }
      }
      loadUnreadPostsCount();
      reloadPlace();
    }));

    eventReferences.push($rootScope.$on('post-removed', function (event, data) {

      var message = _.find(vm.messages, {
        id: data.postId
      });

      if (message) {
        SvcCardCtrlAffix.remove(data.postId);
        loadUnreadPostsCount();
        reloadPlace();

        if (data.placeId) { // remove the post from the place
          // remove the place from the post's places
          NstUtility.collection.dropById(message.places, data.placeId);

          // remove the post if the user has not access to see it any more
          var places = NstSvcPlaceFactory.filterPlacesByReadPostAccess(message.places);
          if ((_.isArray(places) && places.length === 0) || (vm.currentPlaceId && data.placeId === vm.currentPlaceId)) {
            NstUtility.collection.dropById(vm.messages, data.postId);
            return;
          }

        } else { //retract it
          NstUtility.collection.dropById(vm.messages, message.id);
        }
      }
    }));

    eventReferences.push($rootScope.$on('post-hide', function (event, data) {
      var message = _.find(vm.messages, {
        id: data.postId
      });
      if (message) {
        message.tempHide = true
      }
    }));

    eventReferences.push($rootScope.$on('post-show', function (event, data) {
      var message = _.find(vm.messages, {
        id: data.postId
      });
      if (message) {
        message.tempHide = false
      }
    }));

    eventReferences.push($scope.$on('post-moved', function (event, data) {
      // there are tow conditions that a moved post should be removed from messages list
      // 1. The moved place is the one that you see its messages list (DONE)
      // 2. You moved a place to another one and none of the post new places
      //    are not marked to be shown in feeds page
      // TODO: Implement the second condition

      loadUnreadPostsCount();
      reloadPlace();
      if ($stateParams.placeId === data.fromPlace.id) {
        NstUtility.collection.dropById(vm.messages, data.postId);
      }
    }));

    if (vm.isBookmark) {
      eventReferences.push($rootScope.$on(NST_POST_EVENT.UNBOOKMARKED, function (e, data) {
        var message = _.find(vm.messages, {
          id: data.postId
        });

        if (message) {
          NstUtility.collection.dropById(vm.messages, message.id);
        }
      }));
    }

    $scope.$on('$destroy', function () {
      saveScroll();
      if (CITHandler) {
        $timeout.cancel(CITHandler);
      }
      NstSvcSync.closeChannel(vm.syncId);
      SvcCardCtrlAffix.measurement(80);
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
