(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMentionUser', function (_, $rootScope, $timeout, $window,
                                       NST_USER_SEARCH_AREA, SvcRTL, NstSvcTranslation,
                                       NstSvcUserFactory, NstVmUser, NstSvcAuth) {
      return {
        restrict: 'A',
        scope: {
          selectedList: '=nstMentionList',
          dataList: '=nstMentionData',
          itemClicked: '=nstMentionClicked'
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
              "<li data-id='${id}' class='_difv user-suggets-mention'>" +
              "<img src='${avatar}' class='account-initials-16 mCS_img_loaded _df'>" +
              "<div>" +
              "<span class='_df list-unstyled text-centerteammate-name _fw nst-mood-solid text-name'><span class='_db _fw _txe' dir='${dir}'>${title}</span></span>" +
              "<span class='nst-mood-storm _df _fn'><span class='_db _txe' dir='ltr'>${alias}</span></span>" +
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

            var usersData = [];
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
                    var index = _.findIndex(usersData, {id: value});
                    if (index > -1 && _.isArray(scope.dataList)) {
                      scope.dataList.push(usersData[index]);
                      scope.dataList = _.uniqBy(scope.dataList, 'id');
                    }
                    var elm = angular.element($li);
                    $timeout(scope.itemClicked, 10);
                    return key + elm.attr('data-id').trim() + ',';
                  },
                  remoteFilter: function (query, callback) {
                    var searchSettings = {
                      query: query,
                      limit: 10
                    };
                    NstSvcUserFactory.search(searchSettings, NST_USER_SEARCH_AREA.ACCOUNTS).then(function (users) {
                      var uniqueUsers = _.unionBy(users, 'id');
                      if (_.isArray(scope.selectedList)) {
                        var list = _.map(scope.selectedList, function (item) {
                          return {
                            id: item
                          };
                        });
                        uniqueUsers = _.differenceBy(uniqueUsers, list, 'id');
                      }
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
                          name: obj.id,
                          title: obj.name,
                          dir : SvcRTL.rtl.test(obj.name[0]) ? 'rtl' : 'ltr',
                          alias: obj.id === NstSvcAuth.user.id ? NstSvcTranslation.get('Me') : '',
                          avatar: obj.avatar === "" ? avatarElement[0].currentSrc : obj.avatar,
                          searchField: [obj.id, obj.name].join(' ')
                        })
                      });
                      usersData = uniqueUsers;
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
