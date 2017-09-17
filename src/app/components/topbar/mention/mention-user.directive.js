(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionUser', function (_, $rootScope, $timeout, $window,
                                       NST_USER_SEARCH_AREA,
                                       NstSvcUserFactory, NstVmUser) {
      return {
        restrict: 'A',
        link: function (scope, _element) {

          appendMention(_element, '');

          function appendMention(element, key) {

            var template =
              "<li data-id='${id}' class='_difv'>" +
              "<img src='${avatar}' class='account-initials-32 mCS_img_loaded _df'>" +
              "<div class='_difv'>" +
              "<span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>${name}</span>" +
              "<span class='_df nst-mood-storm nst-font-small'>${id}</span>" +
              "</div>" +
              "</li>";

            element.on('hidden.atwho', function () {
              $timeout(function () {
                element.attr('mention', false);
              }, 200);
            });

            element.on('shown.atwho', function () {
              element.attr('mention', true);
            });

            element
              .atwho({
                at: key,
                searchKey: 'searchField',
                maxLen: 10,
                startWithSpace: true,
                limit: 5,
                displayTpl: template,
                callbacks: {
                  beforeInsert: function (value, $li) {
                    var elm = angular.element($li);
                    return key + elm.attr('data-id').trim() + ',';
                  },
                  remoteFilter: function (query, callback) {
                    var searchSettings = {
                      query: query,
                      limit: 5
                    };
                    NstSvcUserFactory.search(searchSettings, NST_USER_SEARCH_AREA.ACCOUNTS).then(function (users) {
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
                    });
                  }
                }
              });
            }
        }
      }
    })

})();
