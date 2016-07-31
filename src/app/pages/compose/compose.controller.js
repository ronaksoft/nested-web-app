(function () {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $rootScope, $state, $stateParams, $scope, $log, $uibModal, $timeout,
                             _, toastr,
                             ATTACHMENT_STATUS, NST_SRV_ERROR, NST_PATTERN, NST_TERM_COMPOSE_PREFIX, NST_DEFAULT, NST_NAVBAR_CONTROL_TYPE, NST_ATTACHMENT_STATUS, NST_FILE_TYPE,
                             NstSvcLoader, NstSvcTry, NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore, NstSvcFileType, NstSvcAttachmentMap,
                             NstTinyPlace, NstPlace, NstVmPlace, NstVmSelectTag, NstRecipient, NstVmNavbarControl, NstLocalResource) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.model = {
      recipients: [],
      attachments: [],
      subject: '',
      body: '',
      forwardedFrom: null,
      replyTo: null,
      errors: [],
      ready: false,
      saving: false,
      saved: false,
      modified: false
    };

    vm.search = {
      results: []
    };

    vm.attachments = {
      elementId: 'attach',
      viewModels: [],
      size: {
        uploaded: 0,
        total: 0
      }
    };

    vm.place = undefined;

    vm.controls = {
      left: [
        // TODO: Get Previous state
        new NstVmNavbarControl('Discard', NST_NAVBAR_CONTROL_TYPE.BUTTON, $state.href('intro'))
      ],
      right: [
        new NstVmNavbarControl('Attach', NST_NAVBAR_CONTROL_TYPE.BUTTON_INPUT_LABEL, undefined, undefined, { id: vm.attachments.elementId })
      ]
    };

    vm.configs = {
      tinymce: {
        inline: false,
        // fixed_toolbar_container: '.nst-compose-message',
        statusbar: false,
        trusted: true,
        menubar: false,
        browser_spellcheck: true,
        selector: 'textarea',
        height : 600,
        plugins : 'autolink link image lists charmap directionality textcolor colorpicker emoticons autoresize',
        // contextmenu: "copy | paste inserttable | link inserttable | cell row column deletetable",
        // contextmenu_never_use_native: true,
        toolbar: 'bold italic underline strikethrough | alignleft aligncenter aligncenter alignjustify | formatselect fontselect fontsizeselect forecolor backcolor| ltr rtl | bullist numlist | outdent indent | link',
        skin: 'lightgray',
        theme : 'modern'
      }
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.configs.tinymce.onChange = function (event) {
      // Put logic here for keypress and cut/paste changes
    };

    vm.search.fn = function (query) {
      return NstSvcPlaceFactory.search(query).then(function (places) {
        vm.search.results = places.map(function (place) {
          return new NstVmPlace(place);
        });
      });
    };

    vm.search.tagger = function (text) {
      // FIXME: To use new class and also check for hidden places
      var isPlaceId = 0 == text.split('.').filter(function (v, i) {
          return !(0 == i ? NST_PATTERN.GRAND_PLACE_ID.test(v) : NST_PATTERN.SUB_PLACE_ID.test(v));
      }).length;
      var isEmail = NST_PATTERN.EMAIL.test(text);

      if (isPlaceId) {
        var tag = new NstVmSelectTag({
          id: text,
          name: text,
          data: NstSvcPlaceFactory.getTiny(text).then(function (place) {
            $timeout(function () {
              tag.name = place.getName();
              tag.data = place;
            });
          }).catch(function () {
            $timeout(function () {
              tag.isTag = false;
            });
          })
        });

        return tag;
      } else if (isEmail) {
        return new NstVmSelectTag({
          id: text,
          name: text,
          data: new NstRecipient({
            id: text,
            email: text,
            name: text
          })
        });
      }

      return new NstVmSelectTag();
    };

    vm.attachments.fileSelected = function (event) {
      var files = event.currentTarget.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function (resolved) {
          resolved.request.sent().then(function () {
            vm.attachments.size.total += resolved.attachment.getSize();
            vm.attachments.viewModels.push(NstSvcAttachmentMap.toUploadAttachmentItem(resolved.attachment));
          });
        });
      }
    };

    vm.attachments.fileDropped = function (event) {
      var files = event.currentTarget.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function (resolved) {
          resolved.request.sent().then(function () {
            vm.attachments.size.total += resolved.attachment.getSize();
            vm.attachments.viewModels.push(NstSvcAttachmentMap.toUploadAttachmentItem(resolved.attachment));
          });
        });
      }
    };

    // vm.attachMethod = function (files) {
    //   $scope.attachshow = true;
    //
    //   var counter = 0;
    //   for (var i = 0; i < files.length; i++) {
    //     var file = files[i].file;
    //     counter++;
    //     $scope.upload_size.total += file.size;
    //
    //     var isImage = file.type.split('/')[0] == 'image';
    //     var attachment = NstSvcAttachmentFactory.createAttachmentModel({
    //       _id: null,
    //       filename: file.name,
    //       mimetype: file.type,
    //       upload_time: file.lastModified,
    //       size: file.size,
    //       status : ATTACHMENT_STATUS.UPLOADING
    //     });
    //
    //     attachment.loadedSize = 0;
    //
    //     if (isImage) {
    //       var stItem = new NstStoreResource();
    //       stItem.uid = attachment.id;
    //       attachment.thumbs = {
    //         x32: stItem,
    //         x64: stItem,
    //         x128: stItem
    //       };
    //
    //       var reader = new FileReader();
    //       reader.onload = function (event) {
    //         var uri = event.target.result;
    //         this.thumbs.x32.url = uri;
    //         this.thumbs.x64.url = uri;
    //         this.thumbs.x128.url = uri;
    //
    //       }.bind(attachment);
    //
    //       reader.readAsDataURL(file);
    //     }
    //
    //     $scope.compose.post.addAttachment(attachment);
    //
    //     var uploadSettings = {
    //       file : file,
    //       _reqid : attachment.getClientId(),
    //       // progress is invoked at most once per every second
    //       onProgress : _.throttle(function (e) {
    //         if (e.lengthComputable) {
    //           this.loadedSize = e.loaded;
    //           $timeout(function () {
    //             $scope.totalProgress = $scope.compose.post.getTotalAttachProgress();
    //           });
    //         }
    //       }.bind(attachment),1000),
    //       onStart : function (e) {
    //         $scope.showUploadProgress = true;
    //       }
    //     };
    //
    //     NstSvcStore.uploadWithProgress(uploadSettings).then(function (handler) {
    //       attachment.setUploadCanceler(handler.abort);
    //       handler.start().then(function (response) {
    //
    //         _.forEach($scope.compose.post.attachments, function (item) {
    //
    //           // FIXME : use a common format for unique id
    //           if (item.getClientId() === response.data._reqid) {
    //
    //             item.status = ATTACHMENT_STATUS.ATTACHED;
    //             item.id = response.data.universal_id;
    //
    //             item.change();
    //           }
    //
    //         });
    //
    //       }.bind(file)).catch(function (result) {
    //         $log.debug(result);
    //       });
    //     }).catch(function (error) {
    //       $log.debug(error);
    //     });
    //   };
    //
    //   /**
    //    * @property interface
    //    * @type {Object}
    //    */
    //   $scope.interface = {};
    //
    //   // Listen for when the interface has been configured.
    //   $scope.$on('$dropletReady', function whenDropletReady() {
    //     $scope.attachfiles.allowedExtensions([/.+/]);
    //     $scope.attachfiles.useArray(false);
    //   });
    //   $scope.$on('$dropletFileAdded', function startupload() {
    //     vm.attach($scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID));
    //     $scope.attachmentForm.attLength.$setViewValue($scope.compose.post.attachments.length);
    //     var i=0;
    //     for (i=0; i<$scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID).length; i++){
    //       $scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID)[i].deleteFile();
    //     }
    //   });
    // };

    vm.attachments.attach = function (file) {
      var deferred = $q.defer();
      var promises = [];

      $log.debug('Compose | File Attach: ', file);

      // Create Attachment Model
      var attachment = NstSvcAttachmentFactory.createAttachmentModel();
      attachment.setStatus(NST_ATTACHMENT_STATUS.UPLOADING);
      attachment.setSize(file.size);
      attachment.setFilename(file.name);
      attachment.setMimeType(file.type);
      attachment.setUploadTime(file.lastModified);

      // Add Attachment to Model
      vm.attachments.size.total += file.size;
      vm.model.attachments.push(attachment);
      var type = NstSvcFileType.getType(attachment.getMimeType());

      // Load and Show Thumbnail
      if (NST_FILE_TYPE.IMAGE == type) {
        var qThumb = $q.defer();
        var reader = new FileReader();
        reader.onload = function (event) {
          var uri = event.target.result;
          // TODO: Generate Raw Resource
          var resource = new NstLocalResource(uri);

          attachment.getPicture().setOrg(resource);
          attachment.getPicture().setThumbnail(32, resource);
          attachment.getPicture().setThumbnail(64, resource);
          attachment.getPicture().setThumbnail(128, resource);

          qThumb.resolve();
        };

        promises.push(NstSvcLoader.inject(qThumb.promise));
        reader.readAsDataURL(file);
      }

      // Upload Attachment
      var request = NstSvcStore.uploadWithProgress(file, function (event) {
        if (event.lengthComputable) {
          $log.debug('Uploaded (', attachment.getFilename(), ')', Number((event.loaded / event.total) * 100).toFixed(2), '%');
        }
      });
      NstSvcLoader.inject(request.finished().then(function (response) {
        var deferred = $q.defer();
        $log.debug('Upload Finished (', attachment.getFilename(), ')');

        vm.attachments.size.total -= attachment.getSize();
        attachment.setStatus(NST_ATTACHMENT_STATUS.ATTACHED);
        attachment.setId(response.data.universal_id);
        deferred.resolve(attachment);

        return deferred.promise;
      }).catch(function (result) {
        var deferred = $q.defer();

        $log.debug('Compose | Attach Upload Error: ', result);
        deferred.reject.call(arguments);

        return deferred.promise;
      }));

      // var uploadSettings = {
      //   file: file,
      //   // _reqid: attachment.getClientId(),
      //   // // progress is invoked at most once per every second
      //   // onProgress: _.throttle(function (event) {
      //   //   if (event.lengthComputable) {
      //   //     attachment.loadedSize = event.loaded;
      //   //     $timeout(function () {
      //   //       $scope.totalProgress = $scope.compose.post.getTotalAttachProgress();
      //   //     });
      //   //   }
      //   // }, 1000),
      //   // onStart : function (e) {
      //   //   $scope.showUploadProgress = true;
      //   // }
      // };
      //
      // promises.push(NstSvcLoader.inject(NstSvcStore.uploadWithProgress(uploadSettings).then(function (handler) {
      //   var deferred = $q.defer();
      //
      //   // attachment.setUploadCanceler(handler.abort);
      //   handler.start().then(function (response) {
      //     attachment.setStatus(NST_ATTACHMENT_STATUS.ATTACHED);
      //     attachment.setId(response.data.universal_id);
      //
      //     deferred.resolve(attachment);
      //   }).catch(function (result) {
      //     $log.debug('Compose | Attach Upload Handler Error: ', result);
      //
      //     deferred.reject();
      //   });
      //
      //   return deferred.promise;
      // })).catch(function (error) {
      //   $log.debug('Compose | Attach Upload Error: ', error);
      // }));

      $q.all(promises).then(function () {
        deferred.resolve({
          attachment: attachment,
          request: request
        });
      });

      return deferred.promise;
    };

    vm.attachments.detach = function (id) {

    };

    vm.model.isModified = function () {
      vm.model.modified = (function (model) {
        var modified = false;

        modified = modified || model.subject.trim().length > 0;
        modified = modified || model.body.trim().length > 0;
        modified = modified || model.recipients.length > 0;
        modified = modified || model.attachments.length > 0;

        return modified;
      })(vm.model);

      $log.debug('Compose | Model Modified? ', vm.model.modified);

      return vm.model.modified;
    };

    // TODO: Call this while model is changed
    vm.model.check = function () {
      vm.model.isModified();

      vm.model.errors = (function (model) {
        var errors = [];

        if (0 == model.subject.trim().length) {
          errors.push({
            name: 'subject',
            message: 'Subject is Empty'
          });
        }

        if (0 == model.recipients.length) {
          errors.push({
            name: 'recipients',
            message: 'No Recipients are Specified'
          });
        }

        for (var k in model.recipients) {
          var recipient = model.recipients[k];
          if (recipient instanceof NstVmSelectTag) {
            if (recipient.data instanceof NstPlace) {
            } else if (recipient.data instanceof NstRecipient) {
            } else {
              errors.push({
                name: 'recipients',
                message: 'Unknown Recipient'
              });
            }
          } else if (recipient instanceof NstPlace) {
          } else if (recipient instanceof NstTinyPlace) {
          } else if (recipient instanceof NstVmPlace) {
          } else {
            errors.push({
              name: 'recipients',
              message: 'Unknown Recipient'
            });
          }
        }

        for (var k in model.attachments) {
          if (NST_ATTACHMENT_STATUS.ATTACHED != model.attachments[k].getStatus()) {
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

    vm.send = function () {
      return NstSvcLoader.inject((function () {
        var deferred = $q.defer();

        if (vm.model.saving) {
          // TODO: Already being in save process error
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
            post.setContentType('text/html');
            post.setAttachments(vm.model.attachments);
            vm.model.forwardedFrom && post.setForwardFrom(vm.model.forwardedFrom);
            vm.model.replyTo && post.setReplyTo(vm.model.replyTo);

            var places = [];
            var recipients = [];
            for (var k in vm.model.recipients) {
              var recipient = vm.model.recipients[k];
              if (recipient instanceof NstVmSelectTag) {
                if (recipient.data instanceof NstPlace) {
                  places.push(recipient.data);
                } else if (recipient.data instanceof NstRecipient) {
                  recipients.push(recipient.data);
                }
              } else if (recipient instanceof NstPlace) {
                places.push(recipient);
              } else if (recipient instanceof NstTinyPlace) {
                places.push(recipient);
              } else if (recipient instanceof NstVmPlace) {
                places.push(NstSvcPlaceFactory.parseTinyPlace({
                  _id: recipient.id,
                  name: recipient.name
                }));
              }
            }
            post.setRecipients(recipients);
            post.setPlaces(places);

            NstSvcPostFactory.send(post).then(deferred.resolve).catch(function (error) { deferred.reject([error]); });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (response) {
        vm.model.saving = false;
        vm.model.saved = true;

        // TODO: Check if one or more places failed

        toastr.success('Your message has been successfully sent.', 'Message Sent');
        $state.go('messages-sent');
      }).catch(function (errors) {
        vm.model.saving = false;
        toastr.error(errors.filter(
          function (v) { return !!v.message; }
        ).map(
          function (v, i) { return String(Number(i) + 1) + '. ' + v.message; }
        ).join("<br/>"), 'Compose Error');

        $log.debug('Compose | Error Occurred: ', errors);
      }));
    };
    vm.controls.right.push(new NstVmNavbarControl('Send', NST_NAVBAR_CONTROL_TYPE.BUTTON_SUCCESS, undefined, vm.send));

    vm.changeState = function (event, toState, toParams, fromState, fromParams, cancel) {
      $log.debug('Compose | Gonna Change State: ', toState);
      if (vm.model.saved || !vm.model.isModified()) {
        cancel.$destroy();
        $state.go(toState.name);
      } else {
        if (!$rootScope.modals['leave-confirm']) {
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
            cancel.$destroy();
            $state.go(toState.name);
          });
        }
      }
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    switch ($state.current.name) {
      case 'place-compose':
        if ($stateParams.placeId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.placeId) {
            $state.go('compose');
          } else {
            getPlace($stateParams.placeId).then(function (place) {
              // FIXME: Push Compose Recipient View Model Instead
              vm.model.recipients.push(new NstVmSelectTag({
                id: place.getId(),
                name: place.getName(),
                data: place
              }));
              vm.place = place;
            });
          }
        }
        break;

      case 'compose-forward':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('compose');
          } else {
            getPost($stateParams.postId).then(function (post) {
              vm.model.subject = NST_TERM_COMPOSE_PREFIX.FORWARD + post.getSubject();
              vm.model.body = post.getBody();
              vm.model.attachments = post.getAttachments();
              for (var k in vm.model.attachments) {
                vm.attachments.viewModels.push(NstSvcAttachmentMap.toAttachmentItem(vm.model.attachments[k]));
              }
              vm.model.forwardedFrom = post;
            });
          }
        }
        break;

      case 'compose-reply-all':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('compose');
          } else {
            getPost($stateParams.postId).then(function (post) {
              vm.model.replyTo = post;
              vm.model.subject = NST_TERM_COMPOSE_PREFIX.REPLY + post.getSubject();
              var places = post.getPlaces();
              for (var k in places) {
                var place = places[k];
                vm.model.recipients.push(new NstVmSelectTag({
                  id: place.getId(),
                  name: place.getName(),
                  data: place
                }));
              }
            });
          }
        }
        break;

      case 'compose-reply-sender':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('compose');
          } else {
            getPost($stateParams.postId).then(function (post) {
              vm.model.replyTo = post;
              vm.model.subject = NST_TERM_COMPOSE_PREFIX.REPLY + post.getSubject();

              // TODO: First search in post places to find a match then try to get from factory
              var postPlaces = post.getPlaces();
              var place = undefined;
              for (var k in postPlaces) {
                if (post.getSender().getId() == postPlaces[k].getId()) {
                  place = postPlaces[k];
                  break;
                }
              }

              var deferred = $q.defer();

              if (place) {
                deferred.resolve(place);
              } else {
                getPlace(post.getSender().getId()).then(function (place) {
                  deferred.resolve(place);
                });
              }

              return deferred.promise.then(function (place) {
                var deferred = $q.defer();

                vm.place = place;
                vm.model.recipients.push(new NstVmSelectTag({
                  id: place.getId(),
                  name: place.getName(),
                  data: place
                }));

                deferred.resolve(post);

                return deferred.promise;
              });
            })
          }
        }
        break;
    }

    NstSvcLoader.finished().then(function () {
    });

    /*****************************
     *****    State Methods   ****
     *****************************/

    /*****************************
     *****    Fetch Methods   ****
     *****************************/

    function getPlace(id) {
      return NstSvcLoader.inject(NstSvcTry.do(function () {
        return NstSvcPlaceFactory.get(id).catch(function (error) {
          var deferred = $q.defer();

          switch (error.getPrevious().getCode()) {
            case NST_SRV_ERROR.TIMEOUT:
              // Keep Retrying
              deferred.reject.apply(null, arguments);
              break;

            default:
              // Do not retry anymore
              deferred.resolve(NstSvcPlaceFactory.parseTinyPlace({ _id: id }));
              break;
          }

          return deferred.promise;
        })
      }));
    }

    function getPost(id) {
      return NstSvcLoader.inject(NstSvcTry.do(function () { return NstSvcPostFactory.get(id) }));
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    /*****************************
     *****    Other Methods   ****
     *****************************/

    $scope.deleteAttachment = function (attachment) {
      new $q(function (resolve, reject) {
        if (attachment.status === ATTACHMENT_STATUS.UPLOADING) {
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
  }
})();
