(function() {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('ManageAppsController', ManageAppsController);

  function ManageAppsController(toastr, $uibModal,
    NstSvcUserFactory, NstSvcAppFactory,
    NST_SRV_ERROR, NstSvcTranslation) {
    var vm = this;
    vm.query = '';
    vm.limit = 16;
    vm.skip = 0;
    vm.apps = [];
    vm.remove = remove;
    vm.copyToClipboard = copyToClipboard;
    
    (myApps)();

    vm.addApplication = function () {
      $uibModal.open({
        animation: false,
        size: '960',
        templateUrl: 'app/settings/apps/partials/create-token.html',
        controller: 'CreateTokenController',
        resolve: {
          myApps: function () {
            return vm.apps;
          }
        },
        controllerAs: 'ctrl'
      }).result.then(myApps).catch(myApps);
    };

    vm.copyToken = function (app) {
      var appModel = app.app;
      appModel.token = app.token;
      $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'app/settings/apps/partials/copy-token.html',
        controller: 'CopyTokenController',
        resolve: {
          app: function () {
            return appModel;
          }
        },
        controllerAs: 'ctrl'
      });
    };

    function search() {
      NstSvcAppFactory.search(vm.query, vm.limit, vm.skip).then(function(apps){
        vm.apps = apps;
        vm.skip += apps.length;
      });
    }

    function myApps() {
      NstSvcAppFactory.getAllTokens().then(function(apps){
        vm.apps = apps
      });
    }

    function copyToClipboard(text) {
      var inp = document.createElement('input');
      document.body.appendChild(inp);
      inp.value = text;
      inp.select();
      document.execCommand('copy', false);
      inp.remove();
    }

    function remove(token) {
      NstSvcAppFactory.revokeToken(token).then(function(){
        _.remove(vm.apps, {token: token})
      });
    }
  }
})();
