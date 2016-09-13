(function (){
    'use strict';
 angular
     .module('nested')
     .directive('nstMention', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

          var data = [
            {'name':"robzizo", 'imageUrl': "http://xerxes.nested.ronaksoftware.com/view/57d78985b074b1536c59cc57/THU57CFECBEA203D57CFECBEB074B103987227BB/"},
            {'name':"naamesteh", 'imageUrl': "#"},
            {'name':"pouya", 'imageUrl': "#"}
          ];

          element.on("hidden.atwho", function(event, flag, query) {
            $timeout(function(){
              element.attr("mention", false);
            },200);
          });

          element.on("shown.atwho", function(event, flag, query) {
            element.attr("mention", true);
          });

          scope.tplUrlAt = "<div class='_dtc'><div class='_dtr'><ul class='list-unstyled text-center'><li class='more-place-row _dtc'><img src='${imageUrl}' class='account-initials-32 mCS_img_loaded '></li><span class='_dtc teammate-name nst-mood-solid text-left ng-binding'>  ${name}</span></li></ul></div></div>";
          scope.tplUrlHas = "<div class='_dtc'><div class='_dtr'><ul class='list-unstyled text-center'><li class='more-place-row _dtc'><img src='${imageUrl}' class='account-initials-32 mCS_img_loaded'></li><span class='_dtc teammate-name nst-mood-solid text-left ng-binding'>  ${name}</span></a></ul></div></div>";
          element
            .atwho({at:"@", 'data':data, searchKey:"name", limit:5, displayTpl:scope.tplUrlAt})


            .atwho({at:"#", 'data':data, searchKey:"name", limit:5, displayTpl:scope.tplUrlHas})

            },
          };

        });
})();
