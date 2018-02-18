(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstApp', NstApp);

  function NstApp() {
    App.prototype = {};
    App.prototype.constructor = App;

    function App() {
      this.id = undefined;
      this.homepage = undefined;
      this.developer = undefined;
      this.iconLargeUrl = undefined;
      this.iconSmallUrl = undefined;
      this.name = undefined;
    }

    return App;
  }
})();
