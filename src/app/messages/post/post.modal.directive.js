(function () {
    'use strict';

    angular.module('ronak.nested.web.message')
      .directive('nstPostModal', PostModal);

    function PostModal($uibModal, $state) {
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

          $state.go('app.message', { postId : vmPost.id, model : vmPost }, { notify : false});
        }
      }

      return directive;
    }
  })();
