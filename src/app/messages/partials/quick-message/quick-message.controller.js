(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('QuickMessageController', QuickMessageController);

  function QuickMessageController($q, $log, $scope, toastr, $state, $rootScope, $uibModal,NstPicture ,
                                  NstSvcLoader, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcAttachmentFactory, NstSvcFileType, NstLocalResource, NST_FILE_TYPE,
                                  NstSvcAttachmentMap, NstSvcStore, NST_ATTACHMENT_STATUS, NstSvcPostMap, NstSvcTranslation) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.model = {
      subject: '',
      body: '',
      attachments: [],
      attachfiles: {},
      errors: [],
      modified: false,
      ready: false,
      saving: false,
      saved: false
    };
    vm.fireFoxBodySet = false;

    vm.attachments = {
      elementId: 'attach',
      viewModels: [],
      requests: {},
      size: {
        uploaded: 0,
        total: 0
      }
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.model.isModified = function () {
      vm.model.modified = (function (model) {
        var modified = false;

        modified = modified || model.subject.trim().length > 0;
        modified = modified || model.body.trim().length > 0;
        modified = modified || model.attachments.length > 0;

        return modified;
      })(vm.model);

      $log.debug('quick message | Model Modified? ', vm.model.modified);

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

    vm.writeMsg = function(e) {
      if (!e.currentTarget.firstChild) return;

      vm.textarea = e.currentTarget;

      analyseInIt();


      //console.log(vm.model.subject.length);
      if(e.which == '13' && vm.model.subject.length == 0){

      }

      function analyseInIt() {
        // no Enter or return at first char
        if ((angular.element(e.currentTarget.firstChild).text().charCodeAt(0) == 10 || angular.element(e.currentTarget.firstChild).html() == '<br>' || angular.element(e.currentTarget.firstChild).html() == '') && e.currentTarget.children.length > 1 ){
          angular.element(e.currentTarget.firstChild).remove();
          return analyseInIt()
        }

      }

    };

    vm.model.submit = function () {
      applyMove();

      //TODO Clone element and play another scene to main element
      var element = angular.element(vm.textarea);
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

      var elementFirstChild = angular.element(vm.textarea.firstChild);

      vm.model.subject = elementFirstChild.text();
      elementFirstChild.remove();


      if ( element.children().length == 0 || ( element.children().length == 1 && element.children()[0].length == 0)) {

        vm.model.body = vm.model.subject;
        vm.model.subject = "";

      }else {

        var str = element[0].innerHTML;
        findBreak(str);

      }


      function applyMove() {
        var tween2 = new TimelineLite()
          .add(TweenLite.to($('nst-quick-message')[0], 1, {css:{opacity:'.3',transform: 'scale(0.9,0.9)'}, ease:Power4.easeOut}));
        tween2
      }
      function declineMove() {
        var tween1 = new TimelineLite()
          .add(TweenLite.to($('nst-quick-message')[0], .2, {css:{opacity:'1',transform: 'scale(1,1)'}, ease:Power4.easeOut}));
        tween1
      }
      function reverseMove() {
        var tween2 = new TimelineLite()
          .add(TweenLite.to($('nst-quick-message')[0], .2, {css:{opacity:'1',transform: 'scale(1,1)'}, ease:Power4.easeOut}));
        tween2;
        angular.element(vm.textarea).html('');
        vm.model.subject = '';
        vm.model.body = '';
        vm.attachments.viewModels = [];
        vm.model.attachfiles = {};
        vm.model.attachments = [];
      }

      function findBreak(str) {
        if(isFirefox){
          str = str.replace(/<br>/, "");
          vm.model.body = str;
        } else {
          vm.model.body = str;
        }
        // str = str.replace(/<br\s*[\/]?>/gi, "\n");
        // str = str.replace(/<div\s*[\/]?>/gi, "\n");
        // str = str.replace(/<\/div>/gi, "");
      }

      vm.send().then(function () {
        vm.model.check();
        vm.model.saved = false;
        reverseMove();
      }).catch(function () {
        declineMove();
      });

      //event.preventDefault();

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
            post.setAttachments(vm.model.attachments);
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

        NstSvcPostFactory.get(response.post.id).then(function(res){
          var msg = NstSvcPostMap.toMessage(res);
          vm.addMessage(msg);
        })

        if(response.noPermitPlaces.length > 0){
          var text = NstUtility.string.format(NstSvcTranslation.get('Your message hasn\'t been successfully sent to {0}'), response.noPermitPlaces.join(','));
          toastr.warning(text, NstSvcTranslation.get('Message didn\'t send'));
        }

        toastr.success(NstSvcTranslation.get('Your message has been successfully sent.'), NstSvcTranslation.get('Message sent'));

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


    /*****************************
     ***** Controller Methods ****
     *****************************/

    $scope.$on('droppedAttach', function (event,files) {
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i].file).then(function (request) {});
        files[i].deleteFile();
      }
    });

    vm.addMessage = function (msg) {
      $scope.$emit('post-quick',msg);
    };

    vm.model.check = function () {
      vm.model.isModified();

      vm.model.errors = (function (model) {
        var errors = [];

        var atleastOne = model.subject.trim().length + model.body.trim().length + model.attachments.length > 0;

        if (!atleastOne) {
          errors.push({
            name: 'mandatory',
            message: 'One of Post Body, Subject or Attachment is Mandatory'
          });
        }


        for (var k in model.attachments) {
          if (NST_ATTACHMENT_STATUS.ATTACHED != model.attachments[k].status) {
            errors.push({
              name: 'attachments',
              message: 'Attachment uploading has not been finished yet'
            });
          }
        }

        return errors;
      })(vm.model);

      $log.debug('Compose | Model Checked: ', vm.model.errors);
      vm.model.ready = 0 == vm.model.errors.length;

      return vm.model.ready;
    };


    vm.attachments.fileSelected = function (event) {
      var files = event.currentTarget.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function (request) {});
      }
      event.currentTarget.value = "";
    };

    vm.attachments.attach = function (file) {
      var deferred = $q.defer();
      var readyPromises = [];

      $log.debug('Compose | File Attach: ', file);

      // Create Attachment Model
      var attachment = NstSvcAttachmentFactory.createAttachmentModel();
      attachment.setSize(file.size);
      attachment.setFilename(file.name);
      attachment.setMimetype(file.type);

      // Add Attachment to Model
      vm.attachments.size.total += file.size;
      vm.model.attachments.push(attachment);
      var type = NstSvcFileType.getType(attachment.getMimetype());

      // Read Attachment
      var reader = new FileReader();
      var qRead = $q.defer();

      reader.onload = function (event) {
        var uri = event.target.result;
        var resource = new NstLocalResource(uri);

        // Load and Show Thumbnail
        if (NST_FILE_TYPE.IMAGE == type) {
          attachment.setPicture(new NstPicture({
            original : uri,
            preview : uri,
            x32 : uri,
            x64 : uri,
            x128: uri
          }));
        }

        qRead.resolve(uri);
      };
      reader.readAsDataURL(file);

      NstSvcLoader.inject(qRead.promise.then(function (uri) {
        var deferred = $q.defer();

        // Upload Attachment
        var vmAttachment = NstSvcAttachmentMap.toEditableAttachmentItem(attachment);
        attachment.setId(vmAttachment.id);

        var request = NstSvcStore.uploadWithProgress(file, function (event) {
          if (event.lengthComputable) {
            vmAttachment.uploadedSize = event.loaded;
            vmAttachment.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
          }
        });

        vm.attachments.requests[attachment.getId()] = request;

        request.sent().then(function () {
          attachment.status = NST_ATTACHMENT_STATUS.UPLOADING;
          vm.attachments.viewModels.push(vmAttachment);
        });

        request.finished().then(function () {
          // vm.attachments.size.total -= attachment.getSize();
          delete vm.attachments.requests[attachment.getId()];
        });

        request.getPromise().then(function (response) {
          var deferred = $q.defer();

          attachment.setId(response.data.universal_id);
          attachment.status = NST_ATTACHMENT_STATUS.ATTACHED;

          vmAttachment.id = attachment.getId();
          vmAttachment.isUploaded = true;
          vmAttachment.uploadedSize = attachment.getSize();
          vmAttachment.uploadedRatio = 1;

          deferred.resolve(attachment);

          return deferred.promise;
        }).catch(function (error) {
          $log.debug('Compose | Attach Upload Error: ', error);

          deferred.reject(error);
        }).then(function () {
          deferred.resolve(request);
        });

        return deferred.promise;
      })).then(deferred.resolve);

      return deferred.promise;
    };

    vm.attachments.detach = function (vmAttachment) {
      var id = vmAttachment.id;
      var attachment = _.find(vm.model.attachments, { id: id });
      $log.debug('Compose | Attachment Delete: ', id, attachment);

      if (attachment && attachment.length !== 0) {
        switch (attachment.status) {
          case NST_ATTACHMENT_STATUS.UPLOADING:
            var request = vm.attachments.requests[attachment.getId()];
            if (request) {
              NstSvcStore.cancelUpload(request);
            }
            break;
        }

        vm.model.attachments = vm.model.attachments.filter(function (v) { return id != v.id; });
        vm.attachments.viewModels = vm.attachments.viewModels.filter(function (v) { return id != v.id; });
        vm.attachments.size.uploaded -= vmAttachment.uploadedSize;
        vm.attachments.size.total -= attachment.getSize();
      }else{
        vm.model.attachments = [];
      }
    };

    $scope.deleteAttachment = function (attachment) {
      new $q(function (resolve, reject) {
        if (attachment.status === NST_ATTACHMENT_STATUS.UPLOADING) {
          // abort the pending upload request
          attachment.cancelUpload();
          resolve(attachment);
        } else { // the store is uploaded and it should be removed from server
          NstSvcAttachmentFactory.remove(attachment.id).then(function (result) {
            resolve(attachment);
          }).catch(reject);
        }
      }).then(function (attachment) {
        $scope.compose.post.removeAttachment(attachment);
        $timeout(function () {
          if ($scope.compose.post.attachments.length === 0) {
            $scope.showUploadProgress = false;
          }
        });
      });
    };

    vm.resolveSet = false;

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, cancel) {

      if(angular.element(vm.textarea).text().length > 1) {
        vm.resolveSet = true;
      }else {
        vm.resolveSet = false;
        return
      }

      if (vm.resolveSet) {
        event.preventDefault();
      }

      if(angular.element(vm.textarea).text().length > 1){
        $rootScope.modals['leave-confirm'] = $uibModal.open({
          animation: false,
          templateUrl: 'app/modals/leave-confirm/main.html',
          controller: 'LeaveConfirmController',
          controllerAs: 'ctlLeaveConfirm',
          size: 'sm',
          resolve: {

          }
        });
        $rootScope.modals['leave-confirm'].result.then(function () {
          vm.resolveSet = false;
          angular.element(vm.textarea).html('');
          $state.go(toState.name, toParams);
        });
      } else {
        vm.resolveSet = false;
      }

    });



  }
})();
