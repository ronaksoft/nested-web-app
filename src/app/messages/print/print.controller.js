(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PrintController', PrintController);

  /** @ngInject */
  function PrintController($q, $scope, $rootScope, $stateParams,
                          _, toastr, NstSvcPostFactory, NstUtility, NstSvcLogger, NstSvcPostInteraction, NstSvcTranslation, NstSvcSync) {
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
      vm.expandProgressId = postId;
      NstSvcPostFactory.get(postId, true).then(function (post) {
        vm.message = post;
        var imgRegex = new RegExp('<img(.*?)source=[\'|"](.*?)[\'|"](.*?)>', 'g');
        var resources = post.resources;
        vm.message.body = post.body.replace(imgRegex, function (m, p1, p2, p3) {
          var src = resources[p2];
          return "<img" + p1 + "src='" + src + "' " + p3 + ">"
        });
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error occured while tying to show the post full body.'));
      }).finally(function (){
        vm.loadProgress = false;
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
      $('html').removeClass("_oh");
      NstSvcSync.closeChannel(vm.syncId);
    });
  }

})();
