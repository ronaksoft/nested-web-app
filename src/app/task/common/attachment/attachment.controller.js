/**
 * @file label.controller.js
 * @desc Controller for task label
 * @kind {Controller}
 * Documented by:          hamidrezakk < hamidrezakks@gmail.com >
 * Date of documentation:  2017-10-16
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskAttachmentController', TaskAttachmentController);

  function TaskAttachmentController($scope, _, $uibModal, $q, NstSvcAuth, NST_ATTACHMENT_STATUS, NstSvcAttachmentMap, $timeout,
                                    toastr, NstSvcTranslation, NstUtility, NstSvcLogger, NstSvcAttachmentFactory, NstSvcSystemConstants,
                                    NST_CONFIG, $log, NST_FILE_TYPE, NstPicture, NstSvcFileType, NstSvcStore, NST_STORE_UPLOAD_TYPE) {
    var vm = this;

    vm.openPopover = false;

    var systemConstants = {};

    (function () {
      NstSvcSystemConstants.get().then(function (result) {
        systemConstants = result;
      }).catch(function () {
        vm.targetLimit = 10;
      });
    })();

    vm.addUploadedAttachs = addUploadedAttachs;
    vm.attachmentsIsUploading = [];
    vm.attachments = {
      elementId: 'attach',
      viewModels: [],
      requests: {},
      size: {
        uploaded: 0,
        total: 0
      }
    };

    vm.placeFiles = placeFiles;

    $scope.$watch(function () {
      return vm.attachments.viewModels
    }, updateTotalAttachmentsRatio, true);

    function updateTotalAttachmentsRatio(items) {
      if (!vm.minimize) {
        return;
      }
      var totalSize = 0;
      var uploadedSize = 0;
      var totalItems = items.length;
      var uploadedItems = 0;
      _.forEach(items, function (item) {
        totalSize += item.size;
        uploadedSize += item.uploadedSize;
        if (item.size === item.uploadedSize) {
          uploadedItems++;
        }
      });
      vm.minimizeData.progress = parseFloat(uploadedSize / totalSize);
      vm.minimizeData.totalItems = totalItems;
      vm.minimizeData.uploadedItems = uploadedItems;
      if (totalItems > 0) {
        if (items.length === uploadedItems) {
          $timeout(function () {
            vm.send();
          }, 100);
        }
      }
    }

    /**
     * Opens the placeFiles modal
     * Pass the `addToCompose` function to the new modal
     */
    function placeFiles() {
      $uibModal.open({
        animation: false,
        // backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/pages/compose/partials/place-files-modal.html',
        controller: 'placeFilesModalController',
        controllerAs: 'ctrl',
        resolve: {
          uploadfiles: function () {
            return vm.addUploadedAttachs
          }
        }
      });
    }

    var onFileSelect = _.curry(function (group, event) {
      NstSvcLogger.debug4('Compose | some files added into compose');
      var files = event.currentTarget.files;
      var type = NST_STORE_UPLOAD_TYPE.File;
      if (group === 'media') {
        type = getStoreType(files[0]);
      }

      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i], type).then(function () {
        });
      }
      event.currentTarget.value = "";
    });
    vm.attachments.fileSelected = onFileSelect('file');
    vm.attachments.mediaSelected = onFileSelect('media');

    /**
     * Adds uploaded attachments ( exists before composing ) into compose attachments
     * also prevents to add already added items
     * @param {any} attachments
     */
    function addUploadedAttachs(attachments) {
      vm.attachmentsData = vm.attachmentsData.concat(_.map(attachments, function (item) {
        item.status = NST_ATTACHMENT_STATUS.ATTACHED;
        return item;
      }));
      var lengthOld = vm.attachments.viewModels.length;
      vm.attachments.viewModels = vm.attachments.viewModels.concat(
        _.map(attachments, function (item) {
          return NstSvcAttachmentMap.toEditableAttachmentItem(item);
        }));
      vm.attachments.viewModels = _.uniqBy(vm.attachments.viewModels, function (o) {
        return o.id;
      });
      var lengthNew = vm.attachments.viewModels.length;
      var duplicates = lengthNew - lengthOld - attachments.length;
      if (duplicates < 0) {
        toastr.warning(NstUtility.string.format(NstSvcTranslation.get('{0} item/s has been added before!'), duplicates * -1));
      }
      vm.attachments.size.total += _.sum(_.map(attachments, 'size'));
      vm.attachments.size.uploaded += _.sum(_.map(attachments, 'size'));
    }

    function getStoreType(file) {
      var group = NstSvcFileType.getType(file.type);
      if (NstSvcFileType.getSuffix(file.name) === 'gif') {
        return NST_STORE_UPLOAD_TYPE.GIF;
      }
      if (group === NST_FILE_TYPE.IMAGE) {
        return NST_STORE_UPLOAD_TYPE.IMAGE;
      } else if (group === NST_FILE_TYPE.VIDEO) {
        return NST_STORE_UPLOAD_TYPE.VIDEO;
      } else if (group === NST_FILE_TYPE.AUDIO) {
        return NST_STORE_UPLOAD_TYPE.AUDIO;
      } else {
        return NST_STORE_UPLOAD_TYPE.FILE;
      }
    }

    /**
     * Adds a file as attachments of a post and creates a
     * thumbnail for view rendering if the type is image.
     * also considers the limits such as number and size
     * @param {any} file
     * @param {any} group
     * @returns
     */
    vm.attachments.attach = function (file, group) {
      NstSvcLogger.debug4('Compose | Check if the attached files are more than the limit size');
      NstSvcLogger.debug4('Compose | Max allowed attachements is: ', systemConstants.post_max_attachments);
      var filesCount = _.size(vm.attachmentsData);
      NstSvcLogger.debug4('Compose | The number of currently attached files is: ', filesCount);
      if (systemConstants && systemConstants.post_max_attachments <= filesCount) {
        toastr.error(NstUtility.string.format(NstSvcTranslation.get("You are not allowed to attach more than {0} files. Please contact Nested administrator."), systemConstants.post_max_attachments));
        return;
      }
      NstSvcLogger.debug4('Compose | Is this file higher than maximum upload size ?!');
      if (file.size > NST_CONFIG.UPLOAD_SIZE_LIMIT) {
        toastr.error(NstSvcTranslation.get("Maximum upload size is 100 MB"));
        return;
      }
      var deferred = $q.defer();

      $log.debug('Compose | File Attach: ', file);

      // Create Attachment Model
      var attachment = NstSvcAttachmentFactory.createAttachmentModel();
      attachment.size = file.size;
      attachment.filename = file.name;
      attachment.mimetype = file.type;
      // Add Attachment to Model
      vm.attachments.size.total += file.size;
      vm.attachmentsData.push(attachment);
      var type = NstSvcFileType.getType(attachment.mimetype);

      // Read Attachment
      var reader = new FileReader();
      var qRead = $q.defer();

      reader.onload = function (event) {
        var uri = event.target.result;

        // Load and Show Thumbnail
        if (NST_FILE_TYPE.IMAGE === type || NST_FILE_TYPE.GIF === type) {
          attachment.picture = new NstPicture({
            original: uri,
            preview: uri,
            x32: uri,
            x64: uri,
            x128: uri
          });
        }

        qRead.resolve(uri);
      };

      reader.readAsDataURL(file);

      qRead.promise.then(function () {
        var deferred = $q.defer();

        // Upload Attachment
        var vmAttachment = NstSvcAttachmentMap.toEditableAttachmentItem(attachment);
        attachment.id = vmAttachment.id;
        vm.attachmentsIsUploading.push(attachment.id);
        NstSvcLogger.debug4('Compose | start uploading file', file);

        var request = NstSvcStore.uploadWithProgress(file, function (event) {
          if (event.lengthComputable) {
            vmAttachment.uploadedSize = event.loaded;
            $timeout(function () {
              vmAttachment.uploadedRatio = Number(event.loaded / event.total).toFixed(2);
            })
          }
        }, group, NstSvcAuth.lastSessionKey);

        vm.attachments.requests[attachment.id] = request;

        request.sent().then(function () {
          attachment.status = NST_ATTACHMENT_STATUS.UPLOADING;
          vm.attachments.viewModels.push(vmAttachment);
          NstSvcLogger.debug4('Compose | request uploading file is sent');
        });

        request.finished().then(function () {
          // vm.attachments.size.total -= attachment.getSize();
          delete vm.attachments.requests[attachment.id];
          NstSvcLogger.debug4('Compose | uploading file is done');
        });

        request.getPromise().then(function (response) {
          var deferred = $q.defer();
          attachment.id = response.data.universal_id;
          attachment.status = NST_ATTACHMENT_STATUS.ATTACHED;
          vmAttachment.id = attachment.id;
          vmAttachment.isUploaded = true;
          vmAttachment.uploadedSize = attachment.size;
          vmAttachment.uploadedRatio = 1;
          vm.attachmentsIsUploading.splice(vm.attachmentsIsUploading.indexOf(attachment.id), 1);
          deferred.resolve(attachment);
          return deferred.promise;
        }).catch(function (error) {
          if (_.findIndex(vm.attachments.viewModels, {id: attachment.id}) > -1) {
            toastr.error(NstSvcTranslation.get('An error has occurred in uploading the file!'));
          }
          deferred.reject(error);
        });

        return deferred.promise;
      }).then(deferred.resolve);

      return deferred.promise;
    };

    /**
     * Detach the attachment of post or stop uploading it
     * @param {object} vmAttachment
     */
    vm.attachments.detach = function (vmAttachment) {
      var id = vmAttachment.id;
      var attachment = _.find(vm.attachmentsData, {
        id: id
      });

      if (attachment && attachment.length !== 0) {
        switch (attachment.status) {
          case NST_ATTACHMENT_STATUS.UPLOADING:
            var request = vm.attachments.requests[attachment.id];
            if (request) {
              NstSvcStore.cancelUpload(request);
            }
            break;
          default:
            NstSvcAttachmentFactory.remove(attachment.id);
            break;
        }
        vm.attachments.size.uploaded -= vmAttachment.uploadedSize;
        vm.attachments.size.total -= attachment.size;
        NstUtility.collection.dropById(vm.attachmentsData, id);
        NstUtility.collection.dropById(vm.attachments.viewModels, id);
      }
    };

    /**
     * Triggers on drop event
     * this function add file/files into attachments model
     * @param {any} event
     */
    vm.dodrop = function (event) {
      NstSvcLogger.debug4('Compose | dropped some files :');
      event.preventDefault();
      event.stopPropagation();
      var dt = event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i < files.length; i++) {
        vm.attachments.attach(files[i]).then(function () {
        });
      }
    };

    vm.removeItems = function () {
      var cloneAttachments = Object.assign({}, vm.attachmentsData);
      _.forEach(cloneAttachments, function (attachment) {
        vm.attachments.detach(attachment);
      });
    };

    $scope.$watch(function () {
      return vm.attachmentsData;
    }, function (newVal) {
      if (newVal.hasOwnProperty('init') && newVal.init === true) {
        initData(newVal.data);
      }
    });

    function initData(attachments) {
      vm.attachmentsData = attachments;
      vm.attachments.viewModels = attachments;
      _.forEach(attachments, function (attachment) {
        attachment.status = NST_ATTACHMENT_STATUS.ATTACHED;
      });
      vm.attachments.viewModels = _.map(attachments, function (attachment) {
        return NstSvcAttachmentMap.toEditableAttachmentItem(attachment);
      });
      vm.attachments.size.total += _.sum(_.map(attachments, 'size'));
      vm.attachments.size.uploaded += _.sum(_.map(attachments, 'size'));
    }
  }
})();
