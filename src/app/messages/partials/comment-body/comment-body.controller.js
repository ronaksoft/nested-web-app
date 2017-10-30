/**
 * @file app/messages/comment-body/comment-body.controller.js
 * @desc Controller for comment body directive
 * @kind {Controller}
 * Documented by:          hamidrezakk < hamidrezakks@gmail.com >
 * Date of documentation:  2017-08-26
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('CommentBodyController', CommentBodyController);

  function CommentBodyController($scope, $sce, $q, $filter, _, NstSvcFileFactory, NstSvcAttachmentFactory, SvcMiniPlayer, NstSvcStore
                                ,NST_STORE_ROUTE, toastr) {
    var vm = this;
    vm.playVoice = playVoice;

    vm.parts = [];

    init();

    function init() {
      var filteredComment = applyFilters(vm.comment.body);
      vm.parts = separateMentions(filteredComment);
    }

    function applyFilters(text) {
      var html = $filter('plainToHtml')(text);
      // html = $filter('plainToHtml')(html);
      return html;
    }

    function separateMentions(text) {
      var regex = /@\S*|(\S+)/g;

      var match;
      var words = [];
      do {
        match = regex.exec(text);
        if (match) {
          if (match[0].indexOf('<br/>') > -1) {
            words.push({
              type: 'linebreak',
              word: match[0]
            });
          } else if (match[0].indexOf('@') > -1) {
            words.push({
              type: 'mention',
              word: match[0],
              user: _.trimStart(match[0], '@')
            });
          } else {
            words.push({
              type: 'other',
              word: match[0]
            });
          }
        }
      } while (match);

      var trimmedWords = [];
      var otherText = '';
      for (var i = 0; i < words.length; i++) {
        if (words[i].type === 'mention' || words[i].type === 'linebreak') {
          trimmedWords.push({
            type: 'other',
            word: otherText
          });
          otherText = '';
          trimmedWords.push(words[i]);
        } else {
          otherText += words[i].word + ' ';
        }
      }
      trimmedWords.push({
        type: 'other',
        word: otherText
      });
      return trimmedWords;
    }
    function getToken(id) {
      var deferred = $q.defer();
        NstSvcFileFactory.getDownloadToken(id, vm.commentBoardId).then(deferred.resolve).catch(deferred.reject).finally(function () {
      });

      return deferred.promise;
    }

    function playVoice(comment) {
      NstSvcAttachmentFactory.getOne(comment.attachment_id).then( function(attachment) {
        getToken(attachment.id).then(function (token) {
          attachment.src = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, attachment.id, token);
          attachment.isVoice = attachment.uploadType === "VOICE";
          attachment.isPlayed = true;
          attachment.sender = comment.sender;
          SvcMiniPlayer.setPlaylist(vm.commentBoardId);
          SvcMiniPlayer.addTrack(attachment);
        }).catch(function () {
          toastr.error('Sorry, An error has occured while playing the audio');
        });
      })
    }
    $scope.to_trusted = function (html_code) {
      return $sce.trustAsHtml(html_code);
    };
  }
})();
