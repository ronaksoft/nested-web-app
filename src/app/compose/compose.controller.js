(function () {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($q, $location, $state, $stateParams, $scope, $log, $uibModal, $timeout,
                             _, toastr,
                             ATTACHMENT_STATUS, NST_SRV_ERROR, NST_PATTERN, NST_TERM_COMPOSE_PREFIX, NST_DEFAULT,
                             NstSvcLoader, NstSvcTry, NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPostFactory, NstSvcStore,
                             NstStoreResource, NstPost, NstPlace, NstVmPlace, NstVmSelectTag, NestedRecipient) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.model = {
      recipients: [],
      subject: '',
      attachments: [],
      body: '',
      ready: false
    };


    vm.search = {
      results: []
    };

    vm.recipients = {
    };

    vm.attachments = {
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
        plugins : 'autolink link image lists charmap directionality textcolor colorpicker emoticons',
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

    vm.recipients.tagger = function (text) {
      // FIXME: To use new class and also check for hidden places
      var isPlaceId = 0 == text.split('.').filter(function (v, i) {
          return !(0 == i ? NST_PATTERN.GRAND_PLACE_ID.test(v) : NST_PATTERN.SUB_PLACE_ID.test(v));
      }).length;
      var isEmail = NST_PATTERN.EMAIL.test(text);

      if (isPlaceId) {
        var tag = new NstVmSelectTag({
          id: text,
          name: text,
          data: NstSvcPlaceFactory.get(text).then(function (place) {
            $timeout(function () {
              tag.name = place.getName();
              tag.data = place;
            });
          }).catch(function () {
            tag.isTag = false;
          })
        });

        return tag;
      } else if (isEmail) {
        return new NstVmSelectTag({
          id: text,
          name: text,
          data: new NestedRecipient(text)
        });
      }

      return new NstVmSelectTag();
    };

    vm.attachments.attach = function () {

    };

    vm.attachments.detach = function () {

    };

    vm.send = function () {
      var post = NstSvcPostFactory.createPostModel();
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
              vm.model.recipients.push(new NstVmPlace(place));
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
              vm.model.subject = NST_TERM_COMPOSE_PREFIX.REPLY + post.getSubject();
              var places = post.getPlaces();
              for (var k in places) {
                // FIXME: Push Compose Recipient View Model Instead
                vm.model.recipients.push(new NstVmPlace(places[k]));
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
              vm.model.subject = NST_TERM_COMPOSE_PREFIX.REPLY + post.getSubject();

              return getPlace(post.getSender().getId()).then(function (place) {
                vm.model.recipients.push(new NstVmPlace(place));
              });
            })
          }
        }
        break;
    }

    NstSvcLoader.finished().then(function () {
      console.log(vm.model);
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
              deferred.reject.apply(null, arguments);
              break;

            default:
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

    $scope.leaveReason = '';
    $scope.changeMe = function ($event, $toState, $toParams, $fromState, $fromParams, $cancel) {
      if ('SEND' == $scope.leaveReason) {
        $cancel.$destroy();
        $state.go($toState.name);

      } else {
        vm.confirmModal = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'app/compose/confirm.html',
            controller: 'WarningController',
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

    $scope.upload_size = {
      uploaded: 0,
      total: 0
    };

    vm.post = new NstPost();
    // TODO : attachment preview should be enabled in compose page, Why model controls attachmentPreview??
    vm.post.attachmentPreview = true;
    $scope.attachshow = false;
    $scope.showUploadProgress = false;

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

    vm.setFile = function (event) {
      var element = event.currentTarget;
      var length = element.files.length;
      var files = [];
      files.file = {};
      for (var i = 0; i < length; i++) {
        var file = element.files[i];
        var man = {};
        man.file= file;
        files.push(man)
      }
      vm.attach(files);
    };

    vm.attach = function (files) {
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

    vm.sendPost = function () {
      $scope.sendStatus = true;
      var post = $scope.compose.post;
      post.contentType = 'text/html';
      for (var k in $scope.compose.recipients) {
        if ($scope.compose.recipients[k] instanceof NstPlace) {
          post.places.push($scope.compose.recipients[k]);
        } else {
          post.recipients.push($scope.compose.recipients[k]);
        }
      }

      post.update().then(function (post) {
        toastr.success('Your message has been successfully sent.', 'Message Sent');
        $scope.leaveReason = 'SEND';
        $location.path('/events');
        $scope.sendStatus = false;
      }).catch(function (data) {
        switch (data.err_code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
            toastr.error('You do not have enough access', 'Message Not Sent!');
            break;

          default:
            toastr.error('Error occurred during sending message.', 'Message Not Sent!');
            break;
        }
        $scope.sendStatus = false;
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
