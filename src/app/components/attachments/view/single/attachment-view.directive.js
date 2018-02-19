(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentView', AttachmentView);

  function AttachmentView(NST_FILE_TYPE, $sce, $window, NstSvcKeyFactory, NST_KEY, _, $) {
    return {
      restrict: 'E',
      scope: {
        attachment: '=',
        sideBarOpen: '='
      },
      replace: true,
      link: function (scope) {
        var eventReferences = [];
        scope.scaleVal = 1;

        eventReferences.push(scope.$watch('sideBarOpen', function () {
          scope.resize();
        }));

        scope.resize = function () {
          // 240 is Width of sidepanel
          if (scope.sideBarOpen && (window.innerWidth - 240) < scope.attachment.newW) {
            scope.scaleVal = (window.innerWidth - 240) / scope.attachment.newW;

          } else {
            scope.scaleVal = 1;
          }
        };

        scope.$on('vjsVideoReady', function () {
          $('.vjs-loading-spinner').empty().html('<div class="loading" ng-hide="attachment.show" ng-if="preview">' +
            '<div class="animation"><div class="circle one"></div></div>' +
            '<div class="animation"><div class="circle two"></div></div>' +
            '<div class="animation"><div class="circle three"></div></div>' +
            '<div class="animation"><div class="circle four"></div></div>' +
            '<div class="animation"><div class="circle five"></div></div></div>');
        });

        eventReferences.push(scope.$watch(function () {
          return scope.attachment.viewUrl
        }, function () {
          // setTimeout(function () {
          update(scope);
          // }, 0);
        }));

        eventReferences.push(scope.$watch(function () {
          return scope.attachment
        }, function () {
          // setTimeout(function () {
          update(scope);
          // }, 0);
        }));

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

        scope.audioConfig = function () {
          scope.mediaToggle = {
            sources: [
              {
                src: scope.attachment.viewUrl,
                type: 'audio/mp3'
              }
            ],
            poster: scope.attachment.thumbnail
          };
          scope.options = {
            width: 800,
            height: scope.attachment.thumbnail ? 800 : 200,
            controlBar: {
              volumeMenuButton: {
                inline: false,
                vertical: true
              }
            }
          };
        };

        scope.documentConfig = function () {
          NstSvcKeyFactory.get(NST_KEY.WEBAPP_SETTING_DOCUMENT_PREVIEW).then(function (v) {
            if (v.length > 0) {
              scope.previewSetting = JSON.parse(v);
            } else {
              scope.previewSetting = {
                document: false,
                pdf: false
              };
            }
          });

        };


        scope.sizeDetect = function (aw, ah) {
          var a = scope.attachment,
            ww = window.innerWidth, // screen width
            wh = window.innerHeight - 64, // Navbar Height : 64
            ratio = aw / ah, //image ratio
            pw = aw <= 1024 ? aw : 1024, // Preview width TODO : get `1024` from configs
            ph = pw * ( 1 / ratio );
          var newW, newH;

          if ((wh < ph && ww < wh * ratio ) ||
              ( ww < pw && wh < ww * (1 / ratio) )) {
            newW = ww;
            newH = ww * (1 / ratio);
          } else if ((wh < ph && wh * ratio < ww) ||
                    ( ww < pw && ww * (1 / ratio) > wh )) {
            newW = wh * ratio;
            newH = wh;
          } else if (wh > ph && ww > pw) {
            newW = pw;
            newH = ph;
          }
          a.newW = newW;
          a.newH = newH;
        };

        scope.docPreview = function () {
          scope.previewSetting[scope.attachment.type] = true;
        };

        scope.docAlwaysPreview = function () {
          scope.previewSetting[scope.attachment.type] = true;
          NstSvcKeyFactory.set(NST_KEY.WEBAPP_SETTING_DOCUMENT_PREVIEW, JSON.stringify(scope.previewSetting))
            .then(function () {
            });
        };

        var resizeIt = _.debounce(scope.sizeDetect, 500);
        angular.element($window).on('resize', resizeIt(scope.attachment.width, scope.attachment.height));
        scope.$on('$destroy', function () {
          angular.element($window).off('resize', resizeIt(scope.attachment.width, scope.attachment.height));
        });

        scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      },
      template: '<div class="nst-preview-pic-mode" data-ng-include="tplUrl" data-ng-init="attachment = attachment"></div>'
    };


    function update(scope) {
      var type = scope.attachment.type;

      scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

      scope.tplUrl = '';


      switch (type) {
        case NST_FILE_TYPE.IMAGE:
          scope.sizeDetect(scope.attachment.width, scope.attachment.height);
          scope.tplUrl = 'app/components/attachments/view/single/partials/image.html';
          break;

        case NST_FILE_TYPE.GIF:
          scope.sizeDetect(scope.attachment.videoWidth ? scope.attachment.videoWidth : scope.attachment.width, scope.attachment.videoHeight ? scope.attachment.videoHeight : scope.attachment.height);
          if (scope.attachment.uploadType === 'FILE') {
            // ::fixme this type of set url is not correct
            scope.attachment.viewUrl = scope.attachment.preview;
            scope.tplUrl = 'app/components/attachments/view/single/partials/image.html';
          } else {
            scope.tplUrl = 'app/components/attachments/view/single/partials/gif.html';
          }
          break;

        case NST_FILE_TYPE.VIDEO:
          if (scope.attachment.uploadType === 'FILE') {
            scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';
          } else {
            scope.sizeDetect(scope.attachment.width, scope.attachment.height);
            scope.videoConfig();
            scope.tplUrl = 'app/components/attachments/view/single/partials/video.html';
          }
          break;

        case NST_FILE_TYPE.AUDIO:
          scope.audioConfig();
          scope.tplUrl = 'app/components/attachments/view/single/partials/audio.html';
          break;

        case NST_FILE_TYPE.ARCHIVE:
          scope.tplUrl = 'app/components/attachments/view/single/partials/archive.html';
          break;

        case NST_FILE_TYPE.DOCUMENT:
          scope.documentConfig();
          scope.tplUrl = 'app/components/attachments/view/single/partials/document.html';
          break;

        case NST_FILE_TYPE.PDF:
          scope.documentConfig();
          scope.tplUrl = 'app/components/attachments/view/single/partials/pdf.html';
          break;
        default:
          scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';
      }

    }
  }
})();
