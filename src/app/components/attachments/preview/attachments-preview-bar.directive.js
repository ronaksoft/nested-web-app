(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar($timeout, $interval, toastr, $q, $, $rootScope,
                                 NST_FILE_TYPE, NST_ATTACHMENTS_PREVIEW_BAR_MODE, NST_ATTACHMENTS_PREVIEW_BAR_ORDER, NST_STORE_ROUTE,
                                 NstSvcStore, NstSvcFileFactory, SvcMiniPlayer, _) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/preview/main.html',
      scope: {
        onItemClick: '=',
        items: '=',
        mode: '=',
        badge: '=',
        postId: '='
      },
      link: function (scope, ele) {
        scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO;
        scope.overFlowLeft = scope.overFlowRight = false;
        scope.items = setOrder(scope.items, NST_ATTACHMENTS_PREVIEW_BAR_ORDER.order);
        scope.flexDiv = 16;
        scope.scrollDis = 140;
        scope.NST_FILE_TYPE = NST_FILE_TYPE;
        scope.cardWidth = angular.element('.attachments-card').width();
        var alreadyAdded = false;
        // var interval, pwTimeout;
        // var moves = [];
        var borderLeftArray=[],borderRightArray=[];
        var audioDOMS = [];

        if (modeIsValid(scope.mode)) {
          scope.internalMode = scope.mode;
        }


        if (scope.internalMode === NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO) {
          scope.internalMode = scope.badge ? NST_ATTACHMENTS_PREVIEW_BAR_MODE.BADGE : NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL;
        }

        if (!scope.badge  && scope.items.length === 1 &&
          (scope.items[0].type === NST_FILE_TYPE.IMAGE || scope.items[0].type === NST_FILE_TYPE.GIF ||
          scope.items[0].uploadType === 'VIDEO' ) && scope.items[0].hasPreview) {
          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_ONLY_IMAGE;

          var wrpWidth = ele.parent().parent().width();


          var imgOneRatio = scope.items[0].width / scope.items[0].height;

          if (scope.items[0].width) {
            scope.width = scope.items[0].width < scope.cardWidth ? scope.items[0].width : scope.cardWidth;
          } else {
            scope.width = 108;
          }

          if (scope.items[0].height) {
            scope.height = scope.width / imgOneRatio;
          } else {
            scope.height = 108;
          }


          scope.wrpWidth = wrpWidth;

          if (scope.height < 96) {
            scope.height = 96;
            scope.width = scope.height * imgOneRatio;
          } else if (scope.height > 1024) {
            scope.height = 1024;
            scope.width = scope.height * imgOneRatio;
          }

          scope.wrpHeight = scope.height > 1024 ? 1024 : scope.height;
        }


        if (!scope.badge && scope.items.length === 2 &&
          (scope.items[0].type === NST_FILE_TYPE.IMAGE || scope.items[0].type === NST_FILE_TYPE.GIF ||
          (scope.items[0].type === NST_FILE_TYPE.VIDEO && scope.items[0].uploadType === 'VIDEO') ) &&
          (scope.items[1].type === NST_FILE_TYPE.IMAGE || scope.items[1].type === NST_FILE_TYPE.GIF ||
          (scope.items[0].type === NST_FILE_TYPE.VIDEO && scope.items[0].uploadType === 'VIDEO') ) &&
          scope.items[0].hasPreview && scope.items[1].hasPreview ) {
          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_TWO_IMAGE;
          scope.deform = false;


          wrpWidth = ele.parent().parent().width() - scope.flexDiv;
          imgOneRatio = scope.items[0].width / scope.items[0].height || 1;
          var imgTwoRatio = scope.items[1].width / scope.items[1].height || 1;
          var ratio = imgOneRatio / imgTwoRatio;
          scope.scaleOne = (ratio / (1 + ratio)) * 100;
          scope.scaleTwo = 100 - scope.scaleOne;
          scope.constHeight = (scope.scaleOne * wrpWidth) / ( imgOneRatio * 100 );

          if (ratio < .1 || ratio > 100) {
            scope.deform = true;
          }
          if( ( imgOneRatio < .1 && scope.items[0].height > 1024) || (imgTwoRatio < .1 && scope.items[1].height > 1024)) {
            scope.deform = true;
          }


          // var unkHeight = Math.min(scope.items[0].height, scope.items[1].height);
          // var scale = wrpWidth / ( unkHeight * imgOneRatio + unkHeight * imgTwoRatio );
          // scope.imgHeight = scale * unkHeight;
          // scope.flexOneWidth = scale * (unkHeight * imgOneRatio);
          // scope.flexTwoWidth = scale * (unkHeight * imgTwoRatio);
        }


        $timeout(function () {
          scope.scrollWrp = ele.children().next();
          // var leftArrow = ele.children().first();
          // var rightArrow = ele.children().next().next();

          checkScroll(scope.scrollWrp[0]);

          scope.scrollWrp.scroll(function () {
            checkScroll(scope.scrollWrp[0]);
          });

          // rightArrow.mousedown(function () {
          //   scrollPower('right');
          // });
          // rightArrow.mouseup(function () {
          //   stopScrollPower();
          // });
          //
          // leftArrow.mousedown(function () {
          //   scrollPower('left');
          // });
          // leftArrow.mouseup(function () {
          //   stopScrollPower();
          // });

        }, 1000);


        // interaction functions
        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item, scope.items);
          }
        };


        scope.download = function (item) {
          if (item.downloadUrl) {
            location.href = item.downloadUrl;
            return;
          }

          getToken(item.id).then(function (token) {
            scope.$emit('post-attachment-viewed', {
              postId: scope.postId
            });
            item.downloadUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, item.id, token);
            item.viewUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, item.id, token);
            location.href = item.downloadUrl;
          }).catch(function () {
            toastr.error('Sorry, An error has occured while trying to load the file');
          });
        };

        function getToken(id) {
          var deferred = $q.defer();
            NstSvcFileFactory.getDownloadToken(id, null, scope.postId).then(deferred.resolve).catch(deferred.reject).finally(function () {
          });

          return deferred.promise;
        }

        scope.goLeft = function () {
          // var k = makeid();
          // count[k] = 0;
          // scrollLeft(count, k);

          var el = scope.scrollWrp[0];
          var i = 0;

          var scrollDis = findBefore(el.scrollLeft);
          var inter = $interval(function () {
            if (i < scrollDis) {
              el.scrollLeft -= 4;
            } else {
              $interval.cancel(inter);
            }
            i = i + 4;
          }, 1);
        };

        scope.goRight = function () {
          var el = scope.scrollWrp[0];
          var i = 0;
          var scrollDis = findNext(el.scrollLeft + el.clientWidth);
          var inter = $interval(function () {
            if (i < scrollDis + 16) {
              el.scrollLeft += 4;
            } else {
              $interval.cancel(inter);
            }
            i = i + 4;
          }, 1);
        };

        scope.$on('play-audio', function (e, id){
          console.log('id', id);
          scope.items.filter(function(item) {
            console.log(id ,item.id);
            return id !== item.id;
          }).forEach(function (i){
            i.isPlay = false
          });
        });

        scope.$on('$destroy', function () {
          _.forEach(audioDOMS, function (item) {
            item.pause();
            item.remove();
          });
        });

        scope.playAudio = function (item) {
          if (item.isPlay) {
            return SvcMiniPlayer.pause();
          }
          SvcMiniPlayer.setPlaylist(scope.postId);
          scope.items.forEach(function(attachment){
            if (attachment.uploadType !== 'AUDIO' && attachment.uploadType !== 'VOICE') {
              return;
            }
            getToken(attachment.id).then(function (token) {
              attachment.src = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, attachment.id, token);
              if (item.id === attachment.id) {
                attachment.isPlay = true;
              }
              SvcMiniPlayer.addTrack(attachment);
            }).catch(function () {
              toastr.error('Sorry, An error has occured while playing the audio');
            });
          });

          // var alreadyPlayed = audioDOMS.find(function (audioDOM) {
          //   return audioDOM.className === item.id;
          // })
          // if ( alreadyPlayed ) {
          //   alreadyPlayed.pause();
          //   alreadyPlayed.remove();
          //   item.isPlay = false;
          //   _.remove(audioDOMS, function(n) {
          //     return n.className === item.id;
          //   });
          //   return ;
          // }
          // item.isPlay = true;
          // var audio = document.createElement('audio');
          // audio.style.display = "none";
          // audio.className = item.id;
          // audio.autoplay = true;
        }

        // function scrollLeft(count, k) {
        //   var el = scope.scrollWrp[0];
        //   var i = $interval(function () {
        //     count[k]++;
        //     if (count[k] < scope.scrollDis) {
        //       el.scrollLeft -= 2;
        //     } else {
        //       $interval.cancel(i);
        //     }
        //   }, 1);
        //   moves.push(i);
        // }
        //
        // function scrollRight(count, k) {
        //   var el = scope.scrollWrp[0];
        //   var i = $interval(function () {
        //     count[k]++;
        //     if (count[k] < scope.scrollDis) {
        //       el.scrollLeft += 2;
        //     } else {
        //       $interval.cancel(i);
        //     }
        //   }, 1);
        //   moves.push(i);
        //
        // }

        function checkScroll(el) {
          if (el.clientWidth < el.scrollWidth && el.scrollLeft == 0) {
            scope.overFlowRight = true;
            scope.overFlowLeft = false;
            // return stopScrollPower()
          } else if (el.clientWidth + el.scrollLeft >= el.scrollWidth && el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = false;
            scope.overFlowLeft = true;
            // return stopScrollPower()
          } else if (el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = true;
            scope.overFlowLeft = true;
            // return 'atMiddle'
          }

          var childs = $(el).children();

          if(borderLeftArray.length == 0) {
            for(var i=0; i < childs.length; i++){
              borderLeftArray.push(childs[i].offsetLeft - 16);
              borderRightArray.push(childs[i].offsetLeft + childs[i].offsetWidth - 16)
            }

          }
        }

        function findNext(numb) {
          return borderRightArray.filter(function (i) {
              return i > numb
          })[0] - numb
        }
        function findBefore(numb) {
          var filter =  borderLeftArray.filter(function (i) {
              return i < numb
          });
          return numb - filter[filter.length - 1]
        }

        // function scrollPower(dir) {
        //   pwTimeout = $timeout(function () {
        //     if (dir == 'right') {
        //       interval = $interval(function () {
        //         scope.goRight()
        //       }, 100);
        //     }
        //     else {
        //       interval = $interval(scope.goLeft, 100);
        //     }
        //   }, 50)
        // }
      }
    };
    // function makeid() {
    //   var text = "";
    //   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    //   for (var i = 0; i < 5; i++)
    //     text += possible.charAt(Math.floor(Math.random() * possible.length));

    //   return text;
    // }

    function modeIsValid(mode) {
      return _.values(NST_ATTACHMENTS_PREVIEW_BAR_MODE).indexOf(mode) > -1;
    }


    /**
     * Add order property to items
     *
     * @param items[]
     * @param orderMap []
     */
    function setOrder(items, orderMap) {
      for (var i = 0; i < items.length; i++) {
        var index = orderMap.indexOf(items[i].type);
        if (index > -1) {
          items[i]['order'] = index;
        } else {
          items[i]['order'] = 999;
        }
      }
      return items;
    }
  }
})();
