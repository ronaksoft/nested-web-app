(function () {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($location, $scope, $log, $uibModal, $stateParams, $state, _, toastr, ATTACHMENT_STATUS,
    AuthService, WsService, StoreService, StoreItem, NestedPost, NestedPlace, NestedRecipient, NestedAttachment) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
      $location.search({back: $location.path()});
      $location.path('/signin').replace();
    }

    //$scope.tinymceModel = 'Initial content';
    $scope.tinymceOptions = {
      onChange: function(e) {
        // put logic here for keypress and cut/paste changes
      },
      inline: false,
      //fixed_toolbar_container: '.nst-compose-message',
      statusbar: false,
      trusted: true,
      menubar: false,
      browser_spellcheck: true,
      selector: 'textarea',
      height : 600,
      plugins : 'autolink link image lists charmap directionality textcolor colorpicker contextmenu emoticons',
      contextmenu: "link inserttable | cell row column deletetable",
      toolbar: 'bold italic underline strikethrough | alignleft aligncenter aligncenter alignjustify | formatselect fontselect fontsizeselect forecolor backcolor| ltr rtl | bullist numlist | outdent indent | link',
      skin: 'lightgray',
      theme : 'modern'
    };


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

    vm.places = [];
    vm.recipients = [];
    vm.search = function (query) {
      WsService.request('place/search', {keyword: query}).then(function (data) {
        $scope.compose.places = [];
        for (var k in data.places) {
          $scope.compose.places.push(new NestedPlace(data.places[k]));
        }
      });
    };

    vm.post = new NestedPost();
    // TODO : attachment preview should be enabled in compose page, Why model controls attachmentPreview??
    vm.post.attachmentPreview = true;
    if ($stateParams.relation && $stateParams.relation.indexOf(':') > -1) {
      var relation = $stateParams.relation.split(':');
      switch (relation.shift()) {
        case 'fw':
          vm.post.forwarded = new NestedPost();
          vm.post.forwarded.attachmentPreview = true;
          vm.post.forwarded.load(relation.join('')).then(function (post) {
            $scope.compose.post.subject = 'FW: ' + post.subject;
            $scope.compose.post.body = post.body;
            $scope.compose.post.attachments = post.attachments;
            $scope.attachshow = $scope.compose.post.attachments.length > 0;
          });
          break;

        case 'ra':
          vm.post.replyTo = new NestedPost();
          vm.post.replyTo.attachmentPreview = true;

          vm.post.replyTo.load(relation.join('')).then(function (post) {
            $scope.compose.post.subject = 'RE: ' + post.subject;
            $scope.compose.post.places = post.places;
            $scope.compose.recipients = post.places.concat(post.recipients);
          });
          break;

        case 'rs':
          vm.post.replyTo = new NestedPost();
          vm.post.replyTo.attachmentPreview = true;
          vm.post.replyTo.load(relation.join('')).then(function (post) {
            $scope.compose.post.subject = 'RE: ' + post.subject;
            $scope.compose.post.places.push(new NestedPlace(post.sender.username));
            $scope.compose.recipients = $scope.compose.post.places;
          });
          break;
      }
    }

    vm.recipientMaker = function (text) {
      return NestedRecipient.isValidEmail(text) ? new NestedRecipient(text) : null;
    };
    $scope.attachshow = false;
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
        var attachment = new NestedAttachment({
          // _id: response.universal_id,
          _id: null,
          filename: file.name,
          mimetype: file.type,
          upload_time: file.lastModified,
          size: file.size,
          status : ATTACHMENT_STATUS.UPLOADING
        });

        if (isImage) {
          var stItem = new StoreItem();
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


        StoreService.upload(file, null, attachment.getClientId(), function(canceler){
          attachment.setUploadCanceler(canceler);
        }).then(function (response) {

          $scope.upload_size.uploaded += this.size;

          if (0 == --counter) {
            $scope.upload_size.total = 0;
            $scope.upload_size.uploaded = 0;
          }

          _.forEach($scope.compose.post.attachments, function (item) {

            if (item.getClientId() === response._reqid) {

              item.status = ATTACHMENT_STATUS.ATTACHED;
              item.id = response.universal_id;

              item.change();
            }
          });

        }.bind(file)).catch(function (reason) {
          $log.debug('Attach Failed', reason);
        });

      }
    };

    vm.sendPost = function () {
      $scope.sendStatus = true;
      var post = $scope.compose.post;
      post.contentType = 'text/html';
      for (var k in $scope.compose.recipients) {
        if ($scope.compose.recipients[k] instanceof NestedPlace) {
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
          case WS_ERROR.ACCESS_DENIED:
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
      var i=0;
      for (i=0; i<$scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID).length; i++){
        $scope.attachfiles.getFiles($scope.attachfiles.FILE_TYPES.VALID)[i].deleteFile();
      }
    });
  }
})();
