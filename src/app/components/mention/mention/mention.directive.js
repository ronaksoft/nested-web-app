(function (){
    'use strict';
 angular
     .module('nested')
     .directive('nstMention', function () {
    return {
        restrict: 'A',
        // templateUrl: 'app/components/mention/mention.tpl.html',
        link: function (scope, element, attrs) {

            var data = ['naamesteh','robzizo'];
          element
            .atwho({at:"@", 'data':data, searchKey:"name", limit:5, displayTpl:"<div><ul><li  width='100' height='30'><img src='#' height='24' width='24'/> ${name} </li></ul></div>"})


            .atwho({at:"#", 'data':data, searchKey:"name", limit:5, displayTpl:"<div><ul><li  width='100' height='30'><img src='#' height='24' width='24'/> ${name} </li></ul></div>"});


            },
          };

       });
})();
