(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('uneditable', uneditable);

  function uneditable($timeout, _) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var eventReferences = [];
        $timeout(init, 100);

        function init() {
          if (attrs.uneditable !== 'true') {
            return
          }
          eventReferences.push(scope.$watch(function () {
            return ngModel.$viewValue || $(element[0]).val()
          }, function (v) {
            if (angular.isDefined(v)) return start(v);
          }));

          var haveNext = false;

          function start(v) {
            if (haveNext) {
              element.next().remove();
            }
            haveNext = true;
            var el = element[0];
            var style = getComputedStyle(el);
            var styled = {
              color: style.color,
              fontSize: style.fontSize,
              height: style.height,
              lineHeight: style.lineheight,
              display: 'flex',
              flex: style.flex,
              fontWeight: style.fontWeight,
              marginTop: style.marginTop,
              marginBottom: style.marginBottom,
              marginLeft: style.marginLeft,
              marginRight: style.marginRight,
              paddingTop: style.paddingTop,
              paddingBottom: style.paddingBottom,
              paddingLeft: style.paddingLeft,
              paddingRight: style.paddingRight,
              width: style.width
            };

            var newSpan = document.createElement('span');
            for (var k in styled) {
              newSpan.style[k] = styled[k]
            }
            newSpan.innerText = v.length > 0 ? v : el.placeholder;
            element[0].style.display = 'none';
            newSpan.setAttribute('class', el.className);
            element.after(newSpan);
          }
        }

        scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }
    };
  }
})();
