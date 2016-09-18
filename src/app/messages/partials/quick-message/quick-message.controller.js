(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('QuickMessageController', QuickMessageController);

  function QuickMessageController($q, $log, toastr, NstSvcLoader, NstSvcPlaceFactory, NstSvcPostFactory) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/
    
    vm.model = {
      subject: '',
      body: '',
      errors: [],
      modified: false,
      ready: false,
      saving: false,
      saved: false
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.model.isModified = function () {
      vm.model.modified = (function (model) {
        var modified = false;

        modified = modified || model.subject.trim().length > 0;
        modified = modified || model.body.trim().length > 0;

        return modified;
      })(vm.model);

      return vm.model.modified;
    };

    vm.model.check = function () {
      vm.model.isModified();

      vm.model.errors = (function (model) {
        var errors = [];

        var atleastOne = model.subject.trim().length + model.body.trim().length;

        if (!atleastOne) {
          errors.push({
            name: 'mandatory',
            message: 'One of Message Subject or Body is Mandatory'
          });
        }

        return errors;
      })(vm.model);

      vm.model.ready = 0 == vm.model.errors.length;

      return vm.model.ready;
    };

    vm.model.submit = function (event) {
      var form = event.currentTarget;
      vm.model.subject = form.elements['subject'].value;
      vm.model.body = form.elements['body'].value;

      vm.send().then(function () {
        form.elements['subject'].value = '';
        form.elements['body'].value = '';
        vm.model.subject = '';
        vm.model.body = '';
        vm.model.saved = false;
        vm.model.check();
      });

      event.preventDefault();

      return false;
    };

    vm.send = function () {
      return NstSvcLoader.inject((function () {
        var deferred = $q.defer();

        if (vm.model.saving) {
          // Already is being sent process error
          deferred.reject([{
            name: 'saving',
            message: 'Already is being sent'
          }]);
        } else {
          if (vm.model.check()) {
            vm.model.saving = true;

            var post = NstSvcPostFactory.createPostModel();
            post.setSubject(vm.model.subject);
            post.setBody(vm.model.body);
            post.setContentType('text/plain');
            post.setPlaces([NstSvcPlaceFactory.parseTinyPlace({ _id: vm.placeId })]);

            NstSvcPostFactory.send(post).then(deferred.resolve).catch(function (error) { deferred.reject([error]); });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (response) {
        vm.model.saving = false;
        vm.model.saved = true;

        toastr.success('Your message has been successfully sent.', 'Message Sent');

        return $q(function (res) {
          res(response);
        });
      }).catch(function (errors) {
        vm.model.saving = false;
        toastr.error(errors.filter(
          function (v) { return !!v.message; }
        ).map(
          function (v, i) { return String(Number(i) + 1) + '. ' + v.message; }
        ).join("<br/>"), 'Compose Error');

        $log.debug('Compose | Error Occurred: ', errors);

        return $q(function (res, rej) {
          rej(errors);
        });
      }));
    };
  }
})();
