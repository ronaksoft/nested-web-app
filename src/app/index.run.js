(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($, $rootScope, $templateCache, iScrollService, $http, deviceDetector, SvcCardCtrlAffix,
    NST_LOCALE_EN_US, NST_LOCALE_FA_IR,
    NstSvcI18n) {
    var isRetinaDisplay = isRetinaDisplay();
    // Define a text icon called imageIcon.
    $.FroalaEditor.DefineIcon('align-justify', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/align-justify@2x.png' : '/assets/icons/editor/align-justify.png',
      ALT: 'align justify',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('align-center', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/align-center@2x.png' : '/assets/icons/editor/align-center.png',
      ALT: 'align center',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('align-right', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/align-right@2x.png' : '/assets/icons/editor/align-right.png',
      ALT: 'align right',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('align-left', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/align-left@2x.png' : '/assets/icons/editor/align-left.png',
      ALT: 'align-left',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('insertLink', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/link@2x.png' : '/assets/icons/editor/link.png',
      ALT: 'link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('linkStyle', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/link@2x.png' : '/assets/icons/editor/link.png',
      ALT: 'link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('linkOpen', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/open-link.png' : '/assets/icons/editor/open-link.png',
      ALT: 'open link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('linkEdit', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/link@2x.png' : '/assets/icons/editor/link.png',
      ALT: 'link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('linkList', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/link@2x.png' : '/assets/icons/editor/link.png',
      ALT: 'link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('linkBack', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/link@2x.png' : '/assets/icons/editor/link.png',
      ALT: 'link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('linkRemove', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/link-remove.png' : '/assets/icons/editor/link-remove.png',
      ALT: 'remove link',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('eraser', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/eraser@2x.png' : '/assets/icons/editor/eraser.png',
      ALT: 'eraser',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('formatUL', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/list-ul@2x.png' : '/assets/icons/editor/list-ul.png',
      ALT: 'unordered list',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('paragraph-rtl', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/paragraph-rtl@2x.png' : '/assets/icons/editor/paragraph-rtl.png',
      ALT: 'rtl',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('paragraph-ltr', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/paragraph-ltr@2x.png' : '/assets/icons/editor/paragraph-ltr.png',
      ALT: 'ltr',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('formatOL', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/list-ol@2x.png' : '/assets/icons/editor/list-ol.png',
      ALT: 'order list',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('strikeThrough', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/strikethrough@2x.png' : '/assets/icons/editor/strikethrough.png',
      ALT: 'strikethrough',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('bold', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/bold@2x.png' : '/assets/icons/editor/bold.png',
      ALT: 'bold',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('italic', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/italic@2x.png' : '/assets/icons/editor/italic.png',
      ALT: 'italic',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('underline', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/underline@2x.png' : '/assets/icons/editor/underline.png',
      ALT: 'underline',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('fontSize', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/fontsize@2x.png' : '/assets/icons/editor/fontsize.png',
      ALT: 'fontsize',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('color', {
      SRC:isRetinaDisplay ? '/assets/icons/editor/color@2x.png' : '/assets/icons/editor/color.png',
      ALT: 'color',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('html', {
      SRC: '/assets/icons/editor/html.png',
      ALT: ' html ',
      template: 'image'
    });

    // $.FroalaEditor.RegisterCommand('bold', {
    //   title: 'Bold',
    //   icon: 'bold'
    // });
    // $.FroalaEditor.ICON_DEFAULT_TEMPLATE = 'material_design';

    $.FroalaEditor.RegisterCommand('rightToLeft', {
      title: 'RTL',
      icon: 'paragraph-rtl',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      callback: function () {
        changeDirection.apply(this, ['rtl', 'right']);
      }
    });

    $.FroalaEditor.RegisterCommand('leftToRight', {
      title: 'LTR',
      icon: 'paragraph-ltr',
      focus: true,
      undo: true,
      // refreshAfterCallback: true,
      callback: function () {
        changeDirection.apply(this, ['ltr', 'left']);
      }
    });


    /**
     * Applies the direction ( rtl, ltr ) to the editor elements
     * @param {any} dir
     * @param {any} align
     */
    var changeDirection = function (dir, align) {
      this.selection.save();
      var elements = this.selection.blocks();
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element != this.$el.get(0)) {
          $(element)
            .css('direction', dir)
            .css('text-align', align);
        }
      }

      this.selection.restore();
    };

    $rootScope.modals = {};
    if (deviceDetector.os !== 'mac') {
      window.nativeScroll = false;
      iScrollService.toggle(true);
      iScrollService.state.useIScroll = true;
    } else {
      window.nativeScroll = true;
    }

    if (typeof window.svg4everybody === 'function') {
      window.svg4everybody({
        polyfill: true // polyfill <use> elements for External Content
      });
    }

    NstSvcI18n.addLocale("en-US", NST_LOCALE_EN_US);
    NstSvcI18n.addLocale("fa-IR", NST_LOCALE_FA_IR);

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      if (!$rootScope.stateHistory) {
        $rootScope.stateHistory = [];
      }
      SvcCardCtrlAffix.reset();
      $rootScope.stateHistory.push({
        state: toState,
        params: toParams
      });

    });
    $templateCache.put(
      "directives/toast/toast2.html",
      "<div class=\"{{toastClass}} {{toastType}}\" ng-click=\"tapToast()\"><div ng-switch on=\"allowHtml\" class=\"_df _fn\">" +
      "<div ng-switch-default ng-if=\"title\" class=\"{{titleClass}}\" aria-label=\"{{title}}\">{{title}}</div>" +
      // <div ng-switch-default class=\"{{messageClass}}\" aria-label=\"{{message}}\">{{message}}</div>
      "<div ng-switch-when=\"true\" ng-if=\"title\" class=\"{{titleClass}}\"" +
      "ng-bind-html=\"title\"></div><div ng-switch-when=\"true\" class=\"{{messageClass}}\" ng-bind-html=\"message\"></div><div ng-if=\"extraData.undo\"" +
      "class=\"{{messageClass}} undo-butn\" ng-click=\"extraData.undo()\">Undo</div></div><progress-bar ng-if=\"progressBar\"></progress-bar></div>"
    );
    // pan zoom
    $http.get('app/components/attachments/panzoom/nst-panzoom.html', {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put("nst-panzoom.html", tplContent);
      });

    $http.get('app/components/chips/user-chips.html', {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put("user-chips.html", tplContent);
      });
    $http.get('app/components/chips/place-chips.html', {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put("place-chips.html", tplContent);
      });
    $http.get('app/components/chips/label-chips.html', {
      cache: $templateCache
    })
    .success(function (tplContent) {
      $templateCache.put("label-chips.html", tplContent);
    });

    var cacheTaskActs = [
      '/app/notification/common/picture.html',
      '/app/notification/common/name.html',
      'app/messages/partials/message/comment.html',
      'app/task/common/activity/partials/base.html',
      'app/task/common/activity/partials/status-changed.html',
      'app/task/common/activity/partials/watcher-added.html',
      'app/task/common/activity/partials/watcher-removed.html',
      'app/task/common/activity/partials/editor-added.html',
      'app/task/common/activity/partials/editor-removed.html',
      'app/task/common/activity/partials/attachment-added.html',
      'app/task/common/activity/partials/attachment-removed.html',
      'app/task/common/activity/partials/comment.html',
      'app/task/common/activity/partials/title-changed.html',
      'app/task/common/activity/partials/desc-changed.html',
      'app/task/common/activity/partials/candidate-added.html',
      'app/task/common/activity/partials/candidate-removed.html',
      'app/task/common/activity/partials/todo-added.html',
      'app/task/common/activity/partials/todo-removed.html',
      'app/task/common/activity/partials/todo-changed.html',
      'app/task/common/activity/partials/todo-done.html',
      'app/task/common/activity/partials/todo-undone.html',
      'app/task/common/activity/partials/label-added.html',
      'app/task/common/activity/partials/label-removed.html',
      'app/task/common/activity/partials/due-date-updated.html',
      'app/task/common/activity/partials/due-date-removed.html',
      'app/task/common/activity/partials/created.html',
      'app/task/common/activity/partials/assignee-changed.html'
    ];

    cacheTaskActs.forEach(function (tpl) {
      $http.get(tpl, {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put(tpl, tplContent);
      });
    });

    /**
     * Checks the screen is retina
     * needed for rendering proper icons
     * @returns {boolean}
     */
    function isRetinaDisplay() {
      if (window.matchMedia) {
        var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
        return (mq && mq.matches || (window.devicePixelRatio > 1));
      }
    }
  }
})();
