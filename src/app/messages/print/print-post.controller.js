(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PrintPostController', PrintPostController);

  /** @ngInject */
  function PrintPostController($scope, $stateParams, NST_CONFIG, $cookies, $sce, $timeout, md5,
                          _, toastr, NstSvcPostFactory, NstSvcPostInteraction, NstSvcTranslation, NstHttp, NstSvcAuth, NstSvcI18n, NstSvcViewStorage, NstSvcAppFactory) {
    var vm = this;
    var iframeOnMessage;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.postId = $stateParams.postId;
    vm.loadProgress = false;
    vm.mergePostCardVariable = mergePostCardVariable;

    /*****************************
     ***** Controller Methods ****
     *****************************/


    (function () {
      markPostAsRead(vm.postId);
      vm.loadProgress = true;
      load(vm.postId);
      
    })();

    function load(postId) {
      new NstHttp(NST_CONFIG.REGISTER.AJAX.URL, {
        cmd: 'post/get',
        data: {
          post_id: postId
        },
        _sk: $cookies.get('nsk'),
        _ss: $cookies.get('nss')
      }).post().then(function (result) {
        var post = NstSvcPostFactory.parsePost(result.data);
        vm.loadProgress = false;
        vm.message = post;
        var imgRegex = new RegExp('<img(.*?)source=[\'|"](.*?)[\'|"](.*?)>', 'g');
        var resources = post.resources;
        var body = post.body || post.preview;
        if (body.length > 0) {
          vm.message.body = body.replace(imgRegex, function (m, p1, p2, p3) {
            var src = resources[p2];
            return "<img" + p1 + "src='" + src + "' " + p3 + ">"
          });
        }
        if (post.iframeUrl) {
          initIfram();
        }
      });
    }

    function initIfram() {
      vm.iframeId = 'iframe-' + vm.message.id + '-post-view';
      $timeout(function () {
        vm.message.iframeObj = document.getElementById(vm.iframeId);
        var userData = getUserData();
        iframeOnMessage = function (e) {
          if (vm.message.iframeUrl.indexOf(e.origin) === -1) {
            return;
          }
          var data = JSON.parse(e.data);
          if (data.url === vm.message.iframeUrl) {
            switch (data.cmd) {
              case 'getInfo':
                sendIframeMessage('setInfo', userData);
                break;
              case 'setSize':
                // vm.post.iframeObj.style.width = data.data.width + 'px';
                vm.message.iframeObj.style.cssText = 'height: ' + data.data.height + 'px !important';
                break;
              case 'setNotif':
                if (['success', 'info', 'warning', 'error'].indexOf(data.data.type) > -1) {
                  toastr[data.data.type](data.data.message);
                }
                break;
              case 'createToken':
                NstSvcAppFactory.createToken(data.data.clientId).then(function (res) {
                  sendIframeMessage('setLoginInfo', {
                    token: data.data.token,
                    appToken: res.token,
                    appDomain: userData.app,
                    username: userData.userId,
                    fname: userData.fname,
                    lname: userData.lname,
                    email: userData.email
                  });
                }).catch(function () {
                  toastr.warning(NstSvcTranslation.get('Can not create token for app: {0}').replace('{0}', data.data.clientId));
                });
                break;
              default:
                break;
            }
          }
        };
        window.addEventListener('message', iframeOnMessage);
      }, 500);
    }

    function sendIframeMessage(cmd, data) {
      var msg = {
        cmd: cmd,
        data: data
      };
      var hash = createHash(msg);
      msg.hash = hash;
      if (!vm.message.iframeObj) {
        vm.iframeId = 'iframe-' + vm.message.id + '-post-view';
        vm.message.iframeObj = document.getElementById(vm.iframeId);
      }
      if (!vm.message.iframeObj.contentWindow) {
        return;
      }
      vm.message.iframeObj.contentWindow.postMessage(JSON.stringify(msg), '*');
    }

    function createHash(data) {
      var str = JSON.stringify(data);
      str = encodeURIComponent(str).split('%').join('');
      return md5.createHash(str);
    }

    function getUserData() {
      var user = NstSvcAuth.user || {id: '_'};
      var msgId = vm.message.id;
      var app = NST_CONFIG.DOMAIN;
      var locale = NstSvcI18n.selectedLocale;
      var darkMode = NstSvcViewStorage.get('nightMode');
      if (darkMode == false || darkMode === 'no') {
        darkMode = false;
      } else {
        darkMode = true;
      }
      return {
        userId: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName,
        msgId: msgId,
        app: app,
        locale: locale,
        dark: darkMode
      }
    }

    function markPostAsRead(id) {
      vm.markAsReadProgress = true;
      NstSvcPostInteraction.markAsRead(id).then(function () {
        var targetPost = _.find(vm.messages, { id: id });
        if (targetPost) {
          targetPost.read = true;
        }
      }).finally(function () {
        vm.markAsReadProgress = false;
      });
    }

    function mergePostCardVariable(url) {
      // var userId = NstSvcAuth.user || {id: '_'};
      // userId = userId.id;
      // var msgId = vm.post.id;
      // var app = NST_CONFIG.DOMAIN;
      // var urlPostFix = '';
      // if (url.indexOf('#') > -1) {
      //   url = url.split('#');
      //   urlPostFix = '#' + url[1];
      //   url = url[0];
      // }
      // if (url.indexOf('?') > -1) {
      //   url += '&';
      // } else {
      //   url += '?';
      // }
      // url += 'nst_user=' + userId + '&nst_mid=' + msgId + '&nst_app=' + app + '&nst_locale=' + NstSvcI18n.selectedLocale;
      return $sce.trustAsResourceUrl(url /*+ urlPostFix*/);
    }

    $scope.$on('$destroy', function () {});
  }

})();
