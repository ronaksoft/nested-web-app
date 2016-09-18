(function (){
    'use strict';
 angular
     .module('nested')
     .directive('nstMention', function ($timeout , NstSvcUserFactory, NstSvcPlaceFactory, NstVmUser, NstVmPlace) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

          element.on("hidden.atwho", function(event, flag, query) {
            $timeout(function(){
              element.attr("mention", false);
            },200);
          });

          element.on("shown.atwho", function(event, flag, query) {
            element.attr("mention", true);
          });

          scope.tplUrl = "<li data-id='${id}' class='_difv'><img src='${avatar}' class='account-initials-32 mCS_img_loaded _df'><div class='_difv'><span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>  ${name}</span><span class='_df nst-mood-storm nst-font-small'>${id}</span></div></li>";

          element
            .atwho({
              at:"@",
              searchKey:"name",
              maxLen: 10,
              startWithSpace: true,
              limit:5, 
              displayTpl:scope.tplUrl,
              callbacks : {    
                  beforeInsert:function (value, $li){
                  var elm = angular.element($li);
                  return '@' + elm.attr('data-id');
                },
                  remoteFilter : function (query, callback) {
                      var searchSettings = {
                           query : query,
                           limit : 5,
                       };
                      NstSvcUserFactory.search(searchSettings).then(function (users) {
                          var items = [];
                          _.map(users, function (item) {
                                            var obj =  new NstVmUser(item);
                                          items.push({
                                                id : obj.id,
                                                name : obj.name,
                                                avatar : obj.avatar
                                                    })
                                            });
                          callback(items);
                      }).catch(function (error) {
                      }); 
                   }
                }
              })
          

            .atwho({
                    at:"#", 
                    searchKey:"name",
                    maxLen: 10,
                    startWithSpace: true,
                    limit:5,
                    displayTpl:scope.tplUrl,
                    callbacks : {        
                          beforeInsert:function (value, $li){
                          var elm = angular.element($li);
                          return '#' + elm.attr('data-id');
                      },
                    remoteFilter : function (query, callback) {
                       var searchSettings = {
                           query : query.query,
                           limit : 5,
                      };
                    NstSvcPlaceFactory.search(query).then(function (places) {
                           var items = [];
                         _.map(places, function (item) {
                                            var obj =  new NstVmPlace(item);
                            
                                       items.push({
                                                id : obj.id,
                                                name : obj.name,
                                                avatar : obj.avatar
                                                 })
                                      });
                        
                             callback(items);
                      }).catch(function (error) {
                      });
                     
                   }
              }})

            }
          }
      })
       
})();
