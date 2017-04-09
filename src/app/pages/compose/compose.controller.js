(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $rootScope, $state, $stateParams, $scope, $log, $timeout, $uibModalStack, $window,
                             _, toastr,
                             NST_SRV_ERROR, NST_PATTERN, NST_CONFIG, NST_DEFAULT, NST_ATTACHMENT_STATUS, NST_FILE_TYPE, SvcCardCtrlAffix,
                             NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore, NstSvcFileType, NstSvcAttachmentMap, NstSvcSidebar, NstUtility, NstSvcTranslation, NstSvcModal, NstSvcPostDraft, NstSvcUserFactory,
                             NstTinyPlace, NstVmPlace, NstVmSelectTag, NstRecipient, NstLocalResource, NstSvcPostMap, NstPicture, NstPostDraft, NstTinyUser, NstVmUser) {
    var vm = this;
    vm.quickMode = false;
    vm.focus = false;
    vm.mouseIn = false;
    var eventReferences = [];
    var discardCanceler = null;
    vm.makeChangeForWatchers = 0;
    vm.clear = clear;
    vm.searchRecipients = _.debounce(searchRecipients, 400);

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

    var allowedContent =
      'a[class,href,id,style,target]{*};' +
      'b[class,id,style]{*};' +
      'br[class,id,style]{*};' +
      'div[align,class,dir,id,style]{*};' +
      'font[class,color,face,id,size,style]{*};' +
      'h1[align,class,dir,id,style]{*};' +
      'h2[align,class,dir,id,style]{*};' +
      'h3[align,class,dir,id,style]{*};' +
      'h4[align,class,dir,id,style]{*};' +
      'h5[align,class,dir,id,style]{*};' +
      'h6[align,class,dir,id,style]{*};' +
      'head[dir,lang,style]{*};' +
      'hr[align,size,width,style]{*};' +
      'img[align,border,class,height,hspace,id,src,style,usemap,vspace,width]{*};' +
      'label[class,id,style]{*};' +
      'li[class,dir,id,style,type]{*};' +
      'ol[class,dir,id,style,type]{*};' +
      'p[align,class,dir,id,style]{*};' +
      'span[class,id,style]{*};' +
      'strong[class,id,style]{*};' +
      'table[align,bgcolor,border,cellpadding,cellspacing,class,dir,frame,id,rules,style,width]{*};' +
      'td[abbr,align,bgcolor,class,colspan,dir,height,id,lang,rowspan,scope,style,valign,width]{*};' +
      'th[abbr,align,bgcolor,class,colspan,dir,height,id,lang,rowspan,scope,style,valign,width]{*};' +
      'tr[align,bgcolor,class,dir,id,style,valign]{*}' +
      ';u[class,id,style]{*};' +
      'ul[class,dir,id,style]{*};';

    if (vm.quickMode) {
      $scope.editorOptions = {
        language: lang,
        contentsLangDirection: isRTL,
        allowedContent: allowedContent,
        // allowedContent: true,
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
          ["Link", "FontSize"],
          ["Bold"],
          ["JustifyRight", "BidiLtr", "BidiRtl"]
        ],
        fontSize_sizes: 'Small/12px;Normal/14px;Large/18px;',
        colorButton_colors: 'CF5D4E,454545,FFF,CCC,DDD,CCEAEE,66AB16',
        // Remove the redundant buttons from toolbar groups defined above.
        //removeButtons: 'Strike,Subscript,Superscript,Anchor,Specialchar',
        removePlugins: 'resize,elementspath,contextmenu,magicline,tabletools'
      };

    } else {
      $scope.editorOptions = {
        language: lang,
        allowedContent: allowedContent,
        // allowedContent: true,
        contentsLangDirection: isRTL,
        contentsCss: 'body {overflow:visible;}',
        height: 230,
        enableTabKeyTools: true,
        tabSpaces: 4,
        startupFocus: false,
        extraPlugins: 'sharedspace,font,language,bidi,justify,colorbutton,autogrow,divarea,autolink',
        autoGrow_minHeight: 230,
        sharedSpaces: {
          top: 'editor-btn',
          bottom: 'editor-txt'
        },
        toolbar: [
          ["Link", "FontSize"],
          ["Bold", "Italic", "Underline", "source"],
          ["JustifyRight", "TextColor", "BidiLtr", "BidiRtl"]
        ],
        fontSize_sizes: 'Small/12px;Normal/14px;Large/18px;',
        colorButton_colors: 'CF5D4E,454545,FFF,CCC,DDD,CCEAEE,66AB16',
        // Remove the redundant buttons from toolbar groups defined above.
        //removeButtons: 'Strike,Subscript,Superscript,Anchor,Specialchar',
        removePlugins: 'resize,elementspath,wysiwygarea,contextmenu,magicline,tabletools'
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

        eventReferences.push($scope.$on('modal.closing', function (event) {
          if (shouldSaveDraft() && !vm.finish) {
            event.preventDefault();

            if ($state.current.options && $state.current.options.supportDraft) {

              NstSvcModal.confirm(
                NstSvcTranslation.get("Confirm"),
                NstSvcTranslation.get("By discarding this message, you will lose your draft. Are you sure you want to discard?"),
                {
                  yes: NstSvcTranslation.get("Discard"),
                  no: NstSvcTranslation.get("Draft")
                }
              ).then(function (confirmed) {
                if (confirmed) {
                  discardDraft();
                } else {
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

    })();

    function saveDraft() {
      var draft = new NstPostDraft();
      draft.subject = vm.model.subject;
      draft.body = vm.model.body;
      draft.attachments = _.map(vm.model.attachments, 'id');
      draft.recipients = _.map(vm.model.recipients, 'id');
      NstSvcPostDraft.save(draft);
    }

    function discardDraft() {
      NstSvcPostDraft.discard();
    }

    function shouldSaveDraft() {
      return _.size(_.trim(vm.model.subject)) > 0 ||
        _.size(_.trim(vm.model.body)) ||
        _.size(vm.model.attachments) > 0 ||
        _.size(vm.model.recipients) > 0;
    }

    /*****************************
     ***** Controller Methods ****
     *****************************/

    function openDraft() {
      if (!NstSvcPostDraft.has()) {
        return;
      }

      if ($state.current.options && $state.current.options.supportDraft) {
        loadDraft();
      }
    }

    function loadDraft() {
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
        if (recipientId.indexOf('@') > -1) {
          return NstSvcUserFactory.getTinySafe(recipientId);
        } else {
          return NstSvcPlaceFactory.getTinySafe(recipientId);
        }
      })).then(function (recipients) {
        vm.model.recipients = _.map(recipients, function (recipient) {
          if (recipient instanceof NstTinyPlace) {
            return new NstVmPlace(recipient);
          } else if (recipient instanceof NstTinyUser) {

            var user = new NstVmUser(recipient);
            if (recipient.id.indexOf('@') > -1) {
              user.isEmail = true;
              user.isEmailValid = NST_PATTERN.EMAIL.test(user.id);
            }

            return user;

          } else {

            return new NstVmSelectTag({
              id: recipient.id,
              name: recipient.id,
              data: new NstRecipient({
                id: recipient.id,
                email: recipient.id,
                name: recipient.id
              })
            });
          }
        });
        deferred.resolve(draft);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    NstSvcSidebar.setOnItemClick(onPlaceSelected);


    vm.subjectKeyDown = function (e) {
      vm.mouseIn = true;
      vm.changeAffixesDebounce();
      if (e.which == 13) {
        e.preventDefault();
        $window.CKEDITOR.instances.composeEditor.focus();
      }
    };


    vm.editorKeyDown = function (e) {
      if (e.which == 8) {

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
      return NstSvcPlaceFactory.searchForCompose(query).then(function (places) {

        vm.search.results = _.chain(places).uniqBy('id').map(function (place) {
          return new NstVmPlace(place);
        }).value();

        if (_.isString(query)
          && _.size(query) >= 4
          && _.indexOf(query, " ") === -1
          && !_.some(vm.search.results, { id : query })) {
          var initPlace = NstSvcPlaceFactory.parseTinyPlace({
            _id: query,
            name: query
          });
          initPlace.isEmail = query.indexOf('@') > -1;
          initPlace.isEmailValid = NST_PATTERN.EMAIL.test(query);
          vm.search.results.push(initPlace);
        }
      }).catch(function () {
        vm.search.results = [];
        if (initPlace.id)
        vm.search.results.push(initPlace);
      });

    }


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
            tag.name = place.name;
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
      attachment.mimetype  = file.type;
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
        if (NST_FILE_TYPE.IMAGE == type) {
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

        var request = NstSvcStore.uploadWithProgress(file, function (event) {
          if (event.lengthComputable) {
            vmAttachment.uploadedSize = event.loaded;
            vmAttachment.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
          }
        });

        vm.attachments.requests[attachment.id] = request;

        request.sent().then(function () {
          attachment.status = NST_ATTACHMENT_STATUS.UPLOADING;
          vm.attachments.viewModels.push(vmAttachment);
        });

        request.finished().then(function () {
          // vm.attachments.size.total -= attachment.getSize();
          delete vm.attachments.requests[attachment.id];
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
            var request = vm.attachments.requests[attachment.id];
            if (request) {
              NstSvcStore.cancelUpload(request);
            }
            break;
        }

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
      if ($('body').hasClass('fullCompose')) {
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
            vm.focus = false;
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
        vm.finish = true;

        // All target places have received the message
        if (response.noPermitPlaces.length === 0) {
          toastr.success(NstSvcTranslation.get('Your message has been successfully sent.'));
          NstSvcPostFactory.get(response.post.id).then(function (res) {
            var msg = NstSvcPostMap.toMessage(res);
            $rootScope.$emit('post-quick', msg);
          });
          $uibModalStack.dismissAll();
          if (vm.quickMode) {
            clear();
          } else {
            discardDraft();
          }

        } else if (response.post.places.length === response.noPermitPlaces.length) {
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('Your message has not been successfully sent to {0}'), response.noPermitPlaces.join(',')));
        } else {
          toastr.warning(NstUtility.string.format(NstSvcTranslation.get('Your message was sent, but {0} did not received that!'), response.noPermitPlaces.join(',')));
          NstSvcPostFactory.get(response.post.id).then(function (res) {
            var msg = NstSvcPostMap.toMessage(res);
            $rootScope.$emit('post-quick', msg);
          });
          $uibModalStack.dismissAll();
          if (vm.quickMode) {
            clear();
          } else {
            discardDraft();
          }

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
              vm.model.body = post.getTrustedBody();
              vm.model.attachments = post.getAttachments();
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
              vm.model.subject = post.getSubject();
              var places = post.getPlaces();
              for (var k in places) {
                var place = places[k];
                vm.model.recipients.push(new NstVmSelectTag({
                  id: place.id,
                  name: place.name,
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
              vm.model.replyTo.body = post.getTrustedBody();
              vm.model.subject = post.getSubject();

              // TODO: First search in post places to find a match then try to get from factory
              var postPlaces = post.getPlaces();
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
                  getPlace(post.getSender().id).then(function (place) {
                    deferred.resolve(place);
                  });
                }

                return deferred.promise.then(function (place) {
                  var deferred = $q.defer();

                  vm.place = place;
                  vm.model.recipients.push(new NstVmSelectTag({
                    id: place.id,
                    name: place.name,
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
            id: place.id,
            name: place.name,
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
      event.preventDefault();
      event.stopPropagation();
      var dt = event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function (request) {
        });
      }

    };


    $scope.$on('$destroy', function () {
      NstSvcSidebar.removeOnItemClick();

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });

    });
  }
})();
