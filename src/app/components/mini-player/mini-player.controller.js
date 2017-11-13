(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .controller('MiniPlyerController', MiniPlyerController);

  /** @ngInject */
  function MiniPlyerController($scope, $rootScope, $state, _, SvcMiniPlayer, $) {
    var eventReferences = [];
    var vm = this;
    vm.displayState = 0;
    vm.playPauseToggle = playPauseToggle;
    vm.moveMouseDown = moveMouseDown;
    vm.closePlayer = closePlayer;
    vm.next = next;
    vm.previous = previous;
    vm.play = play;
    vm.pause = pause;
    vm.openList = openList;
    vm.barClick = barClick;
    vm.gotoPost = gotoPost;
    vm.playStatus = false;
    vm.playList = [];
    vm.isVoice = false;
    vm.currentTime = {
      time: 0,
      duration: 100,
      ratio: 0
    };

    var updateDebounce = _.debounce(update, 50);

    vm.currentPlay = {
      item: {},
      playlist: null,
      index: 0
    };


    eventReferences.push(SvcMiniPlayer.timeChanged(function (t) {
      $scope.$apply(function () {
        vm.currentTime = t;
      });
    }));

    eventReferences.push(SvcMiniPlayer.statusChanged(function (result) {
      vm.playStatus = result.status === 'play';
      if (result.status === 'play' || result.status === 'pause') {
        updateDebounce();
      } else if (result.status === 'end') {
        $scope.$apply(function () {
          vm.currentTime = {
            time: 0,
            ratio: 1
          };
        });
      }
    }));

    eventReferences.push(SvcMiniPlayer.listUpdated(function () {
      updateDebounce();
    }));

    function update() {
      getCurrent();
      getList()
    }

    function barClick(newRatio) {
      var setTime = vm.currentTime.duration * newRatio;
      vm.currentTime.ratio = newRatio;
      SvcMiniPlayer.seekTo(setTime);
    }


    function getCurrent() {
      $scope.$apply(function () {
        vm.currentPlay = SvcMiniPlayer.getCurrent();
        // console.log(vm.currentPlay);
        if (vm.currentPlay.item) {
          vm.isVoice = vm.currentPlay.item.uploadType !== "AUDIO";
        }
      });
    }

    function getList() {
      $scope.$apply(function () {
        var data = SvcMiniPlayer.getList();
        vm.playList = data.items;
        if (!data.isVoiceComment && vm.displayState === 0 && vm.playList.length > 0) {
          vm.displayState = 1;
        } else if (data.isVoiceComment) {
          vm.displayState = 0;
        }
      });
    }

    function playPauseToggle() {
      if (vm.currentPlay.item.isPlayed) {
        pause();
      } else {
        play();
      }
    }

    function openList() {
      if (vm.displayState === 2) {
        vm.displayState = 3
      } else {
        vm.displayState = 2
      }
    }

    function pause() {
      SvcMiniPlayer.pause();
    }

    function play(id) {
      if (id) {
        SvcMiniPlayer.play(id);
      } else {
        SvcMiniPlayer.play();
      }
    }

    function next() {
      SvcMiniPlayer.next();
    }

    function previous() {
      SvcMiniPlayer.prev();
    }

    function closePlayer() {
      vm.displayState = 0;
      SvcMiniPlayer.removeAll();
    }

    function gotoPost() {
      if (vm.currentPlay === undefined || vm.currentPlay.playlist === null) {
        return;
      }
      $state.go('app.message', {postId: vm.currentPlay.playlist}, {notify: false});
    }

    var seekEventReferences = [];
    var startMove = false;
    var moveStartPos = {
      x: 0,
      y: 0
    };
    var movePos = {
      x: 0,
      y: 0
    };

    function moveMouseDown(e) {
      startMove = true;
      moveStartPos.x = e.pageX - movePos.x;
      moveStartPos.y = e.pageY - movePos.y;
      applyMove();
    }

    seekEventReferences.push(angular.element('body').on('mousemove', function (e) {
      if (startMove) {
        e.preventDefault();
        movePos.x = (e.pageX - moveStartPos.x);
        movePos.y = (e.pageY - moveStartPos.y);
        applyMove();
      }
    }));
    seekEventReferences.push(angular.element('body').on('mouseup', function (e) {
      if (startMove) {
        e.preventDefault();
      }
      startMove = false;
    }));

    function applyMove() {
      var miniPlayerElement = angular.element('.mini-player');
      checkBoundaries(miniPlayerElement);
      miniPlayerElement.css('transform', 'translateX(' + movePos.x + 'px)');
    }

    function checkBoundaries(element) {
      var widowWidth = window.innerWidth;
      var miniPlayerWidth = element.width();
      var leftBoundary = (-widowWidth / 2) + miniPlayerWidth / 2 + 10;
      var rightBoundary = widowWidth / 2 - (miniPlayerWidth / 2 + 10);
      if (movePos.x < leftBoundary) {
        movePos.x = leftBoundary;
      } else if (movePos.x > rightBoundary) {
        movePos.x = rightBoundary;
      }
    }

    $scope.$on('$destroy', function () {
      _.forEach(seekEventReferences, function (event) {
        event.off();
      });
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
