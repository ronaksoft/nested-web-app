(function() {
  'use strict';

  angular
    .module('nested')
    .directive('maxLength', maxLengthHighlight);

  function maxLengthHighlight() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {

        function highlight(str) {
          var maxLength = parseInt(attrs.maxLength) + 2;
          if (str.length > maxLength) {
            var innerHTML = '<p>' + str.substring(0,maxLength - 2) + '<em class="highlight">' + str.substring(maxLength - 2,str.length) + '</em>' + '</p>';
            // event.currentTarget.innerHTML = '';
            // event.currentTarget.innerHTML = innerHTML;
            $(element[0]).html(innerHTML);
            element[0].focus();
            placeCaretAtEnd(element[0]);
            //$(event).focus().html('').html(innerHTML)
          }

        }


        function placeCaretAtEnd(el) {
          el.focus();
          if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
          }
        }

        scope.$watch(function(){
          return element[0].innerText;
        },function () {
          highlight(element[0].innerText);
        });


      }
    };
  }
})();
