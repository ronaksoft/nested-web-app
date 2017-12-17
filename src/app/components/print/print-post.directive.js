(function() {
    'use strict';

    angular
      .module('ronak.nested.web.components')
      .directive('printPost', function ($timeout, $http, $compile, $q) {
        return {
          restrict: 'EA',
          link: function (scope, element, attrs) {
              element.on('click', print)

              scope.$on('$destroy', function() {
                element.off('click', print)
              });
              scope.fn = function (){}
              var post = getPropertyByKeyPath(scope, attrs.printPost);
              function print(){
                $q.all([$http.get('app/components/print/print.html', {}),  $http.get('app/components/print/print.css', {})]).then(function(tpls) {
                    var htmlTpl = tpls[0].data;
                    var cssTpl = tpls[1].data;
                    var newscope = scope.$new();
                    newscope.post = post;
                    var compiledHtml = $compile(htmlTpl)(newscope)[0];
                    var mywindow = window.open('', '_blank', 'height=' + window.innerHeight + ',width=' + window.innerWidth + ',scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    if (mywindow == undefined){
                      return alert('Please disable your popup blocker');
                    }
                    mywindow.document.write('<html dir="rtl"><head><title>Nested Print</title>');
                    mywindow.document.write('<html><head><title>' + window.location.origin + '/#/message/' + post.id + '</title>');
                    mywindow.document.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">');
                    mywindow.document.write('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">');
                    mywindow.document.write('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" type="text/css">');
                    mywindow.document.write('<base href="' + window.location.origin + '/" target="_blank">');
                    mywindow.document.write('<style type="text/css">');
                    mywindow.document.write(cssTpl);
                    mywindow.document.write('</style>');
                    mywindow.document.write('</head><body>');
                    mywindow.document.body.appendChild(compiledHtml);
                    mywindow.document.write('<body></html>');
                    mywindow.focus();
                    $(mywindow.document).ready(function() {
                        //The Timeout is ONLY to make Safari work, but it still works with FF, IE & Chrome.
                        setTimeout(function() {
                            mywindow.print();
                            mywindow.close();
                        }, 200)
                     });
                });
              }
          }
        };
      });
      function getPropertyByKeyPath(targetObj, keyPath, tries) {
        var keys = keyPath.split('.');
        if(!tries) {
            tries = 0;
        }
        if(keys.length == 0) return undefined;
        if(!targetObj.hasOwnProperty(keys[0]) && tries < 6) {
            ++tries;
            return getPropertyByKeyPath(targetObj.$parent, keyPath, tries)
        }
        keys = keys.reverse();
        var subObject = targetObj;
        while(keys.length) {
         var k = keys.pop();
         if(!subObject.hasOwnProperty(k)) {
          return undefined;
         } else {
          subObject = subObject[k];
         }
       }
       return subObject;
      }
  })();
