(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionPlace', function (_, $rootScope, $timeout, $window, SvcRTL,
                                           NST_USER_SEARCH_AREA, NstSvcPlaceFactory, NstVmPlace) {
      return {
        restrict: 'A',
        scope: {
          selectedList: '=nstMentionList'
        },
        link: function (scope, _element) {

          appendMention(_element, '');

          function repositionModal(offset, obj) {
            try {
              var documentDir = $('body').attr('dir');
              var containerWidth = $(obj.$el[0]).find('.atwho-view').width();
              var direction = obj.$inputor.context.style.direction;

              if (documentDir === 'ltr') {
                if (direction === 'rtl') {
                  offset.left = ($window.innerWidth - offset.left) - containerWidth + 10;
                }
              } else {
                if (direction === 'ltr') {
                  offset.left = (offset.left - containerWidth) + 5;
                } else {
                  offset.left = ($window.innerWidth - offset.left) - containerWidth + 10;
                }
              }
            }
            catch (e) {
              return offset;
            }
          }

          function appendMention(element, key) {

            var template =
              "<li data-id='${id}' class='place-suggets-mention _difv'>" +
              "<img src='${avatar}' class='place-picture-16 mCS_img_loaded _df'>" +
              "<div>" +
              "<span class='_df list-unstyled teammate-name _fw nst-mood-solid text-name'><span class='_db _fw _txe' dir='${dir}'>${name}</span></span>" +
              "<span class='nst-mood-storm _df _fn'><span class='_db _txe' dir='ltr'>${id}</span></span>" +
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
                      if (_.isArray(scope.selectedList)) {
                        var list = _.map(scope.selectedList, function (item) {
                          return {
                            id: item
                          };
                        });
                        uniquePlaces = _.differenceBy(uniquePlaces, list, 'id');
                      }
                      var items = [];
                      _.map(uniquePlaces, function (item) {
                        var obj = new NstVmPlace(item);
                        items.push({
                          id: obj.id,
                          name: obj.name,
                          dir : SvcRTL.rtl.test(obj.name[0]) ? 'rtl' : 'ltr',
                          avatar: obj.avatar,
                          searchField: [obj.id, obj.name].join(' ')
                        })
                      });
                      callback(items);
                    });
                  },
                  beforeReposition: function (offset) {
                    repositionModal(offset, this);
                  }
                }
              });
            }
        }
      }
    })

})();
