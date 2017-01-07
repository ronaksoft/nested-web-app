(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $rootScope, $state, $stateParams, $scope, $log, $uibModal, $timeout,
                             _, toastr,
                             NST_SRV_ERROR, NST_PATTERN, NST_TERM_COMPOSE_PREFIX, NST_DEFAULT, NST_NAVBAR_CONTROL_TYPE, NST_ATTACHMENT_STATUS, NST_FILE_TYPE,
                             NstSvcLoader, NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore, NstSvcFileType, NstSvcAttachmentMap, NstSvcSidebar, NstUtility, NstSvcTranslation,
                             NstTinyPlace, NstVmPlace, NstVmSelectTag, NstRecipient, NstVmNavbarControl, NstLocalResource, NstVmPlaceBadge, NstPicture) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    $timeout(function () {
      $rootScope.navView = false
    });

    vm.model = {
      recipients: [],
      attachments: [],
      attachfiles: {},
      subject: '',
      body: '',
      forwardedFrom: null,
      replyTo: null,
      errors: [],
      modified: false,
      ready: false,
      saving: false,
      saved: false
    };

    (function () {
      if ($stateParams.attachments && $stateParams.attachments.length > 0) {
        NstSvcAttachmentFactory.load($stateParams.attachments).then(function (attachments) {
          vm.model.attachments = attachments;
          vm.attachments.viewModels = _.map(attachments, NstSvcAttachmentMap.toEditableAttachmentItem);
          vm.attachments.size.total += _.sum(_.map(attachments, 'size'));
          vm.attachments.size.uploaded += _.sum(_.map(attachments, 'size'));
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get('An error has occurred in trying to attach files.'));
        });

      }
      vm.inputPlaceHolderLabel = NstSvcTranslation.get("Enter a Place name or a Nested address...");
    })();

    vm.search = {
      results: [],
    };

    vm.attachments = {
      elementId: 'attach',
      viewModels: [],
      requests: {},
      size: {
        uploaded: 0,
        total: 0
      }
    };

    vm.place = undefined;

    vm.controls = {
      left: [
        new NstVmNavbarControl(NstSvcTranslation.get('Discard'), NST_NAVBAR_CONTROL_TYPE.BUTTON_BACK, null, function ($event) {
          // TODO: Fix navigating to previous state
          $event.preventDefault();
          $rootScope.goToLastState();
        })
      ],
      right: [
        new NstVmNavbarControl(NstSvcTranslation.get('Attach files'), NST_NAVBAR_CONTROL_TYPE.BUTTON_INPUT_LABEL, undefined, undefined, { id: vm.attachments.elementId })
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
        height : 200,
        //content_css : "../styles/tinymce.css",
        content_style : "@font-face {font-family: 'OpenSans';" +
        "src: url('../assets/fonts/OpenSans/OpenSans-Regular.woff2') format('woff2')," +
        "url('../assets/fonts/OpenSans/OpenSans-Regular.woff') format('woff')," +
        "url('../assets/fonts/OpenSans/OpenSans-Regular.ttf')  format('truetype')," +
        "url('../assets/fonts/OpenSans/OpenSans-Regular.svg#svgFontName') format('svg');}" +
        "@font-face {font-family: 'YekanBakh';" +
        "src: url('../assets/fonts/YekanBakh/YekanBakhNestedWeb-Regular.woff2') format('woff2')," +
        "url('../assets/fonts/YekanBakh/YekanBakhNestedWeb-Regular.woff') format('woff')," +
        "url('../assets/fonts/YekanBakh/YekanBakhNestedWeb-Regular.ttf')  format('truetype')," +
        "url('../assets/fonts/YekanBakh/YekanBakhNestedWeb-Regular.svg#svgFontName') format('svg');}" +
        "br{opacity:0}" +
        "body{font-family: 'YekanBakh','OpenSans'!important;font-size: 12pt!important;}",
        plugins : 'autolink link image lists charmap directionality textcolor colorpicker emoticons paste',
        // contextmenu: "copy | paste inserttable | link inserttable | cell row column deletetable",
        // contextmenu_never_use_native: true,
        toolbar: 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | formatselect fontselect fontsizeselect forecolor backcolor| ltr rtl | bullist numlist | outdent indent | link',
        skin: 'lightgray',
        theme : 'modern',
        setup: function (editor) {
          editor.on('init', function (e) {
            $scope.activeEditorElement = e.target.contentDocument.activeElement;
          });
          editor.on('keydown', function(e) {
            if(e.keyCode == 13 && $(editor.contentDocument.activeElement).atwho('isSelecting'))
              return false
          })
        }
      }
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    NstSvcSidebar.setOnItemClick(onPlaceSelected);

    vm.configs.tinymce.onChange = function (event) {
      // Put logic here for keypress and cut/paste changes
    };

    vm.search.fn = function(query) {
      var initPlace = NstSvcPlaceFactory.parseTinyPlace({
        _id: query,
        name: query
      });
      // if (query.length)
      //   vm.search.results = [new NstVmPlace(initPlace)];
      return NstSvcPlaceFactory.search(query).then(function(places) {
        vm.search.results = [];
        places.map(function(place) {
          if (place && vm.model.recipients.filter(function(obj) {
              return (obj.id === place.id);
            }).length === 0) {
            if (place.id === query) {
              initPlace = new NstVmPlace(place);
            } else {
              vm.search.results.push(new NstVmPlace(place));
            }
          }
        });
        if (initPlace.id)
          vm.search.results.push(initPlace);
      }).catch(function () {
        vm.search.results = [];
        if (initPlace.id)
          vm.search.results.push(initPlace);
      });
    };

    vm.search.tagger = function (text) {
      // TODO: To use new class and also check for hidden places
      var isPlaceId = 0 == text.split('.').filter(function (v, i) {
          return !(0 == i ? NST_PATTERN.GRAND_PLACE_ID.test(v) : NST_PATTERN.SUB_PLACE_ID.test(v));
      }).length;
      var isEmail = NST_PATTERN.EMAIL.test(text);

      if (isPlaceId) {
        var tag = new NstVmSelectTag({
          id: text,
          name: text,
          data: NstSvcPlaceFactory.getTiny(text).then(function (place) {
            // $timeout(function () {
              tag.name = place.getName();
              tag.data = place;
            // });
          }).catch(function () {
            // $timeout(function () {
              tag.isTag = false;
              tag.data = NstSvcPlaceFactory.parseTinyPlace({ _id: text });
            // });
          })
        });
        return tag;
      } else if (isEmail) {
        var tag = new NstVmSelectTag({
          id: text,
          name: text,
          data: new NstRecipient({
            id: text,
            email: text,
            name: text
          })
        });
        return tag;
      }
      return {isTag : false, name: text};
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
      }

      NstUtility.collection.dropById(vm.model.attachments, id);
      NstUtility.collection.dropById(vm.attachments.viewModels, id);
      vm.attachments.size.uploaded -= vmAttachment.uploadedSize;
      vm.attachments.size.total -= attachment.getSize();
    }

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

        if (0 == model.recipients.length) {
          errors.push({
            name: 'recipients',
            message: 'No Recipients are Specified'
          });
        }

        for (var k in model.recipients) {
          var recipient = model.recipients[k];
          if (recipient instanceof NstVmSelectTag) {
            if (recipient.data instanceof NstTinyPlace) {
            } else if (recipient.data instanceof NstRecipient) {
            } else {
              errors.push({
                name: 'recipients',
                message: 'Unknown Recipient'
              });
            }
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
            post.setContentType('text/html');
            post.setAttachments(vm.model.attachments);
            vm.model.forwardedFrom && post.setForwardFrom(vm.model.forwardedFrom);
            vm.model.replyTo && post.setReplyTo(vm.model.replyTo);

            var places = [];
            var recipients = [];
            for (var k in vm.model.recipients) {
              var recipient = vm.model.recipients[k];
              if (recipient instanceof NstVmSelectTag) {
                if (recipient.data instanceof NstTinyPlace) {
                  places.push(recipient.data);
                } else if (recipient.data instanceof NstRecipient) {
                  recipients.push(recipient.data);
                }
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

            NstSvcPostFactory.send(post).then(function (response) {
              deferred.resolve(response);
            }).catch(function (error) { deferred.reject([error]); });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (response) {
        vm.model.saving = false;
        vm.model.saved = true;

        // TODO: Check if one or more places failed

        toastr.success(NstSvcTranslation.get('Your message has been successfully sent.'), NstSvcTranslation.get('Message Sent'));

        if(response.noPermitPlaces.length > 0){
          var text = NstUtility.string.format(NstSvcTranslation.get('Your message hasn\'t been successfully sent to {0}'), response.noPermitPlaces.join(','));
          toastr.warning(text, NstSvcTranslation.get('Message didn\'t send'));
        }

        $rootScope.goToLastState();

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
    vm.controls.right.push(new NstVmNavbarControl(NstSvcTranslation.get('Send'), NST_NAVBAR_CONTROL_TYPE.BUTTON_SUCCESS, undefined, vm.send));

    vm.changeState = function (event, toState, toParams, fromState, fromParams, cancel) {
     $log.debug('Compose | Leaving Page');
      if (vm.model.saved || !vm.model.isModified()) {
        cancel.$destroy();
        $state.go(toState.name, toParams);
      } else {
//        if (!$rootScope.modals['leave-confirm']) {
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
            $state.go(toState.name, toParams);
          });
//        }
      }
    };
    /*****************************
     *****  Controller Logic  ****
     *****************************/

    switch ($state.current.name) {
      case 'app.place-compose':
        if ($stateParams.placeId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.placeId) {
            $state.go('app.compose');
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

      case 'app.compose-forward':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('app.compose');
          } else {
            getPost($stateParams.postId).then(function (post) {
              vm.model.subject = NST_TERM_COMPOSE_PREFIX.FORWARD + post.getSubject();
              vm.model.body = post.getBody();
              vm.model.attachments = post.getAttachments();
              for (var k in vm.model.attachments) {
                vm.model.attachments[k].setStatus(NST_ATTACHMENT_STATUS.ATTACHED);
                vm.attachments.viewModels.push(NstSvcAttachmentMap.toEditableAttachmentItem(vm.model.attachments[k]));
                vm.attachments.size.total += vm.model.attachments[k].getSize();
                vm.attachments.size.uploaded += vm.model.attachments[k].getSize();
              }
              vm.model.forwardedFrom = post;
            });
          }
        }
        break;

      case 'app.compose-reply-all':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('app.compose');
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

      case 'app.compose-reply-sender':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('app.compose');
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

    function addRecipients(placeId) {
      var deferred = $q.defer();

      var tag = _.find(vm.model.recipients, function (item) {
        return item.id === placeId;
      });

      if (tag) {
        deferred.resolve(tag);
      } else {
        getPlace(placeId).then(function (place) {
          var tag = new NstVmSelectTag({
            id: place.getId(),
            name: place.getName(),
            data: place
          });

          vm.model.recipients.push(tag);
          deferred.resolve(tag);
        }).catch(deferred.reject);
      }

      return deferred.promise;
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
      return NstSvcLoader.inject(
         NstSvcPlaceFactory.get(id).catch(function (error) {
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
      );
    }

    function getPost(id) {
      return NstSvcLoader.inject(NstSvcPostFactory.get(id));
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    /*****************************
     *****    Other Methods   ****
     *****************************/

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

    function onPlaceSelected(place) {
      // addRecipients(placeId);
      if (!_.some(vm.model.recipients, { id : place.id })) {
        vm.model.recipients.push(new NstVmSelectTag({
          id : place.id,
          name : place.name,
          data : new NstTinyPlace(place)
        }));
      }
    }
    // Listen for when the dnd has been configured.
    vm.attachfiles = {};

    $scope.$on('$dropletReady', function whenDropletReady() {
      vm.attachfiles.allowedExtensions([/.+/]);
      vm.attachfiles.useArray(false);

    });
    $scope.$on('$dropletFileAdded', function startupload() {

      var files = vm.attachfiles.getFiles(vm.attachfiles.FILE_TYPES.VALID);
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i].file).then(function (request) {});
        files[i].deleteFile();
      }
    });

    $scope.$on('$destroy', function () {
      NstSvcSidebar.removeOnItemClick();
    });
  }
})();
