(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $rootScope, $state, $stateParams, $scope, $log, $timeout, $uibModalStack, $window,
                             _, toastr,
                             NST_SRV_ERROR, NST_PATTERN, NST_TERM_COMPOSE_PREFIX, NST_DEFAULT, NST_NAVBAR_CONTROL_TYPE, NST_ATTACHMENT_STATUS, NST_FILE_TYPE, SvcCardCtrlAffix,
                             NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore, NstSvcFileType, NstSvcAttachmentMap, NstSvcSidebar, NstUtility, NstSvcTranslation, NstSvcModal,
                             NstTinyPlace, NstVmPlace, NstVmSelectTag, NstRecipient, NstVmNavbarControl, NstLocalResource, NstSvcPostMap, NstPicture) {
    var vm = this;
    vm.quickMode = false;
    vm.focus = false;
    vm.mouseIn = false;
    var eventReferences = [];
    vm.makeChangeForWatchers = 0;

    if (vm.mode == 'quick') {
      vm.quickMode = true;
    }

    function changeAffixes() {
      SvcCardCtrlAffix.change();
    }

    vm.changeAffixesDebounce = _.debounce(changeAffixes, 1000);

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

    vm.search = {
      results: []
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
    $scope.$watch(function () {
      return vm.model.body
    }, function () {
      return vm.changeAffixesDebounce();
    });

    vm.focusBox = function () {
      vm.focus = true;
    };

    vm.blurBox = function () {
      if (vm.model.subject.length == 0 && vm.model.attachments.length == 0 && vm.model.body.length == 0 && !vm.mouseIn) {
        vm.focus = false;
      }
    };

    vm.place = undefined;

    var isRTL = $rootScope._direction;
    var lang = isRTL == 'rtl' ? 'fa' : 'en';

    vm.controls = {
      left: [
        new NstVmNavbarControl(NstSvcTranslation.get('Discard'), NST_NAVBAR_CONTROL_TYPE.BUTTON_BACK, null, function ($event) {
          // TODO: Fix navigating to previous state
          $event.preventDefault();
          $rootScope.goToLastState();
        })
      ],
      right: [
        new NstVmNavbarControl(NstSvcTranslation.get('Attach files'), NST_NAVBAR_CONTROL_TYPE.BUTTON_INPUT_LABEL, undefined, undefined, {id: vm.attachments.elementId})
      ]
    };

    if (vm.quickMode) {
      $scope.editorOptions = {
        language: lang,
        contentsLangDirection: isRTL,
        contentsCss: 'body {overflow:visible;}',
        enableTabKeyTools: true,
        tabSpaces: 4,
        startupFocus: false,
        extraPlugins: 'sharedspace,font,language,bidi,justify,colorbutton,autogrow,divarea',
        autoGrow_minHeight: 230,
        sharedSpaces: {
          top: 'editor-btn',
          bottom: 'editor-txt'
        },
        toolbar: [
          ["Link","FontSize"],
          ["Bold"],
          ["JustifyRight", "BidiLtr", "BidiRtl"]
        ],
        fontSize_sizes: 'Small/12px;Normal/14px;Large/18px;',
        colorButton_colors: 'CF5D4E,454545,FFF,CCC,DDD,CCEAEE,66AB16',
        // Remove the redundant buttons from toolbar groups defined above.
        //removeButtons: 'Strike,Subscript,Superscript,Anchor,Specialchar',
        removePlugins: 'resize,elementspath,contextmenu,liststyle,tabletools'
      };

    } else {
      $scope.editorOptions = {
        language: lang,
        contentsLangDirection: isRTL,
        contentsCss: 'body {overflow:visible;}',
        placeholder: 'Write something...',
        height: 230,
        enableTabKeyTools: true,
        tabSpaces: 4,
        startupFocus: false,
        extraPlugins: 'sharedspace,font,language,bidi,justify,colorbutton,autogrow,confighelper,divarea,autolink',
        autoGrow_minHeight: 230,
        sharedSpaces: {
          top: 'editor-btn',
          bottom: 'editor-txt'
        },
        toolbar: [
          ["Link", "FontSize"],
          ["Bold", "Italic", "Underline"],
          ["JustifyRight", "TextColor", "BidiLtr", "BidiRtl"]
        ],
        fontSize_sizes: 'Small/12px;Normal/14px;Large/18px;',
        colorButton_colors: 'CF5D4E,454545,FFF,CCC,DDD,CCEAEE,66AB16',
        // Remove the redundant buttons from toolbar groups defined above.
        //removeButtons: 'Strike,Subscript,Superscript,Anchor,Specialchar',
        removePlugins: 'resize,elementspath,wysiwygarea,contextmenu,liststyle,tabletools'
      };

    }

    // setTimeout(function () {
    //   vm.editor = $("textarea").controller('ckeditor').instance;
    // },1000);

    (function () {
      if ($stateParams.attachments && $stateParams.attachments.length > 0) {
        vm.model.attachments = _.map($stateParams.attachments, function (item) {
          item.status = NST_ATTACHMENT_STATUS.ATTACHED;
          return item;
        });
        vm.attachments.viewModels = _.map($stateParams.attachments, NstSvcAttachmentMap.toEditableAttachmentItem);
        vm.attachments.size.total += _.sum(_.map($stateParams.attachments, 'size'));
        vm.attachments.size.uploaded += _.sum(_.map($stateParams.attachments, 'size'));
      }
      vm.inputPlaceHolderLabel = NstSvcTranslation.get("Enter a Place name or a Nested address...");

      if (vm.quickMode) {
        addRecipients($stateParams.placeId);
      }

      eventReferences.push($scope.$on('modal.closing', function (event) {
        var confirm = _.size(_.trim(vm.model.subject)) > 0 || _.size(_.trim(vm.model.body)) || _.size(vm.model.attachments) > 0;
        if (confirm && !vm.finish) {
          event.preventDefault();
          NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("By discarding this message, you will lose your draft. Are you sure you want to discard?")).then(function () {
            vm.finish = true;
            $uibModalStack.dismissAll();
          });
        }
      }));

    })();
    /*****************************
     ***** Controller Methods ****
     *****************************/

    NstSvcSidebar.setOnItemClick(onPlaceSelected);


    vm.subjectKeyDown = function (e) {
      vm.mouseIn = true;
      vm.changeAffixesDebounce();
      if (e.which == 13) {

        //FixME focus on correct and exists editor
        //FixME backspace on editor to subject
        $window.CKEDITOR.instances.editor1.focus();
      }
    };


    vm.editorKeyDown = function (e) {
      if (e.which == 8) {

        if (vm.quickMode){
          $('.quick-message-wrp [name="subject"]').focus();
        }
      }
    };

    vm.search.fn = function (query) {
      var initPlace = NstSvcPlaceFactory.parseTinyPlace({
        _id: query,
        name: query
      });
      // if (query.length)
      //   vm.search.results = [new NstVmPlace(initPlace)];
      return NstSvcPlaceFactory.search(query).then(function (places) {
        vm.search.results = [];
        places.map(function (place) {
          if (place && vm.model.recipients.filter(function (obj) {
              return (obj.id === place.id);
            }).length === 0) {
            if (place.id === query) {
              initPlace = new NstVmPlace(place);
            } else {
              vm.search.results.push(new NstVmPlace(place));
            }
          }
        });
        if (initPlace.id) {
          if (initPlace.id.indexOf('@') > -1) {
            initPlace.isEmail = true;
            initPlace.isEmailValid = NST_PATTERN.EMAIL.test(initPlace.id)
          }
          vm.search.results.push(initPlace);
        }
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
            tag.data = NstSvcPlaceFactory.parseTinyPlace({_id: text});
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
      return {isTag: false, name: text};
    };

    vm.attachments.fileSelected = function (event) {
      var files = event.currentTarget.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function (request) {
        });
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
            original: uri,
            preview: uri,
            x32: uri,
            x64: uri,
            x128: uri
          }));
        }

        qRead.resolve(uri);
      };
      reader.readAsDataURL(file);

      qRead.promise.then(function (uri) {
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
      }).then(deferred.resolve);

      return deferred.promise;
    };

    vm.attachments.detach = function (vmAttachment) {
      var id = vmAttachment.id;
      var attachment = _.find(vm.model.attachments, {id: id});
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

    vm.fullCompose = function () {
      $('body').toggleClass('fullCompose');
      if ( $('body').hasClass('fullCompose')) {
        vm.makeChangeForWatchers++;
      }
    };

    vm.send = function () {
      return (function () {
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
            }).catch(function (error) {
              deferred.reject([error]);
            });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (response) {
        vm.model.saving = false;
        vm.model.saved = true;

        // TODO: Check if one or more places failed
        vm.finish = true;

        NstSvcPostFactory.get(response.post.id).then(function (res) {
          var msg = NstSvcPostMap.toMessage(res);
          $rootScope.$emit('post-quick', msg);
        });
        $uibModalStack.dismissAll();
        vm.model.subject = "";
        vm.model.body = "";
        vm.attachments.viewModels = [];

        toastr.success(NstSvcTranslation.get('Your message has been successfully sent.'), NstSvcTranslation.get('Message Sent'));

        if (response.noPermitPlaces.length > 0) {
          var text = NstUtility.string.format(NstSvcTranslation.get('Your message hasn\'t been successfully sent to {0}'), response.noPermitPlaces.join(','));
          toastr.warning(text, NstSvcTranslation.get('Message didn\'t send'));
        }


        return $q(function (res) {
          res(response);
        });
      }).catch(function (errors) {
        vm.model.saving = false;
        toastr.error(errors.filter(
          function (v) {
            return !!v.message;
          }
        ).map(
          function (v, i) {
            return String(Number(i) + 1) + '. ' + v.message;
          }
        ).join("<br/>"), 'Compose Error');

        $log.debug('Compose | Error Occurred: ', errors);

        return $q(function (res, rej) {
          rej(errors);
        });

      });
    };
    vm.controls.right.push(new NstVmNavbarControl(NstSvcTranslation.get('Send'), NST_NAVBAR_CONTROL_TYPE.BUTTON_SUCCESS, undefined, vm.send));

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    switch ($state.current.name) {
      case 'app.place-compose':
        if ($stateParams.placeId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.placeId) {
            $state.go('app.compose');
          } else {
            if (NST_PATTERN.EMAIL.test($stateParams.placeId)) {
              var tag = new NstVmSelectTag({
                id: $stateParams.placeId,
                name: $stateParams.placeId,
                isEmail: true,
                isEmailValid: true,
                data: new NstRecipient({
                  id: $stateParams.placeId,
                  email: $stateParams.placeId,
                  name: $stateParams.placeId
                })
              });
              vm.model.recipients.push(tag);
            } else {
              getPlace($stateParams.placeId).then(function (place) {
                // FIXME: Push Compose Recipient View Model Instead
                vm.model.recipients.push(new NstVmSelectTag({
                  id: place.id,
                  name: place.name,
                  data: place
                }));
                vm.place = place;
              });
            }
          }
        }
        break;

      case 'app.compose-forward':
        if ($stateParams.postId) {
          if (NST_DEFAULT.STATE_PARAM == $stateParams.postId) {
            $state.go('app.compose');
          } else {
            getPost($stateParams.postId).then(function (post) {
              vm.model.subject = post.getSubject();
              vm.model.body = post.getBody();
              vm.model.attachments = post.getAttachments();
              for (var k in vm.model.attachments) {
                vm.model.attachments[k].status = NST_ATTACHMENT_STATUS.ATTACHED;
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

              var recipients = post.recipients;
              for (var j in recipients) {
                vm.model.recipients.push(new NstVmSelectTag({
                  id: recipients[j].id,
                  name: recipients[j].name,
                  isEmail: true,
                  isEmailValid: true,
                  data: new NstRecipient({
                    id: recipients[j].id,
                    email: recipients[j].email,
                    name: recipients[j].name
                  })
                }));
              }


              var email = post.getEmailSender();
              if (email) {
                var tag = new NstVmSelectTag({
                  id: email.id,
                  name: email.name || email.id,
                  isEmail: true,
                  isEmailValid: true,
                  data: new NstRecipient({
                    id: email.id,
                    email: email.id,
                    name: email.name || email.id
                  })
                });
                vm.model.recipients.push(tag);
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
              vm.model.subject = post.getSubject();

              // TODO: First search in post places to find a match then try to get from factory
              var postPlaces = post.getPlaces();
              var place = undefined;
              if (post.internal) {
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
              } else {
                var email = post.getEmailSender();

                var tag = new NstVmSelectTag({
                  id: email.id,
                  name: email.name || email.id,
                  isEmail: true,
                  isEmailValid: true,
                  data: new NstRecipient({
                    id: email.id,
                    email: email.id,
                    name: email.name || email.id
                  })
                });
                vm.model.recipients.push(tag);
              }
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

    /*****************************
     *****    State Methods   ****
     *****************************/

    /*****************************
     *****    Fetch Methods   ****
     *****************************/

    function getPlace(id) {
      return NstSvcPlaceFactory.get(id).catch(function (error) {
        var deferred = $q.defer();

        switch (error.getPrevious().getCode()) {
          case NST_SRV_ERROR.TIMEOUT:
            // Keep Retrying
            deferred.reject.apply(null, arguments);
            break;

          default:
            // Do not retry anymore
            deferred.resolve(NstSvcPlaceFactory.parseTinyPlace({_id: id}));
            break;
        }

        return deferred.promise;
      });
    }

    function getPost(id) {
      return NstSvcPostFactory.get(id,true);
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
      if (!_.some(vm.model.recipients, {id: place.id})) {
        vm.model.recipients.push(new NstVmSelectTag({
          id: place.id,
          name: place.name,
          data: new NstTinyPlace(place)
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
        vm.attachments.attach(files[i].file).then(function (request) {
        });
        files[i].deleteFile();
      }
    });

    $scope.$on('$destroy', function () {
      NstSvcSidebar.removeOnItemClick();
      _.forEach($window.CKEDITOR.instances, function (instance) {
        instance.removeAllListeners();
        $window.CKEDITOR.remove(instance);
      });

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });

    });
  }
})();
