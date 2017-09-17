(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionPlace', function (_, $rootScope, $timeout, $window,
                                           NST_USER_SEARCH_AREA, NstSvcPlaceFactory, NstVmPlace) {
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
                    });
                  }
                }
              });
            }
        }
      }
    })

})();
