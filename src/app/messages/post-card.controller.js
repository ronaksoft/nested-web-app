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

  function PostCardController($state, $q, $log, $timeout, $stateParams, $rootScope, $scope, $uibModal, $location, $anchorScroll, $uibModalStack,
                              _, toastr, $sce, NstSvcTaskUtility, NST_CONFIG, NstSvcI18n, NstSvcViewStorage, md5, NstSvcPostActivityFactory,
                              NST_PLACE_EVENT_ACTION, NST_POST_EVENT_ACTION, NST_PLACE_ACCESS, NST_POST_EVENT, SvcCardCtrlAffix, NstSvcAppFactory,
                              NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSearchQuery, NstSvcModal,
                              NstSvcAuth, NstUtility, NstSvcPostInteraction, NstSvcTranslation, NstSvcLogger, $) {
    var vm = this;

    var newCommentIds = [],
      unreadCommentIds = [],
      focusOnSentTimeout = null,
      eventReferences = [];

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    vm.remove = _.partial(remove, vm.post);
    vm.toggleRemoveFrom = toggleRemoveFrom;
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
    vm.attachPlace = attachPlace;
    vm.toggleRecieveNotification = toggleRecieveNotification;
    vm.seenBy = seenBy;
    vm.move = move;
    vm.createRelatedTask = createRelatedTask;
    vm.watched = false;
    vm.toggleMoveTo = toggleMoveTo;
    vm.untrustSender = untrustSender;
    vm.alwaysTrust = alwaysTrust;
    vm.addLabels = addLabels;
    vm.isFeed = isFeed;
    vm.labelClick = labelClick;
    vm.loadNewComments = loadNewComments;
    vm.showAllPlacesAsRow = showAllPlacesAsRow;
    vm.isPostView = isPostView();
    vm.iframeId = '';
    vm.postPlacesViewNumber = 3;

    vm.expandProgress = false;
    vm.body = null;
    vm.chainView = false;
    vm.unreadCommentsCount = 0;
    vm.isChecked = false;
    vm.isCheckedForce = false;
    vm.setIsCheckedWatchOffTemporary = false;
    vm.postSenderIsCurrentUser = false;
    vm.haveAnyLabelAcess = true; // TODO Read this from label cache
    vm.totalRecipients = [];
    vm.canGoLastState = true;
    vm.mergePostCardVariable = mergePostCardVariable;
    vm.togglePinPost = setPin;
    vm.notSpamPost = notSpam;
    vm.removeSpamPost = removeSpam;

    isPlaceFeed();
    notifyObserver();

    function notifyObserver() {
      if ($scope.$parent.$parent.$parent.affixObserver || $scope.$parent.$parent.$parent.affixObserver === 0) {
        ++$scope.$parent.$parent.$parent.affixObserver;
      }
    }

    vm.getPlacesWithRemoveAccess = getPlacesWithRemoveAccess;
    vm.getPlacesWithControlAccess = getPlacesWithControlAccess;
    vm.hasPlacesWithControlAccess = hasPlacesWithControlAccess;
    vm.hasDeleteAccess = hasDeleteAccess;
    vm.hasHiddenCommentAccess = hasPlacesWithControlAccess();

    vm.goToPlace = goToPlace;

    function getUserData() {
      var user = NstSvcAuth.user || {id: '_'};
      var msgId = vm.post.id;
      var app = NST_CONFIG.DOMAIN;
      var locale = NstSvcI18n.selectedLocale;
      var darkMode = NstSvcViewStorage.get('nightMode');
      if (darkMode == false || darkMode === 'no') {
        darkMode = false;
      } else {
        darkMode = true;
      }
      return {
        userId: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName,
        msgId: msgId,
        app: app,
        locale: locale,
        dark: darkMode
      }
    }

    function createHash(data) {
      var str = JSON.stringify(data);
      str = encodeURIComponent(str).split('%').join('');
      return md5.createHash(str);
    }

    function sendIframeMessage(cmd, data) {
      var msg = {
        cmd: cmd,
        data: data
      };
      var hash = createHash(msg);
      msg.hash = hash;
      if (!vm.post.iframeObj) {
        if (isPostView()) {
          vm.iframeId = 'iframe-' + vm.post.id + '-post-view';
        } else {
          vm.iframeId = 'iframe-' + vm.post.id;
        }
        vm.post.iframeObj = document.getElementById(vm.iframeId);
      }
      if (!vm.post.iframeObj.contentWindow) {
        return;
      }
      vm.post.iframeObj.contentWindow.postMessage(JSON.stringify(msg), '*');
    }

    function isHashValid(data) {
      var packetHash = data.hash;
      delete data.hash;
      var hash = createHash(data);
      if (hash === packetHash) {
        return true;
      } else {
        return false;
      }
    }

    var iframeOnMessage;

    if (vm.post.iframeUrl) {
      if (isPostView()) {
        vm.iframeId = 'iframe-' + vm.post.id + '-post-view';
      } else {
        vm.iframeId = 'iframe-' + vm.post.id;
      }
      $timeout(function () {
        vm.post.iframeObj = document.getElementById(vm.iframeId);
        var userData = getUserData();
        iframeOnMessage = function (e) {
          if (vm.post.iframeUrl.indexOf(e.origin) === -1) {
            return;
          }
          var data = JSON.parse(e.data);
          if (!isHashValid(data)) {
            return
          }
          if (data.url === vm.post.iframeUrl) {
            switch (data.cmd) {
              case 'getInfo':
                sendIframeMessage('setInfo', userData);
                break;
              case 'setSize':
                // vm.post.iframeObj.style.width = data.data.width + 'px';
                vm.post.iframeObj.style.cssText = 'height: ' + data.data.height + 'px !important';
                break;
              case 'setNotif':
                if (['success', 'info', 'warning', 'error'].indexOf(data.data.type) > -1) {
                  toastr[data.data.type](data.data.message);
                }
                break;
              case 'createToken':
                NstSvcAppFactory.createToken(data.data.clientId).then(function (res) {
                  sendIframeMessage('setLoginInfo', {
                    token: data.data.token,
                    appToken: res.token,
                    appDomain: userData.app,
                    username: userData.userId,
                    fname: userData.fname,
                    lname: userData.lname,
                    email: userData.email
                  });
                }).catch(function () {
                  toastr.warning(NstSvcTranslation.get('Can not create token for app: {0}').replace('{0}', data.data.clientId));
                });
                break;
              default:
                break;
            }
          }
        };
        window.addEventListener('message', iframeOnMessage);
        eventReferences.push($rootScope.$on('toggle-theme', function (event, data) {
          sendIframeMessage('setTheme', data);
        }));
      }, 500);
    }

    /**
     * Checks post card is in chains view
     */
    if (vm.mood === 'chain') {
      vm.chainView = true;
      vm.postPlacesViewNumber = 50;
    }

    /**
     * reaply all places that post have been shared
     *
     * @param {any} $event
     */
    function replyAll($event) {
      $event.preventDefault();
      if (isPostView()) {
        $scope.$parent.$parent.$dismiss(true);
      }
      $state.go('app.compose-reply-all', {
        postId: vm.post.id
      }, {
        notify: false
      });
    }

    /**
     * forward message, actully it adds post content to the compose with empty recipient
     *
     * @param {any} $event
     */
    function forward($event) {
      $event.preventDefault();
      if (isPostView()) {
        $scope.$parent.$parent.$dismiss(true);
      }
      $state.go('app.compose-forward', {
        postId: vm.post.id
      }, {
        notify: false
      });
    }

    /**
     * Reply to post sender
     *
     * @param {any} $event
     */
    function replyToSender($event) {
      $event.preventDefault();
      if (isPostView()) {
        $scope.$parent.$parent.$dismiss(true);
      }
      $state.go('app.compose-reply-sender', {
        postId: vm.post.id
      }, {
        notify: false
      });
    }

    /**
     * opens modal post view
     *
     * @param {any} $event
     */
    function viewFull($event) {
      if (vm.post.spam) {
        return;
      }
      $event.preventDefault();
      // Mark post as read
      markAsRead();
      // helper for opening post view inside another post view
      if ($state.current.name !== 'app.message') {
        $state.go('app.message', {
          postId: vm.post.id,
          trusted: vm.post.isTrusted
        }, {
          notify: false
        });
      } else {
        var reference = $scope.$emit('post-view-target-changed', {
          postId: vm.post.id
        });
        eventReferences.push(reference);
      }
    }

    /**
     * add/remove user from post watchers list
     * by adding to watchers list, user gets all notifications of post
     */
    function toggleRecieveNotification() {
      vm.watched = !vm.watched;
      NstSvcPostFactory.setNotification(vm.post.id, vm.watched);
    }


    /**
     * @function
     * mark post as read if it wasnt before.
     * @borrows NstSvcPostFactory
     */
    function markAsRead() {
      if (vm.post.spam) {
        return;
      }
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
      vm.post.bookmarked = setBookmark;
      if (setBookmark) {
        try {
          NstSvcPostFactory.pin(vm.post.id).catch(function () {
            vm.post.bookmarked = !setBookmark;
          });
        } catch (e) {
          vm.post.bookmarked = !setBookmark;
        }
      } else {
        try {
          NstSvcPostFactory.unpin(vm.post.id).catch(function () {
            vm.post.bookmarked = !setBookmark;
          });
        } catch (e) {
          vm.post.bookmarked = !setBookmark;
        }
      }
    }

    /**
     * @function
     * add/remove post to pinned post of place
     * @borrows NstSvcPostFactory
     */
    function setPin() {
      if (!vm.post.pinned) {
        NstSvcPlaceFactory.pinPost(vm.thisPlace, vm.post.id).then(function () {
          vm.post.pinned = true;
          $rootScope.$broadcast('pin-to-place-toggled', {
            pinned: true,
            id: vm.post.id
          });
        });
      } else {
        NstSvcPlaceFactory.unpinPost(vm.thisPlace, vm.post.id).then(function () {
          vm.post.pinned = false;
          $rootScope.$broadcast('pin-to-place-toggled', {
            pinned: false,
            id: vm.post.id
          });
        });
      }
    }

    /**
     * @function
     * removes the post from spam
     * @borrows NstSvcPostFactory
     */
    function notSpam() {
      NstSvcPostFactory.notSpam(vm.post.id).then(function () {
        $rootScope.$broadcast('post-removed', {
          postId: vm.post.id,
        });
      });
    }

    /**
     * @function
     * removes the spam
     * @borrows NstSvcPostFactory
     */
    function removeSpam() {
      NstSvcTaskUtility.promptModal({
        title: NstSvcTranslation.get('Remove Spam'),
        body: NstSvcTranslation.get('Are you sure?'),
        confirmText: NstSvcTranslation.get('Yes'),
        confirmColor: 'red',
        cancelText: NstSvcTranslation.get('Cancel')
      }).then(function () {
        NstSvcPostFactory.removeSpam(vm.post.id).then(function () {
          $rootScope.$broadcast('post-removed', {
            postId: vm.post.id,
          });
        });
      });
    }

    /**
     * remove the post from specified place by place manager
     * after accepting the warning prompt .
     * it raises an event to listeners and
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

          createTotalPostRecipients();
          $scope.$emit('post-select', {
            postId: vm.post.id,
            isChecked: vm.isChecked
          });
        }).catch(function () {
          toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
        });
      });
    }

    function toggleRemoveFrom(show) {
      vm.showRemoveFrom = show;
    }

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
        // backdropClass: 'comdrop',
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
        $scope.$emit('post-select', {
          postId: vm.post.id,
          isChecked: vm.isChecked
        });
        if (isPostView()) {
          $scope.$parent.$parent.$dismiss();
        }
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

        if (vm.post.isTrusted || !post.resources || Object.keys(post.resources).length == 0) {
          showTrustedBody();
        }
        notifyObserver();
        targetBlankHrefs();
      }).catch(function () {
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
        // backdropClass: 'comdrop',
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
          if (!_.some(vm.post.places, {
            id: place.id
          })) {
            vm.post.places.push(place);
          }
        });

        createTotalPostRecipients();
        NstSvcPlaceFactory.getAccess(_.map(attachedPlaces, 'id')).then(function (accesses) {
          _.forEach(accesses, function (item) {
            var postPlace = _.find(vm.post.places, {
              id: item.id
            });
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
        // backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/seen-by.html',
        controller: 'SeenByController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          }
        }
      }).result.then(function () {
      });
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
        // backdropClass: 'comdrop',
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
          multi: false
        }
      }).result.then(function (result) {
        $scope.$emit('post-moved', {
          postId: vm.post.id,
          toPlace: result.toPlace,
          fromPlace: result.fromPlace
        });
        NstSvcPlaceFactory.getFresh(selectedPlace);
        NstSvcPlaceFactory.getFresh(result.toPlace.id);
        vm.isChecked = false;
        createTotalPostRecipients();
        $scope.$emit('post-select', {
          postId: vm.post.id,
          isChecked: vm.isChecked
        });
        NstUtility.collection.replaceById(vm.post.places, result.fromPlace.id, result.toPlace);
      });
    }

    /**
     * creates a related task
     */
    function createRelatedTask() {
      $state.go('app.task.glance');
      var callbackUrl = {
        name: $state.current.name,
        params: $stateParams
      };
      if (isPostView()) {
        $scope.$parent.$parent.$dismiss(true);
      }
      $timeout(function () {
        $rootScope.$broadcast('create-related-task-from-post', {
          id: vm.post.id,
          callbackUrl: callbackUrl,
          init: {
            title: vm.post.subject,
            description: (typeof vm.post.preview === 'string') ? vm.post.preview.replace(/<(.|\n)*?>/g, '') : '',
            labels: vm.post.labels,
            attachments: vm.post.attachments
          }
        });
      }, 500);
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

    function alwaysTrust(trustDomain) {
      showTrustedBody();
      NstSvcUserFactory.trustEmail(vm.post.sender.id, trustDomain).then(function () {
        vm.post.isTrusted = true;
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error has occurred in trusting the sender'));
      });
    }

    /**
     * Loads new comments that app informed from push notifications
     * also reloads the post counters
     * @param {any} $event
     */
    function loadNewComments($event, scrollIntoView) {
      if ($event) $event.preventDefault();
      var data = {
        postId: vm.post.id,
        news: unreadCommentIds
      };
      if (scrollIntoView) {
        data.scrollIntoView = true;
      }
      /**
       * TODO :create hash events and stop listen check
       */
      $scope.$broadcast('post-load-new-comments', data);
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
      if (typeof place.hasAccess === 'function') {
        return place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
      } else {
        return false;
      }
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

    eventReferences.push($rootScope.$on('post-update', function (e, data) {
      if (data.id !== vm.post.id) return;

      vm.post = data;
    }));

    /**
     * Event handler for bookmarking post
     * set the value to the model
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT.BOOKMARKED, function (e, data) {
      if (data.postId === vm.post.id) {
        vm.post.bookmarked = true;
      }
    }));

    /**
     * Event handler for unbookmarking post
     * set the value to the model
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT.UNBOOKMARKED, function (e, data) {
      if (data.postId === vm.post.id) {
        vm.post.bookmarked = false;
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
        vm.post.labels = data.labels;
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
    eventReferences.push($scope.$watch(function () {
      return vm.isChecked;
    }, function () {
      if (!vm.setIsCheckedWatchOffTemporary) {
        $scope.$emit('post-select', {
          postId: vm.post.id,
          isChecked: vm.isChecked
        });
      }
    }));

    /**
     * assigned variables used in html rendering
     */
    eventReferences.push($scope.$watch(function () {
      return vm.post.places;
    }, function () {
      createTotalPostRecipients()
    }));

    function createTotalPostRecipients() {
      var concatArray = vm.post.places.slice(0);
      if (vm.post.recipients) {
        vm.post.recipients.forEach(function (i) {
          concatArray.push({
            id: i,
            name: i
          });
        });
      }
      vm.totalRecipients = _.uniqBy(concatArray, 'id');
    }

    /**
     * Listen to the selected posts of app for changing the checkbox display method
     */
    eventReferences.push($scope.$on('selected-length-change', function (e, v) {
      if (v.selectedPosts.length > 0) {
        vm.isCheckedForce = true;
        if (v.selectAll) {
          vm.setIsCheckedWatchOffTemporary = true;
          $timeout(function () {
            vm.setIsCheckedWatchOffTemporary = false
          }, 100);
          if (v.selectedPosts.indexOf(vm.post.id)) {
            vm.isChecked = true;
          }
        }
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
    }));

    /**
     * Event handler new comment add push and Checks
     * the activity belongs to this post for further actions or not
     * (need more document)
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_COMMENT_ADD, function (e, data) {
      if (vm.post.id !== data.activity.postId) {
        return;
      }
      newCommentIds.push(data.activity.comment.id);
      var senderIsCurrentUser = (NstSvcAuth.user.id === data.activity.actor.id);
      if (senderIsCurrentUser) {
        loadNewComments();
        // if (!_.includes(newCommentIds, data.activity.id)) {
        // vm.post.counters.comments++;
        // }
      } else {
        if (!_.includes(unreadCommentIds, data.activity.comment.id)) {
          vm.unreadCommentsCount++;
          unreadCommentIds.push(data.activity.comment.id);
        }
        // if($rootScope.inViewPost.id === vm.post.id || isPostView()) {
        if (isPostView()) {
          loadNewComments();
          unreadCommentIds = [];
        }
      }
    }));

    /**
     * Event handler for adding label
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_LABEL_ADD, function (e, data) {
      if (vm.post.id !== data.activity.postId) {
        return;
      }
      if (!_.some(vm.post.labels, {
        id: data.activity.label.id
      })) {
        vm.post.labels.push(data.activity.label);
      }
      NstSvcPostFactory.dropCacheById(data.activity.postId);
    }));

    /**
     * Event handler for removing label
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_LABEL_REMOVE, function (e, data) {
      if (vm.post.id !== data.activity.postId) {
        return;
      }
      var index = _.findIndex(vm.post.labels, {id: data.activity.label.id});
      if (index > -1) {
        vm.post.labels.splice(index);
      }
      NstSvcPostFactory.dropCacheById(data.activity.postId);
    }));

    /**
     * Event handler for editing post
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_EDITED, function (e, data) {
      if (vm.post.id !== data.activity.postId) {
        return;
      }
      vm.post = data.activity.post;
      NstSvcPostFactory.dropCacheById(data.activity.postId);
      if (vm.isExpanded) {
        NstSvcPostFactory.get(vm.post.id, true).then(function (post) {
          vm.body = post.body;
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('An error occurred while tying to show the post full body.'));
        });
      }
    }));

    /**
     * Event handler for moving place
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_MOVE, function (e, data) {
      if (vm.post.id !== data.activity.postId) {
        return;
      }
      if (!_.some(vm.post.places, {
        id: data.activity.newPlace.id
      })) {
        vm.post.places.push(data.activity.newPlace);
      }
      var index = _.findIndex(vm.post.places, {id: data.activity.oldPlace.id});
      if (index > -1) {
        vm.post.places.splice(index, 1);
      }
      NstSvcPostFactory.dropCacheById(data.activity.postId);
    }));

    /**
     * Event handler for attaching place
     */
    eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_ATTACH, function (e, data) {
      if (vm.post.id !== data.activity.postId) {
        return;
      }
      if (!_.some(vm.post.places, {
        id: data.activity.newPlace.id
      })) {
        vm.post.places.push(place);
      }
      NstSvcPostFactory.dropCacheById(data.activity.postId);
    }));

    /**
     * Event listener for read all posts
     * and updates the model
     */
    eventReferences.push($rootScope.$on('post-read-all', function () {
      vm.post.read = true;
    }));

    /**
     * Event listener for read all posts
     * and updates the model
     */
    // Uncomment for automatic loading comments
    // eventReferences.push($rootScope.$watch(function () {
    //   return $rootScope.inViewPost
    // }, function (v) {
    //   if (unreadCommentIds.length > 0 && v.id === vm.post.id) {
    //     loadNewComments();
    //     unreadCommentIds = [];
    //   }
    // }));

    /**
     * Make targets of post body anchors to `_blank`
     */
    function targetBlankHrefs() {
      setTimeout(function () {
        $(".post-body a").attr("target", "_blank");
      }, 1000);
    }

    // initializing
    (function () {
      /**
       * @var currentUserIsSender
       * check the post sender is the logged in user
       */
      vm.currentUserIsSender = NstSvcAuth.user.id == vm.post.sender.id;

      /**
       * @var isForwarded
       * check the post is forwrded\
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

      vm.goTo = function (posId) {
        // $location.hash(posId);
        document.querySelector('#' + posId).scrollIntoView({behavior: 'smooth'});
        // $anchorScroll();
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

      eventReferences.push($rootScope.$on(NST_POST_EVENT.READ, function (event, data) {
        if (data.postId === vm.post.id) {
          markAsRead();
        }
      }));

      // assign placesWithRemoveAccess
      vm.placesWithRemoveAccess = getPlacesWithRemoveAccess();
      // assign placesWithControlAccess
      vm.placesWithControlAccess = getPlacesWithControlAccess();

      targetBlankHrefs()


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

      NstSvcPlaceFactory.get(vm.thisPlace).then(function (place) {
        vm.placeRoute = place;
        vm.isPlaceManager = place.accesses.indexOf(NST_PLACE_ACCESS.CONTROL) > -1;
      })

    })();


    /**
     * add / remove labels of post
     * @param {any} items
     */
    function addLabels(items) {
      var removeItems = _.difference(vm.post.labels, items);
      var addItems = _.difference(items, vm.post.labels);
      removeItems.forEach(function (o) {
        var id = o._id || o.id;
        NstSvcPostFactory.removeLabel(vm.post.id, id).then(function () {
          _.remove(vm.post.labels, function (n) {
            var id1 = n.id || n._id;
            var id2 = o.id || o._id;
            // console.log(id1, id2);
            return id1 === id2
          });
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('an error occurred in removing label'));
        });
      });
      addItems.forEach(function (o) {
        var id = o._id || o.id;
        NstSvcPostFactory.addLabel(vm.post.id, id).then(function () {
          if (!_.some(vm.post.labels, {
            id: o.id
          })) {
            vm.post.labels.push(o);
          }
        }).catch(function (e) {
          // console.log(arguments)
          if (e.code === 6) {
            toastr.error(NstSvcTranslation.get('You cannot add more labels due to Admin configuration'));
          } else {
            toastr.error(NstSvcTranslation.get('an error occurred in adding labels'));
          }
        });
      });
      // vm.post.labels = items;
    }

    /**
     * open post chains
     * (needs more documentation)
     */
    function switchToPostCard() {
      // tells the parent scope to open me
      var reference = $scope.$emit('post-chain-expand-me', {
        postId: vm.post.id
      });
      eventReferences.push(reference);
      notifyObserver();
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
     * Checks the current state is `Feed` page or not
     * @returns {boolean}
     */
    function isFeed() {
      if ($state.current.name === 'app.messages-favorites' ||
        $state.current.name === 'app.messages-sorted' ||
        $state.current.name === 'app.messages-favorites-sorted') {
        return true;
      }
      return false;
    }

    /**
     * Checks the current state is post view page or not
     * @returns {boolean}
     */
    function isPostView() {
      if ($state.current.name == 'app.message') {
        return true
      }
      return false;
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
        // console.log(place, place.hasAccess(NST_PLACE_ACCESS.CONTROL));
        return place.hasAccess(NST_PLACE_ACCESS.CONTROL);
      });
    }

    function untrustSender() {
      NstSvcUserFactory.untrustEmail(vm.post.sender.id).then(function () {
        vm.post.isTrusted = false;
        toastr.success(NstSvcTranslation.get(NstUtility.string.format('Email address {0} has just been removed from the trusted list.', vm.post.sender.id)));
      }).catch(function () {
        toastr.error(NstSvcTranslation.get(NstUtility.string.format('An error occured while removing {0} from the trusted list.', vm.post.sender.id)));
      });
    }

    /**
     * searchs the label
     * @param {string} title title of Label
     * @returns {boolean}
     */
    function labelClick(title) {
      var searchQuery = new NstSearchQuery('');

      searchQuery.addLabel(title);

      var timeout = 0;
      if (isPostView()) {
        timeout = 100;
        $scope.$parent.$parent.$dismiss(true);
      }

      $timeout(function () {
        $state.go('app.search', {
          search: NstSearchQuery.encode(searchQuery.toString())
        });
      }, timeout);
    }

    function showAllPlacesAsRow() {
      vm.postPlacesViewNumber = 50;
    }

    function goToPlace(e, place) {
      e.preventDefault();
      var emailRe = /\S+@\S+\.\S+/;
      if (emailRe.test(place.id)) {
        $state.go('app.conversation', {userId: place.id});
      } else {
        if (place.hasAccess(NST_PLACE_ACCESS.READ_POST)) {
          $state.go('app.place-messages', {
            placeId: place.id
          });
          if (isPostView()) {
            $scope.$parent.$parent.$dismiss(true);
          }
        } else {
          NstSvcModal.confirm(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place."),
            {
              yes: NstSvcTranslation.get("Discard"),
              no: NstSvcTranslation.get("Conversation")
            }).then(function (discard) {
            if (!discard) {
              $uibModalStack.dismissAll();
              $state.go('app.conversation', {userId: place.id});
            } else {
              console.log('dismiss');
            }
          });
        }
      }
    }

    function mergePostCardVariable(url) {
      // var userId = NstSvcAuth.user || {id: '_'};
      // userId = userId.id;
      // var msgId = vm.post.id;
      // var app = NST_CONFIG.DOMAIN;
      // var urlPostFix = '';
      // if (url.indexOf('#') > -1) {
      //   url = url.split('#');
      //   urlPostFix = '#' + url[1];
      //   url = url[0];
      // }
      // if (url.indexOf('?') > -1) {
      //   url += '&';
      // } else {
      //   url += '?';
      // }
      // url += 'nst_user=' + userId + '&nst_mid=' + msgId + '&nst_app=' + app + '&nst_locale=' + NstSvcI18n.selectedLocale;
      return $sce.trustAsResourceUrl(url /*+ urlPostFix*/);
    }

    /**
     * clear event registers, timeout anad intervals on
     * destroying controller
     */
    $scope.$on('$destroy', function () {
      if (focusOnSentTimeout) {
        $timeout.cancel(focusOnSentTimeout);
      }

      if (iframeOnMessage) {
        window.removeEventListener('message', iframeOnMessage)
      }
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
