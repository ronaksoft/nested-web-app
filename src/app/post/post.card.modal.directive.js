(function () {
    'use strict';


    angular.module('nested')
      .directive('postCardModal', PostDirective);

    function PostDirective($uibModal) {
      var directive = {
        link: link,
        template: '<div ng-click="openPostCardModal(post.id)" ng-transclude></div>',
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
        scope.openPostCardModal = function (postId) {

          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/post/post.html',
            controller: 'PostController',
            controllerAs: 'postVm',
            size: 'mlg',
            resolve: {
              postId: function () {
                return postId
              }
            }
          });


          return modal.result;
        }


      }


      return directive;
    }
  })();
