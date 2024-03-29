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
        postId: '=',
        markRead: '=?',
        forceMode: '=?',
        sender: '='
      },
      link: function (scope, ele) {
        scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO;
        scope.overFlowLeft = scope.overFlowRight = false;
        scope.getThumbnail = getThumbnail;
        scope.items = setOrder(scope.items, NST_ATTACHMENTS_PREVIEW_BAR_ORDER.order);
        scope.flexDiv = 16;
        scope.badge = false;
        scope.print = false;
        scope.scrollDis = 140;
        scope.NST_FILE_TYPE = NST_FILE_TYPE;
        scope.cardWidth = angular.element('.attachments-card').width();
        // var interval, pwTimeout;
        // var moves = [];
        var borderLeftArray=[],borderRightArray=[];

        if (modeIsValid(scope.mode)) {
          scope.internalMode = scope.mode;
        } else {
          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL
        }
        if (scope.mode === NST_ATTACHMENTS_PREVIEW_BAR_MODE.BADGE) {
          scope.badge = true;
        }
        if (scope.mode === NST_ATTACHMENTS_PREVIEW_BAR_MODE.PRINT) {
          scope.print = true;
          // scope.cardWidth = 1200
        }
        if ((!scope.badge && !scope.forceMode) && scope.items.length === 1 &&
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

        if ((!scope.badge && !scope.forceMode) && scope.items.length === 2 &&
          (scope.items[0].type === NST_FILE_TYPE.IMAGE || scope.items[0].type === NST_FILE_TYPE.GIF ||
          (scope.items[0].type === NST_FILE_TYPE.VIDEO && scope.items[0].uploadType === 'VIDEO') ) &&
          (scope.items[1].type === NST_FILE_TYPE.IMAGE || scope.items[1].type === NST_FILE_TYPE.GIF ||
          (scope.items[1].type === NST_FILE_TYPE.VIDEO && scope.items[1].uploadType === 'VIDEO') ) &&
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

        if (!scope.badge && !scope.print) {
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
  
          }, 100);
        }

        // interaction functions
        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item, scope.items);
          }
        };

        function getThumbnail(item, size) {
          if(item.thumbnail && item.thumbnail.length > 0) {
            return item.thumbnail
          } else {
            if (item.type ===  NST_FILE_TYPE.AUDIO || item.type ===  NST_FILE_TYPE.VIDEO) {
              if (size){
                return '/assets/icons/ph_small_attachment_media@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_media.png';
              }
            } else if(item.type ===  NST_FILE_TYPE.ARCHIVE) {
              if (size){
                return '/assets/icons/ph_small_attachment_zip@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_zip.png';
              }
            } else if(item.type ===  NST_FILE_TYPE.DOCUMENT) {
              if (size){
                return '/assets/icons/ph_small_attachment_document@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_document.png';
              }
            } else if(item.type ===  NST_FILE_TYPE.PDF) {
              if (size){
                return '/assets/icons/ph_small_attachment_pdf@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_pdf.png';
              }
            } else {
              if (size){
                return '/assets/icons/ph_small_attachment_other@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_other.png';
              }
            }
          }
        }

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

        setPlayedStatus(SvcMiniPlayer.getStatus());

        scope.$on('play-audio', function (e, id){
          setPlayedStatus(id);
        });

        function setPlayedStatus(id) {
          scope.items.forEach(function (item) {
            if (id !== scope.postId + '_' + item.id) {
              item.isPlayed = false;
            } else {
              item.isPlayed = true;
            }
          });
        }

        scope.attachmentCount = 0;

        scope.playAudio = function (item) {
          if(scope.markRead) {
            scope.markRead();
          }
          if (item.isPlayed) {
            return SvcMiniPlayer.pause();
          }
          SvcMiniPlayer.setPlaylist(scope.postId);
          scope.attachmentCount = 0;
          scope.items.forEach(function (attachment) {
            if (attachment.uploadType !== 'AUDIO' && attachment.uploadType !== 'VOICE') {
              return;
            }
            scope.attachmentCount++;
            setTimeout(function () {
              getToken(attachment.id).then(function (token) {
                attachment.src = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, attachment.id, token);
                attachment.isVoice = attachment.uploadType === "VOICE";
                if ( attachment.isVoice ) {
                  attachment.sender = scope.sender
                }
                if (item.id === attachment.id) {
                  attachment.isPlayed = true;
                }
                scope.attachmentCount--;
                // if (scope.attachmentCount === 0) {
                //   scope.addAllMedia();
                // }
                SvcMiniPlayer.addTrack(attachment);
              }).catch(function () {
                toastr.error('Sorry, An error has occured while playing the audio');
              });
            }, 120);
          });
        };

        scope.addAllMedia = function () {
          scope.items.forEach(function (attachment) {
            SvcMiniPlayer.addTrack(attachment);
          });
        };

        /*function scrollLeft(count, k) {
          var el = scope.scrollWrp[0];
          var i = $interval(function () {
            count[k]++;
            if (count[k] < scope.scrollDis) {
              el.scrollLeft -= 2;
            } else {
              $interval.cancel(i);
            }
          }, 1);
          moves.push(i);
        }*/

        /*function scrollRight(count, k) {
          var el = scope.scrollWrp[0];
          var i = $interval(function () {
            count[k]++;
            if (count[k] < scope.scrollDis) {
              el.scrollLeft += 2;
            } else {
              $interval.cancel(i);
            }
          }, 1);
          moves.push(i);

        }*/

        function checkScroll(el) {
          if (el.clientWidth < el.scrollWidth && el.scrollLeft < 5) {
            scope.overFlowRight = true;
            scope.overFlowLeft = false;
            // return stopScrollPower()
          } else if (el.clientWidth + el.scrollLeft >= el.scrollWidth - 10 && el.clientWidth < el.scrollWidth) {
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
              var paddingSize = (i + 1) === childs.length ? 0 : 16
              var leftborderPosition = childs[i].offsetLeft + el.scrollLeft - paddingSize;
              var paddingSize2 = $rootScope._direction === 'rtl' ? 0 : 16;
              borderLeftArray.push(leftborderPosition);
              borderRightArray.push(childs[i].offsetLeft + childs[i].offsetWidth + el.scrollLeft - paddingSize2);
              if($rootScope._direction === 'rtl') {
                borderLeftArray.sort(function (a,b) {
                  return a - b;
                })
                borderRightArray.sort(function (a,b) {
                  return a - b;
                })
              }
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

        function getToken(id) {
          var deferred = $q.defer();
            NstSvcFileFactory.getDownloadToken(id, scope.postId).then(deferred.resolve).catch(deferred.reject).finally(function () {
          });

          return deferred.promise;
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
