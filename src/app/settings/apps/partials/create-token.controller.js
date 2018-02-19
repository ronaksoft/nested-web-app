(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('CreateTokenController', CreateTokenController);

  function CreateTokenController($scope, toastr, NstSvcAppFactory, NST_SRV_ERROR, NstSvcTranslation) {
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
        vm.apps = apps;
        vm.skip += apps.length;
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
    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
