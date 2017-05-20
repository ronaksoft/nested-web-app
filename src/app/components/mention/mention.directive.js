(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMention', function (_, $rootScope, $timeout,
                                       NST_USER_SEARCH_AREA,
                                       NstSvcUserFactory, NstSvcPlaceFactory, NstVmPlace,
                                       NstVmUser) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {

          if (attrs.uiTinymce) {
            scope.$watch('activeEditorElement', function () {
              appendMention(angular.element(scope.activeEditorElement))
            })
          } else {
            appendMention(element)
          }

          function appendMention(element) {

            var activeHashtag = attrs.nstMention ? attrs.nstMention.indexOf("#") > -1 ? true : false : true;
            var activeAtsign = attrs.nstMention ? attrs.nstMention.indexOf("@") > -1 ? true : false : true;

            var tplUrl = "<li data-id='${id}' class='_difv'><img src='${avatar}' class='account-initials-32 mCS_img_loaded _df'>" +
              "<div class='_difv'>" +
              "<span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>  ${name}</span>" +
              "<span class='_df nst-mood-storm nst-font-small'>${id}</span>" +
              "</div>" +
              "</li>";

            element.on("hidden.atwho", function (event, flag, query) {
              $timeout(function () {
                element.attr("mention", false);
              }, 200);
            });

            element.on("shown.atwho", function (event, flag, query) {
              element.attr("mention", true);
            });

            if (activeAtsign)
              element
                .atwho({
                  at: "@",
                  searchKey: "searchField",
                  maxLen: 10,
                  startWithSpace: true,
                  limit: 5,
                  displayTpl: tplUrl,
                  callbacks: {
                    beforeInsert: function (value, $li) {
                      var elm = angular.element($li);
                      return '@' + elm.attr('data-id').trim();
                    },
                    remoteFilter: function (query, callback) {
                      var searchSettings = {
                        query: query,
                        limit: 5,
                      };
                      if (attrs.postId) {
                        searchSettings.postId = attrs.postId;
                      }
                      if (attrs.placeId) {
                        searchSettings.placeId = attrs.placeId;
                      }
                      NstSvcUserFactory.search(searchSettings, attrs.postId ? NST_USER_SEARCH_AREA.MENTION : NST_USER_SEARCH_AREA.ACCOUNTS).then(function (users) {
                        var uniqueUsers = _.unionBy(users, 'id');
                        var items = [];
                        _.map(uniqueUsers, function (item) {
                          var obj = new NstVmUser(item);

                          if (obj.avatar === "") {
                            var avatarElement = angular.element("<img src='" + obj.avatar + "' data-word-count='2' data-font-size='32' class='account-initials-32 mCS_img_loaded _df'>");
                            avatarElement.initial({
                              name: obj.name
                            })
                          }


                          items.push({
                            id: obj.id,
                            name: obj.name,
                            avatar: obj.avatar == "" ? avatarElement[0].currentSrc : obj.avatar,
                            searchField: [obj.id, obj.name].join(' ')
                          })
                        });
                        callback(items);
                      }).catch(function (error) {
                      });
                    }
                  }
                });

            if (activeHashtag)
              element
                .atwho({
                  at: "#",
                  searchKey: "searchField",
                  maxLen: 10,
                  startWithSpace: true,
                  limit: 5,
                  displayTpl: tplUrl,
                  callbacks: {
                    beforeInsert: function (value, $li) {
                      var elm = angular.element($li);
                      return '#' + elm.attr('data-id').trim();
                    },
                    remoteFilter: function (query, callback) {
                      var searchSettings = {
                        query: query.query,
                        limit: 5,
                      };
                      NstSvcPlaceFactory.search(query).then(function (places) {
                        var uniquePlaces = _.unionBy(places, 'id');
                        var items = [];
                        _.map(uniquePlaces, function (item) {
                          var obj = new NstVmPlace(item);

                          items.push({
                            id: obj.id,
                            name: obj.name,
                            avatar: obj.avatar,
                            searchField: [obj.id, obj.name].join(' ')
                          })
                        });

                        callback(items);
                      }).catch(function (error) {
                      });

                    }
                  }
                })

          }


          //remove useless atwho-container tag after change a state
          $rootScope.$on('$stateChangeSuccess', function () {
            angular.element(".atwho-container").remove();
          });

        }
      }
    })

})();
