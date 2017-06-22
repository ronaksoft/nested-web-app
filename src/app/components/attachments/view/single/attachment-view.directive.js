(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentView', AttachmentView);

  function AttachmentView(NST_FILE_TYPE, $sce, $window) {
    return {
      restrict: 'E',
      scope: {
        attachment: '=',
        sideBarOpen: '='
      },
      replace: true,
      link: function (scope) {
        scope.scaleVal = 1;

        scope.$watch('sideBarOpen', function () {
          scope.resize();
        });

        scope.resize = function () {
          // 240 is Width of sidepanel
          if (scope.sideBarOpen && (window.innerWidth - 240) < scope.attachment.newW) {

            scope.scaleVal = (window.innerWidth - 240) / scope.attachment.newW;

          } else {
            scope.scaleVal = 1;
          }
        };

        scope.$on('vjsVideoReady', function (e, data) {
          $('.vjs-loading-spinner').empty().html('<div class="loading" ng-hide="attachment.show" ng-if="preview">' +
            '<div class="animation"><div class="circle one"></div></div>' +
            '<div class="animation"><div class="circle two"></div></div>' +
            '<div class="animation"><div class="circle three"></div></div>' +
            '<div class="animation"><div class="circle four"></div></div>' +
            '<div class="animation"><div class="circle five"></div></div></div>');
        });

        scope.$watch(function () {
          return scope.attachment.viewUrl
        }, function () {
          setTimeout(function () {
            update(scope);
          }, 0);
        });

        scope.videoConfig = function () {
          scope.mediaToggle = {
            sources: [
              {
                src: scope.attachment.viewUrl,
                type: 'video/mp4'
              }
            ],
            poster: scope.attachment.preview
          };
          scope.options = {
            width: scope.attachment.newW,
            height: scope.attachment.newH,
            controlBar: {
              volumeMenuButton: {
                inline: false,
                vertical: true
              }
            }
          };
        };


        scope.sizeDetect = function(aw,ah){
          var a = scope.attachment,
              ww = window.innerWidth,
              wh = window.innerHeight - 64, // Navbar Height : 64
              ratio = aw / ah,
              pw = aw <= 1024 ? aw : 1024, // Preview width TODO : 1024 from configs
              ph = pw * ( 1 / ratio );
          var newW,newH;
          if ( (wh < ph && wh * ratio > ww) || ( ww < pw && ww * (1 / ratio) < wh ) ) {
            newW = ww;
            newH = ww * (1 / ratio);
          }else if ( (wh < ph && wh * ratio < ww) || ( ww < pw && ww * (1 / ratio) > wh ) ) {
            newW = wh * ratio;
            newH = wh;
          } else if (wh > ph && ww > pw) {
            newW = pw;
            newH = ph;
          }
          scope.attachment.newW = newW;
          scope.attachment.newH = newH;
        };


        var resizeIt = _.debounce(scope.sizeDetect, 500);
        angular.element($window).on('resize', resizeIt);
        scope.$on('$destroy', function () {
          angular.element($window).off('resize', resizeIt);
        });
      },
      template: '<div class="nst-preview-pic-mode" data-ng-include="tplUrl" data-ng-init="attachment = attachment"></div>'
    };



    function update(scope) {
      var type = scope.attachment.type;

      scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }

      scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';

      switch (type) {
        case NST_FILE_TYPE.IMAGE:
          scope.sizeDetect(scope.attachment.width,scope.attachment.height);
          scope.tplUrl = 'app/components/attachments/view/single/partials/image.html';
          break;

        case NST_FILE_TYPE.GIF:
          scope.sizeDetect(scope.attachment.videoWidth ? scope.attachment.videoWidth : scope.attachment.width,scope.attachment.videoHeight ? scope.attachment.videoHeight : scope.attachment.height);
          scope.tplUrl = 'app/components/attachments/view/single/partials/gif.html';
          break;

        case NST_FILE_TYPE.VIDEO:
          scope.sizeDetect(scope.attachment.width,scope.attachment.height);
          scope.videoConfig();
          scope.tplUrl = 'app/components/attachments/view/single/partials/video.html';
          break;

        case NST_FILE_TYPE.AUDIO:
          scope.tplUrl = 'app/components/attachments/view/single/partials/audio.html';
          break;

        case NST_FILE_TYPE.ARCHIVE:
          scope.tplUrl = 'app/components/attachments/view/single/partials/archive.html';
          break;

        case NST_FILE_TYPE.DOCUMENT:
          scope.tplUrl = 'app/components/attachments/view/single/partials/document.html';
          break;

        case NST_FILE_TYPE.PDF:
          scope.tplUrl = 'app/components/attachments/view/single/partials/pdf.html';
          break;
        default:
          scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';
      }
    }
  }
})();
