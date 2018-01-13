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

  function CommentBodyController($scope, $sce, $q, $filter, _, NstSvcAuth) {
    var vm = this;

    vm.user = NstSvcAuth.user;
    vm.removeItem = removeItem;
    vm.parts = [];

    if (vm.isTask === undefined) {
      vm.isTask = false;
    }

    if (vm.isCreator === undefined) {
      vm.isCreator = false;
    }

    init();

    function init() {
      var filteredComment = applyFilters(vm.comment.body);
      vm.parts = separateMentions(filteredComment);
    }

    function applyFilters(text) {
      var html = $filter('plainToHtml')(text);
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

    function removeItem(id) {
      if (_.isFunction(vm.commentRemove)) {
        vm.commentRemove(id);
      }
    }

    $scope.to_trusted = function (html_code) {
      return $sce.trustAsHtml(html_code);
    };
  }
})();
