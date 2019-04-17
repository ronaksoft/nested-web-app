(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('GeneralSettingsController', GeneralSettingsController);

  function GeneralSettingsController($rootScope, $scope, toastr, $uibModal, $timeout, NstSvcCompactViewStorage,
    NstSvcUserFactory, NstSvcAppFactory, NstSvcKeyFactory, NST_KEY, NstSvcTaskUtility, NstSvcAuth,
    NST_SRV_ERROR, NstSvcTranslation, SvcRTL, NST_CONFIG) {
    var vm = this;
    var eventReferences = [];
    var firstload = true;
    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);
    vm.touched = false;
    vm.signatureActive = false;
    vm.save = save;
    vm.savedModel = '';
    vm.model = '';
    vm.compactView = NstSvcCompactViewStorage.getDefault() + '';
    vm.debugMode = window.debugMode;
    vm.downloadLogs = downloadLogs;
    vm.changeDefaultView = changeDefaultView;

    (function () {

      // Loads the settings which are stored in Cyrus client storage
      NstSvcKeyFactory.get(NST_KEY.GENERAL_SETTING_SIGNATURE).then(function (v) {
        if (v.length > 0) {
          var res = JSON.parse(v);
          vm.savedModel = res.data;
          vm.model = res.data;
          vm.signatureActive = res.active;
        }
      });

    })();


    eventReferences.push($scope.$watch(function () {
      return vm.debugMode;
    }, setDebugMode));

    eventReferences.push($scope.$watch(function () {
      return vm.signatureActive;
    }, active));

    function checkFroalaDirection(editor) {
      var el = editor.selection.element();
      var text = $(el).text();
      text = SvcRTL.clear(text);
      if (SvcRTL.rtl(text)) {
        changeDirection.apply(editor, ['rtl', 'right']);
      } else {
        changeDirection.apply(editor, ['ltr', 'left']);
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

    var directionChecker = _.throttle(checkFroalaDirection, 512);

    /**
     * Configs for Froala editor
     */
    vm.froalaOpts = {
      enter: $.FroalaEditor.ENTER_DIV,
      toolbarContainer: '#editor-btn',
      charCounterCount: false,
      tabSpaces: 4,
      toolbarBottom: true,
      placeholderText: NstSvcTranslation.get('Add Signature...'),
      pluginsEnabled: ['colors', 'fontSize', 'fontFamily', 'link', 'url', 'wordPaste', 'lists', 'align', 'codeBeautifier'],
      fontSize: ['8', '10', '14', '18', '22'],
      toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', '|', 'color', 'align', 'formatOL', 'formatUL', 'insertLink', '|', 'leftToRight', 'rightToLeft', 'insertBase64', 'html'],
      events: {
        'froalaEditor.keyup': function (e, editor, je) {
          directionChecker(editor);
          vm.touched = true;
        },
        'froalaEditor.focus': function (e, editor, je) {
          vm.touched = true;
        }
      }
    };

    function saveRes() {
      toastr.success(NstSvcTranslation.get('Your signature is saved'));
      vm.touched = false;
      vm.savedModel = vm.model;
    }
    function save() {
      NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_SIGNATURE, JSON.stringify({
        active: vm.signatureActive,
        data: vm.model
      })).then(saveRes).catch(function(e){
        toastr.warning(NstSvcTranslation.get('An error occoured') + ' ' + NstSvcTranslation.get('code:') + e.code);
      });

    }

    function active(active) {
      if (firstload) {
        return firstload = false;
      }
      NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_SIGNATURE, JSON.stringify({
        active: active,
        data: vm.savedModel
      })).catch(function(e){
        toastr.warning(NstSvcTranslation.get('An error occoured') + ' ' + NstSvcTranslation.get('code:') + e.code);
      });
    }

    function setDebugMode(active) {
      localStorage.setItem('nested.debug_mode', active? 'true': 'false');
      window.debugMode = active;
    }

    function downloadLogs() {
      var content = localStorage.getItem('nested.debug_mode_log');
      var app = NST_CONFIG.DOMAIN;
      app = app.split('.').join('');
      var a = document.createElement('a');
      var file = new Blob([content], {type: 'text/plain'});
      a.href = URL.createObjectURL(file);
      a.download = 'dlog_' + vm.user.id + '_' +  app + '_' + (new Date().getTime()) + '.txt';
      a.click();
    }

    function changeDefaultView() {
      NstSvcCompactViewStorage.setDefault(vm.compactView == 'true');
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
