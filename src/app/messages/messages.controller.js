(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $stateParams, $state, $scope, $uibModal, _, $timeout,
    moment, toastr,
    NST_MESSAGES_SORT_OPTION, NST_DEFAULT, NST_EVENT_ACTION, NST_PLACE_ACCESS, NST_POST_EVENT,
    NstSvcPostFactory, NstSvcPlaceFactory, NstUtility, NstSvcAuth, NstSvcSync, NstSvcModal,
    NstSvcTranslation, SvcCardCtrlAffix) {

    var vm = this;

    $rootScope.topNavOpen = false;

    var DEFAULT_MESSAGES_COUNT = 8,
      defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES;
    // Consistently Interactive Time Handler
    var CITHandler = null;
    vm.messages = [];
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
    vm.showNewMessages = showNewMessages;
    vm.dismissNewMessage = dismissNewMessage;
    vm.openContacts = openContacts;
    vm.removeMulti = removeMulti;
    vm.moveMulti = moveMulti;
    vm.markMulti = markMulti;
    vm.readMulti = readMulti;
    vm.goUnreadMode = goUnreadMode;
    vm.unselectAll = unselectAll;
    vm.exitUnseenMode = exitUnseenMode;

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

      if (vm.currentPlaceId) {
        loadPlace();
      }

      load();
      loadUnreadPostsCount();

      eventReferences.push($rootScope.$on(NST_POST_EVENT.READ, function () {
        loadUnreadPostsCount();
      }));

      eventReferences.push($rootScope.$on('post-read-all', function () {
        loadUnreadPostsCount();
      }));

      eventReferences.push($rootScope.$on(NST_EVENT_ACTION.POST_ADD, function (e, data) {
        if (postMustBeShown(data.activity.post)) {
          // The current user is the sender
          vm.messages.unshift(data.activity.post);
        } else if (mustBeAddedToHotPosts(data.activity.post)) {
          // someone else sent the post
          vm.hotMessagesCount = vm.hotMessagesCount + 1;
        }
        loadUnreadPostsCount();
        reloadPlace();
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

      eventReferences.push($rootScope.$on('post-removed', function (event, data) {

        var message = _.find(vm.messages, {
          id: data.postId
        });

        if (message) {

          loadUnreadPostsCount();
          reloadPlace();

          if (data.placeId) { // remove the post from the place
            // remove the place from the post's places
            NstUtility.collection.dropById(message.places, data.placeId);

            // remove the post if the user has not access to see it any more
            var places = NstSvcPlaceFactory.filterPlacesByReadPostAccess(message.places);
            if ((_.isArray(places) && places.length === 0) || (vm.currentPlaceId && data.placeId == vm.currentPlaceId)) {
              NstUtility.collection.dropById(vm.messages, data.postId);
              return;
            }

          } else { //retract it
            NstUtility.collection.dropById(vm.messages, message.id);
          }
        }
      }));
      
    
      $rootScope.$on('post-hide', function (event, data) {
        var message = _.find(vm.messages, {
          id: data.postId
        });
        if (message) {
          message.tempHide = true
        }
      });

      $rootScope.$on('post-show', function (event, data) {
        var message = _.find(vm.messages, {
          id: data.postId
        });
        if (message) {
          message.tempHide = false
        }
      });

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
          return;
        }
      }));
    })();

    function postMustBeShown(post) {
      if (post.sender.id !== NstSvcAuth.user.id) {
        return false;
      }

      // Is in sent page
      if (vm.isSent) {
        return true;
      }

      // The message was sent to the current place
      if (_.some(post.places, {
          id: vm.currentPlaceId
        })) {
        return true;
      }

      // The message
      if (!vm.currentPlaceId && _.intersection(_.map(post.places, 'id'), vm.bookmarkedPlaces).length > 0) {
        return true;
      }

      return false;
    }

    function mustBeAddedToHotPosts(post) {
      if (post.read) {
        return false;
      }

      if (post.sender.id === NstSvcAuth.user.id) {
        return false;
      }

      // The message was sent to the current place
      if (_.some(post.places, {
          id: vm.currentPlaceId
        })) {
        return true;
      }

      // The message
      if (!vm.currentPlaceId && _.intersection(_.map(post.places, 'id'), vm.bookmarkedPlaces).length > 0) {
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
      vm.messages = cachedPosts;
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
    }

    function appendPosts(oldPosts) {
      var items = _.differenceBy(oldPosts, vm.messages, 'id');
      vm.messages.push.apply(vm.messages, items);
    }

    function replacePosts(newPosts) {
      vm.messages = newPosts;
    }

    function goUnreadMode() {
      vm.isUnreadMode = true;
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
      }).catch(function () {
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
        appendPosts(posts);
        vm.tryAgainToLoadMore = false;
        $timeout(function () {
          vm.loading = false;
        }, 1000)
      }).catch(function () {
        vm.tryAgainToLoadMore = true;
        vm.loading = false;
      });
    }

    function reload() {
      vm.messagesSetting.skip = 0;
      vm.messagesSetting.before = null;

      return getMessages(vm.messagesSetting).then(function (posts) {
        replacePosts(posts);
      });
    }

    $scope.$on('post-select', function (event, data) {
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
    });

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

    function confirmforRemoveMulti(posts, place) {
      return $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
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
        // var get = true;
        for (var i = 0; i < vm.selectedPosts.length; i++) {
          NstSvcPostFactory.get(vm.selectedPosts[i]).then(function (post) {
            NstSvcPostFactory.remove(post.id, vm.currentPlaceId).then(function () {
              NstUtility.collection.dropById(post.places, vm.currentPlaceId);
              // toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from this Place.")));
              $rootScope.$broadcast('post-removed', {
                postId: post.id,
                placeId: vm.currentPlaceId
              });
              vm.selectedPosts.splice(0,1);

              // TODO increase decrease on other ways
              --vm.currentPlace.counters.posts;
              $scope.$broadcast('selected-length-change',{selectedPosts : vm.selectedPosts});

              if ( i === vm.selectedPosts.length - 1 ){
                NstSvcPlaceFactory.get(vm.currentPlaceId,true).then(function(p){
                  vm.currentPlace.counters.posts = p.counters.posts;
                });
              }
            }).catch(function () {
              toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
            });
          });
        }
        // var undoFlag = false;
        // toastr.warning(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from this Place.")), {
        //   onHidden: actioner,
        //   extraData : {
        //     undo : undoFunction
        //   }
        // });
        // window.actionsGC.push(action);
        // var selecteds = vm.selectedPosts.slice(0);

        // // Unselect posts
        // vm.selectedPosts = [];
        // $scope.$broadcast('selected-length-change', {
        //   selectedPosts: vm.selectedPosts
        // });

        
        // // temporary hide post card from view
        // selecteds.forEach(function(post) {
        //   $rootScope.$broadcast('post-hide', {
        //     postId: post,
        //     placeId: vm.currentPlaceId
        //   });
        // });

        
        // function actioner() {
        //   action();
        //   window.actionsGC.splice(window.actionsGC.indexOf(action), 1);
        // }

        // function undoFunction() {
        //   undoFlag = true;
        //   window.actionsGC.splice(window.actionsGC.indexOf(action), 1);

        //   // make visible temporary hiden posts
        //   selecteds.forEach(function(post) {
        //     $rootScope.$broadcast('post-show', {
        //       postId: post,
        //       placeId: vm.currentPlaceId
        //     });
        //   });
        // }

        // function action() {
        //   if ( undoFlag ) {
        //     return;
        //   }
        //   for (var i = 0; i < selecteds.length; i++) {
        //     NstSvcPostFactory.get(selecteds[i]).then(function (post) {
        //       NstSvcPostFactory.remove(post.id, vm.currentPlaceId).then(function () {
        //         NstUtility.collection.dropById(post.places, vm.currentPlaceId);
        //         // toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from this Place.")));
                
        //         $rootScope.$broadcast('post-removed', {
        //           postId: post.id,
        //           placeId: vm.currentPlaceId
        //         });

        //         // TODO increase decrease on other ways
        //         --vm.currentPlace.counters.posts;

        //         // Last item : updates the counter
        //         if (i === selecteds.length - 1) {
        //           NstSvcPlaceFactory.getFresh(vm.currentPlaceId).then(function (p) {
        //             vm.currentPlace.counters.posts = p.counters.posts;
        //           });
        //         }
        //       }).catch(function () {
        //         toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
        //       });
        //     });
        //   }

        // }

      });
    }

    function moveMulti($event) {
      $event.preventDefault();
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
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

          if (result.failed.length > 0) {
            vm.tempBanPlaces = [];
            vm.tempBanPlaces.push(result.toPlace);
          }

          // Remove item fram staged posts
          var index = vm.selectedPosts.indexOf(result.success[i]);
          vm.selectedPosts.splice(index, 1);
          --vm.currentPlace.counters.posts;
          // what is this ?  and TODO : optimise for multi   :
          // NstUtility.collection.replaceById(vm.post.places, result.fromPlace.id, result.toPlace);
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
        promise = NstSvcPostFactory.getFavoriteMessages(settings, cacheHandler);
      } else {
        promise = NstSvcPostFactory.getPlaceMessages(settings, vm.currentPlaceId, cacheHandler);
      }

      promise.then(function (posts) {
        vm.reachedTheEnd = posts.length < settings.limit;
        vm.noMessages = vm.messages.length === 0 && posts.length === 0;
      }).catch(function () {
        vm.error = true;
      }).finally(function () {
        vm.loading = false;
      });

      return promise;
    }

    function getLastMessageTime() {

      var last = _.last(vm.messages);

      if (!last) {
        return null;
      }
      var lastDate = !vm.isSent && NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY == vm.messagesSetting.sort ? last.lastUpdate : last.timestamp;
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

    function loadPlace() {
      if (!vm.currentPlaceId) {
        return;
      }

      NstSvcPlaceFactory.get(vm.currentPlaceId, true).then(function (place) {
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
          if (NstSvcAuth.user && NstSvcAuth.user.id == vm.currentPlaceId.split('.')[0]) {
            vm.isPersonal = true;
          }
          vm.isPlaceMessage = true;
          break;
      }
    }

    $scope.$watch(function (){
      return vm.unreadCount
    },function() {
      if (vm.unreadCount === 0) {
        vm.isUnreadMode = false;
      }
    })

    $scope.$on('$destroy', function () {
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

    $rootScope.$on('reload-counters', function () {
      loadUnreadPostsCount();
    });
  }

})();
