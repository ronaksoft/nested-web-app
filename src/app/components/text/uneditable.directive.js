(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('uneditable', uneditable);

  function uneditable() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        if (attrs.uneditable != 'true') {
          return
        }
        scope.$watch(function () {
          return ngModel.$viewValue || $(element[0]).val()
        }, function (v) {
          if (angular.isDefined(v)) return start(v);
        })

        var haveNext = false

        function start(v) {
          if ( haveNext ){
            element.next().remove();
          }
          haveNext = true;
          var el = element[0];
          var style = getComputedStyle(el);
          var styled = {
            color: style.color,
            fontSize: style.fontSize,
            height: style.height,
            lineHeight: style.height,
            display: 'flex',
            flex: style.flex,
            fontWeight: style.fontWeight,
            marginTop: style.marginTop,
            width: style.width
          }

          var newSpan = document.createElement('span');
          for (var k in styled) {
            newSpan.style[k] = styled[k]
          }
          newSpan.innerText = v.length > 0 ? v : el.placeholder;
          element[0].style.display = 'none';
          newSpan.setAttribute('class', el.className);
          element.after(newSpan)
        }
      }
    };
  }
})();
