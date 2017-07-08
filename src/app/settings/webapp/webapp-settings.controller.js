(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('webappSettingsController', webappSettingsController);

  /** @ngInject */
  function webappSettingsController(_, toastr, NstSvcAuth, NstSvcKeyFactory, NST_KEY) {
    var vm = this;
    vm.previewSetting = {};

    vm.updatePreviewSettings = updatePreviewSettings;

    (function (){
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
    })();

    function updatePreviewSettings(){
       NstSvcKeyFactory.set(NST_KEY.WEBAPP_SETTING_DOCUMENT_PREVIEW, JSON.stringify(vm.previewSetting));
    }

  }
})();
