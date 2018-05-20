(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('CreateTokenController', CreateTokenController);

  function CreateTokenController($scope, toastr, NstSvcAppFactory, NstSvcTranslation, $uibModal, myApps, $rootScope) {
    var vm = this;
    vm.tokenName = '';
    vm.apps = [];
    vm.query = '';
    vm.limit = 18;
    vm.intiatlLoading = true;
    vm.skip = 0;
    var searchDeb = _.debounce(search, 256);
    var eventReferences = [];
    vm.selectApp = selectApp;
    vm.copyToClipboard = copyToClipboard;
    (search)();
    eventReferences.push($scope.$watch(function () {
      return vm.query
    }, searchDeb));

    function search(query) {
      NstSvcAppFactory.search(query || vm.query, vm.limit, vm.skip).then(function (apps) {
        vm.intiatlLoading = false;
        insertAppsInView(apps);
      });
    }

    function selectApp(id) {
        var item = _.find(vm.apps, {id:id});
        if (item.loading) {
            return;
        }
        item.loading = true;
        NstSvcAppFactory.createToken(id).then(function (res) {
            item.token = res.token;
            item.loading = false;
            $rootScope.$emit('add-token', {token: item});
        });
    }

    vm.copyToken = function (app) {
      $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'app/settings/apps/partials/copy-token.html',
        controller: 'CopyTokenController',
        resolve: {
          app: function () {
            return app;
          }
        },
        controllerAs: 'ctrl'
      });
    };

    function copyToClipboard(text) {
        var inp = document.createElement('input');
        document.body.appendChild(inp);
        inp.value = text;
        inp.select();
        document.execCommand('copy', false);
        inp.remove();
    }
    function insertAppsInView(items) {
        vm.apps = [];
        items.forEach(function (app) {
            var item = _.find(myApps, function(napp){
                return napp.app.id == app.id;
            });
            if (item) {
                app.token = item.token
            }
            vm.apps.push(app);
        })
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
