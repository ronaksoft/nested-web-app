(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('webappSettingsController', webappSettingsController);

  /** @ngInject */
  /**
   * 
   * Stores some options which are categorized as webapp-settings
   * @param {any} _ 
   * @param {any} toastr 
   * @param {any} NstSvcAuth 
   * @param {any} NstSvcKeyFactory 
   * @param {any} NST_KEY 
   */
  function webappSettingsController(_, $rootScope, toastr, NstSvcAuth, NstSvcKeyFactory, NST_KEY, NstSvcViewStorage, NstViewService) {
    var vm = this;
    vm.previewSetting = {};
    vm.nightMood = false;

    vm.updatePreviewSettings = updatePreviewSettings;
    vm.updateThemeSettings = updateThemeSettings;

    (function (){

      // Loads the settings which are stored in Cyrus client storage
      NstSvcKeyFactory.get(NST_KEY.WEBAPP_SETTING_DOCUMENT_PREVIEW).then(function(v) {
          if ( v.length > 0 ) {
            vm.previewSetting = JSON.parse(v);
          } else {
            vm.previewSetting = {
              document : false,
              pdf : false
            };
          }
      });

      NstViewService.getTheme().then(function(v) {
        console.log(v);
        vm.nightMood = v == 'true';
      });
    })();

    /**
     * Updates preview settings in Cyrus client storage
     * 
     */
    function updatePreviewSettings(){
       NstSvcKeyFactory.set(NST_KEY.WEBAPP_SETTING_DOCUMENT_PREVIEW, JSON.stringify(vm.previewSetting));
    }

    /**
     * Updates preview settings in Cyrus client storage
     * 
     */
    function updateThemeSettings(){
      console.log(vm.nightMood);
       NstViewService.setTheme(vm.nightMood).then(function(){
        NstViewService.applyTheme();
       });
    }

  }
})();
