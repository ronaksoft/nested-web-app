(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($location, $scope, $log, toastr, AuthService, WsService, StoreService, StoreItem, NestedPost, NestedPlace, NestedRecipient, NestedAttachment) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    $scope.upload_size = {
      uploaded: 0,
      total: 0
    };

    vm.places = [];
    vm.recipients = [];
    vm.search = function (query) {
      WsService.request('place/search', { keyword: query }).then(function (data) {
        $scope.compose.places = [];
        for (var k in data.places) {
          $scope.compose.places.push(new NestedPlace(data.places[k]));
        }
      });
    };

    vm.post = new NestedPost();

    vm.recipientMaker = function (text) {
      return NestedRecipient.isValidEmail(text) ? new NestedRecipient(text) : null;
    };

    vm.attach = function (event) {
      var element = event.currentTarget;

      var counter = 0;
      for (var i = 0; i < element.files.length; i++) {
        var file = element.files[i];
        counter++;
        $scope.upload_size.total += file.size;

        StoreService.upload(file).then(function (response) {
          var isImage = this.type.split('/')[0] == 'image';
          var attachment = new NestedAttachment({
            _id: response.universal_id,
            filename: this.name,
            mimetype: this.type,
            upload_time: this.lastModified,
            size: this.size
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

            reader.readAsDataURL(this);
          }

          $scope.compose.post.addAttachment(attachment);
          $scope.upload_size.uploaded += this.size;

          if (0 == --counter) {
            $scope.upload_size.total = 0;
            $scope.upload_size.uploaded = 0;
          }
        }.bind(file)).catch(function (reason) {
          $log.debug('Attach Failed', reason);
        });
      }
    };

    vm.sendPost = function () {
      var post = $scope.compose.post;
      post.contentType = 'text/html';
      for (var k in $scope.compose.recipients) {
        if ($scope.compose.recipients[k] instanceof NestedPlace) {
          post.places.push($scope.compose.recipients[k]);
        } else {
          post.recipients.push($scope.compose.recipients[k]);
        }
      }

      post.update().then(function (data) {
        toastr.success('Your message has been successfully sent.', 'Message Sent');
      }).catch(function (data) {
        toastr.error('Error occurred during sending message.', 'Message Not Sent!');
      });
    };
  }
})();
