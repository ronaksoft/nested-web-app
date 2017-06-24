(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $rootScope, $state, $stateParams, $scope, $log, $timeout, $uibModalStack, $window,
                             _, toastr,
                             NST_SRV_ERROR, NST_PATTERN, NST_CONFIG, NST_DEFAULT, NST_ATTACHMENT_STATUS, NST_STORE_UPLOAD_TYPE,
                             NST_FILE_TYPE, SvcCardCtrlAffix,
                             NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore,
                             NstSvcFileType, NstSvcAttachmentMap, NstSvcSidebar, NstSvcSystemConstants,
                             NstUtility, NstSvcTranslation, NstSvcModal, NstSvcPostDraft,
                             NstSvcUserFactory, NstSvcLogger, NstSvcAuth,
                             NstTinyPlace, NstVmPlace, NstVmSelectTag, NstLocalResource, NstPicture,
                             NstPostDraft, NstTinyUser, NstVmUser, NstPost) {
    var vm = this;
    vm.quickMode = false;
    vm.focus = false;
    vm.collapse = false;
    vm.mouseIn = false;
    var eventReferences = [];
    var discardCanceler = null;
    var systemConstants = {};
    vm.makeChangeForWatchers = 0;
    vm.clear = clear;
    vm.scroll = scroll;
    vm.searchRecipients = _.debounce(searchRecipients, 400);
    vm.emojiTarget = 'title';
    vm.haveComment = true;
    vm.focusBody = false;
    vm.targetLimit;

    if (vm.mode == 'quick') {
      vm.quickMode = true;
    }

    function changeAffixes() {
      NstSvcLogger.debug4('Compose | Rearrange the the items in affixer post service :');
      SvcCardCtrlAffix.change();
    }

    vm.changeAffixesDebounce = _.debounce(changeAffixes, 1000);

    /*****************************
     *** Controller Properties ***
     *****************************/

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
      saved: false,
      comment: true
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
      vm.emojiTarget = 'title';
      NstSvcLogger.debug4('Compose | Compose Box is focused');
      vm.focus = true;
      vm.collapse = true;
      vm.firstUp = true;
    };

    vm.blurBox = function () {
      NstSvcLogger.debug4('Compose | Is subject or body filled to stop collapsing quick message ?!');
      if (vm.model.subject.length == 0 && vm.model.attachments.length == 0 && vm.model.body.length == 0 && !vm.mouseIn) {
        NstSvcLogger.debug4('Compose | Compose box is blured');
        vm.focus = false;
      }
    };

    vm.place = undefined;

    var isRTL = $rootScope._direction;
    var lang = isRTL == 'rtl' ? 'fa' : 'en';

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
        NstSvcLogger.debug4('Compose | compose is in quick mode');
        NstSvcLogger.debug4('Compose | insert place id as recipient in quick post');
        addRecipients($stateParams.placeId);
        eventReferences.push($scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
          var confirm = _.size(_.trim(vm.model.subject)) > 0 || _.size(_.trim(vm.model.body)) || _.size(vm.model.attachments) > 0;
          if (confirm && !vm.finish) {
            event.preventDefault();

            NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("By discarding this message, you will lose your draft. Are you sure you want to discard?")).then(function (result) {
              if (result) {
                vm.finish = true;
                $state.go(toState.name, toParams);
              }
            });
          }
        }));

      } else {
        NstSvcLogger.debug4('Compose | compose is in modal');
        eventReferences.push($scope.$on('modal.closing', function (event) {
          if (shouldSaveDraft() && !vm.finish) {
            event.preventDefault();

            if ($state.current.options && $state.current.options.supportDraft) {
              NstSvcLogger.debug4('Compose | show discard modal');
              NstSvcModal.confirm(
                NstSvcTranslation.get("Confirm"),
                NstSvcTranslation.get("By discarding this message, you will lose your draft. Are you sure you want to discard?"),
                {
                  yes: NstSvcTranslation.get("Discard"),
                  no: NstSvcTranslation.get("Draft")
                }
              ).then(function (confirmed) {
                if (confirmed) {
                  NstSvcLogger.debug4('Compose | cancel on discard modal');
                  discardDraft();
                } else {
                  NstSvcLogger.debug4('Compose | confirm on discard modal');
                  saveDraft();
                }

                vm.finish = true;
                $uibModalStack.dismissAll();
              });

            } else {
              NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("By discarding this message, you will lose your draft. Are you sure you want to discard?")).then(function () {
                vm.finish = true;
                $uibModalStack.dismissAll();
              });
            }

          }
        }));

      }

      openDraft();
      NstSvcSystemConstants.get().then(function (result) {
        systemConstants = result;
        vm.targetLimit = systemConstants.post_max_targets || 10;
      })
        .catch(function () {
          vm.targetLimit = 10;
        });
    })();

    function saveDraft() {
      NstSvcLogger.debug4('Compose | Saving post model as draft');
      var draft = new NstPostDraft();
      draft.subject = vm.model.subject;
      draft.body = vm.model.body;
      draft.attachments = _.map(vm.model.attachments, 'id');
      draft.recipients = _.map(vm.model.recipients, 'id');
      NstSvcPostDraft.save(draft);
      $rootScope.$broadcast('draft-change');
    }

    function discardDraft() {
      NstSvcLogger.debug4('Compose | discarding draft');
      NstSvcPostDraft.discard();
      $rootScope.$broadcast('draft-change');
    }

    function shouldSaveDraft() {
      NstSvcLogger.debug4('Compose | is this model need to be save in draft ?!');
      return _.size(_.trim(vm.model.subject)) > 0 ||
        _.size(_.trim(vm.model.body)) ||
        _.size(vm.model.attachments) > 0 ||
        _.size(vm.model.recipients) > 0;
    }

    /*****************************
     ***** Controller Methods ****
     *****************************/

    function openDraft() {
      NstSvcLogger.debug4('Compose | check for Loading draft ?!');
      if (!NstSvcPostDraft.has()) {
        NstSvcLogger.debug4('Compose | No draft exists');
        return;
      }
      NstSvcLogger.debug4('Compose | check options for loading draft');
      if ($state.current.options && $state.current.options.supportDraft) {
        loadDraft();
      }
    }

    function loadDraft() {
      NstSvcLogger.debug4('Compose | loading draft');
      var deferred = $q.defer();

      var draft = NstSvcPostDraft.get();
      vm.model.subject = draft.subject;
      vm.model.body = draft.body;
      $q.all(_.map(draft.attachments, function (attachmentId) {
        return NstSvcAttachmentFactory.getOne(attachmentId)
      })).then(function (attachments) {
        vm.model.attachments = _.map(attachments, function (item) {
          item.status = NST_ATTACHMENT_STATUS.ATTACHED;
          return item;
        });
        vm.attachments.viewModels = _.map(attachments, function (attachment) {
          return NstSvcAttachmentMap.toEditableAttachmentItem(attachment);
        });
        vm.attachments.size.total += _.sum(_.map(attachments, 'size'));
        vm.attachments.size.uploaded += _.sum(_.map(attachments, 'size'));
      }).catch(deferred.reject);

      $q.all(_.map(draft.recipients, function (recipientId) {

        if (NST_PATTERN.EMAIL.test(recipientId)) {
          return NstSvcUserFactory.getTinySafe(recipientId);
        } else {
          return NstSvcPlaceFactory.getTinySafe(recipientId);
        }
      })).then(function (recipients) {

        vm.model.recipients = recipients.map(function (recipient) {
          return new NstVmSelectTag(recipient);
        });
        deferred.resolve(draft);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    NstSvcSidebar.setOnItemClick(onPlaceSelected);


    vm.subjectKeyDown = _.debounce(subjectKeyDown,100)

    function subjectKeyDown(e) {
      NstSvcLogger.debug4('Compose | User types in subject');
      vm.mouseIn = true;
      vm.changeAffixesDebounce();
      if (e.which == 13) {
        NstSvcLogger.debug4('Compose | User pressed Enter on subject and focus will goes on the compose body');
        e.preventDefault();
        vm.froalaOpts.froalaEditor('events.focus');
      }
    };


    vm.editorKeyDown = function (e) {
      NstSvcLogger.debug4('Compose | User types in compose body');
      if (e.which == 8) {
        NstSvcLogger.debug4('Compose | User pressed back on compose body and focus will goes on the subject');
        if (vm.quickMode) {
          $('.quick-message-wrp [name="subject"]').focus();
        }
      }
    };

    vm.search.fn = function (query) {
      vm.search.results = [];
      vm.searchRecipients(query);
    };

    function searchRecipients(query) {
      NstSvcLogger.debug4('Compose | Search recipients with query : ', query);
      return NstSvcPlaceFactory.searchForCompose(query).then(function (results) {
        NstSvcLogger.debug4('Compose | Searched recipients for binding them in html', results);
        vm.search.results = _.chain(results.places).uniqBy('id').map(function (place) {
          return new NstVmSelectTag(place);
        }).value();

        _.forEach(results.recipients, function (recipient) {
          var initRecipient = new NstVmSelectTag({
            id: recipient,
            name: recipient
          });
          vm.search.results.push(initRecipient);
        });

        var initPlace = new NstVmSelectTag({
          id: query,
          name: query
        });

        if (initPlace.isValid) {
          vm.search.results.push(initPlace);
        }

      }).catch(function () {
        NstSvcLogger.debug4('Compose | not recipients found');
        vm.search.results = [];
        var initPlace = new NstVmSelectTag({
          id: query,
          name: query
        });

        if (initPlace.id)
          vm.search.results.push(initPlace);
      });

    }

    function getStoreType(file) {
      var group = NstSvcFileType.getType(file.type);

      if (NstSvcFileType.getSuffix(file.name) === 'gif') {
        return NST_STORE_UPLOAD_TYPE.GIF;
      }

      if (group === NST_FILE_TYPE.IMAGE) {
        return NST_STORE_UPLOAD_TYPE.IMAGE;
      } else if (group === NST_FILE_TYPE.VIDEO) {
        return NST_STORE_UPLOAD_TYPE.VIDEO;
      } else if (group === NST_FILE_TYPE.AUDIO) {
        return NST_STORE_UPLOAD_TYPE.AUDIO;
      } else {
        return NST_STORE_UPLOAD_TYPE.FILE;
      }
    }

    var onFileSelect = _.curry(function (group, event) {
      NstSvcLogger.debug4('Compose | some files added into compose');
      var files = event.currentTarget.files;
      var type = NST_STORE_UPLOAD_TYPE.File;
      if (group === 'media') {
        type = getStoreType(files[0]);
      }

      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i], type).then(function (request) {
        });
      }
      event.currentTarget.value = "";
    });

    vm.attachments.fileSelected = onFileSelect('file');
    vm.attachments.mediaSelected = onFileSelect('media');


    vm.attachments.attach = function (file, group) {
      NstSvcLogger.debug4('Compose | Check if the attached files are more than the limit size');
      NstSvcLogger.debug4('Compose | Max allowed attachements is: ', systemConstants.post_max_attachments);
      var filesCount = _.size(vm.model.attachments);
      NstSvcLogger.debug4('Compose | The number of currently attached files is: ', filesCount);
      if (systemConstants && systemConstants.post_max_attachments <= filesCount) {
        toastr.error(NstUtility.string.format(NstSvcTranslation.get("You are not allowed to attach more than {0} files. Please contact Nested administrator."), systemConstants.post_max_attachments));
        return;
      }
      NstSvcLogger.debug4('Compose | Is this file higher than maximum upload size ?!');
      if (file.size > NST_CONFIG.UPLOAD_SIZE_LIMIT) {
        toastr.error(NstSvcTranslation.get("Maximum upload size is 100 MB"));
        return;
      }
      var deferred = $q.defer();
      var readyPromises = [];

      $log.debug('Compose | File Attach: ', file);

      // Create Attachment Model
      var attachment = NstSvcAttachmentFactory.createAttachmentModel();
      attachment.size = file.size;
      attachment.filename = file.name;
      attachment.mimetype = file.type;
      // Add Attachment to Model
      vm.attachments.size.total += file.size;
      vm.model.attachments.push(attachment);
      var type = NstSvcFileType.getType(attachment.mimetype);

      // Read Attachment
      var reader = new FileReader();
      var qRead = $q.defer();

      reader.onload = function (event) {
        var uri = event.target.result;
        var resource = new NstLocalResource(uri);

        // Load and Show Thumbnail
        if (NST_FILE_TYPE.IMAGE == type || NST_FILE_TYPE.GIF == type) {
          attachment.picture = new NstPicture({
            original: uri,
            preview: uri,
            x32: uri,
            x64: uri,
            x128: uri
          });
        }

        qRead.resolve(uri);
      };
      reader.readAsDataURL(file);

      qRead.promise.then(function (uri) {
        var deferred = $q.defer();

        // Upload Attachment
        var vmAttachment = NstSvcAttachmentMap.toEditableAttachmentItem(attachment);
        attachment.id = vmAttachment.id;

        NstSvcLogger.debug4('Compose | start uploading file', file);

        var request = NstSvcStore.uploadWithProgress(file, function (event) {
          if (event.lengthComputable) {
            vmAttachment.uploadedSize = event.loaded;
            vmAttachment.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
          }
        }, group, NstSvcAuth.lastSessionKey);

        vm.attachments.requests[attachment.id] = request;

        request.sent().then(function () {
          attachment.status = NST_ATTACHMENT_STATUS.UPLOADING;
          vm.attachments.viewModels.push(vmAttachment);
          NstSvcLogger.debug4('Compose | request uploading file is sent');
        });

        request.finished().then(function () {
          // vm.attachments.size.total -= attachment.getSize();
          delete vm.attachments.requests[attachment.id];
          NstSvcLogger.debug4('Compose | uploading file is done');
        });

        request.getPromise().then(function (response) {
          var deferred = $q.defer();
          attachment.id = response.data.universal_id;
          attachment.status = NST_ATTACHMENT_STATUS.ATTACHED;
          vmAttachment.id = attachment.id;
          vmAttachment.isUploaded = true;
          vmAttachment.uploadedSize = attachment.size;
          vmAttachment.uploadedRatio = 1;

          deferred.resolve(attachment);

          return deferred.promise;
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get('An error has occured in uploading the file!'));
          deferred.reject(error);
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
            $log.debug('Compose | Removing a file while is uploading : ', attachment);
            var request = vm.attachments.requests[attachment.id];
            if (request) {
              NstSvcStore.cancelUpload(request);
            }
            break;
        }

        $log.debug('Compose | recalculating the total file size and uploaded size : ', attachment);
        vm.attachments.size.uploaded -= vmAttachment.uploadedSize;
        vm.attachments.size.total -= attachment.size;
        NstUtility.collection.dropById(vm.model.attachments, id);
        NstUtility.collection.dropById(vm.attachments.viewModels, id);
      }

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
      NstSvcLogger.debug4('Compose | Toggle full compose mode');
      $('body').toggleClass('fullCompose');
      if ($('body').hasClass('fullCompose')) {
        vm.makeChangeForWatchers++;
      }
      NstSvcLogger.debug4('Compose | is recipient items suitable for this frame ?!');
      vm.emitItemsAnalytics();
    };

    vm.send = function () {
      NstSvcLogger.debug4('Compose | Start sending compose');
      return (function () {
        var deferred = $q.defer();

        if (vm.model.saving) {
          NstSvcLogger.debug4('Compose | Stop resending compose');
          // Already is being sent process error
          deferred.reject([{
            name: 'saving',
            message: 'Already is being sent'
          }]);
        } else {
          NstSvcLogger.debug4('Compose | Compose model is valid ?!');
          if (vm.model.check()) {
            NstSvcLogger.debug4('Compose | Compose model is valid');
            vm.focus = false;
            vm.model.saving = true;

            var post = new NstPost();
            post.subject = vm.model.subject;
            post.body = vm.model.body;
            post.contentType = 'text/html';
            post.attachments = vm.model.attachments;
            post.forwardFrom = vm.model.forwardedFrom;
            post.replyTo = vm.model.replyTo;
            post.recipients = vm.model.recipients;
            post.noComment = !vm.model.comment;
            post.places = [];

            NstSvcLogger.debug4('Compose | Post the post to the server :', post);

            NstSvcPostFactory.send(post).then(function (response) {

              NstSvcLogger.debug4('Compose | Sent post succesfully');
              deferred.resolve(response);
            }).catch(function (error) {
              NstSvcLogger.debug4('Compose | Didnt send post succesfully');
              deferred.reject([error]);
            });
          } else {
            NstSvcLogger.debug4('Compose | Compose model is not valid');
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (response) {
        NstSvcLogger.debug4('Compose | Change some flags back to the normal mode after sending Post');
        vm.model.saving = false;
        vm.model.saved = true;
        vm.finish = true;

        // All target places have received the message
        if (response.noPermitPlaces.length === 0) {
          NstSvcLogger.debug4('Compose | Post Sent succefully to all places');
          toastr.success(NstSvcTranslation.get('Your message has been successfully sent.'));
          NstSvcPostFactory.get(response.post.id).then(function (res) {
            $rootScope.$emit('post-quick', res);
          });
          $uibModalStack.dismissAll();
          if (vm.quickMode) {
            clear();
          } else {
            if ($('body').hasClass('fullCompose')) {
              vm.fullCompose()
            }
            discardDraft();
          }

        } else if (response.post.places.length === response.noPermitPlaces.length) {
          NstSvcLogger.debug4('Compose | Checking no permited places and warn to the user via toastr');
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('Your message has not been successfully sent to {0}'), response.noPermitPlaces.join(', ')));
        } else {
          NstSvcLogger.debug4('Compose | Checking no permited places and warn to the user via toastr');
          toastr.warning(NstUtility.string.format(NstSvcTranslation.get('Your message was sent, but {0} did not received that!'), response.noPermitPlaces.join(', ')));
          NstSvcPostFactory.get(response.post.id).then(function (res) {
            $rootScope.$emit('post-quick', res);
          });

          NstSvcLogger.debug4('Compose | Change states and models back to the normal mode after sending Post');
          $uibModalStack.dismissAll();
          if (vm.quickMode) {
            clear();
          } else {
            if ($('body').hasClass('fullCompose')) {
              vm.fullCompose()
            }
            discardDraft();
          }

        }

        return $q(function (res) {
          res(response);
        });
      }).catch(function (errors) {
        NstSvcLogger.debug4('Compose | Unsent Post Reasons :', errors);
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
                name: $stateParams.placeId
              });

              vm.model.recipients.push(tag);
            } else {
              getPlace($stateParams.placeId).then(function (place) {

                vm.model.recipients.push(new NstVmSelectTag(place));
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
              vm.model.subject = post.subject;
              vm.model.body = post.getTrustedBody();
              vm.model.attachments = post.attachments;
              for (var k in vm.model.attachments) {
                vm.model.attachments[k].status = NST_ATTACHMENT_STATUS.ATTACHED;
                vm.attachments.viewModels.push(NstSvcAttachmentMap.toEditableAttachmentItem(vm.model.attachments[k]));
                vm.attachments.size.total += vm.model.attachments[k].size;
                vm.attachments.size.uploaded += vm.model.attachments[k].size;
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
              vm.model.replyTo.body = post.getTrustedBody();
              vm.model.subject = post.subject;

              var places = post.places;
              for (var k in places) {
                var place = places[k];
                vm.model.recipients.push(new NstVmSelectTag(place));
              }

              var recipients = post.recipients;
              for (var j in recipients) {
                var tag = new NstVmSelectTag({
                  id: recipients[j],
                  name: recipients[j]
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
              vm.model.replyTo.body = post.getTrustedBody();
              vm.model.subject = post.subject;

              // TODO: First search in post places to find a match then try to get from factory
              var postPlaces = post.place;
              var place = undefined;
              if (post.internal) {
                for (var k in postPlaces) {
                  if (post.sender.id == postPlaces[k].id) {
                    place = postPlaces[k];
                    break;
                  }
                }


                var deferred = $q.defer();

                if (place) {
                  deferred.resolve(place);
                } else {
                  getPlace(post.sender.id).then(function (place) {
                    deferred.resolve(place);
                  });
                }

                return deferred.promise.then(function (place) {
                  var deferred = $q.defer();

                  vm.place = place;
                  vm.model.recipients.push(new NstVmSelectTag(place));

                  deferred.resolve(post);

                  return deferred.promise;
                });
              } else {
                var email = post.sender;

                var tag = new NstVmSelectTag({
                  id: email.id,
                  name: email.name || email.id
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

      if (_.some(vm.model.recipients, {id: placeId})) {
        deferred.resolve();
        return;
      }

      getPlace(placeId).then(function (place) {
        NstSvcLogger.debug4('Compose | nested place added as recipients :', place);
        vm.model.recipients.push(new NstVmSelectTag(place));
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }

    /*****************************
     *****    State Methods   ****
     *****************************/


    vm.emitItemsAnalytics = function () {
      $scope.$broadcast('compose-add-item', {active: vm.collapse});
    }

    var changeDirection = function (dir, align) {
      this.selection.save();
      var elements = this.selection.blocks();
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element != this.$el.get(0)) {
          $(element)
            .css('direction', dir)
            .css('text-align', align);
        }
      }

      this.selection.restore();
    }

    $.FroalaEditor.DefineIcon('rightToLeft', {NAME: 'long-arrow-left'});
    $.FroalaEditor.RegisterCommand('rightToLeft', {
      title: 'RTL',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      callback: function () {
        changeDirection.apply(this, ['rtl', 'right']);
      }
    })

    $.FroalaEditor.DefineIcon('leftToRight', {NAME: 'long-arrow-right'});
    $.FroalaEditor.RegisterCommand('leftToRight', {
      title: 'LTR',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      callback: function () {
        changeDirection.apply(this, ['ltr', 'left']);
      }
    })
    vm.cmdPress = false;
    vm.cmdVPress = false;
    vm.froalaOpts = {
      enter: $.FroalaEditor.ENTER_DIV,
      toolbarContainer: vm.quickMode ? '#editor-btn-quick' : '#editor-btn',
      charCounterCount: false,
      tabSpaces: 4,
      toolbarBottom : true,
      placeholderText: 'Type something...',
      spellcheck : false,
      pluginsEnabled: ['colors', 'fontSize', 'fontFamily', 'link', 'url', 'wordPaste', 'lists', 'align', 'codeBeautifier'],
      fontSize: ['8', '10', '14', '18', '22'],
      toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', '|', 'color', 'align', 'formatOL', 'formatUL', 'insertLink', '|', 'rightToLeft', 'leftToRight'],
      events: {
        'froalaEditor.initialized': function (e, editor) {
          $(editor.$el).attr('spellcheck', 'false');
          console.log('initial');
        },
        'popups.setContainer': function (e, editor) {
          // $(editor.$el).attr('spellcheck', 'false');
        },
        'froalaEditor.focus': function (e, editor) {
          vm.focusBody = true;
          vm.emojiTarget = 'body';
          vm.focus = true;
          vm.collapse = true;
        },
        'froalaEditor.blur': function (e, editor) {
          vm.focusBody = false;
        },
        'froalaEditor.keydown': function (e, editor, je) {
          if ( vm.quickMode ) return
          var el = editor.selection.element();
          if (el && je.which === 91) {
            vm.cmdPress = true;
          }
          if (el && je.which === 86 && vm.cmdPress) {
            vm.cmdVPress = true;
            el.scrollIntoView({block: "end", behavior: "smooth"});
          }
        },
        'froalaEditor.keyup': function (e, editor, je) {
          if ( vm.quickMode ) return
          var el = editor.selection.element();
          if (el && (je.which === 13 || vm.cmdVPress)) {
            el.scrollIntoView({block: "end", behavior: "smooth"});
          }
          vm.cmdPress = false;
          vm.cmdVPress = false;
        }
      }
    };

    /*****************************
     *****    Fetch Methods   ****
     *****************************/

    function getPlace(id) {
      NstSvcLogger.debug4('Compose | Get place :', id);
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
      NstSvcLogger.debug4('Compose | Get post', id);
      return NstSvcPostFactory.get(id, true);
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
      NstSvcLogger.debug4('Compose | add a place from suggests as recipient :');


      // addRecipients(placeId);
      if (!_.some(vm.model.recipients, {id: place.id})) {
        vm.model.recipients.push(new NstVmSelectTag({
          id: place.id,
          name: place.name,
          data: new NstTinyPlace(place)
        }));
      }
    }


    function clear() {
      NstSvcLogger.debug4('Compose | Clear compose model data :');
      vm.attachments.viewModels = [];
      vm.model.attachments = [];
      vm.model.attachfiles = {};
      vm.model.subject = '';
      vm.model.body = '';
      vm.model.forwardedFrom = null;
      vm.model.replyTo = null;
      discardCanceler = $timeout(function () {
        vm.focus = false;
      }, 512);
    }

    vm.dodrop = function (event) {
      NstSvcLogger.debug4('Compose | dropped some files :');
      event.preventDefault();
      event.stopPropagation();
      var dt = event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function (request) {
        });
      }

    };

    $('.wdt-emoji-popup.open').removeClass('open');
    $scope.$on('$destroy', function () {
      $('.wdt-emoji-popup.open').removeClass('open');
      NstSvcLogger.debug4('Compose | Compose id destroyed :');
      NstSvcSidebar.removeOnItemClick();

      NstSvcLogger.debug4('Compose | Compose to normal mode ( if it is full mode ) :');
      if ($('body').hasClass('fullCompose')) {
        vm.fullCompose()
      }
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });

    });
  }
})();
