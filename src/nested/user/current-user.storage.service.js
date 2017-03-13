(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .service('NstSvcCurrentUserStorage', NstSvcCurrentUserStorage);

  /** @ngInject */
  function NstSvcCurrentUserStorage(NST_STORAGE_TYPE, NstStorage, NstPicture, NstTinyUser) {
    function CurrentUserStorage(memory) {
      NstStorage.call(this, memory, 'current-user');
    }

    CurrentUserStorage.prototype = new NstStorage();
    CurrentUserStorage.prototype.constructor = CurrentUserStorage;

    CurrentUserStorage.prototype.serialize = function (user) {
      if (!(_.isObject(user) && user.id)) {
        return "";
      }

      var userObject = {
        id : user.id,
        firstName : user.firstName,
        lastName : user.lastName
      };

      if (user.hasPicture()) {
        userObject.picture = {
          original: user.picture.original,
          preview: user.picture.preview,
          x128: user.picture.x128,
          x64: user.picture.x64,
          x32: user.picture.x32
        };
      }

      return JSON.stringify(userObject);
    }

    CurrentUserStorage.prototype.deserialize = function (content) {
      if (!(_.isString(content) && content.length > 0)) {
        return new NstTinyUser();
      }
      var userObject = JSON.parse(content);
      var tinyUser = new NstTinyUser();

      tinyUser.id = userObject.id;
      tinyUser.firstName = userObject.firstName;
      tinyUser.lastName = userObject.lastName;
      tinyUser.fullName = tinyUser.getFullName();

      if (userObject.picture && userObject.preview) {
        tinyUser.picture = new NstPicture({
          original: userObject.picture.original,
          preview: userObject.picture.preview,
          x128: userObject.picture.x128,
          x64: userObject.picture.x64,
          x32: userObject.picture.x32
        });
      }

      return tinyUser;
    }

    return new CurrentUserStorage(NST_STORAGE_TYPE.SESSION);
  }
})();
