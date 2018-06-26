(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($, $rootScope, $templateCache, iScrollService, $http, deviceDetector, SvcCardCtrlAffix,
    NST_LOCALE_EN_US, NST_LOCALE_FA_IR, toastr,
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
    $.FroalaEditor.DefineIcon('insertBase64', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/photo-wire@2x.png' : '/assets/icons/editor/photo-wire.png',
      ALT: ' insert image ',
      NAME: ' insert image ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('insertTable', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table@2x.png' : '/assets/icons/editor/table.png',
      ALT: ' Insert Table ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableHeader', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table-head@2x.png' : '/assets/icons/editor/table-head.png',
      ALT: ' Table Header ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableRemove', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/bin@2x.png' : '/assets/icons/editor/bin.png',
      ALT: ' Remove Table ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableRows', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table-row@2x.png' : '/assets/icons/editor/table-row.png',
      ALT: ' Row ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableColumns', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table-column@2x.png' : '/assets/icons/editor/table-column.png',
      ALT: ' Column ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableStyle', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/color@2x.png' : '/assets/icons/editor/color.png',
      ALT: ' Table Style ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableCells', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table@2x.png' : '/assets/icons/editor/table.png',
      ALT: ' Cell ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableCellBackground', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/color@2x.png' : '/assets/icons/editor/color.png',
      ALT: ' Cell Background ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableCellVerticalAlign', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table-cell-vertical@2x.png' : '/assets/icons/editor/table-cell-vertical.png',
      ALT: ' Vertical Align ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableCellHorizontalAlign', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table@2x.png' : '/assets/icons/editor/table.png',
      ALT: ' Horizontal Align ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('tableCellStyle', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/table-cell-style@2x.png' : '/assets/icons/editor/table-cell-style.png',
      ALT: ' Cell Style ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('moreIcon', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/more@2x.png' : '/assets/icons/editor/more.png',
      ALT: ' More options ',
      template: 'image'
    });
    $.FroalaEditor.DefineIcon('popupClose', {
      SRC: isRetinaDisplay ? '/assets/icons/editor/xcross@2x.png' : '/assets/icons/editor/xcross.png',
      ALT: ' Close ',
      template: 'image'
    });

    $.extend($.FroalaEditor.POPUP_TEMPLATES, {
      "moreOptions.popup": '[_BUTTONS_][_CUSTOM_LAYER_]'
    });

    $.extend($.FroalaEditor.DEFAULTS, {
      popupButtons: ['popupClose', '|', 'insertTable', 'insertBase64'],
    });

   $('div#froala-editor').froalaEditor({
     quickInsertButtons: ['image', 'table', 'ol', 'ul', 'more'],
     pluginsEnabled: ['quickInsert', 'image', 'table', 'lists', 'moreOptions']
   });

    $.FroalaEditor.RegisterCommand('more', {
      title: 'Show more options',
      icon: 'moreIcon',
      undo: false,
      focus: false,
      plugin: 'moreOptions',
      callback: function () {
        this.moreOptions.showPopup();
      }
    });

    $.FroalaEditor.RegisterCommand('popupClose', {
      title: 'Close',
      undo: false,
      focus: false,
      callback: function () {
        this.moreOptions.hidePopup();
      }
    });

    $.FroalaEditor.RegisterCommand('insertBase64', {
      title: 'Insert Base64 image',
      icon: 'insertBase64',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      // Callback for the button.
      callback: function () {
        var that = this;
        $('body').append(
          $('<input/>').attr('type', 'file').attr('name', 'someName').attr('id', 'temp-input').attr('accept', 'image/*')
        );
        document.getElementById("temp-input").click();
        $("#temp-input").change(function(e){
          if (e.target.files[0].size < 10000) {
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function() {
              that.html.insert('<img src="' + reader.result + '" alt="' + e.target.files[0].name + '" />');
              $("#temp-input").remove();
            };
            reader.onerror = function(error) {
              console.log('Error: ', error);
            };
          } else {
            toastr.warning(NstSvcTranslation.get('the image size is too much'));
          }
        })
        // this.html.insert('Hello Froala!');
      },
    });

    $.FroalaEditor.RegisterCommand('rightToLeft', {
      title: 'RTL',
      icon: 'paragraph-rtl',
      focus: true,
      undo: true,
      toggle: true,
      refreshAfterCallback: true,
      refresh: function ($btn) {
        var el = this.selection.blocks()[0];
        var t = el.style.direction === 'rtl';
        $btn.toggleClass("fr-active", t).attr("aria-pressed", t)
      },
      callback: function () {
        var el = this.selection.blocks()[0];
        if (!el) {
          changeDirection.apply(this, ['rtl', 'right']);
        }
        var t = el.style.direction === 'rtl';
        if (!t) {
          changeDirection.apply(this, ['rtl', 'right']);
        } else {
          changeDirection.apply(this, ['ltr', 'left']);
        }
      }
    });

    $.FroalaEditor.RegisterCommand('leftToRight', {
      title: 'LTR',
      icon: 'paragraph-ltr',
      focus: true,
      undo: true,
      toggle: true,
      refresh: function ($btn) {
        var el = this.selection.blocks()[0];
        var t = el.style.direction === 'ltr';
        $btn.toggleClass("fr-active", t).attr("aria-pressed", t)
      },
      refreshAfterCallback: true,
      callback: function () {
        changeDirection.apply(this, ['ltr', 'left']);
      }
    });

    $.FroalaEditor.PLUGINS.moreOptions = function (editor) {
      // Create custom popup.
      function initPopup () {
        // Popup buttons.
        var popup_buttons = '';
   
        // Create the list of buttons.
        if (editor.opts.popupButtons.length > 1) {
          popup_buttons += '<div class="fr-buttons">';
          popup_buttons += editor.button.buildList(editor.opts.popupButtons);
          popup_buttons += '</div>';
        }
   
        // Load popup template.
        var template = {
          buttons: popup_buttons,
          custom_layer: ''
        };
   
        // Create popup.
        var $popup = editor.popups.create('moreOptions.popup', template);
   
        return $popup;
      }
   
      // Show the popup
      function showPopup () {
        // Get the popup object defined above.
        var $popup = editor.popups.get('moreOptions.popup');
   
        // If popup doesn't exist then create it.
        // To improve performance it is best to create the popup when it is first needed
        // and not when the editor is initialized.
        if (!$popup) $popup = initPopup();
   
        // Set the editor toolbar as the popup's container.
        editor.popups.setContainer('moreOptions.popup', editor.$tb);
   
        // This will trigger the refresh event assigned to the popup.
        // editor.popups.refresh('customPlugin.popup');
   
        // This custom popup is opened by pressing a button from the editor's toolbar.
        // Get the button's object in order to place the popup relative to it.
        var $btn = editor.$tb.find('.fr-command[data-cmd="more"]');
   
        // Set the popup's position.
        var left = $btn.offset().left + $btn.outerWidth() / 2;
        var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);
   
        // Show the custom popup.
        // The button's outerHeight is required in case the popup needs to be displayed above it.
        editor.popups.show('moreOptions.popup', left, top, $btn.outerHeight());
      }
   
      // Hide the custom popup.
      function hidePopup () {
        editor.popups.hide('moreOptions.popup');
      }
   
      // Methods visible outside the plugin.
      return {
        showPopup: showPopup,
        hidePopup: hidePopup
      }
    }
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
