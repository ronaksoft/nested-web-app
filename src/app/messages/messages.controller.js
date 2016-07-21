; (function() {
  'use strict';

  angular
    .module('nested')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($rootScope, $scope, $location, $q, $stateParams, $log, $timeout,
                              NST_MESSAGES_SORT_OPTION,
                              NstSvcPostFactory, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcMessageSettingStorage) {
    var vm = this;
    var FILTER_ALL = '!$all';
    var defaultSortOption = NST_MESSAGES_SORT_OPTION.LATEST_MESSAGES,
    defaultViewSetting = {
      content : true,
      attachments : true,
      comments : true,
      quickMessage : true,
    },
    sortOptionStorageKey = 'sort-option',
    viewSettingStorageKey = 'view-setting';

    if (!$stateParams.placeId || $stateParams.placeId === '_'){
      vm.currentPlaceId = null;
    } else {
      vm.currentPlaceId = $stateParams.placeId;
    }

    vm.filter = $stateParams.filter || FILTER_ALL;
    vm.loadMore = loadMore;
    vm.sort = sort;

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
      setPlace(vm.currentPlaceId).then(function (placeFound) {

        return $q.all([loadViewSetting(), loadSortOption(), loadRecentActivities(), getMessages()]);
      }).then(function (values) {
        if (values) {
          vm.ViewSetting = _.defaults(vm.defaultViewSetting, values[0]);
          vm.messagesSetting.sort = values[1] || vm.defaultSortOption;
          vm.activities = values[2];
          vm.messages = mapMessages(values[3]);
        }

        $log.debug(vm);
      }).catch(function (error) {
        $log.debug(error)
      });

    })();

    function getMessages() {
      if (!vm.currentPlace) {
        return NstSvcPostFactory.getMessages(vm.messagesSetting);
      } else {
        return NstSvcPostFactory.getPlaceMessages(vm.messagesSetting, vm.currentPlace.id);
      }
    }

    function loadViewSetting() {
      return $q(function (resolve, reject) {
        // var setting = NstSvcMessageSettingStorage.get(viewSettingStorageKey, defaultViewSetting);
        // resolve(setting);
        resolve(defaultViewSetting)
      });
    }

    function loadSortOption() {
      return $q(function (resolve, reject) {
        // var option = NstSvcMessageSettingStorage.get(sortOptionStorageKey, defaultSortOption);
        // resolve(option);
        resolve(defaultSortOption);
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
      vm.messagesSetting.skip += vm.messagesSetting.limit;
      loadMessages();
    }

    function loadRecentActivities() {
      var defer = $q.defer();

      var settings = {
        limit : 10,
        placeId : null
      };

      if (vm.currentPlace) {
        settings.placeId = vm.currentPlace.id;
      }

      NstSvcActivityFactory.getRecent(settings).then(function (activities) {
        defer.resolve(mapActivities(activities));
      }).catch(defer.reject);

      return defer.promise;
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

        return {
          id : message.id,
          sender : mapSender(message.sender),
          subject : message.subject,
          body : message.body,
          contentType : message.contentType,
          firstPlace : mapPlace(firstPlace),
          allPlaces : _.map(message.places, mapPlace),
          otherPlacesCount : message.places.length -1,
          allPlacesCount : message.places.length,
          date : formatMessageDate(message.date),
          attachments : _.map(message.attachments, mapAttachment),
          hasAnyAttachment : message.attachments.length > 0,
          comments : _.map(message.comments, mapComment),
          hasAnyComment : message.comments.length > 0,
          commentsCount : message.comments.length,
          // userHasRemoveAccess : message.haveAnyPlaceWithDeleteAccess()
        };
      });

      function mapSender(sender) {
        if (!sender) {
          return {};
        }
        return {
          name : sender.fullName,
          username : sender.id,
          avatar : sender.picture.getThumbnail('32').url.download
        };
      }

      function mapAttachment(attach) {
        return {
          fileName : attach.fileName,
          size : attach.size,
          url : attach.file.url,
          type : findFileType(attach),
          format : findFileFormat(attach),
          thumbnail : attach.thumbnail.getThumbnail('128').url.download
        };
      }

      function mapPlace(place) {
        return {
          id : place.id,
          name : place.name,
          picture : place.picture.getThumbnail('64').url.download
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

        if (!moment.isMoment(date)){
          date = moment(date);
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
            date : formatCommentDate(comment.date),
            sender : mapSender(comment.sender)
        };
      }
    }

    function toggleContentPreview() {
      vm.messagesSetting.contentPreview = !vm.messagesSetting.contentPreview;
    }

    function toggleCommentsPreview() {
      vm.messagesSetting.commentsPreview = !vm.messagesSetting.commentsPreview;
    }

    function toggleAttachmentPreview() {
      vm.messagesSetting.attachmentPreview = !vm.messagesSetting.attachmentPreview;
    }

    function toggleQuickMessagePreview() {
      vm.messagesSetting.quickMessagePreview = !vm.messagesSetting.quickMessagePreview;
    }

    function mapActivities(activities) {
      var items = _.map(activities, function (item) {
        return {
          id : item.id,
          actor : mapActivityActor(item),
          member : mapActivityMember(item),
          comment : mapActivityComment(item),
          post : mapActivityPost(item),
          date : getPassedTime(item.date),
          type : item.type
        };
      });

      function getPassedTime(date) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        return date.fromNow();
      }

      function mapActivityMember(activity) {
        if (!activity.member) {
          return {};
        }
        return {
          id : activity.member.id,
          name : activity.member.fullName,
          type : activity.member.type
        };
      }


      function mapActivityComment(activity) {
        if (!activity.comment) {
          return {};
        }

        return {
          id : activity.comment.id,
          body : activity.comment.body
        };
      }

      function mapActivityPost(activity) {
        if (!activity.post) {
          return {};
        }
        return {
          id : activity.post.id,
          subject : activity.post.subject,
          body : activity.post.body
        };
      }

      function mapActivityActor(activity) {
        return {
          id : activity.actor.id,
          avatar : activity.actor.picture.thumbnails.x32.url.download,
          name : activity.actor.fullName
        };
      }

      function mapActivityPlace(place) {
        return {
          id : place.id,
          name : place.name,
          picture : place.picture.getThumbnail('64').url.download
        };
      }
    }

    function setPlace(id) {
      var defer = $q.defer();
      if (!id) {
        defer.resolve(false);
      } else {
        return NstSvcPlaceFactory.get(id).then(function(place) {
          if (place && place.id) {
            vm.currentPlace = place;
            defer.resolve(true);
          } else {
            vm.currentPlace = null;
            defer.resolve(false);
          }
        }).catch(defer.reject);
      }

      return defer.promise;
    }


  }

})();
