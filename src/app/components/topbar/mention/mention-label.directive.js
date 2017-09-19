(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionLabel', function (_, $rootScope, $timeout, $window,
                                            NstSvcLabelFactory, NstSvcTranslation) {
      return {
        restrict: 'A',
        link: function (scope, _element) {

          appendMention(_element, '');

          function appendMention(element, key) {

            var template =
              "<li data-id='${id}' class='_difv'>" +
              "<svg class='_24svg mirror _fn label-initials-32 mCS_img_loaded _df color-lbl-${code}'>" +
              "<use xlink:href='/assets/icons/nst-icn24.svg#tag'></use>" +
              "</svg>" +
              "<div class='_difv'>" +
              "<span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>${name}</span>" +
              "<span class='_df nst-mood-storm nst-font-small'>${type}</span>" +
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
                    NstSvcLabelFactory.search(query).then(function (labels) {
                      var uniqueLabels = _.unionBy(labels, 'id');
                      var items = [];
                      _.map(uniqueLabels, function (item) {
                        items.push({
                          id: item.title,
                          type: item.public ? NstSvcTranslation.get('everyone') : NstSvcTranslation.get('specific users'),
                          name: item.title,
                          code: item.code,
                          searchField: [item.id, item.title].join(' ')
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