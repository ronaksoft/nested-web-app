(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionLabel', function (_, $rootScope, $timeout, $window, SvcRTL,
                                            NstSvcLabelFactory, NstSvcTranslation, NST_LABEL_SEARCH_FILTER) {
      return {
        restrict: 'A',
        scope: {
          selectedList: '=nstMentionList',
          dataList: '=nstMentionData',
          itemClicked: '=nstMentionClicked',
          myLabel: '=?'
        },
        link: function (scope, _element) {

          var filter = NST_LABEL_SEARCH_FILTER.ALL;
          if (scope.myLabel !== undefined && scope.myLabel === true) {
            filter = NST_LABEL_SEARCH_FILTER.MY_LABELS;
          }

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
                  offset.left = ($window.innerWidth - offset.left) - 10;
                }
              }
            }
            catch (e) {
              return offset;
            }
          }

          function appendMention(element, key) {

            var template =
              "<li data-id='${id}' class='_difv label-suggets-mention'>" +
              "<svg class='_16svg mirror _fn label-initials-16 mCS_img_loaded _df color-lbl-${code}'>" +
              "<use xlink:href='/assets/icons/nst-icn16.svg#tag'></use>" +
              "</svg>" +
              "<div>" +
              "<span class='_df list-unstyled text-centerteammate-name _fw nst-mood-solid text-name'><span class='_db _fw _txe' dir='${dir}'>${name}</span></span>" +
              "<span class='_df _fn nst-mood-storm'><span class='_db _txe'></span></span>" +
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

            var labelsData = [];
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
                    var index = _.findIndex(labelsData, {title: value});
                    if (index > -1 && _.isArray(scope.dataList)) {
                      scope.dataList.push(labelsData[index]);
                      scope.dataList = _.uniqBy(scope.dataList, 'id');
                    }
                    var elm = angular.element($li);
                    $timeout(scope.itemClicked, 10);
                    return key + elm.attr('data-id').trim() + ',';
                  },
                  remoteFilter: function (query, callback) {
                    NstSvcLabelFactory.search(query, filter).then(function (labels) {
                      var uniqueLabels = _.unionBy(labels, 'id');
                      if (_.isArray(scope.selectedList)) {
                        var list = _.map(scope.selectedList, function (item) {
                          return {
                            title: item
                          };
                        });
                        uniqueLabels = _.differenceBy(uniqueLabels, list, 'title');
                      }
                      var items = [];
                      _.map(uniqueLabels, function (item) {
                        items.push({
                          id: item.title,
                          type: item.public ? NstSvcTranslation.get('everyone') : NstSvcTranslation.get('specific users'),
                          name: item.title,
                          dir : SvcRTL.rtl.test(item.title[0]) ? 'rtl' : 'ltr',
                          code: item.code,
                          searchField: [item.id, item.title].join(' ')
                        })
                      });
                      labelsData = uniqueLabels;
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
