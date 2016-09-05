(function() {
  'use strict';

  angular
    .module('nested')
    .directive('maxLength', maxLengthHighlight);

  function maxLengthHighlight() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        var str = "custom";
        function highlight(str) {
          var maxLength = parseInt(attrs.maxLength);
          var caretPos = doGetCaretPosition(element[0]) - maxLength ;
          //console.log(caretPos);
          if (str.length > maxLength) {
            var innerHTML = '<p>' + str.substring(0, maxLength) + '<em class=\'highlight\'>' + str.substring(maxLength) + '</em>' + '</p>';
            //element.html(innerHTML);
            //placeCaretAtPos(element,caretPos);
          }

        }

        function doGetCaretPosition (element) {
          var caretOffset = 0;
          if (typeof window.getSelection != "undefined") {
            var range = window.getSelection().getRangeAt(0) || 0;
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
          } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
            var textRange = document.selection.createRange();
            var preCaretTextRange = document.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
          }
          return caretOffset;
        }

        function getCharacterOffsetWithin(range, node) {
          var treeWalker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            function(node) {
              var nodeRange = document.createRange();
              nodeRange.selectNodeContents(node);
              return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            },
            false
          );

          var charCount = 0;
          while (treeWalker.nextNode()) {
            charCount += treeWalker.currentNode.length;
          }
          if (range.startContainer.nodeType == 3) {
            charCount += range.startOffset;
          }
          return charCount;
        }

        function placeCaretAtPos(el,pos) {
          console.log(el.children().children(),pos);
          el.children().children().caret(pos);
        }

        scope.$watch(function(){
          return element.text().length;
        },function (oldVal ,newVal) {
          highlight(element.text());
        });


      }
    };
  }
})();
