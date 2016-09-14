(function (){
    'use strict';
 angular
     .module('nested')
     .directive('nstMention', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

          var data = [
            {'name':"Shayesteh Naeimabadi", 'id':"robzizo", 'imageUrl': "http://xerxes.nested.ronaksoftware.com/view/57d8db65b074b1536900afe9/THU57CFECBEA203D57CFECBEB074B103987227BB/"},
            {'name':"ali Mahmoodi", 'id':"naamesteh", 'imageUrl': "http://xerxes.nested.ronaksoftware.com/view/57d8db65b074b1536900afe9/THU57D66D409D35057D66D40B074B110AB431297/"},
            {'name':"Pouya Amirahmadi", 'id':"pouya",'imageUrl': "http://xerxes.nested.ronaksoftware.com/view/57d8db65b074b1536900afe9/THU57C2C3A00142257C2C3A0B074B12F5A43DCC5/"}
          ];

          element.on("hidden.atwho", function(event, flag, query) {
            $timeout(function(){
              element.attr("mention", false);
            },200);
          });

          element.on("shown.atwho", function(event, flag, query) {
            element.attr("mention", true);
          });

          scope.tplUrlAt = "<li class='_difv'><img src='${imageUrl}' class='account-initials-32 mCS_img_loaded _df'><div class='_difv'><span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>  ${name}</span><span class='_df nst-mood-storm nst-font-small'>${id}</span></div></li>";
          scope.tplUrlHas = "<li class='_difv'><img src='${imageUrl}' class='account-initials-32 mCS_img_loaded _df'><div class='_difv'><span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>  ${name}</span><span class='_df nst-mood-storm nst-font-small'>${id}</span></div></li>";
          element
            .atwho({at:"@", 'data':data, searchKey:"name", limit:5, displayTpl:scope.tplUrlAt})


            .atwho({at:"#", 'data':data, searchKey:"name", limit:5, displayTpl:scope.tplUrlHas})

            },
          };

        });
})();
