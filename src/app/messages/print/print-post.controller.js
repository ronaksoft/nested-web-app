(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PrintPostController', PrintPostController);

  /** @ngInject */
  function PrintPostController($scope, $stateParams, NST_CONFIG, $cookies,
                          _, toastr, NstSvcPostFactory, NstSvcPostInteraction, NstSvcTranslation, NstHttp) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.postId = $stateParams.postId;
    vm.loadProgress = false;

    /*****************************
     ***** Controller Methods ****
     *****************************/


    (function () {
      markPostAsRead(vm.postId);
      vm.loadProgress = true;
      load(vm.postId)
    })();



    function load(postId) {
      console.log(postId);
      new NstHttp(NST_CONFIG.REGISTER.AJAX.URL, {
        cmd: 'post/get',
        data: {
          post_id: postId
        },
        _sk: $cookies.get('nsk'),
        _ss: $cookies.get('nss')
      }).post().then(function (result) {
        var post = NstSvcPostFactory.parsePost(result.data);
        vm.loadProgress = false;
        vm.message = post;
        var imgRegex = new RegExp('<img(.*?)source=[\'|"](.*?)[\'|"](.*?)>', 'g');
        var resources = post.resources;
        var body = post.body || post.preview;
        if (body.length > 0) {
          vm.message.body = body.replace(imgRegex, function (m, p1, p2, p3) {
            var src = resources[p2];
            return "<img" + p1 + "src='" + src + "' " + p3 + ">"
          });
        }
      });
    }


    function markPostAsRead(id) {
      vm.markAsReadProgress = true;
      NstSvcPostInteraction.markAsRead(id).then(function () {
        var targetPost = _.find(vm.messages, { id: id });
        if (targetPost) {
          targetPost.read = true;
        }
      }).finally(function () {
        vm.markAsReadProgress = false;
      });
    }


    $scope.$on('$destroy', function () {
    });
  }

})();
