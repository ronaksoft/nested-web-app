(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstMention', function (_, $rootScope, $timeout, $window, $,
                                       NST_USER_SEARCH_AREA, NstSvcAuth, NstSvcTranslation, SvcRTL,
                                       NstSvcUserFactory, NstSvcPlaceFactory, NstSvcLabelFactory, NstVmPlace,
                                       NstVmUser, NST_SEARCH_QUERY_PREFIX) {
      return {
        restrict: 'A',
        link: function (scope, _element, attrs) {
          var userKey = NST_SEARCH_QUERY_PREFIX.USER;
          var placeKey = NST_SEARCH_QUERY_PREFIX.PLACE;
          var labelKey = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;

          if (attrs.mentionNewMethod !== undefined) {
            userKey = NST_SEARCH_QUERY_PREFIX.NEW_USER;
            placeKey = NST_SEARCH_QUERY_PREFIX.NEW_PLACE;
            labelKey = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;
          }

          if (attrs.uiTinymce) {
            scope.$watch('activeEditorElement', function () {
              appendMention(angular.element(scope.activeEditorElement))
            });
          } else {
            appendMention(_element)
          }

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
                if (direction === 'rtl') {
                  offset.left = (offset.left - containerWidth) + 5;
                } else {
                  offset.left = ($window.innerWidth - offset.left) - 5;
                }
              }
            }
            catch (e) {
              return offset;
            }
          }

          function appendMention(element) {

            var enableAccountMention = attrs.nstMention ? attrs.nstMention.indexOf(userKey) > -1 ? true : false : true;
            // var enablePlaceMention = attrs.nstMention ? attrs.nstMention.indexOf(placeKey) > -1 ? true : false : true;
            var enablePlaceMention = false;
            var enableLabelMention = (attrs.mentionEnableLabel !== undefined);

            var mentionTemplate =
              "<li data-id='${id}' class='_difv user-suggets-mention'>" +
              "<img src='${avatar}' class='account-initials-16 mCS_img_loaded _df'>" +
              "<div>" +
              "<span class='_df list-unstyled text-centerteammate-name _fw nst-mood-solid text-name'><span class='_db _fw _txe' dir='${dir}'>${name}</span></span>" +
              "<span class='nst-mood-storm _df _fn'><span class='_db _txe' dir='ltr'>${alias}</span></span>" +
              "</div>" +
              "</li>";
            var mentionPlaceTemplate = "<li data-id='${id}' class='_difv'><img src='${avatar}' class='place-picture-32 mCS_img_loaded _df'>" +
              "<div class='_difv'>" +
              "<span class='_df list-unstyled text-center teammate-name  nst-mood-solid text-name'>  ${name}</span>" +
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

            if (enableAccountMention) {
              element
                .atwho({
                  at: userKey,
                  searchKey: 'searchField',
                  maxLen: 10,
                  startWithSpace: true,
                  limit: 5,
                  displayTpl: mentionTemplate,
                  callbacks: {
                    beforeInsert: function (value, $li) {
                      var elm = angular.element($li);
                      return userKey + elm.attr('data-id').trim();
                    },
                    remoteFilter: function (query, callback) {
                      var searchSettings = {
                        query: query,
                        limit: 5
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
                            dir : SvcRTL.rtl.test(obj.name[0]) ? 'rtl' : 'ltr',
                            avatar: obj.avatar == "" ? avatarElement[0].currentSrc : obj.avatar,
                            alias: obj.id === NstSvcAuth.user.id ? NstSvcTranslation.get('Me') : '',
                            searchField: [obj.id, obj.name].join(' ')
                          })
                        });
                        callback(items);
                      }).catch(function () {
                      });
                    },
                    beforeReposition: function (offset) {
                      repositionModal(offset, this);
                    }
                  }
                });
            }

            if (enablePlaceMention) {
              element
                .atwho({
                  at: placeKey,
                  searchKey: 'searchField',
                  maxLen: 10,
                  startWithSpace: true,
                  limit: 5,
                  displayTpl: mentionPlaceTemplate,
                  callbacks: {
                    beforeInsert: function (value, $li) {
                      var elm = angular.element($li);
                      return placeKey + elm.attr('data-id').trim();
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
                    },
                    beforeReposition: function (offset) {
                      repositionModal(offset, this);
                    }
                  }
                });
            }

            var labelTemplate =
              "<li data-id='${id}' class='_difv'>" +
              "<svg class='_24svg mirror _fn label-initials-32 mCS_img_loaded _df color-lbl-${code}'>" +
              "<use xlink:href='/assets/icons/nst-icn24.svg#tag'></use>" +
              "</svg>" +
              "<div class='_difv'>" +
              "<span class='_df list-unstyled text-centerteammate-name  nst-mood-solid text-name'>  ${name}</span>" +
              "<span class='_df nst-mood-storm nst-font-small'>${type}</span>" +
              "</div>" +
              "</li>";

            if (enableLabelMention) {
              element
                .atwho({
                  at: labelKey,
                  searchKey: 'searchField',
                  maxLen: 10,
                  startWithSpace: true,
                  limit: 5,
                  displayTpl: labelTemplate,
                  callbacks: {
                    beforeInsert: function (value, $li) {
                      var elm = angular.element($li);
                      return labelKey + '"' + elm.attr('data-id') + '"';
                    },
                    remoteFilter: function (query, callback) {
                      NstSvcLabelFactory.search(query).then(function (labels) {
                        var uniqueLabels = _.unionBy(labels, 'id');
                        var items = [];
                        _.map(uniqueLabels, function (item) {
                          items.push({
                            id: item.title,
                            type: item.public ? 'everyone' : 'specific users',
                            name: item.title,
                            code: item.code,
                            searchField: [item.id, item.title].join(' ')
                          })
                        });
                        callback(items);
                      }).catch(function () {
                      });
                    },
                    beforeReposition: function (offset) {
                      repositionModal(offset, this);
                    }
                  }
                });
            }


            //remove useless atwho-container tag after change a state
            $rootScope.$on('$stateChangeSuccess', function () {
              angular.element(".atwho-container").remove();
            });

          }
        }
      }
    })

})();
