(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $scope, $location, $q, $stateParams, $log, $timeout,
    NstSvcPostFactory, NstSvcMessageSettingStorage,
    NST_MESSAGES_SORT_OPTION) {
    var vm = this;

    vm.filter = $stateParams.filter || '!$all';

    vm.loadMore = loadMore;
    vm.sort = sort;

    var defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
        defaultViewSetting = {
          content : true,
          attachments : true,
          comments : true,
          quickMessage : true,
        },
        sortOptionStorageKey = 'sort-option',
        viewSettingStorageKey = 'view-setting';

    vm.messagesSetting = {
      limit : 10,
       skip : 0,
       sort : defaultSortOption
    };

    vm.toggleContentPreview       = toggleContentPreview;
    vm.toggleAttachmentPreview    = toggleAttachmentPreview;
    vm.toggleCommentsPreview      = toggleCommentsPreview;
    vm.toggleQuickMessagePreview  = toggleQuickMessagePreview;

    (function () {
      $q.all([getMessages(), loadViewSetting(), loadSortOption()]).then(function (values) {
        vm.messages = mapMessages(values[0]);
        vm.ViewSetting = _.defaults(vm.defaultViewSetting, values[1]);
        vm.messagesSetting.sort = values[2] || vm.defaultSortOption
        console.log(vm.messages);
      }).catch(function (error) {
        $log.debug(error)
      });

    })();

    function getMessages() {
      if (vm.filter === '!$all') {
        return NstSvcPostFactory.getMessages(vm.messagesSetting);
      } else {
        var placeId = vm.filter;
        return NstSvcPostFactory.getPlaceMessages(vm.messagesSetting, placeId);
      }
    }

    function loadViewSetting() {
      return $q(function (resolve, reject) {
        var setting = NstSvcMessageSettingStorage.get(viewSettingStorageKey, defaultViewSetting);
        resolve(setting);
      });
    }

    function loadSortOption() {
      return $q(function (resolve, reject) {
        var option = NstSvcMessageSettingStorage.get(sortOptionStorageKey, defaultSortOption);
        resolve(option);
      });
    }

    function sort(option) {
      if (!_.includes([
        NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
        NST_MESSAGES_SORT_OPTION.LATEST_ACTIVITY
      ], option)){
        throw 'The provided sort option key is not valid';
      }


      vm.messagesSetting.sort = option;
      loadMessages();
    }

    function loadMessages() {
      getMessages().then(function (messages) {
        vm.messages = mapMessages(messages);
      }).catch(function (error) {
        // TODO:  handle the error
      });
    }

    function loadMore() {
      messagesSetting.skip += messagesSetting.limit;
      loadMessages();
    }

    function mapMessages(messages) {

      var now = moment();

      var fileTypes = {
        'image' : 'Image',
        'audio' : 'Audio',
        'video' : 'Video',
        'text' : 'Text',
        'application' : 'Application'
      };

      var fileFormats = {
        'zip' : 'ZIP',
        'x-rar-compressed' : 'RAR',
        'rtf' : 'DOC',
        'msword' : 'DOCX',
        'vnd.openxmlformats-officedocument.wordprocessingml.document' : 'DOC'
      };

      return _.map(messages, function (message) {

        var firstPlace = _.first(message.places);
        var otherPlaces = _.remove(messages.places, firstPlace, 'id');

        return {
          id : message.id,
          sender : mapSender(message.sender),
          subject : message.subject,
          body : message.body,
          firstPlace : mapPlace(firstPlace),
          otherPlaces : _.map(otherPlaces, mapPlace),
          otherPlacesCount : otherPlaces.length,
          totalPlacesCount : message.places.length,
          date : formatMessageDate(message.date),
          attachments : _.map(message.attachments, mapAttachment),
          hasAnyAttachment : message.attachments.length > 0,
          comments : _.map(message.comments, mapComment),
          hasAnyComment : message.comments.length > 0,
          commentsCount : message.attachments.length,
          userHasRemoveAccess : message.haveAnyPlaceWithDeleteAccess()
        };
      });

      function mapSender(sender) {
        return {
          name : sender.fullname,
          username : sender.username,
          avatar : sender.picture.x32.url.download
        };
      }

      function mapAttachment(attach) {
        return {
          name : attach.filename,
          size : attach.size,
          url : attach.download.url,
          type : findFileType(attach),
          format : findFileFormat(attach),
        };
      }

      function mapPlace(place) {
        return {
          id : place.id,
          name : place.name,
          // picture : place.
        };
      }

      function formatMessageDate(date) {
        if (!date) {
          return 'Unknown';
        }

        if (!moment.isMoment(date)){
          date = moment(date);
        }

        var today = moment().startOf('day');
        if (date.isSameOrAfter(today)) { // today
          return date.format('[Today at] HH:mm');
        }

        var yesterday = moment().startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) { // yesterday
          return date.format('[Yesterday at] HH:mm');
        }

        var year = moment().startOf('year');
        if (date.isSameOrAfter(year)) { // current year
          return date.format('MMM DD, HH:mm');
        }

        return date.format("MMM DD YYYY, HH:mm"); // last year and older
      }

      function formatCommentDate(date) {
        if (!date) {
          return 'Unknown';
        }

        return date.fromNow(false); // 'true' just removes the trailing 'ago'
      }

      function findFileType(attach) {
        var type = attach.mimeType.split('/')[0];

        return fileTypes[type] || 'Unknown';
      }

      function findFileFormat(attach) {
        var format = attach.mimeType.split('/')[1];

        return fileFormats[format] || 'File';
      }

      function mapComment(comment) {
        return {
            body : comment.body,
            date : formatCommentDate(comment),
            sender : mapSender(comment.sender)
        };
      }
    }

    function toggleContentPreview() {
      vm.contentPreview = !vm.contentPreview;
    }

    function toggleCommentsPreview() {
      vm.commentsPreview = !vm.commentsPreview;
    }

    function toggleAttachmentPreview() {
      vm.attachmentPreview = !vm.attachmentPreview;
    }

    function toggleQuickMessagePreview() {
      vm.quickMessagePreview = !vm.quickMessagePreview;
    }

  }

})();
