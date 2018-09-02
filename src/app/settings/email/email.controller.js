(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('EmailSetupController', EmailSetupController);

  function EmailSetupController($rootScope, $scope, toastr, $uibModal, $timeout,
    NstSvcUserFactory, NstSvcTaskUtility, NstSvcAuth, NstSvcTranslation,
    NST_SRV_ERROR, NST_CONFIG) {
    var vm = this;
    var eventReferences = [];
    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);
    vm.change = change;
    vm.remove = remove;
    vm.service = 'Gmail';
    vm.pristine = true;
    vm.isSaved = false;
    vm.isLoading = false;
    resetModel();
    function resetModel() {
      vm.model = {
        host: '',
        port: 25,
        username: '',
        password: '',
        status: false,
      };
    }

    (function () {
      NstSvcUserFactory.getCurrent().then(function (user) {
        if (user.mail) {
          setUserInModel(user.mail);
          vm.isSaved = user.mail.host.length > 0;
        }
      });
    })();

    eventReferences.push($scope.$watch(function(){
      return vm.model.host + vm.model.port + vm.model.username + vm.model.password + vm.model.status;
    }, function(){
      vm.pristine = false;
    }))
    function remove() {
      NstSvcUserFactory.removeEmail().then(function () {
        toastr.success(NstSvcTranslation.get('Successfully removed.'));
        vm.isSaved = false;
        resetModel();
      }).catch(function(e) {
        toastr.error(NstSvcTranslation.get('Sorry, An error has occured due to remove email.'));
      })
    }

    function setUserInModel(mail) {
      var username = '';
      if (mail.username.indexOf('@') > -1) {
        username = mail.username.slice(0, mail.username.indexOf('@'));
      } else {
        username = mail.username;
      }
      if (mail.host.indexOf('yahoo') > -1) {
        vm.service = 'Yahoo';
      }
      if (mail.host.indexOf('gmail') > -1) {
        vm.service = 'Gmail';
      }
      vm.model = {
        host: mail.host,
        port: mail.port,
        username: username,
        status: mail.status,
        password: '',
      }
      $timeout(function(){
        vm.pristine = true;
      }, 100);
    }

    function change() {
      // Sets submitted to true to make the enable form validation on any field change
      vm.isLoading = true;
      if (vm.model.username.indexOf('@') === -1) {
        if (vm.service === 'Gmail') {
          vm.model.username += '@gmail.com'
        }
        if (vm.service === 'Yahoo') {
          vm.model.username += '@yahoo.com'
        }
      }
      NstSvcUserFactory.updateEmail(vm.model).then(function () {
        vm.isSaved = true;
        toastr.success(NstSvcTranslation.get('Saved successfully'));
        vm.isLoading = false;
      }).catch(function(e) {
        toastr.error(NstSvcTranslation.get('Sorry, An error has occured.'))
        vm.isLoading = false;
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
