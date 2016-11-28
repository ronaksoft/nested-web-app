(function () {
    'use strict';

    angular.module('ronak.nested.web.message')
      .directive('nstPostModal', PostModal);

    function PostModal($timeout, $state, $window) {
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

      function link(scope,$element) {
        scope.openPostModal = function (vmPost) {
          if (scope.post){
            scope.post.isRead = true;
          }
          $state.go('app.message', { postId : vmPost.id, model : vmPost }, { notify : false});
        };

        $element.click(function (event) {
          var x = event.clientX/$window.innerWidth;
          var y = event.clientY/$window.innerHeight;
          console.log(x.toFixed(2),y.toFixed(2));

          var style=document.createElement('style');
          style.type='text/css';
          if(style.styleSheet){
            style.styleSheet.cssText='.modal {transform-origin: '+ x.toFixed(2) +'% ' + y.toFixed(2) + '%}';
          }else{
            style.appendChild(document.createTextNode('.modal {transform-origin: '+ event.clientX +'px ' + event.clientY + 'px}'));
          }
          document.getElementsByTagName('head')[0].appendChild(style);
          $timeout(function () {
            console.log('clicked');console.log('cars',$element,$('.modal-mlg'));
            document.getElementsByTagName('head')[0].removeChild(style);
          },4000)
        })
      }

      return directive;
    }
  })();
