(function() {
  'use strict';

  angular
    .module('nested')
    .constant('UPLOAD_TYPE', {
      FILE: 'upload/file',
      PLACE_PICTURE: 'upload/place_pic',
      PROFILE_PICTURE: 'upload/profile_pic'
    }).factory('StoreService', NestedStore);

  /** @ngInject */
  function NestedStore($window, $rootScope, $q, $http, $sce, WsService, WS_RESPONSE_STATUS, WS_ERROR, UPLOAD_TYPE, NestedStore, Upload) {
    function StoreService(stores) {
      this.stores = {};
      this.defaultStore = new NestedStore();

      if (angular.isArray(stores) || angular.isObject(stores)) {
        for (var k in stores) {
          this.stores[stores[k].id] = new NestedStore(stores[k]);
        }
      }
    }

    StoreService.prototype = {
      toUrl: function (uid, token) {
        var sid = uid.substr(0, 7);

        return this.getStore(sid).then(function (store) {
          return store.getDownloadUrl(uid, token).then(function (url) {
            this.change();

            return $q(function (res) {
              res(url);
            });
          }.bind(this));
        }.bind(this));
      },

      getStore: function (sid) {
        if (!this.stores.hasOwnProperty(sid)) {
          this.stores[sid] = (new NestedStore()).setData(sid).then(function (store) {
            this.stores[store.id] = store;
            this.change();

            return $q(function (res) {
              res(store);
            })
          }.bind(this));
        }

        if (this.stores[sid] instanceof Promise) {
          return this.stores[sid];
        }

        return $q(function (res) {
          res.call(this, this.stores[sid]);
        }.bind(this));
      },

      update: function () {
        return WsService.request('store/get_store').then(function (data) {
          var storeIds = angular.isArray(data.store_id) ? data.store_id : [data.store_id];
          var response = {
            resolve: function () {},
            reject: function () {}
          };
          var counter = 0;
          for (var k in storeIds) {
            var sid = storeIds[k];
            counter++;

            this.getStore(sid).then(function (store) {
              this.defaultStore.id || this.defaultStore.setData(store);

              if (0 === --counter) {
                response.resolve(this.stores);
              }
            }.bind(this));
          }

          return $q(function (res, rej) {
            response.resolve = res || response.resolve;
            response.reject = rej || response.reject;
          });
        }.bind(this));
      },

      change: function () {
        if(!$rootScope.$$phase) {
          $rootScope.$digest()
        }
      },

      upload: function (file, type, id, onUploadStart) {
        type = type || UPLOAD_TYPE.FILE;

        var q = {
          'file': file instanceof File,
          'type': (Object.keys(UPLOAD_TYPE).map(function(k) { return UPLOAD_TYPE[k]; })).indexOf(type) > -1
        };
        var items = [];
        for (var k in q) {
          q[k] || items.push(k);
        }

        if (items.length > 0) {
          return $q(function (res, rej) {
            rej({
              err_code: WS_ERROR.INVALID,
              items: items
            });
          });
        }

        return this.defaultStore.getUploadToken().then(function (token) {
          var formData = new FormData();
          formData.append('cmd', type);
          formData.append('_sk', WsService.getSessionKey());
          formData.append('token', token);
          formData.append('fn', 'attachment');
          formData.append('attachment', file);
          formData.append('_reqid', id || null);

          var canceler = $q.defer();

          onUploadStart(canceler);

          return $http({
            method: 'POST',
            url: this.defaultStore.url,
            data: formData,
            headers: {
              'Content-Type': undefined
            },
            timeout: canceler.promise,
          }).then(function (response) {
            var data = response.data.data;

            return $q(function (res, rej) {
              switch (data.status) {
                case WS_RESPONSE_STATUS.SUCCESS:
                  res(data);
                  break;
                default:
                  rej(data);
                  break;

              }
            });
          });



        }.bind(this));
      },

      upload2 : function (file, type) {
        type = type || UPLOAD_TYPE.FILE;

        var q = {
          'file': file instanceof File,
          'type': (Object.keys(UPLOAD_TYPE).map(function(k) { return UPLOAD_TYPE[k]; })).indexOf(type) > -1
        };
        var items = [];
        for (var k in q) {
          q[k] || items.push(k);
        }

        if (items.length > 0) {
          return $q(function (res, rej) {
            rej({
              err_code: WS_ERROR.INVALID,
              items: items
            });
          });
        }

        return this.defaultStore.getUploadToken().then(function (token) {

          var that = this;

          var formData = new FormData();

          formData.append('cmd', type);
          formData.append('_sk', WsService.getSessionKey());
          formData.append('token', token);
          formData.append('fn', 'attachment');
          formData.append('attachment', file);

          function Control() {
          }

          $.ajax({
            url: that.defaultStore.url,  //Server script to process data
            type: 'POST',
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // Check if upload property exists
                    myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax events
            beforeSend: function () {

            },
            success: function () {
              console.log('ajax upload completed.');
            },
            error: function () {
              console.log('error occured');
            },
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            crossDomain: true,
            contentType: undefined,
            processData: false,
            xhrFields: {
              withCredentials: true
            },
            headers: {
              Accept : 'application/json, text/plain, */*',
            },
        });
        function progressHandlingFunction(e){
          if(e.lengthComputable){
            console.log(e.loaded);
          }
        }

          // Control.prototype = {
          //   start: function () {
          //     return $q(function(resolve, reject) {
          //       this.xhr.upload.onload = function(e) {
          //         switch (e.data.status) {
          //           case WS_RESPONSE_STATUS.SUCCESS:
          //           console.log(e);
          //           //TODO : make sure the return type is correct
          //             resolve(e.data.data);
          //             break;
          //           default:
          //           //TODO : make sure the return type is correct
          //             reject(e.data.data);
          //             break;
          //         }
          //       };
          //
          //       this.xhr.send(formData);
          //     }.bind(this));
          //   },
          //   addListerner: function(listerner) {
          //     xhr.upload.onprogress = function(e) {
          //       // check wether someone is listening
          //       if (angular.isFunction(listerner) && e.lengthComputable) {
          //         var progressPercentage = Math.round(e.loaded / e.total * 100);
          //         listerner(progressPercentage);
          //       }
          //     };
          //
          //     return this;
          //   }
          // };

          return new Control();
        }.bind(this));

      },

      upload3 : function (file, type) {
        type = type || UPLOAD_TYPE.FILE;

        var q = {
          'file': file instanceof File,
          'type': (Object.keys(UPLOAD_TYPE).map(function(k) { return UPLOAD_TYPE[k]; })).indexOf(type) > -1
        };
        var items = [];
        for (var k in q) {
          q[k] || items.push(k);
        }

        if (items.length > 0) {
          return $q(function (res, rej) {
            rej({
              err_code: WS_ERROR.INVALID,
              items: items
            });
          });
        }

        return this.defaultStore.getUploadToken().then(function (token) {

          var that = this;

          var formData = new FormData();

          formData.append('cmd', type);
          formData.append('_sk', WsService.getSessionKey());
          formData.append('token', token);
          formData.append('fn', 'attachment');
          formData.append('attachment', file);

          function Control() {

          }

          Upload.upload({
            url: that.defaultStore.url,
            data: {
              attachment: file,
              cmd: type,
              _sk: WsService.getSessionKey(),
              token: token,
              fn: 'attachment',
            }
        }).then(function (resp) {
          console.log('yoohoo');
            // console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
          console.log('sucks');
            // console.log('Error status: ' + resp.status);
        }, function (evt) {
          console.log('in progress');
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });

        //   $.ajax({
        //     url: that.defaultStore.url,  //Server script to process data
        //     type: 'POST',
        //     xhr: function() {  // Custom XMLHttpRequest
        //         var myXhr = $.ajaxSettings.xhr();
        //         if(myXhr.upload){ // Check if upload property exists
        //             myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
        //         }
        //         return myXhr;
        //     },
        //     //Ajax events
        //     beforeSend: function () {
        //
        //     },
        //     success: function () {
        //       console.log('ajax upload completed.');
        //     },
        //     error: function () {
        //       console.log('error occured');
        //     },
        //     // Form data
        //     data: formData,
        //     //Options to tell jQuery not to process data or worry about content-type.
        //     cache: false,
        //     crossDomain: true,
        //     contentType: undefined,
        //     processData: false,
        //     xhrFields: {
        //       withCredentials: true
        //     },
        //     headers: {
        //       Accept : 'application/json, text/plain, */*',
        //     },
        // });
        // function progressHandlingFunction(e){
        //   if(e.lengthComputable){
        //     console.log(e.loaded);
        //   }
        // }

          return new Control();
        }.bind(this));

      },

    };

    var stores = $window.sessionStorage.getItem('stores');
    var service = new StoreService(stores ? angular.fromJson(stores) : undefined);
    service.update().then(function (data) {
      $window.sessionStorage.setItem('stores', angular.toJson(service.stores));
    });

    return service;
  }

})();
