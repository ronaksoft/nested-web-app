/**
 * @file app/messages/post-card.controller.js
 * @author robzizo < me@robzizo.ir >
 * @description controller for post card directive
 *              Documented by:          robzizo
 *              Date of documentation:  2017-07-25
 *              Reviewed by:            -
 *              Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostCardController', PostCardController);

  function PostCardController($state, $log, $timeout, $stateParams, $rootScope, $scope, $filter, $window, $sce, $uibModal,
                              _, moment, toastr,
                              NST_EVENT_ACTION, NST_PLACE_ACCESS, NST_POST_EVENT, SvcCardCtrlAffix,
                              NstSvcSync, NstVmFile, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory,
                              NstSvcAuth, NstUtility, NstSvcPostInteraction, NstSvcTranslation, NstSvcLogger) {
    var vm = this;

    var commentBoardMin = 3,
      commentBoardMax = 99,
      commentBoardMin = {
        limit: 8,
        date: null
      },
      chaingStack = [],
      newCommentIds = [],
      unreadCommentIds = [],
      focusOnSentTimeout = null,
      eventReferences = [];

    vm.remove = _.partial(remove, vm.post);
    // vm.toggleRemoveFrom = toggleRemoveFrom;
    vm.retract = retract;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.showTrustedBody = showTrustedBody;
    vm.markAsRead = markAsRead;
    vm.switchToPostCard = switchToPostCard;
    vm.onAddComment = onAddComment;
    vm.replyAll = replyAll;
    vm.forward = forward;
    vm.replyToSender = replyToSender;
    vm.viewFull = viewFull;
    vm.setBookmark = setBookmark;
    vm.loadNewComments = loadNewComments;
    vm.attachPlace = attachPlace;
    vm.toggleRecieveNotification = toggleRecieveNotification;
    vm.seenBy = seenBy;
    vm.move = move;
    vm.watched = false;
    vm.toggleMoveTo = toggleMoveTo;
    vm.untrustSender = untrustSender;
    vm.alwaysTrust = alwaysTrust;
    vm.addLabels = addLabels;

    vm.expandProgress = false;
    vm.body = null;
    vm.chainView = false;
    vm.unreadCommentsCount = 0;
    vm.isChecked = false;
    vm.isCheckedForce = false;
    vm.postSenderIsCurrentUser = false;
    // vm.isPlaceFilter = false;

    isPlaceFeed();
    $scope.$parent.$parent.affixObserver = 1;

    vm.getPlacesWithRemoveAccess = getPlacesWithRemoveAccess;
    vm.getPlacesWithControlAccess = getPlacesWithControlAccess;
    vm.hasPlacesWithControlAccess = hasPlacesWithControlAccess;
    vm.hasDeleteAccess = hasDeleteAccess;
    vm.hasHiddenCommentAccess = hasPlacesWithControlAccess();

    /**
     * Checks post card is in chains view
     */
    if (vm.mood === 'chain') {
      vm.chainView = true;
    }

    /**
     * reaply all places that post have been shared
     *
     * @param {any} $event
     */
    function replyAll($event) {
      $event.preventDefault();
      $state.go('app.compose-reply-all', {postId: vm.post.id}, {notify: false});
    }

    /**
     * forward message, actully it adds post content to the compose with empty recipient
     *
     * @param {any} $event
     */
    function forward($event) {
      $event.preventDefault();
      $state.go('app.compose-forward', {postId: vm.post.id}, {notify: false});
    }

    /**
     * Reply to post sender
     *
     * @param {any} $event
     */
    function replyToSender($event) {
      $event.preventDefault();
      $state.go('app.compose-reply-sender', {postId: vm.post.id}, {notify: false});
    }

    /**
     * opens modal post view
     *
     * @param {any} $event
     */
    function viewFull($event) {
      $event.preventDefault();
      // Mark post as read
      markAsRead();
      // helper for opening post view inside another post view
      if ($state.current.name !== 'app.message') {
        $state.go('app.message', {postId: vm.post.id, trusted: vm.post.isTrusted}, {notify: false});
      } else {
        var reference = $scope.$emit('post-view-target-changed', {postId: vm.post.id});
        eventReferences.push(reference);
      }
    }

    /**
     * add/remove user from post watchers list
     * by adding to watchers list, user gets all notifications of post
     */
    function toggleRecieveNotification() {
      vm.watched =! vm.watched;
      NstSvcPostFactory.setNotification(vm.post.id, vm.watched);
    }


    /**
     * @function
     * mark post as read if it wasnt before.
     * @borrows NstSvcPostFactory
     */
    function markAsRead() {
      if (!vm.post.read) {
        vm.post.read = true;
        NstSvcPostFactory.read(vm.post.id).catch(function (err) {
          $log.debug('MARK AS READ :' + err);
        });
      }
    }

    /**
     * @function
     * add/remove post to bookmarked posts of user
     * @borrows NstSvcPostFactory
     */
    function setBookmark(setBookmark) {
      vm.post.pinned = setBookmark;
      if (setBookmark) {
        NstSvcPostFactory.pin(vm.post.id).catch(function () {
          vm.post.pinned = !setBookmark;
        });
      } else {
        NstSvcPostFactory.unpin(vm.post.id).catch(function () {
          vm.post.pinned = !setBookmark;
        });
      }
    }

    /**
     * remove the post from epecified place by place manager
     * after accepting the warning prompt .
     * it raises an event to listerens and
     * also removes the post from selected posts
     * @param {object} post
     * @param {string} place
     */
    function remove(post, place) {
      confirmforRemove(post, place).then(function (agree) {
        if (!agree) {
          return;
        }

        NstSvcPostFactory.remove(post.id, place.id).then(function () {
          NstUtility.collection.dropById(post.places, place.id);
          toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from Place {0}."), place.name));
          $rootScope.$broadcast('post-removed', {
            postId: post.id,
            placeId: place.id
          });
          vm.isChecked = false;
          $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
        });
      });
    }

    // function toggleRemoveFrom(show) {
    //   vm.showRemoveFrom = show;
    // }

    /**
     * warning propt for removing post from place
     * @param {any} post
     * @param {any} place
     * @returns  {Promise}
     * @function {{FunctionName}}{{}}
     */
    function confirmforRemove(post, place) {
      return $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/remove-from-confirm.html',
        controller: 'RemoveFromConfirmController',
        controllerAs: 'ctrl',
        resolve: {
          post: function () {
            return post;
          },
          place: function () {
            return place;
          }
        }
      }).result;
    }

    /**
     * @function
     * retract message for senders with circumated time
     * also removes the post from selected posts
     */
    function retract() {
      vm.retractProgress = true;
      NstSvcPostInteraction.retract(vm.post).finally(function () {
        vm.retractProgress = false;
        vm.isChecked = false;
        $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
      });
    }

    /**
     * @function
     * renders whole contents of post
     * and mark post as read
     * also notifies `affixer` service to do appropriate action
     */
    function expand() {
      vm.expandProgress = true;
      NstSvcPostFactory.get(vm.post.id, true).then(function (post) {
        vm.expandProgress = false;
        vm.orginalPost = post;
        vm.body = post.body;
        vm.resources = post.resources;
        vm.isExpanded = true;
        if (!post.read) {
          markAsRead();
        }

        if (vm.post.isTrusted || Object.keys(post.resources).length == 0) {
          showTrustedBody();
        }
        ++$scope.$parent.$parent.affixObserver;
        SvcCardCtrlAffix.change();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error occured while tying to show the post full body.'));
      }).finally(function () {
        vm.expandProgress = false;
      });
    }

    /**
     * replace the post content with summorized version of that
     * also scrolls the page to the top of the post card on long posts
     *
     * @param {any} e
     */
    function collapse(e) {
      if (vm.post.ellipsis) {
        var el = angular.element(e.currentTarget);
        var elParent = el.parents('post-card')[0];
        var elParentH = el.parents('post-card').height();
        var postCardOffTOp = elParent.offsetTop;
        var scrollOnCollapseCase = document.documentElement.clientHeight < elParentH;
        var postCollaspeTimeout = scrollOnCollapseCase ? 300 : 0;
        if (scrollOnCollapseCase) {
          $timeout(function(){
            SvcCardCtrlAffix.change();
          },300)
          $('html, body').animate({
            scrollTop: postCardOffTOp
          }, 300, 'swing', function () {
          });
        }
        $timeout(function () {
          vm.isExpanded = false;
          vm.body = vm.post.body;
        }, postCollaspeTimeout)
      } else {
        vm.body = vm.post.body;
        vm.isExpanded = false;
        SvcCardCtrlAffix.change();
      }


    }

    /**
     * @function
     * attach a place as recipients of post by a using `attachPlace` modal
     * and updates the post model
     */
    function attachPlace() {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/attach-place.html',
        controller: 'AttachPlaceController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          },
          postPlaces: function () {
            return vm.post.places;
          }
        }
      }).result.then(function (attachedPlaces) {
        _.forEach(attachedPlaces, function (place) {
          if (!_.some(vm.post.places, {id: place.id})) {
            vm.post.places.push(place);
          }
        });

        NstSvcPlaceFactory.getAccess(_.map(attachedPlaces, 'id')).then(function (accesses) {
          _.forEach(accesses, function (item) {
            var postPlace = _.find(vm.post.places, {id: item.id});
            if (postPlace) {
              postPlace.accesses = item.accesses;
            }
          });
        });

      });
    }

    /**
     * shows the `seenBy` Modal for post sender
     */
    function seenBy() {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/seen-by.html',
        controller: 'SeenByController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          }
        }
      }).result.then(function () {});
    }

    /**
     * Move post from a place to another place
     * by a `MovePlace` modal .
     * also removes the post from selecterd post
     * and raise an event for listeners
     * @param {any} selectedPlace
     * @borrows $uibModal
     */
    function move(selectedPlace) {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/move.html',
        controller: 'MovePlaceController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          },
          selectedPlace: function () {
            return selectedPlace;
          },
          postPlaces: function () {
            return vm.post.places;
          },
          multi : false
        }
      }).result.then(function (result) {
        $scope.$emit('post-moved', {
          postId: vm.post.id,
          toPlace: result.toPlace,
          fromPlace: result.fromPlace
        });
        vm.isChecked = false;
        $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
        NstUtility.collection.replaceById(vm.post.places, result.fromPlace.id, result.toPlace);
      });
    }

    /**
     * @deprecated
     */
    function toggleMoveTo(show) {
      vm.showMoveTo = show;
    }

    /**
     * replace trusted post body with post body
     */
    function showTrustedBody() {
      if (vm.orginalPost) {
        vm.body = vm.orginalPost.getTrustedBody();
      } else {
        vm.body = vm.post.getTrustedBody();
      }

      vm.post.isTrusted = true;
    }

    function alwaysTrust() {
      showTrustedBody();
      NstSvcUserFactory.trustEmail(vm.post.sender.id).then(function() {
        vm.post.isTrusted = true;
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error has occured in trusting the sender'));
      });
    }

    /**
     * Loads new comments that app informed from push notifications
     * also reloads the post counters
     * @param {any} $event
     */
    function loadNewComments($event) {
      if ($event) $event.preventDefault();
      eventReferences.push($scope.$broadcast('post-load-new-comments', { postId: vm.post.id }));
      reloadCounters();
      vm.unreadCommentsCount = 0;
    }

    /**
     * determines the place delete access
     * needs for remove from action
     * @param {object} place
     * @returns
     */
    function hasDeleteAccess(place) {
      return place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
    }

    /**
     * Event handler for post full view event
     * 1. reaload counters
     * 2. set unread comments count to zero
     */
    eventReferences.push($rootScope.$on('post-viewed', function (e, data) {
      if (data.postId !== vm.post.id) return;

      reloadCounters();
      vm.unreadCommentsCount = 0;
    }));

    /**
     * Event handler for bookmarking post
     * set the value to the model
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT.BOOKMARKED, function (e, data) {
      if (data.postId === vm.post.id) {
        vm.post.pinned = true;
      }
    }));

    /**
     * Event handler for unbookmarking post
     * set the value to the model
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT.UNBOOKMARKED, function (e, data) {
      if (data.postId === vm.post.id) {
        vm.post.pinned = false;
      }
    }));

    /**
     * Event handler for closing post full view
     * updates model due to post view data like comments
     * and reload counters for ensuring the right counts displaying
     */
    eventReferences.push($rootScope.$on('post-modal-closed', function (event, data) {
      if (data.postId === vm.post.id) {
        event.preventDefault();
        // replace last 3 comments and reset new comments counter
        vm.unreadCommentsCount = 0;
        vm.post.comments = data.comments;
        // update the post counters
        reloadCounters();
      }
    }));

    /**
     * reload all post counter
     * @borrows NstSvcPostFactory
     */
    function reloadCounters() {
      NstSvcPostFactory.getCounters(vm.post.id).then(function (counters) {
        vm.post.counters = counters;
      });
    }

    /**
     * Raise event for select/unselect post
     * `Messages` page and other posts listens to this
     */
    $scope.$watch(function(){
      return vm.isChecked;
    },function(){
      $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
    });

    /**
     * Listen to the selected posts of app for changing the checkbox display method
     */
    $scope.$on('selected-length-change',function(e, v){
      if ( v.selectedPosts.length > 0) {
        vm.isCheckedForce = true;
      } else {
        vm.isCheckedForce = false;
        vm.isChecked = false;
      }

      // for ( var i = 0; i < v.selectedPosts; i++ ) {
      //     var index = v.selectedPostsArray.indexOf(vm.placeId);
      //     if ( index > -1 ) {

      //     } else {
      //       vm.isChecked = false;
      //     }
      // }
    });

    /**
     * Event handler new comment add push and Checks
     * the activity is belong to this post for futhur actions or not
     * (need more document)
     */
    eventReferences.push($rootScope.$on(NST_EVENT_ACTION.COMMENT_ADD, function (e, data) {

      if (vm.post.id !== data.activity.post.id) {
        return;
      }

      var senderIsCurrentUser = NstSvcAuth.user.id == data.activity.comment.sender.id;
      if (senderIsCurrentUser) {
        loadNewComments();
        if (!_.includes(newCommentIds, data.activity.id)) {
          newCommentIds.push(data.activity.id);
          vm.post.counters.comments++;
        }
      } else {
        if (!_.includes(unreadCommentIds, data.activity.id)) {
          vm.unreadCommentsCount++;
          unreadCommentIds.push(data.activity.id);
        }
      }
    }));

    /**
     * Event listener for read all posts
     * and updates the model
     */
    eventReferences.push($rootScope.$on('post-read-all', function (e, data) {
      vm.post.read = true;
    }));


    // initializing
    (function () {
      /**
       * @var currentUserIsSender
       * check the post sender is the logged in user
       */
      vm.currentUserIsSender = NstSvcAuth.user.id == vm.post.sender.id;

      /**
       * @var isForwarded
       * check the post is forwrded
       */
      vm.isForwarded = !!vm.post.forwardFromId;

      /**
       * @var isReplyed
       * check the post is replyed
       */
      vm.isReplyed = !!vm.post.replyToId;

      /**
       * @var isReplyed
       * check the user is in post watch list
       */
      vm.watched = vm.post.watched;

      /**
       * @var hasOlderComments
       * determine the post have unloaded comments or not
       */
      vm.hasOlderComments = (vm.post.counters.comments && vm.post.comments) ? vm.post.counters.comments > vm.post.comments.length : false;
      vm.body = vm.post.body;
      vm.orginalPost = vm.post;

      /**
       * checks the post body content is trusted ( displaying images )
       */
      // alert('vm.post' + vm.post.trusted);
      if (vm.post.isTrusted) {
        showTrustedBody();
      }

      /**
       * Assign and define current place if exists
       */
      if ($stateParams.placeId) {
        vm.currentPlace = _.filter(vm.post.places, function (place) {
          return place.id === $stateParams.placeId;
        })[0];
      }

      // TODO : ( docuemnt this)
      if (vm.addOn) {
        vm.isExpanded = true;
      }

      /**
       * Event handler for comment remove event of post
       *
       */
      eventReferences.push($scope.$on('comment-removed', function (event, data) {
        if (vm.post.id === data.postId) {
          vm.post.counters.comments--;
        }
      }));

      /**
       * Event handler for opening attachment view event to mark it as seen
       */
      eventReferences.push($scope.$on('post-attachment-viewed', function (event, data) {
        if (vm.post.id === data.postId && !vm.post.read) {
          markAsRead();
        }
      }));

      // assign placesWithRemoveAccess
      vm.placesWithRemoveAccess = getPlacesWithRemoveAccess();
      // assign placesWithControlAccess
      vm.placesWithControlAccess = getPlacesWithControlAccess();

      //FIXME:: fix this item
      /**
       * Make targets of post body anchors to `_blank`
       */
      setTimeout(function () {
        $(".post-body a").attr("target", "_blank");
      }, 1000);

      // sometimes the post attachments does not have id and we did not find the problem
      // so we are trying to get the post and replace it with the previous corrupted post
      if (_.some(vm.post.attachments, function (attachment) {
        return !attachment.id;
      })) {
        NstSvcLogger.error('Found that the post model has an attachment with empty id!');
        vm.post.attachments = [];
        NstSvcPostFactory.get(vm.post.id, true).then(function (post) {
          vm.post.attachments = post.attachments;
        });
      }
    })();

    /**
     * clear event registers, timeout anad intervals on
     * destroying controller
     */
    $scope.$on('$destroy', function () {
      if (focusOnSentTimeout) {
        $timeout.cancel(focusOnSentTimeout);
      }

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

    /**
     * add / remove labels of post
     * @param {any} items
     */
    function addLabels(items){
      var removeItems = _.difference(vm.post.labels, items);
      var addItems = _.difference(items, vm.post.labels);
      addItems.forEach(function(o){
        var id = o._id || o.id;
        NstSvcPostFactory.addLabel(vm.post.id, id).then(function() {
          // console.log(o);
          // vm.post.labels.push(o);
        });
      });
      removeItems.forEach(function(o){
        var id = o._id || o.id;
        NstSvcPostFactory.removeLabel(vm.post.id, id).then(function() {
          // _.remove(vm.post.labels, function(n) {
          //   var id1 =  n.id || n._id;
          //   var id2 =  o.id || o._id;
          //   console.log(id1, id2);
          //   return id1 === id2
          // });
        });
      });
      vm.post.labels = items;
    }

    /**
     * open post chains
     * (needs more documentation)
     */
    function switchToPostCard() {
      // tells the parent scope to open me
      var reference = $scope.$emit('post-chain-expand-me', {postId: vm.post.id});
      eventReferences.push(reference);
      ++$scope.$parent.$parent.affixObserver;
    }

    /**
     * Mark post as read on comment submiting
     */
    function onAddComment() {
      if (!vm.post.read) {
        markAsRead();
      }
    }

    /**
     * Place messages route recognizer
     * @returns
     */
    function isPlaceFeed() {
      if ($state.current.name === 'app.messages-favorites' ||
          $state.current.name === 'app.messages-sorted' ||
          $state.current.name === 'app.messages-favorites-sorted') {
        return vm.isPlaceFilter = true;
      }
      return vm.isPlaceFilter = false;
    }

    /**
     * All places of post that the user have remove access
     * @returns {Array}
     */
    function getPlacesWithRemoveAccess() {
      return _.filter(vm.post.places, function (place) {
        return place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
      });
    }

    /**
     * All places of post that the user have controll access
     * @returns {Array}
     */
    function getPlacesWithControlAccess() {
      return _.filter(vm.post.places, function (place) {
        return place.hasAccess(NST_PLACE_ACCESS.CONTROL);
      });
    }

    /**
     * determines user have controll access in any place of post.
     * @returns {boolean}
     */
    function hasPlacesWithControlAccess() {
      return _.some(vm.post.places, function (place) {
        return place.hasAccess(NST_PLACE_ACCESS.CONTROL);
      });
    }

    function untrustSender() {
      NstSvcUserFactory.untrustEmail(vm.post.sender.id).then(function () {
        vm.post.isTrusted = false;
        toastr.success(NstSvcTranslation.get(NstUtility.string.format('Email address {0} has just been removed from the trusted list.', vm.post.sender.id)));
      }).catch(function (){
        toastr.error(NstSvcTranslation.get(NstUtility.string.format('An error occured while removing {0} from the trusted list.', vm.post.sender.id)));
      });
    }
  }

})();
