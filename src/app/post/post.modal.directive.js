(function () {
    'use strict';

    angular.module('nested')
      .directive('nstPostModal', PostModal);

    function PostModal($uibModal) {
      var directive = {
        link: link,
        template: function(element) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-click="openPostModal(post)" ng-transclude></' + tag +'>';
        },
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
          post : '='
        }
      };

      function link(scope) {
        scope.openPostModal = function (vmPost) {
          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/post/post.html',
            controller: 'PostController',
            controllerAs: 'postVm',
            size: 'mlg',
            resolve: {
              vmPost: function () {
                return vmPost;
              },
              postId: function () {
                return vmPost.id
              }
            }
          });

          return modal.result;
        }
      }

      return directive;
    }
  })();
