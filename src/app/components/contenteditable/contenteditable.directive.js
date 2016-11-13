(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('contentedit', function() {
    var obj = {
      restrict:'A',
      replace:false,
      scope:false,
      require:'?ngModel',
      link:function(scope,element,attrs,ngModel){
        new Medium({
          element: angular.element(element)[0],
          autofocus: false,
          autoHR: true,
          mode: Medium.richMode,
          maxLength: -1,
          tags: null,
          pasteAsText: true,
          beforeInvokeElement: function () {
          },
          beforeInsertHtml: function () {
            //this = Medium.Html
          },
          beforeAddTag: function (tag, shouldFocus, isEditable, afterElement) {
          },
          keyContext: null,
          pasteEventHandler: function(e) {
            /*default paste event handler*/
          }

        });
        return;


        //old one
        var oldVal;
        //Let's have spellcheck disabled by default
        !('spellcheck' in attrs) && attrs.$set('spellcheck','false');
        if(!ngModel){
          return;
        }
        /*
         * Let's create a function fired each time the model is
         * changed
         */
        ngModel.$viewChangeListeners.push(function(){
          //console.log('Triggers each time the view is changed ');
        })

        // The below defines the function that willr render the view on model change
        ngModel.$render = function(){
          $(element).text(ngModel.$viewValue);
        }

        //Event handler definition
        var downKeyHandler = function(e){
          if(e.keyCode === 13){ //Enter Key
            e.preventDefault();
            read();
            //$(element).blur();
          }

          if(e.keyCode === 27){ //Esc key
            e.preventDefault();
            if(oldVal && oldVal.length > 0){
              ngModel.$setViewValue(oldVal);
              ngModel.$render();
              $(element).blur();
            }
            else{
              ngModel.$setViewValue('');

              $(element).blur();
            }
          }

          if(e.keyCode === 8){ //Del Key
            if(ngModel.$viewValue.length==0){
              e.preventDefault();
            }
          }
        };

        var upKeyHandler = function(e){
          read(); //function is defined below and just extracts the innerhtml
        };

        var pasteHandler = function(e){
          scope.$apply(function(){
            //console.log('pasted');
            e.preventDefault();
            var text = e.clipboardData.getData("text/plain");
            document.execCommand("insertHTML", false, text);
          })
        }

        var blurHandler = function(){
          $(element).unbind('keyup',upKeyHandler);
          $(element).unbind('keydown',downKeyHandler);
          $(element).get(0).removeEventListener('paste',pasteHandler);
        };

        //Set the events up

        $(element).focus(function(e){
          scope.$apply(function(){
            if(typeof $(element).text() === 'string' && $(element).text().length>0 && ('modelnotempty' in attrs)){
              oldVal = $(element).text();
            }
            $(element).keydown(downKeyHandler);
            $(element).keyup(upKeyHandler);
            $(element).get(0).addEventListener('paste',pasteHandler);
          })
        })

        $(element).blur(function(e){
          scope.$apply(blurHandler);
        })

        //INTITIALIZATION
        ngModel.$setPristine();
        function read(){
          scope.$apply(function(){
            var text = $(element).text();
            if (text === '<br>') {
              text = '';
            }
            if (text.length==0 && oldVal && oldVal.length!==0) {
              if (typeof oldVal !== 'undefined') {
                text = oldVal;
              }
            }
            ngModel.$setViewValue(text);
          })
        }
      }
    }
    return obj;
})})();
