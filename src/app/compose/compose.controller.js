(function () {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $location, $state, $stateParams, $scope, $log, $uibModal, $timeout,
                             _, toastr,
                             ATTACHMENT_STATUS, NST_SRV_ERROR, NST_PATTERN, NST_TERM_COMPOSE_PREFIX, NST_DEFAULT, NST_NAVBAR_CONTROL_TYPE,
                             NstSvcLoader, NstSvcTry, NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore,
                             NstStoreResource, NstTinyPlace, NstPlace, NstVmPlace, NstVmSelectTag, NstRecipient, NstVmNavbarControl) {
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
      ready: false,
      saving: false,
      saved: false
    };

    vm.attach = {
      id: 'attach'
    };

    vm.place = undefined;

    vm.controls = {
      left: [
        // TODO: Get Previous state
        new NstVmNavbarControl('Discard', NST_NAVBAR_CONTROL_TYPE.BUTTON, $state.href('home'))
      ],
      right: [
        new NstVmNavbarControl('Attach', NST_NAVBAR_CONTROL_TYPE.BUTTON_INPUT_LABEL, undefined, undefined, { id: vm.attach.id })
      ]
    };

    vm.search = {
      results: []
    };

    vm.attachments = {
      size: {
        uploaded: 0,
        total: 0
      }
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
      event.currentTarget.files.map(vm.attachments.attach);
    };

    vm.attachments.fileDropped = function (event) {
      event.currentTarget.files.map(vm.attachments.attach);
    };

    vm.attachments.attach = function (file) {
      vm.model.ready = false;
    };

    vm.attachments.detach = function (id) {

    };

    // TODO: Call this while model is changed
    vm.model.check = function () {
      var result = true;

      result = result && vm.model.subject.trim().length > 0;
      result = result && vm.model.recipients.length > 0;
      for (var k in vm.model.recipients) {
        var recipient = vm.model.recipients[k];
        if (recipient instanceof NstVmSelectTag) {
          if (recipient.data instanceof NstPlace) {
          } else if (recipient.data instanceof NstRecipient) {
          } else {
            result = false;
          }
        } else if (recipient instanceof NstPlace) {
        } else if (recipient instanceof NstTinyPlace) {
        } else if (recipient instanceof NstVmPlace) {
        } else {
          result = false;
        }
      }

      vm.model.ready = result;

      return vm.model.ready;
    };

    vm.send = function () {
      vm.model.check();
      if (vm.model.ready && !vm.model.saving) {
        vm.model.saving = true;
        var post = NstSvcPostFactory.createPostModel();
        post.setSubject(vm.model.subject);
        post.setBody(vm.model.body);
        post.setContentType('text/html');
        post.setAttachments(vm.model.attachments);
        vm.model.forwardedFrom && post.setForwarded(vm.model.forwardedFrom);
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

        var deferred = $q.defer();

        NstSvcLoader.inject(NstSvcPostFactory.send(post).then(function (response) {
          vm.model.saving = false;
          vm.model.saved = true;
          // TODO: Check if one or more places failed
          toastr.success('Your message has been successfully sent.', 'Message Sent');
          $state.go('messages-sent');
        }).catch(function (error) {
          vm.model.saving = false;
          console.log('Compose | Error Occured: ', error);
        }));

        return deferred.promise;
      }
    };
    vm.controls.right.push(new NstVmNavbarControl('Send', NST_NAVBAR_CONTROL_TYPE.BUTTON_SUCCESS, undefined, vm.send));

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
              return getPlace(post.getSender().getId()).then(function (place) {
                vm.place = place;
                vm.model.recipients.push(new NstVmSelectTag({
                  id: place.getId(),
                  name: place.getName(),
                  data: place
                }));
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

    $scope.sendStatus = false;
    $scope.checkfilling = function () {
      $scope.sendStatus = !(vm.recipients.length > 0);
    };

    $scope.changeMe = function ($event, $toState, $toParams, $fromState, $fromParams, $cancel) {
      if (vm.model.saved) {
        $cancel.$destroy();
        $state.go($toState.name);
      } else {
        vm.confirmModal = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'app/compose/confirm.html',
            controller: 'WarningController',
            controllerAs: 'ctlWarning',
            size: 'sm',
            scope: $scope
          }).result.then(function () {
            $cancel.$destroy();
            $state.go($toState.name);
          }).catch(function () {

          });

          return false;
        };

        vm.confirmModal();
      }
    };

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

    vm.attachMethod = function (files) {
      $scope.attachshow = true;

      var counter = 0;
      for (var i = 0; i < files.length; i++) {
        var file = files[i].file;
        counter++;
        $scope.upload_size.total += file.size;

        var isImage = file.type.split('/')[0] == 'image';
        var attachment = NstSvcAttachmentFactory.createAttachmentModel({
          _id: null,
          filename: file.name,
          mimetype: file.type,
          upload_time: file.lastModified,
          size: file.size,
          status : ATTACHMENT_STATUS.UPLOADING
        });

        attachment.loadedSize = 0;

        if (isImage) {
          var stItem = new NstStoreResource();
          stItem.uid = attachment.id;
          attachment.thumbs = {
            x32: stItem,
            x64: stItem,
            x128: stItem
          };

          var reader = new FileReader();
          reader.onload = function (event) {
            var uri = event.target.result;
            this.thumbs.x32.url = uri;
            this.thumbs.x64.url = uri;
            this.thumbs.x128.url = uri;

          }.bind(attachment);

          reader.readAsDataURL(file);
        }

        $scope.compose.post.addAttachment(attachment);

        var uploadSettings = {
          file : file,
          _reqid : attachment.getClientId(),
          // progress is invoked at most once per every second
          onProgress : _.throttle(function (e) {
            if (e.lengthComputable) {
              this.loadedSize = e.loaded;
              $timeout(function () {
                $scope.totalProgress = $scope.compose.post.getTotalAttachProgress();
              });
            }
          }.bind(attachment),1000),
          onStart : function (e) {
            $scope.showUploadProgress = true;
          }
        };

        NstSvcStore.uploadWithProgress(uploadSettings).then(function (handler) {
          attachment.setUploadCanceler(handler.abort);
          handler.start().then(function (response) {

            _.forEach($scope.compose.post.attachments, function (item) {

              // FIXME : use a common format for unique id
              if (item.getClientId() === response.data._reqid) {

                item.status = ATTACHMENT_STATUS.ATTACHED;
                item.id = response.data.universal_id;

                item.change();
              }

            });

          }.bind(file)).catch(function (result) {
            $log.debug(result);
          });
      }).catch(function (error) {
        $log.debug(error);
      });
    };

    /**
     * @property interface
     * @type {Object}
     */
    $scope.interface = {};

    // Listen for when the interface has been configured.
    $scope.$on('$dropletReady', function whenDropletReady() {
      $scope.attachfiles.allowedExtensions([/.+/]);
      $scope.attachfiles.useArray(false);
    });
    $scope.$on('$dropletFileAdded', function startupload() {
      vm.attach($scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID));
      $scope.attachmentForm.attLength.$setViewValue($scope.compose.post.attachments.length);
      var i=0;
      for (i=0; i<$scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID).length; i++){
        $scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID)[i].deleteFile();
      }
    });
  };
}
})();
