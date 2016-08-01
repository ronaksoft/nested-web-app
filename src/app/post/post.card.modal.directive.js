(function () {
    'use strict';

    angular.module('nested')
      .directive('nstPostModal', PostModal);

    function PostModal($uibModal) {
      var directive = {
        link: link,
        template: function( element, attrs ) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-click="openPostCardModal(post)" ng-transclude></' + tag +'>';
        },
        restrict: 'EA',
        replace: false,
        transclude: true,
        scope: {
          post : '='
        }
      };

      function link(scope, element, attrs) {
        /**
         * postPreview - preview the places that have delete access and let the user to chose one
         *
         * @param  {type} places list of places to be shown
         */

        scope.openPostCardModal = function (post) {

          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/post/post.html',
            controller: 'PostController',
            controllerAs: 'postVm',
            size: 'mlg',
            resolve: {
              post: function () {
                return post
              },
              postId: function () {
                return post.id
              }
            }
          });

          return modal.result;
        }
      }

      return directive;
    }
  })();
