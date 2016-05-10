(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($location, $scope, toastr, AuthService, WsService, NestedPost, NestedPlace) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

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

    $scope.recipientMaker = function (text) {
      // TODO: Move it
      var emailRegexp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

      // TODO: Create NestedRecipient
      return emailRegexp.test(text) ? { id: text, name: text } : null;
    };

    $scope.sendPost = function () {
      var post = $scope.compose.post;
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
