(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionPlace', function (_, $rootScope, $timeout, $window, SvcRTL,
                                           NST_USER_SEARCH_AREA, NstSvcPlaceFactory, NstVmPlace) {
      return {
        restrict: 'A',
        scope: {
          selectedList: '=nstMentionList',
          dataList: '=nstMentionData'
        },
        link: function (scope, _element) {

          appendMention(_element, '');

          function repositionModal(offset, obj) {
            try {
              var documentDir = $('body').attr('dir');
              var containerWidth = $(obj.$el[0]).find('.atwho-view').width();
              var direction = obj.$inputor[0].style.direction;
              var inputWidth = obj.$inputor[0].offsetWidth;

              if (documentDir === 'ltr') {
                if (direction === 'rtl') {
                  offset.left = ($window.innerWidth - offset.left) - containerWidth + 5;
                }
              } else {
                if (direction === 'ltr') {
                  offset.left = (offset.left - containerWidth) + 5;
                } else {
                  offset.left = offset.left + inputWidth - containerWidth - 15;
                }
              }

              return true;
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
              "<span class='_df list-unstyled teammate-name _fw nst-mood-solid text-name'><span class='_db _fw _txe' dir='${dir}'>${title}</span></span>" +
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

            var placesData = [];
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
                    var index = _.findIndex(placesData, {id: value});
                    if (index > -1 && _.isArray(scope.dataList)) {
                      scope.dataList.push(placesData[index]);
                      scope.dataList = _.uniqBy(scope.dataList, 'id');
                    }
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
                          name: obj.id,
                          title: obj.name,
                          dir : SvcRTL.rtl(obj.name[0]) ? 'rtl' : 'ltr',
                          avatar: obj.avatar,
                          searchField: [obj.id, obj.name].join(' ')
                        })
                      });
                      placesData = uniquePlaces;
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
