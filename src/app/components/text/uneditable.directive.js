(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('uneditable', uneditable);

  function uneditable() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        console.log(attrs.uneditable, element);
        if (attrs.uneditable != 'true') {
          return
        }
        scope.$watch(function(){
          return element.text()
        }, function(v){
          console.log(v);
          if (v.length > 0) return start();
        })
       function start(){
         console.log
        var el = element[0];
        var style = {
          color: el.style.color,
          fontSize: el.style.fontSize,
          height: el.style.height,
          width: el.style.width
        }
        var parentDiv = el.parentNode;
        
        // replace existing node sp2 with the new span element sp1
        console.log(element.text());
        var newSpan = document.createElement('span');
        newSpan.innerText = element.text();

        newSpan.setAttribute('class', el.className);
        // .after( "<p>Test</p>" )
        // parentDiv.replaceChild(newSpan, el);
       }
        // newSpan.appendChild(selectedTextNode);
      }
    };
  }
})();
