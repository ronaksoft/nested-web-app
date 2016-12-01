(function (){
    angular
      .module('ronak.nested.web.components.i18n')
      .filter('translate', ['NstSvcTranslation' , function (NstSvcTranslation) {
        var translator = function (text) {
          return NstSvcTranslation.get(text);
        };

        return translator;
      }]);
})();
